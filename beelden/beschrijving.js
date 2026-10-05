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
      110,
      105
     ],
     "anker": [
      55,
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
        104,
        99
       ],
       "anker": [
        52,
        78
       ]
      }
     }
    },
    "wieder": {
     "naam": "wieder",
     "cel": [
      100,
      109
     ],
     "anker": [
      50,
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
        48,
        90
       ],
       "anker": [
        24,
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
        78,
        88
       ],
       "anker": [
        39,
        77
       ]
      },
      "wieden": {
       "bestand": "wieder-wieden.png",
       "beelden": 12,
       "fps": 8,
       "herhaal": true,
       "cel": [
        94,
        101
       ],
       "anker": [
        47,
        77
       ]
      }
     }
    },
    "sprokkelaar": {
     "naam": "sprokkelaar",
     "cel": [
      104,
      108
     ],
     "anker": [
      52,
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
        98,
        102
       ],
       "anker": [
        49,
        83
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
   "paaltje": {
    "bestand": "paaltje.png",
    "cel": [
     20,
     31
    ],
    "anker": [
     10,
     25
    ]
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
   }
  };
})(globalThis.Spel = globalThis.Spel || {});
