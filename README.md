# Aardschok (werktitel)

Een spel van Marcel en Claude. Wat hier nu staat, is een proefje: één torenverdieping om
de kern te testen.

Een isometrisch avontuur in de browser. Je loopt vrij rond, praat met mensen, pakt dingen op
en opent deuren. Zodra een monster je ziet, bevriest de wereld en gaat het gevecht verder in
beurten, op dezelfde vloer: er is geen apart gevechtsscherm. Na het gevecht loop je gewoon door.

## De laatste klim

Je speelt een tovenaar van 84. Je leeftijd is je levensbalk: elke vuurschicht kost je een jaar
van je leven, elke klap van een monster een paar maanden, en op je honderdste is het voorbij.
Genezen bestaat niet; de fontein heeft nog één slok, die je twee jaar jonger maakt. Hoe ouder je
wordt, hoe trager je lijf (minder actiepunten) en hoe sterker je magie. Slaan met je staf kost
geen jaren, maar dan sta je wel binnen bereik. Een gevecht dat je vermijdt, kost niets. Aan het
eind telt hoe oud je boven aankomt.

## Spelen

- Dubbelklik `index.html`, of draai `npm start` en ga naar http://localhost:8123.
- Klik om te lopen, te praten of iets te gebruiken.
- `S` (of de knop linksboven) laat je sluipen: je loopt half zo snel, maar monsters merken je pas
  twee tegels later op. Zo ontloop je een gevecht, en dat kost geen enkel jaar.
- In een gevecht heb je 8 actiepunten per beurt (vanaf je negentigste 7, vanaf je
  vijfennegentigste 6). Lopen kost 1 per stap (ook schuin), slaan met je staf 3, een vuurschicht
  5 (en een jaar), de laatste slok uit de fontein 3, een deur dichtgooien 1.
- Toetsen in een gevecht: `1` slaan, `2` vuurschicht, `3` deur dicht, `spatie` einde beurt,
  `Esc` of rechtermuisknop annuleert de vuurschicht.

Het proefje is één verdieping met drie kamers: de hal (Wim, de conciërge, en een fontein), de
voorraadkamer (de sleutel en een slijmkruiper) en het trappenhuis (een skelet en de trap naar
boven).

## Testen

`npm test` draait de spelregels in Node: padzoeken, zicht, deuren, wie er meevecht en wat een
monster in zijn beurt doet. Daar is geen browser voor nodig.
