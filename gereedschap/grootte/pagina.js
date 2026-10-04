// In de bladzijde geladen door browser.cjs (page.addScriptTag): hulpjes om het tekenen te meten (npm run grootte --
// --browser). `Spel` is de naamruimte van het spel, `Spel.S` het spel. Het spel zelf laadt dit nooit.
(function () {
  'use strict';
  const T = globalThis.Spel;
  const S = () => T.S;
  const scherm = document.getElementById('scherm');
  const ctx = scherm.getContext('2d');
  const pct = (l, p) => { const s = l.slice().sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : 0; };
  const gem = (l) => (l.length ? l.reduce((a, b) => a + b, 0) / l.length : 0);

  // Waar mensen om 12 uur horen te zijn: bij hun anker (T.dagAnker, js/dag.js), of bij hun deur (binnen) 's nachts.
  function zetPlekken(uur) {
    const s = S();
    const D = s.dorp;
    const w = s.wereld;
    s.kalender.dag = Math.floor(s.kalender.dag) + uur / 24;
    let gezet = 0;
    for (const e of w.wezens) {
      if (!(e.bewoner || e.werkAkkers) || e.dood) continue;
      const a = T.dagAnker(D, e, false);
      if (!a) continue;
      let plek = { x: Math.round(a.x), y: Math.round(a.y) };
      const ruim = a.binnen ? 0 : Math.max(a.straal || 0, 1) + 2;
      found: for (let r = 0; r <= ruim; r++) {
        for (let y = plek.y - r; y <= plek.y + r; y++) {
          for (let x = plek.x - r; x <= plek.x + r; x++) {
            if (Math.max(Math.abs(x - a.x), Math.abs(y - a.y)) !== r && r > 0) continue;
            if (a.binnen || T.isBegaanbaar(w, x, y, { wezensBlokkeren: true, wie: e })) { plek = { x, y }; break found; }
          }
        }
      }
      e.x = e.tx = plek.x;
      e.y = e.ty = plek.y;
      e.pad = [];
      e.onderweg = false;
      e.binnen = !!a.binnen;
      e.dwaalTijd = 1 + Math.random() * 3;
      gezet++;
    }
    return gezet;
  }

  // Wat staat er in beeld? Wezens en voorwerpen waarvan het scherm-punt binnen het doek valt.
  function inBeeld() {
    const s = S();
    const w = s.wereld;
    const bw = T.tekenMaat().b;
    const bh = T.tekenMaat().h;
    const binnen = (x, y) => {
      const p = T.naarScherm(x, y);
      const sx = (p.x - Math.round(s.camera.x)) * s.zoom + Math.round(bw / 2);
      const sy = (p.y - Math.round(s.camera.y)) * s.zoom + Math.round(bh / 2);
      return sx > -64 && sx < bw + 64 && sy > -200 && sy < bh + 100;
    };
    let wezens = 0;
    let voorwerpen = 0;
    let gebouwen = 0;
    for (const e of w.wezens) if (!e.binnen && binnen(e.x, e.y)) wezens++;
    for (const v of w.voorwerpen) {
      if (!binnen(v.x, v.y)) continue;
      voorwerpen++;
      if (T.isGebouw(v)) gebouwen++;
    }
    return { wezens, voorwerpen, gebouwen };
  }

  // Camera op een tegel (zoals zetCameraOpSchout in js/main.js).
  function cameraOp(x, y) {
    const p = T.naarScherm(x, y);
    S().camera = { x: p.x, y: p.y - 24 };
  }

  // Het tekenen: `K` beelden achter elkaar, met een eerste reeks om op te warmen (de grondbuffer wordt getekend bij
  // het eerste beeld na een andere zoom). `flush`: na elk beeld een pixel terugleest, zodat de browser het tekenwerk
  // ook echt uitvoert en het niet opspaart (een vlak in de browser tekent anders pas als het beeld klaar is).
  function teken(zoom, K, flush, opties) {
    const o = opties || {};
    const s = S();
    const bw = T.tekenMaat().b;
    const bh = T.tekenMaat().h;
    const zoom0 = s.zoom;
    if (zoom) s.zoom = zoom;
    const dag0 = s.kalender.dag;
    if (o.uur != null) s.kalender.dag = Math.floor(dag0) + o.uur / 24; // alleen het licht verandert: de mensen blijven waar ze zijn
    // `klein`: teken op een doek van 1 bij 1 pixel: dan blijft alleen het rekenwerk van het spel zelf over (sorteren,
    // uitzoeken wat in beeld is, sprites kiezen), en bijna geen tekenwerk voor de browser.
    let cx = ctx;
    if (o.klein) {
      if (!window.__klein) { window.__klein = document.createElement('canvas'); window.__klein.width = 1; window.__klein.height = 1; }
      cx = window.__klein.getContext('2d');
    }
    // Het beeld op het scherm gaat met T.tekenBeeld, met of zonder de videokaart (de spelregel "Tekenen", vraag 123).
    const een = () => {
      if (o.klein) T.tekenScene(cx, s, bw, bh);
      else T.tekenBeeld();
      if (flush) (o.klein ? cx.getImageData(0, 0, 1, 1) : T.debug.wacht());
    };
    for (let i = 0; i < 6; i++) een();
    const t = [];
    for (let i = 0; i < K; i++) {
      const a = performance.now();
      een();
      t.push(performance.now() - a);
    }
    s.kalender.dag = dag0;
    const zoomGebruikt = s.zoom;
    s.zoom = zoom0; // terug naar de zoom van het venster
    return { zoom: zoomGebruikt, uur: o.uur, klein: !!o.klein, K, gem: gem(t), p50: pct(t, 0.5), p95: pct(t, 0.95), max: Math.max(...t), min: Math.min(...t), ...inBeeld() };
  }

  // Het echte spel een tijd laten lopen (de spellus van js/main.js, met rAF), en meten hoe vlot het gaat:
  // hoeveel beelden, hoe lang elk (wereld + tekenen), en hoe ver de kalender kwam.
  async function lus(seconden, snelheid, zoom) {
    const s = S();
    const zoom0 = s.zoom;
    if (zoom) s.zoom = zoom;
    const origTeken = T.tekenScene;
    const tekenMs = [];
    T.tekenScene = function (...a) {
      const b = performance.now();
      const r = origTeken.apply(this, a);
      tekenMs.push(performance.now() - b);
      return r;
    };
    window.__frames = [];
    window.__meet = true;
    s.kalender.snelheid = snelheid;
    const dag0 = s.kalender.dag;
    const t0 = performance.now();
    window.__rafStop = false;
    if (window.__rafWacht) { const cb = window.__rafWacht; window.__rafWacht = null; window.__origRaf(cb); }
    await new Promise((klaar) => {
      const kijk = () => (performance.now() - t0 >= seconden * 1000 ? klaar() : setTimeout(kijk, 50));
      kijk();
    });
    window.__rafStop = true; // de lus stopt bij het volgende beeld
    await new Promise((r) => setTimeout(r, 0));
    window.__meet = false;
    T.tekenScene = origTeken;
    const duur = (performance.now() - t0) / 1000;
    const zoomGebruikt = s.zoom;
    s.zoom = zoom0;
    const f = window.__frames;
    const ms = f.map((x) => x.ms);
    const tussen = [];
    for (let i = 1; i < f.length; i++) tussen.push(f[i].t - f[i - 1].t);
    const dagen = s.kalender.dag - dag0;
    return {
      zoom: zoomGebruikt, seconden: duur, beelden: f.length, fps: f.length / duur, beeldMs: gem(ms), beeldP95: pct(ms, 0.95), beeldMax: ms.length ? Math.max(...ms) : 0,
      tekenMs: gem(tekenMs), tekenP95: pct(tekenMs, 0.95), tussenMs: gem(tussen), tussenMax: tussen.length ? Math.max(...tussen) : 0,
      effectieveSnelheid: (dagen * 300) / duur, // spelseconden per echte seconde (bedoeld: `snelheid`)
      uur: T.uurVanDag(s.kalender.dag),
    };
  }

  // K bewoners op vrije tegels die in beeld zijn (de rest gaat naar binnen, en wordt niet getekend): hoeveel kost het
  // tekenen per poppetje dat je ziet?
  function dicht(K) {
    const s = S();
    const w = s.wereld;
    const bw = T.tekenMaat().b;
    const bh = T.tekenMaat().h;
    const z = s.zoom;
    const tegels = [];
    for (let y = 0; y < w.h; y++) {
      for (let x = 0; x < w.b; x++) {
        const p = T.naarScherm(x, y);
        const sx = (p.x - Math.round(s.camera.x)) * z + Math.round(bw / 2);
        const sy = (p.y - Math.round(s.camera.y)) * z + Math.round(bh / 2);
        if (sx < 30 || sx > bw - 30 || sy < 80 || sy > bh - 10) continue;
        if (T.isBegaanbaar(w, x, y)) tegels.push({ x, y });
      }
    }
    const mensen = w.wezens.filter((e) => e.bewoner && !e.dood);
    let gezet = 0;
    mensen.forEach((e, i) => {
      if (i < K && i < tegels.length) {
        const t = tegels[i];
        e.x = e.tx = t.x; e.y = e.ty = t.y; e.pad = []; e.onderweg = false; e.binnen = false; gezet++;
      } else e.binnen = true;
    });
    return { vrijeTegelsInBeeld: tegels.length, gezet };
  }

  globalThis.Meet = { zetPlekken, inBeeld, cameraOp, teken, lus, dicht };
})();
