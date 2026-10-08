// De plaat van het eiland (werklijst vraag 117, stap 1; Marcel, 8 okt: "ja begin met de plaat"): het eiland van een
// nummer van boven, uit de kaartenmaker (js/eiland.js), met de zee, de kust, het licht van de zon, de rivieren en meren,
// de streken in hun kleur, de wegen en de plekken (het kasteel van de heer, de stad en de dorpen), en ernaast je land
// van 100 bij 100 met de rand die je mensen kennen, tegel voor tegel. Niets hiervan zit al in het spel (dat is stap 2).
//
//   node gereedschap/pixelart/eiland-plaat.cjs [nummer ...] [--groot]   → gereedschap/pixelart/uit/eiland/
//
// Zonder nummers: de landen 5, 62707 en 73425 (die van de speeltest). Met --groot ook het hele eiland op ware grootte,
// een pixel per tegel (2500 bij 2500). Het eiland van boven: x naar rechts en y naar onder, zoals de grote plaat van de
// hoogte (landschap-plaat.cjs); de camera van het spel kijkt dan vanaf rechtsonder.
'use strict';
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const K = require('./kern.cjs');
const T = require('../../test/laad.cjs').spel();

const args = process.argv.slice(2);
const GROOT = args.includes('--groot');
const ZADEN = args.filter((a) => /^\d+$/.test(a)).map(Number);
if (!ZADEN.length) ZADEN.push(5, 62707, 73425);
const UIT = path.join(__dirname, 'uit', 'eiland');
fs.mkdirSync(UIT, { recursive: true });

// De kleuren van de streken op de plaat (in het spel worden het tegels).
const KLEUR = {
  meer: [64, 112, 158],
  rivier: [70, 122, 170],
  strand: [230, 216, 172],
  duinen: [204, 198, 150],
  kampen: [132, 164, 84],
  woud: [52, 92, 46],
  heide: [138, 106, 116],
  zand: [214, 198, 150],
  veen: [106, 88, 66],
  broek: [76, 110, 86],
  rots: [150, 144, 136],
};
const ZEE_ONDIEP = [104, 158, 192];
const ZEE_DIEP = [32, 62, 108];
const WEG = [226, 190, 124];
const BRUG = [124, 86, 48];
const NAMEN = {
  meer: 'meer en rivier',
  strand: 'strand',
  duinen: 'duinen',
  kampen: 'de kampen',
  woud: 'het woud',
  heide: 'de heide',
  zand: 'het zand',
  veen: 'het veen',
  broek: 'het broek',
  rots: 'rots',
};
const DAG = 2.2 * 300; // tegels die de schout op een dag loopt: 2,2 per seconde, een dag van vijf minuten op 1×

// Het eiland, of een stuk ervan, als beeld: de streek in zijn kleur, met het licht van de zon zoals in het spel
// (T.helderheidVanVlak), de wegen, en de bomen wat donkerder.
function beeld(E, x0, y0, b, h, stap, bomen) {
  const D = T.eilandStuk(E, x0, y0, b, h, stap);
  const rgba = Buffer.alloc(b * h * 4);
  const tel = {};
  let hoogst = -Infinity;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < b; x++) {
      const o = y * b + x;
      const s = T.EILAND_STREKEN[D.streek[o]];
      const hg = D.hoogte[o];
      tel[s] = (tel[s] || 0) + 1;
      if (hg > hoogst) hoogst = hg;
      let k;
      if (s === 'zee') {
        const d = Math.min(1, -hg / 300);
        k = ZEE_ONDIEP.map((c, i) => c + (ZEE_DIEP[i] - c) * d);
      } else if (s === 'meer' || s === 'rivier') {
        k = KLEUR[s];
      } else {
        const hx = ((x + 1 < b ? D.hoogte[o + 1] : hg) - (x > 0 ? D.hoogte[o - 1] : hg)) / 2;
        const hy = ((y + 1 < h ? D.hoogte[o + b] : hg) - (y > 0 ? D.hoogte[o - b] : hg)) / 2;
        const f = T.helderheidVanVlak([0, 0, 0], [stap, 0, hx], [0, stap, hy]);
        k = KLEUR[s].map((c) => c * f);
      }
      if (D.weg[o]) k = D.weg[o] === 2 ? BRUG : WEG;
      else if (D.boom[o] && s !== 'zee') k = k.map((c) => c * bomen);
      rgba[o * 4] = Math.max(0, Math.min(255, Math.round(k[0])));
      rgba[o * 4 + 1] = Math.max(0, Math.min(255, Math.round(k[1])));
      rgba[o * 4 + 2] = Math.max(0, Math.min(255, Math.round(k[2])));
      rgba[o * 4 + 3] = 255;
    }
  }
  return { png: K.pngVanBeeld({ b, h, rgba }), tel, hoogst };
}

const kort = (n) => (Math.round(n * 10) / 10).toString().replace('.', ',');
const dagen = (n) => kort(n) + (Math.round(n * 10) / 10 === 1 ? ' dag' : ' dagen');
const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// De rivieren, de wegen en de plekken over het eiland heen, als lijnen (op 1000 bij 1000 is een rivier anders een halve
// pixel breed).
function bovenop(E, schaal, jij) {
  const p = (q) => (q[0] * schaal).toFixed(1) + ',' + (q[1] * schaal).toFixed(1);
  let s = '';
  for (const r of E.rivieren) {
    const pt = r.punten;
    for (let i = 0; i < pt.length - 1; i += 4) {
      const deel = pt.slice(i, Math.min(pt.length, i + 5));
      const w = deel.reduce((a, q) => a + q[2], 0) / deel.length;
      s += `<polyline class="rivier" stroke-width="${Math.max(0.9, w * schaal * 1.4).toFixed(2)}" points="${deel.map(p).join(' ')}"/>`;
    }
  }
  for (const w of E.wegen) s += `<polyline class="weg-rand" points="${w.punten.map(p).join(' ')}"/>`;
  for (const w of E.wegen) s += `<polyline class="weg" points="${w.punten.map(p).join(' ')}"/>`;
  // het stuk van je land, dat ernaast staat
  const r = 98 * schaal;
  s += `<rect class="kader" x="${(jij.x * schaal - r).toFixed(1)}" y="${(jij.y * schaal - r).toFixed(1)}" width="${(2 * r).toFixed(1)}" height="${(2 * r).toFixed(1)}"/>`;
  for (const q of E.plekken) {
    const x = q.x * schaal;
    const y = q.y * schaal;
    if (q.soort === 'kasteel') {
      s += `<path class="kasteel" transform="translate(${x.toFixed(1)},${y.toFixed(1)})" d="M-9,7 V-4 H-6 V-8 H-2.5 V-4 H2.5 V-8 H6 V-4 H9 V7 Z"/>`;
      s += `<text class="naam" x="${(x + 12).toFixed(1)}" y="${(y + 4).toFixed(1)}">Het kasteel van de heer</text>`;
    } else if (q.soort === 'stad') {
      s += `<circle class="stad" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="8"/><circle class="stad-hart" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3"/>`;
      s += `<text class="naam" x="${(x + 12).toFixed(1)}" y="${(y + 4).toFixed(1)}">De stad</text>`;
    } else {
      if (q.jij) s += `<circle class="jij-ring" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="11"/>`;
      s += `<circle class="${q.jij ? 'jij' : 'dorp'}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${q.jij ? 6 : 5}"/>`;
      s += `<text class="naam${q.jij ? ' naam-jij' : ''}" x="${(x + (q.jij ? 15 : 9)).toFixed(1)}" y="${(y + 4).toFixed(1)}">${esc(q.naam)}${q.jij ? ' (jij)' : ''}</text>`;
    }
  }
  return s;
}

const AARD = { kust: 'aan de kust', rivier: 'aan een rivier', heide: 'op de heide', bosrand: 'aan de bosrand', kampen: 'in de kampen' };

function html(E, boven, zoom, cijfers) {
  const jij = E.plekken.find((q) => q.jij);
  const schaal = 1000 / E.maat;
  const legenda = Object.keys(NAMEN)
    .map((s) => `<div class="vak"><span class="staal" style="background:rgb(${KLEUR[s].join(',')})"></span>${NAMEN[s]}</div>`)
    .join('') +
    `<div class="vak"><span class="staal" style="background:rgb(${ZEE_ONDIEP.join(',')})"></span>de zee</div>` +
    `<div class="vak"><span class="staal" style="background:rgb(${WEG.join(',')})"></span>een weg (bruin: een brug)</div>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    body { margin: 0; background: #f4efe4; font-family: "DejaVu Sans", Arial, sans-serif; color: #2b2620; }
    .plaat { display: flex; gap: 22px; padding: 18px 22px; }
    .eiland { position: relative; width: 1000px; height: 1000px; flex: none; }
    .eiland img, .eiland svg { position: absolute; left: 0; top: 0; width: 1000px; height: 1000px; }
    .rechts { width: 600px; flex: none; }
    h1 { font-size: 26px; margin: 0 0 4px; }
    h2 { font-size: 17px; margin: 12px 0 6px; }
    p { margin: 3px 0; font-size: 14px; line-height: 1.35; }
    .land { position: relative; width: 588px; height: 588px; }
    .land img { width: 588px; height: 588px; image-rendering: pixelated; }
    .land svg { position: absolute; left: 0; top: 0; }
    .legenda { display: grid; grid-template-columns: 1fr 1fr; gap: 3px 14px; font-size: 14px; margin-top: 8px; }
    .vak { display: flex; align-items: center; gap: 7px; }
    .staal { width: 16px; height: 16px; border: 1px solid rgba(0,0,0,0.35); flex: none; }
    .rivier { fill: none; stroke: rgb(70,122,170); stroke-linecap: round; stroke-linejoin: round; }
    .weg-rand { fill: none; stroke: rgba(70,46,24,0.75); stroke-width: 3.2; stroke-linecap: round; stroke-linejoin: round; }
    .weg { fill: none; stroke: rgb(236,204,140); stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
    .kasteel { fill: #8e1c24; stroke: #2a0a0c; stroke-width: 1.5; }
    .stad { fill: #e8b830; stroke: #3a2808; stroke-width: 1.5; }
    .stad-hart { fill: #3a2808; }
    .dorp { fill: #fffaf0; stroke: #2b2620; stroke-width: 1.5; }
    .jij { fill: #e02828; stroke: #2b2620; stroke-width: 1.5; }
    .jij-ring { fill: none; stroke: #e02828; stroke-width: 2; }
    .kader { fill: none; stroke: #fff; stroke-width: 1.5; stroke-dasharray: 4 3; }
    .naam { font-size: 13px; font-weight: bold; fill: #2b2620; paint-order: stroke; stroke: rgba(255,250,240,0.9); stroke-width: 3.5px; }
    .naam-jij { fill: #a01010; font-size: 15px; }
    .klein { font-size: 12px; color: #5a5248; }
  </style></head><body><div class="plaat">
  <div class="eiland"><img src="data:image/png;base64,${boven.toString('base64')}"><svg viewBox="0 0 1000 1000">${bovenop(E, schaal, jij)}</svg></div>
  <div class="rechts">
    <h1>Het eiland van land ${E.zaad}</h1>
    <p>${cijfers.land}% land, de rest zee. Het hoogste punt is ${cijfers.hoogst} pixels (${Math.round(cijfers.hoogst / 32)} treden), op de bergrug. ${E.meren.length} meren, ${cijfers.mondingen} rivieren die in zee uitkomen.</p>
    <p>Van kust tot kust is ${dagen(cijfers.breed / DAG)} lopen; van ${esc(jij.naam)} naar het kasteel hemelsbreed ${dagen(cijfers.kasteel / DAG)}.</p>
    <h2>Je land: ${esc(jij.naam)}, ${AARD[jij.aard] || ''}</h2>
    <div class="land"><img src="data:image/png;base64,${zoom.toString('base64')}"><svg width="588" height="588" viewBox="0 0 588 588">
      <rect x="144" y="144" width="300" height="300" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="6 4"/>
      <circle cx="294" cy="294" r="6" fill="#e02828" stroke="#2b2620" stroke-width="1.5"/>
      <text class="naam" x="150" y="138">je land, 100 bij 100</text>
      <path d="M575,575 L540,540 M540,540 L552,541 M540,540 L541,552" stroke="#fff" stroke-width="3" fill="none"/>
      <text class="naam" x="430" y="582">de camera</text>
    </svg></div>
    <p class="klein">Een pixel is hier drie tegels breed: 196 bij 196 tegels, je land met de rand van 48 tegels die je mensen kennen (de rest is mist tot je het verkent). De donkere stippen zijn bomen.</p>
    <div class="legenda">${legenda}
      <div class="vak"><svg width="18" height="18"><path transform="translate(9,10)" d="M-7,6 V-3 H-5 V-6 H-2 V-3 H2 V-6 H5 V-3 H7 V6 Z" fill="#8e1c24" stroke="#2a0a0c"/></svg>het kasteel van de heer</div>
      <div class="vak"><svg width="18" height="18"><circle cx="9" cy="9" r="7" fill="#e8b830" stroke="#3a2808"/><circle cx="9" cy="9" r="2.5" fill="#3a2808"/></svg>de stad, aan de grootste rivier</div>
      <div class="vak"><svg width="18" height="18"><circle cx="9" cy="9" r="5" fill="#fffaf0" stroke="#2b2620" stroke-width="1.5"/></svg>een dorp</div>
      <div class="vak"><svg width="18" height="18"><circle cx="9" cy="9" r="5" fill="#e02828" stroke="#2b2620" stroke-width="1.5"/></svg>jouw dorp</div>
    </div>
    <p class="klein" style="margin-top:10px">De schets (kust, water, plekken, wegen) in ${kort(E.tijd / 1000)} s (${Object.entries(E.tijden).map(([k, v]) => k + ' ' + v).join(', ')} ms); het eiland tegel voor tegel, om de twee tegels, in ${kort(cijfers.detail / 1000)} s. Streken: ${cijfers.streken}.</p>
  </div></div></body></html>`;
}

function laadPlaywright() {
  try {
    return require('playwright');
  } catch {
    return require(path.join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'playwright'));
  }
}

(async () => {
  const { chromium } = laadPlaywright();
  const browser = await chromium.launch();
  try {
    for (const zaad of ZADEN) {
      const E = T.maakEiland(zaad);
      const jij = E.plekken.find((q) => q.jij);
      let t = Date.now();
      const B = Math.floor(E.maat / 2);
      const boven = beeld(E, 0, 0, B, B, 2, 0.86);
      const detail = Date.now() - t;
      const zoom = beeld(E, Math.round(jij.x) - 98, Math.round(jij.y) - 98, 196, 196, 1, 0.74);
      const alles = B * B;
      const land = alles - (boven.tel.zee || 0);
      const streken = Object.keys(NAMEN)
        .filter((s) => s !== 'meer')
        .map((s) => [s, boven.tel[s] || 0])
        .sort((a, b) => b[1] - a[1])
        .map(([s, n]) => `${NAMEN[s].replace(/^(de|het) /, '')} ${Math.round((n / land) * 100)}%`)
        .join(', ');
      // hoe breed het land is, en hoe ver het kasteel
      let x0 = Infinity;
      let x1 = -Infinity;
      for (let k = 0; k < E.n * E.n; k++) {
        if (!E.hoofdland[k]) continue;
        const x = (k % E.n) * E.vak;
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
      }
      const kasteel = E.plekken.find((q) => q.soort === 'kasteel');
      const cijfers = {
        land: Math.round((land / alles) * 100),
        hoogst: Math.round(boven.hoogst),
        mondingen: E.rivieren.filter((r) => r.zee).length,
        breed: x1 - x0,
        kasteel: kasteel ? Math.sqrt((kasteel.x - jij.x) * (kasteel.x - jij.x) + (kasteel.y - jij.y) * (kasteel.y - jij.y)) : 0,
        detail,
        streken,
      };
      const pagina = html(E, boven.png, zoom.png, cijfers);
      fs.writeFileSync(path.join(UIT, `eiland-${zaad}.html`), pagina);
      fs.writeFileSync(path.join(UIT, `eiland-${zaad}-boven.png`), boven.png);
      const page = await browser.newPage({ viewport: { width: 1666, height: 1040 } });
      await page.setContent(pagina);
      await page.screenshot({ path: path.join(UIT, `eiland-${zaad}.png`), fullPage: true });
      await page.close();
      if (GROOT) {
        t = Date.now();
        const groot = beeld(E, 0, 0, E.maat, E.maat, 1, 0.8);
        fs.writeFileSync(path.join(UIT, `eiland-${zaad}-groot.png`), groot.png);
        console.log(`  op ware grootte in ${kort((Date.now() - t) / 1000)} s`);
      }
      console.log(`land ${zaad}: ${cijfers.land}% land, ${E.meren.length} meren, ${cijfers.mondingen} rivieren in zee, ${E.plekken.length} plekken; jij in ${jij.naam} (${jij.aard}); de schets in ${E.tijd} ms, het detail in ${detail} ms`);
    }
  } finally {
    await browser.close();
  }
  console.log(`In ${path.relative(path.join(__dirname, '..', '..'), UIT)}/`);
})();
