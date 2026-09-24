// Gemaakt door gereedschap/pixelart/bouwfasen-sdf.cjs — niet met de hand bijwerken.
// Dezelfde inhoud als bouwfasen-sdf.json, als script, zodat file:// het ook kan lezen. Wordt ná
// tegels/bouwfasen.js geladen en voegt zijn types toe aan T.BOUWFASEN; het vervangt niets.
(function (T) {
  T.BOUWFASEN = T.BOUWFASEN || { fasen: {} };
  T.BOUWFASEN.fasen.huisVakwerkRiet = {
   "_lees_dit": "Een vakwerkhuis met riet in aanbouw, gemaakt door gereedschap/pixelart/bouwfasen-sdf.cjs (huis-sdf.cjs zaad 4) — niet met de hand bijwerken. Afgewerkt is het de tegel \"huisVakwerkRiet\" in tegels/gebouwen.tsx, uit dezelfde render: zelfde anker, zelfde muren. Per fase (0..5, oplopend in afbouw): x/y/b/h snijdt de cel uit bestand, anker is het punt in die cel dat op T.naarScherm(x, y) van de aangeklikte tegel komt (de achterste voethoek, een halve tegel boven het midden van die tegel, zoals tegels.json), vanaf is de voortgang (0..1) waarop de fase begint, en bezet zijn de ringtegels [dx, dy] waar dan een stapel of de leemkuil ligt, gerekend vanaf de achterste voettegel (dx van -rand tot beslaat[0]-1+rand, dy net zo; +x en +y liggen vooraan). De steiger staat op de rij dy = beslaat[1] maar is niet bezet: daaronder loop je door. rand is hoe breed de ring is; alles van de bouwplaats valt daarbinnen. hoogstePunt is de fase waarin de kap staat (de meiboom, het pannenbier).",
   "gebouw": "huis",
   "bestand": "bouwfasen-sdf.png",
   "beslaat": [
    7,
    5
   ],
   "rand": 1,
   "hoogstePunt": 3,
   "fasen": [
    {
     "x": 0,
     "y": 0,
     "b": 492,
     "h": 509,
     "anker": [
      211,
      313
     ],
     "naam": "uitzetten",
     "vanaf": 0,
     "bezet": [
      [
       0,
       -1
      ],
      [
       1,
       -1
      ],
      [
       2,
       -1
      ],
      [
       3,
       -1
      ],
      [
       4,
       -1
      ],
      [
       5,
       -1
      ],
      [
       6,
       -1
      ],
      [
       7,
       0
      ],
      [
       -1,
       1
      ],
      [
       7,
       1
      ],
      [
       -1,
       2
      ],
      [
       7,
       2
      ],
      [
       -1,
       3
      ],
      [
       7,
       3
      ],
      [
       -1,
       4
      ],
      [
       7,
       4
      ]
     ]
    },
    {
     "x": 492,
     "y": 0,
     "b": 492,
     "h": 509,
     "anker": [
      211,
      313
     ],
     "naam": "voet",
     "vanaf": 0.06,
     "bezet": [
      [
       0,
       -1
      ],
      [
       1,
       -1
      ],
      [
       2,
       -1
      ],
      [
       3,
       -1
      ],
      [
       4,
       -1
      ],
      [
       5,
       -1
      ],
      [
       6,
       -1
      ],
      [
       7,
       0
      ],
      [
       -1,
       1
      ],
      [
       7,
       1
      ],
      [
       -1,
       2
      ],
      [
       7,
       2
      ],
      [
       -1,
       3
      ],
      [
       7,
       3
      ],
      [
       -1,
       4
      ],
      [
       7,
       4
      ]
     ]
    },
    {
     "x": 984,
     "y": 0,
     "b": 492,
     "h": 509,
     "anker": [
      211,
      313
     ],
     "naam": "gebint",
     "vanaf": 0.2,
     "bezet": [
      [
       0,
       -1
      ],
      [
       1,
       -1
      ],
      [
       2,
       -1
      ],
      [
       3,
       -1
      ],
      [
       4,
       -1
      ],
      [
       6,
       -1
      ],
      [
       7,
       0
      ],
      [
       -1,
       1
      ],
      [
       7,
       1
      ],
      [
       -1,
       2
      ],
      [
       7,
       2
      ],
      [
       -1,
       3
      ],
      [
       7,
       3
      ],
      [
       -1,
       4
      ],
      [
       7,
       4
      ]
     ]
    },
    {
     "x": 1476,
     "y": 0,
     "b": 492,
     "h": 509,
     "anker": [
      211,
      313
     ],
     "naam": "kap",
     "vanaf": 0.4,
     "bezet": [
      [
       6,
       -1
      ],
      [
       7,
       0
      ],
      [
       -1,
       1
      ],
      [
       7,
       1
      ],
      [
       -1,
       2
      ],
      [
       7,
       2
      ],
      [
       -1,
       3
      ],
      [
       7,
       3
      ],
      [
       -1,
       4
      ],
      [
       7,
       4
      ]
     ]
    },
    {
     "x": 1968,
     "y": 0,
     "b": 492,
     "h": 509,
     "anker": [
      211,
      313
     ],
     "naam": "riet",
     "vanaf": 0.52,
     "bezet": [
      [
       6,
       -1
      ],
      [
       7,
       0
      ],
      [
       -1,
       1
      ],
      [
       7,
       1
      ],
      [
       -1,
       2
      ],
      [
       7,
       2
      ],
      [
       -1,
       3
      ],
      [
       7,
       3
      ],
      [
       -1,
       4
      ],
      [
       7,
       4
      ]
     ]
    },
    {
     "x": 2460,
     "y": 0,
     "b": 492,
     "h": 509,
     "anker": [
      211,
      313
     ],
     "naam": "leem",
     "vanaf": 0.8,
     "bezet": [
      [
       6,
       -1
      ],
      [
       7,
       0
      ],
      [
       -1,
       1
      ],
      [
       7,
       1
      ],
      [
       -1,
       2
      ],
      [
       -1,
       3
      ],
      [
       -1,
       4
      ],
      [
       7,
       4
      ]
     ]
    }
   ]
  };
  T.BOUWFASEN.fasen.hutVlechtRiet = {
   "_lees_dit": "Een hut van vlechtwerk met leem en riet in aanbouw, gemaakt door gereedschap/pixelart/bouwfasen-sdf.cjs (huis-sdf.cjs zaad 8) — niet met de hand bijwerken. Afgewerkt is het de tegel \"hutVlechtRiet\" in tegels/gebouwen.tsx, uit dezelfde render: zelfde anker, zelfde muren. Per fase (0..5, oplopend in afbouw): x/y/b/h snijdt de cel uit bestand, anker is het punt in die cel dat op T.naarScherm(x, y) van de aangeklikte tegel komt (de achterste voethoek, een halve tegel boven het midden van die tegel, zoals tegels.json), vanaf is de voortgang (0..1) waarop de fase begint, en bezet zijn de ringtegels [dx, dy] waar dan een stapel of de leemkuil ligt, gerekend vanaf de achterste voettegel (dx van -rand tot beslaat[0]-1+rand, dy net zo; +x en +y liggen vooraan). De ladder van de rietdekker staat in fase 4 (riet) op de rij dy = beslaat[1] maar is niet bezet. rand is hoe breed de ring is; alles van de bouwplaats valt daarbinnen. hoogstePunt is de fase waarin de kap staat (de tak op de nok, het pannenbier).",
   "gebouw": "hut",
   "bestand": "bouwfasen-sdf-hut.png",
   "beslaat": [
    5,
    4
   ],
   "rand": 1,
   "hoogstePunt": 3,
   "fasen": [
    {
     "x": 0,
     "y": 0,
     "b": 382,
     "h": 438,
     "anker": [
      170,
      293
     ],
     "naam": "uitzetten",
     "vanaf": 0,
     "bezet": [
      [
       0,
       -1
      ],
      [
       1,
       -1
      ],
      [
       2,
       -1
      ],
      [
       3,
       -1
      ],
      [
       4,
       -1
      ],
      [
       -1,
       0
      ],
      [
       5,
       0
      ],
      [
       -1,
       1
      ],
      [
       5,
       1
      ],
      [
       -1,
       2
      ],
      [
       5,
       2
      ],
      [
       5,
       3
      ],
      [
       0,
       4
      ]
     ]
    },
    {
     "x": 382,
     "y": 0,
     "b": 382,
     "h": 438,
     "anker": [
      170,
      293
     ],
     "naam": "palen",
     "vanaf": 0.08,
     "bezet": [
      [
       0,
       -1
      ],
      [
       1,
       -1
      ],
      [
       2,
       -1
      ],
      [
       3,
       -1
      ],
      [
       4,
       -1
      ],
      [
       -1,
       0
      ],
      [
       5,
       0
      ],
      [
       -1,
       1
      ],
      [
       5,
       1
      ],
      [
       -1,
       2
      ],
      [
       5,
       2
      ],
      [
       5,
       3
      ],
      [
       0,
       4
      ]
     ]
    },
    {
     "x": 764,
     "y": 0,
     "b": 382,
     "h": 438,
     "anker": [
      170,
      293
     ],
     "naam": "vlechtwerk",
     "vanaf": 0.2,
     "bezet": [
      [
       0,
       -1
      ],
      [
       1,
       -1
      ],
      [
       2,
       -1
      ],
      [
       3,
       -1
      ],
      [
       4,
       -1
      ],
      [
       5,
       0
      ],
      [
       5,
       1
      ],
      [
       5,
       2
      ],
      [
       5,
       3
      ],
      [
       0,
       4
      ]
     ]
    },
    {
     "x": 1146,
     "y": 0,
     "b": 382,
     "h": 438,
     "anker": [
      170,
      293
     ],
     "naam": "kap",
     "vanaf": 0.45,
     "bezet": [
      [
       5,
       0
      ],
      [
       5,
       1
      ],
      [
       5,
       2
      ],
      [
       5,
       3
      ],
      [
       0,
       4
      ]
     ]
    },
    {
     "x": 1528,
     "y": 0,
     "b": 382,
     "h": 438,
     "anker": [
      170,
      293
     ],
     "naam": "riet",
     "vanaf": 0.55,
     "bezet": [
      [
       5,
       0
      ],
      [
       5,
       1
      ],
      [
       5,
       2
      ],
      [
       5,
       3
      ],
      [
       0,
       4
      ]
     ]
    },
    {
     "x": 1910,
     "y": 0,
     "b": 382,
     "h": 438,
     "anker": [
      170,
      293
     ],
     "naam": "leem",
     "vanaf": 0.8,
     "bezet": [
      [
       5,
       0
      ],
      [
       5,
       1
      ],
      [
       0,
       4
      ]
     ]
    }
   ]
  };
})(globalThis.Toren = globalThis.Toren || {});
