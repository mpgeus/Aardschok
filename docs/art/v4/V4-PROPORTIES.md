# V4: proporties

## Tegen de referentie

Richting Z, klei, 25 graden, zelfde camera voor V3 en V4. Alle platen staan op dezelfde figuurhoogte, helm tot zool, zonder de speer. De plaat is afgelezen op een raster (±1 plaatpixel, zo'n 0,3 %). "Gelijk" is een verschil van minder dan 0,003.

| Maat (deel van de hoogte, helm tot zool; speer: speer gedeeld door hoogte) | Plaat | V3 | V4 | Afwijking V3 | Afwijking V4 | Oordeel |
|---|---|---|---|---|---|---|
| helmrand | 0,349 | 0,330 | 0,341 | -5,5 % | -2,1 % | beter |
| koepel | 0,261 | 0,244 | 0,246 | -6,5 % | -5,6 % | gelijk |
| gezicht met haar | 0,197 | 0,201 | 0,189 | +2,1 % | -4,2 % | slechter |
| helm tot baard | 0,334 | 0,357 | 0,354 | +6,7 % | +6,1 % | gelijk |
| helm tot riem | 0,575 | 0,587 | 0,569 | +2,1 % | -1,0 % | beter |
| schouders (tabberd) | 0,388 | 0,414 | 0,346 | +6,8 % | -10,9 % | slechter |
| riem | 0,268 | 0,342 | 0,297 | +27,5 % | +10,8 % | beter |
| zoom | 0,410 | 0,385 | 0,399 | -6,2 % | -2,6 % | beter |
| riem tot zoom | 0,235 | 0,222 | 0,233 | -5,6 % | -0,7 % | beter |
| bovenarm | 0,103 | 0,090 | 0,084 | -12,4 % | -18,9 % | slechter |
| laars | 0,220 | 0,217 | 0,223 | -1,2 % | +1,5 % | gelijk |
| hele breedte | 0,601 | 0,685 | 0,612 | +14,0 % | +1,9 % | beter |
| voetafstand | 0,293 | 0,243 | 0,241 | -16,9 % | -17,9 % | gelijk |
| speer | 1,167 | 1,244 | 1,195 | +6,6 % | +2,4 % | beter |

**Samen:** 7 beter, 3 slechter, 4 gelijk.

- **Slechter, schouders:** gevolg van het hangende sleutelbeen, op Marcels opmerking. De plaat staat bovendien gedraaid.
- **Slechter, gezicht:** binnen de meetfout van wat op het raster kan; 0,189 tegen 0,197.
- **Slechter, bovenarm:** gemeten recht van voren op de helft van de arm, waar de tabberd een deel bedekt en de arm al taps is. Bij de schouder en van opzij is hij juist voller. **Dit is de maat die ik het minst vertrouw**; kijk naar de plaat.
- **Riem:** nog 11 % te breed, voetafstand nog 18 % te smal.

## Silhouet zonder speer

Z: V3 0,742, V4 0,786. N: V3 0,685, V4 0,731.

**Gecorrigeerd op 31 okt.** Eerder stond hier Z 0,563 en 0,622, en N 0,578 en 0,578. Dat was een meetfout: bij het weghalen van de speer op het id-beeld bleef een rand staan, en daardoor schaalde de maat op de hoogte met speer. Met een masker dat de helm heel laat (`docs/art/hunyuanproef.md`): Z 0,757 en 0,799, N 0,721 en 0,772.

Overlap na schalen op dezelfde hoogte. **Een benadering:** de plaat staat gedraaid en het masker verliest een deel van de helm (`B-silhouet.png`), omdat grijs staal op een grijze achtergrond staat. Z en N verbeteren allebei.

## De maten van het model

| Maat (meter) | Productie | V3 | V4 |
|---|---|---|---|
| Totale hoogte | 1,398 | 1,354 | 1,354 |
| Hoogte zonder helm (kruin) | 1,302 | 1,270 | 1,270 |
| Lengte voor de spriteschaal | 1,398 | 1,398 | 1,354 |
| Schouders (tabberd), in rust | 0,548 | 0,547 | 0,461 |
| Romp bij de borst | 0,493 | 0,480 | 0,461 |
| Taille (riem) | 0,488 | 0,451 | 0,401 |
| Heupen (broek) | 0,470 | 0,450 | 0,420 |
| Hoofd, hoogte | 0,540 | 0,493 | 0,493 |
| Hoofd, breedte | 0,282 | 0,276 | 0,267 |
| Helm, breedte | 0,518 | 0,436 | 0,464 |
| Helm, diepte | 0,534 | 0,436 | 0,453 |
| Helm, hoogte | 0,300 | 0,289 | 0,293 |
| Bovenarm (bot) | 0,200 | 0,200 | 0,200 |
| Onderarm (bot) | 0,200 | 0,200 | 0,200 |
| Bovenbeen (bot) | 0,170 | 0,170 | 0,170 |
| Onderbeen (bot) | 0,170 | 0,170 | 0,170 |
| Voet, lengte | 0,387 | 0,364 | 0,347 |
| Voet, breedte | 0,195 | 0,172 | 0,180 |
| Laars, hoogte | 0,266 | 0,252 | 0,246 |
| Tabberd, lengte | 0,680 | 0,697 | 0,699 |
| Rok, riem tot zoom | 0,303 | 0,336 | 0,338 |
| Zoom, breedte in rust | 0,672 | 0,616 | 0,609 |
| Speer, lengte | 1,828 | 1,828 | 1,799 |
| Speer, schacht | 0,061 | 0,061 | 0,061 |
| Speer, blad | 0,129 | 0,129 | 0,160 |

- Blender 5.2.3 LTS, metrisch, 1 eenheid = 1 meter.
- 26 botten, namen in `V4-ANIMATIECONTROLE.md`. Acties: `staan` 8 beelden, `lopen` 24.
- Eén materiaal `Stijl` met verf op de punten. Geen D8 of AI.
- Sprites: 80 pixels op de echte lengte, in acht richtingen. V4 is 1,354 m tegen 1,398 m in de productie. **Daarom rekent V4 3,2 % meer pixels per meter dan de productie**: de figuur is weer even hoog in beeld (Marcel: "Het poppetje is kleiner in verhouding"), en de stap past daarop mee.
- Speer: 1,799 m, dat is 1,33 keer de echte hoogte. Op de plaat in beeld 1,167 keer, V4 1,195, V3 1,244.

## Spriteanker, schaal en voetlijn

| | V3 | V4 |
|---|---|---|
| Staan: cel | 78×138 | 78×142 |
| Staan: anker | 39,0 / 123,36 | 38,5 / 123,21 |
| Lopen: cel | 84×141 | 89×147 |
| Lopen: anker | 42,0 / 127,36 | 44,5 / 132,21 |
| Stap | 0,3399 | 0,3508 |
| Fps | 3 en 15 | gelijk |
| Voetlijn staan in het vel, per richting | 142 tot 153 | 149 tot 162 |
| Voetlijn lopen in het vel | 139 tot 152 | 145 tot 158 |

**Cel, anker en stap veranderen mee met de grotere schaal.** Het anker blijft de oorsprong tussen de voeten, en het spel leest het per houding uit de JSON, dus de figuur staat in het spel op dezelfde plek. In de rust staat de voet naar voren, dus daar loopt de voetlijn verder uiteen per richting.
