// De vertaaltool (gereedschap/vertalen.html, vraag 147; Marcel, 9 okt: "Ook moeten we een translate tool hebben.
// Mochten we leden uit de community krijgen die een vertaling willen maken."; 10 okt, over de eerste: "Slecht te
// lezen, Rommelig, Onduidelijk wat te doen").
//
// Bovenaan je taal, hoe ver je bent, en wat je ermee doet; daaronder drie stappen voor wie begint, de tabbladen (te
// doen, problemen, af, alles) en per Engelse zin (taal/bron.js) een kaartje met je vertaling. De {woorden} die het
// spel invult, staan als knopjes onder de zin: een klik zet ze in je vertaling. Wat je typt, bewaart de browser meteen:
//   - een taal die in taal/ staat (het Nederlands): je wijzigingen apart (T.KLAD_SLEUTEL), tot Save ze op onze server
//     in taal/<code>.js schrijft;
//   - een eigen taal (+ New language, of een bestand dat iemand stuurde): helemaal in de browser
//     (T.EIGEN_TALEN_SLEUTEL), en het spel in dezelfde browser kent hem meteen (js/taal.js), ook zonder server.
// Download geeft het bestand om te delen; Open leest het weer in, als gegevens (T.leesTaalBestand), nooit als code.
// Wat er mis is aan een vertaling, zegt T.keurVertaling (dezelfde als in test/taal.test.cjs); een zin die in de code
// veranderde, laat zijn oude vertaling achter, en de tool biedt die aan bij de zin die er het meest op lijkt.
(function (T) {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const BRON = T.TAAL_BRON || [];
  const BRONSET = new Set(BRON.map((z) => z.t));
  const OP_SERVER = /^https?:$/.test(location.protocol) && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  const PER_KEER = 200; // zoveel kaartjes tegelijk; Show more toont de rest
  const NIEUW = '__nieuw';

  // Waar een bestand in het spel is, in woorden voor een vertaler; stap 2 van vraag 147 zet er elk bestand bij dat omgaat.
  const GEBIEDEN = {
    'js/menu.js': 'Title screen and menu',
  };
  const gebiedVan = (f) => GEBIEDEN[f] || f.replace(/^js\//, '').replace(/\.js$/, '');

  // ── De browser ──

  const lees = (sleutel) => {
    try {
      return JSON.parse(localStorage.getItem(sleutel) || 'null');
    } catch (e) {
      return null;
    }
  };
  const schrijf = (sleutel, waarde) => {
    try {
      if (waarde == null) localStorage.removeItem(sleutel);
      else localStorage.setItem(sleutel, JSON.stringify(waarde));
      return true;
    } catch (e) {
      melding(`Your browser did not keep the change (${e.message}). Download the file to be safe.`);
      return false;
    }
  };
  const EIGEN = `${T.OPSLAG_SLEUTEL}.vertalen`;

  // ── De talen ──

  // De talen in taal/, zoals de scripts ze aanmeldden (zonder de eigen, die T.taal ook kent).
  const bestandsTalen = () => Object.values(T.TALEN).filter((t) => t.code !== T.BRONTAAL.code && !t.eigen);
  const isBestandsTaal = (code) => bestandsTalen().some((t) => t.code === code);

  let werk = null; // { code, naam, locale, zinnen }: wat er nu staat
  let basis = {}; // de zinnen uit taal/<code>.js (een eigen taal: leeg)

  function laadTaal(code) {
    if (isBestandsTaal(code)) {
      const t = T.TALEN[code];
      basis = { ...t.zinnen };
      const klad = lees(T.KLAD_SLEUTEL(code)) || {};
      const zinnen = { ...basis };
      for (const [k, v] of Object.entries(klad)) {
        if (v === null) delete zinnen[k];
        else zinnen[k] = v;
      }
      werk = { code, naam: t.naam, locale: t.locale, zinnen };
    } else {
      const eigen = T.eigenTalen()[code];
      basis = {};
      werk = eigen ? { code, naam: eigen.naam, locale: eigen.locale, zinnen: { ...eigen.zinnen } } : null;
    }
    schrijf(`${EIGEN}.taal`, code);
  }

  // Wat er veranderde ten opzichte van taal/<code>.js (null: weggehaald).
  function wijzigingen() {
    const uit = {};
    for (const [k, v] of Object.entries(werk.zinnen)) if (basis[k] !== v) uit[k] = v;
    for (const k of Object.keys(basis)) if (!(k in werk.zinnen)) uit[k] = null;
    return uit;
  }

  function bewaarLokaal() {
    if (isBestandsTaal(werk.code)) {
      const w = wijzigingen();
      schrijf(T.KLAD_SLEUTEL(werk.code), Object.keys(w).length ? w : null);
    } else {
      const alle = T.eigenTalen();
      alle[werk.code] = { code: werk.code, naam: werk.naam, locale: werk.locale, zinnen: werk.zinnen };
      schrijf(T.EIGEN_TALEN_SLEUTEL, alle);
    }
  }

  // ── Hoe een zin ervoor staat ──

  const vertaling = (t) => werk.zinnen[t] || '';
  const foutenVan = (t) => T.keurVertaling(t, vertaling(t), werk.locale);
  const staatVan = (t) => (!vertaling(t) ? 'ontbreekt' : foutenVan(t).length ? 'fout' : 'af');
  const telling = () => {
    const n = { ontbreekt: 0, fout: 0, af: 0, alles: BRON.length };
    for (const z of BRON) n[staatVan(z.t)]++;
    return n;
  };

  // De zinnen die niet meer in het spel staan (de code veranderde), met hun vertaling.
  const over = () => Object.keys(werk.zinnen).filter((k) => !BRONSET.has(k));

  // Hoe veel twee zinnen op elkaar lijken, van 0 tot 1 (de afstand van Levenshtein, naar de lengte).
  function lijkt(a, b) {
    if (a === b) return 1;
    const n = a.length;
    const m = b.length;
    if (!n || !m || Math.max(n, m) > 400) return 0;
    let vorige = Array.from({ length: m + 1 }, (_, j) => j);
    for (let i = 1; i <= n; i++) {
      const rij = [i];
      for (let j = 1; j <= m; j++) rij[j] = Math.min(vorige[j] + 1, rij[j - 1] + 1, vorige[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      vorige = rij;
    }
    return 1 - vorige[m] / Math.max(n, m);
  }
  function voorstelVoor(t) {
    let beste = null;
    for (const k of over()) {
      const s = lijkt(t, k);
      if (s >= 0.5 && (!beste || s > beste.s)) beste = { k, s };
    }
    return beste;
  }

  // De stukken tussen { en } op het bovenste niveau van een zin: '{plek}', '{n|# person|# people}'.
  function blokkenIn(tekst) {
    const uit = [];
    let diep = 0;
    let begin = -1;
    for (let i = 0; i < tekst.length; i++) {
      if (tekst[i] === '{' && diep++ === 0) begin = i;
      else if (tekst[i] === '}' && diep > 0 && --diep === 0) uit.push(tekst.slice(begin, i + 1));
    }
    return [...new Set(uit)];
  }
  const naamVanBlok = (b) => b.slice(1, -1).split('|')[0].trim();
  const vormenVan = (b) => b.slice(1, -1).split('|').slice(1);
  const isKeuze = (b) => vormenVan(b).some((v) => /^[^#\s{][^:]*:/.test(v));
  // Of het woord in de vertaling staat: {plek}, of {n| voor een meervoud.
  const staatErin = (b, tekst) => new RegExp(`\\{\\s*${naamVanBlok(b).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[|}]`).test(tekst);

  // ── Het scherm ──

  let filter = 'ontbreekt';
  let gebied = null; // het deel van het spel links, of null: alles
  let getoond = PER_KEER;

  function melding(tekst) {
    const el = $('vt-melding');
    el.textContent = tekst;
    el.classList.add('vt-aan');
    clearTimeout(melding.klok);
    melding.klok = setTimeout(() => el.classList.remove('vt-aan'), 6000);
  }

  function toonKop() {
    const knoppen = ['vt-download', 'vt-spelen'].map($);
    for (const k of knoppen) k.disabled = !werk;
    $('vt-opslaan').hidden = !OP_SERVER || !werk;
    // Op onze server is opslaan in het spel het hoofdwerk; elders het bestand dat je deelt.
    $('vt-download').classList.toggle('vt-hoofd', !OP_SERVER);
    if (!werk) {
      $('vt-telling').textContent = 'No language chosen yet';
      $('vt-balk-vol').style.width = '0';
      $('vt-bewaard').textContent = '';
      return;
    }
    const n = telling();
    const pct = BRON.length ? Math.floor((100 * n.af) / BRON.length) : 100;
    $('vt-telling').textContent = `${n.af} of ${BRON.length} sentences translated (${pct}%)`;
    $('vt-balk-vol').style.width = `${pct}%`;
    if (isBestandsTaal(werk.code)) {
      const w = Object.keys(wijzigingen()).length;
      $('vt-bewaard').textContent = w
        ? `${w} change${w === 1 ? '' : 's'} kept in this browser, not yet in the game${OP_SERVER ? ': press Save' : ''}`
        : 'Everything is in the game';
    } else {
      $('vt-bewaard').textContent = 'Kept in this browser as you type · download the file to share it';
    }
  }

  function toonTalen() {
    const keuze = $('vt-taal');
    const talen = T.talen().filter((t) => t.code !== T.BRONTAAL.code);
    // ook een eigen taal die na het laden van de bladzijde kwam
    for (const e of Object.values(T.eigenTalen())) if (!talen.some((t) => t.code === e.code)) talen.push({ ...e, eigen: true });
    keuze.innerHTML =
      (werk ? '' : '<option value="" selected disabled>Choose…</option>') +
      talen
        .map((t) => `<option value="${esc(t.code)}"${werk && werk.code === t.code ? ' selected' : ''}>${esc(t.naam)} (${esc(t.code)})${t.eigen ? ' · in this browser' : ''}</option>`)
        .join('') +
      `<option value="${NIEUW}">+ New language…</option>`;
  }

  function toonTabs() {
    const n = werk ? telling() : { ontbreekt: 0, fout: 0, af: 0, alles: BRON.length };
    for (const tab of document.querySelectorAll('.vt-tab')) {
      const f = tab.dataset.filter;
      tab.querySelector('b').textContent = n[f];
      tab.classList.toggle('vt-hier', f === filter);
      tab.classList.toggle('vt-rood', f === 'fout' && n.fout > 0);
    }
  }

  // Links de delen van het spel, als het er meer dan één zijn.
  function toonLijst() {
    const gebieden = [];
    for (const z of BRON) for (const w of z.waar) if (!gebieden.includes(w)) gebieden.push(w);
    const weg = werk ? over() : [];
    const lijst = $('vt-lijst');
    lijst.hidden = gebieden.length < 2 && !weg.length;
    if (lijst.hidden) return;
    const open = (zinnen) => (werk ? zinnen.filter((z) => staatVan(z.t) !== 'af').length : zinnen.length);
    const regel = (sleutel, label, n) =>
      `<a data-gebied="${esc(sleutel)}" class="${(gebied || '') === sleutel ? 'vt-hier' : ''}">${esc(label)} <span>${n ? `${n} to do` : '✓'}</span></a>`;
    lijst.innerHTML =
      '<h3>Where in the game</h3>' +
      regel('', 'Everything', open(BRON)) +
      gebieden.map((g) => regel(g, gebiedVan(g), open(BRON.filter((z) => z.waar.includes(g))))).join('') +
      (weg.length ? `<a data-gebied="(over)" class="${gebied === '(over)' ? 'vt-hier' : ''}">No longer in the game <span>${weg.length}</span></a>` : '');
  }

  // De Engelse zin, met wat tussen { en } staat als een woord van het spel.
  const toonBron = (t) => esc(t).replace(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, (m) => `<span class="vt-woord">${m}</span>`);

  // Onder je vertaling: de woorden die erin moeten, wat er mis is, en hoe een meervoud of een keuze gaat.
  function hulpVan(z) {
    const tekst = vertaling(z.t);
    const blokken = blokkenIn(z.t);
    let html = '';
    if (blokken.length) {
      html +=
        `<div class="vt-hulp">The game fills in: ` +
        blokken
          .map((b) => {
            const label = vormenVan(b).length ? `{${naamVanBlok(b)}|…}` : b;
            return `<button type="button" class="vt-chip${staatErin(b, tekst) ? ' vt-erin' : ''}" data-voeg="${esc(b)}" title="Put ${esc(b)} in your translation">${esc(label)}</button>`;
          })
          .join('') +
        `</div>`;
    }
    for (const b of blokken.filter((b) => vormenVan(b).length)) {
      const naam = naamVanBlok(b);
      if (isKeuze(b)) {
        html += `<p class="vt-meervoud"><span class="vt-woord">{${esc(naam)}|…}</span> picks a word: keep what stands before each colon, and translate what follows it.</p>`;
      } else {
        const vormen = T.meervoudsVormen(werk.locale);
        html +=
          `<p class="vt-meervoud"><span class="vt-woord">{${esc(naam)}|…}</span> is a number. ${esc(werk.naam)} writes it in ${vormen.length} form${vormen.length === 1 ? '' : 's'} ` +
          `(${vormen.join(', ')}): <span class="vt-woord">{${esc(naam)}|${vormen.map((v) => `form for ${v}`).join('|')}}</span>, with # for the number.</p>`;
      }
    }
    const fout = tekst ? foutenVan(z.t) : [];
    for (const f of fout) html += `<p class="vt-melding-fout">${esc(f)}</p>`;
    const voorstel = !tekst ? voorstelVoor(z.t) : null;
    if (voorstel) {
      html +=
        `<div class="vt-voorstel">This English sentence changed. You translated an earlier version:<br>` +
        `“${esc(voorstel.k)}” → <b>“${esc(werk.zinnen[voorstel.k])}”</b><br>` +
        `<button type="button" class="vt-knop vt-klein" data-neem="${esc(voorstel.k)}">Use it, and adjust</button></div>`;
    }
    return html;
  }

  function zin(z) {
    const waar = z.waar.map(gebiedVan).join(', ');
    return (
      `<article class="vt-zin vt-${staatVan(z.t) === 'ontbreekt' ? 'mist' : staatVan(z.t)}" data-t="${esc(z.t)}">` +
      `<div><p class="vt-engels">${toonBron(z.t)}</p><p class="vt-waar">${esc(waar)}</p></div>` +
      `<div><textarea rows="1" spellcheck="true" lang="${esc(werk.code)}" placeholder="Your translation" aria-label="Translation">${esc(vertaling(z.t))}</textarea>` +
      `<div class="vt-onder">${hulpVan(z)}</div></div>` +
      `</article>`
    );
  }

  const groei = (vak) => {
    vak.style.height = 'auto';
    vak.style.height = `${vak.scrollHeight + 2}px`;
  };

  function toonInhoud() {
    const doos = $('vt-inhoud');
    if (!werk) {
      doos.innerHTML = '<p class="vt-leeg">Choose your language at the top, or start a new one.</p>';
      return;
    }
    if (gebied === '(over)') {
      doos.innerHTML =
        `<p class="vt-waar">These sentences changed or left the game. Where a new sentence looks like one of them, its card offers the old translation. Forget them when they are of no more use.</p>` +
        over()
          .map(
            (k) =>
              `<article class="vt-zin"><div><p class="vt-engels">${toonBron(k)}</p></div>` +
              `<div class="vt-vergeet"><span>${esc(werk.zinnen[k])}</span><button type="button" class="vt-knop vt-klein" data-vergeet="${esc(k)}">Forget</button></div></article>`,
          )
          .join('');
      return;
    }
    const zoek = $('vt-zoek').value.trim().toLowerCase();
    const zinnen = BRON.filter(
      (z) =>
        (!gebied || z.waar.includes(gebied)) &&
        (filter === 'alles' || staatVan(z.t) === filter) &&
        (!zoek || z.t.toLowerCase().includes(zoek) || vertaling(z.t).toLowerCase().includes(zoek)),
    );
    const leeg = { ontbreekt: 'Nothing left to translate here. Well done!', fout: 'No problems.', af: 'Nothing translated here yet.', alles: 'No sentences.' };
    doos.innerHTML =
      (zinnen.length ? zinnen.slice(0, getoond).map(zin).join('') : `<p class="vt-leeg">${zoek ? 'Nothing matches your search.' : leeg[filter]}</p>`) +
      (zinnen.length > getoond ? `<button type="button" class="vt-knop vt-meer" data-meer>Show ${Math.min(PER_KEER, zinnen.length - getoond)} more (${zinnen.length - getoond} left)</button>` : '');
    for (const vak of doos.querySelectorAll('textarea')) groei(vak);
  }

  function toonUitleg() {
    $('vt-uitleg').hidden = !!lees(`${EIGEN}.uitlegGezien`) && !!werk;
    $('vt-stap3').innerHTML = OP_SERVER
      ? '<b>Save</b> writes your language into the game (taal/). <b>Play in this language</b> shows it in the game right away.'
      : '<b>Download file</b> and send it to us. <b>Play in this language</b> shows your translation in the game right away, in this browser.';
  }

  function toonAlles() {
    toonTalen();
    toonKop();
    toonTabs();
    toonLijst();
    toonInhoud();
    toonUitleg();
  }

  // Na het typen alleen dit kaartje, de kop en de tellers, zodat de cursor blijft staan (en een vertaalde zin pas bij
  // een ander tabblad uit Te doen gaat).
  function werkZinBij(el) {
    const t = el.dataset.t;
    const staat = staatVan(t);
    el.className = `vt-zin vt-${staat === 'ontbreekt' ? 'mist' : staat}`;
    el.querySelector('.vt-onder').innerHTML = hulpVan(BRON.find((z) => z.t === t));
    toonKop();
    toonTabs();
  }

  // ── Wat je doet ──

  let wachten = null;
  $('vt-inhoud').addEventListener('input', (ev) => {
    const vak = ev.target.closest('textarea');
    if (!vak || !werk) return;
    const el = vak.closest('.vt-zin');
    if (vak.value === '') delete werk.zinnen[el.dataset.t];
    else werk.zinnen[el.dataset.t] = vak.value;
    groei(vak);
    werkZinBij(el);
    clearTimeout(wachten);
    wachten = setTimeout(() => {
      bewaarLokaal();
      toonLijst();
    }, 300);
  });
  // Ctrl+Enter: naar de volgende zin.
  $('vt-inhoud').addEventListener('keydown', (ev) => {
    if (ev.key !== 'Enter' || !(ev.ctrlKey || ev.metaKey) || !ev.target.closest('textarea')) return;
    ev.preventDefault();
    const vakken = [...$('vt-inhoud').querySelectorAll('textarea')];
    const volgende = vakken[vakken.indexOf(ev.target) + 1];
    if (volgende) volgende.focus();
  });

  $('vt-inhoud').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-meer')) {
      getoond += PER_KEER;
      return toonInhoud();
    }
    const el = b.closest('.vt-zin');
    if (b.dataset.voeg) {
      // Het woord waar de cursor staat, of achteraan.
      const vak = el.querySelector('textarea');
      const begin = document.activeElement === vak ? vak.selectionStart : vak.value.length;
      const eind = document.activeElement === vak ? vak.selectionEnd : vak.value.length;
      vak.focus();
      vak.setRangeText(b.dataset.voeg, begin, eind, 'end');
      vak.dispatchEvent(new Event('input', { bubbles: true }));
      return;
    }
    if (b.dataset.neem) {
      werk.zinnen[el.dataset.t] = werk.zinnen[b.dataset.neem];
      delete werk.zinnen[b.dataset.neem];
      bewaarLokaal();
      const vak = el.querySelector('textarea');
      vak.value = werk.zinnen[el.dataset.t];
      groei(vak);
      werkZinBij(el);
      toonLijst();
      vak.focus();
      return;
    }
    if (b.dataset.vergeet) {
      delete werk.zinnen[b.dataset.vergeet];
      bewaarLokaal();
      toonAlles();
    }
  });
  // Een knopje met een woord neemt de cursor niet uit het vak.
  $('vt-inhoud').addEventListener('mousedown', (ev) => {
    if (ev.target.closest('.vt-chip')) ev.preventDefault();
  });

  $('vt-lijst').addEventListener('click', (ev) => {
    const a = ev.target.closest('a[data-gebied]');
    if (!a) return;
    gebied = a.dataset.gebied || null;
    getoond = PER_KEER;
    toonLijst();
    toonInhoud();
    $('vt-inhoud').scrollTop = 0;
  });

  document.querySelector('.vt-tabs').addEventListener('click', (ev) => {
    const tab = ev.target.closest('.vt-tab');
    if (!tab) return;
    filter = tab.dataset.filter;
    if (gebied === '(over)') gebied = null;
    getoond = PER_KEER;
    toonTabs();
    toonLijst();
    toonInhoud();
  });
  $('vt-zoek').addEventListener('input', () => {
    getoond = PER_KEER;
    toonInhoud();
  });

  // De eerste tab: wat er te doen is, en anders alles.
  const kiesBeginTab = () => {
    filter = werk && telling().ontbreekt ? 'ontbreekt' : 'alles';
  };

  $('vt-taal').addEventListener('change', (ev) => {
    if (ev.target.value === NIEUW) {
      toonTalen(); // de keuze terug op de taal van nu
      $('vt-nieuw').hidden = false;
      $('vt-nieuw-naam').focus();
      return;
    }
    laadTaal(ev.target.value);
    gebied = null;
    getoond = PER_KEER;
    kiesBeginTab();
    toonAlles();
  });

  $('vt-nieuw-weg').addEventListener('click', () => {
    $('vt-nieuw').hidden = true;
  });
  $('vt-nieuw').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const code = $('vt-nieuw-code').value.trim();
    const naam = $('vt-nieuw-naam').value.trim() || code;
    if (!T.isTaalCode(code) || code === T.BRONTAAL.code) return melding(`“${code}” is not a language code we can use. Try de, fr, es or pt-BR.`);
    if (isBestandsTaal(code) || T.eigenTalen()[code]) return melding(`There already is a language ${code}: choose it at the top.`);
    let locale = code;
    try {
      // de → de-DE (voor het meervoud en de datum); een code met een streek of schrift (pt-BR, zh-Hans) blijft zoals hij is
      const l = new Intl.Locale(code).maximize();
      if (!code.includes('-') && l.region) locale = `${l.language}-${l.region}`;
    } catch (e) {
      // dan de code zelf
    }
    werk = { code, naam, locale, zinnen: {} };
    basis = {};
    bewaarLokaal();
    laadTaal(code);
    $('vt-nieuw').hidden = true;
    $('vt-nieuw').reset();
    filter = 'ontbreekt';
    gebied = null;
    toonAlles();
    melding(`${naam} is ready. Start with the first sentence below.`);
    const eerste = $('vt-inhoud').querySelector('textarea');
    if (eerste) eerste.focus();
  });

  $('vt-uitleg-weg').addEventListener('click', () => {
    schrijf(`${EIGEN}.uitlegGezien`, true);
    $('vt-uitleg').hidden = true;
  });

  $('vt-download').addEventListener('click', () => {
    if (!werk) return;
    const blob = new Blob([T.schrijfTaalBestand(werk)], { type: 'text/javascript' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${werk.code}.js`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    melding(`Downloaded ${werk.code}.js. Send it to us, or open it here again later with Open file.`);
  });

  $('vt-open-knop').addEventListener('click', () => $('vt-open').click());
  $('vt-open').addEventListener('change', async (ev) => {
    const f = ev.target.files[0];
    ev.target.value = '';
    if (!f) return;
    let def;
    try {
      def = T.leesTaalBestand(await f.text());
    } catch (e) {
      return melding(`${f.name} is not a language file (${e.message}).`);
    }
    if (def.code === T.BRONTAAL.code) return melding('English is the source of the game; it has no language file.');
    const bestaat = isBestandsTaal(def.code) || T.eigenTalen()[def.code];
    if (bestaat && !confirm(`Replace what you have for ${def.naam} (${def.code}) with ${f.name}?`)) return;
    if (isBestandsTaal(def.code)) {
      laadTaal(def.code);
      werk.zinnen = { ...def.zinnen };
    } else {
      werk = def;
      basis = {};
    }
    bewaarLokaal();
    laadTaal(def.code);
    kiesBeginTab();
    toonAlles();
    melding(`Opened ${f.name}: ${Object.keys(def.zinnen).length} sentences.`);
  });

  $('vt-opslaan').addEventListener('click', async () => {
    if (!werk) return;
    try {
      const r = await fetch(`api/taal/${encodeURIComponent(werk.code)}`, { method: 'POST', body: T.schrijfTaalBestand(werk) });
      const uit = await r.json();
      if (!uit.ok) return melding(`Not saved: ${uit.fout}`);
      if (isBestandsTaal(werk.code)) {
        basis = { ...werk.zinnen };
        T.TALEN[werk.code].zinnen = { ...werk.zinnen };
        schrijf(T.KLAD_SLEUTEL(werk.code), null);
      }
      toonKop();
      melding(
        uit.nieuw
          ? `Saved ${uit.bestand}. A new language: add <script src="${uit.bestand}"></script> to index.html and gereedschap/vertalen.html, after taal/nl.js.`
          : `Saved ${uit.bestand}.`,
      );
    } catch (e) {
      melding(`Not saved: ${e.message}`);
    }
  });

  $('vt-spelen').addEventListener('click', () => {
    if (!werk) return;
    bewaarLokaal();
    const klad = isBestandsTaal(werk.code) && Object.keys(wijzigingen()).length ? '&klad=1' : '';
    window.open(`../index.html?taal=${encodeURIComponent(werk.code)}${klad}`, '_blank');
  });

  // ── Begin ──

  const eerder = lees(`${EIGEN}.taal`);
  const talen = T.talen().filter((t) => t.code !== T.BRONTAAL.code);
  const begin = talen.find((t) => t.code === eerder) || null;
  if (begin) laadTaal(begin.code);
  kiesBeginTab();
  toonAlles();
  if (!BRON.length) melding('taal/bron.js is empty: run npm run teksten first.');
})(globalThis.Spel);
