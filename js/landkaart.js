// De kaart van het land op het scherm (js/land.js; werklijst vraag 63 en 69): een venster met de provincies, de wegen
// met hoeveel dagen reizen, en wat je nog niet zag in het donker. Klik een provincie en je ziet hoe ver het is; met de
// knop reis je erheen. Onderweg schuift de schout over de weg, en gaan de dagen snel voorbij. Thuis zegt een tweede
// venster wat er gebeurde terwijl je weg was, en daarna komen de brieven die intussen kwamen (js/brieven.js). Het
// tekenen is een SVG, zoals de schets "Het land met provincies" die Marcel zag. Alleen scherm: de regels staan in
// js/land.js.
(function (T) {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const NS = 'http://www.w3.org/2000/svg';
  const veilig = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const dagen = (n) => (n === 1 ? '1 dag' : `${n} dagen`);
  const naam = (S, p) => T.provincieNaam(S, p);

  let gekozen = null; // de provincie die je aanklikte (alleen scherm)
  let getekend = ''; // wat er nu getekend staat: alleen als dat verandert, tekent hij opnieuw

  function maak(soort, attr, ouder) {
    const el = document.createElementNS(NS, soort);
    for (const k in attr) {
      const v = String(attr[k]);
      // Een kleur uit stijl.css via style: een var() in een attribuut kent niet elke browser.
      if (v.includes('var(')) el.style.setProperty(k, v);
      else el.setAttribute(k, v);
    }
    if (ouder) ouder.appendChild(el);
    return el;
  }
  const pad = (v) => 'M' + v.map((q) => q[0] + ' ' + q[1]).join('L') + 'Z';

  // Een weg is een lichte boog van plek naar plek; de schout volgt dezelfde boog.
  function boog(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const l = Math.hypot(dx, dy) || 1;
    return { cx: (a.x + b.x) / 2 - (dy / l) * 16, cy: (a.y + b.y) / 2 + (dx / l) * 16 };
  }
  function opBoog(a, b, t) {
    const { cx, cy } = boog(a, b);
    const u = 1 - t;
    return { x: u * u * a.x + 2 * u * t * cx + t * t * b.x, y: u * u * a.y + 2 * u * t * cy + t * t * b.y };
  }

  // Een teken per soort land, klein, bij de naam.
  const lijn = { stroke: 'var(--land-grens)', 'stroke-width': 1.6, 'stroke-linejoin': 'round' };
  function huisje(g, x, y, s, dak) {
    maak('rect', Object.assign({ x: x - 7 * s, y: y - 6 * s, width: 14 * s, height: 10 * s, fill: 'var(--land-muur)' }, lijn), g);
    maak('path', Object.assign({ d: `M${x - 9 * s} ${y - 5 * s}L${x} ${y - 13 * s}L${x + 9 * s} ${y - 5 * s}Z`, fill: dak }, lijn), g);
  }
  function boompjes(g, x, y, kleur) {
    for (const [dx, dy] of [[-13, 4], [0, -4], [12, 5]]) {
      maak('path', Object.assign({ d: `M${x + dx} ${y + dy - 15}L${x + dx - 8} ${y + dy + 3}L${x + dx + 8} ${y + dy + 3}Z`, fill: kleur }, lijn), g);
    }
  }
  function golfjes(g, x, y) {
    for (const [dx, dy] of [[-10, -3], [4, 3]]) {
      maak('path', { d: `M${x + dx - 9} ${y + dy}q4.5 -5 9 0t9 0`, fill: 'none', stroke: 'var(--land-grens)', 'stroke-width': 1.8, 'stroke-linecap': 'round' }, g);
    }
  }
  const TEKEN = {
    gehucht: (g, x, y) => {
      huisje(g, x - 14, y + 2, 1, 'var(--land-stad)');
      huisje(g, x + 6, y - 4, 1.2, 'var(--land-dak)');
      huisje(g, x + 18, y + 6, 0.9, 'var(--land-stad)');
    },
    kasteel: (g, x, y) => {
      maak('path', Object.assign({ d: `M${x - 16} ${y + 6}V${y - 10}h5v4h4v-4h5v4h4v-4h5v4h4v-4h5V${y + 6}Z`, fill: 'var(--land-steen)' }, lijn), g);
      maak('path', Object.assign({ d: `M${x - 4} ${y + 6}v-7a4 4 0 0 1 8 0v7Z`, fill: 'var(--land-grens)' }, lijn), g);
    },
    stad: (g, x, y) => {
      maak('path', Object.assign({ d: `M${x - 24} ${y + 8}V${y - 2}h48V${y + 8}Z`, fill: 'var(--land-steen)' }, lijn), g);
      huisje(g, x - 11, y - 4, 0.9, 'var(--land-stad)');
      huisje(g, x + 4, y - 8, 1.1, 'var(--land-dak)');
      huisje(g, x + 16, y - 3, 0.8, 'var(--land-stad)');
    },
    woud: (g, x, y) => boompjes(g, x, y, 'var(--land-woud)'),
    broek: (g, x, y) => {
      boompjes(g, x, y - 4, 'var(--land-broek)');
      golfjes(g, x, y + 10);
    },
    heide: (g, x, y) => {
      for (const [dx, dy] of [[-16, 2], [-3, -6], [11, 3], [22, -4]]) {
        const bx = x + dx;
        const by = y + dy;
        maak('path', { d: `M${bx} ${by}L${bx - 5} ${by - 8}M${bx} ${by}L${bx} ${by - 10}M${bx} ${by}L${bx + 5} ${by - 8}`, fill: 'none', stroke: 'var(--land-grens)', 'stroke-width': 1.8, 'stroke-linecap': 'round' }, g);
        // Een bloempje op elke spriet: heide, en geen pijlen.
        for (const [tx, ty] of [[bx - 5, by - 8], [bx, by - 10], [bx + 5, by - 8]]) maak('circle', { cx: tx, cy: ty, r: 2.1, fill: 'var(--land-bloei)' }, g);
      }
    },
    veen: (g, x, y) => golfjes(g, x, y),
    zand: (g, x, y) => {
      for (const [dx, dy] of [[-14, 0], [-5, -5], [4, 2], [13, -3], [20, 4], [-9, 6]]) maak('circle', { cx: x + dx, cy: y + dy, r: 1.8, fill: 'var(--land-grens)' }, g);
    },
    kampen: (g, x, y) => {
      for (const [dx, dy] of [[-16, -6], [2, -8], [-8, 3], [10, 1]]) maak('rect', Object.assign({ x: x + dx, y: y + dy, width: 13, height: 7, fill: 'var(--land-kampen)' }, lijn), g);
    },
  };

  // De kaart zelf, opnieuw als er iets veranderde: wat je zag, waar je bent, of wat je aanklikte.
  function tekenKaart(S, svg) {
    const L = S.land;
    svg.setAttribute('viewBox', `0 0 ${L.breed} ${L.hoog}`);
    svg.innerHTML = '';
    const defs = maak('defs', {}, svg);
    const golf = maak('filter', { id: 'land-golf', x: '-5%', y: '-5%', width: '110%', height: '110%' }, defs);
    maak('feTurbulence', { type: 'fractalNoise', baseFrequency: 0.018, numOctaves: 2, seed: 7, result: 'ruis' }, golf);
    maak('feDisplacementMap', { in: 'SourceGraphic', in2: 'ruis', scale: 14, xChannelSelector: 'R', yChannelSelector: 'G' }, golf);
    const arcering = maak('pattern', { id: 'land-arcering', width: 9, height: 9, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(35)' }, defs);
    maak('rect', { width: 9, height: 9, fill: 'var(--land-mist)' }, arcering);
    maak('line', { x1: 0, y1: 0, x2: 0, y2: 9, stroke: 'var(--land-mistlijn)', 'stroke-width': 3 }, arcering);

    const vlakken = maak('g', { filter: 'url(#land-golf)' }, svg);
    for (const p of L.provincies) {
      const gezien = L.gezien.has(p.id);
      maak('path', {
        d: pad(p.vlak), fill: gezien ? `var(--land-${p.soort})` : 'url(#land-arcering)',
        stroke: 'var(--land-grens)', 'stroke-width': 2.2, 'stroke-linejoin': 'round',
      }, vlakken);
    }
    maak('path', { d: pad(L.vorm), fill: 'none', stroke: 'var(--land-grens)', 'stroke-width': 3.5 }, vlakken);

    // De wegen die je kent: uit een provincie die je zag. Een weg het donker in is gestippeld.
    const wegen = maak('g', {}, svg);
    for (const w of L.wegen) {
      const a = T.provincie(L, w.van);
      const b = T.provincie(L, w.naar);
      if (!L.gezien.has(a.id) && !L.gezien.has(b.id)) continue;
      const donker = !L.gezien.has(a.id) || !L.gezien.has(b.id);
      const { cx, cy } = boog(a, b);
      maak('path', {
        d: `M${a.x} ${a.y}Q${cx} ${cy} ${b.x} ${b.y}`, fill: 'none', stroke: 'var(--land-weg)',
        'stroke-width': donker ? 2.2 : 3.2, 'stroke-linecap': 'round', 'stroke-dasharray': donker ? '3 7' : 'none', opacity: donker ? 0.8 : 1,
      }, wegen);
      const m = opBoog(a, b, 0.5);
      maak('text', { x: m.x, y: m.y + 4, 'text-anchor': 'middle', class: 'land-dagen' }, wegen).textContent = dagen(w.dagen);
    }

    // De namen en tekens, en een vraagteken waar het nog donker is.
    const tekens = maak('g', {}, svg);
    for (const p of L.provincies) {
      if (!L.gezien.has(p.id)) {
        maak('text', { x: p.x, y: p.y + 12, 'text-anchor': 'middle', class: 'land-vraag' }, tekens).textContent = '?';
        continue;
      }
      TEKEN[p.soort](tekens, p.x, p.y - 8);
      // Een lange naam ("Het kasteel van de heer") op twee regels, zodat hij niet over een weg valt.
      const t = maak('text', { x: p.x, y: p.y + 26, 'text-anchor': 'middle', class: 'land-naam' }, tekens);
      const woorden = naam(S, p);
      const regels = woorden.length > 16 && woorden.includes(' van ') ? [woorden.slice(0, woorden.indexOf(' van ')), woorden.slice(woorden.indexOf(' van ') + 1)] : [woorden];
      regels.forEach((r, i) => {
        maak('tspan', { x: p.x, dy: i ? '1.05em' : 0 }, t).textContent = r;
      });
    }

    // Wat je aanklikte, met een gouden rand; en daarboven de vlakken om op te klikken (onzichtbaar, zonder golf, zodat
    // je klikt waar je kijkt).
    if (gekozen && T.provincie(L, gekozen)) {
      maak('path', { d: pad(T.provincie(L, gekozen).vlak), fill: 'none', stroke: 'var(--goud)', 'stroke-width': 3, 'stroke-linejoin': 'round', filter: 'url(#land-golf)' }, svg);
    }
    const klik = maak('g', {}, svg);
    for (const p of L.provincies) maak('path', { d: pad(p.vlak), fill: 'transparent', 'data-provincie': p.id, class: 'land-klik' }, klik);
    maak('circle', { id: 'land-schout', r: 7, fill: 'var(--goud)', stroke: 'var(--land-grens)', 'stroke-width': 2, 'pointer-events': 'none' }, svg);
  }

  // Waar de schout op de kaart staat: bij zijn provincie, of onderweg op de weg ernaartoe.
  function schoutOpKaart(S) {
    const L = S.land;
    const hier = T.provincie(L, L.waar);
    const R = L.reis;
    if (!R) return { x: hier.x + 30, y: hier.y - 22 };
    const naar = T.provincie(L, R.route[R.stap]);
    const lang = T.wegTussen(L, hier.id, naar.id).dagen;
    const t = Math.max(0, Math.min(1, 1 - (R.volgende - S.kalender.dag) / lang));
    return opBoog(hier, naar, t);
  }

  function staatTekst(S) {
    const L = S.land;
    const hier = T.provincie(L, L.waar);
    if (L.reis) {
      const doel = T.provincie(L, L.reis.route[L.reis.route.length - 1]);
      const nog = Math.max(0, L.reis.aankomst - S.kalender.dag);
      return `Onderweg naar <b>${veilig(naam(S, doel))}</b>: nog ${veilig(nog < 1 ? 'minder dan een dag' : dagen(Math.ceil(nog - 1e-9)))}. Thuis gaat alles door zonder je.`;
    }
    if (L.waar === L.thuis) return `Je staat op de weg uit <b>${veilig(naam(S, hier))}</b>. Kies een provincie om erheen te reizen, of ga terug het gehucht in.`;
    return `Je bent in <b>${veilig(naam(S, hier))}</b>. ${veilig(T.LANDSOORTEN[hier.soort].uitleg)} Kies waar je heen gaat.`;
  }

  // Wat je aanklikte: hoe ver, en de knop om te gaan.
  function keuzeTekst(S) {
    const L = S.land;
    if (L.reis) return '';
    const p = gekozen && T.provincie(L, gekozen);
    if (!p) return '<span class="land-zacht">Klik een provincie om te zien hoe ver het is.</span>';
    const wie = L.gezien.has(p.id) ? veilig(naam(S, p)) : 'Dit land ken je nog niet';
    // De naam en de tekst in één stuk, de knop ernaast: de regel is een flex-rij.
    if (p.id === L.waar) return `<span><b>${wie}</b>: hier ben je.</span>`;
    const r = T.reisNaar(S, p.id);
    if (!r) return `<span><b>${wie}</b>: daar weet je de weg nog niet.</span>`;
    const over = r.route.length > 1 ? `, over ${r.route.slice(0, -1).map((id) => veilig(naam(S, T.provincie(L, id)))).join(' en ')}` : '';
    const thuis = p.id === L.thuis ? 'Naar huis' : 'Reis erheen';
    return `<span><b>${wie}</b>: ${dagen(r.dagen)} reizen${over}.</span> <button class="land-knop" data-actie="reis" data-naar="${p.id}">${thuis}</button>`;
  }

  function venster(S) {
    const L = S.land;
    const dag = S.kalender ? T.datumVanDag(S.kalender.dag).tekst : '';
    const sluit = !L.reis && L.waar === L.thuis;
    return (
      `<div class="venster-kop"><span class="venster-titel">Het land</span><span class="venster-wanneer" id="land-datum">${dag}</span>` +
      (sluit ? '<button class="venster-sluit" data-actie="terug" title="Terug het gehucht in (Esc)">✕</button>' : '') +
      '</div>' +
      `<p class="venster-staat" id="land-staat">${staatTekst(S)}</p>` +
      '<svg id="land-kaart" role="img" aria-label="De kaart van het land"></svg>' +
      `<p class="land-keuze" id="land-keuze">${keuzeTekst(S)}</p>` +
      (sluit ? '<p class="venster-voet"><button class="land-knop" data-actie="terug">Terug het gehucht in</button> <kbd>Esc</kbd></p>' : '')
    );
  }

  // Elk beeld (js/main.js): het venster open zolang de schout naar het land kijkt of reist, de schout op de weg, en
  // thuis het venster met wat er gebeurde.
  T.ui.werkLandkaartBij = function (S) {
    const box = $('land');
    const L = S.land;
    const open = !!L && S.modus === 'land';
    if (!open) {
      if (!box.classList.contains('verborgen')) {
        box.classList.add('verborgen');
        gekozen = null;
        getekend = '';
      }
      if (L && L.terug && $('terug').classList.contains('verborgen')) toonTerug(S);
      return;
    }
    const sleutel = [L.waar, L.reis ? L.reis.stap : '-', [...L.gezien].join(','), gekozen, T.dorpsnaam(S), L.reis ? 'r' : 's'].join('|');
    if (box.classList.contains('verborgen') || sleutel !== getekend) {
      box.innerHTML = venster(S);
      tekenKaart(S, $('land-kaart'));
      box.classList.remove('verborgen');
      getekend = sleutel;
    }
    const p = schoutOpKaart(S);
    const stip = $('land-schout');
    stip.setAttribute('cx', p.x);
    stip.setAttribute('cy', p.y);
    if (L.reis) {
      $('land-staat').innerHTML = staatTekst(S);
      $('land-datum').textContent = T.datumVanDag(S.kalender.dag).tekst;
    }
  };

  // Esc (js/main.js) of de knop: terug het gehucht in, als je nog thuis bent.
  T.ui.sluitLand = function (S) {
    if (T.sluitLand(S)) T.ui.werkLandkaartBij(S);
  };

  $('land').addEventListener('click', (ev) => {
    const S = T.S;
    if (!S || !S.land) return;
    const b = ev.target.closest('button');
    if (b) {
      b.blur();
      if (b.dataset.actie === 'terug') return T.ui.sluitLand(S);
      if (b.dataset.actie === 'reis') {
        const r = T.beginReis(S, b.dataset.naar);
        if (!r.kan) T.ui.bericht(r.reden, 'gevaar');
        gekozen = null;
        return T.ui.werkLandkaartBij(S);
      }
      return;
    }
    const vlak = ev.target.closest('[data-provincie]');
    if (vlak && !S.land.reis) {
      gekozen = vlak.getAttribute('data-provincie');
      T.ui.werkLandkaartBij(S);
    }
  });

  // Thuis: wat er gebeurde terwijl je weg was, en hoe het dorp ervoor staat. De tijd staat stil tot je verder gaat.
  function toonTerug(S) {
    const L = S.land;
    const t = L.terug;
    const box = $('terug');
    const regels = t.gemist.length
      ? '<ul class="terug-lijst">' + t.gemist.map((g) => `<li class="${veilig(g.soort)}"><span>${veilig(T.datumVanDag(g.dag).tekst)}</span> ${veilig(g.tekst)}</li>`).join('') + '</ul>'
      : '<p class="venster-staat">Er gebeurde niets bijzonders.</p>';
    box.innerHTML =
      `<div class="venster-kop"><span class="venster-titel">Terug in ${veilig(T.provincieNaam(S, T.provincie(L, L.thuis)))}</span>` +
      `<span class="venster-wanneer">${T.datumVanDag(S.kalender.dag).tekst}</span></div>` +
      `<p class="venster-staat">Je was ${dagen(t.dagen)} weg. ${veilig(T.watVeranderde(t).join(' · '))}.</p>` +
      regels +
      '<p class="venster-voet"><button class="land-knop" data-actie="verder">Verder</button> <kbd>Esc</kbd></p>';
    T.houdTijdStil(S, 'terug');
    box.classList.remove('verborgen');
  }

  T.ui.terugOpen = () => !$('terug').classList.contains('verborgen');

  T.ui.sluitTerug = function (S) {
    $('terug').classList.add('verborgen');
    if (S.land) S.land.terug = null;
    T.laatTijdGaan(S, 'terug');
    T.ui.toonBriefVanLater(S); // de brieven die kwamen terwijl je weg was (js/brieven.js)
  };

  $('terug').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (b && b.dataset.actie === 'verder' && T.S) T.ui.sluitTerug(T.S);
  });
})(globalThis.Spel = globalThis.Spel || {});
