// Gemaakt door gereedschap/pixelart/naar-spel.cjs — niet met de hand bijwerken.
// Dezelfde inhoud als beschrijving.json, als script, zodat file:// het ook kan lezen.
(function (T) {
  T.BEELDEN = {
   "tegel": [
    64,
    32
   ],
   "figuren": {
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
       "herhaal": true,
       "cel": [
        54,
        86
       ],
       "anker": [
        27,
        82
       ]
      },
      "lopen": {
       "bestand": "skelet-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 2.2,
       "cel": [
        58,
        94
       ],
       "anker": [
        29,
        80
       ],
       "stap": 0.88
      },
      "aanval": {
       "bestand": "skelet-aanval.png",
       "beelden": 6,
       "fps": 12,
       "herhaal": false,
       "cel": [
        107,
        87
       ],
       "anker": [
        53,
        82
       ]
      },
      "geraakt": {
       "bestand": "skelet-geraakt.png",
       "beelden": 3,
       "fps": 12,
       "herhaal": false,
       "cel": [
        52,
        88
       ],
       "anker": [
        26,
        84
       ]
      },
      "sterven": {
       "bestand": "skelet-sterven.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": false,
       "cel": [
        112,
        113
       ],
       "anker": [
        56,
        81
       ]
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
       "herhaal": true,
       "cel": [
        50,
        47
       ],
       "anker": [
        25,
        35
       ]
      },
      "lopen": {
       "bestand": "slijm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "cel": [
        68,
        61
       ],
       "anker": [
        34,
        47
       ],
       "stap": 0.56
      },
      "aanval": {
       "bestand": "slijm-aanval.png",
       "beelden": 6,
       "fps": 12,
       "herhaal": false,
       "cel": [
        94,
        67
       ],
       "anker": [
        47,
        54
       ]
      },
      "geraakt": {
       "bestand": "slijm-geraakt.png",
       "beelden": 3,
       "fps": 12,
       "herhaal": false,
       "cel": [
        68,
        46
       ],
       "anker": [
        34,
        32
       ]
      },
      "sterven": {
       "bestand": "slijm-sterven.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": false,
       "cel": [
        70,
        52
       ],
       "anker": [
        35,
        35
       ]
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
       "bestand": "wolf-staan.png",
       "cel": [
        92,
        69
       ],
       "anker": [
        46,
        58
       ]
      },
      "lopen": {
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "bestand": "wolf-lopen.png",
       "cel": [
        94,
        70
       ],
       "anker": [
        47,
        55
       ],
       "stap": 1.4
      },
      "aanval": {
       "beelden": 6,
       "fps": 12,
       "herhaal": false,
       "bestand": "wolf-aanval.png",
       "cel": [
        110,
        79
       ],
       "anker": [
        55,
        62
       ]
      },
      "geraakt": {
       "beelden": 3,
       "fps": 12,
       "herhaal": false,
       "bestand": "wolf-geraakt.png",
       "cel": [
        92,
        70
       ],
       "anker": [
        46,
        60
       ]
      },
      "sterven": {
       "beelden": 8,
       "fps": 10,
       "herhaal": false,
       "bestand": "wolf-sterven.png",
       "cel": [
        92,
        84
       ],
       "anker": [
        46,
        61
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
       "bestand": "reuzenspin-staan.png",
       "cel": [
        64,
        54
       ],
       "anker": [
        32,
        41
       ]
      },
      "lopen": {
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "bestand": "reuzenspin-lopen.png",
       "cel": [
        68,
        51
       ],
       "anker": [
        34,
        35
       ],
       "stap": 0.8
      },
      "aanval": {
       "beelden": 6,
       "fps": 12,
       "herhaal": false,
       "bestand": "reuzenspin-aanval.png",
       "cel": [
        78,
        59
       ],
       "anker": [
        39,
        46
       ]
      },
      "geraakt": {
       "beelden": 3,
       "fps": 12,
       "herhaal": false,
       "bestand": "reuzenspin-geraakt.png",
       "cel": [
        68,
        53
       ],
       "anker": [
        34,
        40
       ]
      },
      "sterven": {
       "beelden": 8,
       "fps": 10,
       "herhaal": false,
       "bestand": "reuzenspin-sterven.png",
       "cel": [
        64,
        56
       ],
       "anker": [
        32,
        40
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
       "bestand": "kobold-staan.png",
       "cel": [
        69,
        63
       ],
       "anker": [
        34,
        57
       ]
      },
      "lopen": {
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "bestand": "kobold-lopen.png",
       "cel": [
        78,
        67
       ],
       "anker": [
        39,
        58
       ],
       "stap": 0.96
      },
      "aanval": {
       "beelden": 6,
       "fps": 12,
       "herhaal": false,
       "bestand": "kobold-aanval.png",
       "cel": [
        119,
        74
       ],
       "anker": [
        59,
        61
       ]
      },
      "geraakt": {
       "beelden": 3,
       "fps": 12,
       "herhaal": false,
       "bestand": "kobold-geraakt.png",
       "cel": [
        62,
        71
       ],
       "anker": [
        31,
        65
       ]
      },
      "sterven": {
       "beelden": 8,
       "fps": 10,
       "herhaal": false,
       "bestand": "kobold-sterven.png",
       "cel": [
        138,
        106
       ],
       "anker": [
        69,
        65
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
       "herhaal": true,
       "cel": [
        54,
        85
       ],
       "anker": [
        27,
        80
       ]
      },
      "lopen": {
       "bestand": "smid-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "cel": [
        54,
        91
       ],
       "anker": [
        27,
        80
       ],
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
       "herhaal": true,
       "cel": [
        34,
        73
       ],
       "anker": [
        17,
        68
       ]
      },
      "lopen": {
       "bestand": "dorpeling0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.2,
       "cel": [
        44,
        77
       ],
       "anker": [
        22,
        68
       ],
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
       "herhaal": true,
       "cel": [
        38,
        77
       ],
       "anker": [
        19,
        69
       ]
      },
      "lopen": {
       "bestand": "dorpeling1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.2,
       "cel": [
        42,
        78
       ],
       "anker": [
        21,
        68
       ],
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
       "herhaal": true,
       "cel": [
        40,
        76
       ],
       "anker": [
        20,
        67
       ]
      },
      "lopen": {
       "bestand": "herbergierster-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "cel": [
        44,
        78
       ],
       "anker": [
        22,
        67
       ],
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
       "herhaal": true,
       "cel": [
        40,
        89
       ],
       "anker": [
        20,
        80
       ]
      },
      "lopen": {
       "bestand": "boer-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "cel": [
        50,
        91
       ],
       "anker": [
        25,
        80
       ],
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
       "herhaal": true,
       "cel": [
        42,
        80
       ],
       "anker": [
        21,
        70
       ]
      },
      "lopen": {
       "bestand": "dorpsoudste-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1,
       "cel": [
        42,
        80
       ],
       "anker": [
        21,
        70
       ],
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
       "herhaal": true,
       "cel": [
        30,
        63
       ],
       "anker": [
        15,
        59
       ]
      },
      "lopen": {
       "bestand": "jongen-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.3,
       "cel": [
        42,
        68
       ],
       "anker": [
        21,
        59
       ],
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
       "herhaal": true,
       "cel": [
        30,
        56
       ],
       "anker": [
        15,
        53
       ]
      },
      "lopen": {
       "bestand": "meisje-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.25,
       "cel": [
        36,
        61
       ],
       "anker": [
        18,
        52
       ],
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
       "herhaal": true,
       "cel": [
        52,
        62
       ],
       "anker": [
        26,
        50
       ]
      },
      "lopen": {
       "bestand": "kleuter-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 0.85,
       "cel": [
        52,
        61
       ],
       "anker": [
        26,
        49
       ],
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
       "herhaal": true,
       "cel": [
        50,
        83
       ],
       "anker": [
        25,
        74
       ]
      },
      "lopen": {
       "bestand": "smidsvrouw-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.45,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ],
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
       "herhaal": true,
       "cel": [
        38,
        79
       ],
       "anker": [
        19,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ],
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
       "herhaal": true,
       "cel": [
        34,
        81
       ],
       "anker": [
        17,
        76
       ]
      },
      "lopen": {
       "bestand": "bruidegom-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "cel": [
        48,
        87
       ],
       "anker": [
        24,
        76
       ],
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
       "herhaal": true,
       "cel": [
        34,
        80
       ],
       "anker": [
        17,
        71
       ]
      },
      "lopen": {
       "bestand": "bruid-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.3,
       "cel": [
        44,
        82
       ],
       "anker": [
        22,
        71
       ],
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
       "herhaal": true,
       "cel": [
        40,
        80
       ],
       "anker": [
        20,
        75
       ]
      },
      "lopen": {
       "bestand": "oudeman-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1,
       "cel": [
        42,
        83
       ],
       "anker": [
        21,
        75
       ],
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
       "herhaal": true,
       "cel": [
        139,
        115
       ],
       "anker": [
        70,
        77
       ]
      }
     }
    },
    "zaaier": {
     "naam": "zaaier",
     "cel": [
      116,
      112
     ],
     "anker": [
      58,
      81
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
       "bestand": "zaaier-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        82
       ],
       "anker": [
        20,
        77
       ]
      },
      "lopen": {
       "bestand": "zaaier-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "zaaien": {
       "bestand": "zaaier-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        106
       ],
       "anker": [
        55,
        78
       ]
      }
     }
    },
    "wieder": {
     "naam": "wieder",
     "cel": [
      101,
      109
     ],
     "anker": [
      51,
      82
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
       "bestand": "wieder-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        50,
        91
       ],
       "anker": [
        25,
        79
       ]
      },
      "lopen": {
       "bestand": "wieder-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        88
       ],
       "anker": [
        42,
        77
       ]
      },
      "wieden": {
       "bestand": "wieder-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        95,
        101
       ],
       "anker": [
        48,
        77
       ]
      }
     }
    },
    "sprokkelaar": {
     "naam": "sprokkelaar",
     "cel": [
      76,
      106
     ],
     "anker": [
      38,
      86
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
       "bestand": "sprokkelaar-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        87
       ],
       "anker": [
        27,
        82
       ]
      },
      "lopen": {
       "bestand": "sprokkelaar-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        55,
        94
       ],
       "anker": [
        27,
        83
       ]
      },
      "rapen": {
       "bestand": "sprokkelaar-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        99
       ],
       "anker": [
        35,
        82
       ]
      }
     }
    },
    "hakker": {
     "naam": "hakker",
     "cel": [
      94,
      111
     ],
     "anker": [
      47,
      96
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
       "bestand": "hakker-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        89
       ],
       "anker": [
        24,
        77
       ]
      },
      "lopen": {
       "bestand": "hakker-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        58,
        90
       ],
       "anker": [
        29,
        79
       ]
      },
      "hakken": {
       "bestand": "hakker-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        88,
        101
       ],
       "anker": [
        44,
        93
       ]
      }
     }
    },
    "zaaister": {
     "naam": "zaaister",
     "cel": [
      106,
      94
     ],
     "anker": [
      53,
      73
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
       "bestand": "zaaister-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        42,
        79
       ],
       "anker": [
        21,
        70
       ]
      },
      "lopen": {
       "bestand": "zaaister-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "zaaien": {
       "bestand": "zaaister-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        100,
        88
       ],
       "anker": [
        50,
        70
       ]
      }
     }
    },
    "wiedster": {
     "naam": "wiedster",
     "cel": [
      96,
      100
     ],
     "anker": [
      48,
      74
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
       "bestand": "wiedster-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        56,
        84
       ],
       "anker": [
        28,
        71
       ]
      },
      "lopen": {
       "bestand": "wiedster-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        81
       ],
       "anker": [
        42,
        70
       ]
      },
      "wieden": {
       "bestand": "wiedster-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        90,
        93
       ],
       "anker": [
        45,
        70
       ]
      }
     }
    },
    "sprokkelaarster": {
     "naam": "sprokkelaarster",
     "cel": [
      72,
      103
     ],
     "anker": [
      36,
      84
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
       "bestand": "sprokkelaarster-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        90
       ],
       "anker": [
        27,
        81
       ]
      },
      "lopen": {
       "bestand": "sprokkelaarster-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        54,
        92
       ],
       "anker": [
        27,
        81
       ]
      },
      "rapen": {
       "bestand": "sprokkelaarster-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        66,
        97
       ],
       "anker": [
        33,
        81
       ]
      }
     }
    },
    "maaister": {
     "naam": "maaister",
     "cel": [
      146,
      114
     ],
     "anker": [
      73,
      72
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
       "bestand": "maaister-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        140,
        108
       ],
       "anker": [
        70,
        69
       ]
      }
     }
    },
    "hakster": {
     "naam": "hakster",
     "cel": [
      90,
      107
     ],
     "anker": [
      45,
      92
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
       "bestand": "hakster-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        82
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "hakster-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        58,
        88
       ],
       "anker": [
        29,
        77
       ]
      },
      "hakken": {
       "bestand": "hakster-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        84,
        98
       ],
       "anker": [
        42,
        89
       ]
      }
     }
    },
    "zager": {
     "naam": "zager",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zager-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        82
       ],
       "anker": [
        24,
        77
       ]
      },
      "lopen": {
       "bestand": "zager-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "zagen": {
       "bestand": "zager-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        86
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "zaagster": {
     "naam": "zaagster",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zaagster-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "zaagster-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        48,
        81
       ],
       "anker": [
        24,
        70
       ]
      },
      "zagen": {
       "bestand": "zaagster-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        90
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "plukker": {
     "naam": "plukker",
     "cel": [
      76,
      97
     ],
     "anker": [
      38,
      83
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
       "bestand": "plukker-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        82
       ],
       "anker": [
        20,
        77
       ]
      },
      "lopen": {
       "bestand": "plukker-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "plukken": {
       "bestand": "plukker-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        85
       ],
       "anker": [
        35,
        80
       ]
      }
     }
    },
    "binder": {
     "naam": "binder",
     "cel": [
      88,
      96
     ],
     "anker": [
      44,
      80
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
       "bestand": "binder-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "binder-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "binden": {
       "bestand": "binder-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        82,
        81
       ],
       "anker": [
        41,
        68
       ]
      }
     }
    },
    "drager": {
     "naam": "drager",
     "cel": [
      92,
      101
     ],
     "anker": [
      46,
      87
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
       "bestand": "drager-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        84,
        89
       ],
       "anker": [
        42,
        84
       ]
      },
      "lopen": {
       "bestand": "drager-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        86,
        95
       ],
       "anker": [
        43,
        84
       ]
      }
     }
    },
    "dorser": {
     "naam": "dorser",
     "cel": [
      166,
      153
     ],
     "anker": [
      83,
      113
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
       "bestand": "dorser-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        84
       ],
       "anker": [
        26,
        77
       ]
      },
      "lopen": {
       "bestand": "dorser-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        91
       ],
       "anker": [
        42,
        80
       ]
      },
      "dorsen": {
       "bestand": "dorser-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        160,
        147
       ],
       "anker": [
        80,
        110
       ]
      }
     }
    },
    "plukster": {
     "naam": "plukster",
     "cel": [
      70,
      89
     ],
     "anker": [
      35,
      75
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
       "bestand": "plukster-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        79
       ],
       "anker": [
        20,
        70
       ]
      },
      "lopen": {
       "bestand": "plukster-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "plukken": {
       "bestand": "plukster-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        81
       ],
       "anker": [
        32,
        72
       ]
      }
     }
    },
    "binster": {
     "naam": "binster",
     "cel": [
      70,
      89
     ],
     "anker": [
      35,
      73
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
       "bestand": "binster-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        79
       ],
       "anker": [
        19,
        70
       ]
      },
      "lopen": {
       "bestand": "binster-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "binden": {
       "bestand": "binster-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        74
       ],
       "anker": [
        32,
        61
       ]
      }
     }
    },
    "draagster": {
     "naam": "draagster",
     "cel": [
      92,
      99
     ],
     "anker": [
      46,
      85
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
       "bestand": "draagster-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        86,
        91
       ],
       "anker": [
        43,
        82
       ]
      },
      "lopen": {
       "bestand": "draagster-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        86,
        93
       ],
       "anker": [
        43,
        82
       ]
      }
     }
    },
    "dorster": {
     "naam": "dorster",
     "cel": [
      160,
      149
     ],
     "anker": [
      80,
      111
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
       "bestand": "dorster-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        79
       ],
       "anker": [
        26,
        70
       ]
      },
      "lopen": {
       "bestand": "dorster-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        90
       ],
       "anker": [
        42,
        79
       ]
      },
      "dorsen": {
       "bestand": "dorster-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        154,
        143
       ],
       "anker": [
        77,
        108
       ]
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
       "herhaal": true,
       "cel": [
        46,
        76
       ],
       "anker": [
        23,
        71
       ]
      },
      "lopen": {
       "bestand": "heer-lopen.png",
       "beelden": 8,
       "fps": 20,
       "herhaal": true,
       "snelheid": 1.55,
       "cel": [
        54,
        79
       ],
       "anker": [
        27,
        71
       ],
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
       "herhaal": true,
       "cel": [
        52,
        115
       ],
       "anker": [
        26,
        105
       ]
      },
      "lopen": {
       "bestand": "soldaat-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "cel": [
        54,
        119
       ],
       "anker": [
        27,
        108
       ],
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
       "herhaal": true,
       "cel": [
        38,
        80
       ],
       "anker": [
        19,
        75
       ]
      },
      "lopen": {
       "bestand": "inner-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ],
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
       "herhaal": true,
       "cel": [
        50,
        97
       ],
       "anker": [
        25,
        84
       ]
      },
      "lopen": {
       "bestand": "marskramer-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "cel": [
        54,
        97
       ],
       "anker": [
        27,
        84
       ],
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
       "herhaal": true,
       "cel": [
        42,
        88
       ],
       "anker": [
        21,
        83
       ]
      },
      "lopen": {
       "bestand": "boer-zanger-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "cel": [
        50,
        94
       ],
       "anker": [
        25,
        83
       ],
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
       "herhaal": true,
       "cel": [
        44,
        91
       ],
       "anker": [
        22,
        82
       ]
      },
      "lopen": {
       "bestand": "boerin-zanger-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "cel": [
        44,
        93
       ],
       "anker": [
        22,
        82
       ],
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
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "boer-woekeraar-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ],
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
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-woekeraar-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ],
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
       "herhaal": true,
       "cel": [
        44,
        80
       ],
       "anker": [
        22,
        75
       ]
      },
      "lopen": {
       "bestand": "boer-heethoofd-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ],
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
       "herhaal": true,
       "cel": [
        46,
        79
       ],
       "anker": [
        23,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-heethoofd-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "cel": [
        46,
        81
       ],
       "anker": [
        23,
        70
       ],
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
       "herhaal": true,
       "cel": [
        38,
        80
       ],
       "anker": [
        19,
        71
       ]
      },
      "lopen": {
       "bestand": "boerin-weduwe-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "cel": [
        44,
        82
       ],
       "anker": [
        22,
        71
       ],
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
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-vroedvrouw-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ],
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
       "herhaal": true,
       "cel": [
        36,
        78
       ],
       "anker": [
        18,
        73
       ]
      },
      "lopen": {
       "bestand": "boer-vrome-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "cel": [
        50,
        83
       ],
       "anker": [
        25,
        72
       ],
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
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-vrome-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ],
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
       "herhaal": true,
       "cel": [
        44,
        82
       ],
       "anker": [
        22,
        77
       ]
      },
      "lopen": {
       "bestand": "boer-roddelaar-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ],
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
       "herhaal": true,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-roddelaar-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "cel": [
        46,
        81
       ],
       "anker": [
        23,
        70
       ],
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
       "herhaal": true,
       "cel": [
        44,
        82
       ],
       "anker": [
        22,
        73
       ]
      },
      "lopen": {
       "bestand": "boer-grijsaard-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        73
       ],
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
       "herhaal": true,
       "cel": [
        40,
        83
       ],
       "anker": [
        20,
        72
       ]
      },
      "lopen": {
       "bestand": "boerin-grijsaard-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "cel": [
        52,
        85
       ],
       "anker": [
        26,
        72
       ],
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
       "herhaal": true,
       "cel": [
        42,
        79
       ],
       "anker": [
        21,
        74
       ]
      },
      "lopen": {
       "bestand": "boer-nieuwkomer-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ],
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
       "herhaal": true,
       "cel": [
        42,
        79
       ],
       "anker": [
        21,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-nieuwkomer-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ],
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
       "herhaal": true,
       "cel": [
        40,
        82
       ],
       "anker": [
        20,
        77
       ]
      },
      "lopen": {
       "bestand": "boer-drinker-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ],
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
       "herhaal": true,
       "cel": [
        40,
        80
       ],
       "anker": [
        20,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-drinker-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "cel": [
        44,
        82
       ],
       "anker": [
        22,
        70
       ],
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
       "herhaal": true,
       "cel": [
        94,
        79
       ],
       "anker": [
        47,
        59
       ]
      },
      "staan": {
       "bestand": "koe0-staan.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true,
       "cel": [
        116,
        85
       ],
       "anker": [
        58,
        71
       ]
      },
      "lopen": {
       "bestand": "koe0-lopen.png",
       "beelden": 8,
       "fps": 8,
       "herhaal": true,
       "snelheid": 0.9,
       "cel": [
        116,
        87
       ],
       "anker": [
        58,
        67
       ],
       "stap": 0.45
      },
      "liggen": {
       "bestand": "koe0-liggen.png",
       "beelden": 8,
       "fps": 4,
       "herhaal": true,
       "cel": [
        118,
        82
       ],
       "anker": [
        59,
        55
       ]
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
       "herhaal": true,
       "cel": [
        90,
        79
       ],
       "anker": [
        45,
        59
       ]
      },
      "staan": {
       "bestand": "koe1-staan.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true,
       "cel": [
        116,
        82
       ],
       "anker": [
        58,
        68
       ]
      },
      "lopen": {
       "bestand": "koe1-lopen.png",
       "beelden": 8,
       "fps": 8,
       "herhaal": true,
       "snelheid": 0.9,
       "cel": [
        116,
        85
       ],
       "anker": [
        58,
        65
       ],
       "stap": 0.45
      },
      "liggen": {
       "bestand": "koe1-liggen.png",
       "beelden": 8,
       "fps": 4,
       "herhaal": true,
       "cel": [
        118,
        79
       ],
       "anker": [
        59,
        52
       ]
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
       "herhaal": true,
       "cel": [
        92,
        79
       ],
       "anker": [
        46,
        59
       ]
      },
      "staan": {
       "bestand": "koe2-staan.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true,
       "cel": [
        116,
        84
       ],
       "anker": [
        58,
        70
       ]
      },
      "lopen": {
       "bestand": "koe2-lopen.png",
       "beelden": 8,
       "fps": 8,
       "herhaal": true,
       "snelheid": 0.9,
       "cel": [
        116,
        87
       ],
       "anker": [
        58,
        67
       ],
       "stap": 0.45
      },
      "liggen": {
       "bestand": "koe2-liggen.png",
       "beelden": 8,
       "fps": 4,
       "herhaal": true,
       "cel": [
        118,
        81
       ],
       "anker": [
        59,
        54
       ]
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
       "herhaal": true,
       "cel": [
        48,
        45
       ],
       "anker": [
        24,
        34
       ]
      },
      "staan": {
       "bestand": "schaap0-staan.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true,
       "cel": [
        64,
        50
       ],
       "anker": [
        32,
        41
       ]
      },
      "lopen": {
       "bestand": "schaap0-lopen.png",
       "beelden": 8,
       "fps": 12,
       "herhaal": true,
       "snelheid": 1.1,
       "cel": [
        66,
        51
       ],
       "anker": [
        33,
        39
       ],
       "stap": 0.367
      },
      "liggen": {
       "bestand": "schaap0-liggen.png",
       "beelden": 8,
       "fps": 4,
       "herhaal": true,
       "cel": [
        64,
        44
       ],
       "anker": [
        32,
        31
       ]
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
       "herhaal": true,
       "cel": [
        48,
        45
       ],
       "anker": [
        24,
        34
       ]
      },
      "staan": {
       "bestand": "schaap1-staan.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true,
       "cel": [
        64,
        50
       ],
       "anker": [
        32,
        41
       ]
      },
      "lopen": {
       "bestand": "schaap1-lopen.png",
       "beelden": 8,
       "fps": 12,
       "herhaal": true,
       "snelheid": 1.1,
       "cel": [
        66,
        51
       ],
       "anker": [
        33,
        39
       ],
       "stap": 0.367
      },
      "liggen": {
       "bestand": "schaap1-liggen.png",
       "beelden": 8,
       "fps": 4,
       "herhaal": true,
       "cel": [
        64,
        44
       ],
       "anker": [
        32,
        31
       ]
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
       "herhaal": true,
       "cel": [
        48,
        45
       ],
       "anker": [
        24,
        34
       ]
      },
      "staan": {
       "bestand": "schaap2-staan.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true,
       "cel": [
        64,
        50
       ],
       "anker": [
        32,
        41
       ]
      },
      "lopen": {
       "bestand": "schaap2-lopen.png",
       "beelden": 8,
       "fps": 12,
       "herhaal": true,
       "snelheid": 1.1,
       "cel": [
        66,
        51
       ],
       "anker": [
        33,
        39
       ],
       "stap": 0.367
      },
      "liggen": {
       "bestand": "schaap2-liggen.png",
       "beelden": 8,
       "fps": 4,
       "herhaal": true,
       "cel": [
        64,
        44
       ],
       "anker": [
        32,
        31
       ]
      }
     }
    },
    "hert0": {
     "naam": "hert0",
     "kleur": "roodbruin",
     "cel": [
      160,
      148
     ],
     "anker": [
      80,
      118
     ],
     "snelheid": 1,
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
       "bestand": "hert0-grazen.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true,
       "cel": [
        92,
        73
       ],
       "anker": [
        46,
        59
       ]
      },
      "staan": {
       "bestand": "hert0-staan.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true,
       "cel": [
        92,
        98
       ],
       "anker": [
        46,
        85
       ]
      },
      "lopen": {
       "bestand": "hert0-lopen.png",
       "beelden": 8,
       "fps": 8,
       "herhaal": true,
       "snelheid": 1,
       "stap": 0.5,
       "cel": [
        104,
        99
       ],
       "anker": [
        52,
        80
       ]
      },
      "rennen": {
       "bestand": "hert0-rennen.png",
       "beelden": 8,
       "fps": 12,
       "herhaal": true,
       "snelheid": 4,
       "stap": 1.333,
       "cel": [
        118,
        101
       ],
       "anker": [
        59,
        80
       ]
      },
      "liggen": {
       "bestand": "hert0-liggen.png",
       "beelden": 8,
       "fps": 4,
       "herhaal": true,
       "cel": [
        92,
        74
       ],
       "anker": [
        46,
        57
       ]
      }
     }
    },
    "hert1": {
     "naam": "hert1",
     "kleur": "grijsbruin",
     "cel": [
      160,
      148
     ],
     "anker": [
      80,
      118
     ],
     "snelheid": 1,
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
       "bestand": "hert1-grazen.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true,
       "cel": [
        90,
        72
       ],
       "anker": [
        45,
        58
       ]
      },
      "staan": {
       "bestand": "hert1-staan.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true,
       "cel": [
        90,
        96
       ],
       "anker": [
        45,
        83
       ]
      },
      "lopen": {
       "bestand": "hert1-lopen.png",
       "beelden": 8,
       "fps": 8,
       "herhaal": true,
       "snelheid": 1,
       "stap": 0.5,
       "cel": [
        102,
        97
       ],
       "anker": [
        51,
        78
       ]
      },
      "rennen": {
       "bestand": "hert1-rennen.png",
       "beelden": 8,
       "fps": 12,
       "herhaal": true,
       "snelheid": 4,
       "stap": 1.333,
       "cel": [
        114,
        99
       ],
       "anker": [
        57,
        78
       ]
      },
      "liggen": {
       "bestand": "hert1-liggen.png",
       "beelden": 8,
       "fps": 4,
       "herhaal": true,
       "cel": [
        90,
        73
       ],
       "anker": [
        45,
        56
       ]
      }
     }
    },
    "hert2": {
     "naam": "hert2",
     "kleur": "met gewei",
     "cel": [
      160,
      148
     ],
     "anker": [
      80,
      118
     ],
     "snelheid": 1,
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
       "bestand": "hert2-grazen.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true,
       "cel": [
        142,
        84
       ],
       "anker": [
        71,
        65
       ]
      },
      "staan": {
       "bestand": "hert2-staan.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true,
       "cel": [
        102,
        126
       ],
       "anker": [
        51,
        111
       ]
      },
      "lopen": {
       "bestand": "hert2-lopen.png",
       "beelden": 8,
       "fps": 8,
       "herhaal": true,
       "snelheid": 1,
       "stap": 0.5,
       "cel": [
        116,
        129
       ],
       "anker": [
        58,
        108
       ]
      },
      "rennen": {
       "bestand": "hert2-rennen.png",
       "beelden": 8,
       "fps": 12,
       "herhaal": true,
       "snelheid": 4,
       "stap": 1.333,
       "cel": [
        130,
        129
       ],
       "anker": [
        65,
        106
       ]
      },
      "liggen": {
       "bestand": "hert2-liggen.png",
       "beelden": 8,
       "fps": 4,
       "herhaal": true,
       "cel": [
        102,
        101
       ],
       "anker": [
        51,
        82
       ]
      }
     }
    },
    "huifkar": {
     "naam": "huifkar",
     "lading": "huif",
     "cel": [
      216,
      156
     ],
     "anker": [
      108,
      116
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
      "staan": {
       "bestand": "huifkar-staan.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true,
       "cel": [
        208,
        149
       ],
       "anker": [
        104,
        114
       ]
      },
      "lopen": {
       "bestand": "huifkar-lopen.png",
       "beelden": 8,
       "fps": 8,
       "herhaal": true,
       "snelheid": 0.9,
       "stap": 0.45,
       "cel": [
        208,
        152
       ],
       "anker": [
        104,
        114
       ]
      }
     }
    },
    "ossenkar-leeg": {
     "naam": "ossenkar-leeg",
     "lading": "leeg",
     "cel": [
      216,
      156
     ],
     "anker": [
      108,
      116
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
      "staan": {
       "bestand": "ossenkar-leeg-staan.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true,
       "cel": [
        208,
        134
       ],
       "anker": [
        104,
        99
       ]
      },
      "lopen": {
       "bestand": "ossenkar-leeg-lopen.png",
       "beelden": 8,
       "fps": 8,
       "herhaal": true,
       "snelheid": 0.9,
       "stap": 0.45,
       "cel": [
        208,
        134
       ],
       "anker": [
        104,
        96
       ]
      }
     }
    },
    "ossenkar-hout": {
     "naam": "ossenkar-hout",
     "lading": "hout",
     "cel": [
      216,
      156
     ],
     "anker": [
      108,
      116
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
      "staan": {
       "bestand": "ossenkar-hout-staan.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true,
       "cel": [
        212,
        137
       ],
       "anker": [
        106,
        102
       ]
      },
      "lopen": {
       "bestand": "ossenkar-hout-lopen.png",
       "beelden": 8,
       "fps": 8,
       "herhaal": true,
       "snelheid": 0.9,
       "stap": 0.45,
       "cel": [
        212,
        140
       ],
       "anker": [
        106,
        102
       ]
      }
     }
    },
    "ossenkar-stenen": {
     "naam": "ossenkar-stenen",
     "lading": "stenen",
     "cel": [
      216,
      156
     ],
     "anker": [
      108,
      116
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
      "staan": {
       "bestand": "ossenkar-stenen-staan.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true,
       "cel": [
        208,
        134
       ],
       "anker": [
        104,
        99
       ]
      },
      "lopen": {
       "bestand": "ossenkar-stenen-lopen.png",
       "beelden": 8,
       "fps": 8,
       "herhaal": true,
       "snelheid": 0.9,
       "stap": 0.45,
       "cel": [
        208,
        134
       ],
       "anker": [
        104,
        96
       ]
      }
     }
    },
    "ossenkar-zakken": {
     "naam": "ossenkar-zakken",
     "lading": "zakken",
     "cel": [
      216,
      156
     ],
     "anker": [
      108,
      116
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
      "staan": {
       "bestand": "ossenkar-zakken-staan.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true,
       "cel": [
        208,
        134
       ],
       "anker": [
        104,
        99
       ]
      },
      "lopen": {
       "bestand": "ossenkar-zakken-lopen.png",
       "beelden": 8,
       "fps": 8,
       "herhaal": true,
       "snelheid": 0.9,
       "stap": 0.45,
       "cel": [
        208,
        134
       ],
       "anker": [
        104,
        96
       ]
      }
     }
    },
    "ossenkar-spullen": {
     "naam": "ossenkar-spullen",
     "lading": "spullen",
     "cel": [
      216,
      156
     ],
     "anker": [
      108,
      116
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
      "staan": {
       "bestand": "ossenkar-spullen-staan.png",
       "beelden": 8,
       "fps": 5,
       "herhaal": true,
       "cel": [
        208,
        134
       ],
       "anker": [
        104,
        99
       ]
      },
      "lopen": {
       "bestand": "ossenkar-spullen-lopen.png",
       "beelden": 8,
       "fps": 8,
       "herhaal": true,
       "snelheid": 0.9,
       "stap": 0.45,
       "cel": [
        208,
        134
       ],
       "anker": [
        104,
        96
       ]
      }
     }
    },
    "kip0": {
     "naam": "kip0",
     "cel": [
      34,
      36
     ],
     "anker": [
      17,
      25
     ],
     "snelheid": 0.8,
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
       "bestand": "kip0-staan.png",
       "beelden": 6,
       "fps": 5,
       "herhaal": true,
       "cel": [
        20,
        25
       ],
       "anker": [
        10,
        22
       ]
      },
      "lopen": {
       "bestand": "kip0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 0.8,
       "stap": 0.32,
       "cel": [
        20,
        25
       ],
       "anker": [
        10,
        22
       ]
      },
      "pikken": {
       "bestand": "kip0-pikken.png",
       "beelden": 8,
       "fps": 8,
       "herhaal": true,
       "cel": [
        28,
        30
       ],
       "anker": [
        14,
        22
       ]
      }
     }
    },
    "kip1": {
     "naam": "kip1",
     "cel": [
      34,
      36
     ],
     "anker": [
      17,
      25
     ],
     "snelheid": 0.8,
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
       "bestand": "kip1-staan.png",
       "beelden": 6,
       "fps": 5,
       "herhaal": true,
       "cel": [
        20,
        25
       ],
       "anker": [
        10,
        22
       ]
      },
      "lopen": {
       "bestand": "kip1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 0.8,
       "stap": 0.32,
       "cel": [
        20,
        25
       ],
       "anker": [
        10,
        22
       ]
      },
      "pikken": {
       "bestand": "kip1-pikken.png",
       "beelden": 8,
       "fps": 8,
       "herhaal": true,
       "cel": [
        28,
        30
       ],
       "anker": [
        14,
        22
       ]
      }
     }
    },
    "kip2": {
     "naam": "kip2",
     "cel": [
      34,
      36
     ],
     "anker": [
      17,
      25
     ],
     "snelheid": 0.8,
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
       "bestand": "kip2-staan.png",
       "beelden": 6,
       "fps": 5,
       "herhaal": true,
       "cel": [
        20,
        25
       ],
       "anker": [
        10,
        22
       ]
      },
      "lopen": {
       "bestand": "kip2-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 0.8,
       "stap": 0.32,
       "cel": [
        20,
        25
       ],
       "anker": [
        10,
        22
       ]
      },
      "pikken": {
       "bestand": "kip2-pikken.png",
       "beelden": 8,
       "fps": 8,
       "herhaal": true,
       "cel": [
        28,
        30
       ],
       "anker": [
        14,
        22
       ]
      }
     }
    },
    "kip3": {
     "naam": "kip3",
     "cel": [
      36,
      39
     ],
     "anker": [
      18,
      27
     ],
     "snelheid": 0.8,
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
       "bestand": "kip3-staan.png",
       "beelden": 6,
       "fps": 5,
       "herhaal": true,
       "cel": [
        30,
        27
       ],
       "anker": [
        15,
        24
       ]
      },
      "lopen": {
       "bestand": "kip3-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 0.8,
       "stap": 0.32,
       "cel": [
        30,
        27
       ],
       "anker": [
        15,
        24
       ]
      },
      "pikken": {
       "bestand": "kip3-pikken.png",
       "beelden": 8,
       "fps": 8,
       "herhaal": true,
       "cel": [
        28,
        32
       ],
       "anker": [
        14,
        23
       ]
      }
     }
    },
    "hond0": {
     "naam": "hond0",
     "cel": [
      86,
      62
     ],
     "anker": [
      43,
      46
     ],
     "snelheid": 2.52,
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
       "bestand": "hond0-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        64,
        48
       ],
       "anker": [
        32,
        40
       ]
      },
      "lopen": {
       "bestand": "hond0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 2.52,
       "stap": 1.008,
       "cel": [
        64,
        50
       ],
       "anker": [
        32,
        39
       ]
      },
      "blaffen": {
       "bestand": "hond0-blaffen.png",
       "beelden": 6,
       "fps": 12,
       "herhaal": true,
       "cel": [
        80,
        56
       ],
       "anker": [
        40,
        43
       ]
      }
     }
    },
    "hond1": {
     "naam": "hond1",
     "cel": [
      86,
      62
     ],
     "anker": [
      43,
      46
     ],
     "snelheid": 2.52,
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
       "bestand": "hond1-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        64,
        48
       ],
       "anker": [
        32,
        40
       ]
      },
      "lopen": {
       "bestand": "hond1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 2.52,
       "stap": 1.008,
       "cel": [
        64,
        50
       ],
       "anker": [
        32,
        39
       ]
      },
      "blaffen": {
       "bestand": "hond1-blaffen.png",
       "beelden": 6,
       "fps": 12,
       "herhaal": true,
       "cel": [
        80,
        56
       ],
       "anker": [
        40,
        43
       ]
      }
     }
    },
    "hond2": {
     "naam": "hond2",
     "cel": [
      86,
      62
     ],
     "anker": [
      43,
      46
     ],
     "snelheid": 2.52,
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
       "bestand": "hond2-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        64,
        48
       ],
       "anker": [
        32,
        40
       ]
      },
      "lopen": {
       "bestand": "hond2-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 2.52,
       "stap": 1.008,
       "cel": [
        64,
        50
       ],
       "anker": [
        32,
        39
       ]
      },
      "blaffen": {
       "bestand": "hond2-blaffen.png",
       "beelden": 6,
       "fps": 12,
       "herhaal": true,
       "cel": [
        80,
        56
       ],
       "anker": [
        40,
        43
       ]
      }
     }
    },
    "boer-u0": {
     "naam": "boer-u0",
     "cel": [
      56,
      94
     ],
     "anker": [
      28,
      80
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
       "bestand": "boer-u0-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "boer-u0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      }
     }
    },
    "maaier-u0": {
     "naam": "maaier-u0",
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
       "bestand": "maaier-u0-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        139,
        115
       ],
       "anker": [
        70,
        77
       ]
      }
     }
    },
    "zaaier-u0": {
     "naam": "zaaier-u0",
     "cel": [
      116,
      112
     ],
     "anker": [
      58,
      81
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
       "bestand": "zaaier-u0-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        82
       ],
       "anker": [
        20,
        77
       ]
      },
      "lopen": {
       "bestand": "zaaier-u0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "zaaien": {
       "bestand": "zaaier-u0-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        106
       ],
       "anker": [
        55,
        78
       ]
      }
     }
    },
    "wieder-u0": {
     "naam": "wieder-u0",
     "cel": [
      101,
      109
     ],
     "anker": [
      51,
      82
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
       "bestand": "wieder-u0-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        50,
        91
       ],
       "anker": [
        25,
        79
       ]
      },
      "lopen": {
       "bestand": "wieder-u0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        88
       ],
       "anker": [
        42,
        77
       ]
      },
      "wieden": {
       "bestand": "wieder-u0-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        95,
        101
       ],
       "anker": [
        48,
        77
       ]
      }
     }
    },
    "sprokkelaar-u0": {
     "naam": "sprokkelaar-u0",
     "cel": [
      76,
      106
     ],
     "anker": [
      38,
      86
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
       "bestand": "sprokkelaar-u0-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        87
       ],
       "anker": [
        27,
        82
       ]
      },
      "lopen": {
       "bestand": "sprokkelaar-u0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        55,
        94
       ],
       "anker": [
        27,
        83
       ]
      },
      "rapen": {
       "bestand": "sprokkelaar-u0-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        99
       ],
       "anker": [
        35,
        82
       ]
      }
     }
    },
    "hakker-u0": {
     "naam": "hakker-u0",
     "cel": [
      94,
      111
     ],
     "anker": [
      47,
      96
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
       "bestand": "hakker-u0-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        89
       ],
       "anker": [
        24,
        77
       ]
      },
      "lopen": {
       "bestand": "hakker-u0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        58,
        90
       ],
       "anker": [
        29,
        79
       ]
      },
      "hakken": {
       "bestand": "hakker-u0-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        88,
        101
       ],
       "anker": [
        44,
        93
       ]
      }
     }
    },
    "plukker-u0": {
     "naam": "plukker-u0",
     "cel": [
      76,
      97
     ],
     "anker": [
      38,
      83
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
       "bestand": "plukker-u0-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        82
       ],
       "anker": [
        20,
        77
       ]
      },
      "lopen": {
       "bestand": "plukker-u0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "plukken": {
       "bestand": "plukker-u0-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        85
       ],
       "anker": [
        35,
        80
       ]
      }
     }
    },
    "binder-u0": {
     "naam": "binder-u0",
     "cel": [
      88,
      96
     ],
     "anker": [
      44,
      80
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
       "bestand": "binder-u0-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "binder-u0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "binden": {
       "bestand": "binder-u0-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        82,
        81
       ],
       "anker": [
        41,
        68
       ]
      }
     }
    },
    "drager-u0": {
     "naam": "drager-u0",
     "cel": [
      92,
      101
     ],
     "anker": [
      46,
      87
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
       "bestand": "drager-u0-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        84,
        89
       ],
       "anker": [
        42,
        84
       ]
      },
      "lopen": {
       "bestand": "drager-u0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        86,
        95
       ],
       "anker": [
        43,
        84
       ]
      }
     }
    },
    "dorser-u0": {
     "naam": "dorser-u0",
     "cel": [
      166,
      153
     ],
     "anker": [
      83,
      113
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
       "bestand": "dorser-u0-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        84
       ],
       "anker": [
        26,
        77
       ]
      },
      "lopen": {
       "bestand": "dorser-u0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        91
       ],
       "anker": [
        42,
        80
       ]
      },
      "dorsen": {
       "bestand": "dorser-u0-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        160,
        147
       ],
       "anker": [
        80,
        110
       ]
      }
     }
    },
    "zager-u0": {
     "naam": "zager-u0",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zager-u0-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        82
       ],
       "anker": [
        24,
        77
       ]
      },
      "lopen": {
       "bestand": "zager-u0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "zagen": {
       "bestand": "zager-u0-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        86
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boer-u1": {
     "naam": "boer-u1",
     "cel": [
      56,
      88
     ],
     "anker": [
      28,
      74
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
       "bestand": "boer-u1-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        76
       ],
       "anker": [
        18,
        71
       ]
      },
      "lopen": {
       "bestand": "boer-u1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      }
     }
    },
    "maaier-u1": {
     "naam": "maaier-u1",
     "cel": [
      145,
      114
     ],
     "anker": [
      73,
      73
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
       "bestand": "maaier-u1-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        139,
        108
       ],
       "anker": [
        70,
        70
       ]
      }
     }
    },
    "zaaier-u1": {
     "naam": "zaaier-u1",
     "cel": [
      116,
      106
     ],
     "anker": [
      58,
      75
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
       "bestand": "zaaier-u1-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        76
       ],
       "anker": [
        20,
        71
       ]
      },
      "lopen": {
       "bestand": "zaaier-u1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      },
      "zaaien": {
       "bestand": "zaaier-u1-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        100
       ],
       "anker": [
        55,
        72
       ]
      }
     }
    },
    "wieder-u1": {
     "naam": "wieder-u1",
     "cel": [
      101,
      102
     ],
     "anker": [
      51,
      75
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
       "bestand": "wieder-u1-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        50,
        84
       ],
       "anker": [
        25,
        72
       ]
      },
      "lopen": {
       "bestand": "wieder-u1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        82
       ],
       "anker": [
        42,
        71
       ]
      },
      "wieden": {
       "bestand": "wieder-u1-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        95,
        96
       ],
       "anker": [
        48,
        72
       ]
      }
     }
    },
    "sprokkelaar-u1": {
     "naam": "sprokkelaar-u1",
     "cel": [
      76,
      106
     ],
     "anker": [
      38,
      86
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
       "bestand": "sprokkelaar-u1-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        87
       ],
       "anker": [
        27,
        82
       ]
      },
      "lopen": {
       "bestand": "sprokkelaar-u1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        55,
        94
       ],
       "anker": [
        27,
        83
       ]
      },
      "rapen": {
       "bestand": "sprokkelaar-u1-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        99
       ],
       "anker": [
        35,
        82
       ]
      }
     }
    },
    "hakker-u1": {
     "naam": "hakker-u1",
     "cel": [
      94,
      111
     ],
     "anker": [
      47,
      96
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
       "bestand": "hakker-u1-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        83
       ],
       "anker": [
        24,
        71
       ]
      },
      "lopen": {
       "bestand": "hakker-u1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        58,
        90
       ],
       "anker": [
        29,
        79
       ]
      },
      "hakken": {
       "bestand": "hakker-u1-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        88,
        101
       ],
       "anker": [
        44,
        93
       ]
      }
     }
    },
    "plukker-u1": {
     "naam": "plukker-u1",
     "cel": [
      76,
      91
     ],
     "anker": [
      38,
      77
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
       "bestand": "plukker-u1-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        76
       ],
       "anker": [
        20,
        71
       ]
      },
      "lopen": {
       "bestand": "plukker-u1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      },
      "plukken": {
       "bestand": "plukker-u1-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        79
       ],
       "anker": [
        35,
        74
       ]
      }
     }
    },
    "binder-u1": {
     "naam": "binder-u1",
     "cel": [
      76,
      90
     ],
     "anker": [
      38,
      74
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
       "bestand": "binder-u1-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        76
       ],
       "anker": [
        18,
        71
       ]
      },
      "lopen": {
       "bestand": "binder-u1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      },
      "binden": {
       "bestand": "binder-u1-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        76
       ],
       "anker": [
        35,
        63
       ]
      }
     }
    },
    "drager-u1": {
     "naam": "drager-u1",
     "cel": [
      92,
      101
     ],
     "anker": [
      46,
      87
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
       "bestand": "drager-u1-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        84,
        89
       ],
       "anker": [
        42,
        84
       ]
      },
      "lopen": {
       "bestand": "drager-u1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        86,
        95
       ],
       "anker": [
        43,
        84
       ]
      }
     }
    },
    "dorser-u1": {
     "naam": "dorser-u1",
     "cel": [
      166,
      153
     ],
     "anker": [
      83,
      113
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
       "bestand": "dorser-u1-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        78
       ],
       "anker": [
        26,
        71
       ]
      },
      "lopen": {
       "bestand": "dorser-u1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        91
       ],
       "anker": [
        42,
        80
       ]
      },
      "dorsen": {
       "bestand": "dorser-u1-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        160,
        147
       ],
       "anker": [
        80,
        110
       ]
      }
     }
    },
    "zager-u1": {
     "naam": "zager-u1",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zager-u1-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        76
       ],
       "anker": [
        24,
        71
       ]
      },
      "lopen": {
       "bestand": "zager-u1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      },
      "zagen": {
       "bestand": "zager-u1-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        86
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boer-u2": {
     "naam": "boer-u2",
     "cel": [
      56,
      91
     ],
     "anker": [
      28,
      77
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
       "bestand": "boer-u2-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        74
       ]
      },
      "lopen": {
       "bestand": "boer-u2-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      }
     }
    },
    "maaier-u2": {
     "naam": "maaier-u2",
     "cel": [
      145,
      118
     ],
     "anker": [
      73,
      77
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
       "bestand": "maaier-u2-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        139,
        112
       ],
       "anker": [
        70,
        74
       ]
      }
     }
    },
    "zaaier-u2": {
     "naam": "zaaier-u2",
     "cel": [
      116,
      109
     ],
     "anker": [
      58,
      78
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
       "bestand": "zaaier-u2-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        79
       ],
       "anker": [
        20,
        74
       ]
      },
      "lopen": {
       "bestand": "zaaier-u2-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      },
      "zaaien": {
       "bestand": "zaaier-u2-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        103
       ],
       "anker": [
        55,
        75
       ]
      }
     }
    },
    "wieder-u2": {
     "naam": "wieder-u2",
     "cel": [
      101,
      105
     ],
     "anker": [
      51,
      78
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
       "bestand": "wieder-u2-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        50,
        87
       ],
       "anker": [
        25,
        75
       ]
      },
      "lopen": {
       "bestand": "wieder-u2-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        85
       ],
       "anker": [
        42,
        74
       ]
      },
      "wieden": {
       "bestand": "wieder-u2-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        95,
        99
       ],
       "anker": [
        48,
        75
       ]
      }
     }
    },
    "sprokkelaar-u2": {
     "naam": "sprokkelaar-u2",
     "cel": [
      76,
      106
     ],
     "anker": [
      38,
      86
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
       "bestand": "sprokkelaar-u2-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        87
       ],
       "anker": [
        27,
        82
       ]
      },
      "lopen": {
       "bestand": "sprokkelaar-u2-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        55,
        94
       ],
       "anker": [
        27,
        83
       ]
      },
      "rapen": {
       "bestand": "sprokkelaar-u2-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        99
       ],
       "anker": [
        35,
        82
       ]
      }
     }
    },
    "hakker-u2": {
     "naam": "hakker-u2",
     "cel": [
      94,
      111
     ],
     "anker": [
      47,
      96
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
       "bestand": "hakker-u2-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        86
       ],
       "anker": [
        24,
        74
       ]
      },
      "lopen": {
       "bestand": "hakker-u2-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        58,
        90
       ],
       "anker": [
        29,
        79
       ]
      },
      "hakken": {
       "bestand": "hakker-u2-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        88,
        101
       ],
       "anker": [
        44,
        93
       ]
      }
     }
    },
    "plukker-u2": {
     "naam": "plukker-u2",
     "cel": [
      76,
      94
     ],
     "anker": [
      38,
      80
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
       "bestand": "plukker-u2-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        79
       ],
       "anker": [
        20,
        74
       ]
      },
      "lopen": {
       "bestand": "plukker-u2-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      },
      "plukken": {
       "bestand": "plukker-u2-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        82
       ],
       "anker": [
        35,
        77
       ]
      }
     }
    },
    "binder-u2": {
     "naam": "binder-u2",
     "cel": [
      80,
      93
     ],
     "anker": [
      40,
      77
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
       "bestand": "binder-u2-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        74
       ]
      },
      "lopen": {
       "bestand": "binder-u2-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      },
      "binden": {
       "bestand": "binder-u2-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        74,
        80
       ],
       "anker": [
        37,
        67
       ]
      }
     }
    },
    "drager-u2": {
     "naam": "drager-u2",
     "cel": [
      92,
      101
     ],
     "anker": [
      46,
      87
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
       "bestand": "drager-u2-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        84,
        89
       ],
       "anker": [
        42,
        84
       ]
      },
      "lopen": {
       "bestand": "drager-u2-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        86,
        95
       ],
       "anker": [
        43,
        84
       ]
      }
     }
    },
    "dorser-u2": {
     "naam": "dorser-u2",
     "cel": [
      166,
      153
     ],
     "anker": [
      83,
      113
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
       "bestand": "dorser-u2-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        81
       ],
       "anker": [
        26,
        74
       ]
      },
      "lopen": {
       "bestand": "dorser-u2-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        91
       ],
       "anker": [
        42,
        80
       ]
      },
      "dorsen": {
       "bestand": "dorser-u2-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        160,
        147
       ],
       "anker": [
        80,
        110
       ]
      }
     }
    },
    "zager-u2": {
     "naam": "zager-u2",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zager-u2-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        74
       ]
      },
      "lopen": {
       "bestand": "zager-u2-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      },
      "zagen": {
       "bestand": "zager-u2-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        86
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boer-u3": {
     "naam": "boer-u3",
     "cel": [
      56,
      89
     ],
     "anker": [
      28,
      75
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
       "bestand": "boer-u3-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        77
       ],
       "anker": [
        17,
        72
       ]
      },
      "lopen": {
       "bestand": "boer-u3-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        83
       ],
       "anker": [
        25,
        72
       ]
      }
     }
    },
    "maaier-u3": {
     "naam": "maaier-u3",
     "cel": [
      145,
      116
     ],
     "anker": [
      73,
      75
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
       "bestand": "maaier-u3-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        139,
        110
       ],
       "anker": [
        70,
        72
       ]
      }
     }
    },
    "zaaier-u3": {
     "naam": "zaaier-u3",
     "cel": [
      116,
      107
     ],
     "anker": [
      58,
      76
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
       "bestand": "zaaier-u3-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        77
       ],
       "anker": [
        20,
        72
       ]
      },
      "lopen": {
       "bestand": "zaaier-u3-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        83
       ],
       "anker": [
        25,
        72
       ]
      },
      "zaaien": {
       "bestand": "zaaier-u3-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        101
       ],
       "anker": [
        55,
        73
       ]
      }
     }
    },
    "wieder-u3": {
     "naam": "wieder-u3",
     "cel": [
      101,
      103
     ],
     "anker": [
      51,
      76
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
       "bestand": "wieder-u3-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        73
       ]
      },
      "lopen": {
       "bestand": "wieder-u3-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        83
       ],
       "anker": [
        42,
        72
       ]
      },
      "wieden": {
       "bestand": "wieder-u3-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        95,
        97
       ],
       "anker": [
        48,
        73
       ]
      }
     }
    },
    "sprokkelaar-u3": {
     "naam": "sprokkelaar-u3",
     "cel": [
      76,
      106
     ],
     "anker": [
      38,
      86
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
       "bestand": "sprokkelaar-u3-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        87
       ],
       "anker": [
        27,
        82
       ]
      },
      "lopen": {
       "bestand": "sprokkelaar-u3-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        55,
        94
       ],
       "anker": [
        27,
        83
       ]
      },
      "rapen": {
       "bestand": "sprokkelaar-u3-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        99
       ],
       "anker": [
        35,
        82
       ]
      }
     }
    },
    "hakker-u3": {
     "naam": "hakker-u3",
     "cel": [
      94,
      111
     ],
     "anker": [
      47,
      96
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
       "bestand": "hakker-u3-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        84
       ],
       "anker": [
        24,
        72
       ]
      },
      "lopen": {
       "bestand": "hakker-u3-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        58,
        90
       ],
       "anker": [
        29,
        79
       ]
      },
      "hakken": {
       "bestand": "hakker-u3-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        88,
        101
       ],
       "anker": [
        44,
        93
       ]
      }
     }
    },
    "plukker-u3": {
     "naam": "plukker-u3",
     "cel": [
      76,
      92
     ],
     "anker": [
      38,
      78
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
       "bestand": "plukker-u3-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        77
       ],
       "anker": [
        20,
        72
       ]
      },
      "lopen": {
       "bestand": "plukker-u3-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        83
       ],
       "anker": [
        25,
        72
       ]
      },
      "plukken": {
       "bestand": "plukker-u3-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        80
       ],
       "anker": [
        35,
        75
       ]
      }
     }
    },
    "binder-u3": {
     "naam": "binder-u3",
     "cel": [
      76,
      91
     ],
     "anker": [
      38,
      75
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
       "bestand": "binder-u3-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        77
       ],
       "anker": [
        18,
        72
       ]
      },
      "lopen": {
       "bestand": "binder-u3-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        83
       ],
       "anker": [
        25,
        72
       ]
      },
      "binden": {
       "bestand": "binder-u3-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        77
       ],
       "anker": [
        35,
        64
       ]
      }
     }
    },
    "drager-u3": {
     "naam": "drager-u3",
     "cel": [
      92,
      101
     ],
     "anker": [
      46,
      87
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
       "bestand": "drager-u3-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        84,
        89
       ],
       "anker": [
        42,
        84
       ]
      },
      "lopen": {
       "bestand": "drager-u3-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        86,
        95
       ],
       "anker": [
        43,
        84
       ]
      }
     }
    },
    "dorser-u3": {
     "naam": "dorser-u3",
     "cel": [
      166,
      153
     ],
     "anker": [
      83,
      113
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
       "bestand": "dorser-u3-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        79
       ],
       "anker": [
        26,
        72
       ]
      },
      "lopen": {
       "bestand": "dorser-u3-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        91
       ],
       "anker": [
        42,
        80
       ]
      },
      "dorsen": {
       "bestand": "dorser-u3-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        160,
        147
       ],
       "anker": [
        80,
        110
       ]
      }
     }
    },
    "zager-u3": {
     "naam": "zager-u3",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zager-u3-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        77
       ],
       "anker": [
        24,
        72
       ]
      },
      "lopen": {
       "bestand": "zager-u3-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        83
       ],
       "anker": [
        25,
        72
       ]
      },
      "zagen": {
       "bestand": "zager-u3-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        86
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boer-u4": {
     "naam": "boer-u4",
     "cel": [
      56,
      94
     ],
     "anker": [
      28,
      80
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
       "bestand": "boer-u4-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "boer-u4-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      }
     }
    },
    "maaier-u4": {
     "naam": "maaier-u4",
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
       "bestand": "maaier-u4-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        139,
        115
       ],
       "anker": [
        70,
        77
       ]
      }
     }
    },
    "zaaier-u4": {
     "naam": "zaaier-u4",
     "cel": [
      116,
      112
     ],
     "anker": [
      58,
      81
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
       "bestand": "zaaier-u4-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        82
       ],
       "anker": [
        20,
        77
       ]
      },
      "lopen": {
       "bestand": "zaaier-u4-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "zaaien": {
       "bestand": "zaaier-u4-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        106
       ],
       "anker": [
        55,
        78
       ]
      }
     }
    },
    "wieder-u4": {
     "naam": "wieder-u4",
     "cel": [
      101,
      109
     ],
     "anker": [
      51,
      82
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
       "bestand": "wieder-u4-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        50,
        91
       ],
       "anker": [
        25,
        79
       ]
      },
      "lopen": {
       "bestand": "wieder-u4-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        88
       ],
       "anker": [
        42,
        77
       ]
      },
      "wieden": {
       "bestand": "wieder-u4-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        95,
        102
       ],
       "anker": [
        48,
        78
       ]
      }
     }
    },
    "sprokkelaar-u4": {
     "naam": "sprokkelaar-u4",
     "cel": [
      76,
      106
     ],
     "anker": [
      38,
      86
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
       "bestand": "sprokkelaar-u4-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        87
       ],
       "anker": [
        27,
        82
       ]
      },
      "lopen": {
       "bestand": "sprokkelaar-u4-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        55,
        94
       ],
       "anker": [
        27,
        83
       ]
      },
      "rapen": {
       "bestand": "sprokkelaar-u4-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        99
       ],
       "anker": [
        35,
        82
       ]
      }
     }
    },
    "hakker-u4": {
     "naam": "hakker-u4",
     "cel": [
      94,
      111
     ],
     "anker": [
      47,
      96
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
       "bestand": "hakker-u4-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        89
       ],
       "anker": [
        24,
        77
       ]
      },
      "lopen": {
       "bestand": "hakker-u4-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        58,
        90
       ],
       "anker": [
        29,
        79
       ]
      },
      "hakken": {
       "bestand": "hakker-u4-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        88,
        101
       ],
       "anker": [
        44,
        93
       ]
      }
     }
    },
    "plukker-u4": {
     "naam": "plukker-u4",
     "cel": [
      76,
      97
     ],
     "anker": [
      38,
      83
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
       "bestand": "plukker-u4-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        82
       ],
       "anker": [
        20,
        77
       ]
      },
      "lopen": {
       "bestand": "plukker-u4-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "plukken": {
       "bestand": "plukker-u4-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        85
       ],
       "anker": [
        35,
        80
       ]
      }
     }
    },
    "binder-u4": {
     "naam": "binder-u4",
     "cel": [
      82,
      96
     ],
     "anker": [
      41,
      80
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
       "bestand": "binder-u4-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "binder-u4-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "binden": {
       "bestand": "binder-u4-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        76,
        82
       ],
       "anker": [
        38,
        69
       ]
      }
     }
    },
    "drager-u4": {
     "naam": "drager-u4",
     "cel": [
      92,
      101
     ],
     "anker": [
      46,
      87
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
       "bestand": "drager-u4-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        84,
        89
       ],
       "anker": [
        42,
        84
       ]
      },
      "lopen": {
       "bestand": "drager-u4-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        86,
        95
       ],
       "anker": [
        43,
        84
       ]
      }
     }
    },
    "dorser-u4": {
     "naam": "dorser-u4",
     "cel": [
      166,
      153
     ],
     "anker": [
      83,
      113
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
       "bestand": "dorser-u4-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        84
       ],
       "anker": [
        26,
        77
       ]
      },
      "lopen": {
       "bestand": "dorser-u4-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        91
       ],
       "anker": [
        42,
        80
       ]
      },
      "dorsen": {
       "bestand": "dorser-u4-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        160,
        147
       ],
       "anker": [
        80,
        110
       ]
      }
     }
    },
    "zager-u4": {
     "naam": "zager-u4",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zager-u4-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        82
       ],
       "anker": [
        24,
        77
       ]
      },
      "lopen": {
       "bestand": "zager-u4-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "zagen": {
       "bestand": "zager-u4-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        86
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boer-u5": {
     "naam": "boer-u5",
     "cel": [
      56,
      87
     ],
     "anker": [
      28,
      73
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
       "bestand": "boer-u5-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        44,
        75
       ],
       "anker": [
        22,
        70
       ]
      },
      "lopen": {
       "bestand": "boer-u5-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      }
     }
    },
    "maaier-u5": {
     "naam": "maaier-u5",
     "cel": [
      145,
      114
     ],
     "anker": [
      73,
      73
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
       "bestand": "maaier-u5-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        139,
        108
       ],
       "anker": [
        70,
        70
       ]
      }
     }
    },
    "zaaier-u5": {
     "naam": "zaaier-u5",
     "cel": [
      116,
      105
     ],
     "anker": [
      58,
      74
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
       "bestand": "zaaier-u5-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        75
       ],
       "anker": [
        20,
        70
       ]
      },
      "lopen": {
       "bestand": "zaaier-u5-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      },
      "zaaien": {
       "bestand": "zaaier-u5-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        99
       ],
       "anker": [
        55,
        71
       ]
      }
     }
    },
    "wieder-u5": {
     "naam": "wieder-u5",
     "cel": [
      101,
      102
     ],
     "anker": [
      51,
      75
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
       "bestand": "wieder-u5-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        50,
        84
       ],
       "anker": [
        25,
        72
       ]
      },
      "lopen": {
       "bestand": "wieder-u5-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        82
       ],
       "anker": [
        42,
        71
       ]
      },
      "wieden": {
       "bestand": "wieder-u5-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        95,
        95
       ],
       "anker": [
        48,
        71
       ]
      }
     }
    },
    "sprokkelaar-u5": {
     "naam": "sprokkelaar-u5",
     "cel": [
      76,
      106
     ],
     "anker": [
      38,
      86
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
       "bestand": "sprokkelaar-u5-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        87
       ],
       "anker": [
        27,
        82
       ]
      },
      "lopen": {
       "bestand": "sprokkelaar-u5-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        55,
        94
       ],
       "anker": [
        27,
        83
       ]
      },
      "rapen": {
       "bestand": "sprokkelaar-u5-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        99
       ],
       "anker": [
        35,
        82
       ]
      }
     }
    },
    "hakker-u5": {
     "naam": "hakker-u5",
     "cel": [
      94,
      111
     ],
     "anker": [
      47,
      96
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
       "bestand": "hakker-u5-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        82
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "hakker-u5-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        58,
        90
       ],
       "anker": [
        29,
        79
       ]
      },
      "hakken": {
       "bestand": "hakker-u5-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        88,
        101
       ],
       "anker": [
        44,
        93
       ]
      }
     }
    },
    "plukker-u5": {
     "naam": "plukker-u5",
     "cel": [
      76,
      90
     ],
     "anker": [
      38,
      76
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
       "bestand": "plukker-u5-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        75
       ],
       "anker": [
        20,
        70
       ]
      },
      "lopen": {
       "bestand": "plukker-u5-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      },
      "plukken": {
       "bestand": "plukker-u5-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        78
       ],
       "anker": [
        35,
        73
       ]
      }
     }
    },
    "binder-u5": {
     "naam": "binder-u5",
     "cel": [
      78,
      89
     ],
     "anker": [
      39,
      73
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
       "bestand": "binder-u5-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        75
       ],
       "anker": [
        18,
        70
       ]
      },
      "lopen": {
       "bestand": "binder-u5-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      },
      "binden": {
       "bestand": "binder-u5-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        72,
        75
       ],
       "anker": [
        36,
        62
       ]
      }
     }
    },
    "drager-u5": {
     "naam": "drager-u5",
     "cel": [
      92,
      101
     ],
     "anker": [
      46,
      87
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
       "bestand": "drager-u5-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        84,
        89
       ],
       "anker": [
        42,
        84
       ]
      },
      "lopen": {
       "bestand": "drager-u5-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        86,
        95
       ],
       "anker": [
        43,
        84
       ]
      }
     }
    },
    "dorser-u5": {
     "naam": "dorser-u5",
     "cel": [
      166,
      153
     ],
     "anker": [
      83,
      113
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
       "bestand": "dorser-u5-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        77
       ],
       "anker": [
        26,
        70
       ]
      },
      "lopen": {
       "bestand": "dorser-u5-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        91
       ],
       "anker": [
        42,
        80
       ]
      },
      "dorsen": {
       "bestand": "dorser-u5-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        160,
        147
       ],
       "anker": [
        80,
        110
       ]
      }
     }
    },
    "zager-u5": {
     "naam": "zager-u5",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zager-u5-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        75
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "zager-u5-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      },
      "zagen": {
       "bestand": "zager-u5-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        86
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boer-u6": {
     "naam": "boer-u6",
     "cel": [
      56,
      91
     ],
     "anker": [
      28,
      77
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
       "bestand": "boer-u6-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        74
       ]
      },
      "lopen": {
       "bestand": "boer-u6-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      }
     }
    },
    "maaier-u6": {
     "naam": "maaier-u6",
     "cel": [
      145,
      118
     ],
     "anker": [
      73,
      77
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
       "bestand": "maaier-u6-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        139,
        112
       ],
       "anker": [
        70,
        74
       ]
      }
     }
    },
    "zaaier-u6": {
     "naam": "zaaier-u6",
     "cel": [
      116,
      109
     ],
     "anker": [
      58,
      78
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
       "bestand": "zaaier-u6-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        79
       ],
       "anker": [
        20,
        74
       ]
      },
      "lopen": {
       "bestand": "zaaier-u6-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      },
      "zaaien": {
       "bestand": "zaaier-u6-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        103
       ],
       "anker": [
        55,
        75
       ]
      }
     }
    },
    "wieder-u6": {
     "naam": "wieder-u6",
     "cel": [
      101,
      105
     ],
     "anker": [
      51,
      78
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
       "bestand": "wieder-u6-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        50,
        87
       ],
       "anker": [
        25,
        75
       ]
      },
      "lopen": {
       "bestand": "wieder-u6-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        85
       ],
       "anker": [
        42,
        74
       ]
      },
      "wieden": {
       "bestand": "wieder-u6-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        95,
        99
       ],
       "anker": [
        48,
        75
       ]
      }
     }
    },
    "sprokkelaar-u6": {
     "naam": "sprokkelaar-u6",
     "cel": [
      76,
      106
     ],
     "anker": [
      38,
      86
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
       "bestand": "sprokkelaar-u6-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        87
       ],
       "anker": [
        27,
        82
       ]
      },
      "lopen": {
       "bestand": "sprokkelaar-u6-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        55,
        94
       ],
       "anker": [
        27,
        83
       ]
      },
      "rapen": {
       "bestand": "sprokkelaar-u6-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        99
       ],
       "anker": [
        35,
        82
       ]
      }
     }
    },
    "hakker-u6": {
     "naam": "hakker-u6",
     "cel": [
      94,
      111
     ],
     "anker": [
      47,
      96
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
       "bestand": "hakker-u6-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        86
       ],
       "anker": [
        24,
        74
       ]
      },
      "lopen": {
       "bestand": "hakker-u6-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        58,
        90
       ],
       "anker": [
        29,
        79
       ]
      },
      "hakken": {
       "bestand": "hakker-u6-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        88,
        101
       ],
       "anker": [
        44,
        93
       ]
      }
     }
    },
    "plukker-u6": {
     "naam": "plukker-u6",
     "cel": [
      76,
      94
     ],
     "anker": [
      38,
      80
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
       "bestand": "plukker-u6-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        79
       ],
       "anker": [
        20,
        74
       ]
      },
      "lopen": {
       "bestand": "plukker-u6-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      },
      "plukken": {
       "bestand": "plukker-u6-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        82
       ],
       "anker": [
        35,
        77
       ]
      }
     }
    },
    "binder-u6": {
     "naam": "binder-u6",
     "cel": [
      80,
      93
     ],
     "anker": [
      40,
      77
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
       "bestand": "binder-u6-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        74
       ]
      },
      "lopen": {
       "bestand": "binder-u6-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      },
      "binden": {
       "bestand": "binder-u6-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        74,
        80
       ],
       "anker": [
        37,
        67
       ]
      }
     }
    },
    "drager-u6": {
     "naam": "drager-u6",
     "cel": [
      92,
      101
     ],
     "anker": [
      46,
      87
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
       "bestand": "drager-u6-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        84,
        89
       ],
       "anker": [
        42,
        84
       ]
      },
      "lopen": {
       "bestand": "drager-u6-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        86,
        95
       ],
       "anker": [
        43,
        84
       ]
      }
     }
    },
    "dorser-u6": {
     "naam": "dorser-u6",
     "cel": [
      166,
      153
     ],
     "anker": [
      83,
      113
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
       "bestand": "dorser-u6-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        81
       ],
       "anker": [
        26,
        74
       ]
      },
      "lopen": {
       "bestand": "dorser-u6-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        91
       ],
       "anker": [
        42,
        80
       ]
      },
      "dorsen": {
       "bestand": "dorser-u6-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        160,
        147
       ],
       "anker": [
        80,
        110
       ]
      }
     }
    },
    "zager-u6": {
     "naam": "zager-u6",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zager-u6-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        74
       ]
      },
      "lopen": {
       "bestand": "zager-u6-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      },
      "zagen": {
       "bestand": "zager-u6-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        86
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boer-u7": {
     "naam": "boer-u7",
     "cel": [
      56,
      94
     ],
     "anker": [
      28,
      80
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
       "bestand": "boer-u7-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "boer-u7-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      }
     }
    },
    "maaier-u7": {
     "naam": "maaier-u7",
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
       "bestand": "maaier-u7-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        139,
        115
       ],
       "anker": [
        70,
        77
       ]
      }
     }
    },
    "zaaier-u7": {
     "naam": "zaaier-u7",
     "cel": [
      116,
      112
     ],
     "anker": [
      58,
      81
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
       "bestand": "zaaier-u7-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        82
       ],
       "anker": [
        20,
        77
       ]
      },
      "lopen": {
       "bestand": "zaaier-u7-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "zaaien": {
       "bestand": "zaaier-u7-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        106
       ],
       "anker": [
        55,
        78
       ]
      }
     }
    },
    "wieder-u7": {
     "naam": "wieder-u7",
     "cel": [
      101,
      109
     ],
     "anker": [
      51,
      82
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
       "bestand": "wieder-u7-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        50,
        91
       ],
       "anker": [
        25,
        79
       ]
      },
      "lopen": {
       "bestand": "wieder-u7-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        88
       ],
       "anker": [
        42,
        77
       ]
      },
      "wieden": {
       "bestand": "wieder-u7-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        95,
        101
       ],
       "anker": [
        48,
        77
       ]
      }
     }
    },
    "sprokkelaar-u7": {
     "naam": "sprokkelaar-u7",
     "cel": [
      76,
      106
     ],
     "anker": [
      38,
      86
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
       "bestand": "sprokkelaar-u7-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        87
       ],
       "anker": [
        27,
        82
       ]
      },
      "lopen": {
       "bestand": "sprokkelaar-u7-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        55,
        94
       ],
       "anker": [
        27,
        83
       ]
      },
      "rapen": {
       "bestand": "sprokkelaar-u7-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        99
       ],
       "anker": [
        35,
        82
       ]
      }
     }
    },
    "hakker-u7": {
     "naam": "hakker-u7",
     "cel": [
      94,
      111
     ],
     "anker": [
      47,
      96
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
       "bestand": "hakker-u7-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        89
       ],
       "anker": [
        24,
        77
       ]
      },
      "lopen": {
       "bestand": "hakker-u7-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        58,
        90
       ],
       "anker": [
        29,
        79
       ]
      },
      "hakken": {
       "bestand": "hakker-u7-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        88,
        101
       ],
       "anker": [
        44,
        93
       ]
      }
     }
    },
    "plukker-u7": {
     "naam": "plukker-u7",
     "cel": [
      76,
      97
     ],
     "anker": [
      38,
      83
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
       "bestand": "plukker-u7-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        82
       ],
       "anker": [
        20,
        77
       ]
      },
      "lopen": {
       "bestand": "plukker-u7-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "plukken": {
       "bestand": "plukker-u7-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        85
       ],
       "anker": [
        35,
        80
       ]
      }
     }
    },
    "binder-u7": {
     "naam": "binder-u7",
     "cel": [
      88,
      96
     ],
     "anker": [
      44,
      80
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
       "bestand": "binder-u7-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "binder-u7-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "binden": {
       "bestand": "binder-u7-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        82,
        81
       ],
       "anker": [
        41,
        68
       ]
      }
     }
    },
    "drager-u7": {
     "naam": "drager-u7",
     "cel": [
      92,
      101
     ],
     "anker": [
      46,
      87
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
       "bestand": "drager-u7-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        84,
        89
       ],
       "anker": [
        42,
        84
       ]
      },
      "lopen": {
       "bestand": "drager-u7-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        86,
        95
       ],
       "anker": [
        43,
        84
       ]
      }
     }
    },
    "dorser-u7": {
     "naam": "dorser-u7",
     "cel": [
      166,
      153
     ],
     "anker": [
      83,
      113
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
       "bestand": "dorser-u7-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        84
       ],
       "anker": [
        26,
        77
       ]
      },
      "lopen": {
       "bestand": "dorser-u7-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        91
       ],
       "anker": [
        42,
        80
       ]
      },
      "dorsen": {
       "bestand": "dorser-u7-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        160,
        147
       ],
       "anker": [
        80,
        110
       ]
      }
     }
    },
    "zager-u7": {
     "naam": "zager-u7",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zager-u7-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        82
       ],
       "anker": [
        24,
        77
       ]
      },
      "lopen": {
       "bestand": "zager-u7-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "zagen": {
       "bestand": "zager-u7-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        86
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boer-u8": {
     "naam": "boer-u8",
     "cel": [
      56,
      88
     ],
     "anker": [
      28,
      74
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
       "bestand": "boer-u8-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        76
       ],
       "anker": [
        18,
        71
       ]
      },
      "lopen": {
       "bestand": "boer-u8-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      }
     }
    },
    "maaier-u8": {
     "naam": "maaier-u8",
     "cel": [
      145,
      115
     ],
     "anker": [
      73,
      74
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
       "bestand": "maaier-u8-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        139,
        109
       ],
       "anker": [
        70,
        71
       ]
      }
     }
    },
    "zaaier-u8": {
     "naam": "zaaier-u8",
     "cel": [
      116,
      106
     ],
     "anker": [
      58,
      75
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
       "bestand": "zaaier-u8-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        76
       ],
       "anker": [
        20,
        71
       ]
      },
      "lopen": {
       "bestand": "zaaier-u8-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      },
      "zaaien": {
       "bestand": "zaaier-u8-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        100
       ],
       "anker": [
        55,
        72
       ]
      }
     }
    },
    "wieder-u8": {
     "naam": "wieder-u8",
     "cel": [
      101,
      102
     ],
     "anker": [
      51,
      75
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
       "bestand": "wieder-u8-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        50,
        84
       ],
       "anker": [
        25,
        72
       ]
      },
      "lopen": {
       "bestand": "wieder-u8-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        82
       ],
       "anker": [
        42,
        71
       ]
      },
      "wieden": {
       "bestand": "wieder-u8-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        95,
        96
       ],
       "anker": [
        48,
        72
       ]
      }
     }
    },
    "sprokkelaar-u8": {
     "naam": "sprokkelaar-u8",
     "cel": [
      76,
      106
     ],
     "anker": [
      38,
      86
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
       "bestand": "sprokkelaar-u8-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        87
       ],
       "anker": [
        27,
        82
       ]
      },
      "lopen": {
       "bestand": "sprokkelaar-u8-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        55,
        94
       ],
       "anker": [
        27,
        83
       ]
      },
      "rapen": {
       "bestand": "sprokkelaar-u8-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        99
       ],
       "anker": [
        35,
        82
       ]
      }
     }
    },
    "hakker-u8": {
     "naam": "hakker-u8",
     "cel": [
      94,
      111
     ],
     "anker": [
      47,
      96
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
       "bestand": "hakker-u8-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        83
       ],
       "anker": [
        24,
        71
       ]
      },
      "lopen": {
       "bestand": "hakker-u8-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        58,
        90
       ],
       "anker": [
        29,
        79
       ]
      },
      "hakken": {
       "bestand": "hakker-u8-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        88,
        101
       ],
       "anker": [
        44,
        93
       ]
      }
     }
    },
    "plukker-u8": {
     "naam": "plukker-u8",
     "cel": [
      76,
      91
     ],
     "anker": [
      38,
      77
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
       "bestand": "plukker-u8-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        76
       ],
       "anker": [
        20,
        71
       ]
      },
      "lopen": {
       "bestand": "plukker-u8-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      },
      "plukken": {
       "bestand": "plukker-u8-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        79
       ],
       "anker": [
        35,
        74
       ]
      }
     }
    },
    "binder-u8": {
     "naam": "binder-u8",
     "cel": [
      76,
      90
     ],
     "anker": [
      38,
      74
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
       "bestand": "binder-u8-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        76
       ],
       "anker": [
        18,
        71
       ]
      },
      "lopen": {
       "bestand": "binder-u8-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      },
      "binden": {
       "bestand": "binder-u8-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        76
       ],
       "anker": [
        35,
        63
       ]
      }
     }
    },
    "drager-u8": {
     "naam": "drager-u8",
     "cel": [
      92,
      101
     ],
     "anker": [
      46,
      87
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
       "bestand": "drager-u8-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        84,
        89
       ],
       "anker": [
        42,
        84
       ]
      },
      "lopen": {
       "bestand": "drager-u8-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        86,
        95
       ],
       "anker": [
        43,
        84
       ]
      }
     }
    },
    "dorser-u8": {
     "naam": "dorser-u8",
     "cel": [
      166,
      153
     ],
     "anker": [
      83,
      113
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
       "bestand": "dorser-u8-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        78
       ],
       "anker": [
        26,
        71
       ]
      },
      "lopen": {
       "bestand": "dorser-u8-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        91
       ],
       "anker": [
        42,
        80
       ]
      },
      "dorsen": {
       "bestand": "dorser-u8-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        160,
        147
       ],
       "anker": [
        80,
        110
       ]
      }
     }
    },
    "zager-u8": {
     "naam": "zager-u8",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zager-u8-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        76
       ],
       "anker": [
        24,
        71
       ]
      },
      "lopen": {
       "bestand": "zager-u8-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      },
      "zagen": {
       "bestand": "zager-u8-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        86
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boer-u9": {
     "naam": "boer-u9",
     "cel": [
      56,
      88
     ],
     "anker": [
      28,
      74
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
       "bestand": "boer-u9-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        76
       ],
       "anker": [
        18,
        71
       ]
      },
      "lopen": {
       "bestand": "boer-u9-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      }
     }
    },
    "maaier-u9": {
     "naam": "maaier-u9",
     "cel": [
      145,
      115
     ],
     "anker": [
      73,
      74
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
       "bestand": "maaier-u9-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        139,
        109
       ],
       "anker": [
        70,
        71
       ]
      }
     }
    },
    "zaaier-u9": {
     "naam": "zaaier-u9",
     "cel": [
      116,
      106
     ],
     "anker": [
      58,
      75
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
       "bestand": "zaaier-u9-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        76
       ],
       "anker": [
        20,
        71
       ]
      },
      "lopen": {
       "bestand": "zaaier-u9-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      },
      "zaaien": {
       "bestand": "zaaier-u9-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        100
       ],
       "anker": [
        55,
        72
       ]
      }
     }
    },
    "wieder-u9": {
     "naam": "wieder-u9",
     "cel": [
      101,
      102
     ],
     "anker": [
      51,
      75
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
       "bestand": "wieder-u9-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        50,
        84
       ],
       "anker": [
        25,
        72
       ]
      },
      "lopen": {
       "bestand": "wieder-u9-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        82
       ],
       "anker": [
        42,
        71
       ]
      },
      "wieden": {
       "bestand": "wieder-u9-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        95,
        95
       ],
       "anker": [
        48,
        71
       ]
      }
     }
    },
    "sprokkelaar-u9": {
     "naam": "sprokkelaar-u9",
     "cel": [
      76,
      106
     ],
     "anker": [
      38,
      86
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
       "bestand": "sprokkelaar-u9-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        87
       ],
       "anker": [
        27,
        82
       ]
      },
      "lopen": {
       "bestand": "sprokkelaar-u9-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        55,
        94
       ],
       "anker": [
        27,
        83
       ]
      },
      "rapen": {
       "bestand": "sprokkelaar-u9-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        99
       ],
       "anker": [
        35,
        82
       ]
      }
     }
    },
    "hakker-u9": {
     "naam": "hakker-u9",
     "cel": [
      94,
      111
     ],
     "anker": [
      47,
      96
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
       "bestand": "hakker-u9-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        83
       ],
       "anker": [
        24,
        71
       ]
      },
      "lopen": {
       "bestand": "hakker-u9-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        58,
        90
       ],
       "anker": [
        29,
        79
       ]
      },
      "hakken": {
       "bestand": "hakker-u9-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        88,
        101
       ],
       "anker": [
        44,
        93
       ]
      }
     }
    },
    "plukker-u9": {
     "naam": "plukker-u9",
     "cel": [
      76,
      91
     ],
     "anker": [
      38,
      77
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
       "bestand": "plukker-u9-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        76
       ],
       "anker": [
        20,
        71
       ]
      },
      "lopen": {
       "bestand": "plukker-u9-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      },
      "plukken": {
       "bestand": "plukker-u9-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        79
       ],
       "anker": [
        35,
        74
       ]
      }
     }
    },
    "binder-u9": {
     "naam": "binder-u9",
     "cel": [
      76,
      90
     ],
     "anker": [
      38,
      74
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
       "bestand": "binder-u9-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        76
       ],
       "anker": [
        18,
        71
       ]
      },
      "lopen": {
       "bestand": "binder-u9-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      },
      "binden": {
       "bestand": "binder-u9-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        75
       ],
       "anker": [
        35,
        62
       ]
      }
     }
    },
    "drager-u9": {
     "naam": "drager-u9",
     "cel": [
      92,
      101
     ],
     "anker": [
      46,
      87
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
       "bestand": "drager-u9-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        84,
        89
       ],
       "anker": [
        42,
        84
       ]
      },
      "lopen": {
       "bestand": "drager-u9-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        86,
        95
       ],
       "anker": [
        43,
        84
       ]
      }
     }
    },
    "dorser-u9": {
     "naam": "dorser-u9",
     "cel": [
      166,
      153
     ],
     "anker": [
      83,
      113
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
       "bestand": "dorser-u9-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        78
       ],
       "anker": [
        26,
        71
       ]
      },
      "lopen": {
       "bestand": "dorser-u9-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        91
       ],
       "anker": [
        42,
        80
       ]
      },
      "dorsen": {
       "bestand": "dorser-u9-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        160,
        147
       ],
       "anker": [
        80,
        110
       ]
      }
     }
    },
    "zager-u9": {
     "naam": "zager-u9",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zager-u9-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        76
       ],
       "anker": [
        24,
        71
       ]
      },
      "lopen": {
       "bestand": "zager-u9-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      },
      "zagen": {
       "bestand": "zager-u9-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        86
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boer-u10": {
     "naam": "boer-u10",
     "cel": [
      56,
      88
     ],
     "anker": [
      28,
      74
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
       "bestand": "boer-u10-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        76
       ],
       "anker": [
        17,
        71
       ]
      },
      "lopen": {
       "bestand": "boer-u10-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      }
     }
    },
    "maaier-u10": {
     "naam": "maaier-u10",
     "cel": [
      145,
      114
     ],
     "anker": [
      73,
      73
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
       "bestand": "maaier-u10-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        139,
        108
       ],
       "anker": [
        70,
        70
       ]
      }
     }
    },
    "zaaier-u10": {
     "naam": "zaaier-u10",
     "cel": [
      116,
      106
     ],
     "anker": [
      58,
      75
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
       "bestand": "zaaier-u10-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        76
       ],
       "anker": [
        20,
        71
       ]
      },
      "lopen": {
       "bestand": "zaaier-u10-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      },
      "zaaien": {
       "bestand": "zaaier-u10-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        100
       ],
       "anker": [
        55,
        72
       ]
      }
     }
    },
    "wieder-u10": {
     "naam": "wieder-u10",
     "cel": [
      101,
      102
     ],
     "anker": [
      51,
      75
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
       "bestand": "wieder-u10-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        50,
        84
       ],
       "anker": [
        25,
        72
       ]
      },
      "lopen": {
       "bestand": "wieder-u10-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        82
       ],
       "anker": [
        42,
        71
       ]
      },
      "wieden": {
       "bestand": "wieder-u10-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        95,
        96
       ],
       "anker": [
        48,
        72
       ]
      }
     }
    },
    "sprokkelaar-u10": {
     "naam": "sprokkelaar-u10",
     "cel": [
      76,
      106
     ],
     "anker": [
      38,
      86
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
       "bestand": "sprokkelaar-u10-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        87
       ],
       "anker": [
        27,
        82
       ]
      },
      "lopen": {
       "bestand": "sprokkelaar-u10-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        55,
        94
       ],
       "anker": [
        27,
        83
       ]
      },
      "rapen": {
       "bestand": "sprokkelaar-u10-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        99
       ],
       "anker": [
        35,
        82
       ]
      }
     }
    },
    "hakker-u10": {
     "naam": "hakker-u10",
     "cel": [
      94,
      111
     ],
     "anker": [
      47,
      96
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
       "bestand": "hakker-u10-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        83
       ],
       "anker": [
        24,
        71
       ]
      },
      "lopen": {
       "bestand": "hakker-u10-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        58,
        90
       ],
       "anker": [
        29,
        79
       ]
      },
      "hakken": {
       "bestand": "hakker-u10-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        88,
        101
       ],
       "anker": [
        44,
        93
       ]
      }
     }
    },
    "plukker-u10": {
     "naam": "plukker-u10",
     "cel": [
      76,
      91
     ],
     "anker": [
      38,
      77
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
       "bestand": "plukker-u10-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        76
       ],
       "anker": [
        20,
        71
       ]
      },
      "lopen": {
       "bestand": "plukker-u10-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      },
      "plukken": {
       "bestand": "plukker-u10-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        79
       ],
       "anker": [
        35,
        74
       ]
      }
     }
    },
    "binder-u10": {
     "naam": "binder-u10",
     "cel": [
      76,
      90
     ],
     "anker": [
      38,
      74
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
       "bestand": "binder-u10-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        76
       ],
       "anker": [
        18,
        71
       ]
      },
      "lopen": {
       "bestand": "binder-u10-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      },
      "binden": {
       "bestand": "binder-u10-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        76
       ],
       "anker": [
        35,
        63
       ]
      }
     }
    },
    "drager-u10": {
     "naam": "drager-u10",
     "cel": [
      92,
      101
     ],
     "anker": [
      46,
      87
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
       "bestand": "drager-u10-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        84,
        89
       ],
       "anker": [
        42,
        84
       ]
      },
      "lopen": {
       "bestand": "drager-u10-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        86,
        95
       ],
       "anker": [
        43,
        84
       ]
      }
     }
    },
    "dorser-u10": {
     "naam": "dorser-u10",
     "cel": [
      166,
      153
     ],
     "anker": [
      83,
      113
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
       "bestand": "dorser-u10-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        78
       ],
       "anker": [
        26,
        71
       ]
      },
      "lopen": {
       "bestand": "dorser-u10-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        91
       ],
       "anker": [
        42,
        80
       ]
      },
      "dorsen": {
       "bestand": "dorser-u10-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        160,
        147
       ],
       "anker": [
        80,
        110
       ]
      }
     }
    },
    "zager-u10": {
     "naam": "zager-u10",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zager-u10-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        76
       ],
       "anker": [
        24,
        71
       ]
      },
      "lopen": {
       "bestand": "zager-u10-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      },
      "zagen": {
       "bestand": "zager-u10-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        86
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boer-u11": {
     "naam": "boer-u11",
     "cel": [
      56,
      87
     ],
     "anker": [
      28,
      73
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
       "bestand": "boer-u11-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        75
       ],
       "anker": [
        18,
        70
       ]
      },
      "lopen": {
       "bestand": "boer-u11-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      }
     }
    },
    "maaier-u11": {
     "naam": "maaier-u11",
     "cel": [
      145,
      114
     ],
     "anker": [
      73,
      73
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
       "bestand": "maaier-u11-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        139,
        108
       ],
       "anker": [
        70,
        70
       ]
      }
     }
    },
    "zaaier-u11": {
     "naam": "zaaier-u11",
     "cel": [
      116,
      105
     ],
     "anker": [
      58,
      74
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
       "bestand": "zaaier-u11-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        75
       ],
       "anker": [
        20,
        70
       ]
      },
      "lopen": {
       "bestand": "zaaier-u11-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      },
      "zaaien": {
       "bestand": "zaaier-u11-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        99
       ],
       "anker": [
        55,
        71
       ]
      }
     }
    },
    "wieder-u11": {
     "naam": "wieder-u11",
     "cel": [
      101,
      102
     ],
     "anker": [
      51,
      75
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
       "bestand": "wieder-u11-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        50,
        84
       ],
       "anker": [
        25,
        72
       ]
      },
      "lopen": {
       "bestand": "wieder-u11-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        82
       ],
       "anker": [
        42,
        71
       ]
      },
      "wieden": {
       "bestand": "wieder-u11-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        95,
        95
       ],
       "anker": [
        48,
        71
       ]
      }
     }
    },
    "sprokkelaar-u11": {
     "naam": "sprokkelaar-u11",
     "cel": [
      76,
      106
     ],
     "anker": [
      38,
      86
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
       "bestand": "sprokkelaar-u11-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        87
       ],
       "anker": [
        27,
        82
       ]
      },
      "lopen": {
       "bestand": "sprokkelaar-u11-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        55,
        94
       ],
       "anker": [
        27,
        83
       ]
      },
      "rapen": {
       "bestand": "sprokkelaar-u11-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        99
       ],
       "anker": [
        35,
        82
       ]
      }
     }
    },
    "hakker-u11": {
     "naam": "hakker-u11",
     "cel": [
      94,
      111
     ],
     "anker": [
      47,
      96
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
       "bestand": "hakker-u11-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        82
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "hakker-u11-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        58,
        90
       ],
       "anker": [
        29,
        79
       ]
      },
      "hakken": {
       "bestand": "hakker-u11-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        88,
        101
       ],
       "anker": [
        44,
        93
       ]
      }
     }
    },
    "plukker-u11": {
     "naam": "plukker-u11",
     "cel": [
      76,
      90
     ],
     "anker": [
      38,
      76
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
       "bestand": "plukker-u11-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        75
       ],
       "anker": [
        20,
        70
       ]
      },
      "lopen": {
       "bestand": "plukker-u11-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      },
      "plukken": {
       "bestand": "plukker-u11-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        78
       ],
       "anker": [
        35,
        73
       ]
      }
     }
    },
    "binder-u11": {
     "naam": "binder-u11",
     "cel": [
      76,
      89
     ],
     "anker": [
      38,
      73
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
       "bestand": "binder-u11-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        75
       ],
       "anker": [
        18,
        70
       ]
      },
      "lopen": {
       "bestand": "binder-u11-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      },
      "binden": {
       "bestand": "binder-u11-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        75
       ],
       "anker": [
        35,
        62
       ]
      }
     }
    },
    "drager-u11": {
     "naam": "drager-u11",
     "cel": [
      92,
      101
     ],
     "anker": [
      46,
      87
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
       "bestand": "drager-u11-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        84,
        89
       ],
       "anker": [
        42,
        84
       ]
      },
      "lopen": {
       "bestand": "drager-u11-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        86,
        95
       ],
       "anker": [
        43,
        84
       ]
      }
     }
    },
    "dorser-u11": {
     "naam": "dorser-u11",
     "cel": [
      166,
      153
     ],
     "anker": [
      83,
      113
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
       "bestand": "dorser-u11-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        77
       ],
       "anker": [
        26,
        70
       ]
      },
      "lopen": {
       "bestand": "dorser-u11-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        91
       ],
       "anker": [
        42,
        80
       ]
      },
      "dorsen": {
       "bestand": "dorser-u11-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        160,
        147
       ],
       "anker": [
        80,
        110
       ]
      }
     }
    },
    "zager-u11": {
     "naam": "zager-u11",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zager-u11-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        75
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "zager-u11-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      },
      "zagen": {
       "bestand": "zager-u11-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        86
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boer-u12": {
     "naam": "boer-u12",
     "cel": [
      56,
      94
     ],
     "anker": [
      28,
      80
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
       "bestand": "boer-u12-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "boer-u12-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      }
     }
    },
    "maaier-u12": {
     "naam": "maaier-u12",
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
       "bestand": "maaier-u12-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        139,
        115
       ],
       "anker": [
        70,
        77
       ]
      }
     }
    },
    "zaaier-u12": {
     "naam": "zaaier-u12",
     "cel": [
      116,
      112
     ],
     "anker": [
      58,
      81
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
       "bestand": "zaaier-u12-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        82
       ],
       "anker": [
        20,
        77
       ]
      },
      "lopen": {
       "bestand": "zaaier-u12-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "zaaien": {
       "bestand": "zaaier-u12-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        106
       ],
       "anker": [
        55,
        78
       ]
      }
     }
    },
    "wieder-u12": {
     "naam": "wieder-u12",
     "cel": [
      101,
      109
     ],
     "anker": [
      51,
      82
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
       "bestand": "wieder-u12-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        50,
        91
       ],
       "anker": [
        25,
        79
       ]
      },
      "lopen": {
       "bestand": "wieder-u12-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        88
       ],
       "anker": [
        42,
        77
       ]
      },
      "wieden": {
       "bestand": "wieder-u12-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        95,
        101
       ],
       "anker": [
        48,
        77
       ]
      }
     }
    },
    "sprokkelaar-u12": {
     "naam": "sprokkelaar-u12",
     "cel": [
      76,
      106
     ],
     "anker": [
      38,
      86
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
       "bestand": "sprokkelaar-u12-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        87
       ],
       "anker": [
        27,
        82
       ]
      },
      "lopen": {
       "bestand": "sprokkelaar-u12-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        55,
        94
       ],
       "anker": [
        27,
        83
       ]
      },
      "rapen": {
       "bestand": "sprokkelaar-u12-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        99
       ],
       "anker": [
        35,
        82
       ]
      }
     }
    },
    "hakker-u12": {
     "naam": "hakker-u12",
     "cel": [
      94,
      111
     ],
     "anker": [
      47,
      96
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
       "bestand": "hakker-u12-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        89
       ],
       "anker": [
        24,
        77
       ]
      },
      "lopen": {
       "bestand": "hakker-u12-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        58,
        90
       ],
       "anker": [
        29,
        79
       ]
      },
      "hakken": {
       "bestand": "hakker-u12-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        88,
        101
       ],
       "anker": [
        44,
        93
       ]
      }
     }
    },
    "plukker-u12": {
     "naam": "plukker-u12",
     "cel": [
      76,
      97
     ],
     "anker": [
      38,
      83
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
       "bestand": "plukker-u12-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        82
       ],
       "anker": [
        20,
        77
       ]
      },
      "lopen": {
       "bestand": "plukker-u12-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "plukken": {
       "bestand": "plukker-u12-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        85
       ],
       "anker": [
        35,
        80
       ]
      }
     }
    },
    "binder-u12": {
     "naam": "binder-u12",
     "cel": [
      88,
      96
     ],
     "anker": [
      44,
      80
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
       "bestand": "binder-u12-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "binder-u12-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "binden": {
       "bestand": "binder-u12-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        82,
        81
       ],
       "anker": [
        41,
        68
       ]
      }
     }
    },
    "drager-u12": {
     "naam": "drager-u12",
     "cel": [
      92,
      101
     ],
     "anker": [
      46,
      87
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
       "bestand": "drager-u12-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        84,
        89
       ],
       "anker": [
        42,
        84
       ]
      },
      "lopen": {
       "bestand": "drager-u12-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        86,
        95
       ],
       "anker": [
        43,
        84
       ]
      }
     }
    },
    "dorser-u12": {
     "naam": "dorser-u12",
     "cel": [
      166,
      153
     ],
     "anker": [
      83,
      113
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
       "bestand": "dorser-u12-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        84
       ],
       "anker": [
        26,
        77
       ]
      },
      "lopen": {
       "bestand": "dorser-u12-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        91
       ],
       "anker": [
        42,
        80
       ]
      },
      "dorsen": {
       "bestand": "dorser-u12-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        160,
        147
       ],
       "anker": [
        80,
        110
       ]
      }
     }
    },
    "zager-u12": {
     "naam": "zager-u12",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zager-u12-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        82
       ],
       "anker": [
        24,
        77
       ]
      },
      "lopen": {
       "bestand": "zager-u12-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "zagen": {
       "bestand": "zager-u12-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        86
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boer-u13": {
     "naam": "boer-u13",
     "cel": [
      56,
      88
     ],
     "anker": [
      28,
      74
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
       "bestand": "boer-u13-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        76
       ],
       "anker": [
        18,
        71
       ]
      },
      "lopen": {
       "bestand": "boer-u13-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      }
     }
    },
    "maaier-u13": {
     "naam": "maaier-u13",
     "cel": [
      145,
      115
     ],
     "anker": [
      73,
      74
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
       "bestand": "maaier-u13-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        139,
        109
       ],
       "anker": [
        70,
        71
       ]
      }
     }
    },
    "zaaier-u13": {
     "naam": "zaaier-u13",
     "cel": [
      116,
      106
     ],
     "anker": [
      58,
      75
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
       "bestand": "zaaier-u13-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        76
       ],
       "anker": [
        20,
        71
       ]
      },
      "lopen": {
       "bestand": "zaaier-u13-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      },
      "zaaien": {
       "bestand": "zaaier-u13-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        100
       ],
       "anker": [
        55,
        72
       ]
      }
     }
    },
    "wieder-u13": {
     "naam": "wieder-u13",
     "cel": [
      101,
      103
     ],
     "anker": [
      51,
      76
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
       "bestand": "wieder-u13-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        73
       ]
      },
      "lopen": {
       "bestand": "wieder-u13-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        82
       ],
       "anker": [
        42,
        71
       ]
      },
      "wieden": {
       "bestand": "wieder-u13-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        95,
        96
       ],
       "anker": [
        48,
        72
       ]
      }
     }
    },
    "sprokkelaar-u13": {
     "naam": "sprokkelaar-u13",
     "cel": [
      76,
      106
     ],
     "anker": [
      38,
      86
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
       "bestand": "sprokkelaar-u13-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        87
       ],
       "anker": [
        27,
        82
       ]
      },
      "lopen": {
       "bestand": "sprokkelaar-u13-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        55,
        94
       ],
       "anker": [
        27,
        83
       ]
      },
      "rapen": {
       "bestand": "sprokkelaar-u13-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        99
       ],
       "anker": [
        35,
        82
       ]
      }
     }
    },
    "hakker-u13": {
     "naam": "hakker-u13",
     "cel": [
      94,
      111
     ],
     "anker": [
      47,
      96
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
       "bestand": "hakker-u13-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        83
       ],
       "anker": [
        24,
        71
       ]
      },
      "lopen": {
       "bestand": "hakker-u13-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        58,
        90
       ],
       "anker": [
        29,
        79
       ]
      },
      "hakken": {
       "bestand": "hakker-u13-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        88,
        101
       ],
       "anker": [
        44,
        93
       ]
      }
     }
    },
    "plukker-u13": {
     "naam": "plukker-u13",
     "cel": [
      76,
      91
     ],
     "anker": [
      38,
      77
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
       "bestand": "plukker-u13-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        76
       ],
       "anker": [
        20,
        71
       ]
      },
      "lopen": {
       "bestand": "plukker-u13-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      },
      "plukken": {
       "bestand": "plukker-u13-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        79
       ],
       "anker": [
        35,
        74
       ]
      }
     }
    },
    "binder-u13": {
     "naam": "binder-u13",
     "cel": [
      76,
      90
     ],
     "anker": [
      38,
      74
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
       "bestand": "binder-u13-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        76
       ],
       "anker": [
        18,
        71
       ]
      },
      "lopen": {
       "bestand": "binder-u13-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      },
      "binden": {
       "bestand": "binder-u13-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        76
       ],
       "anker": [
        35,
        63
       ]
      }
     }
    },
    "drager-u13": {
     "naam": "drager-u13",
     "cel": [
      92,
      101
     ],
     "anker": [
      46,
      87
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
       "bestand": "drager-u13-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        84,
        89
       ],
       "anker": [
        42,
        84
       ]
      },
      "lopen": {
       "bestand": "drager-u13-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        86,
        95
       ],
       "anker": [
        43,
        84
       ]
      }
     }
    },
    "dorser-u13": {
     "naam": "dorser-u13",
     "cel": [
      166,
      153
     ],
     "anker": [
      83,
      113
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
       "bestand": "dorser-u13-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        78
       ],
       "anker": [
        26,
        71
       ]
      },
      "lopen": {
       "bestand": "dorser-u13-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        91
       ],
       "anker": [
        42,
        80
       ]
      },
      "dorsen": {
       "bestand": "dorser-u13-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        160,
        147
       ],
       "anker": [
        80,
        110
       ]
      }
     }
    },
    "zager-u13": {
     "naam": "zager-u13",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zager-u13-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        76
       ],
       "anker": [
        24,
        71
       ]
      },
      "lopen": {
       "bestand": "zager-u13-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      },
      "zagen": {
       "bestand": "zager-u13-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        86
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boer-u14": {
     "naam": "boer-u14",
     "cel": [
      56,
      91
     ],
     "anker": [
      28,
      77
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
       "bestand": "boer-u14-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        74
       ]
      },
      "lopen": {
       "bestand": "boer-u14-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      }
     }
    },
    "maaier-u14": {
     "naam": "maaier-u14",
     "cel": [
      145,
      118
     ],
     "anker": [
      73,
      77
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
       "bestand": "maaier-u14-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        139,
        112
       ],
       "anker": [
        70,
        74
       ]
      }
     }
    },
    "zaaier-u14": {
     "naam": "zaaier-u14",
     "cel": [
      116,
      109
     ],
     "anker": [
      58,
      78
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
       "bestand": "zaaier-u14-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        79
       ],
       "anker": [
        20,
        74
       ]
      },
      "lopen": {
       "bestand": "zaaier-u14-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      },
      "zaaien": {
       "bestand": "zaaier-u14-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        103
       ],
       "anker": [
        55,
        75
       ]
      }
     }
    },
    "wieder-u14": {
     "naam": "wieder-u14",
     "cel": [
      101,
      105
     ],
     "anker": [
      51,
      78
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
       "bestand": "wieder-u14-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        50,
        87
       ],
       "anker": [
        25,
        75
       ]
      },
      "lopen": {
       "bestand": "wieder-u14-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        85
       ],
       "anker": [
        42,
        74
       ]
      },
      "wieden": {
       "bestand": "wieder-u14-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        95,
        99
       ],
       "anker": [
        48,
        75
       ]
      }
     }
    },
    "sprokkelaar-u14": {
     "naam": "sprokkelaar-u14",
     "cel": [
      76,
      106
     ],
     "anker": [
      38,
      86
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
       "bestand": "sprokkelaar-u14-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        87
       ],
       "anker": [
        27,
        82
       ]
      },
      "lopen": {
       "bestand": "sprokkelaar-u14-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        55,
        94
       ],
       "anker": [
        27,
        83
       ]
      },
      "rapen": {
       "bestand": "sprokkelaar-u14-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        99
       ],
       "anker": [
        35,
        82
       ]
      }
     }
    },
    "hakker-u14": {
     "naam": "hakker-u14",
     "cel": [
      94,
      111
     ],
     "anker": [
      47,
      96
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
       "bestand": "hakker-u14-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        86
       ],
       "anker": [
        24,
        74
       ]
      },
      "lopen": {
       "bestand": "hakker-u14-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        58,
        90
       ],
       "anker": [
        29,
        79
       ]
      },
      "hakken": {
       "bestand": "hakker-u14-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        88,
        101
       ],
       "anker": [
        44,
        93
       ]
      }
     }
    },
    "plukker-u14": {
     "naam": "plukker-u14",
     "cel": [
      76,
      94
     ],
     "anker": [
      38,
      80
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
       "bestand": "plukker-u14-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        79
       ],
       "anker": [
        20,
        74
       ]
      },
      "lopen": {
       "bestand": "plukker-u14-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      },
      "plukken": {
       "bestand": "plukker-u14-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        82
       ],
       "anker": [
        35,
        77
       ]
      }
     }
    },
    "binder-u14": {
     "naam": "binder-u14",
     "cel": [
      80,
      93
     ],
     "anker": [
      40,
      77
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
       "bestand": "binder-u14-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        74
       ]
      },
      "lopen": {
       "bestand": "binder-u14-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      },
      "binden": {
       "bestand": "binder-u14-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        74,
        80
       ],
       "anker": [
        37,
        67
       ]
      }
     }
    },
    "drager-u14": {
     "naam": "drager-u14",
     "cel": [
      92,
      101
     ],
     "anker": [
      46,
      87
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
       "bestand": "drager-u14-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        84,
        89
       ],
       "anker": [
        42,
        84
       ]
      },
      "lopen": {
       "bestand": "drager-u14-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        86,
        95
       ],
       "anker": [
        43,
        84
       ]
      }
     }
    },
    "dorser-u14": {
     "naam": "dorser-u14",
     "cel": [
      166,
      153
     ],
     "anker": [
      83,
      113
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
       "bestand": "dorser-u14-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        81
       ],
       "anker": [
        26,
        74
       ]
      },
      "lopen": {
       "bestand": "dorser-u14-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        91
       ],
       "anker": [
        42,
        80
       ]
      },
      "dorsen": {
       "bestand": "dorser-u14-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        160,
        147
       ],
       "anker": [
        80,
        110
       ]
      }
     }
    },
    "zager-u14": {
     "naam": "zager-u14",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zager-u14-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        74
       ]
      },
      "lopen": {
       "bestand": "zager-u14-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      },
      "zagen": {
       "bestand": "zager-u14-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        86
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boer-u15": {
     "naam": "boer-u15",
     "cel": [
      56,
      93
     ],
     "anker": [
      28,
      79
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
       "bestand": "boer-u15-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        81
       ],
       "anker": [
        18,
        76
       ]
      },
      "lopen": {
       "bestand": "boer-u15-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        86
       ],
       "anker": [
        25,
        75
       ]
      }
     }
    },
    "maaier-u15": {
     "naam": "maaier-u15",
     "cel": [
      145,
      120
     ],
     "anker": [
      73,
      79
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
       "bestand": "maaier-u15-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        139,
        114
       ],
       "anker": [
        70,
        76
       ]
      }
     }
    },
    "zaaier-u15": {
     "naam": "zaaier-u15",
     "cel": [
      116,
      111
     ],
     "anker": [
      58,
      80
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
       "bestand": "zaaier-u15-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        81
       ],
       "anker": [
        20,
        76
       ]
      },
      "lopen": {
       "bestand": "zaaier-u15-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        86
       ],
       "anker": [
        25,
        75
       ]
      },
      "zaaien": {
       "bestand": "zaaier-u15-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        105
       ],
       "anker": [
        55,
        77
       ]
      }
     }
    },
    "wieder-u15": {
     "naam": "wieder-u15",
     "cel": [
      101,
      107
     ],
     "anker": [
      51,
      80
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
       "bestand": "wieder-u15-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        50,
        89
       ],
       "anker": [
        25,
        77
       ]
      },
      "lopen": {
       "bestand": "wieder-u15-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        86
       ],
       "anker": [
        42,
        75
       ]
      },
      "wieden": {
       "bestand": "wieder-u15-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        95,
        100
       ],
       "anker": [
        48,
        76
       ]
      }
     }
    },
    "sprokkelaar-u15": {
     "naam": "sprokkelaar-u15",
     "cel": [
      76,
      106
     ],
     "anker": [
      38,
      86
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
       "bestand": "sprokkelaar-u15-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        87
       ],
       "anker": [
        27,
        82
       ]
      },
      "lopen": {
       "bestand": "sprokkelaar-u15-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        55,
        94
       ],
       "anker": [
        27,
        83
       ]
      },
      "rapen": {
       "bestand": "sprokkelaar-u15-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        99
       ],
       "anker": [
        35,
        82
       ]
      }
     }
    },
    "hakker-u15": {
     "naam": "hakker-u15",
     "cel": [
      94,
      111
     ],
     "anker": [
      47,
      96
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
       "bestand": "hakker-u15-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        88
       ],
       "anker": [
        24,
        76
       ]
      },
      "lopen": {
       "bestand": "hakker-u15-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        58,
        90
       ],
       "anker": [
        29,
        79
       ]
      },
      "hakken": {
       "bestand": "hakker-u15-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        88,
        101
       ],
       "anker": [
        44,
        93
       ]
      }
     }
    },
    "plukker-u15": {
     "naam": "plukker-u15",
     "cel": [
      76,
      95
     ],
     "anker": [
      38,
      81
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
       "bestand": "plukker-u15-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        81
       ],
       "anker": [
        20,
        76
       ]
      },
      "lopen": {
       "bestand": "plukker-u15-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        86
       ],
       "anker": [
        25,
        75
       ]
      },
      "plukken": {
       "bestand": "plukker-u15-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        83
       ],
       "anker": [
        35,
        78
       ]
      }
     }
    },
    "binder-u15": {
     "naam": "binder-u15",
     "cel": [
      80,
      95
     ],
     "anker": [
      40,
      79
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
       "bestand": "binder-u15-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        81
       ],
       "anker": [
        18,
        76
       ]
      },
      "lopen": {
       "bestand": "binder-u15-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        86
       ],
       "anker": [
        25,
        75
       ]
      },
      "binden": {
       "bestand": "binder-u15-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        74,
        80
       ],
       "anker": [
        37,
        67
       ]
      }
     }
    },
    "drager-u15": {
     "naam": "drager-u15",
     "cel": [
      92,
      101
     ],
     "anker": [
      46,
      87
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
       "bestand": "drager-u15-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        84,
        89
       ],
       "anker": [
        42,
        84
       ]
      },
      "lopen": {
       "bestand": "drager-u15-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        86,
        95
       ],
       "anker": [
        43,
        84
       ]
      }
     }
    },
    "dorser-u15": {
     "naam": "dorser-u15",
     "cel": [
      166,
      153
     ],
     "anker": [
      83,
      113
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
       "bestand": "dorser-u15-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        83
       ],
       "anker": [
        26,
        76
       ]
      },
      "lopen": {
       "bestand": "dorser-u15-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        91
       ],
       "anker": [
        42,
        80
       ]
      },
      "dorsen": {
       "bestand": "dorser-u15-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        160,
        147
       ],
       "anker": [
        80,
        110
       ]
      }
     }
    },
    "zager-u15": {
     "naam": "zager-u15",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zager-u15-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        81
       ],
       "anker": [
        24,
        76
       ]
      },
      "lopen": {
       "bestand": "zager-u15-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        86
       ],
       "anker": [
        25,
        75
       ]
      },
      "zagen": {
       "bestand": "zager-u15-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        86
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boer-u16": {
     "naam": "boer-u16",
     "cel": [
      56,
      94
     ],
     "anker": [
      28,
      80
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
       "bestand": "boer-u16-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "boer-u16-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      }
     }
    },
    "maaier-u16": {
     "naam": "maaier-u16",
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
       "bestand": "maaier-u16-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        139,
        115
       ],
       "anker": [
        70,
        77
       ]
      }
     }
    },
    "zaaier-u16": {
     "naam": "zaaier-u16",
     "cel": [
      116,
      112
     ],
     "anker": [
      58,
      81
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
       "bestand": "zaaier-u16-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        82
       ],
       "anker": [
        20,
        77
       ]
      },
      "lopen": {
       "bestand": "zaaier-u16-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "zaaien": {
       "bestand": "zaaier-u16-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        106
       ],
       "anker": [
        55,
        78
       ]
      }
     }
    },
    "wieder-u16": {
     "naam": "wieder-u16",
     "cel": [
      101,
      109
     ],
     "anker": [
      51,
      82
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
       "bestand": "wieder-u16-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        50,
        91
       ],
       "anker": [
        25,
        79
       ]
      },
      "lopen": {
       "bestand": "wieder-u16-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        88
       ],
       "anker": [
        42,
        77
       ]
      },
      "wieden": {
       "bestand": "wieder-u16-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        95,
        102
       ],
       "anker": [
        48,
        78
       ]
      }
     }
    },
    "sprokkelaar-u16": {
     "naam": "sprokkelaar-u16",
     "cel": [
      76,
      106
     ],
     "anker": [
      38,
      86
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
       "bestand": "sprokkelaar-u16-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        87
       ],
       "anker": [
        27,
        82
       ]
      },
      "lopen": {
       "bestand": "sprokkelaar-u16-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        55,
        94
       ],
       "anker": [
        27,
        83
       ]
      },
      "rapen": {
       "bestand": "sprokkelaar-u16-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        99
       ],
       "anker": [
        35,
        82
       ]
      }
     }
    },
    "hakker-u16": {
     "naam": "hakker-u16",
     "cel": [
      94,
      111
     ],
     "anker": [
      47,
      96
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
       "bestand": "hakker-u16-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        89
       ],
       "anker": [
        24,
        77
       ]
      },
      "lopen": {
       "bestand": "hakker-u16-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        58,
        90
       ],
       "anker": [
        29,
        79
       ]
      },
      "hakken": {
       "bestand": "hakker-u16-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        88,
        101
       ],
       "anker": [
        44,
        93
       ]
      }
     }
    },
    "plukker-u16": {
     "naam": "plukker-u16",
     "cel": [
      76,
      97
     ],
     "anker": [
      38,
      83
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
       "bestand": "plukker-u16-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        82
       ],
       "anker": [
        20,
        77
       ]
      },
      "lopen": {
       "bestand": "plukker-u16-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "plukken": {
       "bestand": "plukker-u16-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        85
       ],
       "anker": [
        35,
        80
       ]
      }
     }
    },
    "binder-u16": {
     "naam": "binder-u16",
     "cel": [
      82,
      96
     ],
     "anker": [
      41,
      80
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
       "bestand": "binder-u16-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "binder-u16-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "binden": {
       "bestand": "binder-u16-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        76,
        82
       ],
       "anker": [
        38,
        69
       ]
      }
     }
    },
    "drager-u16": {
     "naam": "drager-u16",
     "cel": [
      92,
      101
     ],
     "anker": [
      46,
      87
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
       "bestand": "drager-u16-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        84,
        89
       ],
       "anker": [
        42,
        84
       ]
      },
      "lopen": {
       "bestand": "drager-u16-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        86,
        95
       ],
       "anker": [
        43,
        84
       ]
      }
     }
    },
    "dorser-u16": {
     "naam": "dorser-u16",
     "cel": [
      166,
      153
     ],
     "anker": [
      83,
      113
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
       "bestand": "dorser-u16-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        84
       ],
       "anker": [
        26,
        77
       ]
      },
      "lopen": {
       "bestand": "dorser-u16-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        91
       ],
       "anker": [
        42,
        80
       ]
      },
      "dorsen": {
       "bestand": "dorser-u16-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        160,
        147
       ],
       "anker": [
        80,
        110
       ]
      }
     }
    },
    "zager-u16": {
     "naam": "zager-u16",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zager-u16-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        82
       ],
       "anker": [
        24,
        77
       ]
      },
      "lopen": {
       "bestand": "zager-u16-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "zagen": {
       "bestand": "zager-u16-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        86
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boer-u17": {
     "naam": "boer-u17",
     "cel": [
      56,
      94
     ],
     "anker": [
      28,
      80
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
       "bestand": "boer-u17-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "boer-u17-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      }
     }
    },
    "maaier-u17": {
     "naam": "maaier-u17",
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
       "bestand": "maaier-u17-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        139,
        115
       ],
       "anker": [
        70,
        77
       ]
      }
     }
    },
    "zaaier-u17": {
     "naam": "zaaier-u17",
     "cel": [
      116,
      112
     ],
     "anker": [
      58,
      81
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
       "bestand": "zaaier-u17-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        82
       ],
       "anker": [
        20,
        77
       ]
      },
      "lopen": {
       "bestand": "zaaier-u17-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "zaaien": {
       "bestand": "zaaier-u17-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        106
       ],
       "anker": [
        55,
        78
       ]
      }
     }
    },
    "wieder-u17": {
     "naam": "wieder-u17",
     "cel": [
      101,
      109
     ],
     "anker": [
      51,
      82
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
       "bestand": "wieder-u17-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        50,
        91
       ],
       "anker": [
        25,
        79
       ]
      },
      "lopen": {
       "bestand": "wieder-u17-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        88
       ],
       "anker": [
        42,
        77
       ]
      },
      "wieden": {
       "bestand": "wieder-u17-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        95,
        101
       ],
       "anker": [
        48,
        77
       ]
      }
     }
    },
    "sprokkelaar-u17": {
     "naam": "sprokkelaar-u17",
     "cel": [
      76,
      106
     ],
     "anker": [
      38,
      86
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
       "bestand": "sprokkelaar-u17-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        87
       ],
       "anker": [
        27,
        82
       ]
      },
      "lopen": {
       "bestand": "sprokkelaar-u17-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        55,
        94
       ],
       "anker": [
        27,
        83
       ]
      },
      "rapen": {
       "bestand": "sprokkelaar-u17-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        99
       ],
       "anker": [
        35,
        82
       ]
      }
     }
    },
    "hakker-u17": {
     "naam": "hakker-u17",
     "cel": [
      94,
      111
     ],
     "anker": [
      47,
      96
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
       "bestand": "hakker-u17-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        89
       ],
       "anker": [
        24,
        77
       ]
      },
      "lopen": {
       "bestand": "hakker-u17-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        58,
        90
       ],
       "anker": [
        29,
        79
       ]
      },
      "hakken": {
       "bestand": "hakker-u17-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        88,
        101
       ],
       "anker": [
        44,
        93
       ]
      }
     }
    },
    "plukker-u17": {
     "naam": "plukker-u17",
     "cel": [
      76,
      97
     ],
     "anker": [
      38,
      83
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
       "bestand": "plukker-u17-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        82
       ],
       "anker": [
        20,
        77
       ]
      },
      "lopen": {
       "bestand": "plukker-u17-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "plukken": {
       "bestand": "plukker-u17-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        85
       ],
       "anker": [
        35,
        80
       ]
      }
     }
    },
    "binder-u17": {
     "naam": "binder-u17",
     "cel": [
      88,
      96
     ],
     "anker": [
      44,
      80
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
       "bestand": "binder-u17-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "binder-u17-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "binden": {
       "bestand": "binder-u17-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        82,
        81
       ],
       "anker": [
        41,
        68
       ]
      }
     }
    },
    "drager-u17": {
     "naam": "drager-u17",
     "cel": [
      92,
      101
     ],
     "anker": [
      46,
      87
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
       "bestand": "drager-u17-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        84,
        89
       ],
       "anker": [
        42,
        84
       ]
      },
      "lopen": {
       "bestand": "drager-u17-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        86,
        95
       ],
       "anker": [
        43,
        84
       ]
      }
     }
    },
    "dorser-u17": {
     "naam": "dorser-u17",
     "cel": [
      166,
      153
     ],
     "anker": [
      83,
      113
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
       "bestand": "dorser-u17-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        84
       ],
       "anker": [
        26,
        77
       ]
      },
      "lopen": {
       "bestand": "dorser-u17-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        91
       ],
       "anker": [
        42,
        80
       ]
      },
      "dorsen": {
       "bestand": "dorser-u17-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        160,
        147
       ],
       "anker": [
        80,
        110
       ]
      }
     }
    },
    "zager-u17": {
     "naam": "zager-u17",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zager-u17-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        82
       ],
       "anker": [
        24,
        77
       ]
      },
      "lopen": {
       "bestand": "zager-u17-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "zagen": {
       "bestand": "zager-u17-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        86
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boer-u18": {
     "naam": "boer-u18",
     "cel": [
      56,
      89
     ],
     "anker": [
      28,
      75
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
       "bestand": "boer-u18-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        77
       ],
       "anker": [
        18,
        72
       ]
      },
      "lopen": {
       "bestand": "boer-u18-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        83
       ],
       "anker": [
        25,
        72
       ]
      }
     }
    },
    "maaier-u18": {
     "naam": "maaier-u18",
     "cel": [
      145,
      116
     ],
     "anker": [
      73,
      75
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
       "bestand": "maaier-u18-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        139,
        110
       ],
       "anker": [
        70,
        72
       ]
      }
     }
    },
    "zaaier-u18": {
     "naam": "zaaier-u18",
     "cel": [
      116,
      107
     ],
     "anker": [
      58,
      76
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
       "bestand": "zaaier-u18-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        77
       ],
       "anker": [
        20,
        72
       ]
      },
      "lopen": {
       "bestand": "zaaier-u18-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        83
       ],
       "anker": [
        25,
        72
       ]
      },
      "zaaien": {
       "bestand": "zaaier-u18-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        101
       ],
       "anker": [
        55,
        73
       ]
      }
     }
    },
    "wieder-u18": {
     "naam": "wieder-u18",
     "cel": [
      101,
      103
     ],
     "anker": [
      51,
      76
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
       "bestand": "wieder-u18-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        73
       ]
      },
      "lopen": {
       "bestand": "wieder-u18-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        83
       ],
       "anker": [
        42,
        72
       ]
      },
      "wieden": {
       "bestand": "wieder-u18-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        95,
        97
       ],
       "anker": [
        48,
        73
       ]
      }
     }
    },
    "sprokkelaar-u18": {
     "naam": "sprokkelaar-u18",
     "cel": [
      76,
      106
     ],
     "anker": [
      38,
      86
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
       "bestand": "sprokkelaar-u18-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        87
       ],
       "anker": [
        27,
        82
       ]
      },
      "lopen": {
       "bestand": "sprokkelaar-u18-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        55,
        94
       ],
       "anker": [
        27,
        83
       ]
      },
      "rapen": {
       "bestand": "sprokkelaar-u18-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        99
       ],
       "anker": [
        35,
        82
       ]
      }
     }
    },
    "hakker-u18": {
     "naam": "hakker-u18",
     "cel": [
      94,
      111
     ],
     "anker": [
      47,
      96
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
       "bestand": "hakker-u18-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        84
       ],
       "anker": [
        24,
        72
       ]
      },
      "lopen": {
       "bestand": "hakker-u18-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        58,
        90
       ],
       "anker": [
        29,
        79
       ]
      },
      "hakken": {
       "bestand": "hakker-u18-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        88,
        101
       ],
       "anker": [
        44,
        93
       ]
      }
     }
    },
    "plukker-u18": {
     "naam": "plukker-u18",
     "cel": [
      76,
      92
     ],
     "anker": [
      38,
      78
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
       "bestand": "plukker-u18-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        77
       ],
       "anker": [
        20,
        72
       ]
      },
      "lopen": {
       "bestand": "plukker-u18-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        83
       ],
       "anker": [
        25,
        72
       ]
      },
      "plukken": {
       "bestand": "plukker-u18-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        80
       ],
       "anker": [
        35,
        75
       ]
      }
     }
    },
    "binder-u18": {
     "naam": "binder-u18",
     "cel": [
      76,
      91
     ],
     "anker": [
      38,
      75
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
       "bestand": "binder-u18-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        77
       ],
       "anker": [
        18,
        72
       ]
      },
      "lopen": {
       "bestand": "binder-u18-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        83
       ],
       "anker": [
        25,
        72
       ]
      },
      "binden": {
       "bestand": "binder-u18-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        77
       ],
       "anker": [
        35,
        64
       ]
      }
     }
    },
    "drager-u18": {
     "naam": "drager-u18",
     "cel": [
      92,
      101
     ],
     "anker": [
      46,
      87
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
       "bestand": "drager-u18-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        84,
        89
       ],
       "anker": [
        42,
        84
       ]
      },
      "lopen": {
       "bestand": "drager-u18-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        86,
        95
       ],
       "anker": [
        43,
        84
       ]
      }
     }
    },
    "dorser-u18": {
     "naam": "dorser-u18",
     "cel": [
      166,
      153
     ],
     "anker": [
      83,
      113
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
       "bestand": "dorser-u18-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        79
       ],
       "anker": [
        26,
        72
       ]
      },
      "lopen": {
       "bestand": "dorser-u18-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        91
       ],
       "anker": [
        42,
        80
       ]
      },
      "dorsen": {
       "bestand": "dorser-u18-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        160,
        147
       ],
       "anker": [
        80,
        110
       ]
      }
     }
    },
    "zager-u18": {
     "naam": "zager-u18",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zager-u18-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        77
       ],
       "anker": [
        24,
        72
       ]
      },
      "lopen": {
       "bestand": "zager-u18-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        83
       ],
       "anker": [
        25,
        72
       ]
      },
      "zagen": {
       "bestand": "zager-u18-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        86
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boer-u19": {
     "naam": "boer-u19",
     "cel": [
      56,
      91
     ],
     "anker": [
      28,
      77
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
       "bestand": "boer-u19-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        74
       ]
      },
      "lopen": {
       "bestand": "boer-u19-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      }
     }
    },
    "maaier-u19": {
     "naam": "maaier-u19",
     "cel": [
      145,
      118
     ],
     "anker": [
      73,
      77
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
       "bestand": "maaier-u19-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        139,
        112
       ],
       "anker": [
        70,
        74
       ]
      }
     }
    },
    "zaaier-u19": {
     "naam": "zaaier-u19",
     "cel": [
      116,
      109
     ],
     "anker": [
      58,
      78
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
       "bestand": "zaaier-u19-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        79
       ],
       "anker": [
        20,
        74
       ]
      },
      "lopen": {
       "bestand": "zaaier-u19-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      },
      "zaaien": {
       "bestand": "zaaier-u19-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        103
       ],
       "anker": [
        55,
        75
       ]
      }
     }
    },
    "wieder-u19": {
     "naam": "wieder-u19",
     "cel": [
      101,
      105
     ],
     "anker": [
      51,
      78
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
       "bestand": "wieder-u19-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        50,
        87
       ],
       "anker": [
        25,
        75
       ]
      },
      "lopen": {
       "bestand": "wieder-u19-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        85
       ],
       "anker": [
        42,
        74
       ]
      },
      "wieden": {
       "bestand": "wieder-u19-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        95,
        99
       ],
       "anker": [
        48,
        75
       ]
      }
     }
    },
    "sprokkelaar-u19": {
     "naam": "sprokkelaar-u19",
     "cel": [
      76,
      106
     ],
     "anker": [
      38,
      86
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
       "bestand": "sprokkelaar-u19-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        87
       ],
       "anker": [
        27,
        82
       ]
      },
      "lopen": {
       "bestand": "sprokkelaar-u19-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        55,
        94
       ],
       "anker": [
        27,
        83
       ]
      },
      "rapen": {
       "bestand": "sprokkelaar-u19-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        99
       ],
       "anker": [
        35,
        82
       ]
      }
     }
    },
    "hakker-u19": {
     "naam": "hakker-u19",
     "cel": [
      94,
      111
     ],
     "anker": [
      47,
      96
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
       "bestand": "hakker-u19-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        86
       ],
       "anker": [
        24,
        74
       ]
      },
      "lopen": {
       "bestand": "hakker-u19-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        58,
        90
       ],
       "anker": [
        29,
        79
       ]
      },
      "hakken": {
       "bestand": "hakker-u19-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        88,
        101
       ],
       "anker": [
        44,
        93
       ]
      }
     }
    },
    "plukker-u19": {
     "naam": "plukker-u19",
     "cel": [
      76,
      94
     ],
     "anker": [
      38,
      80
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
       "bestand": "plukker-u19-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        79
       ],
       "anker": [
        20,
        74
       ]
      },
      "lopen": {
       "bestand": "plukker-u19-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      },
      "plukken": {
       "bestand": "plukker-u19-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        82
       ],
       "anker": [
        35,
        77
       ]
      }
     }
    },
    "binder-u19": {
     "naam": "binder-u19",
     "cel": [
      80,
      93
     ],
     "anker": [
      40,
      77
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
       "bestand": "binder-u19-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        74
       ]
      },
      "lopen": {
       "bestand": "binder-u19-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      },
      "binden": {
       "bestand": "binder-u19-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        74,
        80
       ],
       "anker": [
        37,
        67
       ]
      }
     }
    },
    "drager-u19": {
     "naam": "drager-u19",
     "cel": [
      92,
      101
     ],
     "anker": [
      46,
      87
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
       "bestand": "drager-u19-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        84,
        89
       ],
       "anker": [
        42,
        84
       ]
      },
      "lopen": {
       "bestand": "drager-u19-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        86,
        95
       ],
       "anker": [
        43,
        84
       ]
      }
     }
    },
    "dorser-u19": {
     "naam": "dorser-u19",
     "cel": [
      166,
      153
     ],
     "anker": [
      83,
      113
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
       "bestand": "dorser-u19-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        81
       ],
       "anker": [
        26,
        74
       ]
      },
      "lopen": {
       "bestand": "dorser-u19-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        91
       ],
       "anker": [
        42,
        80
       ]
      },
      "dorsen": {
       "bestand": "dorser-u19-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        160,
        147
       ],
       "anker": [
        80,
        110
       ]
      }
     }
    },
    "zager-u19": {
     "naam": "zager-u19",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zager-u19-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        74
       ]
      },
      "lopen": {
       "bestand": "zager-u19-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      },
      "zagen": {
       "bestand": "zager-u19-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        86
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boer-u20": {
     "naam": "boer-u20",
     "cel": [
      56,
      88
     ],
     "anker": [
      28,
      74
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
       "bestand": "boer-u20-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        76
       ],
       "anker": [
        18,
        71
       ]
      },
      "lopen": {
       "bestand": "boer-u20-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      }
     }
    },
    "maaier-u20": {
     "naam": "maaier-u20",
     "cel": [
      145,
      114
     ],
     "anker": [
      73,
      73
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
       "bestand": "maaier-u20-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        139,
        108
       ],
       "anker": [
        70,
        70
       ]
      }
     }
    },
    "zaaier-u20": {
     "naam": "zaaier-u20",
     "cel": [
      116,
      106
     ],
     "anker": [
      58,
      75
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
       "bestand": "zaaier-u20-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        76
       ],
       "anker": [
        20,
        71
       ]
      },
      "lopen": {
       "bestand": "zaaier-u20-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      },
      "zaaien": {
       "bestand": "zaaier-u20-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        100
       ],
       "anker": [
        55,
        72
       ]
      }
     }
    },
    "wieder-u20": {
     "naam": "wieder-u20",
     "cel": [
      101,
      102
     ],
     "anker": [
      51,
      75
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
       "bestand": "wieder-u20-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        50,
        84
       ],
       "anker": [
        25,
        72
       ]
      },
      "lopen": {
       "bestand": "wieder-u20-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        82
       ],
       "anker": [
        42,
        71
       ]
      },
      "wieden": {
       "bestand": "wieder-u20-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        95,
        96
       ],
       "anker": [
        48,
        72
       ]
      }
     }
    },
    "sprokkelaar-u20": {
     "naam": "sprokkelaar-u20",
     "cel": [
      76,
      106
     ],
     "anker": [
      38,
      86
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
       "bestand": "sprokkelaar-u20-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        87
       ],
       "anker": [
        27,
        82
       ]
      },
      "lopen": {
       "bestand": "sprokkelaar-u20-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        55,
        94
       ],
       "anker": [
        27,
        83
       ]
      },
      "rapen": {
       "bestand": "sprokkelaar-u20-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        99
       ],
       "anker": [
        35,
        82
       ]
      }
     }
    },
    "hakker-u20": {
     "naam": "hakker-u20",
     "cel": [
      94,
      111
     ],
     "anker": [
      47,
      96
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
       "bestand": "hakker-u20-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        83
       ],
       "anker": [
        24,
        71
       ]
      },
      "lopen": {
       "bestand": "hakker-u20-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        58,
        90
       ],
       "anker": [
        29,
        79
       ]
      },
      "hakken": {
       "bestand": "hakker-u20-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        88,
        101
       ],
       "anker": [
        44,
        93
       ]
      }
     }
    },
    "plukker-u20": {
     "naam": "plukker-u20",
     "cel": [
      76,
      91
     ],
     "anker": [
      38,
      77
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
       "bestand": "plukker-u20-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        76
       ],
       "anker": [
        20,
        71
       ]
      },
      "lopen": {
       "bestand": "plukker-u20-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      },
      "plukken": {
       "bestand": "plukker-u20-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        79
       ],
       "anker": [
        35,
        74
       ]
      }
     }
    },
    "binder-u20": {
     "naam": "binder-u20",
     "cel": [
      76,
      90
     ],
     "anker": [
      38,
      74
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
       "bestand": "binder-u20-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        76
       ],
       "anker": [
        18,
        71
       ]
      },
      "lopen": {
       "bestand": "binder-u20-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      },
      "binden": {
       "bestand": "binder-u20-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        76
       ],
       "anker": [
        35,
        63
       ]
      }
     }
    },
    "drager-u20": {
     "naam": "drager-u20",
     "cel": [
      92,
      101
     ],
     "anker": [
      46,
      87
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
       "bestand": "drager-u20-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        84,
        89
       ],
       "anker": [
        42,
        84
       ]
      },
      "lopen": {
       "bestand": "drager-u20-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        86,
        95
       ],
       "anker": [
        43,
        84
       ]
      }
     }
    },
    "dorser-u20": {
     "naam": "dorser-u20",
     "cel": [
      166,
      153
     ],
     "anker": [
      83,
      113
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
       "bestand": "dorser-u20-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        78
       ],
       "anker": [
        26,
        71
       ]
      },
      "lopen": {
       "bestand": "dorser-u20-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        91
       ],
       "anker": [
        42,
        80
       ]
      },
      "dorsen": {
       "bestand": "dorser-u20-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        160,
        147
       ],
       "anker": [
        80,
        110
       ]
      }
     }
    },
    "zager-u20": {
     "naam": "zager-u20",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zager-u20-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        76
       ],
       "anker": [
        24,
        71
       ]
      },
      "lopen": {
       "bestand": "zager-u20-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      },
      "zagen": {
       "bestand": "zager-u20-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        86
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boer-u21": {
     "naam": "boer-u21",
     "cel": [
      56,
      94
     ],
     "anker": [
      28,
      80
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
       "bestand": "boer-u21-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "boer-u21-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      }
     }
    },
    "maaier-u21": {
     "naam": "maaier-u21",
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
       "bestand": "maaier-u21-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        139,
        115
       ],
       "anker": [
        70,
        77
       ]
      }
     }
    },
    "zaaier-u21": {
     "naam": "zaaier-u21",
     "cel": [
      116,
      112
     ],
     "anker": [
      58,
      81
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
       "bestand": "zaaier-u21-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        82
       ],
       "anker": [
        20,
        77
       ]
      },
      "lopen": {
       "bestand": "zaaier-u21-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "zaaien": {
       "bestand": "zaaier-u21-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        106
       ],
       "anker": [
        55,
        78
       ]
      }
     }
    },
    "wieder-u21": {
     "naam": "wieder-u21",
     "cel": [
      101,
      109
     ],
     "anker": [
      51,
      82
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
       "bestand": "wieder-u21-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        50,
        91
       ],
       "anker": [
        25,
        79
       ]
      },
      "lopen": {
       "bestand": "wieder-u21-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        88
       ],
       "anker": [
        42,
        77
       ]
      },
      "wieden": {
       "bestand": "wieder-u21-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        95,
        102
       ],
       "anker": [
        48,
        78
       ]
      }
     }
    },
    "sprokkelaar-u21": {
     "naam": "sprokkelaar-u21",
     "cel": [
      76,
      106
     ],
     "anker": [
      38,
      86
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
       "bestand": "sprokkelaar-u21-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        87
       ],
       "anker": [
        27,
        82
       ]
      },
      "lopen": {
       "bestand": "sprokkelaar-u21-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        55,
        94
       ],
       "anker": [
        27,
        83
       ]
      },
      "rapen": {
       "bestand": "sprokkelaar-u21-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        99
       ],
       "anker": [
        35,
        82
       ]
      }
     }
    },
    "hakker-u21": {
     "naam": "hakker-u21",
     "cel": [
      94,
      111
     ],
     "anker": [
      47,
      96
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
       "bestand": "hakker-u21-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        89
       ],
       "anker": [
        24,
        77
       ]
      },
      "lopen": {
       "bestand": "hakker-u21-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        58,
        90
       ],
       "anker": [
        29,
        79
       ]
      },
      "hakken": {
       "bestand": "hakker-u21-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        88,
        101
       ],
       "anker": [
        44,
        93
       ]
      }
     }
    },
    "plukker-u21": {
     "naam": "plukker-u21",
     "cel": [
      76,
      97
     ],
     "anker": [
      38,
      83
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
       "bestand": "plukker-u21-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        82
       ],
       "anker": [
        20,
        77
       ]
      },
      "lopen": {
       "bestand": "plukker-u21-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "plukken": {
       "bestand": "plukker-u21-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        85
       ],
       "anker": [
        35,
        80
       ]
      }
     }
    },
    "binder-u21": {
     "naam": "binder-u21",
     "cel": [
      82,
      96
     ],
     "anker": [
      41,
      80
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
       "bestand": "binder-u21-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "binder-u21-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "binden": {
       "bestand": "binder-u21-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        76,
        82
       ],
       "anker": [
        38,
        69
       ]
      }
     }
    },
    "drager-u21": {
     "naam": "drager-u21",
     "cel": [
      92,
      101
     ],
     "anker": [
      46,
      87
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
       "bestand": "drager-u21-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        84,
        89
       ],
       "anker": [
        42,
        84
       ]
      },
      "lopen": {
       "bestand": "drager-u21-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        86,
        95
       ],
       "anker": [
        43,
        84
       ]
      }
     }
    },
    "dorser-u21": {
     "naam": "dorser-u21",
     "cel": [
      166,
      153
     ],
     "anker": [
      83,
      113
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
       "bestand": "dorser-u21-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        84
       ],
       "anker": [
        26,
        77
       ]
      },
      "lopen": {
       "bestand": "dorser-u21-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        91
       ],
       "anker": [
        42,
        80
       ]
      },
      "dorsen": {
       "bestand": "dorser-u21-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        160,
        147
       ],
       "anker": [
        80,
        110
       ]
      }
     }
    },
    "zager-u21": {
     "naam": "zager-u21",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zager-u21-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        82
       ],
       "anker": [
        24,
        77
       ]
      },
      "lopen": {
       "bestand": "zager-u21-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "zagen": {
       "bestand": "zager-u21-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        86
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boer-u22": {
     "naam": "boer-u22",
     "cel": [
      56,
      88
     ],
     "anker": [
      28,
      74
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
       "bestand": "boer-u22-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        76
       ],
       "anker": [
        18,
        71
       ]
      },
      "lopen": {
       "bestand": "boer-u22-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      }
     }
    },
    "maaier-u22": {
     "naam": "maaier-u22",
     "cel": [
      145,
      115
     ],
     "anker": [
      73,
      74
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
       "bestand": "maaier-u22-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        139,
        109
       ],
       "anker": [
        70,
        71
       ]
      }
     }
    },
    "zaaier-u22": {
     "naam": "zaaier-u22",
     "cel": [
      116,
      106
     ],
     "anker": [
      58,
      75
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
       "bestand": "zaaier-u22-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        76
       ],
       "anker": [
        20,
        71
       ]
      },
      "lopen": {
       "bestand": "zaaier-u22-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      },
      "zaaien": {
       "bestand": "zaaier-u22-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        100
       ],
       "anker": [
        55,
        72
       ]
      }
     }
    },
    "wieder-u22": {
     "naam": "wieder-u22",
     "cel": [
      101,
      102
     ],
     "anker": [
      51,
      75
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
       "bestand": "wieder-u22-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        50,
        84
       ],
       "anker": [
        25,
        72
       ]
      },
      "lopen": {
       "bestand": "wieder-u22-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        82
       ],
       "anker": [
        42,
        71
       ]
      },
      "wieden": {
       "bestand": "wieder-u22-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        95,
        95
       ],
       "anker": [
        48,
        71
       ]
      }
     }
    },
    "sprokkelaar-u22": {
     "naam": "sprokkelaar-u22",
     "cel": [
      76,
      106
     ],
     "anker": [
      38,
      86
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
       "bestand": "sprokkelaar-u22-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        87
       ],
       "anker": [
        27,
        82
       ]
      },
      "lopen": {
       "bestand": "sprokkelaar-u22-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        55,
        94
       ],
       "anker": [
        27,
        83
       ]
      },
      "rapen": {
       "bestand": "sprokkelaar-u22-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        99
       ],
       "anker": [
        35,
        82
       ]
      }
     }
    },
    "hakker-u22": {
     "naam": "hakker-u22",
     "cel": [
      94,
      111
     ],
     "anker": [
      47,
      96
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
       "bestand": "hakker-u22-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        83
       ],
       "anker": [
        24,
        71
       ]
      },
      "lopen": {
       "bestand": "hakker-u22-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        58,
        90
       ],
       "anker": [
        29,
        79
       ]
      },
      "hakken": {
       "bestand": "hakker-u22-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        88,
        101
       ],
       "anker": [
        44,
        93
       ]
      }
     }
    },
    "plukker-u22": {
     "naam": "plukker-u22",
     "cel": [
      76,
      91
     ],
     "anker": [
      38,
      77
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
       "bestand": "plukker-u22-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        76
       ],
       "anker": [
        20,
        71
       ]
      },
      "lopen": {
       "bestand": "plukker-u22-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      },
      "plukken": {
       "bestand": "plukker-u22-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        79
       ],
       "anker": [
        35,
        74
       ]
      }
     }
    },
    "binder-u22": {
     "naam": "binder-u22",
     "cel": [
      76,
      90
     ],
     "anker": [
      38,
      74
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
       "bestand": "binder-u22-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        76
       ],
       "anker": [
        18,
        71
       ]
      },
      "lopen": {
       "bestand": "binder-u22-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      },
      "binden": {
       "bestand": "binder-u22-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        75
       ],
       "anker": [
        35,
        62
       ]
      }
     }
    },
    "drager-u22": {
     "naam": "drager-u22",
     "cel": [
      92,
      101
     ],
     "anker": [
      46,
      87
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
       "bestand": "drager-u22-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        84,
        89
       ],
       "anker": [
        42,
        84
       ]
      },
      "lopen": {
       "bestand": "drager-u22-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        86,
        95
       ],
       "anker": [
        43,
        84
       ]
      }
     }
    },
    "dorser-u22": {
     "naam": "dorser-u22",
     "cel": [
      166,
      153
     ],
     "anker": [
      83,
      113
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
       "bestand": "dorser-u22-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        78
       ],
       "anker": [
        26,
        71
       ]
      },
      "lopen": {
       "bestand": "dorser-u22-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        91
       ],
       "anker": [
        42,
        80
       ]
      },
      "dorsen": {
       "bestand": "dorser-u22-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        160,
        147
       ],
       "anker": [
        80,
        110
       ]
      }
     }
    },
    "zager-u22": {
     "naam": "zager-u22",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zager-u22-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        76
       ],
       "anker": [
        24,
        71
       ]
      },
      "lopen": {
       "bestand": "zager-u22-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      },
      "zagen": {
       "bestand": "zager-u22-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        86
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boer-u23": {
     "naam": "boer-u23",
     "cel": [
      56,
      94
     ],
     "anker": [
      28,
      80
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
       "bestand": "boer-u23-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        44,
        82
       ],
       "anker": [
        22,
        77
       ]
      },
      "lopen": {
       "bestand": "boer-u23-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      }
     }
    },
    "maaier-u23": {
     "naam": "maaier-u23",
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
       "bestand": "maaier-u23-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        139,
        115
       ],
       "anker": [
        70,
        77
       ]
      }
     }
    },
    "zaaier-u23": {
     "naam": "zaaier-u23",
     "cel": [
      116,
      112
     ],
     "anker": [
      58,
      81
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
       "bestand": "zaaier-u23-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        82
       ],
       "anker": [
        20,
        77
       ]
      },
      "lopen": {
       "bestand": "zaaier-u23-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "zaaien": {
       "bestand": "zaaier-u23-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        106
       ],
       "anker": [
        55,
        78
       ]
      }
     }
    },
    "wieder-u23": {
     "naam": "wieder-u23",
     "cel": [
      101,
      109
     ],
     "anker": [
      51,
      82
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
       "bestand": "wieder-u23-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        50,
        91
       ],
       "anker": [
        25,
        79
       ]
      },
      "lopen": {
       "bestand": "wieder-u23-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        88
       ],
       "anker": [
        42,
        77
       ]
      },
      "wieden": {
       "bestand": "wieder-u23-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        95,
        101
       ],
       "anker": [
        48,
        77
       ]
      }
     }
    },
    "sprokkelaar-u23": {
     "naam": "sprokkelaar-u23",
     "cel": [
      76,
      106
     ],
     "anker": [
      38,
      86
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
       "bestand": "sprokkelaar-u23-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        87
       ],
       "anker": [
        27,
        82
       ]
      },
      "lopen": {
       "bestand": "sprokkelaar-u23-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        55,
        94
       ],
       "anker": [
        27,
        83
       ]
      },
      "rapen": {
       "bestand": "sprokkelaar-u23-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        99
       ],
       "anker": [
        35,
        82
       ]
      }
     }
    },
    "hakker-u23": {
     "naam": "hakker-u23",
     "cel": [
      94,
      111
     ],
     "anker": [
      47,
      96
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
       "bestand": "hakker-u23-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        89
       ],
       "anker": [
        24,
        77
       ]
      },
      "lopen": {
       "bestand": "hakker-u23-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        58,
        90
       ],
       "anker": [
        29,
        79
       ]
      },
      "hakken": {
       "bestand": "hakker-u23-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        88,
        101
       ],
       "anker": [
        44,
        93
       ]
      }
     }
    },
    "plukker-u23": {
     "naam": "plukker-u23",
     "cel": [
      76,
      97
     ],
     "anker": [
      38,
      83
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
       "bestand": "plukker-u23-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        82
       ],
       "anker": [
        20,
        77
       ]
      },
      "lopen": {
       "bestand": "plukker-u23-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "plukken": {
       "bestand": "plukker-u23-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        70,
        85
       ],
       "anker": [
        35,
        80
       ]
      }
     }
    },
    "binder-u23": {
     "naam": "binder-u23",
     "cel": [
      88,
      96
     ],
     "anker": [
      44,
      80
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
       "bestand": "binder-u23-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "binder-u23-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "binden": {
       "bestand": "binder-u23-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        82,
        81
       ],
       "anker": [
        41,
        68
       ]
      }
     }
    },
    "drager-u23": {
     "naam": "drager-u23",
     "cel": [
      92,
      101
     ],
     "anker": [
      46,
      87
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
       "bestand": "drager-u23-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        84,
        89
       ],
       "anker": [
        42,
        84
       ]
      },
      "lopen": {
       "bestand": "drager-u23-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        86,
        95
       ],
       "anker": [
        43,
        84
       ]
      }
     }
    },
    "dorser-u23": {
     "naam": "dorser-u23",
     "cel": [
      166,
      153
     ],
     "anker": [
      83,
      113
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
       "bestand": "dorser-u23-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        84
       ],
       "anker": [
        26,
        77
       ]
      },
      "lopen": {
       "bestand": "dorser-u23-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        84,
        91
       ],
       "anker": [
        42,
        80
       ]
      },
      "dorsen": {
       "bestand": "dorser-u23-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        160,
        147
       ],
       "anker": [
        80,
        110
       ]
      }
     }
    },
    "zager-u23": {
     "naam": "zager-u23",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zager-u23-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        82
       ],
       "anker": [
        24,
        77
       ]
      },
      "lopen": {
       "bestand": "zager-u23-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      },
      "zagen": {
       "bestand": "zager-u23-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        86
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boerin-u0": {
     "naam": "boerin-u0",
     "cel": [
      50,
      87
     ],
     "anker": [
      25,
      73
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
       "bestand": "boerin-u0-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        79
       ],
       "anker": [
        19,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      }
     }
    },
    "maaister-u0": {
     "naam": "maaister-u0",
     "cel": [
      146,
      114
     ],
     "anker": [
      73,
      72
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
       "bestand": "maaister-u0-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        140,
        108
       ],
       "anker": [
        70,
        69
       ]
      }
     }
    },
    "zaaister-u0": {
     "naam": "zaaister-u0",
     "cel": [
      106,
      94
     ],
     "anker": [
      53,
      73
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
       "bestand": "zaaister-u0-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        42,
        79
       ],
       "anker": [
        21,
        70
       ]
      },
      "lopen": {
       "bestand": "zaaister-u0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "zaaien": {
       "bestand": "zaaister-u0-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        100,
        88
       ],
       "anker": [
        50,
        70
       ]
      }
     }
    },
    "wiedster-u0": {
     "naam": "wiedster-u0",
     "cel": [
      96,
      100
     ],
     "anker": [
      48,
      74
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
       "bestand": "wiedster-u0-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        56,
        84
       ],
       "anker": [
        28,
        71
       ]
      },
      "lopen": {
       "bestand": "wiedster-u0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        81
       ],
       "anker": [
        42,
        70
       ]
      },
      "wieden": {
       "bestand": "wiedster-u0-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        90,
        93
       ],
       "anker": [
        45,
        70
       ]
      }
     }
    },
    "sprokkelaarster-u0": {
     "naam": "sprokkelaarster-u0",
     "cel": [
      72,
      103
     ],
     "anker": [
      36,
      84
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
       "bestand": "sprokkelaarster-u0-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        90
       ],
       "anker": [
        27,
        81
       ]
      },
      "lopen": {
       "bestand": "sprokkelaarster-u0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        54,
        92
       ],
       "anker": [
        27,
        81
       ]
      },
      "rapen": {
       "bestand": "sprokkelaarster-u0-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        66,
        97
       ],
       "anker": [
        33,
        81
       ]
      }
     }
    },
    "hakster-u0": {
     "naam": "hakster-u0",
     "cel": [
      90,
      107
     ],
     "anker": [
      45,
      92
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
       "bestand": "hakster-u0-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        82
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "hakster-u0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        58,
        88
       ],
       "anker": [
        29,
        77
       ]
      },
      "hakken": {
       "bestand": "hakster-u0-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        84,
        98
       ],
       "anker": [
        42,
        89
       ]
      }
     }
    },
    "plukster-u0": {
     "naam": "plukster-u0",
     "cel": [
      70,
      89
     ],
     "anker": [
      35,
      75
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
       "bestand": "plukster-u0-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        79
       ],
       "anker": [
        20,
        70
       ]
      },
      "lopen": {
       "bestand": "plukster-u0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "plukken": {
       "bestand": "plukster-u0-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        81
       ],
       "anker": [
        32,
        72
       ]
      }
     }
    },
    "binster-u0": {
     "naam": "binster-u0",
     "cel": [
      70,
      89
     ],
     "anker": [
      35,
      73
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
       "bestand": "binster-u0-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        79
       ],
       "anker": [
        19,
        70
       ]
      },
      "lopen": {
       "bestand": "binster-u0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "binden": {
       "bestand": "binster-u0-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        74
       ],
       "anker": [
        32,
        61
       ]
      }
     }
    },
    "draagster-u0": {
     "naam": "draagster-u0",
     "cel": [
      92,
      99
     ],
     "anker": [
      46,
      85
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
       "bestand": "draagster-u0-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        86,
        91
       ],
       "anker": [
        43,
        82
       ]
      },
      "lopen": {
       "bestand": "draagster-u0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        86,
        93
       ],
       "anker": [
        43,
        82
       ]
      }
     }
    },
    "dorster-u0": {
     "naam": "dorster-u0",
     "cel": [
      160,
      149
     ],
     "anker": [
      80,
      111
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
       "bestand": "dorster-u0-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        79
       ],
       "anker": [
        26,
        70
       ]
      },
      "lopen": {
       "bestand": "dorster-u0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        90
       ],
       "anker": [
        42,
        79
       ]
      },
      "dorsen": {
       "bestand": "dorster-u0-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        154,
        143
       ],
       "anker": [
        77,
        108
       ]
      }
     }
    },
    "zaagster-u0": {
     "naam": "zaagster-u0",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zaagster-u0-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "zaagster-u0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        48,
        81
       ],
       "anker": [
        24,
        70
       ]
      },
      "zagen": {
       "bestand": "zaagster-u0-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        90
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boerin-u1": {
     "naam": "boerin-u1",
     "cel": [
      50,
      86
     ],
     "anker": [
      25,
      72
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
       "bestand": "boerin-u1-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        78
       ],
       "anker": [
        17,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      }
     }
    },
    "maaister-u1": {
     "naam": "maaister-u1",
     "cel": [
      146,
      113
     ],
     "anker": [
      73,
      71
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
       "bestand": "maaister-u1-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        140,
        107
       ],
       "anker": [
        70,
        68
       ]
      }
     }
    },
    "zaaister-u1": {
     "naam": "zaaister-u1",
     "cel": [
      106,
      93
     ],
     "anker": [
      53,
      72
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
       "bestand": "zaaister-u1-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        42,
        78
       ],
       "anker": [
        21,
        69
       ]
      },
      "lopen": {
       "bestand": "zaaister-u1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "zaaien": {
       "bestand": "zaaister-u1-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        100,
        87
       ],
       "anker": [
        50,
        69
       ]
      }
     }
    },
    "wiedster-u1": {
     "naam": "wiedster-u1",
     "cel": [
      96,
      99
     ],
     "anker": [
      48,
      73
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
       "bestand": "wiedster-u1-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        56,
        83
       ],
       "anker": [
        28,
        70
       ]
      },
      "lopen": {
       "bestand": "wiedster-u1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        80
       ],
       "anker": [
        42,
        69
       ]
      },
      "wieden": {
       "bestand": "wiedster-u1-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        90,
        92
       ],
       "anker": [
        45,
        69
       ]
      }
     }
    },
    "sprokkelaarster-u1": {
     "naam": "sprokkelaarster-u1",
     "cel": [
      72,
      103
     ],
     "anker": [
      36,
      84
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
       "bestand": "sprokkelaarster-u1-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        90
       ],
       "anker": [
        27,
        81
       ]
      },
      "lopen": {
       "bestand": "sprokkelaarster-u1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        54,
        92
       ],
       "anker": [
        27,
        81
       ]
      },
      "rapen": {
       "bestand": "sprokkelaarster-u1-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        66,
        97
       ],
       "anker": [
        33,
        81
       ]
      }
     }
    },
    "hakster-u1": {
     "naam": "hakster-u1",
     "cel": [
      90,
      107
     ],
     "anker": [
      45,
      92
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
       "bestand": "hakster-u1-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        81
       ],
       "anker": [
        24,
        69
       ]
      },
      "lopen": {
       "bestand": "hakster-u1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        58,
        88
       ],
       "anker": [
        29,
        77
       ]
      },
      "hakken": {
       "bestand": "hakster-u1-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        84,
        98
       ],
       "anker": [
        42,
        89
       ]
      }
     }
    },
    "plukster-u1": {
     "naam": "plukster-u1",
     "cel": [
      70,
      88
     ],
     "anker": [
      35,
      74
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
       "bestand": "plukster-u1-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        78
       ],
       "anker": [
        20,
        69
       ]
      },
      "lopen": {
       "bestand": "plukster-u1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "plukken": {
       "bestand": "plukster-u1-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        80
       ],
       "anker": [
        32,
        71
       ]
      }
     }
    },
    "binster-u1": {
     "naam": "binster-u1",
     "cel": [
      70,
      88
     ],
     "anker": [
      35,
      72
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
       "bestand": "binster-u1-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        78
       ],
       "anker": [
        19,
        69
       ]
      },
      "lopen": {
       "bestand": "binster-u1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "binden": {
       "bestand": "binster-u1-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        73
       ],
       "anker": [
        32,
        60
       ]
      }
     }
    },
    "draagster-u1": {
     "naam": "draagster-u1",
     "cel": [
      92,
      99
     ],
     "anker": [
      46,
      85
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
       "bestand": "draagster-u1-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        86,
        91
       ],
       "anker": [
        43,
        82
       ]
      },
      "lopen": {
       "bestand": "draagster-u1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        86,
        93
       ],
       "anker": [
        43,
        82
       ]
      }
     }
    },
    "dorster-u1": {
     "naam": "dorster-u1",
     "cel": [
      160,
      149
     ],
     "anker": [
      80,
      111
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
       "bestand": "dorster-u1-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        78
       ],
       "anker": [
        26,
        69
       ]
      },
      "lopen": {
       "bestand": "dorster-u1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        90
       ],
       "anker": [
        42,
        79
       ]
      },
      "dorsen": {
       "bestand": "dorster-u1-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        154,
        143
       ],
       "anker": [
        77,
        108
       ]
      }
     }
    },
    "zaagster-u1": {
     "naam": "zaagster-u1",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zaagster-u1-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        78
       ],
       "anker": [
        24,
        69
       ]
      },
      "lopen": {
       "bestand": "zaagster-u1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        68
       ]
      },
      "zagen": {
       "bestand": "zaagster-u1-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        90
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boerin-u2": {
     "naam": "boerin-u2",
     "cel": [
      50,
      87
     ],
     "anker": [
      25,
      73
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
       "bestand": "boerin-u2-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        79
       ],
       "anker": [
        17,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u2-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      }
     }
    },
    "maaister-u2": {
     "naam": "maaister-u2",
     "cel": [
      146,
      114
     ],
     "anker": [
      73,
      72
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
       "bestand": "maaister-u2-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        140,
        108
       ],
       "anker": [
        70,
        69
       ]
      }
     }
    },
    "zaaister-u2": {
     "naam": "zaaister-u2",
     "cel": [
      106,
      95
     ],
     "anker": [
      53,
      74
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
       "bestand": "zaaister-u2-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        42,
        79
       ],
       "anker": [
        21,
        70
       ]
      },
      "lopen": {
       "bestand": "zaaister-u2-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "zaaien": {
       "bestand": "zaaister-u2-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        100,
        89
       ],
       "anker": [
        50,
        71
       ]
      }
     }
    },
    "wiedster-u2": {
     "naam": "wiedster-u2",
     "cel": [
      96,
      100
     ],
     "anker": [
      48,
      74
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
       "bestand": "wiedster-u2-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        56,
        84
       ],
       "anker": [
        28,
        71
       ]
      },
      "lopen": {
       "bestand": "wiedster-u2-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        81
       ],
       "anker": [
        42,
        70
       ]
      },
      "wieden": {
       "bestand": "wiedster-u2-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        90,
        93
       ],
       "anker": [
        45,
        70
       ]
      }
     }
    },
    "sprokkelaarster-u2": {
     "naam": "sprokkelaarster-u2",
     "cel": [
      72,
      103
     ],
     "anker": [
      36,
      84
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
       "bestand": "sprokkelaarster-u2-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        90
       ],
       "anker": [
        27,
        81
       ]
      },
      "lopen": {
       "bestand": "sprokkelaarster-u2-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        54,
        92
       ],
       "anker": [
        27,
        81
       ]
      },
      "rapen": {
       "bestand": "sprokkelaarster-u2-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        66,
        97
       ],
       "anker": [
        33,
        81
       ]
      }
     }
    },
    "hakster-u2": {
     "naam": "hakster-u2",
     "cel": [
      90,
      107
     ],
     "anker": [
      45,
      92
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
       "bestand": "hakster-u2-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        82
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "hakster-u2-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        58,
        88
       ],
       "anker": [
        29,
        77
       ]
      },
      "hakken": {
       "bestand": "hakster-u2-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        84,
        98
       ],
       "anker": [
        42,
        89
       ]
      }
     }
    },
    "plukster-u2": {
     "naam": "plukster-u2",
     "cel": [
      70,
      89
     ],
     "anker": [
      35,
      75
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
       "bestand": "plukster-u2-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        79
       ],
       "anker": [
        20,
        70
       ]
      },
      "lopen": {
       "bestand": "plukster-u2-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "plukken": {
       "bestand": "plukster-u2-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        81
       ],
       "anker": [
        32,
        72
       ]
      }
     }
    },
    "binster-u2": {
     "naam": "binster-u2",
     "cel": [
      70,
      89
     ],
     "anker": [
      35,
      73
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
       "bestand": "binster-u2-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        79
       ],
       "anker": [
        19,
        70
       ]
      },
      "lopen": {
       "bestand": "binster-u2-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "binden": {
       "bestand": "binster-u2-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        74
       ],
       "anker": [
        32,
        61
       ]
      }
     }
    },
    "draagster-u2": {
     "naam": "draagster-u2",
     "cel": [
      92,
      99
     ],
     "anker": [
      46,
      85
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
       "bestand": "draagster-u2-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        86,
        91
       ],
       "anker": [
        43,
        82
       ]
      },
      "lopen": {
       "bestand": "draagster-u2-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        86,
        93
       ],
       "anker": [
        43,
        82
       ]
      }
     }
    },
    "dorster-u2": {
     "naam": "dorster-u2",
     "cel": [
      160,
      149
     ],
     "anker": [
      80,
      111
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
       "bestand": "dorster-u2-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        79
       ],
       "anker": [
        26,
        70
       ]
      },
      "lopen": {
       "bestand": "dorster-u2-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        90
       ],
       "anker": [
        42,
        79
       ]
      },
      "dorsen": {
       "bestand": "dorster-u2-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        154,
        143
       ],
       "anker": [
        77,
        108
       ]
      }
     }
    },
    "zaagster-u2": {
     "naam": "zaagster-u2",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zaagster-u2-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "zaagster-u2-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        48,
        81
       ],
       "anker": [
        24,
        70
       ]
      },
      "zagen": {
       "bestand": "zaagster-u2-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        90
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boerin-u3": {
     "naam": "boerin-u3",
     "cel": [
      50,
      86
     ],
     "anker": [
      25,
      72
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
       "bestand": "boerin-u3-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        44,
        78
       ],
       "anker": [
        22,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u3-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      }
     }
    },
    "maaister-u3": {
     "naam": "maaister-u3",
     "cel": [
      146,
      113
     ],
     "anker": [
      73,
      71
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
       "bestand": "maaister-u3-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        140,
        107
       ],
       "anker": [
        70,
        68
       ]
      }
     }
    },
    "zaaister-u3": {
     "naam": "zaaister-u3",
     "cel": [
      106,
      93
     ],
     "anker": [
      53,
      72
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
       "bestand": "zaaister-u3-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        42,
        78
       ],
       "anker": [
        21,
        69
       ]
      },
      "lopen": {
       "bestand": "zaaister-u3-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "zaaien": {
       "bestand": "zaaister-u3-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        100,
        87
       ],
       "anker": [
        50,
        69
       ]
      }
     }
    },
    "wiedster-u3": {
     "naam": "wiedster-u3",
     "cel": [
      96,
      99
     ],
     "anker": [
      48,
      73
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
       "bestand": "wiedster-u3-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        56,
        83
       ],
       "anker": [
        28,
        70
       ]
      },
      "lopen": {
       "bestand": "wiedster-u3-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        80
       ],
       "anker": [
        42,
        69
       ]
      },
      "wieden": {
       "bestand": "wiedster-u3-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        90,
        92
       ],
       "anker": [
        45,
        69
       ]
      }
     }
    },
    "sprokkelaarster-u3": {
     "naam": "sprokkelaarster-u3",
     "cel": [
      72,
      103
     ],
     "anker": [
      36,
      84
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
       "bestand": "sprokkelaarster-u3-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        90
       ],
       "anker": [
        27,
        81
       ]
      },
      "lopen": {
       "bestand": "sprokkelaarster-u3-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        54,
        92
       ],
       "anker": [
        27,
        81
       ]
      },
      "rapen": {
       "bestand": "sprokkelaarster-u3-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        66,
        97
       ],
       "anker": [
        33,
        81
       ]
      }
     }
    },
    "hakster-u3": {
     "naam": "hakster-u3",
     "cel": [
      90,
      107
     ],
     "anker": [
      45,
      92
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
       "bestand": "hakster-u3-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        81
       ],
       "anker": [
        24,
        69
       ]
      },
      "lopen": {
       "bestand": "hakster-u3-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        58,
        88
       ],
       "anker": [
        29,
        77
       ]
      },
      "hakken": {
       "bestand": "hakster-u3-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        84,
        98
       ],
       "anker": [
        42,
        89
       ]
      }
     }
    },
    "plukster-u3": {
     "naam": "plukster-u3",
     "cel": [
      70,
      88
     ],
     "anker": [
      35,
      74
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
       "bestand": "plukster-u3-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        78
       ],
       "anker": [
        20,
        69
       ]
      },
      "lopen": {
       "bestand": "plukster-u3-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "plukken": {
       "bestand": "plukster-u3-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        80
       ],
       "anker": [
        32,
        71
       ]
      }
     }
    },
    "binster-u3": {
     "naam": "binster-u3",
     "cel": [
      70,
      88
     ],
     "anker": [
      35,
      72
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
       "bestand": "binster-u3-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        78
       ],
       "anker": [
        19,
        69
       ]
      },
      "lopen": {
       "bestand": "binster-u3-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "binden": {
       "bestand": "binster-u3-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        73
       ],
       "anker": [
        32,
        60
       ]
      }
     }
    },
    "draagster-u3": {
     "naam": "draagster-u3",
     "cel": [
      92,
      99
     ],
     "anker": [
      46,
      85
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
       "bestand": "draagster-u3-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        86,
        91
       ],
       "anker": [
        43,
        82
       ]
      },
      "lopen": {
       "bestand": "draagster-u3-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        86,
        93
       ],
       "anker": [
        43,
        82
       ]
      }
     }
    },
    "dorster-u3": {
     "naam": "dorster-u3",
     "cel": [
      160,
      149
     ],
     "anker": [
      80,
      111
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
       "bestand": "dorster-u3-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        78
       ],
       "anker": [
        26,
        69
       ]
      },
      "lopen": {
       "bestand": "dorster-u3-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        90
       ],
       "anker": [
        42,
        79
       ]
      },
      "dorsen": {
       "bestand": "dorster-u3-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        154,
        143
       ],
       "anker": [
        77,
        108
       ]
      }
     }
    },
    "zaagster-u3": {
     "naam": "zaagster-u3",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zaagster-u3-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        78
       ],
       "anker": [
        24,
        69
       ]
      },
      "lopen": {
       "bestand": "zaagster-u3-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        68
       ]
      },
      "zagen": {
       "bestand": "zaagster-u3-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        90
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boerin-u4": {
     "naam": "boerin-u4",
     "cel": [
      50,
      87
     ],
     "anker": [
      25,
      73
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
       "bestand": "boerin-u4-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        79
       ],
       "anker": [
        17,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u4-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      }
     }
    },
    "maaister-u4": {
     "naam": "maaister-u4",
     "cel": [
      146,
      114
     ],
     "anker": [
      73,
      72
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
       "bestand": "maaister-u4-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        140,
        108
       ],
       "anker": [
        70,
        69
       ]
      }
     }
    },
    "zaaister-u4": {
     "naam": "zaaister-u4",
     "cel": [
      106,
      94
     ],
     "anker": [
      53,
      73
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
       "bestand": "zaaister-u4-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        42,
        79
       ],
       "anker": [
        21,
        70
       ]
      },
      "lopen": {
       "bestand": "zaaister-u4-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "zaaien": {
       "bestand": "zaaister-u4-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        100,
        88
       ],
       "anker": [
        50,
        70
       ]
      }
     }
    },
    "wiedster-u4": {
     "naam": "wiedster-u4",
     "cel": [
      96,
      100
     ],
     "anker": [
      48,
      74
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
       "bestand": "wiedster-u4-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        56,
        84
       ],
       "anker": [
        28,
        71
       ]
      },
      "lopen": {
       "bestand": "wiedster-u4-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        81
       ],
       "anker": [
        42,
        70
       ]
      },
      "wieden": {
       "bestand": "wiedster-u4-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        90,
        93
       ],
       "anker": [
        45,
        70
       ]
      }
     }
    },
    "sprokkelaarster-u4": {
     "naam": "sprokkelaarster-u4",
     "cel": [
      72,
      103
     ],
     "anker": [
      36,
      84
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
       "bestand": "sprokkelaarster-u4-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        90
       ],
       "anker": [
        27,
        81
       ]
      },
      "lopen": {
       "bestand": "sprokkelaarster-u4-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        54,
        92
       ],
       "anker": [
        27,
        81
       ]
      },
      "rapen": {
       "bestand": "sprokkelaarster-u4-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        66,
        97
       ],
       "anker": [
        33,
        81
       ]
      }
     }
    },
    "hakster-u4": {
     "naam": "hakster-u4",
     "cel": [
      90,
      107
     ],
     "anker": [
      45,
      92
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
       "bestand": "hakster-u4-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        82
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "hakster-u4-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        58,
        88
       ],
       "anker": [
        29,
        77
       ]
      },
      "hakken": {
       "bestand": "hakster-u4-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        84,
        98
       ],
       "anker": [
        42,
        89
       ]
      }
     }
    },
    "plukster-u4": {
     "naam": "plukster-u4",
     "cel": [
      70,
      89
     ],
     "anker": [
      35,
      75
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
       "bestand": "plukster-u4-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        79
       ],
       "anker": [
        20,
        70
       ]
      },
      "lopen": {
       "bestand": "plukster-u4-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "plukken": {
       "bestand": "plukster-u4-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        81
       ],
       "anker": [
        32,
        72
       ]
      }
     }
    },
    "binster-u4": {
     "naam": "binster-u4",
     "cel": [
      70,
      89
     ],
     "anker": [
      35,
      73
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
       "bestand": "binster-u4-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        79
       ],
       "anker": [
        19,
        70
       ]
      },
      "lopen": {
       "bestand": "binster-u4-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "binden": {
       "bestand": "binster-u4-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        74
       ],
       "anker": [
        32,
        61
       ]
      }
     }
    },
    "draagster-u4": {
     "naam": "draagster-u4",
     "cel": [
      92,
      99
     ],
     "anker": [
      46,
      85
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
       "bestand": "draagster-u4-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        86,
        91
       ],
       "anker": [
        43,
        82
       ]
      },
      "lopen": {
       "bestand": "draagster-u4-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        86,
        93
       ],
       "anker": [
        43,
        82
       ]
      }
     }
    },
    "dorster-u4": {
     "naam": "dorster-u4",
     "cel": [
      160,
      149
     ],
     "anker": [
      80,
      111
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
       "bestand": "dorster-u4-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        79
       ],
       "anker": [
        26,
        70
       ]
      },
      "lopen": {
       "bestand": "dorster-u4-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        90
       ],
       "anker": [
        42,
        79
       ]
      },
      "dorsen": {
       "bestand": "dorster-u4-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        154,
        143
       ],
       "anker": [
        77,
        108
       ]
      }
     }
    },
    "zaagster-u4": {
     "naam": "zaagster-u4",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zaagster-u4-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "zaagster-u4-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        48,
        81
       ],
       "anker": [
        24,
        70
       ]
      },
      "zagen": {
       "bestand": "zaagster-u4-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        90
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boerin-u5": {
     "naam": "boerin-u5",
     "cel": [
      50,
      86
     ],
     "anker": [
      25,
      72
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
       "bestand": "boerin-u5-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        78
       ],
       "anker": [
        17,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u5-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      }
     }
    },
    "maaister-u5": {
     "naam": "maaister-u5",
     "cel": [
      146,
      113
     ],
     "anker": [
      73,
      71
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
       "bestand": "maaister-u5-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        140,
        107
       ],
       "anker": [
        70,
        68
       ]
      }
     }
    },
    "zaaister-u5": {
     "naam": "zaaister-u5",
     "cel": [
      106,
      93
     ],
     "anker": [
      53,
      72
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
       "bestand": "zaaister-u5-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        42,
        78
       ],
       "anker": [
        21,
        69
       ]
      },
      "lopen": {
       "bestand": "zaaister-u5-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "zaaien": {
       "bestand": "zaaister-u5-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        100,
        87
       ],
       "anker": [
        50,
        69
       ]
      }
     }
    },
    "wiedster-u5": {
     "naam": "wiedster-u5",
     "cel": [
      96,
      99
     ],
     "anker": [
      48,
      73
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
       "bestand": "wiedster-u5-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        56,
        83
       ],
       "anker": [
        28,
        70
       ]
      },
      "lopen": {
       "bestand": "wiedster-u5-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        80
       ],
       "anker": [
        42,
        69
       ]
      },
      "wieden": {
       "bestand": "wiedster-u5-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        90,
        92
       ],
       "anker": [
        45,
        69
       ]
      }
     }
    },
    "sprokkelaarster-u5": {
     "naam": "sprokkelaarster-u5",
     "cel": [
      72,
      103
     ],
     "anker": [
      36,
      84
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
       "bestand": "sprokkelaarster-u5-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        90
       ],
       "anker": [
        27,
        81
       ]
      },
      "lopen": {
       "bestand": "sprokkelaarster-u5-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        54,
        92
       ],
       "anker": [
        27,
        81
       ]
      },
      "rapen": {
       "bestand": "sprokkelaarster-u5-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        66,
        97
       ],
       "anker": [
        33,
        81
       ]
      }
     }
    },
    "hakster-u5": {
     "naam": "hakster-u5",
     "cel": [
      90,
      107
     ],
     "anker": [
      45,
      92
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
       "bestand": "hakster-u5-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        81
       ],
       "anker": [
        24,
        69
       ]
      },
      "lopen": {
       "bestand": "hakster-u5-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        58,
        88
       ],
       "anker": [
        29,
        77
       ]
      },
      "hakken": {
       "bestand": "hakster-u5-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        84,
        98
       ],
       "anker": [
        42,
        89
       ]
      }
     }
    },
    "plukster-u5": {
     "naam": "plukster-u5",
     "cel": [
      70,
      88
     ],
     "anker": [
      35,
      74
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
       "bestand": "plukster-u5-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        78
       ],
       "anker": [
        20,
        69
       ]
      },
      "lopen": {
       "bestand": "plukster-u5-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "plukken": {
       "bestand": "plukster-u5-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        80
       ],
       "anker": [
        32,
        71
       ]
      }
     }
    },
    "binster-u5": {
     "naam": "binster-u5",
     "cel": [
      70,
      88
     ],
     "anker": [
      35,
      72
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
       "bestand": "binster-u5-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        78
       ],
       "anker": [
        19,
        69
       ]
      },
      "lopen": {
       "bestand": "binster-u5-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "binden": {
       "bestand": "binster-u5-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        73
       ],
       "anker": [
        32,
        60
       ]
      }
     }
    },
    "draagster-u5": {
     "naam": "draagster-u5",
     "cel": [
      92,
      99
     ],
     "anker": [
      46,
      85
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
       "bestand": "draagster-u5-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        86,
        91
       ],
       "anker": [
        43,
        82
       ]
      },
      "lopen": {
       "bestand": "draagster-u5-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        86,
        93
       ],
       "anker": [
        43,
        82
       ]
      }
     }
    },
    "dorster-u5": {
     "naam": "dorster-u5",
     "cel": [
      160,
      149
     ],
     "anker": [
      80,
      111
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
       "bestand": "dorster-u5-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        78
       ],
       "anker": [
        26,
        69
       ]
      },
      "lopen": {
       "bestand": "dorster-u5-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        90
       ],
       "anker": [
        42,
        79
       ]
      },
      "dorsen": {
       "bestand": "dorster-u5-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        154,
        143
       ],
       "anker": [
        77,
        108
       ]
      }
     }
    },
    "zaagster-u5": {
     "naam": "zaagster-u5",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zaagster-u5-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        78
       ],
       "anker": [
        24,
        69
       ]
      },
      "lopen": {
       "bestand": "zaagster-u5-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        68
       ]
      },
      "zagen": {
       "bestand": "zaagster-u5-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        90
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boerin-u6": {
     "naam": "boerin-u6",
     "cel": [
      50,
      86
     ],
     "anker": [
      25,
      72
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
       "bestand": "boerin-u6-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        78
       ],
       "anker": [
        17,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u6-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      }
     }
    },
    "maaister-u6": {
     "naam": "maaister-u6",
     "cel": [
      146,
      113
     ],
     "anker": [
      73,
      71
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
       "bestand": "maaister-u6-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        140,
        107
       ],
       "anker": [
        70,
        68
       ]
      }
     }
    },
    "zaaister-u6": {
     "naam": "zaaister-u6",
     "cel": [
      106,
      93
     ],
     "anker": [
      53,
      72
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
       "bestand": "zaaister-u6-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        42,
        78
       ],
       "anker": [
        21,
        69
       ]
      },
      "lopen": {
       "bestand": "zaaister-u6-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "zaaien": {
       "bestand": "zaaister-u6-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        100,
        87
       ],
       "anker": [
        50,
        69
       ]
      }
     }
    },
    "wiedster-u6": {
     "naam": "wiedster-u6",
     "cel": [
      96,
      99
     ],
     "anker": [
      48,
      73
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
       "bestand": "wiedster-u6-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        56,
        83
       ],
       "anker": [
        28,
        70
       ]
      },
      "lopen": {
       "bestand": "wiedster-u6-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        80
       ],
       "anker": [
        42,
        69
       ]
      },
      "wieden": {
       "bestand": "wiedster-u6-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        90,
        92
       ],
       "anker": [
        45,
        69
       ]
      }
     }
    },
    "sprokkelaarster-u6": {
     "naam": "sprokkelaarster-u6",
     "cel": [
      72,
      103
     ],
     "anker": [
      36,
      84
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
       "bestand": "sprokkelaarster-u6-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        90
       ],
       "anker": [
        27,
        81
       ]
      },
      "lopen": {
       "bestand": "sprokkelaarster-u6-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        54,
        92
       ],
       "anker": [
        27,
        81
       ]
      },
      "rapen": {
       "bestand": "sprokkelaarster-u6-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        66,
        97
       ],
       "anker": [
        33,
        81
       ]
      }
     }
    },
    "hakster-u6": {
     "naam": "hakster-u6",
     "cel": [
      90,
      107
     ],
     "anker": [
      45,
      92
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
       "bestand": "hakster-u6-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        81
       ],
       "anker": [
        24,
        69
       ]
      },
      "lopen": {
       "bestand": "hakster-u6-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        58,
        88
       ],
       "anker": [
        29,
        77
       ]
      },
      "hakken": {
       "bestand": "hakster-u6-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        84,
        98
       ],
       "anker": [
        42,
        89
       ]
      }
     }
    },
    "plukster-u6": {
     "naam": "plukster-u6",
     "cel": [
      70,
      88
     ],
     "anker": [
      35,
      74
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
       "bestand": "plukster-u6-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        78
       ],
       "anker": [
        20,
        69
       ]
      },
      "lopen": {
       "bestand": "plukster-u6-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "plukken": {
       "bestand": "plukster-u6-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        80
       ],
       "anker": [
        32,
        71
       ]
      }
     }
    },
    "binster-u6": {
     "naam": "binster-u6",
     "cel": [
      70,
      88
     ],
     "anker": [
      35,
      72
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
       "bestand": "binster-u6-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        78
       ],
       "anker": [
        19,
        69
       ]
      },
      "lopen": {
       "bestand": "binster-u6-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "binden": {
       "bestand": "binster-u6-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        73
       ],
       "anker": [
        32,
        60
       ]
      }
     }
    },
    "draagster-u6": {
     "naam": "draagster-u6",
     "cel": [
      92,
      99
     ],
     "anker": [
      46,
      85
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
       "bestand": "draagster-u6-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        86,
        91
       ],
       "anker": [
        43,
        82
       ]
      },
      "lopen": {
       "bestand": "draagster-u6-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        86,
        93
       ],
       "anker": [
        43,
        82
       ]
      }
     }
    },
    "dorster-u6": {
     "naam": "dorster-u6",
     "cel": [
      160,
      149
     ],
     "anker": [
      80,
      111
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
       "bestand": "dorster-u6-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        78
       ],
       "anker": [
        26,
        69
       ]
      },
      "lopen": {
       "bestand": "dorster-u6-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        90
       ],
       "anker": [
        42,
        79
       ]
      },
      "dorsen": {
       "bestand": "dorster-u6-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        154,
        143
       ],
       "anker": [
        77,
        108
       ]
      }
     }
    },
    "zaagster-u6": {
     "naam": "zaagster-u6",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zaagster-u6-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        78
       ],
       "anker": [
        24,
        69
       ]
      },
      "lopen": {
       "bestand": "zaagster-u6-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        68
       ]
      },
      "zagen": {
       "bestand": "zaagster-u6-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        90
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boerin-u7": {
     "naam": "boerin-u7",
     "cel": [
      50,
      86
     ],
     "anker": [
      25,
      72
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
       "bestand": "boerin-u7-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        78
       ],
       "anker": [
        17,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u7-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      }
     }
    },
    "maaister-u7": {
     "naam": "maaister-u7",
     "cel": [
      146,
      113
     ],
     "anker": [
      73,
      71
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
       "bestand": "maaister-u7-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        140,
        107
       ],
       "anker": [
        70,
        68
       ]
      }
     }
    },
    "zaaister-u7": {
     "naam": "zaaister-u7",
     "cel": [
      106,
      93
     ],
     "anker": [
      53,
      72
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
       "bestand": "zaaister-u7-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        42,
        78
       ],
       "anker": [
        21,
        69
       ]
      },
      "lopen": {
       "bestand": "zaaister-u7-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "zaaien": {
       "bestand": "zaaister-u7-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        100,
        87
       ],
       "anker": [
        50,
        69
       ]
      }
     }
    },
    "wiedster-u7": {
     "naam": "wiedster-u7",
     "cel": [
      96,
      99
     ],
     "anker": [
      48,
      73
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
       "bestand": "wiedster-u7-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        56,
        83
       ],
       "anker": [
        28,
        70
       ]
      },
      "lopen": {
       "bestand": "wiedster-u7-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        80
       ],
       "anker": [
        42,
        69
       ]
      },
      "wieden": {
       "bestand": "wiedster-u7-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        90,
        92
       ],
       "anker": [
        45,
        69
       ]
      }
     }
    },
    "sprokkelaarster-u7": {
     "naam": "sprokkelaarster-u7",
     "cel": [
      72,
      103
     ],
     "anker": [
      36,
      84
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
       "bestand": "sprokkelaarster-u7-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        90
       ],
       "anker": [
        27,
        81
       ]
      },
      "lopen": {
       "bestand": "sprokkelaarster-u7-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        54,
        92
       ],
       "anker": [
        27,
        81
       ]
      },
      "rapen": {
       "bestand": "sprokkelaarster-u7-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        66,
        97
       ],
       "anker": [
        33,
        81
       ]
      }
     }
    },
    "hakster-u7": {
     "naam": "hakster-u7",
     "cel": [
      90,
      107
     ],
     "anker": [
      45,
      92
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
       "bestand": "hakster-u7-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        81
       ],
       "anker": [
        24,
        69
       ]
      },
      "lopen": {
       "bestand": "hakster-u7-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        58,
        88
       ],
       "anker": [
        29,
        77
       ]
      },
      "hakken": {
       "bestand": "hakster-u7-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        84,
        98
       ],
       "anker": [
        42,
        89
       ]
      }
     }
    },
    "plukster-u7": {
     "naam": "plukster-u7",
     "cel": [
      70,
      88
     ],
     "anker": [
      35,
      74
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
       "bestand": "plukster-u7-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        78
       ],
       "anker": [
        20,
        69
       ]
      },
      "lopen": {
       "bestand": "plukster-u7-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "plukken": {
       "bestand": "plukster-u7-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        80
       ],
       "anker": [
        32,
        71
       ]
      }
     }
    },
    "binster-u7": {
     "naam": "binster-u7",
     "cel": [
      70,
      88
     ],
     "anker": [
      35,
      72
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
       "bestand": "binster-u7-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        78
       ],
       "anker": [
        19,
        69
       ]
      },
      "lopen": {
       "bestand": "binster-u7-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "binden": {
       "bestand": "binster-u7-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        73
       ],
       "anker": [
        32,
        60
       ]
      }
     }
    },
    "draagster-u7": {
     "naam": "draagster-u7",
     "cel": [
      92,
      99
     ],
     "anker": [
      46,
      85
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
       "bestand": "draagster-u7-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        86,
        91
       ],
       "anker": [
        43,
        82
       ]
      },
      "lopen": {
       "bestand": "draagster-u7-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        86,
        93
       ],
       "anker": [
        43,
        82
       ]
      }
     }
    },
    "dorster-u7": {
     "naam": "dorster-u7",
     "cel": [
      160,
      149
     ],
     "anker": [
      80,
      111
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
       "bestand": "dorster-u7-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        78
       ],
       "anker": [
        26,
        69
       ]
      },
      "lopen": {
       "bestand": "dorster-u7-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        90
       ],
       "anker": [
        42,
        79
       ]
      },
      "dorsen": {
       "bestand": "dorster-u7-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        154,
        143
       ],
       "anker": [
        77,
        108
       ]
      }
     }
    },
    "zaagster-u7": {
     "naam": "zaagster-u7",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zaagster-u7-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        78
       ],
       "anker": [
        24,
        69
       ]
      },
      "lopen": {
       "bestand": "zaagster-u7-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        68
       ]
      },
      "zagen": {
       "bestand": "zaagster-u7-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        90
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boerin-u8": {
     "naam": "boerin-u8",
     "cel": [
      50,
      86
     ],
     "anker": [
      25,
      72
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
       "bestand": "boerin-u8-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        78
       ],
       "anker": [
        18,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u8-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      }
     }
    },
    "maaister-u8": {
     "naam": "maaister-u8",
     "cel": [
      146,
      113
     ],
     "anker": [
      73,
      71
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
       "bestand": "maaister-u8-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        140,
        107
       ],
       "anker": [
        70,
        68
       ]
      }
     }
    },
    "zaaister-u8": {
     "naam": "zaaister-u8",
     "cel": [
      106,
      93
     ],
     "anker": [
      53,
      72
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
       "bestand": "zaaister-u8-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        42,
        78
       ],
       "anker": [
        21,
        69
       ]
      },
      "lopen": {
       "bestand": "zaaister-u8-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "zaaien": {
       "bestand": "zaaister-u8-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        100,
        87
       ],
       "anker": [
        50,
        69
       ]
      }
     }
    },
    "wiedster-u8": {
     "naam": "wiedster-u8",
     "cel": [
      96,
      99
     ],
     "anker": [
      48,
      73
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
       "bestand": "wiedster-u8-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        56,
        83
       ],
       "anker": [
        28,
        70
       ]
      },
      "lopen": {
       "bestand": "wiedster-u8-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        80
       ],
       "anker": [
        42,
        69
       ]
      },
      "wieden": {
       "bestand": "wiedster-u8-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        90,
        92
       ],
       "anker": [
        45,
        69
       ]
      }
     }
    },
    "sprokkelaarster-u8": {
     "naam": "sprokkelaarster-u8",
     "cel": [
      72,
      103
     ],
     "anker": [
      36,
      84
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
       "bestand": "sprokkelaarster-u8-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        90
       ],
       "anker": [
        27,
        81
       ]
      },
      "lopen": {
       "bestand": "sprokkelaarster-u8-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        54,
        92
       ],
       "anker": [
        27,
        81
       ]
      },
      "rapen": {
       "bestand": "sprokkelaarster-u8-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        66,
        97
       ],
       "anker": [
        33,
        81
       ]
      }
     }
    },
    "hakster-u8": {
     "naam": "hakster-u8",
     "cel": [
      90,
      107
     ],
     "anker": [
      45,
      92
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
       "bestand": "hakster-u8-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        81
       ],
       "anker": [
        24,
        69
       ]
      },
      "lopen": {
       "bestand": "hakster-u8-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        58,
        88
       ],
       "anker": [
        29,
        77
       ]
      },
      "hakken": {
       "bestand": "hakster-u8-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        84,
        98
       ],
       "anker": [
        42,
        89
       ]
      }
     }
    },
    "plukster-u8": {
     "naam": "plukster-u8",
     "cel": [
      70,
      88
     ],
     "anker": [
      35,
      74
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
       "bestand": "plukster-u8-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        78
       ],
       "anker": [
        20,
        69
       ]
      },
      "lopen": {
       "bestand": "plukster-u8-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "plukken": {
       "bestand": "plukster-u8-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        80
       ],
       "anker": [
        32,
        71
       ]
      }
     }
    },
    "binster-u8": {
     "naam": "binster-u8",
     "cel": [
      70,
      88
     ],
     "anker": [
      35,
      72
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
       "bestand": "binster-u8-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        78
       ],
       "anker": [
        19,
        69
       ]
      },
      "lopen": {
       "bestand": "binster-u8-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "binden": {
       "bestand": "binster-u8-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        73
       ],
       "anker": [
        32,
        60
       ]
      }
     }
    },
    "draagster-u8": {
     "naam": "draagster-u8",
     "cel": [
      92,
      99
     ],
     "anker": [
      46,
      85
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
       "bestand": "draagster-u8-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        86,
        91
       ],
       "anker": [
        43,
        82
       ]
      },
      "lopen": {
       "bestand": "draagster-u8-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        86,
        93
       ],
       "anker": [
        43,
        82
       ]
      }
     }
    },
    "dorster-u8": {
     "naam": "dorster-u8",
     "cel": [
      160,
      149
     ],
     "anker": [
      80,
      111
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
       "bestand": "dorster-u8-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        78
       ],
       "anker": [
        26,
        69
       ]
      },
      "lopen": {
       "bestand": "dorster-u8-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        90
       ],
       "anker": [
        42,
        79
       ]
      },
      "dorsen": {
       "bestand": "dorster-u8-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        154,
        143
       ],
       "anker": [
        77,
        108
       ]
      }
     }
    },
    "zaagster-u8": {
     "naam": "zaagster-u8",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zaagster-u8-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        78
       ],
       "anker": [
        24,
        69
       ]
      },
      "lopen": {
       "bestand": "zaagster-u8-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        68
       ]
      },
      "zagen": {
       "bestand": "zaagster-u8-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        90
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boerin-u9": {
     "naam": "boerin-u9",
     "cel": [
      50,
      87
     ],
     "anker": [
      25,
      73
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
       "bestand": "boerin-u9-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        79
       ],
       "anker": [
        17,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u9-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      }
     }
    },
    "maaister-u9": {
     "naam": "maaister-u9",
     "cel": [
      146,
      114
     ],
     "anker": [
      73,
      72
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
       "bestand": "maaister-u9-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        140,
        108
       ],
       "anker": [
        70,
        69
       ]
      }
     }
    },
    "zaaister-u9": {
     "naam": "zaaister-u9",
     "cel": [
      106,
      95
     ],
     "anker": [
      53,
      74
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
       "bestand": "zaaister-u9-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        42,
        79
       ],
       "anker": [
        21,
        70
       ]
      },
      "lopen": {
       "bestand": "zaaister-u9-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "zaaien": {
       "bestand": "zaaister-u9-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        100,
        89
       ],
       "anker": [
        50,
        71
       ]
      }
     }
    },
    "wiedster-u9": {
     "naam": "wiedster-u9",
     "cel": [
      96,
      100
     ],
     "anker": [
      48,
      74
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
       "bestand": "wiedster-u9-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        56,
        84
       ],
       "anker": [
        28,
        71
       ]
      },
      "lopen": {
       "bestand": "wiedster-u9-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        81
       ],
       "anker": [
        42,
        70
       ]
      },
      "wieden": {
       "bestand": "wiedster-u9-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        90,
        93
       ],
       "anker": [
        45,
        70
       ]
      }
     }
    },
    "sprokkelaarster-u9": {
     "naam": "sprokkelaarster-u9",
     "cel": [
      72,
      103
     ],
     "anker": [
      36,
      84
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
       "bestand": "sprokkelaarster-u9-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        90
       ],
       "anker": [
        27,
        81
       ]
      },
      "lopen": {
       "bestand": "sprokkelaarster-u9-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        54,
        92
       ],
       "anker": [
        27,
        81
       ]
      },
      "rapen": {
       "bestand": "sprokkelaarster-u9-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        66,
        97
       ],
       "anker": [
        33,
        81
       ]
      }
     }
    },
    "hakster-u9": {
     "naam": "hakster-u9",
     "cel": [
      90,
      107
     ],
     "anker": [
      45,
      92
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
       "bestand": "hakster-u9-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        82
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "hakster-u9-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        58,
        88
       ],
       "anker": [
        29,
        77
       ]
      },
      "hakken": {
       "bestand": "hakster-u9-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        84,
        98
       ],
       "anker": [
        42,
        89
       ]
      }
     }
    },
    "plukster-u9": {
     "naam": "plukster-u9",
     "cel": [
      70,
      89
     ],
     "anker": [
      35,
      75
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
       "bestand": "plukster-u9-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        79
       ],
       "anker": [
        20,
        70
       ]
      },
      "lopen": {
       "bestand": "plukster-u9-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "plukken": {
       "bestand": "plukster-u9-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        81
       ],
       "anker": [
        32,
        72
       ]
      }
     }
    },
    "binster-u9": {
     "naam": "binster-u9",
     "cel": [
      70,
      89
     ],
     "anker": [
      35,
      73
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
       "bestand": "binster-u9-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        79
       ],
       "anker": [
        19,
        70
       ]
      },
      "lopen": {
       "bestand": "binster-u9-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "binden": {
       "bestand": "binster-u9-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        74
       ],
       "anker": [
        32,
        61
       ]
      }
     }
    },
    "draagster-u9": {
     "naam": "draagster-u9",
     "cel": [
      92,
      99
     ],
     "anker": [
      46,
      85
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
       "bestand": "draagster-u9-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        86,
        91
       ],
       "anker": [
        43,
        82
       ]
      },
      "lopen": {
       "bestand": "draagster-u9-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        86,
        93
       ],
       "anker": [
        43,
        82
       ]
      }
     }
    },
    "dorster-u9": {
     "naam": "dorster-u9",
     "cel": [
      160,
      149
     ],
     "anker": [
      80,
      111
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
       "bestand": "dorster-u9-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        79
       ],
       "anker": [
        26,
        70
       ]
      },
      "lopen": {
       "bestand": "dorster-u9-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        90
       ],
       "anker": [
        42,
        79
       ]
      },
      "dorsen": {
       "bestand": "dorster-u9-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        154,
        143
       ],
       "anker": [
        77,
        108
       ]
      }
     }
    },
    "zaagster-u9": {
     "naam": "zaagster-u9",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zaagster-u9-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "zaagster-u9-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        48,
        81
       ],
       "anker": [
        24,
        70
       ]
      },
      "zagen": {
       "bestand": "zaagster-u9-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        90
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boerin-u10": {
     "naam": "boerin-u10",
     "cel": [
      50,
      86
     ],
     "anker": [
      25,
      72
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
       "bestand": "boerin-u10-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        78
       ],
       "anker": [
        17,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u10-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      }
     }
    },
    "maaister-u10": {
     "naam": "maaister-u10",
     "cel": [
      146,
      113
     ],
     "anker": [
      73,
      71
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
       "bestand": "maaister-u10-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        140,
        107
       ],
       "anker": [
        70,
        68
       ]
      }
     }
    },
    "zaaister-u10": {
     "naam": "zaaister-u10",
     "cel": [
      106,
      93
     ],
     "anker": [
      53,
      72
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
       "bestand": "zaaister-u10-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        42,
        78
       ],
       "anker": [
        21,
        69
       ]
      },
      "lopen": {
       "bestand": "zaaister-u10-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "zaaien": {
       "bestand": "zaaister-u10-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        100,
        87
       ],
       "anker": [
        50,
        69
       ]
      }
     }
    },
    "wiedster-u10": {
     "naam": "wiedster-u10",
     "cel": [
      96,
      99
     ],
     "anker": [
      48,
      73
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
       "bestand": "wiedster-u10-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        56,
        83
       ],
       "anker": [
        28,
        70
       ]
      },
      "lopen": {
       "bestand": "wiedster-u10-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        80
       ],
       "anker": [
        42,
        69
       ]
      },
      "wieden": {
       "bestand": "wiedster-u10-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        90,
        92
       ],
       "anker": [
        45,
        69
       ]
      }
     }
    },
    "sprokkelaarster-u10": {
     "naam": "sprokkelaarster-u10",
     "cel": [
      72,
      103
     ],
     "anker": [
      36,
      84
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
       "bestand": "sprokkelaarster-u10-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        90
       ],
       "anker": [
        27,
        81
       ]
      },
      "lopen": {
       "bestand": "sprokkelaarster-u10-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        54,
        92
       ],
       "anker": [
        27,
        81
       ]
      },
      "rapen": {
       "bestand": "sprokkelaarster-u10-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        66,
        97
       ],
       "anker": [
        33,
        81
       ]
      }
     }
    },
    "hakster-u10": {
     "naam": "hakster-u10",
     "cel": [
      90,
      107
     ],
     "anker": [
      45,
      92
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
       "bestand": "hakster-u10-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        81
       ],
       "anker": [
        24,
        69
       ]
      },
      "lopen": {
       "bestand": "hakster-u10-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        58,
        88
       ],
       "anker": [
        29,
        77
       ]
      },
      "hakken": {
       "bestand": "hakster-u10-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        84,
        98
       ],
       "anker": [
        42,
        89
       ]
      }
     }
    },
    "plukster-u10": {
     "naam": "plukster-u10",
     "cel": [
      70,
      88
     ],
     "anker": [
      35,
      74
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
       "bestand": "plukster-u10-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        78
       ],
       "anker": [
        20,
        69
       ]
      },
      "lopen": {
       "bestand": "plukster-u10-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "plukken": {
       "bestand": "plukster-u10-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        80
       ],
       "anker": [
        32,
        71
       ]
      }
     }
    },
    "binster-u10": {
     "naam": "binster-u10",
     "cel": [
      70,
      88
     ],
     "anker": [
      35,
      72
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
       "bestand": "binster-u10-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        78
       ],
       "anker": [
        19,
        69
       ]
      },
      "lopen": {
       "bestand": "binster-u10-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "binden": {
       "bestand": "binster-u10-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        73
       ],
       "anker": [
        32,
        60
       ]
      }
     }
    },
    "draagster-u10": {
     "naam": "draagster-u10",
     "cel": [
      92,
      99
     ],
     "anker": [
      46,
      85
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
       "bestand": "draagster-u10-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        86,
        91
       ],
       "anker": [
        43,
        82
       ]
      },
      "lopen": {
       "bestand": "draagster-u10-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        86,
        93
       ],
       "anker": [
        43,
        82
       ]
      }
     }
    },
    "dorster-u10": {
     "naam": "dorster-u10",
     "cel": [
      160,
      149
     ],
     "anker": [
      80,
      111
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
       "bestand": "dorster-u10-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        78
       ],
       "anker": [
        26,
        69
       ]
      },
      "lopen": {
       "bestand": "dorster-u10-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        90
       ],
       "anker": [
        42,
        79
       ]
      },
      "dorsen": {
       "bestand": "dorster-u10-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        154,
        143
       ],
       "anker": [
        77,
        108
       ]
      }
     }
    },
    "zaagster-u10": {
     "naam": "zaagster-u10",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zaagster-u10-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        78
       ],
       "anker": [
        24,
        69
       ]
      },
      "lopen": {
       "bestand": "zaagster-u10-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        68
       ]
      },
      "zagen": {
       "bestand": "zaagster-u10-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        90
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boerin-u11": {
     "naam": "boerin-u11",
     "cel": [
      50,
      86
     ],
     "anker": [
      25,
      72
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
       "bestand": "boerin-u11-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        78
       ],
       "anker": [
        17,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u11-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        80
       ],
       "anker": [
        22,
        69
       ]
      }
     }
    },
    "maaister-u11": {
     "naam": "maaister-u11",
     "cel": [
      146,
      114
     ],
     "anker": [
      73,
      72
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
       "bestand": "maaister-u11-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        140,
        108
       ],
       "anker": [
        70,
        69
       ]
      }
     }
    },
    "zaaister-u11": {
     "naam": "zaaister-u11",
     "cel": [
      106,
      94
     ],
     "anker": [
      53,
      73
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
       "bestand": "zaaister-u11-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        42,
        78
       ],
       "anker": [
        21,
        69
       ]
      },
      "lopen": {
       "bestand": "zaaister-u11-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        80
       ],
       "anker": [
        22,
        69
       ]
      },
      "zaaien": {
       "bestand": "zaaister-u11-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        100,
        88
       ],
       "anker": [
        50,
        70
       ]
      }
     }
    },
    "wiedster-u11": {
     "naam": "wiedster-u11",
     "cel": [
      96,
      100
     ],
     "anker": [
      48,
      74
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
       "bestand": "wiedster-u11-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        56,
        84
       ],
       "anker": [
        28,
        71
       ]
      },
      "lopen": {
       "bestand": "wiedster-u11-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        80
       ],
       "anker": [
        42,
        69
       ]
      },
      "wieden": {
       "bestand": "wiedster-u11-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        90,
        93
       ],
       "anker": [
        45,
        70
       ]
      }
     }
    },
    "sprokkelaarster-u11": {
     "naam": "sprokkelaarster-u11",
     "cel": [
      72,
      103
     ],
     "anker": [
      36,
      84
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
       "bestand": "sprokkelaarster-u11-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        90
       ],
       "anker": [
        27,
        81
       ]
      },
      "lopen": {
       "bestand": "sprokkelaarster-u11-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        54,
        92
       ],
       "anker": [
        27,
        81
       ]
      },
      "rapen": {
       "bestand": "sprokkelaarster-u11-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        66,
        97
       ],
       "anker": [
        33,
        81
       ]
      }
     }
    },
    "hakster-u11": {
     "naam": "hakster-u11",
     "cel": [
      90,
      107
     ],
     "anker": [
      45,
      92
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
       "bestand": "hakster-u11-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        81
       ],
       "anker": [
        24,
        69
       ]
      },
      "lopen": {
       "bestand": "hakster-u11-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        58,
        88
       ],
       "anker": [
        29,
        77
       ]
      },
      "hakken": {
       "bestand": "hakster-u11-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        84,
        98
       ],
       "anker": [
        42,
        89
       ]
      }
     }
    },
    "plukster-u11": {
     "naam": "plukster-u11",
     "cel": [
      70,
      89
     ],
     "anker": [
      35,
      75
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
       "bestand": "plukster-u11-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        78
       ],
       "anker": [
        20,
        69
       ]
      },
      "lopen": {
       "bestand": "plukster-u11-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        80
       ],
       "anker": [
        22,
        69
       ]
      },
      "plukken": {
       "bestand": "plukster-u11-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        81
       ],
       "anker": [
        32,
        72
       ]
      }
     }
    },
    "binster-u11": {
     "naam": "binster-u11",
     "cel": [
      70,
      88
     ],
     "anker": [
      35,
      72
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
       "bestand": "binster-u11-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        78
       ],
       "anker": [
        19,
        69
       ]
      },
      "lopen": {
       "bestand": "binster-u11-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        80
       ],
       "anker": [
        22,
        69
       ]
      },
      "binden": {
       "bestand": "binster-u11-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        74
       ],
       "anker": [
        32,
        61
       ]
      }
     }
    },
    "draagster-u11": {
     "naam": "draagster-u11",
     "cel": [
      92,
      99
     ],
     "anker": [
      46,
      85
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
       "bestand": "draagster-u11-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        86,
        91
       ],
       "anker": [
        43,
        82
       ]
      },
      "lopen": {
       "bestand": "draagster-u11-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        86,
        93
       ],
       "anker": [
        43,
        82
       ]
      }
     }
    },
    "dorster-u11": {
     "naam": "dorster-u11",
     "cel": [
      160,
      149
     ],
     "anker": [
      80,
      111
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
       "bestand": "dorster-u11-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        78
       ],
       "anker": [
        26,
        69
       ]
      },
      "lopen": {
       "bestand": "dorster-u11-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        90
       ],
       "anker": [
        42,
        79
       ]
      },
      "dorsen": {
       "bestand": "dorster-u11-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        154,
        143
       ],
       "anker": [
        77,
        108
       ]
      }
     }
    },
    "zaagster-u11": {
     "naam": "zaagster-u11",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zaagster-u11-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        78
       ],
       "anker": [
        24,
        69
       ]
      },
      "lopen": {
       "bestand": "zaagster-u11-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        48,
        80
       ],
       "anker": [
        24,
        69
       ]
      },
      "zagen": {
       "bestand": "zaagster-u11-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        90
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boerin-u12": {
     "naam": "boerin-u12",
     "cel": [
      50,
      87
     ],
     "anker": [
      25,
      73
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
       "bestand": "boerin-u12-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        79
       ],
       "anker": [
        17,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u12-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      }
     }
    },
    "maaister-u12": {
     "naam": "maaister-u12",
     "cel": [
      146,
      114
     ],
     "anker": [
      73,
      72
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
       "bestand": "maaister-u12-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        140,
        108
       ],
       "anker": [
        70,
        69
       ]
      }
     }
    },
    "zaaister-u12": {
     "naam": "zaaister-u12",
     "cel": [
      106,
      94
     ],
     "anker": [
      53,
      73
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
       "bestand": "zaaister-u12-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        42,
        79
       ],
       "anker": [
        21,
        70
       ]
      },
      "lopen": {
       "bestand": "zaaister-u12-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "zaaien": {
       "bestand": "zaaister-u12-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        100,
        88
       ],
       "anker": [
        50,
        70
       ]
      }
     }
    },
    "wiedster-u12": {
     "naam": "wiedster-u12",
     "cel": [
      96,
      100
     ],
     "anker": [
      48,
      74
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
       "bestand": "wiedster-u12-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        56,
        84
       ],
       "anker": [
        28,
        71
       ]
      },
      "lopen": {
       "bestand": "wiedster-u12-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        81
       ],
       "anker": [
        42,
        70
       ]
      },
      "wieden": {
       "bestand": "wiedster-u12-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        90,
        93
       ],
       "anker": [
        45,
        70
       ]
      }
     }
    },
    "sprokkelaarster-u12": {
     "naam": "sprokkelaarster-u12",
     "cel": [
      72,
      103
     ],
     "anker": [
      36,
      84
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
       "bestand": "sprokkelaarster-u12-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        90
       ],
       "anker": [
        27,
        81
       ]
      },
      "lopen": {
       "bestand": "sprokkelaarster-u12-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        54,
        92
       ],
       "anker": [
        27,
        81
       ]
      },
      "rapen": {
       "bestand": "sprokkelaarster-u12-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        66,
        97
       ],
       "anker": [
        33,
        81
       ]
      }
     }
    },
    "hakster-u12": {
     "naam": "hakster-u12",
     "cel": [
      90,
      107
     ],
     "anker": [
      45,
      92
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
       "bestand": "hakster-u12-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        82
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "hakster-u12-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        58,
        88
       ],
       "anker": [
        29,
        77
       ]
      },
      "hakken": {
       "bestand": "hakster-u12-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        84,
        98
       ],
       "anker": [
        42,
        89
       ]
      }
     }
    },
    "plukster-u12": {
     "naam": "plukster-u12",
     "cel": [
      70,
      89
     ],
     "anker": [
      35,
      75
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
       "bestand": "plukster-u12-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        79
       ],
       "anker": [
        20,
        70
       ]
      },
      "lopen": {
       "bestand": "plukster-u12-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "plukken": {
       "bestand": "plukster-u12-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        81
       ],
       "anker": [
        32,
        72
       ]
      }
     }
    },
    "binster-u12": {
     "naam": "binster-u12",
     "cel": [
      70,
      89
     ],
     "anker": [
      35,
      73
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
       "bestand": "binster-u12-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        79
       ],
       "anker": [
        19,
        70
       ]
      },
      "lopen": {
       "bestand": "binster-u12-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "binden": {
       "bestand": "binster-u12-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        74
       ],
       "anker": [
        32,
        61
       ]
      }
     }
    },
    "draagster-u12": {
     "naam": "draagster-u12",
     "cel": [
      92,
      99
     ],
     "anker": [
      46,
      85
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
       "bestand": "draagster-u12-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        86,
        91
       ],
       "anker": [
        43,
        82
       ]
      },
      "lopen": {
       "bestand": "draagster-u12-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        86,
        93
       ],
       "anker": [
        43,
        82
       ]
      }
     }
    },
    "dorster-u12": {
     "naam": "dorster-u12",
     "cel": [
      160,
      149
     ],
     "anker": [
      80,
      111
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
       "bestand": "dorster-u12-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        79
       ],
       "anker": [
        26,
        70
       ]
      },
      "lopen": {
       "bestand": "dorster-u12-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        90
       ],
       "anker": [
        42,
        79
       ]
      },
      "dorsen": {
       "bestand": "dorster-u12-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        154,
        143
       ],
       "anker": [
        77,
        108
       ]
      }
     }
    },
    "zaagster-u12": {
     "naam": "zaagster-u12",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zaagster-u12-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "zaagster-u12-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        48,
        81
       ],
       "anker": [
        24,
        70
       ]
      },
      "zagen": {
       "bestand": "zaagster-u12-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        90
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boerin-u13": {
     "naam": "boerin-u13",
     "cel": [
      50,
      86
     ],
     "anker": [
      25,
      72
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
       "bestand": "boerin-u13-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        78
       ],
       "anker": [
        17,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u13-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      }
     }
    },
    "maaister-u13": {
     "naam": "maaister-u13",
     "cel": [
      146,
      113
     ],
     "anker": [
      73,
      71
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
       "bestand": "maaister-u13-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        140,
        107
       ],
       "anker": [
        70,
        68
       ]
      }
     }
    },
    "zaaister-u13": {
     "naam": "zaaister-u13",
     "cel": [
      106,
      93
     ],
     "anker": [
      53,
      72
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
       "bestand": "zaaister-u13-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        42,
        78
       ],
       "anker": [
        21,
        69
       ]
      },
      "lopen": {
       "bestand": "zaaister-u13-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "zaaien": {
       "bestand": "zaaister-u13-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        100,
        87
       ],
       "anker": [
        50,
        69
       ]
      }
     }
    },
    "wiedster-u13": {
     "naam": "wiedster-u13",
     "cel": [
      96,
      99
     ],
     "anker": [
      48,
      73
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
       "bestand": "wiedster-u13-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        56,
        83
       ],
       "anker": [
        28,
        70
       ]
      },
      "lopen": {
       "bestand": "wiedster-u13-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        80
       ],
       "anker": [
        42,
        69
       ]
      },
      "wieden": {
       "bestand": "wiedster-u13-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        90,
        92
       ],
       "anker": [
        45,
        69
       ]
      }
     }
    },
    "sprokkelaarster-u13": {
     "naam": "sprokkelaarster-u13",
     "cel": [
      72,
      103
     ],
     "anker": [
      36,
      84
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
       "bestand": "sprokkelaarster-u13-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        90
       ],
       "anker": [
        27,
        81
       ]
      },
      "lopen": {
       "bestand": "sprokkelaarster-u13-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        54,
        92
       ],
       "anker": [
        27,
        81
       ]
      },
      "rapen": {
       "bestand": "sprokkelaarster-u13-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        66,
        97
       ],
       "anker": [
        33,
        81
       ]
      }
     }
    },
    "hakster-u13": {
     "naam": "hakster-u13",
     "cel": [
      90,
      107
     ],
     "anker": [
      45,
      92
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
       "bestand": "hakster-u13-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        81
       ],
       "anker": [
        24,
        69
       ]
      },
      "lopen": {
       "bestand": "hakster-u13-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        58,
        88
       ],
       "anker": [
        29,
        77
       ]
      },
      "hakken": {
       "bestand": "hakster-u13-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        84,
        98
       ],
       "anker": [
        42,
        89
       ]
      }
     }
    },
    "plukster-u13": {
     "naam": "plukster-u13",
     "cel": [
      70,
      88
     ],
     "anker": [
      35,
      74
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
       "bestand": "plukster-u13-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        78
       ],
       "anker": [
        20,
        69
       ]
      },
      "lopen": {
       "bestand": "plukster-u13-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "plukken": {
       "bestand": "plukster-u13-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        80
       ],
       "anker": [
        32,
        71
       ]
      }
     }
    },
    "binster-u13": {
     "naam": "binster-u13",
     "cel": [
      70,
      88
     ],
     "anker": [
      35,
      72
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
       "bestand": "binster-u13-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        78
       ],
       "anker": [
        19,
        69
       ]
      },
      "lopen": {
       "bestand": "binster-u13-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "binden": {
       "bestand": "binster-u13-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        73
       ],
       "anker": [
        32,
        60
       ]
      }
     }
    },
    "draagster-u13": {
     "naam": "draagster-u13",
     "cel": [
      92,
      99
     ],
     "anker": [
      46,
      85
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
       "bestand": "draagster-u13-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        86,
        91
       ],
       "anker": [
        43,
        82
       ]
      },
      "lopen": {
       "bestand": "draagster-u13-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        86,
        93
       ],
       "anker": [
        43,
        82
       ]
      }
     }
    },
    "dorster-u13": {
     "naam": "dorster-u13",
     "cel": [
      160,
      149
     ],
     "anker": [
      80,
      111
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
       "bestand": "dorster-u13-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        78
       ],
       "anker": [
        26,
        69
       ]
      },
      "lopen": {
       "bestand": "dorster-u13-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        90
       ],
       "anker": [
        42,
        79
       ]
      },
      "dorsen": {
       "bestand": "dorster-u13-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        154,
        143
       ],
       "anker": [
        77,
        108
       ]
      }
     }
    },
    "zaagster-u13": {
     "naam": "zaagster-u13",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zaagster-u13-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        78
       ],
       "anker": [
        24,
        69
       ]
      },
      "lopen": {
       "bestand": "zaagster-u13-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        68
       ]
      },
      "zagen": {
       "bestand": "zaagster-u13-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        90
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boerin-u14": {
     "naam": "boerin-u14",
     "cel": [
      50,
      87
     ],
     "anker": [
      25,
      73
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
       "bestand": "boerin-u14-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        79
       ],
       "anker": [
        17,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u14-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        80
       ],
       "anker": [
        22,
        69
       ]
      }
     }
    },
    "maaister-u14": {
     "naam": "maaister-u14",
     "cel": [
      146,
      114
     ],
     "anker": [
      73,
      72
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
       "bestand": "maaister-u14-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        140,
        108
       ],
       "anker": [
        70,
        69
       ]
      }
     }
    },
    "zaaister-u14": {
     "naam": "zaaister-u14",
     "cel": [
      106,
      94
     ],
     "anker": [
      53,
      73
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
       "bestand": "zaaister-u14-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        42,
        79
       ],
       "anker": [
        21,
        70
       ]
      },
      "lopen": {
       "bestand": "zaaister-u14-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        80
       ],
       "anker": [
        22,
        69
       ]
      },
      "zaaien": {
       "bestand": "zaaister-u14-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        100,
        88
       ],
       "anker": [
        50,
        70
       ]
      }
     }
    },
    "wiedster-u14": {
     "naam": "wiedster-u14",
     "cel": [
      96,
      99
     ],
     "anker": [
      48,
      73
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
       "bestand": "wiedster-u14-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        56,
        83
       ],
       "anker": [
        28,
        70
       ]
      },
      "lopen": {
       "bestand": "wiedster-u14-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        80
       ],
       "anker": [
        42,
        69
       ]
      },
      "wieden": {
       "bestand": "wiedster-u14-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        90,
        92
       ],
       "anker": [
        45,
        69
       ]
      }
     }
    },
    "sprokkelaarster-u14": {
     "naam": "sprokkelaarster-u14",
     "cel": [
      72,
      103
     ],
     "anker": [
      36,
      84
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
       "bestand": "sprokkelaarster-u14-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        90
       ],
       "anker": [
        27,
        81
       ]
      },
      "lopen": {
       "bestand": "sprokkelaarster-u14-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        54,
        92
       ],
       "anker": [
        27,
        81
       ]
      },
      "rapen": {
       "bestand": "sprokkelaarster-u14-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        66,
        97
       ],
       "anker": [
        33,
        81
       ]
      }
     }
    },
    "hakster-u14": {
     "naam": "hakster-u14",
     "cel": [
      90,
      107
     ],
     "anker": [
      45,
      92
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
       "bestand": "hakster-u14-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        82
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "hakster-u14-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        58,
        88
       ],
       "anker": [
        29,
        77
       ]
      },
      "hakken": {
       "bestand": "hakster-u14-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        84,
        98
       ],
       "anker": [
        42,
        89
       ]
      }
     }
    },
    "plukster-u14": {
     "naam": "plukster-u14",
     "cel": [
      70,
      88
     ],
     "anker": [
      35,
      74
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
       "bestand": "plukster-u14-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        79
       ],
       "anker": [
        20,
        70
       ]
      },
      "lopen": {
       "bestand": "plukster-u14-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        80
       ],
       "anker": [
        22,
        69
       ]
      },
      "plukken": {
       "bestand": "plukster-u14-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        80
       ],
       "anker": [
        32,
        71
       ]
      }
     }
    },
    "binster-u14": {
     "naam": "binster-u14",
     "cel": [
      70,
      89
     ],
     "anker": [
      35,
      73
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
       "bestand": "binster-u14-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        79
       ],
       "anker": [
        19,
        70
       ]
      },
      "lopen": {
       "bestand": "binster-u14-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        80
       ],
       "anker": [
        22,
        69
       ]
      },
      "binden": {
       "bestand": "binster-u14-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        73
       ],
       "anker": [
        32,
        60
       ]
      }
     }
    },
    "draagster-u14": {
     "naam": "draagster-u14",
     "cel": [
      92,
      99
     ],
     "anker": [
      46,
      85
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
       "bestand": "draagster-u14-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        86,
        91
       ],
       "anker": [
        43,
        82
       ]
      },
      "lopen": {
       "bestand": "draagster-u14-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        86,
        93
       ],
       "anker": [
        43,
        82
       ]
      }
     }
    },
    "dorster-u14": {
     "naam": "dorster-u14",
     "cel": [
      160,
      149
     ],
     "anker": [
      80,
      111
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
       "bestand": "dorster-u14-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        79
       ],
       "anker": [
        26,
        70
       ]
      },
      "lopen": {
       "bestand": "dorster-u14-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        90
       ],
       "anker": [
        42,
        79
       ]
      },
      "dorsen": {
       "bestand": "dorster-u14-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        154,
        143
       ],
       "anker": [
        77,
        108
       ]
      }
     }
    },
    "zaagster-u14": {
     "naam": "zaagster-u14",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zaagster-u14-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "zaagster-u14-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        48,
        80
       ],
       "anker": [
        24,
        69
       ]
      },
      "zagen": {
       "bestand": "zaagster-u14-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        90
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boerin-u15": {
     "naam": "boerin-u15",
     "cel": [
      50,
      87
     ],
     "anker": [
      25,
      73
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
       "bestand": "boerin-u15-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        79
       ],
       "anker": [
        17,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u15-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      }
     }
    },
    "maaister-u15": {
     "naam": "maaister-u15",
     "cel": [
      146,
      114
     ],
     "anker": [
      73,
      72
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
       "bestand": "maaister-u15-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        140,
        108
       ],
       "anker": [
        70,
        69
       ]
      }
     }
    },
    "zaaister-u15": {
     "naam": "zaaister-u15",
     "cel": [
      106,
      94
     ],
     "anker": [
      53,
      73
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
       "bestand": "zaaister-u15-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        42,
        79
       ],
       "anker": [
        21,
        70
       ]
      },
      "lopen": {
       "bestand": "zaaister-u15-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "zaaien": {
       "bestand": "zaaister-u15-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        100,
        88
       ],
       "anker": [
        50,
        70
       ]
      }
     }
    },
    "wiedster-u15": {
     "naam": "wiedster-u15",
     "cel": [
      96,
      100
     ],
     "anker": [
      48,
      74
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
       "bestand": "wiedster-u15-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        56,
        84
       ],
       "anker": [
        28,
        71
       ]
      },
      "lopen": {
       "bestand": "wiedster-u15-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        81
       ],
       "anker": [
        42,
        70
       ]
      },
      "wieden": {
       "bestand": "wiedster-u15-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        90,
        93
       ],
       "anker": [
        45,
        70
       ]
      }
     }
    },
    "sprokkelaarster-u15": {
     "naam": "sprokkelaarster-u15",
     "cel": [
      72,
      103
     ],
     "anker": [
      36,
      84
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
       "bestand": "sprokkelaarster-u15-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        90
       ],
       "anker": [
        27,
        81
       ]
      },
      "lopen": {
       "bestand": "sprokkelaarster-u15-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        54,
        92
       ],
       "anker": [
        27,
        81
       ]
      },
      "rapen": {
       "bestand": "sprokkelaarster-u15-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        66,
        97
       ],
       "anker": [
        33,
        81
       ]
      }
     }
    },
    "hakster-u15": {
     "naam": "hakster-u15",
     "cel": [
      90,
      107
     ],
     "anker": [
      45,
      92
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
       "bestand": "hakster-u15-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        82
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "hakster-u15-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        58,
        88
       ],
       "anker": [
        29,
        77
       ]
      },
      "hakken": {
       "bestand": "hakster-u15-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        84,
        98
       ],
       "anker": [
        42,
        89
       ]
      }
     }
    },
    "plukster-u15": {
     "naam": "plukster-u15",
     "cel": [
      70,
      89
     ],
     "anker": [
      35,
      75
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
       "bestand": "plukster-u15-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        79
       ],
       "anker": [
        20,
        70
       ]
      },
      "lopen": {
       "bestand": "plukster-u15-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "plukken": {
       "bestand": "plukster-u15-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        81
       ],
       "anker": [
        32,
        72
       ]
      }
     }
    },
    "binster-u15": {
     "naam": "binster-u15",
     "cel": [
      70,
      89
     ],
     "anker": [
      35,
      73
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
       "bestand": "binster-u15-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        79
       ],
       "anker": [
        19,
        70
       ]
      },
      "lopen": {
       "bestand": "binster-u15-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "binden": {
       "bestand": "binster-u15-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        74
       ],
       "anker": [
        32,
        61
       ]
      }
     }
    },
    "draagster-u15": {
     "naam": "draagster-u15",
     "cel": [
      92,
      99
     ],
     "anker": [
      46,
      85
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
       "bestand": "draagster-u15-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        86,
        91
       ],
       "anker": [
        43,
        82
       ]
      },
      "lopen": {
       "bestand": "draagster-u15-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        86,
        93
       ],
       "anker": [
        43,
        82
       ]
      }
     }
    },
    "dorster-u15": {
     "naam": "dorster-u15",
     "cel": [
      160,
      149
     ],
     "anker": [
      80,
      111
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
       "bestand": "dorster-u15-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        79
       ],
       "anker": [
        26,
        70
       ]
      },
      "lopen": {
       "bestand": "dorster-u15-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        90
       ],
       "anker": [
        42,
        79
       ]
      },
      "dorsen": {
       "bestand": "dorster-u15-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        154,
        143
       ],
       "anker": [
        77,
        108
       ]
      }
     }
    },
    "zaagster-u15": {
     "naam": "zaagster-u15",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zaagster-u15-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "zaagster-u15-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        48,
        81
       ],
       "anker": [
        24,
        70
       ]
      },
      "zagen": {
       "bestand": "zaagster-u15-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        90
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boerin-u16": {
     "naam": "boerin-u16",
     "cel": [
      50,
      87
     ],
     "anker": [
      25,
      73
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
       "bestand": "boerin-u16-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        79
       ],
       "anker": [
        17,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u16-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      }
     }
    },
    "maaister-u16": {
     "naam": "maaister-u16",
     "cel": [
      146,
      114
     ],
     "anker": [
      73,
      72
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
       "bestand": "maaister-u16-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        140,
        108
       ],
       "anker": [
        70,
        69
       ]
      }
     }
    },
    "zaaister-u16": {
     "naam": "zaaister-u16",
     "cel": [
      106,
      95
     ],
     "anker": [
      53,
      74
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
       "bestand": "zaaister-u16-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        42,
        79
       ],
       "anker": [
        21,
        70
       ]
      },
      "lopen": {
       "bestand": "zaaister-u16-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "zaaien": {
       "bestand": "zaaister-u16-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        100,
        89
       ],
       "anker": [
        50,
        71
       ]
      }
     }
    },
    "wiedster-u16": {
     "naam": "wiedster-u16",
     "cel": [
      96,
      100
     ],
     "anker": [
      48,
      74
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
       "bestand": "wiedster-u16-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        56,
        84
       ],
       "anker": [
        28,
        71
       ]
      },
      "lopen": {
       "bestand": "wiedster-u16-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        81
       ],
       "anker": [
        42,
        70
       ]
      },
      "wieden": {
       "bestand": "wiedster-u16-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        90,
        93
       ],
       "anker": [
        45,
        70
       ]
      }
     }
    },
    "sprokkelaarster-u16": {
     "naam": "sprokkelaarster-u16",
     "cel": [
      72,
      103
     ],
     "anker": [
      36,
      84
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
       "bestand": "sprokkelaarster-u16-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        90
       ],
       "anker": [
        27,
        81
       ]
      },
      "lopen": {
       "bestand": "sprokkelaarster-u16-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        54,
        92
       ],
       "anker": [
        27,
        81
       ]
      },
      "rapen": {
       "bestand": "sprokkelaarster-u16-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        66,
        97
       ],
       "anker": [
        33,
        81
       ]
      }
     }
    },
    "hakster-u16": {
     "naam": "hakster-u16",
     "cel": [
      90,
      107
     ],
     "anker": [
      45,
      92
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
       "bestand": "hakster-u16-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        82
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "hakster-u16-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        58,
        88
       ],
       "anker": [
        29,
        77
       ]
      },
      "hakken": {
       "bestand": "hakster-u16-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        84,
        98
       ],
       "anker": [
        42,
        89
       ]
      }
     }
    },
    "plukster-u16": {
     "naam": "plukster-u16",
     "cel": [
      70,
      89
     ],
     "anker": [
      35,
      75
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
       "bestand": "plukster-u16-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        79
       ],
       "anker": [
        20,
        70
       ]
      },
      "lopen": {
       "bestand": "plukster-u16-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "plukken": {
       "bestand": "plukster-u16-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        81
       ],
       "anker": [
        32,
        72
       ]
      }
     }
    },
    "binster-u16": {
     "naam": "binster-u16",
     "cel": [
      70,
      89
     ],
     "anker": [
      35,
      73
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
       "bestand": "binster-u16-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        79
       ],
       "anker": [
        19,
        70
       ]
      },
      "lopen": {
       "bestand": "binster-u16-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "binden": {
       "bestand": "binster-u16-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        74
       ],
       "anker": [
        32,
        61
       ]
      }
     }
    },
    "draagster-u16": {
     "naam": "draagster-u16",
     "cel": [
      92,
      99
     ],
     "anker": [
      46,
      85
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
       "bestand": "draagster-u16-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        86,
        91
       ],
       "anker": [
        43,
        82
       ]
      },
      "lopen": {
       "bestand": "draagster-u16-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        86,
        93
       ],
       "anker": [
        43,
        82
       ]
      }
     }
    },
    "dorster-u16": {
     "naam": "dorster-u16",
     "cel": [
      160,
      149
     ],
     "anker": [
      80,
      111
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
       "bestand": "dorster-u16-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        79
       ],
       "anker": [
        26,
        70
       ]
      },
      "lopen": {
       "bestand": "dorster-u16-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        90
       ],
       "anker": [
        42,
        79
       ]
      },
      "dorsen": {
       "bestand": "dorster-u16-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        154,
        143
       ],
       "anker": [
        77,
        108
       ]
      }
     }
    },
    "zaagster-u16": {
     "naam": "zaagster-u16",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zaagster-u16-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "zaagster-u16-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        48,
        81
       ],
       "anker": [
        24,
        70
       ]
      },
      "zagen": {
       "bestand": "zaagster-u16-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        90
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boerin-u17": {
     "naam": "boerin-u17",
     "cel": [
      50,
      86
     ],
     "anker": [
      25,
      72
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
       "bestand": "boerin-u17-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        78
       ],
       "anker": [
        17,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u17-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      }
     }
    },
    "maaister-u17": {
     "naam": "maaister-u17",
     "cel": [
      146,
      113
     ],
     "anker": [
      73,
      71
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
       "bestand": "maaister-u17-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        140,
        107
       ],
       "anker": [
        70,
        68
       ]
      }
     }
    },
    "zaaister-u17": {
     "naam": "zaaister-u17",
     "cel": [
      106,
      93
     ],
     "anker": [
      53,
      72
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
       "bestand": "zaaister-u17-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        42,
        78
       ],
       "anker": [
        21,
        69
       ]
      },
      "lopen": {
       "bestand": "zaaister-u17-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "zaaien": {
       "bestand": "zaaister-u17-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        100,
        87
       ],
       "anker": [
        50,
        69
       ]
      }
     }
    },
    "wiedster-u17": {
     "naam": "wiedster-u17",
     "cel": [
      96,
      99
     ],
     "anker": [
      48,
      73
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
       "bestand": "wiedster-u17-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        56,
        83
       ],
       "anker": [
        28,
        70
       ]
      },
      "lopen": {
       "bestand": "wiedster-u17-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        80
       ],
       "anker": [
        42,
        69
       ]
      },
      "wieden": {
       "bestand": "wiedster-u17-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        90,
        92
       ],
       "anker": [
        45,
        69
       ]
      }
     }
    },
    "sprokkelaarster-u17": {
     "naam": "sprokkelaarster-u17",
     "cel": [
      72,
      103
     ],
     "anker": [
      36,
      84
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
       "bestand": "sprokkelaarster-u17-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        90
       ],
       "anker": [
        27,
        81
       ]
      },
      "lopen": {
       "bestand": "sprokkelaarster-u17-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        54,
        92
       ],
       "anker": [
        27,
        81
       ]
      },
      "rapen": {
       "bestand": "sprokkelaarster-u17-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        66,
        97
       ],
       "anker": [
        33,
        81
       ]
      }
     }
    },
    "hakster-u17": {
     "naam": "hakster-u17",
     "cel": [
      90,
      107
     ],
     "anker": [
      45,
      92
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
       "bestand": "hakster-u17-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        81
       ],
       "anker": [
        24,
        69
       ]
      },
      "lopen": {
       "bestand": "hakster-u17-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        58,
        88
       ],
       "anker": [
        29,
        77
       ]
      },
      "hakken": {
       "bestand": "hakster-u17-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        84,
        98
       ],
       "anker": [
        42,
        89
       ]
      }
     }
    },
    "plukster-u17": {
     "naam": "plukster-u17",
     "cel": [
      70,
      88
     ],
     "anker": [
      35,
      74
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
       "bestand": "plukster-u17-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        78
       ],
       "anker": [
        20,
        69
       ]
      },
      "lopen": {
       "bestand": "plukster-u17-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "plukken": {
       "bestand": "plukster-u17-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        80
       ],
       "anker": [
        32,
        71
       ]
      }
     }
    },
    "binster-u17": {
     "naam": "binster-u17",
     "cel": [
      70,
      88
     ],
     "anker": [
      35,
      72
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
       "bestand": "binster-u17-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        78
       ],
       "anker": [
        19,
        69
       ]
      },
      "lopen": {
       "bestand": "binster-u17-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "binden": {
       "bestand": "binster-u17-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        73
       ],
       "anker": [
        32,
        60
       ]
      }
     }
    },
    "draagster-u17": {
     "naam": "draagster-u17",
     "cel": [
      92,
      99
     ],
     "anker": [
      46,
      85
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
       "bestand": "draagster-u17-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        86,
        91
       ],
       "anker": [
        43,
        82
       ]
      },
      "lopen": {
       "bestand": "draagster-u17-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        86,
        93
       ],
       "anker": [
        43,
        82
       ]
      }
     }
    },
    "dorster-u17": {
     "naam": "dorster-u17",
     "cel": [
      160,
      149
     ],
     "anker": [
      80,
      111
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
       "bestand": "dorster-u17-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        78
       ],
       "anker": [
        26,
        69
       ]
      },
      "lopen": {
       "bestand": "dorster-u17-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        90
       ],
       "anker": [
        42,
        79
       ]
      },
      "dorsen": {
       "bestand": "dorster-u17-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        154,
        143
       ],
       "anker": [
        77,
        108
       ]
      }
     }
    },
    "zaagster-u17": {
     "naam": "zaagster-u17",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zaagster-u17-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        78
       ],
       "anker": [
        24,
        69
       ]
      },
      "lopen": {
       "bestand": "zaagster-u17-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        68
       ]
      },
      "zagen": {
       "bestand": "zaagster-u17-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        90
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boerin-u18": {
     "naam": "boerin-u18",
     "cel": [
      50,
      87
     ],
     "anker": [
      25,
      73
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
       "bestand": "boerin-u18-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        79
       ],
       "anker": [
        17,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u18-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        80
       ],
       "anker": [
        22,
        69
       ]
      }
     }
    },
    "maaister-u18": {
     "naam": "maaister-u18",
     "cel": [
      146,
      114
     ],
     "anker": [
      73,
      72
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
       "bestand": "maaister-u18-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        140,
        108
       ],
       "anker": [
        70,
        69
       ]
      }
     }
    },
    "zaaister-u18": {
     "naam": "zaaister-u18",
     "cel": [
      106,
      94
     ],
     "anker": [
      53,
      73
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
       "bestand": "zaaister-u18-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        42,
        79
       ],
       "anker": [
        21,
        70
       ]
      },
      "lopen": {
       "bestand": "zaaister-u18-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        80
       ],
       "anker": [
        22,
        69
       ]
      },
      "zaaien": {
       "bestand": "zaaister-u18-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        100,
        88
       ],
       "anker": [
        50,
        70
       ]
      }
     }
    },
    "wiedster-u18": {
     "naam": "wiedster-u18",
     "cel": [
      96,
      99
     ],
     "anker": [
      48,
      73
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
       "bestand": "wiedster-u18-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        56,
        83
       ],
       "anker": [
        28,
        70
       ]
      },
      "lopen": {
       "bestand": "wiedster-u18-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        80
       ],
       "anker": [
        42,
        69
       ]
      },
      "wieden": {
       "bestand": "wiedster-u18-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        90,
        92
       ],
       "anker": [
        45,
        69
       ]
      }
     }
    },
    "sprokkelaarster-u18": {
     "naam": "sprokkelaarster-u18",
     "cel": [
      72,
      103
     ],
     "anker": [
      36,
      84
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
       "bestand": "sprokkelaarster-u18-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        90
       ],
       "anker": [
        27,
        81
       ]
      },
      "lopen": {
       "bestand": "sprokkelaarster-u18-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        54,
        92
       ],
       "anker": [
        27,
        81
       ]
      },
      "rapen": {
       "bestand": "sprokkelaarster-u18-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        66,
        97
       ],
       "anker": [
        33,
        81
       ]
      }
     }
    },
    "hakster-u18": {
     "naam": "hakster-u18",
     "cel": [
      90,
      107
     ],
     "anker": [
      45,
      92
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
       "bestand": "hakster-u18-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        82
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "hakster-u18-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        58,
        88
       ],
       "anker": [
        29,
        77
       ]
      },
      "hakken": {
       "bestand": "hakster-u18-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        84,
        98
       ],
       "anker": [
        42,
        89
       ]
      }
     }
    },
    "plukster-u18": {
     "naam": "plukster-u18",
     "cel": [
      70,
      88
     ],
     "anker": [
      35,
      74
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
       "bestand": "plukster-u18-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        79
       ],
       "anker": [
        20,
        70
       ]
      },
      "lopen": {
       "bestand": "plukster-u18-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        80
       ],
       "anker": [
        22,
        69
       ]
      },
      "plukken": {
       "bestand": "plukster-u18-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        80
       ],
       "anker": [
        32,
        71
       ]
      }
     }
    },
    "binster-u18": {
     "naam": "binster-u18",
     "cel": [
      70,
      89
     ],
     "anker": [
      35,
      73
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
       "bestand": "binster-u18-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        79
       ],
       "anker": [
        19,
        70
       ]
      },
      "lopen": {
       "bestand": "binster-u18-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        80
       ],
       "anker": [
        22,
        69
       ]
      },
      "binden": {
       "bestand": "binster-u18-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        73
       ],
       "anker": [
        32,
        60
       ]
      }
     }
    },
    "draagster-u18": {
     "naam": "draagster-u18",
     "cel": [
      92,
      99
     ],
     "anker": [
      46,
      85
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
       "bestand": "draagster-u18-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        86,
        91
       ],
       "anker": [
        43,
        82
       ]
      },
      "lopen": {
       "bestand": "draagster-u18-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        86,
        93
       ],
       "anker": [
        43,
        82
       ]
      }
     }
    },
    "dorster-u18": {
     "naam": "dorster-u18",
     "cel": [
      160,
      149
     ],
     "anker": [
      80,
      111
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
       "bestand": "dorster-u18-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        79
       ],
       "anker": [
        26,
        70
       ]
      },
      "lopen": {
       "bestand": "dorster-u18-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        90
       ],
       "anker": [
        42,
        79
       ]
      },
      "dorsen": {
       "bestand": "dorster-u18-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        154,
        143
       ],
       "anker": [
        77,
        108
       ]
      }
     }
    },
    "zaagster-u18": {
     "naam": "zaagster-u18",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zaagster-u18-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "zaagster-u18-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        48,
        80
       ],
       "anker": [
        24,
        69
       ]
      },
      "zagen": {
       "bestand": "zaagster-u18-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        90
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boerin-u19": {
     "naam": "boerin-u19",
     "cel": [
      50,
      87
     ],
     "anker": [
      25,
      73
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
       "bestand": "boerin-u19-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        79
       ],
       "anker": [
        17,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u19-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      }
     }
    },
    "maaister-u19": {
     "naam": "maaister-u19",
     "cel": [
      146,
      114
     ],
     "anker": [
      73,
      72
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
       "bestand": "maaister-u19-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        140,
        108
       ],
       "anker": [
        70,
        69
       ]
      }
     }
    },
    "zaaister-u19": {
     "naam": "zaaister-u19",
     "cel": [
      106,
      94
     ],
     "anker": [
      53,
      73
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
       "bestand": "zaaister-u19-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        42,
        79
       ],
       "anker": [
        21,
        70
       ]
      },
      "lopen": {
       "bestand": "zaaister-u19-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "zaaien": {
       "bestand": "zaaister-u19-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        100,
        88
       ],
       "anker": [
        50,
        70
       ]
      }
     }
    },
    "wiedster-u19": {
     "naam": "wiedster-u19",
     "cel": [
      96,
      100
     ],
     "anker": [
      48,
      74
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
       "bestand": "wiedster-u19-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        56,
        84
       ],
       "anker": [
        28,
        71
       ]
      },
      "lopen": {
       "bestand": "wiedster-u19-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        81
       ],
       "anker": [
        42,
        70
       ]
      },
      "wieden": {
       "bestand": "wiedster-u19-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        90,
        93
       ],
       "anker": [
        45,
        70
       ]
      }
     }
    },
    "sprokkelaarster-u19": {
     "naam": "sprokkelaarster-u19",
     "cel": [
      72,
      103
     ],
     "anker": [
      36,
      84
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
       "bestand": "sprokkelaarster-u19-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        90
       ],
       "anker": [
        27,
        81
       ]
      },
      "lopen": {
       "bestand": "sprokkelaarster-u19-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        54,
        92
       ],
       "anker": [
        27,
        81
       ]
      },
      "rapen": {
       "bestand": "sprokkelaarster-u19-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        66,
        97
       ],
       "anker": [
        33,
        81
       ]
      }
     }
    },
    "hakster-u19": {
     "naam": "hakster-u19",
     "cel": [
      90,
      107
     ],
     "anker": [
      45,
      92
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
       "bestand": "hakster-u19-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        82
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "hakster-u19-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        58,
        88
       ],
       "anker": [
        29,
        77
       ]
      },
      "hakken": {
       "bestand": "hakster-u19-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        84,
        98
       ],
       "anker": [
        42,
        89
       ]
      }
     }
    },
    "plukster-u19": {
     "naam": "plukster-u19",
     "cel": [
      70,
      89
     ],
     "anker": [
      35,
      75
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
       "bestand": "plukster-u19-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        79
       ],
       "anker": [
        20,
        70
       ]
      },
      "lopen": {
       "bestand": "plukster-u19-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "plukken": {
       "bestand": "plukster-u19-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        81
       ],
       "anker": [
        32,
        72
       ]
      }
     }
    },
    "binster-u19": {
     "naam": "binster-u19",
     "cel": [
      70,
      89
     ],
     "anker": [
      35,
      73
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
       "bestand": "binster-u19-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        79
       ],
       "anker": [
        19,
        70
       ]
      },
      "lopen": {
       "bestand": "binster-u19-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "binden": {
       "bestand": "binster-u19-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        74
       ],
       "anker": [
        32,
        61
       ]
      }
     }
    },
    "draagster-u19": {
     "naam": "draagster-u19",
     "cel": [
      92,
      99
     ],
     "anker": [
      46,
      85
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
       "bestand": "draagster-u19-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        86,
        91
       ],
       "anker": [
        43,
        82
       ]
      },
      "lopen": {
       "bestand": "draagster-u19-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        86,
        93
       ],
       "anker": [
        43,
        82
       ]
      }
     }
    },
    "dorster-u19": {
     "naam": "dorster-u19",
     "cel": [
      160,
      149
     ],
     "anker": [
      80,
      111
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
       "bestand": "dorster-u19-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        79
       ],
       "anker": [
        26,
        70
       ]
      },
      "lopen": {
       "bestand": "dorster-u19-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        90
       ],
       "anker": [
        42,
        79
       ]
      },
      "dorsen": {
       "bestand": "dorster-u19-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        154,
        143
       ],
       "anker": [
        77,
        108
       ]
      }
     }
    },
    "zaagster-u19": {
     "naam": "zaagster-u19",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zaagster-u19-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "zaagster-u19-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        48,
        81
       ],
       "anker": [
        24,
        70
       ]
      },
      "zagen": {
       "bestand": "zaagster-u19-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        90
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boerin-u20": {
     "naam": "boerin-u20",
     "cel": [
      50,
      86
     ],
     "anker": [
      25,
      72
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
       "bestand": "boerin-u20-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        78
       ],
       "anker": [
        17,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u20-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      }
     }
    },
    "maaister-u20": {
     "naam": "maaister-u20",
     "cel": [
      146,
      113
     ],
     "anker": [
      73,
      71
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
       "bestand": "maaister-u20-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        140,
        107
       ],
       "anker": [
        70,
        68
       ]
      }
     }
    },
    "zaaister-u20": {
     "naam": "zaaister-u20",
     "cel": [
      106,
      93
     ],
     "anker": [
      53,
      72
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
       "bestand": "zaaister-u20-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        42,
        78
       ],
       "anker": [
        21,
        69
       ]
      },
      "lopen": {
       "bestand": "zaaister-u20-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "zaaien": {
       "bestand": "zaaister-u20-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        100,
        87
       ],
       "anker": [
        50,
        69
       ]
      }
     }
    },
    "wiedster-u20": {
     "naam": "wiedster-u20",
     "cel": [
      96,
      99
     ],
     "anker": [
      48,
      73
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
       "bestand": "wiedster-u20-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        56,
        83
       ],
       "anker": [
        28,
        70
       ]
      },
      "lopen": {
       "bestand": "wiedster-u20-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        80
       ],
       "anker": [
        42,
        69
       ]
      },
      "wieden": {
       "bestand": "wiedster-u20-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        90,
        92
       ],
       "anker": [
        45,
        69
       ]
      }
     }
    },
    "sprokkelaarster-u20": {
     "naam": "sprokkelaarster-u20",
     "cel": [
      72,
      103
     ],
     "anker": [
      36,
      84
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
       "bestand": "sprokkelaarster-u20-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        90
       ],
       "anker": [
        27,
        81
       ]
      },
      "lopen": {
       "bestand": "sprokkelaarster-u20-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        54,
        92
       ],
       "anker": [
        27,
        81
       ]
      },
      "rapen": {
       "bestand": "sprokkelaarster-u20-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        66,
        97
       ],
       "anker": [
        33,
        81
       ]
      }
     }
    },
    "hakster-u20": {
     "naam": "hakster-u20",
     "cel": [
      90,
      107
     ],
     "anker": [
      45,
      92
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
       "bestand": "hakster-u20-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        81
       ],
       "anker": [
        24,
        69
       ]
      },
      "lopen": {
       "bestand": "hakster-u20-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        58,
        88
       ],
       "anker": [
        29,
        77
       ]
      },
      "hakken": {
       "bestand": "hakster-u20-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        84,
        98
       ],
       "anker": [
        42,
        89
       ]
      }
     }
    },
    "plukster-u20": {
     "naam": "plukster-u20",
     "cel": [
      70,
      88
     ],
     "anker": [
      35,
      74
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
       "bestand": "plukster-u20-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        78
       ],
       "anker": [
        20,
        69
       ]
      },
      "lopen": {
       "bestand": "plukster-u20-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "plukken": {
       "bestand": "plukster-u20-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        80
       ],
       "anker": [
        32,
        71
       ]
      }
     }
    },
    "binster-u20": {
     "naam": "binster-u20",
     "cel": [
      70,
      88
     ],
     "anker": [
      35,
      72
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
       "bestand": "binster-u20-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        78
       ],
       "anker": [
        19,
        69
       ]
      },
      "lopen": {
       "bestand": "binster-u20-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "binden": {
       "bestand": "binster-u20-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        73
       ],
       "anker": [
        32,
        60
       ]
      }
     }
    },
    "draagster-u20": {
     "naam": "draagster-u20",
     "cel": [
      92,
      99
     ],
     "anker": [
      46,
      85
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
       "bestand": "draagster-u20-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        86,
        91
       ],
       "anker": [
        43,
        82
       ]
      },
      "lopen": {
       "bestand": "draagster-u20-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        86,
        93
       ],
       "anker": [
        43,
        82
       ]
      }
     }
    },
    "dorster-u20": {
     "naam": "dorster-u20",
     "cel": [
      160,
      149
     ],
     "anker": [
      80,
      111
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
       "bestand": "dorster-u20-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        78
       ],
       "anker": [
        26,
        69
       ]
      },
      "lopen": {
       "bestand": "dorster-u20-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        90
       ],
       "anker": [
        42,
        79
       ]
      },
      "dorsen": {
       "bestand": "dorster-u20-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        154,
        143
       ],
       "anker": [
        77,
        108
       ]
      }
     }
    },
    "zaagster-u20": {
     "naam": "zaagster-u20",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zaagster-u20-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        78
       ],
       "anker": [
        24,
        69
       ]
      },
      "lopen": {
       "bestand": "zaagster-u20-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        68
       ]
      },
      "zagen": {
       "bestand": "zaagster-u20-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        90
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boerin-u21": {
     "naam": "boerin-u21",
     "cel": [
      50,
      86
     ],
     "anker": [
      25,
      72
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
       "bestand": "boerin-u21-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        78
       ],
       "anker": [
        19,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u21-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      }
     }
    },
    "maaister-u21": {
     "naam": "maaister-u21",
     "cel": [
      146,
      113
     ],
     "anker": [
      73,
      71
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
       "bestand": "maaister-u21-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        140,
        107
       ],
       "anker": [
        70,
        68
       ]
      }
     }
    },
    "zaaister-u21": {
     "naam": "zaaister-u21",
     "cel": [
      106,
      93
     ],
     "anker": [
      53,
      72
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
       "bestand": "zaaister-u21-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        42,
        78
       ],
       "anker": [
        21,
        69
       ]
      },
      "lopen": {
       "bestand": "zaaister-u21-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "zaaien": {
       "bestand": "zaaister-u21-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        100,
        87
       ],
       "anker": [
        50,
        69
       ]
      }
     }
    },
    "wiedster-u21": {
     "naam": "wiedster-u21",
     "cel": [
      96,
      99
     ],
     "anker": [
      48,
      73
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
       "bestand": "wiedster-u21-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        56,
        83
       ],
       "anker": [
        28,
        70
       ]
      },
      "lopen": {
       "bestand": "wiedster-u21-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        80
       ],
       "anker": [
        42,
        69
       ]
      },
      "wieden": {
       "bestand": "wiedster-u21-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        90,
        92
       ],
       "anker": [
        45,
        69
       ]
      }
     }
    },
    "sprokkelaarster-u21": {
     "naam": "sprokkelaarster-u21",
     "cel": [
      72,
      103
     ],
     "anker": [
      36,
      84
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
       "bestand": "sprokkelaarster-u21-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        90
       ],
       "anker": [
        27,
        81
       ]
      },
      "lopen": {
       "bestand": "sprokkelaarster-u21-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        54,
        92
       ],
       "anker": [
        27,
        81
       ]
      },
      "rapen": {
       "bestand": "sprokkelaarster-u21-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        66,
        97
       ],
       "anker": [
        33,
        81
       ]
      }
     }
    },
    "hakster-u21": {
     "naam": "hakster-u21",
     "cel": [
      90,
      107
     ],
     "anker": [
      45,
      92
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
       "bestand": "hakster-u21-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        81
       ],
       "anker": [
        24,
        69
       ]
      },
      "lopen": {
       "bestand": "hakster-u21-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        58,
        88
       ],
       "anker": [
        29,
        77
       ]
      },
      "hakken": {
       "bestand": "hakster-u21-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        84,
        98
       ],
       "anker": [
        42,
        89
       ]
      }
     }
    },
    "plukster-u21": {
     "naam": "plukster-u21",
     "cel": [
      70,
      88
     ],
     "anker": [
      35,
      74
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
       "bestand": "plukster-u21-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        78
       ],
       "anker": [
        20,
        69
       ]
      },
      "lopen": {
       "bestand": "plukster-u21-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "plukken": {
       "bestand": "plukster-u21-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        80
       ],
       "anker": [
        32,
        71
       ]
      }
     }
    },
    "binster-u21": {
     "naam": "binster-u21",
     "cel": [
      70,
      88
     ],
     "anker": [
      35,
      72
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
       "bestand": "binster-u21-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        78
       ],
       "anker": [
        19,
        69
       ]
      },
      "lopen": {
       "bestand": "binster-u21-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "binden": {
       "bestand": "binster-u21-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        73
       ],
       "anker": [
        32,
        60
       ]
      }
     }
    },
    "draagster-u21": {
     "naam": "draagster-u21",
     "cel": [
      92,
      99
     ],
     "anker": [
      46,
      85
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
       "bestand": "draagster-u21-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        86,
        91
       ],
       "anker": [
        43,
        82
       ]
      },
      "lopen": {
       "bestand": "draagster-u21-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        86,
        93
       ],
       "anker": [
        43,
        82
       ]
      }
     }
    },
    "dorster-u21": {
     "naam": "dorster-u21",
     "cel": [
      160,
      149
     ],
     "anker": [
      80,
      111
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
       "bestand": "dorster-u21-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        78
       ],
       "anker": [
        26,
        69
       ]
      },
      "lopen": {
       "bestand": "dorster-u21-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        90
       ],
       "anker": [
        42,
        79
       ]
      },
      "dorsen": {
       "bestand": "dorster-u21-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        154,
        143
       ],
       "anker": [
        77,
        108
       ]
      }
     }
    },
    "zaagster-u21": {
     "naam": "zaagster-u21",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zaagster-u21-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        78
       ],
       "anker": [
        24,
        69
       ]
      },
      "lopen": {
       "bestand": "zaagster-u21-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        68
       ]
      },
      "zagen": {
       "bestand": "zaagster-u21-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        90
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boerin-u22": {
     "naam": "boerin-u22",
     "cel": [
      50,
      87
     ],
     "anker": [
      25,
      73
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
       "bestand": "boerin-u22-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        79
       ],
       "anker": [
        17,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u22-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      }
     }
    },
    "maaister-u22": {
     "naam": "maaister-u22",
     "cel": [
      146,
      114
     ],
     "anker": [
      73,
      72
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
       "bestand": "maaister-u22-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        140,
        108
       ],
       "anker": [
        70,
        69
       ]
      }
     }
    },
    "zaaister-u22": {
     "naam": "zaaister-u22",
     "cel": [
      106,
      95
     ],
     "anker": [
      53,
      74
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
       "bestand": "zaaister-u22-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        42,
        79
       ],
       "anker": [
        21,
        70
       ]
      },
      "lopen": {
       "bestand": "zaaister-u22-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "zaaien": {
       "bestand": "zaaister-u22-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        100,
        89
       ],
       "anker": [
        50,
        71
       ]
      }
     }
    },
    "wiedster-u22": {
     "naam": "wiedster-u22",
     "cel": [
      96,
      100
     ],
     "anker": [
      48,
      74
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
       "bestand": "wiedster-u22-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        56,
        84
       ],
       "anker": [
        28,
        71
       ]
      },
      "lopen": {
       "bestand": "wiedster-u22-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        81
       ],
       "anker": [
        42,
        70
       ]
      },
      "wieden": {
       "bestand": "wiedster-u22-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        90,
        93
       ],
       "anker": [
        45,
        70
       ]
      }
     }
    },
    "sprokkelaarster-u22": {
     "naam": "sprokkelaarster-u22",
     "cel": [
      72,
      103
     ],
     "anker": [
      36,
      84
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
       "bestand": "sprokkelaarster-u22-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        90
       ],
       "anker": [
        27,
        81
       ]
      },
      "lopen": {
       "bestand": "sprokkelaarster-u22-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        54,
        92
       ],
       "anker": [
        27,
        81
       ]
      },
      "rapen": {
       "bestand": "sprokkelaarster-u22-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        66,
        97
       ],
       "anker": [
        33,
        81
       ]
      }
     }
    },
    "hakster-u22": {
     "naam": "hakster-u22",
     "cel": [
      90,
      107
     ],
     "anker": [
      45,
      92
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
       "bestand": "hakster-u22-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        82
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "hakster-u22-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        58,
        88
       ],
       "anker": [
        29,
        77
       ]
      },
      "hakken": {
       "bestand": "hakster-u22-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        84,
        98
       ],
       "anker": [
        42,
        89
       ]
      }
     }
    },
    "plukster-u22": {
     "naam": "plukster-u22",
     "cel": [
      70,
      89
     ],
     "anker": [
      35,
      75
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
       "bestand": "plukster-u22-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        79
       ],
       "anker": [
        20,
        70
       ]
      },
      "lopen": {
       "bestand": "plukster-u22-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "plukken": {
       "bestand": "plukster-u22-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        81
       ],
       "anker": [
        32,
        72
       ]
      }
     }
    },
    "binster-u22": {
     "naam": "binster-u22",
     "cel": [
      70,
      89
     ],
     "anker": [
      35,
      73
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
       "bestand": "binster-u22-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        79
       ],
       "anker": [
        19,
        70
       ]
      },
      "lopen": {
       "bestand": "binster-u22-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      },
      "binden": {
       "bestand": "binster-u22-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        74
       ],
       "anker": [
        32,
        61
       ]
      }
     }
    },
    "draagster-u22": {
     "naam": "draagster-u22",
     "cel": [
      92,
      99
     ],
     "anker": [
      46,
      85
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
       "bestand": "draagster-u22-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        86,
        91
       ],
       "anker": [
        43,
        82
       ]
      },
      "lopen": {
       "bestand": "draagster-u22-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        86,
        93
       ],
       "anker": [
        43,
        82
       ]
      }
     }
    },
    "dorster-u22": {
     "naam": "dorster-u22",
     "cel": [
      160,
      149
     ],
     "anker": [
      80,
      111
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
       "bestand": "dorster-u22-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        79
       ],
       "anker": [
        26,
        70
       ]
      },
      "lopen": {
       "bestand": "dorster-u22-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        90
       ],
       "anker": [
        42,
        79
       ]
      },
      "dorsen": {
       "bestand": "dorster-u22-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        154,
        143
       ],
       "anker": [
        77,
        108
       ]
      }
     }
    },
    "zaagster-u22": {
     "naam": "zaagster-u22",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zaagster-u22-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        70
       ]
      },
      "lopen": {
       "bestand": "zaagster-u22-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        48,
        81
       ],
       "anker": [
        24,
        70
       ]
      },
      "zagen": {
       "bestand": "zaagster-u22-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        90
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "boerin-u23": {
     "naam": "boerin-u23",
     "cel": [
      50,
      86
     ],
     "anker": [
      25,
      72
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
       "bestand": "boerin-u23-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        78
       ],
       "anker": [
        18,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u23-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      }
     }
    },
    "maaister-u23": {
     "naam": "maaister-u23",
     "cel": [
      146,
      113
     ],
     "anker": [
      73,
      71
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
       "bestand": "maaister-u23-maaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        140,
        107
       ],
       "anker": [
        70,
        68
       ]
      }
     }
    },
    "zaaister-u23": {
     "naam": "zaaister-u23",
     "cel": [
      106,
      93
     ],
     "anker": [
      53,
      72
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
       "bestand": "zaaister-u23-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        42,
        78
       ],
       "anker": [
        21,
        69
       ]
      },
      "lopen": {
       "bestand": "zaaister-u23-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "zaaien": {
       "bestand": "zaaister-u23-zaaien.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        100,
        87
       ],
       "anker": [
        50,
        69
       ]
      }
     }
    },
    "wiedster-u23": {
     "naam": "wiedster-u23",
     "cel": [
      96,
      99
     ],
     "anker": [
      48,
      73
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
       "bestand": "wiedster-u23-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        56,
        83
       ],
       "anker": [
        28,
        70
       ]
      },
      "lopen": {
       "bestand": "wiedster-u23-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        80
       ],
       "anker": [
        42,
        69
       ]
      },
      "wieden": {
       "bestand": "wiedster-u23-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        90,
        92
       ],
       "anker": [
        45,
        69
       ]
      }
     }
    },
    "sprokkelaarster-u23": {
     "naam": "sprokkelaarster-u23",
     "cel": [
      72,
      103
     ],
     "anker": [
      36,
      84
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
       "bestand": "sprokkelaarster-u23-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        54,
        90
       ],
       "anker": [
        27,
        81
       ]
      },
      "lopen": {
       "bestand": "sprokkelaarster-u23-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        54,
        92
       ],
       "anker": [
        27,
        81
       ]
      },
      "rapen": {
       "bestand": "sprokkelaarster-u23-rapen.png",
       "beelden": 16,
       "fps": 8,
       "herhaal": true,
       "cel": [
        66,
        97
       ],
       "anker": [
        33,
        81
       ]
      }
     }
    },
    "hakster-u23": {
     "naam": "hakster-u23",
     "cel": [
      90,
      107
     ],
     "anker": [
      45,
      92
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
       "bestand": "hakster-u23-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        81
       ],
       "anker": [
        24,
        69
       ]
      },
      "lopen": {
       "bestand": "hakster-u23-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        58,
        88
       ],
       "anker": [
        29,
        77
       ]
      },
      "hakken": {
       "bestand": "hakster-u23-hakken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        84,
        98
       ],
       "anker": [
        42,
        89
       ]
      }
     }
    },
    "plukster-u23": {
     "naam": "plukster-u23",
     "cel": [
      70,
      88
     ],
     "anker": [
      35,
      74
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
       "bestand": "plukster-u23-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        78
       ],
       "anker": [
        20,
        69
       ]
      },
      "lopen": {
       "bestand": "plukster-u23-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "plukken": {
       "bestand": "plukster-u23-plukken.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        80
       ],
       "anker": [
        32,
        71
       ]
      }
     }
    },
    "binster-u23": {
     "naam": "binster-u23",
     "cel": [
      70,
      88
     ],
     "anker": [
      35,
      72
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
       "bestand": "binster-u23-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        78
       ],
       "anker": [
        19,
        69
       ]
      },
      "lopen": {
       "bestand": "binster-u23-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      },
      "binden": {
       "bestand": "binster-u23-binden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        64,
        73
       ],
       "anker": [
        32,
        60
       ]
      }
     }
    },
    "draagster-u23": {
     "naam": "draagster-u23",
     "cel": [
      92,
      99
     ],
     "anker": [
      46,
      85
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
       "bestand": "draagster-u23-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        86,
        91
       ],
       "anker": [
        43,
        82
       ]
      },
      "lopen": {
       "bestand": "draagster-u23-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        86,
        93
       ],
       "anker": [
        43,
        82
       ]
      }
     }
    },
    "dorster-u23": {
     "naam": "dorster-u23",
     "cel": [
      160,
      149
     ],
     "anker": [
      80,
      111
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
       "bestand": "dorster-u23-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        78
       ],
       "anker": [
        26,
        69
       ]
      },
      "lopen": {
       "bestand": "dorster-u23-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        84,
        90
       ],
       "anker": [
        42,
        79
       ]
      },
      "dorsen": {
       "bestand": "dorster-u23-dorsen.png",
       "beelden": 12,
       "fps": 10,
       "herhaal": true,
       "cel": [
        154,
        143
       ],
       "anker": [
        77,
        108
       ]
      }
     }
    },
    "zaagster-u23": {
     "naam": "zaagster-u23",
     "cel": [
      116,
      98
     ],
     "anker": [
      58,
      84
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
       "bestand": "zaagster-u23-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        78
       ],
       "anker": [
        24,
        69
       ]
      },
      "lopen": {
       "bestand": "zaagster-u23-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        48,
        79
       ],
       "anker": [
        24,
        68
       ]
      },
      "zagen": {
       "bestand": "zaagster-u23-zagen.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        110,
        90
       ],
       "anker": [
        55,
        81
       ]
      }
     }
    },
    "jongen-u0": {
     "naam": "jongen-u0",
     "cel": [
      48,
      74
     ],
     "anker": [
      24,
      62
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
       "bestand": "jongen-u0-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        30,
        63
       ],
       "anker": [
        15,
        59
       ]
      },
      "lopen": {
       "bestand": "jongen-u0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.3,
       "stap": 0.52,
       "cel": [
        42,
        68
       ],
       "anker": [
        21,
        59
       ]
      }
     }
    },
    "jongen-u1": {
     "naam": "jongen-u1",
     "cel": [
      44,
      70
     ],
     "anker": [
      22,
      58
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
       "bestand": "jongen-u1-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        28,
        59
       ],
       "anker": [
        14,
        55
       ]
      },
      "lopen": {
       "bestand": "jongen-u1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.3,
       "stap": 0.52,
       "cel": [
        38,
        63
       ],
       "anker": [
        19,
        54
       ]
      }
     }
    },
    "jongen-u2": {
     "naam": "jongen-u2",
     "cel": [
      44,
      73
     ],
     "anker": [
      22,
      61
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
       "bestand": "jongen-u2-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        30,
        62
       ],
       "anker": [
        15,
        58
       ]
      },
      "lopen": {
       "bestand": "jongen-u2-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.3,
       "stap": 0.52,
       "cel": [
        38,
        66
       ],
       "anker": [
        19,
        57
       ]
      }
     }
    },
    "jongen-u3": {
     "naam": "jongen-u3",
     "cel": [
      48,
      74
     ],
     "anker": [
      24,
      62
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
       "bestand": "jongen-u3-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        30,
        63
       ],
       "anker": [
        15,
        59
       ]
      },
      "lopen": {
       "bestand": "jongen-u3-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.3,
       "stap": 0.52,
       "cel": [
        42,
        68
       ],
       "anker": [
        21,
        59
       ]
      }
     }
    },
    "jongen-u4": {
     "naam": "jongen-u4",
     "cel": [
      44,
      70
     ],
     "anker": [
      22,
      58
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
       "bestand": "jongen-u4-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        28,
        59
       ],
       "anker": [
        14,
        55
       ]
      },
      "lopen": {
       "bestand": "jongen-u4-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.3,
       "stap": 0.52,
       "cel": [
        38,
        63
       ],
       "anker": [
        19,
        54
       ]
      }
     }
    },
    "jongen-u5": {
     "naam": "jongen-u5",
     "cel": [
      44,
      73
     ],
     "anker": [
      22,
      61
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
       "bestand": "jongen-u5-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        30,
        62
       ],
       "anker": [
        15,
        58
       ]
      },
      "lopen": {
       "bestand": "jongen-u5-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.3,
       "stap": 0.52,
       "cel": [
        38,
        66
       ],
       "anker": [
        19,
        57
       ]
      }
     }
    },
    "jongen-u6": {
     "naam": "jongen-u6",
     "cel": [
      44,
      70
     ],
     "anker": [
      22,
      58
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
       "bestand": "jongen-u6-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        30,
        59
       ],
       "anker": [
        15,
        55
       ]
      },
      "lopen": {
       "bestand": "jongen-u6-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.3,
       "stap": 0.52,
       "cel": [
        38,
        63
       ],
       "anker": [
        19,
        54
       ]
      }
     }
    },
    "jongen-u7": {
     "naam": "jongen-u7",
     "cel": [
      48,
      74
     ],
     "anker": [
      24,
      62
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
       "bestand": "jongen-u7-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        30,
        63
       ],
       "anker": [
        15,
        59
       ]
      },
      "lopen": {
       "bestand": "jongen-u7-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.3,
       "stap": 0.52,
       "cel": [
        42,
        68
       ],
       "anker": [
        21,
        59
       ]
      }
     }
    },
    "jongen-u8": {
     "naam": "jongen-u8",
     "cel": [
      44,
      70
     ],
     "anker": [
      22,
      58
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
       "bestand": "jongen-u8-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        28,
        59
       ],
       "anker": [
        14,
        55
       ]
      },
      "lopen": {
       "bestand": "jongen-u8-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.3,
       "stap": 0.52,
       "cel": [
        38,
        64
       ],
       "anker": [
        19,
        55
       ]
      }
     }
    },
    "jongen-u9": {
     "naam": "jongen-u9",
     "cel": [
      44,
      70
     ],
     "anker": [
      22,
      58
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
       "bestand": "jongen-u9-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        30,
        59
       ],
       "anker": [
        15,
        55
       ]
      },
      "lopen": {
       "bestand": "jongen-u9-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.3,
       "stap": 0.52,
       "cel": [
        38,
        63
       ],
       "anker": [
        19,
        54
       ]
      }
     }
    },
    "jongen-u10": {
     "naam": "jongen-u10",
     "cel": [
      44,
      73
     ],
     "anker": [
      22,
      61
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
       "bestand": "jongen-u10-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        30,
        62
       ],
       "anker": [
        15,
        58
       ]
      },
      "lopen": {
       "bestand": "jongen-u10-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.3,
       "stap": 0.52,
       "cel": [
        38,
        66
       ],
       "anker": [
        19,
        57
       ]
      }
     }
    },
    "jongen-u11": {
     "naam": "jongen-u11",
     "cel": [
      44,
      70
     ],
     "anker": [
      22,
      58
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
       "bestand": "jongen-u11-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        30,
        59
       ],
       "anker": [
        15,
        55
       ]
      },
      "lopen": {
       "bestand": "jongen-u11-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.3,
       "stap": 0.52,
       "cel": [
        38,
        63
       ],
       "anker": [
        19,
        54
       ]
      }
     }
    },
    "meisje-u0": {
     "naam": "meisje-u0",
     "cel": [
      42,
      68
     ],
     "anker": [
      21,
      56
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
       "bestand": "meisje-u0-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        30,
        56
       ],
       "anker": [
        15,
        53
       ]
      },
      "lopen": {
       "bestand": "meisje-u0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.25,
       "stap": 0.5,
       "cel": [
        36,
        61
       ],
       "anker": [
        18,
        52
       ]
      }
     }
    },
    "meisje-u1": {
     "naam": "meisje-u1",
     "cel": [
      42,
      68
     ],
     "anker": [
      21,
      56
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
       "bestand": "meisje-u1-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        26,
        56
       ],
       "anker": [
        13,
        53
       ]
      },
      "lopen": {
       "bestand": "meisje-u1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.25,
       "stap": 0.5,
       "cel": [
        36,
        61
       ],
       "anker": [
        18,
        52
       ]
      }
     }
    },
    "meisje-u2": {
     "naam": "meisje-u2",
     "cel": [
      42,
      68
     ],
     "anker": [
      21,
      56
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
       "bestand": "meisje-u2-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        28,
        56
       ],
       "anker": [
        14,
        53
       ]
      },
      "lopen": {
       "bestand": "meisje-u2-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.25,
       "stap": 0.5,
       "cel": [
        36,
        61
       ],
       "anker": [
        18,
        52
       ]
      }
     }
    },
    "meisje-u3": {
     "naam": "meisje-u3",
     "cel": [
      42,
      68
     ],
     "anker": [
      21,
      56
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
       "bestand": "meisje-u3-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        26,
        56
       ],
       "anker": [
        13,
        53
       ]
      },
      "lopen": {
       "bestand": "meisje-u3-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.25,
       "stap": 0.5,
       "cel": [
        36,
        61
       ],
       "anker": [
        18,
        52
       ]
      }
     }
    },
    "meisje-u4": {
     "naam": "meisje-u4",
     "cel": [
      42,
      68
     ],
     "anker": [
      21,
      56
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
       "bestand": "meisje-u4-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        30,
        56
       ],
       "anker": [
        15,
        53
       ]
      },
      "lopen": {
       "bestand": "meisje-u4-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.25,
       "stap": 0.5,
       "cel": [
        36,
        61
       ],
       "anker": [
        18,
        52
       ]
      }
     }
    },
    "meisje-u5": {
     "naam": "meisje-u5",
     "cel": [
      42,
      68
     ],
     "anker": [
      21,
      56
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
       "bestand": "meisje-u5-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        26,
        56
       ],
       "anker": [
        13,
        53
       ]
      },
      "lopen": {
       "bestand": "meisje-u5-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.25,
       "stap": 0.5,
       "cel": [
        36,
        61
       ],
       "anker": [
        18,
        52
       ]
      }
     }
    },
    "meisje-u6": {
     "naam": "meisje-u6",
     "cel": [
      42,
      68
     ],
     "anker": [
      21,
      56
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
       "bestand": "meisje-u6-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        28,
        56
       ],
       "anker": [
        14,
        53
       ]
      },
      "lopen": {
       "bestand": "meisje-u6-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.25,
       "stap": 0.5,
       "cel": [
        36,
        61
       ],
       "anker": [
        18,
        52
       ]
      }
     }
    },
    "meisje-u7": {
     "naam": "meisje-u7",
     "cel": [
      42,
      68
     ],
     "anker": [
      21,
      56
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
       "bestand": "meisje-u7-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        26,
        56
       ],
       "anker": [
        13,
        53
       ]
      },
      "lopen": {
       "bestand": "meisje-u7-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.25,
       "stap": 0.5,
       "cel": [
        36,
        61
       ],
       "anker": [
        18,
        52
       ]
      }
     }
    },
    "meisje-u8": {
     "naam": "meisje-u8",
     "cel": [
      42,
      68
     ],
     "anker": [
      21,
      56
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
       "bestand": "meisje-u8-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        30,
        56
       ],
       "anker": [
        15,
        53
       ]
      },
      "lopen": {
       "bestand": "meisje-u8-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.25,
       "stap": 0.5,
       "cel": [
        36,
        61
       ],
       "anker": [
        18,
        52
       ]
      }
     }
    },
    "meisje-u9": {
     "naam": "meisje-u9",
     "cel": [
      42,
      68
     ],
     "anker": [
      21,
      56
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
       "bestand": "meisje-u9-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        28,
        56
       ],
       "anker": [
        14,
        53
       ]
      },
      "lopen": {
       "bestand": "meisje-u9-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.25,
       "stap": 0.5,
       "cel": [
        36,
        61
       ],
       "anker": [
        18,
        52
       ]
      }
     }
    },
    "meisje-u10": {
     "naam": "meisje-u10",
     "cel": [
      42,
      68
     ],
     "anker": [
      21,
      56
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
       "bestand": "meisje-u10-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        28,
        56
       ],
       "anker": [
        14,
        53
       ]
      },
      "lopen": {
       "bestand": "meisje-u10-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.25,
       "stap": 0.5,
       "cel": [
        36,
        61
       ],
       "anker": [
        18,
        52
       ]
      }
     }
    },
    "meisje-u11": {
     "naam": "meisje-u11",
     "cel": [
      42,
      68
     ],
     "anker": [
      21,
      56
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
       "bestand": "meisje-u11-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        26,
        56
       ],
       "anker": [
        13,
        53
       ]
      },
      "lopen": {
       "bestand": "meisje-u11-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.25,
       "stap": 0.5,
       "cel": [
        36,
        61
       ],
       "anker": [
        18,
        52
       ]
      }
     }
    },
    "kleuter-u0": {
     "naam": "kleuter-u0",
     "cel": [
      58,
      68
     ],
     "anker": [
      29,
      53
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
       "bestand": "kleuter-u0-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        62
       ],
       "anker": [
        26,
        50
       ]
      },
      "lopen": {
       "bestand": "kleuter-u0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 0.85,
       "stap": 0.34,
       "cel": [
        52,
        61
       ],
       "anker": [
        26,
        49
       ]
      }
     }
    },
    "kleuter-u1": {
     "naam": "kleuter-u1",
     "cel": [
      38,
      63
     ],
     "anker": [
      19,
      53
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
       "bestand": "kleuter-u1-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        24,
        53
       ],
       "anker": [
        12,
        50
       ]
      },
      "lopen": {
       "bestand": "kleuter-u1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 0.85,
       "stap": 0.34,
       "cel": [
        32,
        56
       ],
       "anker": [
        16,
        49
       ]
      }
     }
    },
    "kleuter-u2": {
     "naam": "kleuter-u2",
     "cel": [
      38,
      63
     ],
     "anker": [
      19,
      53
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
       "bestand": "kleuter-u2-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        24,
        53
       ],
       "anker": [
        12,
        50
       ]
      },
      "lopen": {
       "bestand": "kleuter-u2-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 0.85,
       "stap": 0.34,
       "cel": [
        32,
        56
       ],
       "anker": [
        16,
        49
       ]
      }
     }
    },
    "kleuter-u3": {
     "naam": "kleuter-u3",
     "cel": [
      58,
      68
     ],
     "anker": [
      29,
      53
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
       "bestand": "kleuter-u3-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        62
       ],
       "anker": [
        26,
        50
       ]
      },
      "lopen": {
       "bestand": "kleuter-u3-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 0.85,
       "stap": 0.34,
       "cel": [
        52,
        61
       ],
       "anker": [
        26,
        49
       ]
      }
     }
    },
    "kleuter-u4": {
     "naam": "kleuter-u4",
     "cel": [
      38,
      63
     ],
     "anker": [
      19,
      53
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
       "bestand": "kleuter-u4-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        24,
        53
       ],
       "anker": [
        12,
        50
       ]
      },
      "lopen": {
       "bestand": "kleuter-u4-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 0.85,
       "stap": 0.34,
       "cel": [
        32,
        56
       ],
       "anker": [
        16,
        49
       ]
      }
     }
    },
    "kleuter-u5": {
     "naam": "kleuter-u5",
     "cel": [
      38,
      63
     ],
     "anker": [
      19,
      53
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
       "bestand": "kleuter-u5-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        24,
        53
       ],
       "anker": [
        12,
        50
       ]
      },
      "lopen": {
       "bestand": "kleuter-u5-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 0.85,
       "stap": 0.34,
       "cel": [
        32,
        56
       ],
       "anker": [
        16,
        49
       ]
      }
     }
    },
    "kleuter-u6": {
     "naam": "kleuter-u6",
     "cel": [
      58,
      68
     ],
     "anker": [
      29,
      53
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
       "bestand": "kleuter-u6-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        62
       ],
       "anker": [
        26,
        50
       ]
      },
      "lopen": {
       "bestand": "kleuter-u6-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 0.85,
       "stap": 0.34,
       "cel": [
        52,
        61
       ],
       "anker": [
        26,
        49
       ]
      }
     }
    },
    "kleuter-u7": {
     "naam": "kleuter-u7",
     "cel": [
      38,
      63
     ],
     "anker": [
      19,
      53
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
       "bestand": "kleuter-u7-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        24,
        53
       ],
       "anker": [
        12,
        50
       ]
      },
      "lopen": {
       "bestand": "kleuter-u7-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 0.85,
       "stap": 0.34,
       "cel": [
        32,
        56
       ],
       "anker": [
        16,
        49
       ]
      }
     }
    },
    "kleuter-u8": {
     "naam": "kleuter-u8",
     "cel": [
      38,
      63
     ],
     "anker": [
      19,
      53
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
       "bestand": "kleuter-u8-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        24,
        53
       ],
       "anker": [
        12,
        50
       ]
      },
      "lopen": {
       "bestand": "kleuter-u8-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 0.85,
       "stap": 0.34,
       "cel": [
        32,
        56
       ],
       "anker": [
        16,
        49
       ]
      }
     }
    },
    "kleuter-u9": {
     "naam": "kleuter-u9",
     "cel": [
      58,
      68
     ],
     "anker": [
      29,
      53
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
       "bestand": "kleuter-u9-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        52,
        62
       ],
       "anker": [
        26,
        50
       ]
      },
      "lopen": {
       "bestand": "kleuter-u9-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 0.85,
       "stap": 0.34,
       "cel": [
        52,
        61
       ],
       "anker": [
        26,
        49
       ]
      }
     }
    },
    "kleuter-u10": {
     "naam": "kleuter-u10",
     "cel": [
      38,
      63
     ],
     "anker": [
      19,
      53
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
       "bestand": "kleuter-u10-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        24,
        53
       ],
       "anker": [
        12,
        50
       ]
      },
      "lopen": {
       "bestand": "kleuter-u10-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 0.85,
       "stap": 0.34,
       "cel": [
        32,
        56
       ],
       "anker": [
        16,
        49
       ]
      }
     }
    },
    "kleuter-u11": {
     "naam": "kleuter-u11",
     "cel": [
      38,
      63
     ],
     "anker": [
      19,
      53
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
       "bestand": "kleuter-u11-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        24,
        53
       ],
       "anker": [
        12,
        50
       ]
      },
      "lopen": {
       "bestand": "kleuter-u11-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 0.85,
       "stap": 0.34,
       "cel": [
        32,
        56
       ],
       "anker": [
        16,
        49
       ]
      }
     }
    },
    "oudeman-u0": {
     "naam": "oudeman-u0",
     "cel": [
      56,
      91
     ],
     "anker": [
      28,
      76
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
       "bestand": "oudeman-u0-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        44,
        82
       ],
       "anker": [
        22,
        73
       ]
      },
      "lopen": {
       "bestand": "oudeman-u0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        73
       ]
      }
     }
    },
    "oudeman-u1": {
     "naam": "oudeman-u1",
     "cel": [
      56,
      93
     ],
     "anker": [
      28,
      79
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
       "bestand": "oudeman-u1-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        81
       ],
       "anker": [
        20,
        76
       ]
      },
      "lopen": {
       "bestand": "oudeman-u1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        87
       ],
       "anker": [
        25,
        76
       ]
      }
     }
    },
    "oudeman-u2": {
     "naam": "oudeman-u2",
     "cel": [
      56,
      91
     ],
     "anker": [
      28,
      76
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
       "bestand": "oudeman-u2-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        42,
        82
       ],
       "anker": [
        21,
        73
       ]
      },
      "lopen": {
       "bestand": "oudeman-u2-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        84
       ],
       "anker": [
        25,
        72
       ]
      }
     }
    },
    "oudeman-u3": {
     "naam": "oudeman-u3",
     "cel": [
      56,
      96
     ],
     "anker": [
      28,
      82
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
       "bestand": "oudeman-u3-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        84
       ],
       "anker": [
        19,
        79
       ]
      },
      "lopen": {
       "bestand": "oudeman-u3-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        90
       ],
       "anker": [
        25,
        79
       ]
      }
     }
    },
    "oudeman-u4": {
     "naam": "oudeman-u4",
     "cel": [
      56,
      98
     ],
     "anker": [
      28,
      83
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
       "bestand": "oudeman-u4-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        48,
        89
       ],
       "anker": [
        24,
        80
       ]
      },
      "lopen": {
       "bestand": "oudeman-u4-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        92
       ],
       "anker": [
        25,
        80
       ]
      }
     }
    },
    "oudeman-u5": {
     "naam": "oudeman-u5",
     "cel": [
      56,
      90
     ],
     "anker": [
      28,
      76
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
       "bestand": "oudeman-u5-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        78
       ],
       "anker": [
        20,
        73
       ]
      },
      "lopen": {
       "bestand": "oudeman-u5-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        84
       ],
       "anker": [
        25,
        73
       ]
      }
     }
    },
    "oudeman-u6": {
     "naam": "oudeman-u6",
     "cel": [
      58,
      94
     ],
     "anker": [
      29,
      79
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
       "bestand": "oudeman-u6-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        44,
        85
       ],
       "anker": [
        22,
        76
       ]
      },
      "lopen": {
       "bestand": "oudeman-u6-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        52,
        87
       ],
       "anker": [
        26,
        75
       ]
      }
     }
    },
    "oudeman-u7": {
     "naam": "oudeman-u7",
     "cel": [
      56,
      89
     ],
     "anker": [
      28,
      75
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
       "bestand": "oudeman-u7-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        77
       ],
       "anker": [
        20,
        72
       ]
      },
      "lopen": {
       "bestand": "oudeman-u7-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        83
       ],
       "anker": [
        25,
        72
       ]
      }
     }
    },
    "oudeman-u8": {
     "naam": "oudeman-u8",
     "cel": [
      56,
      95
     ],
     "anker": [
      28,
      80
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
       "bestand": "oudeman-u8-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        42,
        86
       ],
       "anker": [
        21,
        77
       ]
      },
      "lopen": {
       "bestand": "oudeman-u8-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        76
       ]
      }
     }
    },
    "oudeman-u9": {
     "naam": "oudeman-u9",
     "cel": [
      56,
      89
     ],
     "anker": [
      28,
      75
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
       "bestand": "oudeman-u9-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        77
       ],
       "anker": [
        20,
        72
       ]
      },
      "lopen": {
       "bestand": "oudeman-u9-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        83
       ],
       "anker": [
        25,
        72
       ]
      }
     }
    },
    "oudeman-u10": {
     "naam": "oudeman-u10",
     "cel": [
      56,
      98
     ],
     "anker": [
      28,
      83
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
       "bestand": "oudeman-u10-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        44,
        89
       ],
       "anker": [
        22,
        80
       ]
      },
      "lopen": {
       "bestand": "oudeman-u10-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        92
       ],
       "anker": [
        25,
        80
       ]
      }
     }
    },
    "oudeman-u11": {
     "naam": "oudeman-u11",
     "cel": [
      56,
      91
     ],
     "anker": [
      28,
      77
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
       "bestand": "oudeman-u11-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        79
       ],
       "anker": [
        20,
        74
       ]
      },
      "lopen": {
       "bestand": "oudeman-u11-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        84
       ],
       "anker": [
        25,
        73
       ]
      }
     }
    },
    "oudevrouw-u0": {
     "naam": "oudevrouw-u0",
     "cel": [
      58,
      91
     ],
     "anker": [
      29,
      75
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
       "bestand": "oudevrouw-u0-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        83
       ],
       "anker": [
        20,
        72
       ]
      },
      "lopen": {
       "bestand": "oudevrouw-u0-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        52,
        85
       ],
       "anker": [
        26,
        72
       ]
      }
     }
    },
    "oudevrouw-u1": {
     "naam": "oudevrouw-u1",
     "cel": [
      50,
      89
     ],
     "anker": [
      25,
      75
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
       "bestand": "oudevrouw-u1-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        81
       ],
       "anker": [
        17,
        72
       ]
      },
      "lopen": {
       "bestand": "oudevrouw-u1-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        82
       ],
       "anker": [
        22,
        71
       ]
      }
     }
    },
    "oudevrouw-u2": {
     "naam": "oudevrouw-u2",
     "cel": [
      58,
      89
     ],
     "anker": [
      29,
      73
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
       "bestand": "oudevrouw-u2-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        81
       ],
       "anker": [
        20,
        70
       ]
      },
      "lopen": {
       "bestand": "oudevrouw-u2-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        52,
        83
       ],
       "anker": [
        26,
        70
       ]
      }
     }
    },
    "oudevrouw-u3": {
     "naam": "oudevrouw-u3",
     "cel": [
      50,
      88
     ],
     "anker": [
      25,
      74
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
       "bestand": "oudevrouw-u3-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        80
       ],
       "anker": [
        17,
        71
       ]
      },
      "lopen": {
       "bestand": "oudevrouw-u3-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        82
       ],
       "anker": [
        22,
        71
       ]
      }
     }
    },
    "oudevrouw-u4": {
     "naam": "oudevrouw-u4",
     "cel": [
      58,
      91
     ],
     "anker": [
      29,
      75
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
       "bestand": "oudevrouw-u4-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        83
       ],
       "anker": [
        20,
        72
       ]
      },
      "lopen": {
       "bestand": "oudevrouw-u4-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        52,
        85
       ],
       "anker": [
        26,
        72
       ]
      }
     }
    },
    "oudevrouw-u5": {
     "naam": "oudevrouw-u5",
     "cel": [
      50,
      87
     ],
     "anker": [
      25,
      73
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
       "bestand": "oudevrouw-u5-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        79
       ],
       "anker": [
        17,
        70
       ]
      },
      "lopen": {
       "bestand": "oudevrouw-u5-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      }
     }
    },
    "oudevrouw-u6": {
     "naam": "oudevrouw-u6",
     "cel": [
      58,
      91
     ],
     "anker": [
      29,
      75
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
       "bestand": "oudevrouw-u6-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        83
       ],
       "anker": [
        20,
        72
       ]
      },
      "lopen": {
       "bestand": "oudevrouw-u6-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        52,
        85
       ],
       "anker": [
        26,
        72
       ]
      }
     }
    },
    "oudevrouw-u7": {
     "naam": "oudevrouw-u7",
     "cel": [
      50,
      87
     ],
     "anker": [
      25,
      73
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
       "bestand": "oudevrouw-u7-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        79
       ],
       "anker": [
        17,
        70
       ]
      },
      "lopen": {
       "bestand": "oudevrouw-u7-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      }
     }
    },
    "oudevrouw-u8": {
     "naam": "oudevrouw-u8",
     "cel": [
      58,
      91
     ],
     "anker": [
      29,
      75
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
       "bestand": "oudevrouw-u8-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        83
       ],
       "anker": [
        20,
        72
       ]
      },
      "lopen": {
       "bestand": "oudevrouw-u8-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        52,
        84
       ],
       "anker": [
        26,
        71
       ]
      }
     }
    },
    "oudevrouw-u9": {
     "naam": "oudevrouw-u9",
     "cel": [
      50,
      87
     ],
     "anker": [
      25,
      73
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
       "bestand": "oudevrouw-u9-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        79
       ],
       "anker": [
        17,
        70
       ]
      },
      "lopen": {
       "bestand": "oudevrouw-u9-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      }
     }
    },
    "oudevrouw-u10": {
     "naam": "oudevrouw-u10",
     "cel": [
      58,
      91
     ],
     "anker": [
      29,
      75
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
       "bestand": "oudevrouw-u10-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        40,
        83
       ],
       "anker": [
        20,
        72
       ]
      },
      "lopen": {
       "bestand": "oudevrouw-u10-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        52,
        85
       ],
       "anker": [
        26,
        72
       ]
      }
     }
    },
    "oudevrouw-u11": {
     "naam": "oudevrouw-u11",
     "cel": [
      50,
      89
     ],
     "anker": [
      25,
      75
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
       "bestand": "oudevrouw-u11-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        81
       ],
       "anker": [
        17,
        72
       ]
      },
      "lopen": {
       "bestand": "oudevrouw-u11-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        82
       ],
       "anker": [
        22,
        71
       ]
      }
     }
    },
    "boer-u0-arm": {
     "naam": "boer-u0-arm",
     "cel": [
      56,
      94
     ],
     "anker": [
      28,
      80
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
       "bestand": "boer-u0-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "boer-u0-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      }
     }
    },
    "boer-u1-arm": {
     "naam": "boer-u1-arm",
     "cel": [
      56,
      88
     ],
     "anker": [
      28,
      74
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
       "bestand": "boer-u1-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        76
       ],
       "anker": [
        18,
        71
       ]
      },
      "lopen": {
       "bestand": "boer-u1-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      }
     }
    },
    "boer-u2-arm": {
     "naam": "boer-u2-arm",
     "cel": [
      56,
      91
     ],
     "anker": [
      28,
      77
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
       "bestand": "boer-u2-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        74
       ]
      },
      "lopen": {
       "bestand": "boer-u2-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      }
     }
    },
    "boer-u3-arm": {
     "naam": "boer-u3-arm",
     "cel": [
      56,
      89
     ],
     "anker": [
      28,
      75
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
       "bestand": "boer-u3-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        77
       ],
       "anker": [
        17,
        72
       ]
      },
      "lopen": {
       "bestand": "boer-u3-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        83
       ],
       "anker": [
        25,
        72
       ]
      }
     }
    },
    "boer-u4-arm": {
     "naam": "boer-u4-arm",
     "cel": [
      56,
      91
     ],
     "anker": [
      28,
      77
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
       "bestand": "boer-u4-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        74
       ]
      },
      "lopen": {
       "bestand": "boer-u4-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      }
     }
    },
    "boer-u5-arm": {
     "naam": "boer-u5-arm",
     "cel": [
      56,
      87
     ],
     "anker": [
      28,
      73
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
       "bestand": "boer-u5-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        44,
        75
       ],
       "anker": [
        22,
        70
       ]
      },
      "lopen": {
       "bestand": "boer-u5-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      }
     }
    },
    "boer-u6-arm": {
     "naam": "boer-u6-arm",
     "cel": [
      56,
      91
     ],
     "anker": [
      28,
      77
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
       "bestand": "boer-u6-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        74
       ]
      },
      "lopen": {
       "bestand": "boer-u6-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      }
     }
    },
    "boer-u7-arm": {
     "naam": "boer-u7-arm",
     "cel": [
      56,
      94
     ],
     "anker": [
      28,
      80
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
       "bestand": "boer-u7-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "boer-u7-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      }
     }
    },
    "boer-u8-arm": {
     "naam": "boer-u8-arm",
     "cel": [
      56,
      88
     ],
     "anker": [
      28,
      74
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
       "bestand": "boer-u8-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        76
       ],
       "anker": [
        18,
        71
       ]
      },
      "lopen": {
       "bestand": "boer-u8-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      }
     }
    },
    "boer-u9-arm": {
     "naam": "boer-u9-arm",
     "cel": [
      56,
      88
     ],
     "anker": [
      28,
      74
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
       "bestand": "boer-u9-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        76
       ],
       "anker": [
        18,
        71
       ]
      },
      "lopen": {
       "bestand": "boer-u9-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      }
     }
    },
    "boer-u10-arm": {
     "naam": "boer-u10-arm",
     "cel": [
      56,
      88
     ],
     "anker": [
      28,
      74
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
       "bestand": "boer-u10-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        76
       ],
       "anker": [
        17,
        71
       ]
      },
      "lopen": {
       "bestand": "boer-u10-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      }
     }
    },
    "boer-u11-arm": {
     "naam": "boer-u11-arm",
     "cel": [
      56,
      87
     ],
     "anker": [
      28,
      73
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
       "bestand": "boer-u11-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        75
       ],
       "anker": [
        18,
        70
       ]
      },
      "lopen": {
       "bestand": "boer-u11-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      }
     }
    },
    "boer-u12-arm": {
     "naam": "boer-u12-arm",
     "cel": [
      56,
      94
     ],
     "anker": [
      28,
      80
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
       "bestand": "boer-u12-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "boer-u12-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      }
     }
    },
    "boer-u13-arm": {
     "naam": "boer-u13-arm",
     "cel": [
      56,
      88
     ],
     "anker": [
      28,
      74
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
       "bestand": "boer-u13-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        76
       ],
       "anker": [
        18,
        71
       ]
      },
      "lopen": {
       "bestand": "boer-u13-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      }
     }
    },
    "boer-u14-arm": {
     "naam": "boer-u14-arm",
     "cel": [
      56,
      91
     ],
     "anker": [
      28,
      77
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
       "bestand": "boer-u14-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        74
       ]
      },
      "lopen": {
       "bestand": "boer-u14-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      }
     }
    },
    "boer-u15-arm": {
     "naam": "boer-u15-arm",
     "cel": [
      56,
      93
     ],
     "anker": [
      28,
      79
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
       "bestand": "boer-u15-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        81
       ],
       "anker": [
        18,
        76
       ]
      },
      "lopen": {
       "bestand": "boer-u15-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        86
       ],
       "anker": [
        25,
        75
       ]
      }
     }
    },
    "boer-u16-arm": {
     "naam": "boer-u16-arm",
     "cel": [
      56,
      91
     ],
     "anker": [
      28,
      77
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
       "bestand": "boer-u16-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        74
       ]
      },
      "lopen": {
       "bestand": "boer-u16-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      }
     }
    },
    "boer-u17-arm": {
     "naam": "boer-u17-arm",
     "cel": [
      56,
      94
     ],
     "anker": [
      28,
      80
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
       "bestand": "boer-u17-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "boer-u17-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      }
     }
    },
    "boer-u18-arm": {
     "naam": "boer-u18-arm",
     "cel": [
      56,
      89
     ],
     "anker": [
      28,
      75
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
       "bestand": "boer-u18-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        77
       ],
       "anker": [
        18,
        72
       ]
      },
      "lopen": {
       "bestand": "boer-u18-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        83
       ],
       "anker": [
        25,
        72
       ]
      }
     }
    },
    "boer-u19-arm": {
     "naam": "boer-u19-arm",
     "cel": [
      56,
      91
     ],
     "anker": [
      28,
      77
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
       "bestand": "boer-u19-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        74
       ]
      },
      "lopen": {
       "bestand": "boer-u19-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      }
     }
    },
    "boer-u20-arm": {
     "naam": "boer-u20-arm",
     "cel": [
      56,
      88
     ],
     "anker": [
      28,
      74
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
       "bestand": "boer-u20-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        76
       ],
       "anker": [
        18,
        71
       ]
      },
      "lopen": {
       "bestand": "boer-u20-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      }
     }
    },
    "boer-u21-arm": {
     "naam": "boer-u21-arm",
     "cel": [
      56,
      91
     ],
     "anker": [
      28,
      77
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
       "bestand": "boer-u21-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        74
       ]
      },
      "lopen": {
       "bestand": "boer-u21-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      }
     }
    },
    "boer-u22-arm": {
     "naam": "boer-u22-arm",
     "cel": [
      56,
      88
     ],
     "anker": [
      28,
      74
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
       "bestand": "boer-u22-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        76
       ],
       "anker": [
        18,
        71
       ]
      },
      "lopen": {
       "bestand": "boer-u22-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      }
     }
    },
    "boer-u23-arm": {
     "naam": "boer-u23-arm",
     "cel": [
      56,
      94
     ],
     "anker": [
      28,
      80
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
       "bestand": "boer-u23-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        44,
        82
       ],
       "anker": [
        22,
        77
       ]
      },
      "lopen": {
       "bestand": "boer-u23-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      }
     }
    },
    "boer-u0-deftig": {
     "naam": "boer-u0-deftig",
     "cel": [
      56,
      94
     ],
     "anker": [
      28,
      80
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
       "bestand": "boer-u0-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "boer-u0-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      }
     }
    },
    "boer-u1-deftig": {
     "naam": "boer-u1-deftig",
     "cel": [
      56,
      88
     ],
     "anker": [
      28,
      74
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
       "bestand": "boer-u1-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        76
       ],
       "anker": [
        18,
        71
       ]
      },
      "lopen": {
       "bestand": "boer-u1-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      }
     }
    },
    "boer-u2-deftig": {
     "naam": "boer-u2-deftig",
     "cel": [
      56,
      91
     ],
     "anker": [
      28,
      77
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
       "bestand": "boer-u2-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        74
       ]
      },
      "lopen": {
       "bestand": "boer-u2-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      }
     }
    },
    "boer-u3-deftig": {
     "naam": "boer-u3-deftig",
     "cel": [
      56,
      89
     ],
     "anker": [
      28,
      75
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
       "bestand": "boer-u3-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        77
       ],
       "anker": [
        18,
        72
       ]
      },
      "lopen": {
       "bestand": "boer-u3-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        83
       ],
       "anker": [
        25,
        72
       ]
      }
     }
    },
    "boer-u4-deftig": {
     "naam": "boer-u4-deftig",
     "cel": [
      56,
      94
     ],
     "anker": [
      28,
      80
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
       "bestand": "boer-u4-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "boer-u4-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      }
     }
    },
    "boer-u5-deftig": {
     "naam": "boer-u5-deftig",
     "cel": [
      56,
      87
     ],
     "anker": [
      28,
      73
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
       "bestand": "boer-u5-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        44,
        75
       ],
       "anker": [
        22,
        70
       ]
      },
      "lopen": {
       "bestand": "boer-u5-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      }
     }
    },
    "boer-u6-deftig": {
     "naam": "boer-u6-deftig",
     "cel": [
      56,
      91
     ],
     "anker": [
      28,
      77
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
       "bestand": "boer-u6-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        74
       ]
      },
      "lopen": {
       "bestand": "boer-u6-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      }
     }
    },
    "boer-u7-deftig": {
     "naam": "boer-u7-deftig",
     "cel": [
      56,
      94
     ],
     "anker": [
      28,
      80
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
       "bestand": "boer-u7-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "boer-u7-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      }
     }
    },
    "boer-u8-deftig": {
     "naam": "boer-u8-deftig",
     "cel": [
      56,
      88
     ],
     "anker": [
      28,
      74
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
       "bestand": "boer-u8-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        76
       ],
       "anker": [
        18,
        71
       ]
      },
      "lopen": {
       "bestand": "boer-u8-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      }
     }
    },
    "boer-u9-deftig": {
     "naam": "boer-u9-deftig",
     "cel": [
      56,
      88
     ],
     "anker": [
      28,
      74
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
       "bestand": "boer-u9-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        76
       ],
       "anker": [
        18,
        71
       ]
      },
      "lopen": {
       "bestand": "boer-u9-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      }
     }
    },
    "boer-u10-deftig": {
     "naam": "boer-u10-deftig",
     "cel": [
      56,
      88
     ],
     "anker": [
      28,
      74
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
       "bestand": "boer-u10-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        76
       ],
       "anker": [
        18,
        71
       ]
      },
      "lopen": {
       "bestand": "boer-u10-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      }
     }
    },
    "boer-u11-deftig": {
     "naam": "boer-u11-deftig",
     "cel": [
      56,
      87
     ],
     "anker": [
      28,
      73
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
       "bestand": "boer-u11-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        75
       ],
       "anker": [
        18,
        70
       ]
      },
      "lopen": {
       "bestand": "boer-u11-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      }
     }
    },
    "boer-u12-deftig": {
     "naam": "boer-u12-deftig",
     "cel": [
      56,
      94
     ],
     "anker": [
      28,
      80
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
       "bestand": "boer-u12-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "boer-u12-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      }
     }
    },
    "boer-u13-deftig": {
     "naam": "boer-u13-deftig",
     "cel": [
      56,
      88
     ],
     "anker": [
      28,
      74
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
       "bestand": "boer-u13-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        76
       ],
       "anker": [
        18,
        71
       ]
      },
      "lopen": {
       "bestand": "boer-u13-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      }
     }
    },
    "boer-u14-deftig": {
     "naam": "boer-u14-deftig",
     "cel": [
      56,
      91
     ],
     "anker": [
      28,
      77
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
       "bestand": "boer-u14-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        74
       ]
      },
      "lopen": {
       "bestand": "boer-u14-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      }
     }
    },
    "boer-u15-deftig": {
     "naam": "boer-u15-deftig",
     "cel": [
      56,
      93
     ],
     "anker": [
      28,
      79
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
       "bestand": "boer-u15-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        81
       ],
       "anker": [
        18,
        76
       ]
      },
      "lopen": {
       "bestand": "boer-u15-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        86
       ],
       "anker": [
        25,
        75
       ]
      }
     }
    },
    "boer-u16-deftig": {
     "naam": "boer-u16-deftig",
     "cel": [
      56,
      94
     ],
     "anker": [
      28,
      80
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
       "bestand": "boer-u16-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "boer-u16-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      }
     }
    },
    "boer-u17-deftig": {
     "naam": "boer-u17-deftig",
     "cel": [
      56,
      94
     ],
     "anker": [
      28,
      80
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
       "bestand": "boer-u17-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "boer-u17-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      }
     }
    },
    "boer-u18-deftig": {
     "naam": "boer-u18-deftig",
     "cel": [
      56,
      89
     ],
     "anker": [
      28,
      75
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
       "bestand": "boer-u18-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        77
       ],
       "anker": [
        18,
        72
       ]
      },
      "lopen": {
       "bestand": "boer-u18-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        83
       ],
       "anker": [
        25,
        72
       ]
      }
     }
    },
    "boer-u19-deftig": {
     "naam": "boer-u19-deftig",
     "cel": [
      56,
      91
     ],
     "anker": [
      28,
      77
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
       "bestand": "boer-u19-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        74
       ]
      },
      "lopen": {
       "bestand": "boer-u19-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        85
       ],
       "anker": [
        25,
        74
       ]
      }
     }
    },
    "boer-u20-deftig": {
     "naam": "boer-u20-deftig",
     "cel": [
      56,
      88
     ],
     "anker": [
      28,
      74
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
       "bestand": "boer-u20-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        76
       ],
       "anker": [
        18,
        71
       ]
      },
      "lopen": {
       "bestand": "boer-u20-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        81
       ],
       "anker": [
        25,
        70
       ]
      }
     }
    },
    "boer-u21-deftig": {
     "naam": "boer-u21-deftig",
     "cel": [
      56,
      94
     ],
     "anker": [
      28,
      80
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
       "bestand": "boer-u21-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        82
       ],
       "anker": [
        18,
        77
       ]
      },
      "lopen": {
       "bestand": "boer-u21-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      }
     }
    },
    "boer-u22-deftig": {
     "naam": "boer-u22-deftig",
     "cel": [
      56,
      88
     ],
     "anker": [
      28,
      74
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
       "bestand": "boer-u22-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        76
       ],
       "anker": [
        18,
        71
       ]
      },
      "lopen": {
       "bestand": "boer-u22-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        82
       ],
       "anker": [
        25,
        71
       ]
      }
     }
    },
    "boer-u23-deftig": {
     "naam": "boer-u23-deftig",
     "cel": [
      56,
      94
     ],
     "anker": [
      28,
      80
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
       "bestand": "boer-u23-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        44,
        82
       ],
       "anker": [
        22,
        77
       ]
      },
      "lopen": {
       "bestand": "boer-u23-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.5,
       "stap": 0.6,
       "cel": [
        50,
        88
       ],
       "anker": [
        25,
        77
       ]
      }
     }
    },
    "boerin-u0-arm": {
     "naam": "boerin-u0-arm",
     "cel": [
      48,
      87
     ],
     "anker": [
      24,
      73
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
       "bestand": "boerin-u0-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        79
       ],
       "anker": [
        19,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u0-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        42,
        81
       ],
       "anker": [
        21,
        70
       ]
      }
     }
    },
    "boerin-u1-arm": {
     "naam": "boerin-u1-arm",
     "cel": [
      48,
      86
     ],
     "anker": [
      24,
      72
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
       "bestand": "boerin-u1-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        78
       ],
       "anker": [
        17,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u1-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        42,
        79
       ],
       "anker": [
        21,
        68
       ]
      }
     }
    },
    "boerin-u2-arm": {
     "naam": "boerin-u2-arm",
     "cel": [
      48,
      87
     ],
     "anker": [
      24,
      73
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
       "bestand": "boerin-u2-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u2-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        42,
        81
       ],
       "anker": [
        21,
        70
       ]
      }
     }
    },
    "boerin-u3-arm": {
     "naam": "boerin-u3-arm",
     "cel": [
      50,
      86
     ],
     "anker": [
      25,
      72
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
       "bestand": "boerin-u3-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        44,
        78
       ],
       "anker": [
        22,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u3-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      }
     }
    },
    "boerin-u4-arm": {
     "naam": "boerin-u4-arm",
     "cel": [
      48,
      87
     ],
     "anker": [
      24,
      73
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
       "bestand": "boerin-u4-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u4-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        42,
        81
       ],
       "anker": [
        21,
        70
       ]
      }
     }
    },
    "boerin-u5-arm": {
     "naam": "boerin-u5-arm",
     "cel": [
      48,
      86
     ],
     "anker": [
      24,
      72
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
       "bestand": "boerin-u5-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        78
       ],
       "anker": [
        17,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u5-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        42,
        79
       ],
       "anker": [
        21,
        68
       ]
      }
     }
    },
    "boerin-u6-arm": {
     "naam": "boerin-u6-arm",
     "cel": [
      48,
      86
     ],
     "anker": [
      24,
      72
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
       "bestand": "boerin-u6-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        78
       ],
       "anker": [
        18,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u6-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        42,
        79
       ],
       "anker": [
        21,
        68
       ]
      }
     }
    },
    "boerin-u7-arm": {
     "naam": "boerin-u7-arm",
     "cel": [
      48,
      86
     ],
     "anker": [
      24,
      72
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
       "bestand": "boerin-u7-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        78
       ],
       "anker": [
        17,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u7-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        42,
        79
       ],
       "anker": [
        21,
        68
       ]
      }
     }
    },
    "boerin-u8-arm": {
     "naam": "boerin-u8-arm",
     "cel": [
      48,
      86
     ],
     "anker": [
      24,
      72
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
       "bestand": "boerin-u8-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        78
       ],
       "anker": [
        18,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u8-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        42,
        79
       ],
       "anker": [
        21,
        68
       ]
      }
     }
    },
    "boerin-u9-arm": {
     "naam": "boerin-u9-arm",
     "cel": [
      48,
      87
     ],
     "anker": [
      24,
      73
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
       "bestand": "boerin-u9-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        79
       ],
       "anker": [
        17,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u9-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        42,
        81
       ],
       "anker": [
        21,
        70
       ]
      }
     }
    },
    "boerin-u10-arm": {
     "naam": "boerin-u10-arm",
     "cel": [
      48,
      86
     ],
     "anker": [
      24,
      72
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
       "bestand": "boerin-u10-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        78
       ],
       "anker": [
        18,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u10-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        42,
        79
       ],
       "anker": [
        21,
        68
       ]
      }
     }
    },
    "boerin-u11-arm": {
     "naam": "boerin-u11-arm",
     "cel": [
      48,
      86
     ],
     "anker": [
      24,
      72
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
       "bestand": "boerin-u11-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        78
       ],
       "anker": [
        17,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u11-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        42,
        80
       ],
       "anker": [
        21,
        69
       ]
      }
     }
    },
    "boerin-u12-arm": {
     "naam": "boerin-u12-arm",
     "cel": [
      48,
      87
     ],
     "anker": [
      24,
      73
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
       "bestand": "boerin-u12-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u12-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        42,
        81
       ],
       "anker": [
        21,
        70
       ]
      }
     }
    },
    "boerin-u13-arm": {
     "naam": "boerin-u13-arm",
     "cel": [
      48,
      86
     ],
     "anker": [
      24,
      72
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
       "bestand": "boerin-u13-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        78
       ],
       "anker": [
        17,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u13-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        42,
        79
       ],
       "anker": [
        21,
        68
       ]
      }
     }
    },
    "boerin-u14-arm": {
     "naam": "boerin-u14-arm",
     "cel": [
      48,
      87
     ],
     "anker": [
      24,
      73
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
       "bestand": "boerin-u14-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u14-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        42,
        80
       ],
       "anker": [
        21,
        69
       ]
      }
     }
    },
    "boerin-u15-arm": {
     "naam": "boerin-u15-arm",
     "cel": [
      48,
      87
     ],
     "anker": [
      24,
      73
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
       "bestand": "boerin-u15-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        79
       ],
       "anker": [
        17,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u15-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        42,
        81
       ],
       "anker": [
        21,
        70
       ]
      }
     }
    },
    "boerin-u16-arm": {
     "naam": "boerin-u16-arm",
     "cel": [
      48,
      87
     ],
     "anker": [
      24,
      73
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
       "bestand": "boerin-u16-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u16-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        42,
        81
       ],
       "anker": [
        21,
        70
       ]
      }
     }
    },
    "boerin-u17-arm": {
     "naam": "boerin-u17-arm",
     "cel": [
      48,
      86
     ],
     "anker": [
      24,
      72
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
       "bestand": "boerin-u17-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        78
       ],
       "anker": [
        17,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u17-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        42,
        79
       ],
       "anker": [
        21,
        68
       ]
      }
     }
    },
    "boerin-u18-arm": {
     "naam": "boerin-u18-arm",
     "cel": [
      48,
      87
     ],
     "anker": [
      24,
      73
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
       "bestand": "boerin-u18-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u18-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        42,
        80
       ],
       "anker": [
        21,
        69
       ]
      }
     }
    },
    "boerin-u19-arm": {
     "naam": "boerin-u19-arm",
     "cel": [
      48,
      87
     ],
     "anker": [
      24,
      73
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
       "bestand": "boerin-u19-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        79
       ],
       "anker": [
        17,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u19-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        42,
        81
       ],
       "anker": [
        21,
        70
       ]
      }
     }
    },
    "boerin-u20-arm": {
     "naam": "boerin-u20-arm",
     "cel": [
      48,
      86
     ],
     "anker": [
      24,
      72
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
       "bestand": "boerin-u20-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        78
       ],
       "anker": [
        18,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u20-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        42,
        79
       ],
       "anker": [
        21,
        68
       ]
      }
     }
    },
    "boerin-u21-arm": {
     "naam": "boerin-u21-arm",
     "cel": [
      48,
      86
     ],
     "anker": [
      24,
      72
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
       "bestand": "boerin-u21-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        78
       ],
       "anker": [
        19,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u21-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        42,
        79
       ],
       "anker": [
        21,
        68
       ]
      }
     }
    },
    "boerin-u22-arm": {
     "naam": "boerin-u22-arm",
     "cel": [
      48,
      87
     ],
     "anker": [
      24,
      73
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
       "bestand": "boerin-u22-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        79
       ],
       "anker": [
        18,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u22-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        42,
        81
       ],
       "anker": [
        21,
        70
       ]
      }
     }
    },
    "boerin-u23-arm": {
     "naam": "boerin-u23-arm",
     "cel": [
      48,
      86
     ],
     "anker": [
      24,
      72
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
       "bestand": "boerin-u23-arm-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        36,
        78
       ],
       "anker": [
        18,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u23-arm-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        42,
        79
       ],
       "anker": [
        21,
        68
       ]
      }
     }
    },
    "boerin-u0-deftig": {
     "naam": "boerin-u0-deftig",
     "cel": [
      50,
      87
     ],
     "anker": [
      25,
      73
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
       "bestand": "boerin-u0-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        79
       ],
       "anker": [
        19,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u0-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      }
     }
    },
    "boerin-u1-deftig": {
     "naam": "boerin-u1-deftig",
     "cel": [
      50,
      86
     ],
     "anker": [
      25,
      72
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
       "bestand": "boerin-u1-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        78
       ],
       "anker": [
        17,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u1-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      }
     }
    },
    "boerin-u2-deftig": {
     "naam": "boerin-u2-deftig",
     "cel": [
      50,
      87
     ],
     "anker": [
      25,
      73
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
       "bestand": "boerin-u2-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        79
       ],
       "anker": [
        17,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u2-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      }
     }
    },
    "boerin-u3-deftig": {
     "naam": "boerin-u3-deftig",
     "cel": [
      50,
      86
     ],
     "anker": [
      25,
      72
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
       "bestand": "boerin-u3-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        44,
        78
       ],
       "anker": [
        22,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u3-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      }
     }
    },
    "boerin-u4-deftig": {
     "naam": "boerin-u4-deftig",
     "cel": [
      50,
      87
     ],
     "anker": [
      25,
      73
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
       "bestand": "boerin-u4-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        79
       ],
       "anker": [
        17,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u4-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      }
     }
    },
    "boerin-u5-deftig": {
     "naam": "boerin-u5-deftig",
     "cel": [
      50,
      86
     ],
     "anker": [
      25,
      72
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
       "bestand": "boerin-u5-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        78
       ],
       "anker": [
        17,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u5-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      }
     }
    },
    "boerin-u6-deftig": {
     "naam": "boerin-u6-deftig",
     "cel": [
      50,
      86
     ],
     "anker": [
      25,
      72
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
       "bestand": "boerin-u6-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        78
       ],
       "anker": [
        17,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u6-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      }
     }
    },
    "boerin-u7-deftig": {
     "naam": "boerin-u7-deftig",
     "cel": [
      50,
      86
     ],
     "anker": [
      25,
      72
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
       "bestand": "boerin-u7-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        78
       ],
       "anker": [
        17,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u7-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      }
     }
    },
    "boerin-u8-deftig": {
     "naam": "boerin-u8-deftig",
     "cel": [
      50,
      86
     ],
     "anker": [
      25,
      72
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
       "bestand": "boerin-u8-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        78
       ],
       "anker": [
        17,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u8-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      }
     }
    },
    "boerin-u9-deftig": {
     "naam": "boerin-u9-deftig",
     "cel": [
      50,
      87
     ],
     "anker": [
      25,
      73
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
       "bestand": "boerin-u9-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        79
       ],
       "anker": [
        17,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u9-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      }
     }
    },
    "boerin-u10-deftig": {
     "naam": "boerin-u10-deftig",
     "cel": [
      50,
      86
     ],
     "anker": [
      25,
      72
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
       "bestand": "boerin-u10-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        78
       ],
       "anker": [
        17,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u10-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      }
     }
    },
    "boerin-u11-deftig": {
     "naam": "boerin-u11-deftig",
     "cel": [
      50,
      86
     ],
     "anker": [
      25,
      72
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
       "bestand": "boerin-u11-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        78
       ],
       "anker": [
        17,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u11-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        80
       ],
       "anker": [
        22,
        69
       ]
      }
     }
    },
    "boerin-u12-deftig": {
     "naam": "boerin-u12-deftig",
     "cel": [
      50,
      87
     ],
     "anker": [
      25,
      73
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
       "bestand": "boerin-u12-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        79
       ],
       "anker": [
        17,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u12-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      }
     }
    },
    "boerin-u13-deftig": {
     "naam": "boerin-u13-deftig",
     "cel": [
      50,
      86
     ],
     "anker": [
      25,
      72
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
       "bestand": "boerin-u13-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        78
       ],
       "anker": [
        17,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u13-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      }
     }
    },
    "boerin-u14-deftig": {
     "naam": "boerin-u14-deftig",
     "cel": [
      50,
      87
     ],
     "anker": [
      25,
      73
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
       "bestand": "boerin-u14-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        79
       ],
       "anker": [
        17,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u14-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        80
       ],
       "anker": [
        22,
        69
       ]
      }
     }
    },
    "boerin-u15-deftig": {
     "naam": "boerin-u15-deftig",
     "cel": [
      50,
      87
     ],
     "anker": [
      25,
      73
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
       "bestand": "boerin-u15-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        79
       ],
       "anker": [
        17,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u15-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      }
     }
    },
    "boerin-u16-deftig": {
     "naam": "boerin-u16-deftig",
     "cel": [
      50,
      87
     ],
     "anker": [
      25,
      73
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
       "bestand": "boerin-u16-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        79
       ],
       "anker": [
        17,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u16-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      }
     }
    },
    "boerin-u17-deftig": {
     "naam": "boerin-u17-deftig",
     "cel": [
      50,
      86
     ],
     "anker": [
      25,
      72
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
       "bestand": "boerin-u17-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        78
       ],
       "anker": [
        17,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u17-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      }
     }
    },
    "boerin-u18-deftig": {
     "naam": "boerin-u18-deftig",
     "cel": [
      50,
      87
     ],
     "anker": [
      25,
      73
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
       "bestand": "boerin-u18-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        79
       ],
       "anker": [
        17,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u18-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        80
       ],
       "anker": [
        22,
        69
       ]
      }
     }
    },
    "boerin-u19-deftig": {
     "naam": "boerin-u19-deftig",
     "cel": [
      50,
      87
     ],
     "anker": [
      25,
      73
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
       "bestand": "boerin-u19-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        79
       ],
       "anker": [
        17,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u19-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      }
     }
    },
    "boerin-u20-deftig": {
     "naam": "boerin-u20-deftig",
     "cel": [
      50,
      86
     ],
     "anker": [
      25,
      72
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
       "bestand": "boerin-u20-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        78
       ],
       "anker": [
        17,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u20-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      }
     }
    },
    "boerin-u21-deftig": {
     "naam": "boerin-u21-deftig",
     "cel": [
      50,
      86
     ],
     "anker": [
      25,
      72
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
       "bestand": "boerin-u21-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        38,
        78
       ],
       "anker": [
        19,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u21-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
       ]
      }
     }
    },
    "boerin-u22-deftig": {
     "naam": "boerin-u22-deftig",
     "cel": [
      50,
      87
     ],
     "anker": [
      25,
      73
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
       "bestand": "boerin-u22-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        79
       ],
       "anker": [
        17,
        70
       ]
      },
      "lopen": {
       "bestand": "boerin-u22-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        81
       ],
       "anker": [
        22,
        70
       ]
      }
     }
    },
    "boerin-u23-deftig": {
     "naam": "boerin-u23-deftig",
     "cel": [
      50,
      86
     ],
     "anker": [
      25,
      72
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
       "bestand": "boerin-u23-deftig-staan.png",
       "beelden": 4,
       "fps": 4,
       "herhaal": true,
       "cel": [
        34,
        78
       ],
       "anker": [
        17,
        69
       ]
      },
      "lopen": {
       "bestand": "boerin-u23-deftig-lopen.png",
       "beelden": 8,
       "fps": 10,
       "herhaal": true,
       "snelheid": 1.4,
       "stap": 0.56,
       "cel": [
        44,
        79
       ],
       "anker": [
        22,
        68
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
     },
     "zwad": {
      "y0": 740,
      "cel": [
       84,
       59
      ],
      "anker": [
       42,
       17
      ]
     },
     "hokken": {
      "y0": 799,
      "cel": [
       84,
       80
      ],
      "anker": [
       42,
       38
      ]
     },
     "stoppels": {
      "y0": 879,
      "cel": [
       84,
       57
      ],
      "anker": [
       42,
       15
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
   },
   "meiboom": {
    "bestand": "meiboom.png",
    "cel": [
     48,
     196
    ],
    "anker": [
     24,
     184
    ]
   },
   "tekens": {
    "bestand": "tekens.png",
    "cel": [
     20,
     20
    ],
    "anker": [
     10,
     19
    ],
    "namen": [
     "eten",
     "brandhout",
     "put",
     "bier",
     "vleesOfVis",
     "kapel",
     "herberg",
     "brood",
     "laken",
     "markt",
     "bouwstof"
    ]
   },
   "marktkraam": {
    "bestand": "marktkraam.png",
    "cel": [
     224,
     136
    ],
    "anker": [
     112,
     74
    ],
    "richtingen": [
     "ZO",
     "ZW",
     "NW",
     "NO"
    ],
    "soorten": [
     "groente/luifel/1",
     "groente/luifel/2",
     "groente/kar/1",
     "groente/kar/2",
     "groente/puntdak/1",
     "groente/puntdak/2",
     "brood/luifel/1",
     "brood/puntdak/1",
     "brood/zeil/1",
     "vis/luifel/2",
     "vis/luifel/3",
     "vis/zeil/2",
     "vis/zeil/3",
     "vis/puntdak/2",
     "vis/puntdak/3",
     "laken/luifel/2",
     "laken/luifel/3",
     "laken/puntdak/2",
     "laken/puntdak/3",
     "laken/zeil/2",
     "laken/zeil/3",
     "potten/zeil/1",
     "potten/zeil/2",
     "potten/luifel/1",
     "potten/luifel/2"
    ],
    "manden": {
     "bestand": "marktmanden.png",
     "cel": [
      64,
      64
     ],
     "anker": [
      32,
      46
     ],
     "namen": [
      "mand appels",
      "mand kolen",
      "mand leeg",
      "krat brood",
      "krat wol",
      "zak",
      "ton graan",
      "ton leeg"
     ]
    }
   },
   "hol": {
    "bestand": "hol.png",
    "cel": [
     76,
     62
    ],
    "anker": [
     38,
     42
    ]
   },
   "wijnrank": {
    "bestand": "wijnrank.png",
    "cel": [
     53,
     61
    ],
    "anker": [
     26,
     53
    ],
    "standen": [
     "kaal",
     "blad",
     "vol",
     "leeg"
    ],
    "varianten": 3
   },
   "uiterlijken": {
    "boer": [
     "donker",
     "blond",
     "zwart",
     "rood",
     "bruin",
     "kastanje",
     "blond",
     "donker",
     "lichtblond",
     "donkerblond",
     "zwart",
     "peper",
     "rood",
     "bruin",
     "kastanje",
     "donkerblond",
     "donker",
     "lichtblond",
     "zwart",
     "peper",
     "bruin",
     "rood",
     "blond",
     "kastanje"
    ],
    "boerin": [
     "bruin",
     "blond",
     "donker",
     "zwart",
     "kastanje",
     "rood",
     "bruin",
     "blond",
     "lichtblond",
     "donkerblond",
     "zwart",
     "kastanje",
     "peper",
     "rood",
     "donker",
     "bruin",
     "blond",
     "donkerblond",
     "lichtblond",
     "zwart",
     "kastanje",
     "donker",
     "peper",
     "bruin"
    ],
    "jongen": [
     "kastanje",
     "blond",
     "zwart",
     "rood",
     "bruin",
     "lichtblond",
     "donker",
     "donkerblond",
     "kastanje",
     "blond",
     "zwart",
     "rood"
    ],
    "meisje": [
     "blond",
     "bruin",
     "zwart",
     "rood",
     "kastanje",
     "lichtblond",
     "donker",
     "donkerblond",
     "blond",
     "bruin",
     "rood",
     "zwart"
    ],
    "kleuter": [
     "blond",
     "bruin",
     "rood",
     "zwart",
     "lichtblond",
     "kastanje",
     "donkerblond",
     "donker",
     "blond",
     "bruin",
     "rood",
     "lichtblond"
    ],
    "oudeman": [
     "grijs",
     "grijs",
     "peper",
     "grijs",
     "grijs",
     "peper",
     "grijs",
     "grijs",
     "peper",
     "grijs",
     "grijs",
     "peper"
    ],
    "oudevrouw": [
     "grijs",
     "grijs",
     "peper",
     "grijs",
     "grijs",
     "peper",
     "grijs",
     "grijs",
     "peper",
     "grijs",
     "grijs",
     "peper"
    ]
   },
   "kerstboom": {
    "bestand": "kerstboom.png",
    "cel": [
     133,
     282
    ],
    "anker": [
     59,
     273
    ]
   },
   "pestbos": {
    "bestand": "pestbos.png",
    "cel": [
     28,
     62
    ],
    "anker": [
     14,
     54
    ]
   },
   "kamp": {
    "bestand": "kamp.png",
    "cel": [
     224,
     160
    ],
    "anker": [
     112,
     112
    ],
    "richtingen": [
     "ZO",
     "ZW",
     "NW",
     "NO"
    ],
    "soorten": [
     "tent",
     "tent-bruin",
     "afdak"
    ],
    "vuur": {
     "bestand": "kampvuur.png",
     "cel": [
      80,
      112
     ],
     "anker": [
      40,
      88
     ],
     "beelden": 8,
     "fps": 10,
     "standen": [
      "brandt",
      "smeult",
      "uit"
     ]
    }
   },
   "stapels": {
    "bestand": "stapels.png",
    "cel": [
     80,
     60
    ],
    "anker": [
     40,
     44
    ],
    "waren": [
     "hout",
     "steen"
    ],
    "maten": [
     "klein",
     "half",
     "vol"
    ]
   },
   "lantaarn": {
    "bestand": "lantaarn.png",
    "cel": [
     22,
     30
    ],
    "anker": [
     10,
     3
    ],
    "vlammen": 2,
    "standen": [
     -1,
     0,
     1
    ],
    "lagen": [
     "heel",
     "gloed"
    ]
   },
   "bruggen": {
    "bestand": "bruggen.png",
    "maten": {
     "aanloop": 2,
     "dek": {
      "steen": 33,
      "juk": 22,
      "boog": 22
     },
     "bult": [
      3,
      2.5
     ],
     "schuinRijen": 4
    },
    "stukken": {
     "steen-veldsteen": {
      "x": {
       "L1": [
        "-1 0 0 444 3173 36 28 8 46",
        "-1 0 1 718 3528 11 13 -16 45",
        "-1 1 0 316 3465 39 17 7 35",
        "-1 2 0 554 1548 63 51 31 36",
        "-1 2 1 504 3201 33 28 29 34",
        "0 0 0 61 2322 60 41 32 60",
        "0 0 1 188 3515 13 13 -17 46",
        "0 1 0 789 2832 64 31 32 50",
        "0 2 0 882 779 62 65 30 50",
        "0 2 1 559 3256 36 25 29 46",
        "1 0 0 517 0 63 77 32 61",
        "1 0 1 468 3482 14 16 -17 18",
        "1 1 0 146 384 64 66 32 50",
        "1 2 0 944 779 62 65 30 50",
        "1 2 1 228 1387 36 54 29 44"
       ],
       "L2": [
        "-1 0 0 480 3173 36 28 8 46",
        "-1 0 1 729 3528 11 13 -16 45",
        "-1 1 0 355 3465 39 17 7 35",
        "-1 2 0 617 1548 63 51 31 36",
        "-1 2 1 537 3201 33 28 29 34",
        "0 0 0 121 2322 60 41 32 60",
        "0 0 1 201 3515 13 13 -17 46",
        "0 1 0 853 2832 64 31 32 50",
        "0 2 0 64 516 62 66 30 50",
        "0 2 1 595 3256 36 25 29 46",
        "1 0 0 190 1987 60 42 32 61",
        "1 0 1 214 3515 13 13 -17 46",
        "1 1 0 917 2832 64 31 32 50",
        "1 2 0 562 714 63 65 31 50",
        "1 2 1 960 3281 36 24 29 45",
        "2 0 0 580 0 63 77 32 61",
        "2 0 1 482 3482 14 16 -17 18",
        "2 1 0 210 384 64 66 32 50",
        "2 2 0 0 844 62 65 30 50",
        "2 2 1 264 1387 36 54 29 44"
       ],
       "L3": [
        "-1 0 0 516 3173 36 28 8 46",
        "-1 0 1 740 3528 11 13 -16 45",
        "-1 1 0 394 3465 39 17 7 35",
        "-1 2 0 680 1548 63 51 31 36",
        "-1 2 1 570 3201 33 28 29 34",
        "0 0 0 181 2322 60 41 32 60",
        "0 0 1 227 3515 13 13 -17 46",
        "0 1 0 0 2864 64 31 32 50",
        "0 2 0 126 516 62 66 30 50",
        "0 2 1 631 3256 36 25 29 46",
        "1 0 0 250 1987 60 42 32 61",
        "1 0 1 240 3515 13 13 -17 46",
        "1 1 0 64 2864 64 31 32 50",
        "1 2 0 188 516 62 66 30 50",
        "1 2 1 0 3306 36 24 29 45",
        "2 0 0 310 1987 60 42 32 61",
        "2 0 1 253 3515 13 13 -17 46",
        "2 1 0 128 2864 64 31 32 50",
        "2 2 0 625 714 63 65 31 50",
        "2 2 1 36 3306 36 24 29 45",
        "3 0 0 643 0 63 77 32 61",
        "3 0 1 496 3482 14 16 -17 18",
        "3 1 0 274 384 64 66 32 50",
        "3 2 0 62 844 62 65 30 50",
        "3 2 1 300 1387 36 54 29 44"
       ],
       "L5": [
        "-1 0 0 552 3173 36 28 8 46",
        "-1 0 1 751 3528 11 13 -16 45",
        "-1 1 0 433 3465 39 17 7 35",
        "-1 2 0 743 1548 63 51 31 36",
        "-1 2 1 603 3201 33 28 29 34",
        "0 0 0 241 2322 60 41 32 60",
        "0 0 1 266 3515 13 13 -17 46",
        "0 1 0 192 2864 64 31 32 50",
        "0 2 0 250 516 62 66 30 50",
        "0 2 1 667 3256 36 25 29 46",
        "1 0 0 370 1987 60 42 32 61",
        "1 0 1 279 3515 13 13 -17 46",
        "1 1 0 256 2864 64 31 32 50",
        "1 2 0 312 516 62 66 30 50",
        "1 2 1 72 3306 36 24 29 45",
        "2 0 0 430 1987 60 42 32 61",
        "2 0 1 292 3515 13 13 -17 46",
        "2 1 0 320 2864 64 31 32 50",
        "2 2 0 619 974 63 62 31 50",
        "2 2 1 108 3306 36 24 29 45",
        "3 0 0 772 2197 58 42 32 61",
        "3 0 1 441 3541 8 12 -17 45",
        "3 1 0 384 2864 64 31 32 50",
        "3 2 0 679 317 73 66 41 50",
        "3 2 1 928 3354 31 24 29 45",
        "4 0 0 490 1987 60 42 32 61",
        "4 0 1 305 3515 13 13 -17 46",
        "4 1 0 448 2864 64 31 32 50",
        "4 2 0 688 714 63 65 31 50",
        "4 2 1 144 3306 36 24 29 45",
        "5 0 0 706 0 63 77 32 61",
        "5 0 1 510 3482 14 16 -17 18",
        "5 1 0 338 384 64 66 32 50",
        "5 2 0 124 844 62 65 30 50",
        "5 2 1 336 1387 36 54 29 44"
       ],
       "L9": [
        "-1 0 0 588 3173 36 28 8 46",
        "-1 0 1 762 3528 11 13 -16 45",
        "-1 1 0 472 3465 39 17 7 35",
        "-1 2 0 806 1548 63 51 31 36",
        "-1 2 1 636 3201 33 28 29 34",
        "0 0 0 301 2322 60 41 32 60",
        "0 0 1 318 3515 13 13 -17 46",
        "0 1 0 512 2864 64 31 32 50",
        "0 2 0 374 516 62 66 30 50",
        "0 2 1 703 3256 36 25 29 46",
        "1 0 0 550 1987 60 42 32 61",
        "1 0 1 331 3515 13 13 -17 46",
        "1 1 0 576 2864 64 31 32 50",
        "1 2 0 869 1548 63 51 31 50",
        "1 2 1 180 3306 36 24 29 45",
        "2 0 0 610 1987 60 42 32 61",
        "2 0 1 344 3515 13 13 -17 46",
        "2 1 0 640 2864 64 31 32 50",
        "2 2 0 752 317 73 66 41 50",
        "2 2 1 216 3306 36 24 29 45",
        "3 0 0 830 2197 58 42 32 61",
        "3 0 1 449 3541 8 12 -17 45",
        "3 1 0 704 2864 64 31 32 50",
        "3 2 0 436 516 62 66 30 50",
        "3 2 1 959 3354 31 24 29 45",
        "4 0 0 670 1987 60 42 32 61",
        "4 0 1 357 3515 13 13 -17 46",
        "4 1 0 768 2864 64 31 32 50",
        "4 2 0 682 974 63 62 31 50",
        "4 2 1 252 3306 36 24 29 45",
        "5 0 0 232 2239 57 42 32 61",
        "5 0 1 256 3541 12 12 -17 45",
        "5 1 0 832 2864 64 31 32 50",
        "5 2 0 0 1101 73 60 41 50",
        "5 2 1 288 3306 36 24 29 45",
        "6 0 0 730 1987 60 42 32 61",
        "6 0 1 370 3515 13 13 -17 46",
        "6 1 0 896 2864 64 31 32 50",
        "6 2 0 745 974 63 62 31 50",
        "6 2 1 324 3306 36 24 29 45",
        "7 0 0 790 1987 60 42 32 61",
        "7 0 1 383 3515 13 13 -17 46",
        "7 1 0 960 2864 64 31 32 50",
        "7 2 0 73 1101 73 60 41 50",
        "7 2 1 360 3306 36 24 29 45",
        "8 0 0 850 1987 60 42 32 61",
        "8 0 1 280 3541 10 12 -17 45",
        "8 1 0 0 2895 64 31 32 50",
        "8 2 0 751 714 63 65 31 50",
        "8 2 1 540 3354 33 24 29 45",
        "9 0 0 636 165 63 75 32 59",
        "9 0 1 697 3499 14 14 -17 16",
        "9 1 0 402 384 64 66 32 50",
        "9 2 0 186 844 62 65 30 50",
        "9 2 1 372 1387 36 54 29 44"
       ]
      },
      "y": {
       "L1": [
        "-1 0 0 624 3173 36 28 28 46",
        "-1 0 1 773 3528 11 13 27 45",
        "-1 1 0 511 3465 39 17 32 35",
        "-1 2 0 932 1548 63 51 32 36",
        "-1 2 1 669 3201 33 28 4 34",
        "0 0 0 361 2322 60 41 28 60",
        "0 0 1 396 3515 13 13 30 46",
        "0 1 0 64 2895 64 31 32 50",
        "0 2 0 248 844 62 65 32 50",
        "0 2 1 739 3256 36 25 7 46",
        "1 0 0 769 0 63 77 31 61",
        "1 0 1 524 3482 14 16 31 18",
        "1 1 0 466 384 64 66 32 50",
        "1 2 0 310 844 62 65 32 50",
        "1 2 1 408 1387 36 54 7 44"
       ],
       "L2": [
        "-1 0 0 660 3173 36 28 28 46",
        "-1 0 1 784 3528 11 13 27 45",
        "-1 1 0 550 3465 39 17 32 35",
        "-1 2 0 0 1601 63 51 32 36",
        "-1 2 1 702 3201 33 28 4 34",
        "0 0 0 421 2322 60 41 28 60",
        "0 0 1 409 3515 13 13 30 46",
        "0 1 0 128 2895 64 31 32 50",
        "0 2 0 498 516 62 66 32 50",
        "0 2 1 775 3256 36 25 7 46",
        "1 0 0 910 1987 60 42 28 61",
        "1 0 1 422 3515 13 13 30 46",
        "1 1 0 192 2895 64 31 32 50",
        "1 2 0 814 714 63 65 32 50",
        "1 2 1 396 3306 36 24 7 45",
        "2 0 0 832 0 63 77 31 61",
        "2 0 1 538 3482 14 16 31 18",
        "2 1 0 530 384 64 66 32 50",
        "2 2 0 372 844 62 65 32 50",
        "2 2 1 444 1387 36 54 7 44"
       ],
       "L3": [
        "-1 0 0 696 3173 36 28 28 46",
        "-1 0 1 795 3528 11 13 27 45",
        "-1 1 0 589 3465 39 17 32 35",
        "-1 2 0 63 1601 63 51 32 36",
        "-1 2 1 735 3201 33 28 4 34",
        "0 0 0 481 2322 60 41 28 60",
        "0 0 1 435 3515 13 13 30 46",
        "0 1 0 256 2895 64 31 32 50",
        "0 2 0 560 516 62 66 32 50",
        "0 2 1 811 3256 36 25 7 46",
        "1 0 0 0 2029 60 42 28 61",
        "1 0 1 448 3515 13 13 30 46",
        "1 1 0 320 2895 64 31 32 50",
        "1 2 0 622 516 62 66 32 50",
        "1 2 1 432 3306 36 24 7 45",
        "2 0 0 60 2029 60 42 28 61",
        "2 0 1 461 3515 13 13 30 46",
        "2 1 0 384 2895 64 31 32 50",
        "2 2 0 877 714 63 65 32 50",
        "2 2 1 468 3306 36 24 7 45",
        "3 0 0 895 0 63 77 31 61",
        "3 0 1 552 3482 14 16 31 18",
        "3 1 0 594 384 64 66 32 50",
        "3 2 0 434 844 62 65 32 50",
        "3 2 1 480 1387 36 54 7 44"
       ],
       "L5": [
        "-1 0 0 732 3173 36 28 28 46",
        "-1 0 1 806 3528 11 13 27 45",
        "-1 1 0 628 3465 39 17 32 35",
        "-1 2 0 126 1601 63 51 32 36",
        "-1 2 1 768 3201 33 28 4 34",
        "0 0 0 541 2322 60 41 28 60",
        "0 0 1 474 3515 13 13 30 46",
        "0 1 0 448 2895 64 31 32 50",
        "0 2 0 684 516 62 66 32 50",
        "0 2 1 847 3256 36 25 7 46",
        "1 0 0 120 2029 60 42 28 61",
        "1 0 1 487 3515 13 13 30 46",
        "1 1 0 512 2895 64 31 32 50",
        "1 2 0 746 516 62 66 32 50",
        "1 2 1 504 3306 36 24 7 45",
        "2 0 0 180 2029 60 42 28 61",
        "2 0 1 500 3515 13 13 30 46",
        "2 1 0 576 2895 64 31 32 50",
        "2 2 0 808 974 63 62 32 50",
        "2 2 1 540 3306 36 24 7 45",
        "3 0 0 888 2197 58 42 26 61",
        "3 0 1 457 3541 8 12 25 45",
        "3 1 0 640 2895 64 31 32 50",
        "3 2 0 235 317 74 66 32 50",
        "3 2 1 990 3354 31 24 2 45",
        "4 0 0 240 2029 60 42 28 61",
        "4 0 1 513 3515 13 13 30 46",
        "4 1 0 704 2895 64 31 32 50",
        "4 2 0 940 714 63 65 32 50",
        "4 2 1 576 3306 36 24 7 45",
        "5 0 0 958 0 63 77 31 61",
        "5 0 1 566 3482 14 16 31 18",
        "5 1 0 658 384 64 66 32 50",
        "5 2 0 496 844 62 65 32 50",
        "5 2 1 516 1387 36 54 7 44"
       ],
       "L9": [
        "-1 0 0 768 3173 36 28 28 46",
        "-1 0 1 817 3528 11 13 27 45",
        "-1 1 0 667 3465 39 17 32 35",
        "-1 2 0 189 1601 63 51 32 36",
        "-1 2 1 801 3201 33 28 4 34",
        "0 0 0 601 2322 60 41 28 60",
        "0 0 1 526 3515 13 13 30 46",
        "0 1 0 768 2895 64 31 32 50",
        "0 2 0 808 516 62 66 32 50",
        "0 2 1 883 3256 36 25 7 46",
        "1 0 0 300 2029 60 42 28 61",
        "1 0 1 539 3515 13 13 30 46",
        "1 1 0 832 2895 64 31 32 50",
        "1 2 0 252 1601 63 51 32 50",
        "1 2 1 612 3306 36 24 7 45",
        "2 0 0 360 2029 60 42 28 61",
        "2 0 1 552 3515 13 13 30 46",
        "2 1 0 896 2895 64 31 32 50",
        "2 2 0 309 317 74 66 32 50",
        "2 2 1 648 3306 36 24 7 45",
        "3 0 0 946 2197 58 42 26 61",
        "3 0 1 465 3541 8 12 25 45",
        "3 1 0 960 2895 64 31 32 50",
        "3 2 0 870 516 62 66 32 50",
        "3 2 1 0 3378 31 24 2 45",
        "4 0 0 420 2029 60 42 28 61",
        "4 0 1 565 3515 13 13 30 46",
        "4 1 0 0 2926 64 31 32 50",
        "4 2 0 871 974 63 62 32 50",
        "4 2 1 684 3306 36 24 7 45",
        "5 0 0 289 2239 57 42 25 61",
        "5 0 1 268 3541 12 12 29 45",
        "5 1 0 64 2926 64 31 32 50",
        "5 2 0 567 1039 74 60 32 50",
        "5 2 1 720 3306 36 24 7 45",
        "6 0 0 480 2029 60 42 28 61",
        "6 0 1 578 3515 13 13 30 46",
        "6 1 0 128 2926 64 31 32 50",
        "6 2 0 363 974 64 62 32 50",
        "6 2 1 756 3306 36 24 7 45",
        "7 0 0 540 2029 60 42 28 61",
        "7 0 1 591 3515 13 13 30 46",
        "7 1 0 192 2926 64 31 32 50",
        "7 2 0 641 1039 74 60 32 50",
        "7 2 1 792 3306 36 24 7 45",
        "8 0 0 600 2029 60 42 28 61",
        "8 0 1 290 3541 10 12 27 45",
        "8 1 0 256 2926 64 31 32 50",
        "8 2 0 306 714 64 65 32 50",
        "8 2 1 573 3354 33 24 4 45",
        "9 0 0 699 165 63 75 31 59",
        "9 0 1 711 3499 14 14 31 16",
        "9 1 0 722 384 64 66 32 50",
        "9 2 0 558 844 62 65 32 50",
        "9 2 1 552 1387 36 54 7 44"
       ]
      },
      "zn": {
       "L1": [
        "-1 1 0 893 3499 47 13 23 32",
        "-1 3 0 565 3499 33 14 6 31",
        "-1 3 1 300 3541 10 12 15 41",
        "0 0 0 467 2404 46 40 31 57",
        "0 0 1 860 3482 10 16 -5 45",
        "0 1 0 533 2521 63 37 31 51",
        "0 2 0 320 3143 63 28 32 47",
        "0 3 0 476 1754 46 49 15 61",
        "0 3 1 523 3424 9 21 15 45",
        "1 0 0 0 0 47 88 32 61",
        "1 0 1 257 1161 9 59 -6 40",
        "1 1 0 288 1441 64 53 32 45",
        "1 2 0 252 165 64 75 32 51",
        "1 3 0 0 317 47 67 15 56",
        "1 3 1 369 3402 9 22 15 19"
       ],
       "L3": [
        "-1 1 0 940 3499 47 13 23 32",
        "-1 3 0 598 3499 33 14 6 31",
        "-1 3 1 310 3541 10 12 15 41",
        "0 0 0 513 2404 46 40 31 57",
        "0 0 1 870 3482 10 16 -5 45",
        "0 1 0 773 2702 63 32 31 51",
        "0 2 0 383 3143 63 28 32 47",
        "0 3 0 762 165 59 75 28 61",
        "0 3 1 920 3482 9 16 15 45",
        "1 0 0 684 1101 59 59 31 61",
        "1 0 1 929 3482 9 16 -6 45",
        "1 1 0 836 2702 63 32 31 51",
        "1 2 0 899 2702 63 32 32 51",
        "1 3 0 821 165 59 75 28 61",
        "1 3 1 956 3482 8 16 14 45",
        "2 0 0 743 1101 59 59 31 61",
        "2 0 1 964 3482 8 16 -6 45",
        "2 1 0 596 2521 63 37 31 51",
        "2 2 0 0 2736 63 32 32 51",
        "2 3 0 660 1754 45 49 14 61",
        "2 3 1 312 3143 8 29 14 45",
        "3 0 0 47 0 47 88 32 61",
        "3 0 1 890 1277 11 55 -6 36",
        "3 1 0 352 1441 64 53 32 45",
        "3 2 0 316 165 64 75 32 51",
        "3 3 0 316 974 47 63 15 52",
        "3 3 1 378 3402 9 22 15 19"
       ]
      },
      "wo": {
       "L1": [
        "-1 0 0 455 1277 49 55 17 48",
        "-1 1 0 750 1754 80 48 49 45",
        "-1 2 0 800 2483 49 38 17 30",
        "-1 3 0 448 1220 122 56 49 46",
        "-1 3 1 0 1944 81 43 49 42",
        "0 0 0 450 2667 64 34 32 53",
        "0 1 0 221 3112 62 30 31 49",
        "0 2 0 63 3256 62 25 31 51",
        "0 3 0 284 1161 64 58 32 51",
        "0 3 1 869 3445 64 17 32 42",
        "1 0 0 851 1161 81 57 32 53",
        "1 1 0 481 2559 49 37 32 30",
        "1 2 0 445 1703 80 50 31 46",
        "1 3 0 530 2559 49 37 32 27",
        "1 3 1 849 2483 49 38 32 37"
       ],
       "L3": [
        "-1 0 0 504 1277 49 55 17 48",
        "-1 1 0 830 1754 80 48 49 45",
        "-1 2 0 898 2483 49 38 17 30",
        "-1 3 0 814 1220 119 56 49 46",
        "-1 3 1 81 1944 81 43 49 42",
        "0 0 0 514 2667 64 34 32 53",
        "0 1 0 283 3112 62 30 31 49",
        "0 2 0 125 3256 62 25 31 51",
        "0 3 0 0 714 102 65 32 51",
        "0 3 1 842 3528 64 12 32 42",
        "1 0 0 578 2667 64 34 32 53",
        "1 1 0 345 3112 62 30 31 49",
        "1 2 0 501 3229 62 26 31 51",
        "1 3 0 682 648 105 65 32 51",
        "1 3 1 906 3528 64 12 32 42",
        "2 0 0 642 2667 64 34 32 53",
        "2 1 0 407 3112 62 30 31 49",
        "2 2 0 187 3256 62 25 31 51",
        "2 3 0 348 1161 64 58 32 51",
        "2 3 1 933 3445 64 17 32 42",
        "3 0 0 932 1161 81 57 32 53",
        "3 1 0 579 2559 49 37 32 30",
        "3 2 0 525 1703 80 50 31 46",
        "3 3 0 628 2559 49 37 32 27",
        "3 3 1 947 2483 49 38 32 37"
       ]
      }
     },
     "steen-zandsteen": {
      "x": {
       "L1": [
        "-1 0 0 698 3143 37 28 8 46",
        "-1 0 1 604 3515 13 13 -16 45",
        "-1 1 0 706 3465 39 17 7 35",
        "-1 2 0 315 1601 63 51 31 36",
        "-1 2 1 804 3173 36 28 29 34",
        "0 0 0 660 2029 60 42 32 61",
        "0 0 1 617 3515 13 13 -17 46",
        "0 1 0 320 2926 64 31 32 50",
        "0 2 0 620 844 62 65 30 50",
        "0 2 1 919 3256 36 25 29 46",
        "1 0 0 0 88 63 77 32 61",
        "1 0 1 580 3482 14 16 -17 18",
        "1 1 0 786 384 64 66 32 50",
        "1 2 0 682 844 62 65 30 50",
        "1 2 1 588 1387 36 54 29 44"
       ],
       "L2": [
        "-1 0 0 735 3143 37 28 8 46",
        "-1 0 1 630 3515 13 13 -16 45",
        "-1 1 0 745 3465 39 17 7 35",
        "-1 2 0 378 1601 63 51 31 36",
        "-1 2 1 840 3173 36 28 29 34",
        "0 0 0 720 2029 60 42 32 61",
        "0 0 1 643 3515 13 13 -17 46",
        "0 1 0 384 2926 64 31 32 50",
        "0 2 0 932 516 62 66 30 50",
        "0 2 1 955 3256 36 25 29 46",
        "1 0 0 780 2029 60 42 32 61",
        "1 0 1 656 3515 13 13 -17 46",
        "1 1 0 448 2926 64 31 32 50",
        "1 2 0 0 779 63 65 31 50",
        "1 2 1 828 3306 36 24 29 45",
        "2 0 0 63 88 63 77 32 61",
        "2 0 1 594 3482 14 16 -17 18",
        "2 1 0 850 384 64 66 32 50",
        "2 2 0 744 844 62 65 30 50",
        "2 2 1 624 1387 36 54 29 44"
       ],
       "L3": [
        "-1 0 0 772 3143 37 28 8 46",
        "-1 0 1 669 3515 13 13 -16 45",
        "-1 1 0 784 3465 39 17 7 35",
        "-1 2 0 441 1601 63 51 31 36",
        "-1 2 1 876 3173 36 28 29 34",
        "0 0 0 840 2029 60 42 32 61",
        "0 0 1 682 3515 13 13 -17 46",
        "0 1 0 512 2926 64 31 32 50",
        "0 2 0 0 582 62 66 30 50",
        "0 2 1 0 3281 36 25 29 46",
        "1 0 0 900 2029 60 42 32 61",
        "1 0 1 695 3515 13 13 -17 46",
        "1 1 0 576 2926 64 31 32 50",
        "1 2 0 62 582 62 66 30 50",
        "1 2 1 864 3306 36 24 29 45",
        "2 0 0 960 2029 60 42 32 61",
        "2 0 1 708 3515 13 13 -17 46",
        "2 1 0 640 2926 64 31 32 50",
        "2 2 0 63 779 63 65 31 50",
        "2 2 1 900 3306 36 24 29 45",
        "3 0 0 126 88 63 77 32 61",
        "3 0 1 608 3482 14 16 -17 18",
        "3 1 0 914 384 64 66 32 50",
        "3 2 0 806 844 62 65 30 50",
        "3 2 1 660 1387 36 54 29 44"
       ],
       "L5": [
        "-1 0 0 809 3143 37 28 8 46",
        "-1 0 1 721 3515 13 13 -16 45",
        "-1 1 0 823 3465 39 17 7 35",
        "-1 2 0 504 1601 63 51 31 36",
        "-1 2 1 912 3173 36 28 29 34",
        "0 0 0 0 2071 60 42 32 61",
        "0 0 1 734 3515 13 13 -17 46",
        "0 1 0 704 2926 64 31 32 50",
        "0 2 0 124 582 62 66 30 50",
        "0 2 1 36 3281 36 25 29 46",
        "1 0 0 60 2071 60 42 32 61",
        "1 0 1 747 3515 13 13 -17 46",
        "1 1 0 768 2926 64 31 32 50",
        "1 2 0 186 582 62 66 30 50",
        "1 2 1 936 3306 36 24 29 45",
        "2 0 0 120 2071 60 42 32 61",
        "2 0 1 760 3515 13 13 -17 46",
        "2 1 0 832 2926 64 31 32 50",
        "2 2 0 934 974 63 62 31 50",
        "2 2 1 972 3306 36 24 29 45",
        "3 0 0 0 2239 58 42 32 61",
        "3 0 1 473 3541 8 12 -17 45",
        "3 1 0 896 2926 64 31 32 50",
        "3 2 0 825 317 73 66 41 50",
        "3 2 1 31 3378 31 24 29 45",
        "4 0 0 180 2071 60 42 32 61",
        "4 0 1 773 3515 13 13 -17 46",
        "4 1 0 960 2926 64 31 32 50",
        "4 2 0 126 779 63 65 31 50",
        "4 2 1 0 3330 36 24 29 45",
        "5 0 0 189 88 63 77 32 61",
        "5 0 1 622 3482 14 16 -17 18",
        "5 1 0 0 450 64 66 32 50",
        "5 2 0 868 844 62 65 30 50",
        "5 2 1 696 1387 36 54 29 44"
       ],
       "L9": [
        "-1 0 0 846 3143 37 28 8 46",
        "-1 0 1 786 3515 13 13 -16 45",
        "-1 1 0 862 3465 39 17 7 35",
        "-1 2 0 567 1601 63 51 31 36",
        "-1 2 1 948 3173 36 28 29 34",
        "0 0 0 240 2071 60 42 32 61",
        "0 0 1 799 3515 13 13 -17 46",
        "0 1 0 0 2957 64 31 32 50",
        "0 2 0 248 582 62 66 30 50",
        "0 2 1 72 3281 36 25 29 46",
        "1 0 0 300 2071 60 42 32 61",
        "1 0 1 812 3515 13 13 -17 46",
        "1 1 0 64 2957 64 31 32 50",
        "1 2 0 630 1601 63 51 31 50",
        "1 2 1 36 3330 36 24 29 45",
        "2 0 0 360 2071 60 42 32 61",
        "2 0 1 825 3515 13 13 -17 46",
        "2 1 0 128 2957 64 31 32 50",
        "2 2 0 898 317 73 66 41 50",
        "2 2 1 72 3330 36 24 29 45",
        "3 0 0 58 2239 58 42 32 61",
        "3 0 1 481 3541 8 12 -17 45",
        "3 1 0 192 2957 64 31 32 50",
        "3 2 0 310 582 62 66 30 50",
        "3 2 1 62 3378 31 24 29 45",
        "4 0 0 420 2071 60 42 32 61",
        "4 0 1 838 3515 13 13 -17 46",
        "4 1 0 256 2957 64 31 32 50",
        "4 2 0 0 1039 63 62 31 50",
        "4 2 1 108 3330 36 24 29 45",
        "5 0 0 480 2071 60 42 32 61",
        "5 0 1 851 3515 13 13 -17 46",
        "5 1 0 320 2957 64 31 32 50",
        "5 2 0 146 1101 73 60 41 50",
        "5 2 1 144 3330 36 24 29 45",
        "6 0 0 540 2071 60 42 32 61",
        "6 0 1 864 3515 13 13 -17 46",
        "6 1 0 384 2957 64 31 32 50",
        "6 2 0 63 1039 63 62 31 50",
        "6 2 1 180 3330 36 24 29 45",
        "7 0 0 600 2071 60 42 32 61",
        "7 0 1 877 3515 13 13 -17 46",
        "7 1 0 448 2957 64 31 32 50",
        "7 2 0 219 1101 73 60 41 50",
        "7 2 1 216 3330 36 24 29 45",
        "8 0 0 660 2071 60 42 32 61",
        "8 0 1 890 3515 13 13 -17 46",
        "8 1 0 512 2957 64 31 32 50",
        "8 2 0 189 779 63 65 31 50",
        "8 2 1 252 3330 36 24 29 45",
        "9 0 0 252 88 63 77 32 61",
        "9 0 1 636 3482 14 16 -17 18",
        "9 1 0 64 450 64 66 32 50",
        "9 2 0 930 844 62 65 30 50",
        "9 2 1 732 1387 36 54 29 44"
       ]
      },
      "y": {
       "L1": [
        "-1 0 0 883 3143 37 28 29 46",
        "-1 0 1 903 3515 13 13 29 45",
        "-1 1 0 901 3465 39 17 32 35",
        "-1 2 0 693 1601 63 51 32 36",
        "-1 2 1 984 3173 36 28 7 34",
        "0 0 0 720 2071 60 42 28 61",
        "0 0 1 916 3515 13 13 30 46",
        "0 1 0 576 2957 64 31 32 50",
        "0 2 0 0 909 62 65 32 50",
        "0 2 1 108 3281 36 25 7 46",
        "1 0 0 315 88 63 77 31 61",
        "1 0 1 650 3482 14 16 31 18",
        "1 1 0 128 450 64 66 32 50",
        "1 2 0 62 909 62 65 32 50",
        "1 2 1 768 1387 36 54 7 44"
       ],
       "L2": [
        "-1 0 0 920 3143 37 28 29 46",
        "-1 0 1 929 3515 13 13 29 45",
        "-1 1 0 940 3465 39 17 32 35",
        "-1 2 0 756 1601 63 51 32 36",
        "-1 2 1 0 3201 36 28 7 34",
        "0 0 0 780 2071 60 42 28 61",
        "0 0 1 942 3515 13 13 30 46",
        "0 1 0 640 2957 64 31 32 50",
        "0 2 0 372 582 62 66 32 50",
        "0 2 1 144 3281 36 25 7 46",
        "1 0 0 840 2071 60 42 28 61",
        "1 0 1 955 3515 13 13 30 46",
        "1 1 0 704 2957 64 31 32 50",
        "1 2 0 252 779 63 65 32 50",
        "1 2 1 288 3330 36 24 7 45",
        "2 0 0 378 88 63 77 31 61",
        "2 0 1 664 3482 14 16 31 18",
        "2 1 0 192 450 64 66 32 50",
        "2 2 0 124 909 62 65 32 50",
        "2 2 1 804 1387 36 54 7 44"
       ],
       "L3": [
        "-1 0 0 957 3143 37 28 29 46",
        "-1 0 1 968 3515 13 13 29 45",
        "-1 1 0 979 3465 39 17 32 35",
        "-1 2 0 819 1601 63 51 32 36",
        "-1 2 1 36 3201 36 28 7 34",
        "0 0 0 900 2071 60 42 28 61",
        "0 0 1 981 3515 13 13 30 46",
        "0 1 0 768 2957 64 31 32 50",
        "0 2 0 434 582 62 66 32 50",
        "0 2 1 180 3281 36 25 7 46",
        "1 0 0 960 2071 60 42 28 61",
        "1 0 1 994 3515 13 13 30 46",
        "1 1 0 832 2957 64 31 32 50",
        "1 2 0 496 582 62 66 32 50",
        "1 2 1 324 3330 36 24 7 45",
        "2 0 0 0 2113 60 42 28 61",
        "2 0 1 1007 3515 13 13 30 46",
        "2 1 0 896 2957 64 31 32 50",
        "2 2 0 315 779 63 65 32 50",
        "2 2 1 360 3330 36 24 7 45",
        "3 0 0 441 88 63 77 31 61",
        "3 0 1 678 3482 14 16 31 18",
        "3 1 0 256 450 64 66 32 50",
        "3 2 0 186 909 62 65 32 50",
        "3 2 1 840 1387 36 54 7 44"
       ],
       "L5": [
        "-1 0 0 0 3173 37 28 29 46",
        "-1 0 1 0 3528 13 13 29 45",
        "-1 1 0 0 3482 39 17 32 35",
        "-1 2 0 882 1601 63 51 32 36",
        "-1 2 1 72 3201 36 28 7 34",
        "0 0 0 60 2113 60 42 28 61",
        "0 0 1 13 3528 13 13 30 46",
        "0 1 0 960 2957 64 31 32 50",
        "0 2 0 558 582 62 66 32 50",
        "0 2 1 216 3281 36 25 7 46",
        "1 0 0 120 2113 60 42 28 61",
        "1 0 1 26 3528 13 13 30 46",
        "1 1 0 0 2988 64 31 32 50",
        "1 2 0 620 582 62 66 32 50",
        "1 2 1 396 3330 36 24 7 45",
        "2 0 0 180 2113 60 42 28 61",
        "2 0 1 39 3528 13 13 30 46",
        "2 1 0 64 2988 64 31 32 50",
        "2 2 0 126 1039 63 62 32 50",
        "2 2 1 432 3330 36 24 7 45",
        "3 0 0 116 2239 58 42 26 61",
        "3 0 1 489 3541 8 12 25 45",
        "3 1 0 128 2988 64 31 32 50",
        "3 2 0 383 317 74 66 32 50",
        "3 2 1 93 3378 31 24 2 45",
        "4 0 0 240 2113 60 42 28 61",
        "4 0 1 52 3528 13 13 30 46",
        "4 1 0 192 2988 64 31 32 50",
        "4 2 0 378 779 63 65 32 50",
        "4 2 1 468 3330 36 24 7 45",
        "5 0 0 504 88 63 77 31 61",
        "5 0 1 692 3482 14 16 31 18",
        "5 1 0 320 450 64 66 32 50",
        "5 2 0 248 909 62 65 32 50",
        "5 2 1 876 1387 36 54 7 44"
       ],
       "L9": [
        "-1 0 0 37 3173 37 28 29 46",
        "-1 0 1 65 3528 13 13 29 45",
        "-1 1 0 39 3482 39 17 32 35",
        "-1 2 0 945 1601 63 51 32 36",
        "-1 2 1 108 3201 36 28 7 34",
        "0 0 0 300 2113 60 42 28 61",
        "0 0 1 78 3528 13 13 30 46",
        "0 1 0 256 2988 64 31 32 50",
        "0 2 0 682 582 62 66 32 50",
        "0 2 1 252 3281 36 25 7 46",
        "1 0 0 360 2113 60 42 28 61",
        "1 0 1 91 3528 13 13 30 46",
        "1 1 0 320 2988 64 31 32 50",
        "1 2 0 0 1652 63 51 32 50",
        "1 2 1 504 3330 36 24 7 45",
        "2 0 0 420 2113 60 42 28 61",
        "2 0 1 104 3528 13 13 30 46",
        "2 1 0 384 2988 64 31 32 50",
        "2 2 0 457 317 74 66 32 50",
        "2 2 1 540 3330 36 24 7 45",
        "3 0 0 174 2239 58 42 26 61",
        "3 0 1 497 3541 8 12 25 45",
        "3 1 0 448 2988 64 31 32 50",
        "3 2 0 744 582 62 66 32 50",
        "3 2 1 124 3378 31 24 2 45",
        "4 0 0 480 2113 60 42 28 61",
        "4 0 1 117 3528 13 13 30 46",
        "4 1 0 512 2988 64 31 32 50",
        "4 2 0 189 1039 63 62 32 50",
        "4 2 1 576 3330 36 24 7 45",
        "5 0 0 540 2113 60 42 28 61",
        "5 0 1 130 3528 13 13 30 46",
        "5 1 0 576 2988 64 31 32 50",
        "5 2 0 715 1039 74 60 32 50",
        "5 2 1 612 3330 36 24 7 45",
        "6 0 0 600 2113 60 42 28 61",
        "6 0 1 143 3528 13 13 30 46",
        "6 1 0 640 2988 64 31 32 50",
        "6 2 0 427 974 64 62 32 50",
        "6 2 1 648 3330 36 24 7 45",
        "7 0 0 660 2113 60 42 28 61",
        "7 0 1 156 3528 13 13 30 46",
        "7 1 0 704 2988 64 31 32 50",
        "7 2 0 789 1039 74 60 32 50",
        "7 2 1 684 3330 36 24 7 45",
        "8 0 0 720 2113 60 42 28 61",
        "8 0 1 169 3528 13 13 30 46",
        "8 1 0 768 2988 64 31 32 50",
        "8 2 0 370 714 64 65 32 50",
        "8 2 1 720 3330 36 24 7 45",
        "9 0 0 567 88 63 77 31 61",
        "9 0 1 706 3482 14 16 31 18",
        "9 1 0 384 450 64 66 32 50",
        "9 2 0 310 909 62 65 32 50",
        "9 2 1 912 1387 36 54 7 44"
       ]
      },
      "zn": {
       "L1": [
        "-1 1 0 0 3515 47 13 23 32",
        "-1 3 0 481 3499 42 14 15 31",
        "-1 3 1 320 3541 10 12 15 41",
        "0 0 0 559 2404 46 40 31 57",
        "0 0 1 880 3482 10 16 -5 45",
        "0 1 0 659 2521 63 37 31 51",
        "0 2 0 446 3143 63 28 32 47",
        "0 3 0 522 1754 46 49 15 61",
        "0 3 1 532 3424 9 21 15 45",
        "1 0 0 94 0 47 88 32 61",
        "1 0 1 266 1161 9 59 -6 40",
        "1 1 0 416 1441 64 53 32 45",
        "1 2 0 380 165 64 75 32 51",
        "1 3 0 47 317 47 67 15 56",
        "1 3 1 462 3445 9 20 15 17"
       ],
       "L3": [
        "-1 1 0 47 3515 47 13 23 32",
        "-1 3 0 523 3499 42 14 15 31",
        "-1 3 1 330 3541 10 12 15 41",
        "0 0 0 605 2404 46 40 31 57",
        "0 0 1 890 3482 10 16 -5 45",
        "0 1 0 63 2736 63 32 31 51",
        "0 2 0 509 3143 63 28 32 47",
        "0 3 0 880 165 59 75 28 61",
        "0 3 1 938 3482 9 16 15 45",
        "1 0 0 802 1101 59 59 31 61",
        "1 0 1 828 3528 9 13 -6 45",
        "1 1 0 126 2736 63 32 31 51",
        "1 2 0 189 2736 63 32 32 51",
        "1 3 0 939 165 59 75 28 61",
        "1 3 1 24 3499 8 15 14 44",
        "2 0 0 792 1161 59 58 31 60",
        "2 0 1 505 3541 8 12 -6 41",
        "2 1 0 722 2521 63 37 31 51",
        "2 2 0 252 2736 63 32 32 51",
        "2 3 0 956 1899 45 45 14 57",
        "2 3 1 541 3424 8 21 14 45",
        "3 0 0 141 0 47 88 32 61",
        "3 0 1 235 1161 11 59 -6 40",
        "3 1 0 480 1441 64 53 32 45",
        "3 2 0 444 165 64 75 32 51",
        "3 3 0 94 317 47 67 15 56",
        "3 3 1 387 3402 9 22 15 19"
       ]
      },
      "wo": {
       "L1": [
        "-1 0 0 553 1277 49 55 17 48",
        "-1 1 0 910 1754 80 48 49 45",
        "-1 2 0 888 2632 49 35 17 30",
        "-1 3 0 570 1220 122 56 49 46",
        "-1 3 1 162 1944 81 43 49 42",
        "0 0 0 706 2667 64 34 32 53",
        "0 1 0 469 3112 62 30 31 49",
        "0 2 0 63 2768 62 32 31 51",
        "0 3 0 412 1161 64 58 32 51",
        "0 3 1 0 3465 64 17 32 42",
        "1 0 0 0 1220 81 57 32 53",
        "1 1 0 677 2559 49 37 32 30",
        "1 2 0 605 1703 80 50 31 46",
        "1 3 0 120 2444 49 39 32 29",
        "1 3 1 0 2521 49 38 32 37"
       ],
       "L3": [
        "-1 0 0 602 1277 49 55 17 48",
        "-1 1 0 0 1804 80 48 49 45",
        "-1 2 0 937 2632 49 35 17 30",
        "-1 3 0 0 1277 119 56 49 46",
        "-1 3 1 243 1944 81 43 49 42",
        "0 0 0 770 2667 64 34 32 53",
        "0 1 0 531 3112 62 30 31 49",
        "0 2 0 125 2768 62 32 31 51",
        "0 3 0 102 714 102 65 32 51",
        "0 3 1 0 3541 64 12 32 42",
        "1 0 0 834 2667 64 34 32 53",
        "1 1 0 593 3112 62 30 31 49",
        "1 2 0 187 2768 62 32 31 51",
        "1 3 0 787 648 105 65 32 51",
        "1 3 1 64 3541 64 12 32 42",
        "2 0 0 898 2667 64 34 32 53",
        "2 1 0 655 3112 62 30 31 49",
        "2 2 0 249 3256 62 25 31 51",
        "2 3 0 476 1161 64 58 32 51",
        "2 3 1 64 3465 64 17 32 42",
        "3 0 0 81 1220 81 57 32 53",
        "3 1 0 726 2559 49 37 32 30",
        "3 2 0 685 1703 80 50 31 46",
        "3 3 0 775 2559 49 37 32 27",
        "3 3 1 49 2521 49 38 32 37"
       ]
      }
     },
     "steen-baksteen": {
      "x": {
       "L1": [
        "-1 0 0 74 3173 37 28 8 46",
        "-1 0 1 598 3528 12 13 -17 45",
        "-1 1 0 78 3482 39 17 7 35",
        "-1 2 0 63 1652 63 51 31 36",
        "-1 2 1 144 3201 36 28 29 34",
        "0 0 0 780 2113 60 42 32 61",
        "0 0 1 182 3528 13 13 -17 46",
        "0 1 0 832 2988 64 31 32 50",
        "0 2 0 372 909 62 65 30 50",
        "0 2 1 288 3281 36 25 29 46",
        "1 0 0 630 88 63 77 32 61",
        "1 0 1 720 3482 14 16 -17 18",
        "1 1 0 448 450 64 66 32 50",
        "1 2 0 434 909 62 65 30 50",
        "1 2 1 948 1387 36 54 29 44"
       ],
       "L2": [
        "-1 0 0 111 3173 37 28 8 46",
        "-1 0 1 610 3528 12 13 -17 45",
        "-1 1 0 117 3482 39 17 7 35",
        "-1 2 0 126 1652 63 51 31 36",
        "-1 2 1 180 3201 36 28 29 34",
        "0 0 0 840 2113 60 42 32 61",
        "0 0 1 195 3528 13 13 -17 46",
        "0 1 0 896 2988 64 31 32 50",
        "0 2 0 806 582 62 66 30 50",
        "0 2 1 324 3281 36 25 29 46",
        "1 0 0 300 2197 59 42 32 61",
        "1 0 1 360 3541 9 12 -17 45",
        "1 1 0 960 2988 64 31 32 50",
        "1 2 0 441 779 63 65 31 50",
        "1 2 1 672 3354 32 24 29 45",
        "2 0 0 126 165 63 76 32 60",
        "2 0 1 734 3482 14 16 -17 18",
        "2 1 0 512 450 64 66 32 50",
        "2 2 0 496 909 62 65 30 50",
        "2 2 1 984 1387 36 54 29 44"
       ],
       "L3": [
        "-1 0 0 148 3173 37 28 8 46",
        "-1 0 1 622 3528 12 13 -17 45",
        "-1 1 0 156 3482 39 17 7 35",
        "-1 2 0 189 1652 63 51 31 36",
        "-1 2 1 216 3201 36 28 29 34",
        "0 0 0 900 2113 60 42 32 61",
        "0 0 1 208 3528 13 13 -17 46",
        "0 1 0 0 3019 64 31 32 50",
        "0 2 0 868 582 62 66 30 50",
        "0 2 1 360 3281 36 25 29 46",
        "1 0 0 359 2197 59 42 32 61",
        "1 0 1 369 3541 9 12 -17 45",
        "1 1 0 64 3019 64 31 32 50",
        "1 2 0 930 582 62 66 30 50",
        "1 2 1 704 3354 32 24 29 45",
        "2 0 0 661 2322 60 41 32 60",
        "2 0 1 221 3528 13 13 -17 46",
        "2 1 0 128 3019 64 31 32 50",
        "2 2 0 504 779 63 65 31 50",
        "2 2 1 756 3330 36 24 29 45",
        "3 0 0 693 88 63 77 32 61",
        "3 0 1 748 3482 14 16 -17 18",
        "3 1 0 576 450 64 66 32 50",
        "3 2 0 558 909 62 65 30 50",
        "3 2 1 0 1441 36 54 29 44"
       ],
       "L5": [
        "-1 0 0 185 3173 37 28 8 46",
        "-1 0 1 634 3528 12 13 -17 45",
        "-1 1 0 195 3482 39 17 7 35",
        "-1 2 0 252 1652 63 51 31 36",
        "-1 2 1 252 3201 36 28 29 34",
        "0 0 0 960 2113 60 42 32 61",
        "0 0 1 234 3528 13 13 -17 46",
        "0 1 0 192 3019 64 31 32 50",
        "0 2 0 0 648 62 66 30 50",
        "0 2 1 396 3281 36 25 29 46",
        "1 0 0 418 2197 59 42 32 61",
        "1 0 1 378 3541 9 12 -17 45",
        "1 1 0 256 3019 64 31 32 50",
        "1 2 0 62 648 62 66 30 50",
        "1 2 1 736 3354 32 24 29 45",
        "2 0 0 721 2322 60 41 32 60",
        "2 0 1 247 3528 13 13 -17 46",
        "2 1 0 320 3019 64 31 32 50",
        "2 2 0 252 1039 63 62 31 50",
        "2 2 1 792 3330 36 24 29 45",
        "3 0 0 0 2155 60 42 32 61",
        "3 0 1 260 3528 13 13 -17 46",
        "3 1 0 384 3019 64 31 32 50",
        "3 2 0 0 384 73 66 41 50",
        "3 2 1 828 3330 36 24 29 45",
        "4 0 0 60 2155 60 42 32 61",
        "4 0 1 273 3528 13 13 -17 46",
        "4 1 0 448 3019 64 31 32 50",
        "4 2 0 567 779 63 65 31 50",
        "4 2 1 864 3330 36 24 29 45",
        "5 0 0 756 88 63 77 32 61",
        "5 0 1 762 3482 14 16 -17 18",
        "5 1 0 640 450 64 66 32 50",
        "5 2 0 620 909 62 65 30 50",
        "5 2 1 36 1441 36 54 29 44"
       ],
       "L9": [
        "-1 0 0 222 3173 37 28 8 46",
        "-1 0 1 646 3528 12 13 -17 45",
        "-1 1 0 234 3482 39 17 7 35",
        "-1 2 0 315 1652 63 51 31 36",
        "-1 2 1 288 3201 36 28 29 34",
        "0 0 0 120 2155 60 42 32 61",
        "0 0 1 286 3528 13 13 -17 46",
        "0 1 0 512 3019 64 31 32 50",
        "0 2 0 124 648 62 66 30 50",
        "0 2 1 432 3281 36 25 29 46",
        "1 0 0 477 2197 59 42 32 61",
        "1 0 1 387 3541 9 12 -17 45",
        "1 1 0 576 3019 64 31 32 50",
        "1 2 0 378 1652 63 51 31 50",
        "1 2 1 768 3354 32 24 29 45",
        "2 0 0 781 2322 60 41 32 60",
        "2 0 1 299 3528 13 13 -17 46",
        "2 1 0 640 3019 64 31 32 50",
        "2 2 0 73 384 73 66 41 50",
        "2 2 1 900 3330 36 24 29 45",
        "3 0 0 180 2155 60 42 32 61",
        "3 0 1 312 3528 13 13 -17 46",
        "3 1 0 704 3019 64 31 32 50",
        "3 2 0 186 648 62 66 30 50",
        "3 2 1 936 3330 36 24 29 45",
        "4 0 0 240 2155 60 42 32 61",
        "4 0 1 325 3528 13 13 -17 46",
        "4 1 0 768 3019 64 31 32 50",
        "4 2 0 315 1039 63 62 31 50",
        "4 2 1 972 3330 36 24 29 45",
        "5 0 0 300 2155 60 42 32 61",
        "5 0 1 338 3528 13 13 -17 46",
        "5 1 0 832 3019 64 31 32 50",
        "5 2 0 292 1101 73 60 41 50",
        "5 2 1 0 3354 36 24 29 45",
        "6 0 0 360 2155 60 42 32 61",
        "6 0 1 351 3528 13 13 -17 46",
        "6 1 0 896 3019 64 31 32 50",
        "6 2 0 378 1039 63 62 31 50",
        "6 2 1 36 3354 36 24 29 45",
        "7 0 0 420 2155 60 42 32 61",
        "7 0 1 364 3528 13 13 -17 46",
        "7 1 0 960 3019 64 31 32 50",
        "7 2 0 365 1101 73 60 41 50",
        "7 2 1 72 3354 36 24 29 45",
        "8 0 0 480 2155 60 42 32 61",
        "8 0 1 377 3528 13 13 -17 46",
        "8 1 0 0 3050 64 31 32 50",
        "8 2 0 630 779 63 65 31 50",
        "8 2 1 108 3354 36 24 29 45",
        "9 0 0 819 88 63 77 32 61",
        "9 0 1 776 3482 14 16 -17 18",
        "9 1 0 704 450 64 66 32 50",
        "9 2 0 682 909 62 65 30 50",
        "9 2 1 72 1441 36 54 29 44"
       ]
      },
      "y": {
       "L1": [
        "-1 0 0 259 3173 37 28 29 46",
        "-1 0 1 658 3528 12 13 29 45",
        "-1 1 0 273 3482 39 17 32 35",
        "-1 2 0 441 1652 63 51 32 36",
        "-1 2 1 324 3201 36 28 7 34",
        "0 0 0 540 2155 60 42 28 61",
        "0 0 1 390 3528 13 13 30 46",
        "0 1 0 64 3050 64 31 32 50",
        "0 2 0 744 909 62 65 32 50",
        "0 2 1 468 3281 36 25 7 46",
        "1 0 0 882 88 63 77 31 61",
        "1 0 1 790 3482 14 16 31 18",
        "1 1 0 768 450 64 66 32 50",
        "1 2 0 806 909 62 65 32 50",
        "1 2 1 108 1441 36 54 7 44"
       ],
       "L2": [
        "-1 0 0 296 3173 37 28 29 46",
        "-1 0 1 670 3528 12 13 29 45",
        "-1 1 0 312 3482 39 17 32 35",
        "-1 2 0 504 1652 63 51 32 36",
        "-1 2 1 360 3201 36 28 7 34",
        "0 0 0 600 2155 60 42 28 61",
        "0 0 1 403 3528 13 13 30 46",
        "0 1 0 128 3050 64 31 32 50",
        "0 2 0 248 648 62 66 32 50",
        "0 2 1 504 3281 36 25 7 46",
        "1 0 0 536 2197 59 42 27 61",
        "1 0 1 396 3541 9 12 26 45",
        "1 1 0 192 3050 64 31 32 50",
        "1 2 0 693 779 63 65 32 50",
        "1 2 1 800 3354 32 24 3 45",
        "2 0 0 189 165 63 76 31 60",
        "2 0 1 804 3482 14 16 31 18",
        "2 1 0 832 450 64 66 32 50",
        "2 2 0 868 909 62 65 32 50",
        "2 2 1 144 1441 36 54 7 44"
       ],
       "L3": [
        "-1 0 0 333 3173 37 28 29 46",
        "-1 0 1 682 3528 12 13 29 45",
        "-1 1 0 351 3482 39 17 32 35",
        "-1 2 0 567 1652 63 51 32 36",
        "-1 2 1 396 3201 36 28 7 34",
        "0 0 0 660 2155 60 42 28 61",
        "0 0 1 416 3528 13 13 30 46",
        "0 1 0 256 3050 64 31 32 50",
        "0 2 0 310 648 62 66 32 50",
        "0 2 1 540 3281 36 25 7 46",
        "1 0 0 595 2197 59 42 27 61",
        "1 0 1 405 3541 9 12 26 45",
        "1 1 0 320 3050 64 31 32 50",
        "1 2 0 372 648 62 66 32 50",
        "1 2 1 832 3354 32 24 3 45",
        "2 0 0 841 2322 60 41 28 60",
        "2 0 1 429 3528 13 13 30 46",
        "2 1 0 384 3050 64 31 32 50",
        "2 2 0 756 779 63 65 32 50",
        "2 2 1 144 3354 36 24 7 45",
        "3 0 0 945 88 63 77 31 61",
        "3 0 1 818 3482 14 16 31 18",
        "3 1 0 896 450 64 66 32 50",
        "3 2 0 930 909 62 65 32 50",
        "3 2 1 180 1441 36 54 7 44"
       ],
       "L5": [
        "-1 0 0 370 3173 37 28 29 46",
        "-1 0 1 694 3528 12 13 29 45",
        "-1 1 0 390 3482 39 17 32 35",
        "-1 2 0 630 1652 63 51 32 36",
        "-1 2 1 432 3201 36 28 7 34",
        "0 0 0 720 2155 60 42 28 61",
        "0 0 1 442 3528 13 13 30 46",
        "0 1 0 448 3050 64 31 32 50",
        "0 2 0 434 648 62 66 32 50",
        "0 2 1 576 3281 36 25 7 46",
        "1 0 0 654 2197 59 42 27 61",
        "1 0 1 414 3541 9 12 26 45",
        "1 1 0 512 3050 64 31 32 50",
        "1 2 0 496 648 62 66 32 50",
        "1 2 1 864 3354 32 24 3 45",
        "2 0 0 901 2322 60 41 28 60",
        "2 0 1 455 3528 13 13 30 46",
        "2 1 0 576 3050 64 31 32 50",
        "2 2 0 441 1039 63 62 32 50",
        "2 2 1 180 3354 36 24 7 45",
        "3 0 0 780 2155 60 42 28 61",
        "3 0 1 468 3528 13 13 30 46",
        "3 1 0 640 3050 64 31 32 50",
        "3 2 0 531 317 74 66 32 50",
        "3 2 1 216 3354 36 24 7 45",
        "4 0 0 840 2155 60 42 28 61",
        "4 0 1 481 3528 13 13 30 46",
        "4 1 0 704 3050 64 31 32 50",
        "4 2 0 819 779 63 65 32 50",
        "4 2 1 252 3354 36 24 7 45",
        "5 0 0 0 165 63 77 31 61",
        "5 0 1 832 3482 14 16 31 18",
        "5 1 0 960 450 64 66 32 50",
        "5 2 0 0 974 62 65 32 50",
        "5 2 1 216 1441 36 54 7 44"
       ],
       "L9": [
        "-1 0 0 407 3173 37 28 29 46",
        "-1 0 1 706 3528 12 13 29 45",
        "-1 1 0 429 3482 39 17 32 35",
        "-1 2 0 693 1652 63 51 32 36",
        "-1 2 1 468 3201 36 28 7 34",
        "0 0 0 900 2155 60 42 28 61",
        "0 0 1 494 3528 13 13 30 46",
        "0 1 0 768 3050 64 31 32 50",
        "0 2 0 558 648 62 66 32 50",
        "0 2 1 612 3281 36 25 7 46",
        "1 0 0 713 2197 59 42 27 61",
        "1 0 1 423 3541 9 12 26 45",
        "1 1 0 832 3050 64 31 32 50",
        "1 2 0 756 1652 63 51 32 50",
        "1 2 1 896 3354 32 24 3 45",
        "2 0 0 961 2322 60 41 28 60",
        "2 0 1 507 3528 13 13 30 46",
        "2 1 0 896 3050 64 31 32 50",
        "2 2 0 605 317 74 66 32 50",
        "2 2 1 288 3354 36 24 7 45",
        "3 0 0 960 2155 60 42 28 61",
        "3 0 1 520 3528 13 13 30 46",
        "3 1 0 960 3050 64 31 32 50",
        "3 2 0 620 648 62 66 32 50",
        "3 2 1 324 3354 36 24 7 45",
        "4 0 0 0 2197 60 42 28 61",
        "4 0 1 533 3528 13 13 30 46",
        "4 1 0 0 3081 64 31 32 50",
        "4 2 0 504 1039 63 62 32 50",
        "4 2 1 360 3354 36 24 7 45",
        "5 0 0 60 2197 60 42 28 61",
        "5 0 1 546 3528 13 13 30 46",
        "5 1 0 64 3081 64 31 32 50",
        "5 2 0 863 1039 74 60 32 50",
        "5 2 1 396 3354 36 24 7 45",
        "6 0 0 120 2197 60 42 28 61",
        "6 0 1 559 3528 13 13 30 46",
        "6 1 0 128 3081 64 31 32 50",
        "6 2 0 491 974 64 62 32 50",
        "6 2 1 432 3354 36 24 7 45",
        "7 0 0 180 2197 60 42 28 61",
        "7 0 1 572 3528 13 13 30 46",
        "7 1 0 192 3081 64 31 32 50",
        "7 2 0 937 1039 74 60 32 50",
        "7 2 1 468 3354 36 24 7 45",
        "8 0 0 240 2197 60 42 28 61",
        "8 0 1 585 3528 13 13 30 46",
        "8 1 0 256 3081 64 31 32 50",
        "8 2 0 434 714 64 65 32 50",
        "8 2 1 504 3354 36 24 7 45",
        "9 0 0 63 165 63 77 31 61",
        "9 0 1 846 3482 14 16 31 18",
        "9 1 0 0 516 64 66 32 50",
        "9 2 0 62 974 62 65 32 50",
        "9 2 1 252 1441 36 54 7 44"
       ]
      },
      "zn": {
       "L1": [
        "-1 1 0 94 3515 47 13 23 32",
        "-1 3 0 631 3499 33 14 6 31",
        "-1 3 1 340 3541 10 12 15 41",
        "0 0 0 651 2404 46 40 31 57",
        "0 0 1 900 3482 10 16 -5 45",
        "0 1 0 785 2521 63 37 31 51",
        "0 2 0 572 3143 63 28 32 47",
        "0 3 0 568 1754 46 49 15 61",
        "0 3 1 303 3143 9 29 15 45",
        "1 0 0 188 0 47 88 32 61",
        "1 0 1 275 1161 9 59 -6 40",
        "1 1 0 544 1441 64 53 32 45",
        "1 2 0 508 165 64 75 32 51",
        "1 3 0 141 317 47 67 15 56",
        "1 3 1 396 3402 9 22 15 19"
       ],
       "L3": [
        "-1 1 0 141 3515 47 13 23 32",
        "-1 3 0 664 3499 33 14 6 31",
        "-1 3 1 350 3541 10 12 15 41",
        "0 0 0 697 2404 46 40 31 57",
        "0 0 1 910 3482 10 16 -5 45",
        "0 1 0 315 2736 63 32 31 51",
        "0 2 0 635 3143 63 28 32 47",
        "0 3 0 0 242 59 75 28 61",
        "0 3 1 947 3482 9 16 15 45",
        "1 0 0 861 1101 59 59 31 61",
        "1 0 1 432 3541 9 12 -6 41",
        "1 1 0 378 2736 63 32 31 51",
        "1 2 0 441 2736 63 32 32 51",
        "1 3 0 59 242 59 71 28 57",
        "1 3 1 972 3482 8 16 14 45",
        "2 0 0 920 1101 59 59 31 61",
        "2 0 1 980 3482 8 16 -6 45",
        "2 1 0 848 2521 63 37 31 51",
        "2 2 0 504 2736 63 32 32 51",
        "2 3 0 705 1754 45 49 14 61",
        "2 3 1 549 3424 8 21 14 45",
        "3 0 0 235 0 47 88 32 61",
        "3 0 1 246 1161 11 59 -6 40",
        "3 1 0 608 1441 64 53 32 45",
        "3 2 0 572 165 64 75 32 51",
        "3 3 0 188 317 47 67 15 56",
        "3 3 1 405 3402 9 22 15 19"
       ]
      },
      "wo": {
       "L1": [
        "-1 0 0 651 1277 49 55 17 48",
        "-1 1 0 80 1804 80 48 49 45",
        "-1 2 0 0 2667 49 35 17 30",
        "-1 3 0 692 1220 122 56 49 46",
        "-1 3 1 324 1944 81 43 49 42",
        "0 0 0 0 2702 64 34 32 53",
        "0 1 0 717 3112 62 30 31 49",
        "0 2 0 311 3256 62 25 31 51",
        "0 3 0 540 1161 64 58 32 51",
        "0 3 1 128 3465 64 17 32 42",
        "1 0 0 162 1220 81 57 32 53",
        "1 1 0 824 2559 49 37 32 30",
        "1 2 0 765 1703 80 50 31 46",
        "1 3 0 169 2444 49 39 32 29",
        "1 3 1 98 2521 49 38 32 37"
       ],
       "L3": [
        "-1 0 0 700 1277 49 55 17 48",
        "-1 1 0 160 1804 80 48 49 45",
        "-1 2 0 49 2667 49 35 17 30",
        "-1 3 0 119 1277 119 56 49 46",
        "-1 3 1 405 1944 81 43 49 42",
        "0 0 0 64 2702 64 34 32 53",
        "0 1 0 779 3112 62 30 31 49",
        "0 2 0 373 3256 62 25 31 51",
        "0 3 0 204 714 102 65 32 51",
        "0 3 1 128 3541 64 12 32 42",
        "1 0 0 128 2702 64 34 32 53",
        "1 1 0 841 3112 62 30 31 49",
        "1 2 0 249 2768 62 32 31 51",
        "1 3 0 892 648 105 65 32 51",
        "1 3 1 192 3541 64 12 32 42",
        "2 0 0 192 2702 64 34 32 53",
        "2 1 0 903 3112 62 30 31 49",
        "2 2 0 435 3256 62 25 31 51",
        "2 3 0 604 1161 64 58 32 51",
        "2 3 1 192 3465 64 17 32 42",
        "3 0 0 243 1220 81 57 32 53",
        "3 1 0 873 2559 49 37 32 30",
        "3 2 0 845 1703 80 50 31 46",
        "3 3 0 922 2559 49 37 32 27",
        "3 3 1 147 2521 49 38 32 37"
       ]
      }
     },
     "juk": {
      "x": {
       "L3": [
        "-1 0 0 62 2632 59 35 31 36",
        "-1 0 1 513 3541 5 12 -24 36",
        "-1 1 0 610 3402 58 21 27 23",
        "-1 2 0 709 2444 62 38 31 23",
        "-1 2 1 803 3445 33 18 29 23",
        "0 0 0 64 1899 59 45 31 51",
        "0 0 1 518 3541 5 12 -25 36",
        "0 1 0 311 2768 62 32 31 38",
        "0 2 0 943 1333 61 54 30 38",
        "0 2 1 606 3354 33 24 29 35",
        "1 0 0 123 1899 59 45 31 51",
        "1 0 1 523 3541 5 12 -25 36",
        "1 1 0 373 2768 62 32 31 38",
        "1 2 0 819 1333 62 54 31 38",
        "1 2 1 563 3229 33 26 29 35",
        "2 0 0 182 1899 59 45 31 51",
        "2 0 1 528 3541 5 12 -25 36",
        "2 1 0 435 2768 62 32 31 38",
        "2 2 0 771 2444 62 38 31 38",
        "2 2 1 596 3229 33 26 29 35",
        "3 0 0 118 242 62 67 31 51",
        "3 0 1 32 3499 7 15 -24 16",
        "3 1 0 901 1277 63 54 31 38",
        "3 2 0 672 1441 63 53 31 38",
        "3 2 1 796 1804 33 47 29 35"
       ]
      },
      "y": {
       "L3": [
        "-1 0 0 121 2632 59 35 28 36",
        "-1 0 1 533 3541 5 12 29 36",
        "-1 1 0 668 3402 58 21 31 23",
        "-1 2 0 833 2444 62 38 31 23",
        "-1 2 1 836 3445 33 18 4 23",
        "0 0 0 241 1899 59 45 28 51",
        "0 0 1 538 3541 5 12 30 36",
        "0 1 0 497 2768 62 32 31 38",
        "0 2 0 0 1387 61 54 31 38",
        "0 2 1 639 3354 33 24 4 35",
        "1 0 0 300 1899 59 45 28 51",
        "1 0 1 543 3541 5 12 30 36",
        "1 1 0 559 2768 62 32 31 38",
        "1 2 0 881 1333 62 54 31 38",
        "1 2 1 629 3229 33 26 4 35",
        "2 0 0 359 1899 59 45 28 51",
        "2 0 1 548 3541 5 12 30 36",
        "2 1 0 621 2768 62 32 31 38",
        "2 2 0 895 2444 62 38 31 38",
        "2 2 1 662 3229 33 26 4 35",
        "3 0 0 180 242 62 67 31 51",
        "3 0 1 39 3499 7 15 31 16",
        "3 1 0 0 1333 63 54 32 38",
        "3 2 0 735 1441 63 53 32 38",
        "3 2 1 829 1804 33 47 4 35"
       ]
      },
      "zn": {
       "L3": [
        "-1 0 0 232 3424 45 21 30 24",
        "-1 0 1 952 3541 5 2 -10 18",
        "-1 1 0 550 3402 60 21 30 27",
        "-1 2 0 588 3541 60 8 30 11",
        "-1 3 0 425 2702 45 34 15 40",
        "-1 3 1 837 3528 5 13 15 32",
        "0 0 0 346 2239 46 42 31 48",
        "0 0 1 1009 3482 4 16 -11 35",
        "0 1 0 683 2768 62 32 31 38",
        "0 2 0 192 3143 62 29 31 35",
        "0 3 0 772 1899 46 45 15 51",
        "0 3 1 1013 3482 4 16 15 35",
        "1 0 0 818 1899 46 45 31 51",
        "1 0 1 1017 3482 4 16 -11 35",
        "1 1 0 745 2768 62 32 31 38",
        "1 2 0 807 2768 62 32 31 38",
        "1 3 0 864 1899 46 45 15 51",
        "1 3 1 0 3499 4 16 15 35",
        "2 0 0 910 1899 46 45 31 51",
        "2 0 1 4 3499 4 16 -11 35",
        "2 1 0 0 2632 62 35 31 38",
        "2 2 0 869 2768 62 32 31 38",
        "2 3 0 557 1804 46 48 15 51",
        "2 3 1 675 3445 4 19 15 35",
        "3 0 0 470 0 47 78 32 51",
        "3 0 1 226 1754 4 50 -11 32",
        "3 1 0 551 1944 64 42 32 34",
        "3 2 0 555 974 64 62 32 38",
        "3 3 0 0 1161 47 59 15 48",
        "3 3 1 471 3445 4 20 15 18"
       ]
      },
      "wo": {
       "L3": [
        "-1 0 0 59 1703 50 51 17 40",
        "-1 1 0 716 2239 80 41 49 35",
        "-1 2 0 122 2832 49 32 17 21",
        "-1 3 0 517 1852 81 45 49 35",
        "-1 3 1 369 2667 81 34 49 30",
        "0 0 0 277 2521 64 37 32 43",
        "0 1 0 931 2768 62 32 31 38",
        "0 2 0 0 2800 62 32 31 38",
        "0 3 0 922 1852 64 45 32 38",
        "0 3 1 242 3499 64 14 32 30",
        "1 0 0 341 2521 64 37 32 43",
        "1 1 0 62 2800 62 32 31 38",
        "1 2 0 124 2800 62 32 31 38",
        "1 3 0 0 1899 64 45 32 38",
        "1 3 1 306 3499 64 14 32 30",
        "2 0 0 405 2521 64 37 32 43",
        "2 1 0 186 2800 62 32 31 38",
        "2 2 0 248 2800 62 32 31 38",
        "2 3 0 305 1804 64 48 32 38",
        "2 3 1 370 3499 64 14 32 30",
        "3 0 0 230 1754 81 49 32 43",
        "3 1 0 171 2832 49 32 32 21",
        "3 2 0 796 2239 80 41 31 35",
        "3 3 0 699 3081 49 31 32 21",
        "3 3 1 965 3112 49 30 32 26"
       ]
      }
     },
     "boog": {
      "x": {
       "L1": [
        "-1 0 0 180 2632 59 35 31 36",
        "-1 0 1 186 3499 4 15 -25 36",
        "-1 1 0 821 3424 57 20 26 23",
        "-1 2 0 957 2444 62 38 31 23",
        "-1 2 1 935 3424 33 20 29 23",
        "0 0 0 418 1899 59 45 31 51",
        "0 0 1 116 3499 6 15 -24 37",
        "0 1 0 310 2800 62 32 31 38",
        "0 2 0 567 1495 61 53 30 38",
        "0 2 1 834 3201 33 28 29 36",
        "1 0 0 242 242 62 67 31 51",
        "1 0 1 46 3499 7 15 -24 16",
        "1 1 0 63 1333 63 54 31 38",
        "1 2 0 798 1441 63 53 31 38",
        "1 2 1 862 1804 33 47 29 35"
       ],
       "L2": [
        "-1 0 0 239 2632 59 35 31 36",
        "-1 0 1 190 3499 4 15 -25 36",
        "-1 1 0 705 3424 58 20 27 23",
        "-1 2 0 0 2483 62 38 31 23",
        "-1 2 1 968 3424 33 20 29 23",
        "0 0 0 245 2559 59 37 31 51",
        "0 0 1 885 3499 4 14 -25 44",
        "0 1 0 712 3281 62 24 31 38",
        "0 2 0 854 2404 61 39 30 38",
        "0 2 1 0 3445 33 20 29 36",
        "1 0 0 689 1495 60 53 31 59",
        "1 0 1 122 3499 6 15 -24 37",
        "1 1 0 803 2363 62 40 31 46",
        "1 2 0 562 1101 61 60 30 46",
        "1 2 1 237 2667 33 35 29 43",
        "2 0 0 304 242 62 67 31 51",
        "2 0 1 53 3499 7 15 -24 16",
        "2 1 0 126 1333 63 54 31 38",
        "2 2 0 861 1441 63 53 31 38",
        "2 2 1 895 1804 33 47 29 35"
       ],
       "L3": [
        "-1 0 0 298 2632 59 35 31 36",
        "-1 0 1 194 3499 4 15 -25 36",
        "-1 1 0 726 3402 58 21 27 23",
        "-1 2 0 62 2483 62 38 31 23",
        "-1 2 1 33 3445 33 20 29 23",
        "0 0 0 304 2559 59 37 31 51",
        "0 0 1 835 3499 5 14 -24 43",
        "0 1 0 774 3281 62 24 31 38",
        "0 2 0 62 2404 61 40 30 38",
        "0 2 1 66 3445 33 20 29 36",
        "1 0 0 477 1899 59 45 31 59",
        "1 0 1 739 3499 6 14 -24 44",
        "1 1 0 372 2800 62 32 31 46",
        "1 2 0 684 2281 61 41 30 46",
        "1 2 1 695 3229 33 26 29 43",
        "2 0 0 749 1495 60 53 32 59",
        "2 0 1 745 3499 6 14 -24 36",
        "2 1 0 551 2363 63 40 32 46",
        "2 2 0 438 1101 62 60 31 46",
        "2 2 1 514 2702 33 34 29 42",
        "3 0 0 366 242 62 67 31 51",
        "3 0 1 60 3499 7 15 -24 16",
        "3 1 0 189 1333 63 54 31 38",
        "3 2 0 924 1441 63 53 31 38",
        "3 2 1 928 1804 33 47 29 35"
       ],
       "L4": [
        "-1 0 0 357 2632 59 35 31 36",
        "-1 0 1 198 3499 4 15 -25 36",
        "-1 1 0 784 3402 58 21 27 23",
        "-1 2 0 124 2483 62 38 31 23",
        "-1 2 1 99 3445 33 20 29 23",
        "0 0 0 682 2483 59 38 31 51",
        "0 0 1 751 3499 6 14 -24 42",
        "0 1 0 827 3229 63 25 31 38",
        "0 2 0 865 2363 62 40 30 38",
        "0 2 1 457 3424 33 21 29 35",
        "1 0 0 0 2444 60 39 32 58",
        "1 0 1 757 3499 6 14 -24 49",
        "1 1 0 890 3229 63 25 32 44",
        "1 2 0 256 2702 61 34 30 44",
        "1 2 1 171 3402 33 22 29 43",
        "2 0 0 945 1652 59 51 31 64",
        "2 0 1 128 3499 6 15 -24 43",
        "2 1 0 457 2444 63 38 31 51",
        "2 2 0 433 1804 62 48 30 51",
        "2 2 1 547 2702 33 34 29 48",
        "3 0 0 272 1548 60 52 32 58",
        "3 0 1 840 3499 5 14 -25 36",
        "3 1 0 520 2444 63 38 32 44",
        "3 2 0 668 1161 62 58 31 44",
        "3 2 1 707 2702 33 33 29 41",
        "4 0 0 428 242 62 67 31 51",
        "4 0 1 67 3499 7 15 -24 16",
        "4 1 0 252 1333 63 54 31 38",
        "4 2 0 0 1495 63 53 31 38",
        "4 2 1 961 1804 33 47 29 35"
       ],
       "L5": [
        "-1 0 0 416 2632 59 35 31 36",
        "-1 0 1 202 3499 4 15 -25 36",
        "-1 1 0 842 3402 58 21 27 23",
        "-1 2 0 186 2483 62 38 31 23",
        "-1 2 1 132 3445 33 20 29 23",
        "0 0 0 184 2404 59 40 31 51",
        "0 0 1 763 3499 6 14 -24 41",
        "0 1 0 189 3229 62 27 31 38",
        "0 2 0 745 2281 61 41 30 38",
        "0 2 1 204 3402 33 22 29 35",
        "1 0 0 125 2559 60 37 32 57",
        "1 0 1 206 3499 4 15 -25 50",
        "1 1 0 411 3378 63 23 32 43",
        "1 2 0 0 2832 61 32 30 43",
        "1 2 1 543 3445 33 19 29 41",
        "2 0 0 536 1899 59 45 31 65",
        "2 0 1 845 3499 5 14 -25 50",
        "2 1 0 434 2800 62 32 31 52",
        "2 2 0 806 2281 61 41 30 52",
        "2 2 1 728 3229 33 26 29 49",
        "3 0 0 929 1495 59 53 31 65",
        "3 0 1 134 3499 6 15 -24 42",
        "3 1 0 614 2363 63 40 31 52",
        "3 2 0 819 1652 63 51 31 52",
        "3 2 1 270 2667 33 35 29 49",
        "4 0 0 925 1703 60 50 32 56",
        "4 0 1 850 3499 5 14 -25 36",
        "4 1 0 911 2521 63 37 32 43",
        "4 2 0 324 1220 62 57 31 43",
        "4 2 1 657 2832 33 32 29 40",
        "5 0 0 490 242 62 67 31 51",
        "5 0 1 725 3499 7 14 -24 16",
        "5 1 0 315 1333 63 54 31 38",
        "5 2 0 63 1495 63 53 31 38",
        "5 2 1 0 1852 33 47 29 35"
       ],
       "L6": [
        "-1 0 0 475 2632 59 35 31 36",
        "-1 0 1 210 3499 4 15 -25 36",
        "-1 1 0 900 3402 58 21 27 23",
        "-1 2 0 248 2483 62 38 31 23",
        "-1 2 1 165 3445 33 20 29 23",
        "0 0 0 243 2404 59 40 31 51",
        "0 0 1 769 3499 6 14 -24 40",
        "0 1 0 900 3201 63 27 31 38",
        "0 2 0 560 2281 62 41 30 38",
        "0 2 1 237 3402 33 22 29 35",
        "1 0 0 517 2596 60 36 32 56",
        "1 0 1 775 3499 6 14 -24 49",
        "1 1 0 691 3378 64 22 32 42",
        "1 2 0 496 2800 62 32 30 42",
        "1 2 1 576 3445 33 19 29 41",
        "2 0 0 0 2363 60 41 32 65",
        "2 0 1 781 3499 6 14 -24 54",
        "2 1 0 0 3229 63 27 32 51",
        "2 2 0 395 2596 61 36 30 51",
        "2 2 1 599 3378 33 23 29 49",
        "3 0 0 311 1754 59 49 31 69",
        "3 0 1 176 3499 5 15 -25 50",
        "3 1 0 81 2596 63 36 31 56",
        "3 2 0 393 1852 62 46 30 56",
        "3 2 1 690 2832 33 32 29 53",
        "4 0 0 61 1387 60 54 32 65",
        "4 0 1 140 3499 6 15 -24 41",
        "4 1 0 231 2363 64 40 32 51",
        "4 2 0 148 1548 62 52 30 51",
        "4 2 1 683 2596 33 36 29 48",
        "5 0 0 0 1754 60 50 32 56",
        "5 0 1 855 3499 5 14 -25 36",
        "5 1 0 144 2596 63 36 32 42",
        "5 2 0 238 1277 62 56 31 42",
        "5 2 1 989 3081 32 31 29 39",
        "6 0 0 552 242 62 67 31 51",
        "6 0 1 74 3499 7 15 -24 16",
        "6 1 0 378 1333 63 54 31 38",
        "6 2 0 126 1495 63 53 31 38",
        "6 2 1 33 1852 33 47 29 35"
       ]
      },
      "y": {
       "L1": [
        "-1 0 0 534 2632 59 35 28 36",
        "-1 0 1 214 3499 4 15 29 36",
        "-1 1 0 878 3424 57 20 31 23",
        "-1 2 0 310 2483 62 38 31 23",
        "-1 2 1 198 3445 33 20 4 23",
        "0 0 0 595 1899 59 45 28 51",
        "0 0 1 146 3499 6 15 30 37",
        "0 1 0 558 2800 62 32 31 38",
        "0 2 0 628 1495 61 53 31 38",
        "0 2 1 867 3201 33 28 4 36",
        "1 0 0 614 242 62 67 31 51",
        "1 0 1 81 3499 7 15 31 16",
        "1 1 0 441 1333 63 54 32 38",
        "1 2 0 189 1495 63 53 32 38",
        "1 2 1 66 1852 33 47 4 35"
       ],
       "L2": [
        "-1 0 0 593 2632 59 35 28 36",
        "-1 0 1 218 3499 4 15 29 36",
        "-1 1 0 763 3424 58 20 31 23",
        "-1 2 0 372 2483 62 38 31 23",
        "-1 2 1 231 3445 33 20 4 23",
        "0 0 0 363 2559 59 37 28 51",
        "0 0 1 889 3499 4 14 29 44",
        "0 1 0 836 3281 62 24 31 38",
        "0 2 0 915 2404 61 39 31 38",
        "0 2 1 264 3445 33 20 4 36",
        "1 0 0 809 1495 60 53 29 59",
        "1 0 1 152 3499 6 15 30 37",
        "1 1 0 927 2363 62 40 31 46",
        "1 2 0 623 1101 61 60 31 46",
        "1 2 1 303 2667 33 35 4 43",
        "2 0 0 676 242 62 67 31 51",
        "2 0 1 88 3499 7 15 31 16",
        "2 1 0 504 1333 63 54 32 38",
        "2 2 0 252 1495 63 53 32 38",
        "2 2 1 99 1852 33 47 4 35"
       ],
       "L3": [
        "-1 0 0 652 2632 59 35 28 36",
        "-1 0 1 222 3499 4 15 29 36",
        "-1 1 0 958 3402 58 21 31 23",
        "-1 2 0 434 2483 62 38 31 23",
        "-1 2 1 297 3445 33 20 4 23",
        "0 0 0 422 2559 59 37 28 51",
        "0 0 1 860 3499 5 14 29 43",
        "0 1 0 898 3281 62 24 31 38",
        "0 2 0 123 2404 61 40 31 38",
        "0 2 1 330 3445 33 20 4 36",
        "1 0 0 654 1899 59 45 28 59",
        "1 0 1 787 3499 6 14 30 44",
        "1 1 0 620 2800 62 32 31 46",
        "1 2 0 867 2281 61 41 31 46",
        "1 2 1 761 3229 33 26 4 43",
        "2 0 0 869 1495 60 53 28 59",
        "2 0 1 793 3499 6 14 30 36",
        "2 1 0 677 2363 63 40 31 46",
        "2 2 0 500 1101 62 60 31 46",
        "2 2 1 580 2702 33 34 4 42",
        "3 0 0 738 242 62 67 31 51",
        "3 0 1 95 3499 7 15 31 16",
        "3 1 0 567 1333 63 54 32 38",
        "3 2 0 315 1495 63 53 32 38",
        "3 2 1 132 1852 33 47 4 35"
       ],
       "L4": [
        "-1 0 0 711 2632 59 35 28 36",
        "-1 0 1 226 3499 4 15 29 36",
        "-1 1 0 0 3424 58 21 31 23",
        "-1 2 0 496 2483 62 38 31 23",
        "-1 2 1 363 3445 33 20 4 23",
        "0 0 0 741 2483 59 38 28 51",
        "0 0 1 799 3499 6 14 30 42",
        "0 1 0 953 3229 63 25 32 38",
        "0 2 0 0 2404 62 40 32 38",
        "0 2 1 490 3424 33 21 4 35",
        "1 0 0 60 2444 60 39 28 58",
        "1 0 1 805 3499 6 14 30 49",
        "1 1 0 0 3256 63 25 31 44",
        "1 2 0 317 2702 61 34 31 44",
        "1 2 1 270 3402 33 22 4 43",
        "2 0 0 0 1703 59 51 28 64",
        "2 0 1 158 3499 6 15 30 43",
        "2 1 0 583 2444 63 38 32 51",
        "2 2 0 495 1804 62 48 32 51",
        "2 2 1 613 2702 33 34 4 48",
        "3 0 0 332 1548 60 52 28 58",
        "3 0 1 865 3499 5 14 30 36",
        "3 1 0 646 2444 63 38 31 44",
        "3 2 0 730 1161 62 58 31 44",
        "3 2 1 740 2702 33 33 4 41",
        "4 0 0 800 242 62 67 31 51",
        "4 0 1 102 3499 7 15 31 16",
        "4 1 0 630 1333 63 54 32 38",
        "4 2 0 378 1495 63 53 32 38",
        "4 2 1 165 1852 33 47 4 35"
       ],
       "L5": [
        "-1 0 0 770 2632 59 35 28 36",
        "-1 0 1 230 3499 4 15 29 36",
        "-1 1 0 58 3424 58 21 31 23",
        "-1 2 0 558 2483 62 38 31 23",
        "-1 2 1 396 3445 33 20 4 23",
        "0 0 0 302 2404 59 40 28 51",
        "0 0 1 811 3499 6 14 30 41",
        "0 1 0 251 3229 62 27 31 38",
        "0 2 0 928 2281 61 41 31 38",
        "0 2 1 303 3402 33 22 4 35",
        "1 0 0 185 2559 60 37 28 57",
        "1 0 1 234 3499 4 15 29 50",
        "1 1 0 474 3378 63 23 31 43",
        "1 2 0 61 2832 61 32 31 43",
        "1 2 1 609 3445 33 19 4 41",
        "2 0 0 713 1899 59 45 28 65",
        "2 0 1 870 3499 5 14 30 50",
        "2 1 0 682 2800 62 32 31 52",
        "2 2 0 0 2322 61 41 31 52",
        "2 2 1 794 3229 33 26 4 49",
        "3 0 0 0 1548 59 53 28 65",
        "3 0 1 164 3499 6 15 30 42",
        "3 1 0 740 2363 63 40 32 52",
        "3 2 0 882 1652 63 51 32 52",
        "3 2 1 336 2667 33 35 4 49",
        "4 0 0 60 1754 60 50 28 56",
        "4 0 1 875 3499 5 14 30 36",
        "4 1 0 0 2559 63 37 31 43",
        "4 2 0 386 1220 62 57 31 43",
        "4 2 1 723 2832 33 32 4 40",
        "5 0 0 862 242 62 67 31 51",
        "5 0 1 732 3499 7 14 31 16",
        "5 1 0 693 1333 63 54 32 38",
        "5 2 0 441 1495 63 53 32 38",
        "5 2 1 198 1852 33 47 4 35"
       ],
       "L6": [
        "-1 0 0 829 2632 59 35 28 36",
        "-1 0 1 238 3499 4 15 29 36",
        "-1 1 0 116 3424 58 21 31 23",
        "-1 2 0 620 2483 62 38 31 23",
        "-1 2 1 429 3445 33 20 4 23",
        "0 0 0 361 2404 59 40 28 51",
        "0 0 1 817 3499 6 14 30 40",
        "0 1 0 63 3229 63 27 32 38",
        "0 2 0 622 2281 62 41 32 38",
        "0 2 1 336 3402 33 22 4 35",
        "1 0 0 577 2596 60 36 28 56",
        "1 0 1 823 3499 6 14 30 49",
        "1 1 0 755 3378 64 22 32 42",
        "1 2 0 744 2800 62 32 32 42",
        "1 2 1 642 3445 33 19 4 41",
        "2 0 0 60 2363 60 41 28 65",
        "2 0 1 829 3499 6 14 30 54",
        "2 1 0 126 3229 63 27 31 51",
        "2 2 0 456 2596 61 36 31 51",
        "2 2 1 632 3378 33 23 4 49",
        "3 0 0 370 1754 59 49 28 69",
        "3 0 1 181 3499 5 15 30 50",
        "3 1 0 207 2596 63 36 32 56",
        "3 2 0 455 1852 62 46 32 56",
        "3 2 1 756 2832 33 32 4 53",
        "4 0 0 121 1387 60 54 28 65",
        "4 0 1 170 3499 6 15 30 41",
        "4 1 0 295 2363 64 40 32 51",
        "4 2 0 210 1548 62 52 32 51",
        "4 2 1 716 2596 33 36 4 48",
        "5 0 0 120 1754 60 50 28 56",
        "5 0 1 880 3499 5 14 30 36",
        "5 1 0 270 2596 63 36 31 42",
        "5 2 0 300 1277 62 56 31 42",
        "5 2 1 0 3112 32 31 3 39",
        "6 0 0 924 242 62 67 31 51",
        "6 0 1 109 3499 7 15 31 16",
        "6 1 0 756 1333 63 54 32 38",
        "6 2 0 504 1495 63 53 32 38",
        "6 2 1 231 1852 33 47 4 35"
       ]
      },
      "zn": {
       "L1": [
        "-1 0 0 277 3424 45 21 30 24",
        "-1 0 1 957 3541 5 2 -10 18",
        "-1 1 0 743 3445 60 18 30 27",
        "-1 2 0 648 3541 60 8 30 11",
        "-1 3 0 944 3081 45 31 15 40",
        "-1 3 1 579 3541 5 10 15 32",
        "0 0 0 218 2444 46 39 31 48",
        "0 0 1 8 3499 4 16 -11 38",
        "0 1 0 329 2444 64 38 32 41",
        "0 2 0 497 3256 62 25 31 35",
        "0 3 0 309 1703 47 51 15 54",
        "0 3 1 414 3402 4 22 15 38",
        "1 0 0 282 0 47 81 32 54",
        "1 0 1 59 1548 4 53 -11 32",
        "1 1 0 615 1944 64 42 32 34",
        "1 2 0 498 714 64 65 32 41",
        "1 3 0 47 1161 47 59 15 48",
        "1 3 1 683 3378 4 23 15 18"
       ],
       "L2": [
        "-1 0 0 322 3424 45 21 30 24",
        "-1 0 1 962 3541 5 2 -10 18",
        "-1 1 0 256 3465 60 17 30 27",
        "-1 1 1 64 3553 6 1 3 10",
        "-1 2 0 708 3541 60 8 30 11",
        "-1 3 0 147 3143 45 30 15 40",
        "-1 3 1 665 3378 18 23 15 32",
        "0 0 0 470 2702 44 34 29 48",
        "0 0 1 434 3499 47 14 32 38",
        "0 1 0 437 3229 64 26 32 40",
        "0 2 0 174 3424 58 21 29 35",
        "0 2 1 0 3553 64 1 32 25",
        "0 3 0 420 2404 47 40 15 54",
        "0 3 1 12 3499 4 16 15 43",
        "1 0 0 429 1754 47 49 32 59",
        "1 0 1 646 2702 16 34 1 43",
        "1 1 0 128 1987 62 42 31 45",
        "1 1 1 888 3541 64 4 32 25",
        "1 2 0 911 2596 64 35 32 45",
        "1 2 1 70 3553 2 1 1 10",
        "1 3 0 409 1277 46 56 15 59",
        "1 3 1 124 3402 47 22 15 38",
        "2 0 0 329 0 47 81 32 54",
        "2 0 1 63 1548 4 53 -11 32",
        "2 1 0 679 1944 64 42 32 34",
        "2 2 0 124 974 64 64 32 40",
        "2 3 0 94 1161 47 59 15 48",
        "2 3 1 687 3378 4 23 15 18"
       ],
       "L3": [
        "-1 0 0 367 3424 45 21 30 24",
        "-1 0 1 967 3541 5 2 -10 18",
        "-1 1 0 483 3445 60 19 30 27",
        "-1 2 0 768 3541 60 8 30 11",
        "-1 3 0 612 2832 45 32 15 40",
        "-1 3 1 562 3541 5 11 15 32",
        "0 0 0 145 2667 46 35 31 48",
        "0 0 1 567 3541 4 11 -11 37",
        "0 1 0 0 3402 62 22 31 40",
        "0 2 0 62 3402 62 22 31 35",
        "0 3 0 191 2667 46 35 15 53",
        "0 3 1 571 3541 4 11 15 42",
        "1 0 0 743 2404 46 40 31 58",
        "1 0 1 16 3499 4 16 -11 47",
        "1 1 0 63 2559 62 37 31 50",
        "1 2 0 313 3229 62 27 31 45",
        "1 3 0 180 1754 46 50 15 63",
        "1 3 1 557 3424 4 21 15 47",
        "2 0 0 749 1277 47 55 32 63",
        "2 0 1 561 3424 4 21 -11 42",
        "2 1 0 240 2281 64 41 32 44",
        "2 2 0 743 1944 64 42 32 50",
        "2 3 0 796 1277 47 55 15 58",
        "2 3 1 565 3424 4 21 15 37",
        "3 0 0 376 0 47 80 32 53",
        "3 0 1 356 1703 4 51 -11 32",
        "3 1 0 807 1944 64 42 32 34",
        "3 2 0 188 974 64 63 32 39",
        "3 3 0 141 1161 47 59 15 48",
        "3 3 1 569 3424 4 21 15 18"
       ],
       "L4": [
        "-1 0 0 412 3424 45 21 30 24",
        "-1 0 1 972 3541 5 2 -10 18",
        "-1 1 0 645 3424 60 20 30 27",
        "-1 2 0 828 3541 60 8 30 11",
        "-1 3 0 662 2702 45 33 15 40",
        "-1 3 1 553 3541 5 12 15 32",
        "0 0 0 637 2596 46 36 31 48",
        "0 0 1 575 3541 4 11 -11 36",
        "0 1 0 422 3402 64 21 32 39",
        "0 2 0 537 3378 62 23 31 35",
        "0 3 0 378 2702 47 34 15 52",
        "0 3 1 584 3541 4 10 15 41",
        "1 0 0 98 2667 47 35 32 57",
        "1 0 1 558 3541 4 12 -11 47",
        "1 1 0 375 3229 62 27 31 49",
        "1 2 0 486 3402 64 21 32 43",
        "1 3 0 120 2363 46 41 15 63",
        "1 3 1 20 3499 4 16 15 51",
        "2 0 0 614 1754 46 49 31 67",
        "2 0 1 475 3445 4 20 -11 51",
        "2 1 0 871 1944 64 42 32 54",
        "2 2 0 333 2596 62 36 31 54",
        "2 3 0 843 1277 47 55 15 67",
        "2 3 1 418 3402 4 22 15 47",
        "3 0 0 362 1277 47 56 32 63",
        "3 0 1 573 3424 4 21 -11 41",
        "3 1 0 359 2363 64 40 32 43",
        "3 2 0 304 2281 64 41 32 49",
        "3 3 0 181 1387 47 54 15 57",
        "3 3 1 479 3445 4 20 15 36",
        "4 0 0 423 0 47 79 32 52",
        "4 0 1 360 1703 4 51 -11 32",
        "4 1 0 935 1944 64 42 32 34",
        "4 2 0 252 974 64 63 32 39",
        "4 3 0 188 1161 47 59 15 48",
        "4 3 1 577 3424 4 21 15 18"
       ]
      },
      "wo": {
       "L1": [
        "-1 0 0 109 1703 50 51 17 40",
        "-1 1 0 876 2239 80 41 49 35",
        "-1 2 0 220 2832 49 32 17 21",
        "-1 3 0 598 1852 81 45 49 35",
        "-1 3 1 196 2521 81 37 49 33",
        "0 0 0 166 2363 65 40 32 49",
        "0 1 0 567 2736 63 32 32 41",
        "0 2 0 630 2736 63 32 31 41",
        "0 3 0 369 1804 64 48 32 41",
        "0 3 1 819 3378 64 22 32 36",
        "1 0 0 67 1548 81 52 32 46",
        "1 1 0 269 2832 49 32 32 21",
        "1 2 0 0 2281 80 41 31 35",
        "1 3 0 748 3081 49 31 32 21",
        "1 3 1 254 3143 49 29 32 26"
       ],
       "L2": [
        "-1 0 0 159 1703 50 51 17 40",
        "-1 1 0 392 2239 81 41 49 35",
        "-1 1 1 977 3541 3 2 -27 24",
        "-1 2 0 318 2832 49 32 17 21",
        "-1 3 0 679 1852 81 45 49 35",
        "-1 3 1 0 2596 81 36 49 32",
        "0 0 0 423 2363 64 40 32 50",
        "0 0 1 988 3482 7 16 5 25",
        "0 1 0 448 3081 63 31 31 45",
        "0 1 1 72 3553 2 1 32 25",
        "0 2 0 32 3112 63 30 31 40",
        "0 2 1 995 3482 7 16 5 25",
        "0 3 0 264 1852 65 46 33 45",
        "0 3 1 883 3378 64 22 32 40",
        "1 0 0 789 2404 65 39 32 53",
        "1 0 1 74 3553 2 1 -30 25",
        "1 1 0 95 3112 63 30 32 40",
        "1 1 1 1002 3482 7 16 2 25",
        "1 2 0 511 3081 63 31 32 45",
        "1 2 1 76 3553 2 1 -30 25",
        "1 3 0 668 1804 64 47 32 40",
        "1 3 1 648 3281 64 24 32 37",
        "2 0 0 392 1548 81 51 32 45",
        "2 0 1 980 3541 3 2 30 24",
        "2 1 0 367 2832 49 32 32 21",
        "2 2 0 473 2239 81 41 32 35",
        "2 2 1 983 3541 3 2 30 24",
        "2 3 0 797 3081 49 31 32 21",
        "2 3 1 0 3143 49 30 32 26"
       ],
       "L3": [
        "-1 0 0 209 1703 50 51 17 40",
        "-1 1 0 554 2239 81 41 49 35",
        "-1 2 0 416 2832 49 32 17 21",
        "-1 3 0 760 1852 81 45 49 35",
        "-1 3 1 749 2596 81 35 49 31",
        "0 0 0 0 1987 64 42 32 50",
        "0 1 0 806 2800 62 32 31 45",
        "0 2 0 693 2736 63 32 31 40",
        "0 3 0 240 1804 65 48 33 45",
        "0 3 1 155 3378 64 23 32 41",
        "1 0 0 393 2444 64 38 32 56",
        "1 1 0 868 2800 62 32 31 50",
        "1 2 0 637 3081 62 31 31 50",
        "1 3 0 487 2363 64 40 32 50",
        "1 3 1 581 3424 64 20 32 43",
        "2 0 0 486 1944 65 42 33 55",
        "2 1 0 756 2736 63 32 32 40",
        "2 2 0 930 2800 62 32 31 45",
        "2 3 0 732 1804 64 47 32 40",
        "2 3 1 219 3378 64 23 32 36",
        "3 0 0 473 1548 81 51 32 45",
        "3 1 0 465 2832 49 32 32 21",
        "3 2 0 635 2239 81 41 32 35",
        "3 3 0 846 3081 49 31 32 21",
        "3 3 1 49 3143 49 30 32 26"
       ],
       "L4": [
        "-1 0 0 259 1703 50 51 17 40",
        "-1 1 0 80 2281 80 41 49 35",
        "-1 2 0 514 2832 49 32 17 21",
        "-1 3 0 841 1852 81 45 49 35",
        "-1 3 1 830 2596 81 35 49 31",
        "0 0 0 368 2281 64 41 32 48",
        "0 1 0 320 3081 64 31 32 43",
        "0 2 0 819 2736 63 32 31 39",
        "0 3 0 603 1804 65 47 33 43",
        "0 3 1 283 3378 64 23 32 41",
        "1 0 0 432 2281 64 41 32 59",
        "1 1 0 882 2736 63 32 32 54",
        "1 2 0 158 3112 63 30 32 49",
        "1 3 0 469 2521 64 37 32 54",
        "1 3 1 679 3445 64 18 32 47",
        "2 0 0 264 2444 65 38 33 60",
        "2 1 0 574 3081 63 31 31 49",
        "2 2 0 945 2736 63 32 31 54",
        "2 3 0 496 2281 64 41 32 49",
        "2 3 1 347 3378 64 23 32 45",
        "3 0 0 64 1987 64 42 32 54",
        "3 1 0 0 2768 63 32 32 39",
        "3 2 0 384 3081 64 31 32 43",
        "3 3 0 329 1852 64 46 32 39",
        "3 3 1 947 3378 64 22 32 35",
        "4 0 0 364 1703 81 50 32 44",
        "4 1 0 563 2832 49 32 32 21",
        "4 2 0 160 2281 80 41 31 35",
        "4 3 0 895 3081 49 31 32 21",
        "4 3 1 98 3143 49 30 32 26"
       ]
      }
     }
    }
   }
  };
})(globalThis.Spel = globalThis.Spel || {});
