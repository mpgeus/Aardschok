// Eén blok uit een spelbestand halen, met alles eromheen ongemoeid.
//
// De twee bewerkers (gesprekken-tool.js, quests-tool.js) lezen een bestand als js/gesprekken.js,
// bewerken wat erin staat, en schrijven het daarna helemaal opnieuw. Dat gaat goed zolang ze
// álles kennen wat erin staat — en dat ging mis: js/gesprekken.js kreeg er T.TUTORIAL_TEKST bij,
// de gespreksbewerker weet daar niets van, en dus wiste één keer opslaan het hele draaiboek van
// de tutorial. Zonder waarschuwing, want de bewerker waarschuwde alleen over commentaar.
//
// Daarom knippen we een bestand voortaan in drieën: wat vóór het blok staat, het blok zelf, en
// wat erna komt. De bewerker regenereert alleen het middenstuk; kop en staart gaan letterlijk
// mee terug. Wat de bewerker niet kent, kan hij dan ook niet kwijtraken.
//
// T.bronBlok(tekst, 'T.GESPREKKEN') geeft { kop, blok, staart } terug, en kop + blok + staart is
// weer precies het bestand. Geen blok met die naam gevonden? Dan null, en de aanroeper slaat niet
// op — beter niets schrijven dan het verkeerde.
//
// Zonder scherm, dus te toetsen: test/bronblok.test.cjs.
(function (T) {
  'use strict';

  // Een regel zonder wat er tussen aanhalingstekens staat en zonder het commentaar erachter, want
  // een accolade in een zin ("Wat een {rare} dag") telt niet mee voor de diepte. Sjabloontekst
  // (`...${x}...`) komt in deze bestanden niet voor, maar de backtick doet mee zodat hij niet
  // stilletjes verkeerd gaat als hij er ooit wel staat.
  function zonderTekst(regel) {
    let uit = '';
    let aanhaling = null;
    for (let i = 0; i < regel.length; i++) {
      const teken = regel[i];
      if (aanhaling) {
        if (teken === '\\') i++; // wat na een backslash komt, sluit nooit af
        else if (teken === aanhaling) aanhaling = null;
        continue;
      }
      if (teken === "'" || teken === '"' || teken === '`') {
        aanhaling = teken;
        continue;
      }
      if (teken === '/' && regel[i + 1] === '/') break; // de rest is commentaar
      uit += teken;
    }
    return uit;
  }

  T.bronBlok = function (tekst, naam) {
    const regels = String(tekst).replace(/\r\n/g, '\n').split('\n');
    const begin = regels.findIndex((r) => r.trimStart().startsWith(naam + ' = {'));
    if (begin < 0) return null;
    let diepte = 0;
    for (let i = begin; i < regels.length; i++) {
      for (const teken of zonderTekst(regels[i])) {
        if (teken === '{' || teken === '[') diepte++;
        else if (teken === '}' || teken === ']') diepte--;
      }
      if (diepte > 0) continue;
      if (diepte < 0) return null; // meer dicht dan open: dit bestand lezen we liever niet
      const kop = regels.slice(0, begin);
      const staart = regels.slice(i + 1);
      return {
        kop: kop.length ? kop.join('\n') + '\n' : '',
        blok: regels.slice(begin, i + 1).join('\n'),
        staart: staart.length ? '\n' + staart.join('\n') : '',
        vanaf: begin,
        tot: i,
      };
    }
    return null; // niet afgesloten
  };
})(globalThis.Toren = globalThis.Toren || {});
