// De bladzijde met alle getallen (werklijst vraag 142; Marcel, 8 okt: "een bladzijde met duidelijk overzicht van alles",
// en "Gelijk veranderen"). Het overzicht komt van de server (/gereedschap/api/instellingen), die het uit de bestanden in
// js/ leest met gereedschap/instellingen/bron.js; wat je verandert, schrijft de server meteen in dat bestand
// (/gereedschap/api/instelling), en de toetsen draaien kan erna (/gereedschap/api/toetsen). Alleen scherm: de regels
// staan in bron.js en de server. De speeltest bovenaan staat in speeltest.js, en vraagt hier naar een rij
// (Spel.instellingenPagina).
(function () {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const maak = (tag, klasse, tekst) => {
    const el = document.createElement(tag);
    if (klasse) el.className = klasse;
    if (tekst != null) el.textContent = tekst;
    return el;
  };
  const sleutel = (blok, pad) => blok + '|' + JSON.stringify(pad);
  const toon = (w) => (typeof w === 'boolean' ? (w ? 'ja' : 'nee') : typeof w === 'string' ? w : JSON.stringify(w));

  let model = null;
  const veranderd = new Set(); // wat je deze keer veranderde
  const rijen = []; // { el, zoek, sleutel, deel }

  async function laad() {
    const r = await fetch('api/instellingen', { cache: 'no-store' });
    if (!r.ok) throw new Error(await r.text());
    return r.json();
  }

  async function bewaar(blok, pad, waarde, was) {
    const r = await fetch('api/instelling', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blok, pad, waarde, was }),
    });
    const a = await r.json().catch(() => ({ fout: 'geen antwoord' }));
    if (!r.ok || !a.ok) throw new Error(a.fout || 'mislukt');
    return a;
  }

  // ---------------------------------------------------------------------------------------------
  // Een rij: de naam, het veld, de uitleg en wat de spelregels erop zetten
  // ---------------------------------------------------------------------------------------------

  function veldVoor(blad, opNieuw) {
    const veld = maak('div', 'in-veld');
    let invoer = null;
    let lees = null;
    if (blad.soort === 'getal') {
      invoer = maak('input');
      invoer.type = 'number';
      invoer.step = 'any';
      invoer.value = String(blad.waarde);
      lees = () => Number(invoer.value);
    } else if (blad.soort === 'waar') {
      invoer = maak('select');
      for (const [w, t] of [[true, 'ja'], [false, 'nee']]) {
        const o = maak('option', null, t);
        o.value = String(w);
        invoer.appendChild(o);
      }
      invoer.value = String(blad.waarde);
      lees = () => invoer.value === 'true';
    } else if (blad.keuzes) {
      invoer = maak('select');
      for (const k of blad.keuzes) {
        const o = maak('option', null, k.naam || k.id);
        o.value = k.id;
        invoer.appendChild(o);
      }
      invoer.value = blad.waarde;
      lees = () => invoer.value;
    } else {
      veld.appendChild(maak('code', null, toon(blad.waarde)));
      return veld;
    }
    veld.appendChild(invoer);
    const knoppen = maak('div', 'in-knoppen');
    veld.appendChild(knoppen);
    const opslaan = maak('button', null, 'Opslaan');
    const terug = maak('button', null, 'Terug');
    const melding = maak('span');
    // Alleen opnieuw opbouwen als er iets anders te zeggen is: een klik op Opslaan laat het veld eerst los ("change"), en
    // een knop die dan opnieuw neergezet wordt, krijgt de klik niet meer.
    let stand = null;
    const werkBij = () => {
      const nu = lees();
      const nieuw = blad.soort === 'getal' && !Number.isFinite(nu) ? 'fout' : nu !== blad.waarde ? `anders:${blad.waarde}` : 'gelijk';
      if (nieuw === stand) return;
      stand = nieuw;
      knoppen.replaceChildren();
      if (nieuw === 'fout') knoppen.append(maak('span', 'in-fout', 'geen getal'));
      else if (nieuw !== 'gelijk') knoppen.append(maak('span', null, `was ${toon(blad.waarde)}`), opslaan, terug);
      else knoppen.append(melding);
    };
    const doe = async () => {
      const nu = lees();
      opslaan.disabled = true;
      try {
        const a = await bewaar(blad.blok, blad.pad, nu, blad.waarde);
        blad.waarde = a.waarde;
        veranderd.add(sleutel(blad.blok, blad.pad));
        melding.className = 'in-goed';
        melding.textContent = `opgeslagen in ${a.bestand}`;
        stand = null;
        werkBij();
        $('in-toetsen-uit').textContent = 'Er is iets veranderd: draai de toetsen.';
        opNieuw();
      } catch (e) {
        melding.className = 'in-fout';
        melding.textContent = e.message;
        stand = 'fout bij opslaan';
        knoppen.replaceChildren(melding);
      } finally {
        opslaan.disabled = false;
      }
    };
    invoer.addEventListener('input', werkBij);
    invoer.addEventListener('change', werkBij);
    invoer.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' && lees() !== blad.waarde) doe();
      if (ev.key === 'Escape') {
        invoer.value = String(blad.waarde);
        werkBij();
      }
    });
    opslaan.addEventListener('click', doe);
    terug.addEventListener('click', () => {
      invoer.value = String(blad.waarde);
      werkBij();
    });
    werkBij();
    return veld;
  }

  // Wat de spelregels op dit getal zetten. Zet de standaard van een spelregel iets anders dan het bestand, dan geldt in het
  // spel die van de spelregel: dat zegt de rij er dan bij.
  function regelsVoor(blad) {
    if (!blad.spelregels || !blad.spelregels.length) return null;
    const el = maak('div', 'in-regels');
    const perRegel = new Map();
    for (const z of blad.spelregels) (perRegel.get(z.optie) || perRegel.set(z.optie, []).get(z.optie)).push(z);
    for (const [optie, zetten] of perRegel) {
      const r = maak('div');
      r.append('De spelregel ', maak('b', null, optie), ' zet dit: ');
      r.append(zetten.map((z) => `${z.keuze} → ${toon(z.waarde)}${z.standaard ? ' (standaard)' : ''}`).join('; '));
      if (zetten.some((z) => z.viaObject)) r.append(` (hij zet heel ${zetten.find((z) => z.viaObject).viaObject})`);
      el.appendChild(r);
      const std = zetten.find((z) => z.standaard);
      if (std && !std.heel && std.waarde !== blad.waarde) {
        el.appendChild(maak('div', 'in-fout', `Let op: in het spel geldt ${toon(std.waarde)}, want de standaard van "${optie}" zet het zo. Verander daarvoor de spelregel.`));
      }
    }
    return el;
  }

  function rij(blad, naam, klein, zoekErbij) {
    const el = maak('div', 'in-rij');
    const n = maak('div', 'in-naam', naam);
    if (klein) n.appendChild(maak('small', null, klein));
    const uitleg = maak('div', 'in-uitleg');
    const eigen = (blad.uitleg || []).join(' ');
    if (eigen) uitleg.appendChild(maak('div', null, eigen));
    else if (blad.boven && blad.boven.length) uitleg.appendChild(maak('div', 'in-boven', blad.boven.join(' ')));
    const k = sleutel(blad.blok, blad.pad);
    const r = { el, sleutel: k, zoek: '' };
    const opNieuw = () => el.classList.toggle('in-anders', veranderd.has(k));
    opNieuw();
    el.append(n, veldVoor(blad, opNieuw), uitleg);
    const regels = regelsVoor(blad);
    if (regels) uitleg.appendChild(regels);
    r.zoek = [naam, klein, eigen, (blad.boven || []).join(' '), blad.blok, zoekErbij, toon(blad.waarde)].join(' ').toLowerCase();
    rijen.push(r);
    return r;
  }

  // ---------------------------------------------------------------------------------------------
  // De delen: de spelregels, de gebouwen en de onderwerpen
  // ---------------------------------------------------------------------------------------------

  function deel(id, titel, bron, uitleg) {
    const d = maak('section', 'in-deel');
    d.id = id;
    d.appendChild(maak('h2', null, titel));
    if (bron) d.appendChild(maak('div', 'in-bron', bron));
    if (uitleg) d.appendChild(maak('p', 'in-deeluitleg', uitleg));
    return d;
  }

  function bouw() {
    rijen.length = 0;
    const inhoud = $('in-delen');
    const lijst = $('in-lijst');
    inhoud.replaceChildren();
    lijst.replaceChildren();
    const naar = (id, titel, aantal) => {
      const a = maak('a');
      a.href = '#' + id;
      a.dataset.deel = id;
      a.append(titel, maak('span', null, String(aantal)));
      lijst.appendChild(a);
      return a;
    };
    const delen = [];
    const st = maak('a', null, 'Speeltest');
    st.href = '#in-speeltest';
    st.appendChild(maak('span'));
    lijst.appendChild(st);

    // De spelregels: de standaard van elke spelregel, met zijn keuzes.
    const sr = deel('in-spelregels', 'Spelregels', 'js/opties.js', 'Wat een nieuw spel kiest als niemand iets anders koos. Een spelregel zet getallen hieronder; wie de standaard verandert, verandert het spel voor iedereen.');
    for (const regel of model.spelregels) {
      const blad = { blok: regel.blok, pad: regel.pad, soort: 'keuze', keuzes: regel.keuzes, waarde: regel.standaard, uitleg: [regel.uitleg || ''] };
      const r = rij(blad, regel.naam || regel.id, regel.voorProeven ? `${regel.id} · voor de proeven` : regel.id, regel.keuzes.map((k) => `${k.naam} ${k.uitleg}`).join(' '));
      const uitleg = r.el.querySelector('.in-uitleg');
      for (const k of regel.keuzes) {
        const kz = maak('div', 'in-keuze' + (k.id === regel.standaard ? ' in-gekozen' : ''));
        kz.append(maak('b', null, `${k.naam}: `), k.uitleg || '');
        uitleg.appendChild(kz);
      }
      sr.appendChild(r.el);
    }
    delen.push(sr);
    lijst.appendChild(maak('h4', null, 'Het spel'));
    naar('in-spelregels', 'Spelregels', model.spelregels.length);

    // De gebouwen: per soort zijn getallen, ingeklapt.
    const gb = deel('in-gebouwen', 'Gebouwen', 'js/gebouwen.js (T.GEBOUWEN)', 'Per gebouw wat het kost, hoeveel handen het vraagt, wat het maakt en wat de heer ervoor wil.');
    let telGebouwen = 0;
    for (const g of model.gebouwen) {
      const bladen = g.bladen.filter((b) => b.soort === 'getal' || b.soort === 'waar');
      if (!bladen.length) continue;
      const det = maak('details', 'in-gebouw');
      const sum = maak('summary', null, g.naam + ' ');
      sum.appendChild(maak('span', null, `${g.soort} · ${bladen.length}`));
      det.appendChild(sum);
      if (g.uitleg && g.uitleg.length) det.appendChild(maak('p', 'in-deeluitleg', g.uitleg.join(' ')));
      for (const b of bladen) {
        const r = rij(b, b.pad.slice(1).join(' › '), null, `${g.naam} ${g.soort}`);
        r.gebouw = det;
        det.appendChild(r.el);
        telGebouwen++;
      }
      gb.appendChild(det);
    }
    delen.push(gb);
    naar('in-gebouwen', 'Gebouwen', model.gebouwen.length);

    // De onderwerpen.
    lijst.appendChild(maak('h4', null, 'Getallen per onderwerp'));
    model.onderwerpen.forEach((o, i) => {
      const id = 'in-o' + i;
      const d = deel(id, o.naam, o.blok ? `${o.bestand} (T.${o.blok})` : null, (o.uitleg || []).join(' '));
      for (const b of o.bladen) {
        const naam = b.naam ? b.blok : b.pad.join(' › ');
        const r = rij(b, naam, b.naam || null, o.naam);
        d.appendChild(r.el);
      }
      delen.push(d);
      naar(id, o.naam, o.bladen.length);
    });
    inhoud.append(...delen);
    filter();
    $('in-toetsen-uit').textContent ||= `${rijen.length} waarden, ${telGebouwen} daarvan bij de gebouwen`;
  }

  // Zoeken en "alleen wat ik veranderde": wat niet past, verdwijnt, en een deel zonder rijen ook.
  function filter() {
    const q = $('in-zoek').value.trim().toLowerCase();
    const woorden = q ? q.split(/\s+/) : [];
    const alleen = $('in-veranderd').checked;
    for (const r of rijen) {
      const past = woorden.every((w) => r.zoek.includes(w)) && (!alleen || veranderd.has(r.sleutel));
      r.el.classList.toggle('in-verborgen', !past);
    }
    for (const d of document.querySelectorAll('.in-gebouw')) {
      const zichtbaar = d.querySelector('.in-rij:not(.in-verborgen)');
      d.classList.toggle('in-verborgen', !zichtbaar);
      if (woorden.length || alleen) d.open = !!zichtbaar;
    }
    for (const d of document.querySelectorAll('.in-deel')) {
      const n = d.querySelectorAll('.in-rij:not(.in-verborgen)').length;
      d.classList.toggle('in-verborgen', n === 0);
      const a = document.querySelector(`.in-lijst a[data-deel="${d.id}"]`);
      if (a) {
        a.classList.toggle('in-verborgen', n === 0);
        a.lastChild.textContent = String(n);
      }
    }
  }

  async function toetsen() {
    const knop = $('in-toetsen');
    const uit = $('in-toetsen-uit');
    knop.disabled = true;
    uit.className = 'in-gedempt';
    uit.textContent = 'De toetsen draaien (anderhalve minuut)…';
    try {
      const r = await fetch('api/toetsen', { method: 'POST' });
      const a = await r.json();
      if (a.mislukt) {
        uit.className = 'in-fout';
        uit.textContent = `${a.mislukt} mislukt, ${a.geslaagd} geslaagd: ${a.namen.slice(0, 4).join('; ')}${a.namen.length > 4 ? '; …' : ''}. Een toets die het oude getal verwacht, past Claude aan voor het naar main gaat.`;
      } else if (a.geslaagd) {
        uit.className = 'in-goed';
        uit.textContent = `Alle ${a.geslaagd} toetsen geslaagd.`;
      } else {
        uit.className = 'in-fout';
        uit.textContent = a.fout || 'De toetsen draaiden niet.';
      }
    } catch (e) {
      uit.className = 'in-fout';
      uit.textContent = e.message;
    } finally {
      knop.disabled = false;
    }
  }

  // Naar de rij van een waarde: het zoeken eraf, zijn gebouw open, en even oplichten.
  function naarRij(blok, pad) {
    const r = rijen.find((x) => x.sleutel === sleutel(blok, pad));
    if (!r) return false;
    if (r.el.classList.contains('in-verborgen')) {
      $('in-zoek').value = '';
      $('in-veranderd').checked = false;
      filter();
    }
    if (r.gebouw) r.gebouw.open = true;
    r.el.scrollIntoView({ block: 'center' });
    r.el.classList.remove('in-licht');
    void r.el.offsetWidth;
    r.el.classList.add('in-licht');
    return true;
  }

  // Opnieuw lezen wat er in de code staat (na het terugzetten door de speeltest), met wat er veranderde erbij gemarkeerd.
  async function herlaad(veranderdErbij = []) {
    for (const [blok, pad] of veranderdErbij) veranderd.add(sleutel(blok, pad));
    model = await laad();
    bouw();
    $('in-toetsen-uit').textContent = 'Er is iets veranderd: draai de toetsen.';
  }

  globalThis.Spel = globalThis.Spel || {};
  globalThis.Spel.instellingenPagina = { naarRij, herlaad };

  $('in-zoek').addEventListener('input', filter);
  $('in-veranderd').addEventListener('change', filter);
  $('in-toetsen').addEventListener('click', toetsen);
  laad()
    .then((m) => {
      model = m;
      bouw();
    })
    .catch((e) => {
      $('in-delen').replaceChildren(maak('p', 'in-fout', 'Het overzicht laadt niet: ' + e.message + ' (draait npm start?)'));
    });
})();
