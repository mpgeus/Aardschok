// Het scherm van het gehuchtspel: de kalender (dag, seizoen, jaar) en de voorraad (goud, graan,
// wol, hout) -- in de stijl en de plek van js/ui.js, maar in een eigen bestand, want het hoort
// bij het nieuwe spel en niet bij De laatste klim. Aan met ?hud of ?kaart=gehucht in de
// adresbalk (T.NIEUWE_HUD); zonder een van die twee blijft alles bij het oude (CLAUDE.md).
(function (T) {
  'use strict';

  const params = new URLSearchParams(location.search);
  T.NIEUWE_HUD = params.has('hud') || params.get('kaart') === 'gehucht';
  document.body.classList.toggle('nieuwe-hud', T.NIEUWE_HUD);

  const $ = (id) => document.getElementById(id);

  // Dezelfde tekenstijl als de spullen in js/ui.js (ICONEN): kleine, met de hand getekende
  // pictogrammen in de kleuren van stijl.css, in plaats van nieuwe pixel art -- er staat toch
  // geen goud, graan, wol of hout tussen de cellen van beelden/voorwerpen.png (js/sprites.js).
  const GOUD_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<ellipse cx="12" cy="17" rx="7" ry="2.6" fill="#c9972f" stroke="#e2b64a" stroke-width="1.1"/>' +
    '<ellipse cx="12" cy="13.5" rx="7" ry="2.6" fill="#d9a83c" stroke="#e2b64a" stroke-width="1.1"/>' +
    '<ellipse cx="12" cy="10" rx="7" ry="2.6" fill="#e2b64a" stroke="#f0cc72" stroke-width="1.1"/>' +
    '</svg>';
  const GRAAN_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<path d="M12 21V9M12 9L6.5 4M12 9l5.5-5M12 9L8.5 3M12 9l3.5-6" stroke="#c9972f" stroke-width="1.3" stroke-linecap="round" fill="none"/>' +
    '<circle cx="6.5" cy="4" r="1.15" fill="#e2b64a"/><circle cx="17.5" cy="4" r="1.15" fill="#e2b64a"/><circle cx="12" cy="2.6" r="1.15" fill="#e2b64a"/>' +
    '<path d="M8.5 14.5h7" stroke="#8a5a2c" stroke-width="1.8" stroke-linecap="round"/>' +
    '</svg>';
  const WOL_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<path d="M6 14a3.4 3.4 0 0 1 .3-6.7 4 4 0 0 1 7.6-1.6 3.6 3.6 0 0 1 5 3.4 3.3 3.3 0 0 1-1 6.4H7.5A3 3 0 0 1 6 14z" fill="#e9e2d2" stroke="#c9bfa4" stroke-width="1.1"/>' +
    '</svg>';
  const HOUT_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<circle cx="8" cy="14.5" r="4.3" fill="#8a5a2c" stroke="#c89a5a" stroke-width="1.2"/>' +
    '<circle cx="16" cy="14.5" r="4.3" fill="#7d4f27" stroke="#c89a5a" stroke-width="1.2"/>' +
    '<circle cx="8" cy="14.5" r="1.6" fill="none" stroke="#c89a5a" stroke-width="0.9"/>' +
    '<circle cx="16" cy="14.5" r="1.6" fill="none" stroke="#c89a5a" stroke-width="0.9"/>' +
    '</svg>';
  const GRONDSTOF_ICOON = { goud: GOUD_ICOON, graan: GRAAN_ICOON, wol: WOL_ICOON, hout: HOUT_ICOON };
  const GRONDSTOF_UITLEG = {
    goud: 'Goud. Wat de heer het liefst ziet.',
    graan: 'Graan. Van de akkers: eten, zaaigoed, en pacht op Sint-Maarten.',
    wol: 'Wol. Van de schapen op de meent.',
    hout: 'Hout. Uit het bos van de heer.',
  };
  // Het aantal mensen, en hoeveel woonruimte er is (js/gebouwen.js): dezelfde stijl als een
  // grondstof, maar met "/" in plaats van een los getal, dus geen eigen icoon uit GRONDSTOF_ICOON.
  const BEVOLKING_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<circle cx="9" cy="7" r="3" fill="#c9972f"/><path d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="none" stroke="#c9972f" stroke-width="1.6" stroke-linecap="round"/>' +
    '<circle cx="17" cy="8.5" r="2.4" fill="#e2b64a"/><path d="M13.3 19c.3-2.7 2.2-4.8 4.7-4.8 2.6 0 4.7 2.3 5 5" fill="none" stroke="#e2b64a" stroke-width="1.4" stroke-linecap="round"/>' +
    '</svg>';
  // De tevredenheid van het dorp (js/behoeften.js): een gezichtje, in dezelfde stijl als hierboven.
  const TEVREDENHEID_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="8.6" fill="none" stroke="#e2b64a" stroke-width="1.5"/>' +
    '<circle cx="8.7" cy="10.2" r="1.1" fill="#e2b64a"/><circle cx="15.3" cy="10.2" r="1.1" fill="#e2b64a"/>' +
    '<path d="M8 14.6c1.1 1.3 2.5 1.9 4 1.9s2.9-.6 4-1.9" fill="none" stroke="#e2b64a" stroke-width="1.4" stroke-linecap="round"/>' +
    '</svg>';

  // De voorraadbalk wordt één keer gemaakt, zoals de spreukbalk in js/ui.js (bouwSpreuken);
  // daarna verandert alleen het getal per grondstof, en het getal bij de mensen.
  function bouwVoorraadbalk(box) {
    box.innerHTML = T.GRONDSTOFFEN.map(
      (wat) =>
        `<div class="grondstof" data-wat="${wat}" title="${GRONDSTOF_UITLEG[wat]}">` +
        `<span class="icoon">${GRONDSTOF_ICOON[wat]}</span><span class="aantal">0</span></div>`,
    ).join('') +
      // Wat het gehucht verder heeft (ijzer, zout en steen van de marskramer, eieren, riet, ...):
      // alleen wat er is, klein, zodat de balk niet volloopt met nullen.
      `<div class="overig" title="Wat het gehucht verder in voorraad heeft."></div>` +
      `<div class="grondstof" data-wat="bevolking" title="Mensen in het dorp, en hoeveel er wonen kunnen (js/gebouwen.js: elk huis geeft woonruimte).">` +
      `<span class="icoon">${BEVOLKING_ICOON}</span><span class="aantal">0/0</span></div>` +
      `<div class="grondstof" data-wat="tevredenheid" title="Tevredenheid.">` +
      `<span class="icoon">${TEVREDENHEID_ICOON}</span><span class="aantal">100%</span></div>`;
  }

  T.ui = T.ui || {};

  T.ui.toonKalender = function (S) {
    const d = T.datumVanDag(S.kalender.dag);
    const datumEl = $('kalender-datum');
    datumEl.textContent = d.tekst;
    datumEl.classList.toggle('sint-maarten', d.sintMaarten);
    $('kalender-seizoen').textContent = T.hoofdletter(d.seizoen) + (d.sintMaarten ? ' · Sint-Maarten: de heer int' : '');
    for (const b of document.querySelectorAll('#kalender-knoppen button')) {
      b.classList.toggle('actief', Number(b.dataset.snelheid) === S.kalender.snelheid);
    }
  };

  T.ui.toonVoorraad = function (S) {
    const box = $('voorraadbalk');
    if (!box.children.length) bouwVoorraadbalk(box);
    for (const wat of T.GRONDSTOFFEN) {
      box.querySelector(`[data-wat="${wat}"] .aantal`).textContent = Math.floor(S.voorraad[wat] || 0);
    }
    const overig = Object.keys(S.voorraad).filter((wat) => !T.GRONDSTOFFEN.includes(wat) && (S.voorraad[wat] || 0) >= 1);
    box.querySelector('.overig').innerHTML = overig
      .map((wat) => `<span class="goed"><span class="naam">${wat}</span> ${Math.floor(S.voorraad[wat])}</span>`)
      .join('');
    // Een open vraag met een prijs erin (het pannenbier), en het handelspaneel, kijken mee met de
    // voorraad.
    if (vragen.length) toonVraag();
    if (handelOpen) toonHandel(S);
  };

  // Het aantal mensen en de woonruimte (js/gebouwen.js, T.werkGebouwenBij): een eigen functie,
  // want die twee veranderen niet via T.wijzigVoorraad en dus niet vanzelf mee met toonVoorraad.
  T.ui.toonBevolking = function (S) {
    const box = $('voorraadbalk');
    if (!box.children.length) bouwVoorraadbalk(box);
    const el = box.querySelector('[data-wat="bevolking"] .aantal');
    if (el) el.textContent = `${Math.floor(S.bevolking)}/${Math.floor(S.woonruimte)}`;
    // Eén keer per dag (js/gebouwen.js): hoe lang de marskramer nog blijft.
    if (handelOpen) toonHandel(S);
  };

  // De tevredenheid (js/behoeften.js, T.tikBehoeftenDag) en, op hover, wat het dorp mist — dezelfde
  // vraag als T.ui.toonBevolking hierboven, met een eigen functie om dezelfde reden: tevredenheid
  // verandert niet via T.wijzigVoorraad.
  T.ui.toonTevredenheid = function (S) {
    const box = $('voorraadbalk');
    if (!box.children.length) bouwVoorraadbalk(box);
    const cel = box.querySelector('[data-wat="tevredenheid"]');
    if (!cel || !S.behoeften) return;
    const pct = Math.round(S.behoeften.tevredenheid * 100);
    cel.querySelector('.aantal').textContent = `${pct}%`;
    cel.classList.toggle('laag', S.behoeften.tevredenheid < T.BEHOEFTEN_INSTELLINGEN.vertrekDrempel);
    cel.title = (S.behoeften.mist.length
      ? `Tevredenheid: ${pct}%. Het dorp mist: ${S.behoeften.mist.join(', ')}.`
      : `Tevredenheid: ${pct}%. Het dorp heeft wat het nodig heeft.`) + (S.behoeften.feest ? ' Het pannenbier doet nog na.' : '');
  };

  // Het bouwmenu: de soorten van de huidige trede, met hun kosten en wat ze doen (ontwerp/spel.md,
  // "Gebouwen"). Een klik op een rij geeft T.S.bouwSoort dat gebouw mee — daarna richt de muis
  // een spookbeeld (js/main.js, js/tekenen.js) tot een klik op de kaart hem neerzet.
  function bouwmenuInhoud(S) {
    const rijen = Object.keys(T.GEBOUWEN)
      .filter((id) => T.GEBOUWEN[id].trede === S.trede && T.GEBOUWEN[id].menu !== false)
      .map((id) => {
        const g = T.GEBOUWEN[id];
        const kosten = Object.entries(g.kosten).map(([wat, n]) => `${n} ${wat}`).join(', ');
        // Hoe lang, en met hoeveel man (js/bouwen.js): de dagen gelden voor een volle ploeg.
        const ploeg = T.ploegVan ? T.ploegVan(id) : 0;
        const duur = `${g.bouwtijd} dag${g.bouwtijd === 1 ? '' : 'en'}` + (ploeg ? `, ${ploeg} bouwer${ploeg === 1 ? '' : 's'}` : '');
        return (
          `<button data-soort="${id}">` +
          `<span class="bouw-naam">${T.hoofdletter(g.naam)}</span>` +
          `<span class="bouw-kosten">${kosten} · ${duur}</span>` +
          `<span class="bouw-uitleg">${g.beschrijving}</span>` +
          `</button>`
        );
      })
      .join('');
    return `<div class="kop">Bouwen — het ${S.trede}</div>${rijen || '<p class="bouw-leeg">Hier valt nu niets te bouwen.</p>'}`;
  }

  T.ui.toonBouwmenu = function (S) {
    const box = $('bouwmenu');
    box.classList.toggle('verborgen', !S.bouwMenuOpen);
    if (S.bouwMenuOpen) box.innerHTML = bouwmenuInhoud(S);
    $('bouwmenu-knop').classList.toggle('actief', S.bouwMenuOpen || !!S.bouwSoort);
  };

  $('bouwmenu').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b || !T.S) return;
    T.S.bouwSoort = b.dataset.soort;
    T.S.bouwMenuOpen = false;
    T.ui.toonBouwmenu(T.S);
  });

  $('bouwmenu-knop').addEventListener('click', (ev) => {
    ev.currentTarget.blur();
    const S = T.S;
    if (!S) return;
    if (S.bouwSoort || S.bouwMenuOpen) {
      S.bouwSoort = null;
      S.bouwMenuOpen = false;
    } else {
      S.bouwMenuOpen = true;
    }
    T.ui.toonBouwmenu(S);
  });

  // Een vraag aan de speler, met twee of drie antwoorden: het pannenbier op het hoogste punt
  // (js/bouwen.js, T.vraagPannenbier), later de voorvallen (ontwerp/werklijst.md, punt 8).
  //   T.ui.vraag({ sleutel, kop, tekst, keuzes: [{ tekst, doe, kan, waarom }] })
  // `tekst` en `kan` van een keuze mogen functies zijn: ze worden bij elk tekenen opnieuw gevraagd,
  // ook als de voorraad verandert, zodat een prijs of een knop nooit verouderd in beeld staat.
  // `doe` mag { gelukt: false, reden } teruggeven: dan blijft de vraag staan en zegt een bericht
  // waarom. Eén vraag tegelijk in beeld; wat erbij komt, wacht in de rij. `sleutel` is waarmee
  // T.ui.sluitVraag hem weer weghaalt (het gebouw is af voordat er een antwoord kwam).
  const vragen = [];
  const waarde = (x) => (typeof x === 'function' ? x() : x);
  function toonVraag() {
    const box = $('vraag');
    if (!box) return;
    const v = vragen[0];
    box.classList.toggle('verborgen', !v);
    if (!v) {
      box.innerHTML = '';
      return;
    }
    box.innerHTML =
      `<div class="kop">${v.kop}</div><p>${v.tekst}</p><div class="keuzes">` +
      v.keuzes
        .map((k, i) => {
          const kan = k.kan == null ? true : waarde(k.kan);
          return `<button data-i="${i}"${kan ? '' : ` disabled title="${k.waarom || ''}"`}>${waarde(k.tekst)}</button>`;
        })
        .join('') +
      '</div>';
  }
  T.ui.vraag = function (v) {
    vragen.push(v);
    toonVraag();
  };
  T.ui.sluitVraag = function (sleutel) {
    const i = vragen.findIndex((v) => v.sleutel === sleutel);
    if (i < 0) return;
    vragen.splice(i, 1);
    toonVraag();
  };
  $('vraag').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    const v = vragen[0];
    if (!b || !v) return;
    b.blur();
    const r = v.keuzes[Number(b.dataset.i)].doe();
    if (r && r.gelukt === false) {
      T.ui.bericht(r.reden, 'gevaar');
      toonVraag();
      return;
    }
    vragen.shift();
    toonVraag();
  });

  // Handelen met de marskramer (js/handel.js): wat hij verkoopt, wat hij van jou koopt, zijn buidel,
  // en of je stil verkoopt (voor minder, zonder vragen, en niet in de boeken: hij is ook heler).
  // Open na een klik op hem (js/verkennen.js); dicht met ×, Esc, als je wegloopt, of als hij gaat.
  let handelOpen = false;
  let handelStil = false;
  // Een prijs onder de één met twee cijfers achter de komma (graan is 0,25), de rest met één.
  const getal = (x) => x.toLocaleString('nl-NL', { maximumFractionDigits: Math.abs(x) < 1 ? 2 : 1 });
  T.ui.handelOpen = () => handelOpen;
  T.ui.openHandel = function (S) {
    handelOpen = true;
    toonHandel(S);
  };
  T.ui.sluitHandel = function () {
    handelOpen = false;
    const box = $('handel');
    box.classList.add('verborgen');
    box.innerHTML = '';
  };
  function toonHandel(S) {
    const box = $('handel');
    const m = S && S.marskramer;
    if (!handelOpen || !m || !m.aanwezig) {
      T.ui.sluitHandel();
      return;
    }
    const nogDagen = Math.max(0, m.vertrekOp - Math.floor(S.kalender.dag));
    const goud = S.voorraad.goud || 0;
    const verkoopt = Object.entries(T.MARSKRAMER_WAREN)
      .map(([goed, w]) => {
        const heeft = m.waren[goed] || 0;
        const uit = heeft >= 1 && goud >= w.prijs ? '' : ' disabled';
        return (
          `<div class="handel-rij" title="${w.uitleg}"><span class="goed">${T.hoofdletter(goed)}</span>` +
          `<span class="prijs">${getal(w.prijs)} goud</span><span class="nog">nog ${heeft}</span>` +
          `<button data-koop="${goed}" data-n="1"${uit}>Koop 1</button><button data-koop="${goed}" data-n="5"${uit}>5</button></div>`
        );
      })
      .join('');
    const koopt =
      Object.keys(T.MARSKRAMER_KOOPT)
        .filter((goed) => (S.voorraad[goed] || 0) >= 1)
        .map((goed) => {
          const per = T.marskramerBod(S, goed, 1, handelStil);
          const uit = per > m.buidel + 1e-9 ? ' disabled' : '';
          return (
            `<div class="handel-rij"><span class="goed">${T.hoofdletter(goed)}</span>` +
            `<span class="prijs">${getal(per)} per stuk</span><span class="nog">je hebt ${Math.floor(S.voorraad[goed])}</span>` +
            `<button data-verkoop="${goed}" data-n="1"${uit}>Verkoop 1</button><button data-verkoop="${goed}" data-n="10"${uit}>10</button></div>`
          );
        })
        .join('') || '<p class="handel-leeg">Je hebt niets wat hij wil.</p>';
    const boek = T.handelTotaal(S);
    box.innerHTML =
      `<div class="kop">De marskramer<button class="sluit" title="Sluiten (Esc)">×</button></div>` +
      `<p class="handel-uitleg">In zijn buidel: ${getal(m.buidel)} goud. Hij blijft nog ${nogDagen} dag${nogDagen === 1 ? '' : 'en'}.</p>` +
      `<div class="kop2">Hij verkoopt</div>${verkoopt}` +
      `<div class="kop2">Hij koopt</div>${koopt}` +
      `<label class="handel-stil"><input type="checkbox" id="handel-stil"${handelStil ? ' checked' : ''}> Stil verkopen: voor minder, zonder vragen, en niet in de boeken</label>` +
      `<p class="handel-boek">In de boeken: ${getal(boek.open)} goud verkocht. Stil: ${getal(boek.stil)} goud.</p>`;
    box.classList.remove('verborgen');
  }
  $('handel').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    const S = T.S;
    if (!b || !S) return;
    b.blur();
    if (b.classList.contains('sluit')) {
      T.ui.sluitHandel();
      return;
    }
    const n = Number(b.dataset.n);
    if (b.dataset.koop) {
      const r = T.koopVanMarskramer(S, b.dataset.koop, n);
      T.ui.bericht(r.gelukt ? `Gekocht: ${r.aantal} ${b.dataset.koop} voor ${getal(r.goud)} goud.` : r.reden, r.gelukt ? 'goed' : 'gevaar');
    } else if (b.dataset.verkoop) {
      const r = T.verkoopAanMarskramer(S, b.dataset.verkoop, n, handelStil);
      const wat = handelStil ? 'Stil verkocht' : 'Verkocht';
      T.ui.bericht(r.gelukt ? `${wat}: ${r.aantal} ${b.dataset.verkoop} voor ${getal(r.goud)} goud.` : r.reden, r.gelukt ? 'goed' : 'gevaar');
    }
    toonHandel(S);
  });
  $('handel').addEventListener('change', (ev) => {
    if (ev.target.id !== 'handel-stil') return;
    handelStil = ev.target.checked;
    toonHandel(T.S);
  });

  // Eén stap trager of sneller, van pauze tot 3x. T.zetSnelheid (js/tijd.js) onthoudt de laatste
  // snelheid, zodat P na een stapje terug weer daar hervat.
  function stapSnelheid(delta) {
    const S = T.S;
    if (!S || !S.kalender) return;
    T.zetSnelheid(S, Math.max(0, Math.min(3, S.kalender.snelheid + delta)));
  }

  $('kalender-knoppen').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b || !T.S) return;
    b.blur();
    T.zetSnelheid(T.S, Number(b.dataset.snelheid));
  });

  // P, - en = botsen nergens mee: de spatie en 1-4 zijn van het oude spel (CLAUDE.md).
  window.addEventListener('keydown', (ev) => {
    if (!T.NIEUWE_HUD || !T.S || !T.S.kalender) return;
    if (ev.key === 'Escape' && handelOpen) {
      T.ui.sluitHandel();
      return;
    }
    if (ev.key === 'p' || ev.key === 'P') {
      const k = T.S.kalender;
      T.zetSnelheid(T.S, k.snelheid > 0 ? 0 : k.laatsteSnelheid || 1);
    } else if (ev.key === '-' || ev.key === '_') {
      stapSnelheid(-1);
    } else if (ev.key === '=' || ev.key === '+') {
      stapSnelheid(1);
    }
  });
})(globalThis.Toren = globalThis.Toren || {});
