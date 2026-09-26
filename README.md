# Aardschok (werktitel)

Een spel van Marcel en Claude, in de maak: een bouw- en beheerspel in isometrisch beeld, met
politiek en avontuur erin.

Je bent de schout van een gehucht onder een heer die alleen geld ziet. Je laat het gehucht groeien
(akkers, weides met vee, huizen, een smidse), je handelt met de marskramer, en elk jaar komt de heer
op Sint-Maarten halen wat hem toekomt. In oogstmaand komt zijn inner eerst tellen. Wat hij niet
ziet, hoeft de heer niet te krijgen: de kern is rijk worden en arm lijken. Later groeit het gehucht
tot een stad, en maak je je van de heer los, met stadsrechten of met een opstand.

Rondlopen en vechten gebeurt op dezelfde tegels. Begint er een gevecht, dan gaat de wereld verder
in beurten, zonder apart gevechtsscherm.

## Spelen

- Dubbelklik `index.html`, of draai `npm start` en ga naar http://localhost:8123.
- Een nieuw spel begint met een brief van de heer; "Aan het werk" sluit hem.
- Klik om te lopen, te praten of iets te gebruiken. Klik een boerderij om er iets te verstoppen.
- `B` bouwen · `V` de velden · `O` de spelregels · `P` pauze · `-` en `+` de snelheid ·
  `S` sluipen · `Esc` sluit een venster.
- In een gevecht klik je op een monster om te slaan, gooit `D` een deur dicht en eindigt `spatie`
  je beurt. Een gevecht proberen kan op http://localhost:8123/?kaart=proef.

## Maken

- `npm test` draait de regels van het spel in Node, zonder browser.
- http://localhost:8123/gereedschap/ is het gereedschap: de kaarten, de gesprekken en de quests.
- De pixel art komt uit code (`gereedschap/pixelart/`): `npm run pixelart` rendert alles,
  `npm run pixelart:spel` zet klaar wat het spel tekent.
- Het ontwerp staat in `ontwerp/`, en `ontwerp/werklijst.md` zegt waar we zijn. Hoe de code in
  elkaar zit, staat in `CLAUDE.md`.
