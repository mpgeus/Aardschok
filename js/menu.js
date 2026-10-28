// Het titelscherm en het menu (werklijst punt 3, vraag 48; Marcel, 28 sep: "Auto opslaan, maar ook zelf kunnen
// kiezen. Er moet ook een menu komen titel scherm etc", en op het plan: "A ja B ja C ja D ja"). Sinds vraag 172 (Marcel,
// 16 okt: "We hebben een volledig menu nodig geen a.i slop") een volledig menu, en geen stapel kaders meer.
//
// Het titelscherm is tekst over de wereld: links het woordmerk en de keuzes (Continue, New game, Load, Settings, Credits,
// en Quit in de Steam-versie), over een donker verloop, en rechts glijdt de camera over het land dat achter het scherm
// wacht (js/main.js, T.titelCamera). Een vaantje staat bij de keuze die je hebt: de muis en de pijltjes kiezen hetzelfde,
// Enter neemt hem. New game is een eigen scherm op die plek: de naam van je dorp, het land (zijn nummer en het eiland),
// en de spelregels, die daar vastliggen voor het hele spel (js/opties.js). Campaign ook (vraag 187, stap 2b; niet in de
// demo): de hoofdstukken op een rij (js/campagne.js). Load en Credits openen ernaast op papier.
// In het spel opent Esc, of de knop Menu, het menu op papier: Resume, Save, Load, Settings, Game rules (alleen lezen),
// Photo mode, To the title screen, en Quit. Settings (js/instellingen.js) en de spelregels (js/hud.js) zijn vensters die
// erbovenop opengaan; dicht is weer het menu. Het titelscherm en het menu zetten de tijd stil ('titel' en 'menu'). De
// regels van opslaan en laden staan in js/opslaan.js; dit bestand is alleen scherm.
(function (T) {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const veilig = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  // Wat er open is: het titelscherm of het menu, of niets. Daarin misschien een lijst op papier ('opslaan', 'laden' of
  // 'credits'), een vraag die eerst beantwoord moet worden, en wat er net gebeurde.
  let scherm = null;
  let lijst = null;
  let vraag = null; // { tekst, ja, doe }
  let melding = null;
  // Een geladen spel waarvan het land nog gemaakt wordt (js/main.js, T.maakOpenStukken): { plek, kop, klaar, open }. Dan
  // staat er alleen hoe ver het is, en gaat het menu dicht als het klaar is.
  let laadt = null;
  // Bij New game eerst de naam van je dorp (Marcel, 29 sep, werklijst vraag 60): het voorstel dat in het veld staat.
  let naamVoorstel = null;
  // Of de hoofdstukken van de campagne er staan (Campaign).
  let campagne = false;
  // Met welke spelregels het land achter het scherm gemaakt is: kies je bij New game andere, dan maakt Begin het opnieuw
  // (de hoogte maakt een ander land).
  let landRegels = null;

  T.ui.titelOpen = () => scherm === 'titel';
  T.ui.menuOpen = () => scherm === 'menu';

  // Afsluiten kan alleen in de verpakte versie (Electron, ontwerp/verpakken.md): daar sluit het venster, en dan het spel
  // (de schil in gereedschap/proefversie/maak.cjs). In de browser doet het niets, dus staat het er daar niet.
  const kanAfsluiten = () => typeof navigator !== 'undefined' && /Electron/.test(navigator.userAgent);

  // ── Hoe een bewaard spel heet ──

  const naamVanPlek = (plek) => (plek === 'auto' ? T.t('Autosave') : T.t('Slot {plek}', { plek }));

  // Wanneer, in echte tijd: "vandaag 21:40", "gisteren 9:12", of "27 sep 14:03".
  function wanneer(ms) {
    if (!ms) return '';
    const d = new Date(ms);
    const tijd = d.toLocaleTimeString(T.taalLocale(), { hour: '2-digit', minute: '2-digit' });
    const middernacht = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const dagen = Math.round((middernacht(new Date()) - middernacht(d)) / 86400000);
    if (dagen === 0) return T.t('today {tijd}', { tijd });
    if (dagen === 1) return T.t('yesterday {tijd}', { tijd });
    return `${d.toLocaleDateString(T.taalLocale(), { day: 'numeric', month: 'short' })} ${tijd}`;
  }

  // Een bewaard spel in één regel: hoe het dorp heet, de dag in het spel, hoe laat, hoeveel mensen, en wanneer je
  // opsloeg. Een spel van vóór 29 sep heeft geen naam.
  const beschrijf = (kop) =>
    `${kop.naam ? `${kop.naam} · ` : ''}` +
    T.t('{datum}, {uur} · {n|# person|# people} · {wanneer}', {
      datum: T.datumVanDag(kop.dag).tekst,
      uur: T.uurTekst(kop.dag),
      n: kop.bevolking,
      wanneer: wanneer(kop.bewaardOm),
    });

  // De spelregels in een paar woorden: Standard, of hoeveel er anders zijn (T.spelregelsAnders, js/opties.js).
  const regelsKort = (S) => {
    const n = T.spelregelsAnders(S);
    return n ? T.t('Custom: {n|# rule differs|# rules differ} from the default', { n }) : T.t('Standard');
  };

  // ── Wat er te zien is ──

  // Eén keuze: op het titelscherm tekst over de wereld, in het menu een regel op papier (stijl.css, .menu-keuze). `uit`
  // zegt waarom het niet kan; `open` als zijn lijst ernaast openstaat.
  function knop(actie, tekst, { uitleg = '', hoofd = false, uit = null, plek = null, open = false } = {}) {
    const klas = `menu-keuze${hoofd ? ' hoofd' : ''}${open ? ' open' : ''}`;
    return (
      `<button class="${klas}" data-actie="${actie}"${plek ? ` data-plek="${plek}"` : ''}${uit ? ' disabled' : ''}>` +
      `<span>${tekst}</span>${uit || uitleg ? `<small>${veilig(uit || uitleg)}</small>` : ''}</button>`
    );
  }

  function hoofdKeuzes(S) {
    const spellen = T.opgeslagenSpellen();
    if (scherm === 'titel') {
      const nieuwste = spellen.find((s) => !s.reden);
      return (
        (nieuwste ? knop('verder', T.t('Continue'), { uitleg: beschrijf(nieuwste.kop), hoofd: true }) : '') +
        (T.DEMO_INSTELLINGEN.aan ? '' : knop('campagne', T.t('Campaign'))) +
        knop('nieuw', T.t('New game'), { hoofd: !nieuwste }) +
        (spellen.length ? knop('laden', T.t('Load'), { open: lijst === 'laden' }) : '') +
        knop('instellingen', T.t('Settings')) +
        knop('credits', T.t('Credits'), { open: lijst === 'credits' }) +
        (kanAfsluiten() ? knop('afsluiten', T.t('Quit')) : '')
      );
    }
    return (
      knop('verder', T.t('Resume'), { hoofd: true }) +
      knop('opslaan', T.t('Save'), { uit: T.waaromNietOpslaan(S) }) +
      knop('laden', T.t('Load'), { uit: spellen.length ? null : T.t('Nothing has been saved yet.') }) +
      knop('instellingen', T.t('Settings')) +
      knop('spelregels', T.t('Game rules'), { uitleg: regelsKort(S) }) +
      knop('foto', T.t('Photo mode'), { uitleg: T.t('Everything off the screen, for a picture. H in the game.') }) +
      knop('titel', T.t('To the title screen')) +
      (kanAfsluiten() ? knop('afsluiten', T.t('Quit')) : '')
    );
  }

  // De plekken: om op te slaan de vijf eigen, leeg of niet; om te laden alles wat er staat, het nieuwste bovenaan
  // (T.opgeslagenSpellen).
  function plekKeuzes() {
    const spellen = T.opgeslagenSpellen();
    if (lijst === 'opslaan') {
      return T.opslagPlekken()
        .filter((plek) => plek !== 'auto')
        .map((plek) => {
          const s = spellen.find((x) => x.plek === plek);
          return knop('bewaar', naamVanPlek(plek), { plek, uitleg: s ? (s.reden ? s.reden : beschrijf(s.kop)) : T.t('empty') });
        })
        .join('');
    }
    return spellen.map((s) => knop('laad', naamVanPlek(s.plek), { plek: s.plek, uitleg: beschrijf(s.kop), uit: s.reden })).join('');
  }

  // Wie het spel maakte, en de letters (hun licentie, de OFL, staat in letters/).
  function credits() {
    return (
      `<div class="credits"><p class="credits-naam">${veilig(T.NAAM)}</p>` +
      `<p>${T.t('A game by Marcel, made with Claude.')}</p>` +
      `<p class="credits-kop">${T.t('Letters')}</p>` +
      `<p>${T.t('Grenze, by Omnibus-Type, and Alegreya, by Huerta Tipográfica; both under the SIL Open Font License.')}</p>` +
      (T.STAND ? `<p class="credits-stand">${veilig(T.STAND)}</p>` : '') +
      '</div>'
    );
  }

  // New game (vraag 172, 4): de naam van je dorp, het land (zijn nummer, een ander, en het eiland), de spelregels, Begin.
  function nieuwSpelScherm(S) {
    const land = landNu(S);
    return (
      `<p class="titel-kop">${T.t('New game')}</p>` +
      `<label class="menu-veld"><span>${T.t('Your village')}</span>` +
      `<input id="dorpsnaam" class="menu-invoer" type="text" maxlength="24" autocomplete="off" spellcheck="false" value="${veilig(naamNu != null ? naamNu : naamVoorstel)}"></label>` +
      (land != null
        ? `<div class="menu-veld"><label for="landzaad">${T.t('The land')}</label>` +
          `<div class="menu-land"><input id="landzaad" class="menu-invoer" type="text" inputmode="numeric" maxlength="5" autocomplete="off" spellcheck="false" value="${land}">` +
          `<button class="menu-keuze klein" data-actie="anderland" title="${T.t('Another land, from a new number')}"><span>${T.t('Other land')}</span></button></div>` +
          `<canvas id="eilandje" class="menu-eiland" width="1" height="1"></canvas></div>`
        : '') +
      knop('regels', T.t('Game rules'), { uitleg: regelsKort(S) }) +
      knop('begin', T.t('Begin'), { hoofd: true }) +
      knop('terug', T.t('Back'))
    );
  }

  // Campaign (vraag 187, stap 2b; js/campagne.js): de hoofdstukken op een rij. Wat af is, zegt het; wat nog op slot is,
  // zegt waarom.
  function campagneScherm() {
    const af = T.campagneAf();
    const rij = T.CAMPAGNE.hoofdstukken.map((h, i) =>
      knop('hoofdstuk', T.t('Chapter {n}: {titel}', { n: i + 1, titel: veilig(T.tGegevens(h.titel)) }), {
        plek: h.id,
        uitleg: af[h.id] ? T.t('Complete') : '',
        uit: T.hoofdstukOpen(h.id) ? null : T.t('Finish chapter {n} first.', { n: i }),
      }));
    return `<p class="titel-kop">${T.t('Campaign')}</p>` + rij.join('') + knop('terug', T.t('Back'));
  }

  function inhoud(S) {
    const bericht = melding ? `<p class="menu-melding">${veilig(melding)}</p>` : '';
    const vraagje = () => `<p class="menu-vraag">${veilig(vraag.tekst)}</p>` + knop('ja', vraag.ja, { hoofd: true }) + knop('terug', T.t('Back'));
    const laden = () => `<p class="menu-melding">${veilig(T.t('Loading the land… {klaar} of {open}', laadt))}</p>`;
    if (scherm === 'titel') {
      let links;
      if (laadt) links = laden();
      else if (vraag) links = vraagje();
      else if (naamVoorstel != null) links = nieuwSpelScherm(S);
      else if (campagne) links = campagneScherm();
      else links = hoofdKeuzes(S);
      // Load en Credits liggen op papier naast de keuzes.
      const naast = lijst
        ? `<div class="paneel menu-venster naast">` +
          `<div class="venster-kop"><span class="venster-titel">${lijst === 'credits' ? T.t('Credits') : T.t('Load')}</span>` +
          `<button class="venster-sluit" data-actie="terug" title="${T.t('Close (Esc)')}">✕</button></div>` +
          `<div class="menu-regels">${lijst === 'credits' ? credits() : plekKeuzes()}</div></div>`
        : '';
      const stand = T.STAND ? `<p class="menu-stand">${veilig(T.STAND)}</p>` : '';
      return (
        `<div class="titel-links"><h1 class="titel-naam">${veilig(T.NAAM)}</h1>` +
        `<div class="titel-keuzes${lijst ? ' achter' : ''}">${bericht}${links}</div></div>${naast}${stand}`
      );
    }
    let midden;
    if (laadt) midden = laden();
    else if (vraag) midden = vraagje();
    else if (lijst) midden = `<p class="menu-kop">${lijst === 'opslaan' ? T.t('Save to') : T.t('Load from')}</p>` + plekKeuzes() + knop('terug', T.t('Back'));
    else midden = hoofdKeuzes(S);
    const dag = S.kalender ? T.datumVanDag(S.kalender.dag).tekst : '';
    return (
      `<div class="paneel menu-venster">` +
      `<div class="venster-kop"><span class="venster-titel">${T.t('Menu')}</span><span class="venster-wanneer">${dag}</span>` +
      `<button class="venster-sluit" data-actie="verder" title="${T.t('Close (Esc)')}">✕</button></div>` +
      `<div class="menu-regels">${bericht}${midden}</div></div>`
    );
  }

  // Waar de pijltjes kiezen: op het papier als dat ernaast openstaat, anders alles.
  const keuzeVak = () => $('menu').querySelector('.menu-venster.naast') || $('menu');
  const keuzesIn = (vak) => [...vak.querySelectorAll('.menu-keuze:not(:disabled), .menu-invoer')]; // geen tekst
  const sleutelVan = (el) => el && (el.id || `${el.dataset.actie}|${el.dataset.plek || ''}`);

  // Opnieuw tekenen. Wat gekozen was, blijft gekozen (het vaantje); anders het veld van de naam, of de eerste keuze.
  function toon(S) {
    const doos = $('menu');
    const was = doos.contains(document.activeElement) ? sleutelVan(document.activeElement) : null;
    doos.className = scherm || 'verborgen';
    doos.innerHTML = scherm ? inhoud(S) : '';
    document.body.classList.toggle('nieuw-spel', scherm === 'titel' && naamVoorstel != null && !vraag);
    if (!scherm) return;
    const keuzes = keuzesIn(keuzeVak());
    const terug = was && keuzes.find((el) => sleutelVan(el) === was);
    const veld = $('dorpsnaam');
    if (terug) terug.focus({ preventScroll: true });
    else if (veld) {
      veld.focus();
      veld.select();
    } else if (keuzes.length) keuzes[0].focus({ preventScroll: true });
    if ($('eilandje')) tekenEiland(S);
  }

  // Na een venster erbovenop (de spelregels): het menu zegt weer wat er nu is (js/hud.js).
  T.ui.werkMenuBij = (S) => {
    if (scherm) toon(S);
  };

  // ── Het eiland bij New game ──

  // Het land achter het scherm, als ruit zoals de minikaart in het spel (js/balk.js, js/minikaart.js), met een gouden
  // stip waar je begint. Het beeld maakt de minikaart elk beeld een stukje verder (T.ui.werkMinikaartBij); zolang het niet
  // af is, tekent dit het opnieuw.
  function tekenEiland(S) {
    const doek = $('eilandje');
    const w = S.wereld;
    if (!doek || !w || !T.opEiland(w)) return;
    const E = T.eilandVan(w.eiland);
    const m = T.minikaartBeeld(E);
    const B = doek.clientWidth;
    const k = window.devicePixelRatio || 1;
    Object.assign(doek, { width: Math.round(B * k), height: Math.round((B / 2) * k) });
    const beeld = Object.assign(document.createElement('canvas'), { width: m.n, height: m.n });
    beeld.getContext('2d').putImageData(new ImageData(m.rgba, m.n, m.n), 0, 0);
    const c = doek.getContext('2d');
    c.imageSmoothingEnabled = false;
    const s = (B / (2 * T.EILAND_INSTELLINGEN.maat)) * T.MINIKAART_INSTELLINGEN.stap * k;
    c.setTransform(s, s / 2, -s, s / 2, (B / 2) * k, 0);
    c.drawImage(beeld, 0, 0);
    c.setTransform(k, 0, 0, k, 0, 0);
    const h = S.dorp.aanvoerder || S.dorp;
    if (h && h.x != null) {
      const p = T.minikaartPunt(h.x, h.y, B);
      c.fillStyle = '#1b1510';
      c.fillRect(Math.round(p.x) - 3, Math.round(p.y) - 3, 6, 6);
      c.fillStyle = '#e2b64a';
      c.fillRect(Math.round(p.x) - 2, Math.round(p.y) - 2, 4, 4);
    }
    if (m.klaar < m.n) requestAnimationFrame(() => tekenEiland(S));
  }

  // ── Open en dicht ──

  T.ui.toonTitel = function (S) {
    scherm = 'titel';
    lijst = null;
    vraag = null;
    melding = null;
    naamVoorstel = null;
    T.houdTijdStil(S, 'titel');
    document.body.classList.add('titelscherm');
    S.camera = T.titelCamera(); // meteen goed, zonder eerst over het dorp te schuiven
    toon(S);
  };

  // Het menu gaat alleen open als er niets anders openstaat: in een venster sluit Esc eerst dat venster
  // (js/main.js), en de brief net zo.
  T.ui.openMenu = function (S) {
    if (scherm || (S.modus !== 'verkennen' && S.modus !== 'gevecht') || T.ui.briefOpen()) return;
    scherm = 'menu';
    lijst = null;
    vraag = null;
    melding = null;
    S.bouwSoort = null; // een gebouw dat nog aan de muis hing, ligt weer weg
    S.bouwMenuOpen = false;
    T.ui.toonBouwmenu(S);
    T.houdTijdStil(S, 'menu');
    $('menu-knop').classList.add('actief');
    toon(S);
  };

  // Het titelscherm dicht zonder iets te kiezen (Spel.debug.laden, js/main.js).
  T.ui.sluitTitel = (S) => {
    if (scherm === 'titel') sluit(S);
  };

  function sluit(S) {
    const was = scherm;
    scherm = null;
    lijst = null;
    vraag = null;
    melding = null;
    naamVoorstel = null;
    campagne = false;
    document.body.classList.remove('titelscherm');
    $('menu-knop').classList.remove('actief');
    toon(S);
    if (was) T.laatTijdGaan(S, was);
  }

  // ── Wat een keuze doet ──

  // New game: eerst de naam van je dorp, met een voorstel (T.voorgesteldeDorpsnaam, js/treden.js). Het spel zelf
  // wacht al achter het titelscherm.
  function kiesNaam(S) {
    naamVoorstel = T.voorgesteldeDorpsnaam(S.dorp.lot && S.dorp.lot.zaad);
    landRegels = JSON.stringify(S.spelregels);
    toon(S);
  }

  // Het nummer van het land achter het titelscherm (js/maker.js), of null (een proefje).
  const landNu = (S) => (S.wereld && S.wereld.maker ? S.wereld.maker.zaad : null);
  // Wat er in het veld van de naam staat, als je het land verandert: dat blijft staan (tenzij het het voorstel was).
  let naamNu = null;

  // Een ander land achter het menu, uit dit nummer: een vers spel (js/main.js), dat net zo stil wacht, met de spelregels
  // die je nu koos. Het voorstel voor de naam hoort bij het land; wie zelf een naam typte, houdt die.
  function naarLand(S, zaad) {
    const veld = $('dorpsnaam');
    const getypt = veld && veld.value.trim();
    naamNu = getypt && getypt !== naamVoorstel ? getypt : null;
    T.nieuwSpel(zaad);
    T.houdTijdStil(S, 'titel');
    S.camera = T.titelCamera();
    naamVoorstel = T.voorgesteldeDorpsnaam(S.dorp.lot && S.dorp.lot.zaad);
    landRegels = JSON.stringify(S.spelregels);
  }

  // Het nummer in het veld van het land, als het een land is (1 tot T.MAKER_INSTELLINGEN.zaden), anders null.
  function gekozenLand() {
    const veld = $('landzaad');
    const n = veld && /^\d+$/.test(veld.value.trim()) ? Number(veld.value.trim()) : null;
    return n != null && n >= 1 && n <= T.MAKER_INSTELLINGEN.zaden ? n : null;
  }

  // Begin: de naam die er staat (leeg is het voorstel), op het land dat er staat, met de spelregels die er staan, en dan
  // de brief van de heer.
  function begin(S) {
    const land = gekozenLand();
    const zaad = land != null ? land : landNu(S);
    if (zaad != null && (zaad !== landNu(S) || JSON.stringify(S.spelregels) !== landRegels)) naarLand(S, zaad);
    const veld = $('dorpsnaam');
    T.zetDorpsnaam(S.dorp, (veld && veld.value.trim()) || naamVoorstel);
    naamNu = null;
    sluit(S);
    T.ui.toonBrief(S.dorp, 'benoeming'); // een nieuw spel begint met de brief van de heer (js/brieven.js)
  }

  // Een hoofdstuk beginnen (js/campagne.js): een nieuw spel met zijn level (op het eiland van de campagne, op zijn plek,
  // met zijn rand), het dorp met de naam van zijn plek, en dan de brief van de heer, zoals Begin bij New game. Het land
  // wordt meteen gemaakt (een seconde of zo).
  function speelHoofdstuk(S, id) {
    T.nieuwSpel(null, T.hoofdstukLevel(id));
    T.houdTijdStil(S, 'titel'); // zoals het spel achter het titelscherm; sluit laat hem gaan
    T.zetDorpsnaam(S.dorp, T.hoofdstukVan(id).plek);
    sluit(S);
    T.ui.toonBrief(S.dorp, 'benoeming');
  }

  function laad(S, plek) {
    const r = T.laadSpel(plek); // js/main.js: een nieuw spel, en het bewaarde erover
    lijst = null;
    if (!r.gelukt) {
      melding = r.reden;
      toon(S);
      return;
    }
    laadt = { plek, kop: r.kop, klaar: 0, open: 0 };
    toon(S);
  }
  // Hoe ver het land van het geladen spel is (js/main.js, elk beeld tot het klaar is); is het klaar, dan dicht.
  T.ui.landLaadt = function (S, r) {
    if (!laadt) return;
    Object.assign(laadt, r);
    if (r.klaar < r.open) return toon(S);
    const { plek, kop } = laadt;
    laadt = null;
    sluit(S);
    T.ui.bericht(T.t('{plek} loaded: {datum}.', { plek: naamVanPlek(plek), datum: T.datumVanDag(kop.dag).tekst }), 'goed');
  };

  function bewaar(S, plek) {
    const r = T.slaOp(S, plek);
    melding = r.gelukt ? T.t('Saved to slot {plek}.', { plek }) : r.reden;
    lijst = null;
    toon(S);
  }

  function doe(S, actie, plek) {
    if (laadt) return; // het land van een geladen spel komt nog (T.ui.landLaadt)
    melding = null;
    if (actie === 'ja') {
      const v = vraag;
      vraag = null;
      v.doe();
      return;
    }
    if (actie === 'terug') {
      if (vraag) vraag = null;
      else if (lijst) lijst = null;
      else if (naamVoorstel != null) naamVoorstel = naamNu = null;
      else if (campagne) campagne = false;
    } else if (actie === 'verder') {
      if (scherm === 'menu') return sluit(S);
      const nieuwste = T.nieuwsteSpel();
      if (nieuwste) return laad(S, nieuwste.plek);
    } else if (actie === 'nieuw') {
      lijst = null;
      // Wie een nieuw spel begint, overschrijft straks wat er vanzelf bewaard is; zijn eigen plekken niet.
      if (T.opgeslagenSpellen().some((s) => s.plek === 'auto')) {
        vraag = {
          tekst: T.t('Start a new game? The autosave will be overwritten. Your own slots stay.'),
          ja: T.t('New game'),
          doe: () => kiesNaam(S),
        };
      } else {
        return kiesNaam(S);
      }
    } else if (actie === 'begin') {
      return begin(S);
    } else if (actie === 'campagne') {
      lijst = null;
      campagne = true;
    } else if (actie === 'hoofdstuk') {
      if (!T.hoofdstukOpen(plek)) return;
      // Zoals bij New game: wat er vanzelf bewaard is, wordt straks overschreven; de eigen plekken niet.
      if (T.opgeslagenSpellen().some((s) => s.plek === 'auto')) {
        vraag = {
          tekst: T.t('Start this chapter? The autosave will be overwritten. Your own slots stay.'),
          ja: T.t('Begin'),
          doe: () => speelHoofdstuk(S, plek),
        };
      } else {
        return speelHoofdstuk(S, plek);
      }
    } else if (actie === 'anderland') {
      naarLand(S, T.nieuwLandZaad());
    } else if (actie === 'opslaan' || actie === 'laden' || actie === 'credits') {
      lijst = lijst === actie && scherm === 'titel' ? null : actie; // op het titelscherm: nog eens is dicht
    } else if (actie === 'instellingen') {
      lijst = null;
      toon(S);
      return T.ui.openInstellingen(S); // over het menu heen; dicht is weer het menu (js/instellingen.js)
    } else if (actie === 'spelregels') {
      return T.ui.openSpelregels(S, 'lezen'); // in het spel liggen ze vast (js/hud.js)
    } else if (actie === 'regels') {
      return T.ui.openSpelregels(S, 'nieuw'); // bij New game: de regels van het spel dat gaat beginnen
    } else if (actie === 'foto') {
      sluit(S);
      return T.zetFoto(true); // de fotomodus (js/main.js, werklijst vraag 146, e)
    } else if (actie === 'titel') {
      vraag = {
        tekst: T.t('Back to the title screen? Anything since your last save will be lost.'),
        ja: T.t('To the title screen'),
        doe: () => {
          sluit(S);
          T.naarTitelscherm();
        },
      };
    } else if (actie === 'afsluiten') {
      if (scherm === 'titel') return window.close();
      vraag = { tekst: T.t('Quit the game? Anything since your last save will be lost.'), ja: T.t('Quit'), doe: () => window.close() };
    } else if (actie === 'bewaar') {
      const s = T.opgeslagenSpellen().find((x) => x.plek === plek);
      if (!s) return bewaar(S, plek);
      vraag = {
        tekst: T.t('Overwrite {plek}? It now holds {wat}.', { plek: naamVanPlek(plek), wat: s.reden ? T.t('a game that no longer fits') : beschrijf(s.kop) }),
        ja: T.t('Overwrite'),
        doe: () => bewaar(S, plek),
      };
    } else if (actie === 'laad') {
      // Midden in een spel eerst vragen; op het titelscherm is er nog niets om kwijt te raken.
      if (scherm === 'titel') return laad(S, plek);
      vraag = { tekst: T.t('Load this game? Anything since your last save will be lost.'), ja: T.t('Load'), doe: () => laad(S, plek) };
    }
    toon(S);
  }

  $('menu').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b || b.disabled || !T.S) return;
    doe(T.S, b.dataset.actie, b.dataset.plek);
  });
  // De muis kiest wat de pijltjes kiezen: de keuze eronder krijgt het vaantje. Niet zolang je een naam typt.
  $('menu').addEventListener('mouseover', (ev) => {
    const b = ev.target.closest('.menu-keuze');
    const nu = document.activeElement;
    if (!b || b.disabled || b === nu || (nu && nu.tagName === 'INPUT' && $('menu').contains(nu))) return; // geen tekst
    if (!keuzeVak().contains(b)) return; // achter het papier ernaast
    b.focus({ preventScroll: true });
  });
  $('menu-knop').addEventListener('click', (ev) => {
    ev.currentTarget.blur();
    if (!T.S) return;
    if (scherm === 'menu') sluit(T.S);
    else T.ui.openMenu(T.S);
  });

  // Een stap omhoog of omlaag door de keuzes, rond.
  function stapKeuze(richting) {
    const keuzes = keuzesIn(keuzeVak());
    if (!keuzes.length) return;
    const i = keuzes.indexOf(document.activeElement);
    const volgende = keuzes[(i + richting + keuzes.length) % keuzes.length];
    volgende.focus({ preventScroll: true });
    if (volgende.tagName === 'INPUT') volgende.select(); // geen tekst
  }

  // Zolang het titelscherm of het menu open is, zijn de toetsen van hier: vóór die van het spel (js/main.js) en de
  // kalender (js/hud.js), die ze dus niet meer zien. De pijltjes kiezen, Enter neemt (in het veld van de naam: Begin), Esc
  // gaat een stap terug, of sluit het menu. Ligt er een venster bovenop (Settings, de spelregels), dan zijn de toetsen van
  // dat venster.
  window.addEventListener(
    'keydown',
    (ev) => {
      if (!scherm || !T.S || T.ui.vensterOpen()) return;
      ev.stopImmediatePropagation();
      const inVeld = ev.target && ev.target.tagName === 'INPUT'; // geen tekst
      if (ev.key === 'Enter' && inVeld && naamVoorstel != null) {
        ev.preventDefault();
        return doe(T.S, 'begin');
      }
      if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') {
        ev.preventDefault();
        return stapKeuze(ev.key === 'ArrowDown' ? 1 : -1);
      }
      if (ev.key !== 'Escape' || laadt) return;
      if (vraag || lijst || naamVoorstel != null || campagne) doe(T.S, 'terug');
      else if (scherm === 'menu') sluit(T.S);
    },
    true,
  );

  // ── Vanzelf opgeslagen ──

  // Elke ochtend (js/main.js, T.werkOpslaanBij): één woord in de hoek, dat weer wegvaagt. Lukte het niet, dan
  // zegt een bericht waarom, één keer zolang het spel open is.
  let fout = null;
  T.ui.opgeslagen = function (r) {
    if (!r.gelukt) {
      if (fout !== r.reden) {
        fout = r.reden;
        T.ui.bericht(T.t('The game could not autosave: {reden}', { reden: r.reden }), 'gevaar');
      }
      return;
    }
    const el = $('opgeslagen');
    el.classList.remove('flits');
    void el.offsetWidth; // zo begint het vagen opnieuw
    el.classList.add('flits');
  };
})(globalThis.Spel = globalThis.Spel || {});
