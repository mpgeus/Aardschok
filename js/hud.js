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
  // Wat de marskramer brengt en de smidse ervan maakt (js/handel.js; spel.md, "Handel"): een staaf
  // ijzer, een zakje zout, en een hamer.
  const IJZER_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<path d="M4 15.5l4-5h12l-4 5z" fill="#8f949a" stroke="#c3c7cc" stroke-width="1.1" stroke-linejoin="round"/>' +
    '<path d="M4 15.5h12v2.6H4z" fill="#6c7176" stroke="#c3c7cc" stroke-width="1.1" stroke-linejoin="round"/>' +
    '<path d="M16 15.5l4-5v2.6l-4 5z" fill="#5a5f64" stroke="#c3c7cc" stroke-width="1.1" stroke-linejoin="round"/>' +
    '</svg>';
  const ZOUT_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<path d="M8.5 7.5c-1.8 2.2-3 5.2-3 8 0 2.6 2.9 4 6.5 4s6.5-1.4 6.5-4c0-2.8-1.2-5.8-3-8z" fill="#cdb48a" stroke="#e6d3ad" stroke-width="1.1"/>' +
    '<path d="M8.2 7.5c1.2-.9 2.4-1.3 3.8-1.3s2.6.4 3.8 1.3M9.5 5.2l2.5 1 2.5-1" fill="none" stroke="#8a6a3c" stroke-width="1.3" stroke-linecap="round"/>' +
    '<circle cx="10" cy="14" r="1" fill="#f4efe6"/><circle cx="13.5" cy="12.5" r="1" fill="#f4efe6"/><circle cx="12.5" cy="16" r="1" fill="#f4efe6"/>' +
    '</svg>';
  const GEREEDSCHAP_ICOON =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">' +
    '<path d="M11 10.5l8.5 8.5" stroke="#8a5a2c" stroke-width="2.4" stroke-linecap="round"/>' +
    '<path d="M4.5 8.5l5-5 2.2 2.2-1.5 1.5 2.6 2.6-2.2 2.2-2.6-2.6-1.3 1.3z" fill="#8f949a" stroke="#c3c7cc" stroke-width="1.1" stroke-linejoin="round"/>' +
    '</svg>';
  const GRONDSTOF_ICOON = {
    goud: GOUD_ICOON, graan: GRAAN_ICOON, wol: WOL_ICOON, hout: HOUT_ICOON,
    ijzer: IJZER_ICOON, zout: ZOUT_ICOON, gereedschap: GEREEDSCHAP_ICOON,
  };
  const GRONDSTOF_UITLEG = {
    goud: 'Goud. Wat de heer het liefst ziet.',
    graan: 'Graan. Van de akkers: eten, zaaigoed, en pacht op Sint-Maarten.',
    wol: 'Wol. Van de schapen op de meent.',
    hout: 'Hout. Uit het bos van de heer.',
    ijzer: 'IJzer. Van de marskramer; de smidse maakt er gereedschap van.',
    zout: 'Zout. Van de marskramer: het houdt vis en vlees goed.',
    gereedschap: 'Gereedschap. Van de smidse: wie het heeft, werkt harder. Het slijt.',
  };
  // Deze staan pas in de balk als het dorp ze eens gehad heeft (S.gehad, js/voorraad.js): in het
  // begin blijft de balk kort.
  const BALK_LATER = ['ijzer', 'zout', 'gereedschap'];
  const BALK = T.GRONDSTOFFEN.concat(BALK_LATER);
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
    box.innerHTML = BALK.map(
      (wat) =>
        `<div class="grondstof${BALK_LATER.includes(wat) ? ' verborgen' : ''}" data-wat="${wat}" title="${GRONDSTOF_UITLEG[wat]}">` +
        `<span class="icoon">${GRONDSTOF_ICOON[wat]}</span><span class="aantal">0</span></div>`,
    ).join('') +
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
    werkBriefKnopBij(S);
  };

  T.ui.toonVoorraad = function (S) {
    const box = $('voorraadbalk');
    if (!box.children.length) bouwVoorraadbalk(box);
    for (const wat of BALK) {
      const cel = box.querySelector(`[data-wat="${wat}"]`);
      cel.querySelector('.aantal').textContent = Math.floor(S.voorraad[wat] || 0);
      if (BALK_LATER.includes(wat)) cel.classList.toggle('verborgen', !(S.gehad && S.gehad[wat]));
    }
    // Wat zout en gereedschap nu doen, bij de muis: hoeveel vis en vlees het zout goed houdt, en
    // hoeveel handen het gereedschap dekt (js/behoeften.js, js/gebouwen.js).
    if (T.zoutDekking) {
      const d = T.zoutDekking(S);
      box.querySelector('[data-wat="zout"]').title = d.totaal >= 1
        ? `Zout. Eén zout houdt ${T.BEHOEFTEN_INSTELLINGEN.zoutHoudtGoed} vis of vlees goed; de rest bederft. Nu gezouten: ${Math.floor(d.gezouten)} van de ${Math.floor(d.totaal)}.`
        : GRONDSTOF_UITLEG.zout;
    }
    if (T.gereedschapDekking) {
      const d = T.gereedschapDekking(S);
      box.querySelector('[data-wat="gereedschap"]').title = d.handen
        ? `Gereedschap. Genoeg voor ${Math.min(d.handen, Math.floor(d.heeft))} van de ${d.handen} handen aan het werk: er wordt ${Math.round((d.factor - 1) * 100)}% harder gewerkt. Het slijt.`
        : GRONDSTOF_UITLEG.gereedschap;
    }
  };

  // Het aantal mensen en de woonruimte (js/gebouwen.js, T.werkGebouwenBij): een eigen functie,
  // want die twee veranderen niet via T.wijzigVoorraad en dus niet vanzelf mee met toonVoorraad.
  T.ui.toonBevolking = function (S) {
    const box = $('voorraadbalk');
    if (!box.children.length) bouwVoorraadbalk(box);
    const el = box.querySelector('[data-wat="bevolking"] .aantal');
    if (el) el.textContent = `${Math.floor(S.bevolking)}/${Math.floor(S.woonruimte)}`;
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
    const last = S.behoeften.last && S.behoeften.last.length ? ` Het heeft last van ${S.behoeften.last.join(' en ')}.` : '';
    cel.title = S.behoeften.mist.length
      ? `Tevredenheid: ${pct}%. Het dorp mist: ${S.behoeften.mist.join(', ')}.${last}`
      : `Tevredenheid: ${pct}%. Het dorp heeft wat het nodig heeft.${last}`;
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
        // Wat de heer er elk jaar voor wil (js/heer.js): zo weet je bij elk gebouw wat het je op
        // Sint-Maarten kost, want wat je bouwt, is wat hij ziet.
        const heer = g.heer ? Object.entries(g.heer).map(([wat, n]) => `${n} ${wat}`).join(', ') : '';
        const heerTekst = heer ? `Op Sint-Maarten wil de heer er ${heer} voor.` : 'De heer vraagt er niets voor.';
        return (
          `<button data-soort="${id}">` +
          `<span class="bouw-naam">${T.hoofdletter(g.naam)}</span>` +
          `<span class="bouw-kosten">${kosten} · ${g.bouwtijd} dag${g.bouwtijd === 1 ? '' : 'en'}</span>` +
          `<span class="bouw-uitleg">${g.beschrijving}</span>` +
          (g.heer ? `<span class="bouw-heer">${heerTekst}</span>` : '') +
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

  // ── Handelen met de marskramer (js/handel.js; spel.md, "Handel") ──
  // Je opent het venster vanuit zijn gesprek (doe: { handel: true }). Zolang het open is, staat de
  // kalender stil en ligt de rest van de invoer stil (S.modus 'handel', js/main.js): je staat bij
  // zijn uitgestalde waar. Elke knop stelt dezelfde vraag als de klik (T.kanKopen,
  // T.kanVerkopen), dus een knop die niet kan, zegt bij de muis waarom.
  const PRIJS_TAAL = {
    koopt: { duur: 'hij betaalt nu goed', goedkoop: 'hij betaalt nu weinig' },
    verkoopt: { duur: 'nu duur', goedkoop: 'nu goedkoop' },
  };

  // Of dit de duurste of goedkoopste keer van het jaar is, als regeltje onder de prijs.
  function prijsMerk(S, wat, kant) {
    const hoe = T.prijsVanHetJaar(S, wat, kant);
    return hoe ? `<span class="handel-merk ${hoe}">${PRIJS_TAAL[kant][hoe]}</span>` : '';
  }

  function handelKnop(actie, wat, n, tekst, k) {
    const titel = k.kan ? '' : ` title="${k.reden.replace(/"/g, '&quot;')}"`;
    return `<button data-actie="${actie}" data-wat="${wat}" data-n="${n}"${k.kan ? '' : ' disabled'}${titel}>${tekst}</button>`;
  }

  function handelInhoud(S) {
    const m = S.marskramer;
    const H = T.HANDEL_INSTELLINGEN;
    const v = S.voorraad;
    const heb = (wat) => Math.floor(v[wat] || 0);
    const verkoopt = Object.keys(H.verkoopt).map((wat) => {
      const k = T.kanKopen(S, wat, 1);
      return (
        `<div class="handel-rij"><span class="handel-naam">${T.hoofdletter(wat)} <small>je hebt ${heb(wat)}</small></span>` +
        `<span class="handel-prijs">${k.prijs} goud per stuk<small>${prijsMerk(S, wat, 'verkoopt')}hij heeft er nog ${m.heeft[wat] || 0}</small></span>` +
        `<span class="handel-knoppen">${handelKnop('koop', wat, 1, 'Koop 1', k)}${handelKnop('koop', wat, 5, 'Koop 5', T.kanKopen(S, wat, 5))}</span></div>`
      );
    });
    // Wat hij koopt, voor zover je er iets van hebt. Bij het graan staat hoeveel dagen het dorp
    // ervan kan eten, zodat je niet per ongeluk je wintereten verkoopt.
    const etenPerDag = (S.bevolking || 0) * T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag;
    const koopt = Object.keys(H.koopt).filter((wat) => heb(wat) > 0).map((wat) => {
      const k = T.kanVerkopen(S, wat, 1);
      const eten = wat === 'graan' && etenPerDag > 0 ? ` · eten voor ${Math.floor((v.graan || 0) / etenPerDag)} dagen` : '';
      return (
        `<div class="handel-rij"><span class="handel-naam">${T.hoofdletter(wat)} <small>je hebt ${heb(wat)}${eten}</small></span>` +
        `<span class="handel-prijs">${k.per} voor ${k.prijs} goud<small>${prijsMerk(S, wat, 'koopt')}</small></span>` +
        `<span class="handel-knoppen">${handelKnop('verkoop', wat, 1, `Verkoop ${k.per}`, k)}${handelKnop('verkoop', wat, 5, `Verkoop ${k.per * 5}`, T.kanVerkopen(S, wat, 5))}</span></div>`
      );
    });
    const maand = H.bezoeken[m.bezoek].maand;
    return (
      `<div class="handel-kop"><span class="handel-titel">De marskramer</span><span class="handel-wanneer">${maand}</span>` +
      `<button class="handel-sluit" data-actie="sluit" title="Sluiten (Esc)">✕</button></div>` +
      `<p class="handel-staat">Hij heeft <b>${m.beurs} goud</b> bij zich en plaats voor <b>${m.plaats} pak${m.plaats === 1 ? '' : 'ken'}</b>. ` +
      `Jij hebt <b>${heb('goud')} goud</b>.</p>` +
      `<div class="kop">Hij verkoopt</div>${verkoopt.join('')}` +
      `<div class="kop">Hij koopt</div>${koopt.join('') || '<p class="handel-leeg">Je hebt niets wat hij wil.</p>'}` +
      `<p class="handel-voet">Zolang je handelt, staat de tijd stil. <kbd>Esc</kbd> sluit.</p>`
    );
  }

  function toonHandel(S) {
    const box = $('handel');
    box.innerHTML = handelInhoud(S);
    box.classList.remove('verborgen');
  }

  T.ui.openHandel = function (S) {
    if (!T.kanHandelen || !T.kanHandelen(S)) return;
    S.modus = 'handel';
    S.bouwSoort = null;
    S.bouwMenuOpen = false;
    T.ui.toonBouwmenu(S);
    // De kalender stil, en onthouden hoe hij liep: bij het sluiten loopt hij zo weer verder.
    if (S.kalender) {
      S.handelVoorSnelheid = S.kalender.snelheid;
      if (S.kalender.snelheid) T.zetSnelheid(S, 0);
    }
    toonHandel(S);
  };

  T.ui.sluitHandel = function (S) {
    $('handel').classList.add('verborgen');
    if (S.modus === 'handel') S.modus = 'verkennen';
    // Heeft de speler de tijd zelf weer aangezet, dan laten we die snelheid staan.
    if (S.kalender && S.kalender.snelheid === 0 && S.handelVoorSnelheid) T.zetSnelheid(S, S.handelVoorSnelheid);
    S.handelVoorSnelheid = null;
  };

  $('handel').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    const S = T.S;
    if (!b || !S) return;
    b.blur();
    if (b.dataset.actie === 'sluit') {
      T.ui.sluitHandel(S);
      return;
    }
    const n = Number(b.dataset.n);
    const r = b.dataset.actie === 'koop' ? T.koop(S, b.dataset.wat, n) : T.verkoop(S, b.dataset.wat, n);
    if (!r.kan && T.ui.bericht) T.ui.bericht(r.reden);
    if (T.kanHandelen(S)) toonHandel(S);
    else T.ui.sluitHandel(S);
  });

  // ── De heer (js/heer.js; spel.md, "Sint-Maarten") ──
  // Twee vensters in de stijl van dat van de marskramer: zijn brief (1 wijnmaand; de knop Brief
  // opent hem weer tot hij geweest is), en het betalen op Sint-Maarten (vanuit zijn gesprek,
  // doe: { heer: true }), met daarin de schandpaal als die erbij hoort. Het einde (je ambt kwijt)
  // gebruikt het scherm over alles heen uit js/ui.js (T.ui.toonOverlay).
  const hebNu = (S, wat) => Math.floor((S.voorraad && S.voorraad[wat]) || 0);
  const opsomming = (delen) => (delen.length > 1 ? `${delen.slice(0, -1).join(', ')} en ${delen[delen.length - 1]}` : delen[0] || 'niets');
  const eisInTaal = (eis) => opsomming(eis.volgorde.map((wat) => `${eis.per[wat]} ${wat}`));

  // De tijd stil zolang een venster open is, en daarna weer zoals hij liep (tenzij de speler hem
  // intussen zelf weer aanzette). Elk venster onthoudt dat onder zijn eigen sleutel in S.
  function zetTijdStil(S, sleutel) {
    if (!S.kalender) return;
    S[sleutel] = S.kalender.snelheid;
    if (S.kalender.snelheid) T.zetSnelheid(S, 0);
  }
  function laatTijdLopen(S, sleutel) {
    if (S.kalender && S.kalender.snelheid === 0 && S[sleutel]) T.zetSnelheid(S, S[sleutel]);
    S[sleutel] = null;
  }

  // De knop Brief naast Bouwen: alleen zolang er een brief is.
  function werkBriefKnopBij(S) {
    $('brief-knop').classList.toggle('verborgen', !(S.heer && S.heer.brief));
  }

  function briefInhoud(S) {
    const brief = S.heer.brief;
    const regels = brief.eis.regels.map((r) => `<li><b>${r.aantal} ${r.wat}</b> <span>${r.waarom}</span></li>`).join('');
    const samen = brief.eis.regels.length > 1 ? `<p class="brief-samen">Samen: ${eisInTaal(brief.eis)}.</p>` : '';
    const nu = opsomming(brief.eis.volgorde.map((wat) => `${hebNu(S, wat)} ${wat}`));
    // Komt de marskramer nog, dan kun je nog verkopen voor zijn goud (daarom valt de brief ervóór).
    const herfst = T.HANDEL_INSTELLINGEN && T.HANDEL_INSTELLINGEN.bezoeken[T.HANDEL_INSTELLINGEN.bezoeken.length - 1];
    const vandaag = T.datumVanDag(S.kalender ? S.kalender.dag : brief.dag);
    const komtNog = herfst && T.MAANDEN[vandaag.maand].naam === herfst.maand && vandaag.dagVanMaand < herfst.dag;
    const marskramer = komtNog ? ` De marskramer komt op ${herfst.dag} ${herfst.maand}: dan kun je nog verkopen voor zijn goud.` : '';
    return (
      `<div class="venster-kop"><span class="venster-titel">Een brief van de heer</span><span class="venster-wanneer">${T.datumVanDag(brief.dag).tekst}</span>` +
      `<button class="venster-sluit" data-actie="sluit" title="Sluiten (Esc)">✕</button></div>` +
      `<div class="brief-tekst">` +
      `<p>Aan Onze trouwe schout,</p>` +
      `<p>Het is Ons ter ore gekomen dat het u goed gaat. Dat verheugt Ons zeer, want het gaat Ons ook graag goed. Op Sint-Maarten komen Wij persoonlijk ophalen wat Ons toekomt. Naar wat Wij nu zien, is dat:</p>` +
      `<ul class="brief-lijst">${regels || '<li>niets. Dat kan niet kloppen.</li>'}</ul>${samen}` +
      `<p>Wat er tot Sint-Maarten bijkomt, zien Wij ook. Wie Ons tekortdoet, zal het merken, want Wij tellen zeer zorgvuldig. Bijna altijd.</p>` +
      `<p class="brief-groet">Uw genadige heer</p>` +
      `</div>` +
      `<p class="venster-staat">Je hebt nu ${nu}. Wat je hem aan graan geeft, kun je in de lente niet zaaien.${marskramer}</p>` +
      `<p class="venster-voet">Zolang je leest, staat de tijd stil. <kbd>Esc</kbd> sluit; de knop Brief bovenin opent hem weer.</p>`
    );
  }

  T.ui.toonBrief = function (S) {
    if (!S.heer || !S.heer.brief) return;
    const box = $('brief');
    box.innerHTML = briefInhoud(S);
    if (box.classList.contains('verborgen')) zetTijdStil(S, 'briefVoorSnelheid');
    box.classList.remove('verborgen');
    werkBriefKnopBij(S);
  };

  T.ui.sluitBrief = function (S) {
    $('brief').classList.add('verborgen');
    laatTijdLopen(S, 'briefVoorSnelheid');
  };

  T.ui.briefOpen = () => !$('brief').classList.contains('verborgen');

  $('brief').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (b && b.dataset.actie === 'sluit' && T.S) T.ui.sluitBrief(T.S);
  });
  $('brief-knop').addEventListener('click', (ev) => {
    ev.currentTarget.blur();
    if (!T.S) return;
    if (T.ui.briefOpen()) T.ui.sluitBrief(T.S);
    else T.ui.toonBrief(T.S);
  });

  // Wat de schout de heer geeft, per goed, zoals het in het venster staat. Het begint op alles wat
  // hij vraagt, voor zover je het hebt; wie minder wil geven, schuift naar beneden.
  let geef = null;

  function heerRijen(S, eis) {
    return eis.volgorde.map((wat) => {
      // Goud mag meer zijn dan hij vraagt: dat neemt hij in de plaats van wat er verder ontbreekt.
      const max = wat === 'goud' ? hebNu(S, 'goud') : Math.min(eis.per[wat], hebNu(S, wat));
      const waarom = eis.regels.filter((r) => r.wat === wat).map((r) => `${r.aantal} voor ${r.waarom}`).join(' · ');
      const nu = Math.min(geef[wat] || 0, max);
      return (
        `<div class="heer-rij">` +
        `<span class="heer-naam">${T.hoofdletter(wat)} <small>hij vraagt ${eis.per[wat]} · je hebt ${hebNu(S, wat)}</small>` +
        `<small class="heer-waarom">${waarom}</small></span>` +
        `<input type="range" min="0" max="${max}" step="1" value="${nu}" data-wat="${wat}"${max ? '' : ' disabled'}>` +
        `<span class="heer-geef" data-geef="${wat}">${nu}</span>` +
        `</div>`
      );
    }).join('');
  }

  // Het deel dat met de schuiven meeverandert: hoeveel je geeft, wat dat kost, en of je graan het
  // haalt tot de oogst. Dezelfde vraag als de knop (T.gevolgVanBetaling).
  function heerSamenvatting(S, eis) {
    const g = T.gevolgVanBetaling(S, geef, eis);
    const v = T.heerVooruitzicht(S, g);
    const pct = Math.floor(g.deel * 100 + 1e-9);
    const soort = g.ambtKwijt || g.schandpaal ? 'zwaar' : g.boete ? 'boete' : 'goed';
    const goudExtra = g.neemt.goud > (eis.per.goud || 0) ? ` Van je goud neemt hij ${g.neemt.goud}, ook in de plaats van wat er verder ontbreekt.` : '';
    const soldaten = v.soldaten ? `, zijn soldaten ${Math.round(v.soldaten)}` : '';
    const rest = Math.round(v.over);
    const uitkomst = rest >= 0 ? `er blijft ${rest} over` : `je komt ${-rest} graan tekort, en dat is honger vóór de oogst`;
    return (
      `<p class="heer-deel ${soort}">Je geeft hem ${pct}% van wat hij vraagt. ${g.tekst}${goudExtra}</p>` +
      `<p class="heer-vooruit">Daarna heb je ${Math.round(v.na)} graan. Tot de oogst eet het dorp er zo'n ${Math.round(v.eten)}${soldaten}, ` +
      `en zaaien in lentemaand kost ${Math.round(v.zaaien)}: ${uitkomst}.</p>` +
      `<div class="heer-knoppen"><button data-actie="alles">Alles wat hij vraagt</button>` +
      `<button class="heer-geef-knop" data-actie="betaal"${g.kan ? '' : ` disabled title="${g.reden}"`}>Geef het hem</button></div>`
    );
  }

  function schandpaalInhoud(S) {
    const rijen = T.schandpaalKeuzes(S).map((k) => {
      const prijs = k.wie === 'schout'
        ? `Het dorp neemt het je niet kwalijk. De heer lacht, en zet er ${k.boete} goud bij.`
        : `Het dorp is ${Math.round(k.kost * 100)}% minder tevreden, en vergeet het pas na maanden.`;
      return (
        `<button class="paal-keuze" data-wie="${k.wie}"><span class="paal-naam">${k.naam}</span>` +
        `<span class="paal-wie">${k.eigenschap}</span><span class="paal-prijs">${prijs}</span></button>`
      );
    }).join('');
    return (
      `<div class="venster-kop"><span class="venster-titel">De schandpaal</span><span class="venster-wanneer">Sint-Maarten</span></div>` +
      `<p class="venster-staat">"Iemand moet dit voelen, schout. U mag kiezen wie." Wie staat er drie dagen aan de paal op de brink?</p>` +
      rijen
    );
  }

  function toonHeer(S) {
    const box = $('heer');
    const b = S.heer && S.heer.bezoek;
    if (b && b.schandpaal) {
      box.innerHTML = schandpaalInhoud(S);
    } else {
      const eis = T.eisVanDeHeer(S);
      if (!geef) {
        geef = {};
        for (const wat of eis.volgorde) geef[wat] = Math.min(eis.per[wat], hebNu(S, wat));
      }
      box.innerHTML =
        `<div class="venster-kop"><span class="venster-titel">Sint-Maarten</span><span class="venster-wanneer">de heer telt</span>` +
        `<button class="venster-sluit" data-actie="sluit" title="Nog niet (Esc)">✕</button></div>` +
        `<p class="venster-staat">Hij vraagt ${eisInTaal(eis)}. Wat je hem geeft, schuif je hieronder. Goud neemt hij altijd, ook in de plaats van iets anders.</p>` +
        heerRijen(S, eis) +
        `<div class="heer-samen">${heerSamenvatting(S, eis)}</div>` +
        `<p class="venster-voet">Zolang je bij hem staat, staat de tijd stil. <kbd>Esc</kbd>: nog niet (hij wacht).</p>`;
    }
    box.classList.remove('verborgen');
  }

  T.ui.openHeer = function (S) {
    const b = S.heer && S.heer.bezoek;
    if (!T.heerWacht(S) && !(b && b.schandpaal)) return;
    S.modus = 'heer';
    S.bouwSoort = null;
    S.bouwMenuOpen = false;
    T.ui.toonBouwmenu(S);
    if (T.ui.briefOpen()) T.ui.sluitBrief(S);
    geef = null;
    zetTijdStil(S, 'heerVoorSnelheid');
    toonHeer(S);
  };

  // Dicht. Bij de schandpaal kan dat niet: daar moet je kiezen. Is de heer weg, dan loopt de tijd
  // weer zoals vóór zijn komst (hij zette hem stil toen hij op de brink stond, js/heer.js).
  T.ui.sluitHeer = function (S) {
    const b = S.heer && S.heer.bezoek;
    if (b && b.schandpaal) return;
    $('heer').classList.add('verborgen');
    if (S.modus === 'heer') S.modus = 'verkennen';
    geef = null;
    const h = S.heer;
    if (h && (!h.bezoek || h.bezoek.weg) && h.snelheidVoorWachten) {
      S.heerVoorSnelheid = h.snelheidVoorWachten;
      h.snelheidVoorWachten = null;
    }
    laatTijdLopen(S, 'heerVoorSnelheid');
    werkBriefKnopBij(S);
  };

  $('heer').addEventListener('input', (ev) => {
    const r = ev.target.closest('input[type="range"]');
    const S = T.S;
    if (!r || !S || !geef) return;
    geef[r.dataset.wat] = Number(r.value);
    $('heer').querySelector(`[data-geef="${r.dataset.wat}"]`).textContent = r.value;
    $('heer').querySelector('.heer-samen').innerHTML = heerSamenvatting(S, T.eisVanDeHeer(S));
  });

  $('heer').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    const S = T.S;
    if (!b || !S) return;
    b.blur();
    if (b.dataset.actie === 'sluit') {
      T.ui.sluitHeer(S);
    } else if (b.dataset.actie === 'alles') {
      geef = null;
      toonHeer(S);
    } else if (b.dataset.actie === 'betaal') {
      const g = T.betaalHeer(S, geef);
      if (!g.kan) {
        T.ui.bericht(g.reden);
        return;
      }
      if (S.einde) return; // het einde staat al in beeld (T.ui.toonEinde)
      if (S.heer.bezoek && S.heer.bezoek.schandpaal) toonHeer(S);
      else T.ui.sluitHeer(S);
    } else if (b.dataset.wie) {
      T.zetAanDeSchandpaal(S, b.dataset.wie);
      T.ui.sluitHeer(S);
    }
  });

  // Je ambt kwijt: het spel is uit. Het scherm over alles heen, met wat er elk jaar gebeurde.
  T.ui.toonEinde = function (S) {
    S.modus = 'einde';
    $('heer').classList.add('verborgen');
    if (T.ui.briefOpen()) $('brief').classList.add('verborgen');
    const jaren = ((S.heer && S.heer.jaren) || [])
      .map((j) => `${j.jaar}: ${Math.floor(j.deel * 100 + 1e-9)}%${j.straf ? `, ${j.straf}` : ''}`)
      .join(' · ');
    T.ui.toonOverlay(
      'Je ambt kwijt',
      `<p>Twee keer achter elkaar gaf je de heer veel te weinig. Hij heeft een nieuwe schout benoemd: zijn neef, die ook niet kan tellen.</p>` +
        `<p>Jij bent weer een gewone dorpeling, en je buren weten nog precies wat je deed.</p>` +
        (jaren ? `<p class="einde-jaren">Wat de heer kreeg: ${jaren}</p>` : ''),
      'Opnieuw beginnen',
      () => location.reload(),
    );
  };

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
