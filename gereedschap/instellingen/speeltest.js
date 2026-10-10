// De speeltest op de bladzijde met alle getallen (werklijst vraag 142, stap 3; Marcel, 10 okt: een set getallen probeer je
// in de code, "Snel" staat standaard op de knop, en de bladzijde draait op zijn eigen computer). Je verandert getallen
// zoals altijd, drukt op Start, en de server speelt `npm run speeltest` met een naam en de vorige ernaast
// (/gereedschap/api/speeltest; gereedschap/speeltest/speeltest.cjs en vergelijk.cjs). Als hij klaar is, staat hier welke
// waarden er anders waren (een klik brengt je naar de rij) en per spel wat er anders afliep; bevalt het niet, dan zet een
// knop de waarden terug zoals ze bij de vorige waren (/gereedschap/api/terugzetten). Alleen scherm.
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const maak = (tag, klasse, tekst) => {
    const el = document.createElement(tag);
    if (klasse) el.className = klasse;
    if (tekst != null) el.textContent = tekst;
    return el;
  };
  const toon = (w) => (w == null ? '' : typeof w === 'boolean' ? (w ? 'ja' : 'nee') : typeof w === 'string' ? w : JSON.stringify(w));
  const pagina = () => globalThis.Spel && globalThis.Spel.instellingenPagina;

  const SPELERS = [['bouwer', 'de bouwer'], ['sluw', 'de sluwe bouwer'], ['braaf', 'braaf'], ['lui30', 'lui, 30% weg'], ['lui60', 'lui, 60% weg'], ['slim', 'slim, 60% weg']];
  const MEER_JAREN = new Set(['bouwer', 'sluw']); // de rest speelt één jaar (speler.js)
  const LANDEN = [['eiland', 'op het eiland'], ['maker', 'op gehuchten van de maker'], ['ontworpen', 'op het ontworpen gehucht']];
  // Snel (Marcel, 10 okt): de bouwer, zaad 1, twee jaar, op het eiland. Een jaar kost anderhalf tot vier minuten.
  const SNEL = { spelers: ['bouwer'], zaden: '1', jaren: 2, land: 'eiland' };
  const TEGELIJK = 3; // zoveel spellen speelt speeltest.cjs tegelijk

  let stand = null; // het laatste antwoord van de server
  let wacht = null; // de klok die vraagt hoe ver hij is
  let regelsOpen = null; // of je "Wat hij zegt" open- of dichtklapte (het wordt elke drie seconden opnieuw neergezet)

  // ---------------------------------------------------------------------------------------------
  // De keuze: wie, welke zaden, hoeveel jaar, welk land, en naast welke vorige
  // ---------------------------------------------------------------------------------------------

  const keuze = { ...SNEL, spelers: [...SNEL.spelers], tegen: undefined };

  const zadenVan = (t) => {
    const [van, tot] = String(t).split('-').map(Number);
    const uit = [];
    for (let z = van; z <= (tot || van); z++) uit.push(z);
    return uit;
  };
  const goedeZaden = (t) => /^\d{1,3}(-\d{1,3})?$/.test(String(t).trim()) && zadenVan(t).length >= 1 && zadenVan(t).length <= 20;
  // Wat er gespeeld wordt, als sleutel: twee speeltests met dezelfde sleutel zijn te vergelijken.
  const opdrachtSleutel = (o) => [(o.spelers || []).join(','), (o.zaden || []).join(','), o.jaren || '', o.land, JSON.stringify(o.regels || {}), JSON.stringify(o.getallen || {})].join('|');
  const keuzeAlsOpdracht = () => ({ spelers: SPELERS.map(([id]) => id).filter((id) => keuze.spelers.includes(id)), zaden: zadenVan(keuze.zaden), jaren: keuze.jaren, land: keuze.land, regels: {}, getallen: {} });

  function hoeLang() {
    const zaden = goedeZaden(keuze.zaden) ? zadenVan(keuze.zaden).length : 1;
    const spellen = keuze.spelers.length * zaden;
    const jaren = keuze.spelers.reduce((n, id) => n + (MEER_JAREN.has(id) ? keuze.jaren : 1), 0) * zaden;
    const tegelijk = Math.min(TEGELIJK, spellen) || 1;
    return `${spellen} ${spellen === 1 ? 'spel' : 'spellen'}, zo'n ${Math.ceil((jaren * 1.5) / tegelijk)} à ${Math.ceil((jaren * 4) / tegelijk)} minuten`;
  }

  function bouwKeuze(el) {
    const rij = maak('div', 'st-keuze');
    const wie = maak('div', 'st-wie');
    for (const [id, naam] of SPELERS) {
      const l = maak('label');
      const v = maak('input');
      v.type = 'checkbox';
      v.checked = keuze.spelers.includes(id);
      v.addEventListener('change', () => {
        keuze.spelers = SPELERS.map(([x]) => x).filter((x) => (x === id ? v.checked : keuze.spelers.includes(x)));
        werkBij();
      });
      l.append(v, ' ' + naam);
      wie.appendChild(l);
    }
    const zaden = maak('input');
    zaden.value = keuze.zaden;
    zaden.size = 5;
    zaden.title = 'Een zaad (1) of van tot (1-3). Hetzelfde zaad speelt hetzelfde jaar.';
    zaden.addEventListener('input', () => {
      keuze.zaden = zaden.value.trim();
      werkBij();
    });
    const jaren = maak('input');
    jaren.type = 'number';
    jaren.min = 1;
    jaren.max = 10;
    jaren.value = String(keuze.jaren);
    jaren.addEventListener('input', () => {
      keuze.jaren = Math.max(1, Math.min(10, Math.round(Number(jaren.value)) || 2));
      werkBij();
    });
    const land = maak('select');
    for (const [id, naam] of LANDEN) {
      const o = maak('option', null, naam);
      o.value = id;
      land.appendChild(o);
    }
    land.value = keuze.land;
    land.addEventListener('change', () => {
      keuze.land = land.value;
      werkBij();
    });
    const tegen = maak('select');
    tegen.id = 'st-tegen';
    tegen.addEventListener('change', () => {
      keuze.tegen = tegen.value || null;
      werkBij();
    });
    const start = maak('button', 'st-start', 'Start');
    start.id = 'st-start';
    start.addEventListener('click', begin);
    const snel = maak('button', null, 'Snel');
    snel.title = 'De bouwer, zaad 1, twee jaar, op het eiland';
    snel.addEventListener('click', () => {
      Object.assign(keuze, { ...SNEL, spelers: [...SNEL.spelers], tegen: undefined });
      el.replaceChildren();
      bouwKeuze(el);
      werkBij();
    });
    const veld = (naam, invoer) => {
      const l = maak('label', 'st-veld');
      l.append(maak('span', null, naam), invoer);
      return l;
    };
    rij.append(wie, veld('zaden', zaden), veld('jaren (de bouwers)', jaren), veld('land', land), veld('naast', tegen), snel, start);
    const duur = maak('div', 'in-gedempt st-duur');
    duur.id = 'st-duur';
    el.append(rij, duur);
  }

  // De vorige speeltests in de lijst Naast: eerst die hetzelfde speelden, de nieuwste bovenaan, en die staat er standaard.
  function vulTegen() {
    const sel = $('st-tegen');
    if (!sel || !stand) return;
    const mijn = opdrachtSleutel(keuzeAlsOpdracht());
    const klaar = stand.sets.filter((s) => s.klaar);
    const zelfde = klaar.filter((s) => opdrachtSleutel(s.opdracht) === mijn);
    const anders = klaar.filter((s) => opdrachtSleutel(s.opdracht) !== mijn);
    if (keuze.tegen === undefined || (keuze.tegen && !klaar.some((s) => s.naam === keuze.tegen))) keuze.tegen = zelfde.length ? zelfde[0].naam : null;
    sel.replaceChildren();
    const optie = (waarde, tekst) => {
      const o = maak('option', null, tekst);
      o.value = waarde;
      sel.appendChild(o);
    };
    optie('', 'geen (deze wordt de eerste)');
    for (const s of zelfde) optie(s.naam, s.naam);
    for (const s of anders) optie(s.naam, `${s.naam} (speelde iets anders)`);
    sel.value = keuze.tegen || '';
  }

  function werkBij() {
    vulTegen();
    const fout = !keuze.spelers.length ? 'Kies een speler.' : !goedeZaden(keuze.zaden) ? 'Zaden: een getal, of van tot zoals 1-3.' : null;
    $('st-duur').textContent = fout || hoeLang();
    $('st-duur').className = fout ? 'in-fout st-duur' : 'in-gedempt st-duur';
    $('st-start').disabled = !!fout || !!(stand && stand.nu && stand.nu.loopt);
  }

  // ---------------------------------------------------------------------------------------------
  // Starten, volgen en stoppen
  // ---------------------------------------------------------------------------------------------

  async function vraag(adres, lijf) {
    const r = await fetch(adres, lijf === undefined ? { cache: 'no-store' } : { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lijf) });
    const a = await r.json().catch(() => ({ fout: 'geen antwoord' }));
    if (!r.ok || a.fout) throw new Error(a.fout || 'mislukt');
    return a;
  }

  async function begin() {
    $('st-start').disabled = true;
    try {
      const o = keuzeAlsOpdracht();
      const zaden = o.zaden.length > 1 ? `${o.zaden[0]}-${o.zaden[o.zaden.length - 1]}` : String(o.zaden[0]);
      await vraag('api/speeltest', { spelers: o.spelers, zaden, jaren: keuze.jaren, land: keuze.land, tegen: keuze.tegen || null });
      keuze.tegen = undefined;
      await volg();
    } catch (e) {
      $('st-duur').className = 'in-fout st-duur';
      $('st-duur').textContent = e.message;
      $('st-start').disabled = false;
    }
  }

  async function volg() {
    clearTimeout(wacht);
    try {
      stand = await vraag('api/speeltest');
    } catch (e) {
      $('st-nu').replaceChildren(maak('p', 'in-fout', 'De speeltest is niet te bereiken: ' + e.message + ' (draait npm start?)'));
      return;
    }
    toonNu();
    toonVergelijking();
    werkBij();
    if (stand.nu && stand.nu.loopt) wacht = setTimeout(volg, 3000);
  }

  function toonNu() {
    const el = $('st-nu');
    el.replaceChildren();
    const nu = stand.nu;
    if (!nu) return;
    const minuten = Math.max(0, Math.round((Date.now() - nu.begin) / 60000));
    const p = maak('p');
    if (nu.loopt) {
      p.append(maak('b', null, `Speeltest ${nu.naam} loopt: `), `${nu.klaar} van ${nu.totaal} spellen klaar, ${minuten} min. Zolang hij loopt, wordt er geen getal opgeslagen. `);
      const stop = maak('button', null, 'Stop');
      stop.addEventListener('click', async () => {
        stop.disabled = true;
        await vraag('api/speeltest/stop', {}).catch(() => {});
        volg();
      });
      p.appendChild(stop);
    } else if (nu.code === 0) {
      p.className = 'in-goed';
      p.textContent = `Speeltest ${nu.naam} is klaar${nu.tegen ? `, naast ${nu.tegen}` : ' (hij is de eerste: de volgende komt ernaast)'}.`;
    } else {
      p.className = 'in-fout';
      p.textContent = `Speeltest ${nu.naam} is niet klaar gekomen (${nu.code == null ? 'gestopt' : `code ${nu.code}`}). Wat hij zei:`;
    }
    el.appendChild(p);
    if (nu.regels.length && (nu.loopt || nu.code !== 0)) {
      const d = maak('details');
      d.open = regelsOpen != null ? regelsOpen : nu.code != null && nu.code !== 0;
      d.addEventListener('toggle', () => {
        regelsOpen = d.open;
      });
      d.appendChild(maak('summary', null, 'Wat hij zegt'));
      d.appendChild(maak('pre', 'st-regels', nu.regels.join('\n')));
      el.appendChild(d);
    }
  }

  // ---------------------------------------------------------------------------------------------
  // De vergelijking: wat er anders was, en per spel wat er anders afliep
  // ---------------------------------------------------------------------------------------------

  const verschil = (a, b) => (typeof a === 'number' && typeof b === 'number' ? (b === a ? '' : `${b > a ? '+' : ''}${b - a}`) : toon(a) === toon(b) ? '' : 'anders');

  function tabel(kop, rijen) {
    const t = maak('table', 'st-tabel');
    const k = maak('tr');
    for (const c of kop) k.appendChild(maak('th', null, c));
    t.appendChild(k);
    for (const r of rijen) t.appendChild(r);
    return t;
  }

  function toonVergelijking() {
    const el = $('st-vergelijking');
    el.replaceChildren();
    const v = stand.vergelijking;
    if (!v) return;
    el.appendChild(maak('h3', null, `${v.naam} naast ${v.tegen}`));
    for (const [s, wat] of [[v.voor, v.tegen], [v.na, v.naam]]) el.appendChild(maak('div', 'in-gedempt', `${wat}: ${s.opdracht}; ${s.stand || '?'}`));
    if (!v.zelfdeOpdracht) el.appendChild(maak('p', 'in-fout', 'Let op: de twee speelden niet hetzelfde, dus een verschil komt niet alleen van de waarden.'));

    el.appendChild(maak('h4', null, 'Wat er anders was'));
    if (!v.waarden.length) {
      el.appendChild(maak('p', 'in-gedempt', v.voor.stand === v.na.stand
        ? 'Geen waarde was anders, op dezelfde stand: hetzelfde zaad speelt hetzelfde jaar, dus hieronder hoort niets anders te zijn.'
        : 'Geen waarde was anders. Wat er hieronder anders afliep, komt van de code: de stand verschilt.'));
    } else {
      const rijen = v.waarden.map((w) => {
        const tr = maak('tr');
        const td = maak('td');
        const a = maak('a', null, w.naam);
        a.href = '#';
        a.title = [w.blok, ...w.pad].join('.');
        a.addEventListener('click', (ev) => {
          ev.preventDefault();
          if (!pagina() || !pagina().naarRij(w.blok, w.pad)) a.classList.add('in-fout');
        });
        td.appendChild(a);
        tr.append(td, maak('td', null, w.voor == null ? '(niet)' : toon(w.voor)), maak('td', null, w.na == null ? '(niet)' : toon(w.na)));
        return tr;
      });
      el.appendChild(tabel(['waarde', v.tegen, v.naam], rijen));
      const knop = maak('button', null, `Zet terug zoals bij ${v.tegen}`);
      const melding = maak('span', 'in-gedempt');
      knop.disabled = !!(stand.nu && stand.nu.loopt);
      knop.addEventListener('click', () => zetTerug(v.tegen, knop, melding));
      const p = maak('p', 'st-terug');
      p.append(knop, ' ', melding);
      el.appendChild(p);
    }

    el.appendChild(maak('h4', null, 'Per spel'));
    for (const s of v.spellen) {
      const rijen = s.maten.map((m) => {
        const tr = maak('tr');
        const d = s.gespeeldTegen ? verschil(m.voor, m.na) : '';
        if (d) tr.className = 'st-anders';
        tr.append(maak('td', null, m.naam), maak('td', null, toon(m.voor)), maak('td', null, toon(m.na)), maak('td', null, d));
        return tr;
      });
      const blok = maak('div', 'st-spel');
      blok.appendChild(maak('h5', null, s.naam + (s.gespeeldTegen ? '' : ` (${v.tegen} speelde dit spel niet)`)));
      blok.appendChild(tabel(['', v.tegen, v.naam, 'verschil'], rijen));
      el.appendChild(blok);
    }
  }

  async function zetTerug(naar, knop, melding) {
    knop.disabled = true;
    try {
      const proef = await vraag('api/terugzetten', { naar, proef: true });
      if (!proef.anders.length) {
        melding.textContent = `Alles staat al zoals bij ${naar}.`;
        return;
      }
      const lijst = proef.anders.slice(0, 12).map((w) => `- ${w.naam}: ${toon(w.na)} → ${toon(w.voor)}`).join('\n');
      if (!confirm(`${proef.anders.length} ${proef.anders.length === 1 ? 'waarde' : 'waarden'} terug zoals bij ${naar}, in de code (met een .bak ernaast)?\n\n${lijst}${proef.anders.length > 12 ? '\n…' : ''}`)) return;
      const a = await vraag('api/terugzetten', { naar });
      melding.className = a.niet.length ? 'in-fout' : 'in-goed';
      melding.textContent = `${a.terug.length} teruggezet${a.niet.length ? `; niet: ${a.niet.map((n) => `${n.naam} (${n.waarom})`).join('; ')}` : ''}.`;
      const v = stand.vergelijking;
      const gezet = new Set(a.terug.map((t) => t.naam));
      if (pagina()) await pagina().herlaad(v.waarden.filter((w) => gezet.has(w.naam)).map((w) => [w.blok, w.pad]));
    } catch (e) {
      melding.className = 'in-fout';
      melding.textContent = e.message;
    } finally {
      knop.disabled = false;
    }
  }

  // ---------------------------------------------------------------------------------------------

  const sectie = $('in-speeltest');
  sectie.appendChild(maak('h2', null, 'Speeltest'));
  sectie.appendChild(maak('p', 'in-deeluitleg', 'Verander getallen hieronder, en speel dan de speeltest: hij speelt het spel in een onzichtbare browser (npm run speeltest) en zet de uitslag naast de vorige. Hetzelfde zaad speelt hetzelfde jaar, dus wat er anders afloopt, komt van wat je veranderde. Nodig: Playwright op deze computer (één keer: npm i -g playwright, en npx playwright install chromium).'));
  const keuzeEl = maak('div');
  bouwKeuze(keuzeEl);
  const nuEl = maak('div');
  nuEl.id = 'st-nu';
  const vergelijkingEl = maak('div');
  vergelijkingEl.id = 'st-vergelijking';
  sectie.append(keuzeEl, nuEl, vergelijkingEl);
  werkBij();
  volg();
})();
