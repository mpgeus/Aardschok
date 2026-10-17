'use strict';
// De zichtproef: een extreem dichte straat in drie weergaven, om te zien of de aanpak van Stronghold (gebouwen plat) het
// zicht genoeg beter maakt om de camera draaien minder nodig te maken (vraag 176; ontwerp/beeld.md, "Zicht in een dicht
// dorp"). Alleen een proef: het spel, de renderer en de kunst blijven zoals ze zijn, en alles van de proef staat in deze
// map. Gebouwd op de cameraproef (gereedschap/cameraproef/cameraproef.cjs), met dezelfde manier van tekenen en meten.
//
//   node gereedschap/zichtproef/plat.cjs         eerst: de platte tekeningen (plat/, een paar minuten)
//   node gereedschap/zichtproef/zichtproef.cjs   dan de proef (een paar minuten)
//
// De weergaven, uit dezelfde camera en op dezelfde zoom (1, ware pixels), elk een vers spel (het lege begin):
//   A   gewoon: elk gebouw zoals het spel het tekent;
//   B   alle gebouwen plat (plat.cjs: zonder dak, de muren tot de heup, de vloer in de kleur van het dak);
//   C1  alleen plat wat het zicht neemt op één gekozen inwoner (de eerste van het dorp, in de straat);
//   C2  net zo voor één gekozen gebouw (het gebouw dat in A het slechtst te zien is).
// Hoe plat: het spel laadt elke tekening van een huis uit een eigen bestand (tegels/huizen/<naam>.png); de proef geeft
// het spel voor een plat gebouw het platte plaatje uit plat/ (page.route), met dezelfde maat en hetzelfde anker. Het
// spel tekent dus alles zelf, met zijn eigen volgorde en schaduwen (een schaduw is het silhouet van het plaatje).
// Wie het zicht neemt (C): elk gebouw dat in A een deel van het gekozene afdekt en ervoor staat (dichter bij de
// camera); dat zegt de meting (de pixels) samen met de plattegrond (wie vóór wie staat).
//
// Uit (in deze map): zicht_A.png, zicht_B.png, zicht_C1.png en zicht_C2.png (dezelfde uitsnede), zicht_vergelijking.png
// (de vier in een raster van twee bij twee), en zichtbaarheid.json met de metingen, zoals de cameraproef.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { execSync, spawn } = require('node:child_process');

const WORTEL = path.join(__dirname, '..', '..');
const K = require(path.join(WORTEL, 'gereedschap', 'pixelart', 'kern.cjs'));
const { MIDDEN, DORP } = require('./dorp.cjs');
const URL = 'http://localhost:8123/';
const VENSTER = { width: 2800, height: 2400 }; // groot genoeg voor de hele straat met de hoge huizen erop
const UUR = 10; // een ochtend, zoals de cameraproef
const MARGE = 40;
const PLAT = path.join(__dirname, 'plat');
const DREMPEL = 0.02; // een gebouw neemt het zicht als het meer dan zoveel van het gekozene afdekt
const GOED = 50; // een inwoner telt als goed te zien vanaf zoveel procent

function laadPlaywright() {
  try {
    return require('playwright');
  } catch {
    return require(path.join(execSync('npm root -g', { encoding: 'utf8' }).trim(), 'playwright'));
  }
}
const serverDraait = () => new Promise((klaar) => {
  http.get(URL, (r) => { r.resume(); klaar(true); }).on('error', () => klaar(false));
});
async function zorgVoorServer() {
  if (await serverDraait()) return null;
  const server = spawn(process.execPath, [path.join(WORTEL, 'server.cjs')], { cwd: WORTEL, stdio: 'ignore' });
  for (let i = 0; i < 50 && !(await serverDraait()); i++) await new Promise((r) => setTimeout(r, 200));
  return server;
}

// Een vers spel zoals in de cameraproef, in een eigen context (geen gedeelde cache), en met de tekeningen in `plat` plat.
async function openSpel(browser, plat) {
  const context = await browser.newContext({ viewport: VENSTER });
  const page = await context.newPage();
  const fouten = [];
  page.on('pageerror', (e) => fouten.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') fouten.push(m.text()); });
  const verwisseld = new Set();
  await page.route('**/tegels/huizen/*.png*', (route) => {
    const naam = decodeURIComponent(new globalThis.URL(route.request().url()).pathname.split('/').pop()).replace(/\.png$/, '');
    if (!plat.has(naam)) return route.continue();
    verwisseld.add(naam);
    return route.fulfill({ contentType: 'image/png', body: fs.readFileSync(path.join(PLAT, `${naam}.png`)) });
  });
  await page.addInitScript(() => {
    let n = 11;
    Math.random = () => (n = (n * 16807) % 2147483647) / 2147483647;
    window.requestAnimationFrame = () => 0;
  });
  await page.goto(URL + '?kaart=gehucht');
  await page.waitForFunction(() => globalThis.Spel && Spel.S && Spel.S.kalender && Spel.debug && Spel.sprites, null, { polling: 100 });
  await page.waitForFunction(() => Spel.sprites.aan && Spel.sprites.buitenAan, null, { polling: 100, timeout: 60000 });
  await page.addScriptTag({ path: path.join(WORTEL, 'gereedschap', 'grootte', 'pagina.js') });
  await page.evaluate(() => { Spel.zetOptie('tekenen', 'met'); Spel.TEKENEN_INSTELLINGEN.ookOpDeProcessor = true; });
  return { page, context, fouten, verwisseld };
}

// Het dorp neerzetten op een leeg stuk van het eiland, zoals de cameraproef (zonder draai).
const zetDorp = (page) => page.evaluate(([dorp, midden, uur]) => {
  const T = Spel;
  const S = T.S;
  const D = S.dorp;
  const w = D.wereld;
  const vuur = D.plek.kamp.vuur;
  const sx = Math.floor(vuur.x / T.STUK) + 4;
  const sy = Math.floor(vuur.y / T.STUK);
  const x0 = sx * T.STUK;
  const y0 = sy * T.STUK;
  const M = { x: x0 + T.STUK / 2, y: y0 + T.STUK / 2 };
  const plek = (p) => ({ x: M.x + p.x - midden.x, y: M.y + p.y - midden.y });
  const gras = T.TEGELS.rand.tiles.map((t, i) => (t && t.naam === 'gras' && t.groep === 'vlak' ? i + 1 : 0)).filter(Boolean);
  for (let y = y0; y < y0 + T.STUK; y++) {
    for (let x = x0; x < x0 + T.STUK; x++) {
      let h = (Math.imul(x - M.x + 100, 374761393) + Math.imul(y - M.y + 100, 668265263)) | 0;
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      const nr = T.tegelNummer(x, y);
      w.grondAnders.set(nr, gras[((h ^ (h >>> 16)) >>> 0) % gras.length]);
      w.gerooid.add(nr);
    }
  }
  T.openVak(w, { x: x0, y: y0, b: T.STUK, h: T.STUK });
  const vreemd = T.voorwerpenIn(w, { x: x0, y: y0, b: T.STUK, h: T.STUK }).length;
  w.vak = { x: x0, y: y0, b: T.STUK, h: T.STUK };
  for (const t of dorp.weg) {
    const p = plek(t);
    T.legWegTegel(w, p.x, p.y);
  }
  const gebouwen = dorp.gebouwen.map((g) => {
    const tekening = `huizen/${g.tekening}`;
    const voet = T.gebouwVoet(g.soort, tekening);
    const a = plek(g);
    const inst = { soort: g.soort, x: a.x, y: a.y, tekening, voet, klaar: true, klaarOp: 0, handen: 0, voorwerp: null };
    T.bouwGebouw(D, inst);
    const deur = T.deurVan(null, inst);
    return { naam: g.naam, tekening: g.tekening, x: inst.x, y: inst.y, voet, deur, inst };
  });
  const bomen = dorp.bomen.map((b) => {
    const p = plek(b);
    const v = T.maakVoorwerp(T.opzoekTegelNaam(`bomen/${b.soort}`), p.x, p.y);
    v.id = b.id;
    T.zetVoorwerp(w, v);
    return { soort: b.soort, id: b.id, x: p.x, y: p.y, v };
  });
  const wie = D.bewoners.mensen.filter((p) => !p.aanvoerder && p.leeftijd === 'volwassen').slice(0, dorp.mensen.length);
  if (wie.length < dorp.mensen.length) throw new Error(`maar ${wie.length} volwassenen`);
  const mensen = dorp.mensen.map((m, i) => {
    const b = wie[i];
    const p = plek(m);
    const L = T.LEEFTIJDEN[b.leeftijd];
    const e = T.maakDorpeling(b.id, p.x, p.y, 0);
    Object.assign(e, { soort: 'bewoner', zaad: null, vel: L[b.geslacht] || L.man, naam: b.naam, bewoner: b, dorp: D, kijkt: plek(m.kijkt) });
    delete b.komt;
    b.wezen = e;
    w.wezens.push(e);
    if (b.uiterlijk == null) b.uiterlijk = T.kiesUiterlijk(D, b);
    return { naam: m.naam, wie: b.naam, x: p.x, y: p.y, e };
  });
  window.__proef = { gebouwen, bomen, mensen, M };
  Spel.debug.geenMist = true;
  Spel.debug.uur(uur);
  S.foto = true;
  S.zoom = 1;
  Meet.cameraOp(M.x, M.y);
  if (S.grond) S.grond.sleutel = '';
  return {
    M, stuk: [sx, sy], vreemd,
    gebouwen: gebouwen.map(({ inst, ...g }) => g),
    mensen: mensen.map(({ e, ...m }) => m),
    weg: dorp.weg.map(plek),
  };
}, [DORP, MIDDEN, UUR]);

// Tekenen tot alle plaatjes er zijn, en dan het doek als PNG (zoals de cameraproef).
async function afdruk(page) {
  for (let i = 0; i < 120; i++) {
    await page.evaluate(() => Spel.debug.stap(0));
    if (i > 2 && (await page.evaluate(() => Spel.sprites.bezig() === 0))) break;
    await page.waitForTimeout(50);
  }
  await page.evaluate(() => Spel.debug.stap(0));
  const data = await page.evaluate(() => Spel.debug.beeld().toDataURL('image/png'));
  return Buffer.from(data.slice(data.indexOf(',') + 1), 'base64');
}

const zetZichtbaar = (page, wat, i, aan) => page.evaluate(([wat, i, aan]) => {
  const T = Spel;
  const w = T.S.dorp.wereld;
  const P = window.__proef;
  const voorwerp = (v) => {
    const er = w.voorwerpen.includes(v);
    if (aan && !er) T.zetVoorwerp(w, v);
    if (!aan && er) T.haalVoorwerpWeg(w, v);
  };
  if (wat === 'gebouw' || wat === 'alles') for (const [j, g] of P.gebouwen.entries()) if (wat === 'alles' || j === i) voorwerp(g.inst.voorwerp);
  if (wat === 'bomen' || wat === 'alles') for (const b of P.bomen) voorwerp(b.v);
  if (wat === 'mens' || wat === 'alles') for (const [j, m] of P.mensen.entries()) if (wat === 'alles' || j === i) m.e.binnen = !aan;
  if (T.S.grond) T.S.grond.sleutel = '';
}, [wat, i, aan]);

const schaduwen = (page, aan) => page.evaluate((aan) => { Spel.zetOptie('schaduwen', aan ? 'zon' : 'uit'); }, aan);

const opHetDoek = (page, punten) => page.evaluate((punten) => {
  const f = Spel.tekenMaat().b / innerWidth;
  return punten.map(([x, y]) => {
    const p = Spel.debug.naarBeeld(x, y);
    return [Math.round(p.x * f), Math.round(p.y * f)];
  });
}, punten);

function verschil(a, b) {
  const m = new Uint8Array(a.b * a.h);
  for (let i = 0, j = 0; j < m.length; i += 4, j++) {
    if (a.rgba[i] !== b.rgba[i] || a.rgba[i + 1] !== b.rgba[i + 1] || a.rgba[i + 2] !== b.rgba[i + 2]) m[j] = 1;
  }
  return m;
}
const tel = (m) => m.reduce((s, v) => s + v, 0);
function doosVan(m, b) {
  let [x1, y1, x2, y2] = [Infinity, Infinity, -Infinity, -Infinity];
  for (let j = 0; j < m.length; j++) {
    if (!m[j]) continue;
    const x = j % b;
    const y = (j - x) / b;
    if (x < x1) x1 = x;
    if (x > x2) x2 = x;
    if (y < y1) y1 = y;
    if (y > y2) y2 = y;
  }
  return [x1, y1, x2, y2];
}
function tegelPixels([cx, cy], b) {
  const uit = [];
  for (let dy = -4; dy <= 4; dy++) for (let dx = -8; dx <= 8; dx++) if (Math.abs(dx) / 8 + Math.abs(dy) / 4 <= 1) uit.push((cy + dy) * b + cx + dx);
  return uit;
}
function knip(beeld, [x, y, b, h]) {
  const rgba = Buffer.alloc(b * h * 4);
  for (let r = 0; r < h; r++) beeld.rgba.copy(rgba, r * b * 4, ((y + r) * beeld.b + x) * 4, ((y + r) * beeld.b + x + b) * 4);
  return { b, h, rgba };
}

// Meten zoals de cameraproef: elk ding alleen op het lege land (wat het is) en het dorp zonder dat ding (wat ervan te
// zien is), zonder schaduwen. Geeft ook de maskers terug, zodat C weet wie wat afdekt.
async function meet(page, info) {
  await schaduwen(page, false);
  const vol = K.leesPng(await afdruk(page));
  await zetZichtbaar(page, 'alles', -1, false);
  const leeg = K.leesPng(await afdruk(page));
  const dingen = [
    ...info.gebouwen.map((g, i) => ({ wat: 'gebouw', i, naam: g.naam })),
    ...info.mensen.map((m, i) => ({ wat: 'mens', i, naam: m.naam })),
    { wat: 'bomen', i: -1, naam: 'de bomen' },
  ];
  for (const d of dingen) {
    await zetZichtbaar(page, d.wat, d.i, true);
    d.alleen = verschil(K.leesPng(await afdruk(page)), leeg);
    await zetZichtbaar(page, d.wat, d.i, false);
  }
  await zetZichtbaar(page, 'alles', -1, true);
  for (const d of dingen) {
    await zetZichtbaar(page, d.wat, d.i, false);
    d.zichtbaar = verschil(vol, K.leesPng(await afdruk(page)));
    await zetZichtbaar(page, d.wat, d.i, true);
  }
  await schaduwen(page, true);
  const b = vol.b;
  const uit = { dingen: [], deuren: [], weg: null };
  for (const d of dingen) {
    const heel = tel(d.alleen);
    let zien = 0;
    for (let j = 0; j < d.alleen.length; j++) if (d.alleen[j] && d.zichtbaar[j]) zien++;
    const door = {};
    for (const e of dingen) {
      if (e === d) continue;
      let n = 0;
      for (let j = 0; j < d.alleen.length; j++) if (d.alleen[j] && !d.zichtbaar[j] && e.zichtbaar[j]) n++;
      if (n > heel * DREMPEL) door[e.naam] = Math.round((n / heel) * 100);
    }
    uit.dingen.push({ naam: d.naam, wat: d.wat, i: d.i, pixels: heel, zichtbaar: zien, procent: heel ? Math.round((zien / heel) * 100) : null, afgedektDoor: door });
  }
  const vrij = (punt) => {
    const px = tegelPixels(punt, b);
    let n = 0;
    for (const j of px) {
      const i = j * 4;
      if (vol.rgba[i] === leeg.rgba[i] && vol.rgba[i + 1] === leeg.rgba[i + 1] && vol.rgba[i + 2] === leeg.rgba[i + 2]) n++;
    }
    return n / px.length;
  };
  const deurPunten = await opHetDoek(page, info.gebouwen.map((g) => [g.deur.x, g.deur.y]));
  info.gebouwen.forEach((g, i) => uit.deuren.push({ naam: g.naam, procent: Math.round(vrij(deurPunten[i]) * 100) }));
  const perTegel = (await opHetDoek(page, info.weg.map((t) => [t.x, t.y]))).map(vrij);
  uit.weg = { tegels: perTegel.length, procent: Math.round((perTegel.reduce((s, v) => s + v, 0) / perTegel.length) * 100), helemaalWeg: perTegel.filter((v) => v < 0.1).length };
  const alles = new Uint8Array(vol.b * vol.h);
  for (const d of dingen) for (let j = 0; j < alles.length; j++) if (d.alleen[j]) alles[j] = 1;
  uit.doos = doosVan(alles, b);
  return { uit, dingen };
}

// Een weergave: een vers spel met de tekeningen in `plat` plat, het dorp, een afdruk en de metingen.
async function speel(browser, sleutel, plat) {
  const { page, context, fouten, verwisseld } = await openSpel(browser, plat);
  const info = await zetDorp(page);
  const png = await afdruk(page);
  const [midden, ...mensen] = await opHetDoek(page, [[info.M.x, info.M.y], ...info.mensen.map((m) => [m.x, m.y])]);
  const { uit, dingen } = await meet(page, info);
  await context.close();
  const mist = [...plat].filter((n) => !verwisseld.has(n));
  if (mist.length) throw new Error(`${sleutel}: niet verwisseld: ${mist.join(', ')}`);
  console.log(`${sleutel}: ${plat.size} plat; fouten: ${fouten.length}`);
  return { sleutel, plat: [...plat], info, beeld: K.leesPng(png), midden, mensen, meting: uit, dingen: sleutel === 'A' ? dingen : null, fouten };
}

// Staat gebouw R vóór (dichter bij de camera, die uit het zuidoosten kijkt) rechthoek T? Een inwoner is een rechthoek
// van één tegel.
function staatVoor(R, T) {
  const [r0, r1, s0, s1] = [R.x, R.x + R.b - 1, R.y, R.y + R.h - 1];
  const [t0, t1, u0, u1] = [T.x, T.x + T.b - 1, T.y, T.y + T.h - 1];
  return (r0 > t1 && s1 >= u0) || (s0 > u1 && r1 >= t0);
}
// Wie het zicht neemt op ding d (een gebouw of een inwoner) in weergave A: elk gebouw dat een deel ervan afdekt (in de
// pixels: waar d is maar niet te zien) en ervoor staat.
function wieNeemtHetZicht(A, d) {
  const doel = A.dingen.find((x) => x.wat === d.wat && x.i === d.i);
  const heel = tel(doel.alleen);
  const rechthoek = (x) => (x.wat === 'mens' ? { x: A.info.mensen[x.i].x, y: A.info.mensen[x.i].y, b: 1, h: 1 }
    : { x: A.info.gebouwen[x.i].x, y: A.info.gebouwen[x.i].y, b: A.info.gebouwen[x.i].voet.b, h: A.info.gebouwen[x.i].voet.h });
  const T = rechthoek(doel);
  const uit = [];
  for (const e of A.dingen) {
    if (e.wat !== 'gebouw' || e === doel) continue;
    let n = 0;
    for (let j = 0; j < doel.alleen.length; j++) if (doel.alleen[j] && !doel.zichtbaar[j] && e.alleen[j]) n++;
    if (n > heel * DREMPEL && staatVoor(rechthoek(e), T)) uit.push(A.info.gebouwen[e.i].tekening);
  }
  return uit;
}

const TITELS = {
  A: ['A · gewoon', 'elk gebouw met zijn dak, zoals het spel nu tekent'],
  B: ['B · alle gebouwen plat', 'zonder dak, de muren tot de heup, de vloer in de kleur van het dak'],
  C1: ['C · plat wat het zicht neemt op een inwoner', ''],
  C2: ['C · plat wat het zicht neemt op een gebouw', ''],
};

// De vergelijkingsplaat: de vier in een raster van twee bij twee, met de titel en de getallen erboven, in de letters van
// het spel. Het gekozene staat met een dunne stippellijn aangegeven (een aantekening van de proef, niet van het spel).
async function maakPlaat(browser, beelden) {
  const page = await browser.newPage();
  const letter = (n) => fs.readFileSync(path.join(WORTEL, 'letters', n)).toString('base64');
  await page.setContent(`<style>@font-face{font-family:Alegreya;src:url(data:font/woff2;base64,${letter('alegreya.woff2')})}
    @font-face{font-family:Grenze;src:url(data:font/woff2;base64,${letter('grenze.woff2')})}</style><p style="font-family:Grenze">a</p><p style="font-family:Alegreya">a</p>`);
  await page.evaluate(async () => { await document.fonts.ready; });
  const data = await page.evaluate(async ({ beelden }) => {
    const laad = (src) => new Promise((klaar) => { const i = new Image(); i.onload = () => klaar(i); i.src = src; });
    const imgs = await Promise.all(beelden.map((b) => laad(b.src)));
    const [B, H] = [imgs[0].width, imgs[0].height];
    const KOP = 104;
    const RAND = 28;
    const c = document.createElement('canvas');
    c.width = RAND + 2 * (B + RAND);
    c.height = RAND + 2 * (KOP + H + RAND);
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.fillStyle = '#f7f0e1';
    g.fillRect(0, 0, c.width, c.height);
    beelden.forEach((b, i) => {
      const x = RAND + (i % 2) * (B + RAND);
      const y = RAND + Math.floor(i / 2) * (KOP + H + RAND);
      g.fillStyle = '#7a2022';
      g.font = '46px Grenze';
      g.fillText(b.titel, x, y + 44);
      g.fillStyle = '#5a4430';
      g.font = 'italic 26px Alegreya';
      g.fillText(b.onder, x, y + 82);
      g.drawImage(imgs[i], x, y + KOP);
      g.strokeStyle = '#b9a37f';
      g.lineWidth = 1;
      g.strokeRect(x - 0.5, y + KOP - 0.5, B + 1, H + 1);
      for (const [px, py] of b.merk) {
        g.save();
        g.strokeStyle = 'rgba(255, 236, 170, 0.9)';
        g.setLineDash([5, 4]);
        g.lineWidth = 2;
        g.beginPath();
        g.ellipse(x + px, y + KOP + py, 26, 13, 0, 0, Math.PI * 2);
        g.stroke();
        g.restore();
      }
    });
    return c.toDataURL('image/png');
  }, { beelden: beelden.map((b) => ({ titel: b.titel, onder: b.onder, merk: b.merk, src: 'data:image/png;base64,' + b.png.toString('base64') })) });
  await page.close();
  return Buffer.from(data.slice(data.indexOf(',') + 1), 'base64');
}

// Samenvatting van een meting, voor de plaat en het verslag.
function samenvatting(w) {
  const mensen = w.meting.dingen.filter((d) => d.wat === 'mens');
  const gebouwen = w.meting.dingen.filter((d) => d.wat === 'gebouw');
  return {
    inwonersGoed: mensen.filter((d) => d.procent >= GOED).length,
    inwoners: mensen.length,
    inwonersGemiddeld: Math.round(mensen.reduce((s, d) => s + d.procent, 0) / mensen.length),
    gebouwenGemiddeld: Math.round(gebouwen.reduce((s, d) => s + d.procent, 0) / gebouwen.length),
    deurenVrij: w.meting.deuren.filter((d) => d.procent >= GOED).length,
    deuren: w.meting.deuren.length,
    weg: w.meting.weg.procent,
    wegWeg: w.meting.weg.helemaalWeg,
    wegTegels: w.meting.weg.tegels,
  };
}

(async () => {
  for (const g of DORP.gebouwen) if (!fs.existsSync(path.join(PLAT, `${g.tekening}.png`))) throw new Error(`geen platte ${g.tekening}: eerst plat.cjs`);
  const server = await zorgVoorServer();
  const { chromium } = laadPlaywright();
  const browser = await chromium.launch();
  const commit = execSync('git rev-parse --short HEAD', { cwd: WORTEL, encoding: 'utf8' }).trim();
  const verslag = { commit, uur: UUR, venster: VENSTER, dorp: DORP, weergaven: [] };
  try {
    const A = await speel(browser, 'A', new Set());
    const B = await speel(browser, 'B', new Set(DORP.gebouwen.map((g) => g.tekening)));
    // C1: de eerste inwoner (in de straat); C2: het gebouw dat in A het slechtst te zien is
    const mens = { wat: 'mens', i: 0 };
    const slechtst = A.meting.dingen.filter((d) => d.wat === 'gebouw').sort((a, b) => a.procent - b.procent)[0];
    const gebouw = { wat: 'gebouw', i: slechtst.i };
    const C1 = await speel(browser, 'C1', new Set(wieNeemtHetZicht(A, mens)));
    const C2 = await speel(browser, 'C2', new Set(wieNeemtHetZicht(A, gebouw)));
    const naamVan = (t) => DORP.gebouwen.find((g) => g.tekening === t).naam;
    const weergaven = [A, B, C1, C2];
    TITELS.C1[1] = `gekozen: de inwoner ${DORP.mensen[0].naam}; plat: ${C1.plat.map(naamVan).join(', ') || 'niets'}`;
    TITELS.C2[1] = `gekozen: ${slechtst.naam} (in A ${slechtst.procent}% te zien); plat: ${C2.plat.map(naamVan).join(', ') || 'niets'}`;

    // één uitsnede voor alle vier: wat er in een van de vier staat, om het midden
    let [x1, y1, x2, y2] = [Infinity, Infinity, -Infinity, -Infinity];
    for (const w of weergaven) {
      const d = w.meting.doos;
      x1 = Math.min(x1, d[0] - w.midden[0]);
      y1 = Math.min(y1, d[1] - w.midden[1]);
      x2 = Math.max(x2, d[2] - w.midden[0]);
      y2 = Math.max(y2, d[3] - w.midden[1]);
    }
    const rand = [x1 - MARGE, y1 - MARGE, x2 + MARGE, y2 + MARGE];
    const beelden = [];
    for (const w of weergaven) {
      const vak = [w.midden[0] + rand[0], w.midden[1] + rand[1], rand[2] - rand[0] + 1, rand[3] - rand[1] + 1];
      if (vak[0] < 0 || vak[1] < 0 || vak[0] + vak[2] > w.beeld.b || vak[1] + vak[3] > w.beeld.h) throw new Error(`de uitsnede valt buiten het doek: ${vak}`);
      const png = K.pngVanBeeld(knip(w.beeld, vak));
      fs.writeFileSync(path.join(__dirname, `zicht_${w.sleutel}.png`), png);
      const s = samenvatting(w);
      const getallen = `inwoners goed te zien ${s.inwonersGoed} van ${s.inwoners} · straat vrij ${s.weg}% · deuren te zien ${s.deurenVrij} van ${s.deuren}`;
      // het gekozene aangeven: de eerste inwoner in A, B en C1, het gekozen gebouw (zijn deur) in C2
      const merkTegel = w.sleutel === 'C2' ? null : w.mensen[0];
      beelden.push({
        png, titel: TITELS[w.sleutel][0], onder: `${TITELS[w.sleutel][1] ? TITELS[w.sleutel][1] + ' — ' : ''}${getallen}`,
        merk: merkTegel ? [[merkTegel[0] - vak[0], merkTegel[1] - vak[1]]] : [],
      });
      verslag.weergaven.push({
        sleutel: w.sleutel, titel: TITELS[w.sleutel], plat: w.plat, samenvatting: s, stuk: w.info.stuk, vreemd: w.info.vreemd,
        gebouwen: w.info.gebouwen, mensen: w.info.mensen, ...w.meting, fouten: w.fouten,
      });
    }
    verslag.uitsnede = { tovMidden: rand, maat: [rand[2] - rand[0] + 1, rand[3] - rand[1] + 1] };
    verslag.gekozen = { inwoner: DORP.mensen[0].naam, gebouw: slechtst.naam };
    fs.writeFileSync(path.join(__dirname, 'zicht_vergelijking.png'), await maakPlaat(browser, beelden));
    fs.writeFileSync(path.join(__dirname, 'zichtbaarheid.json'), JSON.stringify(verslag, null, 1) + '\n');
    console.log(`uitsnede ${verslag.uitsnede.maat.join('×')}; in gereedschap/zichtproef/ (commit ${commit})`);
    for (const w of verslag.weergaven) {
      console.log(`\n${w.sleutel} ${w.titel[0]}${w.plat.length ? ` (plat: ${w.plat.length})` : ''}`);
      console.log(`  ${JSON.stringify(w.samenvatting)}`);
      for (const d of w.dingen) console.log(`  ${d.naam.padEnd(36)} ${String(d.procent).padStart(3)}% te zien${Object.keys(d.afgedektDoor).length ? `, achter: ${Object.entries(d.afgedektDoor).map(([n, p]) => `${n} ${p}%`).join(', ')}` : ''}`);
      for (const d of w.deuren) console.log(`  deur ${d.naam.padEnd(31)} ${String(d.procent).padStart(3)}% vrij`);
      console.log(`  straat: ${w.weg.procent}% vrij, ${w.weg.helemaalWeg} van ${w.weg.tegels} tegels helemaal weg`);
    }
  } finally {
    await browser.close();
    if (server) server.kill();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
