// Gemaakt door gereedschap/pixelart/naar-spel.cjs — niet met de hand bijwerken.
// Dezelfde inhoud als beschrijving.json, als script, zodat file:// het ook kan lezen.
(function (T) {
  T.BEELDEN = {
   "tegel": [
    64,
    32
   ],
   "figuren": {
    "tovenaar": {
     "naam": "tovenaar",
     "cel": [
      112,
      148
     ],
     "anker": [
      56,
      115
     ],
     "snelheid": {
      "84": 2.5,
      "92": 2.1,
      "99": 1.8
     },
     "richtingen": [
      "Z",
      "ZW",
      "W",
      "NW",
      "N",
      "NO",
      "O",
      "ZO"
     ],
     "houdingen": {
      "staan": {
       "bestand": "tovenaar-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen-84": {
       "bestand": "tovenaar-lopen-84.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "leeftijd": 84,
       "snelheid": 2.5,
       "stap": 1
      },
      "lopen-92": {
       "bestand": "tovenaar-lopen-92.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "leeftijd": 92,
       "snelheid": 2.1,
       "stap": 0.84
      },
      "lopen-99": {
       "bestand": "tovenaar-lopen-99.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "leeftijd": 99,
       "snelheid": 1.8,
       "stap": 0.72
      },
      "slaan": {
       "bestand": "tovenaar-slaan.png",
       "beelden": 6,
       "fps": 12,
       "herhaal": false
      },
      "spreuk": {
       "bestand": "tovenaar-spreuk.png",
       "beelden": 6,
       "fps": 12,
       "herhaal": false
      },
      "geraakt": {
       "bestand": "tovenaar-geraakt.png",
       "beelden": 3,
       "fps": 12,
       "herhaal": false
      },
      "sterven": {
       "bestand": "tovenaar-sterven.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": false,
       "leeftijd": 100
      }
     }
    },
    "wim": {
     "naam": "wim",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 2,
     "richtingen": [
      "Z",
      "ZW",
      "W",
      "NW",
      "N",
      "NO",
      "O",
      "ZO"
     ],
     "houdingen": {
      "staan": {
       "bestand": "wim-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "wim-lopen.png",
       "beelden": 8,
       "fps": 12,
       "herhaal": true,
       "snelheid": 2,
       "stap": 0.667
      },
      "praten": {
       "bestand": "wim-praten.png",
       "beelden": 6,
       "fps": 6,
       "herhaal": true
      },
      "vegen": {
       "bestand": "wim-vegen.png",
       "beelden": 8,
       "fps": 8,
       "herhaal": true
      }
     }
    },
    "skelet": {
     "naam": "skelet",
     "cel": [
      112,
      146
     ],
     "anker": [
      56,
      111
     ],
     "snelheid": 2.2,
     "richtingen": [
      "Z",
      "ZW",
      "W",
      "NW",
      "N",
      "NO",
      "O",
      "ZO"
     ],
     "houdingen": {
      "staan": {
       "bestand": "skelet-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "skelet-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 2.2,
       "stap": 0.88
      },
      "aanval": {
       "bestand": "skelet-aanval.png",
       "beelden": 6,
       "fps": 12,
       "herhaal": false
      },
      "geraakt": {
       "bestand": "skelet-geraakt.png",
       "beelden": 3,
       "fps": 12,
       "herhaal": false
      },
      "sterven": {
       "bestand": "skelet-sterven.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": false
      }
     }
    },
    "slijm": {
     "naam": "slijm",
     "cel": [
      112,
      130
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 1.4,
     "richtingen": [
      "Z",
      "ZW",
      "W",
      "NW",
      "N",
      "NO",
      "O",
      "ZO"
     ],
     "houdingen": {
      "staan": {
       "bestand": "slijm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "slijm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56
      },
      "aanval": {
       "bestand": "slijm-aanval.png",
       "beelden": 6,
       "fps": 12,
       "herhaal": false
      },
      "geraakt": {
       "bestand": "slijm-geraakt.png",
       "beelden": 3,
       "fps": 12,
       "herhaal": false
      },
      "sterven": {
       "bestand": "slijm-sterven.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": false
      }
     }
    },
    "wolf": {
     "naam": "wolf",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 3.5,
     "snelheidEenheid": "tegels per seconde",
     "richtingen": [
      "Z",
      "ZW",
      "W",
      "NW",
      "N",
      "NO",
      "O",
      "ZO"
     ],
     "houdingen": {
      "staan": {
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "bestand": "wolf-staan.png"
      },
      "lopen": {
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "bestand": "wolf-lopen.png",
       "cel": [
        112,
        132
       ],
       "anker": [
        56,
        114
       ],
       "stap": 1.4
      },
      "aanval": {
       "beelden": 6,
       "fps": 12,
       "herhaal": false,
       "bestand": "wolf-aanval.png",
       "cel": [
        144,
        136
       ],
       "anker": [
        72,
        116
       ]
      },
      "geraakt": {
       "beelden": 3,
       "fps": 12,
       "herhaal": false,
       "bestand": "wolf-geraakt.png"
      },
      "sterven": {
       "beelden": 8,
       "fps": 10,
       "herhaal": false,
       "bestand": "wolf-sterven.png",
       "cel": [
        160,
        148
       ],
       "anker": [
        80,
        120
       ]
      }
     }
    }
   },
   "muren": {
    "bestand": "muren.png",
    "cel": [
     100,
     160
    ],
    "anker": [
     50,
     156
    ],
    "kolommen": [
     "muur",
     "deur",
     "slot",
     "doorgang",
     "raam",
     "wandkleed",
     "scheur",
     "lamp",
     "rek"
    ],
    "rijen": [
     "noord",
     "west",
     "laag"
    ],
    "laagHoogte": 22,
    "hoogte": 128
   },
   "vloeren": {
    "bestand": "vloeren.png",
    "cel": [
     144,
     88
    ],
    "anker": [
     72,
     22
    ],
    "soorten": {
     "zand": 0,
     "hout": 1
    }
   },
   "voorwerpen": {
    "bestand": "voorwerpen.png",
    "cel": [
     88,
     112
    ],
    "anker": [
     44,
     90
    ],
    "namen": [
     "tafel",
     "fontein",
     "kist",
     "ton",
     "zak",
     "puin",
     "sleutel",
     "vuurschicht"
    ]
   }
  };
})(globalThis.Toren = globalThis.Toren || {});
