// De schets van de maker (ontwerp/werklijst.md, vraag 69 en 70): het land van de maker als plattegrond, in de schuine blik
// van het spel (de camera kijkt van onderen). Elk plan wordt een SVG in gereedschap/maker/uit/, met zijn maten in
// maten.json. Het plan ligt op het eiland (T.planOpEiland, js/maker.js): het water, de heide, de wegen en de bomen van het
// eiland, met de open plek voor het plein en het kamp erop. Huizen, akkers, een meent en een put zijn er niet meer
// (ronde 2 van het snoeien, stap 6, 12 okt: "Alles wordt door spelers geplaatst"); tot dan tekende hij ze ook.
//
//   npm run maker              de zaden 1, 2 en 3
//   npm run maker -- 7 12 40   andere zaden
//
// Het laadt het spel zoals een toets (test/laad.cjs), met de maker erin (js/maker.js), zodat hij de regels uit js/ gebruikt.
'use strict';
const fs = require('fs');
const path = require('path');

const WORTEL = path.join(__dirname, '..', '..');
const UIT = path.join(__dirname, 'uit');
const T = require(path.join(WORTEL, 'test', 'laad.cjs')).spel();

// ---------------------------------------------------------------- tekenen
// Schuin van boven, zoals het spel: een tegel is een ruit van 2 bij 1, x loopt in beeld naar rechtsonder en y naar
// linksonder. De bomen zijn bolletjes op de plek van hun stam.
const S = 8; // een halve ruit breed, in beeldpunten
const RAND = 26;
const KLEUR = {
  gras: '#7fa653', plein: '#a3c06f', pleinRand: '#f4f0d8', water: '#5b8fc0', zee: '#3f78a8', strand: '#e0cf9a', veen: '#6b6a45',
  broek: '#5d7a4a', pad: '#c6a36c', heide: '#9c7a93', tent: '#b08b45', vuur: '#e8873a', kar: '#8b6a44', inkt: '#2b1d10', licht: '#fffbe8',
};
// De grond per hoekpunt (de letters van plan.grond), in de volgorde waarin hij getekend wordt: wat onder het plein ligt, het pad
// eroverheen, en als laatste het water.
const ONDER = { h: KLEUR.heide, s: KLEUR.strand, v: KLEUR.veen, b: KLEUR.broek };
const BOVEN = { z: KLEUR.pad, w: KLEUR.water, e: KLEUR.zee };
const BOOM = {
  den: ['#2f5a2a', 5], eik: ['#3d6a2c', 5.5], berk: ['#6f9a4a', 4.2], wilg: ['#7d9a6a', 4.6], dodeBoom: ['#6a5a48', 4], groveDen: ['#3a5a30', 4.6],
  linde: ['#4f7a33', 5.5], beuk: ['#3f7030', 5.5], populier: ['#5f8a3a', 4.4], knotwilg: ['#7d9a6a', 4.2], els: ['#4a6a40', 4.2],
  struik: ['#4f7a33', 2.4], bessenStruik: ['#4f7a33', 2.4], hazelaar: ['#5a8a3a', 3], meidoorn: ['#5a8a3a', 3],
};
const ROTS = { rots: 3.6, kleineRots: 2 };

function svgVan(plan) {
  const B = plan.b;
  const H = plan.h;
  const breed = B * 2 * S + RAND * 2;
  const hoog = (B + H) * (S / 2) + RAND * 2 + 18;
  const ox = H * S + RAND;
  const oy = RAND + 12;
  const p = (x, y) => [ox + (x - y) * S, oy + (x + y) * (S / 2)];
  const pt = (x, y) => p(x, y).map((n) => n.toFixed(1)).join(',');
  const ruit = (x, y) => `M${pt(x, y)}L${pt(x + 1, y)}L${pt(x + 1, y + 1)}L${pt(x, y + 1)}Z`;
  const vak = (x, y, b, h) => `M${pt(x, y)}L${pt(x + b, y)}L${pt(x + b, y + h)}L${pt(x, y + h)}Z`;
  const veelhoek = (punten) => 'M' + punten.map(([x, y]) => pt(x, y)).join('L') + 'Z';
  const uit = [];
  uit.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${breed} ${hoog}" width="${breed}" height="${hoog}" font-family="system-ui, -apple-system, sans-serif">`);
  uit.push(`<rect width="${breed}" height="${hoog}" fill="#1e1913"/>`);
  // de grond: gras, en per hoekpunt de grond van het eiland (een ruit rond het hoekpunt)
  uit.push(`<path d="${vak(0, 0, B, H)}" fill="${KLEUR.gras}"/>`);
  const perSoort = {};
  for (let y = 0; y <= H; y++) {
    for (let x = 0; x <= B; x++) {
      const s = plan.grond[y][x];
      if (!ONDER[s] && !BOVEN[s]) continue;
      const x0 = Math.max(0, x - 0.5);
      const y0 = Math.max(0, y - 0.5);
      const x1 = Math.min(B, x + 0.5);
      const y1 = Math.min(H, y + 0.5);
      (perSoort[s] = perSoort[s] || []).push(`M${pt(x0, y0)}L${pt(x1, y0)}L${pt(x1, y1)}L${pt(x0, y1)}Z`);
    }
  }
  const lagen = (soorten) => {
    for (const s of Object.keys(soorten)) if (perSoort[s]) uit.push(`<path d="${perSoort[s].join('')}" fill="${soorten[s]}"/>`);
  };
  lagen(ONDER);
  // het plein, en de wegen en het water eroverheen
  uit.push(`<path d="${veelhoek(plan.plein)}" fill="${KLEUR.plein}"/>`);
  lagen(BOVEN);
  uit.push(`<path d="${veelhoek(plan.plein)}" fill="none" stroke="${KLEUR.pleinRand}" stroke-width="1.6" stroke-dasharray="5 4" stroke-opacity="0.9"/>`);
  // de bruggetjes
  for (const b of plan.bruggen) {
    const xs = b.tegels.map((t) => t.x);
    const ys = b.tegels.map((t) => t.y);
    const x0 = Math.min(...xs);
    const y0 = Math.min(...ys);
    uit.push(`<path d="${vak(x0, y0, Math.max(...xs) - x0 + 1, Math.max(...ys) - y0 + 1)}" fill="#8b6a44" stroke="${KLEUR.inkt}" stroke-width="0.8"/>`);
  }
  // het kamp op het plein: de kar (de 3 bij 3 tegels waar hij staat), de tenten met hun opening, en het vuur
  const kamp = plan.kamp;
  uit.push(`<path d="${vak(kamp.kar.x - 1, kamp.kar.y - 1, 3, 3)}" fill="none" stroke="${KLEUR.kar}" stroke-width="1.2" stroke-dasharray="3 2"/>`);
  for (const t of kamp.plekken) {
    uit.push(`<path d="${vak(t.voet.x, t.voet.y, t.voet.b, t.voet.h)}" fill="${KLEUR.tent}" stroke="${KLEUR.inkt}" stroke-width="0.8"/>`);
    const [dx, dy] = p(t.deur.x + 0.5, t.deur.y + 0.5);
    uit.push(`<circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="2" fill="${KLEUR.licht}" stroke="${KLEUR.inkt}" stroke-width="0.7"/>`);
  }
  {
    const [vx, vy] = p(kamp.vuur.x + 0.5, kamp.vuur.y + 0.5);
    uit.push(`<circle cx="${vx.toFixed(1)}" cy="${vy.toFixed(1)}" r="3" fill="${KLEUR.vuur}" stroke="${KLEUR.inkt}" stroke-width="0.8"/>`);
  }
  // wat er staat, van achter naar voren (kleinste x+y eerst), zodat wat vooraan staat ervoor valt
  const dingen = plan.voorwerpen.map((v) => ({ diepte: v.x + v.y + (v.b || 1) + (v.d || 1), voorwerp: v }));
  dingen.sort((a, b) => a.diepte - b.diepte);
  for (const d of dingen) {
    const v = d.voorwerp;
    const [x, y] = p(v.x + (v.b || 1) / 2, v.y + (v.d || 1) / 2);
    const boom = BOOM[v.naam];
    if (boom) {
      const [kleur, r] = boom;
      uit.push(`<ellipse cx="${x.toFixed(1)}" cy="${(y + 1).toFixed(1)}" rx="${(r * 0.9).toFixed(1)}" ry="${(r * 0.45).toFixed(1)}" fill="rgba(20,28,10,0.35)"/>`);
      uit.push(`<circle cx="${x.toFixed(1)}" cy="${(y - r * 0.9).toFixed(1)}" r="${r}" fill="${kleur}" stroke="#1d3312" stroke-width="0.6"/>`);
    } else if (ROTS[v.naam]) {
      uit.push(`<ellipse cx="${x.toFixed(1)}" cy="${(y - 1).toFixed(1)}" rx="${ROTS[v.naam]}" ry="${(ROTS[v.naam] * 0.6).toFixed(1)}" fill="#8f8f8a" stroke="${KLEUR.inkt}" stroke-width="0.5"/>`);
    }
  }
  // de namen: op het plein, en bij het kamp
  const tekst = (x, y, t, maat = 10, kleur = KLEUR.licht) =>
    `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${maat}" font-weight="600" text-anchor="middle" fill="${kleur}" stroke="${KLEUR.inkt}" stroke-width="2.6" stroke-linejoin="round" paint-order="stroke">${t}</text>`;
  {
    const xs = plan.plein.map((q) => q[0]);
    const ys = plan.plein.map((q) => q[1]);
    const [x, y] = p((Math.min(...xs) + Math.max(...xs)) / 2, Math.max(...ys) + 1.5);
    uit.push(tekst(x, y + 4, 'plein', 12));
    const [kx, ky] = p(kamp.vuur.x + 0.5, kamp.vuur.y + 0.5);
    uit.push(tekst(kx, ky - 8, 'kamp', 9));
  }
  // de plek van de marskramer
  {
    const m = plan.marskramer;
    const [x, y] = p(m.x + 0.5, m.y + 0.5);
    uit.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="#d8a23a" stroke="${KLEUR.inkt}" stroke-width="0.8"/>`);
    uit.push(tekst(x, y - 5, 'marskramer', 8));
  }
  // de uitgang naar het land: een pijl over de rand van de kaart, waar de weg naar het kasteel de kaart verlaat
  {
    const u = plan.uitgang;
    const naar = u.x === 0 ? [-1, 0] : u.x === B - 1 ? [1, 0] : u.y === 0 ? [0, -1] : [0, 1];
    const [x0, y0] = p(u.x + 0.5 - naar[0] * 2, u.y + 0.5 - naar[1] * 2);
    const [x1, y1] = p(u.x + 0.5 + naar[0] * 3, u.y + 0.5 + naar[1] * 3);
    uit.push(`<defs><marker id="pijl" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0,0L10,5L0,10z" fill="${KLEUR.licht}" stroke="${KLEUR.inkt}" stroke-width="0.8"/></marker></defs>`);
    uit.push(`<path d="M${x0.toFixed(1)},${y0.toFixed(1)}L${x1.toFixed(1)},${y1.toFixed(1)}" stroke="${KLEUR.licht}" stroke-width="2.2" marker-end="url(#pijl)"/>`);
    const [tx, ty] = p(u.x + 0.5 + naar[0] * 5, u.y + 0.5 + naar[1] * 5);
    uit.push(tekst(tx, ty + (naar[1] > 0 || naar[0] > 0 ? 12 : -4), 'naar het land', 10));
  }
  // de rand van de kaart, en waar de camera staat
  uit.push(`<path d="${vak(0, 0, B, H)}" fill="none" stroke="#0d0a07" stroke-width="1.2"/>`);
  uit.push(tekst(ox, hoog - 6, '▲ camera', 10, '#b5a78c'));
  uit.push('</svg>');
  return uit.join('\n');
}

// ---------------------------------------------------------------- aan de slag
if (require.main === module) {
  const zaden = process.argv.slice(2).map(Number).filter((n) => Number.isFinite(n));
  if (!zaden.length) zaden.push(1, 2, 3);
  fs.mkdirSync(UIT, { recursive: true });
  const maten = {};
  for (const zaad of zaden) {
    const t0 = Date.now();
    const plan = T.planOpEiland(zaad);
    fs.writeFileSync(path.join(UIT, `zaad-${zaad}.svg`), svgVan(plan));
    maten[zaad] = { ...plan.maat, poging: plan.poging, dorp: plan.eiland.dorp, ms: Date.now() - t0 };
    console.log(`zaad ${zaad}: ${JSON.stringify(maten[zaad])}`);
  }
  fs.writeFileSync(path.join(UIT, 'maten.json'), JSON.stringify(maten, null, 1) + '\n');
  console.log(`klaar: ${path.relative(WORTEL, UIT)}/`);
}

module.exports = { svgVan };
