# Aardschok (werktitel)

Een spel van Marcel en Claude. Wat hier nu staat, is een proefje: één torenverdieping om
de kern te testen.

Een isometrisch avontuur in de browser. Je loopt vrij rond, praat met mensen, pakt dingen op
en opent deuren. Zodra een monster je ziet, bevriest de wereld en gaat het gevecht verder in
beurten, op dezelfde vloer: er is geen apart gevechtsscherm. Na het gevecht loop je gewoon door.

## Spelen

- Dubbelklik `index.html`, of draai `npm start` en ga naar http://localhost:8123.
- Klik om te lopen, te praten of iets te gebruiken.
- In een gevecht heb je 8 actiepunten per beurt. Lopen kost 1 per stap (ook schuin), slaan 3,
  een vuurschicht 5, drinken van de fontein 3, een deur dichtgooien 1.
- Toetsen in een gevecht: `1` slaan, `2` vuurschicht, `3` deur dicht, `spatie` einde beurt,
  `Esc` of rechtermuisknop annuleert de vuurschicht.

Het proefje is één verdieping met drie kamers: de hal (Wim, de conciërge, en een fontein), de
voorraadkamer (de sleutel en een slijmkruiper) en het trappenhuis (een skelet en de trap naar
boven).

## Testen

`npm test` draait de spelregels in Node: padzoeken, zicht, deuren, wie er meevecht en wat een
monster in zijn beurt doet. Daar is geen browser voor nodig.
