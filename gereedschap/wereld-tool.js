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
  let objecten = []; // alles wat er op de kaart staat, uit Tiled en uit het betekenisbestand
  let klachten = [];
  let vast = null; // de tegel die met een klik is vastgezet
  let onderMuis = null;
  let bw = 0;
  let bh = 0;

  // De betekenisbestanden die dit blad open heeft, per kaart: wat erin staat, hoe het van schijf
  // kwam (voor de wacht tegen overschrijven) en of er sinds het laden iets veranderd is. Ze
  // blijven in het geheugen als je van kaart wisselt, want een aansluiting leg je nu juist op
  // twee kaarten tegelijk en dan mag het werk op de eerste niet verdwijnen.
  const open = new Map();
  let gekozen = null; // het ding uit het betekenisbestand dat aangeklikt is
  let aansluiting = null; // halverwege een aansluiting: { vanKaart, van, naar }
  const bewerken = () => el('wt-bewerken').checked;
  const nu = () => open.get(kaartNaam);
  const openKaarten = () => [...open.entries()];

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

  // ---------------------------------------------------------------- het betekenisbestand
  //
  // Dit is het enige bestand dat dit blad schrijft (zie ontwerp/kaarten.md, "Tiled tekent alleen
  // nog de grond"). Tiled komt er nooit in, dus er valt niets mee te botsen behalve een tweede
  // blad; daarvoor sturen we bij het opslaan mee hoe het bestand eruitzag toen we het lazen.
  async function haalBetekenis(naam) {
    try {
      const r = await fetch(`kaarten/${naam}.betekenis.json`, { cache: 'no-store' });
      if (r.ok) {
        const tekst = await r.text();
        return { inhoud: JSON.parse(tekst), tekst, vuil: false };
      }
    } catch (e) {
      /* los geopend blad: dan het gebundelde, en opslaan kan toch niet */
    }
    const uitBundel = T.BETEKENIS && T.BETEKENIS[naam];
    if (uitBundel) return { inhoud: JSON.parse(JSON.stringify(uitBundel)), tekst: null, vuil: false };
    // Nog geen betekenis voor deze kaart: dan beginnen we er een.
    return {
      inhoud: {
        versie: 1,
        uitleg: `De betekenis van kaarten/${naam}.tmj: mensen, deuren, doorgangen en aansluitingen. Tiled tekent de grond, dit bestand zegt wat het is. Geschreven door gereedschap/wereld.html.`,
        dingen: [],
      },
      tekst: null,
      vuil: false,
    };
  }

  // Er is iets veranderd: de wereld opnieuw laten maken door het spel zelf, opnieuw keuren, en
  // de knop Opslaan wakker maken. Dat kost op de grote kaart een paar milliseconden, dus het mag
  // gewoon bij elke wijziging.
  function veranderd() {
    const b = nu();
    if (b) b.vuil = true;
    herbouw();
    werkKnoppenBij();
  }

  function herbouw() {
    const b = nu();
    // Wat hier open staat, is wat de keuring moet zien — ook als het nog niet opgeslagen is.
    // T.GEBIEDEN leest T.BETEKENIS op het moment dat het een wereld maakt, dus door het daar neer
    // te zetten rekent de dekking (wie staat er nergens?) mee met wat je zojuist neerzette.
    T.BETEKENIS = T.BETEKENIS || {};
    for (const [naam, open] of openKaarten()) T.BETEKENIS[naam] = open.inhoud;
    const uitslag = T.keurKaart(kaartNaam, T.KAARTEN[kaartNaam], { betekenis: b && b.inhoud });
    const camera = { x: S.camera.x, y: S.camera.y };
    S.wereld = uitslag.wereld;
    S.wereld.gebied = kaartNaam;
    S.camera = camera;
    S.grond = null;
    objecten = T.kaartObjecten(T.KAARTEN[kaartNaam], b && b.inhoud);
    pasQuestFaseToe();
    keur(uitslag.klachten);
    toonTegel(vast || onderMuis);
  }

  function werkKnoppenBij() {
    const vuil = [...open.values()].filter((b) => b.vuil);
    const knop = el('wt-opslaan');
    knop.disabled = !vuil.length;
    knop.textContent = vuil.length > 1 ? `Opslaan (${vuil.length} kaarten)` : 'Opslaan';
    el('wt-neerzetten-paneel').classList.toggle('verborgen', !bewerken());
  }

  async function slaOp() {
    const teDoen = [...open.entries()].filter(([, b]) => b.vuil);
    for (const [naam, b] of teDoen) {
      status(`${naam} opslaan…`);
      const r = await fetch(`gereedschap/api/betekenis/${naam}`, {
        method: 'POST',
        body: JSON.stringify({ vorige: b.tekst, inhoud: b.inhoud }),
      });
      if (!r.ok) {
        status(`Niet opgeslagen: ${await r.text()}`);
        return;
      }
      const antwoord = await r.json();
      b.tekst = antwoord.tekst;
      b.vuil = false;
    }
    werkKnoppenBij();
    herbouw();
    // En meteen bundelen, want het spel leest kaarten/kaarten.js en niet de losse bestanden. Zo
    // is opslaan hier genoeg om het in het spel te zien, zonder npm run kaarten in een terminal.
    // En meteen bundelen. naar-kaarten.cjs schrijft kaarten.js ook als het over de tekening iets
    // te klagen heeft (een tegel in de verkeerde laag); dat is niet "mislukt", dat is een
    // opmerking. De hele uitvoer gaat naar de console, de statusregel houdt het kort.
    let gebundeld = ' (bundelen mislukte; draai npm run kaarten)';
    try {
      const r = await fetch('gereedschap/api/bundelen', { method: 'POST' });
      const uit = await r.text();
      console.log(uit);
      const klaar = /kaarten\.js klaar/.test(uit);
      const opmerkingen = (uit.match(/FOUT/g) || []).length;
      if (klaar) gebundeld = opmerkingen ? `, gebundeld (${opmerkingen} opmerking(en) over de tekening, zie de console)` : ' en gebundeld voor het spel';
    } catch (e) {
      /* geen server: dan blijft de melding hierboven staan */
    }
    status(`Opgeslagen${gebundeld}: ${teDoen.map(([n]) => n + '.betekenis.json').join(', ')}.`);
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
    // Wie deze kaart al open had met werk erin, houdt dat werk; anders van schijf.
    if (!open.has(naam) || !open.get(naam).vuil) open.set(naam, await haalBetekenis(naam));

    vast = null;
    onderMuis = null;
    gekozen = null;
    zetQuestKeuze();
    herbouw();
    werkKnoppenBij();
    if (!houdCamera) passend();
    const b = nu();
    status(`${naam} — ${S.wereld.b}×${S.wereld.h} tegels, ${objecten.length} dingen (${bron}), ${b.inhoud.dingen.length} met betekenis`);
    if (aansluiting && aansluiting.naar === naam) {
      el('wt-neerzetten-hint').textContent = `Klik de tegel waar je aankomt uit "${aansluiting.vanKaart}"`;
    }
  }

  // ---------------------------------------------------------------- neerzetten
  //
  // Wat je neerzet, is een gewoon vakje in het betekenisbestand: { x, y, wezen: 'bakker' } of
  // { x, y, tegel: 'bomen/eik' }. De velden en wat ze betekenen staan boven in js/kaart.js; hier
  // staat alleen hoe je ze met de muis legt.
  const penseel = {
    soort: 'wezen',
    wezen: 'bakker', zaad: 1, straal: 3,
    staat: 'dicht', vlag: '',
    naar: '', vel: 'bomen', tegel: 'eik', raak: '', quest: '',
  };
  const SOORTEN = [
    ['wezen', 'Wezen'],
    ['dorpeling', 'Dorpeling'],
    ['deur', 'Deur'],
    ['aansluiting', 'Aansluiting'],
    ['voorwerp', 'Voorwerp'],
  ];

  // Een rij met een label en een invoer; `maak` bouwt de invoer, `leg` zegt wat ermee gebeurt.
  function veld(doel, label, maak) {
    const rij = document.createElement('label');
    rij.className = 'wt-veld';
    const naam = document.createElement('span');
    naam.textContent = label;
    rij.append(naam, maak());
    doel.appendChild(rij);
  }

  function keuzeVeld(doel, label, waarden, waarde, kies) {
    veld(doel, label, () => {
      const k = document.createElement('select');
      for (const w of waarden) {
        const o = document.createElement('option');
        o.value = typeof w === 'string' ? w : w[0];
        o.textContent = typeof w === 'string' ? w : w[1];
        k.appendChild(o);
      }
      k.value = waarde;
      k.addEventListener('change', () => kies(k.value));
      return k;
    });
  }

  function tekstVeld(doel, label, waarde, zet, soort) {
    veld(doel, label, () => {
      const i = document.createElement('input');
      i.type = soort || 'text';
      i.value = waarde == null ? '' : waarde;
      i.addEventListener('change', () => zet(soort === 'number' ? Number(i.value) : i.value));
      return i;
    });
  }

  const velNamen = () => Object.keys(T.TEGELS || {});
  const tegelNamen = (vel) => {
    const v = T.TEGELS && T.TEGELS[vel];
    return v ? [...new Set(v.tiles.filter(Boolean).map((t) => t.naam))].sort() : [];
  };

  function bouwNeerzetten() {
    const doel = el('wt-neerzetten');
    doel.innerHTML = '';
    const rij = document.createElement('div');
    rij.className = 'wt-soorten';
    for (const [id, naam] of SOORTEN) {
      const knop = document.createElement('button');
      knop.type = 'button';
      knop.textContent = naam;
      knop.className = 'gt-mini' + (penseel.soort === id ? ' wt-aan' : '');
      knop.addEventListener('click', () => {
        penseel.soort = id;
        aansluiting = null;
        bouwNeerzetten();
      });
      rij.appendChild(knop);
    }
    doel.appendChild(rij);

    if (penseel.soort === 'wezen') {
      keuzeVeld(doel, 'wie', Object.keys(T.WEZENS), penseel.wezen, (v) => (penseel.wezen = v));
      tekstVeld(doel, 'dwaalstraal', penseel.straal, (v) => (penseel.straal = v), 'number');
    } else if (penseel.soort === 'dorpeling') {
      tekstVeld(doel, 'zaad', penseel.zaad, (v) => (penseel.zaad = v), 'number');
      tekstVeld(doel, 'dwaalstraal', penseel.straal, (v) => (penseel.straal = v), 'number');
    } else if (penseel.soort === 'deur') {
      keuzeVeld(doel, 'staat', ['dicht', 'open', 'opslot', 'geheim'], penseel.staat, (v) => {
        penseel.staat = v;
        bouwNeerzetten();
      });
      if (penseel.staat === 'geheim') {
        tekstVeld(doel, 'als vlag', penseel.vlag, (v) => (penseel.vlag = v));
      }
    } else if (penseel.soort === 'aansluiting') {
      const anders = [...el('wt-kaart').options].map((o) => o.value).filter((n) => n !== kaartNaam);
      if (!penseel.naar || !anders.includes(penseel.naar)) penseel.naar = anders[0] || 'toren';
      keuzeVeld(doel, 'naar', [...anders, 'toren'], penseel.naar, (v) => (penseel.naar = v));
      const uitleg = document.createElement('p');
      uitleg.className = 'gt-leeg';
      uitleg.textContent = 'Klik de tegel waar je hier vertrekt. Daarna springt het gereedschap naar die kaart en klik je waar je aankomt; beide kanten worden in één keer gelegd.';
      doel.appendChild(uitleg);
    } else if (penseel.soort === 'voorwerp') {
      keuzeVeld(doel, 'vel', velNamen(), penseel.vel, (v) => {
        penseel.vel = v;
        penseel.tegel = tegelNamen(v)[0] || '';
        bouwNeerzetten();
      });
      keuzeVeld(doel, 'tegel', tegelNamen(penseel.vel), penseel.tegel, (v) => (penseel.tegel = v));
      tekstVeld(doel, 'raak', penseel.raak, (v) => (penseel.raak = v));
      tekstVeld(doel, 'quest', penseel.quest, (v) => (penseel.quest = v));
    }
  }

  const dingenNu = () => (nu() ? nu().inhoud.dingen : []);
  const dingOp = (x, y) => dingenNu().find((d) => d.x === x && d.y === y) || null;

  // Waar land je als je hiernaartoe komt? Eén stap van de doorgang af, liefst naar onderen (dat is
  // "het huis uit"), en anders de eerste begaanbare buur. Zo hoeft Marcel "komt" nooit zelf te
  // bedenken, en kaatst hij nooit heen en weer tussen twee gebieden.
  function kiesKomt(w, x, y) {
    const om = [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]];
    for (const [dx, dy] of om) if (T.isBegaanbaar(w, x + dx, y + dy)) return { x: x + dx, y: y + dy };
    return null;
  }

  function maakDing(t) {
    if (penseel.soort === 'wezen') {
      const d = { x: t.x, y: t.y, wezen: penseel.wezen };
      if (penseel.straal > 0) d.straal = penseel.straal;
      return d;
    }
    if (penseel.soort === 'dorpeling') {
      const d = { x: t.x, y: t.y, zaad: penseel.zaad };
      if (penseel.straal > 0) d.straal = penseel.straal;
      return d;
    }
    if (penseel.soort === 'deur') {
      const d = { x: t.x, y: t.y, staat: penseel.staat };
      if (penseel.staat === 'geheim' && penseel.vlag) d.als = { vlag: penseel.vlag };
      return d;
    }
    if (penseel.soort === 'voorwerp') {
      const d = { x: t.x, y: t.y, tegel: `${penseel.vel}/${penseel.tegel}` };
      if (penseel.raak) d.raak = penseel.raak;
      if (penseel.quest) d.quest = penseel.quest;
      return d;
    }
    return null;
  }

  // Een aansluiting heeft twee kanten, en die leggen we in één handeling (ontwerp/kaarten.md).
  // Eerste klik: de tegel waar je hier vertrekt. Dan springt het blad naar de andere kaart, en de
  // tweede klik zegt waar je daar aankomt — inclusief de weg terug.
  async function legAansluiting(t) {
    if (!aansluiting) {
      const komt = kiesKomt(S.wereld, t.x, t.y);
      dingenNu().push({ x: t.x, y: t.y, overgang: penseel.naar, komt });
      aansluiting = { vanKaart: kaartNaam, van: { x: t.x, y: t.y }, naar: penseel.naar };
      veranderd();
      if (penseel.naar === 'toren') {
        // De toren staat in code (js/wereld.js) en heeft zijn eigen deur terug; daar valt niets
        // neer te zetten.
        aansluiting = null;
        el('wt-neerzetten-hint').textContent = 'De toren regelt zijn eigen kant.';
        return;
      }
      el('wt-kaart').value = penseel.naar;
      await laadKaart(penseel.naar, false);
      return;
    }
    const terug = aansluiting;
    aansluiting = null;
    dingenNu().push({ x: t.x, y: t.y, overgang: terug.vanKaart, komt: kiesKomt(S.wereld, t.x, t.y) });
    veranderd();
    el('wt-neerzetten-hint').textContent = `Aansluiting ${terug.vanKaart} ↔ ${terug.naar} ligt.`;
  }

  async function klikInBewerken(t) {
    if (penseel.soort === 'aansluiting') return legAansluiting(t);
    const er = dingOp(t.x, t.y);
    if (er) {
      gekozen = er;
      toonTegel(t);
      return;
    }
    const d = maakDing(t);
    if (!d) return;
    dingenNu().push(d);
    gekozen = d;
    veranderd();
  }

  function haalWeg(d) {
    const i = dingenNu().indexOf(d);
    if (i < 0) return;
    dingenNu().splice(i, 1);
    if (gekozen === d) gekozen = null;
    veranderd();
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
    const vak = canvas.getBoundingClientRect();
    const t = tegelOnder(e.clientX - vak.left, e.clientY - vak.top);
    // In de bewerkstand pakt de muis een ding op als er een onder ligt; anders schuift hij de
    // kaart, net als altijd.
    const ding = bewerken() && t && penseel.soort !== 'aansluiting' ? dingOp(t.x, t.y) : null;
    sleept = { mx: e.clientX, my: e.clientY, cx: S.camera.x, cy: S.camera.y, ver: 0, ding };
    canvas.classList.add('wt-sleept');
  });
  window.addEventListener('mousemove', (e) => {
    const vak = canvas.getBoundingClientRect();
    if (sleept) {
      const dx = e.clientX - sleept.mx;
      const dy = e.clientY - sleept.my;
      sleept.ver = Math.max(sleept.ver, Math.abs(dx) + Math.abs(dy));
      if (sleept.ding) {
        // Verslepen: pas opnieuw bouwen als hij werkelijk op een andere tegel komt, anders
        // herbouwen we de hele wereld bij elke muisbeweging.
        const t = tegelOnder(e.clientX - vak.left, e.clientY - vak.top);
        if (t && (t.x !== sleept.ding.x || t.y !== sleept.ding.y)) {
          sleept.ding.x = t.x;
          sleept.ding.y = t.y;
          vast = t;
          veranderd();
        }
        return;
      }
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
    const ding = sleept.ding;
    sleept = null;
    canvas.classList.remove('wt-sleept');
    if (!stil || e.target !== canvas) return;
    const vak = canvas.getBoundingClientRect();
    const t = tegelOnder(e.clientX - vak.left, e.clientY - vak.top);
    vast = t;
    if (bewerken() && t) {
      if (ding) gekozen = ding;
      klikInBewerken(t);
      return;
    }
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
    else if (e.key === 'Delete' || e.key === 'Backspace') {
      if (bewerken() && gekozen) haalWeg(gekozen);
    } else if (e.key === 'Escape') {
      vast = null;
      gekozen = null;
      if (aansluiting) {
        aansluiting = null;
        el('wt-neerzetten-hint').textContent = 'Aansluiting afgebroken; de ene kant staat er wel.';
      }
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

  // Hoe heet dit ding in één regel? Dezelfde volgorde als js/kaart.js hem uitlegt.
  function omschrijf(d) {
    if (d.wezen !== undefined) return d.wezen;
    if (d.zaad !== undefined) return `dorpeling (zaad ${d.zaad})`;
    if (d.staat !== undefined) return d.staat === 'geheim' ? 'geheime doorgang' : `deur (${d.staat})`;
    if (d.overgang !== undefined) return `aansluiting → ${d.overgang}`;
    if (d.tegel !== undefined) return String(d.tegel).split('/').pop();
    return 'ding';
  }

  // De velden van het gekozen ding. Alleen de velden die erbij horen, zodat er niets in staat wat
  // voor dit ding niets betekent.
  function bouwDingVelden(doel, d) {
    const zet = (sleutel) => (waarde) => {
      if (waarde === '' || waarde == null || (typeof waarde === 'number' && !Number.isFinite(waarde))) delete d[sleutel];
      else d[sleutel] = waarde;
      veranderd();
    };
    if (d.wezen !== undefined) {
      keuzeVeld(doel, 'wie', Object.keys(T.WEZENS), d.wezen, zet('wezen'));
      tekstVeld(doel, 'dwaalstraal', d.straal, zet('straal'), 'number');
    }
    if (d.zaad !== undefined) {
      tekstVeld(doel, 'zaad', d.zaad, zet('zaad'), 'number');
      tekstVeld(doel, 'dwaalstraal', d.straal, zet('straal'), 'number');
    }
    if (d.staat !== undefined) {
      keuzeVeld(doel, 'staat', ['dicht', 'open', 'opslot', 'geheim'], d.staat, (v) => {
        d.staat = v;
        if (v !== 'geheim') delete d.als;
        veranderd();
      });
      if (d.staat === 'geheim') {
        tekstVeld(doel, 'als vlag', (d.als && d.als.vlag) || '', (v) => {
          if (v) d.als = { vlag: v };
          else delete d.als;
          veranderd();
        });
      }
    }
    if (d.overgang !== undefined) {
      tekstVeld(doel, 'naar', d.overgang, zet('overgang'));
      tekstVeld(doel, 'komt aan', d.komt ? `${d.komt.x},${d.komt.y}` : '', (v) => {
        const k = String(v).split(',').map(Number);
        if (k.length === 2 && k.every(Number.isFinite)) d.komt = { x: k[0], y: k[1] };
        else delete d.komt;
        veranderd();
      });
      tekstVeld(doel, 'tekst', d.tekst, zet('tekst'));
    }
    if (d.tegel !== undefined) {
      const vel = String(d.tegel).split('/')[0];
      keuzeVeld(doel, 'vel', velNamen(), vel, (v) => {
        d.tegel = `${v}/${tegelNamen(v)[0] || ''}`;
        veranderd();
      });
      keuzeVeld(doel, 'tegel', tegelNamen(vel), String(d.tegel).split('/').pop(), (v) => {
        d.tegel = `${vel}/${v}`;
        veranderd();
      });
      tekstVeld(doel, 'raak', d.raak, zet('raak'));
      tekstVeld(doel, 'quest', d.quest, zet('quest'));
    }
    tekstVeld(doel, 'x', d.x, (v) => { d.x = Math.round(v); veranderd(); }, 'number');
    tekstVeld(doel, 'y', d.y, (v) => { d.y = Math.round(v); veranderd(); }, 'number');
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

    // In de bewerkstand staat bovenaan het ding zelf, met zijn velden om in te typen. Wat je hier
    // verandert, gaat rechtstreeks het betekenisbestand in.
    const d = bewerken() ? dingOp(t.x, t.y) : null;
    if (d) {
      gekozen = d;
      kop(doel, `${omschrijf(d)} — bewerken`);
      bouwDingVelden(doel, d);
      const weg = document.createElement('button');
      weg.type = 'button';
      weg.className = 'gt-mini gt-mini-x';
      weg.textContent = 'Weghalen';
      weg.addEventListener('click', () => haalWeg(d));
      doel.appendChild(weg);
    }

    kop(doel, `Tegel (${t.x}, ${t.y})`);
    const g = w.grond[t.y][t.x];
    rij(doel, 'grond', g ? `${g.naam} (${g.vel} #${g.id})` : '— niets getekend —', g ? '' : 'wt-nee');
    rij(doel, 'soort', T.tegel(w, t.x, t.y));
    rij(doel, 'begaanbaar', ja(T.isBegaanbaar(w, t.x, t.y)), kl(T.isBegaanbaar(w, t.x, t.y)));
    rij(doel, 'vast', ja(T.isVast(w, t.x, t.y)), kl(!T.isVast(w, t.x, t.y)));

    const deur = T.deurOp(w, t.x, t.y);
    if (deur) {
      kop(doel, 'Deur');
      rij(doel, 'staat', deur.staat + (deur.geheim ? ' (geheim, en de voorwaarde geldt)' : ''));
      rij(doel, 'richting', deur.richting);
    }
    for (const g of (w.geheimen || []).filter((g) => g.x === t.x && g.y === t.y && !w.deuren.has(t.x + ',' + t.y))) {
      kop(doel, 'Geheime doorgang');
      rij(doel, 'nu', 'ziet eruit als ' + g.onder, 'wt-nee');
      rij(doel, 'als', g.als ? JSON.stringify(g.als) : 'geen voorwaarde', g.als ? '' : 'wt-nee');
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

      // In de bewerkstand: een stipje op alles wat uit het betekenisbestand komt, want dat is
      // wat je hier kunt pakken en verslepen. Wat in Tiled staat, blijft van Tiled.
      if (bewerken()) {
        for (const d of dingenNu()) {
          markeer(d.x, d.y, d === gekozen ? '#efe6d2' : 'rgba(239, 230, 210, 0.45)', d === gekozen ? 2.5 : 1.2, 0.55);
        }
        if (aansluiting && aansluiting.vanKaart === kaartNaam) markeer(aansluiting.van.x, aansluiting.van.y, '#6fa0e6', 3, 1.1);
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
    el('wt-bewerken').addEventListener('change', () => {
      gekozen = null;
      aansluiting = null;
      bouwNeerzetten();
      werkKnoppenBij();
      toonTegel(vast || onderMuis);
    });
    el('wt-opslaan').addEventListener('click', slaOp);
    window.addEventListener('beforeunload', (e) => {
      if ([...open.values()].some((b) => b.vuil)) e.preventDefault();
    });
    await laadKaart(keuze.value);
    bouwNeerzetten();
    requestAnimationFrame(lus);
  }

  begin().catch((e) => {
    status('Er ging iets mis: ' + e.message);
    console.error(e);
  });
})(globalThis.Toren = globalThis.Toren || {});
