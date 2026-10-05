// Gemaakt door gereedschap/pixelart/bouwfasen.cjs — niet met de hand bijwerken.
// Dezelfde inhoud als bouwfasen.json, als script, zodat file:// het ook kan lezen (zie js/sprites.js).
(function (T) {
  T.BOUWFASEN = {
   "_lees_dit": "Vijf bouwfases per gebouw uit tegels/gebouwen.tsx en tegels/huizen.tsx, gemaakt door gereedschap/pixelart/bouwfasen.cjs — niet met de hand bijwerken. Sleutel is de tekeningnaam (T.GEBOUWEN.<soort>.tekening, na \"gebouwen/\" of \"huizen/\"). Elk gebouw heeft een eigen vel (bestand, vanaf tegels/), dat het spel pas laadt als er een in aanbouw staat. Per fase (0..4, oplopend in afbouw): x/y/b/h snijdt de cel uit dat vel, anker is het punt in die cel dat op T.naarScherm(x, y) van de aangeklikte tegel komt — dezelfde achterste-voethoek-afspraak als tegels.json (\"anker\" bij de tsx-vellen), en beslaat is dezelfde tegelmaat als in gebouwen.tsx of huizen.tsx voor dezelfde tekening. Fase 5 (klaar) staat niet hier: dat is gewoon de bestaande tegel in tegels/gebouwen/ of tegels/huizen/.",
   "fasen": {
    "dorpKlein2": {
     "gebouw": "hut",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/dorpKlein2.png",
     "fasen": [
      {
       "x": 0,
       "y": 696,
       "b": 523,
       "h": 208,
       "anker": [
        359,
        30
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 394,
       "b": 394,
       "h": 300,
       "anker": [
        229,
        122
       ],
       "naam": "geraamte"
      },
      {
       "x": 396,
       "y": 394,
       "b": 408,
       "h": 268,
       "anker": [
        236,
        86
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 408,
       "h": 392,
       "anker": [
        236,
        210
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 410,
       "y": 0,
       "b": 406,
       "h": 392,
       "anker": [
        236,
        210
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
     "bestand": "bouwfasen/dorpshuis1.png",
     "fasen": [
      {
       "x": 0,
       "y": 783,
       "b": 523,
       "h": 208,
       "anker": [
        295,
        30
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 450,
       "b": 394,
       "h": 331,
       "anker": [
        165,
        153
       ],
       "naam": "geraamte"
      },
      {
       "x": 396,
       "y": 450,
       "b": 408,
       "h": 288,
       "anker": [
        172,
        106
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 432,
       "y": 0,
       "b": 421,
       "h": 448,
       "anker": [
        183,
        266
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 430,
       "h": 448,
       "anker": [
        183,
        266
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
     "bestand": "bouwfasen/schuur.png",
     "fasen": [
      {
       "x": 0,
       "y": 1167,
       "b": 619,
       "h": 256,
       "anker": [
        423,
        30
       ],
       "naam": "fundering"
      },
      {
       "x": 524,
       "y": 434,
       "b": 490,
       "h": 299,
       "anker": [
        293,
        73
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 868,
       "b": 504,
       "h": 297,
       "anker": [
        300,
        67
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 434,
       "b": 522,
       "h": 432,
       "anker": [
        304,
        202
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 532,
       "h": 432,
       "anker": [
        314,
        202
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
     "bestand": "bouwfasen/houtschuur.png",
     "fasen": [
      {
       "x": 0,
       "y": 646,
       "b": 363,
       "h": 128,
       "anker": [
        263,
        30
       ],
       "naam": "fundering"
      },
      {
       "x": 265,
       "y": 248,
       "b": 234,
       "h": 161,
       "anker": [
        133,
        63
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 496,
       "b": 248,
       "h": 148,
       "anker": [
        140,
        46
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 248,
       "b": 263,
       "h": 246,
       "anker": [
        143,
        144
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 272,
       "h": 246,
       "anker": [
        152,
        144
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
     "bestand": "bouwfasen/schuurBlokhut.png",
     "fasen": [
      {
       "x": 0,
       "y": 623,
       "b": 523,
       "h": 208,
       "anker": [
        359,
        30
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 370,
       "b": 394,
       "h": 251,
       "anker": [
        229,
        73
       ],
       "naam": "geraamte"
      },
      {
       "x": 396,
       "y": 370,
       "b": 408,
       "h": 249,
       "anker": [
        236,
        67
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 438,
       "y": 0,
       "b": 426,
       "h": 368,
       "anker": [
        240,
        186
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 436,
       "h": 368,
       "anker": [
        250,
        186
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
     "bestand": "bouwfasen/kippenhok.png",
     "fasen": [
      {
       "x": 154,
       "y": 174,
       "b": 267,
       "h": 80,
       "anker": [
        199,
        30
       ],
       "naam": "fundering"
      },
      {
       "x": 323,
       "y": 0,
       "b": 138,
       "h": 103,
       "anker": [
        69,
        53
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 174,
       "b": 152,
       "h": 94,
       "anker": [
        76,
        40
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 164,
       "y": 0,
       "b": 157,
       "h": 172,
       "anker": [
        76,
        118
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 162,
       "h": 172,
       "anker": [
        81,
        118
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
     "bestand": "bouwfasen/vakwerkhuis.png",
     "fasen": [
      {
       "x": 0,
       "y": 767,
       "b": 523,
       "h": 208,
       "anker": [
        295,
        30
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 442,
       "b": 394,
       "h": 323,
       "anker": [
        165,
        145
       ],
       "naam": "geraamte"
      },
      {
       "x": 396,
       "y": 442,
       "b": 408,
       "h": 283,
       "anker": [
        172,
        101
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 432,
       "y": 0,
       "b": 421,
       "h": 440,
       "anker": [
        183,
        258
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 430,
       "h": 440,
       "anker": [
        183,
        258
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
     "bestand": "bouwfasen/stenenHuis.png",
     "fasen": [
      {
       "x": 0,
       "y": 818,
       "b": 587,
       "h": 240,
       "anker": [
        391,
        30
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 463,
       "b": 458,
       "h": 353,
       "anker": [
        261,
        143
       ],
       "naam": "geraamte"
      },
      {
       "x": 460,
       "y": 463,
       "b": 472,
       "h": 314,
       "anker": [
        268,
        100
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 472,
       "h": 461,
       "anker": [
        268,
        247
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 474,
       "y": 0,
       "b": 470,
       "h": 461,
       "anker": [
        268,
        247
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
     "bestand": "bouwfasen/herberg.png",
     "fasen": [
      {
       "x": 538,
       "y": 607,
       "b": 651,
       "h": 272,
       "anker": [
        359,
        30
       ],
       "naam": "fundering"
      },
      {
       "x": 1091,
       "y": 0,
       "b": 522,
       "h": 477,
       "anker": [
        229,
        235
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 607,
       "b": 536,
       "h": 407,
       "anker": [
        236,
        161
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 548,
       "y": 0,
       "b": 541,
       "h": 605,
       "anker": [
        241,
        359
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 546,
       "h": 605,
       "anker": [
        241,
        359
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
     "bestand": "bouwfasen/smidse.png",
     "fasen": [
      {
       "x": 0,
       "y": 718,
       "b": 523,
       "h": 208,
       "anker": [
        295,
        30
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 405,
       "b": 394,
       "h": 311,
       "anker": [
        165,
        133
       ],
       "naam": "geraamte"
      },
      {
       "x": 396,
       "y": 405,
       "b": 408,
       "h": 275,
       "anker": [
        172,
        93
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 408,
       "h": 403,
       "anker": [
        172,
        221
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 410,
       "y": 0,
       "b": 406,
       "h": 403,
       "anker": [
        172,
        221
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
     "bestand": "bouwfasen/dorpshuis3.png",
     "fasen": [
      {
       "x": 0,
       "y": 831,
       "b": 587,
       "h": 240,
       "anker": [
        391,
        30
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 482,
       "b": 458,
       "h": 347,
       "anker": [
        261,
        137
       ],
       "naam": "geraamte"
      },
      {
       "x": 460,
       "y": 482,
       "b": 472,
       "h": 310,
       "anker": [
        268,
        96
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 496,
       "y": 0,
       "b": 484,
       "h": 480,
       "anker": [
        269,
        266
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 494,
       "h": 480,
       "anker": [
        279,
        266
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
     "bestand": "bouwfasen/dorpshuis5.png",
     "fasen": [
      {
       "x": 0,
       "y": 797,
       "b": 523,
       "h": 208,
       "anker": [
        359,
        30
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 457,
       "b": 394,
       "h": 338,
       "anker": [
        229,
        160
       ],
       "naam": "geraamte"
      },
      {
       "x": 396,
       "y": 457,
       "b": 408,
       "h": 293,
       "anker": [
        236,
        111
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 432,
       "y": 0,
       "b": 421,
       "h": 455,
       "anker": [
        238,
        273
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 430,
       "h": 455,
       "anker": [
        247,
        273
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
     "bestand": "bouwfasen/dorpKlein1.png",
     "fasen": [
      {
       "x": 0,
       "y": 759,
       "b": 523,
       "h": 208,
       "anker": [
        359,
        30
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 438,
       "b": 394,
       "h": 319,
       "anker": [
        229,
        141
       ],
       "naam": "geraamte"
      },
      {
       "x": 396,
       "y": 438,
       "b": 408,
       "h": 280,
       "anker": [
        236,
        98
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 432,
       "y": 0,
       "b": 421,
       "h": 436,
       "anker": [
        238,
        254
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 430,
       "h": 436,
       "anker": [
        247,
        254
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
     "bestand": "bouwfasen/dorpKlein3.png",
     "fasen": [
      {
       "x": 0,
       "y": 785,
       "b": 523,
       "h": 208,
       "anker": [
        359,
        30
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 451,
       "b": 394,
       "h": 332,
       "anker": [
        229,
        154
       ],
       "naam": "geraamte"
      },
      {
       "x": 396,
       "y": 451,
       "b": 408,
       "h": 289,
       "anker": [
        236,
        107
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 432,
       "y": 0,
       "b": 421,
       "h": 449,
       "anker": [
        238,
        267
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 430,
       "h": 449,
       "anker": [
        247,
        267
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
     "bestand": "bouwfasen/dorpGewoon3.png",
     "fasen": [
      {
       "x": 0,
       "y": 814,
       "b": 587,
       "h": 240,
       "anker": [
        391,
        30
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 461,
       "b": 458,
       "h": 351,
       "anker": [
        261,
        141
       ],
       "naam": "geraamte"
      },
      {
       "x": 460,
       "y": 461,
       "b": 472,
       "h": 312,
       "anker": [
        268,
        98
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 472,
       "h": 459,
       "anker": [
        268,
        245
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 474,
       "y": 0,
       "b": 470,
       "h": 459,
       "anker": [
        268,
        245
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
     "bestand": "bouwfasen/dorpGewoon4.png",
     "fasen": [
      {
       "x": 0,
       "y": 845,
       "b": 587,
       "h": 240,
       "anker": [
        391,
        30
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 489,
       "b": 458,
       "h": 354,
       "anker": [
        261,
        144
       ],
       "naam": "geraamte"
      },
      {
       "x": 460,
       "y": 489,
       "b": 472,
       "h": 314,
       "anker": [
        268,
        100
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 496,
       "y": 0,
       "b": 484,
       "h": 487,
       "anker": [
        269,
        273
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 494,
       "h": 487,
       "anker": [
        279,
        273
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
     "bestand": "bouwfasen/dorpGroot1.png",
     "fasen": [
      {
       "x": 538,
       "y": 553,
       "b": 651,
       "h": 272,
       "anker": [
        423,
        30
       ],
       "naam": "fundering"
      },
      {
       "x": 1110,
       "y": 0,
       "b": 522,
       "h": 402,
       "anker": [
        293,
        160
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 553,
       "b": 536,
       "h": 357,
       "anker": [
        300,
        111
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 560,
       "y": 0,
       "b": 548,
       "h": 551,
       "anker": [
        301,
        305
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 558,
       "h": 551,
       "anker": [
        311,
        305
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
     "bestand": "bouwfasen/dorpGroot2.png",
     "fasen": [
      {
       "x": 538,
       "y": 501,
       "b": 651,
       "h": 272,
       "anker": [
        423,
        30
       ],
       "naam": "fundering"
      },
      {
       "x": 1074,
       "y": 0,
       "b": 522,
       "h": 375,
       "anker": [
        293,
        133
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 501,
       "b": 536,
       "h": 339,
       "anker": [
        300,
        93
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 536,
       "h": 499,
       "anker": [
        300,
        253
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 538,
       "y": 0,
       "b": 534,
       "h": 499,
       "anker": [
        300,
        253
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "hut1": {
     "gebouw": "hut",
     "beslaat": [
      5,
      4
     ],
     "bestand": "bouwfasen/hut1.png",
     "fasen": [
      {
       "x": 616,
       "y": 406,
       "b": 335,
       "h": 158,
       "anker": [
        175,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 324,
       "y": 406,
       "b": 290,
       "h": 293,
       "anker": [
        129,
        162
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 406,
       "b": 322,
       "h": 295,
       "anker": [
        145,
        162
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 369,
       "y": 0,
       "b": 338,
       "h": 404,
       "anker": [
        153,
        271
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 367,
       "h": 404,
       "anker": [
        167,
        271
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "hut2": {
     "gebouw": "hut",
     "beslaat": [
      4,
      5
     ],
     "bestand": "bouwfasen/hut2.png",
     "fasen": [
      {
       "x": 616,
       "y": 396,
       "b": 335,
       "h": 161,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 324,
       "y": 396,
       "b": 290,
       "h": 293,
       "anker": [
        161,
        162
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 396,
       "b": 322,
       "h": 295,
       "anker": [
        177,
        162
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 368,
       "y": 0,
       "b": 338,
       "h": 394,
       "anker": [
        185,
        261
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 366,
       "h": 394,
       "anker": [
        199,
        261
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "hut3": {
     "gebouw": "hut",
     "beslaat": [
      6,
      4
     ],
     "bestand": "bouwfasen/hut3.png",
     "fasen": [
      {
       "x": 0,
       "y": 733,
       "b": 368,
       "h": 174,
       "anker": [
        175,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 356,
       "y": 420,
       "b": 322,
       "h": 309,
       "anker": [
        129,
        162
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 420,
       "b": 354,
       "h": 311,
       "anker": [
        145,
        162
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 400,
       "y": 0,
       "b": 354,
       "h": 418,
       "anker": [
        145,
        269
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 398,
       "h": 418,
       "anker": [
        167,
        269
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "hut4": {
     "gebouw": "hut",
     "beslaat": [
      6,
      6
     ],
     "bestand": "bouwfasen/hut4.png",
     "fasen": [
      {
       "x": 0,
       "y": 787,
       "b": 367,
       "h": 205,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 442,
       "b": 322,
       "h": 340,
       "anker": [
        193,
        162
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 442,
       "b": 418,
       "h": 343,
       "anker": [
        209,
        162
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 418,
       "h": 440,
       "anker": [
        209,
        259
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 420,
       "y": 0,
       "b": 408,
       "h": 440,
       "anker": [
        241,
        259
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "huis1": {
     "gebouw": "huis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/huis1.png",
     "fasen": [
      {
       "x": 0,
       "y": 879,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 504,
       "b": 386,
       "h": 371,
       "anker": [
        161,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 504,
       "b": 418,
       "h": 373,
       "anker": [
        177,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 465,
       "y": 0,
       "b": 450,
       "h": 502,
       "anker": [
        193,
        321
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 463,
       "h": 502,
       "anker": [
        199,
        321
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "huis2": {
     "gebouw": "huis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/huis2.png",
     "fasen": [
      {
       "x": 0,
       "y": 990,
       "b": 431,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 559,
       "b": 386,
       "h": 427,
       "anker": [
        225,
        248
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 559,
       "b": 418,
       "h": 429,
       "anker": [
        241,
        248
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 469,
       "y": 0,
       "b": 450,
       "h": 557,
       "anker": [
        257,
        376
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 467,
       "h": 557,
       "anker": [
        266,
        376
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "huis3": {
     "gebouw": "huis",
     "beslaat": [
      10,
      7
     ],
     "bestand": "bouwfasen/huis3.png",
     "fasen": [
      {
       "x": 420,
       "y": 563,
       "b": 513,
       "h": 241,
       "anker": [
        257,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 563,
       "b": 418,
       "h": 413,
       "anker": [
        161,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 1121,
       "y": 0,
       "b": 578,
       "h": 453,
       "anker": [
        241,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 578,
       "h": 561,
       "anker": [
        241,
        300
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 580,
       "y": 0,
       "b": 539,
       "h": 561,
       "anker": [
        241,
        300
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "huis4": {
     "gebouw": "huis",
     "beslaat": [
      8,
      8
     ],
     "bestand": "bouwfasen/huis4.png",
     "fasen": [
      {
       "x": 0,
       "y": 1563,
       "b": 464,
       "h": 272,
       "anker": [
        303,
        29
       ],
       "naam": "fundering"
      },
      {
       "x": 548,
       "y": 1122,
       "b": 418,
       "h": 437,
       "anker": [
        257,
        194
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 1122,
       "b": 546,
       "h": 439,
       "anker": [
        273,
        194
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 546,
       "h": 559,
       "anker": [
        273,
        314
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 561,
       "b": 507,
       "h": 559,
       "anker": [
        305,
        314
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "huis5": {
     "gebouw": "huis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/huis5.png",
     "fasen": [
      {
       "x": 0,
       "y": 976,
       "b": 399,
       "h": 190,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 545,
       "b": 354,
       "h": 411,
       "anker": [
        161,
        248
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 545,
       "b": 418,
       "h": 429,
       "anker": [
        177,
        248
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 432,
       "y": 0,
       "b": 418,
       "h": 543,
       "anker": [
        177,
        362
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 430,
       "h": 543,
       "anker": [
        199,
        362
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "huis6": {
     "gebouw": "huis",
     "beslaat": [
      8,
      9
     ],
     "bestand": "bouwfasen/huis6.png",
     "fasen": [
      {
       "x": 455,
       "y": 560,
       "b": 499,
       "h": 252,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 560,
       "b": 453,
       "h": 417,
       "anker": [
        289,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 1137,
       "y": 0,
       "b": 578,
       "h": 453,
       "anker": [
        305,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 599,
       "h": 558,
       "anker": [
        326,
        297
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 601,
       "y": 0,
       "b": 534,
       "h": 558,
       "anker": [
        330,
        297
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "steen1": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/steen1.png",
     "fasen": [
      {
       "x": 0,
       "y": 879,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 504,
       "b": 386,
       "h": 371,
       "anker": [
        161,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 504,
       "b": 418,
       "h": 373,
       "anker": [
        177,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 465,
       "y": 0,
       "b": 450,
       "h": 502,
       "anker": [
        193,
        321
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 463,
       "h": 502,
       "anker": [
        199,
        321
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "steen2": {
     "gebouw": "stenenHuis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/steen2.png",
     "fasen": [
      {
       "x": 0,
       "y": 990,
       "b": 431,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 559,
       "b": 386,
       "h": 427,
       "anker": [
        225,
        248
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 559,
       "b": 418,
       "h": 429,
       "anker": [
        241,
        248
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 469,
       "y": 0,
       "b": 450,
       "h": 557,
       "anker": [
        257,
        376
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 467,
       "h": 557,
       "anker": [
        266,
        376
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "steen3": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      7
     ],
     "bestand": "bouwfasen/steen3.png",
     "fasen": [
      {
       "x": 0,
       "y": 1485,
       "b": 513,
       "h": 241,
       "anker": [
        257,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 516,
       "y": 1062,
       "b": 418,
       "h": 413,
       "anker": [
        161,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 1062,
       "b": 514,
       "h": 421,
       "anker": [
        241,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 531,
       "b": 514,
       "h": 529,
       "anker": [
        241,
        300
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 539,
       "h": 529,
       "anker": [
        241,
        300
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "steen4": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      8
     ],
     "bestand": "bouwfasen/steen4.png",
     "fasen": [
      {
       "x": 0,
       "y": 1563,
       "b": 464,
       "h": 272,
       "anker": [
        303,
        29
       ],
       "naam": "fundering"
      },
      {
       "x": 548,
       "y": 1122,
       "b": 418,
       "h": 437,
       "anker": [
        257,
        194
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 1122,
       "b": 546,
       "h": 439,
       "anker": [
        273,
        194
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 546,
       "h": 559,
       "anker": [
        273,
        314
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 561,
       "b": 507,
       "h": 559,
       "anker": [
        305,
        314
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "steen5": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/steen5.png",
     "fasen": [
      {
       "x": 0,
       "y": 976,
       "b": 399,
       "h": 190,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 545,
       "b": 354,
       "h": 411,
       "anker": [
        161,
        248
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 545,
       "b": 418,
       "h": 429,
       "anker": [
        177,
        248
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 432,
       "y": 0,
       "b": 418,
       "h": 543,
       "anker": [
        177,
        362
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 430,
       "h": 543,
       "anker": [
        199,
        362
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "steen6": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      9
     ],
     "bestand": "bouwfasen/steen6.png",
     "fasen": [
      {
       "x": 455,
       "y": 560,
       "b": 499,
       "h": 252,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 560,
       "b": 453,
       "h": 417,
       "anker": [
        289,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 1137,
       "y": 0,
       "b": 578,
       "h": 453,
       "anker": [
        305,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 599,
       "h": 558,
       "anker": [
        326,
        297
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 601,
       "y": 0,
       "b": 534,
       "h": 558,
       "anker": [
        330,
        297
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "boerderij1": {
     "gebouw": "boerderij",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/boerderij1.png",
     "fasen": [
      {
       "x": 518,
       "y": 529,
       "b": 560,
       "h": 238,
       "anker": [
        335,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 529,
       "b": 516,
       "h": 403,
       "anker": [
        291,
        160
       ],
       "naam": "geraamte"
      },
      {
       "x": 1180,
       "y": 0,
       "b": 546,
       "h": 405,
       "anker": [
        305,
        160
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 597,
       "y": 0,
       "b": 581,
       "h": 527,
       "anker": [
        319,
        282
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 595,
       "h": 527,
       "anker": [
        330,
        282
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "boerderij2": {
     "gebouw": "boerderij",
     "beslaat": [
      9,
      8
     ],
     "bestand": "bouwfasen/boerderij2.png",
     "fasen": [
      {
       "x": 452,
       "y": 527,
       "b": 496,
       "h": 257,
       "anker": [
        303,
        -2
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 527,
       "b": 450,
       "h": 422,
       "anker": [
        257,
        163
       ],
       "naam": "geraamte"
      },
      {
       "x": 1132,
       "y": 0,
       "b": 578,
       "h": 424,
       "anker": [
        273,
        163
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 599,
       "h": 525,
       "anker": [
        294,
        264
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 601,
       "y": 0,
       "b": 529,
       "h": 525,
       "anker": [
        295,
        264
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "boerderij3": {
     "gebouw": "boerderij",
     "beslaat": [
      6,
      9
     ],
     "bestand": "bouwfasen/boerderij3.png",
     "fasen": [
      {
       "x": 484,
       "y": 627,
       "b": 527,
       "h": 254,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 627,
       "b": 482,
       "h": 475,
       "anker": [
        289,
        248
       ],
       "naam": "geraamte"
      },
      {
       "x": 1120,
       "y": 0,
       "b": 514,
       "h": 477,
       "anker": [
        305,
        248
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 562,
       "y": 0,
       "b": 556,
       "h": 625,
       "anker": [
        326,
        396
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 560,
       "h": 625,
       "anker": [
        328,
        396
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "boerderij4": {
     "gebouw": "boerderij",
     "beslaat": [
      6,
      8
     ],
     "bestand": "bouwfasen/boerderij4.png",
     "fasen": [
      {
       "x": 0,
       "y": 953,
       "b": 495,
       "h": 238,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 546,
       "b": 450,
       "h": 403,
       "anker": [
        257,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 546,
       "b": 482,
       "h": 405,
       "anker": [
        273,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 536,
       "y": 0,
       "b": 482,
       "h": 544,
       "anker": [
        273,
        331
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 534,
       "h": 544,
       "anker": [
        299,
        331
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "boerderij5": {
     "gebouw": "boerderij",
     "beslaat": [
      6,
      9
     ],
     "bestand": "bouwfasen/boerderij5.png",
     "fasen": [
      {
       "x": 0,
       "y": 895,
       "b": 490,
       "h": 238,
       "anker": [
        330,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 518,
       "y": 492,
       "b": 450,
       "h": 383,
       "anker": [
        289,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 492,
       "b": 516,
       "h": 401,
       "anker": [
        307,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 516,
       "h": 490,
       "anker": [
        307,
        261
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 518,
       "y": 0,
       "b": 502,
       "h": 490,
       "anker": [
        313,
        261
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-hut1-riet-z": {
     "gebouw": "hut",
     "beslaat": [
      6,
      4
     ],
     "bestand": "bouwfasen/wit-hut1-riet-z.png",
     "fasen": [
      {
       "x": 648,
       "y": 422,
       "b": 335,
       "h": 158,
       "anker": [
        175,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 356,
       "y": 422,
       "b": 290,
       "h": 293,
       "anker": [
        129,
        162
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 422,
       "b": 354,
       "h": 311,
       "anker": [
        145,
        162
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 378,
       "y": 0,
       "b": 362,
       "h": 420,
       "anker": [
        153,
        271
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 376,
       "h": 420,
       "anker": [
        167,
        271
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-hut1-riet-o": {
     "gebouw": "hut",
     "beslaat": [
      4,
      6
     ],
     "bestand": "bouwfasen/wit-hut1-riet-o.png",
     "fasen": [
      {
       "x": 648,
       "y": 396,
       "b": 335,
       "h": 161,
       "anker": [
        239,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 356,
       "y": 396,
       "b": 290,
       "h": 293,
       "anker": [
        193,
        146
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 396,
       "b": 354,
       "h": 295,
       "anker": [
        209,
        146
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 378,
       "y": 0,
       "b": 362,
       "h": 394,
       "anker": [
        217,
        245
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 376,
       "h": 394,
       "anker": [
        231,
        245
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-hut1-riet-n": {
     "gebouw": "hut",
     "beslaat": [
      6,
      4
     ],
     "bestand": "bouwfasen/wit-hut1-riet-n.png",
     "fasen": [
      {
       "x": 648,
       "y": 396,
       "b": 368,
       "h": 158,
       "anker": [
        175,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 356,
       "y": 396,
       "b": 290,
       "h": 293,
       "anker": [
        97,
        146
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 396,
       "b": 354,
       "h": 295,
       "anker": [
        145,
        146
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 378,
       "y": 0,
       "b": 362,
       "h": 394,
       "anker": [
        145,
        245
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 376,
       "h": 394,
       "anker": [
        145,
        245
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-hut1-riet-w": {
     "gebouw": "hut",
     "beslaat": [
      4,
      6
     ],
     "bestand": "bouwfasen/wit-hut1-riet-w.png",
     "fasen": [
      {
       "x": 648,
       "y": 422,
       "b": 367,
       "h": 177,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 356,
       "y": 422,
       "b": 290,
       "h": 293,
       "anker": [
        161,
        162
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 422,
       "b": 354,
       "h": 311,
       "anker": [
        209,
        162
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 378,
       "y": 0,
       "b": 362,
       "h": 420,
       "anker": [
        209,
        271
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 376,
       "h": 420,
       "anker": [
        209,
        271
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-hut3-riet-z": {
     "gebouw": "hut",
     "beslaat": [
      6,
      4
     ],
     "bestand": "bouwfasen/wit-hut3-riet-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 733,
       "b": 368,
       "h": 174,
       "anker": [
        175,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 356,
       "y": 420,
       "b": 322,
       "h": 309,
       "anker": [
        129,
        162
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 420,
       "b": 354,
       "h": 311,
       "anker": [
        145,
        162
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 400,
       "y": 0,
       "b": 354,
       "h": 418,
       "anker": [
        145,
        269
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 398,
       "h": 418,
       "anker": [
        167,
        269
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-hut3-riet-o": {
     "gebouw": "hut",
     "beslaat": [
      4,
      6
     ],
     "bestand": "bouwfasen/wit-hut3-riet-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 727,
       "b": 367,
       "h": 177,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 356,
       "y": 414,
       "b": 322,
       "h": 309,
       "anker": [
        193,
        162
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 414,
       "b": 354,
       "h": 311,
       "anker": [
        209,
        162
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 400,
       "y": 0,
       "b": 354,
       "h": 412,
       "anker": [
        209,
        263
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 398,
       "h": 412,
       "anker": [
        231,
        263
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-hut3-riet-n": {
     "gebouw": "hut",
     "beslaat": [
      6,
      4
     ],
     "bestand": "bouwfasen/wit-hut3-riet-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 727,
       "b": 367,
       "h": 174,
       "anker": [
        175,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 356,
       "y": 414,
       "b": 322,
       "h": 309,
       "anker": [
        129,
        162
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 414,
       "b": 354,
       "h": 311,
       "anker": [
        145,
        162
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 400,
       "y": 0,
       "b": 354,
       "h": 412,
       "anker": [
        145,
        263
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 398,
       "h": 412,
       "anker": [
        167,
        263
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-hut3-riet-w": {
     "gebouw": "hut",
     "beslaat": [
      4,
      6
     ],
     "bestand": "bouwfasen/wit-hut3-riet-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 733,
       "b": 367,
       "h": 177,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 356,
       "y": 420,
       "b": 322,
       "h": 309,
       "anker": [
        193,
        162
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 420,
       "b": 354,
       "h": 311,
       "anker": [
        209,
        162
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 400,
       "y": 0,
       "b": 354,
       "h": 418,
       "anker": [
        209,
        269
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 398,
       "h": 418,
       "anker": [
        231,
        269
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-hut4-riet-z": {
     "gebouw": "hut",
     "beslaat": [
      6,
      6
     ],
     "bestand": "bouwfasen/wit-hut4-riet-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 795,
       "b": 431,
       "h": 212,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 446,
       "b": 322,
       "h": 347,
       "anker": [
        129,
        162
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 446,
       "b": 418,
       "h": 347,
       "anker": [
        209,
        162
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 453,
       "y": 0,
       "b": 418,
       "h": 444,
       "anker": [
        209,
        259
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 451,
       "h": 444,
       "anker": [
        209,
        259
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-hut4-riet-o": {
     "gebouw": "hut",
     "beslaat": [
      6,
      6
     ],
     "bestand": "bouwfasen/wit-hut4-riet-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 765,
       "b": 447,
       "h": 177,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 420,
       "b": 401,
       "h": 309,
       "anker": [
        193,
        162
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 420,
       "b": 418,
       "h": 343,
       "anker": [
        209,
        162
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 469,
       "y": 0,
       "b": 432,
       "h": 418,
       "anker": [
        209,
        237
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 467,
       "h": 418,
       "anker": [
        231,
        237
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-hut4-riet-n": {
     "gebouw": "hut",
     "beslaat": [
      6,
      6
     ],
     "bestand": "bouwfasen/wit-hut4-riet-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 798,
       "b": 367,
       "h": 207,
       "anker": [
        239,
        28
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 452,
       "b": 322,
       "h": 342,
       "anker": [
        193,
        163
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 452,
       "b": 418,
       "h": 344,
       "anker": [
        209,
        163
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 453,
       "y": 0,
       "b": 418,
       "h": 450,
       "anker": [
        209,
        269
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 451,
       "h": 450,
       "anker": [
        242,
        269
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-hut4-riet-w": {
     "gebouw": "hut",
     "beslaat": [
      6,
      6
     ],
     "bestand": "bouwfasen/wit-hut4-riet-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 727,
       "b": 431,
       "h": 174,
       "anker": [
        239,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 410,
       "b": 401,
       "h": 309,
       "anker": [
        208,
        130
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 410,
       "b": 418,
       "h": 315,
       "anker": [
        209,
        134
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 469,
       "y": 0,
       "b": 432,
       "h": 408,
       "anker": [
        223,
        227
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 467,
       "h": 408,
       "anker": [
        236,
        227
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis1-riet-z": {
     "gebouw": "huis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/wit-huis1-riet-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 879,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 504,
       "b": 386,
       "h": 371,
       "anker": [
        161,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 504,
       "b": 418,
       "h": 373,
       "anker": [
        177,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 465,
       "y": 0,
       "b": 450,
       "h": 502,
       "anker": [
        193,
        321
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 463,
       "h": 502,
       "anker": [
        199,
        321
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis1-riet-o": {
     "gebouw": "huis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/wit-huis1-riet-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 880,
       "b": 432,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 505,
       "b": 386,
       "h": 371,
       "anker": [
        225,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 505,
       "b": 418,
       "h": 373,
       "anker": [
        241,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 465,
       "y": 0,
       "b": 450,
       "h": 503,
       "anker": [
        257,
        322
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 463,
       "h": 503,
       "anker": [
        263,
        322
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis1-riet-n": {
     "gebouw": "huis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/wit-huis1-riet-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 880,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 505,
       "b": 386,
       "h": 371,
       "anker": [
        161,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 505,
       "b": 418,
       "h": 373,
       "anker": [
        177,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 465,
       "y": 0,
       "b": 450,
       "h": 503,
       "anker": [
        193,
        322
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 463,
       "h": 503,
       "anker": [
        200,
        322
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis1-riet-w": {
     "gebouw": "huis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/wit-huis1-riet-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 879,
       "b": 431,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 504,
       "b": 386,
       "h": 371,
       "anker": [
        225,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 504,
       "b": 418,
       "h": 373,
       "anker": [
        241,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 465,
       "y": 0,
       "b": 450,
       "h": 502,
       "anker": [
        257,
        321
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 463,
       "h": 502,
       "anker": [
        264,
        321
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis1-leien-z": {
     "gebouw": "huis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/wit-huis1-leien-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 840,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 485,
       "b": 386,
       "h": 351,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 485,
       "b": 418,
       "h": 353,
       "anker": [
        177,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 437,
       "y": 0,
       "b": 434,
       "h": 483,
       "anker": [
        185,
        302
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 435,
       "h": 483,
       "anker": [
        185,
        302
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis1-leien-o": {
     "gebouw": "huis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/wit-huis1-leien-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 842,
       "b": 432,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 487,
       "b": 386,
       "h": 351,
       "anker": [
        225,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 487,
       "b": 418,
       "h": 353,
       "anker": [
        241,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 434,
       "h": 485,
       "anker": [
        249,
        304
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 436,
       "y": 0,
       "b": 434,
       "h": 485,
       "anker": [
        249,
        304
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis1-leien-n": {
     "gebouw": "huis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/wit-huis1-leien-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 842,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 487,
       "b": 386,
       "h": 351,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 487,
       "b": 418,
       "h": 353,
       "anker": [
        177,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 434,
       "h": 485,
       "anker": [
        185,
        304
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 436,
       "y": 0,
       "b": 434,
       "h": 485,
       "anker": [
        185,
        304
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis1-leien-w": {
     "gebouw": "huis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/wit-huis1-leien-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 840,
       "b": 431,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 485,
       "b": 386,
       "h": 351,
       "anker": [
        225,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 485,
       "b": 418,
       "h": 353,
       "anker": [
        241,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 437,
       "y": 0,
       "b": 434,
       "h": 483,
       "anker": [
        249,
        302
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 435,
       "h": 483,
       "anker": [
        250,
        302
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis1-pannen-z": {
     "gebouw": "huis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/wit-huis1-pannen-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 802,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 447,
       "b": 386,
       "h": 351,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 447,
       "b": 418,
       "h": 353,
       "anker": [
        177,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 435,
       "h": 445,
       "anker": [
        185,
        264
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 437,
       "y": 0,
       "b": 435,
       "h": 445,
       "anker": [
        185,
        264
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis1-pannen-o": {
     "gebouw": "huis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/wit-huis1-pannen-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 803,
       "b": 432,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 448,
       "b": 386,
       "h": 351,
       "anker": [
        225,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 448,
       "b": 418,
       "h": 353,
       "anker": [
        241,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 435,
       "h": 446,
       "anker": [
        249,
        265
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 437,
       "y": 0,
       "b": 435,
       "h": 446,
       "anker": [
        249,
        265
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis1-pannen-n": {
     "gebouw": "huis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/wit-huis1-pannen-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 803,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 448,
       "b": 386,
       "h": 351,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 448,
       "b": 418,
       "h": 353,
       "anker": [
        177,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 435,
       "h": 446,
       "anker": [
        186,
        265
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 437,
       "y": 0,
       "b": 435,
       "h": 446,
       "anker": [
        186,
        265
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis1-pannen-w": {
     "gebouw": "huis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/wit-huis1-pannen-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 802,
       "b": 431,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 447,
       "b": 386,
       "h": 351,
       "anker": [
        225,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 447,
       "b": 418,
       "h": 353,
       "anker": [
        241,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 435,
       "h": 445,
       "anker": [
        250,
        264
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 437,
       "y": 0,
       "b": 435,
       "h": 445,
       "anker": [
        250,
        264
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis3-riet-z": {
     "gebouw": "huis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/wit-huis3-riet-z.png",
     "fasen": [
      {
       "x": 420,
       "y": 547,
       "b": 527,
       "h": 239,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 547,
       "b": 418,
       "h": 413,
       "anker": [
        161,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 1096,
       "y": 0,
       "b": 546,
       "h": 437,
       "anker": [
        241,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 546,
       "h": 545,
       "anker": [
        241,
        300
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 548,
       "y": 0,
       "b": 546,
       "h": 545,
       "anker": [
        241,
        300
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis3-riet-o": {
     "gebouw": "huis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/wit-huis3-riet-o.png",
     "fasen": [
      {
       "x": 452,
       "y": 533,
       "b": 496,
       "h": 222,
       "anker": [
        335,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 533,
       "b": 450,
       "h": 387,
       "anker": [
        289,
        176
       ],
       "naam": "geraamte"
      },
      {
       "x": 1118,
       "y": 0,
       "b": 546,
       "h": 421,
       "anker": [
        305,
        176
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 570,
       "y": 0,
       "b": 546,
       "h": 531,
       "anker": [
        305,
        286
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 568,
       "h": 531,
       "anker": [
        327,
        286
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis3-riet-n": {
     "gebouw": "huis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/wit-huis3-riet-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 1402,
       "b": 495,
       "h": 238,
       "anker": [
        271,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 548,
       "y": 1002,
       "b": 418,
       "h": 387,
       "anker": [
        193,
        144
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 1002,
       "b": 546,
       "h": 398,
       "anker": [
        241,
        153
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 546,
       "h": 499,
       "anker": [
        241,
        254
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 501,
       "b": 546,
       "h": 499,
       "anker": [
        241,
        254
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis3-riet-w": {
     "gebouw": "huis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/wit-huis3-riet-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 1437,
       "b": 559,
       "h": 222,
       "anker": [
        335,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 548,
       "y": 1030,
       "b": 450,
       "h": 387,
       "anker": [
        225,
        160
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 1030,
       "b": 546,
       "h": 405,
       "anker": [
        305,
        160
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 515,
       "b": 546,
       "h": 513,
       "anker": [
        305,
        268
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 568,
       "h": 513,
       "anker": [
        305,
        268
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis3-leien-z": {
     "gebouw": "huis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/wit-huis3-leien-z.png",
     "fasen": [
      {
       "x": 420,
       "y": 526,
       "b": 527,
       "h": 238,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 526,
       "b": 418,
       "h": 393,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1096,
       "y": 0,
       "b": 546,
       "h": 417,
       "anker": [
        241,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 546,
       "h": 524,
       "anker": [
        241,
        279
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 548,
       "y": 0,
       "b": 546,
       "h": 524,
       "anker": [
        241,
        279
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis3-leien-o": {
     "gebouw": "huis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/wit-huis3-leien-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 1427,
       "b": 495,
       "h": 222,
       "anker": [
        335,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 548,
       "y": 1024,
       "b": 449,
       "h": 367,
       "anker": [
        289,
        156
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 1024,
       "b": 546,
       "h": 401,
       "anker": [
        305,
        156
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 512,
       "b": 546,
       "h": 510,
       "anker": [
        305,
        265
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 554,
       "h": 510,
       "anker": [
        313,
        265
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis3-leien-n": {
     "gebouw": "huis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/wit-huis3-leien-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 1347,
       "b": 495,
       "h": 238,
       "anker": [
        271,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 548,
       "y": 960,
       "b": 418,
       "h": 367,
       "anker": [
        193,
        124
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 960,
       "b": 546,
       "h": 385,
       "anker": [
        241,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 546,
       "h": 478,
       "anker": [
        241,
        233
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 480,
       "b": 546,
       "h": 478,
       "anker": [
        241,
        233
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis3-leien-w": {
     "gebouw": "huis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/wit-huis3-leien-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 1375,
       "b": 559,
       "h": 222,
       "anker": [
        335,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 548,
       "y": 988,
       "b": 449,
       "h": 367,
       "anker": [
        224,
        140
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 988,
       "b": 546,
       "h": 385,
       "anker": [
        305,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 494,
       "b": 546,
       "h": 492,
       "anker": [
        305,
        247
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 554,
       "h": 492,
       "anker": [
        305,
        247
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis3-pannen-z": {
     "gebouw": "huis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/wit-huis3-pannen-z.png",
     "fasen": [
      {
       "x": 420,
       "y": 494,
       "b": 527,
       "h": 238,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 494,
       "b": 418,
       "h": 393,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1096,
       "y": 0,
       "b": 546,
       "h": 417,
       "anker": [
        241,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 546,
       "h": 492,
       "anker": [
        241,
        247
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 548,
       "y": 0,
       "b": 546,
       "h": 492,
       "anker": [
        241,
        247
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis3-pannen-o": {
     "gebouw": "huis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/wit-huis3-pannen-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 1365,
       "b": 494,
       "h": 222,
       "anker": [
        335,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 548,
       "y": 962,
       "b": 448,
       "h": 367,
       "anker": [
        289,
        156
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 962,
       "b": 546,
       "h": 401,
       "anker": [
        305,
        156
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 481,
       "b": 546,
       "h": 479,
       "anker": [
        305,
        234
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 553,
       "h": 479,
       "anker": [
        312,
        234
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis3-pannen-n": {
     "gebouw": "huis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/wit-huis3-pannen-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 1285,
       "b": 495,
       "h": 238,
       "anker": [
        271,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 548,
       "y": 898,
       "b": 418,
       "h": 367,
       "anker": [
        193,
        124
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 898,
       "b": 546,
       "h": 385,
       "anker": [
        241,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 546,
       "h": 447,
       "anker": [
        241,
        202
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 449,
       "b": 546,
       "h": 447,
       "anker": [
        241,
        202
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis3-pannen-w": {
     "gebouw": "huis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/wit-huis3-pannen-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 1311,
       "b": 559,
       "h": 222,
       "anker": [
        335,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 548,
       "y": 924,
       "b": 448,
       "h": 367,
       "anker": [
        223,
        140
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 924,
       "b": 546,
       "h": 385,
       "anker": [
        305,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 462,
       "b": 546,
       "h": 460,
       "anker": [
        305,
        215
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 553,
       "h": 460,
       "anker": [
        305,
        215
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis6-riet-z": {
     "gebouw": "huis",
     "beslaat": [
      9,
      8
     ],
     "bestand": "bouwfasen/wit-huis6-riet-z.png",
     "fasen": [
      {
       "x": 452,
       "y": 560,
       "b": 591,
       "h": 256,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 560,
       "b": 450,
       "h": 421,
       "anker": [
        161,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 1206,
       "y": 0,
       "b": 578,
       "h": 453,
       "anker": [
        273,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 605,
       "y": 0,
       "b": 599,
       "h": 558,
       "anker": [
        273,
        297
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 603,
       "h": 558,
       "anker": [
        273,
        297
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis6-riet-o": {
     "gebouw": "huis",
     "beslaat": [
      8,
      9
     ],
     "bestand": "bouwfasen/wit-huis6-riet-o.png",
     "fasen": [
      {
       "x": 487,
       "y": 561,
       "b": 531,
       "h": 238,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 561,
       "b": 485,
       "h": 403,
       "anker": [
        289,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 1206,
       "y": 0,
       "b": 578,
       "h": 453,
       "anker": [
        305,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 605,
       "y": 0,
       "b": 599,
       "h": 559,
       "anker": [
        326,
        298
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 603,
       "h": 559,
       "anker": [
        330,
        298
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis6-riet-n": {
     "gebouw": "huis",
     "beslaat": [
      9,
      8
     ],
     "bestand": "bouwfasen/wit-huis6-riet-n.png",
     "fasen": [
      {
       "x": 452,
       "y": 515,
       "b": 496,
       "h": 256,
       "anker": [
        303,
        -3
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 515,
       "b": 450,
       "h": 421,
       "anker": [
        257,
        162
       ],
       "naam": "geraamte"
      },
      {
       "x": 1206,
       "y": 0,
       "b": 578,
       "h": 423,
       "anker": [
        273,
        162
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 605,
       "y": 0,
       "b": 599,
       "h": 513,
       "anker": [
        294,
        252
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 603,
       "h": 513,
       "anker": [
        298,
        252
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis6-riet-w": {
     "gebouw": "huis",
     "beslaat": [
      8,
      9
     ],
     "bestand": "bouwfasen/wit-huis6-riet-w.png",
     "fasen": [
      {
       "x": 487,
       "y": 512,
       "b": 591,
       "h": 238,
       "anker": [
        335,
        -21
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 512,
       "b": 485,
       "h": 403,
       "anker": [
        228,
        144
       ],
       "naam": "geraamte"
      },
      {
       "x": 1206,
       "y": 0,
       "b": 578,
       "h": 414,
       "anker": [
        305,
        153
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 605,
       "y": 0,
       "b": 599,
       "h": 510,
       "anker": [
        305,
        249
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 603,
       "h": 510,
       "anker": [
        305,
        249
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis6-leien-z": {
     "gebouw": "huis",
     "beslaat": [
      9,
      8
     ],
     "bestand": "bouwfasen/wit-huis6-leien-z.png",
     "fasen": [
      {
       "x": 452,
       "y": 539,
       "b": 591,
       "h": 256,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 539,
       "b": 450,
       "h": 401,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1171,
       "y": 0,
       "b": 578,
       "h": 433,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 591,
       "y": 0,
       "b": 578,
       "h": 537,
       "anker": [
        273,
        276
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 589,
       "h": 537,
       "anker": [
        273,
        276
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis6-leien-o": {
     "gebouw": "huis",
     "beslaat": [
      8,
      9
     ],
     "bestand": "bouwfasen/wit-huis6-leien-o.png",
     "fasen": [
      {
       "x": 487,
       "y": 541,
       "b": 531,
       "h": 238,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 541,
       "b": 485,
       "h": 383,
       "anker": [
        289,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1171,
       "y": 0,
       "b": 578,
       "h": 433,
       "anker": [
        305,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 591,
       "y": 0,
       "b": 578,
       "h": 539,
       "anker": [
        305,
        278
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 589,
       "h": 539,
       "anker": [
        316,
        278
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis6-leien-n": {
     "gebouw": "huis",
     "beslaat": [
      9,
      8
     ],
     "bestand": "bouwfasen/wit-huis6-leien-n.png",
     "fasen": [
      {
       "x": 452,
       "y": 493,
       "b": 496,
       "h": 256,
       "anker": [
        303,
        -3
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 493,
       "b": 450,
       "h": 401,
       "anker": [
        257,
        142
       ],
       "naam": "geraamte"
      },
      {
       "x": 1171,
       "y": 0,
       "b": 578,
       "h": 403,
       "anker": [
        273,
        142
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 591,
       "y": 0,
       "b": 578,
       "h": 491,
       "anker": [
        273,
        230
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 589,
       "h": 491,
       "anker": [
        284,
        230
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis6-leien-w": {
     "gebouw": "huis",
     "beslaat": [
      8,
      9
     ],
     "bestand": "bouwfasen/wit-huis6-leien-w.png",
     "fasen": [
      {
       "x": 487,
       "y": 491,
       "b": 591,
       "h": 238,
       "anker": [
        335,
        -21
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 491,
       "b": 485,
       "h": 383,
       "anker": [
        228,
        124
       ],
       "naam": "geraamte"
      },
      {
       "x": 1171,
       "y": 0,
       "b": 578,
       "h": 401,
       "anker": [
        305,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 591,
       "y": 0,
       "b": 578,
       "h": 489,
       "anker": [
        305,
        228
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 589,
       "h": 489,
       "anker": [
        305,
        228
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis6-pannen-z": {
     "gebouw": "huis",
     "beslaat": [
      9,
      8
     ],
     "bestand": "bouwfasen/wit-huis6-pannen-z.png",
     "fasen": [
      {
       "x": 452,
       "y": 508,
       "b": 591,
       "h": 256,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 508,
       "b": 450,
       "h": 401,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1170,
       "y": 0,
       "b": 578,
       "h": 433,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 590,
       "y": 0,
       "b": 578,
       "h": 506,
       "anker": [
        273,
        245
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 588,
       "h": 506,
       "anker": [
        273,
        245
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis6-pannen-o": {
     "gebouw": "huis",
     "beslaat": [
      8,
      9
     ],
     "bestand": "bouwfasen/wit-huis6-pannen-o.png",
     "fasen": [
      {
       "x": 487,
       "y": 509,
       "b": 531,
       "h": 238,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 509,
       "b": 485,
       "h": 383,
       "anker": [
        289,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1171,
       "y": 0,
       "b": 578,
       "h": 433,
       "anker": [
        305,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 591,
       "y": 0,
       "b": 578,
       "h": 507,
       "anker": [
        305,
        246
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 589,
       "h": 507,
       "anker": [
        316,
        246
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis6-pannen-n": {
     "gebouw": "huis",
     "beslaat": [
      9,
      8
     ],
     "bestand": "bouwfasen/wit-huis6-pannen-n.png",
     "fasen": [
      {
       "x": 452,
       "y": 1339,
       "b": 496,
       "h": 256,
       "anker": [
        303,
        -3
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 1339,
       "b": 450,
       "h": 401,
       "anker": [
        257,
        142
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 934,
       "b": 578,
       "h": 403,
       "anker": [
        273,
        142
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 467,
       "b": 578,
       "h": 465,
       "anker": [
        273,
        204
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 588,
       "h": 465,
       "anker": [
        283,
        204
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-huis6-pannen-w": {
     "gebouw": "huis",
     "beslaat": [
      8,
      9
     ],
     "bestand": "bouwfasen/wit-huis6-pannen-w.png",
     "fasen": [
      {
       "x": 487,
       "y": 460,
       "b": 591,
       "h": 238,
       "anker": [
        335,
        -21
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 460,
       "b": 485,
       "h": 383,
       "anker": [
        228,
        124
       ],
       "naam": "geraamte"
      },
      {
       "x": 1171,
       "y": 0,
       "b": 578,
       "h": 401,
       "anker": [
        305,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 591,
       "y": 0,
       "b": 578,
       "h": 458,
       "anker": [
        305,
        197
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 589,
       "h": 458,
       "anker": [
        305,
        197
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen1-leien-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/wit-steen1-leien-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 840,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 485,
       "b": 386,
       "h": 351,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 485,
       "b": 418,
       "h": 353,
       "anker": [
        177,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 437,
       "y": 0,
       "b": 434,
       "h": 483,
       "anker": [
        185,
        302
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 435,
       "h": 483,
       "anker": [
        185,
        302
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen1-leien-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/wit-steen1-leien-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 842,
       "b": 432,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 487,
       "b": 386,
       "h": 351,
       "anker": [
        225,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 487,
       "b": 418,
       "h": 353,
       "anker": [
        241,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 434,
       "h": 485,
       "anker": [
        249,
        304
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 436,
       "y": 0,
       "b": 434,
       "h": 485,
       "anker": [
        249,
        304
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen1-leien-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/wit-steen1-leien-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 842,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 487,
       "b": 386,
       "h": 351,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 487,
       "b": 418,
       "h": 353,
       "anker": [
        177,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 434,
       "h": 485,
       "anker": [
        185,
        304
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 436,
       "y": 0,
       "b": 434,
       "h": 485,
       "anker": [
        185,
        304
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen1-leien-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/wit-steen1-leien-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 840,
       "b": 431,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 485,
       "b": 386,
       "h": 351,
       "anker": [
        225,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 485,
       "b": 418,
       "h": 353,
       "anker": [
        241,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 437,
       "y": 0,
       "b": 434,
       "h": 483,
       "anker": [
        249,
        302
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 435,
       "h": 483,
       "anker": [
        250,
        302
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen1-pannen-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/wit-steen1-pannen-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 802,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 447,
       "b": 386,
       "h": 351,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 447,
       "b": 418,
       "h": 353,
       "anker": [
        177,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 435,
       "h": 445,
       "anker": [
        185,
        264
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 437,
       "y": 0,
       "b": 435,
       "h": 445,
       "anker": [
        185,
        264
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen1-pannen-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/wit-steen1-pannen-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 803,
       "b": 432,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 448,
       "b": 386,
       "h": 351,
       "anker": [
        225,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 448,
       "b": 418,
       "h": 353,
       "anker": [
        241,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 435,
       "h": 446,
       "anker": [
        249,
        265
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 437,
       "y": 0,
       "b": 435,
       "h": 446,
       "anker": [
        249,
        265
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen1-pannen-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/wit-steen1-pannen-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 803,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 448,
       "b": 386,
       "h": 351,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 448,
       "b": 418,
       "h": 353,
       "anker": [
        177,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 435,
       "h": 446,
       "anker": [
        186,
        265
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 437,
       "y": 0,
       "b": 435,
       "h": 446,
       "anker": [
        186,
        265
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen1-pannen-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/wit-steen1-pannen-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 802,
       "b": 431,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 447,
       "b": 386,
       "h": 351,
       "anker": [
        225,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 447,
       "b": 418,
       "h": 353,
       "anker": [
        241,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 435,
       "h": 445,
       "anker": [
        250,
        264
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 437,
       "y": 0,
       "b": 435,
       "h": 445,
       "anker": [
        250,
        264
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen1-baksteen-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/wit-steen1-baksteen-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 802,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 447,
       "b": 386,
       "h": 351,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 447,
       "b": 418,
       "h": 353,
       "anker": [
        177,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 435,
       "h": 445,
       "anker": [
        185,
        264
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 437,
       "y": 0,
       "b": 435,
       "h": 445,
       "anker": [
        185,
        264
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen1-baksteen-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/wit-steen1-baksteen-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 803,
       "b": 432,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 448,
       "b": 386,
       "h": 351,
       "anker": [
        225,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 448,
       "b": 418,
       "h": 353,
       "anker": [
        241,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 435,
       "h": 446,
       "anker": [
        249,
        265
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 437,
       "y": 0,
       "b": 435,
       "h": 446,
       "anker": [
        249,
        265
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen1-baksteen-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/wit-steen1-baksteen-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 803,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 448,
       "b": 386,
       "h": 351,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 448,
       "b": 418,
       "h": 353,
       "anker": [
        177,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 435,
       "h": 446,
       "anker": [
        186,
        265
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 437,
       "y": 0,
       "b": 435,
       "h": 446,
       "anker": [
        186,
        265
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen1-baksteen-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/wit-steen1-baksteen-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 802,
       "b": 431,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 447,
       "b": 386,
       "h": 351,
       "anker": [
        225,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 447,
       "b": 418,
       "h": 353,
       "anker": [
        241,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 435,
       "h": 445,
       "anker": [
        250,
        264
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 437,
       "y": 0,
       "b": 435,
       "h": 445,
       "anker": [
        250,
        264
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen3-leien-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      7
     ],
     "bestand": "bouwfasen/wit-steen3-leien-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 1423,
       "b": 527,
       "h": 238,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 516,
       "y": 1020,
       "b": 418,
       "h": 393,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 1020,
       "b": 514,
       "h": 401,
       "anker": [
        241,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 510,
       "b": 514,
       "h": 508,
       "anker": [
        241,
        279
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 525,
       "h": 508,
       "anker": [
        241,
        279
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen3-leien-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      8
     ],
     "bestand": "bouwfasen/wit-steen3-leien-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 1427,
       "b": 495,
       "h": 222,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 516,
       "y": 1024,
       "b": 449,
       "h": 367,
       "anker": [
        257,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 1024,
       "b": 514,
       "h": 401,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 512,
       "b": 514,
       "h": 510,
       "anker": [
        273,
        281
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 522,
       "h": 510,
       "anker": [
        281,
        281
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen3-leien-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      7
     ],
     "bestand": "bouwfasen/wit-steen3-leien-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 1331,
       "b": 463,
       "h": 238,
       "anker": [
        271,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 516,
       "y": 960,
       "b": 418,
       "h": 367,
       "anker": [
        225,
        140
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 960,
       "b": 514,
       "h": 369,
       "anker": [
        241,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 480,
       "b": 514,
       "h": 478,
       "anker": [
        241,
        249
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 525,
       "h": 478,
       "anker": [
        252,
        249
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen3-leien-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      8
     ],
     "bestand": "bouwfasen/wit-steen3-leien-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 1327,
       "b": 527,
       "h": 222,
       "anker": [
        303,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 516,
       "y": 956,
       "b": 449,
       "h": 367,
       "anker": [
        224,
        140
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 956,
       "b": 514,
       "h": 369,
       "anker": [
        273,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 478,
       "b": 514,
       "h": 476,
       "anker": [
        273,
        247
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 522,
       "h": 476,
       "anker": [
        273,
        247
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen3-pannen-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      7
     ],
     "bestand": "bouwfasen/wit-steen3-pannen-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 1359,
       "b": 527,
       "h": 238,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 516,
       "y": 956,
       "b": 418,
       "h": 393,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 956,
       "b": 514,
       "h": 401,
       "anker": [
        241,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 478,
       "b": 514,
       "h": 476,
       "anker": [
        241,
        247
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 524,
       "h": 476,
       "anker": [
        241,
        247
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen3-pannen-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      8
     ],
     "bestand": "bouwfasen/wit-steen3-pannen-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 1365,
       "b": 494,
       "h": 222,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 516,
       "y": 962,
       "b": 448,
       "h": 367,
       "anker": [
        257,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 962,
       "b": 514,
       "h": 401,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 481,
       "b": 514,
       "h": 479,
       "anker": [
        273,
        250
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 521,
       "h": 479,
       "anker": [
        280,
        250
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen3-pannen-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      7
     ],
     "bestand": "bouwfasen/wit-steen3-pannen-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 1269,
       "b": 463,
       "h": 238,
       "anker": [
        271,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 516,
       "y": 898,
       "b": 418,
       "h": 367,
       "anker": [
        225,
        140
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 898,
       "b": 514,
       "h": 369,
       "anker": [
        241,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 449,
       "b": 514,
       "h": 447,
       "anker": [
        241,
        218
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 524,
       "h": 447,
       "anker": [
        251,
        218
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen3-pannen-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      8
     ],
     "bestand": "bouwfasen/wit-steen3-pannen-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 1263,
       "b": 527,
       "h": 222,
       "anker": [
        303,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 516,
       "y": 892,
       "b": 448,
       "h": 367,
       "anker": [
        223,
        140
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 892,
       "b": 514,
       "h": 369,
       "anker": [
        273,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 446,
       "b": 514,
       "h": 444,
       "anker": [
        273,
        215
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 521,
       "h": 444,
       "anker": [
        273,
        215
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen3-baksteen-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      7
     ],
     "bestand": "bouwfasen/wit-steen3-baksteen-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 1359,
       "b": 527,
       "h": 238,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 516,
       "y": 956,
       "b": 418,
       "h": 393,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 956,
       "b": 514,
       "h": 401,
       "anker": [
        241,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 478,
       "b": 514,
       "h": 476,
       "anker": [
        241,
        247
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 524,
       "h": 476,
       "anker": [
        241,
        247
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen3-baksteen-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      8
     ],
     "bestand": "bouwfasen/wit-steen3-baksteen-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 1365,
       "b": 494,
       "h": 222,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 516,
       "y": 962,
       "b": 448,
       "h": 367,
       "anker": [
        257,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 962,
       "b": 514,
       "h": 401,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 481,
       "b": 514,
       "h": 479,
       "anker": [
        273,
        250
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 521,
       "h": 479,
       "anker": [
        280,
        250
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen3-baksteen-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      7
     ],
     "bestand": "bouwfasen/wit-steen3-baksteen-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 1269,
       "b": 463,
       "h": 238,
       "anker": [
        271,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 516,
       "y": 898,
       "b": 418,
       "h": 367,
       "anker": [
        225,
        140
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 898,
       "b": 514,
       "h": 369,
       "anker": [
        241,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 449,
       "b": 514,
       "h": 447,
       "anker": [
        241,
        218
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 524,
       "h": 447,
       "anker": [
        251,
        218
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen3-baksteen-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      8
     ],
     "bestand": "bouwfasen/wit-steen3-baksteen-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 1263,
       "b": 527,
       "h": 222,
       "anker": [
        303,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 516,
       "y": 892,
       "b": 448,
       "h": 367,
       "anker": [
        223,
        140
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 892,
       "b": 514,
       "h": 369,
       "anker": [
        273,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 446,
       "b": 514,
       "h": 444,
       "anker": [
        273,
        215
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 521,
       "h": 444,
       "anker": [
        273,
        215
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen6-leien-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      9,
      8
     ],
     "bestand": "bouwfasen/wit-steen6-leien-z.png",
     "fasen": [
      {
       "x": 452,
       "y": 539,
       "b": 591,
       "h": 256,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 539,
       "b": 450,
       "h": 401,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1171,
       "y": 0,
       "b": 578,
       "h": 433,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 591,
       "y": 0,
       "b": 578,
       "h": 537,
       "anker": [
        273,
        276
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 589,
       "h": 537,
       "anker": [
        273,
        276
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen6-leien-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      9
     ],
     "bestand": "bouwfasen/wit-steen6-leien-o.png",
     "fasen": [
      {
       "x": 487,
       "y": 541,
       "b": 531,
       "h": 238,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 541,
       "b": 485,
       "h": 383,
       "anker": [
        289,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1171,
       "y": 0,
       "b": 578,
       "h": 433,
       "anker": [
        305,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 591,
       "y": 0,
       "b": 578,
       "h": 539,
       "anker": [
        305,
        278
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 589,
       "h": 539,
       "anker": [
        316,
        278
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen6-leien-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      9,
      8
     ],
     "bestand": "bouwfasen/wit-steen6-leien-n.png",
     "fasen": [
      {
       "x": 452,
       "y": 493,
       "b": 496,
       "h": 256,
       "anker": [
        303,
        -3
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 493,
       "b": 450,
       "h": 401,
       "anker": [
        257,
        142
       ],
       "naam": "geraamte"
      },
      {
       "x": 1171,
       "y": 0,
       "b": 578,
       "h": 403,
       "anker": [
        273,
        142
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 591,
       "y": 0,
       "b": 578,
       "h": 491,
       "anker": [
        273,
        230
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 589,
       "h": 491,
       "anker": [
        284,
        230
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen6-leien-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      9
     ],
     "bestand": "bouwfasen/wit-steen6-leien-w.png",
     "fasen": [
      {
       "x": 487,
       "y": 491,
       "b": 591,
       "h": 238,
       "anker": [
        335,
        -21
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 491,
       "b": 485,
       "h": 383,
       "anker": [
        228,
        124
       ],
       "naam": "geraamte"
      },
      {
       "x": 1171,
       "y": 0,
       "b": 578,
       "h": 401,
       "anker": [
        305,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 591,
       "y": 0,
       "b": 578,
       "h": 489,
       "anker": [
        305,
        228
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 589,
       "h": 489,
       "anker": [
        305,
        228
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen6-pannen-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      9,
      8
     ],
     "bestand": "bouwfasen/wit-steen6-pannen-z.png",
     "fasen": [
      {
       "x": 452,
       "y": 508,
       "b": 591,
       "h": 256,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 508,
       "b": 450,
       "h": 401,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1170,
       "y": 0,
       "b": 578,
       "h": 433,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 590,
       "y": 0,
       "b": 578,
       "h": 506,
       "anker": [
        273,
        245
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 588,
       "h": 506,
       "anker": [
        273,
        245
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen6-pannen-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      9
     ],
     "bestand": "bouwfasen/wit-steen6-pannen-o.png",
     "fasen": [
      {
       "x": 487,
       "y": 509,
       "b": 531,
       "h": 238,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 509,
       "b": 485,
       "h": 383,
       "anker": [
        289,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1171,
       "y": 0,
       "b": 578,
       "h": 433,
       "anker": [
        305,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 591,
       "y": 0,
       "b": 578,
       "h": 507,
       "anker": [
        305,
        246
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 589,
       "h": 507,
       "anker": [
        316,
        246
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen6-pannen-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      9,
      8
     ],
     "bestand": "bouwfasen/wit-steen6-pannen-n.png",
     "fasen": [
      {
       "x": 452,
       "y": 1339,
       "b": 496,
       "h": 256,
       "anker": [
        303,
        -3
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 1339,
       "b": 450,
       "h": 401,
       "anker": [
        257,
        142
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 934,
       "b": 578,
       "h": 403,
       "anker": [
        273,
        142
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 467,
       "b": 578,
       "h": 465,
       "anker": [
        273,
        204
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 588,
       "h": 465,
       "anker": [
        283,
        204
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen6-pannen-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      9
     ],
     "bestand": "bouwfasen/wit-steen6-pannen-w.png",
     "fasen": [
      {
       "x": 487,
       "y": 460,
       "b": 591,
       "h": 238,
       "anker": [
        335,
        -21
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 460,
       "b": 485,
       "h": 383,
       "anker": [
        228,
        124
       ],
       "naam": "geraamte"
      },
      {
       "x": 1171,
       "y": 0,
       "b": 578,
       "h": 401,
       "anker": [
        305,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 591,
       "y": 0,
       "b": 578,
       "h": 458,
       "anker": [
        305,
        197
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 589,
       "h": 458,
       "anker": [
        305,
        197
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen6-baksteen-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      9,
      8
     ],
     "bestand": "bouwfasen/wit-steen6-baksteen-z.png",
     "fasen": [
      {
       "x": 452,
       "y": 508,
       "b": 591,
       "h": 256,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 508,
       "b": 450,
       "h": 401,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1170,
       "y": 0,
       "b": 578,
       "h": 433,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 590,
       "y": 0,
       "b": 578,
       "h": 506,
       "anker": [
        273,
        245
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 588,
       "h": 506,
       "anker": [
        273,
        245
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen6-baksteen-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      9
     ],
     "bestand": "bouwfasen/wit-steen6-baksteen-o.png",
     "fasen": [
      {
       "x": 487,
       "y": 509,
       "b": 531,
       "h": 238,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 509,
       "b": 485,
       "h": 383,
       "anker": [
        289,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1171,
       "y": 0,
       "b": 578,
       "h": 433,
       "anker": [
        305,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 591,
       "y": 0,
       "b": 578,
       "h": 507,
       "anker": [
        305,
        246
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 589,
       "h": 507,
       "anker": [
        316,
        246
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen6-baksteen-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      9,
      8
     ],
     "bestand": "bouwfasen/wit-steen6-baksteen-n.png",
     "fasen": [
      {
       "x": 452,
       "y": 1339,
       "b": 496,
       "h": 256,
       "anker": [
        303,
        -3
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 1339,
       "b": 450,
       "h": 401,
       "anker": [
        257,
        142
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 934,
       "b": 578,
       "h": 403,
       "anker": [
        273,
        142
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 467,
       "b": 578,
       "h": 465,
       "anker": [
        273,
        204
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 588,
       "h": 465,
       "anker": [
        283,
        204
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-steen6-baksteen-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      9
     ],
     "bestand": "bouwfasen/wit-steen6-baksteen-w.png",
     "fasen": [
      {
       "x": 487,
       "y": 460,
       "b": 591,
       "h": 238,
       "anker": [
        335,
        -21
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 460,
       "b": 485,
       "h": 383,
       "anker": [
        228,
        124
       ],
       "naam": "geraamte"
      },
      {
       "x": 1171,
       "y": 0,
       "b": 578,
       "h": 401,
       "anker": [
        305,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 591,
       "y": 0,
       "b": 578,
       "h": 458,
       "anker": [
        305,
        197
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 589,
       "h": 458,
       "anker": [
        305,
        197
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-boerderij1-riet-z": {
     "gebouw": "boerderij",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/wit-boerderij1-riet-z.png",
     "fasen": [
      {
       "x": 513,
       "y": 529,
       "b": 557,
       "h": 238,
       "anker": [
        271,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 529,
       "b": 511,
       "h": 403,
       "anker": [
        225,
        160
       ],
       "naam": "geraamte"
      },
      {
       "x": 1171,
       "y": 0,
       "b": 546,
       "h": 405,
       "anker": [
        241,
        160
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 592,
       "y": 0,
       "b": 577,
       "h": 527,
       "anker": [
        262,
        282
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 590,
       "h": 527,
       "anker": [
        265,
        282
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-boerderij1-riet-o": {
     "gebouw": "boerderij",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/wit-boerderij1-riet-o.png",
     "fasen": [
      {
       "x": 452,
       "y": 568,
       "b": 559,
       "h": 269,
       "anker": [
        335,
        26
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 568,
       "b": 450,
       "h": 434,
       "anker": [
        225,
        191
       ],
       "naam": "geraamte"
      },
      {
       "x": 1155,
       "y": 0,
       "b": 546,
       "h": 436,
       "anker": [
        305,
        191
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 586,
       "y": 0,
       "b": 567,
       "h": 566,
       "anker": [
        305,
        321
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 584,
       "h": 566,
       "anker": [
        305,
        321
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-boerderij1-riet-n": {
     "gebouw": "boerderij",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/wit-boerderij1-riet-n.png",
     "fasen": [
      {
       "x": 513,
       "y": 531,
       "b": 559,
       "h": 238,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 531,
       "b": 511,
       "h": 403,
       "anker": [
        222,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 1171,
       "y": 0,
       "b": 546,
       "h": 437,
       "anker": [
        241,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 592,
       "y": 0,
       "b": 577,
       "h": 529,
       "anker": [
        251,
        284
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 590,
       "h": 529,
       "anker": [
        261,
        284
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-boerderij1-riet-w": {
     "gebouw": "boerderij",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/wit-boerderij1-riet-w.png",
     "fasen": [
      {
       "x": 452,
       "y": 561,
       "b": 495,
       "h": 268,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 561,
       "b": 450,
       "h": 433,
       "anker": [
        289,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 1154,
       "y": 0,
       "b": 546,
       "h": 437,
       "anker": [
        305,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 585,
       "y": 0,
       "b": 567,
       "h": 559,
       "anker": [
        326,
        314
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 583,
       "h": 559,
       "anker": [
        342,
        314
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-boerderij1-leien-z": {
     "gebouw": "boerderij",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/wit-boerderij1-leien-z.png",
     "fasen": [
      {
       "x": 513,
       "y": 509,
       "b": 557,
       "h": 238,
       "anker": [
        271,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 509,
       "b": 511,
       "h": 383,
       "anker": [
        225,
        140
       ],
       "naam": "geraamte"
      },
      {
       "x": 1116,
       "y": 0,
       "b": 546,
       "h": 385,
       "anker": [
        241,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 564,
       "y": 0,
       "b": 550,
       "h": 507,
       "anker": [
        241,
        262
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 562,
       "h": 507,
       "anker": [
        250,
        262
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-boerderij1-leien-o": {
     "gebouw": "boerderij",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/wit-boerderij1-leien-o.png",
     "fasen": [
      {
       "x": 452,
       "y": 548,
       "b": 559,
       "h": 269,
       "anker": [
        335,
        26
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 548,
       "b": 450,
       "h": 414,
       "anker": [
        225,
        171
       ],
       "naam": "geraamte"
      },
      {
       "x": 1116,
       "y": 0,
       "b": 546,
       "h": 416,
       "anker": [
        305,
        171
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 568,
       "y": 0,
       "b": 546,
       "h": 546,
       "anker": [
        305,
        301
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 566,
       "h": 546,
       "anker": [
        305,
        301
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-boerderij1-leien-n": {
     "gebouw": "boerderij",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/wit-boerderij1-leien-n.png",
     "fasen": [
      {
       "x": 513,
       "y": 510,
       "b": 559,
       "h": 238,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 510,
       "b": 511,
       "h": 383,
       "anker": [
        222,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1116,
       "y": 0,
       "b": 546,
       "h": 417,
       "anker": [
        241,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 564,
       "y": 0,
       "b": 550,
       "h": 508,
       "anker": [
        245,
        263
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 562,
       "h": 508,
       "anker": [
        248,
        263
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-boerderij1-leien-w": {
     "gebouw": "boerderij",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/wit-boerderij1-leien-w.png",
     "fasen": [
      {
       "x": 452,
       "y": 541,
       "b": 495,
       "h": 268,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 541,
       "b": 450,
       "h": 413,
       "anker": [
        289,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1116,
       "y": 0,
       "b": 546,
       "h": 417,
       "anker": [
        305,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 568,
       "y": 0,
       "b": 546,
       "h": 539,
       "anker": [
        305,
        294
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 566,
       "h": 539,
       "anker": [
        325,
        294
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-boerderij1-pannen-z": {
     "gebouw": "boerderij",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/wit-boerderij1-pannen-z.png",
     "fasen": [
      {
       "x": 513,
       "y": 475,
       "b": 557,
       "h": 238,
       "anker": [
        271,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 475,
       "b": 511,
       "h": 383,
       "anker": [
        225,
        140
       ],
       "naam": "geraamte"
      },
      {
       "x": 1117,
       "y": 0,
       "b": 546,
       "h": 385,
       "anker": [
        241,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 564,
       "y": 0,
       "b": 551,
       "h": 473,
       "anker": [
        241,
        228
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 562,
       "h": 473,
       "anker": [
        250,
        228
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-boerderij1-pannen-o": {
     "gebouw": "boerderij",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/wit-boerderij1-pannen-o.png",
     "fasen": [
      {
       "x": 452,
       "y": 513,
       "b": 559,
       "h": 269,
       "anker": [
        335,
        26
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 513,
       "b": 450,
       "h": 414,
       "anker": [
        225,
        171
       ],
       "naam": "geraamte"
      },
      {
       "x": 1113,
       "y": 0,
       "b": 546,
       "h": 416,
       "anker": [
        305,
        171
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 565,
       "y": 0,
       "b": 546,
       "h": 511,
       "anker": [
        305,
        266
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 563,
       "h": 511,
       "anker": [
        305,
        266
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-boerderij1-pannen-n": {
     "gebouw": "boerderij",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/wit-boerderij1-pannen-n.png",
     "fasen": [
      {
       "x": 513,
       "y": 476,
       "b": 559,
       "h": 238,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 476,
       "b": 511,
       "h": 383,
       "anker": [
        222,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1117,
       "y": 0,
       "b": 546,
       "h": 417,
       "anker": [
        241,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 564,
       "y": 0,
       "b": 551,
       "h": 474,
       "anker": [
        246,
        229
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 562,
       "h": 474,
       "anker": [
        248,
        229
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-boerderij1-pannen-w": {
     "gebouw": "boerderij",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/wit-boerderij1-pannen-w.png",
     "fasen": [
      {
       "x": 452,
       "y": 507,
       "b": 495,
       "h": 268,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 507,
       "b": 450,
       "h": 413,
       "anker": [
        289,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1114,
       "y": 0,
       "b": 546,
       "h": 417,
       "anker": [
        305,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 566,
       "y": 0,
       "b": 546,
       "h": 505,
       "anker": [
        305,
        260
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 564,
       "h": 505,
       "anker": [
        323,
        260
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-boerderij4-riet-z": {
     "gebouw": "boerderij",
     "beslaat": [
      8,
      6
     ],
     "bestand": "bouwfasen/wit-boerderij4-riet-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 953,
       "b": 495,
       "h": 238,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 546,
       "b": 450,
       "h": 403,
       "anker": [
        193,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 546,
       "b": 482,
       "h": 405,
       "anker": [
        209,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 536,
       "y": 0,
       "b": 482,
       "h": 544,
       "anker": [
        209,
        331
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 534,
       "h": 544,
       "anker": [
        235,
        331
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-boerderij4-riet-o": {
     "gebouw": "boerderij",
     "beslaat": [
      6,
      8
     ],
     "bestand": "bouwfasen/wit-boerderij4-riet-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 964,
       "b": 495,
       "h": 238,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 557,
       "b": 450,
       "h": 403,
       "anker": [
        257,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 557,
       "b": 482,
       "h": 405,
       "anker": [
        273,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 536,
       "y": 0,
       "b": 482,
       "h": 555,
       "anker": [
        273,
        342
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 534,
       "h": 555,
       "anker": [
        299,
        342
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-boerderij4-riet-n": {
     "gebouw": "boerderij",
     "beslaat": [
      8,
      6
     ],
     "bestand": "bouwfasen/wit-boerderij4-riet-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 964,
       "b": 496,
       "h": 238,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 557,
       "b": 450,
       "h": 403,
       "anker": [
        193,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 557,
       "b": 482,
       "h": 405,
       "anker": [
        209,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 536,
       "y": 0,
       "b": 482,
       "h": 555,
       "anker": [
        209,
        342
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 534,
       "h": 555,
       "anker": [
        235,
        342
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-boerderij4-riet-w": {
     "gebouw": "boerderij",
     "beslaat": [
      6,
      8
     ],
     "bestand": "bouwfasen/wit-boerderij4-riet-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 953,
       "b": 495,
       "h": 238,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 546,
       "b": 450,
       "h": 403,
       "anker": [
        257,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 546,
       "b": 482,
       "h": 405,
       "anker": [
        273,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 536,
       "y": 0,
       "b": 482,
       "h": 544,
       "anker": [
        273,
        331
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 534,
       "h": 544,
       "anker": [
        299,
        331
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-boerderij4-leien-z": {
     "gebouw": "boerderij",
     "beslaat": [
      8,
      6
     ],
     "bestand": "bouwfasen/wit-boerderij4-leien-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 917,
       "b": 495,
       "h": 238,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 530,
       "b": 450,
       "h": 383,
       "anker": [
        193,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 530,
       "b": 482,
       "h": 385,
       "anker": [
        209,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 508,
       "y": 0,
       "b": 482,
       "h": 528,
       "anker": [
        209,
        315
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 506,
       "h": 528,
       "anker": [
        221,
        315
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-boerderij4-leien-o": {
     "gebouw": "boerderij",
     "beslaat": [
      6,
      8
     ],
     "bestand": "bouwfasen/wit-boerderij4-leien-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 927,
       "b": 495,
       "h": 238,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 540,
       "b": 450,
       "h": 383,
       "anker": [
        257,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 540,
       "b": 482,
       "h": 385,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 507,
       "y": 0,
       "b": 482,
       "h": 538,
       "anker": [
        273,
        325
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 505,
       "h": 538,
       "anker": [
        285,
        325
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-boerderij4-leien-n": {
     "gebouw": "boerderij",
     "beslaat": [
      8,
      6
     ],
     "bestand": "bouwfasen/wit-boerderij4-leien-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 927,
       "b": 496,
       "h": 238,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 540,
       "b": 450,
       "h": 383,
       "anker": [
        193,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 540,
       "b": 482,
       "h": 385,
       "anker": [
        209,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 507,
       "y": 0,
       "b": 482,
       "h": 538,
       "anker": [
        209,
        325
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 505,
       "h": 538,
       "anker": [
        220,
        325
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-boerderij4-leien-w": {
     "gebouw": "boerderij",
     "beslaat": [
      6,
      8
     ],
     "bestand": "bouwfasen/wit-boerderij4-leien-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 917,
       "b": 495,
       "h": 238,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 530,
       "b": 450,
       "h": 383,
       "anker": [
        257,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 530,
       "b": 482,
       "h": 385,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 508,
       "y": 0,
       "b": 482,
       "h": 528,
       "anker": [
        273,
        315
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 506,
       "h": 528,
       "anker": [
        285,
        315
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-boerderij4-pannen-z": {
     "gebouw": "boerderij",
     "beslaat": [
      8,
      6
     ],
     "bestand": "bouwfasen/wit-boerderij4-pannen-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 873,
       "b": 495,
       "h": 238,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 486,
       "b": 450,
       "h": 383,
       "anker": [
        193,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 486,
       "b": 482,
       "h": 385,
       "anker": [
        209,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 508,
       "y": 0,
       "b": 482,
       "h": 484,
       "anker": [
        209,
        271
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 506,
       "h": 484,
       "anker": [
        221,
        271
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-boerderij4-pannen-o": {
     "gebouw": "boerderij",
     "beslaat": [
      6,
      8
     ],
     "bestand": "bouwfasen/wit-boerderij4-pannen-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 883,
       "b": 495,
       "h": 238,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 496,
       "b": 450,
       "h": 383,
       "anker": [
        257,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 496,
       "b": 482,
       "h": 385,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 508,
       "y": 0,
       "b": 482,
       "h": 494,
       "anker": [
        273,
        281
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 506,
       "h": 494,
       "anker": [
        285,
        281
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-boerderij4-pannen-n": {
     "gebouw": "boerderij",
     "beslaat": [
      8,
      6
     ],
     "bestand": "bouwfasen/wit-boerderij4-pannen-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 883,
       "b": 496,
       "h": 238,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 496,
       "b": 450,
       "h": 383,
       "anker": [
        193,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 496,
       "b": 482,
       "h": 385,
       "anker": [
        209,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 508,
       "y": 0,
       "b": 482,
       "h": 494,
       "anker": [
        209,
        281
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 506,
       "h": 494,
       "anker": [
        221,
        281
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "wit-boerderij4-pannen-w": {
     "gebouw": "boerderij",
     "beslaat": [
      6,
      8
     ],
     "bestand": "bouwfasen/wit-boerderij4-pannen-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 873,
       "b": 495,
       "h": 238,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 486,
       "b": 450,
       "h": 383,
       "anker": [
        257,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 486,
       "b": 482,
       "h": 385,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 508,
       "y": 0,
       "b": 482,
       "h": 484,
       "anker": [
        273,
        271
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 506,
       "h": 484,
       "anker": [
        285,
        271
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis2-riet-z": {
     "gebouw": "huis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/oker-huis2-riet-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 990,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 559,
       "b": 386,
       "h": 427,
       "anker": [
        161,
        248
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 559,
       "b": 418,
       "h": 429,
       "anker": [
        177,
        248
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 469,
       "y": 0,
       "b": 450,
       "h": 557,
       "anker": [
        193,
        376
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 467,
       "h": 557,
       "anker": [
        201,
        376
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis2-riet-o": {
     "gebouw": "huis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/oker-huis2-riet-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 994,
       "b": 431,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 563,
       "b": 386,
       "h": 427,
       "anker": [
        225,
        248
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 563,
       "b": 418,
       "h": 429,
       "anker": [
        241,
        248
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 469,
       "y": 0,
       "b": 450,
       "h": 561,
       "anker": [
        257,
        380
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 467,
       "h": 561,
       "anker": [
        265,
        380
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis2-riet-n": {
     "gebouw": "huis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/oker-huis2-riet-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 994,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 563,
       "b": 386,
       "h": 427,
       "anker": [
        161,
        248
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 563,
       "b": 418,
       "h": 429,
       "anker": [
        177,
        248
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 469,
       "y": 0,
       "b": 450,
       "h": 561,
       "anker": [
        193,
        380
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 467,
       "h": 561,
       "anker": [
        202,
        380
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis2-riet-w": {
     "gebouw": "huis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/oker-huis2-riet-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 990,
       "b": 432,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 559,
       "b": 386,
       "h": 427,
       "anker": [
        225,
        248
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 559,
       "b": 418,
       "h": 429,
       "anker": [
        241,
        248
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 469,
       "y": 0,
       "b": 450,
       "h": 557,
       "anker": [
        257,
        376
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 467,
       "h": 557,
       "anker": [
        266,
        376
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis2-leien-z": {
     "gebouw": "huis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/oker-huis2-leien-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 952,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 541,
       "b": 386,
       "h": 407,
       "anker": [
        161,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 541,
       "b": 418,
       "h": 409,
       "anker": [
        177,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 439,
       "h": 539,
       "anker": [
        187,
        358
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 441,
       "y": 0,
       "b": 439,
       "h": 539,
       "anker": [
        187,
        358
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis2-leien-o": {
     "gebouw": "huis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/oker-huis2-leien-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 956,
       "b": 431,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 545,
       "b": 386,
       "h": 407,
       "anker": [
        225,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 545,
       "b": 418,
       "h": 409,
       "anker": [
        241,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 440,
       "h": 543,
       "anker": [
        252,
        362
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 442,
       "y": 0,
       "b": 440,
       "h": 543,
       "anker": [
        252,
        362
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis2-leien-n": {
     "gebouw": "huis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/oker-huis2-leien-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 956,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 545,
       "b": 386,
       "h": 407,
       "anker": [
        161,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 545,
       "b": 418,
       "h": 409,
       "anker": [
        177,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 440,
       "h": 543,
       "anker": [
        188,
        362
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 442,
       "y": 0,
       "b": 440,
       "h": 543,
       "anker": [
        188,
        362
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis2-leien-w": {
     "gebouw": "huis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/oker-huis2-leien-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 952,
       "b": 432,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 541,
       "b": 386,
       "h": 407,
       "anker": [
        225,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 541,
       "b": 418,
       "h": 409,
       "anker": [
        241,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 439,
       "h": 539,
       "anker": [
        252,
        358
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 441,
       "y": 0,
       "b": 439,
       "h": 539,
       "anker": [
        252,
        358
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis2-pannen-z": {
     "gebouw": "huis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/oker-huis2-pannen-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 914,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 503,
       "b": 386,
       "h": 407,
       "anker": [
        161,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 503,
       "b": 418,
       "h": 409,
       "anker": [
        177,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 440,
       "h": 501,
       "anker": [
        188,
        320
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 442,
       "y": 0,
       "b": 440,
       "h": 501,
       "anker": [
        188,
        320
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis2-pannen-o": {
     "gebouw": "huis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/oker-huis2-pannen-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 917,
       "b": 431,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 506,
       "b": 386,
       "h": 407,
       "anker": [
        225,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 506,
       "b": 418,
       "h": 409,
       "anker": [
        241,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 440,
       "h": 504,
       "anker": [
        252,
        323
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 442,
       "y": 0,
       "b": 440,
       "h": 504,
       "anker": [
        252,
        323
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis2-pannen-n": {
     "gebouw": "huis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/oker-huis2-pannen-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 917,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 506,
       "b": 386,
       "h": 407,
       "anker": [
        161,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 506,
       "b": 418,
       "h": 409,
       "anker": [
        177,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 440,
       "h": 504,
       "anker": [
        188,
        323
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 442,
       "y": 0,
       "b": 440,
       "h": 504,
       "anker": [
        188,
        323
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis2-pannen-w": {
     "gebouw": "huis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/oker-huis2-pannen-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 914,
       "b": 432,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 503,
       "b": 386,
       "h": 407,
       "anker": [
        225,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 503,
       "b": 418,
       "h": 409,
       "anker": [
        241,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 440,
       "h": 501,
       "anker": [
        252,
        320
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 442,
       "y": 0,
       "b": 440,
       "h": 501,
       "anker": [
        252,
        320
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen2-leien-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/oker-steen2-leien-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 952,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 541,
       "b": 386,
       "h": 407,
       "anker": [
        161,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 541,
       "b": 418,
       "h": 409,
       "anker": [
        177,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 439,
       "h": 539,
       "anker": [
        187,
        358
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 441,
       "y": 0,
       "b": 439,
       "h": 539,
       "anker": [
        187,
        358
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen2-leien-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/oker-steen2-leien-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 956,
       "b": 431,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 545,
       "b": 386,
       "h": 407,
       "anker": [
        225,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 545,
       "b": 418,
       "h": 409,
       "anker": [
        241,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 440,
       "h": 543,
       "anker": [
        252,
        362
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 442,
       "y": 0,
       "b": 440,
       "h": 543,
       "anker": [
        252,
        362
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen2-leien-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/oker-steen2-leien-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 956,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 545,
       "b": 386,
       "h": 407,
       "anker": [
        161,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 545,
       "b": 418,
       "h": 409,
       "anker": [
        177,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 440,
       "h": 543,
       "anker": [
        188,
        362
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 442,
       "y": 0,
       "b": 440,
       "h": 543,
       "anker": [
        188,
        362
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen2-leien-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/oker-steen2-leien-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 952,
       "b": 432,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 541,
       "b": 386,
       "h": 407,
       "anker": [
        225,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 541,
       "b": 418,
       "h": 409,
       "anker": [
        241,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 439,
       "h": 539,
       "anker": [
        252,
        358
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 441,
       "y": 0,
       "b": 439,
       "h": 539,
       "anker": [
        252,
        358
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen2-pannen-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/oker-steen2-pannen-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 914,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 503,
       "b": 386,
       "h": 407,
       "anker": [
        161,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 503,
       "b": 418,
       "h": 409,
       "anker": [
        177,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 440,
       "h": 501,
       "anker": [
        188,
        320
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 442,
       "y": 0,
       "b": 440,
       "h": 501,
       "anker": [
        188,
        320
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen2-pannen-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/oker-steen2-pannen-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 917,
       "b": 431,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 506,
       "b": 386,
       "h": 407,
       "anker": [
        225,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 506,
       "b": 418,
       "h": 409,
       "anker": [
        241,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 440,
       "h": 504,
       "anker": [
        252,
        323
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 442,
       "y": 0,
       "b": 440,
       "h": 504,
       "anker": [
        252,
        323
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen2-pannen-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/oker-steen2-pannen-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 917,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 506,
       "b": 386,
       "h": 407,
       "anker": [
        161,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 506,
       "b": 418,
       "h": 409,
       "anker": [
        177,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 440,
       "h": 504,
       "anker": [
        188,
        323
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 442,
       "y": 0,
       "b": 440,
       "h": 504,
       "anker": [
        188,
        323
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen2-pannen-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/oker-steen2-pannen-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 914,
       "b": 432,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 503,
       "b": 386,
       "h": 407,
       "anker": [
        225,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 503,
       "b": 418,
       "h": 409,
       "anker": [
        241,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 440,
       "h": 501,
       "anker": [
        252,
        320
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 442,
       "y": 0,
       "b": 440,
       "h": 501,
       "anker": [
        252,
        320
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen2-baksteen-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/oker-steen2-baksteen-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 914,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 503,
       "b": 386,
       "h": 407,
       "anker": [
        161,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 503,
       "b": 418,
       "h": 409,
       "anker": [
        177,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 440,
       "h": 501,
       "anker": [
        188,
        320
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 442,
       "y": 0,
       "b": 440,
       "h": 501,
       "anker": [
        188,
        320
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen2-baksteen-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/oker-steen2-baksteen-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 917,
       "b": 431,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 506,
       "b": 386,
       "h": 407,
       "anker": [
        225,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 506,
       "b": 418,
       "h": 409,
       "anker": [
        241,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 440,
       "h": 504,
       "anker": [
        252,
        323
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 442,
       "y": 0,
       "b": 440,
       "h": 504,
       "anker": [
        252,
        323
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen2-baksteen-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/oker-steen2-baksteen-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 917,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 506,
       "b": 386,
       "h": 407,
       "anker": [
        161,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 506,
       "b": 418,
       "h": 409,
       "anker": [
        177,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 440,
       "h": 504,
       "anker": [
        188,
        323
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 442,
       "y": 0,
       "b": 440,
       "h": 504,
       "anker": [
        188,
        323
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen2-baksteen-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/oker-steen2-baksteen-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 914,
       "b": 432,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 503,
       "b": 386,
       "h": 407,
       "anker": [
        225,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 503,
       "b": 418,
       "h": 409,
       "anker": [
        241,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 440,
       "h": 501,
       "anker": [
        252,
        320
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 442,
       "y": 0,
       "b": 440,
       "h": 501,
       "anker": [
        252,
        320
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis4-riet-z": {
     "gebouw": "huis",
     "beslaat": [
      8,
      8
     ],
     "bestand": "bouwfasen/oker-huis4-riet-z.png",
     "fasen": [
      {
       "x": 420,
       "y": 561,
       "b": 464,
       "h": 272,
       "anker": [
        303,
        29
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 561,
       "b": 418,
       "h": 437,
       "anker": [
        257,
        194
       ],
       "naam": "geraamte"
      },
      {
       "x": 1128,
       "y": 0,
       "b": 546,
       "h": 439,
       "anker": [
        273,
        194
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 580,
       "y": 0,
       "b": 546,
       "h": 559,
       "anker": [
        273,
        314
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 578,
       "h": 559,
       "anker": [
        305,
        314
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis4-riet-o": {
     "gebouw": "huis",
     "beslaat": [
      8,
      8
     ],
     "bestand": "bouwfasen/oker-huis4-riet-o.png",
     "fasen": [
      {
       "x": 520,
       "y": 503,
       "b": 559,
       "h": 222,
       "anker": [
        303,
        -21
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 503,
       "b": 518,
       "h": 387,
       "anker": [
        261,
        144
       ],
       "naam": "geraamte"
      },
      {
       "x": 1149,
       "y": 0,
       "b": 546,
       "h": 398,
       "anker": [
        273,
        153
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 601,
       "y": 0,
       "b": 546,
       "h": 501,
       "anker": [
        273,
        256
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 599,
       "h": 501,
       "anker": [
        301,
        256
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis4-riet-n": {
     "gebouw": "huis",
     "beslaat": [
      8,
      8
     ],
     "bestand": "bouwfasen/oker-huis4-riet-n.png",
     "fasen": [
      {
       "x": 420,
       "y": 551,
       "b": 559,
       "h": 272,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 551,
       "b": 418,
       "h": 437,
       "anker": [
        161,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 1128,
       "y": 0,
       "b": 546,
       "h": 437,
       "anker": [
        273,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 580,
       "y": 0,
       "b": 546,
       "h": 549,
       "anker": [
        273,
        304
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 578,
       "h": 549,
       "anker": [
        273,
        304
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis4-riet-w": {
     "gebouw": "huis",
     "beslaat": [
      8,
      8
     ],
     "bestand": "bouwfasen/oker-huis4-riet-w.png",
     "fasen": [
      {
       "x": 520,
       "y": 521,
       "b": 563,
       "h": 222,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 521,
       "b": 518,
       "h": 387,
       "anker": [
        257,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 1149,
       "y": 0,
       "b": 546,
       "h": 437,
       "anker": [
        273,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 601,
       "y": 0,
       "b": 546,
       "h": 519,
       "anker": [
        273,
        274
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 599,
       "h": 519,
       "anker": [
        298,
        274
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis4-leien-z": {
     "gebouw": "huis",
     "beslaat": [
      8,
      8
     ],
     "bestand": "bouwfasen/oker-huis4-leien-z.png",
     "fasen": [
      {
       "x": 420,
       "y": 541,
       "b": 464,
       "h": 272,
       "anker": [
        303,
        29
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 541,
       "b": 418,
       "h": 417,
       "anker": [
        257,
        174
       ],
       "naam": "geraamte"
      },
      {
       "x": 1110,
       "y": 0,
       "b": 546,
       "h": 419,
       "anker": [
        273,
        174
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 562,
       "y": 0,
       "b": 546,
       "h": 539,
       "anker": [
        273,
        294
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 560,
       "h": 539,
       "anker": [
        287,
        294
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis4-leien-o": {
     "gebouw": "huis",
     "beslaat": [
      8,
      8
     ],
     "bestand": "bouwfasen/oker-huis4-leien-o.png",
     "fasen": [
      {
       "x": 520,
       "y": 483,
       "b": 559,
       "h": 222,
       "anker": [
        303,
        -21
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 483,
       "b": 518,
       "h": 367,
       "anker": [
        261,
        124
       ],
       "naam": "geraamte"
      },
      {
       "x": 1121,
       "y": 0,
       "b": 546,
       "h": 385,
       "anker": [
        273,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 573,
       "y": 0,
       "b": 546,
       "h": 481,
       "anker": [
        273,
        236
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 571,
       "h": 481,
       "anker": [
        287,
        236
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis4-leien-n": {
     "gebouw": "huis",
     "beslaat": [
      8,
      8
     ],
     "bestand": "bouwfasen/oker-huis4-leien-n.png",
     "fasen": [
      {
       "x": 420,
       "y": 531,
       "b": 559,
       "h": 272,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 531,
       "b": 418,
       "h": 417,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1110,
       "y": 0,
       "b": 546,
       "h": 417,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 562,
       "y": 0,
       "b": 546,
       "h": 529,
       "anker": [
        273,
        284
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 560,
       "h": 529,
       "anker": [
        273,
        284
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis4-leien-w": {
     "gebouw": "huis",
     "beslaat": [
      8,
      8
     ],
     "bestand": "bouwfasen/oker-huis4-leien-w.png",
     "fasen": [
      {
       "x": 520,
       "y": 500,
       "b": 563,
       "h": 222,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 500,
       "b": 518,
       "h": 367,
       "anker": [
        257,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1121,
       "y": 0,
       "b": 546,
       "h": 417,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 573,
       "y": 0,
       "b": 546,
       "h": 498,
       "anker": [
        273,
        253
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 571,
       "h": 498,
       "anker": [
        284,
        253
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis4-pannen-z": {
     "gebouw": "huis",
     "beslaat": [
      8,
      8
     ],
     "bestand": "bouwfasen/oker-huis4-pannen-z.png",
     "fasen": [
      {
       "x": 420,
       "y": 508,
       "b": 464,
       "h": 272,
       "anker": [
        303,
        29
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 508,
       "b": 418,
       "h": 417,
       "anker": [
        257,
        174
       ],
       "naam": "geraamte"
      },
      {
       "x": 1110,
       "y": 0,
       "b": 546,
       "h": 419,
       "anker": [
        273,
        174
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 562,
       "y": 0,
       "b": 546,
       "h": 506,
       "anker": [
        273,
        261
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 560,
       "h": 506,
       "anker": [
        287,
        261
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis4-pannen-o": {
     "gebouw": "huis",
     "beslaat": [
      8,
      8
     ],
     "bestand": "bouwfasen/oker-huis4-pannen-o.png",
     "fasen": [
      {
       "x": 520,
       "y": 450,
       "b": 559,
       "h": 222,
       "anker": [
        303,
        -21
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 450,
       "b": 518,
       "h": 367,
       "anker": [
        261,
        124
       ],
       "naam": "geraamte"
      },
      {
       "x": 1121,
       "y": 0,
       "b": 546,
       "h": 385,
       "anker": [
        273,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 573,
       "y": 0,
       "b": 546,
       "h": 448,
       "anker": [
        273,
        203
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 571,
       "h": 448,
       "anker": [
        287,
        203
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis4-pannen-n": {
     "gebouw": "huis",
     "beslaat": [
      8,
      8
     ],
     "bestand": "bouwfasen/oker-huis4-pannen-n.png",
     "fasen": [
      {
       "x": 420,
       "y": 498,
       "b": 559,
       "h": 272,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 498,
       "b": 418,
       "h": 417,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1111,
       "y": 0,
       "b": 546,
       "h": 417,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 563,
       "y": 0,
       "b": 546,
       "h": 496,
       "anker": [
        273,
        251
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 561,
       "h": 496,
       "anker": [
        273,
        251
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis4-pannen-w": {
     "gebouw": "huis",
     "beslaat": [
      8,
      8
     ],
     "bestand": "bouwfasen/oker-huis4-pannen-w.png",
     "fasen": [
      {
       "x": 520,
       "y": 466,
       "b": 563,
       "h": 222,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 466,
       "b": 518,
       "h": 367,
       "anker": [
        257,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1121,
       "y": 0,
       "b": 546,
       "h": 417,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 573,
       "y": 0,
       "b": 546,
       "h": 464,
       "anker": [
        273,
        219
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 571,
       "h": 464,
       "anker": [
        284,
        219
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen4-leien-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      8
     ],
     "bestand": "bouwfasen/oker-steen4-leien-z.png",
     "fasen": [
      {
       "x": 420,
       "y": 541,
       "b": 464,
       "h": 272,
       "anker": [
        303,
        29
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 541,
       "b": 418,
       "h": 417,
       "anker": [
        257,
        174
       ],
       "naam": "geraamte"
      },
      {
       "x": 1110,
       "y": 0,
       "b": 546,
       "h": 419,
       "anker": [
        273,
        174
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 562,
       "y": 0,
       "b": 546,
       "h": 539,
       "anker": [
        273,
        294
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 560,
       "h": 539,
       "anker": [
        287,
        294
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen4-leien-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      8
     ],
     "bestand": "bouwfasen/oker-steen4-leien-o.png",
     "fasen": [
      {
       "x": 520,
       "y": 483,
       "b": 559,
       "h": 222,
       "anker": [
        303,
        -21
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 483,
       "b": 518,
       "h": 367,
       "anker": [
        261,
        124
       ],
       "naam": "geraamte"
      },
      {
       "x": 1121,
       "y": 0,
       "b": 546,
       "h": 385,
       "anker": [
        273,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 573,
       "y": 0,
       "b": 546,
       "h": 481,
       "anker": [
        273,
        236
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 571,
       "h": 481,
       "anker": [
        287,
        236
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen4-leien-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      8
     ],
     "bestand": "bouwfasen/oker-steen4-leien-n.png",
     "fasen": [
      {
       "x": 420,
       "y": 531,
       "b": 559,
       "h": 272,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 531,
       "b": 418,
       "h": 417,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1110,
       "y": 0,
       "b": 546,
       "h": 417,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 562,
       "y": 0,
       "b": 546,
       "h": 529,
       "anker": [
        273,
        284
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 560,
       "h": 529,
       "anker": [
        273,
        284
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen4-leien-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      8
     ],
     "bestand": "bouwfasen/oker-steen4-leien-w.png",
     "fasen": [
      {
       "x": 520,
       "y": 500,
       "b": 563,
       "h": 222,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 500,
       "b": 518,
       "h": 367,
       "anker": [
        257,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1121,
       "y": 0,
       "b": 546,
       "h": 417,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 573,
       "y": 0,
       "b": 546,
       "h": 498,
       "anker": [
        273,
        253
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 571,
       "h": 498,
       "anker": [
        284,
        253
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen4-pannen-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      8
     ],
     "bestand": "bouwfasen/oker-steen4-pannen-z.png",
     "fasen": [
      {
       "x": 420,
       "y": 508,
       "b": 464,
       "h": 272,
       "anker": [
        303,
        29
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 508,
       "b": 418,
       "h": 417,
       "anker": [
        257,
        174
       ],
       "naam": "geraamte"
      },
      {
       "x": 1110,
       "y": 0,
       "b": 546,
       "h": 419,
       "anker": [
        273,
        174
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 562,
       "y": 0,
       "b": 546,
       "h": 506,
       "anker": [
        273,
        261
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 560,
       "h": 506,
       "anker": [
        287,
        261
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen4-pannen-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      8
     ],
     "bestand": "bouwfasen/oker-steen4-pannen-o.png",
     "fasen": [
      {
       "x": 520,
       "y": 450,
       "b": 559,
       "h": 222,
       "anker": [
        303,
        -21
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 450,
       "b": 518,
       "h": 367,
       "anker": [
        261,
        124
       ],
       "naam": "geraamte"
      },
      {
       "x": 1121,
       "y": 0,
       "b": 546,
       "h": 385,
       "anker": [
        273,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 573,
       "y": 0,
       "b": 546,
       "h": 448,
       "anker": [
        273,
        203
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 571,
       "h": 448,
       "anker": [
        287,
        203
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen4-pannen-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      8
     ],
     "bestand": "bouwfasen/oker-steen4-pannen-n.png",
     "fasen": [
      {
       "x": 420,
       "y": 498,
       "b": 559,
       "h": 272,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 498,
       "b": 418,
       "h": 417,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1111,
       "y": 0,
       "b": 546,
       "h": 417,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 563,
       "y": 0,
       "b": 546,
       "h": 496,
       "anker": [
        273,
        251
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 561,
       "h": 496,
       "anker": [
        273,
        251
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen4-pannen-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      8
     ],
     "bestand": "bouwfasen/oker-steen4-pannen-w.png",
     "fasen": [
      {
       "x": 520,
       "y": 466,
       "b": 563,
       "h": 222,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 466,
       "b": 518,
       "h": 367,
       "anker": [
        257,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1121,
       "y": 0,
       "b": 546,
       "h": 417,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 573,
       "y": 0,
       "b": 546,
       "h": 464,
       "anker": [
        273,
        219
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 571,
       "h": 464,
       "anker": [
        284,
        219
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen4-baksteen-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      8
     ],
     "bestand": "bouwfasen/oker-steen4-baksteen-z.png",
     "fasen": [
      {
       "x": 420,
       "y": 508,
       "b": 464,
       "h": 272,
       "anker": [
        303,
        29
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 508,
       "b": 418,
       "h": 417,
       "anker": [
        257,
        174
       ],
       "naam": "geraamte"
      },
      {
       "x": 1110,
       "y": 0,
       "b": 546,
       "h": 419,
       "anker": [
        273,
        174
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 562,
       "y": 0,
       "b": 546,
       "h": 506,
       "anker": [
        273,
        261
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 560,
       "h": 506,
       "anker": [
        287,
        261
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen4-baksteen-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      8
     ],
     "bestand": "bouwfasen/oker-steen4-baksteen-o.png",
     "fasen": [
      {
       "x": 520,
       "y": 450,
       "b": 559,
       "h": 222,
       "anker": [
        303,
        -21
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 450,
       "b": 518,
       "h": 367,
       "anker": [
        261,
        124
       ],
       "naam": "geraamte"
      },
      {
       "x": 1121,
       "y": 0,
       "b": 546,
       "h": 385,
       "anker": [
        273,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 573,
       "y": 0,
       "b": 546,
       "h": 448,
       "anker": [
        273,
        203
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 571,
       "h": 448,
       "anker": [
        287,
        203
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen4-baksteen-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      8
     ],
     "bestand": "bouwfasen/oker-steen4-baksteen-n.png",
     "fasen": [
      {
       "x": 420,
       "y": 498,
       "b": 559,
       "h": 272,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 498,
       "b": 418,
       "h": 417,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1111,
       "y": 0,
       "b": 546,
       "h": 417,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 563,
       "y": 0,
       "b": 546,
       "h": 496,
       "anker": [
        273,
        251
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 561,
       "h": 496,
       "anker": [
        273,
        251
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen4-baksteen-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      8
     ],
     "bestand": "bouwfasen/oker-steen4-baksteen-w.png",
     "fasen": [
      {
       "x": 520,
       "y": 466,
       "b": 563,
       "h": 222,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 466,
       "b": 518,
       "h": 367,
       "anker": [
        257,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1121,
       "y": 0,
       "b": 546,
       "h": 417,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 573,
       "y": 0,
       "b": 546,
       "h": 464,
       "anker": [
        273,
        219
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 571,
       "h": 464,
       "anker": [
        284,
        219
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis5-riet-z": {
     "gebouw": "huis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/oker-huis5-riet-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 976,
       "b": 399,
       "h": 190,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 545,
       "b": 354,
       "h": 411,
       "anker": [
        161,
        248
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 545,
       "b": 418,
       "h": 429,
       "anker": [
        177,
        248
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 442,
       "y": 0,
       "b": 418,
       "h": 543,
       "anker": [
        177,
        362
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 440,
       "h": 543,
       "anker": [
        199,
        362
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis5-riet-o": {
     "gebouw": "huis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/oker-huis5-riet-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 937,
       "b": 399,
       "h": 190,
       "anker": [
        271,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 522,
       "b": 354,
       "h": 411,
       "anker": [
        225,
        232
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 522,
       "b": 418,
       "h": 413,
       "anker": [
        241,
        232
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 442,
       "y": 0,
       "b": 418,
       "h": 520,
       "anker": [
        241,
        339
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 440,
       "h": 520,
       "anker": [
        263,
        339
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis5-riet-n": {
     "gebouw": "huis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/oker-huis5-riet-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 937,
       "b": 431,
       "h": 190,
       "anker": [
        207,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 522,
       "b": 354,
       "h": 411,
       "anker": [
        129,
        232
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 522,
       "b": 418,
       "h": 413,
       "anker": [
        177,
        232
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 442,
       "y": 0,
       "b": 418,
       "h": 520,
       "anker": [
        177,
        339
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 440,
       "h": 520,
       "anker": [
        177,
        339
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis5-riet-w": {
     "gebouw": "huis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/oker-huis5-riet-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 976,
       "b": 432,
       "h": 193,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 545,
       "b": 354,
       "h": 411,
       "anker": [
        193,
        248
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 545,
       "b": 418,
       "h": 429,
       "anker": [
        241,
        248
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 442,
       "y": 0,
       "b": 418,
       "h": 543,
       "anker": [
        241,
        362
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 440,
       "h": 543,
       "anker": [
        241,
        362
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis5-leien-z": {
     "gebouw": "huis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/oker-huis5-leien-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 936,
       "b": 399,
       "h": 190,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 525,
       "b": 354,
       "h": 391,
       "anker": [
        161,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 525,
       "b": 418,
       "h": 409,
       "anker": [
        177,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 428,
       "y": 0,
       "b": 418,
       "h": 523,
       "anker": [
        177,
        342
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 426,
       "h": 523,
       "anker": [
        185,
        342
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis5-leien-o": {
     "gebouw": "huis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/oker-huis5-leien-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 897,
       "b": 399,
       "h": 190,
       "anker": [
        271,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 502,
       "b": 354,
       "h": 391,
       "anker": [
        225,
        212
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 502,
       "b": 418,
       "h": 393,
       "anker": [
        241,
        212
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 428,
       "y": 0,
       "b": 418,
       "h": 500,
       "anker": [
        241,
        319
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 426,
       "h": 500,
       "anker": [
        249,
        319
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis5-leien-n": {
     "gebouw": "huis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/oker-huis5-leien-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 897,
       "b": 431,
       "h": 190,
       "anker": [
        207,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 502,
       "b": 354,
       "h": 391,
       "anker": [
        129,
        212
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 502,
       "b": 418,
       "h": 393,
       "anker": [
        177,
        212
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 428,
       "y": 0,
       "b": 418,
       "h": 500,
       "anker": [
        177,
        319
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 426,
       "h": 500,
       "anker": [
        177,
        319
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis5-leien-w": {
     "gebouw": "huis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/oker-huis5-leien-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 936,
       "b": 432,
       "h": 193,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 525,
       "b": 354,
       "h": 391,
       "anker": [
        193,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 525,
       "b": 418,
       "h": 409,
       "anker": [
        241,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 428,
       "y": 0,
       "b": 418,
       "h": 523,
       "anker": [
        241,
        342
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 426,
       "h": 523,
       "anker": [
        241,
        342
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis5-pannen-z": {
     "gebouw": "huis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/oker-huis5-pannen-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 904,
       "b": 399,
       "h": 190,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 493,
       "b": 354,
       "h": 391,
       "anker": [
        161,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 493,
       "b": 418,
       "h": 409,
       "anker": [
        177,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 428,
       "y": 0,
       "b": 418,
       "h": 491,
       "anker": [
        177,
        310
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 426,
       "h": 491,
       "anker": [
        185,
        310
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis5-pannen-o": {
     "gebouw": "huis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/oker-huis5-pannen-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 864,
       "b": 399,
       "h": 190,
       "anker": [
        271,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 469,
       "b": 354,
       "h": 391,
       "anker": [
        225,
        212
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 469,
       "b": 418,
       "h": 393,
       "anker": [
        241,
        212
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 428,
       "y": 0,
       "b": 418,
       "h": 467,
       "anker": [
        241,
        286
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 426,
       "h": 467,
       "anker": [
        249,
        286
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis5-pannen-n": {
     "gebouw": "huis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/oker-huis5-pannen-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 864,
       "b": 431,
       "h": 190,
       "anker": [
        207,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 469,
       "b": 354,
       "h": 391,
       "anker": [
        129,
        212
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 469,
       "b": 418,
       "h": 393,
       "anker": [
        177,
        212
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 428,
       "y": 0,
       "b": 418,
       "h": 467,
       "anker": [
        177,
        286
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 426,
       "h": 467,
       "anker": [
        177,
        286
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-huis5-pannen-w": {
     "gebouw": "huis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/oker-huis5-pannen-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 904,
       "b": 432,
       "h": 193,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 493,
       "b": 354,
       "h": 391,
       "anker": [
        193,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 493,
       "b": 418,
       "h": 409,
       "anker": [
        241,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 428,
       "y": 0,
       "b": 418,
       "h": 491,
       "anker": [
        241,
        310
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 426,
       "h": 491,
       "anker": [
        241,
        310
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen5-leien-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/oker-steen5-leien-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 936,
       "b": 399,
       "h": 190,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 525,
       "b": 354,
       "h": 391,
       "anker": [
        161,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 525,
       "b": 418,
       "h": 409,
       "anker": [
        177,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 428,
       "y": 0,
       "b": 418,
       "h": 523,
       "anker": [
        177,
        342
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 426,
       "h": 523,
       "anker": [
        185,
        342
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen5-leien-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/oker-steen5-leien-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 897,
       "b": 399,
       "h": 190,
       "anker": [
        271,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 502,
       "b": 354,
       "h": 391,
       "anker": [
        225,
        212
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 502,
       "b": 418,
       "h": 393,
       "anker": [
        241,
        212
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 428,
       "y": 0,
       "b": 418,
       "h": 500,
       "anker": [
        241,
        319
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 426,
       "h": 500,
       "anker": [
        249,
        319
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen5-leien-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/oker-steen5-leien-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 897,
       "b": 431,
       "h": 190,
       "anker": [
        207,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 502,
       "b": 354,
       "h": 391,
       "anker": [
        129,
        212
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 502,
       "b": 418,
       "h": 393,
       "anker": [
        177,
        212
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 428,
       "y": 0,
       "b": 418,
       "h": 500,
       "anker": [
        177,
        319
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 426,
       "h": 500,
       "anker": [
        177,
        319
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen5-leien-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/oker-steen5-leien-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 936,
       "b": 432,
       "h": 193,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 525,
       "b": 354,
       "h": 391,
       "anker": [
        193,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 525,
       "b": 418,
       "h": 409,
       "anker": [
        241,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 428,
       "y": 0,
       "b": 418,
       "h": 523,
       "anker": [
        241,
        342
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 426,
       "h": 523,
       "anker": [
        241,
        342
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen5-pannen-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/oker-steen5-pannen-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 904,
       "b": 399,
       "h": 190,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 493,
       "b": 354,
       "h": 391,
       "anker": [
        161,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 493,
       "b": 418,
       "h": 409,
       "anker": [
        177,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 428,
       "y": 0,
       "b": 418,
       "h": 491,
       "anker": [
        177,
        310
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 426,
       "h": 491,
       "anker": [
        185,
        310
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen5-pannen-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/oker-steen5-pannen-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 864,
       "b": 399,
       "h": 190,
       "anker": [
        271,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 469,
       "b": 354,
       "h": 391,
       "anker": [
        225,
        212
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 469,
       "b": 418,
       "h": 393,
       "anker": [
        241,
        212
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 428,
       "y": 0,
       "b": 418,
       "h": 467,
       "anker": [
        241,
        286
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 426,
       "h": 467,
       "anker": [
        249,
        286
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen5-pannen-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/oker-steen5-pannen-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 864,
       "b": 431,
       "h": 190,
       "anker": [
        207,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 469,
       "b": 354,
       "h": 391,
       "anker": [
        129,
        212
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 469,
       "b": 418,
       "h": 393,
       "anker": [
        177,
        212
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 428,
       "y": 0,
       "b": 418,
       "h": 467,
       "anker": [
        177,
        286
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 426,
       "h": 467,
       "anker": [
        177,
        286
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen5-pannen-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/oker-steen5-pannen-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 904,
       "b": 432,
       "h": 193,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 493,
       "b": 354,
       "h": 391,
       "anker": [
        193,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 493,
       "b": 418,
       "h": 409,
       "anker": [
        241,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 428,
       "y": 0,
       "b": 418,
       "h": 491,
       "anker": [
        241,
        310
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 426,
       "h": 491,
       "anker": [
        241,
        310
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen5-baksteen-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/oker-steen5-baksteen-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 904,
       "b": 399,
       "h": 190,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 493,
       "b": 354,
       "h": 391,
       "anker": [
        161,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 493,
       "b": 418,
       "h": 409,
       "anker": [
        177,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 428,
       "y": 0,
       "b": 418,
       "h": 491,
       "anker": [
        177,
        310
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 426,
       "h": 491,
       "anker": [
        185,
        310
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen5-baksteen-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/oker-steen5-baksteen-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 864,
       "b": 399,
       "h": 190,
       "anker": [
        271,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 469,
       "b": 354,
       "h": 391,
       "anker": [
        225,
        212
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 469,
       "b": 418,
       "h": 393,
       "anker": [
        241,
        212
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 428,
       "y": 0,
       "b": 418,
       "h": 467,
       "anker": [
        241,
        286
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 426,
       "h": 467,
       "anker": [
        249,
        286
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen5-baksteen-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/oker-steen5-baksteen-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 864,
       "b": 431,
       "h": 190,
       "anker": [
        207,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 469,
       "b": 354,
       "h": 391,
       "anker": [
        129,
        212
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 469,
       "b": 418,
       "h": 393,
       "anker": [
        177,
        212
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 428,
       "y": 0,
       "b": 418,
       "h": 467,
       "anker": [
        177,
        286
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 426,
       "h": 467,
       "anker": [
        177,
        286
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-steen5-baksteen-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/oker-steen5-baksteen-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 904,
       "b": 432,
       "h": 193,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 493,
       "b": 354,
       "h": 391,
       "anker": [
        193,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 493,
       "b": 418,
       "h": 409,
       "anker": [
        241,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 428,
       "y": 0,
       "b": 418,
       "h": 491,
       "anker": [
        241,
        310
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 426,
       "h": 491,
       "anker": [
        241,
        310
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-boerderij6-riet-z": {
     "gebouw": "boerderij",
     "beslaat": [
      10,
      8
     ],
     "bestand": "bouwfasen/oker-boerderij6-riet-z.png",
     "fasen": [
      {
       "x": 503,
       "y": 571,
       "b": 623,
       "h": 254,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 571,
       "b": 501,
       "h": 419,
       "anker": [
        180,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 1254,
       "y": 0,
       "b": 610,
       "h": 469,
       "anker": [
        273,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 635,
       "y": 0,
       "b": 617,
       "h": 569,
       "anker": [
        273,
        292
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 633,
       "h": 569,
       "anker": [
        273,
        292
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-boerderij6-riet-o": {
     "gebouw": "boerderij",
     "beslaat": [
      8,
      10
     ],
     "bestand": "bouwfasen/oker-boerderij6-riet-o.png",
     "fasen": [
      {
       "x": 484,
       "y": 578,
       "b": 528,
       "h": 264,
       "anker": [
        367,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 578,
       "b": 482,
       "h": 429,
       "anker": [
        321,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 1256,
       "y": 0,
       "b": 610,
       "h": 469,
       "anker": [
        337,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 637,
       "y": 0,
       "b": 617,
       "h": 576,
       "anker": [
        344,
        299
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 635,
       "h": 576,
       "anker": [
        362,
        299
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-boerderij6-riet-n": {
     "gebouw": "boerderij",
     "beslaat": [
      10,
      8
     ],
     "bestand": "bouwfasen/oker-boerderij6-riet-n.png",
     "fasen": [
      {
       "x": 503,
       "y": 530,
       "b": 547,
       "h": 254,
       "anker": [
        303,
        -21
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 530,
       "b": 501,
       "h": 419,
       "anker": [
        257,
        144
       ],
       "naam": "geraamte"
      },
      {
       "x": 1254,
       "y": 0,
       "b": 610,
       "h": 430,
       "anker": [
        273,
        153
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 635,
       "y": 0,
       "b": 617,
       "h": 528,
       "anker": [
        280,
        251
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 633,
       "h": 528,
       "anker": [
        296,
        251
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-boerderij6-riet-w": {
     "gebouw": "boerderij",
     "beslaat": [
      8,
      10
     ],
     "bestand": "bouwfasen/oker-boerderij6-riet-w.png",
     "fasen": [
      {
       "x": 484,
       "y": 523,
       "b": 623,
       "h": 264,
       "anker": [
        367,
        -11
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 523,
       "b": 482,
       "h": 429,
       "anker": [
        225,
        154
       ],
       "naam": "geraamte"
      },
      {
       "x": 1256,
       "y": 0,
       "b": 610,
       "h": 431,
       "anker": [
        337,
        154
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 637,
       "y": 0,
       "b": 617,
       "h": 521,
       "anker": [
        337,
        244
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 635,
       "h": 521,
       "anker": [
        337,
        244
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-boerderij6-leien-z": {
     "gebouw": "boerderij",
     "beslaat": [
      10,
      8
     ],
     "bestand": "bouwfasen/oker-boerderij6-leien-z.png",
     "fasen": [
      {
       "x": 503,
       "y": 550,
       "b": 623,
       "h": 254,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 550,
       "b": 501,
       "h": 399,
       "anker": [
        180,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1234,
       "y": 0,
       "b": 610,
       "h": 449,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 621,
       "y": 0,
       "b": 611,
       "h": 548,
       "anker": [
        273,
        271
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 619,
       "h": 548,
       "anker": [
        273,
        271
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-boerderij6-leien-o": {
     "gebouw": "boerderij",
     "beslaat": [
      8,
      10
     ],
     "bestand": "bouwfasen/oker-boerderij6-leien-o.png",
     "fasen": [
      {
       "x": 484,
       "y": 558,
       "b": 528,
       "h": 264,
       "anker": [
        367,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 558,
       "b": 482,
       "h": 409,
       "anker": [
        321,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1238,
       "y": 0,
       "b": 610,
       "h": 449,
       "anker": [
        337,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 623,
       "y": 0,
       "b": 613,
       "h": 556,
       "anker": [
        340,
        279
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 621,
       "h": 556,
       "anker": [
        348,
        279
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-boerderij6-leien-n": {
     "gebouw": "boerderij",
     "beslaat": [
      10,
      8
     ],
     "bestand": "bouwfasen/oker-boerderij6-leien-n.png",
     "fasen": [
      {
       "x": 503,
       "y": 509,
       "b": 547,
       "h": 254,
       "anker": [
        303,
        -21
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 509,
       "b": 501,
       "h": 399,
       "anker": [
        257,
        124
       ],
       "naam": "geraamte"
      },
      {
       "x": 1234,
       "y": 0,
       "b": 610,
       "h": 417,
       "anker": [
        273,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 621,
       "y": 0,
       "b": 611,
       "h": 507,
       "anker": [
        274,
        230
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 619,
       "h": 507,
       "anker": [
        282,
        230
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-boerderij6-leien-w": {
     "gebouw": "boerderij",
     "beslaat": [
      8,
      10
     ],
     "bestand": "bouwfasen/oker-boerderij6-leien-w.png",
     "fasen": [
      {
       "x": 484,
       "y": 502,
       "b": 623,
       "h": 264,
       "anker": [
        367,
        -11
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 502,
       "b": 482,
       "h": 409,
       "anker": [
        225,
        134
       ],
       "naam": "geraamte"
      },
      {
       "x": 1238,
       "y": 0,
       "b": 610,
       "h": 417,
       "anker": [
        337,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 623,
       "y": 0,
       "b": 613,
       "h": 500,
       "anker": [
        337,
        223
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 621,
       "h": 500,
       "anker": [
        337,
        223
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-boerderij6-pannen-z": {
     "gebouw": "boerderij",
     "beslaat": [
      10,
      8
     ],
     "bestand": "bouwfasen/oker-boerderij6-pannen-z.png",
     "fasen": [
      {
       "x": 503,
       "y": 519,
       "b": 623,
       "h": 254,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 519,
       "b": 501,
       "h": 399,
       "anker": [
        180,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1235,
       "y": 0,
       "b": 610,
       "h": 449,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 622,
       "y": 0,
       "b": 611,
       "h": 517,
       "anker": [
        273,
        240
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 620,
       "h": 517,
       "anker": [
        273,
        240
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-boerderij6-pannen-o": {
     "gebouw": "boerderij",
     "beslaat": [
      8,
      10
     ],
     "bestand": "bouwfasen/oker-boerderij6-pannen-o.png",
     "fasen": [
      {
       "x": 484,
       "y": 527,
       "b": 528,
       "h": 264,
       "anker": [
        367,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 527,
       "b": 482,
       "h": 409,
       "anker": [
        321,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1239,
       "y": 0,
       "b": 610,
       "h": 449,
       "anker": [
        337,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 623,
       "y": 0,
       "b": 614,
       "h": 525,
       "anker": [
        341,
        248
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 621,
       "h": 525,
       "anker": [
        348,
        248
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-boerderij6-pannen-n": {
     "gebouw": "boerderij",
     "beslaat": [
      10,
      8
     ],
     "bestand": "bouwfasen/oker-boerderij6-pannen-n.png",
     "fasen": [
      {
       "x": 503,
       "y": 479,
       "b": 547,
       "h": 254,
       "anker": [
        303,
        -21
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 479,
       "b": 501,
       "h": 399,
       "anker": [
        257,
        124
       ],
       "naam": "geraamte"
      },
      {
       "x": 1235,
       "y": 0,
       "b": 610,
       "h": 417,
       "anker": [
        273,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 622,
       "y": 0,
       "b": 611,
       "h": 477,
       "anker": [
        274,
        200
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 620,
       "h": 477,
       "anker": [
        283,
        200
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-boerderij6-pannen-w": {
     "gebouw": "boerderij",
     "beslaat": [
      8,
      10
     ],
     "bestand": "bouwfasen/oker-boerderij6-pannen-w.png",
     "fasen": [
      {
       "x": 484,
       "y": 475,
       "b": 623,
       "h": 264,
       "anker": [
        367,
        -11
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 475,
       "b": 482,
       "h": 409,
       "anker": [
        225,
        134
       ],
       "naam": "geraamte"
      },
      {
       "x": 1239,
       "y": 0,
       "b": 610,
       "h": 417,
       "anker": [
        337,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 623,
       "y": 0,
       "b": 614,
       "h": 473,
       "anker": [
        337,
        196
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 621,
       "h": 473,
       "anker": [
        337,
        196
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-boerderij7-riet-z": {
     "gebouw": "boerderij",
     "beslaat": [
      9,
      6
     ],
     "bestand": "bouwfasen/oker-boerderij7-riet-z.png",
     "fasen": [
      {
       "x": 484,
       "y": 606,
       "b": 527,
       "h": 254,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 606,
       "b": 482,
       "h": 475,
       "anker": [
        193,
        248
       ],
       "naam": "geraamte"
      },
      {
       "x": 1124,
       "y": 0,
       "b": 514,
       "h": 477,
       "anker": [
        209,
        248
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 566,
       "y": 0,
       "b": 556,
       "h": 604,
       "anker": [
        230,
        375
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 564,
       "h": 604,
       "anker": [
        234,
        375
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-boerderij7-riet-o": {
     "gebouw": "boerderij",
     "beslaat": [
      6,
      9
     ],
     "bestand": "bouwfasen/oker-boerderij7-riet-o.png",
     "fasen": [
      {
       "x": 484,
       "y": 600,
       "b": 527,
       "h": 254,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 600,
       "b": 482,
       "h": 475,
       "anker": [
        289,
        248
       ],
       "naam": "geraamte"
      },
      {
       "x": 1124,
       "y": 0,
       "b": 514,
       "h": 477,
       "anker": [
        305,
        248
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 566,
       "y": 0,
       "b": 556,
       "h": 598,
       "anker": [
        326,
        369
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 564,
       "h": 598,
       "anker": [
        330,
        369
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-boerderij7-riet-n": {
     "gebouw": "boerderij",
     "beslaat": [
      9,
      6
     ],
     "bestand": "bouwfasen/oker-boerderij7-riet-n.png",
     "fasen": [
      {
       "x": 484,
       "y": 600,
       "b": 528,
       "h": 254,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 600,
       "b": 482,
       "h": 475,
       "anker": [
        193,
        248
       ],
       "naam": "geraamte"
      },
      {
       "x": 1124,
       "y": 0,
       "b": 514,
       "h": 477,
       "anker": [
        209,
        248
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 566,
       "y": 0,
       "b": 556,
       "h": 598,
       "anker": [
        230,
        369
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 564,
       "h": 598,
       "anker": [
        234,
        369
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-boerderij7-riet-w": {
     "gebouw": "boerderij",
     "beslaat": [
      6,
      9
     ],
     "bestand": "bouwfasen/oker-boerderij7-riet-w.png",
     "fasen": [
      {
       "x": 484,
       "y": 606,
       "b": 527,
       "h": 254,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 606,
       "b": 482,
       "h": 475,
       "anker": [
        289,
        248
       ],
       "naam": "geraamte"
      },
      {
       "x": 1124,
       "y": 0,
       "b": 514,
       "h": 477,
       "anker": [
        305,
        248
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 566,
       "y": 0,
       "b": 556,
       "h": 604,
       "anker": [
        326,
        375
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 564,
       "h": 604,
       "anker": [
        330,
        375
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-boerderij7-leien-z": {
     "gebouw": "boerderij",
     "beslaat": [
      9,
      6
     ],
     "bestand": "bouwfasen/oker-boerderij7-leien-z.png",
     "fasen": [
      {
       "x": 484,
       "y": 587,
       "b": 527,
       "h": 254,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 587,
       "b": 482,
       "h": 455,
       "anker": [
        193,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 1054,
       "y": 0,
       "b": 514,
       "h": 457,
       "anker": [
        209,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 538,
       "y": 0,
       "b": 514,
       "h": 585,
       "anker": [
        209,
        356
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 536,
       "h": 585,
       "anker": [
        220,
        356
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-boerderij7-leien-o": {
     "gebouw": "boerderij",
     "beslaat": [
      6,
      9
     ],
     "bestand": "bouwfasen/oker-boerderij7-leien-o.png",
     "fasen": [
      {
       "x": 484,
       "y": 581,
       "b": 527,
       "h": 254,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 581,
       "b": 482,
       "h": 455,
       "anker": [
        289,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 1054,
       "y": 0,
       "b": 514,
       "h": 457,
       "anker": [
        305,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 538,
       "y": 0,
       "b": 514,
       "h": 579,
       "anker": [
        305,
        350
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 536,
       "h": 579,
       "anker": [
        316,
        350
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-boerderij7-leien-n": {
     "gebouw": "boerderij",
     "beslaat": [
      9,
      6
     ],
     "bestand": "bouwfasen/oker-boerderij7-leien-n.png",
     "fasen": [
      {
       "x": 484,
       "y": 581,
       "b": 528,
       "h": 254,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 581,
       "b": 482,
       "h": 455,
       "anker": [
        193,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 1054,
       "y": 0,
       "b": 514,
       "h": 457,
       "anker": [
        209,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 538,
       "y": 0,
       "b": 514,
       "h": 579,
       "anker": [
        209,
        350
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 536,
       "h": 579,
       "anker": [
        220,
        350
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-boerderij7-leien-w": {
     "gebouw": "boerderij",
     "beslaat": [
      6,
      9
     ],
     "bestand": "bouwfasen/oker-boerderij7-leien-w.png",
     "fasen": [
      {
       "x": 484,
       "y": 587,
       "b": 527,
       "h": 254,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 587,
       "b": 482,
       "h": 455,
       "anker": [
        289,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 1054,
       "y": 0,
       "b": 514,
       "h": 457,
       "anker": [
        305,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 538,
       "y": 0,
       "b": 514,
       "h": 585,
       "anker": [
        305,
        356
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 536,
       "h": 585,
       "anker": [
        316,
        356
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-boerderij7-pannen-z": {
     "gebouw": "boerderij",
     "beslaat": [
      9,
      6
     ],
     "bestand": "bouwfasen/oker-boerderij7-pannen-z.png",
     "fasen": [
      {
       "x": 484,
       "y": 549,
       "b": 527,
       "h": 254,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 549,
       "b": 482,
       "h": 455,
       "anker": [
        193,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 1055,
       "y": 0,
       "b": 514,
       "h": 457,
       "anker": [
        209,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 539,
       "y": 0,
       "b": 514,
       "h": 547,
       "anker": [
        209,
        318
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 537,
       "h": 547,
       "anker": [
        221,
        318
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-boerderij7-pannen-o": {
     "gebouw": "boerderij",
     "beslaat": [
      6,
      9
     ],
     "bestand": "bouwfasen/oker-boerderij7-pannen-o.png",
     "fasen": [
      {
       "x": 484,
       "y": 543,
       "b": 527,
       "h": 254,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 543,
       "b": 482,
       "h": 455,
       "anker": [
        289,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 1055,
       "y": 0,
       "b": 514,
       "h": 457,
       "anker": [
        305,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 539,
       "y": 0,
       "b": 514,
       "h": 541,
       "anker": [
        305,
        312
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 537,
       "h": 541,
       "anker": [
        317,
        312
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-boerderij7-pannen-n": {
     "gebouw": "boerderij",
     "beslaat": [
      9,
      6
     ],
     "bestand": "bouwfasen/oker-boerderij7-pannen-n.png",
     "fasen": [
      {
       "x": 484,
       "y": 543,
       "b": 528,
       "h": 254,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 543,
       "b": 482,
       "h": 455,
       "anker": [
        193,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 1055,
       "y": 0,
       "b": 514,
       "h": 457,
       "anker": [
        209,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 539,
       "y": 0,
       "b": 514,
       "h": 541,
       "anker": [
        209,
        312
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 537,
       "h": 541,
       "anker": [
        220,
        312
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "oker-boerderij7-pannen-w": {
     "gebouw": "boerderij",
     "beslaat": [
      6,
      9
     ],
     "bestand": "bouwfasen/oker-boerderij7-pannen-w.png",
     "fasen": [
      {
       "x": 484,
       "y": 549,
       "b": 527,
       "h": 254,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 549,
       "b": 482,
       "h": 455,
       "anker": [
        289,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 1055,
       "y": 0,
       "b": 514,
       "h": 457,
       "anker": [
        305,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 539,
       "y": 0,
       "b": 514,
       "h": 547,
       "anker": [
        305,
        318
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 537,
       "h": 547,
       "anker": [
        316,
        318
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-hut1-spanen-z": {
     "gebouw": "hut",
     "beslaat": [
      6,
      4
     ],
     "bestand": "bouwfasen/planken-hut1-spanen-z.png",
     "fasen": [
      {
       "x": 648,
       "y": 387,
       "b": 335,
       "h": 158,
       "anker": [
        175,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 356,
       "y": 387,
       "b": 290,
       "h": 273,
       "anker": [
        129,
        142
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 387,
       "b": 354,
       "h": 291,
       "anker": [
        145,
        142
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 364,
       "y": 0,
       "b": 354,
       "h": 385,
       "anker": [
        145,
        236
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 362,
       "h": 385,
       "anker": [
        153,
        236
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-hut1-spanen-o": {
     "gebouw": "hut",
     "beslaat": [
      4,
      6
     ],
     "bestand": "bouwfasen/planken-hut1-spanen-o.png",
     "fasen": [
      {
       "x": 648,
       "y": 361,
       "b": 335,
       "h": 161,
       "anker": [
        239,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 356,
       "y": 361,
       "b": 290,
       "h": 273,
       "anker": [
        193,
        126
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 361,
       "b": 354,
       "h": 275,
       "anker": [
        209,
        126
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 364,
       "y": 0,
       "b": 355,
       "h": 359,
       "anker": [
        210,
        210
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 362,
       "h": 359,
       "anker": [
        217,
        210
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-hut1-spanen-n": {
     "gebouw": "hut",
     "beslaat": [
      6,
      4
     ],
     "bestand": "bouwfasen/planken-hut1-spanen-n.png",
     "fasen": [
      {
       "x": 648,
       "y": 361,
       "b": 368,
       "h": 158,
       "anker": [
        175,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 356,
       "y": 361,
       "b": 290,
       "h": 273,
       "anker": [
        97,
        126
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 361,
       "b": 354,
       "h": 275,
       "anker": [
        145,
        126
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 364,
       "y": 0,
       "b": 355,
       "h": 359,
       "anker": [
        145,
        210
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 362,
       "h": 359,
       "anker": [
        145,
        210
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-hut1-spanen-w": {
     "gebouw": "hut",
     "beslaat": [
      4,
      6
     ],
     "bestand": "bouwfasen/planken-hut1-spanen-w.png",
     "fasen": [
      {
       "x": 648,
       "y": 387,
       "b": 367,
       "h": 177,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 356,
       "y": 387,
       "b": 290,
       "h": 273,
       "anker": [
        161,
        142
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 387,
       "b": 354,
       "h": 291,
       "anker": [
        209,
        142
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 364,
       "y": 0,
       "b": 354,
       "h": 385,
       "anker": [
        209,
        236
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 362,
       "h": 385,
       "anker": [
        209,
        236
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-hut3-spanen-z": {
     "gebouw": "hut",
     "beslaat": [
      6,
      4
     ],
     "bestand": "bouwfasen/planken-hut3-spanen-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 677,
       "b": 368,
       "h": 174,
       "anker": [
        175,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 356,
       "y": 384,
       "b": 322,
       "h": 289,
       "anker": [
        129,
        142
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 384,
       "b": 354,
       "h": 291,
       "anker": [
        145,
        142
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 371,
       "y": 0,
       "b": 354,
       "h": 382,
       "anker": [
        145,
        233
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 369,
       "h": 382,
       "anker": [
        153,
        233
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-hut3-spanen-o": {
     "gebouw": "hut",
     "beslaat": [
      4,
      6
     ],
     "bestand": "bouwfasen/planken-hut3-spanen-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 672,
       "b": 367,
       "h": 177,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 356,
       "y": 379,
       "b": 322,
       "h": 289,
       "anker": [
        193,
        142
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 379,
       "b": 354,
       "h": 291,
       "anker": [
        209,
        142
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 371,
       "y": 0,
       "b": 354,
       "h": 377,
       "anker": [
        209,
        228
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 369,
       "h": 377,
       "anker": [
        217,
        228
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-hut3-spanen-n": {
     "gebouw": "hut",
     "beslaat": [
      6,
      4
     ],
     "bestand": "bouwfasen/planken-hut3-spanen-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 672,
       "b": 367,
       "h": 174,
       "anker": [
        175,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 356,
       "y": 379,
       "b": 322,
       "h": 289,
       "anker": [
        129,
        142
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 379,
       "b": 354,
       "h": 291,
       "anker": [
        145,
        142
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 371,
       "y": 0,
       "b": 354,
       "h": 377,
       "anker": [
        145,
        228
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 369,
       "h": 377,
       "anker": [
        152,
        228
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-hut3-spanen-w": {
     "gebouw": "hut",
     "beslaat": [
      4,
      6
     ],
     "bestand": "bouwfasen/planken-hut3-spanen-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 677,
       "b": 367,
       "h": 177,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 356,
       "y": 384,
       "b": 322,
       "h": 289,
       "anker": [
        193,
        142
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 384,
       "b": 354,
       "h": 291,
       "anker": [
        209,
        142
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 371,
       "y": 0,
       "b": 354,
       "h": 382,
       "anker": [
        209,
        233
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 369,
       "h": 382,
       "anker": [
        216,
        233
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-hut4-spanen-z": {
     "gebouw": "hut",
     "beslaat": [
      6,
      6
     ],
     "bestand": "bouwfasen/planken-hut4-spanen-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 740,
       "b": 431,
       "h": 212,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 411,
       "b": 322,
       "h": 327,
       "anker": [
        129,
        142
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 411,
       "b": 418,
       "h": 327,
       "anker": [
        209,
        142
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 435,
       "y": 0,
       "b": 418,
       "h": 409,
       "anker": [
        209,
        224
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 433,
       "h": 409,
       "anker": [
        209,
        224
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-hut4-spanen-o": {
     "gebouw": "hut",
     "beslaat": [
      6,
      6
     ],
     "bestand": "bouwfasen/planken-hut4-spanen-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 708,
       "b": 447,
       "h": 177,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 383,
       "b": 401,
       "h": 289,
       "anker": [
        193,
        142
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 383,
       "b": 418,
       "h": 323,
       "anker": [
        209,
        142
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 441,
       "y": 0,
       "b": 427,
       "h": 381,
       "anker": [
        209,
        200
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 439,
       "h": 381,
       "anker": [
        217,
        200
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-hut4-spanen-n": {
     "gebouw": "hut",
     "beslaat": [
      6,
      6
     ],
     "bestand": "bouwfasen/planken-hut4-spanen-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 744,
       "b": 367,
       "h": 207,
       "anker": [
        239,
        28
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 418,
       "b": 322,
       "h": 322,
       "anker": [
        193,
        143
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 418,
       "b": 418,
       "h": 324,
       "anker": [
        209,
        143
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 435,
       "y": 0,
       "b": 418,
       "h": 416,
       "anker": [
        209,
        235
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 433,
       "h": 416,
       "anker": [
        224,
        235
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-hut4-spanen-w": {
     "gebouw": "hut",
     "beslaat": [
      6,
      6
     ],
     "bestand": "bouwfasen/planken-hut4-spanen-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 680,
       "b": 431,
       "h": 174,
       "anker": [
        239,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 420,
       "y": 375,
       "b": 401,
       "h": 289,
       "anker": [
        208,
        110
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 375,
       "b": 418,
       "h": 303,
       "anker": [
        209,
        122
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 441,
       "y": 0,
       "b": 427,
       "h": 373,
       "anker": [
        218,
        192
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 439,
       "h": 373,
       "anker": [
        222,
        192
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis7-spanen-z": {
     "gebouw": "huis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-huis7-spanen-z.png",
     "fasen": [
      {
       "x": 452,
       "y": 681,
       "b": 559,
       "h": 238,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 681,
       "b": 450,
       "h": 523,
       "anker": [
        161,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 1159,
       "y": 0,
       "b": 551,
       "h": 557,
       "anker": [
        241,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 581,
       "y": 0,
       "b": 576,
       "h": 679,
       "anker": [
        241,
        434
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 579,
       "h": 679,
       "anker": [
        241,
        434
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis7-spanen-o": {
     "gebouw": "huis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-huis7-spanen-o.png",
     "fasen": [
      {
       "x": 452,
       "y": 690,
       "b": 495,
       "h": 238,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 690,
       "b": 450,
       "h": 523,
       "anker": [
        289,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 1149,
       "y": 0,
       "b": 557,
       "h": 557,
       "anker": [
        316,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 576,
       "y": 0,
       "b": 571,
       "h": 688,
       "anker": [
        330,
        443
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 574,
       "h": 688,
       "anker": [
        333,
        443
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis7-spanen-n": {
     "gebouw": "huis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-huis7-spanen-n.png",
     "fasen": [
      {
       "x": 452,
       "y": 658,
       "b": 496,
       "h": 238,
       "anker": [
        271,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 658,
       "b": 450,
       "h": 523,
       "anker": [
        225,
        280
       ],
       "naam": "geraamte"
      },
      {
       "x": 1159,
       "y": 0,
       "b": 551,
       "h": 525,
       "anker": [
        246,
        280
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 581,
       "y": 0,
       "b": 576,
       "h": 656,
       "anker": [
        271,
        411
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 579,
       "h": 656,
       "anker": [
        274,
        411
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis7-spanen-w": {
     "gebouw": "huis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-huis7-spanen-w.png",
     "fasen": [
      {
       "x": 452,
       "y": 649,
       "b": 559,
       "h": 238,
       "anker": [
        335,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 649,
       "b": 450,
       "h": 523,
       "anker": [
        225,
        280
       ],
       "naam": "geraamte"
      },
      {
       "x": 1149,
       "y": 0,
       "b": 557,
       "h": 525,
       "anker": [
        305,
        280
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 576,
       "y": 0,
       "b": 571,
       "h": 647,
       "anker": [
        305,
        402
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 574,
       "h": 647,
       "anker": [
        305,
        402
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis7-leien-z": {
     "gebouw": "huis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-huis7-leien-z.png",
     "fasen": [
      {
       "x": 452,
       "y": 699,
       "b": 559,
       "h": 238,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 699,
       "b": 450,
       "h": 523,
       "anker": [
        161,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 1159,
       "y": 0,
       "b": 551,
       "h": 557,
       "anker": [
        241,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 581,
       "y": 0,
       "b": 576,
       "h": 697,
       "anker": [
        241,
        452
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 579,
       "h": 697,
       "anker": [
        241,
        452
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis7-leien-o": {
     "gebouw": "huis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-huis7-leien-o.png",
     "fasen": [
      {
       "x": 452,
       "y": 708,
       "b": 495,
       "h": 238,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 708,
       "b": 450,
       "h": 523,
       "anker": [
        289,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 1151,
       "y": 0,
       "b": 557,
       "h": 557,
       "anker": [
        316,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 577,
       "y": 0,
       "b": 572,
       "h": 706,
       "anker": [
        331,
        461
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 575,
       "h": 706,
       "anker": [
        334,
        461
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis7-leien-n": {
     "gebouw": "huis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-huis7-leien-n.png",
     "fasen": [
      {
       "x": 452,
       "y": 676,
       "b": 496,
       "h": 238,
       "anker": [
        271,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 676,
       "b": 450,
       "h": 523,
       "anker": [
        225,
        280
       ],
       "naam": "geraamte"
      },
      {
       "x": 1159,
       "y": 0,
       "b": 551,
       "h": 525,
       "anker": [
        246,
        280
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 581,
       "y": 0,
       "b": 576,
       "h": 674,
       "anker": [
        271,
        429
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 579,
       "h": 674,
       "anker": [
        274,
        429
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis7-leien-w": {
     "gebouw": "huis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-huis7-leien-w.png",
     "fasen": [
      {
       "x": 452,
       "y": 667,
       "b": 559,
       "h": 238,
       "anker": [
        335,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 667,
       "b": 450,
       "h": 523,
       "anker": [
        225,
        280
       ],
       "naam": "geraamte"
      },
      {
       "x": 1150,
       "y": 0,
       "b": 557,
       "h": 525,
       "anker": [
        305,
        280
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 576,
       "y": 0,
       "b": 572,
       "h": 665,
       "anker": [
        305,
        420
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 574,
       "h": 665,
       "anker": [
        305,
        420
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis7-pannen-z": {
     "gebouw": "huis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-huis7-pannen-z.png",
     "fasen": [
      {
       "x": 452,
       "y": 659,
       "b": 559,
       "h": 238,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 659,
       "b": 450,
       "h": 523,
       "anker": [
        161,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 1157,
       "y": 0,
       "b": 551,
       "h": 557,
       "anker": [
        241,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 580,
       "y": 0,
       "b": 575,
       "h": 657,
       "anker": [
        241,
        412
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 578,
       "h": 657,
       "anker": [
        241,
        412
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis7-pannen-o": {
     "gebouw": "huis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-huis7-pannen-o.png",
     "fasen": [
      {
       "x": 452,
       "y": 668,
       "b": 495,
       "h": 238,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 668,
       "b": 450,
       "h": 523,
       "anker": [
        289,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 1151,
       "y": 0,
       "b": 557,
       "h": 557,
       "anker": [
        316,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 577,
       "y": 0,
       "b": 572,
       "h": 666,
       "anker": [
        331,
        421
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 575,
       "h": 666,
       "anker": [
        334,
        421
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis7-pannen-n": {
     "gebouw": "huis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-huis7-pannen-n.png",
     "fasen": [
      {
       "x": 452,
       "y": 636,
       "b": 496,
       "h": 238,
       "anker": [
        271,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 636,
       "b": 450,
       "h": 523,
       "anker": [
        225,
        280
       ],
       "naam": "geraamte"
      },
      {
       "x": 1157,
       "y": 0,
       "b": 551,
       "h": 525,
       "anker": [
        246,
        280
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 580,
       "y": 0,
       "b": 575,
       "h": 634,
       "anker": [
        270,
        389
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 578,
       "h": 634,
       "anker": [
        273,
        389
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis7-pannen-w": {
     "gebouw": "huis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-huis7-pannen-w.png",
     "fasen": [
      {
       "x": 452,
       "y": 627,
       "b": 559,
       "h": 238,
       "anker": [
        335,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 627,
       "b": 450,
       "h": 523,
       "anker": [
        225,
        280
       ],
       "naam": "geraamte"
      },
      {
       "x": 1150,
       "y": 0,
       "b": 557,
       "h": 525,
       "anker": [
        305,
        280
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 576,
       "y": 0,
       "b": 572,
       "h": 625,
       "anker": [
        305,
        380
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 574,
       "h": 625,
       "anker": [
        305,
        380
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen7-leien-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-steen7-leien-z.png",
     "fasen": [
      {
       "x": 452,
       "y": 699,
       "b": 559,
       "h": 238,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 699,
       "b": 450,
       "h": 523,
       "anker": [
        161,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 1159,
       "y": 0,
       "b": 551,
       "h": 557,
       "anker": [
        241,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 581,
       "y": 0,
       "b": 576,
       "h": 697,
       "anker": [
        241,
        452
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 579,
       "h": 697,
       "anker": [
        241,
        452
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen7-leien-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-steen7-leien-o.png",
     "fasen": [
      {
       "x": 452,
       "y": 708,
       "b": 495,
       "h": 238,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 708,
       "b": 450,
       "h": 523,
       "anker": [
        289,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 1151,
       "y": 0,
       "b": 557,
       "h": 557,
       "anker": [
        316,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 577,
       "y": 0,
       "b": 572,
       "h": 706,
       "anker": [
        331,
        461
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 575,
       "h": 706,
       "anker": [
        334,
        461
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen7-leien-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-steen7-leien-n.png",
     "fasen": [
      {
       "x": 452,
       "y": 676,
       "b": 496,
       "h": 238,
       "anker": [
        271,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 676,
       "b": 450,
       "h": 523,
       "anker": [
        225,
        280
       ],
       "naam": "geraamte"
      },
      {
       "x": 1159,
       "y": 0,
       "b": 551,
       "h": 525,
       "anker": [
        246,
        280
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 581,
       "y": 0,
       "b": 576,
       "h": 674,
       "anker": [
        271,
        429
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 579,
       "h": 674,
       "anker": [
        274,
        429
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen7-leien-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-steen7-leien-w.png",
     "fasen": [
      {
       "x": 452,
       "y": 667,
       "b": 559,
       "h": 238,
       "anker": [
        335,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 667,
       "b": 450,
       "h": 523,
       "anker": [
        225,
        280
       ],
       "naam": "geraamte"
      },
      {
       "x": 1150,
       "y": 0,
       "b": 557,
       "h": 525,
       "anker": [
        305,
        280
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 576,
       "y": 0,
       "b": 572,
       "h": 665,
       "anker": [
        305,
        420
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 574,
       "h": 665,
       "anker": [
        305,
        420
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen7-pannen-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-steen7-pannen-z.png",
     "fasen": [
      {
       "x": 452,
       "y": 659,
       "b": 559,
       "h": 238,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 659,
       "b": 450,
       "h": 523,
       "anker": [
        161,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 1157,
       "y": 0,
       "b": 551,
       "h": 557,
       "anker": [
        241,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 580,
       "y": 0,
       "b": 575,
       "h": 657,
       "anker": [
        241,
        412
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 578,
       "h": 657,
       "anker": [
        241,
        412
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen7-pannen-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-steen7-pannen-o.png",
     "fasen": [
      {
       "x": 452,
       "y": 668,
       "b": 495,
       "h": 238,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 668,
       "b": 450,
       "h": 523,
       "anker": [
        289,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 1151,
       "y": 0,
       "b": 557,
       "h": 557,
       "anker": [
        316,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 577,
       "y": 0,
       "b": 572,
       "h": 666,
       "anker": [
        331,
        421
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 575,
       "h": 666,
       "anker": [
        334,
        421
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen7-pannen-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-steen7-pannen-n.png",
     "fasen": [
      {
       "x": 452,
       "y": 636,
       "b": 496,
       "h": 238,
       "anker": [
        271,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 636,
       "b": 450,
       "h": 523,
       "anker": [
        225,
        280
       ],
       "naam": "geraamte"
      },
      {
       "x": 1157,
       "y": 0,
       "b": 551,
       "h": 525,
       "anker": [
        246,
        280
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 580,
       "y": 0,
       "b": 575,
       "h": 634,
       "anker": [
        270,
        389
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 578,
       "h": 634,
       "anker": [
        273,
        389
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen7-pannen-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-steen7-pannen-w.png",
     "fasen": [
      {
       "x": 452,
       "y": 627,
       "b": 559,
       "h": 238,
       "anker": [
        335,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 627,
       "b": 450,
       "h": 523,
       "anker": [
        225,
        280
       ],
       "naam": "geraamte"
      },
      {
       "x": 1150,
       "y": 0,
       "b": 557,
       "h": 525,
       "anker": [
        305,
        280
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 576,
       "y": 0,
       "b": 572,
       "h": 625,
       "anker": [
        305,
        380
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 574,
       "h": 625,
       "anker": [
        305,
        380
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen7-baksteen-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-steen7-baksteen-z.png",
     "fasen": [
      {
       "x": 452,
       "y": 659,
       "b": 559,
       "h": 238,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 659,
       "b": 450,
       "h": 523,
       "anker": [
        161,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 1157,
       "y": 0,
       "b": 551,
       "h": 557,
       "anker": [
        241,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 580,
       "y": 0,
       "b": 575,
       "h": 657,
       "anker": [
        241,
        412
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 578,
       "h": 657,
       "anker": [
        241,
        412
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen7-baksteen-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-steen7-baksteen-o.png",
     "fasen": [
      {
       "x": 452,
       "y": 668,
       "b": 495,
       "h": 238,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 668,
       "b": 450,
       "h": 523,
       "anker": [
        289,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 1151,
       "y": 0,
       "b": 557,
       "h": 557,
       "anker": [
        316,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 577,
       "y": 0,
       "b": 572,
       "h": 666,
       "anker": [
        331,
        421
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 575,
       "h": 666,
       "anker": [
        334,
        421
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen7-baksteen-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-steen7-baksteen-n.png",
     "fasen": [
      {
       "x": 452,
       "y": 636,
       "b": 496,
       "h": 238,
       "anker": [
        271,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 636,
       "b": 450,
       "h": 523,
       "anker": [
        225,
        280
       ],
       "naam": "geraamte"
      },
      {
       "x": 1157,
       "y": 0,
       "b": 551,
       "h": 525,
       "anker": [
        246,
        280
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 580,
       "y": 0,
       "b": 575,
       "h": 634,
       "anker": [
        270,
        389
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 578,
       "h": 634,
       "anker": [
        273,
        389
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen7-baksteen-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-steen7-baksteen-w.png",
     "fasen": [
      {
       "x": 452,
       "y": 627,
       "b": 559,
       "h": 238,
       "anker": [
        335,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 627,
       "b": 450,
       "h": 523,
       "anker": [
        225,
        280
       ],
       "naam": "geraamte"
      },
      {
       "x": 1150,
       "y": 0,
       "b": 557,
       "h": 525,
       "anker": [
        305,
        280
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 576,
       "y": 0,
       "b": 572,
       "h": 625,
       "anker": [
        305,
        380
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 574,
       "h": 625,
       "anker": [
        305,
        380
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis8-spanen-z": {
     "gebouw": "huis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-huis8-spanen-z.png",
     "fasen": [
      {
       "x": 481,
       "y": 589,
       "b": 524,
       "h": 238,
       "anker": [
        271,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 589,
       "b": 479,
       "h": 439,
       "anker": [
        225,
        212
       ],
       "naam": "geraamte"
      },
      {
       "x": 1107,
       "y": 0,
       "b": 546,
       "h": 457,
       "anker": [
        241,
        212
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 559,
       "y": 0,
       "b": 546,
       "h": 587,
       "anker": [
        241,
        342
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 557,
       "h": 587,
       "anker": [
        252,
        342
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis8-spanen-o": {
     "gebouw": "huis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-huis8-spanen-o.png",
     "fasen": [
      {
       "x": 452,
       "y": 598,
       "b": 528,
       "h": 253,
       "anker": [
        335,
        10
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 598,
       "b": 450,
       "h": 454,
       "anker": [
        257,
        211
       ],
       "naam": "geraamte"
      },
      {
       "x": 1096,
       "y": 0,
       "b": 546,
       "h": 456,
       "anker": [
        305,
        211
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 546,
       "h": 596,
       "anker": [
        305,
        351
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 548,
       "y": 0,
       "b": 546,
       "h": 596,
       "anker": [
        305,
        351
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis8-spanen-n": {
     "gebouw": "huis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-huis8-spanen-n.png",
     "fasen": [
      {
       "x": 481,
       "y": 547,
       "b": 559,
       "h": 238,
       "anker": [
        271,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 547,
       "b": 479,
       "h": 439,
       "anker": [
        190,
        212
       ],
       "naam": "geraamte"
      },
      {
       "x": 1107,
       "y": 0,
       "b": 546,
       "h": 457,
       "anker": [
        241,
        212
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 559,
       "y": 0,
       "b": 546,
       "h": 545,
       "anker": [
        241,
        300
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 557,
       "h": 545,
       "anker": [
        241,
        300
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis8-spanen-w": {
     "gebouw": "huis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-huis8-spanen-w.png",
     "fasen": [
      {
       "x": 452,
       "y": 605,
       "b": 527,
       "h": 252,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 605,
       "b": 450,
       "h": 453,
       "anker": [
        257,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 1096,
       "y": 0,
       "b": 546,
       "h": 473,
       "anker": [
        305,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 546,
       "h": 603,
       "anker": [
        305,
        358
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 548,
       "y": 0,
       "b": 546,
       "h": 603,
       "anker": [
        305,
        358
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis8-leien-z": {
     "gebouw": "huis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-huis8-leien-z.png",
     "fasen": [
      {
       "x": 481,
       "y": 609,
       "b": 524,
       "h": 238,
       "anker": [
        271,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 609,
       "b": 479,
       "h": 439,
       "anker": [
        225,
        212
       ],
       "naam": "geraamte"
      },
      {
       "x": 1107,
       "y": 0,
       "b": 546,
       "h": 457,
       "anker": [
        241,
        212
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 559,
       "y": 0,
       "b": 546,
       "h": 607,
       "anker": [
        241,
        362
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 557,
       "h": 607,
       "anker": [
        252,
        362
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis8-leien-o": {
     "gebouw": "huis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-huis8-leien-o.png",
     "fasen": [
      {
       "x": 452,
       "y": 618,
       "b": 528,
       "h": 253,
       "anker": [
        335,
        10
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 618,
       "b": 450,
       "h": 454,
       "anker": [
        257,
        211
       ],
       "naam": "geraamte"
      },
      {
       "x": 1096,
       "y": 0,
       "b": 546,
       "h": 456,
       "anker": [
        305,
        211
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 546,
       "h": 616,
       "anker": [
        305,
        371
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 548,
       "y": 0,
       "b": 546,
       "h": 616,
       "anker": [
        305,
        371
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis8-leien-n": {
     "gebouw": "huis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-huis8-leien-n.png",
     "fasen": [
      {
       "x": 481,
       "y": 567,
       "b": 559,
       "h": 238,
       "anker": [
        271,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 567,
       "b": 479,
       "h": 439,
       "anker": [
        190,
        212
       ],
       "naam": "geraamte"
      },
      {
       "x": 1107,
       "y": 0,
       "b": 546,
       "h": 457,
       "anker": [
        241,
        212
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 559,
       "y": 0,
       "b": 546,
       "h": 565,
       "anker": [
        241,
        320
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 557,
       "h": 565,
       "anker": [
        241,
        320
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis8-leien-w": {
     "gebouw": "huis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-huis8-leien-w.png",
     "fasen": [
      {
       "x": 452,
       "y": 625,
       "b": 527,
       "h": 252,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 625,
       "b": 450,
       "h": 453,
       "anker": [
        257,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 1096,
       "y": 0,
       "b": 546,
       "h": 473,
       "anker": [
        305,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 546,
       "h": 623,
       "anker": [
        305,
        378
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 548,
       "y": 0,
       "b": 546,
       "h": 623,
       "anker": [
        305,
        378
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis8-pannen-z": {
     "gebouw": "huis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-huis8-pannen-z.png",
     "fasen": [
      {
       "x": 481,
       "y": 566,
       "b": 524,
       "h": 238,
       "anker": [
        271,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 566,
       "b": 479,
       "h": 439,
       "anker": [
        225,
        212
       ],
       "naam": "geraamte"
      },
      {
       "x": 1107,
       "y": 0,
       "b": 546,
       "h": 457,
       "anker": [
        241,
        212
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 559,
       "y": 0,
       "b": 546,
       "h": 564,
       "anker": [
        241,
        319
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 557,
       "h": 564,
       "anker": [
        252,
        319
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis8-pannen-o": {
     "gebouw": "huis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-huis8-pannen-o.png",
     "fasen": [
      {
       "x": 452,
       "y": 574,
       "b": 528,
       "h": 253,
       "anker": [
        335,
        10
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 574,
       "b": 450,
       "h": 454,
       "anker": [
        257,
        211
       ],
       "naam": "geraamte"
      },
      {
       "x": 1096,
       "y": 0,
       "b": 546,
       "h": 456,
       "anker": [
        305,
        211
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 546,
       "h": 572,
       "anker": [
        305,
        327
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 548,
       "y": 0,
       "b": 546,
       "h": 572,
       "anker": [
        305,
        327
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis8-pannen-n": {
     "gebouw": "huis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-huis8-pannen-n.png",
     "fasen": [
      {
       "x": 481,
       "y": 526,
       "b": 559,
       "h": 238,
       "anker": [
        271,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 526,
       "b": 479,
       "h": 439,
       "anker": [
        190,
        212
       ],
       "naam": "geraamte"
      },
      {
       "x": 1107,
       "y": 0,
       "b": 546,
       "h": 457,
       "anker": [
        241,
        212
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 559,
       "y": 0,
       "b": 546,
       "h": 524,
       "anker": [
        241,
        279
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 557,
       "h": 524,
       "anker": [
        241,
        279
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis8-pannen-w": {
     "gebouw": "huis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-huis8-pannen-w.png",
     "fasen": [
      {
       "x": 452,
       "y": 582,
       "b": 527,
       "h": 252,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 582,
       "b": 450,
       "h": 453,
       "anker": [
        257,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 1096,
       "y": 0,
       "b": 546,
       "h": 473,
       "anker": [
        305,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 546,
       "h": 580,
       "anker": [
        305,
        335
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 548,
       "y": 0,
       "b": 546,
       "h": 580,
       "anker": [
        305,
        335
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen8-leien-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-steen8-leien-z.png",
     "fasen": [
      {
       "x": 481,
       "y": 609,
       "b": 524,
       "h": 238,
       "anker": [
        271,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 609,
       "b": 479,
       "h": 439,
       "anker": [
        225,
        212
       ],
       "naam": "geraamte"
      },
      {
       "x": 1107,
       "y": 0,
       "b": 546,
       "h": 457,
       "anker": [
        241,
        212
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 559,
       "y": 0,
       "b": 546,
       "h": 607,
       "anker": [
        241,
        362
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 557,
       "h": 607,
       "anker": [
        252,
        362
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen8-leien-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-steen8-leien-o.png",
     "fasen": [
      {
       "x": 452,
       "y": 618,
       "b": 528,
       "h": 253,
       "anker": [
        335,
        10
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 618,
       "b": 450,
       "h": 454,
       "anker": [
        257,
        211
       ],
       "naam": "geraamte"
      },
      {
       "x": 1096,
       "y": 0,
       "b": 546,
       "h": 456,
       "anker": [
        305,
        211
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 546,
       "h": 616,
       "anker": [
        305,
        371
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 548,
       "y": 0,
       "b": 546,
       "h": 616,
       "anker": [
        305,
        371
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen8-leien-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-steen8-leien-n.png",
     "fasen": [
      {
       "x": 481,
       "y": 567,
       "b": 559,
       "h": 238,
       "anker": [
        271,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 567,
       "b": 479,
       "h": 439,
       "anker": [
        190,
        212
       ],
       "naam": "geraamte"
      },
      {
       "x": 1107,
       "y": 0,
       "b": 546,
       "h": 457,
       "anker": [
        241,
        212
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 559,
       "y": 0,
       "b": 546,
       "h": 565,
       "anker": [
        241,
        320
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 557,
       "h": 565,
       "anker": [
        241,
        320
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen8-leien-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-steen8-leien-w.png",
     "fasen": [
      {
       "x": 452,
       "y": 625,
       "b": 527,
       "h": 252,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 625,
       "b": 450,
       "h": 453,
       "anker": [
        257,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 1096,
       "y": 0,
       "b": 546,
       "h": 473,
       "anker": [
        305,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 546,
       "h": 623,
       "anker": [
        305,
        378
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 548,
       "y": 0,
       "b": 546,
       "h": 623,
       "anker": [
        305,
        378
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen8-pannen-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-steen8-pannen-z.png",
     "fasen": [
      {
       "x": 481,
       "y": 566,
       "b": 524,
       "h": 238,
       "anker": [
        271,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 566,
       "b": 479,
       "h": 439,
       "anker": [
        225,
        212
       ],
       "naam": "geraamte"
      },
      {
       "x": 1107,
       "y": 0,
       "b": 546,
       "h": 457,
       "anker": [
        241,
        212
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 559,
       "y": 0,
       "b": 546,
       "h": 564,
       "anker": [
        241,
        319
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 557,
       "h": 564,
       "anker": [
        252,
        319
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen8-pannen-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-steen8-pannen-o.png",
     "fasen": [
      {
       "x": 452,
       "y": 574,
       "b": 528,
       "h": 253,
       "anker": [
        335,
        10
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 574,
       "b": 450,
       "h": 454,
       "anker": [
        257,
        211
       ],
       "naam": "geraamte"
      },
      {
       "x": 1096,
       "y": 0,
       "b": 546,
       "h": 456,
       "anker": [
        305,
        211
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 546,
       "h": 572,
       "anker": [
        305,
        327
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 548,
       "y": 0,
       "b": 546,
       "h": 572,
       "anker": [
        305,
        327
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen8-pannen-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-steen8-pannen-n.png",
     "fasen": [
      {
       "x": 481,
       "y": 526,
       "b": 559,
       "h": 238,
       "anker": [
        271,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 526,
       "b": 479,
       "h": 439,
       "anker": [
        190,
        212
       ],
       "naam": "geraamte"
      },
      {
       "x": 1107,
       "y": 0,
       "b": 546,
       "h": 457,
       "anker": [
        241,
        212
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 559,
       "y": 0,
       "b": 546,
       "h": 524,
       "anker": [
        241,
        279
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 557,
       "h": 524,
       "anker": [
        241,
        279
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen8-pannen-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-steen8-pannen-w.png",
     "fasen": [
      {
       "x": 452,
       "y": 582,
       "b": 527,
       "h": 252,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 582,
       "b": 450,
       "h": 453,
       "anker": [
        257,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 1096,
       "y": 0,
       "b": 546,
       "h": 473,
       "anker": [
        305,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 546,
       "h": 580,
       "anker": [
        305,
        335
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 548,
       "y": 0,
       "b": 546,
       "h": 580,
       "anker": [
        305,
        335
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen8-baksteen-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-steen8-baksteen-z.png",
     "fasen": [
      {
       "x": 481,
       "y": 566,
       "b": 524,
       "h": 238,
       "anker": [
        271,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 566,
       "b": 479,
       "h": 439,
       "anker": [
        225,
        212
       ],
       "naam": "geraamte"
      },
      {
       "x": 1107,
       "y": 0,
       "b": 546,
       "h": 457,
       "anker": [
        241,
        212
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 559,
       "y": 0,
       "b": 546,
       "h": 564,
       "anker": [
        241,
        319
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 557,
       "h": 564,
       "anker": [
        252,
        319
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen8-baksteen-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-steen8-baksteen-o.png",
     "fasen": [
      {
       "x": 452,
       "y": 574,
       "b": 528,
       "h": 253,
       "anker": [
        335,
        10
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 574,
       "b": 450,
       "h": 454,
       "anker": [
        257,
        211
       ],
       "naam": "geraamte"
      },
      {
       "x": 1096,
       "y": 0,
       "b": 546,
       "h": 456,
       "anker": [
        305,
        211
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 546,
       "h": 572,
       "anker": [
        305,
        327
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 548,
       "y": 0,
       "b": 546,
       "h": 572,
       "anker": [
        305,
        327
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen8-baksteen-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-steen8-baksteen-n.png",
     "fasen": [
      {
       "x": 481,
       "y": 526,
       "b": 559,
       "h": 238,
       "anker": [
        271,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 526,
       "b": 479,
       "h": 439,
       "anker": [
        190,
        212
       ],
       "naam": "geraamte"
      },
      {
       "x": 1107,
       "y": 0,
       "b": 546,
       "h": 457,
       "anker": [
        241,
        212
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 559,
       "y": 0,
       "b": 546,
       "h": 524,
       "anker": [
        241,
        279
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 557,
       "h": 524,
       "anker": [
        241,
        279
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen8-baksteen-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-steen8-baksteen-w.png",
     "fasen": [
      {
       "x": 452,
       "y": 582,
       "b": 527,
       "h": 252,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 582,
       "b": 450,
       "h": 453,
       "anker": [
        257,
        228
       ],
       "naam": "geraamte"
      },
      {
       "x": 1096,
       "y": 0,
       "b": 546,
       "h": 473,
       "anker": [
        305,
        228
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 546,
       "h": 580,
       "anker": [
        305,
        335
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 548,
       "y": 0,
       "b": 546,
       "h": 580,
       "anker": [
        305,
        335
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis9-spanen-z": {
     "gebouw": "huis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-huis9-spanen-z.png",
     "fasen": [
      {
       "x": 420,
       "y": 523,
       "b": 528,
       "h": 238,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 523,
       "b": 418,
       "h": 383,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1096,
       "y": 0,
       "b": 546,
       "h": 417,
       "anker": [
        241,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 546,
       "h": 521,
       "anker": [
        241,
        276
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 548,
       "y": 0,
       "b": 546,
       "h": 521,
       "anker": [
        241,
        276
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis9-spanen-o": {
     "gebouw": "huis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-huis9-spanen-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 1413,
       "b": 495,
       "h": 222,
       "anker": [
        335,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 548,
       "y": 1010,
       "b": 449,
       "h": 367,
       "anker": [
        289,
        156
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 1010,
       "b": 546,
       "h": 401,
       "anker": [
        305,
        156
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 505,
       "b": 546,
       "h": 503,
       "anker": [
        305,
        258
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 556,
       "h": 503,
       "anker": [
        315,
        258
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis9-spanen-n": {
     "gebouw": "huis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-huis9-spanen-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 1333,
       "b": 495,
       "h": 238,
       "anker": [
        271,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 548,
       "y": 946,
       "b": 418,
       "h": 367,
       "anker": [
        193,
        124
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 946,
       "b": 546,
       "h": 385,
       "anker": [
        241,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 546,
       "h": 471,
       "anker": [
        241,
        226
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 473,
       "b": 546,
       "h": 471,
       "anker": [
        241,
        226
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis9-spanen-w": {
     "gebouw": "huis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-huis9-spanen-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 1369,
       "b": 559,
       "h": 222,
       "anker": [
        335,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 548,
       "y": 982,
       "b": 449,
       "h": 367,
       "anker": [
        224,
        140
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 982,
       "b": 546,
       "h": 385,
       "anker": [
        305,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 491,
       "b": 546,
       "h": 489,
       "anker": [
        305,
        244
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 556,
       "h": 489,
       "anker": [
        305,
        244
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis9-leien-z": {
     "gebouw": "huis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-huis9-leien-z.png",
     "fasen": [
      {
       "x": 420,
       "y": 539,
       "b": 528,
       "h": 238,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 539,
       "b": 418,
       "h": 384,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1096,
       "y": 0,
       "b": 546,
       "h": 417,
       "anker": [
        241,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 546,
       "h": 537,
       "anker": [
        241,
        292
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 548,
       "y": 0,
       "b": 546,
       "h": 537,
       "anker": [
        241,
        292
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis9-leien-o": {
     "gebouw": "huis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-huis9-leien-o.png",
     "fasen": [
      {
       "x": 451,
       "y": 521,
       "b": 495,
       "h": 222,
       "anker": [
        335,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 521,
       "b": 449,
       "h": 367,
       "anker": [
        289,
        156
       ],
       "naam": "geraamte"
      },
      {
       "x": 1107,
       "y": 0,
       "b": 546,
       "h": 401,
       "anker": [
        305,
        156
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 559,
       "y": 0,
       "b": 546,
       "h": 519,
       "anker": [
        305,
        274
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 557,
       "h": 519,
       "anker": [
        316,
        274
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis9-leien-n": {
     "gebouw": "huis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-huis9-leien-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 1365,
       "b": 495,
       "h": 238,
       "anker": [
        271,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 548,
       "y": 978,
       "b": 418,
       "h": 367,
       "anker": [
        193,
        124
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 978,
       "b": 546,
       "h": 385,
       "anker": [
        241,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 546,
       "h": 487,
       "anker": [
        241,
        242
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 489,
       "b": 546,
       "h": 487,
       "anker": [
        241,
        242
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis9-leien-w": {
     "gebouw": "huis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-huis9-leien-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 1401,
       "b": 559,
       "h": 222,
       "anker": [
        335,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 548,
       "y": 1014,
       "b": 449,
       "h": 367,
       "anker": [
        224,
        140
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 1014,
       "b": 546,
       "h": 385,
       "anker": [
        305,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 507,
       "b": 546,
       "h": 505,
       "anker": [
        305,
        260
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 557,
       "h": 505,
       "anker": [
        305,
        260
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis9-pannen-z": {
     "gebouw": "huis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-huis9-pannen-z.png",
     "fasen": [
      {
       "x": 420,
       "y": 504,
       "b": 528,
       "h": 238,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 504,
       "b": 418,
       "h": 383,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1096,
       "y": 0,
       "b": 546,
       "h": 417,
       "anker": [
        241,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 546,
       "h": 502,
       "anker": [
        241,
        257
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 548,
       "y": 0,
       "b": 546,
       "h": 502,
       "anker": [
        241,
        257
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis9-pannen-o": {
     "gebouw": "huis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-huis9-pannen-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 1375,
       "b": 494,
       "h": 222,
       "anker": [
        335,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 548,
       "y": 972,
       "b": 448,
       "h": 367,
       "anker": [
        289,
        156
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 972,
       "b": 546,
       "h": 401,
       "anker": [
        305,
        156
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 486,
       "b": 546,
       "h": 484,
       "anker": [
        305,
        239
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 556,
       "h": 484,
       "anker": [
        315,
        239
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis9-pannen-n": {
     "gebouw": "huis",
     "beslaat": [
      9,
      7
     ],
     "bestand": "bouwfasen/planken-huis9-pannen-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 1295,
       "b": 495,
       "h": 238,
       "anker": [
        271,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 548,
       "y": 908,
       "b": 418,
       "h": 367,
       "anker": [
        193,
        124
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 908,
       "b": 546,
       "h": 385,
       "anker": [
        241,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 0,
       "b": 546,
       "h": 452,
       "anker": [
        241,
        207
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 454,
       "b": 546,
       "h": 452,
       "anker": [
        241,
        207
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-huis9-pannen-w": {
     "gebouw": "huis",
     "beslaat": [
      7,
      9
     ],
     "bestand": "bouwfasen/planken-huis9-pannen-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 1331,
       "b": 559,
       "h": 222,
       "anker": [
        335,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 548,
       "y": 944,
       "b": 448,
       "h": 367,
       "anker": [
        223,
        140
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 944,
       "b": 546,
       "h": 385,
       "anker": [
        305,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 472,
       "b": 546,
       "h": 470,
       "anker": [
        305,
        225
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 556,
       "h": 470,
       "anker": [
        305,
        225
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen9-leien-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      7
     ],
     "bestand": "bouwfasen/planken-steen9-leien-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 1449,
       "b": 528,
       "h": 238,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 516,
       "y": 1046,
       "b": 418,
       "h": 384,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 1046,
       "b": 514,
       "h": 401,
       "anker": [
        241,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 523,
       "b": 514,
       "h": 521,
       "anker": [
        241,
        292
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 526,
       "h": 521,
       "anker": [
        241,
        292
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen9-leien-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      8
     ],
     "bestand": "bouwfasen/planken-steen9-leien-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 1445,
       "b": 495,
       "h": 222,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 516,
       "y": 1042,
       "b": 449,
       "h": 367,
       "anker": [
        257,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 1042,
       "b": 514,
       "h": 401,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 521,
       "b": 514,
       "h": 519,
       "anker": [
        273,
        290
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 525,
       "h": 519,
       "anker": [
        284,
        290
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen9-leien-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      7
     ],
     "bestand": "bouwfasen/planken-steen9-leien-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 1349,
       "b": 463,
       "h": 238,
       "anker": [
        271,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 516,
       "y": 978,
       "b": 418,
       "h": 367,
       "anker": [
        225,
        140
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 978,
       "b": 514,
       "h": 369,
       "anker": [
        241,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 489,
       "b": 514,
       "h": 487,
       "anker": [
        241,
        258
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 526,
       "h": 487,
       "anker": [
        253,
        258
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen9-leien-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      8
     ],
     "bestand": "bouwfasen/planken-steen9-leien-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 1353,
       "b": 527,
       "h": 222,
       "anker": [
        303,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 516,
       "y": 982,
       "b": 449,
       "h": 367,
       "anker": [
        224,
        140
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 982,
       "b": 514,
       "h": 369,
       "anker": [
        273,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 491,
       "b": 514,
       "h": 489,
       "anker": [
        273,
        260
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 525,
       "h": 489,
       "anker": [
        273,
        260
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen9-pannen-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      7
     ],
     "bestand": "bouwfasen/planken-steen9-pannen-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 1379,
       "b": 528,
       "h": 238,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 516,
       "y": 976,
       "b": 418,
       "h": 383,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 976,
       "b": 514,
       "h": 401,
       "anker": [
        241,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 488,
       "b": 514,
       "h": 486,
       "anker": [
        241,
        257
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 525,
       "h": 486,
       "anker": [
        241,
        257
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen9-pannen-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      8
     ],
     "bestand": "bouwfasen/planken-steen9-pannen-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 1375,
       "b": 494,
       "h": 222,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 516,
       "y": 972,
       "b": 448,
       "h": 367,
       "anker": [
        257,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 972,
       "b": 514,
       "h": 401,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 486,
       "b": 514,
       "h": 484,
       "anker": [
        273,
        255
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 524,
       "h": 484,
       "anker": [
        283,
        255
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen9-pannen-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      7
     ],
     "bestand": "bouwfasen/planken-steen9-pannen-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 1279,
       "b": 463,
       "h": 238,
       "anker": [
        271,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 516,
       "y": 908,
       "b": 418,
       "h": 367,
       "anker": [
        225,
        140
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 908,
       "b": 514,
       "h": 369,
       "anker": [
        241,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 454,
       "b": 514,
       "h": 452,
       "anker": [
        241,
        223
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 525,
       "h": 452,
       "anker": [
        252,
        223
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen9-pannen-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      8
     ],
     "bestand": "bouwfasen/planken-steen9-pannen-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 1283,
       "b": 527,
       "h": 222,
       "anker": [
        303,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 516,
       "y": 912,
       "b": 448,
       "h": 367,
       "anker": [
        223,
        140
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 912,
       "b": 514,
       "h": 369,
       "anker": [
        273,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 456,
       "b": 514,
       "h": 454,
       "anker": [
        273,
        225
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 524,
       "h": 454,
       "anker": [
        273,
        225
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen9-baksteen-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      7
     ],
     "bestand": "bouwfasen/planken-steen9-baksteen-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 1379,
       "b": 528,
       "h": 238,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 516,
       "y": 976,
       "b": 418,
       "h": 383,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 976,
       "b": 514,
       "h": 401,
       "anker": [
        241,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 488,
       "b": 514,
       "h": 486,
       "anker": [
        241,
        257
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 525,
       "h": 486,
       "anker": [
        241,
        257
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen9-baksteen-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      8
     ],
     "bestand": "bouwfasen/planken-steen9-baksteen-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 1375,
       "b": 494,
       "h": 222,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 516,
       "y": 972,
       "b": 448,
       "h": 367,
       "anker": [
        257,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 972,
       "b": 514,
       "h": 401,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 486,
       "b": 514,
       "h": 484,
       "anker": [
        273,
        255
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 524,
       "h": 484,
       "anker": [
        283,
        255
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen9-baksteen-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      7
     ],
     "bestand": "bouwfasen/planken-steen9-baksteen-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 1279,
       "b": 463,
       "h": 238,
       "anker": [
        271,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 516,
       "y": 908,
       "b": 418,
       "h": 367,
       "anker": [
        225,
        140
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 908,
       "b": 514,
       "h": 369,
       "anker": [
        241,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 454,
       "b": 514,
       "h": 452,
       "anker": [
        241,
        223
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 525,
       "h": 452,
       "anker": [
        252,
        223
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-steen9-baksteen-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      8
     ],
     "bestand": "bouwfasen/planken-steen9-baksteen-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 1283,
       "b": 527,
       "h": 222,
       "anker": [
        303,
        -5
       ],
       "naam": "fundering"
      },
      {
       "x": 516,
       "y": 912,
       "b": 448,
       "h": 367,
       "anker": [
        223,
        140
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 912,
       "b": 514,
       "h": 369,
       "anker": [
        273,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 456,
       "b": 514,
       "h": 454,
       "anker": [
        273,
        225
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 524,
       "h": 454,
       "anker": [
        273,
        225
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-boerderij2-spanen-z": {
     "gebouw": "boerderij",
     "beslaat": [
      9,
      8
     ],
     "bestand": "bouwfasen/planken-boerderij2-spanen-z.png",
     "fasen": [
      {
       "x": 452,
       "y": 491,
       "b": 496,
       "h": 257,
       "anker": [
        303,
        -2
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 491,
       "b": 450,
       "h": 402,
       "anker": [
        257,
        143
       ],
       "naam": "geraamte"
      },
      {
       "x": 1168,
       "y": 0,
       "b": 578,
       "h": 404,
       "anker": [
        273,
        143
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 588,
       "y": 0,
       "b": 578,
       "h": 489,
       "anker": [
        273,
        228
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 586,
       "h": 489,
       "anker": [
        281,
        228
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-boerderij2-spanen-o": {
     "gebouw": "boerderij",
     "beslaat": [
      8,
      9
     ],
     "bestand": "bouwfasen/planken-boerderij2-spanen-o.png",
     "fasen": [
      {
       "x": 489,
       "y": 497,
       "b": 591,
       "h": 238,
       "anker": [
        335,
        -21
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 497,
       "b": 487,
       "h": 383,
       "anker": [
        230,
        124
       ],
       "naam": "geraamte"
      },
      {
       "x": 1170,
       "y": 0,
       "b": 578,
       "h": 401,
       "anker": [
        305,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 590,
       "y": 0,
       "b": 578,
       "h": 495,
       "anker": [
        305,
        234
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 588,
       "h": 495,
       "anker": [
        305,
        234
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-boerderij2-spanen-n": {
     "gebouw": "boerderij",
     "beslaat": [
      9,
      8
     ],
     "bestand": "bouwfasen/planken-boerderij2-spanen-n.png",
     "fasen": [
      {
       "x": 452,
       "y": 545,
       "b": 591,
       "h": 256,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 545,
       "b": 450,
       "h": 401,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1168,
       "y": 0,
       "b": 578,
       "h": 433,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 588,
       "y": 0,
       "b": 578,
       "h": 543,
       "anker": [
        273,
        282
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 586,
       "h": 543,
       "anker": [
        273,
        282
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-boerderij2-spanen-w": {
     "gebouw": "boerderij",
     "beslaat": [
      8,
      9
     ],
     "bestand": "bouwfasen/planken-boerderij2-spanen-w.png",
     "fasen": [
      {
       "x": 489,
       "y": 539,
       "b": 533,
       "h": 238,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 539,
       "b": 487,
       "h": 383,
       "anker": [
        289,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1170,
       "y": 0,
       "b": 578,
       "h": 433,
       "anker": [
        305,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 590,
       "y": 0,
       "b": 578,
       "h": 537,
       "anker": [
        305,
        276
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 588,
       "h": 537,
       "anker": [
        315,
        276
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-boerderij2-leien-z": {
     "gebouw": "boerderij",
     "beslaat": [
      9,
      8
     ],
     "bestand": "bouwfasen/planken-boerderij2-leien-z.png",
     "fasen": [
      {
       "x": 452,
       "y": 508,
       "b": 496,
       "h": 257,
       "anker": [
        303,
        -2
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 508,
       "b": 450,
       "h": 402,
       "anker": [
        257,
        143
       ],
       "naam": "geraamte"
      },
      {
       "x": 1168,
       "y": 0,
       "b": 578,
       "h": 404,
       "anker": [
        273,
        143
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 588,
       "y": 0,
       "b": 578,
       "h": 506,
       "anker": [
        273,
        245
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 586,
       "h": 506,
       "anker": [
        281,
        245
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-boerderij2-leien-o": {
     "gebouw": "boerderij",
     "beslaat": [
      8,
      9
     ],
     "bestand": "bouwfasen/planken-boerderij2-leien-o.png",
     "fasen": [
      {
       "x": 489,
       "y": 514,
       "b": 591,
       "h": 238,
       "anker": [
        335,
        -21
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 514,
       "b": 487,
       "h": 383,
       "anker": [
        230,
        124
       ],
       "naam": "geraamte"
      },
      {
       "x": 1170,
       "y": 0,
       "b": 578,
       "h": 401,
       "anker": [
        305,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 590,
       "y": 0,
       "b": 578,
       "h": 512,
       "anker": [
        305,
        251
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 588,
       "h": 512,
       "anker": [
        305,
        251
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-boerderij2-leien-n": {
     "gebouw": "boerderij",
     "beslaat": [
      9,
      8
     ],
     "bestand": "bouwfasen/planken-boerderij2-leien-n.png",
     "fasen": [
      {
       "x": 452,
       "y": 562,
       "b": 591,
       "h": 256,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 562,
       "b": 450,
       "h": 401,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1168,
       "y": 0,
       "b": 578,
       "h": 433,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 588,
       "y": 0,
       "b": 578,
       "h": 560,
       "anker": [
        273,
        299
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 586,
       "h": 560,
       "anker": [
        273,
        299
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-boerderij2-leien-w": {
     "gebouw": "boerderij",
     "beslaat": [
      8,
      9
     ],
     "bestand": "bouwfasen/planken-boerderij2-leien-w.png",
     "fasen": [
      {
       "x": 489,
       "y": 556,
       "b": 533,
       "h": 238,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 556,
       "b": 487,
       "h": 383,
       "anker": [
        289,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1170,
       "y": 0,
       "b": 578,
       "h": 433,
       "anker": [
        305,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 590,
       "y": 0,
       "b": 578,
       "h": 554,
       "anker": [
        305,
        293
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 588,
       "h": 554,
       "anker": [
        315,
        293
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-boerderij2-pannen-z": {
     "gebouw": "boerderij",
     "beslaat": [
      9,
      8
     ],
     "bestand": "bouwfasen/planken-boerderij2-pannen-z.png",
     "fasen": [
      {
       "x": 452,
       "y": 472,
       "b": 496,
       "h": 257,
       "anker": [
        303,
        -2
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 472,
       "b": 450,
       "h": 402,
       "anker": [
        257,
        143
       ],
       "naam": "geraamte"
      },
      {
       "x": 1168,
       "y": 0,
       "b": 578,
       "h": 404,
       "anker": [
        273,
        143
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 588,
       "y": 0,
       "b": 578,
       "h": 470,
       "anker": [
        273,
        209
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 586,
       "h": 470,
       "anker": [
        281,
        209
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-boerderij2-pannen-o": {
     "gebouw": "boerderij",
     "beslaat": [
      8,
      9
     ],
     "bestand": "bouwfasen/planken-boerderij2-pannen-o.png",
     "fasen": [
      {
       "x": 489,
       "y": 478,
       "b": 591,
       "h": 238,
       "anker": [
        335,
        -21
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 478,
       "b": 487,
       "h": 383,
       "anker": [
        230,
        124
       ],
       "naam": "geraamte"
      },
      {
       "x": 1170,
       "y": 0,
       "b": 578,
       "h": 401,
       "anker": [
        305,
        140
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 590,
       "y": 0,
       "b": 578,
       "h": 476,
       "anker": [
        305,
        215
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 588,
       "h": 476,
       "anker": [
        305,
        215
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-boerderij2-pannen-n": {
     "gebouw": "boerderij",
     "beslaat": [
      9,
      8
     ],
     "bestand": "bouwfasen/planken-boerderij2-pannen-n.png",
     "fasen": [
      {
       "x": 452,
       "y": 526,
       "b": 591,
       "h": 256,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 526,
       "b": 450,
       "h": 401,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1168,
       "y": 0,
       "b": 578,
       "h": 433,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 588,
       "y": 0,
       "b": 578,
       "h": 524,
       "anker": [
        273,
        263
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 586,
       "h": 524,
       "anker": [
        273,
        263
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-boerderij2-pannen-w": {
     "gebouw": "boerderij",
     "beslaat": [
      8,
      9
     ],
     "bestand": "bouwfasen/planken-boerderij2-pannen-w.png",
     "fasen": [
      {
       "x": 489,
       "y": 520,
       "b": 533,
       "h": 238,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 520,
       "b": 487,
       "h": 383,
       "anker": [
        289,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 1170,
       "y": 0,
       "b": 578,
       "h": 433,
       "anker": [
        305,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 590,
       "y": 0,
       "b": 578,
       "h": 518,
       "anker": [
        305,
        257
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 588,
       "h": 518,
       "anker": [
        315,
        257
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-boerderij5-spanen-z": {
     "gebouw": "boerderij",
     "beslaat": [
      9,
      6
     ],
     "bestand": "bouwfasen/planken-boerderij5-spanen-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 1387,
       "b": 527,
       "h": 238,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 517,
       "y": 984,
       "b": 450,
       "h": 383,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 984,
       "b": 515,
       "h": 401,
       "anker": [
        209,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 492,
       "b": 515,
       "h": 490,
       "anker": [
        209,
        261
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 522,
       "h": 490,
       "anker": [
        209,
        261
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-boerderij5-spanen-o": {
     "gebouw": "boerderij",
     "beslaat": [
      6,
      9
     ],
     "bestand": "bouwfasen/planken-boerderij5-spanen-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 1383,
       "b": 496,
       "h": 238,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 517,
       "y": 980,
       "b": 450,
       "h": 383,
       "anker": [
        289,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 980,
       "b": 515,
       "h": 401,
       "anker": [
        306,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 490,
       "b": 515,
       "h": 488,
       "anker": [
        306,
        259
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 526,
       "h": 488,
       "anker": [
        317,
        259
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-boerderij5-spanen-n": {
     "gebouw": "boerderij",
     "beslaat": [
      9,
      6
     ],
     "bestand": "bouwfasen/planken-boerderij5-spanen-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 1335,
       "b": 495,
       "h": 238,
       "anker": [
        239,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 517,
       "y": 948,
       "b": 450,
       "h": 383,
       "anker": [
        193,
        156
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 948,
       "b": 515,
       "h": 385,
       "anker": [
        210,
        156
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 474,
       "b": 515,
       "h": 472,
       "anker": [
        210,
        243
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 522,
       "h": 472,
       "anker": [
        217,
        243
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-boerderij5-spanen-w": {
     "gebouw": "boerderij",
     "beslaat": [
      6,
      9
     ],
     "bestand": "bouwfasen/planken-boerderij5-spanen-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 1339,
       "b": 527,
       "h": 238,
       "anker": [
        335,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 517,
       "y": 952,
       "b": 450,
       "h": 383,
       "anker": [
        257,
        156
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 952,
       "b": 515,
       "h": 385,
       "anker": [
        305,
        156
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 476,
       "b": 515,
       "h": 474,
       "anker": [
        305,
        245
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 526,
       "h": 474,
       "anker": [
        305,
        245
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-boerderij5-leien-z": {
     "gebouw": "boerderij",
     "beslaat": [
      9,
      6
     ],
     "bestand": "bouwfasen/planken-boerderij5-leien-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 1417,
       "b": 527,
       "h": 238,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 517,
       "y": 1014,
       "b": 450,
       "h": 383,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 1014,
       "b": 515,
       "h": 401,
       "anker": [
        209,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 507,
       "b": 515,
       "h": 505,
       "anker": [
        209,
        276
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 522,
       "h": 505,
       "anker": [
        209,
        276
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-boerderij5-leien-o": {
     "gebouw": "boerderij",
     "beslaat": [
      6,
      9
     ],
     "bestand": "bouwfasen/planken-boerderij5-leien-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 1411,
       "b": 496,
       "h": 238,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 517,
       "y": 1008,
       "b": 450,
       "h": 383,
       "anker": [
        289,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 1008,
       "b": 515,
       "h": 401,
       "anker": [
        306,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 504,
       "b": 515,
       "h": 502,
       "anker": [
        306,
        273
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 526,
       "h": 502,
       "anker": [
        317,
        273
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-boerderij5-leien-n": {
     "gebouw": "boerderij",
     "beslaat": [
      9,
      6
     ],
     "bestand": "bouwfasen/planken-boerderij5-leien-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 1363,
       "b": 495,
       "h": 238,
       "anker": [
        239,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 517,
       "y": 976,
       "b": 450,
       "h": 383,
       "anker": [
        193,
        156
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 976,
       "b": 515,
       "h": 385,
       "anker": [
        210,
        156
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 488,
       "b": 515,
       "h": 486,
       "anker": [
        210,
        257
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 522,
       "h": 486,
       "anker": [
        217,
        257
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-boerderij5-leien-w": {
     "gebouw": "boerderij",
     "beslaat": [
      6,
      9
     ],
     "bestand": "bouwfasen/planken-boerderij5-leien-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 1369,
       "b": 527,
       "h": 238,
       "anker": [
        335,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 517,
       "y": 982,
       "b": 450,
       "h": 383,
       "anker": [
        257,
        156
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 982,
       "b": 515,
       "h": 385,
       "anker": [
        305,
        156
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 491,
       "b": 515,
       "h": 489,
       "anker": [
        305,
        260
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 526,
       "h": 489,
       "anker": [
        305,
        260
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-boerderij5-pannen-z": {
     "gebouw": "boerderij",
     "beslaat": [
      9,
      6
     ],
     "bestand": "bouwfasen/planken-boerderij5-pannen-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 1355,
       "b": 527,
       "h": 238,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 517,
       "y": 952,
       "b": 450,
       "h": 383,
       "anker": [
        161,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 952,
       "b": 515,
       "h": 401,
       "anker": [
        209,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 476,
       "b": 515,
       "h": 474,
       "anker": [
        209,
        245
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 523,
       "h": 474,
       "anker": [
        209,
        245
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-boerderij5-pannen-o": {
     "gebouw": "boerderij",
     "beslaat": [
      6,
      9
     ],
     "bestand": "bouwfasen/planken-boerderij5-pannen-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 1349,
       "b": 496,
       "h": 238,
       "anker": [
        335,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 517,
       "y": 946,
       "b": 450,
       "h": 383,
       "anker": [
        289,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 946,
       "b": 515,
       "h": 401,
       "anker": [
        306,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 473,
       "b": 515,
       "h": 471,
       "anker": [
        306,
        242
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 527,
       "h": 471,
       "anker": [
        318,
        242
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-boerderij5-pannen-n": {
     "gebouw": "boerderij",
     "beslaat": [
      9,
      6
     ],
     "bestand": "bouwfasen/planken-boerderij5-pannen-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 1301,
       "b": 495,
       "h": 238,
       "anker": [
        239,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 517,
       "y": 914,
       "b": 450,
       "h": 383,
       "anker": [
        193,
        156
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 914,
       "b": 515,
       "h": 385,
       "anker": [
        210,
        156
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 457,
       "b": 515,
       "h": 455,
       "anker": [
        210,
        226
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 523,
       "h": 455,
       "anker": [
        218,
        226
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "planken-boerderij5-pannen-w": {
     "gebouw": "boerderij",
     "beslaat": [
      6,
      9
     ],
     "bestand": "bouwfasen/planken-boerderij5-pannen-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 1307,
       "b": 527,
       "h": 238,
       "anker": [
        335,
        11
       ],
       "naam": "fundering"
      },
      {
       "x": 517,
       "y": 920,
       "b": 450,
       "h": 383,
       "anker": [
        257,
        156
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 920,
       "b": 515,
       "h": 385,
       "anker": [
        305,
        156
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 0,
       "y": 460,
       "b": 515,
       "h": 458,
       "anker": [
        305,
        229
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 526,
       "h": 458,
       "anker": [
        305,
        229
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-huis10-riet-z": {
     "gebouw": "huis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/roze-huis10-riet-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 1156,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 442,
       "y": 641,
       "b": 386,
       "h": 511,
       "anker": [
        161,
        332
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 641,
       "b": 440,
       "h": 513,
       "anker": [
        188,
        332
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 516,
       "y": 0,
       "b": 472,
       "h": 639,
       "anker": [
        204,
        458
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 514,
       "h": 639,
       "anker": [
        225,
        458
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-huis10-riet-o": {
     "gebouw": "huis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/roze-huis10-riet-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 1147,
       "b": 432,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 443,
       "y": 632,
       "b": 386,
       "h": 511,
       "anker": [
        225,
        332
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 632,
       "b": 441,
       "h": 513,
       "anker": [
        248,
        332
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 516,
       "y": 0,
       "b": 472,
       "h": 630,
       "anker": [
        268,
        449
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 514,
       "h": 630,
       "anker": [
        289,
        449
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-huis10-riet-n": {
     "gebouw": "huis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/roze-huis10-riet-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 1147,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 442,
       "y": 632,
       "b": 386,
       "h": 511,
       "anker": [
        161,
        332
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 632,
       "b": 440,
       "h": 513,
       "anker": [
        188,
        332
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 516,
       "y": 0,
       "b": 472,
       "h": 630,
       "anker": [
        204,
        449
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 514,
       "h": 630,
       "anker": [
        225,
        449
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-huis10-riet-w": {
     "gebouw": "huis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/roze-huis10-riet-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 1156,
       "b": 431,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 443,
       "y": 641,
       "b": 386,
       "h": 511,
       "anker": [
        225,
        332
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 641,
       "b": 441,
       "h": 513,
       "anker": [
        257,
        332
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 516,
       "y": 0,
       "b": 472,
       "h": 639,
       "anker": [
        268,
        458
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 514,
       "h": 639,
       "anker": [
        289,
        458
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-huis10-leien-z": {
     "gebouw": "huis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/roze-huis10-leien-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 1117,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 442,
       "y": 622,
       "b": 386,
       "h": 491,
       "anker": [
        161,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 622,
       "b": 440,
       "h": 493,
       "anker": [
        188,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 488,
       "y": 0,
       "b": 464,
       "h": 620,
       "anker": [
        200,
        439
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 486,
       "h": 620,
       "anker": [
        211,
        439
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-huis10-leien-o": {
     "gebouw": "huis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/roze-huis10-leien-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 1107,
       "b": 432,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 443,
       "y": 612,
       "b": 386,
       "h": 491,
       "anker": [
        225,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 612,
       "b": 441,
       "h": 493,
       "anker": [
        248,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 488,
       "y": 0,
       "b": 464,
       "h": 610,
       "anker": [
        264,
        429
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 486,
       "h": 610,
       "anker": [
        275,
        429
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-huis10-leien-n": {
     "gebouw": "huis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/roze-huis10-leien-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 1107,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 442,
       "y": 612,
       "b": 386,
       "h": 491,
       "anker": [
        161,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 612,
       "b": 440,
       "h": 493,
       "anker": [
        188,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 488,
       "y": 0,
       "b": 464,
       "h": 610,
       "anker": [
        200,
        429
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 486,
       "h": 610,
       "anker": [
        211,
        429
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-huis10-leien-w": {
     "gebouw": "huis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/roze-huis10-leien-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 1117,
       "b": 431,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 443,
       "y": 622,
       "b": 386,
       "h": 491,
       "anker": [
        225,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 622,
       "b": 441,
       "h": 493,
       "anker": [
        257,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 488,
       "y": 0,
       "b": 464,
       "h": 620,
       "anker": [
        264,
        439
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 486,
       "h": 620,
       "anker": [
        275,
        439
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-huis10-pannen-z": {
     "gebouw": "huis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/roze-huis10-pannen-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 1083,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 442,
       "y": 588,
       "b": 386,
       "h": 491,
       "anker": [
        161,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 588,
       "b": 440,
       "h": 493,
       "anker": [
        188,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 488,
       "y": 0,
       "b": 465,
       "h": 586,
       "anker": [
        201,
        405
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 486,
       "h": 586,
       "anker": [
        211,
        405
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-huis10-pannen-o": {
     "gebouw": "huis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/roze-huis10-pannen-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 1073,
       "b": 432,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 443,
       "y": 578,
       "b": 386,
       "h": 491,
       "anker": [
        225,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 578,
       "b": 441,
       "h": 493,
       "anker": [
        248,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 488,
       "y": 0,
       "b": 465,
       "h": 576,
       "anker": [
        265,
        395
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 486,
       "h": 576,
       "anker": [
        275,
        395
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-huis10-pannen-n": {
     "gebouw": "huis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/roze-huis10-pannen-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 1073,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 442,
       "y": 578,
       "b": 386,
       "h": 491,
       "anker": [
        161,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 578,
       "b": 440,
       "h": 493,
       "anker": [
        188,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 488,
       "y": 0,
       "b": 465,
       "h": 576,
       "anker": [
        200,
        395
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 486,
       "h": 576,
       "anker": [
        211,
        395
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-huis10-pannen-w": {
     "gebouw": "huis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/roze-huis10-pannen-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 1083,
       "b": 431,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 443,
       "y": 588,
       "b": 386,
       "h": 491,
       "anker": [
        225,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 588,
       "b": 441,
       "h": 493,
       "anker": [
        257,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 488,
       "y": 0,
       "b": 465,
       "h": 586,
       "anker": [
        264,
        405
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 486,
       "h": 586,
       "anker": [
        275,
        405
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-steen10-leien-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/roze-steen10-leien-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 1117,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 442,
       "y": 622,
       "b": 386,
       "h": 491,
       "anker": [
        161,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 622,
       "b": 440,
       "h": 493,
       "anker": [
        188,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 488,
       "y": 0,
       "b": 464,
       "h": 620,
       "anker": [
        200,
        439
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 486,
       "h": 620,
       "anker": [
        211,
        439
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-steen10-leien-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/roze-steen10-leien-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 1107,
       "b": 432,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 443,
       "y": 612,
       "b": 386,
       "h": 491,
       "anker": [
        225,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 612,
       "b": 441,
       "h": 493,
       "anker": [
        248,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 488,
       "y": 0,
       "b": 464,
       "h": 610,
       "anker": [
        264,
        429
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 486,
       "h": 610,
       "anker": [
        275,
        429
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-steen10-leien-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/roze-steen10-leien-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 1107,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 442,
       "y": 612,
       "b": 386,
       "h": 491,
       "anker": [
        161,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 612,
       "b": 440,
       "h": 493,
       "anker": [
        188,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 488,
       "y": 0,
       "b": 464,
       "h": 610,
       "anker": [
        200,
        429
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 486,
       "h": 610,
       "anker": [
        211,
        429
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-steen10-leien-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/roze-steen10-leien-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 1117,
       "b": 431,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 443,
       "y": 622,
       "b": 386,
       "h": 491,
       "anker": [
        225,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 622,
       "b": 441,
       "h": 493,
       "anker": [
        257,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 488,
       "y": 0,
       "b": 464,
       "h": 620,
       "anker": [
        264,
        439
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 486,
       "h": 620,
       "anker": [
        275,
        439
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-steen10-pannen-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/roze-steen10-pannen-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 1083,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 442,
       "y": 588,
       "b": 386,
       "h": 491,
       "anker": [
        161,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 588,
       "b": 440,
       "h": 493,
       "anker": [
        188,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 488,
       "y": 0,
       "b": 465,
       "h": 586,
       "anker": [
        201,
        405
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 486,
       "h": 586,
       "anker": [
        211,
        405
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-steen10-pannen-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/roze-steen10-pannen-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 1073,
       "b": 432,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 443,
       "y": 578,
       "b": 386,
       "h": 491,
       "anker": [
        225,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 578,
       "b": 441,
       "h": 493,
       "anker": [
        248,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 488,
       "y": 0,
       "b": 465,
       "h": 576,
       "anker": [
        265,
        395
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 486,
       "h": 576,
       "anker": [
        275,
        395
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-steen10-pannen-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/roze-steen10-pannen-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 1073,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 442,
       "y": 578,
       "b": 386,
       "h": 491,
       "anker": [
        161,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 578,
       "b": 440,
       "h": 493,
       "anker": [
        188,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 488,
       "y": 0,
       "b": 465,
       "h": 576,
       "anker": [
        200,
        395
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 486,
       "h": 576,
       "anker": [
        211,
        395
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-steen10-pannen-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/roze-steen10-pannen-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 1083,
       "b": 431,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 443,
       "y": 588,
       "b": 386,
       "h": 491,
       "anker": [
        225,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 588,
       "b": 441,
       "h": 493,
       "anker": [
        257,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 488,
       "y": 0,
       "b": 465,
       "h": 586,
       "anker": [
        264,
        405
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 486,
       "h": 586,
       "anker": [
        275,
        405
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-steen10-baksteen-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/roze-steen10-baksteen-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 1083,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 442,
       "y": 588,
       "b": 386,
       "h": 491,
       "anker": [
        161,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 588,
       "b": 440,
       "h": 493,
       "anker": [
        188,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 488,
       "y": 0,
       "b": 465,
       "h": 586,
       "anker": [
        201,
        405
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 486,
       "h": 586,
       "anker": [
        211,
        405
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-steen10-baksteen-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/roze-steen10-baksteen-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 1073,
       "b": 432,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 443,
       "y": 578,
       "b": 386,
       "h": 491,
       "anker": [
        225,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 578,
       "b": 441,
       "h": 493,
       "anker": [
        248,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 488,
       "y": 0,
       "b": 465,
       "h": 576,
       "anker": [
        265,
        395
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 486,
       "h": 576,
       "anker": [
        275,
        395
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-steen10-baksteen-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      7,
      5
     ],
     "bestand": "bouwfasen/roze-steen10-baksteen-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 1073,
       "b": 431,
       "h": 206,
       "anker": [
        207,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 442,
       "y": 578,
       "b": 386,
       "h": 491,
       "anker": [
        161,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 578,
       "b": 440,
       "h": 493,
       "anker": [
        188,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 488,
       "y": 0,
       "b": 465,
       "h": 576,
       "anker": [
        200,
        395
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 486,
       "h": 576,
       "anker": [
        211,
        395
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-steen10-baksteen-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      5,
      7
     ],
     "bestand": "bouwfasen/roze-steen10-baksteen-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 1083,
       "b": 431,
       "h": 206,
       "anker": [
        271,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 443,
       "y": 588,
       "b": 386,
       "h": 491,
       "anker": [
        225,
        312
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 588,
       "b": 441,
       "h": 493,
       "anker": [
        257,
        312
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 488,
       "y": 0,
       "b": 465,
       "h": 586,
       "anker": [
        264,
        405
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 486,
       "h": 586,
       "anker": [
        275,
        405
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-huis11-riet-z": {
     "gebouw": "huis",
     "beslaat": [
      8,
      6
     ],
     "bestand": "bouwfasen/roze-huis11-riet-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 952,
       "b": 496,
       "h": 238,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 545,
       "b": 450,
       "h": 403,
       "anker": [
        193,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 545,
       "b": 482,
       "h": 405,
       "anker": [
        209,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 529,
       "y": 0,
       "b": 482,
       "h": 543,
       "anker": [
        209,
        330
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 527,
       "h": 543,
       "anker": [
        232,
        330
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-huis11-riet-o": {
     "gebouw": "huis",
     "beslaat": [
      6,
      8
     ],
     "bestand": "bouwfasen/roze-huis11-riet-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 947,
       "b": 495,
       "h": 238,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 540,
       "b": 450,
       "h": 403,
       "anker": [
        257,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 540,
       "b": 482,
       "h": 405,
       "anker": [
        273,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 529,
       "y": 0,
       "b": 482,
       "h": 538,
       "anker": [
        273,
        325
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 527,
       "h": 538,
       "anker": [
        296,
        325
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-huis11-riet-n": {
     "gebouw": "huis",
     "beslaat": [
      8,
      6
     ],
     "bestand": "bouwfasen/roze-huis11-riet-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 947,
       "b": 495,
       "h": 238,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 540,
       "b": 450,
       "h": 403,
       "anker": [
        193,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 540,
       "b": 482,
       "h": 405,
       "anker": [
        209,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 529,
       "y": 0,
       "b": 482,
       "h": 538,
       "anker": [
        209,
        325
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 527,
       "h": 538,
       "anker": [
        231,
        325
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-huis11-riet-w": {
     "gebouw": "huis",
     "beslaat": [
      6,
      8
     ],
     "bestand": "bouwfasen/roze-huis11-riet-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 952,
       "b": 495,
       "h": 238,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 545,
       "b": 450,
       "h": 403,
       "anker": [
        257,
        192
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 545,
       "b": 482,
       "h": 405,
       "anker": [
        273,
        192
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 529,
       "y": 0,
       "b": 482,
       "h": 543,
       "anker": [
        273,
        330
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 527,
       "h": 543,
       "anker": [
        295,
        330
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-huis11-leien-z": {
     "gebouw": "huis",
     "beslaat": [
      8,
      6
     ],
     "bestand": "bouwfasen/roze-huis11-leien-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 914,
       "b": 496,
       "h": 238,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 527,
       "b": 450,
       "h": 383,
       "anker": [
        193,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 527,
       "b": 482,
       "h": 385,
       "anker": [
        209,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 499,
       "y": 0,
       "b": 482,
       "h": 525,
       "anker": [
        209,
        312
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 497,
       "h": 525,
       "anker": [
        217,
        312
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-huis11-leien-o": {
     "gebouw": "huis",
     "beslaat": [
      6,
      8
     ],
     "bestand": "bouwfasen/roze-huis11-leien-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 909,
       "b": 495,
       "h": 238,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 522,
       "b": 450,
       "h": 383,
       "anker": [
        257,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 522,
       "b": 482,
       "h": 385,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 500,
       "y": 0,
       "b": 482,
       "h": 520,
       "anker": [
        273,
        307
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 498,
       "h": 520,
       "anker": [
        281,
        307
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-huis11-leien-n": {
     "gebouw": "huis",
     "beslaat": [
      8,
      6
     ],
     "bestand": "bouwfasen/roze-huis11-leien-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 909,
       "b": 495,
       "h": 238,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 522,
       "b": 450,
       "h": 383,
       "anker": [
        193,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 522,
       "b": 482,
       "h": 385,
       "anker": [
        209,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 500,
       "y": 0,
       "b": 482,
       "h": 520,
       "anker": [
        209,
        307
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 498,
       "h": 520,
       "anker": [
        217,
        307
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-huis11-leien-w": {
     "gebouw": "huis",
     "beslaat": [
      6,
      8
     ],
     "bestand": "bouwfasen/roze-huis11-leien-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 914,
       "b": 495,
       "h": 238,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 527,
       "b": 450,
       "h": 383,
       "anker": [
        257,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 527,
       "b": 482,
       "h": 385,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 499,
       "y": 0,
       "b": 482,
       "h": 525,
       "anker": [
        273,
        312
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 497,
       "h": 525,
       "anker": [
        280,
        312
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-huis11-pannen-z": {
     "gebouw": "huis",
     "beslaat": [
      8,
      6
     ],
     "bestand": "bouwfasen/roze-huis11-pannen-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 873,
       "b": 496,
       "h": 238,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 486,
       "b": 450,
       "h": 383,
       "anker": [
        193,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 486,
       "b": 482,
       "h": 385,
       "anker": [
        209,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 500,
       "y": 0,
       "b": 482,
       "h": 484,
       "anker": [
        209,
        271
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 498,
       "h": 484,
       "anker": [
        217,
        271
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-huis11-pannen-o": {
     "gebouw": "huis",
     "beslaat": [
      6,
      8
     ],
     "bestand": "bouwfasen/roze-huis11-pannen-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 868,
       "b": 495,
       "h": 238,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 481,
       "b": 450,
       "h": 383,
       "anker": [
        257,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 481,
       "b": 482,
       "h": 385,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 500,
       "y": 0,
       "b": 482,
       "h": 479,
       "anker": [
        273,
        266
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 498,
       "h": 479,
       "anker": [
        281,
        266
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-huis11-pannen-n": {
     "gebouw": "huis",
     "beslaat": [
      8,
      6
     ],
     "bestand": "bouwfasen/roze-huis11-pannen-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 868,
       "b": 495,
       "h": 238,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 481,
       "b": 450,
       "h": 383,
       "anker": [
        193,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 481,
       "b": 482,
       "h": 385,
       "anker": [
        209,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 500,
       "y": 0,
       "b": 482,
       "h": 479,
       "anker": [
        209,
        266
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 498,
       "h": 479,
       "anker": [
        217,
        266
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-huis11-pannen-w": {
     "gebouw": "huis",
     "beslaat": [
      6,
      8
     ],
     "bestand": "bouwfasen/roze-huis11-pannen-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 873,
       "b": 495,
       "h": 238,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 486,
       "b": 450,
       "h": 383,
       "anker": [
        257,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 486,
       "b": 482,
       "h": 385,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 500,
       "y": 0,
       "b": 482,
       "h": 484,
       "anker": [
        273,
        271
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 498,
       "h": 484,
       "anker": [
        281,
        271
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-steen11-leien-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      6
     ],
     "bestand": "bouwfasen/roze-steen11-leien-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 914,
       "b": 496,
       "h": 238,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 527,
       "b": 450,
       "h": 383,
       "anker": [
        193,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 527,
       "b": 482,
       "h": 385,
       "anker": [
        209,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 499,
       "y": 0,
       "b": 482,
       "h": 525,
       "anker": [
        209,
        312
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 497,
       "h": 525,
       "anker": [
        217,
        312
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-steen11-leien-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      6,
      8
     ],
     "bestand": "bouwfasen/roze-steen11-leien-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 909,
       "b": 495,
       "h": 238,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 522,
       "b": 450,
       "h": 383,
       "anker": [
        257,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 522,
       "b": 482,
       "h": 385,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 500,
       "y": 0,
       "b": 482,
       "h": 520,
       "anker": [
        273,
        307
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 498,
       "h": 520,
       "anker": [
        281,
        307
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-steen11-leien-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      6
     ],
     "bestand": "bouwfasen/roze-steen11-leien-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 909,
       "b": 495,
       "h": 238,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 522,
       "b": 450,
       "h": 383,
       "anker": [
        193,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 522,
       "b": 482,
       "h": 385,
       "anker": [
        209,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 500,
       "y": 0,
       "b": 482,
       "h": 520,
       "anker": [
        209,
        307
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 498,
       "h": 520,
       "anker": [
        217,
        307
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-steen11-leien-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      6,
      8
     ],
     "bestand": "bouwfasen/roze-steen11-leien-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 914,
       "b": 495,
       "h": 238,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 527,
       "b": 450,
       "h": 383,
       "anker": [
        257,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 527,
       "b": 482,
       "h": 385,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 499,
       "y": 0,
       "b": 482,
       "h": 525,
       "anker": [
        273,
        312
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 497,
       "h": 525,
       "anker": [
        280,
        312
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-steen11-pannen-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      6
     ],
     "bestand": "bouwfasen/roze-steen11-pannen-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 873,
       "b": 496,
       "h": 238,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 486,
       "b": 450,
       "h": 383,
       "anker": [
        193,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 486,
       "b": 482,
       "h": 385,
       "anker": [
        209,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 500,
       "y": 0,
       "b": 482,
       "h": 484,
       "anker": [
        209,
        271
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 498,
       "h": 484,
       "anker": [
        217,
        271
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-steen11-pannen-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      6,
      8
     ],
     "bestand": "bouwfasen/roze-steen11-pannen-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 868,
       "b": 495,
       "h": 238,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 481,
       "b": 450,
       "h": 383,
       "anker": [
        257,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 481,
       "b": 482,
       "h": 385,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 500,
       "y": 0,
       "b": 482,
       "h": 479,
       "anker": [
        273,
        266
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 498,
       "h": 479,
       "anker": [
        281,
        266
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-steen11-pannen-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      6
     ],
     "bestand": "bouwfasen/roze-steen11-pannen-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 868,
       "b": 495,
       "h": 238,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 481,
       "b": 450,
       "h": 383,
       "anker": [
        193,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 481,
       "b": 482,
       "h": 385,
       "anker": [
        209,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 500,
       "y": 0,
       "b": 482,
       "h": 479,
       "anker": [
        209,
        266
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 498,
       "h": 479,
       "anker": [
        217,
        266
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-steen11-pannen-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      6,
      8
     ],
     "bestand": "bouwfasen/roze-steen11-pannen-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 873,
       "b": 495,
       "h": 238,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 486,
       "b": 450,
       "h": 383,
       "anker": [
        257,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 486,
       "b": 482,
       "h": 385,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 500,
       "y": 0,
       "b": 482,
       "h": 484,
       "anker": [
        273,
        271
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 498,
       "h": 484,
       "anker": [
        281,
        271
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-steen11-baksteen-z": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      6
     ],
     "bestand": "bouwfasen/roze-steen11-baksteen-z.png",
     "fasen": [
      {
       "x": 0,
       "y": 873,
       "b": 496,
       "h": 238,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 486,
       "b": 450,
       "h": 383,
       "anker": [
        193,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 486,
       "b": 482,
       "h": 385,
       "anker": [
        209,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 500,
       "y": 0,
       "b": 482,
       "h": 484,
       "anker": [
        209,
        271
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 498,
       "h": 484,
       "anker": [
        217,
        271
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-steen11-baksteen-o": {
     "gebouw": "stenenHuis",
     "beslaat": [
      6,
      8
     ],
     "bestand": "bouwfasen/roze-steen11-baksteen-o.png",
     "fasen": [
      {
       "x": 0,
       "y": 868,
       "b": 495,
       "h": 238,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 481,
       "b": 450,
       "h": 383,
       "anker": [
        257,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 481,
       "b": 482,
       "h": 385,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 500,
       "y": 0,
       "b": 482,
       "h": 479,
       "anker": [
        273,
        266
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 498,
       "h": 479,
       "anker": [
        281,
        266
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-steen11-baksteen-n": {
     "gebouw": "stenenHuis",
     "beslaat": [
      8,
      6
     ],
     "bestand": "bouwfasen/roze-steen11-baksteen-n.png",
     "fasen": [
      {
       "x": 0,
       "y": 868,
       "b": 495,
       "h": 238,
       "anker": [
        239,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 481,
       "b": 450,
       "h": 383,
       "anker": [
        193,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 481,
       "b": 482,
       "h": 385,
       "anker": [
        209,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 500,
       "y": 0,
       "b": 482,
       "h": 479,
       "anker": [
        209,
        266
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 498,
       "h": 479,
       "anker": [
        217,
        266
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-steen11-baksteen-w": {
     "gebouw": "stenenHuis",
     "beslaat": [
      6,
      8
     ],
     "bestand": "bouwfasen/roze-steen11-baksteen-w.png",
     "fasen": [
      {
       "x": 0,
       "y": 873,
       "b": 495,
       "h": 238,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 484,
       "y": 486,
       "b": 450,
       "h": 383,
       "anker": [
        257,
        172
       ],
       "naam": "geraamte"
      },
      {
       "x": 0,
       "y": 486,
       "b": 482,
       "h": 385,
       "anker": [
        273,
        172
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 500,
       "y": 0,
       "b": 482,
       "h": 484,
       "anker": [
        273,
        271
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 498,
       "h": 484,
       "anker": [
        281,
        271
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-huis12-riet-z": {
     "gebouw": "huis",
     "beslaat": [
      9,
      8
     ],
     "bestand": "bouwfasen/roze-huis12-riet-z.png",
     "fasen": [
      {
       "x": 452,
       "y": 600,
       "b": 496,
       "h": 264,
       "anker": [
        303,
        5
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 600,
       "b": 450,
       "h": 486,
       "anker": [
        257,
        227
       ],
       "naam": "geraamte"
      },
      {
       "x": 1203,
       "y": 0,
       "b": 578,
       "h": 488,
       "anker": [
        273,
        227
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 602,
       "y": 0,
       "b": 599,
       "h": 598,
       "anker": [
        294,
        337
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 600,
       "h": 598,
       "anker": [
        295,
        337
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-huis12-riet-o": {
     "gebouw": "huis",
     "beslaat": [
      8,
      9
     ],
     "bestand": "bouwfasen/roze-huis12-riet-o.png",
     "fasen": [
      {
       "x": 504,
       "y": 589,
       "b": 591,
       "h": 238,
       "anker": [
        335,
        -21
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 589,
       "b": 502,
       "h": 459,
       "anker": [
        245,
        200
       ],
       "naam": "geraamte"
      },
      {
       "x": 1206,
       "y": 0,
       "b": 578,
       "h": 461,
       "anker": [
        305,
        200
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 605,
       "y": 0,
       "b": 599,
       "h": 587,
       "anker": [
        305,
        326
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 603,
       "h": 587,
       "anker": [
        305,
        326
       ],
       "naam": "half-gedekt"
      }
     ]
    },
    "roze-huis12-riet-n": {
     "gebouw": "huis",
     "beslaat": [
      9,
      8
     ],
     "bestand": "bouwfasen/roze-huis12-riet-n.png",
     "fasen": [
      {
       "x": 452,
       "y": 637,
       "b": 591,
       "h": 264,
       "anker": [
        303,
        27
       ],
       "naam": "fundering"
      },
      {
       "x": 0,
       "y": 637,
       "b": 450,
       "h": 485,
       "anker": [
        161,
        248
       ],
       "naam": "geraamte"
      },
      {
       "x": 1203,
       "y": 0,
       "b": 578,
       "h": 509,
       "anker": [
        273,
        248
       ],
       "naam": "muren-steigers"
      },
      {
       "x": 602,
       "y": 0,
       "b": 599,
       "h": 635,
       "anker": [
        273,
        374
       ],
       "naam": "dakgebinte"
      },
      {
       "x": 0,
       "y": 0,
       "b": 600,
       "h": 635,
       "anker": [
        273,
        374
       ],
       "naam": "half-gedekt"
      }
     ]
    }
   }
  };
})(globalThis.Spel = globalThis.Spel || {});
