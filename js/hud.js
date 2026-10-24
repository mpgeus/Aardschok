// Het scherm van het gehuchtspel: de kalender (dag, seizoen, jaar), de statussen, en de vensters (het bouwmenu, de
// marskramer, de heer, ...) -- in de stijl en de plek van js/ui.js, maar in een eigen bestand, want het hoort bij het
// nieuwe spel en niet bij De laatste klim. De voorraad, de twee bazen en de knoppen liggen sinds vraag 146, c op de
// tafel onderin (js/balk.js). Sinds de kaarten van het oude spel weg zijn
// (25 sep, ontwerp/werklijst.md punt 7c) staat het altijd aan; T.NIEUWE_HUD blijft bestaan omdat
// een paar plekken er nog naar vragen. Het oude scherm linksboven (goud en spullen) staat nog in index.html, maar
// verborgen: de spullen hebben in dit scherm nog geen plek.
(function (T) {
  'use strict';

  T.NIEUWE_HUD = true;
  document.body.classList.toggle('nieuwe-hud', T.NIEUWE_HUD);

  const $ = (id) => document.getElementById(id);
  const kbd = (toets) => `<kbd>${toets}</kbd>`;
  const ESC = kbd('Esc'); // geen tekst
  // Een maand zoals de speler hem ziet (js/tijd.js, T.MAANDEN[i].toon), uit de naam waar de regels op letten.
  const maandToon = (naam) => (T.MAANDEN.find((m) => m.naam === naam) || { toon: naam }).toon;
  // Wat iets kost, of wat de heer eist: "3 wood, 2 planks" (de waren: js/voorraad.js).
  const kostenTekst = (k) => Object.entries(k).map(([wat, n]) => T.hoeveel(n, wat)).join(', ');

  // De statussen (js/statussen.js, T.statussenVan; werklijst vraag 77, stap 2): een kaartje per status zolang hij
  // duurt, naast het doel linksboven, rood als het erger is (hongersnood, strenge kou, ...). Op hover: wat er is, sinds
  // wanneer, en wat helpt.
  T.ui.toonStatussen = function (D) {
    const S = T.S;
    if (!S || D !== S.dorp) return; // een ander dorp zegt het niet tegen jou (js/dorp.js; vraag 71, C)
    const box = $('statussen');
    if (!box) return;
    const dag = Math.floor(S.kalender.dag);
    const lijst = T.statussenVan(D, dag);
    const sleutel = lijst.map((s) => `${s.id}${s.niveau}${s.sinds}`).join(',');
    box.classList.toggle('verborgen', !lijst.length);
    if (box.dataset.sleutel === sleutel) return;
    box.dataset.sleutel = sleutel;
    box.innerHTML = '';
    // Een briefje per status: de naam en hoe lang al; wat het is en wat helpt, zegt het briefje bij de muis (js/balk.js).
    for (const s of lijst) {
      const el = document.createElement('div');
      el.className = `briefje status${s.niveau === 2 ? ' erger' : ''}`; // geen tekst
      el.dataset.status = s.id;
      const duur = dag - s.sinds;
      const kort = duur < 1 ? T.t('since today') : duur === 1 ? T.t('since yesterday') : T.t('for {n} days', { n: T.telwoord(duur) });
      const sinds = duur < 1 ? T.t('since today') : duur === 1 ? T.t('since yesterday')
        : T.t('for {n} days, since {datum}', { n: T.telwoord(duur), datum: T.datumVanDag(s.sinds).tekst });
      el.innerHTML = `<b>${s.naam}</b>${kort}`;
      el.dataset.naam = s.naam;
      el.dataset.uitleg = `${s.zin} (${sinds}.)${s.helpt ? ` ${T.t('What helps: {helpt}.', { helpt: s.helpt })}` : ''}`;
      box.appendChild(el);
    }
  };

  T.ui = T.ui || {};

  // De klok en het deel van de dag zoals de balk ze zegt ("half past seven, morning"): de klok is T.uurTekst (js/dag.js).
  const DAGDELEN = { nacht: T.t('night'), ochtend: T.t('morning'), werk: T.t('work'), schaft: T.t('break'), avond: T.t('evening') };

  // De datum, en eronder het seizoen met het uur en het deel van de dag ("Spring · half past seven,
  // morning"). Ververst elk half uur (T.tikKalender).
  T.ui.toonKalender = function () {
    const S = T.S; // de kalender is die van het spel, ook als een dorp de tijd stilzet (js/tijd.js)
    const d = T.datumVanDag(S.kalender.dag);
    const datumEl = $('kalender-datum');
    datumEl.textContent = d.tekst;
    datumEl.classList.toggle('sint-maarten', d.sintMaarten);
    const uur = T.t('{klok}, {deel}', { klok: T.uurTekst(S.kalender.dag), deel: DAGDELEN[T.dagdeelVan(S.kalender.dag)] });
    // In de balk bovenaan (vraag 166: "zo leeg mogelijk zonder info te missen") alleen het uur, en Sint-Maarten; het
    // seizoen, het weer van vandaag (js/weer.js) en hoe lang het al droog is, zegt het briefje bij de muis (js/balk.js).
    // Vanaf zijn brief de dagen tot hij komt (js/heer.js; Marcel, 18 okt: A1).
    const tot = T.dagenTotDeHeer(S.dorp);
    const heer = d.sintMaarten ? T.t('Martinmas: the lord collects')
      : tot != null ? T.t('{n|Martinmas tomorrow|Martinmas in # days}', { n: tot }) : '';
    $('kalender-seizoen').textContent = T.hoofdletter(uur) + (heer ? ` · ${heer}` : '');
    T.ui.werkBriefKnopBij(S);
    T.ui.werkBalkBij(S); // de lat van de snelheden (js/balk.js)
  };

  // Het bouwmenu (vraag 179, C2; Marcel, 18 okt: "ik wil geen lange lijst aan de linkerkant. Ook wil ik plaatjes van
  // gebouwen erbij"): een klein venster boven de knop Build, met een raster van plaatjes en de naam eronder, zoals in The
  // Settlers 2. Wat iets kost, hoe lang het duurt, wat het doet en wat de heer ervoor wil, staat op het briefje bij de
  // muis (js/balk.js leest data-naam en data-uitleg), want het scherm blijft zo leeg mogelijk. Vooraan wat je met het
  // land doet (een weg, afbreken; werklijst C, stap 5), dan de soorten van de huidige trede: welke, zegt T.inBouwmenu
  // (js/gebouwen.js). Een klik geeft T.S.bouwSoort dat gebouw mee, en dan richt de muis het spookbeeld (js/main.js,
  // js/tekenen.js) tot een klik op de kaart hem neerzet.
  const PLAATJE = { b: 84, h: 62 }; // in pixels van de kunst (--ui-zoom, stijl.css)
  function bouwmenuInhoud(S) {
    const soorten = Object.keys(T.GEBOUWEN).filter((id) => T.inBouwmenu(S.dorp, id));
    const cellen = ['weg', 'afbreken', ...soorten].map((id) => {
      const w = wenkVanSoort(S, id);
      // Wat in de demo op slot is (T.isDicht, js/gebouwen.js; werklijst Q, vraag 181, e): je ziet het, met een slot, maar
      // een klik pakt het niet op.
      const dicht = T.isDicht(S.dorp, id);
      const uitleg = dicht ? `<b>${T.t('In the full game.')}</b><br>${w.uitleg}` : w.uitleg;
      return `<button data-soort="${id}"${dicht ? ' data-dicht="1"' : ''} data-naam="${veilig(w.naam)}" data-uitleg="${veilig(uitleg)}">` +
        `<canvas class="bouw-plaatje"></canvas><span class="bouw-naam">${w.naam}</span>${dicht ? '<span class="bouw-slot" aria-hidden="true"></span>' : ''}</button>`;
    });
    return `<div class="kop">${T.t('Build — {trede}', { trede: T.tredeNaam(S.dorp) })}</div>` +
      `<div class="bouw-raster">${cellen.join('')}</div>` +
      (soorten.length ? '' : `<p class="bouw-leeg">${T.t('There is nothing to build here right now.')}</p>`);
  }

  // Het briefje bij de muis van een plaatje: de naam, en wat het kost en hoe lang het duurt, wat het doet, wat de heer er
  // op Sint-Maarten voor wil (js/heer.js: wat je bouwt, is wat hij ziet), en of je het met R kunt draaien (js/main.js).
  function wenkVanSoort(S, id) {
    const regels = (...delen) => delen.filter(Boolean).join('<br>');
    const vet = (tekst) => (tekst ? `<b>${tekst}</b>` : '');
    if (id === 'weg') {
      const I = T.WEGEN_INSTELLINGEN;
      return {
        naam: T.t('Road'),
        uitleg: regels(vet(T.t('{n|# workday|# workdays} per 10 tiles', { n: Math.round(10 * I.werkPerTegel * 100) / 100 })),
          T.t('The ox cart drives {n}× as fast on a road. Click where it begins, then where it ends.', { n: I.karSneller })),
      };
    }
    if (id === 'afbreken') return { naam: T.t('Demolish'), uitleg: T.t('A road or a building. Nothing comes back.') };
    const g = T.GEBOUWEN[id];
    const naam = T.hoofdletter(g.naam);
    // Een veld (de akker, de wijngaard; js/boerderij.js) kost niets dan werk, en je trekt het bij zijn boerderij.
    if (g.veld) {
      const I = T.BOERDERIJ_INSTELLINGEN;
      return {
        naam,
        uitleg: regels(vet(T.t('{min} to {max} tiles · {werk} workdays per 10 tiles', { min: I.veldMin, max: I.veldMax, werk: T.bouwWerkVan(id, { b: 10, h: 1 }) })),
          `${g.beschrijving}. ${T.t('Click one corner, then the other, within {n} tiles of {boerderij}.', { n: I.veldAfstand, boerderij: T.eenNaam(T.GEBOUWEN[g.veld].naam) })}`),
      };
    }
    return {
      naam,
      uitleg: regels(vet([kostenTekst(g.kosten), duur(S.dorp, id, g)].filter(Boolean).join(' · ')), g.beschrijving,
        g.heer ? `<i>${T.t('At Martinmas the lord wants {heer} for it.', { heer: kostenTekst(T.heerVraagtVoor(id)) })}</i>` : '',
        T.kanDraaien(S.dorp, id) ? T.t('Press R to turn it while you place it.') : ''),
    };
  }

  // Hoe lang het bouwen duurt: zijn bouwtijd, of in het lege begin het werk dat de bouwers eraan hebben (js/bouwen.js).
  function duur(D, id, g) {
    if (T.bouwenMetHanden(D)) return T.t('{n|# workday|# workdays}', { n: T.bouwWerkVan(id) });
    return T.t('{n|# day|# days}', { n: g.bouwtijd });
  }

  // De plaatjes in het raster: van een gebouw de tekening die je echt krijgt (T.volgendeTekening, in de stijl en met het
  // dak van je dorp), verkleind (T.sprites.voorbeeld, js/sprites.js); van de wijngaard drie ranken en van de markt een
  // kraam; van de weg drie tegels zandpad, van de akker drie tegels omgeploegd land, en bij afbreken een rood kruis over
  // het zand. Op ware pixels: het doek is zo groot als het op het scherm komt. Wat nog laadt, komt erin als het er is.
  function vulPlaatjes(box, S) {
    const zoom = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ui-zoom')) || 1;
    const n = Math.max(1, Math.round(zoom * (window.devicePixelRatio || 1)));
    const b = PLAATJE.b * n;
    const h = PLAATJE.h * n;
    let wacht = false;
    for (const knop of box.querySelectorAll('button[data-soort]')) {
      const doek = knop.querySelector('canvas');
      if (doek.dataset.af) continue;
      doek.width = b;
      doek.height = h;
      if (tekenPlaatje(S, knop.dataset.soort, doek.getContext('2d'), b, h, () => S.bouwMenuOpen && vulPlaatjes(box, S))) doek.dataset.af = '1';
      else wacht = true;
    }
    // een vel van de kaart dat nog laadt (de ranken, de kramen, het zand): even later nog eens
    if (wacht) setTimeout(() => S.bouwMenuOpen && box.isConnected && vulPlaatjes(box, S), 400);
  }

  // Of het plaatje van `id` er staat; anders laadt het nog (`opnieuw` hoort het van een tekening, zie T.sprites.voorbeeld).
  function tekenPlaatje(S, id, cx, b, h, opnieuw) {
    if (id === 'weg' || id === 'afbreken' || id === 'akker') {
      const zand = T.sprites.grondMetHoeken('rand', ['zandpad', 'zandpad', 'zandpad', 'zandpad'], 0, 0);
      if (!zand) return false;
      const rij = opRij(zand, 3);
      if (id === 'akker') ploeg(rij);
      if (id === 'afbreken') kruis(rij);
      T.sprites.verkleind(cx, rij, 0, 0, rij.width, rij.height, b, h);
      return true;
    }
    if (id === 'wijngaard' || id === 'markt') {
      const stuk = id === 'wijngaard' ? T.sprites.wijnrank('vol', 0) : T.sprites.kraam('groente', 'luifel', 1, false);
      if (!stuk) return false;
      const rij = opRij(stuk, id === 'wijngaard' ? 3 : 1);
      T.sprites.verkleind(cx, rij, 0, 0, rij.width, rij.height, b, h);
      return true;
    }
    const opz = T.opzoekTegelNaam(T.volgendeTekening(S.dorp, id) || '');
    const klein = opz && T.sprites.voorbeeld(opz.vel, opz.id, b, h, opnieuw);
    if (!klein) return !opz; // zonder tekening blijft het leeg
    cx.drawImage(klein, 0, 0);
    return true;
  }
  // Een stuk een paar keer achter elkaar, steeds een tegel naar rechtsonder (+x op de kaart), op een eigen doek; met
  // waar elk anker ligt.
  function opRij(stuk, aantal) {
    const c = document.createElement('canvas');
    c.width = stuk.b + (aantal - 1) * T.HB;
    c.height = stuk.h + (aantal - 1) * T.HH;
    const cx = c.getContext('2d');
    for (let i = 0; i < aantal; i++) cx.drawImage(stuk.beeld, stuk.sx, stuk.sy, stuk.b, stuk.h, i * T.HB, i * T.HH, stuk.b, stuk.h);
    c.ankers = Array.from({ length: aantal }, (_, i) => ({ x: stuk.ax + i * T.HB, y: stuk.ay + i * T.HH }));
    return c;
  }
  // Omgeploegd land over het zand: bruin, met voren in de lengte van de rij en hier en daar wat groen.
  function ploeg(rij) {
    const cx = rij.getContext('2d');
    for (const a of rij.ankers) {
      T.ruit(cx, a.x, a.y, 0.94);
      cx.fillStyle = '#6e4a2a';
      cx.fill();
      cx.strokeStyle = '#4f3219';
      cx.lineWidth = 2;
      for (let i = -2; i <= 2; i++) {
        // een voor loopt van linksboven naar rechtsonder, zoals de rij
        const dx = i * T.HB * 0.2;
        const dy = -i * T.HH * 0.2;
        cx.beginPath();
        cx.moveTo(a.x + dx - T.HB * 0.35, a.y + dy - T.HH * 0.35);
        cx.lineTo(a.x + dx + T.HB * 0.35, a.y + dy + T.HH * 0.35);
        cx.stroke();
      }
      cx.fillStyle = '#7da23f';
      for (let i = -1; i <= 1; i++) cx.fillRect(Math.round(a.x + i * T.HB * 0.3) - 2, Math.round(a.y - i * T.HH * 0.3) - 2, 4, 3);
    }
  }
  // Een rood kruis over de middelste tegel.
  function kruis(rij) {
    const cx = rij.getContext('2d');
    const a = rij.ankers[Math.floor(rij.ankers.length / 2)];
    const r = T.HH * 1.1;
    cx.strokeStyle = '#7a2022';
    cx.lineWidth = 7;
    cx.lineCap = 'round';
    cx.beginPath();
    cx.moveTo(a.x - r, a.y - r);
    cx.lineTo(a.x + r, a.y + r);
    cx.moveTo(a.x + r, a.y - r);
    cx.lineTo(a.x - r, a.y + r);
    cx.stroke();
  }

  T.ui.toonBouwmenu = function (S) {
    const box = $('bouwmenu');
    box.classList.toggle('verborgen', !S.bouwMenuOpen);
    if (S.bouwMenuOpen) {
      box.innerHTML = bouwmenuInhoud(S);
      vulPlaatjes(box, S);
    } else T.ui.verbergWenk(); // het briefje van een plaatje gaat mee weg (js/balk.js)
    $('bouwmenu-knop').classList.toggle('actief', S.bouwMenuOpen || !!S.bouwSoort);
  };

  $('bouwmenu').addEventListener('click', (ev) => {
    const b = ev.target.closest('button[data-soort]');
    if (!b || !T.S || b.dataset.dicht) return; // op slot in de demo: het briefje bij de muis zegt het al
    T.S.bouwSoort = b.dataset.soort;
    T.S.bouwKant = null; // een nieuw gebouw in de hand begint met zijn deur naar het zuiden (vraag 179, B1; js/main.js)
    T.S.veldHoek = null; // een veld begint weer bij zijn eerste hoek (js/main.js)
    T.S.bouwMenuOpen = false;
    T.ui.toonBouwmenu(T.S);
  });

  $('bouwmenu-knop').addEventListener('click', (ev) => {
    ev.currentTarget.blur();
    const S = T.S;
    if (!S) return;
    // Bouwen en een venster tegelijk kan niet: bouwen richt de muis op de kaart, en die ligt stil zolang er een venster
    // open is (js/ui.js).
    if (!T.ui.sluitOpenVenster(S)) return;
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
    koopt: { duur: T.t('he is paying well now'), goedkoop: T.t('he is paying little now') },
    verkoopt: { duur: T.t('dear now'), goedkoop: T.t('cheap now') },
  };

  // Of dit de duurste of goedkoopste keer van het jaar is, als regeltje onder de prijs.
  function prijsMerk(S, wat, kant) {
    const hoe = T.prijsVanHetJaar(S.dorp, wat, kant);
    return hoe ? `<span class="handel-merk ${hoe}">${PRIJS_TAAL[kant][hoe]}</span>` : '';
  }

  function handelKnop(actie, wat, n, tekst, k) {
    const titel = k.kan ? '' : ` title="${k.reden.replace(/"/g, '&quot;')}"`;
    return `<button data-actie="${actie}" data-wat="${wat}" data-n="${n}"${k.kan ? '' : ' disabled'}${titel}>${tekst}</button>`;
  }

  function handelInhoud(S) {
    const m = S.dorp.marskramer;
    const H = T.HANDEL_INSTELLINGEN;
    const v = S.dorp.voorraad;
    // Wat je hebt; van het vee dat hij verkoopt (js/handel.js, `vee`) de dieren van het dorp.
    const heb = (wat) => (H.verkoopt[wat] && H.verkoopt[wat].vee ? T.veeVan(S.dorp).filter((e) => e.dier === wat).length : Math.floor(v[wat] || 0));
    // Wat hij deze ronde bij zich heeft (T.verkooptNu): graan alleen in de lente, per pak van tien.
    const verkoopt = T.verkooptNu(S.dorp).map((wat) => {
      const k = T.kanKopen(S.dorp, wat, 1);
      const prijs = k.per > 1 ? T.t('{per} for {prijs}', { per: k.per, prijs: T.hoeveel(k.prijs, 'goud') }) : T.t('{prijs} each', { prijs: T.hoeveel(k.prijs, 'goud') });
      return (
        `<div class="handel-rij"><span class="handel-naam">${T.hoofdletter((!m.bestelling && H.verkoopt[wat].naam) || T.waarNaam(wat))} <small>${T.t('you have {n}', { n: heb(wat) })}</small></span>` +
        `<span class="handel-prijs">${prijs}<small>${prijsMerk(S, wat, 'verkoopt')}${T.t('he has {n} left', { n: (m.heeft[wat] || 0) * k.per })}</small></span>` +
        `<span class="handel-knoppen">${handelKnop('koop', wat, 1, T.t('Buy {n}', { n: k.per }), k)}${handelKnop('koop', wat, 5, T.t('Buy {n}', { n: k.per * 5 }), T.kanKopen(S.dorp, wat, 5))}</span></div>`
      );
    });
    // Wat hij koopt, voor zover je er iets van hebt. Bij het graan staat hoeveel dagen het dorp
    // ervan kan eten, zodat je niet per ongeluk je wintereten verkoopt.
    const etenPerDag = (S.dorp.bevolking || 0) * T.etenPerMens(S.dorp);
    const koopt = Object.keys(H.koopt).filter((wat) => heb(wat) > 0).map((wat) => {
      const k = T.kanVerkopen(S.dorp, wat, 1);
      const eten = wat === 'graan' && etenPerDag > 0 ? ` · ${T.t('food for {n|# day|# days}', { n: Math.floor((v.graan || 0) / etenPerDag) })}` : '';
      return (
        `<div class="handel-rij"><span class="handel-naam">${T.hoofdletter(T.waarNaam(wat))} <small>${T.t('you have {n}', { n: heb(wat) })}${eten}</small></span>` +
        `<span class="handel-prijs">${T.t('{per} for {prijs}', { per: k.per, prijs: T.hoeveel(k.prijs, 'goud') })}<small>${prijsMerk(S, wat, 'koopt')}</small></span>` +
        `<span class="handel-knoppen">${handelKnop('verkoop', wat, 1, T.t('Sell {n}', { n: k.per }), k)}${handelKnop('verkoop', wat, 5, T.t('Sell {n}', { n: k.per * 5 }), T.kanVerkopen(S.dorp, wat, 5))}</span></div>`
      );
    });
    // Op bestelling (de bode, js/bode.js) is het geen ronde van het seizoen.
    const maand = m.bestelling ? T.t('on order') : maandToon(H.bezoeken[m.bezoek].maand);
    return (
      `<div class="handel-kop"><span class="handel-titel">${T.t('The merchant')}</span><span class="handel-wanneer">${maand}</span>` +
      `<button class="handel-sluit" data-actie="sluit" title="${T.t('Close (Esc)')}">✕</button></div>` +
      `<p class="handel-staat">${T.t('He has {goud} on him and room for {pakken}. You have {jouwGoud}.', {
        goud: `<b>${T.hoeveel(m.beurs, 'goud')}</b>`,
        pakken: `<b>${T.t('{n|# pack|# packs}', { n: m.plaats })}</b>`,
        jouwGoud: `<b>${T.hoeveel(heb('goud'), 'goud')}</b>`,
      })}</p>` +
      `<div class="kop">${T.t('He sells')}</div>${verkoopt.join('')}` +
      `<div class="kop">${T.t('He buys')}</div>${koopt.join('') || `<p class="handel-leeg">${T.t('You have nothing he wants.')}</p>`}` +
      `<p class="handel-voet">${T.t('While you trade, time stands still. {esc} closes.', { esc: ESC })}</p>`
    );
  }

  function toonHandel(S) {
    const box = $('handel');
    box.innerHTML = handelInhoud(S);
    box.classList.remove('verborgen');
  }

  T.ui.openHandel = function (D) {
    const S = T.S;
    if (D !== S.dorp) return; // een ander dorp zegt het niet tegen jou (js/dorp.js; vraag 71, C)
    if (!T.kanHandelen || !T.kanHandelen(S.dorp)) return;
    // Zolang je handelt, staat de tijd stil (js/ui.js, T.ui.openVenster); bij het sluiten loopt hij weer zoals je koos.
    if (T.ui.openVenster(S, 'handel')) toonHandel(S);
  };

  T.ui.sluitHandel = function (D) {
    const S = T.S;
    if (D !== S.dorp) return; // een ander dorp zegt het niet tegen jou (js/dorp.js; vraag 71, C)
    T.ui.sluitVenster(S, 'handel');
  };

  T.ui.meldVenster('handel', { el: 'handel', open: (S) => T.ui.openHandel(S.dorp), sluit: (S) => T.ui.sluitHandel(S.dorp) });

  $('handel').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    const S = T.S;
    if (!b || !S) return;
    b.blur();
    if (b.dataset.actie === 'sluit') {
      T.ui.sluitHandel(S.dorp);
      return;
    }
    const n = Number(b.dataset.n);
    const r = b.dataset.actie === 'koop' ? T.koop(S.dorp, b.dataset.wat, n) : T.verkoop(S.dorp, b.dataset.wat, n);
    if (!r.kan && T.ui.bericht) T.ui.bericht(r.reden);
    if (T.kanHandelen(S.dorp)) toonHandel(S);
    else T.ui.sluitHandel(S.dorp);
  });

  // ── De heer (js/heer.js; spel.md, "Sint-Maarten") ──
  // Het betalen op Sint-Maarten, in de stijl van het venster van de marskramer (vanuit zijn gesprek,
  // doe: { heer: true }), met daarin de schandpaal als die erbij hoort. Zijn brieven staan in
  // js/brieven.js. Het einde (je ambt kwijt) gebruikt het scherm over alles heen uit js/ui.js
  // (T.ui.toonOverlay).
  const hebNu = (S, wat) => Math.floor((S.dorp.voorraad && S.dorp.voorraad[wat]) || 0);
  // Een naam kan de speler zelf geven (js/opties.js), dus die gaat nooit rauw in de html.
  const veilig = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const opsomming = (delen) => (delen.length ? T.opsomming(delen) : T.t('nothing'));
  const eisInTaal = (eis) => opsomming(eis.volgorde.map((wat) => T.hoeveel(eis.per[wat], wat)));

  // Alleen betalen of weigeren (Marcel, 18 okt, B2): wat hij neemt als je betaalt, is T.alWatHijVraagt (js/heer.js),
  // dezelfde vraag als de knop. Weigeren vraagt één keer of je het zeker weet: daarna is er geen weg terug.
  let weigerZeker = false;

  // Per goed: wat hij vraagt en waarvoor, wat je hebt, en wat hij neemt.
  function heerRijen(S, eis, g) {
    return eis.volgorde.map((wat) => {
      const waarom = eis.regels.filter((r) => r.wat === wat).map((r) => T.t('{n} for {waarom}', { n: r.aantal, waarom: r.waarom })).join(' · ');
      return (
        `<div class="heer-rij">` +
        `<span class="heer-naam">${T.hoofdletter(T.waarNaam(wat))} <small>${T.t('he asks {n} · you have {heb}', { n: eis.per[wat], heb: hebNu(S, wat) })}</small>` +
        `<small class="heer-waarom">${waarom}</small></span>` +
        `<span class="heer-geef" data-geef="${wat}">${g.neemt[wat] || 0}</span>` +
        `</div>`
      );
    }).join('');
  }

  // De twee keuzes als zegels van rode lak, zoals onder zijn brieven (Marcel, 18 okt: "mooie grote knoppen", "in de stijl
  // van een zegel, kaarsvet", "middeleeuwen enzo, koning heer"): betalen is zijn zegel heel, weigeren is het gebroken.
  // Het wapen in de lak is een kroon; de gebroken helften zijn hetzelfde zegel, langs een barst afgesneden (stijl.css).
  const KROON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18 L4.5 8 L8.5 12.5 L12 5 L15.5 12.5 L19.5 8 L21 18 Z M3.5 19.5 H20.5 V21 H3.5 Z"/></svg>';
  function zegel(actie, tekst, { gebroken = false, uit = false, reden = '' } = {}) {
    const lak = `<span class="zegel-lak">${KROON}</span>`;
    const was = gebroken ? `<span class="zegel-helft links">${lak}</span><span class="zegel-helft rechts">${lak}</span>` : lak;
    return `<button class="zegel${gebroken ? ' gebroken' : ''}" data-actie="${actie}"${uit ? ` disabled title="${reden}"` : ''}>` +
      `<span class="zegel-was">${was}</span><span class="zegel-tekst">${tekst}</span></button>`;
  }

  // Wat betalen kost: het deel dat hij krijgt, de straf als het te weinig is, en of je graan het haalt tot de oogst.
  function heerSamenvatting(S, eis, g) {
    const v = T.heerVooruitzicht(S.dorp, g);
    const pct = Math.floor(g.deel * 100 + 1e-9);
    const soort = g.ambtKwijt || g.schandpaal ? 'zwaar' : g.boete ? 'boete' : 'goed';
    const goudExtra = g.neemt.goud > (eis.per.goud || 0)
      ? ` ${T.t('Of your gold he takes {n}, also in place of whatever else is missing.', { n: g.neemt.goud })}` : '';
    // Het vee (js/vee.js; T.heerVooruitzicht): de melk drinkt het dorp vóór het graan, dus die staat
    // al van het eten af; en wie graan tekortkomt, eet daarna de kaas. Honger is dus pas een tekort
    // dat groter is dan de kaas.
    // Sinds 25 sep vult ook vlees een maag (js/behoeften.js): kaas en vlees samen zijn de achtervang.
    const melk = Math.round(v.melk || 0);
    const kaas = Math.floor(v.kaas || 0);
    const vlees = Math.floor(v.vlees || 0);
    const achter = kaas + vlees;
    const achterNaam = kaas && vlees ? T.t('the cheese and the meat') : kaas ? T.t('the cheese') : T.t('the meat');
    const rest = Math.round(v.over);
    const achterOver = Math.round(v.over + achter);
    const zaai = { maand: maandToon('lentemaand'), zaaien: T.hoeveel(Math.round(v.zaaien), 'graan') };
    const uitkomst = rest >= 0
      ? (achter
        ? T.t('Sowing in {maand} costs {zaaien}: {rest} will be left over, and you keep {achter} in hand.', { ...zaai, rest, achter: achterNaam })
        : T.t('Sowing in {maand} costs {zaaien}: {rest} will be left over.', { ...zaai, rest }))
      : achter && achterOver >= 0
        ? T.t('Sowing in {maand} costs {zaaien}: you are {tekort} grain short, but {achter} will cover that, leaving {over}.', { ...zaai, tekort: -rest, achter: achterNaam, over: achterOver })
        : achter
          ? T.t('Sowing in {maand} costs {zaaien}: you are {tekort} grain short, and with {achter} added still {nog}: that is hunger before the harvest.', { ...zaai, tekort: -rest, achter: achterNaam, nog: -achterOver })
          : T.t('Sowing in {maand} costs {zaaien}: you are {tekort} grain short, and that is hunger before the harvest.', { ...zaai, tekort: -rest });
    const heb = [T.hoeveel(Math.round(v.na), 'graan')].concat(kaas ? [T.hoeveel(kaas, 'kaas')] : [], vlees ? [T.hoeveel(vlees, 'vlees')] : []);
    const eet = [T.t('Until the harvest the village eats about {n}.', { n: Math.round(v.eten) })];
    if (melk > 0) eet.push(T.t('The cows give about {n} in milk besides.', { n: melk }));
    if (v.soldaten) eet.push(T.t('His soldiers eat {n}.', { n: Math.round(v.soldaten) }));
    const knoppen = weigerZeker
      ? `<p class="heer-deel zwaar">${T.t('Refuse him? There is no going back: when it gets dark, his army comes.')}</p>` +
        `<div class="heer-knoppen heer-zegels"><button class="heer-terug" data-actie="terug">${T.t('No')}</button>` +
        zegel('weigerZeker', T.t('Yes, break his seal'), { gebroken: true }) + `</div>`
      : `<div class="heer-knoppen heer-zegels">${zegel('betaal', T.t('Pay'), { uit: !g.kan, reden: g.reden })}` +
        `${zegel('weiger', T.t('Refuse'), { gebroken: true })}</div>`;
    return (
      `<p class="heer-deel ${soort}">${T.t('He takes {pct}% of what he asks.', { pct })} ${g.tekst}${goudExtra}</p>` +
      `<p class="heer-vooruit">${T.t('After that you have {heb}.', { heb: T.opsomming(heb) })} ${eet.join(' ')} ${uitkomst}</p>` +
      knoppen
    );
  }

  function schandpaalInhoud(S) {
    const rijen = T.schandpaalKeuzes(S.dorp).map((k) => {
      const prijs = k.wie === 'aanvoerder'
        ? T.t('The village does not blame you. The lord laughs, and adds {boete} to the fine.', { boete: T.hoeveel(k.boete, 'goud') })
        : T.t('The village is {pct}% less content, and forgets only after months.', { pct: Math.round(k.kost * 100) });
      return (
        `<button class="paal-keuze" data-wie="${k.wie}"><span class="paal-naam">${veilig(k.naam)}</span>` +
        `<span class="paal-wie">${veilig(k.eigenschap)}</span><span class="paal-prijs">${prijs}</span></button>`
      );
    }).join('');
    return (
      `<div class="venster-kop"><span class="venster-titel">${T.t('The pillory')}</span><span class="venster-wanneer">${T.t('Martinmas')}</span></div>` +
      `<p class="venster-staat">${T.t('"Someone must feel this, commander. You may choose who." Who stands in the pillory on the square for three days?')}</p>` +
      rijen
    );
  }

  function toonHeer(S) {
    const box = $('heer');
    const b = S.dorp.heer && S.dorp.heer.bezoek;
    if (b && b.schandpaal) {
      box.innerHTML = schandpaalInhoud(S);
    } else {
      const eis = T.eisVanDeHeer(S.dorp);
      const g = T.gevolgVanBetaling(S.dorp, T.alWatHijVraagt(S.dorp), eis);
      box.innerHTML =
        `<div class="venster-kop"><span class="venster-titel">${T.t('Martinmas')}</span><span class="venster-wanneer">${T.t('the lord is counting')}</span>` +
        `<button class="venster-sluit" data-actie="sluit" title="${T.t('Not yet (Esc)')}">✕</button></div>` +
        `<p class="venster-staat">${T.t('He asks for {eis}. Pay, and he takes whatever there is of it, and gold in place of what is missing. Or refuse him.', { eis: eisInTaal(eis) })}</p>` +
        heerRijen(S, eis, g) +
        `<div class="heer-samen">${heerSamenvatting(S, eis, g)}</div>` +
        `<p class="venster-voet">${T.t('While you stand before him, time stands still. {esc}: not yet (he waits).', { esc: ESC })}</p>`;
    }
    box.classList.remove('verborgen');
  }

  T.ui.openHeer = function (S) {
    const b = S.dorp.heer && S.dorp.heer.bezoek;
    if (!T.heerWacht(S.dorp) && !(b && b.schandpaal)) return;
    if (!T.ui.openVenster(S, 'heer')) return;
    weigerZeker = false;
    toonHeer(S);
  };

  // Dicht. Bij de schandpaal kan dat niet: daar moet je kiezen. De tijd loopt weer op de snelheid
  // die de speler koos (js/tijd.js, T.laatTijdGaan).
  T.ui.sluitHeer = function (S) {
    const b = S.dorp.heer && S.dorp.heer.bezoek;
    if (b && b.schandpaal) return;
    T.ui.sluitVenster(S, 'heer');
    weigerZeker = false;
    T.ui.werkBriefKnopBij(S);
  };

  T.ui.meldVenster('heer', { el: 'heer', open: (S) => T.ui.openHeer(S), sluit: (S) => T.ui.sluitHeer(S) });

  $('heer').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    const S = T.S;
    if (!b || !S) return;
    b.blur();
    if (b.dataset.actie === 'sluit') {
      T.ui.sluitHeer(S);
    } else if (b.dataset.actie === 'weiger' || b.dataset.actie === 'terug') {
      weigerZeker = b.dataset.actie === 'weiger';
      toonHeer(S);
    } else if (b.dataset.actie === 'weigerZeker') {
      const w = T.weigerHeer(S.dorp);
      if (!w.kan) T.ui.bericht(w.reden);
      T.ui.sluitHeer(S);
    } else if (b.dataset.actie === 'betaal') {
      const g = T.betaalHeer(S.dorp, T.alWatHijVraagt(S.dorp));
      if (!g.kan) {
        T.ui.bericht(g.reden);
        return;
      }
      if (S.dorp.einde) return; // het einde staat al in beeld (T.ui.toonEinde)
      if (S.dorp.heer.bezoek && S.dorp.heer.bezoek.schandpaal) toonHeer(S);
      else T.ui.sluitHeer(S);
    } else if (b.dataset.wie) {
      T.zetAanDeSchandpaal(S.dorp, b.dataset.wie);
      T.ui.sluitHeer(S);
    }
  });

  // Je ambt kwijt: het spel is uit. Het scherm over alles heen, met wat er elk jaar gebeurde.
  T.ui.toonEinde = function (D) {
    const S = T.S;
    if (D !== S.dorp) return; // een ander dorp zegt het niet tegen jou (js/dorp.js; vraag 71, C)
    // Speelt er een scène (js/regie.js), dan wacht het tot het beeld zwart is: dan roept de regie dit opnieuw aan.
    if (S.regie && !S.regie.klaar) return;
    S.modus = 'einde';
    $('heer').classList.add('verborgen');
    if (T.ui.briefOpen()) $('brief').classList.add('verborgen');
    const jaren = ((S.dorp.heer && S.dorp.heer.jaren) || [])
      .map((j) => (j.geweigerd ? T.t('{jaar}: refused', { jaar: j.jaar })
        : j.straf
          ? T.t('{jaar}: {pct}%, {straf}', { jaar: j.jaar, pct: Math.floor(j.deel * 100 + 1e-9), straf: j.straf })
          : T.t('{jaar}: {pct}%', { jaar: j.jaar, pct: Math.floor(j.deel * 100 + 1e-9) })))
      .join(' · ');
    const heer = jaren ? `<p class="einde-jaren">${T.t('What the lord received: {jaren}', { jaren })}</p>` : '';
    // Het eerste Sint-Maarten (werklijst, E, stap 5; Marcel, 18 okt, D2): je weigerde hem en zijn leger kwam (js/heer.js,
    // T.weigerHeer: "met death als gevolg"), of je betaalde en hij reed weg met je waren (met de scène van het betalen, de
    // demo). Daaronder het jaar in een paar regels (T.eindRegels, js/einde.js), de punten als ze geteld zijn (vraag 186:
    // één getal onder het jaarverslag, D.punten, de trigger `punten` van het demojaar), en in de demo (S.scenario.demo,
    // levels/demojaar.js) dat ze hier eindigt, met de link naar de Steam-pagina zodra die er is (T.DEMO_INSTELLINGEN). De
    // cinematics komen ervoor (werklijst, E, stap 4).
    const regels = () => `<ul class="einde-regels">${T.eindRegels(D).map((r) => `<li>${veilig(r)}</li>`).join('')}</ul>`;
    const punten = () => {
      const p = D.punten;
      if (!p) return '';
      const beste = p.beste == null ? '' : p.totaal > p.beste ? ` ${T.t('A new best!')}` : ` ${T.t('Your best: {beste}.', { beste: p.beste })}`;
      return `<p class="einde-punten">${T.t('Score: {totaal}', { totaal: p.totaal })}</p>` +
        `<p class="einde-jaren">${T.t('{verzameld} for what your people gathered this year, {ligt} for what lay in your stores on Martinmas.', { verzameld: p.verzameld, ligt: p.ligt })}${beste}</p>`;
    };
    const demo = () => punten() + (!(S.scenario && S.scenario.demo) ? '' : `<p class="einde-demo">${T.t('This is where the demo ends.')}</p>` +
      (T.DEMO_INSTELLINGEN.steam ? `<p><a class="einde-wenslijst" href="${veilig(T.DEMO_INSTELLINGEN.steam)}" target="_blank" rel="noopener">${T.t('Wishlist {naam} on Steam', { naam: T.NAAM })}</a></p>` : ''));
    if (D.einde && D.einde.reden === 'leger') {
      T.ui.toonOverlay(
        T.t('Death'),
        `<p>${T.t('You refused the lord what he asked. That night his army came up the road, with torches.')}</p>` +
          `<p>${T.t('By morning there was nothing left of {dorp}.', { dorp: veiligeNaam(D) })}</p>` + regels() + demo(),
        T.t('To the title screen'),
        () => T.naarTitelscherm(),
      );
      return;
    }
    if (D.einde && D.einde.reden === 'betaald') {
      T.ui.toonOverlay(
        T.t('Until next year'),
        `<p>${T.t('The lord rides off down the road, with your grain, your gold, and whatever else his men could load onto his wagons.')}</p>` +
          `<p>${T.t('Next year he will be back. And he will want more.')}</p>` + regels() + demo(),
        T.t('To the title screen'),
        () => T.naarTitelscherm(),
      );
      return;
    }
    // Een scenario dat eindigt (de trigger `einde`, js/scenario.js): de kop en de tekst van het level, of gewonnen of
    // verloren als het die niet geeft.
    if (D.einde && D.einde.reden === 'scenario') {
      const E = D.einde;
      T.ui.toonOverlay(
        E.kop ? T.tGegevens(E.kop) : E.gewonnen ? T.t('Victory') : T.t('Defeat'),
        (E.tekst ? `<p>${veilig(T.tGegevens(E.tekst))}</p>` : '') + regels(),
        T.t('To the title screen'),
        () => T.naarTitelscherm(),
      );
      return;
    }
    // Minder dan tien mensen over (js/einde.js; werklijst vraag 101, d), of je ambt kwijt (js/heer.js).
    if (D.einde && D.einde.reden === 'leeg') {
      T.ui.toonOverlay(
        T.t('The village is empty'),
        `<p>${T.t('There are fewer than {n} people left. The lord strikes {dorp} from his book: a village without people brings in nothing.', { n: T.EINDE_INSTELLINGEN.minstensOver, dorp: veiligeNaam(D) })}</p>` +
          `<p>${T.t('Whoever is left moves away. So do you.')}</p>` + heer,
        T.t('To the title screen'),
        () => T.naarTitelscherm(),
      );
      return;
    }
    // Het dorp jaagt je weg (js/bazen.js; werklijst vraag 106, b): het vertrouwen is op.
    if (D.einde && D.einde.reden === 'verjaagd') {
      const waarom = D.einde.waarom ? ` ${T.t('The last thing they held against you: {waarom}.', { waarom: veilig(D.einde.waarom) })}` : '';
      T.ui.toonOverlay(
        T.t('Driven out'),
        `<p>${T.t('The village no longer trusted you. One evening they stood at your door, with torches.')}${waarom}</p>` +
          `<p>${T.t('The lord appoints a new commander. Whether the village trusts that one, you will never hear: you are already over the hill.')}</p>` + heer,
        T.t('To the title screen'),
        () => T.naarTitelscherm(),
      );
      return;
    }
    // Je ambt kwijt: met twee bazen omdat zijn gunst op is (D.einde.waarom), anders na twee keer veel te weinig.
    const ontslag = D.einde && D.einde.waarom
      ? `<p>${veilig(D.einde.waarom)} ${T.t('He has appointed a new commander: his nephew, who cannot count either.')}</p>`
      : `<p>${T.t('Twice in a row you gave the lord far too little.')} ${T.t('He has appointed a new commander: his nephew, who cannot count either.')}</p>`;
    T.ui.toonOverlay(
      T.t('You lost your office'),
      ontslag +
        `<p>${T.t('You are an ordinary villager again, and your neighbours remember exactly what you did.')}</p>` + heer,
      T.t('To the title screen'), // daar begin je opnieuw, of laad je een bewaard spel (js/menu.js)
      () => T.naarTitelscherm(),
    );
  };

  // De naam van je dorp, veilig in html (je typt hem zelf bij Nieuw spel), of "het dorp".
  const veiligeNaam = (D) => veilig(T.dorpsnaam(D) || T.t('the village'));

  // ── Het slachten (js/vee.js, T.slacht; spel.md, "Marcel koos voor stap 2") ──
  // Op 1 slachtmaand opent dit vanzelf: de winter begint, en het hooi zegt hoeveel vee je houdt. Je
  // kunt het ook zelf openen, onderaan het veldenvenster. Per groep (koeien, kalveren, schapen,
  // lammeren) schuif je hoeveel er naar de slager gaan, het oudste eerst. Het venster rekent mee of
  // het hooi de winter dan haalt, en wat het vlees en de huiden zijn. Het begint op het voorstel
  // (T.slachtVoorstel): zo weinig als kan, zodat het hooi het haalt. Zolang het open is, staat de
  // tijd stil (T.houdTijdStil) en is Esc niemand slachten (S.modus 'slachten', js/main.js).
  let slacht = null; // per groep (T.kuddeGroepen): hoeveel er gaan

  const dagNu = (S) => Math.floor((S.kalender && S.kalender.dag) || 0);
  const gekozen = (groepen) => groepen.flatMap((g, i) => g.dieren.slice(0, (slacht && slacht[i]) || 0));

  function slachtRijen(S, groepen) {
    const dag = dagNu(S);
    return groepen.map((g, i) => {
      const n = g.dieren.length;
      const eet = T.hooiVanDier(g.dieren[0], dag);
      const hooi = eet > 0 ? T.t('eats {n} hay per winter day', { n: eet }) : T.t('eats no hay');
      return (
        `<div class="heer-rij">` +
        `<span class="heer-naam">${T.hoofdletter(n === 1 ? g.naam : g.meervoud)} <small>${T.t('you have {n} · {hooi}', { n, hooi })}</small></span>` +
        `<input type="range" min="0" max="${n}" step="1" value="${slacht[i] || 0}" data-groep="${i}">` +
        `<span class="heer-geef" data-slacht="${i}">${slacht[i] || 0}</span>` +
        `</div>`
      );
    }).join('');
  }

  // Het deel dat met de schuiven meeverandert: haalt het hooi de winter, en wat geeft het slachten.
  function slachtSamenvatting(S, groepen) {
    const dag = dagNu(S);
    const weg = gekozen(groepen);
    const blijft = T.veeVan(S.dorp).filter((e) => !weg.includes(e));
    const perDag = T.hooiPerWinterdag(S.dorp, dag, blijft);
    const hooi = T.hooiVoorDeWinter(S.dorp, dag);
    const winter = T.winterDagen(dag);
    const dagen = perDag > 0 ? Math.floor(hooi / perDag) : Infinity;
    const haalt = dagen >= winter;
    let winterTekst = '';
    if (T.VEE_INSTELLINGEN.winterzorg) {
      winterTekst = perDag <= 0
        ? T.t('Whoever is left eats no hay.')
        : haalt
          ? T.t('Those who are left eat {perDag} hay a day: the hay lasts the winter, with {over} to spare.', { perDag: Math.round(perDag * 10) / 10, over: Math.floor(hooi - perDag * winter) })
          : T.t('Those who are left eat {perDag} hay a day: the hay runs out after {n} of the {winter} days, and then the livestock die of hunger.', { perDag: Math.round(perDag * 10) / 10, n: dagen, winter });
    }
    const o = T.slachtOpbrengst(weg, dag);
    let opbrengst = weg.length
      ? T.t('The slaughter gives {vlees} and {huiden}.', { vlees: T.hoeveel(Math.round(o.vlees), 'vlees'), huiden: T.hoeveel(o.huiden, 'huiden') })
      : T.t('You slaughter nobody.');
    if (o.vlees > 0 && T.zoutDekking) {
      const z = T.zoutDekking(S.dorp);
      const vrij = Math.max(0, Math.floor((S.dorp.voorraad.zout || 0) * T.BEHOEFTEN_INSTELLINGEN.zoutHoudtGoed - z.totaal));
      opbrengst += ` ${vrij >= o.vlees
        ? T.t('Your salt preserves the meat.')
        : vrij > 0
          ? T.t('Meat spoils without salt, and your salt preserves only {n} more: the rest is gone within a few weeks.', { n: vrij })
          : T.t('Meat spoils without salt, and you have no salt left: it is gone within a few weeks.')}`;
    }
    return (
      `<p class="heer-deel ${!T.VEE_INSTELLINGEN.winterzorg || haalt ? 'goed' : 'zwaar'}">${winterTekst} ${opbrengst}</p>` +
      `<div class="heer-knoppen"><button data-actie="voorstel" title="${T.t('As few as possible, so that the hay lasts the winter')}">${T.t('Suggestion')}</button>` +
      `<button class="heer-geef-knop" data-actie="slacht"${weg.length ? '' : ` disabled title="${T.t('First slide how many go')}"`}>${T.t('Slaughter')}</button></div>`
    );
  }

  function toonSlachten(S) {
    const box = $('slachten');
    const dag = dagNu(S);
    const groepen = T.kuddeGroepen(S.dorp, dag);
    if (!slacht) {
      const voorstel = T.slachtVoorstel(S.dorp, dag).dieren;
      slacht = groepen.map((g) => g.dieren.filter((e) => voorstel.includes(e)).length);
    }
    const hooi = Math.floor(T.hooiVoorDeWinter(S.dorp, dag));
    const winter = T.winterDagen(dag);
    const inleiding = T.VEE_INSTELLINGEN.winterzorg
      ? `${T.isVeeWinter(dag)
        ? T.t('It is winter: {winter|# more day|# more days} until the grass is back. Until then the livestock eat hay, and you have {hooi}.', { winter, hooi: T.hoeveel(hooi, 'hooi') })
        : T.t('The next winter lasts {winter|# day|# days}, and then the livestock eat hay. You have {hooi}, counting what is still standing in the meadows.', { winter, hooi: T.hoeveel(hooi, 'hooi') })} ${
        T.t('Whatever the hay cannot see through the winter goes to the butcher, or dies. The oldest of each group go.')}`
      : T.t('Who goes to the butcher? The oldest of each group go.');
    box.innerHTML =
      `<div class="venster-kop"><span class="venster-titel">${T.t('The slaughter')}</span><span class="venster-wanneer">${T.datumVanDag(dag).tekst}</span>` +
      `<button class="venster-sluit" data-actie="sluit" title="${T.t('Slaughter nobody (Esc)')}">✕</button></div>` +
      `<p class="venster-staat">${inleiding}</p>` +
      (groepen.length ? slachtRijen(S, groepen) : `<p class="venster-staat">${T.t('There is no livestock.')}</p>`) +
      `<div class="heer-samen">${slachtSamenvatting(S, groepen)}</div>` +
      `<p class="venster-voet">${T.t('While this is open, time stands still. {esc}: slaughter nobody.', { esc: ESC })}</p>`;
    box.classList.remove('verborgen');
  }

  T.ui.openSlachten = function (D) {
    const S = T.S;
    if (D !== S.dorp) return; // een ander dorp zegt het niet tegen jou (js/dorp.js; vraag 71, C)
    // Het venster opent zodra je rondloopt, niet midden in een gesprek of een ander venster; tot dan blijft de
    // vraag staan (js/vee.js, T.tikVeeDag vraagt het elke dag).
    if (S.modus && S.modus !== 'verkennen') return;
    if (!T.kuddeGroepen || !T.veeVan(S.dorp).length) {
      if (S.dorp.vee) S.dorp.vee.slachtVraag = false;
      return;
    }
    if (!T.ui.openVenster(S, 'slachten')) return;
    slacht = null;
    toonSlachten(S);
  };

  T.ui.sluitSlachten = function (S) {
    T.ui.sluitVenster(S, 'slachten');
    if (S.dorp.vee) S.dorp.vee.slachtVraag = false;
    slacht = null;
  };

  T.ui.meldVenster('slachten', { el: 'slachten', open: (S) => T.ui.openSlachten(S.dorp), sluit: (S) => T.ui.sluitSlachten(S) });

  $('slachten').addEventListener('input', (ev) => {
    const r = ev.target.closest('input[type="range"]');
    const S = T.S;
    if (!r || !S || !slacht) return;
    slacht[Number(r.dataset.groep)] = Number(r.value);
    $('slachten').querySelector(`[data-slacht="${r.dataset.groep}"]`).textContent = r.value;
    $('slachten').querySelector('.heer-samen').innerHTML = slachtSamenvatting(S, T.kuddeGroepen(S.dorp, dagNu(S)));
  });

  $('slachten').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    const S = T.S;
    if (!b || !S) return;
    b.blur();
    if (b.dataset.actie === 'sluit') {
      T.ui.sluitSlachten(S);
    } else if (b.dataset.actie === 'voorstel') {
      slacht = null;
      toonSlachten(S);
    } else if (b.dataset.actie === 'slacht') {
      const weg = gekozen(T.kuddeGroepen(S.dorp, dagNu(S)));
      if (weg.length) T.slacht(S.dorp, weg, dagNu(S));
      T.ui.sluitSlachten(S);
    }
  });

  // ── De velden (js/akkers.js, "Velden"; spel.md, "Weides met koeien en schapen") ──
  // Zoals het veldenscherm van Lords of the Realm 2 (Marcel, 25 sep): alle velden onder elkaar, met
  // van wie ze zijn, hoe groot en hoe vruchtbaar, wat ze nu zijn, en drie knoppen voor wat ze
  // volgend jaar worden. Elke knop stelt dezelfde vraag als de klik (T.kanBestemming), dus wat niet
  // kan, staat uit en zegt waarom. Het plan gaat pas in op 1 lentemaand (T.wisselVelden). Zolang het
  // venster open is, staat de tijd stil (T.houdTijdStil) en ligt de rest van de invoer stil
  // (S.modus 'velden', js/main.js), net als bij de spelregels. De regel bij de muis op een veld
  // (T.veldTekst) en de stukjes tekst die beide delen, staan in js/verkennen.js.
  const BESTEMMING_NAAM = T.BESTEMMING_NAAM; // arable, meadow, fallow (js/akkers.js)
  const GRAAN_TAAL = {
    geploegd: T.t('just ploughed and sown'), kiemend: T.t('the grain is sprouting'), groen: T.t('the grain is green'),
    rijp: T.t('the grain is ripe'), gemaaid: T.t('reaped'),
  };

  // Over hoeveel dagen de volgende wissel valt (de dag van "geploegd" in T.AKKER_STADIA), of null.
  function dagenTotWissel(S) {
    const g = T.AKKER_STADIA && T.AKKER_STADIA.find((s) => s.stadium === 'geploegd');
    if (!g || !S.kalender) return null;
    const nu = Math.floor(S.kalender.dag);
    for (let d = nu + 1; d <= nu + T.DAGEN_PER_JAAR; d++) {
      const x = T.datumVanDag(d);
      if (x.maand === g.maand && x.dagVanMaand === g.dag) return d - nu;
    }
    return null;
  }

  // Wat een veld nu is, met wat erbij hoort: het graan op een akker, de kudde op een weide.
  function veldNu(S, veld) {
    const bestemming = T.bestemmingVan(veld);
    const dieren = T.dierenOp(S.dorp, veld);
    let over = '';
    let zorg = false;
    // Samen met een veld ernaast één weide (js/vee.js, T.weideGroepen): dan gaan de kudde en de
    // plaats over allebei.
    const samen = bestemming === 'weide' ? T.samenMetTekst(S.dorp, veld) : '';
    if (dieren.length) {
      const st = T.weideStand(S.dorp, veld);
      const maten = { nodig: st.nodig, tegels: st.tegels };
      const kleinste = Math.min(...Object.values(T.VEE_INSTELLINGEN.plaats));
      zorg = st.vrij < 0;
      over = `${T.kuddeTekst(dieren)} · ` + (samen ? `${samen} · ` : '') + (st.vrij < 0
        ? T.t('too full: they need {nodig} tiles and there are {tegels}, so the cows give {pct}% milk and no young are born', { ...maten, pct: Math.round(st.vol * 100) })
        : st.vrij < kleinste ? T.t('full ({nodig} of the {tegels} tiles): no room for young', maten) : T.t('{nodig} of the {tegels} tiles: room for young', maten));
    } else if (bestemming === 'weide') {
      over = T.t('no livestock yet') + (samen ? ` · ${samen}` : '');
    } else if (bestemming === 'braak') {
      over = T.t('the land is resting');
    } else {
      const datum = T.datumVanDag(S.kalender.dag);
      const stadium = T.akkerStadium(datum.maand, datum.dagVanMaand);
      const zonder = veld.ongezaaid ? veld.ongezaaid.size : 0;
      over = zonder >= veld.b * veld.h ? T.t('not sown this year') : GRAAN_TAAL[stadium] || '';
      if (zonder && zonder < veld.b * veld.h) over += ` · ${T.t('{n|# tile|# tiles} not sown', { n: zonder })}`;
      zorg = zonder > 0;
    }
    return `<span class="veld-bestemming ${bestemming}">${T.hoofdletter(BESTEMMING_NAAM[bestemming])}</span> <small${zorg ? ' class="zorg"' : ''}>${over}</small>`;
  }

  function veldRij(S, veld, i) {
    const boer = T.boerVanVeld(S.dorp, veld);
    const bestemming = T.bestemmingVan(veld);
    const plan = T.planVan(veld);
    const pct = Math.round(T.vruchtbaarheidVan(veld) * 100);
    const redenen = [];
    const knoppen = T.BESTEMMINGEN.map((b) => {
      const naam = T.hoofdletter(BESTEMMING_NAAM[b]);
      if (b === plan) return `<button class="veld-keuze gekozen" data-veld="${i}" data-bestemming="${b}" title="${T.t('This is what it becomes next year')}">${naam}</button>`;
      const k = T.kanBestemming(S.dorp, veld, b);
      if (!k.kan && !redenen.includes(k.reden)) redenen.push(k.reden);
      const titel = veilig(k.kan ? T.t('Next year: {wat}', { wat: BESTEMMING_NAAM[b] }) : k.reden);
      return `<button class="veld-keuze" data-veld="${i}" data-bestemming="${b}" title="${titel}"${k.kan ? '' : ' disabled'}>${naam}</button>`;
    }).join('');
    // Mest erop (js/akkers.js, T.zetMest): een knop die aan en uit gaat, naast de drie keuzes. Alleen
    // op wat volgend jaar akker is; wat niet kan, staat uit en zegt waarom.
    let mestKnop = '';
    if (T.kanMest && !T.VELDEN_INSTELLINGEN.mestVanzelf && T.VELDEN_INSTELLINGEN.vruchtbaarheid) {
      const km = T.kanMest(S.dorp, veld);
      const mest = { datum: T.veldWisselTekst(), karren: T.t('{n|# cartload|# cartloads}', { n: Math.round(T.mestVoorVeld(veld) * 10) / 10 }), pct: Math.round(T.VELDEN_INSTELLINGEN.mestErbij * 100) };
      const titel = veld.mest
        ? T.t('Dung is spread on {datum}: {karren}, +{pct}% fertile. Click to take it off.', mest)
        : km.kan ? T.t('Dung is spread on {datum}: {karren}, +{pct}% fertile, every year until you take it off.', mest) : km.reden;
      mestKnop = `<button class="veld-keuze veld-mest${veld.mest ? ' gekozen' : ''}" data-mest="${i}" title="${veilig(titel)}"${veld.mest || km.kan ? '' : ' disabled'}>${T.t('Dung')}</button>`;
    }
    const nieuw = { plan: BESTEMMING_NAAM[plan], datum: T.veldWisselTekst() };
    const wanneer = plan !== bestemming || veld.mest
      ? `<small class="veld-wanneer">${plan !== bestemming
        ? (veld.mest ? T.t('becomes {plan}, with dung, on {datum}', nieuw) : T.t('becomes {plan} on {datum}', nieuw))
        : T.t('gets dung on {datum}', nieuw)}</small>`
      : '';
    // Wie het koos, en waarom (js/akkers.js, T.boerenKiezenVelden): je oogje in het zeil.
    const koos = T.planTekst(S.dorp, veld);
    const wieKoos = koos ? `<small class="veld-koos">${veilig(koos)}.</small>` : '';
    return (
      `<div class="veld-rij${plan !== bestemming || veld.mest ? ' verandert' : ''}">` +
      `<div class="veld-wie" title="${T.t('{b} by {h} tiles', { b: veld.b, h: veld.h })}"><span class="veld-naam">${boer ? veilig(boer.naam) : T.t('No farmer')}</span> ` +
      `<small>${T.t('{n|# tile|# tiles}', { n: veld.b * veld.h })}</small></div>` +
      `<div class="veld-vrucht" title="${T.t('Fertility: a field gives its grain times this number.')}"><span class="veld-balk"><i style="width:${pct}%"></i></span> <small>${pct}%</small></div>` +
      `<div class="veld-nu">${veldNu(S, veld)}</div>` +
      `<div class="veld-plan"><div class="veld-keuzes">${knoppen}${mestKnop}</div>${wanneer}${wieKoos}</div>` +
      (redenen.length ? `<p class="veld-reden">${redenen.map(veilig).join(' ')}</p>` : '') +
      `</div>`
    );
  }

  // Het hooi van de weides van volgend jaar (js/vee.js, "De winter"), en hoeveel koeien dat de
  // winter door helpt: dat, en niet het gras in de zomer, beslist hoeveel vee je houdt. Leeg zonder
  // winterzorg.
  function hooiVooruit(S, weides) {
    const VI = T.VEE_INSTELLINGEN;
    if (!VI.winterzorg || !weides.length) return '';
    const hooi = weides.reduce((n, v) => n + v.b * v.h * T.hooiPerTegel(v), 0);
    const koeien = Math.floor(hooi / (T.winterLengte() * (VI.hooiPerDag.koe || 1)));
    const nu = T.veeVan(S.dorp).filter((e) => e.dier === 'koe').length;
    return ` ${T.t('{n|That meadow gives|Those # meadows give} about {hooi} in {maand}: enough for {koeien|# cow|# cows} through the winter (a calf counts as half), and you now have {nu}.', {
      n: weides.length, hooi: T.hoeveel(Math.round(hooi), 'hooi'), maand: maandToon(VI.hooien), koeien, nu,
    })}`;
  }

  // De mest van volgend jaar (js/akkers.js, T.mestPlan): wat je hebt, en wat de akkers met mest
  // vragen. Leeg als er geen mest is en er ook niemand om vraagt.
  function mestVooruit(S) {
    if (!T.mestPlan || !T.VELDEN_INSTELLINGEN.vruchtbaarheid) return '';
    const mp = T.mestPlan(S.dorp);
    const heb = Math.floor((S.dorp.voorraad && S.dorp.voorraad.mest) || 0);
    if (!mp.velden.length && !heb) return '';
    const karren = (x) => T.t('{n|# cartload|# cartloads}', { n: x });
    if (T.VELDEN_INSTELLINGEN.mestVanzelf) {
      return ` ${T.t('The dung goes over all the fields by itself: you have {heb}, and a full round needs {nodig}.', { heb: karren(heb), nodig: karren(Math.round(mp.nodig)) })}`;
    }
    const n = mp.velden.length;
    return ` ${n
      ? T.t('Dung: you have {heb}, and {n|the field with dung needs|the # fields with dung need} {nodig}.', { heb: karren(heb), n, nodig: karren(Math.round(mp.nodig)) })
      : T.t('Dung: you have {heb}, and no field has dung on it yet.', { heb: karren(heb) })}`;
  }

  // De hele kudde in één regel, met de knop om te slachten (het venster hierboven).
  function kuddeRegel(S) {
    const kudde = T.veeVan(S.dorp);
    if (!kudde.length || !T.dierenTekst) return '';
    const meent = T.meentVan(S.wereld);
    return `<p class="veld-kudde">${T.t('The herd: {kudde}.', { kudde: T.dierenTekst(kudde, dagNu(S)) })} ` +
      `<button class="veld-keuze" data-actie="slachten" title="${T.t('Who goes to the butcher?')}">${T.t('Slaughter…')}</button></p>` +
      (meent && T.meentTekst ? `<p class="veld-kudde">${veilig(T.meentTekst(S.dorp, meent))}.</p>` : '');
  }

  function veldenInhoud(S) {
    const velden = (S.wereld && S.wereld.akkers) || [];
    const IN = T.VELDEN_INSTELLINGEN;
    const wissel = T.veldWisselTekst();
    const dagen = dagenTotWissel(S);
    const pc = (x) => `${Math.round(x * 100)}%`;
    const land = IN.vruchtbaarheid
      ? `${T.t('An arable field exhausts the land (−{uit} a year), fallow rests it (+{rust}) and a meadow is manured by the livestock (+{mest}).', {
        uit: pc(IN.akkerPutUit), rust: pc(IN.braakRust), mest: pc(IN.weideMest),
      })} ${T.t('Dung from the sheepfold makes a field {pct} more fertile.', { pct: pc(IN.mestErbij) })}`
      : T.t('The land does not wear out: that is switched off in the game rules.');
    // Wat het volgend jaar wordt, bij elkaar: hoeveel akkers er te zaaien zijn, en wat dat kost.
    const tel = (b) => velden.filter((v) => T.planVan(v) === b);
    const akkers = tel('akker');
    const tegels = akkers.reduce((n, v) => n + v.b * v.h, 0);
    const zaai = Math.round(tegels * (T.ZAAIGRAAN_PER_TEGEL || 0));
    const weides = tel('weide').length;
    const braak = tel('braak').length;
    const volgend = T.t('Next year: {akkers}, {weides} and {braak}.', {
      akkers: T.t('{n|# arable field|# arable fields} ({tegels} tiles: sowing costs {zaai}, and you now have {heb})', {
        n: akkers.length, tegels, zaai: T.hoeveel(zaai, 'graan'), heb: T.hoeveel(hebNu(S, 'graan'), 'graan'),
      }),
      weides: weides ? T.t('{n|# meadow|# meadows}', { n: weides }) : T.t('no meadow'),
      braak: braak ? T.t('{n|# field fallow|# fields fallow}', { n: braak }) : T.t('no fallow'),
    }) + hooiVooruit(S, tel('weide')) + mestVooruit(S);
    const wanneer = dagen == null ? T.t('the changeover on {wissel}', { wissel }) : T.t('the changeover on {wissel} (in {n|# day|# days})', { wissel, n: dagen });
    return (
      `<div class="venster-kop"><span class="venster-titel">${T.t('The fields')}</span><span class="venster-wanneer">${wanneer}</span>` +
      `<button class="venster-sluit" data-actie="sluit" title="${T.t('Close (Esc)')}">✕</button></div>` +
      `<p class="venster-staat">${T.t('Every field is arable, meadow or fallow.')} ${T.VELDEN_INSTELLINGEN.boerenKiezen ? `${T.t('After the harvest the farmers choose what their fields become next year, and what you choose here goes first.')} ` : ''}` +
      `${T.t('It takes effect on {wissel}, when the farmers plough: you do not trample standing grain.', { wissel: `<b>${wissel}</b>` })} ${land}</p>` +
      `<div class="veld-rij veld-kop"><span>${T.t('Field')}</span><span title="${T.t('An arable field gives its grain times its fertility.')}">${T.t('Fertile')}</span>` +
      `<span>${T.t('Now')}</span><span>${T.t('Next year')}</span></div>` +
      (velden.map((v, i) => veldRij(S, v, i)).join('') || `<p class="venster-staat">${T.t('There are no fields here.')}</p>`) +
      `<p class="veld-samen">${volgend}</p>` + kuddeRegel(S) +
      `<p class="venster-voet">${T.t('While this is open, time stands still. {esc} or {v} closes.', { esc: ESC, v: kbd('V') })}</p>`
    );
  }

  // Opnieuw tekenen, op de plek waar je was.
  function toonVelden(S) {
    const box = $('velden');
    const waar = box.scrollTop;
    box.innerHTML = veldenInhoud(S);
    box.scrollTop = waar;
  }

  T.ui.openVelden = function (S) {
    if (!S.wereld || !S.wereld.akkers || !T.kanBestemming) return;
    if (T.ui.openVenster(S, 'velden')) toonVelden(S);
  };

  T.ui.sluitVelden = function (S) {
    T.ui.sluitVenster(S, 'velden');
  };

  T.ui.meldVenster('velden', {
    el: 'velden', toets: 'v', open: (S) => T.ui.openVelden(S), sluit: (S) => T.ui.sluitVelden(S),
  });

  $('velden').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    const S = T.S;
    if (!b || !S) return;
    b.blur();
    if (b.dataset.actie === 'sluit') {
      T.ui.sluitVelden(S);
      return;
    }
    if (b.dataset.actie === 'slachten') {
      T.ui.sluitVelden(S);
      T.ui.openSlachten(S.dorp);
      return;
    }
    if (b.dataset.mest !== undefined) {
      const v = S.wereld.akkers[Number(b.dataset.mest)];
      const r = T.zetMest(S.dorp, v, !v.mest);
      if (!r.kan) T.ui.bericht(r.reden, 'gevaar');
      toonVelden(S);
      return;
    }
    const veld = S.wereld.akkers[Number(b.dataset.veld)];
    if (!veld || !b.dataset.bestemming || T.planVan(veld) === b.dataset.bestemming) return;
    const r = T.zetPlan(S.dorp, veld, b.dataset.bestemming);
    if (!r.kan) T.ui.bericht(r.reden, 'gevaar');
    toonVelden(S);
  });

  // ── De spelregels (js/opties.js; spel.md, "Instelbaar") ──
  // Eén venster in drie delen: de keuzes, de namen, en de werkbank met alle getallen. Zolang het open is, staat de tijd
  // stil. Namen typt de speler zelf, dus alles wat van hem komt, gaat door veilig() (bij de heer, hierboven).
  // Sinds vraag 172 (16 okt) horen de spelregels bij een spel, en liggen ze vast als het begint; het venster opent in een
  // van drie standen: 'nieuw' bij New game (js/menu.js: de regels van het spel dat gaat beginnen, te kiezen), 'lezen' in
  // het spel (het menu, of O), en 'debug' uit het debugvenster (te kiezen midden in een spel, om te proberen). De werkbank
  // staat er alleen bij als je kiest en het debugvenster aan is (tot de Steam-versie). De opties voor het beeld staan hier
  // niet: die zijn van jou, onder Settings (js/instellingen.js).
  const alsGetal = (x) => (Number.isInteger(x) ? String(x) : String(Math.round(x * 1000) / 1000));
  let regelsStand = 'lezen';
  const magKiezen = () => regelsStand !== 'lezen';

  // Eén optie als rij: zijn naam en uitleg, de keuzes, en de uitleg van wat gekozen is. Ook voor Settings
  // (js/instellingen.js), zodat een rij er overal hetzelfde uitziet. `mag`: false toont alleen wat er gekozen is; `kan(keuze)`
  // zegt per keuze of hij er nu kan zijn (een formaat van het venster dat niet op je scherm past).
  T.ui.optieRij = function (o, mag = true, kan = null) {
    const nu = T.optieKeuze(o.id);
    const gekozen = o.keuzes.find((k) => k.id === nu);
    const knoppen = o.keuzes
      .map((k) => `<button class="regel-keuze${k.id === nu ? ' gekozen' : ''}" data-optie="${o.id}" data-keuze="${k.id}" title="${veilig(k.uitleg || '')}"${mag && (!kan || kan(k)) ? '' : ' disabled'}>${k.naam}${k.id === o.standaard ? `<small>${T.t('default')}</small>` : ''}</button>`)
      .join('');
    return (
      `<div class="regel"><div class="regel-naam">${o.naam}<small>${o.uitleg}</small></div>` +
      `<div class="regel-keuzes">${knoppen}</div><p class="regel-uitleg">${gekozen ? gekozen.uitleg : ''}</p></div>`
    );
  };

  function regelsInhoud() {
    const mag = magKiezen();
    const keuzes = T.OPTIES.filter((o) => !o.instelling).map((o) => T.ui.optieRij(o, mag)).join('');
    const namen = T.NAAM_OPTIES.map((id) => {
      const wie = id === 'heer' ? T.t('the lord, who has no name by default') : '';
      const leeg = id === 'heer' ? T.t('the lord') : T.standaardNaam(id);
      return (
        `<label class="naam-rij"><input type="text" maxlength="30" data-naam="${id}" value="${veilig(T.OPTIES_NU.namen[id] || '')}" placeholder="${veilig(leeg)}"${mag ? '' : ' disabled'}>` +
        `<span>${veilig(wie)}</span></label>`
      );
    }).join('');
    const werkbank = !(mag && T.DEBUG_INSTELLINGEN.aan) ? '' : T.WERKBANK.map((deel, i) => {
      const rijen = T.werkbankGetallen(deel).map((g) => {
        const b = T.werkbankBereik(g.standaard);
        const door = g.doorOptie ? `<small>${T.t('via {optie}', { optie: veilig(g.doorOptie) })}</small>` : '';
        return (
          `<div class="werk-rij${g.eigen ? ' eigen' : ''}" data-rij="${g.pad}"><span class="werk-naam">${veilig(g.label)}${door}</span>` +
          `<input type="range" min="${b.min}" max="${Math.max(b.max, g.waarde)}" step="${b.stap}" value="${g.waarde}" data-pad="${g.pad}">` +
          `<input type="number" step="${b.stap}" value="${g.waarde}" data-pad="${g.pad}">` +
          `<button class="werk-terug" data-terug="${g.pad}" title="${T.t('Back to {n}', { n: alsGetal(g.standaard) })}"${g.eigen ? '' : ' disabled'}>↺</button></div>`
        );
      }).join('');
      return `<details class="werk-deel" data-deel="${i}"><summary>${deel.naam}</summary>${rijen}</details>`;
    }).join('');
    const stand = {
      nieuw: [T.t('for this game'), T.t('Choose how this game plays. Once it begins, its rules stay the same until the end. The default is the game as it is meant to be played.')],
      lezen: [T.t('fixed since the start'), T.t('The rules this game began with. They stay the same until the end; you choose them for a new game.')],
      debug: [T.t('for testing'), T.t('What you change applies at once, in this game. Until the Steam version.')],
    }[regelsStand];
    return (
      `<div class="venster-kop"><span class="venster-titel">${T.t('Game rules')}</span><span class="venster-wanneer">${stand[0]}</span>` +
      `<button class="venster-sluit" data-actie="sluit" title="${T.t('Close (Esc)')}">✕</button></div>` +
      `<p class="venster-staat">${stand[1]}</p>` +
      `<div class="kop">${T.t('The rules')}</div>${keuzes}` +
      `<div class="kop">${T.t('Names')}</div><div class="namen">${namen}</div>` +
      (werkbank
        ? `<div class="kop">${T.t('Workbench: all the numbers')}</div>` +
          `<p class="venster-staat">${T.t('Every number from the rules. What you set here goes before what a rule above sets; ↺ puts it back.')}</p>${werkbank}`
        : '') +
      `<div class="regels-voet">${mag ? `<button data-actie="terug">${T.t('Everything back to the default')}</button>` : ''}` +
      `<span>${T.t('While this is open, time stands still. {esc} closes.', { esc: ESC })}</span></div>`
    );
  }

  // Opnieuw tekenen, maar met de open delen van de werkbank en de plek waar je was.
  function toonSpelregels() {
    const box = $('spelregels');
    const open = [...box.querySelectorAll('details[open]')].map((d) => d.dataset.deel); // geen tekst
    const waar = box.scrollTop;
    box.innerHTML = regelsInhoud();
    for (const d of box.querySelectorAll('details')) if (open.includes(d.dataset.deel)) d.open = true;
    box.scrollTop = waar;
  }

  // `stand`: 'lezen' (het menu, O), 'nieuw' (New game) of 'debug' (het debugvenster); hierboven.
  T.ui.openSpelregels = function (S, stand = 'lezen') {
    regelsStand = stand;
    if (T.ui.openVenster(S, 'spelregels')) toonSpelregels();
  };

  T.ui.sluitSpelregels = function (S) {
    T.ui.sluitVenster(S, 'spelregels');
    // Wat een regel verandert, kan de balk raken (de snelheid van een dag, wat de heer vraagt).
    T.ui.toonVoorraad(S.dorp);
    T.ui.toonKalender(S);
    T.ui.werkMenuBij(S); // bij New game zegt het menu nu Standard of Custom (js/menu.js)
  };

  // In de spelregels typ je namen, dus daar sluit alleen Esc (typt). Ze staan in het menu (Esc; vraag 146, d), en de
  // toets O werkt nog.
  T.ui.meldVenster('spelregels', {
    el: 'spelregels', toets: 'o', typt: true,
    open: (S) => T.ui.openSpelregels(S), sluit: (S) => T.ui.sluitSpelregels(S),
  });

  // Eén getal van de werkbank bijwerken zonder het hele venster opnieuw te tekenen: anders valt
  // de schuif uit je hand terwijl je sleept.
  function werkRijBij(pad) {
    const rij = $('spelregels').querySelector(`[data-rij="${pad}"]`);
    if (!rij) return;
    const g = T.WERKBANK.flatMap((deel) => T.werkbankGetallen(deel)).find((x) => x.pad === pad);
    if (!g) return;
    for (const i of rij.querySelectorAll('input')) if (document.activeElement !== i) i.value = g.waarde;
    rij.classList.toggle('eigen', g.eigen);
    const terug = rij.querySelector('.werk-terug');
    terug.disabled = !g.eigen;
    terug.title = T.t('Back to {n}', { n: alsGetal(g.standaard) });
  }

  $('spelregels').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    const S = T.S;
    if (!b || !S) return;
    b.blur();
    if (b.dataset.actie === 'sluit') {
      T.ui.sluitSpelregels(S);
    } else if (!magKiezen()) {
      return;
    } else if (b.dataset.actie === 'terug') {
      T.spelregelsTerug(S);
      toonSpelregels();
    } else if (b.dataset.optie) {
      T.zetOptie(b.dataset.optie, b.dataset.keuze, S);
      toonSpelregels();
    } else if (b.dataset.terug) {
      T.zetGetal(b.dataset.terug, null, S);
      werkRijBij(b.dataset.terug);
    }
  });

  $('spelregels').addEventListener('input', (ev) => {
    const el = ev.target;
    const S = T.S;
    if (!S || !magKiezen()) return;
    if (el.dataset.naam) {
      T.zetNaam(el.dataset.naam, el.value, S);
    } else if (el.dataset.pad && el.value !== '' && Number.isFinite(Number(el.value))) {
      T.zetGetal(el.dataset.pad, Number(el.value), S);
      werkRijBij(el.dataset.pad);
    }
  });

  // Eén stand trager of sneller, langs T.SNELHEDEN (js/tijd.js: pauze, 1×, 3×, 10×, 30×).
  // T.zetSnelheid onthoudt de laatste snelheid, zodat P na een stapje terug weer daar hervat.
  function stapSnelheid(delta) {
    const S = T.S;
    if (!S || !S.kalender) return;
    const standen = T.SNELHEDEN || [0, 1, 3];
    let i = standen.indexOf(S.kalender.snelheid);
    if (i < 0) i = standen.findIndex((v) => v > S.kalender.snelheid) - 1;
    if (i < 0) i = standen.length - 1;
    T.zetSnelheid(S, standen[Math.max(0, Math.min(standen.length - 1, i + delta))]);
  }

  $('kalender-knoppen').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b || !T.S) return;
    b.blur();
    T.zetSnelheid(T.S, Number(b.dataset.snelheid));
  });

  // De tijd stil, of weer op de snelheid van ervoor: P, en pause op de klok (js/balk.js).
  T.ui.wisselPauze = function (S) {
    const k = S.kalender;
    T.zetSnelheid(S, k.snelheid > 0 ? 0 : k.laatsteSnelheid || 1);
  };

  // P, - en = botsen nergens mee (tot 16 okt was Z slapen tot de ochtend).
  window.addEventListener('keydown', (ev) => {
    if (!T.NIEUWE_HUD || !T.S || !T.S.kalender) return;
    // Niet terwijl je een naam typt, en niet in de spelregels of de velden (daar staat de tijd
    // bewust stil).
    if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA')) return; // geen tekst
    if (T.S.modus === 'spelregels' || T.S.modus === 'velden' || T.S.modus === 'instellingen') return;
    if (ev.key === 'p' || ev.key === 'P') {
      T.ui.wisselPauze(T.S);
    } else if (ev.key === '-' || ev.key === '_') {
      stapSnelheid(-1);
    } else if (ev.key === '=' || ev.key === '+') {
      stapSnelheid(1);
    }
  });
})(globalThis.Spel = globalThis.Spel || {});
