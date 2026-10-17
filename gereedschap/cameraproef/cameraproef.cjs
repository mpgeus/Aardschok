'use strict';
// De cameraproef: een klein dorp uit vier kanten, in kwartslagen (0°, 90°, 180° en 270°), om te zien of de camera
// draaien iets toevoegt (Marcel, 17 okt; vraag 124 was geparkeerd met "Is het echt iets wat iets toevoegd?"). Alleen een
// proef: het spel, de renderer en de kunst blijven zoals ze zijn, en alles van de proef staat in deze map.
//
//   node gereedschap/cameraproef/cameraproef.cjs
//
// Hoe: het spel draait zoals bij npm run schermen (de server van npm start, Chromium zonder spellus, een vaste reeks
// toeval, met de videokaart), en tekent alles zelf. Het spel kan de camera niet draaien, dus draait de proef de wereld:
// een kwartslag van de camera met de klok mee is dezelfde wereld een kwartslag tegen de klok in, met de zon op dezelfde
// plek van het scherm (de afspraak van 4 okt, ontwerp/beeld.md, "De draaibare huizen"). Elke stand is een vers spel
// (het lege begin), met op een leeg stuk van het eiland hetzelfde dorp, om het midden gedraaid: elke plek, elke voet,
// elke deur en elke blik een kwartslag verder, en elk huis in de stand met zijn deur naar de nieuwe kant
// (T.metDeurNaar-namen: -z, -o, -n, -w). Een boom heeft maar één aanzicht: hij blijft dezelfde tekening, op zijn
// gedraaide plek (niet gespiegeld, niet vervormd).
//
// Uit (in deze map): camera_000.png tot camera_270.png (dezelfde uitsnede, op ware pixels), camera_vergelijking.png
// (de vier in een raster van twee bij twee), en zichtbaarheid.json: per stand hoeveel van elk huis en elke inwoner te
// zien is, wie wie afdekt, en hoeveel van elke deur en van de weg. Dat meet het door het dorp zonder schaduwen nog eens
// te tekenen, met en zonder elk ding (de pixels die veranderen, zijn van dat ding).
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { execSync, spawn } = require('node:child_process');

const WORTEL = path.join(__dirname, '..', '..');
const K = require(path.join(WORTEL, 'gereedschap', 'pixelart', 'kern.cjs'));
const URL = 'http://localhost:8123/';
const VENSTER = { width: 1900, height: 1400 };
const UUR = 10; // een ochtend: de schaduwen vallen lang genoeg om te zien
const MARGE = 40; // pixels om wat er staat, voor de schaduwen
const STANDEN = [0, 90, 180, 270];
const VANUIT = { 0: 'vanuit het zuidoosten (de stand van het spel)', 90: 'vanuit het zuidwesten', 180: 'vanuit het noordwesten', 270: 'vanuit het noordoosten' };

// Het dorp, in tegels om het midden (de stand van het spel, 0°). Een gebouw zegt de tekening zonder kant, de kant van
// zijn deur, en de achterste tegel van zijn voet in die stand. Allemaal in de stijl van dit eiland (planken: spanen),
// en elk in alle vier de standen getekend (tegels/huizen/).
const MIDDEN = { x: 2, y: 0 };
const DORP = {
  gebouwen: [
    { naam: 'herberg', soort: 'herberg', tekening: 'planken-herberg1-spanen', kant: 'n', x: -3, y: 1 },
    { naam: 'hut aan de weg', soort: 'hut', tekening: 'planken-hut1-spanen', kant: 'z', x: -2, y: -4 },
    { naam: 'hut in het westen', soort: 'hut', tekening: 'planken-hut4-spanen', kant: 'z', x: -12, y: -6 },
    { naam: 'boerderij', soort: 'boerderij', tekening: 'planken-boerderij2-spanen', kant: 'z', x: 6, y: -8 },
  ],
  // De weg langs de deuren (y = 0), en een zijweg naar het zuiden langs de herberg.
  weg: [
    ...Array.from({ length: 29 }, (_, i) => ({ x: -13 + i, y: 0 })),
    ...Array.from({ length: 7 }, (_, i) => ({ x: -6, y: 1 + i })),
  ],
  // Een boom: zijn soort, en welke van zijn tekeningen (niet de eerste: die kiest het spel naar de plek, en die verandert).
  bomen: [
    { soort: 'eik', id: 16, x: -9, y: -9 }, { soort: 'beuk', id: 35, x: -4, y: -8 }, { soort: 'linde', id: 39, x: 3, y: -8 },
    { soort: 'den', id: 21, x: 16, y: -6 }, { soort: 'berk', id: 24, x: 17, y: -2 }, { soort: 'eik', id: 17, x: 10, y: 4 },
    { soort: 'els', id: 42, x: 13, y: 6 }, { soort: 'populier', id: 45, x: -10, y: 4 }, { soort: 'hazelaar', id: 57, x: -9, y: 8 },
    { soort: 'groveDen', id: 51, x: 4, y: 11 }, { soort: 'meidoorn', id: 54, x: -1, y: -10 },
  ],
  // Vier inwoners: waar ze staan en waar ze naar kijken.
  mensen: [
    { naam: 'op de weg tussen herberg en hut', x: 1, y: 0, kijkt: { x: -5, y: 0 } },
    { naam: 'achter de hut', x: 0, y: -6, kijkt: { x: 0, y: -12 } },
    { naam: 'bij de deur van de boerderij', x: 10, y: 1, kijkt: { x: 13, y: 4 } },
    { naam: 'op de zijweg', x: -6, y: 5, kijkt: { x: -6, y: 11 } },
  ],
};

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

// Een vers spel: het lege begin, zonder spellus, met een vaste reeks toeval en met de videokaart (zoals npm run schermen
// -- --tekenen met).
async function openSpel(browser) {
  const page = await browser.newPage({ viewport: VENSTER });
  const fouten = [];
  page.on('pageerror', (e) => fouten.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') fouten.push(m.text()); });
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
  return { page, fouten };
}

// Het dorp neerzetten, `stand` graden gedraaid. Geeft wat er staat en waar.
const zetDorp = (page, stand) => page.evaluate(([dorp, midden, stand, uur]) => {
  const T = Spel;
  const S = T.S;
  const D = S.dorp;
  const w = D.wereld;
  const k = stand / 90;
  // Een leeg stuk van het eiland, vier stukken (256 tegels) ten oosten van het kamp: nog niet open en niet gemaakt.
  const vuur = D.plek.kamp.vuur;
  const sx = Math.floor(vuur.x / T.STUK) + 4;
  const sy = Math.floor(vuur.y / T.STUK);
  const x0 = sx * T.STUK;
  const y0 = sy * T.STUK;
  const M = { x: x0 + T.STUK / 2, y: y0 + T.STUK / 2 };
  // De camera een kwartslag met de klok mee is de wereld een kwartslag tegen de klok in: (dx, dy) wordt (dy, -dx).
  const draai = (dx, dy, n = k) => {
    for (let i = 0; i < n; i++) [dx, dy] = [dy, -dx];
    return [dx, dy];
  };
  const plek = (p) => {
    const [dx, dy] = draai(p.x - midden.x, p.y - midden.y);
    return { x: M.x + dx, y: M.y + dy };
  };
  // De grond: overal gras, en welk gras zegt de tegel in de stand van het spel (zodat het gras meedraait); niets van het
  // eiland erop (w.gerooid). Pas dan gaat het stuk open, en wordt het gemaakt.
  const gras = T.TEGELS.rand.tiles.map((t, i) => (t && t.naam === 'gras' && t.groep === 'vlak' ? i + 1 : 0)).filter(Boolean);
  for (let y = y0; y < y0 + T.STUK; y++) {
    for (let x = x0; x < x0 + T.STUK; x++) {
      const [ax, ay] = draai(x - M.x, y - M.y, (4 - k) % 4);
      let h = (Math.imul(ax + 100, 374761393) + Math.imul(ay + 100, 668265263)) | 0;
      h = Math.imul(h ^ (h >>> 13), 1274126177);
      const nr = T.tegelNummer(x, y);
      w.grondAnders.set(nr, gras[((h ^ (h >>> 16)) >>> 0) % gras.length]);
      w.gerooid.add(nr);
    }
  }
  T.openVak(w, { x: x0, y: y0, b: T.STUK, h: T.STUK });
  const vreemd = T.voorwerpenIn(w, { x: x0, y: y0, b: T.STUK, h: T.STUK }).length;
  const geenGras = [];
  for (let y = y0; y < y0 + T.STUK; y += 7) for (let x = x0; x < x0 + T.STUK; x += 7) if ((T.grondOp(w, x, y) || {}).naam !== 'gras') geenGras.push([x, y]);

  // Een weg die je legt, ligt in het zand van het vak om het dorp (T.kaartVak, T.zandHoeken in js/paden.js): het vak
  // van de kaart wordt hier het proefstuk.
  w.vak = { x: x0, y: y0, b: T.STUK, h: T.STUK };
  for (const t of dorp.weg) {
    const p = plek(t);
    T.legWegTegel(w, p.x, p.y);
  }
  const KANTEN = ['z', 'o', 'n', 'w'];
  const gebouwen = dorp.gebouwen.map((g) => {
    const kant = KANTEN[(KANTEN.indexOf(g.kant) + k) % 4];
    const tekening = `huizen/${g.tekening}-${kant}`;
    const voet0 = T.gebouwVoet(g.soort, `huizen/${g.tekening}-${g.kant}`);
    const a = plek({ x: g.x, y: g.y });
    const b = plek({ x: g.x + voet0.b - 1, y: g.y + voet0.h - 1 });
    const voet = T.gebouwVoet(g.soort, tekening);
    const inst = { soort: g.soort, x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), tekening, voet, klaar: true, klaarOp: 0, handen: 0, voorwerp: null };
    const past = voet.b === Math.abs(a.x - b.x) + 1 && voet.h === Math.abs(a.y - b.y) + 1;
    T.bouwGebouw(D, inst);
    const deur = T.deurVan(null, inst);
    return { naam: g.naam, tekening, kant, x: inst.x, y: inst.y, voet, past, deur, inst };
  });
  const bomen = dorp.bomen.map((b) => {
    const p = plek(b);
    const opz = T.opzoekTegelNaam(`bomen/${b.soort}`);
    const v = T.maakVoorwerp(opz, p.x, p.y);
    v.id = b.id;
    T.zetVoorwerp(w, v);
    return { soort: b.soort, id: b.id, x: p.x, y: p.y, v };
  });
  // De inwoners: de eerste vier volwassenen van de huifkar. Op dit uur zitten ze er nog op (p.komt), dus krijgen ze hier
  // hun poppetje zoals het spel het ze geeft als ze aankomen (maakPoppetje in js/bewoners.js), op hun plek in het dorp.
  const wie = D.bewoners.mensen.filter((p) => !p.aanvoerder && p.leeftijd === 'volwassen').slice(0, dorp.mensen.length);
  if (wie.length < dorp.mensen.length) throw new Error(`maar ${wie.length} volwassenen`); // geen tekst
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
  S.foto = true; // geen ui op het doek
  S.zoom = 1; // ware pixels: één pixel van de kunst op één pixel van het doek
  Meet.cameraOp(M.x, M.y);
  if (S.grond) S.grond.sleutel = '';
  return {
    M, stuk: [sx, sy], vreemd, geenGras: geenGras.length, maat: T.tekenMaat(),
    gebouwen: gebouwen.map(({ inst, ...g }) => g),
    bomen: bomen.map(({ v, ...b }) => b),
    mensen: mensen.map(({ e, ...m }) => m),
  };
}, [DORP, MIDDEN, stand, UUR]);

// Tekenen tot alle plaatjes er zijn, en dan het doek als PNG (zoals npm run schermen).
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

// Wat er te zien is van `wat` ('gebouw', 'mens', 'bomen' of 'alles'), aan of uit, voor de metingen.
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

// Waar tegel (x, y) op het doek ligt (het midden van zijn ruit), in pixels van het doek.
const opHetDoek = (page, punten) => page.evaluate((punten) => {
  const f = Spel.tekenMaat().b / innerWidth;
  return punten.map(([x, y]) => {
    const p = Spel.debug.naarBeeld(x, y);
    return [Math.round(p.x * f), Math.round(p.y * f)];
  });
}, punten);

// Een masker: welke pixels anders zijn tussen twee afdrukken van dezelfde maat.
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
// De kern van een tegel op het doek: de pixels binnen de halve ruit om zijn midden (16 bij 8 pixels).
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

async function meetStand(page, stand, info) {
  const P = info;
  await schaduwen(page, false);
  const vol = K.leesPng(await afdruk(page));
  await zetZichtbaar(page, 'alles', -1, false);
  const leeg = K.leesPng(await afdruk(page));
  // Alleen: elk ding op het lege land (wat het is). Zonder: het hele dorp zonder dat ding (wat ervan te zien is).
  const dingen = [
    ...P.gebouwen.map((g, i) => ({ wat: 'gebouw', i, naam: g.naam })),
    ...P.mensen.map((m, i) => ({ wat: 'mens', i, naam: m.naam })),
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
  const uit = { stand, dingen: [], deuren: [], weg: null };
  for (const d of dingen) {
    const heel = tel(d.alleen);
    let zien = 0;
    for (let j = 0; j < d.alleen.length; j++) if (d.alleen[j] && d.zichtbaar[j]) zien++;
    // Wie dekt af: van de pixels die het ding heeft maar niet laat zien, welke andere dingen daar staan.
    const door = {};
    for (const e of dingen) {
      if (e === d) continue;
      let n = 0;
      for (let j = 0; j < d.alleen.length; j++) if (d.alleen[j] && !d.zichtbaar[j] && e.zichtbaar[j]) n++;
      if (n > heel * 0.02) door[e.naam] = Math.round((n / heel) * 100);
    }
    uit.dingen.push({ naam: d.naam, wat: d.wat, pixels: heel, zichtbaar: zien, procent: heel ? Math.round((zien / heel) * 100) : null, afgedektDoor: door });
  }
  // De deuren en de weg: hoeveel van de kern van hun tegel er nog is zoals op het lege land.
  const vrij = (punt) => {
    const px = tegelPixels(punt, b);
    let n = 0;
    for (const j of px) {
      const i = j * 4;
      if (vol.rgba[i] === leeg.rgba[i] && vol.rgba[i + 1] === leeg.rgba[i + 1] && vol.rgba[i + 2] === leeg.rgba[i + 2]) n++;
    }
    return n / px.length;
  };
  const deurPunten = await opHetDoek(page, P.gebouwen.map((g) => [g.deur.x, g.deur.y]));
  P.gebouwen.forEach((g, i) => uit.deuren.push({ naam: g.naam, tegel: [g.deur.x, g.deur.y], procent: Math.round(vrij(deurPunten[i]) * 100) }));
  const wegPunten = await opHetDoek(page, P.weg.map((t) => [t.x, t.y]));
  const perTegel = wegPunten.map(vrij);
  uit.weg = { tegels: perTegel.length, procent: Math.round((perTegel.reduce((s, v) => s + v, 0) / perTegel.length) * 100), helemaalWeg: perTegel.filter((v) => v < 0.1).length };
  // Waar het dorp op het doek staat (alles samen), voor de uitsnede.
  const alles = new Uint8Array(vol.b * vol.h);
  for (const d of dingen) for (let j = 0; j < alles.length; j++) if (d.alleen[j]) alles[j] = 1;
  uit.doos = doosVan(alles, b);
  return uit;
}

// De vergelijkingsplaat: de vier in een raster van twee bij twee, met de hoek erboven, in de letters van het spel.
async function maakPlaat(browser, beelden) {
  const page = await browser.newPage();
  const letter = (n) => fs.readFileSync(path.join(WORTEL, 'letters', n)).toString('base64');
  await page.setContent(`<style>@font-face{font-family:Alegreya;src:url(data:font/woff2;base64,${letter('alegreya.woff2')})}
    @font-face{font-family:Grenze;src:url(data:font/woff2;base64,${letter('grenze.woff2')})}</style><p style="font-family:Grenze">a</p><p style="font-family:Alegreya">a</p>`);
  await page.evaluate(async () => { await document.fonts.ready; });
  const data = await page.evaluate(async ({ beelden, vanuit }) => {
    const laad = (src) => new Promise((klaar) => { const i = new Image(); i.onload = () => klaar(i); i.src = src; });
    const imgs = await Promise.all(beelden.map((b) => laad(b.src)));
    const [B, H] = [imgs[0].width, imgs[0].height];
    const KOP = 64;
    const RAND = 24;
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
      g.font = '40px Grenze';
      g.fillText(`camera ${String(b.stand).padStart(3, '0')} · ${b.stand}°`, x, y + 42);
      g.fillStyle = '#5a4430';
      g.font = 'italic 24px Alegreya';
      g.fillText(vanuit[b.stand], x + 330, y + 40);
      g.drawImage(imgs[i], x, y + KOP);
      g.strokeStyle = '#b9a37f';
      g.lineWidth = 1;
      g.strokeRect(x - 0.5, y + KOP - 0.5, B + 1, H + 1);
    });
    return c.toDataURL('image/png');
  }, { beelden: beelden.map((b) => ({ stand: b.stand, src: 'data:image/png;base64,' + b.png.toString('base64') })), vanuit: VANUIT });
  await page.close();
  return Buffer.from(data.slice(data.indexOf(',') + 1), 'base64');
}

(async () => {
  const server = await zorgVoorServer();
  const { chromium } = laadPlaywright();
  const browser = await chromium.launch();
  const commit = execSync('git rev-parse --short HEAD', { cwd: WORTEL, encoding: 'utf8' }).trim();
  const verslag = { commit, uur: UUR, venster: VENSTER, dorp: DORP, standen: [] };
  const beelden = [];
  try {
    for (const stand of STANDEN) {
      const { page, fouten } = await openSpel(browser);
      const info = await zetDorp(page, stand);
      info.weg = DORP.weg.map((t) => {
        const [dx, dy] = [t.x - MIDDEN.x, t.y - MIDDEN.y];
        let [a, b] = [dx, dy];
        for (let i = 0; i < stand / 90; i++) [a, b] = [b, -a];
        return { x: info.M.x + a, y: info.M.y + b };
      });
      const png = await afdruk(page);
      const [midden] = await opHetDoek(page, [[info.M.x, info.M.y]]);
      const meting = await meetStand(page, stand, info);
      beelden.push({ stand, beeld: K.leesPng(png), midden, doos: meting.doos });
      verslag.standen.push({ stand, vanuit: VANUIT[stand], stuk: info.stuk, vreemd: info.vreemd, geenGras: info.geenGras, maat: info.maat,
        gebouwen: info.gebouwen, mensen: info.mensen, ...meting, fouten });
      console.log(`${stand}°: ${info.gebouwen.map((g) => g.tekening.split('/')[1] + (g.past ? '' : ' (VOET PAST NIET)')).join(', ')}; fouten: ${fouten.length}`);
      await page.close();
    }
    // Eén uitsnede voor alle vier: alles wat er in een van de standen staat, om het midden van het dorp.
    let [x1, y1, x2, y2] = [Infinity, Infinity, -Infinity, -Infinity];
    for (const b of beelden) {
      x1 = Math.min(x1, b.doos[0] - b.midden[0]);
      y1 = Math.min(y1, b.doos[1] - b.midden[1]);
      x2 = Math.max(x2, b.doos[2] - b.midden[0]);
      y2 = Math.max(y2, b.doos[3] - b.midden[1]);
    }
    const rand = [x1 - MARGE, y1 - MARGE, x2 + MARGE, y2 + MARGE];
    for (const b of beelden) {
      const vak = [b.midden[0] + rand[0], b.midden[1] + rand[1], rand[2] - rand[0] + 1, rand[3] - rand[1] + 1];
      if (vak[0] < 0 || vak[1] < 0 || vak[0] + vak[2] > b.beeld.b || vak[1] + vak[3] > b.beeld.h) throw new Error(`de uitsnede valt buiten het doek: ${vak}`);
      b.png = K.pngVanBeeld(knip(b.beeld, vak));
      fs.writeFileSync(path.join(__dirname, `camera_${String(b.stand).padStart(3, '0')}.png`), b.png);
    }
    verslag.uitsnede = { tovMidden: rand, maat: [rand[2] - rand[0] + 1, rand[3] - rand[1] + 1] };
    fs.writeFileSync(path.join(__dirname, 'camera_vergelijking.png'), await maakPlaat(browser, beelden));
    fs.writeFileSync(path.join(__dirname, 'zichtbaarheid.json'), JSON.stringify(verslag, null, 1) + '\n');
    console.log(`uitsnede ${verslag.uitsnede.maat.join('×')}; beelden en zichtbaarheid.json in gereedschap/cameraproef/ (commit ${commit})`);
    for (const s of verslag.standen) {
      console.log(`\n${s.stand}° ${s.vanuit}`);
      for (const d of s.dingen) console.log(`  ${d.naam.padEnd(34)} ${String(d.procent).padStart(3)}% te zien${Object.keys(d.afgedektDoor).length ? `, achter: ${Object.entries(d.afgedektDoor).map(([n, p]) => `${n} ${p}%`).join(', ')}` : ''}`);
      for (const d of s.deuren) console.log(`  deur ${d.naam.padEnd(29)} ${String(d.procent).padStart(3)}% vrij`);
      console.log(`  weg: ${s.weg.procent}% vrij, ${s.weg.helemaalWeg} van ${s.weg.tegels} tegels helemaal weg`);
    }
  } finally {
    await browser.close();
    if (server) server.kill();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
