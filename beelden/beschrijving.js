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
    "meester": {
     "naam": "meester",
     "cel": [
      112,
      136
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 1.55,
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
       "bestand": "meester-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "meester-lopen.png",
       "beelden": 19,
       "fps": 20,
       "herhaal": true,
       "snelheid": 1.55,
       "stap": 0.736
      },
      "slaan": {
       "bestand": "meester-slaan.png",
       "beelden": 6,
       "fps": 12,
       "herhaal": false
      },
      "spreuk": {
       "bestand": "meester-spreuk.png",
       "beelden": 6,
       "fps": 12,
       "herhaal": false
      },
      "geraakt": {
       "bestand": "meester-geraakt.png",
       "beelden": 3,
       "fps": 12,
       "herhaal": false
      },
      "sterven": {
       "bestand": "meester-sterven.png",
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
    },
    "reuzenspin": {
     "naam": "reuzenspin",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 2,
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
       "bestand": "reuzenspin-staan.png"
      },
      "lopen": {
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "bestand": "reuzenspin-lopen.png",
       "cel": [
        128,
        132
       ],
       "anker": [
        64,
        114
       ],
       "stap": 0.8
      },
      "aanval": {
       "beelden": 6,
       "fps": 12,
       "herhaal": false,
       "bestand": "reuzenspin-aanval.png",
       "cel": [
        144,
        132
       ],
       "anker": [
        72,
        114
       ]
      },
      "geraakt": {
       "beelden": 3,
       "fps": 12,
       "herhaal": false,
       "bestand": "reuzenspin-geraakt.png"
      },
      "sterven": {
       "beelden": 8,
       "fps": 10,
       "herhaal": false,
       "bestand": "reuzenspin-sterven.png",
       "cel": [
        128,
        132
       ],
       "anker": [
        64,
        114
       ]
      }
     }
    },
    "kobold": {
     "naam": "kobold",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 2.4,
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
       "bestand": "kobold-staan.png"
      },
      "lopen": {
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "bestand": "kobold-lopen.png",
       "stap": 0.96
      },
      "aanval": {
       "beelden": 6,
       "fps": 12,
       "herhaal": false,
       "bestand": "kobold-aanval.png",
       "cel": [
        144,
        132
       ],
       "anker": [
        72,
        114
       ]
      },
      "geraakt": {
       "beelden": 3,
       "fps": 12,
       "herhaal": false,
       "bestand": "kobold-geraakt.png"
      },
      "sterven": {
       "beelden": 8,
       "fps": 10,
       "herhaal": false,
       "bestand": "kobold-sterven.png",
       "cel": [
        160,
        168
       ],
       "anker": [
        80,
        126
       ]
      }
     }
    },
    "smid": {
     "naam": "smid",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 1.5,
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
       "bestand": "smid-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "smid-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6
      }
     }
    },
    "dorpeling0": {
     "naam": "dorpeling0",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 1.2,
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
       "bestand": "dorpeling0-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "dorpeling0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.2,
       "stap": 0.48
      }
     }
    },
    "dorpeling1": {
     "naam": "dorpeling1",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 1.2,
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
       "bestand": "dorpeling1-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "dorpeling1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.2,
       "stap": 0.48
      }
     }
    },
    "herbergierster": {
     "naam": "herbergierster",
     "cel": [
      112,
      124
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
       "bestand": "herbergierster-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "herbergierster-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56
      }
     }
    },
    "boer": {
     "naam": "boer",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 1.5,
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
       "bestand": "boer-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "boer-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6
      }
     }
    },
    "dorpsoudste": {
     "naam": "dorpsoudste",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 1,
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
       "bestand": "dorpsoudste-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "dorpsoudste-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1,
       "stap": 0.4
      }
     }
    },
    "jongen": {
     "naam": "jongen",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 1.3,
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
       "bestand": "jongen-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "jongen-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.3,
       "stap": 0.52
      }
     }
    },
    "meisje": {
     "naam": "meisje",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 1.25,
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
       "bestand": "meisje-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "meisje-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.25,
       "stap": 0.5
      }
     }
    },
    "kleuter": {
     "naam": "kleuter",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 0.85,
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
       "bestand": "kleuter-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "kleuter-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 0.85,
       "stap": 0.34
      }
     }
    },
    "smidsvrouw": {
     "naam": "smidsvrouw",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 1.45,
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
       "bestand": "smidsvrouw-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "smidsvrouw-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.45,
       "stap": 0.58
      }
     }
    },
    "boerin": {
     "naam": "boerin",
     "cel": [
      112,
      124
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
       "bestand": "boerin-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "boerin-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56
      }
     }
    },
    "bruidegom": {
     "naam": "bruidegom",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 1.5,
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
       "bestand": "bruidegom-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "bruidegom-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6
      }
     }
    },
    "bruid": {
     "naam": "bruid",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 1.3,
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
       "bestand": "bruid-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "bruid-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.3,
       "stap": 0.52
      }
     }
    },
    "oudeman": {
     "naam": "oudeman",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 1,
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
       "bestand": "oudeman-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "oudeman-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1,
       "stap": 0.4
      }
     }
    },
    "maaier": {
     "naam": "maaier",
     "cel": [
      145,
      121
     ],
     "anker": [
      73,
      80
     ],
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
      "maaien": {
       "bestand": "maaier-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true
      }
     }
    },
    "heer": {
     "naam": "heer",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 1.55,
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
       "bestand": "heer-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "heer-lopen.png",
       "beelden": 8,
       "fps": 20,
       "herhaal": true,
       "snelheid": 1.55,
       "stap": 0.31
      }
     }
    },
    "soldaat": {
     "naam": "soldaat",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 1.5,
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
       "bestand": "soldaat-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "soldaat-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6
      }
     }
    },
    "inner": {
     "naam": "inner",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 1.5,
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
       "bestand": "inner-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "inner-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6
      }
     }
    },
    "marskramer": {
     "naam": "marskramer",
     "cel": [
      112,
      124
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
       "bestand": "marskramer-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "marskramer-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56
      }
     }
    },
    "boer-zanger": {
     "naam": "boer-zanger",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 1.5,
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
       "bestand": "boer-zanger-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "boer-zanger-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6
      }
     }
    },
    "boerin-zanger": {
     "naam": "boerin-zanger",
     "cel": [
      112,
      124
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
       "bestand": "boerin-zanger-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "boerin-zanger-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56
      }
     }
    },
    "boer-woekeraar": {
     "naam": "boer-woekeraar",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 1.5,
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
       "bestand": "boer-woekeraar-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "boer-woekeraar-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6
      }
     }
    },
    "boerin-woekeraar": {
     "naam": "boerin-woekeraar",
     "cel": [
      112,
      124
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
       "bestand": "boerin-woekeraar-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "boerin-woekeraar-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56
      }
     }
    },
    "boer-heethoofd": {
     "naam": "boer-heethoofd",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 1.5,
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
       "bestand": "boer-heethoofd-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "boer-heethoofd-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6
      }
     }
    },
    "boerin-heethoofd": {
     "naam": "boerin-heethoofd",
     "cel": [
      112,
      124
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
       "bestand": "boerin-heethoofd-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "boerin-heethoofd-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56
      }
     }
    },
    "boerin-weduwe": {
     "naam": "boerin-weduwe",
     "cel": [
      112,
      124
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
       "bestand": "boerin-weduwe-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "boerin-weduwe-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56
      }
     }
    },
    "boerin-vroedvrouw": {
     "naam": "boerin-vroedvrouw",
     "cel": [
      112,
      124
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
       "bestand": "boerin-vroedvrouw-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "boerin-vroedvrouw-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56
      }
     }
    },
    "boer-vrome": {
     "naam": "boer-vrome",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 1.5,
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
       "bestand": "boer-vrome-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "boer-vrome-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6
      }
     }
    },
    "boerin-vrome": {
     "naam": "boerin-vrome",
     "cel": [
      112,
      124
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
       "bestand": "boerin-vrome-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "boerin-vrome-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56
      }
     }
    },
    "boer-roddelaar": {
     "naam": "boer-roddelaar",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 1.5,
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
       "bestand": "boer-roddelaar-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "boer-roddelaar-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6
      }
     }
    },
    "boerin-roddelaar": {
     "naam": "boerin-roddelaar",
     "cel": [
      112,
      124
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
       "bestand": "boerin-roddelaar-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "boerin-roddelaar-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56
      }
     }
    },
    "boer-grijsaard": {
     "naam": "boer-grijsaard",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 1.5,
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
       "bestand": "boer-grijsaard-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "boer-grijsaard-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6
      }
     }
    },
    "boerin-grijsaard": {
     "naam": "boerin-grijsaard",
     "cel": [
      112,
      124
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
       "bestand": "boerin-grijsaard-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "boerin-grijsaard-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56
      }
     }
    },
    "boer-nieuwkomer": {
     "naam": "boer-nieuwkomer",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 1.5,
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
       "bestand": "boer-nieuwkomer-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "boer-nieuwkomer-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6
      }
     }
    },
    "boerin-nieuwkomer": {
     "naam": "boerin-nieuwkomer",
     "cel": [
      112,
      124
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
       "bestand": "boerin-nieuwkomer-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "boerin-nieuwkomer-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56
      }
     }
    },
    "boer-drinker": {
     "naam": "boer-drinker",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      110
     ],
     "snelheid": 1.5,
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
       "bestand": "boer-drinker-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "boer-drinker-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6
      }
     }
    },
    "boerin-drinker": {
     "naam": "boerin-drinker",
     "cel": [
      112,
      124
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
       "bestand": "boerin-drinker-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true
      },
      "lopen": {
       "bestand": "boerin-drinker-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56
      }
     }
    },
    "koe0": {
     "naam": "koe0",
     "kleur": "roodbruin",
     "cel": [
      128,
      108
     ],
     "anker": [
      64,
      76
     ],
     "snelheid": 0.9,
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
      "grazen": {
       "bestand": "koe0-grazen.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true
      },
      "staan": {
       "bestand": "koe0-staan.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true
      },
      "lopen": {
       "bestand": "koe0-lopen.png",
       "beelden": 8,
       "fps": 8,
       "herhaal": true,
       "snelheid": 0.9,
       "stap": 0.45
      },
      "liggen": {
       "bestand": "koe0-liggen.png",
       "beelden": 8,
       "fps": 4,
       "herhaal": true
      }
     }
    },
    "koe1": {
     "naam": "koe1",
     "kleur": "zwart",
     "cel": [
      128,
      108
     ],
     "anker": [
      64,
      76
     ],
     "snelheid": 0.9,
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
      "grazen": {
       "bestand": "koe1-grazen.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true
      },
      "staan": {
       "bestand": "koe1-staan.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true
      },
      "lopen": {
       "bestand": "koe1-lopen.png",
       "beelden": 8,
       "fps": 8,
       "herhaal": true,
       "snelheid": 0.9,
       "stap": 0.45
      },
      "liggen": {
       "bestand": "koe1-liggen.png",
       "beelden": 8,
       "fps": 4,
       "herhaal": true
      }
     }
    },
    "koe2": {
     "naam": "koe2",
     "kleur": "zwartbont",
     "cel": [
      128,
      108
     ],
     "anker": [
      64,
      76
     ],
     "snelheid": 0.9,
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
      "grazen": {
       "bestand": "koe2-grazen.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true
      },
      "staan": {
       "bestand": "koe2-staan.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true
      },
      "lopen": {
       "bestand": "koe2-lopen.png",
       "beelden": 8,
       "fps": 8,
       "herhaal": true,
       "snelheid": 0.9,
       "stap": 0.45
      },
      "liggen": {
       "bestand": "koe2-liggen.png",
       "beelden": 8,
       "fps": 4,
       "herhaal": true
      }
     }
    },
    "schaap0": {
     "naam": "schaap0",
     "kleur": "vuilwit",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      106
     ],
     "snelheid": 1.1,
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
      "grazen": {
       "bestand": "schaap0-grazen.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true
      },
      "staan": {
       "bestand": "schaap0-staan.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true
      },
      "lopen": {
       "bestand": "schaap0-lopen.png",
       "beelden": 8,
       "fps": 12,
       "herhaal": true,
       "snelheid": 1.1,
       "stap": 0.367
      },
      "liggen": {
       "bestand": "schaap0-liggen.png",
       "beelden": 8,
       "fps": 4,
       "herhaal": true
      }
     }
    },
    "schaap1": {
     "naam": "schaap1",
     "kleur": "bruin",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      106
     ],
     "snelheid": 1.1,
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
      "grazen": {
       "bestand": "schaap1-grazen.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true
      },
      "staan": {
       "bestand": "schaap1-staan.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true
      },
      "lopen": {
       "bestand": "schaap1-lopen.png",
       "beelden": 8,
       "fps": 12,
       "herhaal": true,
       "snelheid": 1.1,
       "stap": 0.367
      },
      "liggen": {
       "bestand": "schaap1-liggen.png",
       "beelden": 8,
       "fps": 4,
       "herhaal": true
      }
     }
    },
    "schaap2": {
     "naam": "schaap2",
     "kleur": "zwartkop",
     "cel": [
      112,
      124
     ],
     "anker": [
      56,
      106
     ],
     "snelheid": 1.1,
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
      "grazen": {
       "bestand": "schaap2-grazen.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true
      },
      "staan": {
       "bestand": "schaap2-staan.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true
      },
      "lopen": {
       "bestand": "schaap2-lopen.png",
       "beelden": 8,
       "fps": 12,
       "herhaal": true,
       "snelheid": 1.1,
       "stap": 0.367
      },
      "liggen": {
       "bestand": "schaap2-liggen.png",
       "beelden": 8,
       "fps": 4,
       "herhaal": true
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
   "trap": {
    "bestand": "trap.png",
    "cel": [
     190,
     250
    ],
    "anker": [
     95,
     232
    ],
    "tegels": 3,
    "soorten": [
     "trap",
     "trapgat"
    ],
    "staten": [
     "ingestort",
     "provisorisch",
     "hersteld"
    ]
   },
   "graan": {
    "bestand": "graan.png",
    "varianten": 3,
    "stadia": {
     "geploegd": {
      "y0": 0,
      "cel": [
       84,
       54
      ],
      "anker": [
       42,
       12
      ]
     },
     "kiemend": {
      "y0": 54,
      "cel": [
       84,
       58
      ],
      "anker": [
       42,
       16
      ]
     },
     "groen": {
      "y0": 112,
      "cel": [
       84,
       79
      ],
      "anker": [
       42,
       37
      ],
      "frames": 8
     },
     "rijp": {
      "y0": 349,
      "cel": [
       84,
       97
      ],
      "anker": [
       42,
       55
      ],
      "frames": 8
     },
     "gemaaid": {
      "y0": 640,
      "cel": [
       84,
       100
      ],
      "anker": [
       42,
       58
      ]
     }
    }
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
   },
   "schandpaal": {
    "bestand": "schandpaal.png",
    "cel": [
     60,
     116
    ],
    "anker": [
     30,
     102
    ],
    "delen": [
     "leeg",
     "bezet",
     "halsijzer"
    ],
    "halsAnker": [
     30,
     61
    ],
    "nek": {
     "standaard": 51,
     "boer": 51,
     "boerin": 51,
     "boer-zanger": 51,
     "boerin-zanger": 51,
     "boerin-weduwe": 51,
     "boer-woekeraar": 51,
     "boerin-woekeraar": 51,
     "boerin-vroedvrouw": 51,
     "boer-heethoofd": 51,
     "boerin-heethoofd": 51,
     "boer-vrome": 51,
     "boerin-vrome": 51,
     "boer-roddelaar": 51,
     "boerin-roddelaar": 51,
     "boer-grijsaard": 47,
     "boerin-grijsaard": 48,
     "boer-nieuwkomer": 51,
     "boerin-nieuwkomer": 51,
     "boer-drinker": 51,
     "boerin-drinker": 51
    }
   }
  };
})(globalThis.Toren = globalThis.Toren || {});
