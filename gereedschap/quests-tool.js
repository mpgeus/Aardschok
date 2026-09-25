// Het scherm van het quest-gereedschap. De regels komen rechtstreeks uit ../js/quest.js
// (T.keurQuests, T.voorwaardeGeldt, T.gesprekKnoop) op T.QUESTS uit ../js/quests.js — dit bestand
// kent geen eigen kopie daarvan, ook niet in het proefdorp. Hier staat alleen hoe dat in een
// scherm komt: de boom van fasen en wegen, de formulieren, het proefdorp en de controlelijst.
//
// Waarom het een eigen bladzijde is en geen tabblad in gesprekken.html: dat gereedschap is één
// afgesloten geheel van 800 regels, en er doorheen opereren kost meer dan het oplevert. De eis
// uit ontwerp/verhaal.md — "alles op één plek, niet drie bestanden die je bij elkaar zoekt" —
// wordt hier gehaald vanuit de quest gezien: deze bladzijde toont de quest, wat iedereen in het
// dorp per fase zegt, en waar de dingen in Tiled liggen. Bovenin staan de twee aan elkaar
// geknoopt.
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
  function veld(soort, waarde, opVerandering) {
    const i = el('input');
    i.type = soort;
    i.value = waarde == null ? '' : waarde;
    i.addEventListener('input', () => opVerandering(i.value));
    return i;
  }
  function kiesUit(opties, waarde, opVerandering) {
    const s = el('select');
    for (const o of opties) {
      const op = el('option', null, typeof o === 'string' ? o : o.tekst);
      op.value = typeof o === 'string' ? o : o.waarde;
      s.appendChild(op);
    }
    s.value = waarde == null ? '' : waarde;
    s.addEventListener('change', () => opVerandering(s.value));
    return s;
  }
  function rij(label, ...inhoud) {
    const d = el('div', 'gt-proef-rij');
    d.appendChild(el('span', 'gt-label', label));
    for (const i of inhoud) d.appendChild(i);
    return d;
  }
  const lijst = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
  const commaLijst = (tekst) => tekst.split(',').map((s) => s.trim()).filter(Boolean);
  const ietsOfNiets = (l) => (l.length === 0 ? undefined : l.length === 1 ? l[0] : l);
  function vrijeId(basis, isVrij) {
    if (isVrij(basis)) return basis;
    for (let n = 2; ; n++) if (isVrij(basis + n)) return basis + n;
  }

  // ---------- toestand van het gereedschap zelf ----------
  let questId = null;
  let keuze = { soort: 'quest' }; // { soort: 'quest' | 'fase' | 'weg', fase, weg }
  let vuil = false;
  let RUWE_KOP = '';
  let RUWE_STAART = '';
  let BRON_GELEZEN = false;
  let VERLOREN_OPMERKINGEN = [];
  let VOORWAARDEN = []; // afgeleid uit het kop-commentaar van gesprekken.js
  let OPRAAPBAAR = []; // wat je in de wereld kunt oprapen (uit verkennen.js)

  // Het proefdorp: welke fase, welke weg, en wat de speler toevallig bij zich heeft.
  const proef = { fase: null, weg: null, goud: 0, tas: new Set(), vlaggen: new Set() };

  // ---------- vormen om mee te beginnen ----------
  // "Kies een vorm en je hebt een werkend geraamte" (ontwerp/verhaal.md). Elke vorm levert
  // meteen iets op dat de toets van drie antwoorden haalt: drie wegen die niet hetzelfde kosten.
  // Dat is geen versiering — het is de regel die anders pas opvalt als de quest al af is.
  const VORMEN = {
    'Haal iets': () => ({
      naam: 'Nieuwe quest', gever: '', begin: 'zoeken',
      fasen: {
        zoeken: {
          doel: 'Zoek het ding.',
          wegen: {
            zelf: { kost: 'risico', naar: 'terug', klaarAls: { heeft: 'ding' } },
            kopen: { kost: 'goud', naar: 'terug', doe: { goud: -10, geef: 'ding' } },
            vragen: { kost: 'gunst', naar: 'terug', doe: { geef: 'ding' } },
          },
        },
        terug: { doel: 'Breng het terug.', wegen: { afgeven: { kost: 'niets', naar: 'klaar', doe: { neem: 'ding' } } } },
        klaar: { eind: true, melding: 'Het is gelukt.', beloning: { goud: 10 } },
      },
    }),
    'Ruim iets op': () => ({
      naam: 'Nieuwe quest', gever: '', begin: 'erheen',
      fasen: {
        erheen: {
          doel: 'Doe iets aan wat daar zit.',
          wegen: {
            vechten: { kost: 'jaren', naar: 'klaar', klaarAls: { vlag: 'hetIsWeg' } },
            weglokken: { kost: 'risico', naar: 'klaar', klaarAls: { vlag: 'hetIsWeg' } },
            iemandVragen: { kost: 'goud', naar: 'klaar', doe: { goud: -10, zetVlag: 'hetIsWeg' } },
          },
        },
        klaar: { eind: true, melding: 'Het is weg.', beloning: { goud: 15 } },
      },
    }),
    'Maak een keuze': () => ({
      naam: 'Nieuwe quest', gever: '', begin: 'kiezen',
      fasen: {
        kiezen: {
          doel: 'Kies wie je helpt.',
          wegen: {
            deEen: { kost: 'gunst', naar: 'geholpenEen' },
            deAnder: { kost: 'gunst', naar: 'geholpenAnder' },
            geenVanBeiden: { kost: 'niets', naar: 'niemand' },
            omkopen: { kost: 'goud', naar: 'geholpenEen', doe: { goud: -20 } },
            dwingen: { kost: 'jaren', naar: 'geholpenAnder' },
          },
        },
        geholpenEen: { eind: true, beloning: { vlag: 'deEenGeholpen' } },
        geholpenAnder: { eind: true, beloning: { vlag: 'deAnderGeholpen' } },
        niemand: { eind: true, beloning: { vlag: 'niemandGeholpen' } },
      },
    }),
  };

  // ---------- afleiden uit de spelbestanden, zodat lijsten maar op één plek staan ----------
  // De voorwaarden komen uit het kop-commentaar van gesprekken.js (dezelfde bron als het
  // gesprekken-gereedschap), zodat dit scherm vanzelf meegroeit als er ooit een voorwaarde bijkomt.
  function leidVoorwaardenAf(bron) {
    const uit = [];
    for (const regel of bron.split('\n')) {
      const m = regel.match(/^\/\/\s{3}(\w+):\s+(\S+)\s+—/);
      if (!m) continue;
      const soort = /^-?\d+$/.test(m[2]) ? 'getal' : 'tekst';
      if (!uit.some((v) => v.naam === m[1])) uit.push({ naam: m[1], soort });
    }
    // fase en weg staan in dat commentaar bij "quest" uitgelegd en niet op een eigen regel,
    // maar in een voorwaarde zijn het gewone velden.
    for (const naam of ['fase', 'weg']) if (!uit.some((v) => v.naam === naam)) uit.push({ naam, soort: 'tekst' });
    VOORWAARDEN = uit;
  }
  // Wat er in de wereld op te rapen valt (OPRAPEN in verkennen.js). Daarmee kan de controle
  // zeggen: "je wacht op iets wat niemand je kan geven".
  function leidOpraapbaarAf(bron) {
    const blok = bron.match(/const OPRAPEN = \{([\s\S]*?)\n  \};/);
    OPRAAPBAAR = blok ? [...blok[1].matchAll(/^\s{4}(\w+):/gm)].map((m) => m[1]) : [];
  }

  // ---------- kop-commentaar en losse opmerkingen bewaren ----------
  // Alles vóór "(function (T) {" is het kop-commentaar (de uitleg van de vorm) en blijft staan.
  // Een opmerking vlak boven een quest, een fase of een weg hoort daarbij en komt
  // bij het opslaan terug als "_opmerking" op dat object. Zonder dit zou één keer opslaan alle
  // uitleg tússen de gegevens opeten, en juist daar staat waaróm een weg is wat hij is.
  function verwerkRuweBron(tekst) {
    // Alleen het blok dat deze bewerker kent wordt opnieuw geschreven; alles ervoor en erna gaat
    // letterlijk mee terug (gereedschap/bronblok.js). Dat is niet netjes-doen maar noodzaak: de
    // gespreksbewerker wiste zo ooit het hele draaiboek van de tutorial, omdat het onder
    // T.GESPREKKEN in hetzelfde bestand stond. (Tot 25 sep kende deze bewerker er twee: ook
    // T.RAAKPUNTEN, een spreuk op een ding; die gingen weg met de spreuken.)
    const q = T.bronBlok(tekst, 'T.QUESTS');
    if (q) {
      RUWE_KOP = q.kop;
      RUWE_STAART = q.staart;
      BRON_GELEZEN = true;
    } else {
      BRON_GELEZEN = false;
    }
    const merker = '(function (T) {';
    const i = tekst.indexOf(merker);
    if (i === -1) return;
    const regels = tekst.slice(i).replace(/\r\n/g, '\n').split('\n');
    let buffer = [];
    let waar = null; // zitten we al in T.QUESTS?
    let qId = null;
    let fId = null;
    const leg = (doel) => {
      if (!buffer.length) return;
      if (doel) doel._opmerking = buffer.join('\n');
      else VERLOREN_OPMERKINGEN.push(buffer.join('\n'));
    };
    for (const regel of regels) {
      const commentaar = regel.match(/^\s*\/\/ ?(.*)$/);
      if (commentaar) { buffer.push(commentaar[1]); continue; }
      if (/T\.QUESTS\s*=/.test(regel)) {
        waar = 'quests';
        leg(null);
        buffer = [];
        continue;
      }
      // vier spaties: een quest; acht: een fase; twaalf: een weg. Dezelfde
      // inspringing als de serialisatie hieronder maakt, dus die twee blijven op elkaar passen.
      const een = regel.match(/^ {4}(\w+): \{/);
      const twee = regel.match(/^ {8}(\w+): \{/);
      const drie = regel.match(/^ {12}(\w+): \{/);
      if (een) {
        qId = een[1];
        fId = null;
        leg(waar === 'quests' ? T.QUESTS[qId] : null);
      } else if (twee && waar === 'quests' && T.QUESTS[qId]) {
        fId = T.QUESTS[qId].fasen[twee[1]] ? twee[1] : null;
        leg(fId ? T.QUESTS[qId].fasen[fId] : null);
      } else if (drie && waar === 'quests' && fId && T.QUESTS[qId]) {
        leg((T.QUESTS[qId].fasen[fId].wegen || {})[drie[1]]);
      } else {
        leg(null);
      }
      buffer = [];
    }
  }
  function renderOpmerkingMelding() {
    const doos = $('qt-opmerking-melding');
    if (!doos) return;
    if (!VERLOREN_OPMERKINGEN.length) { doos.classList.add('verborgen'); return; }
    doos.classList.remove('verborgen');
    doos.textContent = `Let op: js/quests.js bevat ${VERLOREN_OPMERKINGEN.length} opmerking(en) die dit gereedschap niet bij een quest, fase of weg kan plaatsen. Bij het opslaan gaan die verloren. Voorbeeld: "${VERLOREN_OPMERKINGEN[0].slice(0, 90)}${VERLOREN_OPMERKINGEN[0].length > 90 ? '…' : ''}"`;
  }

  const quest = () => T.QUESTS[questId] || null;
  const fasen = () => Object.keys(quest() ? quest().fasen : {});
  const personen = () => Object.keys(T.GESPREKKEN);

  // ---------- de wereld erbij: wat hangt er in Tiled aan deze quest? ----------
  // js/kaart.js leest quest="bakker:zoeken" van een object. Hier zoeken we
  // dezelfde eigenschappen op in de ruwe Tiled-gegevens, zodat het gereedschap kan zeggen waar
  // een ding ligt — en kan klagen als het nergens ligt.
  function wereldHaakjes() {
    const uit = [];
    for (const [kaartNaam, kaart] of Object.entries(T.KAARTEN || {})) {
      const th = kaart.tileheight || 32;
      for (const laag of kaart.layers || []) {
        if (laag.type !== 'objectgroup') continue;
        for (const obj of laag.objects || []) {
          const eig = {};
          for (const p of obj.properties || []) eig[p.name] = p.value;
          if (eig.quest === undefined) continue;
          uit.push({
            kaart: kaartNaam, naam: obj.name || '(naamloos)',
            x: Math.round(obj.x / th), y: Math.round(obj.y / th),
            grendel: T.questGrendel(String(eig.quest)),
          });
        }
      }
    }
    return uit;
  }

  // Alles wat een voorwerp of een vlag in het spel kan zetten. Gebruikt door de controle.
  function bronnenVan(soort) {
    const uit = new Set();
    const pak = (doe) => {
      if (!doe) return;
      if (soort === 'vlag') lijst(doe.zetVlag).forEach((n) => uit.add(n));
      else lijst(doe.geef).forEach((n) => uit.add(n));
    };
    for (const p of Object.values(T.GESPREKKEN)) {
      for (const k of Object.values(p.knopen)) (k.keuzes || []).forEach((c) => pak(c.doe));
    }
    for (const q of Object.values(T.QUESTS)) {
      for (const f of Object.values(q.fasen || {})) {
        if (f.beloning) pak({ zetVlag: f.beloning.vlag, geef: f.beloning.geef });
        for (const w of Object.values(f.wegen || {})) pak(w.doe);
      }
    }
    if (soort !== 'vlag') {
      OPRAAPBAAR.forEach((n) => uit.add(n));
      for (const h of wereldHaakjes()) uit.add(h.naam);
    }
    return uit;
  }

  // ---------- controle die meedenkt ----------
  function controleer() {
    const uit = [];
    const fout = (tekst) => uit.push({ soort: 'fout', tekst });
    const let_op = (tekst) => uit.push({ soort: 'let op', tekst });
    const q = quest();
    if (!q) return uit;

    // 1. de regels uit het spel zelf: de toets van drie antwoorden, en de gewone gaten.
    for (const klacht of T.keurQuests({ [questId]: q })) fout(klacht.replace(questId + ': ', ''));

    // 2. wie begint hem? Een quest die in geen enkel gesprek voorkomt, is niet te beginnen.
    const gevolgen = [];
    for (const [pid, p] of Object.entries(T.GESPREKKEN)) {
      for (const k of Object.values(p.knopen)) {
        for (const c of k.keuzes || []) if (c.doe && c.doe.quest === questId) gevolgen.push({ pid, doe: c.doe });
      }
    }
    if (!gevolgen.some((g) => !g.doe.weg && (!g.doe.fase || g.doe.fase === q.begin))) {
      fout(`geen enkel antwoord begint deze quest (doe: { quest: '${questId}' })`);
    }
    if (q.gever && !T.GESPREKKEN[q.gever]) fout(`de gever "${q.gever}" heeft geen gesprek`);
    if (!q.gever) let_op('geen gever ingevuld');

    // 3. een weg zonder klaarAls die geen enkel antwoord neemt, bestaat alleen op papier.
    const vlaggen = bronnenVan('vlag');
    const dingen = bronnenVan('ding');
    for (const [fid, f] of Object.entries(q.fasen)) {
      for (const [wid, w] of Object.entries(f.wegen || {})) {
        const genomen = gevolgen.some((g) => g.doe.weg === wid);
        if (!w.klaarAls && !genomen) fout(`weg "${fid}/${wid}" heeft geen klaarAls en wordt door geen enkel antwoord genomen`);
        // 4. wacht die weg op iets wat nergens vandaan komt?
        const a = w.klaarAls || {};
        if (a.heeft && !dingen.has(a.heeft)) fout(`weg "${fid}/${wid}" wacht op "${a.heeft}", en niets in de wereld of in een gesprek geeft dat`);
        if (a.vlag && !vlaggen.has(a.vlag)) fout(`weg "${fid}/${wid}" wacht op de vlag "${a.vlag}", en niets zet die`);
      }
      if (f.beloning && f.beloning.goud === 0) let_op(`fase "${fid}" heeft een beloning van nul goud`);
    }

    // 5. wat in Tiled aan deze quest hangt: bestaat de fase die het noemt?
    const haakjes = wereldHaakjes();
    for (const h of haakjes) {
      if (h.grendel && h.grendel.quest === questId) {
        for (const f of h.grendel.fase || []) if (!q.fasen[f]) fout(`${h.kaart} (${h.x}, ${h.y}): "${h.naam}" hangt aan fase "${f}", en die bestaat niet`);
      }
    }
    return uit;
  }

  // ---------- het proefdorp: zet de quest halverwege en zie wat iedereen zegt ----------
  function proefStaat(metQuest) {
    // Met de hand neergezet en niet via T.zetQuest: dat zou een beloning uitkeren, en een proef
    // hoort niets te veranderen.
    const S = {
      held: {},
      inventaris: new Set(proef.tas), vlaggen: new Set(proef.vlaggen),
      goud: proef.goud, quests: {}, questWeg: {}, questBeloond: new Set(),
    };
    if (metQuest && proef.fase) {
      S.quests[questId] = proef.fase;
      if (proef.weg) S.questWeg[questId] = proef.weg;
    }
    return S;
  }

  function renderProefStaat() {
    const wrap = $('qt-proef-staat');
    wrap.innerHTML = '';
    const q = quest();
    if (!q) return;
    wrap.appendChild(rij('Fase', kiesUit(
      [{ waarde: '', tekst: '— niet begonnen —' }, ...fasen()],
      proef.fase || '',
      (v) => { proef.fase = v || null; renderProefDorp(); },
    )));
    const wegen = proef.fase ? Object.keys(q.fasen[proef.fase].wegen || {}) : [];
    wrap.appendChild(rij('Weg genomen', kiesUit(
      [{ waarde: '', tekst: '— nog geen —' }, ...Object.keys(alleWegen())],
      proef.weg || '',
      (v) => { proef.weg = v || null; renderProefDorp(); },
    )));
    wrap.appendChild(rij('Goud', veld('number', proef.goud, (v) => { proef.goud = Number(v) || 0; renderProefDorp(); })));
    wrap.appendChild(rij('In de tas', veld('text', [...proef.tas].join(', '), (v) => { proef.tas = new Set(commaLijst(v)); renderProefDorp(); })));
    wrap.appendChild(rij('Vlaggen', veld('text', [...proef.vlaggen].join(', '), (v) => { proef.vlaggen = new Set(commaLijst(v)); renderProefDorp(); })));
    if (wegen.length) wrap.appendChild(el('p', 'gt-gedempt', 'Wegen uit deze fase: ' + wegen.join(', ')));
  }

  function alleWegen() {
    const q = quest();
    const uit = {};
    if (q) for (const f of Object.values(q.fasen)) for (const [wid, w] of Object.entries(f.wegen || {})) uit[wid] = w;
    return uit;
  }

  // Wat zegt iedereen in het dorp nu? En — het nuttigste — wie zegt iets ánders dan wanneer deze
  // quest niet zou lopen. Dat is precies wat je wilt zien als je een fase erbij schrijft.
  function renderProefDorp() {
    const wrap = $('qt-proef-dorp');
    wrap.innerHTML = '';
    const met = proefStaat(true);
    const zonder = proefStaat(false);
    for (const pid of personen()) {
      const p = T.GESPREKKEN[pid];
      const nu = T.gesprekKnoop(met, pid, p.start);
      const anders = T.gesprekKnoop(zonder, pid, p.start);
      const reageert = nu.tekst !== anders.tekst || nu.keuzes.length !== anders.keuzes.length;
      const blok = el('div', 'gt-proef-persoon' + (reageert ? ' gt-reageert' : ''));
      const kop = el('div', 'gt-proef-naam', p.naam);
      if (reageert) kop.appendChild(el('span', 'gt-merkt', 'merkt het'));
      blok.appendChild(kop);
      blok.appendChild(el('p', 'gt-proef-tekst', nu.tekst || '(geen regel die past)'));
      const ul = el('ul', 'gt-proef-keuzes');
      for (const k of nu.keuzes) ul.appendChild(el('li', null, k.zeg));
      if (nu.keuzes.length) blok.appendChild(ul);
      wrap.appendChild(blok);
    }
  }

  // ---------- de boom: quest, fasen, wegen ----------
  function renderBoom() {
    const wrap = $('qt-boom-inhoud');
    wrap.innerHTML = '';
    const q = quest();
    if (!q) { wrap.appendChild(el('p', 'gt-leeg', 'Nog geen quest. Maak er een met een vorm.')); return; }

    const questRij = knop('gt-boom-id' + (keuze.soort === 'quest' ? ' gt-actief' : ''), q.naam || questId,
      () => { keuze = { soort: 'quest' }; renderEditor(); renderBoom(); });
    wrap.appendChild(questRij);

    const ul = el('ul', 'gt-boom-lijst');
    for (const fid of fasen()) {
      const f = q.fasen[fid];
      const li = el('li');
      const etiket = fid + (fid === q.begin ? ' · begin' : '') + (f.eind ? ' · eind' : '');
      li.appendChild(knop('gt-boom-id' + (keuze.soort === 'fase' && keuze.fase === fid ? ' gt-actief' : ''), etiket,
        () => { keuze = { soort: 'fase', fase: fid }; proef.fase = fid; renderEditor(); renderBoom(); renderProefStaat(); renderProefDorp(); }));
      const wul = el('ul', 'gt-boom-lijst');
      for (const [wid, w] of Object.entries(f.wegen || {})) {
        const wli = el('li');
        const gekozen = keuze.soort === 'weg' && keuze.fase === fid && keuze.weg === wid;
        wli.appendChild(knop('gt-boom-id gt-boom-weg' + (gekozen ? ' gt-actief' : ''),
          `${wid} → ${w.naar}`,
          () => { keuze = { soort: 'weg', fase: fid, weg: wid }; proef.fase = fid; renderEditor(); renderBoom(); renderProefStaat(); renderProefDorp(); }));
        wli.appendChild(el('span', 'gt-kost gt-kost-' + (w.kost || 'onbekend'), w.kost || '?'));
        wul.appendChild(wli);
      }
      const plus = knop('gt-mini', '+ weg', () => nieuweWeg(fid));
      const wliPlus = el('li');
      wliPlus.appendChild(plus);
      wul.appendChild(wliPlus);
      li.appendChild(wul);
      ul.appendChild(li);
    }
    wrap.appendChild(ul);
  }

  // ---------- de formulieren ----------
  function bouwAlsEditor(houder, huidig, zet) {
    const rijen = el('div', 'gt-als-rijen');
    const teken = () => {
      rijen.innerHTML = '';
      for (const naam of Object.keys(huidig || {})) {
        const t = VOORWAARDEN.find((v) => v.naam === naam) || { naam, soort: 'tekst' };
        const r = el('div', 'gt-als-rij');
        r.appendChild(el('span', 'gt-als-titel', naam));
        r.appendChild(veld(t.soort === 'getal' ? 'number' : 'text', huidig[naam], (v) => {
          huidig[naam] = t.soort === 'getal' ? Number(v) : v;
          zet(huidig);
          naVeldWijziging();
        }));
        r.appendChild(knop('gt-mini', '×', () => { delete huidig[naam]; if (!Object.keys(huidig).length) zet(undefined); teken(); naStructuurWijziging(); }));
        rijen.appendChild(r);
      }
      const vrij = VOORWAARDEN.filter((v) => !(huidig && v.naam in huidig));
      if (vrij.length) {
        const kies = kiesUit([{ waarde: '', tekst: '+ voorwaarde…' }, ...vrij.map((v) => v.naam)], '', (naam) => {
          if (!naam) return;
          const nieuw = huidig || {};
          nieuw[naam] = VOORWAARDEN.find((v) => v.naam === naam).soort === 'getal' ? 0 : '';
          huidig = nieuw;
          zet(nieuw);
          teken();
          naStructuurWijziging();
        });
        rijen.appendChild(kies);
      }
    };
    teken();
    houder.appendChild(rijen);
  }

  // Een gevolg: wat het antwoord of de weg doet. De velden komen uit T.doeGevolg en
  // T.questGevolg; die twee zijn de enige die een gevolg uitvoeren.
  const DOE_VELDEN = [
    { naam: 'zetVlag', soort: 'lijst' }, { naam: 'wisVlag', soort: 'lijst' },
    { naam: 'geef', soort: 'lijst' }, { naam: 'neem', soort: 'lijst' },
    { naam: 'goud', soort: 'getal' },
  ];
  function bouwDoeEditor(houder, huidig, zet) {
    for (const v of DOE_VELDEN) {
      const waarde = huidig ? huidig[v.naam] : undefined;
      const invoer = veld(v.soort === 'getal' ? 'number' : 'text',
        v.soort === 'lijst' ? lijst(waarde).join(', ') : waarde == null ? '' : waarde,
        (tekst) => {
          const nieuw = huidig || {};
          if (v.soort === 'lijst') {
            const l = commaLijst(tekst);
            if (l.length) nieuw[v.naam] = ietsOfNiets(l); else delete nieuw[v.naam];
          } else if (tekst === '' || Number(tekst) === 0) delete nieuw[v.naam];
          else nieuw[v.naam] = Number(tekst);
          huidig = nieuw;
          zet(Object.keys(nieuw).length ? nieuw : undefined);
          naVeldWijziging();
        });
      houder.appendChild(rij(v.naam, invoer));
    }
  }

  function renderEditor() {
    const wrap = $('qt-editor');
    wrap.innerHTML = '';
    const q = quest();
    if (!q) { wrap.appendChild(el('p', 'gt-leeg', 'Nog geen quest.')); return; }

    if (keuze.soort === 'quest') {
      wrap.appendChild(el('h3', null, 'De quest'));
      wrap.appendChild(rij('Naam', veld('text', q.naam, (v) => { q.naam = v; naVeldWijziging(); })));
      wrap.appendChild(rij('Gever', kiesUit([{ waarde: '', tekst: '— kies —' }, ...personen()], q.gever || '', (v) => { q.gever = v; naVeldWijziging(); })));
      wrap.appendChild(rij('Begint in', kiesUit(fasen(), q.begin, (v) => { q.begin = v; naStructuurWijziging(); })));
      wereldPaneel(wrap);
      return;
    }

    const f = q.fasen[keuze.fase];
    if (!f) { wrap.appendChild(el('p', 'gt-leeg', 'Die fase bestaat niet meer.')); return; }

    if (keuze.soort === 'fase') {
      wrap.appendChild(el('h3', null, 'Fase · ' + keuze.fase));
      wrap.appendChild(rij('Naam', veld('text', keuze.fase, (v) => hernoemFase(keuze.fase, v))));
      wrap.appendChild(rij('Doel (linksboven)', veld('text', f.doel, (v) => { if (v) f.doel = v; else delete f.doel; naVeldWijziging(); })));
      wrap.appendChild(rij('Melding', veld('text', f.melding, (v) => { if (v) f.melding = v; else delete f.melding; naVeldWijziging(); })));
      const eind = el('input'); eind.type = 'checkbox'; eind.checked = !!f.eind;
      eind.addEventListener('change', () => { if (eind.checked) f.eind = true; else delete f.eind; naStructuurWijziging(); });
      wrap.appendChild(rij('Hier is de quest af', eind));

      wrap.appendChild(el('h3', null, 'Beloning'));
      const b = f.beloning || {};
      const zetB = () => { if (Object.keys(b).length) f.beloning = b; else delete f.beloning; naVeldWijziging(); };
      wrap.appendChild(rij('Goud', veld('number', b.goud, (v) => { if (Number(v)) b.goud = Number(v); else delete b.goud; zetB(); })));
      wrap.appendChild(rij('Geeft', veld('text', lijst(b.geef).join(', '), (v) => { const l = commaLijst(v); if (l.length) b.geef = ietsOfNiets(l); else delete b.geef; zetB(); })));
      wrap.appendChild(rij('Zet vlag', veld('text', lijst(b.vlag).join(', '), (v) => { const l = commaLijst(v); if (l.length) b.vlag = ietsOfNiets(l); else delete b.vlag; zetB(); })));
      wrap.appendChild(el('p', 'gt-gedempt', 'Een beloning wordt één keer uitgekeerd, ook als je later nog eens in deze fase komt.'));
      if (!f.eind) wrap.appendChild(knop('gt-mini', 'Deze fase verwijderen', () => verwijderFase(keuze.fase)));
      return;
    }

    const w = (f.wegen || {})[keuze.weg];
    if (!w) { wrap.appendChild(el('p', 'gt-leeg', 'Die weg bestaat niet meer.')); return; }
    wrap.appendChild(el('h3', null, `Weg · ${keuze.fase} / ${keuze.weg}`));
    wrap.appendChild(rij('Naam', veld('text', keuze.weg, (v) => hernoemWeg(keuze.fase, keuze.weg, v))));
    wrap.appendChild(rij('Kost', kiesUit(T.QUEST_KOSTEN, w.kost, (v) => { w.kost = v; naVeldWijziging(); })));
    wrap.appendChild(rij('Gaat naar', kiesUit(fasen(), w.naar, (v) => { w.naar = v; naVeldWijziging(); })));
    wrap.appendChild(el('p', 'gt-gedempt', '"niets" is voor een stap die geen keuze is (iets afgeven); die telt niet mee in de toets van drie antwoorden.'));

    wrap.appendChild(el('h3', null, 'Gaat vanzelf als (klaarAls)'));
    bouwAlsEditor(wrap, w.klaarAls, (v) => { if (v) w.klaarAls = v; else delete w.klaarAls; });
    wrap.appendChild(el('p', 'gt-gedempt', 'Zonder klaarAls loopt deze weg alleen via een gesprek: doe: { quest, weg }.'));

    wrap.appendChild(el('h3', null, 'En doet dan (doe)'));
    bouwDoeEditor(wrap, w.doe, (v) => { if (v) w.doe = v; else delete w.doe; });

    wrap.appendChild(knop('gt-mini', 'Deze weg verwijderen', () => verwijderWeg(keuze.fase, keuze.weg)));
    wieNeemtHem(wrap, keuze.weg);
  }

  // Welke antwoorden nemen deze weg? Dat is de brug naar het gesprekken-gereedschap.
  function wieNeemtHem(wrap, wegId) {
    const gevonden = [];
    for (const [pid, p] of Object.entries(T.GESPREKKEN)) {
      for (const [kid, k] of Object.entries(p.knopen)) {
        for (const c of k.keuzes || []) {
          if (c.doe && c.doe.quest === questId && c.doe.weg === wegId) gevonden.push(`${p.naam} · ${kid}: "${c.zeg}"`);
        }
      }
    }
    wrap.appendChild(el('h3', null, 'Wie neemt hem'));
    if (!gevonden.length) {
      wrap.appendChild(el('p', 'gt-gedempt', 'Nog geen enkel antwoord. Zet in een gesprek doe: { quest: \'' + questId + '\', weg: \'' + wegId + '\' }.'));
      return;
    }
    const ul = el('ul', 'gt-proef-keuzes');
    for (const g of gevonden) ul.appendChild(el('li', null, g));
    wrap.appendChild(ul);
  }

  // Waar liggen de dingen van deze quest? (ontwerp/verhaal.md: "de wereld erbij")
  function wereldPaneel(wrap) {
    wrap.appendChild(el('h3', null, 'In de wereld'));
    const mijn = wereldHaakjes().filter((h) => h.grendel && h.grendel.quest === questId);
    if (!mijn.length) {
      wrap.appendChild(el('p', 'gt-gedempt', 'Nog niets. Leg het neer in gereedschap/wereld.html: zet "Bewerken" aan, kies Voorwerp, en kies daar deze quest en de fase waarin het ding er moet liggen.'));
      return;
    }
    const ul = el('ul', 'gt-proef-keuzes');
    for (const h of mijn) {
      const wat = 'fase ' + (h.grendel.fase || ['(alle)']).join(', ');
      ul.appendChild(el('li', null, `${h.naam} — ${h.kaart} (${h.x}, ${h.y}) — ${wat}`));
    }
    wrap.appendChild(ul);
  }

  function renderFouten() {
    const wrap = $('qt-fouten');
    wrap.innerHTML = '';
    const lijstje = controleer();
    if (!lijstje.length) { wrap.appendChild(el('p', 'gt-schoon', 'Niets te melden. De toets van drie antwoorden is gehaald.')); return; }
    const ul = el('ul', 'gt-melding-lijst');
    for (const m of lijstje) {
      const li = el('li', 'gt-melding-item');
      li.appendChild(el('span', 'gt-melding-soort', m.soort));
      li.appendChild(el('span', 'gt-fout-tekst', m.tekst));
      ul.appendChild(li);
    }
    wrap.appendChild(ul);
  }

  // ---------- veranderen ----------
  function hernoemFase(oud, nieuw) {
    const q = quest();
    if (!nieuw || nieuw === oud || q.fasen[nieuw]) return;
    const nieuweFasen = {};
    for (const [k, v] of Object.entries(q.fasen)) nieuweFasen[k === oud ? nieuw : k] = v;
    q.fasen = nieuweFasen;
    if (q.begin === oud) q.begin = nieuw;
    for (const f of Object.values(q.fasen)) for (const w of Object.values(f.wegen || {})) if (w.naar === oud) w.naar = nieuw;
    if (keuze.fase === oud) keuze.fase = nieuw;
    if (proef.fase === oud) proef.fase = nieuw;
    herbouwAlles();
  }
  function hernoemWeg(fid, oud, nieuw) {
    const f = quest().fasen[fid];
    if (!nieuw || nieuw === oud || f.wegen[nieuw]) return;
    const w = {};
    for (const [k, v] of Object.entries(f.wegen)) w[k === oud ? nieuw : k] = v;
    f.wegen = w;
    if (keuze.weg === oud) keuze.weg = nieuw;
    herbouwAlles();
  }
  function nieuweWeg(fid) {
    const f = quest().fasen[fid];
    if (!f.wegen) f.wegen = {};
    const id = vrijeId('weg', (n) => !f.wegen[n]);
    f.wegen[id] = { kost: 'niets', naar: quest().begin };
    keuze = { soort: 'weg', fase: fid, weg: id };
    herbouwAlles();
  }
  function verwijderWeg(fid, wid) {
    delete quest().fasen[fid].wegen[wid];
    keuze = { soort: 'fase', fase: fid };
    herbouwAlles();
  }
  function nieuweFase() {
    const q = quest();
    if (!q) return;
    const id = vrijeId('fase', (n) => !q.fasen[n]);
    q.fasen[id] = { wegen: {} };
    keuze = { soort: 'fase', fase: id };
    herbouwAlles();
  }
  function verwijderFase(fid) {
    const q = quest();
    if (Object.keys(q.fasen).length < 2) return;
    delete q.fasen[fid];
    for (const f of Object.values(q.fasen)) for (const [wid, w] of Object.entries(f.wegen || {})) if (w.naar === fid) delete f.wegen[wid];
    if (q.begin === fid) q.begin = Object.keys(q.fasen)[0];
    keuze = { soort: 'quest' };
    if (proef.fase === fid) proef.fase = null;
    herbouwAlles();
  }
  function nieuweQuest() {
    const vorm = prompt('Welke vorm? ' + Object.keys(VORMEN).join(' / '), Object.keys(VORMEN)[0]);
    if (!vorm || !VORMEN[vorm]) return;
    const naam = prompt('Hoe heet hij? (één woord, zoals "bakker")', '');
    if (!naam) return;
    const id = vrijeId(naam.trim(), (n) => !T.QUESTS[n]);
    T.QUESTS[id] = VORMEN[vorm]();
    questId = id;
    keuze = { soort: 'quest' };
    proef.fase = T.QUESTS[id].begin;
    herbouwAlles();
  }

  // ---------- verversen ----------
  // Typen in een veld herbouwt nooit het paneel waar dat veld zelf in staat (anders springt de
  // cursor weg); alleen de andere panelen. Precies zoals het gesprekken-gereedschap het doet.
  function naVeldWijziging() {
    vuil = true;
    renderBoom();
    renderProefDorp();
    renderFouten();
    updateStatus();
  }
  function naStructuurWijziging() {
    renderEditor();
    naVeldWijziging();
  }
  function herbouwAlles() {
    renderQuests();
    renderBoom();
    renderEditor();
    renderProefStaat();
    renderProefDorp();
    renderFouten();
    vuil = true;
    updateStatus();
  }
  function renderQuests() {
    const sel = $('qt-quest');
    sel.innerHTML = '';
    for (const id of Object.keys(T.QUESTS)) {
      const o = el('option', null, T.QUESTS[id].naam || id);
      o.value = id;
      sel.appendChild(o);
    }
    sel.value = questId || '';
  }
  function updateStatus() {
    $('qt-status').textContent = vuil ? 'niet-opgeslagen wijzigingen' : $('qt-status').dataset.opgeslagen || '';
  }

  // ---------- opslaan: T.QUESTS terug naar leesbare code ----------
  function str(s) {
    s = String(s);
    if (!/['\\\n\r]/.test(s)) return "'" + s + "'";
    return JSON.stringify(s);
  }
  function serWaarde(v) {
    if (Array.isArray(v)) return '[' + v.map(str).join(', ') + ']';
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    return str(v);
  }
  function serPlat(o) {
    return '{ ' + Object.entries(o).map(([k, v]) => `${k}: ${serWaarde(v)}`).join(', ') + ' }';
  }
  function opmComment(opmerking, sp) {
    if (!opmerking) return '';
    return opmerking.split('\n').map((r) => (sp + '// ' + r).replace(/ +$/, '')).join('\n') + '\n';
  }
  function serWeg(id, w, sp) {
    const delen = [`kost: ${str(w.kost)}`, `naar: ${str(w.naar)}`];
    const voor = opmComment(w._opmerking, sp);
    if (w.klaarAls) delen.push(`klaarAls: ${serPlat(w.klaarAls)}`);
    if (w.doe) delen.push(`doe: ${serPlat(w.doe)}`);
    return voor + `${sp}${id}: { ${delen.join(', ')} },\n`;
  }
  function serFase(id, f, sp) {
    const sp2 = sp + '  ';
    let out = opmComment(f._opmerking, sp) + `${sp}${id}: {\n`;
    if (f.eind) out += `${sp2}eind: true,\n`;
    if (f.doel) out += `${sp2}doel: ${str(f.doel)},\n`;
    if (f.melding) out += `${sp2}melding: ${str(f.melding)},\n`;
    if (f.beloning) out += `${sp2}beloning: ${serPlat(f.beloning)},\n`;
    const wegen = Object.entries(f.wegen || {});
    if (wegen.length) out += `${sp2}wegen: {\n${wegen.map(([wid, w]) => serWeg(wid, w, sp2 + '  ')).join('')}${sp2}},\n`;
    out += `${sp}},\n`;
    return out;
  }
  function serQuest(id, q, sp) {
    const sp2 = sp + '  ';
    let out = opmComment(q._opmerking, sp) + `${sp}${id}: {\n`;
    out += `${sp2}naam: ${str(q.naam)}, gever: ${str(q.gever || '')}, begin: ${str(q.begin)},\n`;
    out += `${sp2}fasen: {\n${Object.entries(q.fasen).map(([fid, f]) => serFase(fid, f, sp2 + '  ')).join('')}${sp2}},\n`;
    out += `${sp}},\n`;
    return out;
  }
  // Alleen het blok dat deze bewerker kent; de rest van het bestand gaat letterlijk mee.
  // Lukte het lezen niet, dan null en slaan we niet op — beter niets schrijven dan iets
  // kwijtraken wat deze bewerker niet kent.
  function bouwBestandTekst() {
    if (!BRON_GELEZEN) return null;
    let out = RUWE_KOP;
    out += '  T.QUESTS = {\n';
    out += Object.entries(T.QUESTS).map(([id, q]) => serQuest(id, q, '    ')).join('');
    out += '  };';
    out += RUWE_STAART;
    return out;
  }
  async function opslaan() {
    const fouten = controleer().filter((m) => m.soort === 'fout');
    if (fouten.length && !confirm(`Er staan nog ${fouten.length} fout(en) in de controle. Toch opslaan?`)) return;
    const statusEl = $('qt-status');
    const inhoud = bouwBestandTekst();
    if (inhoud == null) {
      statusEl.textContent = 'Niet opgeslagen: js/quests.js was niet te lezen, en dan schrijven we liever niets.';
      return;
    }
    statusEl.textContent = 'Opslaan…';
    try {
      const resp = await fetch('/gereedschap/api/quests-opslaan', { method: 'POST', headers: { 'Content-Type': 'text/plain; charset=utf-8' }, body: inhoud });
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
    const [questsBron, gesprekkenBron, verkennenBron] = await Promise.all([
      fetch('../js/quests.js').then((r) => r.text()),
      fetch('../js/gesprekken.js').then((r) => r.text()),
      fetch('../js/verkennen.js').then((r) => r.text()),
    ]);
    verwerkRuweBron(questsBron);
    renderOpmerkingMelding();
    leidVoorwaardenAf(gesprekkenBron);
    leidOpraapbaarAf(verkennenBron);

    questId = Object.keys(T.QUESTS)[0] || null;
    proef.fase = questId ? T.QUESTS[questId].begin : null;
    herbouwAlles();
    vuil = false;
    updateStatus();

    $('qt-quest').addEventListener('change', (e) => {
      questId = e.target.value;
      keuze = { soort: 'quest' };
      proef.fase = T.QUESTS[questId].begin;
      herbouwAlles();
      vuil = false;
      updateStatus();
    });
    $('qt-nieuwe-quest').addEventListener('click', nieuweQuest);
    $('qt-nieuwe-fase').addEventListener('click', nieuweFase);
    $('qt-opslaan').addEventListener('click', opslaan);
    window.addEventListener('beforeunload', (e) => { if (vuil) { e.preventDefault(); e.returnValue = ''; } });
  }

  // Net als de gespreksbewerker is deze ook van gereedschap/wereld.html: klik daar een poppetje en
  // zijn quest staat in hetzelfde scherm. Er is geen tweede bewerker — dit is hem, en die
  // bladzijde levert alleen dezelfde qt-*-elementen aan. Vandaar dat dit bestand zichzelf niet
  // meer start: de bladzijde die hem gebruikt, zegt wanneer.
  let gestart = false;
  T.questsTool = {
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
    kies(id) {
      if (!T.QUESTS[id]) return false;
      questId = id;
      keuze = { soort: 'quest' };
      proef.fase = T.QUESTS[id].begin;
      herbouwAlles();
      vuil = false;
      updateStatus();
      return true;
    },
    // Welke quest komt van deze persoon? Daarop springt wereld.html als je hem aanklikt.
    voorGever(wie) {
      return Object.keys(T.QUESTS).find((id) => T.QUESTS[id].gever === wie) || null;
    },
    // Een quest beginnen voor iemand die er nog geen geeft, in een van de vormen uit VORMEN.
    beginVoor(wie, naam, vorm) {
      const maak = VORMEN[vorm] || VORMEN[Object.keys(VORMEN)[0]];
      const id = vrijeId(wie, (n) => !T.QUESTS[n]);
      T.QUESTS[id] = maak();
      T.QUESTS[id].gever = wie;
      if (naam) T.QUESTS[id].naam = naam;
      questId = id;
      keuze = { soort: 'quest' };
      proef.fase = T.QUESTS[id].begin;
      herbouwAlles();
      return id;
    },
    vormen: () => Object.keys(VORMEN),
    isVuil: () => vuil,
  };
})();
