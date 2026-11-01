# V4: analyse

## Wat er bestaat

- **Geen aanvals- of sterfanimatie op dit skelet.** `beweging.py` kent alleen `staan` en `lopen`. `aanval`, `aanval2`, `geraakt` en `sterven` bestaan alleen als oude vellen van het eerdere model (`beelden/figuren/speerman3d-*.png`). Die kan ik niet op V4 testen. Ik heb daarom een steek en een val als **test** gemaakt (`proef_steek`, `proef_val`); dat zijn geen spelanimaties.
- **De referentie is niet overal consistent.** In ZW houdt de figuur de speer in de andere hand. De Z staat naar schatting 15 tot 20 graden gedraaid. Ik vergelijk ZW daarom gespiegeld, en schouders en riem in Z zijn alleen een richting.
- **Spelcamera:** orthografisch, 30 graden, 768 pixels, 3 meter in beeld. Klei-vergelijkingen: 25 graden, gelijk voor V3 en V4.
- **In het spel:** de vellen en JSON per houding (`T.sprites.figuurGegevens`), getekend in WebGL2. Aan die architectuur is niets veranderd.

## De vijf grootste afwijkingen van V3

| # | Afwijking | Bewijs | Wat ik deed |
|---|---|---|---|
| 1 | **Houding:** symmetrisch, vrije hand langs de heup, armen naar buiten | Hele breedte 0,685 tegen 0,601 op de plaat | Nieuwe rustpose: gewicht op één been, vuist voor het lijf |
| 2 | **Armen:** dun en rond; op de plaat breed bij de schouder, taps, en van opzij dieper dan breed | Van opzij 0,154 op de plaat tegen zo'n 0,12 | Ovale taps toelopende mouw, tot in de kap stevig |
| 3 | **Bovenbouw:** schouders als een rechte buis, brede taille | Riem 0,342 tegen 0,268 | Aflopende schouderlijn, borst-taille-heup |
| 4 | **Benen en laarzen:** knie als bal, omslag als dunne ring, ronde neus | Doorsteek broek door rok: 1359 driehoeken in de loop | Dij, knie, kuit en enkel apart; hoge neus, losse zool en hak, dikke omslag |
| 5 | **Tabberd:** stijve massieve rok, zwarte keep opzij | `E-loop-rok.png` van V3 | Holle rok met dikte, geen zijsplit, zachtere gewichten |

## De referentie gemeten

Gemeten op een raster op `aardschok-speerman-detail.png`: zie `V4-PROPORTIES.md`.

- **Gemeten (±1 plaatpixel):** helm, gezicht, schouders, riem, zoom, mouw, laars, voetafstand, speer in beeld.
- **Geschat:** camerahoek op de plaat (25 tot 30 graden), hoe ver de figuur gedraaid staat, de hoogte van de vuist (uit Z en W samen).
- **Niet meetbaar:** echte maten in meter, de lengte van arm- en beenbotten onder de kleren, heup- en taillebreedte onder de tabberd.

**Een correctie op mezelf:** in V3 schatte ik het gezicht op 0,23; op het raster is het 0,197. V3 zat daar dus al goed, en het breder maken was onnodig. V4 staat nu op 0,189.

## De opmerkingen van Marcel tijdens het werk

Elk van deze ging na controle op een plaat over een echt verschil.

| Marcel | Oorzaak | Oplossing |
|---|---|---|
| "Het heup tasje hangt ook niet tegen het lijf aan" | De buidel stond plat naar voren, en mijn verschuiving maakte dat erger | 41° gedraaid, 14° gekanteld, op de heup |
| "Lijken wel hoekig er vanaf te staan" | Rechte hoeken, te dik | Dunner, ronde hoeken, gebogen om de heup, achterkant volgt de rok |
| "Schouders [...] lijken ook iets meer naar beneden te 'hangen'" | Te rechte schouderlijn | Mesh loopt af; het sleutelbeen zakt 11° in de rust |
| "Boven armen op de referentie lijken ook wat 'bulkier'" en "Armen staan ook anders" | De vrije arm hing langs het lijf | Elleboog gebogen, vuist voor het lijf; dikkere mouw |
| "De bovenarm moet bij de schouders breder zijn en 'tapering'" | Ik had hem omgekeerd gemaakt | Breed bij de schouder, taps naar de elleboog |
| "Schouder nog niet breed genoeg, vanaf de zijkant" | De arm was rond | Ovale doorsnede: 1,28 keer dieper dan breed bij de schouder |
| "Nu wordt het te poeferig. Breed naar smal" | Een bol bij de schouder | Bol weg: één taps toelopende vorm |
| "de onderarm lijkt nu wel een sprietje. De pols een sate stok" | Te ver versmald | Onderarm 0,05 naar 0,046; stevige pols |
| "Vergelijk nog even goed de armen" | Elleboog te ver opzij, speer te ver naar buiten | Elleboog naar achteren, speerhand naar binnen |
| "Lijkt wat onnatuurlijk die elleboog" | De arm vouwde dubbel, zo'n 50° | Hand verder weg: nu 86° |
| "De hand [...] heel fors en de ZW is heel raar met de hoek van de hand met pols" | Te grote hand; handrichting stond los van de onderarm | Hand 1,02; hand volgt de onderarm: pols 11° en 16° |
| "Het poppetje is kleiner in verhouding" en "De referentie is langer" | Twee dingen: de figuur was echt 3,1 % korter (77,5 pixels), én mijn platen schaalden op de hoogte met speer. Op de 80-pixelplaat stond de referentie op 91 pixels tegen 77,5: **een misleidende vergelijking** | De sprite rekent op de echte lengte: weer 80 pixels. Alle platen staan nu op dezelfde figuurhoogte, helm tot zool |

## De nieuwe rustpose

Gewicht op het linkerbeen, rechtervoet los naar voren en opzij. Vrije heup iets lager en naar voren, borst weer recht. Schouders ontspannen. Speerarm 86° gebogen, vrije arm 95°, vuist voor het lijf.

- **Voetafstand:** 0,295 m, dat is 1,28 keer de heupbreedte; de vrije voet staat 0,08 m naar voren. Op de plaat is hij in beeld wijder (0,293 van de hoogte tegen 0,241). Verder uit elkaar kan wel, maar dan staat de speer door de vrije voet; 1,28 oogde stabiel en bleef vrij. **Dit blijft wel een afwijking.**
- **Zwaartepunt:** bekken op x = 0,026, steunvlak van -0,17 tot 0,125: binnen.
- **Grond:** in de rust zweefde de voet 1,5 cm. Dat zit ook in de productie (`beweging.py` zet de enkel op 0,10 m, het model heeft hem lager). In V4 staat de zool er nu op (-3 mm).

Acht richtingen: `bewijs/v4/C-acht-richtingen.png`. De figuur draait als geheel, dus de stand blijft dezelfde.

## De tabberd: variant A of B

| | A: betere gewichten | B: hulpbotten per pand |
|---|---|---|
| Nieuwe botten | 0 | 4 (`rokp.VL`, `VR`, `AL`, `AR`) |
| Op beeld | Schone rok, kleine plooien | Benen komen als bult door de stof (`tabberd-A-boven-B-onder.png`) |
| Complexiteit | Laag | Hoger: extra kanalen, vertraging over beelden, export |
| Reproduceerbaar | Ja | Ja |

| Lopen, paar | A snijdt, gem. | A zichtbaar, gem. | B snijdt, gem. | B zichtbaar, gem. |
|---|---|---|---|---|
| tabberd/hozen | 646 | 325 | 1184 | 578 |
| tabberd/laarzen | 124 | 70 | 795 | 443 |
| tabberd/buidel | 1105 | 497 | 1054 | 495 |
| tabberd/gambeson | 1913 | 1038 | 1814 | 979 |

**Gekozen: A.** Beter op elke meting, op beeld, en eenvoudiger. B kan misschien beter met andere draaipunten, maar daar is geen reden voor zolang A dit haalt. B blijft beschikbaar met `rok=B`. Beide zijn gemeten vóór de laatste kleine aanpassingen aan de broek.

## Waar ik afweek van de opdracht

- **Baard:** de opdracht zegt "geen zware baard" en "stoppelbaard indien aanwezig in de referentie". De referentie heeft een volle korte baard. De referentie is leidend, dus die staat erop, lichter dan in V3.
- **Dolk:** staat wel apart op de plaat met onderdelen, maar niet op de figuur. Daarom niet toegevoegd.
- **Hoofdaandeel:** 30,6 % gemeten van hals tot kruin; ik hield de verhouding van V3 aan, op zijn vraag "Behoud de verbeterde hoofd-lichaamverhouding".
