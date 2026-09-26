// Het scherm van de gespreksschrijver. De regels (welke tekstregel wint, welke antwoorden
// zichtbaar zijn) komen rechtstreeks van ../js/gesprek.js, op T.GESPREKKEN uit
// ../js/gesprekken.js — dit bestand kent daar geen eigen kopie van, ook niet bij het proberen.
// Hier staat alleen hoe dat in een scherm komt.
//
// ── Waarom het eruitziet zoals het eruitziet (Marcel, 22 sep 2026) ──
//
// Twee keer eerder was dit scherm "totaal onlogisch", en de tweede keer begreep ik waarom: het
// liet de gégevens zien, niet het gesprek. Wim heeft vijf versies van zijn openingszin — de
// speler hoort er altijd precies één — en ze stonden alle vijf onder elkaar, alsof hij ze achter
// elkaar zei. Daaronder elf antwoorden, waarvan er in geen enkele toestand meer dan vijf tegelijk
// te zien zijn. Plus een knopenlijst met technische namen en een kolom "NU VERBORGEN": drie
// weergaven van hetzelfde, en geen ervan was het gesprek.
//
// Eén keuze draagt nu alles: **je kijkt naar één situatie tegelijk.** Bovenin staan de situaties,
// je klikt er een, en het gesprek wordt getekend zoals het dán loopt — één zin per knoop, alleen
// de antwoorden die je dan echt kunt geven, ingesprongen zoals een gesprek loopt. Wat in deze
// situatie niet klinkt, zakt naar onderen met de situatie erachter waar het wél klinkt.
//
// Drie dingen volgen daaruit:
//
//   * Een situatie schrijf je in dezelfde woorden als een voorwaarde ("meesterDood is gezet,
//     sleutel in je tas"). Zo is er één woordenlijst voor het hele scherm, en kan de
//     voorwaarde-editor hem ook bewerken. staatVanSituatie() maakt er een spelstaat van.
//   * De fasen van een quest zíjn situaties, en staan er vanzelf bij als iemand een quest geeft.
//     Daar raken gesprek en quest elkaar: een quest hangt aan een gesprek, dus horen ze op één
//     bladzijde (Marcel, 22 sep).
//   * Een antwoord springt in als het gesprek doorloopt (één vraag komt hier uit), en krijgt een
//     eigen blok als er meer vragen op uitkomen (Wims "Nog iets anders", waar er vijf op uitkomen).
//     Zo wordt het nooit acht niveaus diep.
(function () {
  'use strict';
  const T = globalThis.Spel;
  const $ = (id) => document.getElementById(id);

  // ---------- kleine hulpjes ----------
  function el(tag, klasse, tekst) {
    const e = document.createElement(tag);
    if (klasse) e.className = klasse;
    if (tekst != null) e.textContent = tekst;
    return e;
  }
  function knop(klasse, tekst, doe) {
    const b = el('button', klasse, tekst);
    b.type = 'button';
    b.addEventListener('click', doe);
    return b;
  }
  function vrijeId(basis, isVrij) {
    let n = basis || 'nieuw';
    let i = 2;
    while (!isVrij(n)) n = basis + i++;
    return n;
  }
  function commaLijst(tekst) {
    return tekst.split(',').map((s) => s.trim()).filter(Boolean);
  }
  function ietsOfNiets(lijst) {
    // 'zetVlag'/'wisVlag' zijn één naam, of een lijstje — zie het kop-commentaar van gesprekken.js
    if (lijst.length === 0) return undefined;
    if (lijst.length === 1) return lijst[0];
    return lijst.slice();
  }
  function alsLijst(v) { return v == null ? [] : Array.isArray(v) ? v : [v]; }
  function maal(n, enkel, meer) { return n === 1 ? '1 ' + enkel : n + ' ' + (meer || enkel + 's'); }

  // ---------- toestand van het gereedschap zelf ----------
  let huidigePersoonId = null;
  let huidigeSituatieNr = 0;   // welke situatie je doorheen kijkt (index in situatiesVan)
  let vuil = false;            // niet-opgeslagen wijzigingen
  let bevestigdVerliesOpmerkingen = false;

  // ---------- voorwaarde-typen: afgeleid uit het kop-commentaar en uit gesprek.js zelf ----------
  // Zo staat de lijst maar op één plek (in de spelbestanden) en groeit dit gereedschap vanzelf
  // mee als er ooit een achtste voorwaarde bijkomt.
  let VOORWAARDEN = [];
  function leidVoorwaardenAf(bronGesprekken, bronGesprek) {
    const orde = [];
    const soort = {};
    const uitleg = {};
    const reComment = /^\/\/\s+(\w+): (-?\d+|'[^']*')\s+—\s*(.*)$/gm;
    let m;
    while ((m = reComment.exec(bronGesprekken))) {
      orde.push(m[1]);
      soort[m[1]] = m[2].startsWith("'") ? 'tekst' : 'getal';
      uitleg[m[1]] = m[3];
    }
    const reCode = /\bals\.(\w+)\b/g;
    while ((m = reCode.exec(bronGesprek))) {
      if (!orde.includes(m[1])) { orde.push(m[1]); soort[m[1]] = 'tekst'; uitleg[m[1]] = ''; }
    }
    VOORWAARDEN = orde.map((naam) => ({ naam, soort: soort[naam], uitleg: uitleg[naam] }));
  }
  function voorwaardeType(naam) {
    return VOORWAARDEN.find((t) => t.naam === naam) || { naam, soort: 'tekst', uitleg: '' };
  }

  // ---------- kop-commentaar en losse opmerkingen bewaren ----------
  // Wat er vóór en ná T.GESPREKKEN in het bestand staat, letterlijk bewaard. Dat is niet netjes-
  // doen maar noodzaak: tot 25 sep stond er T.TUTORIAL_TEKST achter (het draaiboek van de
  // tutorial van het oude spel), en die kende deze bewerker niet. Voordat dit er was, wiste één
  // keer opslaan dat hele draaiboek. De regel is nu: alleen het blok T.GESPREKKEN wordt opnieuw
  // geschreven, de rest gaat onveranderd mee terug (gereedschap/bronblok.js,
  // test/bronblok.test.cjs) — ook wat er later nog bij komt.
  let RUWE_KOP = '';
  let RUWE_STAART = '';
  let BRON_GELEZEN = false;
  let VERLOREN_OPMERKINGEN = [];

  // Het commentaar in het bestand hoort bij wat eronder staat, en dat komt bij het opslaan terug
  // op zijn plek: bij een persoon, bij een knoop, én bij één regel tekst of één antwoord — en dat
  // laatste is waar het meeste van staat, want het waarom van een zin staat erboven.
  function verwerkRuweBron(tekst) {
    const b = T.bronBlok(tekst, 'T.GESPREKKEN');
    if (!b) {
      VERLOREN_OPMERKINGEN = [];
      BRON_GELEZEN = false;
      return;
    }
    RUWE_KOP = b.kop;
    RUWE_STAART = b.staart;
    BRON_GELEZEN = true;
    let buffer = [];
    let persoon = null;
    let knoop = null;
    let lijst = null; // 'tekst' of 'keuzes': in welke rij we zitten
    let index = 0;
    const leg = (doel) => {
      if (!buffer.length) return;
      if (doel) doel._opmerking = buffer.join('\n');
      else VERLOREN_OPMERKINGEN.push(buffer.join('\n'));
    };
    for (const regel of b.blok.split('\n')) {
      const commentaar = regel.match(/^\s*\/\/ ?(.*)$/);
      if (commentaar) { buffer.push(commentaar[1]); continue; }
      if (!regel.trim()) continue; // een witregel tussen een kopje en wat eronder staat breekt niets
      const persoonKop = regel.match(/^ {4}(\w+): \{$/);
      const knoopKop = regel.match(/^ {8}(\w+): \{$/);
      const rijKop = regel.match(/^ {10}(tekst|keuzes): \[$/);
      const ingang = /^ {12}\{/.test(regel);
      if (persoonKop) {
        persoon = T.GESPREKKEN[persoonKop[1]] || null;
        knoop = null;
        lijst = null;
        leg(persoon);
      } else if (knoopKop && persoon) {
        knoop = (persoon.knopen && persoon.knopen[knoopKop[1]]) || null;
        lijst = null;
        leg(knoop);
      } else if (rijKop && knoop) {
        lijst = rijKop[1];
        index = 0;
        leg(null);
      } else if (ingang && knoop && lijst) {
        leg((knoop[lijst] || [])[index]);
        index++;
      } else {
        if (/^ {10}\]/.test(regel)) lijst = null;
        leg(null);
      }
      buffer = [];
    }
  }
  function renderOpmerkingMelding() {
    const doos = $('gt-opmerking-melding');
    if (!doos) return;
    if (!VERLOREN_OPMERKINGEN.length) { doos.classList.add('verborgen'); return; }
    doos.classList.remove('verborgen');
    doos.textContent = `Let op: js/gesprekken.js bevat ${VERLOREN_OPMERKINGEN.length} opmerking(en) die dit gereedschap nergens aan kan ophangen. Bij het opslaan gaan die verloren. Voorbeeld: "${VERLOREN_OPMERKINGEN[0].slice(0, 90)}${VERLOREN_OPMERKINGEN[0].length > 90 ? '…' : ''}"`;
  }

  // ---------- meten of tekst past in het gesprekvenster van het spel ----------
  // Meet met de echte css uit ../stijl.css (#dialoog, #dialoog-tekst, #dialoog-keuzes button),
  // via de verborgen rek onderaan de pagina — geen gegokte pixelbreedte.
  const MAX_REGELS_TEKST = 6; // verhalende tekst, in #dialoog-tekst
  const MAX_REGELS_KEUZE = 2; // een antwoord is kort, en staat als knop in #dialoog-keuzes
  function regelHoogte(elMeet) {
    const oud = elMeet.textContent;
    elMeet.textContent = 'x';
    const h = elMeet.getBoundingClientRect().height;
    elMeet.textContent = oud;
    return h || 18;
  }
  function teLang(tekst, metPortret, isKeuze) {
    if (!tekst || !$('dialoog')) return 0;
    $('dialoog').classList.toggle('met-portret', !!metPortret);
    const elMeet = isKeuze ? $('dialoog-keuzes').querySelector('button') : $('dialoog-tekst');
    const eenRegel = regelHoogte(elMeet);
    elMeet.textContent = tekst;
    const hoogte = elMeet.getBoundingClientRect().height;
    elMeet.textContent = '';
    const regels = Math.round(hoogte / eenRegel);
    const max = isKeuze ? MAX_REGELS_KEUZE : MAX_REGELS_TEKST;
    return regels > max ? regels : 0;
  }

  // ---------- situaties: waar je doorheen kijkt ----------
  //
  // Een situatie is een toestand van de wereld, opgeschreven in dezelfde woorden als een
  // voorwaarde. Drie soorten, en ze staan in deze volgorde in de balk:
  //   1. "Zoals het begint" — niets gezet, niets in je tas. Die is er altijd.
  //   2. de fasen van de quest die deze persoon geeft — die komen uit js/quests.js en zijn
  //      daarom niet hier te bewerken; verander je de quest, dan verandert de balk mee.
  //   3. wat je zelf hebt bedacht, in persoon.situaties.

  function questVanPersoon(persoonId) {
    if (!T.QUESTS) return null;
    const paar = Object.entries(T.QUESTS).find(([, q]) => q.gever === persoonId);
    return paar ? { id: paar[0], quest: paar[1] } : null;
  }

  function situatiesVan(persoonId) {
    const persoon = T.GESPREKKEN[persoonId];
    if (!persoon) return [];
    const uit = [{ naam: 'Zoals het begint', als: null, vast: true, uitleg: 'Niets gebeurd, niets in je tas, geen quest begonnen.' }];
    const q = questVanPersoon(persoonId);
    if (q) {
      for (const [fid, fase] of Object.entries(q.quest.fasen || {})) {
        uit.push({
          naam: fid,
          als: { quest: q.id, fase: fid },
          vast: true,
          quest: q.id,
          uitleg: fase.doel || (fase.eind ? 'De quest is hier af.' : ''),
        });
      }
    }
    (persoon.situaties || []).forEach((s, i) => uit.push({ naam: s.naam, als: s.als, eigen: i }));
    return uit;
  }

  function huidigeSituatie() {
    const lijst = situatiesVan(huidigePersoonId);
    return lijst[Math.min(huidigeSituatieNr, lijst.length - 1)] || lijst[0] || null;
  }

  // Van een situatie een spelstaat maken, zodat ../js/gesprek.js hem kan beoordelen. Wat een
  // voorwaarde ontkent (nietVlag, nietHeeft, nietQuest) hoeft hier niets te doen: de verse staat
  // is al leeg.
  function staatVanSituatie(als, persoonId) {
    const S = {
      schout: {},
      inventaris: new Set(), vlaggen: new Set(),
      quests: {}, questWeg: {}, questBeloond: new Set(), goud: 0,
    };
    if (!als) return S;
    for (const naam of alsLijst(als.vlag)) S.vlaggen.add(naam);
    for (const naam of alsLijst(als.heeft)) S.inventaris.add(naam);
    if (als.goud != null) S.goud = Number(als.goud);
    if (als.quest && T.QUESTS && T.QUESTS[als.quest]) {
      const q = T.QUESTS[als.quest];
      const fase = als.fase ? alsLijst(als.fase)[0] : q.begin;
      if (q.fasen && q.fasen[fase]) S.quests[als.quest] = fase;
      if (als.weg) S.questWeg[als.quest] = als.weg;
    }
    if (als.questAf && T.QUESTS && T.QUESTS[als.questAf]) {
      const q = T.QUESTS[als.questAf];
      const eind = Object.keys(q.fasen || {}).find((f) => q.fasen[f].eind);
      if (eind) S.quests[als.questAf] = eind;
    }
    return S;
  }

  // In welke situaties klinkt deze regel of dit antwoord wél? Dat is wat er achter een weggezakte
  // zin staat — en als het antwoord "nergens" is, is dat een regel die de speler nooit hoort.
  function situatiesWaarin(persoonId, als) {
    return situatiesVan(persoonId)
      .filter((s) => T.voorwaardeGeldt(staatVanSituatie(s.als, persoonId), persoonId, als))
      .map((s) => s.naam);
  }
  // Heeft deze persoon zelf nog geen situatie bedacht? Dan zegt "nergens te horen" niets over de
  // tekst en alles over de situatiebalk, en hoort het geen rode melding te zijn.
  function heeftEigenSituaties(persoonId) {
    const p = T.GESPREKKEN[persoonId];
    return !!(p && p.situaties && p.situaties.length);
  }
  // Waar een weggezakte regel wél klinkt, in gewone taal.
  function waarLabel(persoonId, waar) {
    if (waar.length) return { tekst: 'in ' + waar.join(', '), fout: false };
    if (!heeftEigenSituaties(persoonId)) return { tekst: 'alleen in een situatie die er nog niet is', fout: false };
    return { tekst: 'in geen enkele situatie', fout: true };
  }

  // ---------- het gesprek uitrekenen in één situatie ----------
  const MAX_DIEPTE = 4; // dieper dan dit wordt een eigen blok, anders loopt het scherm naar rechts weg

  // Wat is vanaf de start bereikbaar als je álle voorwaarden negeert? Dat is niet wat de speler
  // ziet maar wat er bestaat, en het verschil met "nu bereikbaar" is precies wat onderaan de
  // bladzijde hoort te staan.
  function ooitBereikbaar(persoon) {
    const gezien = new Set();
    const rij = persoon.knopen[persoon.start] ? [persoon.start] : [];
    if (rij.length) gezien.add(persoon.start);
    while (rij.length) {
      const knoop = persoon.knopen[rij.shift()];
      for (const k of (knoop.keuzes || [])) {
        if (k.naar && persoon.knopen[k.naar] && !gezien.has(k.naar)) { gezien.add(k.naar); rij.push(k.naar); }
      }
    }
    return gezien;
  }

  // Het gesprek zoals het in deze situatie loopt, opgedeeld in blokken. Een knoop springt in
  // (inlineOnder) als er precies één zichtbaar antwoord op uitkomt: dan loopt het gesprek gewoon
  // door. Komen er meer op uit, dan is het een plek waar je steeds terugkomt en krijgt hij een
  // eigen blok, met de vraag erboven waarmee je er de eerste keer kwam.
  function planGesprek(persoon, S) {
    const wie = huidigePersoonId;
    const zichtbaar = new Map();
    const inkomend = new Map();
    const rij = persoon.knopen[persoon.start] ? [persoon.start] : [];
    const gezien = new Set(rij);
    while (rij.length) {
      const id = rij.shift();
      const knoop = persoon.knopen[id];
      const opgelost = {
        regel: T.eersteDiePast(S, wie, knoop.tekst || []),
        keuzes: T.zichtbareKeuzes(S, wie, knoop.keuzes),
      };
      zichtbaar.set(id, opgelost);
      for (const k of opgelost.keuzes) {
        if (!k.naar || !persoon.knopen[k.naar]) continue;
        if (!inkomend.has(k.naar)) inkomend.set(k.naar, []);
        inkomend.get(k.naar).push({ van: id, keuze: k });
        if (!gezien.has(k.naar)) { gezien.add(k.naar); rij.push(k.naar); }
      }
    }

    const eigenBlok = (id) => id === persoon.start || (inkomend.get(id) || []).length !== 1;
    const inlineOnder = new Map();
    const blokken = [];
    const gedaan = new Set();
    const plaats = (id, kop) => {
      if (gedaan.has(id)) return;
      gedaan.add(id);
      blokken.push({ id, kop });
      const later = [];
      const loop = (nid, diepte) => {
        for (const k of (zichtbaar.get(nid) || { keuzes: [] }).keuzes) {
          if (!k.naar || !zichtbaar.has(k.naar)) continue;
          if (gedaan.has(k.naar) || eigenBlok(k.naar) || diepte >= MAX_DIEPTE) { later.push({ id: k.naar, kop: k.zeg }); continue; }
          if (!inlineOnder.has(nid)) inlineOnder.set(nid, new Set());
          inlineOnder.get(nid).add(k.naar);
          gedaan.add(k.naar);
          loop(k.naar, diepte + 1);
        }
      };
      loop(id, 0);
      for (const l of later) plaats(l.id, l.kop);
    };
    if (zichtbaar.has(persoon.start)) plaats(persoon.start, null);

    const ooit = ooitBereikbaar(persoon);
    const alleen = [...ooit].filter((id) => !zichtbaar.has(id));           // bestaat, maar niet nu
    const nergens = Object.keys(persoon.knopen).filter((id) => !ooit.has(id)); // bestaat, nergens
    return { zichtbaar, inkomend, inlineOnder, blokken, alleen, nergens };
  }

  // ---------- gewone taal voor voorwaarden en gevolgen ----------
  const enNog = (v) => alsLijst(v).join(' en ');
  const ALS_TAAL = {
    vlag: (v) => `als ${enNog(v)}`,
    nietVlag: (v) => `zolang niet ${enNog(v)}`,
    heeft: (v) => `als je ${enNog(v)} hebt`,
    nietHeeft: (v) => `als je geen ${enNog(v)} hebt`,
    quest: (v) => `als ${questNaam(v)} loopt`,
    nietQuest: (v) => `zolang ${questNaam(v)} niet begonnen is`,
    questAf: (v) => `als ${questNaam(v)} af is`,
    fase: (v) => `in fase ${alsLijst(v).join(' of ')}`,
    weg: (v) => `via ${v}`,
    goud: (v) => `als je ${v} goud hebt`,
  };
  function questNaam(id) {
    return (T.QUESTS && T.QUESTS[id] && T.QUESTS[id].naam) || id;
  }
  function alsInTaal(als) {
    if (!als) return '';
    return Object.entries(als).map(([naam, v]) => (ALS_TAAL[naam] ? ALS_TAAL[naam](v) : `${naam}: ${v}`)).join(' en ');
  }
  const DOE_TAAL = {
    zetVlag: (v) => `zet ${alsLijst(v).join(' en ')}`,
    wisVlag: (v) => `wist ${alsLijst(v).join(' en ')}`,
    geef: (v) => `geeft je ${alsLijst(v).join(' en ')}`,
    neem: (v) => `neemt ${alsLijst(v).join(' en ')}`,
    goud: (v) => `${Number(v) < 0 ? '' : '+'}${v} goud`,
    quest: (v) => `${questNaam(v)}`,
    fase: (v) => `naar fase ${v}`,
    weg: (v) => `via ${v}`,
    handel: () => 'opent de handel',
    heer: () => 'opent het betalen aan de heer',
  };
  function doeInTaal(doe) {
    if (!doe) return '';
    // "quest bakker" alleen is: hem beginnen. Dat is het vaakst wat je bedoelt, dus zeg het zo.
    if (doe.quest && !doe.fase && !doe.weg && Object.keys(doe).length === 1) return `start ${questNaam(doe.quest)}`;
    return Object.entries(doe).map(([naam, v]) => (DOE_TAAL[naam] ? DOE_TAAL[naam](v) : `${naam}: ${v}`)).join(', ');
  }

  // ---------- twee bouwstenen die overal terugkomen ----------

  // Een chip die openklapt: dicht laat hij in gewone taal zien wat er staat, open staat het
  // formulier eronder. `maakInhoud` bouwt dat formulier pas als het nodig is.
  function klapChip(tekst, leegTekst, maakInhoud) {
    const doos = el('div', 'gt-chip-doos');
    const knopje = el('button', 'gt-chipje' + (tekst ? '' : ' gt-chipje-leeg'), tekst || leegTekst);
    knopje.type = 'button';
    if (tekst) knopje.title = tekst;
    const inhoud = el('div', 'gt-chip-open verborgen');
    knopje.addEventListener('click', () => {
      inhoud.classList.toggle('verborgen');
      if (!inhoud.firstChild) inhoud.appendChild(maakInhoud());
    });
    doos.appendChild(knopje);
    doos.appendChild(inhoud);
    return doos;
  }

  // Een vouw die zijn inhoud onder de hele regel legt in plaats van ernaast, voor als er meer dan
  // één ding in zit (alle versies van een zin, alle antwoorden die hier nu niet staan).
  function vouw(tekst, maakInhoud) {
    const doos = el('div', 'gt-vouw');
    const knopje = el('button', 'gt-vouw-knop', tekst + ' ▾');
    knopje.type = 'button';
    const inhoud = el('div', 'gt-vouw-inhoud verborgen');
    knopje.addEventListener('click', () => {
      const dicht = inhoud.classList.toggle('verborgen');
      knopje.textContent = tekst + (dicht ? ' ▾' : ' ▴');
      if (!inhoud.firstChild) inhoud.appendChild(maakInhoud());
    });
    doos.appendChild(knopje);
    doos.appendChild(inhoud);
    return doos;
  }

  // Een zin: een tekstvlak dat eruitziet als tekst. Geen rand tot je erin klikt, en hij groeit
  // mee met wat je typt — anders schrijf je in een kokertje van twee regels.
  function zinVeld(waarde, plaatshouder, zet) {
    const t = document.createElement('textarea');
    t.className = 'gt-zin';
    t.rows = 1;
    t.placeholder = plaatshouder;
    t.value = waarde || '';
    const meegroeien = () => { t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; };
    t.addEventListener('input', () => { zet(t.value); meegroeien(); });
    setTimeout(meegroeien, 0);
    return t;
  }

  // ---------- de formulieren achter de chips ----------

  // Bij een quest-achtige voorwaarde of gevolg is een keuzelijst beter dan een tekstvak: dan
  // hoef je "bakker:zoeken" niet uit je hoofd te kennen, en kun je niet naar een fase wijzen die
  // niet bestaat.
  function keuzelijst(opties, waarde, zet, leegTekst) {
    const s = document.createElement('select');
    s.className = 'gt-als-waarde';
    if (leegTekst != null) { const o = document.createElement('option'); o.value = ''; o.textContent = leegTekst; s.appendChild(o); }
    for (const [v, tekst] of opties) {
      const o = document.createElement('option'); o.value = v; o.textContent = tekst; s.appendChild(o);
    }
    s.value = waarde == null ? '' : String(waarde);
    // Staat er iets wat niet meer bestaat, dan mag dat niet stilletjes een andere waarde worden.
    if (s.value !== (waarde == null ? '' : String(waarde))) {
      const o = document.createElement('option'); o.value = String(waarde); o.textContent = waarde + ' (bestaat niet)';
      s.appendChild(o); s.value = String(waarde);
    }
    s.addEventListener('change', () => zet(s.value));
    return s;
  }
  const questOpties = () => Object.entries(T.QUESTS || {}).map(([id, q]) => [id, q.naam || id]);
  function faseOpties(questId) {
    const q = (T.QUESTS || {})[questId];
    return Object.entries((q && q.fasen) || {}).map(([id, f]) => [id, f.doel ? `${id} — ${f.doel}` : id]);
  }
  function wegOpties(questId, faseId) {
    const q = (T.QUESTS || {})[questId];
    const f = q && q.fasen && q.fasen[faseId];
    if (f) return Object.keys(f.wegen || {}).map((id) => [id, id]);
    // Geen fase gekozen: alle wegen van de quest, zodat je toch iets kunt kiezen.
    const alle = new Set();
    Object.values((q && q.fasen) || {}).forEach((fase) => Object.keys(fase.wegen || {}).forEach((w) => alle.add(w)));
    return [...alle].map((id) => [id, id]);
  }

  // Het formulier achter een voorwaarde: rijen van "welke voorwaarde" en "welke waarde".
  function bouwAlsEditor(houder, naVerandering, opties) {
    // `lijsten`: dit is een situatie en geen voorwaarde, dus mogen vlag en heeft er meer dan één
    // zijn — een toestand kan twee vlaggen hebben, een voorwaarde vraagt er één.
    const lijsten = !!(opties && opties.lijsten);
    const wrap = el('div', 'gt-als');
    const rijen = el('div', 'gt-als-rijen');
    const plus = knop('gt-mini', '+ voorwaarde', () => {
      if (!houder.als) houder.als = {};
      const vrij = VOORWAARDEN.find((t) => houder.als[t.naam] === undefined);
      if (!vrij) return;
      houder.als[vrij.naam] = vrij.soort === 'getal' ? 0 : '';
      herbouw(); naVerandering(true);
    });
    function waardeVeld(naam) {
      const type = voorwaardeType(naam);
      const zet = (v) => { houder.als[naam] = v; naVerandering(true); };
      if (naam === 'quest' || naam === 'nietQuest' || naam === 'questAf') return keuzelijst(questOpties(), houder.als[naam], zet, '—');
      if (naam === 'fase') return keuzelijst(faseOpties(houder.als.quest), alsLijst(houder.als[naam])[0], zet, '—');
      if (naam === 'weg') return keuzelijst(wegOpties(houder.als.quest, alsLijst(houder.als.fase)[0]), houder.als[naam], zet, '—');
      const meerdere = lijsten && type.soort !== 'getal';
      const waarde = document.createElement('input');
      waarde.className = 'gt-als-waarde';
      waarde.type = type.soort === 'getal' ? 'number' : 'text';
      waarde.value = meerdere ? alsLijst(houder.als[naam]).join(', ') : houder.als[naam];
      if (meerdere) waarde.placeholder = 'naam, naam';
      waarde.addEventListener('input', () => {
        if (type.soort === 'getal') houder.als[naam] = Number(waarde.value || 0);
        else if (meerdere) houder.als[naam] = ietsOfNiets(commaLijst(waarde.value)) || '';
        else houder.als[naam] = waarde.value;
        naVerandering(false);
      });
      return waarde;
    }
    function bouwRij(naam) {
      const rij = el('div', 'gt-als-rij');
      const select = document.createElement('select');
      VOORWAARDEN.forEach((t) => {
        const o = document.createElement('option'); o.value = t.naam; o.textContent = t.naam; o.title = t.uitleg;
        if (t.naam === naam) o.selected = true;
        if (t.naam !== naam && houder.als[t.naam] !== undefined) o.disabled = true;
        select.appendChild(o);
      });
      const type = voorwaardeType(naam);
      select.addEventListener('change', () => {
        const oud = houder.als[naam];
        delete houder.als[naam];
        const nieuwType = voorwaardeType(select.value);
        houder.als[select.value] = oud !== undefined && nieuwType.soort === type.soort ? oud : (nieuwType.soort === 'getal' ? 0 : '');
        herbouw(); naVerandering(true);
      });
      const verwijder = knop('gt-mini gt-mini-x', '✕', () => {
        delete houder.als[naam];
        if (Object.keys(houder.als).length === 0) delete houder.als;
        herbouw(); naVerandering(true);
      });
      rij.appendChild(select); rij.appendChild(waardeVeld(naam)); rij.appendChild(verwijder);
      return rij;
    }
    function herbouw() {
      rijen.innerHTML = '';
      Object.keys(houder.als || {}).forEach((naam) => rijen.appendChild(bouwRij(naam)));
      plus.disabled = !!houder.als && Object.keys(houder.als).length >= VOORWAARDEN.length;
    }
    herbouw();
    wrap.appendChild(rijen);
    wrap.appendChild(plus);
    return wrap;
  }

  // Het formulier achter een gevolg. Dit deed tot 22 sep alleen vlaggen, terwijl een antwoord in
  // het spel al goud gaf en quests startte (de bakker); die waren dus alleen in de code te
  // bewerken. Nu staat dezelfde lijst hier als in het kop-commentaar van gesprekken.js.
  const GEVOLGEN = [
    { naam: 'zetVlag', soort: 'namen', uitleg: 'zet één of meer vlaggen' },
    { naam: 'wisVlag', soort: 'namen', uitleg: 'wist één of meer vlaggen' },
    { naam: 'geef', soort: 'namen', uitleg: 'stopt iets in je tas' },
    { naam: 'neem', soort: 'namen', uitleg: 'haalt iets uit je tas' },
    { naam: 'goud', soort: 'getal', uitleg: 'goud erbij (of eraf, met een min)' },
    { naam: 'quest', soort: 'quest', uitleg: 'een quest; zonder fase of weg begint hij' },
    { naam: 'fase', soort: 'fase', uitleg: 'zet die quest in deze fase' },
    { naam: 'weg', soort: 'weg', uitleg: 'los die quest zo op' },
    { naam: 'handel', soort: 'aan', uitleg: 'opent het handelsvenster van de marskramer (js/handel.js)' },
    { naam: 'heer', soort: 'aan', uitleg: 'opent het venster waarin je de heer betaalt op Sint-Maarten (js/heer.js)' },
  ];
  // De beginwaarde van een nieuw gevolg: een getal begint op nul, een aan/uit (handel) staat aan.
  const beginWaarde = (g) => (g && g.soort === 'getal' ? 0 : g && g.soort === 'aan' ? true : '');
  function bouwDoeEditor(houder, naVerandering) {
    const wrap = el('div', 'gt-als');
    const rijen = el('div', 'gt-als-rijen');
    const plus = knop('gt-mini', '+ gevolg', () => {
      if (!houder.doe) houder.doe = {};
      const vrij = GEVOLGEN.find((g) => houder.doe[g.naam] === undefined);
      if (!vrij) return;
      houder.doe[vrij.naam] = beginWaarde(vrij);
      herbouw(); naVerandering(true);
    });
    function waardeVeld(g) {
      const zet = (v) => { houder.doe[g.naam] = v; naVerandering(true); };
      if (g.soort === 'quest') return keuzelijst(questOpties(), houder.doe.quest, zet, '—');
      if (g.soort === 'fase') return keuzelijst(faseOpties(houder.doe.quest), houder.doe.fase, zet, '—');
      if (g.soort === 'weg') return keuzelijst(wegOpties(houder.doe.quest, houder.doe.fase), houder.doe.weg, zet, '—');
      if (g.soort === 'aan') return el('span', 'gt-als-waarde', 'aan');
      const inv = document.createElement('input');
      inv.className = 'gt-als-waarde';
      inv.type = g.soort === 'getal' ? 'number' : 'text';
      inv.value = g.soort === 'namen' ? alsLijst(houder.doe[g.naam]).join(', ') : houder.doe[g.naam];
      if (g.soort === 'namen') inv.placeholder = 'naam, naam';
      inv.addEventListener('input', () => {
        houder.doe[g.naam] = g.soort === 'getal' ? Number(inv.value || 0) : ietsOfNiets(commaLijst(inv.value)) || '';
        naVerandering(false);
      });
      return inv;
    }
    function bouwRij(naam) {
      const g = GEVOLGEN.find((x) => x.naam === naam) || { naam, soort: 'namen', uitleg: '' };
      const rij = el('div', 'gt-als-rij');
      const select = document.createElement('select');
      GEVOLGEN.forEach((x) => {
        const o = document.createElement('option'); o.value = x.naam; o.textContent = x.naam; o.title = x.uitleg;
        if (x.naam === naam) o.selected = true;
        if (x.naam !== naam && houder.doe[x.naam] !== undefined) o.disabled = true;
        select.appendChild(o);
      });
      select.addEventListener('change', () => {
        delete houder.doe[naam];
        const nieuw = GEVOLGEN.find((x) => x.naam === select.value);
        houder.doe[select.value] = beginWaarde(nieuw);
        herbouw(); naVerandering(true);
      });
      const verwijder = knop('gt-mini gt-mini-x', '✕', () => {
        delete houder.doe[naam];
        if (Object.keys(houder.doe).length === 0) delete houder.doe;
        herbouw(); naVerandering(true);
      });
      rij.appendChild(select); rij.appendChild(waardeVeld(g)); rij.appendChild(verwijder);
      return rij;
    }
    function herbouw() {
      rijen.innerHTML = '';
      Object.keys(houder.doe || {}).forEach((naam) => rijen.appendChild(bouwRij(naam)));
      plus.disabled = !!houder.doe && Object.keys(houder.doe).length >= GEVOLGEN.length;
    }
    herbouw();
    wrap.appendChild(rijen);
    wrap.appendChild(plus);
    return wrap;
  }

  // ---------- het scherm: wie, situaties, gesprek, quest, controle ----------

  function renderPersonen() {
    const select = $('gt-persoon');
    if (!select) return;
    select.innerHTML = '';
    const mensen = document.createElement('optgroup');
    mensen.label = 'Wie er praat';
    Object.entries(T.GESPREKKEN).forEach(([id, p]) => {
      const o = document.createElement('option'); o.value = id; o.textContent = p.naam + ' (' + id + ')';
      if (id === huidigePersoonId) o.selected = true;
      mensen.appendChild(o);
    });
    select.appendChild(mensen);
  }

  // Wie het is: één regel, geen formulier. Meer valt er over een persoon niet te zeggen.
  function renderPersoonEditor() {
    const wrap = $('gt-persoon-editor');
    if (!wrap) return;
    wrap.innerHTML = '';
    const persoon = T.GESPREKKEN[huidigePersoonId];
    if (!persoon) { wrap.appendChild(el('p', 'gt-leeg', 'Nog geen personen — maak er hierboven één.')); return; }
    const rij = el('div', 'gt-wie');

    const naamInv = document.createElement('input');
    naamInv.className = 'gt-wie-naam';
    naamInv.value = persoon.naam || '';
    naamInv.title = 'Zoals hij boven het gesprek staat';
    naamInv.addEventListener('input', () => { persoon.naam = naamInv.value; naVeldWijziging(); renderPersonen(); });
    rij.appendChild(naamInv);
    rij.appendChild(el('div', 'gt-vul'));

    rij.appendChild(el('span', 'gt-wie-bij', 'portret'));
    const portretInv = document.createElement('input');
    portretInv.className = 'gt-wie-klein';
    portretInv.value = persoon.portret || '';
    portretInv.placeholder = 'nog geen';
    portretInv.addEventListener('input', () => { persoon.portret = portretInv.value.trim() || undefined; naVeldWijziging(); });
    rij.appendChild(portretInv);

    wrap.appendChild(rij);
  }

  // De situatiebalk. De vaste situaties (het begin, en de fasen van zijn quest) kun je niet
  // weghalen — die volgen uit de quest. De situaties die jij bedenkt wel.
  function renderSituaties() {
    const balk = $('gt-situaties');
    if (!balk) return;
    balk.innerHTML = '';
    const persoon = T.GESPREKKEN[huidigePersoonId];
    if (!persoon) return;
    const lijst = situatiesVan(huidigePersoonId);
    if (huidigeSituatieNr >= lijst.length) huidigeSituatieNr = 0;

    balk.appendChild(el('span', 'gt-sit-label', 'Situatie'));
    const q = questVanPersoon(huidigePersoonId);
    lijst.forEach((s, i) => {
      // De questfasen krijgen de naam van de quest ervoor, zodat je ziet waar ze vandaan komen.
      if (q && s.quest && (i === 0 || !lijst[i - 1].quest)) balk.appendChild(el('span', 'gt-sit-groep', questNaam(q.id) + ':'));
      const b = knop('gt-sit' + (i === huidigeSituatieNr ? ' gt-sit-aan' : '') + (s.quest ? ' gt-sit-quest' : ''), s.naam, () => {
        huidigeSituatieNr = i;
        renderSituaties();
        renderKaart();
        renderGesprek();
        renderQuest();
      });
      if (s.uitleg) b.title = s.uitleg;
      if (s.als) b.title = (s.uitleg ? s.uitleg + '\n' : '') + alsInTaal(s.als);
      balk.appendChild(b);
    });

    balk.appendChild(knop('gt-sit gt-sit-plus', '+', nieuweSituatie));
    const nu = lijst[huidigeSituatieNr];
    if (nu && nu.eigen != null) {
      balk.appendChild(knop('gt-mini', 'naam…', () => hernoemSituatie(nu.eigen)));
      balk.appendChild(klapChip(alsInTaal(nu.als) || 'niets gezet', 'niets gezet', () =>
        bouwAlsEditor(persoon.situaties[nu.eigen], () => { naVeldWijziging(); renderSituaties(); renderKaart(); renderGesprek(); }, { lijsten: true })));
      balk.appendChild(knop('gt-mini gt-mini-x', '✕', () => {
        if (!confirm(`Situatie "${nu.naam}" weghalen? Het gesprek zelf verandert er niet van.`)) return;
        persoon.situaties.splice(nu.eigen, 1);
        if (!persoon.situaties.length) delete persoon.situaties;
        huidigeSituatieNr = 0;
        naVeldWijziging(); renderSituaties(); renderGesprek();
      }));
    }
    balk.appendChild(el('div', 'gt-vul'));
    balk.appendChild(el('span', 'gt-sit-uitleg', nu && nu.uitleg ? nu.uitleg : 'Je ziet het gesprek zoals het in deze situatie loopt.'));
  }

  function nieuweSituatie() {
    const persoon = T.GESPREKKEN[huidigePersoonId];
    if (!persoon) return;
    const naam = prompt('Hoe heet deze situatie?\n\nBijvoorbeeld: "Na zijn dood", "Sleutel in de hand".');
    if (!naam || !naam.trim()) return;
    persoon.situaties = persoon.situaties || [];
    persoon.situaties.push({ naam: naam.trim(), als: {} });
    huidigeSituatieNr = situatiesVan(huidigePersoonId).length - 1;
    naVeldWijziging();
    renderSituaties();
    renderGesprek();
  }
  function hernoemSituatie(i) {
    const persoon = T.GESPREKKEN[huidigePersoonId];
    const naam = prompt('Nieuwe naam:', persoon.situaties[i].naam);
    if (!naam || !naam.trim()) return;
    persoon.situaties[i].naam = naam.trim();
    naVeldWijziging();
    renderSituaties();
  }

  // Het gesprek zelf.
  function renderGesprek() {
    const wrap = $('gt-gesprek');
    if (!wrap) return;
    wrap.innerHTML = '';
    const persoon = T.GESPREKKEN[huidigePersoonId];
    if (!persoon) { wrap.appendChild(el('p', 'gt-leeg', 'Nog geen personen — maak er bovenaan één.')); return; }
    if (!persoon.knopen[persoon.start]) {
      wrap.appendChild(el('p', 'gt-fout-tekst', `Dit gesprek begint bij "${persoon.start}", en die bestaat niet.`));
    }
    const sit = huidigeSituatie();
    const S = staatVanSituatie(sit && sit.als, huidigePersoonId);
    const plan = planGesprek(persoon, S);

    for (const blok of plan.blokken) wrap.appendChild(bouwBlok(persoon, S, plan, blok));

    // Wat er wél is maar hier niet klinkt. Dat hoort zichtbaar te zijn — anders vergeet je dat
    // je het geschreven hebt — maar gedempt, want het gaat nu niet over hem.
    if (plan.alleen.length) {
      wrap.appendChild(el('h3', 'gt-kopje', `Wat ${persoon.naam} nog meer zegt, maar niet in deze situatie`));
      const doos = el('div', 'gt-elders');
      for (const id of plan.alleen) doos.appendChild(bouwElders(persoon, id));
      wrap.appendChild(doos);
    }
    if (plan.nergens.length) {
      wrap.appendChild(el('h3', 'gt-kopje gt-fout-tekst', 'Hier komt niemand — vanaf het begin is dit nergens te bereiken'));
      for (const id of plan.nergens) wrap.appendChild(bouwBlok(persoon, S, plan, { id, kop: null, los: true }));
    }
    wrap.appendChild(knop('gt-mini gt-erbij', '+ los stuk gesprek', nieuweKnoop));
  }

  // Eén blok: een stuk gesprek met de vraag erboven waarmee je er komt.
  function bouwBlok(persoon, S, plan, blok) {
    const sec = el('section', 'gt-blok');
    sec.id = 'knoop-' + blok.id;
    if (blok.kop != null) {
      const kop = el('div', 'gt-blokkop');
      kop.appendChild(el('span', 'gt-blokkop-pijl', '›'));
      kop.appendChild(el('span', 'gt-blokkop-zin', blok.kop || '(zonder vraag)'));
      sec.appendChild(kop);
    }
    sec.appendChild(bouwKnoop(persoon, S, plan, blok.id, 0));
    return sec;
  }

  // Eén knoop: wat hij zegt, en wat jij kunt antwoorden. Een antwoord waar het gesprek gewoon
  // doorloopt, krijgt zijn vervolg er ingesprongen onder.
  function bouwKnoop(persoon, S, plan, id, diepte) {
    const knoop = persoon.knopen[id];
    const doos = el('div', 'gt-knoop');
    const opgelost = plan.zichtbaar.get(id) || { regel: (knoop.tekst || [])[0] || null, keuzes: knoop.keuzes || [] };

    doos.appendChild(bouwZegt(persoon, knoop, opgelost.regel, id, diepte));

    const verborgen = (knoop.keuzes || []).filter((k) => !opgelost.keuzes.includes(k));
    for (const keuze of opgelost.keuzes) {
      doos.appendChild(bouwAntwoord(persoon, knoop, keuze, plan));
      const inline = plan.inlineOnder.get(id);
      if (keuze.naar && inline && inline.has(keuze.naar)) {
        const tak = el('div', 'gt-tak');
        tak.appendChild(bouwKnoop(persoon, S, plan, keuze.naar, diepte + 1));
        doos.appendChild(tak);
      }
    }
    if (verborgen.length) {
      doos.appendChild(vouw(maal(verborgen.length, 'antwoord', 'antwoorden') + ' die hier nu niet staan', () => {
        const d = el('div', null);
        for (const keuze of verborgen) {
          const rij = bouwAntwoord(persoon, knoop, keuze, plan);
          rij.classList.add('gt-elders-regel');
          const lab = waarLabel(huidigePersoonId, situatiesWaarin(huidigePersoonId, keuze.als));
          rij.appendChild(el('span', 'gt-waar' + (lab.fout ? ' gt-fout-tekst' : ''), lab.tekst));
          d.appendChild(rij);
        }
        return d;
      }));
    }
    doos.appendChild(knop('gt-mini gt-erbij', '+ antwoord', () => {
      knoop.keuzes = knoop.keuzes || [];
      knoop.keuzes.push({ zeg: '', sluit: true, als: huidigeSituatie() && huidigeSituatie().als ? Object.assign({}, huidigeSituatie().als) : undefined });
      naDataStructuurWijziging();
    }));
    return doos;
  }

  // Wat hij hier zegt. In deze situatie wint er één regel; de andere versies staan eronder,
  // opgevouwen, met de situatie erachter waarin ze wél klinken.
  function bouwZegt(persoon, knoop, actief, id, diepte) {
    const doos = el('div', 'gt-zegt');
    const rij = el('div', 'gt-zinrij gt-hij');
    rij.appendChild(el('span', 'gt-wie-merk', persoon.naam));
    if (actief) {
      rij.appendChild(zinVeld(actief.zeg, 'wat hij zegt', (v) => { actief.zeg = v; naVeldWijziging(); }));
    } else {
      rij.appendChild(el('span', 'gt-geenzin gt-fout-tekst', 'zegt hier niets — geen enkele regel past in deze situatie'));
    }
    const achter = el('div', 'gt-achter');
    if (actief) {
      achter.appendChild(klapChip(alsInTaal(actief.als), 'altijd', () =>
        bouwAlsEditor(actief, (structureel) => (structureel ? naDataStructuurWijziging() : naVeldWijziging()))));
      achter.appendChild(klapChip(knoop._opmerking ? 'notitie' : '', '+ notitie', () => notitieVeld(knoop)));
    }
    if (diepte === 0) achter.appendChild(knoopKnoppen(persoon, id));
    rij.appendChild(achter);
    doos.appendChild(rij);

    const rest = (knoop.tekst || []).filter((r) => r !== actief);
    if (rest.length) {
      doos.appendChild(vouw(maal(rest.length, 'andere versie', 'andere versies') + ' van deze zin', () => {
        const d = el('div', null);
        (knoop.tekst || []).forEach((regel, i) => {
          if (regel === actief) return;
          const r = el('div', 'gt-zinrij gt-hij gt-elders-regel');
          r.appendChild(zinVeld(regel.zeg, 'wat hij zegt', (v) => { regel.zeg = v; naVeldWijziging(); }));
          const a = el('div', 'gt-achter');
          a.appendChild(klapChip(alsInTaal(regel.als), 'altijd', () =>
            bouwAlsEditor(regel, (structureel) => (structureel ? naDataStructuurWijziging() : naVeldWijziging()))));
          a.appendChild(bouwVerplaatsKnoppen(knoop.tekst, i));
          r.appendChild(a);
          const lab = waarLabel(huidigePersoonId, situatiesWaarin(huidigePersoonId, regel.als));
          r.appendChild(el('span', 'gt-waar' + (lab.fout ? ' gt-fout-tekst' : ''), lab.tekst));
          d.appendChild(r);
        });
        return d;
      }));
    }
    doos.appendChild(knop('gt-mini gt-erbij gt-erbij-klein', '+ versie van deze zin', () => {
      knoop.tekst = knoop.tekst || [];
      // Een nieuwe versie hoort bóven het vangnet: de eerste regel die past wint, dus een regel
      // zonder voorwaarde onderaan houdt alles erna tegen.
      const vangnet = knoop.tekst.findIndex((r) => !r.als);
      const nieuw = { als: huidigeSituatie() && huidigeSituatie().als ? Object.assign({}, huidigeSituatie().als) : {}, zeg: '' };
      if (vangnet === -1) knoop.tekst.push(nieuw); else knoop.tekst.splice(vangnet, 0, nieuw);
      naDataStructuurWijziging();
    }));
    return doos;
  }

  // Eén antwoord van jou: wat je zegt, waar het heen gaat, en wat het doet.
  function bouwAntwoord(persoon, knoop, keuze, plan) {
    const rij = el('div', 'gt-zinrij gt-jij');
    rij.appendChild(el('span', 'gt-wie-merk', 'jij'));
    rij.appendChild(zinVeld(keuze.zeg, 'wat jij zegt', (v) => { keuze.zeg = v; naVeldWijziging(); }));

    const achter = el('div', 'gt-achter');
    const naar = el('span', 'gt-naar-doel');
    if (keuze.sluit || !keuze.naar) {
      naar.appendChild(el('span', 'gt-sluit', 'gesprek stopt'));
    } else {
      const inline = plan && plan.inlineOnder.get(idVanKnoop(persoon, knoop));
      if (!(inline && inline.has(keuze.naar))) {
        const link = knop('gt-sprong', '↪ ' + eersteZin(persoon, keuze.naar), () => gaNaarKnoop(keuze.naar));
        link.title = 'Naar dit stuk gesprek';
        naar.appendChild(link);
      }
    }
    const kies = document.createElement('select');
    kies.className = 'gt-naar-kies';
    kies.title = 'Waar dit antwoord heen gaat';
    const sluitOptie = document.createElement('option');
    sluitOptie.value = '__sluit__';
    sluitOptie.textContent = 'stopt';
    kies.appendChild(sluitOptie);
    Object.keys(persoon.knopen).forEach((kid) => {
      const o = document.createElement('option'); o.value = kid; o.textContent = '→ ' + eersteZin(persoon, kid); kies.appendChild(o);
    });
    kies.value = keuze.sluit || !keuze.naar ? '__sluit__' : keuze.naar;
    kies.addEventListener('change', () => {
      if (kies.value === '__sluit__') { keuze.sluit = true; delete keuze.naar; }
      else { keuze.naar = kies.value; delete keuze.sluit; }
      naDataStructuurWijziging();
    });
    naar.appendChild(kies);
    achter.appendChild(naar);
    achter.appendChild(klapChip(alsInTaal(keuze.als), 'altijd', () =>
      bouwAlsEditor(keuze, (structureel) => (structureel ? naDataStructuurWijziging() : naVeldWijziging()))));
    achter.appendChild(klapChip(doeInTaal(keuze.doe), '+ gevolg', () =>
      bouwDoeEditor(keuze, (structureel) => (structureel ? naDataStructuurWijziging() : naVeldWijziging()))));
    achter.appendChild(klapChip(keuze._opmerking ? 'notitie' : '', '+ notitie', () => notitieVeld(keuze)));
    achter.appendChild(bouwVerplaatsKnoppen(knoop.keuzes, knoop.keuzes.indexOf(keuze)));
    rij.appendChild(achter);
    return rij;
  }

  function idVanKnoop(persoon, knoop) {
    return Object.keys(persoon.knopen).find((id) => persoon.knopen[id] === knoop) || null;
  }
  // Waar een antwoord heen gaat, met zijn eerste zin in plaats van zijn technische naam: het
  // enige wat je van een knoop hoeft te weten is wat daar gezegd wordt.
  function eersteZin(persoon, id) {
    const knoop = persoon.knopen[id];
    if (!knoop) return id + ' (bestaat niet)';
    const regel = (knoop.tekst || []).find((r) => r.zeg);
    const zin = regel ? regel.zeg : '(nog niets gezegd)';
    return zin.length > 52 ? zin.slice(0, 50) + '…' : zin;
  }

  function notitieVeld(houder) {
    const t = document.createElement('textarea');
    t.rows = 2;
    t.placeholder = 'Waarom dit is zoals het is. Komt als commentaar erboven in het bestand.';
    t.value = houder._opmerking || '';
    t.addEventListener('input', () => { houder._opmerking = t.value || undefined; naVeldWijziging(); });
    return t;
  }

  function knoopKnoppen(persoon, id) {
    const doos = el('div', 'gt-regelknoppen');
    const start = knop('gt-mini' + (id === persoon.start ? ' gt-aan' : ''), 'start', () => {
      persoon.start = id;
      herbouwAlles();
    });
    start.title = id === persoon.start ? 'Hier begint het gesprek' : 'Het gesprek hier laten beginnen';
    doos.appendChild(start);
    doos.appendChild(knop('gt-mini gt-mini-x', '✕', () => verwijderKnoop(id)));
    return doos;
  }

  function bouwVerplaatsKnoppen(lijst, i) {
    const doos = el('div', 'gt-regelknoppen');
    const omhoog = knop('gt-mini', '↑', () => { if (i <= 0) return; [lijst[i - 1], lijst[i]] = [lijst[i], lijst[i - 1]]; naDataStructuurWijziging(); });
    omhoog.disabled = i <= 0;
    const omlaag = knop('gt-mini', '↓', () => { if (i < 0 || i === lijst.length - 1) return; [lijst[i + 1], lijst[i]] = [lijst[i], lijst[i + 1]]; naDataStructuurWijziging(); });
    omlaag.disabled = i < 0 || i === lijst.length - 1;
    const verwijder = knop('gt-mini gt-mini-x', '✕', () => { if (i < 0) return; lijst.splice(i, 1); naDataStructuurWijziging(); });
    doos.appendChild(omhoog); doos.appendChild(omlaag); doos.appendChild(verwijder);
    return doos;
  }

  // Wat hij in een andere situatie zegt: één regel per knoop, gedempt, met de situaties erachter.
  function bouwElders(persoon, id) {
    const knoop = persoon.knopen[id];
    const rij = el('button', 'gt-elders-knoop');
    rij.type = 'button';
    const regel = (knoop.tekst || []).find((r) => r.zeg);
    rij.appendChild(el('span', 'gt-wie-merk', persoon.naam));
    rij.appendChild(el('span', 'gt-elders-zin', regel ? regel.zeg : '(nog niets gezegd)'));
    // In welke situatie kom je hier wél? Dat is de vraag die je hier stelt, dus staat hij erachter.
    const waar = new Set();
    for (const s of situatiesVan(huidigePersoonId)) {
      const S = staatVanSituatie(s.als, huidigePersoonId);
      if (planGesprek(persoon, S).zichtbaar.has(id)) waar.add(s.naam);
    }
    const lab = waarLabel(huidigePersoonId, [...waar]);
    rij.appendChild(el('span', 'gt-waar' + (lab.fout ? ' gt-fout-tekst' : ''), lab.tekst));
    rij.addEventListener('click', () => {
      const naar = situatiesVan(huidigePersoonId).findIndex((s) => waar.has(s.naam));
      if (naar >= 0) { huidigeSituatieNr = naar; renderSituaties(); renderKaart(); renderGesprek(); renderQuest(); setTimeout(() => gaNaarKnoop(id), 30); }
    });
    return rij;
  }

  function gaNaarKnoop(id) {
    const doel = document.getElementById('knoop-' + id);
    if (!doel) return;
    doel.scrollIntoView({ block: 'center', behavior: 'smooth' });
    doel.classList.add('gt-aangewezen');
    setTimeout(() => doel.classList.remove('gt-aangewezen'), 1200);
  }

  // ---------- het kaartje: de vorm van het gesprek ----------
  //
  // Marcel stuurde op 22 sep een node-editor voor RPG Maker ("misschien dat dat helpt"): blokjes
  // op een canvas die je sleept en verbindt. Wat dat beter doet is de vórm laten zien, en dat
  // miste hier. Wat het slechter doet voor ons: een canvas zet alle voorwaarden weer tegelijk in
  // beeld (precies wat de situatiebalk wegnam), je schrijft er alinea's in blokjes van tweehonderd
  // pixels, en slepen is een tweede baan naast het schrijven. Dus: een kaartje erbij, geen canvas
  // in plaats van. Het volgt de situatie, het legt zichzelf neer, en klikken springt naar de tekst.
  const KB = 176, KH = 52, KGX = 54, KGY = 30; // blokje, en de ruimte ertussen
  let kaartOpen = true;

  function renderKaart() {
    const wrap = $('gt-kaart');
    if (!wrap) return;
    wrap.innerHTML = '';
    const persoon = T.GESPREKKEN[huidigePersoonId];
    if (!persoon || !persoon.knopen[persoon.start]) return;
    const sit = huidigeSituatie();
    const plan = planGesprek(persoon, staatVanSituatie(sit && sit.als, huidigePersoonId));
    const kop = el('div', 'gt-kaart-kop');
    kop.appendChild(knop('gt-vouw-knop', `Kaartje · ${maal(plan.zichtbaar.size, 'stuk', 'stukken')} gesprek ${kaartOpen ? '▴' : '▾'}`, () => {
      kaartOpen = !kaartOpen;
      renderKaart();
    }));
    wrap.appendChild(kop);
    if (!kaartOpen) return;
    wrap.appendChild(bouwKaart(persoon, plan));
  }

  function bouwKaart(persoon, plan) {
    // Hoe ver sta je van het begin? Dat is de kolom waarin een stuk gesprek komt; wie in dezelfde
    // kolom staat, komt eronder. Genoeg voor een gesprek van tien stukken, en niemand hoeft te
    // slepen.
    const diepte = new Map([[persoon.start, 0]]);
    const randen = [];
    const rij = [persoon.start];
    while (rij.length) {
      const id = rij.shift();
      for (const k of (plan.zichtbaar.get(id) || { keuzes: [] }).keuzes) {
        if (!k.naar || !plan.zichtbaar.has(k.naar)) continue;
        randen.push({ van: id, naar: k.naar });
        if (!diepte.has(k.naar)) { diepte.set(k.naar, diepte.get(id) + 1); rij.push(k.naar); }
      }
    }
    const lagen = new Map();
    for (const [id, d] of diepte) { if (!lagen.has(d)) lagen.set(d, []); lagen.get(d).push(id); }
    const plek = new Map();
    let hoogsteRij = 0;
    [...lagen.keys()].sort((a, b) => a - b).forEach((d) => {
      lagen.get(d).forEach((id, i) => plek.set(id, { x: 8 + d * (KB + KGX), y: 8 + i * (KH + KGY) }));
      hoogsteRij = Math.max(hoogsteRij, lagen.get(d).length);
    });
    const breed = 16 + lagen.size * (KB + KGX);
    const hoog = 16 + hoogsteRij * (KH + KGY);

    const doos = el('div', 'gt-kaart-blad');
    doos.style.width = breed + 'px';
    doos.style.height = hoog + 'px';

    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', breed);
    svg.setAttribute('height', hoog);
    svg.setAttribute('class', 'gt-kaart-lijnen');
    const defs = document.createElementNS(NS, 'defs');
    defs.innerHTML = '<marker id="gt-pijl" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">'
      + '<path d="M0,0 L7,3 L0,6 z" fill="currentColor"/></marker>';
    svg.appendChild(defs);
    for (const r of randen) {
      const a = plek.get(r.van), b = plek.get(r.naar);
      // Terug naar iets wat eerder kwam (Wims "Nog iets anders") gaat onderlangs en gestippeld:
      // anders lijkt een lus op voortgang, en dat is het niet.
      const terug = b.x <= a.x;
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', terug
        ? `M${a.x + KB / 2},${a.y + KH} C${a.x + KB / 2},${a.y + KH + 26} ${b.x + KB / 2},${b.y + KH + 26} ${b.x + KB / 2},${b.y + KH}`
        : `M${a.x + KB},${a.y + KH / 2} C${a.x + KB + KGX / 2},${a.y + KH / 2} ${b.x - KGX / 2},${b.y + KH / 2} ${b.x},${b.y + KH / 2}`);
      p.setAttribute('class', 'gt-kaart-lijn' + (terug ? ' gt-kaart-terug' : ''));
      p.setAttribute('marker-end', 'url(#gt-pijl)');
      svg.appendChild(p);
    }
    doos.appendChild(svg);

    for (const [id, p] of plek) {
      const opgelost = plan.zichtbaar.get(id);
      const b = el('button', 'gt-kaart-knoop' + (id === persoon.start ? ' gt-kaart-start' : ''));
      b.type = 'button';
      b.style.left = p.x + 'px';
      b.style.top = p.y + 'px';
      b.appendChild(el('span', 'gt-kaart-zin', opgelost.regel ? opgelost.regel.zeg : '(zegt hier niets)'));
      const verder = opgelost.keuzes.filter((k) => k.naar && plan.zichtbaar.has(k.naar)).length;
      const stopt = opgelost.keuzes.filter((k) => k.sluit || !k.naar).length;
      const merk = [];
      if (verder) merk.push(maal(verder, 'vraag', 'vragen'));
      if (stopt) merk.push(stopt + '× einde');
      if (!opgelost.keuzes.length) merk.push('geen antwoord');
      b.appendChild(el('span', 'gt-kaart-merk', merk.join(' · ')));
      b.title = 'Ga naar dit stuk gesprek';
      b.addEventListener('click', () => gaNaarKnoop(id));
      doos.appendChild(b);
    }
    return doos;
  }

  // ---------- zoeken over alle mensen heen ----------
  // Bij twintig personen weet je niet meer wie wat zegt, en "waar stond die zin over de fontein
  // ook alweer" is dan een kwartier scrollen.
  function zoekResultaten(term) {
    const t = term.trim().toLowerCase();
    if (t.length < 2) return [];
    const uit = [];
    for (const [pid, p] of Object.entries(T.GESPREKKEN)) {
      for (const [kid, knoop] of Object.entries(p.knopen)) {
        for (const r of knoop.tekst || []) {
          if ((r.zeg || '').toLowerCase().includes(t)) uit.push({ pid, kid, zeg: r.zeg, wie: p.naam, antwoord: false, als: r.als });
        }
        for (const k of knoop.keuzes || []) {
          // Waar het antwoord staat erbij: Wim vraagt twee keer "Werkt de fontein nog?", op twee
          // verschillende plekken, en zonder dat zijn die twee regels niet te onderscheiden.
          if ((k.zeg || '').toLowerCase().includes(t)) uit.push({ pid, kid, zeg: k.zeg, wie: p.naam, antwoord: true, als: k.als, waar: eersteZin(p, kid) });
        }
      }
    }
    return uit.slice(0, 40);
  }

  function renderZoek() {
    const veld = $('gt-zoek');
    const uit = $('gt-zoek-uit');
    if (!veld || !uit) return;
    const term = veld.value;
    uit.innerHTML = '';
    const rijen = zoekResultaten(term);
    if (term.trim().length < 2) { uit.classList.add('verborgen'); return; }
    uit.classList.remove('verborgen');
    if (!rijen.length) { uit.appendChild(el('p', 'gt-leeg', 'Niets gevonden.')); return; }
    const t = term.trim().toLowerCase();
    for (const r of rijen) {
      const b = el('button', 'gt-zoek-rij');
      b.type = 'button';
      b.appendChild(el('span', 'gt-zoek-wie', r.wie));
      const zin = el('span', 'gt-zoek-zin' + (r.antwoord ? ' gt-zoek-antwoord' : ''));
      // De gevonden woorden oplichten, zodat je ziet waaróm deze regel er staat.
      const i = r.zeg.toLowerCase().indexOf(t);
      zin.appendChild(document.createTextNode(r.zeg.slice(0, i)));
      zin.appendChild(el('mark', null, r.zeg.slice(i, i + t.length)));
      zin.appendChild(document.createTextNode(r.zeg.slice(i + t.length)));
      b.appendChild(zin);
      if (r.waar) b.appendChild(el('span', 'gt-zoek-waar', 'na: ' + r.waar));
      b.addEventListener('click', () => { uit.classList.add('verborgen'); veld.value = ''; gaNaarRegel(r.pid, r.kid, r.als); });
      uit.appendChild(b);
    }
  }

  // Naar een gevonden regel: de juiste persoon, en dan een situatie waarin je er ook echt komt.
  // Liefst een waarin de gevonden zin zélf klinkt — anders spring je naar een plek waar hij wel
  // staat maar niet te zien is, en dat is precies de verwarring die de situatiebalk wegnam.
  function gaNaarRegel(pid, kid, als) {
    if (!T.GESPREKKEN[pid]) return;
    huidigePersoonId = pid;
    const persoon = T.GESPREKKEN[pid];
    const lijst = situatiesVan(pid);
    const komtErUit = (s) => planGesprek(persoon, staatVanSituatie(s.als, pid)).zichtbaar.has(kid);
    let nr = lijst.findIndex((s) => komtErUit(s) && T.voorwaardeGeldt(staatVanSituatie(s.als, pid), pid, als));
    if (nr < 0) nr = lijst.findIndex(komtErUit);
    huidigeSituatieNr = nr >= 0 ? nr : 0;
    herbouwAlles();
    vuil = false;
    updateStatus();
    setTimeout(() => gaNaarKnoop(kid), 40);
  }

  // ---------- de quest die aan dit gesprek hangt ----------
  //
  // Een quest hangt aan een gesprek (Marcel, 22 sep), dus staat hij op dezelfde bladzijde: welke
  // fasen er zijn, wat het doel is, en langs welke wegen je eruit komt. De fasen zijn ook de
  // knoppen in de situatiebalk, dus je ziet meteen wat de bakker in die fase zegt. De structuur
  // van een quest (fasen erbij, wegen erbij) blijft in de questbewerker; hier schrijf je de
  // teksten en zie je waar je gesprek op aanhaakt.
  function renderQuest() {
    const wrap = $('gt-quest');
    if (!wrap) return;
    wrap.innerHTML = '';
    const q = questVanPersoon(huidigePersoonId);
    if (!q) {
      if (!T.QUESTS) return;
      wrap.appendChild(el('p', 'gt-leeg', 'Deze persoon geeft geen quest.'));
      return;
    }
    wrap.appendChild(el('h3', 'gt-kopje', questNaam(q.id) + ' — de quest van ' + (T.GESPREKKEN[huidigePersoonId].naam || huidigePersoonId)));
    const sit = huidigeSituatie();
    const nuFase = sit && sit.als && sit.als.quest === q.id ? alsLijst(sit.als.fase)[0] : null;

    for (const [fid, fase] of Object.entries(q.quest.fasen || {})) {
      const doos = el('div', 'gt-fase' + (fid === nuFase ? ' gt-fase-nu' : ''));
      const kop = el('div', 'gt-fase-kop');
      const naarSit = situatiesVan(huidigePersoonId).findIndex((s) => s.als && s.als.quest === q.id && alsLijst(s.als.fase)[0] === fid);
      const b = knop('gt-sit gt-sit-quest' + (fid === nuFase ? ' gt-sit-aan' : ''), fid, () => {
        if (naarSit < 0) return;
        huidigeSituatieNr = naarSit;
        renderSituaties(); renderKaart(); renderGesprek(); renderQuest();
      });
      b.title = 'Laat het gesprek zien zoals het in deze fase loopt';
      kop.appendChild(b);
      if (fid === q.quest.begin) kop.appendChild(el('span', 'gt-merkje', 'begint hier'));
      if (fase.eind) kop.appendChild(el('span', 'gt-merkje', 'af'));
      kop.appendChild(el('div', 'gt-vul'));
      doos.appendChild(kop);

      const doel = el('div', 'gt-fase-regel');
      doel.appendChild(el('span', 'gt-fase-wat', 'doel'));
      doel.appendChild(zinVeld(fase.doel, 'wat je nu moet doen — staat linksboven in beeld', (v) => { fase.doel = v || undefined; questVuil = true; naVeldWijziging(); }));
      doos.appendChild(doel);

      const melding = el('div', 'gt-fase-regel');
      melding.appendChild(el('span', 'gt-fase-wat', 'melding'));
      melding.appendChild(zinVeld(fase.melding, 'wat er in beeld komt zodra je hier komt', (v) => { fase.melding = v || undefined; questVuil = true; naVeldWijziging(); }));
      doos.appendChild(melding);

      for (const [wid, weg] of Object.entries(fase.wegen || {})) {
        const r = el('div', 'gt-weg');
        r.appendChild(el('span', 'gt-weg-naam', wid));
        r.appendChild(el('span', 'gt-weg-kost', weg.kost || 'niets'));
        r.appendChild(el('span', 'gt-weg-naar', '→ ' + (weg.naar || '?')));
        if (weg.klaarAls) r.appendChild(el('span', 'gt-weg-als', 'vanzelf ' + alsInTaal(weg.klaarAls)));
        if (weg.doe) r.appendChild(el('span', 'gt-weg-als', doeInTaal(weg.doe)));
        // Welk antwoord in dit gesprek neemt deze weg? Dat is de naad tussen quest en gesprek.
        const via = antwoordenDieWegNemen(q.id, wid);
        if (via.length) r.appendChild(el('span', 'gt-weg-via', 'via: ' + via.map((k) => '"' + (k.zeg || '…') + '"').join(', ')));
        doos.appendChild(r);
      }
      wrap.appendChild(doos);
    }
    const naar = el('p', 'gt-quest-naar');
    const a = document.createElement('a');
    a.href = 'quests.html';
    a.className = 'gt-naar';
    a.textContent = 'Fasen en wegen erbij → questbewerker';
    naar.appendChild(a);
    wrap.appendChild(naar);
  }

  function antwoordenDieWegNemen(questId, wegId) {
    const persoon = T.GESPREKKEN[huidigePersoonId];
    const uit = [];
    for (const knoop of Object.values(persoon.knopen)) {
      for (const k of knoop.keuzes || []) {
        if (k.doe && k.doe.quest === questId && k.doe.weg === wegId) uit.push(k);
      }
    }
    return uit;
  }

  // ---------- controle ----------
  function beschrijfPlek(plek) {
    const p = T.GESPREKKEN[plek.persoonId];
    return `${p ? p.naam : plek.persoonId} → ${plek.knoopId}`;
  }
  function controleer() {
    const meldingen = [];
    const gezet = new Map();
    const gelezen = new Map();
    const merk = (kaart, naam, plek) => { if (!kaart.has(naam)) kaart.set(naam, []); kaart.get(naam).push(plek); };

    for (const [persoonId, persoon] of Object.entries(T.GESPREKKEN)) {
      const ooit = ooitBereikbaar(persoon);
      if (persoon.start && !persoon.knopen[persoon.start]) {
        meldingen.push({ soort: 'fout', tekst: `${persoon.naam}: het gesprek begint bij "${persoon.start}", en die bestaat niet.`, persoonId, knoopId: null });
      }
      for (const [knoopId, knoop] of Object.entries(persoon.knopen)) {
        const plek = { persoonId, knoopId };
        if (!ooit.has(knoopId)) {
          meldingen.push({ soort: 'waarschuwing', tekst: `${persoon.naam}: bij "${eersteZin(persoon, knoopId)}" komt niemand — vanaf het begin is het niet te bereiken.`, ...plek });
        }
        const tekstLijst = knoop.tekst || [];
        if (tekstLijst.length === 0) {
          meldingen.push({ soort: 'fout', tekst: `${persoon.naam}, "${knoopId}": zegt hier niets.`, ...plek });
        } else {
          const idxVangnet = tekstLijst.findIndex((r) => !r.als);
          if (idxVangnet === -1) {
            meldingen.push({ soort: 'waarschuwing', tekst: `${persoon.naam}, "${knoopId}": geen versie zonder voorwaarde als vangnet — past er niets, dan blijft de tekst leeg.`, ...plek });
          } else if (idxVangnet !== tekstLijst.length - 1) {
            meldingen.push({ soort: 'fout', tekst: `${persoon.naam}, "${knoopId}": versie ${idxVangnet + 1} heeft geen voorwaarde maar staat niet onderaan — de versies erna worden nooit gebruikt.`, ...plek });
          }
        }
        tekstLijst.forEach((regel, i) => {
          if (regel.als) { if (regel.als.vlag) merk(gelezen, regel.als.vlag, plek); if (regel.als.nietVlag) merk(gelezen, regel.als.nietVlag, plek); }
          // Nieuw sinds de situatiebalk er is: een regel die in geen enkele situatie wint, hoort
          // de speler nooit. Dat is òf een vergeten situatie, òf een zin die weg kan.
          if (regel.als && heeftEigenSituaties(persoonId) && !situatiesWaarinVoor(persoonId, regel.als).length) {
            meldingen.push({ soort: 'waarschuwing', tekst: `${persoon.naam}, "${knoopId}": versie ${i + 1} ("${(regel.zeg || '').slice(0, 40)}…") klinkt in geen enkele situatie. Mist er een situatie?`, ...plek });
          }
          const lang = teLang(regel.zeg, !!persoon.portret, false);
          if (lang) meldingen.push({ soort: 'waarschuwing', tekst: `${persoon.naam}, "${knoopId}": versie ${i + 1} is ongeveer ${lang} regels hoog (past niet lekker in het gesprekvenster).`, ...plek });
        });
        (knoop.keuzes || []).forEach((keuze) => {
          if (keuze.als) { if (keuze.als.vlag) merk(gelezen, keuze.als.vlag, plek); if (keuze.als.nietVlag) merk(gelezen, keuze.als.nietVlag, plek); }
          if (keuze.doe) { alsLijst(keuze.doe.zetVlag).forEach((n) => merk(gezet, n, plek)); alsLijst(keuze.doe.wisVlag).forEach((n) => merk(gezet, n, plek)); }
          if (!keuze.naar && !keuze.sluit) meldingen.push({ soort: 'fout', tekst: `${persoon.naam}, "${knoopId}": het antwoord "${keuze.zeg}" gaat nergens heen.`, ...plek });
          if (keuze.naar && !persoon.knopen[keuze.naar]) meldingen.push({ soort: 'fout', tekst: `${persoon.naam}, "${knoopId}": het antwoord "${keuze.zeg}" wijst naar "${keuze.naar}", en die bestaat niet.`, ...plek });
          if (keuze.als && heeftEigenSituaties(persoonId) && !situatiesWaarinVoor(persoonId, keuze.als).length) {
            meldingen.push({ soort: 'waarschuwing', tekst: `${persoon.naam}, "${knoopId}": het antwoord "${keuze.zeg}" is in geen enkele situatie te zien. Mist er een situatie?`, ...plek });
          }
          const lang = teLang(keuze.zeg, !!persoon.portret, true);
          if (lang) meldingen.push({ soort: 'waarschuwing', tekst: `${persoon.naam}, "${knoopId}": het antwoord "${keuze.zeg}" is als knop ongeveer ${lang} regels hoog.`, ...plek });
        });
      }
    }
    for (const [naam, plekken] of gezet) {
      if (!gelezen.has(naam)) meldingen.push({ soort: 'waarschuwing', tekst: `Vlag "${naam}" wordt gezet (bij ${beschrijfPlek(plekken[0])}) maar in de gesprekken nergens gelezen.`, ...plekken[0] });
    }
    for (const [naam, plekken] of gelezen) {
      if (!gezet.has(naam)) meldingen.push({ soort: 'info', tekst: `Vlag "${naam}" wordt gelezen (bij ${beschrijfPlek(plekken[0])}) maar in de gesprekken nergens gezet — mogelijk komt hij elders uit het spel.`, ...plekken[0] });
    }
    return meldingen;
  }
  // Zelfde vraag als situatiesWaarin, maar voor een andere persoon dan degene die je bewerkt.
  function situatiesWaarinVoor(persoonId, als) {
    return situatiesVan(persoonId).filter((s) => T.voorwaardeGeldt(staatVanSituatie(s.als, persoonId), persoonId, als)).map((s) => s.naam);
  }

  function renderFouten() {
    const wrap = $('gt-fouten-inhoud');
    if (!wrap) return;
    wrap.innerHTML = '';
    const meldingen = controleer();
    const tal = $('gt-controle-tal');
    if (tal) {
      const fouten = meldingen.filter((m) => m.soort === 'fout').length;
      tal.textContent = fouten ? fouten + ' fout' + (fouten === 1 ? '' : 'en') : meldingen.length ? meldingen.length + ' opmerkingen' : 'schoon';
      tal.className = 'gt-status' + (fouten ? ' gt-fout-tekst' : '');
    }
    if (!meldingen.length) { wrap.appendChild(el('p', 'gt-schoon', 'Geen fouten of waarschuwingen gevonden.')); return; }
    const label = { fout: 'FOUT', waarschuwing: 'LET OP', info: 'INFO' };
    const maakItem = (m) => {
      const li = document.createElement('li');
      const b = el('button', 'gt-melding-item ' + m.soort, null);
      b.type = 'button';
      b.appendChild(el('span', 'gt-melding-soort', label[m.soort] + ' '));
      b.appendChild(document.createTextNode(m.tekst));
      b.addEventListener('click', () => {
        if (m.persoonId && m.persoonId !== huidigePersoonId) { huidigePersoonId = m.persoonId; huidigeSituatieNr = 0; herbouwAlles(); }
        if (m.knoopId) setTimeout(() => gaNaarKnoop(m.knoopId), 20);
      });
      li.appendChild(b);
      return li;
    };
    const maakLijst = (rij) => {
      const ul = el('ul', 'gt-melding-lijst');
      rij.forEach((m) => ul.appendChild(maakItem(m)));
      return ul;
    };
    const belangrijk = meldingen.filter((m) => m.soort !== 'info');
    const info = meldingen.filter((m) => m.soort === 'info');
    if (belangrijk.length) wrap.appendChild(maakLijst(belangrijk));
    else wrap.appendChild(el('p', 'gt-schoon', 'Geen fouten of waarschuwingen gevonden.'));
    // Een vlag die hier gelezen maar nergens gezet wordt, komt meestal gewoon uit de code van het
    // spel of uit een raakpunt. Dat is geen fout en hoort dus niet elke keer in beeld te staan.
    if (info.length) wrap.appendChild(vouw(maal(info.length, 'vlag', 'vlaggen') + ' die elders in het spel gezet worden', () => maakLijst(info)));
  }

  // ---------- proberen: het gesprek spelen zoals het spel dat doet ----------
  let proefS = null;
  let proefKnoopId = null;
  function beginProef() {
    const sit = huidigeSituatie();
    proefS = staatVanSituatie(sit && sit.als, huidigePersoonId);
    const persoon = T.GESPREKKEN[huidigePersoonId];
    proefKnoopId = persoon ? persoon.start : null;
    renderProef();
  }
  function renderProef() {
    const wrap = $('gt-proef');
    if (!wrap) return;
    wrap.innerHTML = '';
    const persoon = T.GESPREKKEN[huidigePersoonId];
    if (!persoon || !proefS) return;
    const kop = el('div', 'gt-proef-kop');
    kop.appendChild(el('h2', null, 'Proberen'));
    kop.appendChild(el('div', 'gt-vul'));
    kop.appendChild(knop('gt-mini', 'opnieuw', beginProef));
    kop.appendChild(knop('gt-mini gt-mini-x', '✕', () => wrap.classList.add('verborgen')));
    wrap.appendChild(kop);
    const sit = huidigeSituatie();
    wrap.appendChild(el('p', 'gt-proef-sit', 'vanaf: ' + (sit ? sit.naam : '—')));

    if (!proefKnoopId || !persoon.knopen[proefKnoopId]) {
      wrap.appendChild(el('p', 'gt-proef-eind', 'Het gesprek is afgelopen.'));
      return;
    }
    const opgelost = T.gesprekKnoop(proefS, huidigePersoonId, proefKnoopId);
    wrap.appendChild(el('p', 'gt-proef-zegt', opgelost.tekst || '(zegt hier niets)'));
    for (const keuze of opgelost.keuzes) {
      const b = knop('gt-proef-keuze', keuze.zeg || '(leeg antwoord)', () => {
        T.doeGevolg(proefS, keuze.doe);
        proefKnoopId = keuze.sluit ? null : keuze.naar;
        renderProef();
      });
      if (keuze.doe) b.title = doeInTaal(keuze.doe);
      wrap.appendChild(b);
    }
    if (!opgelost.keuzes.length) wrap.appendChild(el('p', 'gt-proef-eind', 'Geen antwoorden — hier loopt de speler vast.'));
  }

  // ---------- bewerkingen op het gesprek ----------
  function verwijderKnoop(id) {
    const persoon = T.GESPREKKEN[huidigePersoonId];
    if (id === persoon.start) { alert('Hier begint het gesprek. Wijs eerst een ander stuk als start aan.'); return; }
    const verwijzingen = [];
    Object.entries(persoon.knopen).forEach(([kid, k]) => (k.keuzes || []).forEach((keuze) => { if (keuze.naar === id) verwijzingen.push(kid); }));
    const melding = verwijzingen.length ? `Er wijzen nog ${maal(verwijzingen.length, 'antwoord', 'antwoorden')} hierheen. ` : '';
    if (!confirm(`${melding}"${eersteZin(persoon, id)}" weghalen?`)) return;
    delete persoon.knopen[id];
    if (proefKnoopId === id) proefKnoopId = persoon.start;
    herbouwAlles();
  }

  function nieuwPersoon() {
    const naam = prompt('Naam van de nieuwe persoon:');
    if (!naam || !naam.trim()) return;
    const id = vrijeId(naam.trim().toLowerCase().replace(/[^a-z0-9]+/g, '') || 'persoon', (n) => !T.GESPREKKEN[n]);
    T.GESPREKKEN[id] = { naam: naam.trim(), start: 'welkom', knopen: { welkom: { tekst: [{ zeg: '' }], keuzes: [] } } };
    huidigePersoonId = id;
    huidigeSituatieNr = 0;
    herbouwAlles();
  }

  function nieuweKnoop() {
    const persoon = T.GESPREKKEN[huidigePersoonId];
    if (!persoon) return;
    const id = vrijeId('stuk', (n) => !persoon.knopen[n]);
    persoon.knopen[id] = { tekst: [{ zeg: '' }], keuzes: [] };
    herbouwAlles();
    setTimeout(() => gaNaarKnoop(id), 30);
  }

  // ---------- verversen ----------
  // Typen in een tekstveld herbouwt nooit het gesprek zelf (anders springt de cursor weg); een
  // structurele wijziging (een regel erbij, een ander doel, een andere voorwaarde) wel.
  let questVuil = false;
  function naVeldWijziging() {
    vuil = true;
    renderFouten();
    updateStatus();
  }
  function naDataStructuurWijziging() {
    renderSituaties();
    renderKaart();
    renderGesprek();
    renderQuest();
    naVeldWijziging();
  }
  function herbouwAlles() {
    renderPersonen();
    renderPersoonEditor();
    renderSituaties();
    renderKaart();
    renderGesprek();
    renderQuest();
    renderFouten();
    vuil = true;
    updateStatus();
  }
  function updateStatus() {
    const s = $('gt-status');
    if (!s) return;
    s.textContent = vuil ? 'niet-opgeslagen wijzigingen' + (questVuil ? ' (ook in de quest — sla die in de questbewerker op)' : '') : s.dataset.opgeslagen || '';
  }

  // ---------- opslaan: T.GESPREKKEN terug naar leesbare code, kop en staart intact ----------
  function str(s) {
    s = String(s);
    if (!/['\\\n\r]/.test(s)) return "'" + s + "'";
    return JSON.stringify(s);
  }
  function serWaarde(v) {
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (Array.isArray(v)) return '[' + v.map(str).join(', ') + ']';
    return str(v);
  }
  function serAls(als) {
    const delen = VOORWAARDEN.filter((t) => als[t.naam] !== undefined).map((t) => `${t.naam}: ${t.soort === 'getal' ? Number(als[t.naam]) : serWaarde(als[t.naam])}`);
    // Wat niet in VOORWAARDEN staat (een nieuw soort voorwaarde die dit gereedschap nog niet
    // kent) mag niet stilletjes verdwijnen bij het opslaan.
    for (const [naam, v] of Object.entries(als)) {
      if (!VOORWAARDEN.some((t) => t.naam === naam)) delen.push(`${naam}: ${serWaarde(v)}`);
    }
    return `{ ${delen.join(', ')} }`;
  }
  const DOE_VOLGORDE = GEVOLGEN.map((g) => g.naam);
  function serDoe(doe) {
    const namen = Object.keys(doe).sort((a, b) => {
      const ia = DOE_VOLGORDE.indexOf(a), ib = DOE_VOLGORDE.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    });
    return `{ ${namen.map((n) => `${n}: ${serWaarde(doe[n])}`).join(', ')} }`;
  }
  function serRegel(r) {
    const delen = [];
    if (r.als && Object.keys(r.als).length) delen.push(`als: ${serAls(r.als)}`);
    delen.push(`zeg: ${str(r.zeg || '')}`);
    return `{ ${delen.join(', ')} }`;
  }
  function serKeuze(k) {
    const delen = [`zeg: ${str(k.zeg || '')}`];
    if (k.sluit) delen.push('sluit: true'); else delen.push(`naar: ${str(k.naar)}`);
    if (k.als && Object.keys(k.als).length) delen.push(`als: ${serAls(k.als)}`);
    if (k.doe && Object.keys(k.doe).length) delen.push(`doe: ${serDoe(k.doe)}`);
    return `{ ${delen.join(', ')} }`;
  }
  function opmComment(opmerking, sp) {
    if (!opmerking) return '';
    return opmerking.split('\n').map((r) => (sp + '// ' + r).replace(/ +$/, '')).join('\n') + '\n';
  }
  function serRij(lijst, ser, sp) {
    return (lijst || []).map((r) => opmComment(r._opmerking, sp) + sp + ser(r) + ',').join('\n');
  }
  function serKnoop(id, knoop, sp) {
    const sp2 = sp + '  ';
    const sp3 = sp2 + '  ';
    let out = opmComment(knoop._opmerking, sp);
    out += `${sp}${id}: {\n`;
    out += `${sp2}tekst: [\n${serRij(knoop.tekst, serRegel, sp3)}\n${sp2}],\n`;
    out += (knoop.keuzes && knoop.keuzes.length)
      ? `${sp2}keuzes: [\n${serRij(knoop.keuzes, serKeuze, sp3)}\n${sp2}],\n`
      : `${sp2}keuzes: [],\n`;
    out += `${sp}},\n`;
    return out;
  }
  function serPersoon(id, p, sp) {
    const sp2 = sp + '  ';
    const sp3 = sp2 + '  ';
    let out = opmComment(p._opmerking, sp);
    out += `${sp}${id}: {\n`;
    out += `${sp2}naam: ${str(p.naam)},\n`;
    if (p.portret) out += `${sp2}portret: ${str(p.portret)},\n`;
    out += `${sp2}start: ${str(p.start)},\n`;
    // De situaties zijn van de schrijver, niet van het spel: het spel leest ze nooit. Ze staan
    // hier omdat ze bij deze persoon horen en met hem mee moeten reizen.
    if (p.situaties && p.situaties.length) {
      out += `${sp2}situaties: [\n`;
      out += p.situaties.map((s) => `${sp3}{ naam: ${str(s.naam)}, als: ${serAls(s.als || {})} },`).join('\n') + '\n';
      out += `${sp2}],\n`;
    }
    out += `${sp2}knopen: {\n${Object.entries(p.knopen).map(([kid, k]) => serKnoop(kid, k, sp2 + '  ')).join('')}${sp2}},\n`;
    out += `${sp}},\n`;
    return out;
  }
  // Alleen het blok T.GESPREKKEN wordt opnieuw geschreven; kop en staart gaan letterlijk mee.
  // Lukte het lezen niet, dan geeft dit null en slaat de bewerker niet op — beter niets schrijven
  // dan iets kwijtraken wat hij niet kent.
  function bouwBestandTekst() {
    if (!BRON_GELEZEN) return null;
    let blok = '  T.GESPREKKEN = {\n';
    blok += Object.entries(T.GESPREKKEN).map(([id, p]) => serPersoon(id, p, '    ')).join('');
    blok += '  };';
    return RUWE_KOP + blok + RUWE_STAART;
  }

  async function opslaan() {
    const fouten = controleer().filter((m) => m.soort === 'fout');
    if (fouten.length && !confirm(`Er staan nog ${fouten.length} fout(en) in de controle. Toch opslaan?`)) return;
    if (VERLOREN_OPMERKINGEN.length && !bevestigdVerliesOpmerkingen) {
      if (!confirm('Dit bestand had opmerkingen die dit gereedschap niet kon plaatsen (zie de melding bovenaan); die gaan bij het opslaan verloren. Toch doorgaan?')) return;
      bevestigdVerliesOpmerkingen = true;
    }
    const inhoud = bouwBestandTekst();
    const statusEl = $('gt-status');
    if (inhoud == null) {
      if (statusEl) statusEl.textContent = 'Niet opgeslagen: js/gesprekken.js was niet te lezen, en dan schrijven we liever niets.';
      return;
    }
    if (statusEl) statusEl.textContent = 'Opslaan…';
    try {
      const resp = await fetch('/gereedschap/api/gesprekken-opslaan', { method: 'POST', headers: { 'Content-Type': 'text/plain; charset=utf-8' }, body: inhoud });
      if (!resp.ok) throw new Error(await resp.text());
      vuil = false;
      const tijd = 'opgeslagen om ' + new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
      if (statusEl) { statusEl.dataset.opgeslagen = tijd; statusEl.textContent = tijd; }
      if (questVuil) alert('De teksten van de quest (doel en melding) staan in js/quests.js en zijn hiermee niet opgeslagen. Sla ze op in de questbewerker.');
    } catch (fout) {
      if (statusEl) statusEl.textContent = 'Opslaan mislukt: ' + fout.message;
    }
  }

  // ---------- opstarten ----------
  async function init() {
    const [gesprekkenBron, gesprekBron] = await Promise.all([
      fetch('../js/gesprekken.js').then((r) => r.text()),
      fetch('../js/gesprek.js').then((r) => r.text()),
    ]);
    leidVoorwaardenAf(gesprekkenBron, gesprekBron);
    verwerkRuweBron(gesprekkenBron);
    renderOpmerkingMelding();

    huidigePersoonId = Object.keys(T.GESPREKKEN)[0] || null;
    huidigeSituatieNr = 0;
    herbouwAlles();
    vuil = false;
    updateStatus();

    const koppel = (id, gebeurtenis, doe) => { const e = $(id); if (e) e.addEventListener(gebeurtenis, doe); };
    koppel('gt-persoon', 'change', (e) => { huidigePersoonId = e.target.value; huidigeSituatieNr = 0; herbouwAlles(); vuil = false; updateStatus(); });
    koppel('gt-nieuw-persoon', 'click', nieuwPersoon);
    koppel('gt-opslaan', 'click', opslaan);
    koppel('gt-proberen', 'click', () => {
      const p = $('gt-proef');
      if (p) p.classList.remove('verborgen');
      beginProef();
    });
    koppel('gt-zoek', 'input', renderZoek);
    koppel('gt-zoek', 'keydown', (e) => { if (e.key === 'Escape') { e.target.value = ''; renderZoek(); } });
    // Buiten de uitslag klikken sluit hem; anders blijft er een lijst over de tekst hangen.
    document.addEventListener('click', (e) => {
      const uit = $('gt-zoek-uit');
      if (uit && !uit.contains(e.target) && e.target !== $('gt-zoek')) uit.classList.add('verborgen');
    });
    window.addEventListener('beforeunload', (e) => { if (vuil) { e.preventDefault(); e.returnValue = ''; } });
  }

  // De schrijver is ook van gereedschap/wereld.html: klik daar een poppetje en zijn gesprek staat
  // in hetzelfde scherm. Er is geen tweede bewerker — dit is hem, en die bladzijde levert alleen
  // dezelfde gt-*-elementen aan. Vandaar dat dit bestand zichzelf niet start: de bladzijde die
  // hem gebruikt, zegt wanneer.
  let gestart = false;
  T.gesprekkenTool = {
    async start() {
      if (gestart) { herbouwAlles(); vuil = false; updateStatus(); return; }
      gestart = true;
      await init();
    },
    // Naar één persoon springen. Geeft false als die nog geen gesprek heeft, zodat de aanroeper
    // kan vragen of er een moet komen.
    kies(persoonId) {
      if (!T.GESPREKKEN[persoonId]) return false;
      huidigePersoonId = persoonId;
      huidigeSituatieNr = 0;
      herbouwAlles();
      vuil = false;
      updateStatus();
      return true;
    },
    // Een gesprek beginnen voor iemand die er nog geen heeft, met zijn eigen id (de soort uit
    // T.WEZENS, want daarop zoekt js/verkennen.js het gesprek op).
    begin(persoonId, naam) {
      if (T.GESPREKKEN[persoonId]) return this.kies(persoonId);
      T.GESPREKKEN[persoonId] = { naam: naam || persoonId, start: 'welkom', knopen: { welkom: { tekst: [{ zeg: '' }], keuzes: [] } } };
      huidigePersoonId = persoonId;
      huidigeSituatieNr = 0;
      herbouwAlles();
      return true;
    },
    heeft: (persoonId) => !!T.GESPREKKEN[persoonId],
    isVuil: () => vuil,
    // Voor de toetsen en voor wereld.html: waar de situaties vandaan komen en wat ze betekenen.
    situatiesVan,
    staatVanSituatie,
    planGesprek,
  };
})();
