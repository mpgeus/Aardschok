// Het doek voor een beeld-AI in ComfyUI (werklijst vraag 180): wat de werkstroom van SD 1.5 (sd15.cjs) en die van SDXL
// (sdxl.cjs) delen, op hun eigen maat (`maak(W, H)`): onze render en onze lijnen op het doek, het antwoord ophalen, het
// masker en de controles, en de weg terug naar pixels. Tot 18 okt stond dit in sd15.cjs (Marcel: "Maak een aparte
// SDXL-workflow. Behoud de huidige SD 1.5-workflow volledig": zo blijft het daar letterlijk hetzelfde).
'use strict';
const K = require('../pixelart/kern.cjs');
const O = require('../pixelart/ossenkar.cjs');
const { windVoor } = require('../pixelart/heerstoet.cjs');
const A = require('./beeld-ai.cjs');

const MAGENTA = [255, 0, 255];
const RAND = 6; // zoveel pixels ruimte om het ding, zoals de leidraad van beeld-ai.cjs

function maak(W, H) {
  const PATROON = /^(wagen|lopen)-(zw|no)(?:-(\d))?$/;
  function stukVan(naam) {
    const m = PATROON.exec(naam);
    if (!m) throw new Error(`Geen leidraad met de naam ${naam} (wagen-zw, wagen-no, lopen-zw-0 ...).`);
    const kant = m[2].toUpperCase();
    const o = { lading: 'buit', bak: 'heer', wind: windVoor(kant), blink: 0, ...(m[1] === 'lopen' ? { houding: 'lopen', fase: Number(m[3]) / 8 } : {}) };
    // Het ruwe beeld (diepte, object, onderdeel, richting per pixel), voor de lijnen; en de plaat zoals het spel hem ziet.
    const B = new K.Beeld(O.CEL[0], O.CEL[1], O.ANKER[0], O.ANKER[1]);
    O.tekenOssenkar(B, o, kant);
    const plaat = O.beeld(o, kant);
    return { B, plaat, k: O.kader(plaat) };
  }

  // Hoe het kader (met RAND eromheen) op het doek van W × H valt: geschaald met behoud van verhouding, in het midden.
  function vlakVan(k) {
    const bw = k.x1 - k.x0 + 1 + 2 * RAND;
    const bh = k.y1 - k.y0 + 1 + 2 * RAND;
    const s = Math.min(W / bw, H / bh);
    const sw = Math.round(bw * s);
    const sh = Math.round(bh * s);
    return { x0: k.x0 - RAND, y0: k.y0 - RAND, bw, bh, s, sw, sh, ox: Math.floor((W - sw) / 2), oy: Math.floor((H - sh) / 2) };
  }
  // Een pixel van het doek op de plaat: [x, y] in de plaat, of null in de aanvulling.
  function opPlaat(V, X, Y) {
    if (X < V.ox || Y < V.oy || X >= V.ox + V.sw || Y >= V.oy + V.sh) return null;
    return [V.x0 + Math.min(V.bw - 1, Math.floor((X - V.ox) / V.s)), V.y0 + Math.min(V.bh - 1, Math.floor((Y - V.oy) / V.s))];
  }

  // Onze render op het doek (#FF00FF waar niets is), en het masker: waar onze render iets heeft.
  function renderOpDoek(st, V) {
    const rgba = st.plaat.rgba(null);
    const doek = A.leeg(W, H);
    const masker = new Uint8Array(W * H);
    for (let Y = 0; Y < H; Y++) for (let X = 0; X < W; X++) {
      const p = opPlaat(V, X, Y);
      const s = p && p[0] >= 0 && p[1] >= 0 && p[0] < st.plaat.b && p[1] < st.plaat.h ? (p[1] * st.plaat.b + p[0]) * 4 : -1;
      const i = Y * W + X;
      if (s >= 0 && rgba[s + 3] >= 128) {
        doek.rgba.set([rgba[s], rgba[s + 1], rgba[s + 2], 255], i * 4);
        masker[i] = 1;
      } else doek.rgba.set([...MAGENTA, 255], i * 4);
    }
    return { doek, masker };
  }

  // De lijnen uit ons 3D-model: wit op zwart, zoals een lineart-voorbewerking ze geeft. Een lijn ligt tussen twee buren als
  // er aan één kant niets is (de omtrek), of als ze bij een ander object of onderdeel horen, de diepte springt, of het vlak
  // een knik maakt. Op het doek een lijn van zo'n twee pixels langs de grens tussen de twee.
  function lijnenOpDoek(st, V) {
    const B = st.B;
    const leeg = (i) => B.ramp[i] < 0;
    const scheidt = (i, j) => {
      if (leeg(i) !== leeg(j)) return true;
      if (leeg(i)) return false;
      if (B.obj[i] !== B.obj[j] || B.deel[i] !== B.deel[j]) return true;
      if (Math.abs(B.diep[i] - B.diep[j]) > 3) return true;
      const d = B.nrm[i * 3] * B.nrm[j * 3] + B.nrm[i * 3 + 1] * B.nrm[j * 3 + 1] + B.nrm[i * 3 + 2] * B.nrm[j * 3 + 2];
      return d < 0.8;
    };
    const idx = (x, y) => (x < 0 || y < 0 || x >= B.b || y >= B.h ? -1 : y * B.b + x);
    const grens = (a, b) => {
      if (a < 0 && b < 0) return false;
      if (a < 0 || b < 0) return !leeg(a < 0 ? b : a);
      return scheidt(a, b);
    };
    const doek = A.leeg(W, H);
    const breed = 1.1 / V.s; // een halve lijn, in pixels van de plaat
    for (let Y = 0; Y < H; Y++) for (let X = 0; X < W; X++) {
      doek.rgba.set([0, 0, 0, 255], (Y * W + X) * 4);
      if (X < V.ox || Y < V.oy || X >= V.ox + V.sw || Y >= V.oy + V.sh) continue;
      const fx = (X - V.ox) / V.s + V.x0;
      const fy = (Y - V.oy) / V.s + V.y0;
      const cx = Math.floor(fx), cy = Math.floor(fy);
      const hier = idx(cx, cy);
      const lijn = (fx - cx < breed && grens(idx(cx - 1, cy), hier)) || (cx + 1 - fx < breed && grens(hier, idx(cx + 1, cy))) ||
        (fy - cy < breed && grens(idx(cx, cy - 1), hier)) || (cy + 1 - fy < breed && grens(hier, idx(cx, cy + 1)));
      if (lijn) doek.rgba.set([255, 255, 255, 255], (Y * W + X) * 4);
    }
    return doek;
  }

  async function voerUit(stroom) {
    const r = await A.comfy('prompt', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: stroom }) });
    const { prompt_id: id, node_errors: fouten } = await r.json();
    if (fouten && Object.keys(fouten).length) throw new Error(`ComfyUI weigert de werkstroom: ${JSON.stringify(fouten).slice(0, 600)}`);
    for (;;) {
      await new Promise((res) => setTimeout(res, 1500));
      const g = (await (await A.comfy(`history/${id}`)).json())[id];
      if (!g) continue;
      if (g.status && g.status.status_str === 'error') throw new Error(`ComfyUI: ${JSON.stringify(g.status.messages).slice(0, 800)}`);
      const beeld = Object.values(g.outputs || {}).flatMap((x) => x.images || [])[0];
      if (!beeld) continue;
      const q = new URLSearchParams({ filename: beeld.filename, subfolder: beeld.subfolder || '', type: beeld.type || 'output' });
      return Buffer.from(await (await A.comfy(`view?${q}`)).arrayBuffer());
    }
  }

  // Is dit (in het antwoord van de AI) achtergrond: magenta-achtig?
  const lijktMagenta = (r, g, b) => r > 140 && b > 140 && g < 120 && Math.abs(r - b) < 100;

  function verwerk(aiPng, st, V, masker) {
    const ai = A.leesPng(aiPng);
    const controle = { doek: `${ai.b}×${ai.h}`, doekGoed: ai.b === W && ai.h === H };
    // Hoe de AI van ons silhouet afweek: wat hij binnen ons silhouet als achtergrond liet, en wat hij erbuiten tekende.
    let binnen = 0, gat = 0, erbuiten = 0, hijTekent = 0;
    for (let i = 0; i < W * H; i++) {
      const tekent = !lijktMagenta(ai.rgba[i * 4], ai.rgba[i * 4 + 1], ai.rgba[i * 4 + 2]);
      if (masker[i]) { binnen++; if (!tekent) gat++; }
      else if (tekent && opPlaat(V, i % W, Math.floor(i / W))) erbuiten++;
      if (tekent) hijTekent++;
    }
    controle.silhouet = {
      gatenBinnen: +(gat / binnen * 100).toFixed(1), // procent van ons silhouet dat de AI als achtergrond liet
      getekendErbuiten: +(erbuiten / binnen * 100).toFixed(1), // zoveel buiten ons silhouet, als procent van ons silhouet
      overlap: +(((binnen - gat) / (binnen + erbuiten)) * 100).toFixed(1), // doorsnede gedeeld door vereniging
    };
    // De sprite: het antwoord binnen ons silhouet, daarbuiten exact #FF00FF (deterministisch, niet via de prompt).
    const sprite = A.leeg(W, H);
    for (let i = 0; i < W * H; i++) {
      if (masker[i]) sprite.rgba.set([ai.rgba[i * 4], ai.rgba[i * 4 + 1], ai.rgba[i * 4 + 2], 255], i * 4);
      else sprite.rgba.set([...MAGENTA, 255], i * 4);
    }
    let fout = 0;
    for (let i = 0; i < W * H; i++) if (!masker[i] && (sprite.rgba[i * 4] !== 255 || sprite.rgba[i * 4 + 1] !== 0 || sprite.rgba[i * 4 + 2] !== 255)) fout++;
    controle.achtergrondExact = fout === 0;
    // In de maat van het spel: het deel van het doek waar het kader ligt, terug naar de plaat (zelfde omtrek, kleuren, rand).
    const vak = A.leeg(V.sw, V.sh);
    for (let y = 0; y < V.sh; y++) sprite.rgba.copy(vak.rgba, y * V.sw * 4, ((V.oy + y) * W + V.ox) * 4, ((V.oy + y) * W + V.ox + V.sw) * 4);
    const pixels = A.naarPixelsMetVorm(K.pngVanBeeld(vak), st.plaat, st.k);
    return { ai, sprite, pixels, controle };
  }

  // Rijen van beelden naast en onder elkaar, op een donkere grond.
  function naastElkaar(rijen, gat = 10) {
    const breed = Math.max(...rijen.map((r) => r.reduce((s, x) => s + x.b + gat, gat)));
    const hoog = rijen.reduce((s, r) => s + Math.max(...r.map((x) => x.h)) + gat, gat);
    const doek = A.leeg(breed, hoog);
    for (let i = 0; i < breed * hoog; i++) doek.rgba.set([40, 44, 38, 255], i * 4);
    let y = gat;
    for (const r of rijen) {
      let x = gat;
      const rh = Math.max(...r.map((s) => s.h));
      for (const s of r) {
        A.plakOp(doek, s, x, y + rh - s.h);
        x += s.b + gat;
      }
      y += rh + gat;
    }
    return doek;
  }

  return { W, H, stukVan, vlakVan, opPlaat, renderOpDoek, lijnenOpDoek, voerUit, verwerk, naastElkaar };
}

module.exports = { maak, MAGENTA, RAND };
