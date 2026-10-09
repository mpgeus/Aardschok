// De vertaaltool (gereedschap/vertalen.html, vraag 147; Marcel, 9 okt: "Ook moeten we een translate tool hebben.
// Mochten we leden uit de community krijgen die een vertaling willen maken.").
//
// Links de bestanden van het spel, rechts per Engelse zin (taal/bron.js) wat hij in jouw taal is. Wat je typt, bewaart
// de browser meteen, dus er gaat niets verloren:
//   - een taal die in taal/ staat (het Nederlands): je wijzigingen apart (T.KLAD_SLEUTEL), tot Opslaan ze op onze server
//     in taal/<code>.js schrijft;
//   - een eigen taal (Nieuwe taal, of een bestand dat iemand deelde): helemaal in de browser (T.EIGEN_TALEN_SLEUTEL), en
//     het spel in dezelfde browser kent hem meteen (js/taal.js), ook zonder server.
// Download geeft het bestand om te delen; Open leest het weer in, als gegevens (T.leesTaalBestand), nooit als code.
//
// Wat er mis is aan een vertaling, zegt T.keurVertaling (dezelfde als in test/taal.test.cjs); een zin die in de code
// veranderde, laat zijn oude vertaling achter, en de tool biedt die aan bij de zin die er het meest op lijkt.
(function (T) {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const BRON = T.TAAL_BRON || [];
  const BRONSET = new Set(BRON.map((z) => z.t));
  const OP_SERVER = /^https?:$/.test(location.protocol) && /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  const PER_KEER = 250; // zoveel rijen tegelijk; Meer toont de rest

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
    try {
      localStorage.setItem(`${T.OPSLAG_SLEUTEL}.vertalen.taal`, code);
    } catch (e) {
      // dan kiest de tool de volgende keer opnieuw
    }
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
    toonStand();
  }

  // ── Hoe een zin ervoor staat ──

  const vertaling = (t) => werk.zinnen[t] || '';
  const foutenVan = (t) => T.keurVertaling(t, vertaling(t), werk.locale);
  const staatVan = (t) => (!vertaling(t) ? 'ontbreekt' : foutenVan(t).length ? 'fout' : 'af');

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

  // ── Het scherm ──

  let bestand = null; // het bestand links, of null: alle
  let getoond = PER_KEER;

  function melding(tekst) {
    $('vt-stand').innerHTML = `<span class="vt-let">${esc(tekst)}</span>`;
    clearTimeout(melding.klok);
    melding.klok = setTimeout(toonStand, 6000);
  }

  function toonStand() {
    if (!werk) {
      $('vt-stand').textContent = 'Choose a language, or start a new one.';
      return;
    }
    const af = BRON.filter((z) => staatVan(z.t) === 'af').length;
    const fout = BRON.filter((z) => staatVan(z.t) === 'fout').length;
    const vormen = T.meervoudsVormen(werk.locale);
    const delen = [
      `<strong>${esc(werk.naam)}</strong> (${esc(werk.code)}): ${af} of ${BRON.length} sentences translated (${BRON.length ? Math.floor((100 * af) / BRON.length) : 100}%)`,
      fout ? `<span class="vt-let">${fout} with a problem</span>` : '',
      `plural forms in ${esc(werk.locale)}: ${vormen.join(', ')}; write {n|${vormen.map((v) => `form for ${v}`).join('|')}}, with # for the number`,
    ];
    if (isBestandsTaal(werk.code)) {
      const n = Object.keys(wijzigingen()).length;
      delen.push(n ? `<span class="vt-let">${n} change${n === 1 ? '' : 's'} not yet in taal/${esc(werk.code)}.js</span>` : `same as taal/${esc(werk.code)}.js`);
    } else {
      delen.push('kept in this browser; download the file to share it');
    }
    $('vt-stand').innerHTML = delen.filter(Boolean).join(' · ');
  }

  function toonTalen() {
    const keuze = $('vt-taal');
    const talen = T.talen().filter((t) => t.code !== T.BRONTAAL.code);
    // ook een eigen taal die na het laden van de bladzijde kwam
    for (const e of Object.values(T.eigenTalen())) if (!talen.some((t) => t.code === e.code)) talen.push({ ...e, eigen: true });
    keuze.innerHTML = talen
      .map((t) => `<option value="${esc(t.code)}"${werk && werk.code === t.code ? ' selected' : ''}>${esc(t.naam)} (${esc(t.code)})${t.eigen ? ' · in this browser' : ''}</option>`)
      .join('');
  }

  function toonLijst() {
    const bestanden = [];
    for (const z of BRON) for (const w of z.waar) if (!bestanden.includes(w)) bestanden.push(w);
    const mist = (zinnen) => zinnen.filter((z) => staatVan(z.t) !== 'af').length;
    const regel = (naam, label, zinnen) => {
      const m = mist(zinnen);
      return `<a data-bestand="${esc(naam)}" class="${bestand === naam ? 'vt-hier' : ''}">${esc(label)} <span class="${m ? '' : 'vt-klaar'}">${m ? `${m} to do` : '✓'}</span></a>`;
    };
    let html = regel('', 'All sentences', BRON);
    for (const b of bestanden) html += regel(b, b.replace(/^js\//, ''), BRON.filter((z) => z.waar.includes(b)));
    const weg = over();
    if (weg.length) html += `<a data-bestand="(over)" class="${bestand === '(over)' ? 'vt-hier' : ''}">No longer in the game <span>${weg.length}</span></a>`;
    $('vt-lijst').innerHTML = html;
  }

  // De Engelse zin, met wat tussen { en } staat in een andere kleur.
  const toonBron = (t) => esc(t).replace(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, (m) => `<span class="vt-woord">${m}</span>`);

  function rij(z) {
    const staat = staatVan(z.t);
    const fout = staat === 'fout' ? foutenVan(z.t) : [];
    const voorstel = staat === 'ontbreekt' ? voorstelVoor(z.t) : null;
    return (
      `<div class="vt-rij${staat === 'ontbreekt' ? ' vt-mist' : ''}" data-t="${esc(z.t)}">` +
      `<div class="vt-bron">${toonBron(z.t)}<span class="vt-waar">${esc(z.waar.join(', '))}</span></div>` +
      `<textarea rows="${Math.max(1, Math.ceil(z.t.length / 60))}" spellcheck="true" lang="${esc(werk.code)}">${esc(vertaling(z.t))}</textarea>` +
      (fout.length ? `<div class="vt-fout">${esc(fout.join('; '))}</div>` : '') +
      (voorstel
        ? `<div class="vt-voorstel">The source changed. Earlier: “${esc(voorstel.k)}” → “${esc(werk.zinnen[voorstel.k])}”` +
          `<button type="button" data-neem="${esc(voorstel.k)}">Use and adjust</button></div>`
        : '') +
      `</div>`
    );
  }

  function toonInhoud() {
    const doos = $('vt-inhoud');
    if (!werk) {
      doos.innerHTML = '<p class="vt-uitleg">No language yet. Choose “New language…” to start one.</p>';
      return;
    }
    if (bestand === '(over)') {
      doos.innerHTML =
        `<h2 class="vt-deel">No longer in the game</h2><p class="vt-uitleg">These sentences changed or were removed from the game. ` +
        `Where a new sentence looks like one of them, its row offers the old translation. Forget them when they are no longer of use.</p>` +
        over()
          .map((k) => `<div class="vt-rij"><div class="vt-bron">${toonBron(k)}</div><div>${esc(werk.zinnen[k])} <button type="button" data-vergeet="${esc(k)}">Forget</button></div></div>`)
          .join('');
      return;
    }
    const zoek = $('vt-zoek').value.trim().toLowerCase();
    const filter = $('vt-filter').value;
    const zinnen = BRON.filter(
      (z) =>
        (!bestand || z.waar.includes(bestand)) &&
        (filter === 'alles' || staatVan(z.t) === filter) &&
        (!zoek || z.t.toLowerCase().includes(zoek) || vertaling(z.t).toLowerCase().includes(zoek)),
    );
    doos.innerHTML =
      (zinnen.length ? zinnen.slice(0, getoond).map(rij).join('') : '<p class="vt-uitleg">Nothing here.</p>') +
      (zinnen.length > getoond ? `<button type="button" class="vt-meer" data-meer>Show ${Math.min(PER_KEER, zinnen.length - getoond)} more (of ${zinnen.length - getoond})</button>` : '');
  }

  function toonAlles() {
    toonTalen();
    toonLijst();
    toonInhoud();
    toonStand();
    $('vt-opslaan').classList.toggle('verborgen', !OP_SERVER || !werk);
  }

  // Na het typen alleen deze rij en de stand opnieuw, zodat de cursor blijft staan.
  function werkRijBij(el) {
    const t = el.dataset.t;
    const staat = staatVan(t);
    el.classList.toggle('vt-mist', staat === 'ontbreekt');
    for (const oud of el.querySelectorAll('.vt-fout, .vt-voorstel')) oud.remove();
    if (staat === 'fout') el.insertAdjacentHTML('beforeend', `<div class="vt-fout">${esc(foutenVan(t).join('; '))}</div>`);
  }

  // ── Wat je doet ──

  let wachten = null;
  $('vt-inhoud').addEventListener('input', (ev) => {
    const vak = ev.target.closest('textarea');
    if (!vak || !werk) return;
    const el = vak.closest('.vt-rij');
    const t = el.dataset.t;
    if (vak.value === '') delete werk.zinnen[t];
    else werk.zinnen[t] = vak.value;
    werkRijBij(el);
    clearTimeout(wachten);
    wachten = setTimeout(() => {
      bewaarLokaal();
      toonLijst();
    }, 300);
  });

  $('vt-inhoud').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-meer')) {
      getoond += PER_KEER;
      return toonInhoud();
    }
    if (b.dataset.neem) {
      const el = b.closest('.vt-rij');
      werk.zinnen[el.dataset.t] = werk.zinnen[b.dataset.neem];
      delete werk.zinnen[b.dataset.neem];
      bewaarLokaal();
      toonAlles();
      const vak = $('vt-inhoud').querySelector(`.vt-rij[data-t="${CSS.escape(el.dataset.t)}"] textarea`);
      if (vak) vak.focus();
      return;
    }
    if (b.dataset.vergeet) {
      delete werk.zinnen[b.dataset.vergeet];
      bewaarLokaal();
      toonAlles();
    }
  });

  $('vt-lijst').addEventListener('click', (ev) => {
    const a = ev.target.closest('a[data-bestand]');
    if (!a) return;
    bestand = a.dataset.bestand || null;
    getoond = PER_KEER;
    toonLijst();
    toonInhoud();
    $('vt-inhoud').scrollTop = 0;
  });

  $('vt-taal').addEventListener('change', (ev) => {
    laadTaal(ev.target.value);
    getoond = PER_KEER;
    toonAlles();
  });
  $('vt-zoek').addEventListener('input', () => {
    getoond = PER_KEER;
    toonInhoud();
  });
  $('vt-filter').addEventListener('change', () => {
    getoond = PER_KEER;
    toonInhoud();
  });

  $('vt-nieuw').addEventListener('click', () => {
    const code = (prompt('Language code, such as de, fr, pt-BR or zh-Hans:') || '').trim();
    if (!code) return;
    if (!T.isTaalCode(code) || code === T.BRONTAAL.code) return melding(`“${code}” is not a language code we can use.`);
    if (isBestandsTaal(code) || T.eigenTalen()[code]) return melding(`There is already a language ${code}; choose it in the list.`);
    const naam = (prompt('The name of the language, in that language (Deutsch, Français, …):') || '').trim() || code;
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
    toonAlles();
  });

  $('vt-download').addEventListener('click', () => {
    if (!werk) return;
    const blob = new Blob([T.schrijfTaalBestand(werk)], { type: 'text/javascript' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${werk.code}.js`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

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
      toonStand();
      melding(
        uit.nieuw
          ? `Saved ${uit.bestand}. New language: add <script src="${uit.bestand}"></script> to index.html and gereedschap/vertalen.html, after taal/nl.js.`
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

  const eerder = (() => {
    try {
      return localStorage.getItem(`${T.OPSLAG_SLEUTEL}.vertalen.taal`);
    } catch (e) {
      return null;
    }
  })();
  const talen = T.talen().filter((t) => t.code !== T.BRONTAAL.code);
  const begin = talen.find((t) => t.code === eerder) || talen[0];
  if (begin) laadTaal(begin.code);
  if (!BRON.length) melding('taal/bron.js is empty: run npm run teksten first.');
  toonAlles();
})(globalThis.Spel);
