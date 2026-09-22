// Het wereldgereedschap, ronde 1: kijken (ontwerp/kaarten.md, "Een wereldgereedschap naast
// Tiled"). Tiled houdt de grond, wij de betekenis. Dit blad schrijft niets — het leest een .tmj,
// laat hem inlezen door js/kaart.js en tekenen door js/tekenen.js, en legt er lagen overheen die
// laten zien wat het spel er verder van vindt: waar je kunt lopen, wie waar staat en hoe ver hij
// dwaalt, wat aan welke questfase hangt, waar de uitgangen zijn. Klik een tegel en er staat wat
// het spel denkt dat daar is.
//
// Het leest de .tmj rechtstreeks van de server, niet uit kaarten/kaarten.js. Dus: opslaan in
// Tiled, hier op Verversen, en je ziet het — zonder npm run kaarten. Lukt dat niet (het blad
// staat los open, zonder npm start), dan valt het terug op het gebundelde T.KAARTEN, en de
// statusregel zegt welke van de twee je ziet.
(function (T) {
  'use strict';

  const canvas = document.getElementById('wt-scherm');
  const ctx = canvas.getContext('2d');
  const el = (id) => document.getElementById(id);

  // De spelstaat waar js/tekenen.js op werkt. Dezelfde velden als bij een nieuw spel (js/main.js),
  // maar leeg: er wordt hier niet gespeeld, alleen gekeken. T.S, zodat je er in de console bij kunt.
  const S = (T.S = {
    tijd: 0, wind: 0, zoom: 1, camera: { x: 0, y: 0 },
    wereld: null, held: null, modus: 'verkennen', gevecht: null, overgang: null,
    bezig: false, spreuk: null, spreukBereik: null, bereik: null, handeling: null, hover: null,
    lichten: [], effecten: [], wachters: [], grond: null, doorkijkTijd: 0,
    rasterAlpha: 0, rasterTegels: [], rasterStart: 0, rasterVan: null,
    inventaris: new Set(), vlaggen: new Set(), bezocht: new Set(),
    quests: {}, questWeg: {}, questBeloond: new Set(),
    goud: 0, goudGehad: false, sluipen: false, fonteinLeeg: false, spreektMet: null,
    gebieden: {},
  });
  T.debug = T.debug || {};

  let kaartNaam = '';
  let objecten = []; // de Tiled-objecten, voor de lagen die eigenschappen laten zien
  let klachten = [];
  let vast = null; // de tegel die met een klik is vastgezet
  let onderMuis = null;
  let bw = 0;
  let bh = 0;

  // ---------------------------------------------------------------- de lagen

  // Elke laag een vinkje, een kleur en een sneltoets. `wat` tekent hem, in hetzelfde vlak waarin
  // het spel tekent (dus in wereldpixels, na het schuiven en zoomen).
  const LAGEN = [
    { id: 'raster', naam: 'Raster', kleur: 'rgba(245, 230, 190, 0.28)', toets: 'r', aan: false },
    { id: 'begaanbaar', naam: 'Begaanbaar / vast', kleur: '#86c46f', toets: 'b', aan: false },
    { id: 'mensen', naam: 'Mensen, met dwaalstraal', kleur: '#e2b64a', toets: 'm', aan: true },
    { id: 'quest', naam: 'Quest en raakpunten', kleur: '#b98ce0', toets: 'q', aan: true },
    { id: 'uitgangen', naam: 'Uitgangen', kleur: '#6fa0e6', toets: 'u', aan: true },
    { id: 'klachten', naam: 'Wat de controle vond', kleur: '#e0604f', toets: 'c', aan: true },
    { id: 'namen', naam: 'Namen erbij', kleur: 'rgba(239, 230, 210, 0.75)', toets: 'n', aan: true },
    { id: 'vlakken', naam: 'Kunst uit (vlakken)', kleur: 'rgba(239, 230, 210, 0.3)', toets: 'k', aan: false },
  ];
  const aan = (id) => !!(LAGEN.find((l) => l.id === id) || {}).aan;

  function bouwLagen() {
    const doel = el('wt-lagen');
    doel.innerHTML = '';
    for (const laag of LAGEN) {
      const rij = document.createElement('label');
      rij.className = 'wt-laag';
      const vink = document.createElement('input');
      vink.type = 'checkbox';
      vink.checked = laag.aan;
      vink.addEventListener('change', () => {
        laag.aan = vink.checked;
        if (laag.id === 'vlakken') {
          T.debug.vlakken = laag.aan;
          S.grond = null; // de grond staat op een eigen vlak en moet opnieuw
        }
      });
      const kleur = document.createElement('span');
      kleur.className = 'wt-kleur';
      kleur.style.background = laag.kleur;
      const naam = document.createElement('span');
      naam.className = 'wt-naam';
      naam.textContent = laag.naam;
      const toets = document.createElement('span');
      toets.className = 'wt-sneltoets';
      toets.textContent = laag.toets;
      rij.append(vink, kleur, naam, toets);
      doel.appendChild(rij);
    }
  }

  // ---------------------------------------------------------------- de kaart halen

  // Eerst van schijf (vers, zoals Tiled hem net opsloeg), anders het gebundelde T.KAARTEN.
  async function haalKaart(naam) {
    try {
      const r = await fetch(`kaarten/${naam}.tmj`, { cache: 'no-store' });
      if (r.ok) return { kaart: await r.json(), bron: 'van schijf' };
    } catch (e) {
      /* een blad dat los openstaat mag niet fetchen; dan het gebundelde */
    }
    if (T.KAARTEN && T.KAARTEN[naam]) return { kaart: T.KAARTEN[naam], bron: 'uit kaarten.js' };
    throw new Error(`kaart "${naam}" niet gevonden`);
  }

  // Welke kaarten zijn er? De server weet het van schijf (ook een kaart die nog niet gebundeld
  // is); anders de namen uit kaarten.js.
  async function haalNamen() {
    try {
      const r = await fetch('gereedschap/api/kaarten', { cache: 'no-store' });
      if (r.ok) {
        const namen = await r.json();
        if (Array.isArray(namen) && namen.length) return namen;
      }
    } catch (e) {
      /* geen server: dan wat er gebundeld is */
    }
    return Object.keys(T.KAARTEN || {});
  }

  function status(tekst) {
    el('wt-status').textContent = tekst;
  }

  async function laadKaart(naam, houdCamera) {
    status(`${naam} laden…`);
    const { kaart, bron } = await haalKaart(naam);
    kaartNaam = naam;
    // De verse kaart ook aan T.KAARTEN, zodat T.GEBIEDEN en de keuring dezelfde versie zien als
    // wat er in beeld staat — anders keurt het gereedschap iets anders dan het tekent.
    T.KAARTEN = T.KAARTEN || {};
    T.KAARTEN[naam] = kaart;
    T.GEBIEDEN = T.maakGebieden();

    objecten = T.kaartObjecten(kaart);
    const uitslag = T.keurKaart(naam, kaart);
    S.wereld = uitslag.wereld;
    S.wereld.gebied = naam;
    S.grond = null;
    vast = null;
    onderMuis = null;
    toonTegel(null);
    zetQuestKeuze();
    pasQuestFaseToe();
    keur(uitslag.klachten);
    if (!houdCamera) passend();
    status(`${naam} — ${S.wereld.b}×${S.wereld.h} tegels, ${objecten.length} objecten (${bron})`);
  }

  // ---------------------------------------------------------------- de questfase

  function zetQuestKeuze() {
    const keuze = el('wt-quest');
    if (keuze.options.length) return;
    keuze.innerHTML = '<option value="">— zoals het spel begint —</option>';
    for (const [id, q] of Object.entries(T.QUESTS || {})) {
      const o = document.createElement('option');
      o.value = id;
      o.textContent = q.naam || id;
      keuze.appendChild(o);
    }
    zetFaseKeuze();
  }

  function zetFaseKeuze() {
    const q = T.QUESTS[el('wt-quest').value];
    const keuze = el('wt-fase');
    keuze.innerHTML = '';
    if (!q) {
      keuze.innerHTML = '<option value="">—</option>';
      keuze.disabled = true;
      return;
    }
    keuze.disabled = false;
    for (const fase of Object.keys(q.fasen || {})) {
      const o = document.createElement('option');
      o.value = fase;
      o.textContent = fase + (q.fasen[fase].eind ? ' (eind)' : '');
      keuze.appendChild(o);
    }
    keuze.value = q.begin;
  }

  // De wereld in de gekozen fase zetten. Dat gaat langs T.zetQuest en T.werkQuestVoorwerpen uit
  // js/quest.js zelf: wat hier verschijnt en verdwijnt, verschijnt en verdwijnt in het spel ook.
  function pasQuestFaseToe() {
    S.quests = {};
    S.questWeg = {};
    S.questBeloond = new Set();
    S.vlaggen = new Set();
    S.inventaris = new Set();
    const id = el('wt-quest').value;
    const fase = el('wt-fase').value;
    if (id && fase) T.zetQuest(S, id, fase);
    else T.werkQuestVoorwerpen(S);
  }

  // ---------------------------------------------------------------- de controle

  function keur(klachtenVanDeKaart) {
    klachten = [...(klachtenVanDeKaart || []), ...T.keurDekking()];
    const doel = el('wt-controle');
    doel.innerHTML = '';
    const fouten = klachten.filter((k) => k.soort === 'fout').length;
    el('wt-controle-tal').textContent = klachten.length
      ? `${fouten} fout, ${klachten.length - fouten} let op`
      : '';
    if (!klachten.length) {
      doel.innerHTML = '<p class="wt-goed">Alles wat het spel van deze kaart vraagt, staat erop.</p>';
      return;
    }
    for (const k of klachten) {
      const knop = document.createElement('button');
      knop.type = 'button';
      knop.className = 'wt-klacht ' + (k.soort === 'fout' ? 'wt-fout' : 'wt-letop');
      const waar = document.createElement('span');
      waar.className = 'wt-waar';
      waar.textContent = k.x != null ? `(${k.x}, ${k.y}) ` : k.kaart ? `${k.kaart} · ` : 'ontbreekt · ';
      knop.append(waar, document.createTextNode(k.tekst));
      if (k.x != null && k.kaart === kaartNaam) {
        knop.addEventListener('click', () => {
          kijkNaar(k.x, k.y);
          vast = { x: k.x, y: k.y };
          toonTegel(vast);
        });
      } else {
        knop.classList.add('wt-geen-plek');
      }
      doel.appendChild(knop);
    }
  }

  // ---------------------------------------------------------------- camera en muis

  function formaat() {
    const dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
    const vak = canvas.parentElement.getBoundingClientRect();
    bw = Math.max(200, Math.round(vak.width));
    bh = Math.max(200, Math.round(vak.height));
    canvas.width = bw * dpr;
    canvas.height = bh * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Dezelfde afronding als tekenScene, anders wijst de muis net naast de tegel.
  const naarVlak = (mx, my) => ({
    x: (mx - Math.round(bw / 2)) / S.zoom + Math.round(S.camera.x),
    y: (my - Math.round(bh / 2)) / S.zoom + Math.round(S.camera.y),
  });

  function tegelOnder(mx, my) {
    const v = naarVlak(mx, my);
    const t = T.naarWereld(v.x, v.y);
    const x = Math.round(t.x);
    const y = Math.round(t.y);
    const w = S.wereld;
    return w && x >= 0 && y >= 0 && x < w.b && y < w.h ? { x, y } : null;
  }

  function kijkNaar(x, y) {
    const p = T.naarScherm(x, y);
    S.camera.x = p.x;
    S.camera.y = p.y;
  }

  // De hele kaart in beeld: de vier hoeken van het raster, met wat lucht eromheen.
  function passend() {
    const w = S.wereld;
    if (!w) return;
    const hoeken = [T.naarScherm(0, 0), T.naarScherm(w.b - 1, 0), T.naarScherm(0, w.h - 1), T.naarScherm(w.b - 1, w.h - 1)];
    const x0 = Math.min(...hoeken.map((p) => p.x)) - T.HB;
    const x1 = Math.max(...hoeken.map((p) => p.x)) + T.HB;
    const y0 = Math.min(...hoeken.map((p) => p.y)) - 64;
    const y1 = Math.max(...hoeken.map((p) => p.y)) + T.HH;
    S.camera.x = (x0 + x1) / 2;
    S.camera.y = (y0 + y1) / 2;
    zetZoom(Math.min(bw / (x1 - x0), bh / (y1 - y0)));
  }

  // De ondergrens is er niet voor niets: js/tekenen.js zet de grond op een eigen vlak van
  // venster-gedeeld-door-zoom pixels, en dat loopt bij ver uitzoomen hard op. Onder deze grens
  // tekent het gereedschap zelf een plattegrond (zie tekenPlattegrond).
  const MIN_BEELD = 0.4;
  function zetZoom(z) {
    S.zoom = Math.max(0.06, Math.min(3, z));
    S.grond = null;
    el('wt-zoom').textContent = `${Math.round(S.zoom * 100)}%${S.zoom < MIN_BEELD ? ' · plattegrond' : ''}`;
  }

  let sleept = null;
  canvas.addEventListener('mousedown', (e) => {
    sleept = { mx: e.clientX, my: e.clientY, cx: S.camera.x, cy: S.camera.y, ver: 0 };
    canvas.classList.add('wt-sleept');
  });
  window.addEventListener('mousemove', (e) => {
    const vak = canvas.getBoundingClientRect();
    if (sleept) {
      const dx = e.clientX - sleept.mx;
      const dy = e.clientY - sleept.my;
      sleept.ver = Math.max(sleept.ver, Math.abs(dx) + Math.abs(dy));
      S.camera.x = sleept.cx - dx / S.zoom;
      S.camera.y = sleept.cy - dy / S.zoom;
      return;
    }
    onderMuis = tegelOnder(e.clientX - vak.left, e.clientY - vak.top);
    if (!vast) toonTegel(onderMuis);
  });
  window.addEventListener('mouseup', (e) => {
    if (!sleept) return;
    const stil = sleept.ver < 4;
    sleept = null;
    canvas.classList.remove('wt-sleept');
    if (!stil || e.target !== canvas) return;
    const vak = canvas.getBoundingClientRect();
    vast = tegelOnder(e.clientX - vak.left, e.clientY - vak.top);
    toonTegel(vast);
  });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    // Om de muis heen zoomen: de tegel onder de muis blijft waar hij is.
    const vak = canvas.getBoundingClientRect();
    const mx = e.clientX - vak.left;
    const my = e.clientY - vak.top;
    const voor = naarVlak(mx, my);
    zetZoom(S.zoom * (e.deltaY < 0 ? 1.15 : 1 / 1.15));
    const na = naarVlak(mx, my);
    S.camera.x += voor.x - na.x;
    S.camera.y += voor.y - na.y;
  }, { passive: false });

  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    const laag = LAGEN.find((l) => l.toets === e.key.toLowerCase());
    if (laag) {
      laag.aan = !laag.aan;
      if (laag.id === 'vlakken') {
        T.debug.vlakken = laag.aan;
        S.grond = null;
      }
      bouwLagen();
      return;
    }
    const stap = 64 / S.zoom;
    if (e.key === 'ArrowLeft') S.camera.x -= stap;
    else if (e.key === 'ArrowRight') S.camera.x += stap;
    else if (e.key === 'ArrowUp') S.camera.y -= stap;
    else if (e.key === 'ArrowDown') S.camera.y += stap;
    else if (e.key === 'Escape') {
      vast = null;
      toonTegel(onderMuis);
    }
  });

  // ---------------------------------------------------------------- wat het spel hier ziet

  function rij(doel, wat, is, klasse) {
    const r = document.createElement('div');
    r.className = 'wt-rij';
    const a = document.createElement('span');
    a.className = 'wt-wat';
    a.textContent = wat;
    const b = document.createElement('span');
    b.className = 'wt-is' + (klasse ? ' ' + klasse : '');
    b.textContent = is;
    r.append(a, b);
    doel.appendChild(r);
    return r;
  }

  function kop(doel, tekst) {
    const h = document.createElement('div');
    h.className = 'wt-kop-tegel';
    h.textContent = tekst;
    doel.appendChild(h);
  }

  function toonTegel(t) {
    const doel = el('wt-tegel');
    const w = S.wereld;
    el('wt-los').disabled = !vast;
    doel.innerHTML = '';
    if (!t || !w) {
      doel.innerHTML = '<p class="gt-leeg">Beweeg over de kaart, of klik een tegel om hem vast te zetten.</p>';
      return;
    }
    const ja = (b) => (b ? 'ja' : 'nee');
    const kl = (b) => (b ? 'wt-ja' : 'wt-nee');

    kop(doel, `Tegel (${t.x}, ${t.y})`);
    const g = w.grond[t.y][t.x];
    rij(doel, 'grond', g ? `${g.naam} (${g.vel} #${g.id})` : '— niets getekend —', g ? '' : 'wt-nee');
    rij(doel, 'soort', T.tegel(w, t.x, t.y));
    rij(doel, 'begaanbaar', ja(T.isBegaanbaar(w, t.x, t.y)), kl(T.isBegaanbaar(w, t.x, t.y)));
    rij(doel, 'vast', ja(T.isVast(w, t.x, t.y)), kl(!T.isVast(w, t.x, t.y)));

    const d = T.deurOp(w, t.x, t.y);
    if (d) {
      kop(doel, 'Deur');
      rij(doel, 'staat', d.staat);
      rij(doel, 'richting', d.richting);
    }

    for (const v of w.voorwerpen.filter((v) => v.x === t.x && v.y === t.y)) {
      kop(doel, `Voorwerp · ${v.soort}`);
      rij(doel, 'vel', `${v.vel} #${v.id}`);
      if (v.beslaat && (v.beslaat[0] > 1 || v.beslaat[1] > 1)) rij(doel, 'beslaat', `${v.beslaat[0]}×${v.beslaat[1]} tegels`);
      if (v.raak) {
        const r = T.RAAKPUNTEN[v.raak];
        rij(doel, 'raak', v.raak, r ? 'wt-ja' : 'wt-nee');
        if (r) rij(doel, 'spreuk', `${r.spreuk} — ${r.tekst}`);
      }
      if (v.grendel) rij(doel, 'quest', `${v.grendel.quest}${v.grendel.fase ? ':' + v.grendel.fase.join(',') : ''}`);
      if (T.OPRAPEN && T.OPRAPEN[v.soort]) rij(doel, 'oprapen', T.OPRAPEN[v.soort].tekst);
    }
    // Wat aan een quest hangt maar er in deze fase niet ligt, hoort er ook bij te staan: dan zie
    // je waarom je het niet ziet.
    for (const v of (w.questVoorwerpen || []).filter((v) => v.x === t.x && v.y === t.y && !w.voorwerpen.includes(v))) {
      kop(doel, `Ligt hier niet · ${v.soort}`);
      rij(doel, 'quest', `${v.grendel.quest}${v.grendel.fase ? ':' + v.grendel.fase.join(',') : ''}`, 'wt-nee');
      rij(doel, 'nu', el('wt-quest').value === v.grendel.quest ? `fase ${el('wt-fase').value}` : 'die quest staat niet aan');
    }

    for (const e of w.wezens.filter((e) => e.tx === t.x && e.ty === t.y)) {
      kop(doel, `Wezen · ${e.soort}`);
      rij(doel, 'naam', e.naam + (e.zaad != null ? ` (zaad ${e.zaad})` : ''));
      rij(doel, 'kant', e.kant);
      if (e.leven) rij(doel, 'leven', `${e.leven}/${e.maxLeven}`);
      rij(doel, 'dwaalt', e.dwaalt ? `ja, straal ${e.straal} vanaf (${e.thuis.x}, ${e.thuis.y})` : 'nee', kl(e.dwaalt));
      if (T.GESPREKKEN && T.GESPREKKEN[e.soort]) rij(doel, 'gesprek', 'ja', 'wt-ja');
      else if (e.kant === 'neutraal') rij(doel, 'gesprek', 'geen', 'wt-nee');
    }

    const o = (w.overgangen || []).find((o) => o.x === t.x && o.y === t.y);
    if (o) {
      kop(doel, 'Uitgang');
      rij(doel, 'naar', o.naar, T.GEBIEDEN[o.naar] ? 'wt-ja' : 'wt-nee');
      rij(doel, 'komt aan', o.komt ? `(${o.komt.x}, ${o.komt.y})` : 'zelf een tegel ernaast', o.komt ? '' : 'wt-nee');
      if (o.tekst) rij(doel, 'tekst', o.tekst);
    }

    const hier = objecten.filter((v) => v.x === t.x && v.y === t.y && Object.keys(v.eig).length);
    if (hier.length) {
      kop(doel, 'In Tiled');
      for (const v of hier) {
        for (const [k, waarde] of Object.entries(v.eig)) rij(doel, k, String(waarde));
      }
    }
  }

  // ---------------------------------------------------------------- tekenen

  // Alles wat het gereedschap er zelf overheen legt, tekent in hetzelfde vlak als het spel: eerst
  // naar het midden, dan zoomen, dan de camera. Zo liggen de lagen precies op de tegels.
  function inVlak(teken) {
    ctx.save();
    ctx.translate(Math.round(bw / 2), Math.round(bh / 2));
    ctx.scale(S.zoom, S.zoom);
    ctx.translate(-Math.round(S.camera.x), -Math.round(S.camera.y));
    teken();
    ctx.restore();
  }

  // Welke tegels staan er in beeld? Dezelfde vraag als in tekenen.js, maar dan simpel: de vier
  // hoeken van het venster terugrekenen naar het raster.
  function inBeeld() {
    const w = S.wereld;
    const hoeken = [naarVlak(0, 0), naarVlak(bw, 0), naarVlak(0, bh), naarVlak(bw, bh)].map((p) => T.naarWereld(p.x, p.y));
    return {
      x0: Math.max(0, Math.floor(Math.min(...hoeken.map((p) => p.x))) - 1),
      y0: Math.max(0, Math.floor(Math.min(...hoeken.map((p) => p.y))) - 1),
      x1: Math.min(w.b - 1, Math.ceil(Math.max(...hoeken.map((p) => p.x))) + 1),
      y1: Math.min(w.h - 1, Math.ceil(Math.max(...hoeken.map((p) => p.y))) + 1),
    };
  }

  const PLATTEGROND = { gras: '#2f4a24', zandpad: '#7a6544', kasseien: '#5a5a58', water: '#26465f' };

  // Ver uitgezoomd tekent het spel niet meer mee (zie MIN_BEELD): dan zet het gereedschap zelf
  // een plattegrond neer. Geen kunst, wel het hele dorp in één beeld — precies wat Tiled niet kan
  // laten zien, want dit zijn de tegels zoals het spel ze léést.
  function tekenPlattegrond() {
    const w = S.wereld;
    const vak = inBeeld();
    ctx.fillStyle = '#0e1310';
    ctx.fillRect(0, 0, bw, bh);
    inVlak(() => {
      for (let y = vak.y0; y <= vak.y1; y++) {
        for (let x = vak.x0; x <= vak.x1; x++) {
          const soort = T.tegel(w, x, y);
          if (soort === 'buiten') continue;
          const g = w.grond[y][x];
          let kleur = (g && PLATTEGROND[g.naam]) || '#2f4a24';
          if (soort === 'muur') kleur = '#151a14';
          else if (soort === 'deur') kleur = '#8a6a3a';
          ctx.fillStyle = kleur;
          const p = T.naarScherm(x, y);
          T.ruit(ctx, p.x, p.y, 1);
          ctx.fill();
        }
      }
    });
  }

  // Een ruit op een tegel, in de kleur van een laag.
  function markeer(x, y, kleur, dik, maat) {
    const p = T.naarScherm(x, y);
    T.ruit(ctx, p.x, p.y, maat == null ? 0.88 : maat);
    ctx.strokeStyle = kleur;
    ctx.lineWidth = (dik || 1.5) / S.zoom;
    ctx.stroke();
  }

  function schrijf(x, y, tekst, kleur, omhoog) {
    if (!aan('namen')) return;
    const p = T.naarScherm(x, y);
    const maat = Math.max(9, 11 / S.zoom);
    ctx.font = `${maat}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    const breed = ctx.measureText(tekst).width;
    const hoog = maat + 4;
    const ty = p.y - (omhoog || 0);
    ctx.fillStyle = 'rgba(12, 10, 8, 0.72)';
    ctx.fillRect(p.x - breed / 2 - 3, ty - hoog + 3, breed + 6, hoog);
    ctx.fillStyle = kleur;
    ctx.fillText(tekst, p.x, ty);
  }

  function tekenLagen() {
    const w = S.wereld;
    const vak = inBeeld();
    inVlak(() => {
      if (aan('raster')) {
        ctx.strokeStyle = 'rgba(245, 230, 190, 0.22)';
        ctx.lineWidth = 1 / S.zoom;
        for (let y = vak.y0; y <= vak.y1; y++) {
          for (let x = vak.x0; x <= vak.x1; x++) {
            if (T.tegel(w, x, y) === 'buiten') continue;
            const p = T.naarScherm(x, y);
            T.ruit(ctx, p.x, p.y, 1);
            ctx.stroke();
          }
        }
      }

      if (aan('begaanbaar')) {
        for (let y = vak.y0; y <= vak.y1; y++) {
          for (let x = vak.x0; x <= vak.x1; x++) {
            const soort = T.tegel(w, x, y);
            if (soort === 'buiten') continue;
            ctx.fillStyle = T.isBegaanbaar(w, x, y) ? 'rgba(134, 196, 111, 0.22)' : 'rgba(224, 96, 79, 0.28)';
            const p = T.naarScherm(x, y);
            T.ruit(ctx, p.x, p.y, 0.94);
            ctx.fill();
          }
        }
      }

      if (aan('mensen')) {
        for (const e of w.wezens) {
          const kleur = e.kant === 'monster' ? '#e0604f' : e.soort === 'held' ? '#86c46f' : '#e2b64a';
          // De dwaalstraal als de ring waar hij binnen blijft: dezelfde rekensom als het dwalen
          // zelf (js/verkennen.js kijkt naar de afstand tot `thuis`).
          if (e.dwaalt && e.straal > 0) {
            ctx.fillStyle = 'rgba(226, 182, 74, 0.16)';
            for (let dy = -e.straal; dy <= e.straal; dy++) {
              for (let dx = -e.straal; dx <= e.straal; dx++) {
                if (Math.max(Math.abs(dx), Math.abs(dy)) > e.straal) continue;
                const x = e.thuis.x + dx;
                const y = e.thuis.y + dy;
                if (!T.isBegaanbaar(w, x, y)) continue;
                const p = T.naarScherm(x, y);
                T.ruit(ctx, p.x, p.y, 0.94);
                ctx.fill();
              }
            }
          }
          markeer(e.tx, e.ty, kleur, 2);
          schrijf(e.tx, e.ty, e.soort, kleur, 26);
        }
      }

      if (aan('quest')) {
        for (const v of w.questVoorwerpen || []) {
          const ligtEr = w.voorwerpen.includes(v);
          const kleur = ligtEr ? '#b98ce0' : 'rgba(185, 140, 224, 0.35)';
          markeer(v.x, v.y, kleur, 2);
          schrijf(v.x, v.y, `${v.soort} · ${v.grendel.quest}:${(v.grendel.fase || ['altijd']).join(',')}${ligtEr ? '' : ' (weg)'}`, kleur, 22);
        }
        for (const v of w.voorwerpen) {
          if (!v.raak) continue;
          markeer(v.x, v.y, '#d58cc0', 2);
          schrijf(v.x, v.y, `raak: ${v.raak}`, '#d58cc0', 22);
        }
      }

      if (aan('uitgangen')) {
        for (const o of w.overgangen || []) {
          markeer(o.x, o.y, '#6fa0e6', 2);
          schrijf(o.x, o.y, `→ ${o.naar}`, '#6fa0e6', 22);
          if (o.komt) {
            markeer(o.komt.x, o.komt.y, 'rgba(111, 160, 230, 0.55)', 1.5, 0.6);
            schrijf(o.komt.x, o.komt.y, 'komt aan', 'rgba(111, 160, 230, 0.8)', 12);
          }
        }
      }

      if (aan('klachten')) {
        for (const k of klachten) {
          if (k.x == null || k.kaart !== kaartNaam) continue;
          markeer(k.x, k.y, k.soort === 'fout' ? '#e0604f' : '#e2b64a', 2.5, 1.05);
        }
      }

      const t = vast || onderMuis;
      if (t) markeer(t.x, t.y, vast ? '#efe6d2' : 'rgba(239, 230, 210, 0.55)', 2, 1);
    });
  }

  // ---------------------------------------------------------------- de lus

  let vorige = 0;
  function lus(nu) {
    requestAnimationFrame(lus);
    const dt = Math.min(0.1, (nu - vorige) / 1000 || 0);
    vorige = nu;
    if (!S.wereld) return;
    S.tijd += dt;
    S.wind = T.windWaarde(S.tijd);
    const vak = canvas.parentElement.getBoundingClientRect();
    if (Math.round(vak.width) !== bw || Math.round(vak.height) !== bh) formaat();
    if (S.zoom >= MIN_BEELD) T.tekenScene(ctx, S, bw, bh);
    else tekenPlattegrond();
    tekenLagen();
  }

  // ---------------------------------------------------------------- opstarten

  async function begin() {
    bouwLagen();
    formaat();
    T.sprites.laad().then(() => {
      S.grond = null;
    });
    const namen = await haalNamen();
    const keuze = el('wt-kaart');
    for (const naam of namen) {
      const o = document.createElement('option');
      o.value = naam;
      o.textContent = naam;
      keuze.appendChild(o);
    }
    // De grootste kaart is meestal de kaart waaraan gewerkt wordt; anders de eerste.
    keuze.value = namen.includes('wereld') ? 'wereld' : namen[0];
    keuze.addEventListener('change', () => laadKaart(keuze.value));
    el('wt-verversen').addEventListener('click', () => laadKaart(keuze.value, true));
    el('wt-passend').addEventListener('click', passend);
    el('wt-ware').addEventListener('click', () => {
      zetZoom(1);
      if (vast) kijkNaar(vast.x, vast.y);
    });
    el('wt-los').addEventListener('click', () => {
      vast = null;
      toonTegel(onderMuis);
    });
    el('wt-quest').addEventListener('change', () => {
      zetFaseKeuze();
      pasQuestFaseToe();
    });
    el('wt-fase').addEventListener('change', pasQuestFaseToe);
    await laadKaart(keuze.value);
    requestAnimationFrame(lus);
  }

  begin().catch((e) => {
    status('Er ging iets mis: ' + e.message);
    console.error(e);
  });
})(globalThis.Toren = globalThis.Toren || {});
