// Padzoeken over het tegelraster. Acht richtingen, en elke stap kost één actiepunt,
// ook schuin. Een schuine stap mag niet om een muurhoek heen.
(function (T) {
  'use strict';

  const RICHTINGEN = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  const sleutel = (x, y) => x + ',' + y;

  // De open lijst van A* als binaire hoop (werklijst vraag 87, 2 okt; `opmerkingen.md`, "Een dorp van meer dan zo'n
  // 150 mensen hapert"): eerst het laagste f, bij gelijk het hoogste g, en bij gelijk wie er het eerst in kwam. Dat is
  // precies de volgorde van de gewone lijst die hier tot 2 okt stond, dus de paden zijn dezelfde, letter voor letter.
  // Die lijst werd elke stap helemaal doorzocht, en een zoektocht die niet slaagde (iemand staat in de enige deur),
  // kostte zo de hele kaart in het kwadraat: met de wensen, waar huizen doorgroeien en dichter op elkaar staan, werd een
  // speeljaar van de bouwer zes keer zo traag.
  const eerder = (a, b) => a.f < b.f || (a.f === b.f && (a.g > b.g || (a.g === b.g && a.n < b.n)));
  function erbij(hoop, e) {
    hoop.push(e);
    let i = hoop.length - 1;
    while (i > 0) {
      const ouder = (i - 1) >> 1;
      if (!eerder(hoop[i], hoop[ouder])) break;
      [hoop[i], hoop[ouder]] = [hoop[ouder], hoop[i]];
      i = ouder;
    }
  }
  function eraf(hoop) {
    const top = hoop[0];
    const laatste = hoop.pop();
    if (hoop.length) {
      hoop[0] = laatste;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1;
        const r = l + 1;
        let k = i;
        if (l < hoop.length && eerder(hoop[l], hoop[k])) k = l;
        if (r < hoop.length && eerder(hoop[r], hoop[k])) k = r;
        if (k === i) break;
        [hoop[i], hoop[k]] = [hoop[k], hoop[i]];
        i = k;
      }
    }
    return top;
  }
  // Een tegel als getal, voor de boekhouding van A* (sneller dan "x,y"): ruim genoeg voor elke kaart, ook voor een tegel
  // net buiten de rand, die magBetreden afwijst.
  const RAND = 4096;
  const nummer = (x, y) => (x + 1024) * RAND + (y + 1024);

  // A* van start naar doel. magBetreden(x, y): mag er een stap naar deze tegel?
  // isVast(x, y): houdt deze tegel een schuine stap om de hoek tegen?
  // opties.naast: eindig op een tegel die het doel raakt (om te slaan of iets te gebruiken).
  // opties.tot: eindig op een tegel die hoogstens zoveel tegels van het doel af ligt: om ergens rond
  // te lopen (een plek met een straal, T.laatDwalen in js/verkennen.js). Het doel zelf mag dan bezet
  // zijn; zonder dit bleef wie naar het erf liep staan zolang er iemand voor de deur stond.
  // Geeft de stappen terug zonder de starttegel, of null als er geen weg is.
  // Tijdens het zoeken staat iedereen stil (T.iedereenStil, js/wereld.js): zo vraagt magBetreden wie er op een tegel
  // staat in één stap, in plaats van alle wezens af te lopen.
  T.zoekPad = function (start, doel, magBetreden, isVast, opties) {
    T.iedereenStil(true);
    try {
      return zoek(start, doel, magBetreden, isVast, opties);
    } finally {
      T.iedereenStil(false);
    }
  };
  function zoek(start, doel, magBetreden, isVast, opties) {
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

    const startSleutel = nummer(start.x, start.y);
    let n = 0;
    const open = [{ x: start.x, y: start.y, g: 0, f: schatting(start.x, start.y), n: n++ }];
    const kosten = new Map([[startSleutel, 0]]);
    const herkomst = new Map();
    const gesloten = new Set();

    while (open.length) {
      const huidig = eraf(open);
      const hs = nummer(huidig.x, huidig.y);
      if (gesloten.has(hs)) continue;
      gesloten.add(hs);

      if (isKlaar(huidig.x, huidig.y)) {
        const pad = [];
        for (let s = hs; s !== startSleutel; s = herkomst.get(s)) {
          pad.unshift({ x: Math.floor(s / RAND) - 1024, y: (s % RAND) - 1024 });
        }
        return pad;
      }

      for (const [dx, dy] of RICHTINGEN) {
        const nx = huidig.x + dx;
        const ny = huidig.y + dy;
        const ns = nummer(nx, ny);
        if (gesloten.has(ns) || !magBetreden(nx, ny)) continue;
        const schuin = dx !== 0 && dy !== 0;
        if (schuin && (isVast(huidig.x + dx, huidig.y) || isVast(huidig.x, huidig.y + dy))) continue;
        // Schuin kost een haar meer, zodat van twee even korte paden het rechtste wint.
        // Het verschil is te klein om ooit een langer pad te laten winnen.
        const g = huidig.g + (schuin ? 1.001 : 1);
        if (g >= (kosten.has(ns) ? kosten.get(ns) : Infinity)) continue;
        kosten.set(ns, g);
        herkomst.set(ns, hs);
        erbij(open, { x: nx, y: ny, g, f: g + schatting(nx, ny), n: n++ });
      }
    }
    return null;
  }

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
