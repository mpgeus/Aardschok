// Padzoeken over het tegelraster. Acht richtingen, en elke stap kost één actiepunt,
// ook schuin. Een schuine stap mag niet om een muurhoek heen.
(function (T) {
  'use strict';

  const RICHTINGEN = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
  const DX = RICHTINGEN.map((r) => r[0]); // dezelfde, als twee rijtjes: A* loopt ze voor elke tegel af
  const DY = RICHTINGEN.map((r) => r[1]);
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

  // De boekhouding van A*: per tegel (als nummer) wat hij tot nu toe kost, waar hij vandaan kwam, en of hij klaar is. Eén
  // tabel van getallen voor alle zoektochten, die bij elke zoektocht leeg is doordat hij een nieuwe generatie begint. Tot
  // 4 okt waren het een Map, een Map en een Set per zoektocht, en dat was de helft van het zoeken (vraag 113; op een land
  // van de maker van 100 bij 100 zijn de wegen langer). Open adressering: botst een plek, dan de volgende.
  const tabel = { bits: 0, sleutel: null, generatie: null, kosten: null, van: null, dicht: null, nu: 0, aantal: 0 };
  function maakTabel(bits) {
    const n = 1 << bits;
    const oud = tabel.bits ? { ...tabel } : null;
    Object.assign(tabel, { bits, sleutel: new Int32Array(n), generatie: new Uint32Array(n), kosten: new Float64Array(n), van: new Int32Array(n), dicht: new Uint8Array(n), aantal: 0 });
    if (!oud) return;
    // wat er in deze zoektocht al stond, gaat mee
    for (let i = 0; i < oud.sleutel.length; i++) {
      if (oud.generatie[i] !== oud.nu) continue;
      const j = plek(oud.sleutel[i], true);
      tabel.kosten[j] = oud.kosten[i];
      tabel.van[j] = oud.van[i];
      tabel.dicht[j] = oud.dicht[i];
    }
  }
  // De plek van tegel k in de tabel, of -1 als hij er (in deze zoektocht) niet in staat; met `maak` komt hij erin.
  function plek(k, maak) {
    const masker = (1 << tabel.bits) - 1;
    let i = Math.imul(k, 0x9e3779b1) >>> (32 - tabel.bits);
    for (;;) {
      if (tabel.generatie[i] !== tabel.nu) {
        if (!maak) return -1;
        if ((tabel.aantal + 1) * 2 > masker) {
          maakTabel(tabel.bits + 1);
          return plek(k, true);
        }
        tabel.generatie[i] = tabel.nu;
        tabel.sleutel[i] = k;
        tabel.kosten[i] = Infinity;
        tabel.van[i] = 0;
        tabel.dicht[i] = 0;
        tabel.aantal++;
        return i;
      }
      if (tabel.sleutel[i] === k) return i;
      i = (i + 1) & masker;
    }
  }
  function nieuweZoektocht() {
    if (!tabel.bits) maakTabel(14);
    tabel.nu = (tabel.nu + 1) >>> 0;
    if (tabel.nu === 0) {
      tabel.generatie.fill(0);
      tabel.nu = 1;
    }
    tabel.aantal = 0;
  }

  // A* van start naar doel. magBetreden(x, y): mag er een stap naar deze tegel?
  // isVast(x, y): houdt deze tegel een schuine stap om de hoek tegen?
  // opties.naast: eindig op een tegel die het doel raakt (om te slaan of iets te gebruiken).
  // opties.tot: eindig op een tegel die hoogstens zoveel tegels van het doel af ligt: om ergens rond
  // te lopen (een plek met een straal, T.laatDwalen in js/verkennen.js). Het doel zelf mag dan bezet
  // zijn; zonder dit bleef wie naar het erf liep staan zolang er iemand voor de deur stond.
  // opties.max: bekijk hooguit zoveel tegels, en geef het dan op (een korte omweg om iemand heen, js/lopen.js).
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
    const max = opties && opties.max > 0 ? opties.max : Infinity;
    let bekeken = 0;
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

    nieuweZoektocht();
    const startSleutel = nummer(start.x, start.y);
    let n = 0;
    const open = [{ x: start.x, y: start.y, g: 0, f: schatting(start.x, start.y), n: n++ }];
    tabel.kosten[plek(startSleutel, true)] = 0;

    while (open.length) {
      const huidig = eraf(open);
      const hs = nummer(huidig.x, huidig.y);
      const hp = plek(hs, true);
      if (tabel.dicht[hp]) continue;
      tabel.dicht[hp] = 1;
      if (++bekeken > max) return null;

      if (isKlaar(huidig.x, huidig.y)) {
        const pad = [];
        for (let s = hs; s !== startSleutel; s = tabel.van[plek(s, false)]) {
          pad.unshift({ x: Math.floor(s / RAND) - 1024, y: (s % RAND) - 1024 });
        }
        return pad;
      }

      for (let r = 0; r < 8; r++) {
        const dx = DX[r];
        const dy = DY[r];
        const nx = huidig.x + dx;
        const ny = huidig.y + dy;
        const ns = nummer(nx, ny);
        const np = plek(ns, false);
        if ((np >= 0 && tabel.dicht[np]) || !magBetreden(nx, ny)) continue;
        const schuin = dx !== 0 && dy !== 0;
        if (schuin && (isVast(huidig.x + dx, huidig.y) || isVast(huidig.x, huidig.y + dy))) continue;
        // Schuin kost een haar meer, zodat van twee even korte paden het rechtste wint.
        // Het verschil is te klein om ooit een langer pad te laten winnen.
        const g = huidig.g + (schuin ? 1.001 : 1);
        if (np >= 0 && g >= tabel.kosten[np]) continue;
        const q = np >= 0 ? np : plek(ns, true);
        tabel.kosten[q] = g;
        tabel.van[q] = hs;
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
