// Padzoeken over het tegelraster. Acht richtingen, en elke stap kost één actiepunt,
// ook schuin. Een schuine stap mag niet om een muurhoek heen.
(function (T) {
  'use strict';

  const RICHTINGEN = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  const sleutel = (x, y) => x + ',' + y;

  // A* van start naar doel. magBetreden(x, y): mag er een stap naar deze tegel?
  // isVast(x, y): houdt deze tegel een schuine stap om de hoek tegen?
  // opties.naast: eindig op een tegel die het doel raakt (om te slaan of iets te gebruiken).
  // opties.tot: eindig op een tegel die hoogstens zoveel tegels van het doel af ligt: om ergens rond
  // te lopen (een plek met een straal, T.laatDwalen in js/verkennen.js). Het doel zelf mag dan bezet
  // zijn; zonder dit bleef wie naar het erf liep staan zolang er iemand voor de deur stond.
  // Geeft de stappen terug zonder de starttegel, of null als er geen weg is.
  T.zoekPad = function (start, doel, magBetreden, isVast, opties) {
    const naast = !!(opties && opties.naast);
    const tot = opties && opties.tot >= 1 ? Math.floor(opties.tot) : 0;
    const schatting = (x, y) => {
      const d = Math.max(Math.abs(x - doel.x), Math.abs(y - doel.y));
      return naast ? Math.max(0, d - 1) : Math.max(0, d - tot);
    };
    const isKlaar = (x, y) => {
      if (tot) return Math.max(Math.abs(x - doel.x), Math.abs(y - doel.y)) <= tot;
      if (!naast) return x === doel.x && y === doel.y;
      const dx = doel.x - x;
      const dy = doel.y - y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) !== 1) return false;
      return dx === 0 || dy === 0 || (!isVast(x + dx, y) && !isVast(x, y + dy));
    };
    if (isKlaar(start.x, start.y)) return [];

    const startSleutel = sleutel(start.x, start.y);
    const open = [{ x: start.x, y: start.y, g: 0, f: schatting(start.x, start.y) }];
    const kosten = new Map([[startSleutel, 0]]);
    const herkomst = new Map();
    const gesloten = new Set();

    while (open.length) {
      // Het raster is klein: zoeken in een gewone lijst is snel genoeg.
      let beste = 0;
      for (let i = 1; i < open.length; i++) {
        if (open[i].f < open[beste].f || (open[i].f === open[beste].f && open[i].g > open[beste].g)) beste = i;
      }
      const huidig = open.splice(beste, 1)[0];
      const hs = sleutel(huidig.x, huidig.y);
      if (gesloten.has(hs)) continue;
      gesloten.add(hs);

      if (isKlaar(huidig.x, huidig.y)) {
        const pad = [];
        for (let s = hs; s !== startSleutel; s = herkomst.get(s)) {
          const [x, y] = s.split(',').map(Number);
          pad.unshift({ x, y });
        }
        return pad;
      }

      for (const [dx, dy] of RICHTINGEN) {
        const nx = huidig.x + dx;
        const ny = huidig.y + dy;
        const ns = sleutel(nx, ny);
        if (gesloten.has(ns) || !magBetreden(nx, ny)) continue;
        const schuin = dx !== 0 && dy !== 0;
        if (schuin && (isVast(huidig.x + dx, huidig.y) || isVast(huidig.x, huidig.y + dy))) continue;
        // Schuin kost een haar meer, zodat van twee even korte paden het rechtste wint.
        // Het verschil is te klein om ooit een langer pad te laten winnen.
        const g = huidig.g + (schuin ? 1.001 : 1);
        if (g >= (kosten.has(ns) ? kosten.get(ns) : Infinity)) continue;
        kosten.set(ns, g);
        herkomst.set(ns, hs);
        open.push({ x: nx, y: ny, g, f: g + schatting(nx, ny) });
      }
    }
    return null;
  };

  // Alle tegels die binnen `max` stappen te halen zijn, met het aantal stappen erbij.
  // Voor het gekleurde bereik tijdens de eigen beurt.
  T.bereik = function (start, max, magBetreden, isVast) {
    const resultaat = new Map();
    const gezien = new Set([sleutel(start.x, start.y)]);
    let rand = [start];
    for (let stap = 1; stap <= max && rand.length; stap++) {
      const volgende = [];
      for (const t of rand) {
        for (const [dx, dy] of RICHTINGEN) {
          const nx = t.x + dx;
          const ny = t.y + dy;
          const ns = sleutel(nx, ny);
          if (gezien.has(ns) || !magBetreden(nx, ny)) continue;
          if (dx !== 0 && dy !== 0 && (isVast(t.x + dx, t.y) || isVast(t.x, t.y + dy))) continue;
          gezien.add(ns);
          resultaat.set(ns, stap);
          volgende.push({ x: nx, y: ny });
        }
      }
      rand = volgende;
    }
    return resultaat;
  };
})(globalThis.Spel = globalThis.Spel || {});
