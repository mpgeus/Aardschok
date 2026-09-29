// De naam van het spel, op één plek (Marcel, 28 sep: "De naam blijft aardschok voor nu. We maken later iets
// anders. Zorg dat we dat makkelijk door het hele spel kunnen aanpassen"; ontwerp/verpakken.md, "De naam").
// Een andere naam is deze ene regel: het tabblad van het spel en van het gereedschap, de server, de meldingen
// in de console, en straks het titelscherm, lezen hem hier. test/naam.test.cjs bewaakt dat hij nergens anders
// staat. Een bladzijde schrijft {naam} in haar titel, en data-spelnaam op een element; dit bestand vult ze in.
// (Niet data-naam: dat is in het venster van de spelregels de naam van een mens, js/hud.js.)
//
// De sleutel waaronder de browser bewaart wat hij onthoudt (de spelregels, en straks de opgeslagen spellen),
// staat eronder, en verandert bewust niet mee: met een nieuwe naam zou iedereen anders zijn spel kwijt zijn.
(function (T) {
  'use strict';

  T.NAAM = 'Aardschok';
  T.OPSLAG_SLEUTEL = 'aardschok';
  // Welke stand dit is. Leeg zolang het spel uit de map draait; in een proefversie (npm run proefversie,
  // gereedschap/proefversie/maak.cjs) de datum en de commit, zodat we weten waarop een tester speelde. Het titelscherm
  // zet hem klein onderaan (js/menu.js).
  T.STAND = null;

  // Dit bestand staat in de kop van elke bladzijde, dus de titel is er al, de rest van de bladzijde nog niet.
  if (typeof document !== 'undefined') {
    document.title = document.title.replace('{naam}', T.NAAM);
    document.addEventListener('DOMContentLoaded', () => {
      for (const el of document.querySelectorAll('[data-spelnaam]')) el.textContent = T.NAAM;
    });
  }
})(globalThis.Spel = globalThis.Spel || {});
