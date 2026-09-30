// De schets van de maker (ontwerp/werklijst.md, vraag 69 en 70): gehuchten van de maker als plattegrond, in de schuine
// blik van het spel (de camera kijkt van onderen), met het ontworpen gehucht ernaast om te vergelijken. Elk gehucht
// wordt een SVG in gereedschap/maker/uit/, met zijn maten in maten.json.
//
//   npm run maker              de zaden 1, 2 en 3, en het ontworpen gehucht
//   npm run maker -- 7 12 40   andere zaden
//
// Het laadt het spel zoals een toets (test/laad.cjs), met de maker erin (js/maker.js), zodat hij de regels uit js/
// gebruikt en de maten van de tekeningen uit tegels/tegels.js.
'use strict';
const fs = require('fs');
const path = require('path');

const WORTEL = path.join(__dirname, '..', '..');
const UIT = path.join(__dirname, 'uit');
const T = require(path.join(WORTEL, 'test', 'laad.cjs')).spel();

// ---------------------------------------------------------------- het ontworpen gehucht als plan
// Uit dezelfde delen als een plan van de maker (gereedschap/tiled/maak-gehucht.cjs), zodat de schets beide op
// dezelfde manier tekent en keurt.
function ontworpen() {
  const G = require(path.join(WORTEL, 'gereedschap', 'tiled', 'maak-gehucht.cjs'));
  const tekening = (naam) => {
    for (const vel of Object.keys(T.TEGELS)) {
      const t = T.TEGELS[vel].tiles.find((x) => x && x.naam === naam);
      if (t) return { vel, beslaat: t.beslaat || [1, 1], deur: t.deur };
    }
    return null;
  };
  const huis = (h, meer) => {
    const t = tekening(h.tegel);
    const [b, d] = t.beslaat;
    const deur = t.deur || [Math.floor(b / 2), d];
    const kant = deur[1] >= d ? { x: 0, y: 1 } : deur[0] >= b ? { x: 1, y: 0 } : deur[0] < 0 ? { x: -1, y: 0 } : { x: 0, y: -1 };
    return { tekening: h.tegel, vel: t.vel, x: h.x, y: h.y, b, d, deur: { x: h.x + deur[0], y: h.y + deur[1] }, kant, ...meer };
  };
  const huizen = [
    huis(G.SCHOUT_HUIS, { rol: 'schout', huis: 'schout' }),
    huis(G.HERBERG, { rol: 'herberg', huis: 'herbergierster' }),
    ...G.GEWONE_HUIZEN.map((h) => huis(h, { rol: h.gebouw, bewoners: h.bewoners })),
    ...Object.entries(G.HUIZEN).map(([id, h]) => huis(h, { rol: 'boerderij', huis: id })),
    huis(G.KOOI, { rol: 'kooi' }),
  ];
  const grond = [];
  for (let y = 0; y <= G.H; y++) {
    let rij = '';
    for (let x = 0; x <= G.B; x++) rij += { water: 'w', zandpad: 'z', heide: 'h', gras: 'g' }[G.soortOp(x, y)];
    grond.push(rij);
  }
  const voorwerpen = G.kaart.layers[1].objects
    .map((o) => {
      const t = tekening(o.name);
      const [b, d] = (t && t.beslaat) || [1, 1];
      return { naam: o.name, x: o.x / 32, y: o.y / 32, b, d };
    })
    .filter((v) => !huizen.some((h) => h.x === v.x && h.y === v.y));
  const brug = [];
  for (let x = G.BRUG_X0; x <= G.BRUG_X1; x++) brug.push({ x, y: G.BRUG_Y });
  const plan = {
    zaad: null, b: G.B, h: G.H, grond, plein: G.PLEIN_RAND, zand: G.ZAND, marskramer: G.OP_HET_ZAND,
    uitgang: { x: G.UITGANG.x, y: G.UITGANG.y }, brug, huizen, akkers: G.AKKERS, meent: G.MEENT, voorwerpen,
    schout: huizen[0].deur,
  };
  const fout = T.keurGehucht(plan);
  if (fout) plan.fout = fout;
  return plan;
}

// ---------------------------------------------------------------- tekenen
// Schuin van boven, zoals het spel: een tegel is een ruit van 2 bij 1, x loopt in beeld naar rechtsonder en y naar
// linksonder. De huizen zijn lage dozen op de maat van hun tekening: hoog genoeg om te zien welke kant hun muren
// op kijken, laag genoeg om de indeling te lezen. Wat een echt dak afdekt, staat als schaduw op het plein.
const S = 8; // een halve ruit breed, in beeldpunten
const RAND = 26;
const KLEUR = {
  gras: '#7fa653', plein: '#a3c06f', pleinRand: '#f4f0d8', zand: '#d8bd86', water: '#5b8fc0', pad: '#c6a36c',
  heide: '#9c7a93', akker: '#d8b45a', voor: '#b08d3c', weide: '#93c05c', weideVoor: '#7aa84a', schaduw: 'rgba(24,32,12,0.42)',
  inkt: '#2b1d10', licht: '#fffbe8',
};
const DAK = {
  schout: ['#b04a32', '#7e3322'], herberg: ['#8b5a3a', '#5e3b24'], huis: ['#c4a055', '#8d7137'], hut: ['#c9ab68', '#917a44'],
  boerderij: ['#b08b45', '#7d622f'], kooi: ['#8a7a5c', '#5f5440'],
};
const HOOGTE = { schout: 11, herberg: 12, huis: 9, hut: 7, boerderij: 10, kooi: 8 };
const BOOM = {
  den: ['#2f5a2a', 5], eik: ['#3d6a2c', 5.5], berk: ['#6f9a4a', 4.2], wilg: ['#7d9a6a', 4.6], appelboom: ['#4f7a33', 4],
};

function svgVan(plan, opties = {}) {
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
  // de grond: gras, en per hoekpunt water, zand en heide (een ruit rond het hoekpunt)
  uit.push(`<path d="${vak(0, 0, B, H)}" fill="${KLEUR.gras}"/>`);
  const perSoort = { w: [], z: [], h: [] };
  for (let y = 0; y <= H; y++) {
    for (let x = 0; x <= B; x++) {
      const s = plan.grond[y][x];
      if (!perSoort[s]) continue;
      const x0 = Math.max(0, x - 0.5);
      const y0 = Math.max(0, y - 0.5);
      const x1 = Math.min(B, x + 0.5);
      const y1 = Math.min(H, y + 0.5);
      perSoort[s].push(`M${pt(x0, y0)}L${pt(x1, y0)}L${pt(x1, y1)}L${pt(x0, y1)}Z`);
    }
  }
  uit.push(`<path d="${perSoort.h.join('')}" fill="${KLEUR.heide}"/>`);
  // het plein, met zijn rand gestippeld, en het zand ervoor
  uit.push(`<path d="${veelhoek(plan.plein)}" fill="${KLEUR.plein}"/>`);
  uit.push(`<path d="${veelhoek(plan.zand)}" fill="${KLEUR.zand}"/>`);
  uit.push(`<path d="${perSoort.z.join('')}" fill="${KLEUR.pad}"/>`);
  uit.push(`<path d="${perSoort.w.join('')}" fill="${KLEUR.water}"/>`);
  uit.push(`<path d="${veelhoek(plan.plein)}" fill="none" stroke="${KLEUR.pleinRand}" stroke-width="1.6" stroke-dasharray="5 4" stroke-opacity="0.9"/>`);
  // het bruggetje
  if (plan.brug.length) {
    const xs = plan.brug.map((b) => b.x);
    const ys = plan.brug.map((b) => b.y);
    const x0 = Math.min(...xs);
    const y0 = Math.min(...ys);
    uit.push(`<path d="${vak(x0, y0, Math.max(...xs) - x0 + 1, Math.max(...ys) - y0 + 1)}" fill="#8b6a44" stroke="${KLEUR.inkt}" stroke-width="0.8"/>`);
  }
  // de akkers en de weide, met voren in de lengte
  for (const a of plan.akkers) {
    const weide = a.bestemming === 'weide';
    uit.push(`<path d="${vak(a.x, a.y, a.b, a.h)}" fill="${weide ? KLEUR.weide : KLEUR.akker}" stroke="${weide ? KLEUR.weideVoor : KLEUR.voor}" stroke-width="0.8"/>`);
    const voren = [];
    if (a.b >= a.h) for (let y = a.y + 0.5; y < a.y + a.h; y += 0.5) voren.push(`M${pt(a.x + 0.2, y)}L${pt(a.x + a.b - 0.2, y)}`);
    else for (let x = a.x + 0.5; x < a.x + a.b; x += 0.5) voren.push(`M${pt(x, a.y + 0.2)}L${pt(x, a.y + a.h - 0.2)}`);
    uit.push(`<path d="${voren.join('')}" stroke="${weide ? KLEUR.weideVoor : KLEUR.voor}" stroke-width="0.6" stroke-opacity="0.8"/>`);
  }
  // wat een dak van het plein afdekt: een schaduw op die tegels
  if (opties.schaduw !== false) {
    const opPlein = (x, y) => T.binnenRand(plan.plein, x + 0.5, y + 0.5);
    const verborgen = [];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < B; x++) {
        if (!opPlein(x, y)) continue;
        const achter = plan.huizen.some((h) => {
          for (let by = h.y; by < h.y + h.d; by++) {
            for (let bx = h.x; bx < h.x + h.b; bx++) {
              const k = bx + by - (x + y);
              if (k >= 1 && k <= T.MAKER_INSTELLINGEN.achterDak && Math.abs(bx - by - (x - y)) <= 1) return true;
            }
          }
          return false;
        });
        if (achter) verborgen.push(ruit(x, y));
      }
    }
    if (verborgen.length) uit.push(`<path d="${verborgen.join('')}" fill="${KLEUR.schaduw}"/>`);
  }
  // wat er staat, van achter naar voren (kleinste x+y eerst), zodat wat vooraan staat ervoor valt
  const dingen = [];
  for (const h of plan.huizen) dingen.push({ diepte: h.x + h.y + h.b + h.d, huis: h });
  for (const v of plan.voorwerpen) dingen.push({ diepte: v.x + v.y + (v.b || 1) + (v.d || 1), voorwerp: v });
  dingen.sort((a, b) => a.diepte - b.diepte);
  for (const d of dingen) {
    if (d.huis) {
      const h = d.huis;
      const [dak, muur] = DAK[h.rol] || DAK.hut;
      const z = HOOGTE[h.rol] || 8;
      const op = (x, y) => {
        const [a, b] = p(x, y);
        return `${a.toFixed(1)},${(b - z).toFixed(1)}`;
      };
      // de twee muren die naar de camera kijken, en het dak erop
      uit.push(`<path d="M${pt(h.x, h.y + h.d)}L${pt(h.x + h.b, h.y + h.d)}L${op(h.x + h.b, h.y + h.d)}L${op(h.x, h.y + h.d)}Z" fill="${muur}" stroke="${KLEUR.inkt}" stroke-width="0.7"/>`);
      uit.push(`<path d="M${pt(h.x + h.b, h.y)}L${pt(h.x + h.b, h.y + h.d)}L${op(h.x + h.b, h.y + h.d)}L${op(h.x + h.b, h.y)}Z" fill="${muur}" stroke="${KLEUR.inkt}" stroke-width="0.7" style="filter:brightness(0.82)"/>`);
      uit.push(`<path d="M${op(h.x, h.y)}L${op(h.x + h.b, h.y)}L${op(h.x + h.b, h.y + h.d)}L${op(h.x, h.y + h.d)}Z" fill="${dak}" stroke="${KLEUR.inkt}" stroke-width="0.8"/>`);
      // de nok, in de lengte
      const lang = h.b >= h.d;
      const n1 = lang ? op(h.x + 0.6, h.y + h.d / 2) : op(h.x + h.b / 2, h.y + 0.6);
      const n2 = lang ? op(h.x + h.b - 0.6, h.y + h.d / 2) : op(h.x + h.b / 2, h.y + h.d - 0.6);
      uit.push(`<path d="M${n1}L${n2}" stroke="${KLEUR.inkt}" stroke-width="0.6" stroke-opacity="0.55"/>`);
      // de deur: een licht puntje op de tegel ervoor
      const [dx, dy] = p(h.deur.x + 0.5, h.deur.y + 0.5);
      uit.push(`<circle cx="${dx.toFixed(1)}" cy="${dy.toFixed(1)}" r="2.3" fill="${KLEUR.licht}" stroke="${KLEUR.inkt}" stroke-width="0.8"/>`);
    } else {
      const v = d.voorwerp;
      const [x, y] = p(v.x + (v.b || 1) / 2, v.y + (v.d || 1) / 2);
      const boom = BOOM[v.naam];
      if (boom) {
        const [kleur, r] = boom;
        uit.push(`<ellipse cx="${x.toFixed(1)}" cy="${(y + 1).toFixed(1)}" rx="${(r * 0.9).toFixed(1)}" ry="${(r * 0.45).toFixed(1)}" fill="rgba(20,28,10,0.35)"/>`);
        uit.push(`<circle cx="${x.toFixed(1)}" cy="${(y - r * 0.9).toFixed(1)}" r="${r}" fill="${kleur}" stroke="#1d3312" stroke-width="0.6"/>`);
        if (v.naam === 'appelboom') uit.push(`<circle cx="${(x + 1.4).toFixed(1)}" cy="${(y - r * 1.1).toFixed(1)}" r="1" fill="#d24a3a"/>`);
      } else if (v.naam === 'put') {
        uit.push(`<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="5.5" ry="3" fill="#6b7b8c" stroke="${KLEUR.inkt}" stroke-width="0.8"/>`);
      } else if (v.naam === 'lantaarn') {
        uit.push(`<circle cx="${x.toFixed(1)}" cy="${(y - 4).toFixed(1)}" r="2" fill="#f4d27a" stroke="${KLEUR.inkt}" stroke-width="0.6"/>`);
      } else if (['kool', 'prei', 'bonen', 'kruidenbed'].includes(v.naam)) {
        uit.push(`<path d="${ruit(v.x, v.y)}" fill="#5f8f3f" stroke="#3f6a28" stroke-width="0.4"/>`);
      } else if (['bank', 'bankje-y', 'regenton'].includes(v.naam)) {
        uit.push(`<circle cx="${x.toFixed(1)}" cy="${(y - 1).toFixed(1)}" r="1.6" fill="#7a5a3a"/>`);
      }
    }
  }
  // de namen: op het plein, bij de huizen, en de akkers met het nummer van hun boer
  const tekst = (x, y, t, maat = 10, kleur = KLEUR.licht) =>
    `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${maat}" font-weight="600" text-anchor="middle" fill="${kleur}" stroke="${KLEUR.inkt}" stroke-width="2.6" stroke-linejoin="round" paint-order="stroke">${t}</text>`;
  const boerNummer = {};
  plan.huizen.filter((h) => h.rol === 'boerderij').forEach((h, i) => (boerNummer[h.huis] = opties.namen ? opties.namen[h.huis] : String(i + 1)));
  for (const a of plan.akkers) {
    const [x, y] = p(a.x + a.b / 2, a.y + a.h / 2);
    uit.push(tekst(x, y + 3, boerNummer[a.huis], 9, a.bestemming === 'weide' ? '#e9f7d6' : '#fff3cf'));
  }
  for (const h of plan.huizen) {
    const [x, y] = p(h.x + h.b / 2, h.y + h.d / 2);
    const z = HOOGTE[h.rol] || 8;
    const naam = h.rol === 'boerderij' ? boerNummer[h.huis] : { schout: 'schout', herberg: 'herberg', huis: 'huis', hut: 'hut', kooi: 'kooi' }[h.rol];
    uit.push(tekst(x, y - z + 3, naam, h.rol === 'boerderij' ? 11 : 9));
  }
  {
    const xs = plan.plein.map((q) => q[0]);
    const ys = plan.plein.map((q) => q[1]);
    const [x, y] = p((Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2);
    uit.push(tekst(x, y + 4, 'plein', 12));
    const [mx, my] = p(plan.meent.x + plan.meent.b / 2, plan.meent.y + plan.meent.h / 2);
    uit.push(tekst(mx, my + 4, 'heide', 10));
  }
  // de uitgang naar het land: een pijl over de rand van de kaart
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
  const eigen = ontworpen();
  fs.writeFileSync(path.join(UIT, 'ontworpen.svg'), svgVan(eigen, { namen: { boer1: 'Klaas', boer2: 'Aaltje', boer3: 'Gerrit', boer4: 'Trijn', boer5: 'Wouter' } }));
  maten.ontworpen = eigen.maat || { fout: eigen.fout };
  console.log(`ontworpen: ${JSON.stringify(maten.ontworpen)}`);
  for (const zaad of zaden) {
    const t0 = Date.now();
    const plan = T.maakGehucht(zaad);
    fs.writeFileSync(path.join(UIT, `zaad-${zaad}.svg`), svgVan(plan));
    maten[zaad] = { ...plan.maat, poging: plan.poging, ms: Date.now() - t0, landschap: plan.landschap };
    console.log(`zaad ${zaad}: ${JSON.stringify(maten[zaad])}`);
  }
  fs.writeFileSync(path.join(UIT, 'maten.json'), JSON.stringify(maten, null, 1) + '\n');
  console.log(`klaar: ${path.relative(WORTEL, UIT)}/`);
}

module.exports = { svgVan, ontworpen };
