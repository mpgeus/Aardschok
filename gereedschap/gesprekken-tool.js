// Het scherm van het gesprekken-gereedschap. De regels (welke tekstregel wint, welke keuzes
// zichtbaar zijn) komen rechtstreeks van ../js/gesprek.js, op T.GESPREKKEN uit ../js/gesprekken.js
// — dit bestand kent geen eigen kopie daarvan, ook niet in het proefgesprek. Hier staat alleen
// hoe dat in een scherm komt: de boom, de formulieren, het proefgesprek en de controlelijst.
(function () {
  'use strict';
  const T = globalThis.Toren;
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

  // ---------- toestand van het gereedschap zelf (niet van het proefgesprek) ----------
  let huidigePersoonId = null;
  let huidigeKnoopId = null;
  let vuil = false; // niet-opgeslagen wijzigingen
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
  // Alles vóór "(function (T) {" is het kop-commentaar en blijft ongewijzigd staan. Een opmerking
  // vlak boven een persoon ("    wim: {") of een knoop ("        welkom: {") hoort daarbij en komt
  // bij het opslaan terug als "_opmerking" op dat object. Andere opmerkingen (bijvoorbeeld boven
  // één tekstregel) kan dit gereedschap niet plaatsen; die worden hier verzameld zodat ze niet
  // stilzwijgend verdwijnen bij het opslaan.
  // Wat er vóór en ná T.GESPREKKEN in het bestand staat, letterlijk bewaard. Dat is niet netjes-
  // doen maar noodzaak: js/gesprekken.js heeft er T.TUTORIAL_TEKST bij staan, en die kent deze
  // bewerker niet. Voordat dit er was, wiste één keer opslaan het hele draaiboek van de tutorial.
  // De regel is nu: alleen het blok T.GESPREKKEN wordt opnieuw geschreven, de rest gaat
  // onveranderd mee terug (gereedschap/bronblok.js, test/bronblok.test.cjs).
  let RUWE_KOP = '';
  let RUWE_STAART = '';
  let BRON_GELEZEN = false;
  let VERLOREN_OPMERKINGEN = [];

  // Het commentaar in het bestand hoort bij wat eronder staat, en dat komt bij het opslaan terug
  // op zijn plek. Dat kan bij een persoon, bij een knoop, én bij één regel tekst of één antwoord
  // — en dat laatste is waar het meeste van staat: het waarom van een zin staat erboven.
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
    if (!VERLOREN_OPMERKINGEN.length) { doos.classList.add('verborgen'); return; }
    doos.classList.remove('verborgen');
    doos.textContent = `Let op: js/gesprekken.js bevat ${VERLOREN_OPMERKINGEN.length} opmerking(en) die dit gereedschap nergens aan kan ophangen. Bij het opslaan gaan die verloren. Voorbeeld: "${VERLOREN_OPMERKINGEN[0].slice(0, 90)}${VERLOREN_OPMERKINGEN[0].length > 90 ? '…' : ''}"`;
  }

  // ---------- meten of tekst past in het gesprekvenster van het spel ----------
  // Meet met de echte css uit ../stijl.css (#dialoog, #dialoog-tekst, #dialoog-keuzes button),
  // via de verborgen rek onderaan de pagina — geen gegokte pixelbreedte.
  const MAX_REGELS_TEKST = 6; // verhalende tekst, in #dialoog-tekst
  const MAX_REGELS_KEUZE = 2; // een keuze is een kort antwoord, als knop in #dialoog-keuzes
  function regelHoogte(elMeet) {
    const oud = elMeet.textContent;
    elMeet.textContent = 'x';
    const h = elMeet.getBoundingClientRect().height;
    elMeet.textContent = oud;
    return h || 18;
  }
  function teLang(tekst, metPortret, isKeuze) {
    if (!tekst) return 0;
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

  // ---------- de boom: wat is vanaf start bereikbaar, en via welke keuze ----------
  function bouwBoom(persoon) {
    const bezocht = new Set();
    function stap(knoopId, pad) {
      const knoop = persoon.knopen[knoopId];
      if (!knoop) return { knoopId, soort: 'ontbreekt' };
      bezocht.add(knoopId);
      if (pad.includes(knoopId)) return { knoopId, soort: 'cyclus' };
      const nieuwPad = pad.concat(knoopId);
      const kinderen = (knoop.keuzes || []).map((keuze) => ({ keuze, kind: keuze.naar ? stap(keuze.naar, nieuwPad) : null }));
      return { knoopId, soort: 'knoop', kinderen };
    }
    const wortel = persoon.start ? stap(persoon.start, []) : null;
    const onbereikbaar = Object.keys(persoon.knopen).filter((id) => !bezocht.has(id));
    return { wortel, onbereikbaar, bezocht };
  }

  // ---------- controle op fouten, over alle personen heen ----------
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
      const boom = bouwBoom(persoon);
      if (persoon.start && !persoon.knopen[persoon.start]) {
        meldingen.push({ soort: 'fout', tekst: `${persoon.naam}: startknoop "${persoon.start}" bestaat niet.`, persoonId, knoopId: null });
      }
      for (const [knoopId, knoop] of Object.entries(persoon.knopen)) {
        const plek = { persoonId, knoopId };
        if (!boom.bezocht.has(knoopId)) {
          meldingen.push({ soort: 'waarschuwing', tekst: `${persoon.naam}: knoop "${knoopId}" is vanaf "${persoon.start}" niet bereikbaar.`, ...plek });
        }
        const tekstLijst = knoop.tekst || [];
        if (tekstLijst.length === 0) {
          meldingen.push({ soort: 'fout', tekst: `${persoon.naam}, knoop "${knoopId}": heeft geen tekst.`, ...plek });
        } else {
          const idxVangnet = tekstLijst.findIndex((r) => !r.als);
          if (idxVangnet === -1) {
            meldingen.push({ soort: 'waarschuwing', tekst: `${persoon.naam}, knoop "${knoopId}": geen regel zonder voorwaarde als vangnet — als niets past, is de tekst leeg.`, ...plek });
          } else if (idxVangnet !== tekstLijst.length - 1) {
            meldingen.push({ soort: 'fout', tekst: `${persoon.naam}, knoop "${knoopId}": regel ${idxVangnet + 1} heeft geen voorwaarde maar staat niet onderaan — de regel(s) erna worden nooit gebruikt.`, ...plek });
          }
        }
        tekstLijst.forEach((regel, i) => {
          if (regel.als) { if (regel.als.vlag) merk(gelezen, regel.als.vlag, plek); if (regel.als.nietVlag) merk(gelezen, regel.als.nietVlag, plek); }
          const lang = teLang(regel.zeg, !!persoon.portret, false);
          if (lang) meldingen.push({ soort: 'waarschuwing', tekst: `${persoon.naam}, knoop "${knoopId}": tekstregel ${i + 1} is ongeveer ${lang} regels hoog (past niet lekker in het gesprekvenster).`, ...plek });
        });
        (knoop.keuzes || []).forEach((keuze) => {
          if (keuze.als) { if (keuze.als.vlag) merk(gelezen, keuze.als.vlag, plek); if (keuze.als.nietVlag) merk(gelezen, keuze.als.nietVlag, plek); }
          if (keuze.doe) { alsLijst(keuze.doe.zetVlag).forEach((n) => merk(gezet, n, plek)); alsLijst(keuze.doe.wisVlag).forEach((n) => merk(gezet, n, plek)); }
          if (!keuze.naar && !keuze.sluit) meldingen.push({ soort: 'fout', tekst: `${persoon.naam}, knoop "${knoopId}": keuze "${keuze.zeg}" gaat nergens heen.`, ...plek });
          if (keuze.naar && !persoon.knopen[keuze.naar]) meldingen.push({ soort: 'fout', tekst: `${persoon.naam}, knoop "${knoopId}": keuze "${keuze.zeg}" wijst naar knoop "${keuze.naar}", die niet bestaat.`, ...plek });
          const lang = teLang(keuze.zeg, !!persoon.portret, true);
          if (lang) meldingen.push({ soort: 'waarschuwing', tekst: `${persoon.naam}, knoop "${knoopId}": de keuze "${keuze.zeg}" is als knop ongeveer ${lang} regels hoog.`, ...plek });
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

  // ---------- proefgesprek: eigen (nep) spelstaat S, verder puur ../js/gesprek.js ----------
  let proefS = null;
  let proefKnoopId = null;
  function nieuwProefgesprek() {
    proefS = { held: { leeftijd: T.STARTLEEFTIJD }, inventaris: new Set(), vlaggen: new Set(), gesprekLeeftijd: {} };
    const persoon = T.GESPREKKEN[huidigePersoonId];
    proefKnoopId = persoon ? persoon.start : null;
  }
  function proefNamen(soort) {
    // welke vlag- of itemnamen komen voor in deze persoon, als voorstel bij het proberen
    const persoon = T.GESPREKKEN[huidigePersoonId];
    if (!persoon) return [];
    const namen = new Set();
    const uitAls = (als) => {
      if (!als) return;
      if (soort === 'vlag') { if (als.vlag) namen.add(als.vlag); if (als.nietVlag) namen.add(als.nietVlag); }
      else { if (als.heeft) namen.add(als.heeft); if (als.nietHeeft) namen.add(als.nietHeeft); }
    };
    Object.values(persoon.knopen).forEach((knoop) => {
      (knoop.tekst || []).forEach((r) => uitAls(r.als));
      (knoop.keuzes || []).forEach((k) => { uitAls(k.als); if (soort === 'vlag' && k.doe) { alsLijst(k.doe.zetVlag).forEach((n) => namen.add(n)); alsLijst(k.doe.wisVlag).forEach((n) => namen.add(n)); } });
    });
    return [...namen].sort();
  }
  function alsTekst(als) {
    if (!als) return '';
    return VOORWAARDEN.filter((t) => als[t.naam] !== undefined).map((t) => `${t.naam}: ${als[t.naam]}`).join(', ');
  }

  function renderProefStaat() {
    const wrap = $('gt-proef-staat');
    wrap.innerHTML = '';
    const persoon = T.GESPREKKEN[huidigePersoonId];
    if (!persoon) { wrap.appendChild(el('p', 'gt-leeg', 'Geen persoon gekozen.')); return; }

    // leeftijd, in hele jaren
    const rijLeeftijd = el('div', 'gt-proef-rij');
    const labelLeeftijd = el('label', null, 'Leeftijd (jaren) ');
    const invLeeftijd = document.createElement('input');
    invLeeftijd.type = 'number'; invLeeftijd.min = '1'; invLeeftijd.max = '200';
    invLeeftijd.value = T.jaren(proefS.held.leeftijd);
    invLeeftijd.addEventListener('input', () => {
      const jaren = invLeeftijd.value === '' ? 0 : Number(invLeeftijd.value);
      proefS.held.leeftijd = Math.max(0, jaren) * 12 + (proefS.held.leeftijd % 12);
      naProefVeldWijziging();
    });
    labelLeeftijd.appendChild(invLeeftijd);
    rijLeeftijd.appendChild(labelLeeftijd);
    wrap.appendChild(rijLeeftijd);

    // sinds vorig gesprek (maanden ouder geworden) — de motor achter ouderGewordenSinds
    const bijAfscheid = proefS.gesprekLeeftijd[huidigePersoonId];
    const rijSinds = el('div', 'gt-proef-rij');
    const vinkSinds = document.createElement('input');
    vinkSinds.type = 'checkbox'; vinkSinds.checked = bijAfscheid != null;
    const labelVink = el('label', null, null);
    labelVink.appendChild(vinkSinds);
    labelVink.appendChild(document.createTextNode('Al eerder gesproken,'));
    const invSinds = document.createElement('input');
    invSinds.type = 'number'; invSinds.min = '0';
    invSinds.value = bijAfscheid != null ? proefS.held.leeftijd - bijAfscheid : 0;
    invSinds.disabled = bijAfscheid == null;
    const labelSindsGetal = el('label', null, null);
    labelSindsGetal.appendChild(invSinds);
    labelSindsGetal.appendChild(document.createTextNode('maanden geleden'));
    vinkSinds.addEventListener('change', () => {
      if (vinkSinds.checked) proefS.gesprekLeeftijd[huidigePersoonId] = proefS.held.leeftijd - Number(invSinds.value || 0);
      else delete proefS.gesprekLeeftijd[huidigePersoonId];
      renderProefStaat(); renderProefGesprek(); renderFouten();
    });
    invSinds.addEventListener('input', () => {
      proefS.gesprekLeeftijd[huidigePersoonId] = proefS.held.leeftijd - Number(invSinds.value || 0);
      naProefVeldWijziging();
    });
    rijSinds.appendChild(labelVink);
    rijSinds.appendChild(labelSindsGetal);
    wrap.appendChild(rijSinds);

    wrap.appendChild(bouwChipsRij('Vlaggen', proefS.vlaggen, proefNamen('vlag')));
    wrap.appendChild(bouwChipsRij('Bij je (inventaris)', proefS.inventaris, proefNamen('heeft')));

    const knoppenRij = el('div', 'gt-proef-rij');
    knoppenRij.appendChild(knop(null, 'Begin gesprek opnieuw', () => { proefKnoopId = persoon.start; renderProefGesprek(); }));
    const springSelect = document.createElement('select');
    const optieLeeg = document.createElement('option'); optieLeeg.value = ''; optieLeeg.textContent = '(spring naar knoop…)';
    springSelect.appendChild(optieLeeg);
    Object.keys(persoon.knopen).forEach((id) => { const o = document.createElement('option'); o.value = id; o.textContent = id; springSelect.appendChild(o); });
    springSelect.addEventListener('change', () => { if (springSelect.value) { proefKnoopId = springSelect.value; renderProefGesprek(); springSelect.value = ''; } });
    knoppenRij.appendChild(springSelect);
    wrap.appendChild(knoppenRij);
  }

  function bouwChipsRij(titel, verzameling, voorstellen) {
    const doos = el('div', 'gt-proef-rij');
    doos.appendChild(el('span', 'gt-als-titel', titel + ':'));
    const chips = el('div', 'gt-chips');
    const alleNamen = new Set([...voorstellen, ...verzameling]);
    [...alleNamen].sort().forEach((naam) => {
      const chip = el('label', 'gt-chip', null);
      const vink = document.createElement('input');
      vink.type = 'checkbox'; vink.checked = verzameling.has(naam);
      vink.addEventListener('change', () => { if (vink.checked) verzameling.add(naam); else verzameling.delete(naam); renderProefGesprek(); renderFouten(); });
      chip.appendChild(vink);
      chip.appendChild(document.createTextNode(naam));
      chips.appendChild(chip);
    });
    doos.appendChild(chips);
    const toevoegen = el('div', 'gt-toevoegen');
    const invNieuw = document.createElement('input'); invNieuw.type = 'text'; invNieuw.placeholder = 'naam…';
    const doeToevoegen = () => { const naam = invNieuw.value.trim(); if (!naam) return; verzameling.add(naam); invNieuw.value = ''; renderProefStaat(); renderProefGesprek(); };
    invNieuw.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); doeToevoegen(); } });
    toevoegen.appendChild(invNieuw);
    toevoegen.appendChild(knop('gt-mini', '+', doeToevoegen));
    doos.appendChild(toevoegen);
    return doos;
  }

  function renderProefGesprek() {
    const wrap = $('gt-proef-gesprek');
    wrap.innerHTML = '';
    const persoon = T.GESPREKKEN[huidigePersoonId];
    if (!persoon) return;
    if (!proefKnoopId) {
      wrap.appendChild(el('p', 'gt-proef-einde', '(gesprek gesloten — "Begin gesprek opnieuw" om verder te proberen)'));
      return;
    }
    if (!persoon.knopen[proefKnoopId]) {
      wrap.appendChild(el('p', 'gt-fout-tekst', `Knoop "${proefKnoopId}" bestaat niet (meer).`));
      return;
    }
    const knoop = persoon.knopen[proefKnoopId];
    const gewonnenRegel = T.eersteDiePast(proefS, huidigePersoonId, knoop.tekst);
    const resultaat = T.gesprekKnoop(proefS, huidigePersoonId, proefKnoopId);

    wrap.appendChild(el('div', 'gt-proef-naam', persoon.naam + ' — ' + proefKnoopId));
    wrap.appendChild(el('p', 'gt-proef-tekst', resultaat.tekst || '(geen regel is van toepassing — zie Controle)'));
    wrap.appendChild(el('div', 'gt-proef-reden', gewonnenRegel ? (gewonnenRegel.als ? 'wint door: ' + alsTekst(gewonnenRegel.als) : 'wint als vangnet (geen voorwaarde)') : ''));

    const keuzesEl = el('div', 'gt-proef-keuzes');
    resultaat.keuzes.forEach((keuze) => {
      keuzesEl.appendChild(knop(null, keuze.zeg + (keuze.sluit ? '  (sluit)' : ''), () => {
        T.doeGevolg(proefS, keuze.doe);
        if (keuze.sluit) { T.onthoudAfscheid(proefS, huidigePersoonId); proefKnoopId = null; }
        else proefKnoopId = keuze.naar;
        renderProefStaat(); renderProefGesprek(); renderFouten();
      }));
    });
    wrap.appendChild(keuzesEl);

    const verborgen = (knoop.keuzes || []).filter((k) => !resultaat.keuzes.includes(k));
    if (verborgen.length) {
      wrap.appendChild(el('div', 'gt-label', 'Nu verborgen:'));
      const lijst = el('ul', 'gt-proef-verborgen');
      verborgen.forEach((k) => lijst.appendChild(el('li', null, `${k.zeg} — pas zichtbaar bij ${alsTekst(k.als)}`)));
      wrap.appendChild(lijst);
    }
  }

  // ---------- render: personen, persoon-editor, boom, fouten ----------
  function renderPersonen() {
    const select = $('gt-persoon');
    select.innerHTML = '';
    Object.entries(T.GESPREKKEN).forEach(([id, p]) => {
      const o = document.createElement('option'); o.value = id; o.textContent = p.naam + ' (' + id + ')';
      if (id === huidigePersoonId) o.selected = true;
      select.appendChild(o);
    });
  }

  // De persoon is één regel bovenaan het script, geen formulier: wie het is, met welk portret en
  // waar hij begint. Meer valt er over een persoon niet te zeggen.
  function renderPersoonEditor() {
    const wrap = $('gt-persoon-editor');
    wrap.innerHTML = '';
    const persoon = T.GESPREKKEN[huidigePersoonId];
    if (!persoon) { wrap.appendChild(el('p', 'gt-leeg', 'Nog geen personen — maak er hierboven één.')); return; }
    const rij = el('div', 'gt-wie');

    const naamInv = document.createElement('input');
    naamInv.className = 'gt-wie-naam';
    naamInv.value = persoon.naam || '';
    naamInv.title = 'Zoals hij boven het gesprek staat';
    naamInv.addEventListener('input', () => { persoon.naam = naamInv.value; naVeldWijziging(); });
    rij.appendChild(naamInv);
    rij.appendChild(el('div', 'gt-vul'));

    rij.appendChild(el('span', 'gt-wie-bij', 'portret'));
    const portretInv = document.createElement('input');
    portretInv.className = 'gt-wie-klein';
    portretInv.value = persoon.portret || '';
    portretInv.placeholder = 'nog geen';
    portretInv.addEventListener('input', () => { persoon.portret = portretInv.value.trim() || undefined; naVeldWijziging(); });
    rij.appendChild(portretInv);

    rij.appendChild(el('span', 'gt-wie-bij', 'begint bij'));
    const startSelect = document.createElement('select');
    startSelect.className = 'gt-wie-klein';
    Object.keys(persoon.knopen).forEach((id) => { const o = document.createElement('option'); o.value = id; o.textContent = id; if (id === persoon.start) o.selected = true; startSelect.appendChild(o); });
    startSelect.addEventListener('change', () => { persoon.start = startSelect.value; herbouwAlles(); });
    rij.appendChild(startSelect);

    wrap.appendChild(rij);
  }

  // In welke volgorde lees je een gesprek? Vanaf de start, en dan wat je vanuit daar kunt
  // bereiken, in de volgorde waarin de antwoorden staan. Wat nergens vandaan te bereiken is,
  // komt onderaan — dat is bijna altijd een vergissing en hoort op te vallen.
  function leesVolgorde(persoon) {
    const uit = [];
    const gezien = new Set();
    const loop = (id) => {
      if (!id || gezien.has(id) || !persoon.knopen[id]) return;
      gezien.add(id);
      uit.push(id);
      for (const k of persoon.knopen[id].keuzes || []) loop(k.naar);
    };
    loop(persoon.start);
    const los = Object.keys(persoon.knopen).filter((id) => !gezien.has(id));
    return { uit, los };
  }

  // Waar komt iemand vandaan? Per knoop wie ernaar verwijst, zodat je terug kunt lopen.
  function komtVan(persoon) {
    const van = new Map();
    for (const [id, knoop] of Object.entries(persoon.knopen)) {
      for (const k of knoop.keuzes || []) {
        if (!k.naar) continue;
        if (!van.has(k.naar)) van.set(k.naar, []);
        if (!van.get(k.naar).includes(id)) van.get(k.naar).push(id);
      }
    }
    return van;
  }

  // Links: de knopen van dit gesprek als lijst, met hun eerste zin eronder. Geen uitgerolde boom
  // meer die zichzelf vijftien regels diep herhaalt — een lijst die je kunt overzien, en waarin
  // je ziet waar je bent.
  function renderBoom() {
    const wrap = $('gt-boom-inhoud');
    wrap.innerHTML = '';
    const persoon = T.GESPREKKEN[huidigePersoonId];
    if (!persoon) return;
    const { uit, los } = leesVolgorde(persoon);
    const van = komtVan(persoon);

    const maak = (id, isStart) => {
      const b = el('button', 'gt-knooprij', null);
      b.type = 'button';
      if (id === huidigeKnoopId) b.classList.add('gt-actief');
      if (id === proefKnoopId) b.classList.add('gt-proef-actief');
      const kop = el('div', 'gt-knooprij-kop', null);
      kop.appendChild(el('span', 'gt-knooprij-id', id));
      if (isStart) kop.appendChild(el('span', 'gt-knooprij-start', 'start'));
      const binnen = van.get(id);
      if (binnen && binnen.length) kop.appendChild(el('span', 'gt-knooprij-van', '← ' + binnen.join(', ')));
      b.appendChild(kop);
      const eerste = (persoon.knopen[id].tekst || []).find((r) => r.zeg);
      b.appendChild(el('div', 'gt-knooprij-zin', eerste ? eerste.zeg : '(nog niets gezegd)'));
      b.addEventListener('click', () => gaNaarKnoop(id));
      return b;
    };

    for (const id of uit) wrap.appendChild(maak(id, id === persoon.start));
    if (los.length) {
      wrap.appendChild(el('div', 'gt-label gt-fout-tekst', 'Hier komt niemand'));
      for (const id of los) wrap.appendChild(maak(id, false));
    }
  }

  // Naar een knoop toe: hem aanwijzen in de lijst en in het script erheen schuiven.
  function gaNaarKnoop(id) {
    huidigeKnoopId = id;
    renderBoom();
    const doel = document.getElementById('knoop-' + id);
    if (doel) {
      doel.scrollIntoView({ block: 'start', behavior: 'smooth' });
      doel.classList.add('gt-aangewezen');
      setTimeout(() => doel.classList.remove('gt-aangewezen'), 1200);
    }
  }

  function renderFouten() {
    const wrap = $('gt-fouten-inhoud');
    wrap.innerHTML = '';
    const meldingen = controleer();
    if (!meldingen.length) { wrap.appendChild(el('p', 'gt-schoon', 'Geen fouten of waarschuwingen gevonden.')); return; }
    const ul = el('ul', 'gt-melding-lijst');
    const label = { fout: 'FOUT', waarschuwing: 'LET OP', info: 'INFO' };
    meldingen.forEach((m) => {
      const li = document.createElement('li');
      const b = el('button', 'gt-melding-item ' + m.soort, null);
      b.type = 'button';
      const span = el('span', 'gt-melding-soort', label[m.soort] + ' ');
      b.appendChild(span);
      b.appendChild(document.createTextNode(m.tekst));
      b.addEventListener('click', () => {
        if (m.persoonId && m.persoonId !== huidigePersoonId) { huidigePersoonId = m.persoonId; nieuwProefgesprek(); renderPersonen(); renderPersoonEditor(); renderProefStaat(); renderProefGesprek(); }
        if (m.knoopId) { huidigeKnoopId = m.knoopId; herbouwKnoopEditor(); }
        renderBoom();
      });
      li.appendChild(b);
      ul.appendChild(li);
    });
    wrap.appendChild(ul);
  }

  // ---------- de knoop-editor: tekstregels en keuzes ----------
  function bouwAlsEditor(houder, naVerandering) {
    const wrap = el('div', 'gt-als');
    const rijen = el('div', 'gt-als-rijen');
    const plus = knop('gt-mini', '+ voorwaarde', () => {
      if (!houder.als) houder.als = {};
      const vrij = VOORWAARDEN.find((t) => houder.als[t.naam] === undefined);
      if (!vrij) return;
      houder.als[vrij.naam] = vrij.soort === 'getal' ? 0 : '';
      herbouw(); naVerandering(true);
    });
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
      const waarde = document.createElement('input');
      waarde.className = 'gt-als-waarde';
      waarde.type = type.soort === 'getal' ? 'number' : 'text';
      waarde.value = houder.als[naam];
      select.addEventListener('change', () => {
        const oud = houder.als[naam];
        delete houder.als[naam];
        const nieuwType = voorwaardeType(select.value);
        houder.als[select.value] = oud !== undefined && nieuwType.soort === type.soort ? oud : (nieuwType.soort === 'getal' ? 0 : '');
        herbouw(); naVerandering(true);
      });
      waarde.addEventListener('input', () => {
        houder.als[naam] = type.soort === 'getal' ? Number(waarde.value || 0) : waarde.value;
        naVerandering(false);
      });
      const verwijder = knop('gt-mini gt-mini-x', '✕', () => {
        delete houder.als[naam];
        if (Object.keys(houder.als).length === 0) delete houder.als;
        herbouw(); naVerandering(true);
      });
      rij.appendChild(select); rij.appendChild(waarde); rij.appendChild(verwijder);
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

  function bouwDoeEditor(keuze, naVerandering) {
    const wrap = el('div', 'gt-doe');
    const zetLabel = el('label', null, 'Zet vlag (komma-gescheiden)');
    const zetInv = document.createElement('input'); zetInv.type = 'text'; zetInv.value = alsLijst(keuze.doe && keuze.doe.zetVlag).join(', ');
    const wisLabel = el('label', null, 'Wis vlag (komma-gescheiden)');
    const wisInv = document.createElement('input'); wisInv.type = 'text'; wisInv.value = alsLijst(keuze.doe && keuze.doe.wisVlag).join(', ');
    function bijwerken() {
      const zet = ietsOfNiets(commaLijst(zetInv.value));
      const wis = ietsOfNiets(commaLijst(wisInv.value));
      if (zet === undefined && wis === undefined) delete keuze.doe;
      else keuze.doe = Object.assign({}, zet !== undefined && { zetVlag: zet }, wis !== undefined && { wisVlag: wis });
      naVerandering(false);
    }
    zetInv.addEventListener('input', bijwerken);
    wisInv.addEventListener('input', bijwerken);
    zetLabel.appendChild(zetInv); wisLabel.appendChild(wisInv);
    wrap.appendChild(zetLabel); wrap.appendChild(wisLabel);
    return wrap;
  }

  // ---------- het script: het gesprek zoals je het leest ----------
  //
  // Hier stond tot 22 sep één knoop per keer, als formulier: honderdzeven invoervelden in één
  // kolom, waarin de zin die iemand zegt even zwaar was opgemaakt als de voorwaarde eronder
  // (Marcel: "totaal onlogisch"). Nu staat het hele gesprek op één bladzijde, van start naar
  // beneden, en ziet een knoop eruit als een scène: wie wat zegt, en welke antwoorden je kunt
  // geven. De voorwaarde staat er klein achter in gewone taal en klapt pas open als je hem
  // aanraakt — het formulier is er nog, maar pas als je erom vraagt.

  // Een voorwaarde in gewone taal. Valt een veld hier niet onder, dan gewoon "naam: waarde";
  // zo groeit dit mee als er ooit een voorwaarde bijkomt zonder dat er iets stukgaat.
  const ALS_TAAL = {
    vlag: (v) => `als ${v}`,
    nietVlag: (v) => `zolang niet ${v}`,
    heeft: (v) => `als je ${v} hebt`,
    nietHeeft: (v) => `als je geen ${v} hebt`,
    ouderDan: (v) => `als je ouder bent dan ${v}`,
    jongerDan: (v) => `als je jonger bent dan ${v}`,
    ouderGewordenSinds: (v) => `als je ${v} maanden ouder werd sinds hij je zag`,
    quest: (v) => `als quest ${v}`,
    fase: (v) => `in fase ${v}`,
    weg: (v) => `via ${v}`,
    goud: (v) => `als je ${v} goud hebt`,
  };
  function alsInTaal(als) {
    if (!als) return '';
    return Object.entries(als).map(([naam, v]) => (ALS_TAAL[naam] ? ALS_TAAL[naam](v) : `${naam}: ${v}`)).join(' en ');
  }
  const DOE_TAAL = {
    zetVlag: (v) => `zet ${v}`,
    wisVlag: (v) => `wist ${v}`,
    geef: (v) => `geeft ${v}`,
    neem: (v) => `neemt ${v}`,
    goud: (v) => `${Number(v) < 0 ? '' : '+'}${v} goud`,
    quest: (v) => `quest ${v}`,
    fase: (v) => `naar fase ${v}`,
  };
  function doeInTaal(doe) {
    if (!doe) return '';
    return Object.entries(doe).map(([naam, v]) => (DOE_TAAL[naam] ? DOE_TAAL[naam](v) : `${naam}: ${v}`)).join(', ');
  }

  // Een chip die openklapt: dicht laat hij in gewone taal zien wat er staat, open staat het
  // formulier eronder. `maakInhoud` bouwt dat formulier pas als het nodig is.
  function klapChip(tekst, leegTekst, maakInhoud) {
    const doos = el('div', 'gt-chip-doos');
    const knopje = el('button', 'gt-chipje' + (tekst ? '' : ' gt-chipje-leeg'), tekst || leegTekst);
    knopje.type = 'button';
    // Een lange voorwaarde wordt afgeknipt met het hele verhaal in de tooltip: anders valt één
    // regel met drie voorwaarden over twee regels en staat het script scheef.
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

  function herbouwKnoopEditor() {
    const wrap = $('gt-knoop-editor');
    wrap.innerHTML = '';
    const persoon = T.GESPREKKEN[huidigePersoonId];
    if (!persoon) { wrap.appendChild(el('p', 'gt-leeg', 'Nog geen personen — maak er bovenaan één.')); return; }
    const { uit, los } = leesVolgorde(persoon);
    for (const id of uit) wrap.appendChild(bouwKnoop(persoon, id));
    if (los.length) {
      wrap.appendChild(el('div', 'gt-label gt-fout-tekst', 'Hier komt niemand — vanaf de start is dit niet te bereiken'));
      for (const id of los) wrap.appendChild(bouwKnoop(persoon, id));
    }
    wrap.appendChild(knop('gt-mini gt-nieuw-knoop', '+ knoop', nieuweKnoop));
  }

  function bouwKnoop(persoon, id) {
    const knoop = persoon.knopen[id];
    const doos = el('section', 'gt-knoop');
    doos.id = 'knoop-' + id;
    if (id === proefKnoopId) doos.classList.add('gt-proef-actief');

    // De kop: hoe hij heet, en wat je ermee kunt. Klein, want het gaat om wat eronder staat.
    const kop = el('div', 'gt-knoop-kop');
    const idInv = document.createElement('input');
    idInv.className = 'gt-knoop-id';
    idInv.value = id;
    idInv.title = 'De naam van deze knoop. Hernoemen past ook alle antwoorden aan die hiernaartoe wijzen.';
    idInv.addEventListener('keydown', (e) => { if (e.key === 'Enter') idInv.blur(); });
    idInv.addEventListener('blur', () => { huidigeKnoopId = id; hernoemKnoop(idInv); });
    kop.appendChild(idInv);
    if (id === persoon.start) kop.appendChild(el('span', 'gt-knooprij-start', 'start'));
    kop.appendChild(el('div', 'gt-vul'));
    kop.appendChild(klapChip(knoop._opmerking ? 'notitie' : '', '+ notitie', () => {
      const t = document.createElement('textarea');
      t.rows = 2;
      t.placeholder = 'Waarom deze knoop is zoals hij is. Komt als commentaar boven hem in het bestand te staan.';
      t.value = knoop._opmerking || '';
      t.addEventListener('input', () => { knoop._opmerking = t.value || undefined; naVeldWijziging(); });
      return t;
    }));
    kop.appendChild(knop('gt-mini gt-mini-x', '✕', () => { huidigeKnoopId = id; verwijderKnoop(id); }));
    doos.appendChild(kop);

    // Wat hij zegt. De eerste regel waarvan de voorwaarde klopt, wint — dat is hier te zien in
    // plaats van dat het erboven staat uitgelegd: wat altijd geldt, staat zonder chip.
    const zegt = el('div', 'gt-zegt');
    (knoop.tekst || []).forEach((regel, i) => zegt.appendChild(bouwZin(persoon, knoop, knoop.tekst, i, false)));
    zegt.appendChild(knop('gt-mini gt-erbij', '+ regel', () => {
      knoop.tekst = knoop.tekst || [];
      knoop.tekst.push({ zeg: '' });
      naDataStructuurWijziging();
    }));
    doos.appendChild(zegt);

    // En wat jij kunt antwoorden.
    const antwoorden = el('div', 'gt-antwoorden');
    (knoop.keuzes || []).forEach((keuze, i) => antwoorden.appendChild(bouwZin(persoon, knoop, knoop.keuzes, i, true)));
    antwoorden.appendChild(knop('gt-mini gt-erbij', '+ antwoord', () => {
      knoop.keuzes = knoop.keuzes || [];
      knoop.keuzes.push({ zeg: '', sluit: true });
      naDataStructuurWijziging();
    }));
    doos.appendChild(antwoorden);
    return doos;
  }

  // Eén regel in het script: een zin van hem, of een antwoord van jou. Ze zien er bijna hetzelfde
  // uit, want ze zijn allebei tekst; een antwoord heeft er een pijl voor en zegt waar hij heen gaat.
  function bouwZin(persoon, knoop, lijst, i, isAntwoord) {
    const item = lijst[i];
    const rij = el('div', 'gt-scriptregel' + (isAntwoord ? ' gt-antwoord' : ''));
    if (isAntwoord) rij.appendChild(el('span', 'gt-pijl', '→'));
    rij.appendChild(zinVeld(item.zeg, isAntwoord ? 'wat jij zegt' : 'wat hij zegt', (v) => { item.zeg = v; naVeldWijziging(); }));

    const achter = el('div', 'gt-achter');
    if (isAntwoord) {
      // Waar dit antwoord heen gaat, als link: zo loop je door het gesprek zoals een speler.
      const naar = el('span', 'gt-naar-doel');
      const bouwNaar = () => {
        naar.innerHTML = '';
        if (item.sluit || !item.naar) {
          naar.appendChild(el('span', 'gt-sluit', 'sluit'));
        } else {
          const link = el('button', 'gt-sprong', item.naar + ' ↗');
          link.type = 'button';
          link.title = 'Ga naar deze knoop';
          link.addEventListener('click', () => gaNaarKnoop(item.naar));
          naar.appendChild(link);
        }
        const kies = document.createElement('select');
        kies.className = 'gt-naar-kies';
        kies.title = 'Waar dit antwoord heen gaat';
        const sluitOptie = document.createElement('option');
        sluitOptie.value = '__sluit__';
        sluitOptie.textContent = 'sluit gesprek';
        kies.appendChild(sluitOptie);
        Object.keys(persoon.knopen).forEach((id) => { const o = document.createElement('option'); o.value = id; o.textContent = 'naar ' + id; kies.appendChild(o); });
        kies.value = item.sluit || !item.naar ? '__sluit__' : item.naar;
        kies.addEventListener('change', () => {
          if (kies.value === '__sluit__') { item.sluit = true; delete item.naar; }
          else { item.naar = kies.value; delete item.sluit; }
          naDataStructuurWijziging();
        });
        naar.appendChild(kies);
      };
      bouwNaar();
      achter.appendChild(naar);
    }

    achter.appendChild(klapChip(alsInTaal(item.als), 'altijd', () =>
      bouwAlsEditor(item, (structureel) => { if (structureel) naDataStructuurWijziging(); else naVeldWijziging(); })));
    if (isAntwoord) {
      achter.appendChild(klapChip(doeInTaal(item.doe), '+ gevolg', () => bouwDoeEditor(item, () => naVeldWijziging())));
    }
    achter.appendChild(bouwVerplaatsKnoppen(lijst, i));
    rij.appendChild(achter);
    return rij;
  }

  function bouwVerplaatsKnoppen(lijst, i) {
    const doos = el('div', 'gt-regelknoppen');
    const omhoog = knop('gt-mini', '↑', () => { if (i === 0) return; [lijst[i - 1], lijst[i]] = [lijst[i], lijst[i - 1]]; herbouwKnoopEditor(); naDataStructuurWijziging(); });
    omhoog.disabled = i === 0;
    const omlaag = knop('gt-mini', '↓', () => { if (i === lijst.length - 1) return; [lijst[i + 1], lijst[i]] = [lijst[i], lijst[i + 1]]; herbouwKnoopEditor(); naDataStructuurWijziging(); });
    omlaag.disabled = i === lijst.length - 1;
    const verwijder = knop('gt-mini gt-mini-x', '✕', () => { lijst.splice(i, 1); herbouwKnoopEditor(); naDataStructuurWijziging(); });
    doos.appendChild(omhoog); doos.appendChild(omlaag); doos.appendChild(verwijder);
    return doos;
  }

  function hernoemKnoop(idInv) {
    const persoon = T.GESPREKKEN[huidigePersoonId];
    const nieuw = idInv.value.trim();
    const oud = huidigeKnoopId;
    if (nieuw === oud) return;
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(nieuw)) { alert('Een knoop-id mag alleen letters, cijfers en _ bevatten, en niet met een cijfer beginnen.'); idInv.value = oud; return; }
    if (persoon.knopen[nieuw]) { alert(`Knoop "${nieuw}" bestaat al bij ${persoon.naam}.`); idInv.value = oud; return; }
    persoon.knopen[nieuw] = persoon.knopen[oud];
    delete persoon.knopen[oud];
    if (persoon.start === oud) persoon.start = nieuw;
    Object.values(persoon.knopen).forEach((k) => (k.keuzes || []).forEach((keuze) => { if (keuze.naar === oud) keuze.naar = nieuw; }));
    if (proefKnoopId === oud) proefKnoopId = nieuw;
    huidigeKnoopId = nieuw;
    herbouwAlles();
  }

  function verwijderKnoop(id) {
    const persoon = T.GESPREKKEN[huidigePersoonId];
    if (id === persoon.start) { alert('Dit is de startknoop; kies eerst een andere startknoop bij "Persoon".'); return; }
    const verwijzingen = [];
    Object.entries(persoon.knopen).forEach(([kid, k]) => (k.keuzes || []).forEach((keuze) => { if (keuze.naar === id) verwijzingen.push(kid); }));
    const melding = verwijzingen.length ? `Knoop "${id}" wordt nog genoemd vanuit: ${verwijzingen.join(', ')}. ` : '';
    if (!confirm(`${melding}Knoop "${id}" verwijderen?`)) return;
    delete persoon.knopen[id];
    if (huidigeKnoopId === id) huidigeKnoopId = persoon.start;
    if (proefKnoopId === id) proefKnoopId = persoon.start;
    herbouwAlles();
  }

  function nieuwPersoon() {
    const naam = prompt('Naam van de nieuwe persoon:');
    if (!naam || !naam.trim()) return;
    const id = vrijeId(naam.trim().toLowerCase().replace(/[^a-z0-9]+/g, '') || 'persoon', (n) => !T.GESPREKKEN[n]);
    T.GESPREKKEN[id] = { naam: naam.trim(), start: 'welkom', knopen: { welkom: { tekst: [{ zeg: '' }], keuzes: [] } } };
    huidigePersoonId = id;
    huidigeKnoopId = 'welkom';
    nieuwProefgesprek();
    herbouwAlles();
  }

  function nieuweKnoop() {
    const persoon = T.GESPREKKEN[huidigePersoonId];
    if (!persoon) return;
    const id = vrijeId('knoop', (n) => !persoon.knopen[n]);
    persoon.knopen[id] = { tekst: [{ zeg: '' }], keuzes: [] };
    huidigeKnoopId = id;
    herbouwAlles();
  }

  // ---------- verversen: wat wordt herbouwd na welk soort wijziging ----------
  // Typen in een tekstveld herbouwt nooit het paneel waar dat veld zelf in staat (anders springt
  // de cursor weg); alleen de andere panelen. Een structurele wijziging (regel toevoegen/
  // verwijderen/verplaatsen, ander doel, ander voorwaarde-type) herbouwt ook de knoop-editor zelf.
  function naVeldWijziging() {
    vuil = true;
    renderBoom();
    renderProefStaat();
    renderProefGesprek();
    renderFouten();
    updateStatus();
  }
  function naDataStructuurWijziging() {
    herbouwKnoopEditor();
    naVeldWijziging();
  }
  function naProefVeldWijziging() {
    renderProefGesprek();
    renderFouten();
  }
  function herbouwAlles() {
    renderPersonen();
    renderPersoonEditor();
    renderBoom();
    herbouwKnoopEditor();
    renderProefStaat();
    renderProefGesprek();
    renderFouten();
    vuil = true;
    updateStatus();
  }
  function updateStatus() {
    $('gt-status').textContent = vuil ? 'niet-opgeslagen wijzigingen' : $('gt-status').dataset.opgeslagen || '';
  }

  // ---------- opslaan: T.GESPREKKEN teruglezen naar leesbare code, kop-commentaar intact ----------
  function str(s) {
    s = String(s);
    if (!/['\\\n\r]/.test(s)) return "'" + s + "'";
    return JSON.stringify(s);
  }
  function serAls(als) {
    const delen = VOORWAARDEN.filter((t) => als[t.naam] !== undefined).map((t) => `${t.naam}: ${t.soort === 'getal' ? Number(als[t.naam]) : str(als[t.naam])}`);
    return `{ ${delen.join(', ')} }`;
  }
  function serDoe(doe) {
    const delen = [];
    if (doe.zetVlag !== undefined) delen.push(`zetVlag: ${Array.isArray(doe.zetVlag) ? '[' + doe.zetVlag.map(str).join(', ') + ']' : str(doe.zetVlag)}`);
    if (doe.wisVlag !== undefined) delen.push(`wisVlag: ${Array.isArray(doe.wisVlag) ? '[' + doe.wisVlag.map(str).join(', ') + ']' : str(doe.wisVlag)}`);
    return `{ ${delen.join(', ')} }`;
  }
  function serRegel(r) {
    const delen = [];
    if (r.als) delen.push(`als: ${serAls(r.als)}`);
    delen.push(`zeg: ${str(r.zeg || '')}`);
    return `{ ${delen.join(', ')} }`;
  }
  function serKeuze(k) {
    const delen = [`zeg: ${str(k.zeg || '')}`];
    if (k.sluit) delen.push('sluit: true'); else delen.push(`naar: ${str(k.naar)}`);
    if (k.als) delen.push(`als: ${serAls(k.als)}`);
    if (k.doe) delen.push(`doe: ${serDoe(k.doe)}`);
    return `{ ${delen.join(', ')} }`;
  }
  function opmComment(opmerking, sp) {
    if (!opmerking) return '';
    return opmerking.split('\n').map((r) => (sp + '// ' + r).replace(/ +$/, '')).join('\n') + '\n';
  }
  // Een rij regels of antwoorden, elk met zijn eigen opmerking erboven als hij er een heeft.
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
    let out = opmComment(p._opmerking, sp);
    out += `${sp}${id}: {\n`;
    out += `${sp2}naam: ${str(p.naam)},\n`;
    if (p.portret) out += `${sp2}portret: ${str(p.portret)},\n`;
    out += `${sp2}start: ${str(p.start)},\n`;
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
      statusEl.textContent = 'Niet opgeslagen: js/gesprekken.js was niet te lezen, en dan schrijven we liever niets.';
      return;
    }
    statusEl.textContent = 'Opslaan…';
    try {
      const resp = await fetch('/gereedschap/api/gesprekken-opslaan', { method: 'POST', headers: { 'Content-Type': 'text/plain; charset=utf-8' }, body: inhoud });
      if (!resp.ok) throw new Error(await resp.text());
      vuil = false;
      const tijd = 'opgeslagen om ' + new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
      statusEl.dataset.opgeslagen = tijd;
      statusEl.textContent = tijd;
    } catch (fout) {
      statusEl.textContent = 'Opslaan mislukt: ' + fout.message;
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
    huidigeKnoopId = huidigePersoonId ? T.GESPREKKEN[huidigePersoonId].start : null;
    nieuwProefgesprek();
    herbouwAlles();
    vuil = false;
    updateStatus();

    $('gt-persoon').addEventListener('change', (e) => { huidigePersoonId = e.target.value; huidigeKnoopId = T.GESPREKKEN[huidigePersoonId].start; nieuwProefgesprek(); herbouwAlles(); vuil = false; updateStatus(); });
    $('gt-nieuw-persoon').addEventListener('click', nieuwPersoon);
    $('gt-nieuwe-knoop').addEventListener('click', nieuweKnoop);
    $('gt-opslaan').addEventListener('click', opslaan);
    window.addEventListener('beforeunload', (e) => { if (vuil) { e.preventDefault(); e.returnValue = ''; } });
  }

  // De bewerker is ook van gereedschap/wereld.html: klik daar een poppetje en zijn gesprek staat
  // in hetzelfde scherm. Er is geen tweede bewerker — dit is hem, en die bladzijde levert alleen
  // dezelfde gt-*-elementen aan. Vandaar dat dit bestand zichzelf niet meer start: de bladzijde
  // die hem gebruikt, zegt wanneer.
  let gestart = false;
  T.gesprekkenTool = {
    // Eén keer opstarten (bron inlezen, voorwaarden afleiden); daarna alleen opnieuw tekenen.
    async start() {
      if (gestart) {
        herbouwAlles();
        vuil = false;
        updateStatus();
        return;
      }
      gestart = true;
      await init();
    },
    // Naar één persoon springen. Geeft false als die nog geen gesprek heeft, zodat de aanroeper
    // kan vragen of er een moet komen.
    kies(persoonId) {
      if (!T.GESPREKKEN[persoonId]) return false;
      huidigePersoonId = persoonId;
      huidigeKnoopId = T.GESPREKKEN[persoonId].start;
      nieuwProefgesprek();
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
      huidigeKnoopId = 'welkom';
      nieuwProefgesprek();
      herbouwAlles();
      return true;
    },
    heeft: (persoonId) => !!T.GESPREKKEN[persoonId],
    isVuil: () => vuil,
  };
})();
