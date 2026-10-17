// De renderproef (gereedschap/pixiproef; ontwerp/snelheid.md, E): de bladzijde, de spellus en het meten. Dezelfde
// scène (scene.js) met js/gl.js (huidig.js) en met PixiJS v8 (pixiweg.js), om en om of naast elkaar.
//
// In de adresbalk: ?weg=huidig|pixi (waar je begint), &alleen (alleen die ene tekenaar, voor het meten van geheugen),
// &zoom=0.35, &mip (Pixi lineair met mipmaps), &culler=pixi (Pixi's eigen Culler), &webgl1 (Pixi op WebGL1),
// &sorteer=eigen (Pixi krijgt elk beeld alleen wat in beeld is, zelf gesorteerd; zonder: zIndex en sortableChildren), &kaal
// (zonder balk, voor de schermafdrukken), &b=1920&h=1080 (een vaste maat). Voor de meting: Proef.meet, Proef.fps,
// Proef.wissel, Proef.vergelijk en Proef.geheugen (meting.cjs roept ze aan).
(function (P) {
  'use strict';
  const q = new URLSearchParams(location.search);
  const ZOOMS = [1, 0.5, 0.35];
  P.inst = {
    weg: q.get('weg') || 'huidig', zoom: Number(q.get('zoom')) || 1, schaduw: !q.has('zonderschaduw'), licht: !q.has('zonderlicht'),
    modus: q.get('modus') || 'gewoon', mip: q.has('mip'), culler: q.get('culler') || 'eigen', webgl1: q.has('webgl1'),
    sorteer: q.get('sorteer') || 'pixi', zonderAfronden: q.has('zonderafronden'),
    beweging: true, pannen: false,
  };
  P.cam = { x: 0, y: 0, zoom: P.inst.zoom };
  P.t = 0;
  P.loopt = true;
  P.klaar = false;
  P.fout = null;
  const vlak = document.getElementById('vlak');
  const meter = document.getElementById('meter');
  const maat = () => ({ b: Number(q.get('b')) || vlak.clientWidth, h: Number(q.get('h')) || vlak.clientHeight });

  function heapMB() {
    const m = performance.memory;
    return m ? +(m.usedJSHeapSize / 1048576).toFixed(1) : null;
  }
  const wachtBeeld = () => new Promise((k) => requestAnimationFrame(() => k()));

  async function start() {
    if (q.has('kaal')) document.body.classList.add('kaal');
    const heap0 = heapMB();
    const sc = (P.scene = P.maakScene(20261017));
    const t0 = performance.now();
    await P.laad([...sc.paden, 'tegels/grond.png']);
    P.koppel(sc);
    P.laadMs = Math.round(performance.now() - t0);
    P.cam.x = sc.midden.x;
    P.cam.y = sc.midden.y;
    const { b, h } = maat();
    const welke = q.has('alleen') ? [P.inst.weg] : ['huidig', 'pixi'];
    P.opbouw = {};
    for (const naam of welke) {
      const w = P.wegen[naam];
      const a = performance.now();
      await w.init(b, h, P.inst);
      if (w.bouw) w.bouw(sc);
      P.opbouw[naam] = Math.round(performance.now() - a);
      w.canvas.classList.add('doek');
      vlak.appendChild(w.canvas);
    }
    P.heapNaLaden = heapMB();
    P.heapVoorLaden = heap0;
    kiesWeg(P.inst.weg);
    bouwBalk();
    P.klaar = true;
    requestAnimationFrame(lus);
  }

  function kiesWeg(naam) {
    if (!P.wegen[naam] || !P.wegen[naam].canvas) return;
    P.inst.weg = naam;
    P.weg = P.wegen[naam];
    for (const n in P.wegen) if (P.wegen[n].canvas) P.wegen[n].canvas.style.display = n === naam ? '' : 'none';
    werkBalkBij();
  }

  // ---------------------------------------------------------------- de spellus
  let vorige = 0;
  const tijden = [];
  function lus(nu) {
    requestAnimationFrame(lus);
    if (!P.loopt) { vorige = 0; return; }
    const dt = vorige ? Math.min(0.1, (nu - vorige) / 1000) : 1 / 60;
    vorige = nu;
    if (P.inst.beweging) P.t += dt;
    if (P.inst.pannen) pan(P.t);
    P.stand(P.scene, P.t);
    const a = performance.now();
    P.weg.teken(P.scene, P.cam, P.inst);
    tijden.push({ tekenen: performance.now() - a, dt: dt * 1000 });
    if (tijden.length >= 30) {
      const tk = tijden.reduce((s, x) => s + x.tekenen, 0) / tijden.length;
      const fps = 1000 / (tijden.reduce((s, x) => s + x.dt, 0) / tijden.length);
      const tel = P.tellerVan(P.weg.canvas);
      const st = tel ? tel.stand() : {};
      meter.textContent = `${fps.toFixed(0)} beelden/s · tekenen ${tk.toFixed(2)} ms · ${P.weg.zicht} dingen in beeld · ` +
        `${st.opdrachten / tijden.length | 0} opdrachten/beeld · texturen ${st.textuurMB} MB · heap ${heapMB()} MB`;
      if (tel) tel.nul();
      tijden.length = 0;
    }
  }
  // Pannen: de camera in een langzame cirkel rond het midden (alles wat in beeld komt en gaat).
  function pan(t) {
    const m = P.scene.midden;
    P.cam.x = Math.round(m.x + Math.cos(t * 0.35) * 900);
    P.cam.y = Math.round(m.y + Math.sin(t * 0.35) * 450);
  }

  // ---------------------------------------------------------------- meten
  const stats = (lijst) => {
    const s = [...lijst].sort((a, b) => a - b);
    const p = (f) => s[Math.min(s.length - 1, Math.floor(f * s.length))];
    const gem = s.reduce((a, b) => a + b, 0) / s.length;
    return { gem: +gem.toFixed(3), med: +p(0.5).toFixed(3), p95: +p(0.95).toFixed(3), max: +s[s.length - 1].toFixed(3) };
  };
  // n beelden na elkaar, elk met een pixel teruggelezen (dan heeft de kaart het werk ook gedaan): de tijd van de
  // processor (tekenen tot de opdrachten weg zijn) en alles samen, plus de tellingen.
  P.meet = async function (n = 240, warm = 60, opties = {}) {
    P.loopt = false;
    await wachtBeeld();
    Object.assign(P.inst, opties);
    if (opties.zoom) P.cam.zoom = opties.zoom;
    const w = P.weg;
    const tel = P.tellerVan(w.canvas);
    const stap = () => {
      if (P.inst.beweging) P.t += 1 / 60;
      if (P.inst.pannen) pan(P.t);
      P.stand(P.scene, P.t);
    };
    for (let i = 0; i < warm; i++) { stap(); w.teken(P.scene, P.cam, P.inst); w.wacht(); }
    await wachtBeeld();
    const cpu = [];
    const alles = [];
    const opdr = [];
    let opgestuurd = 0;
    for (let i = 0; i < n; i++) {
      stap();
      tel.nul();
      const a = performance.now();
      w.teken(P.scene, P.cam, P.inst);
      const b = performance.now();
      w.wacht();
      const c = performance.now();
      cpu.push(b - a);
      alles.push(c - a);
      opdr.push(tel.opdrachten);
      opgestuurd += tel.opgestuurd;
    }
    const st = tel.stand();
    const uit = {
      weg: w.naam, zoom: P.cam.zoom, schaduw: P.inst.schaduw, licht: P.inst.licht, modus: P.inst.modus, pannen: P.inst.pannen,
      mip: P.inst.mip, culler: P.inst.culler, sorteer: P.inst.sorteer, zicht: w.zicht, cpu: stats(cpu), alles: stats(alles),
      opdrachten: stats(opdr).med, opgestuurdMB: +(opgestuurd / 1048576).toFixed(2), textuurMB: st.textuurMB,
      aantalTexturen: st.aantalTexturen, heapMB: heapMB(), gl: st.soort,
    };
    P.loopt = true;
    return uit;
  };
  // Echte beelden per seconde met de spellus (requestAnimationFrame), sec seconden lang.
  P.fps = async function (sec = 3) {
    P.loopt = true;
    const tussen = [];
    let v = 0;
    const eind = performance.now() + sec * 1000;
    while (performance.now() < eind) {
      await wachtBeeld();
      const nu = performance.now();
      if (v) tussen.push(nu - v);
      v = nu;
    }
    const s = stats(tussen);
    return { fps: +(1000 / s.gem).toFixed(1), tussenMs: s, boven20ms: tussen.filter((x) => x > 20).length, beelden: tussen.length };
  };
  // Wisselen naar een weergave van de gebouwen (plat, doorzichtig, verborgen): wat het laden van de platte tekeningen
  // kost (voor beide gelijk), en het eerste en tweede beeld daarna (dan gaan de nieuwe plaatjes naar de kaart).
  P.wissel = async function (modus) {
    P.loopt = false;
    await wachtBeeld();
    const w = P.weg;
    const tel = P.tellerVan(w.canvas);
    let laadMs = 0;
    if (modus === 'plat') {
      const a = performance.now();
      await P.laad(P.scene.platPaden).catch(() => null);
      for (const d of P.scene.dingen) if (d.plat) d.plat.img = P.beeldVan(d.plat.pad) || null;
      laadMs = Math.round(performance.now() - a);
    }
    const voor = tel.stand().textuurMB;
    P.inst.modus = modus;
    const beeld = () => {
      tel.nul();
      const a = performance.now();
      w.teken(P.scene, P.cam, P.inst);
      w.wacht();
      return { ms: +(performance.now() - a).toFixed(2), opgestuurdMB: +(tel.opgestuurd / 1048576).toFixed(2) };
    };
    const eerste = beeld();
    const tweede = beeld();
    P.loopt = true;
    return { modus, laadMs, eerste, tweede, textuurMBvoor: voor, textuurMBna: tel.stand().textuurMB, platten: P.scene.platPaden.length };
  };
  // Beide tekenaars hetzelfde beeld, pixel voor pixel vergeleken (alleen zonder &alleen): hoeveel pixels verschillen
  // (een kanaal meer dan 8 van 255), en het gemiddelde verschil.
  P.vergelijk = async function () {
    P.loopt = false;
    await wachtBeeld();
    const { b, h } = { b: P.wegen.huidig.b, h: P.wegen.huidig.h };
    const lees = (naam) => {
      const w = P.wegen[naam];
      w.teken(P.scene, P.cam, P.inst);
      const d = document.createElement('canvas');
      d.width = b;
      d.height = h;
      const c = d.getContext('2d');
      c.drawImage(w.canvas, 0, 0);
      return { data: c.getImageData(0, 0, b, h).data, url: d.toDataURL('image/png') };
    };
    P.stand(P.scene, P.t);
    const A = lees('huidig');
    const B = lees('pixi');
    let anders = 0;
    let som = 0;
    for (let i = 0; i < A.data.length; i += 4) {
      const v = Math.max(Math.abs(A.data[i] - B.data[i]), Math.abs(A.data[i + 1] - B.data[i + 1]), Math.abs(A.data[i + 2] - B.data[i + 2]));
      if (v > 8) anders++;
      som += v;
    }
    P.loopt = true;
    const n = A.data.length / 4;
    return { zoom: P.cam.zoom, verschilProcent: +((anders / n) * 100).toFixed(3), gemiddeld: +(som / n).toFixed(3), huidig: A.url, pixi: B.url };
  };
  P.geheugen = async function () {
    if (globalThis.gc) { globalThis.gc(); globalThis.gc(); }
    await wachtBeeld();
    const tel = P.tellerVan(P.weg.canvas);
    return { heapMB: heapMB(), heapVoorLaden: P.heapVoorLaden, heapNaLaden: P.heapNaLaden, ...tel.stand(), opbouwMs: P.opbouw, laadMs: P.laadMs, tel: P.scene.tel,
      scriptMs: { gl: +P.glLaadMs.toFixed(1), pixi: +P.pixiLaadMs.toFixed(1) } };
  };
  P.zetZoom = function (z) {
    P.inst.zoom = z;
    P.cam.zoom = z;
    werkBalkBij();
  };
  P.kies = kiesWeg;

  // ---------------------------------------------------------------- de balk
  function knop(tekst, f, groep) {
    const k = document.createElement('button');
    k.textContent = tekst;
    k.onclick = () => { f(); werkBalkBij(); };
    if (groep) k.dataset.groep = groep;
    return k;
  }
  const knoppen = [];
  function bouwBalk() {
    const balk = document.getElementById('knoppen');
    const rij = (label, items) => {
      const r = document.createElement('span');
      r.className = 'rij';
      r.append(label);
      for (const it of items) { r.append(it.k); knoppen.push(it); }
      balk.append(r);
    };
    rij('Tekenaar ', ['huidig', 'pixi'].filter((n) => P.wegen[n].canvas).map((n) => ({
      k: knop(n === 'huidig' ? 'js/gl.js' : 'PixiJS 8.22', () => kiesWeg(n)), aan: () => P.inst.weg === n,
    })));
    rij('Zoom ', ZOOMS.map((z) => ({ k: knop(`${Math.round(z * 100)}%`, () => P.zetZoom(z)), aan: () => P.cam.zoom === z })));
    rij('Gebouwen ', ['gewoon', 'plat', 'doorzichtig', 'verborgen'].map((m) => ({
      k: knop(m, () => (m === 'plat' ? P.wissel('plat') : (P.inst.modus = m))), aan: () => P.inst.modus === m,
    })));
    rij('', [
      { k: knop('schaduw', () => (P.inst.schaduw = !P.inst.schaduw)), aan: () => P.inst.schaduw },
      { k: knop('licht', () => (P.inst.licht = !P.inst.licht)), aan: () => P.inst.licht },
      { k: knop('beweging', () => (P.inst.beweging = !P.inst.beweging)), aan: () => P.inst.beweging },
      { k: knop('pannen', () => (P.inst.pannen = !P.inst.pannen)), aan: () => P.inst.pannen },
    ]);
    werkBalkBij();
  }
  function werkBalkBij() {
    for (const it of knoppen) it.k.classList.toggle('aan', !!it.aan());
  }

  // Slepen schuift de camera, het wiel wisselt de zoom.
  let sleep = null;
  vlak.addEventListener('pointerdown', (e) => { sleep = { x: e.clientX, y: e.clientY, cx: P.cam.x, cy: P.cam.y }; });
  addEventListener('pointerup', () => { sleep = null; });
  addEventListener('pointermove', (e) => {
    if (!sleep) return;
    P.cam.x = Math.round(sleep.cx - (e.clientX - sleep.x) / P.cam.zoom);
    P.cam.y = Math.round(sleep.cy - (e.clientY - sleep.y) / P.cam.zoom);
  });
  vlak.addEventListener('wheel', (e) => {
    e.preventDefault();
    const i = ZOOMS.indexOf(P.cam.zoom);
    P.zetZoom(ZOOMS[Math.max(0, Math.min(ZOOMS.length - 1, i + (e.deltaY > 0 ? 1 : -1)))]);
  }, { passive: false });
  addEventListener('resize', () => {
    if (q.has('b')) return;
    const { b, h } = maat();
    for (const n in P.wegen) if (P.wegen[n].canvas) P.wegen[n].maat(b, h);
  });

  start().catch((e) => {
    P.fout = String(e && e.stack ? e.stack : e);
    meter.textContent = 'Fout: ' + P.fout;
    console.error(e);
  });
})(globalThis.Proef = globalThis.Proef || {});
