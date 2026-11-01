# V4: clipping

Per paar onderdelen en per beeld (`doorsteek4.py`): de driehoeken die elkaar snijden, en daarvan de driehoeken waar vanaf minstens één van de acht spelcamera's niets voor zit.

**Hoe je dit leest.** Het getal "zichtbaar" is een bovengrens: ook een bedoeld contact, zoals een vuist om een schacht of een mouw uit een armsgat, telt mee. Ik heb daarom gekeken of het meer wordt dan in de rust, en het op de platen nagekeken. De klassen:

- **intern:** hooguit 15 zichtbare driehoeken;
- **vast contact:** niet meer dan in de rust;
- **kortstondig:** in 1 of 2 beelden meer dan in de rust;
- **herhaald:** in meer beelden meer dan in de rust.

## Oordeel na het kijken

| Onderdeel | Klasse | Op beeld |
|---|---|---|
| Broek door de rok, heup | Grotendeels opgelost: van 1359 naar 216 snijdend | Niet meer zichtbaar op de platen |
| Rok door de laars, lopen | Herhaald, maar klein | Zoom raakt de omslag bij een opgetild been (`E-loop-rok.png`) |
| Broek in de laars | Herhaald, klein | De omslag beweegt langs de broek; leest als een dunne ring onder de rok |
| Mouw door de tabberd | Kortstondig | Bedoelde naad bij het armsgat |
| Speer door de mouw, TEST steek | Herhaald, 5 van 8 beelden | **Zichtbaar.** Bij een echte aanval opnieuw bekijken |
| Vuist en speer | Vast contact | Bedoeld |
| Helm en kap | Vast contact | Kap zit onder de helm; op `helm-controle.png` komt hij er niet doorheen. Het getal is hier te ruim |
| Buidel op de rok | Vast contact | Ligt erop; de achterkant is uitgesneden |

**Ernstige clipping die een animatie onbruikbaar maakt: niet gevonden** in `lopen` en `staan`, op 6 van de 12 loopbeelden in ZW, W en NO en 4 beelden groot in ZW en W. Niet elk beeld in elke richting is met het oog nagekeken.

**Wat wel opvalt in de loop:** de rok is een paneel dat met de benen meegaat, en in W klapt hij bij de opgetilde knie nog wat stijf op. Op een paar beelden staat een klein plooilijntje in de rok (ZW 3 en 6). Onder de rok lijkt de knie nog op een bal als het been opgetild is.

## De cijfers

**Rust, 4 beelden**

| Paar | V3 snijdt, gem. | V3 zichtbaar, gem./hoogste | V4 snijdt, gem. | V4 zichtbaar, gem./hoogste | Beelden boven de rust | Klasse V4 |
|---|---|---|---|---|---|---|
| tabberd/hozen | 1162 | 834/896 | 136 | 64/83 | 0 van 4 | vast contact |
| tabberd/laarzen | 1010 | 714/780 | 0 | 0/0 | 0 van 4 | intern |
| tabberd/gambeson | 2029 | 1471/1567 | 1816 | 876/1089 | 0 van 4 | vast contact |
| tabberd/buidel | 670 | 350/414 | 703 | 369/403 | 0 van 4 | vast contact |
| handschoenen/speer | 749 | 650/688 | 799 | 628/651 | 0 van 4 | vast contact |
| hozen/laarzen | 1221 | 102/163 | 541 | 13/15 | 0 van 4 | intern |
| helm/kap | 2632 | 968/1243 | 1800 | 669/827 | 0 van 4 | vast contact |
| kap/tabberd | 1086 | 322/341 | 991 | 318/381 | 0 van 4 | vast contact |
| gambeson/handschoenen | 409 | 47/76 | 454 | 60/78 | 0 van 4 | vast contact |
| gambeson/buidel | 113 | 0/0 | 0 | 0/0 | 0 van 4 | intern |

**Lopen, 12 beelden**

| Paar | V3 snijdt, gem. | V3 zichtbaar, gem./hoogste | V4 snijdt, gem. | V4 zichtbaar, gem./hoogste | Beelden boven de rust | Klasse V4 |
|---|---|---|---|---|---|---|
| tabberd/hozen | 1359 | 927/1157 | 216 | 110/213 | 6 van 12 | herhaald |
| tabberd/laarzen | 1269 | 841/976 | 112 | 63/241 | 8 van 12 | herhaald |
| tabberd/gambeson | 2331 | 1593/1851 | 1864 | 985/1305 | 2 van 12 | kortstondig |
| tabberd/buidel | 769 | 472/706 | 682 | 348/481 | 0 van 12 | vast contact |
| handschoenen/speer | 728 | 643/697 | 741 | 664/723 | 0 van 12 | vast contact |
| hozen/laarzen | 1289 | 131/239 | 1069 | 88/166 | 10 van 12 | herhaald |
| helm/kap | 2625 | 1037/1381 | 1786 | 659/821 | 0 van 12 | vast contact |
| kap/tabberd | 1086 | 317/423 | 1011 | 358/419 | 0 van 12 | vast contact |
| gambeson/handschoenen | 462 | 57/85 | 613 | 90/132 | 2 van 12 | kortstondig |
| gambeson/buidel | 124 | 3/17 | 16 | 1/10 | 0 van 12 | intern |

**TEST steek, 8 beelden**

| Paar | V3 snijdt, gem. | V3 zichtbaar, gem./hoogste | V4 snijdt, gem. | V4 zichtbaar, gem./hoogste | Beelden boven de rust | Klasse V4 |
|---|---|---|---|---|---|---|
| tabberd/hozen | 1165 | 774/836 | 192 | 96/114 | 2 van 8 | kortstondig |
| tabberd/laarzen | 1035 | 690/843 | 0 | 0/0 | 0 van 8 | intern |
| tabberd/handschoenen | 6 | 5/37 | 0 | 0/0 | 0 van 8 | intern |
| tabberd/gambeson | 2126 | 1423/1574 | 1804 | 944/1090 | 0 van 8 | vast contact |
| tabberd/speer | 13 | 10/42 | 11 | 9/35 | 2 van 8 | kortstondig |
| tabberd/buidel | 717 | 467/518 | 788 | 384/427 | 0 van 8 | vast contact |
| handschoenen/speer | 827 | 519/619 | 881 | 638/904 | 1 van 8 | kortstondig |
| hozen/laarzen | 998 | 56/90 | 652 | 15/53 | 1 van 8 | kortstondig |
| helm/kap | 2573 | 906/1205 | 1732 | 669/903 | 1 van 8 | kortstondig |
| kap/tabberd | 1087 | 299/326 | 1015 | 332/420 | 0 van 8 | vast contact |
| gambeson/handschoenen | 409 | 65/76 | 456 | 88/120 | 1 van 8 | kortstondig |
| gambeson/buidel | 164 | 27/47 | 26 | 8/15 | 0 van 8 | intern |
| speer/laarzen | 33 | 28/225 | 31 | 30/241 | 1 van 8 | kortstondig |
| speer/gambeson | 230 | 194/341 | 239 | 206/380 | 5 van 8 | herhaald |

**TEST val, 8 beelden**

| Paar | V3 snijdt, gem. | V3 zichtbaar, gem./hoogste | V4 snijdt, gem. | V4 zichtbaar, gem./hoogste | Beelden boven de rust | Klasse V4 |
|---|---|---|---|---|---|---|
| tabberd/hozen | 1146 | 688/786 | 140 | 70/82 | 0 van 8 | vast contact |
| tabberd/laarzen | 937 | 560/736 | 0 | 0/0 | 0 van 8 | intern |
| tabberd/gambeson | 2048 | 1262/1404 | 1815 | 807/1089 | 0 van 8 | vast contact |
| tabberd/buidel | 684 | 448/518 | 706 | 387/464 | 0 van 8 | vast contact |
| handschoenen/speer | 793 | 653/736 | 800 | 666/743 | 0 van 8 | vast contact |
| hozen/laarzen | 901 | 80/129 | 542 | 75/170 | 4 van 8 | herhaald |
| helm/kap | 2628 | 1098/1426 | 1808 | 772/878 | 2 van 8 | kortstondig |
| kap/tabberd | 1070 | 352/428 | 994 | 355/454 | 1 van 8 | kortstondig |
| gambeson/handschoenen | 409 | 54/76 | 454 | 70/97 | 0 van 8 | vast contact |
| gambeson/buidel | 90 | 0/0 | 0 | 0/0 | 0 van 8 | intern |

**TEST hoofd om, 6 beelden**

| Paar | V3 snijdt, gem. | V3 zichtbaar, gem./hoogste | V4 snijdt, gem. | V4 zichtbaar, gem./hoogste | Beelden boven de rust | Klasse V4 |
|---|---|---|---|---|---|---|
| tabberd/hozen | 1146 | 791/851 | 140 | 69/80 | 0 van 6 | vast contact |
| tabberd/laarzen | 937 | 634/723 | 0 | 0/0 | 0 van 6 | intern |
| tabberd/gambeson | 2048 | 1302/1375 | 1815 | 912/1141 | 1 van 6 | kortstondig |
| tabberd/buidel | 684 | 469/498 | 706 | 370/434 | 0 van 6 | vast contact |
| handschoenen/speer | 793 | 644/680 | 800 | 648/686 | 0 van 6 | vast contact |
| hozen/laarzen | 901 | 30/77 | 542 | 18/31 | 0 van 6 | vast contact |
| helm/kap | 2603 | 1048/1308 | 1848 | 724/958 | 1 van 6 | kortstondig |
| kap/tabberd | 1072 | 329/410 | 997 | 342/372 | 0 van 6 | vast contact |
| gambeson/handschoenen | 409 | 58/76 | 454 | 62/78 | 0 van 6 | vast contact |
| gambeson/buidel | 90 | 0/0 | 0 | 0/0 | 0 van 6 | intern |

