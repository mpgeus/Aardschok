# Aardschok (werktitel)

Een spel van Marcel en Claude, in de maak: een bouw- en beheerspel in isometrisch beeld, met
politiek en avontuur erin.

Je komt met een huifkar op een lege plek op een eiland, onder een heer die alleen geld ziet. Je bouwt
alles zelf, van bovenaf, als een god (akkers, huizen, werkplaatsen, wegen), een ossenkar haalt de waren
op, je handelt met de marskramer, en elk jaar komt de heer op Sint-Maarten halen wat hem toekomt. Je
vecht in real time: je stuurt je soldaten en je aanvoerder, de held van het dorp. Het doel is de heer
verstoten en verslaan.

## Spelen

- Dubbelklik `index.html`, of draai `npm start` en ga naar http://localhost:8123.
- Een nieuw spel begint met een brief van de heer; "Aan het werk" sluit hem.
- Links kiest (een gebouw, een dorpeling, je mannen; een kader om meer), rechts stuurt je mannen erheen of op een
  vijand af. `Tab` kiest de aanvoerder, `1` tot `9` een groep (`Shift` erbij maakt er een).
- `B` bouwen · `V` de velden · `W` de wetten · `P` pauze · `-` en `+` de snelheid · `Spatie` naar het laatste
  bericht · `Esc` sluit een venster.

## Maken

- `npm test` draait de regels van het spel in Node, zonder browser.
- http://localhost:8123/gereedschap/ is het gereedschap: de kaarten, de gesprekken en de quests.
- De pixel art komt uit code (`gereedschap/pixelart/`): `npm run pixelart` rendert alles,
  `npm run pixelart:spel` zet klaar wat het spel tekent.
- Het ontwerp staat in `ontwerp/`, en `ontwerp/werklijst.md` zegt waar we zijn. Hoe de code in
  elkaar zit, staat in `CLAUDE.md`.
