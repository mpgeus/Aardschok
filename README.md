# Aardschok (werktitel)

Een spel van Marcel en Claude: een bouw- en beheerspel in isometrisch beeld, met politiek en
avontuur erin. Je bent de schout van een gehucht onder een verwarde heer die alleen geld ziet. Je
laat het dorp groeien, houdt de heer tevreden (of lijkt dat te doen), en maakt je aan het eind van
hem los. Het ontwerp staat in `ontwerp/spel.md`, de stand in `ontwerp/werklijst.md`.

Wat er nu te spelen is, is het tweede proefje: een jaar met de heer. Graan groeit en wordt
gemaaid, je bouwt huizen en werkplaatsen, de marskramer komt langs, na de oogst komt de inner van
de heer tellen, en op Sint-Maarten int de heer zijn deel. Rijk worden en arm lijken: wat je
verstopt, telt hij niet, zolang hij het niet vindt.

Onder het bouwen ligt een gevecht in beurten, op dezelfde tegels als het rondlopen. Zodra een
monster je ziet, bevriest de wereld en gaat het gevecht verder in beurten, op dezelfde grond. Er is
geen apart gevechtsscherm. Na het gevecht loop je gewoon door.

## Spelen

- Dubbelklik `index.html`, of draai `npm start` en ga naar http://localhost:8123.
- Klik om te lopen, te praten of iets te gebruiken.
- `B` opent het bouwmenu; `Esc` of de rechtermuisknop legt een gebouw weer weg.
- `P` zet de kalender stil of weer aan; `-` en `=` maken hem trager of sneller.
- `S` laat je sluipen: je loopt half zo snel, maar monsters merken je pas later op.
- In een gevecht heb je 8 actiepunten per beurt. Lopen kost 1 per stap (ook schuin), slaan 3 (klik
  op het monster), een deur dichtgooien 1 (`D`). `spatie` beëindigt je beurt.

## Testen

`npm test` draait de spelregels in Node: de kalender, bouwen, de voorraad, de heer en de inner,
padzoeken, zicht, deuren, wie er meevecht en wat een monster in zijn beurt doet. Daar is geen
browser voor nodig.
