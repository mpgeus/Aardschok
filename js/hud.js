// Het scherm van het gehuchtspel: de kalender (dag, seizoen, jaar), de statussen, en de vensters (het bouwmenu, de
// marskramer, de heer, ...) -- in de stijl en de plek van js/ui.js, maar in een eigen bestand, want het hoort bij het
// nieuwe spel en niet bij De laatste klim. De voorraad, de twee bazen en de knoppen liggen sinds vraag 146, c op de
// tafel onderin (js/tafel.js). Sinds de kaarten van het oude spel weg zijn
// (25 sep, ontwerp/werklijst.md punt 7c) staat het altijd aan; T.NIEUWE_HUD blijft bestaan omdat
// een paar plekken er nog naar vragen. Het oude scherm linksboven (goud en spullen) staat nog in index.html, maar
// verborgen: de spullen hebben in dit scherm nog geen plek.
(function (T) {
  'use strict';

  T.NIEUWE_HUD = true;
  document.body.classList.toggle('nieuwe-hud', T.NIEUWE_HUD);

  const $ = (id) => document.getElementById(id);

  // De statussen (js/voorvallen.js, T.statussenVan; werklijst vraag 77, stap 2): een kaartje per status zolang hij
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
    // Een briefje per status: de naam en hoe lang al; wat het is en wat helpt, zegt het briefje bij de muis (js/tafel.js).
    for (const s of lijst) {
      const el = document.createElement('div');
      el.className = `briefje status${s.niveau === 2 ? ' erger' : ''}`;
      el.dataset.status = s.id;
      const duur = dag - s.sinds;
      const kort = duur < 1 ? 'sinds vandaag' : duur === 1 ? 'sinds gisteren' : `al ${T.telwoord(duur)} dagen`;
      const sinds = duur < 1 ? 'sinds vandaag' : duur === 1 ? 'sinds gisteren' : `al ${T.telwoord(duur)} dagen, sinds ${T.datumVanDag(s.sinds).tekst}`;
      el.innerHTML = `<b>${s.naam}</b>${kort}`;
      el.dataset.naam = s.naam;
      el.dataset.uitleg = `${s.zin} (${sinds}.)${s.helpt ? ` Wat helpt: ${s.helpt}.` : ''}`;
      box.appendChild(el);
    }
  };

  T.ui = T.ui || {};

  // De datum, en eronder het seizoen met het uur en het deel van de dag ("Lente · half acht,
  // ochtend"; js/dag.js). Ververst elk half uur (T.tikKalender).
  T.ui.toonKalender = function () {
    const S = T.S; // de kalender is die van het spel, ook als een dorp de tijd stilzet (js/tijd.js)
    const d = T.datumVanDag(S.kalender.dag);
    const datumEl = $('kalender-datum');
    datumEl.textContent = d.tekst;
    datumEl.classList.toggle('sint-maarten', d.sintMaarten);
    const uur = T.uurTekst(S.kalender.dag) + ', ' + T.dagdeelVan(S.kalender.dag);
    // Het weer van vandaag (js/weer.js), tussen het seizoen en het uur; op hover hoe lang het al droog is.
    // Hoe lang het al droog is, zegt het briefje bij de muis (js/tafel.js, de datum).
    const W = S.dorp && T.weerVan(S.dorp);
    const weer = W ? ' · ' + T.WEER_NAMEN[W.vandaag] : '';
    $('kalender-seizoen').textContent = T.hoofdletter(d.seizoen) + weer + ' · ' + uur + (d.sintMaarten ? ' · Sint-Maarten: de heer int' : '');
    T.ui.werkBriefKnopBij(S);
    T.ui.werkTafelBij(S); // de lat van de snelheden, de kaars en de lantaarn (js/tafel.js)
  };

  // Het bouwmenu: de soorten van de huidige trede, met hun kosten en wat ze doen (ontwerp/spel.md,
  // "Gebouwen"). Welke erin staan, zegt T.inBouwmenu (js/gebouwen.js): bouwt het dorp zelf, dan het erf
  // en geen woningen. Een klik op een rij geeft T.S.bouwSoort dat gebouw mee — daarna richt de muis
  // een spookbeeld (js/main.js, js/tekenen.js) tot een klik op de kaart hem neerzet.
  function bouwmenuInhoud(S) {
    const rijen = Object.keys(T.GEBOUWEN)
      .filter((id) => T.inBouwmenu(S.dorp, id))
      .map((id) => {
        const g = T.GEBOUWEN[id];
        if (g.erf) return erfRij(S, id, g);
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
    return `<div class="kop">Bouwen — ${T.tredeNaam(S.dorp)}</div>${rijen || '<p class="bouw-leeg">Hier valt nu niets te bouwen.</p>'}${oproepRijen(S)}`;
  }

  // De oproepen (js/verzoeken.js; werklijst vraag 103, c): vragen de mensen het je (de spelregel "Wie bouwt"), dan zet je
  // niets zelf neer, maar laat je op het plein een oproep hangen: "Het dorp zoekt een weverij", met een premie voor wie
  // het bouwt. Een klik hangt hem op, nog een klik haalt hem weg.
  function oproepRijen(S) {
    if (!T.VERZOEKEN_INSTELLINGEN.mensen) return '';
    const premie = T.VERZOEKEN_INSTELLINGEN.premie;
    const rijen = Object.keys(T.GEBOUWEN)
      .filter((id) => T.magGebouwd(S.dorp, id) && !T.GEBOUWEN[id].erf && !T.GEBOUWEN[id].woning)
      .map((id) => {
        const g = T.GEBOUWEN[id];
        const hangt = T.oproepVoor(S.dorp, id);
        const kosten = Object.entries(g.kosten).map(([wat, n]) => `${n} ${wat}`).join(', ');
        return (
          `<button data-oproep="${id}"${hangt ? ' class="hangt"' : ''}>` +
          `<span class="bouw-naam">${T.hoofdletter(g.naam)}${hangt ? ' · hangt op het plein' : ''}</span>` +
          `<span class="bouw-kosten">${kosten} · premie ${premie} goud</span>` +
          `<span class="bouw-uitleg">${hangt ? 'Klik om de oproep weg te halen.' : g.beschrijving}</span>` +
          `</button>`
        );
      })
      .join('');
    return `<div class="kop bouw-oproepen">Oproepen — wat de mensen niet vanzelf vragen</div>${rijen}`;
  }

  // De rij van het erf (js/erven.js): wat het kost is niets, maar er staat bij hoeveel er vrij zijn (waar nog een hut op
  // past, T.bruikbareErven), en wat een gezin erop nodig heeft.
  function erfRij(S, id, g) {
    const maat = T.erfMaat();
    const vrij = T.bruikbareErven(S.dorp).length;
    const hout = T.GEBOUWEN.hut.kosten.hout;
    return (
      `<button data-soort="${id}">` +
      `<span class="bouw-naam">${T.hoofdletter(g.naam)}</span>` +
      `<span class="bouw-kosten">${maat.b} bij ${maat.h} tegels · ${vrij ? `${vrij} vrij` : 'geen vrij'}</span>` +
      `<span class="bouw-uitleg">${g.beschrijving}: ${hout} hout per hut. Klik op een vrij erf om het weer weg te halen.</span>` +
      `</button>`
    );
  }

  T.ui.toonBouwmenu = function (S) {
    const box = $('bouwmenu');
    box.classList.toggle('verborgen', !S.bouwMenuOpen);
    // Het doel linksboven ligt op dezelfde plek: zolang het menu open is, staat het er niet (stijl.css).
    document.body.classList.toggle('bouwmenu-open', !!S.bouwMenuOpen);
    if (S.bouwMenuOpen) box.innerHTML = bouwmenuInhoud(S);
    $('bouwmenu-knop').classList.toggle('actief', S.bouwMenuOpen || !!S.bouwSoort);
  };

  $('bouwmenu').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b || !T.S) return;
    // Een oproep (js/verzoeken.js): hangt hem op of haalt hem weg, en het menu blijft open.
    if (b.dataset.oproep) {
      T.ui.bericht(T.doeOproep(T.S.dorp, b.dataset.oproep));
      T.ui.toonBouwmenu(T.S);
      return;
    }
    T.S.bouwSoort = b.dataset.soort;
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
    koopt: { duur: 'hij betaalt nu goed', goedkoop: 'hij betaalt nu weinig' },
    verkoopt: { duur: 'nu duur', goedkoop: 'nu goedkoop' },
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
    const heb = (wat) => Math.floor(v[wat] || 0);
    // Wat hij deze ronde bij zich heeft (T.verkooptNu): graan alleen in de lente, per pak van tien.
    const verkoopt = T.verkooptNu(S.dorp).map((wat) => {
      const k = T.kanKopen(S.dorp, wat, 1);
      const prijs = k.per > 1 ? `${k.per} voor ${k.prijs} goud` : `${k.prijs} goud per stuk`;
      return (
        `<div class="handel-rij"><span class="handel-naam">${T.hoofdletter((!m.bestelling && H.verkoopt[wat].naam) || wat)} <small>je hebt ${heb(wat)}</small></span>` +
        `<span class="handel-prijs">${prijs}<small>${prijsMerk(S, wat, 'verkoopt')}hij heeft er nog ${(m.heeft[wat] || 0) * k.per}</small></span>` +
        `<span class="handel-knoppen">${handelKnop('koop', wat, 1, `Koop ${k.per}`, k)}${handelKnop('koop', wat, 5, `Koop ${k.per * 5}`, T.kanKopen(S.dorp, wat, 5))}</span></div>`
      );
    });
    // Wat hij koopt, voor zover je er iets van hebt. Bij het graan staat hoeveel dagen het dorp
    // ervan kan eten, zodat je niet per ongeluk je wintereten verkoopt.
    const etenPerDag = (S.dorp.bevolking || 0) * T.etenPerMens(S.dorp);
    const koopt = Object.keys(H.koopt).filter((wat) => heb(wat) > 0).map((wat) => {
      const k = T.kanVerkopen(S.dorp, wat, 1);
      const eten = wat === 'graan' && etenPerDag > 0 ? ` · eten voor ${Math.floor((v.graan || 0) / etenPerDag)} dagen` : '';
      return (
        `<div class="handel-rij"><span class="handel-naam">${T.hoofdletter(wat)} <small>je hebt ${heb(wat)}${eten}</small></span>` +
        `<span class="handel-prijs">${k.per} voor ${k.prijs} goud<small>${prijsMerk(S, wat, 'koopt')}</small></span>` +
        `<span class="handel-knoppen">${handelKnop('verkoop', wat, 1, `Verkoop ${k.per}`, k)}${handelKnop('verkoop', wat, 5, `Verkoop ${k.per * 5}`, T.kanVerkopen(S.dorp, wat, 5))}</span></div>`
      );
    });
    // Op bestelling (de bode, js/bode.js) is het geen ronde van het seizoen.
    const maand = m.bestelling ? 'op bestelling' : H.bezoeken[m.bezoek].maand;
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
  const opsomming = (delen) => (delen.length > 1 ? `${delen.slice(0, -1).join(', ')} en ${delen[delen.length - 1]}` : delen[0] || 'niets');
  const eisInTaal = (eis) => opsomming(eis.volgorde.map((wat) => `${eis.per[wat]} ${wat}`));

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
    const g = T.gevolgVanBetaling(S.dorp, geef, eis);
    const v = T.heerVooruitzicht(S.dorp, g);
    const pct = Math.floor(g.deel * 100 + 1e-9);
    const soort = g.ambtKwijt || g.schandpaal ? 'zwaar' : g.boete ? 'boete' : 'goed';
    const goudExtra = g.neemt.goud > (eis.per.goud || 0) ? ` Van je goud neemt hij ${g.neemt.goud}, ook in de plaats van wat er verder ontbreekt.` : '';
    const soldaten = v.soldaten ? `, zijn soldaten ${Math.round(v.soldaten)}` : '';
    // Het vee (js/vee.js; T.heerVooruitzicht): de melk drinkt het dorp vóór het graan, dus die staat
    // al van het eten af; en wie graan tekortkomt, eet daarna de kaas. Honger is dus pas een tekort
    // dat groter is dan de kaas.
    // Sinds 25 sep vult ook vlees een maag (js/behoeften.js): kaas en vlees samen zijn de achtervang.
    const melk = Math.round(v.melk || 0);
    const kaas = Math.floor(v.kaas || 0);
    const vlees = Math.floor(v.vlees || 0);
    const achter = kaas + vlees;
    const achterNaam = kaas && vlees ? 'de kaas en het vlees' : kaas ? 'de kaas' : 'het vlees';
    const vangt = kaas && vlees ? 'vangen' : 'vangt';
    const melkTekst = melk > 0 ? `, naast zo'n ${melk} aan melk van de koeien` : '';
    const rest = Math.round(v.over);
    const achterOver = Math.round(v.over + achter);
    const uitkomst = rest >= 0
      ? `er blijft ${rest} over${achter ? `, en ${achterNaam} houd je achter de hand` : ''}`
      : achter && achterOver >= 0
        ? `je komt ${-rest} graan tekort, maar ${achterNaam} ${vangt} dat op: daarna is er nog ${achterOver} over`
        : achter
          ? `je komt ${-rest} graan tekort, en ook met ${achterNaam} erbij nog ${-achterOver}: dat is honger vóór de oogst`
          : `je komt ${-rest} graan tekort, en dat is honger vóór de oogst`;
    const heb = [`${Math.round(v.na)} graan`].concat(kaas ? [`${kaas} kaas`] : [], vlees ? [`${vlees} vlees`] : []);
    return (
      `<p class="heer-deel ${soort}">Je geeft hem ${pct}% van wat hij vraagt. ${g.tekst}${goudExtra}</p>` +
      `<p class="heer-vooruit">Daarna heb je ${heb.length > 1 ? `${heb.slice(0, -1).join(', ')} en ${heb[heb.length - 1]}` : heb[0]}. ` +
      `Tot de oogst eet het dorp er zo'n ${Math.round(v.eten)}${melkTekst}${soldaten}, ` +
      `en zaaien in lentemaand kost ${Math.round(v.zaaien)}: ${uitkomst}.</p>` +
      `<div class="heer-knoppen"><button data-actie="alles">Alles wat hij vraagt</button>` +
      `<button class="heer-geef-knop" data-actie="betaal"${g.kan ? '' : ` disabled title="${g.reden}"`}>Geef het hem</button></div>`
    );
  }

  function schandpaalInhoud(S) {
    const rijen = T.schandpaalKeuzes(S.dorp).map((k) => {
      const prijs = k.wie === 'schout'
        ? `Het dorp neemt het je niet kwalijk. De heer lacht, en zet er ${k.boete} goud bij.`
        : `Het dorp is ${Math.round(k.kost * 100)}% minder tevreden, en vergeet het pas na maanden.`;
      return (
        `<button class="paal-keuze" data-wie="${k.wie}"><span class="paal-naam">${veilig(k.naam)}</span>` +
        `<span class="paal-wie">${veilig(k.eigenschap)}</span><span class="paal-prijs">${prijs}</span></button>`
      );
    }).join('');
    return (
      `<div class="venster-kop"><span class="venster-titel">De schandpaal</span><span class="venster-wanneer">Sint-Maarten</span></div>` +
      `<p class="venster-staat">"Iemand moet dit voelen, schout. U mag kiezen wie." Wie staat er drie dagen aan de paal op het plein?</p>` +
      rijen
    );
  }

  // Ligt er nog iets verstopt (js/verstoppen.js), dan zegt het venster dat: zolang de heer in het
  // dorp is, kun je er niet bij, dus wie zijn goud te laat terughaalt, komt tekort.
  function verstoptBijDeHeer(S) {
    const v = T.verstoptTotaal(S.dorp);
    const wat = v ? T.inhoudTekst(v) : '';
    return wat ? `<p class="venster-staat">Er ligt nog ${wat} verstopt. Zolang de heer in het dorp is, kun je er niet bij.</p>` : '';
  }

  function toonHeer(S) {
    const box = $('heer');
    const b = S.dorp.heer && S.dorp.heer.bezoek;
    if (b && b.schandpaal) {
      box.innerHTML = schandpaalInhoud(S);
    } else {
      const eis = T.eisVanDeHeer(S.dorp);
      if (!geef) {
        geef = {};
        for (const wat of eis.volgorde) geef[wat] = Math.min(eis.per[wat], hebNu(S, wat));
      }
      box.innerHTML =
        `<div class="venster-kop"><span class="venster-titel">Sint-Maarten</span><span class="venster-wanneer">de heer telt</span>` +
        `<button class="venster-sluit" data-actie="sluit" title="Nog niet (Esc)">✕</button></div>` +
        `<p class="venster-staat">Hij vraagt ${eisInTaal(eis)}. Wat je hem geeft, schuif je hieronder. Goud neemt hij altijd, ook in de plaats van iets anders.</p>` +
        verstoptBijDeHeer(S) +
        heerRijen(S, eis) +
        `<div class="heer-samen">${heerSamenvatting(S, eis)}</div>` +
        `<p class="venster-voet">Zolang je bij hem staat, staat de tijd stil. <kbd>Esc</kbd>: nog niet (hij wacht).</p>`;
    }
    box.classList.remove('verborgen');
  }

  T.ui.openHeer = function (S) {
    const b = S.dorp.heer && S.dorp.heer.bezoek;
    if (!T.heerWacht(S.dorp) && !(b && b.schandpaal)) return;
    if (!T.ui.openVenster(S, 'heer')) return;
    geef = null;
    toonHeer(S);
  };

  // Dicht. Bij de schandpaal kan dat niet: daar moet je kiezen. De tijd loopt weer op de snelheid
  // die de speler koos (js/tijd.js, T.laatTijdGaan).
  T.ui.sluitHeer = function (S) {
    const b = S.dorp.heer && S.dorp.heer.bezoek;
    if (b && b.schandpaal) return;
    T.ui.sluitVenster(S, 'heer');
    geef = null;
    T.ui.werkBriefKnopBij(S);
  };

  T.ui.meldVenster('heer', { el: 'heer', open: (S) => T.ui.openHeer(S), sluit: (S) => T.ui.sluitHeer(S) });

  $('heer').addEventListener('input', (ev) => {
    const r = ev.target.closest('input[type="range"]');
    const S = T.S;
    if (!r || !S || !geef) return;
    geef[r.dataset.wat] = Number(r.value);
    $('heer').querySelector(`[data-geef="${r.dataset.wat}"]`).textContent = r.value;
    $('heer').querySelector('.heer-samen').innerHTML = heerSamenvatting(S, T.eisVanDeHeer(S.dorp));
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
      const g = T.betaalHeer(S.dorp, geef);
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
    S.modus = 'einde';
    $('heer').classList.add('verborgen');
    if (T.ui.briefOpen()) $('brief').classList.add('verborgen');
    const jaren = ((S.dorp.heer && S.dorp.heer.jaren) || [])
      .map((j) => `${j.jaar}: ${Math.floor(j.deel * 100 + 1e-9)}%${j.straf ? `, ${j.straf}` : ''}`)
      .join(' · ');
    const heer = jaren ? `<p class="einde-jaren">Wat de heer kreeg: ${jaren}</p>` : '';
    // Minder dan tien mensen over (js/einde.js; werklijst vraag 101, d), of je ambt kwijt (js/heer.js).
    if (D.einde && D.einde.reden === 'leeg') {
      T.ui.toonOverlay(
        'Het dorp is leeg',
        `<p>Er zijn minder dan ${T.EINDE_INSTELLINGEN.minstensOver} mensen over. De heer streept ${veiligeNaam(D)} door in zijn boek: een dorp zonder mensen brengt niets op.</p>` +
          `<p>Wie overbleef, trekt weg. Jij ook.</p>` + heer,
        'Naar het titelscherm',
        () => T.naarTitelscherm(),
      );
      return;
    }
    // Het dorp jaagt je weg (js/bazen.js; werklijst vraag 106, b): het vertrouwen is op.
    if (D.einde && D.einde.reden === 'verjaagd') {
      const waarom = D.einde.waarom ? ` Het laatste wat ze je aanrekenden: ${veilig(D.einde.waarom)}.` : '';
      T.ui.toonOverlay(
        'Weggejaagd',
        `<p>Het dorp vertrouwde je niet meer. Op een avond stonden ze voor je deur, met fakkels.${waarom}</p>` +
          `<p>De heer benoemt een nieuwe schout. Of het dorp die wel vertrouwt, hoor je nooit: je bent al over de heuvel.</p>` + heer,
        'Naar het titelscherm',
        () => T.naarTitelscherm(),
      );
      return;
    }
    // Je ambt kwijt: met twee bazen omdat zijn gunst op is (D.einde.waarom), anders na twee keer veel te weinig.
    const ontslag = D.einde && D.einde.waarom
      ? `<p>${veilig(D.einde.waarom)} Hij heeft een nieuwe schout benoemd: zijn neef, die ook niet kan tellen.</p>`
      : `<p>Twee keer achter elkaar gaf je de heer veel te weinig. Hij heeft een nieuwe schout benoemd: zijn neef, die ook niet kan tellen.</p>`;
    T.ui.toonOverlay(
      'Je ambt kwijt',
      ontslag +
        `<p>Jij bent weer een gewone dorpeling, en je buren weten nog precies wat je deed.</p>` + heer,
      'Naar het titelscherm', // daar begin je opnieuw, of laad je een bewaard spel (js/menu.js)
      () => T.naarTitelscherm(),
    );
  };

  // De naam van je dorp, veilig in html (je typt hem zelf bij Nieuw spel), of "het dorp".
  const veiligeNaam = (D) => veilig(T.dorpsnaam(D) || 'het dorp');

  // Gewonnen (js/einde.js, T.werkEindeBij; werklijst vraag 101): een jaar lang had iedereen alles. Het scherm komt over het
  // grote feest op het plein, met het jaar tot nu toe; wie wil, speelt verder. Zolang het openstaat, staat de tijd stil.
  T.ui.toonGewonnen = function (D) {
    const S = T.S;
    if (D !== S.dorp) return;
    T.houdTijdStil(S, 'gewonnen');
    const regels = T.jaarverslagRegels(D, D.jaarboek, Math.floor(S.kalender.dag));
    T.ui.toonOverlay(
      'Iedereen gelukkig',
      `<p>Een jaar lang had iedereen in ${veiligeNaam(D)} alles wat hij wilde. Vandaag viert het hele dorp het op het plein.</p>` +
        `<p>De heer schrijft dat het niet kan kloppen: een dorp waar iedereen tevreden is, betaalt te weinig.</p>` +
        `<div class="einde-jaren">${regels.map((r) => `<p>${veilig(r)}</p>`).join('')}</div>`,
      'Verder spelen',
      () => T.laatTijdGaan(S, 'gewonnen'),
      {
        knop: 'Naar het titelscherm',
        opKlik: () => {
          T.laatTijdGaan(S, 'gewonnen');
          T.naarTitelscherm();
        },
      },
    );
  };

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
      const hooi = eet > 0 ? `eet ${eet === 1 ? 'één hooi' : `${String(eet).replace('.', ',')} hooi`} per winterdag` : 'eet geen hooi';
      return (
        `<div class="heer-rij">` +
        `<span class="heer-naam">${T.hoofdletter(n === 1 ? g.naam : g.meervoud)} <small>je hebt er ${n} · ${hooi}</small></span>` +
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
        ? 'Wie overblijft, eet geen hooi.'
        : haalt
          ? `Wie overblijft, eet ${Math.round(perDag * 10) / 10} hooi per dag: het hooi haalt de winter, met ${Math.floor(hooi - perDag * winter)} over.`
          : `Wie overblijft, eet ${Math.round(perDag * 10) / 10} hooi per dag: het hooi is na ${dagen} van de ${winter} dagen op, en dan sterft het vee van honger.`;
    }
    const o = T.slachtOpbrengst(weg, dag);
    let opbrengst = weg.length
      ? `Het slachten geeft ${Math.round(o.vlees)} vlees en ${o.huiden} ${o.huiden === 1 ? 'huid' : 'huiden'}.`
      : 'Je slacht niemand.';
    if (o.vlees > 0 && T.zoutDekking) {
      const z = T.zoutDekking(S.dorp);
      const vrij = Math.max(0, Math.floor((S.dorp.voorraad.zout || 0) * T.BEHOEFTEN_INSTELLINGEN.zoutHoudtGoed - z.totaal));
      opbrengst += vrij >= o.vlees
        ? ' Je zout houdt het vlees goed.'
        : vrij > 0
          ? ` Vlees bederft zonder zout, en je zout houdt er nog ${vrij} goed: de rest is binnen een paar weken weg.`
          : ' Vlees bederft zonder zout, en je hebt geen zout over: het is binnen een paar weken weg.';
    }
    return (
      `<p class="heer-deel ${!T.VEE_INSTELLINGEN.winterzorg || haalt ? 'goed' : 'zwaar'}">${winterTekst} ${opbrengst}</p>` +
      `<div class="heer-knoppen"><button data-actie="voorstel" title="Zo weinig als kan, zodat het hooi de winter haalt">Voorstel</button>` +
      `<button class="heer-geef-knop" data-actie="slacht"${weg.length ? '' : ' disabled title="Schuif eerst wie er gaan"'}>Slachten</button></div>`
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
      ? (T.isVeeWinter(dag)
        ? `Het is winter: nog ${winter === 1 ? 'één dag' : `${winter} dagen`} tot het gras terug is. Zolang eet het vee hooi, en je hebt er ${hooi}.`
        : `De volgende winter duurt ${winter} dagen, en dan eet het vee hooi. Je hebt er ${hooi}, met wat er nog op de weides staat.`) +
        ' Wat het hooi niet de winter door helpt, gaat naar de slager, of het sterft. Uit elke groep gaan de oudste.'
      : 'Wie gaat er naar de slager? Uit elke groep gaan de oudste.';
    box.innerHTML =
      `<div class="venster-kop"><span class="venster-titel">Het slachten</span><span class="venster-wanneer">${T.datumVanDag(dag).tekst}</span>` +
      `<button class="venster-sluit" data-actie="sluit" title="Niemand slachten (Esc)">✕</button></div>` +
      `<p class="venster-staat">${inleiding}</p>` +
      (groepen.length ? slachtRijen(S, groepen) : '<p class="venster-staat">Er is geen vee.</p>') +
      `<div class="heer-samen">${slachtSamenvatting(S, groepen)}</div>` +
      `<p class="venster-voet">Zolang dit open is, staat de tijd stil. <kbd>Esc</kbd>: niemand slachten.</p>`;
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

  // ── Verstoppen (js/verstoppen.js; spel.md, "Marcel koos voor stap 2") ──
  // In de kelder van een huis of een boerderij, of in de kapel. De schout loopt erheen
  // (js/verkennen.js), en dan gaat dit venster open. Per goed (graan, goud) zie je wat je hebt, wat
  // hier ligt en wat er nog past, en zet je iets weg of haal je het terug. Elke knop stelt dezelfde
  // vraag als de regels (T.kanVerstoppen, T.kanTerughalen), dus een knop die niet kan, zegt bij de
  // muis waarom. Zolang het open is, staat de tijd stil (T.houdTijdStil) en sluit Esc het
  // (S.modus 'verstoppen', js/main.js).
  let verstopGebouw = null;
  const VERSTOP_WAAR = { graan: 'in de schuur', goud: 'in de kist' };

  function verstopKnop(actie, wat, n, tekst, k) {
    const titel = k.kan ? '' : ` title="${veilig(k.reden)}"`;
    return `<button data-actie="${actie}" data-wat="${wat}" data-n="${n}"${k.kan ? '' : ' disabled'}${titel}>${tekst}</button>`;
  }

  function verstopRij(S, g, p, wat) {
    const ligt = (g.verstopt && g.verstopt[wat]) || 0;
    const stap = wat === 'graan' ? 10 : 5;
    // Alles wat kan: bij graan de kelder vol (of wat je hebt), bij goud alles.
    const max = T.hoeveelVerstoppen(S.dorp, g, wat);
    const alles = max > 0 ? T.kanVerstoppen(S.dorp, g, wat, max) : T.kanVerstoppen(S.dorp, g, wat, Math.max(1, hebNu(S, wat)));
    const vul = wat === 'graan' ? `Vul hem${max > 0 ? ` (${max})` : ''}` : `Alles weg${max > 0 ? ` (${max})` : ''}`;
    const past = wat === 'graan' ? `er past nog ${Math.max(0, Math.floor(p.plaats - ligt))} bij` : 'past altijd, in een pot onder de vloer';
    return (
      `<div class="handel-rij"><span class="handel-naam">${T.hoofdletter(wat)} <small>je hebt ${hebNu(S, wat)} ${VERSTOP_WAAR[wat]}</small></span>` +
      `<span class="handel-prijs">hier ${Math.floor(ligt)}<small>${past}</small></span>` +
      `<span class="handel-knoppen">` +
      verstopKnop('weg', wat, stap, `Zet ${stap} weg`, T.kanVerstoppen(S.dorp, g, wat, stap)) +
      verstopKnop('weg', wat, max, vul, alles) +
      verstopKnop('terug', wat, stap, `Haal ${stap} terug`, T.kanTerughalen(S.dorp, g, wat, stap)) +
      verstopKnop('terug', wat, ligt, 'Alles terug', T.kanTerughalen(S.dorp, g, wat, ligt)) +
      `</span></div>`
    );
  }

  // Wie je nu ziet (js/zien.js, T.kijkersTekst): zo weet je het vóór je iets wegzet (Marcel, vraag 40,
  // A). Kijkt er iemand, dan in het rood. Met "pas later" in de spelregels zie je het niet.
  function verstopKijkers(S, g) {
    if (!T.ZIEN_INSTELLINGEN.meteen) return '';
    const t = T.kijkersTekst(S.dorp, g);
    const iemand = T.getuigenVan(S.dorp, g).length > 0;
    return `<p class="verstop-kijkers${iemand ? ' gezien' : ''}">${veilig(t)}</p>`;
  }

  // Wat de soldaten hier doen, en wat het kost, in één alinea.
  function verstopRisico(p) {
    let t = `Doorzoeken de soldaten het dorp, dan vinden ze het hier ${T.vindKansTekst(p.vinden)}.`;
    if (p.verteldDoor) t += ` ${T.hoofdletter(p.verteldDoor)} vertelde in de herberg wat je hier deed.`;
    if (p.vanSchout) t += ' Bij de schout kijken ze het eerst.';
    if (p.gebouw.soort === 'kapel') t += ' Het is gewijde grond.';
    if (p.houdt > 0 && p.wieHoudt === 'de kapelaan') t += ` De kapelaan houdt ${T.deelTekst(p.houdt)} van wat je hier neerzet.`;
    return t;
  }

  // Wie er woont, klein naast de titel: met zijn karakter als dat telt.
  function verstopWie(p) {
    if (p.vanSchout) return 'de schout';
    if (!p.bewoner) return '';
    const k = T.VERSTOP_INSTELLINGEN.karakters && T.KARAKTERS && T.KARAKTERS[p.karakter];
    return k ? `${p.bewoner.naam}, ${k.kort}` : p.bewoner.naam;
  }

  function toonVerstoppen(S) {
    const g = verstopGebouw;
    const p = g && T.verstopPlekVan(S.dorp, g);
    if (!p) {
      T.ui.sluitVerstoppen(S);
      return;
    }
    const over = T.overKelderTekst(p);
    const wie = verstopWie(p);
    $('verstoppen').innerHTML =
      `<div class="venster-kop"><span class="venster-titel">${veilig(T.hoofdletter(p.naam))}</span>` +
      `<span class="venster-wanneer">${veilig(wie)}</span>` +
      `<button class="venster-sluit" data-actie="sluit" title="Sluiten (Esc)">✕</button></div>` +
      (over ? `<p class="verstop-bewoner">${veilig(over)}</p>` : '') +
      `<p class="venster-staat">${verstopRisico(p)}</p>` +
      verstopKijkers(S, g) +
      verstopRij(S, g, p, 'graan') +
      verstopRij(S, g, p, 'goud') +
      `<p class="venster-voet">Wat hier ligt, telt de inner niet, en het dorp eet het niet tot je het terughaalt. ` +
      `Zolang je hier staat, staat de tijd stil. <kbd>Esc</kbd> sluit.</p>`;
    $('verstoppen').classList.remove('verborgen');
  }


  T.ui.openVerstoppen = function (S, g) {
    if (!T.verstopPlekVan || !T.verstopPlekVan(S.dorp, g)) return;
    if (!T.ui.openVenster(S, 'verstoppen')) return;
    verstopGebouw = g;
    toonVerstoppen(S);
  };

  T.ui.sluitVerstoppen = function (S) {
    T.ui.sluitVenster(S, 'verstoppen');
    verstopGebouw = null;
  };

  T.ui.meldVenster('verstoppen', { el: 'verstoppen', open: () => {}, sluit: (S) => T.ui.sluitVerstoppen(S) });

  $('verstoppen').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    const S = T.S;
    if (!b || !S || !verstopGebouw) return;
    b.blur();
    if (b.dataset.actie === 'sluit') {
      T.ui.sluitVerstoppen(S);
      return;
    }
    const n = Number(b.dataset.n);
    const r = b.dataset.actie === 'weg' ? T.verstop(S.dorp, verstopGebouw, b.dataset.wat, n) : T.haalTerug(S.dorp, verstopGebouw, b.dataset.wat, n);
    if (!r.kan && T.ui.bericht) T.ui.bericht(r.reden);
    // Wie het zag, is getuige (js/zien.js): een oogje boven zijn hoofd, en het bericht zegt wie; met "pas
    // later" in de spelregels hoor je het pas als het rondverteld is.
    if (r.kan && T.werdGezien) {
      const z = T.werdGezien(S, S.dorp, verstopGebouw, b.dataset.actie, b.dataset.wat, n);
      if (T.ZIEN_INSTELLINGEN.meteen && T.ui.bericht) T.ui.bericht(z.bericht);
    }
    toonVerstoppen(S);
  });

  // ── De velden (js/akkers.js, "Velden"; spel.md, "Weides met koeien en schapen") ──
  // Zoals het veldenscherm van Lords of the Realm 2 (Marcel, 25 sep): alle velden onder elkaar, met
  // van wie ze zijn, hoe groot en hoe vruchtbaar, wat ze nu zijn, en drie knoppen voor wat ze
  // volgend jaar worden. Elke knop stelt dezelfde vraag als de klik (T.kanBestemming), dus wat niet
  // kan, staat uit en zegt waarom. Het plan gaat pas in op 1 lentemaand (T.wisselVelden). Zolang het
  // venster open is, staat de tijd stil (T.houdTijdStil) en ligt de rest van de invoer stil
  // (S.modus 'velden', js/main.js), net als bij de spelregels. De regel bij de muis op een veld
  // (T.veldTekst) en de stukjes tekst die beide delen, staan in js/verkennen.js.
  const BESTEMMING_NAAM = { akker: 'Akker', weide: 'Weide', braak: 'Braak' };
  const GRAAN_TAAL = {
    geploegd: 'net geploegd en gezaaid', kiemend: 'het graan kiemt', groen: 'het graan staat groen',
    rijp: 'het graan is rijp', gemaaid: 'gemaaid',
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
      const bezet = `${st.nodig} van de ${st.tegels} tegels`;
      const kleinste = Math.min(...Object.values(T.VEE_INSTELLINGEN.plaats));
      zorg = st.vrij < 0;
      over = `${T.kuddeTekst(dieren)} · ` + (samen ? `${samen} · ` : '') + (st.vrij < 0
        ? `te vol: ze hebben ${st.nodig} tegels nodig en er zijn er ${st.tegels}, dus de koeien geven ${Math.round(st.vol * 100)}% melk en er komen geen jongen`
        : st.vrij < kleinste ? `vol (${bezet}): geen plaats voor jongen` : `${bezet}: plaats voor jongen`);
    } else if (bestemming === 'weide') {
      over = 'nog geen vee' + (samen ? ` · ${samen}` : '');
    } else if (bestemming === 'braak') {
      over = 'het land rust';
    } else {
      const datum = T.datumVanDag(S.kalender.dag);
      const stadium = T.akkerStadium(datum.maand, datum.dagVanMaand);
      const zonder = veld.ongezaaid ? veld.ongezaaid.size : 0;
      over = zonder >= veld.b * veld.h ? 'dit jaar niet gezaaid' : GRAAN_TAAL[stadium] || '';
      if (zonder && zonder < veld.b * veld.h) over += ` · ${zonder} tegels niet gezaaid`;
      zorg = zonder > 0;
    }
    return `<span class="veld-bestemming ${bestemming}">${BESTEMMING_NAAM[bestemming]}</span> <small${zorg ? ' class="zorg"' : ''}>${over}</small>`;
  }

  function veldRij(S, veld, i) {
    const boer = T.boerVanVeld(S.dorp, veld);
    const bestemming = T.bestemmingVan(veld);
    const plan = T.planVan(veld);
    const pct = Math.round(T.vruchtbaarheidVan(veld) * 100);
    const redenen = [];
    const knoppen = T.BESTEMMINGEN.map((b) => {
      if (b === plan) return `<button class="veld-keuze gekozen" data-veld="${i}" data-bestemming="${b}" title="Dit wordt het volgend jaar">${BESTEMMING_NAAM[b]}</button>`;
      const k = T.kanBestemming(S.dorp, veld, b);
      if (!k.kan && !redenen.includes(k.reden)) redenen.push(k.reden);
      const titel = veilig(k.kan ? `Volgend jaar ${b}` : k.reden);
      return `<button class="veld-keuze" data-veld="${i}" data-bestemming="${b}" title="${titel}"${k.kan ? '' : ' disabled'}>${BESTEMMING_NAAM[b]}</button>`;
    }).join('');
    // Mest erop (js/akkers.js, T.zetMest): een knop die aan en uit gaat, naast de drie keuzes. Alleen
    // op wat volgend jaar akker is; wat niet kan, staat uit en zegt waarom.
    let mestKnop = '';
    if (T.kanMest && !T.VELDEN_INSTELLINGEN.mestVanzelf && T.VELDEN_INSTELLINGEN.vruchtbaarheid) {
      const km = T.kanMest(S.dorp, veld);
      const karren = Math.round(T.mestVoorVeld(veld) * 10) / 10;
      const pct = Math.round(T.VELDEN_INSTELLINGEN.mestErbij * 100);
      const titel = veld.mest
        ? `Mest erop op ${T.veldWisselTekst()}: ${karren} karren, +${pct}% vruchtbaar. Klik om hem eraf te halen.`
        : km.kan ? `Mest erop op ${T.veldWisselTekst()}: ${karren} karren, +${pct}% vruchtbaar, elk jaar tot je hem eraf haalt.` : km.reden;
      mestKnop = `<button class="veld-keuze veld-mest${veld.mest ? ' gekozen' : ''}" data-mest="${i}" title="${veilig(titel)}"${veld.mest || km.kan ? '' : ' disabled'}>Mest</button>`;
    }
    const wanneer = plan !== bestemming || veld.mest
      ? `<small class="veld-wanneer">${plan !== bestemming ? `wordt ${plan}` : 'krijgt mest'}${plan !== bestemming && veld.mest ? ', met mest,' : ''} op ${T.veldWisselTekst()}</small>`
      : '';
    // Wie het koos, en waarom (js/akkers.js, T.boerenKiezenVelden): je oogje in het zeil.
    const koos = T.planTekst(S.dorp, veld);
    const wieKoos = koos ? `<small class="veld-koos">${veilig(koos)}.</small>` : '';
    return (
      `<div class="veld-rij${plan !== bestemming || veld.mest ? ' verandert' : ''}">` +
      `<div class="veld-wie" title="${veld.b} bij ${veld.h} tegels"><span class="veld-naam">${boer ? veilig(boer.naam) : 'Zonder boer'}</span> ` +
      `<small>${veld.b * veld.h} tegels</small></div>` +
      `<div class="veld-vrucht" title="Vruchtbaar: een akker geeft zijn graan maal dit getal."><span class="veld-balk"><i style="width:${pct}%"></i></span> <small>${pct}%</small></div>` +
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
    const hooi = weides.reduce((n, v) => n + v.b * v.h * T.hooiPerTegel(v, T.boerVanVeld(S.dorp, v)), 0);
    const koeien = Math.floor(hooi / (T.winterLengte() * (VI.hooiPerDag.koe || 1)));
    const nu = T.veeVan(S.dorp).filter((e) => e.dier === 'koe').length;
    return ` Die ${weides.length === 1 ? 'weide geeft' : 'weides geven'} in ${VI.hooien} zo'n ${Math.round(hooi)} hooi: ` +
      `genoeg voor ${koeien} ${koeien === 1 ? 'koe' : 'koeien'} de winter door (een kalf telt half), en je hebt er nu ${nu}.`;
  }

  // De mest van volgend jaar (js/akkers.js, T.mestPlan): wat je hebt, en wat de akkers met mest
  // vragen. Leeg als er geen mest is en er ook niemand om vraagt.
  function mestVooruit(S) {
    if (!T.mestPlan || !T.VELDEN_INSTELLINGEN.vruchtbaarheid) return '';
    const mp = T.mestPlan(S.dorp);
    const heb = Math.floor((S.dorp.voorraad && S.dorp.voorraad.mest) || 0);
    if (!mp.velden.length && !heb) return '';
    if (T.VELDEN_INSTELLINGEN.mestVanzelf) {
      return ` De mest gaat vanzelf over alle akkers: je hebt ${heb} karren, en een volle beurt vraagt er ${Math.round(mp.nodig)}.`;
    }
    const n = mp.velden.length;
    return ` Mest: je hebt ${heb} karren` +
      (n ? `, en ${n === 1 ? 'de akker' : `de ${n} akkers`} met mest ${n === 1 ? 'vraagt' : 'vragen'} er ${Math.round(mp.nodig)}.` : ', en nog geen akker met mest erop.');
  }

  // De hele kudde in één regel, met de knop om te slachten (het venster hierboven).
  function kuddeRegel(S) {
    const kudde = T.veeVan(S.dorp);
    if (!kudde.length || !T.dierenTekst) return '';
    const meent = T.meentVan(S.wereld);
    return `<p class="veld-kudde">De kudde: ${T.dierenTekst(kudde, dagNu(S))}. ` +
      `<button class="veld-keuze" data-actie="slachten" title="Wie gaat er naar de slager?">Slachten…</button></p>` +
      (meent && T.meentTekst ? `<p class="veld-kudde">${veilig(T.meentTekst(S.dorp, meent))}.</p>` : '');
  }

  function veldenInhoud(S) {
    const velden = (S.wereld && S.wereld.akkers) || [];
    const IN = T.VELDEN_INSTELLINGEN;
    const wissel = T.veldWisselTekst();
    const dagen = dagenTotWissel(S);
    const over = dagen == null ? '' : ` (over ${dagen} dag${dagen === 1 ? '' : 'en'})`;
    const pc = (x) => `${Math.round(x * 100)}%`;
    const land = IN.vruchtbaarheid
      ? `Een akker put het land uit (−${pc(IN.akkerPutUit)} per jaar), een braak rust (+${pc(IN.braakRust)}) en een weide wordt door het vee gemest (+${pc(IN.weideMest)}). ` +
        `Mest uit de schaapskooi maakt een akker ${pc(IN.mestErbij)} vruchtbaarder.`
      : 'Het land put niet uit: dat staat uit in de spelregels.';
    // Wat het volgend jaar wordt, bij elkaar: hoeveel akkers er te zaaien zijn, en wat dat kost.
    const tel = (b) => velden.filter((v) => T.planVan(v) === b);
    const akkers = tel('akker');
    const tegels = akkers.reduce((n, v) => n + v.b * v.h, 0);
    const zaai = Math.round(tegels * (T.ZAAIGRAAN_PER_TEGEL || 0));
    const weides = tel('weide').length;
    const braak = tel('braak').length;
    const volgend =
      `Volgend jaar: ${akkers.length} ${akkers.length === 1 ? 'akker' : 'akkers'} (${tegels} tegels: zaaien kost ${zaai} graan, en je hebt er nu ${hebNu(S, 'graan')}), ` +
      `${weides ? `${weides} ${weides === 1 ? 'weide' : 'weides'}` : 'geen weide'} en ` +
      `${braak ? `${braak} ${braak === 1 ? 'veld' : 'velden'} braak` : 'geen braak'}.` + hooiVooruit(S, tel('weide')) + mestVooruit(S);
    return (
      `<div class="venster-kop"><span class="venster-titel">De velden</span><span class="venster-wanneer">de wissel op ${wissel}${over}</span>` +
      `<button class="venster-sluit" data-actie="sluit" title="Sluiten (Esc)">✕</button></div>` +
      `<p class="venster-staat">Elk veld is akker, weide of braak. ${T.VELDEN_INSTELLINGEN.boerenKiezen ? 'Na de oogst kiezen de boeren wat hun velden volgend jaar worden, en wat jij hier kiest, gaat voor. ' : ''}` +
      `Het gaat in op <b>${wissel}</b>, als de boeren ploegen: ` +
      `staand graan vertrap je niet. ${land}</p>` +
      `<div class="veld-rij veld-kop"><span>Veld</span><span title="Een akker geeft zijn graan maal zijn vruchtbaarheid.">Vruchtbaar</span>` +
      `<span>Nu</span><span>Volgend jaar</span></div>` +
      (velden.map((v, i) => veldRij(S, v, i)).join('') || '<p class="venster-staat">Hier zijn geen velden.</p>') +
      `<p class="veld-samen">${volgend}</p>` + kuddeRegel(S) +
      `<p class="venster-voet">Zolang dit open is, staat de tijd stil. <kbd>Esc</kbd> of <kbd>V</kbd> sluit.</p>`
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
    el: 'velden', knop: 'velden-knop', toets: 'v', open: (S) => T.ui.openVelden(S), sluit: (S) => T.ui.sluitVelden(S),
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

  $('velden-knop').addEventListener('click', (ev) => {
    ev.currentTarget.blur();
    if (T.S) T.ui.wisselVenster(T.S, 'velden');
  });

  // ── De spelregels (js/opties.js; spel.md, "Instelbaar") ──
  // Eén venster in drie delen: de keuzes, de namen, en de werkbank met alle getallen. Wat je
  // verandert, geldt meteen, en de browser onthoudt het. Zolang het open is, staat de tijd stil.
  // Namen typt de speler zelf, dus alles wat van hem komt, gaat door veilig() (bij de heer, hierboven).
  const alsGetal = (x) => (Number.isInteger(x) ? String(x) : String(Math.round(x * 1000) / 1000).replace('.', ','));

  function regelsInhoud() {
    // Een spelregel voor de toetsen en de speeltest (voorProeven) is geen keuze voor wie speelt.
    const keuzes = T.OPTIES.filter((o) => !o.voorProeven).map((o) => {
      const nu = T.optieKeuze(o.id);
      const gekozen = o.keuzes.find((k) => k.id === nu);
      const knoppen = o.keuzes
        .map((k) => `<button class="regel-keuze${k.id === nu ? ' gekozen' : ''}" data-optie="${o.id}" data-keuze="${k.id}" title="${veilig(k.uitleg)}">${k.naam}${k.id === o.standaard ? '<small>standaard</small>' : ''}</button>`)
        .join('');
      return (
        `<div class="regel"><div class="regel-naam">${o.naam}<small>${o.uitleg}</small></div>` +
        `<div class="regel-keuzes">${knoppen}</div><p class="regel-uitleg">${gekozen ? gekozen.uitleg : ''}</p></div>`
      );
    }).join('');
    const namen = T.NAAM_OPTIES.map((id) => {
      // Wie een boer nu is en wat hij kan (js/boeren.js), zoals het poppetje het in dit spel heeft.
      const e = T.S && T.S.wereld && T.S.wereld.wezens.find((x) => x.wie === id);
      const over = e ? T.overBoerTekst(e) : '';
      const wie = id === 'heer' ? 'de heer, die standaard geen naam heeft' : over;
      const leeg = id === 'heer' ? 'de heer' : T.standaardNaam(id);
      return (
        `<label class="naam-rij"><input type="text" maxlength="30" data-naam="${id}" value="${veilig(T.OPTIES_NU.namen[id] || '')}" placeholder="${veilig(leeg)}">` +
        `<span>${veilig(wie)}</span></label>`
      );
    }).join('');
    const werkbank = T.WERKBANK.map((deel, i) => {
      const rijen = T.werkbankGetallen(deel).map((g) => {
        const b = T.werkbankBereik(g.standaard);
        const door = g.doorOptie ? `<small>via ${veilig(g.doorOptie)}</small>` : '';
        return (
          `<div class="werk-rij${g.eigen ? ' eigen' : ''}" data-rij="${g.pad}"><span class="werk-naam">${veilig(g.label)}${door}</span>` +
          `<input type="range" min="${b.min}" max="${Math.max(b.max, g.waarde)}" step="${b.stap}" value="${g.waarde}" data-pad="${g.pad}">` +
          `<input type="number" step="${b.stap}" value="${g.waarde}" data-pad="${g.pad}">` +
          `<button class="werk-terug" data-terug="${g.pad}" title="Terug naar ${alsGetal(g.standaard)}"${g.eigen ? '' : ' disabled'}>↺</button></div>`
        );
      }).join('');
      return `<details class="werk-deel" data-deel="${i}"><summary>${deel.naam}</summary>${rijen}</details>`;
    }).join('');
    return (
      `<div class="venster-kop"><span class="venster-titel">Spelregels</span><span class="venster-wanneer">wat je zelf instelt</span>` +
      `<button class="venster-sluit" data-actie="sluit" title="Sluiten (Esc)">✕</button></div>` +
      `<p class="venster-staat">Wat je verandert, geldt meteen, ook midden in een spel, en de browser onthoudt het. De standaard is wat Marcel koos.</p>` +
      `<div class="kop">De regels</div>${keuzes}` +
      `<div class="kop">Namen, en wie de boeren zijn</div><div class="namen">${namen}</div>` +
      (T.lootBoeren && T.BOEREN_INSTELLINGEN && T.BOEREN_INSTELLINGEN.loten
        ? `<div class="regels-voet"><button data-actie="loot">Loot de boeren opnieuw</button><span>Een ander karakter en andere eigenschappen, nu meteen.</span></div>`
        : '') +
      `<div class="kop">Werkbank: alle getallen</div>` +
      `<p class="venster-staat">Elk getal uit de regels. Wat je hier zet, gaat vóór wat een regel hierboven zet; ↺ zet het terug.</p>${werkbank}` +
      `<div class="regels-voet"><button data-actie="terug">Alles terug naar de standaard</button>` +
      `<span>Zolang dit open is, staat de tijd stil. <kbd>Esc</kbd> sluit.</span></div>`
    );
  }

  // Opnieuw tekenen, maar met de open delen van de werkbank en de plek waar je was.
  function toonSpelregels() {
    const box = $('spelregels');
    const open = [...box.querySelectorAll('details[open]')].map((d) => d.dataset.deel);
    const waar = box.scrollTop;
    box.innerHTML = regelsInhoud();
    for (const d of box.querySelectorAll('details')) if (open.includes(d.dataset.deel)) d.open = true;
    box.scrollTop = waar;
  }

  T.ui.openSpelregels = function (S) {
    if (T.ui.openVenster(S, 'spelregels')) toonSpelregels();
  };

  T.ui.sluitSpelregels = function (S) {
    T.ui.sluitVenster(S, 'spelregels');
    // Wat een regel verandert, kan de balk raken (de snelheid van een dag, wat de heer vraagt).
    T.ui.toonVoorraad(S.dorp);
    T.ui.toonKalender(S);
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
    terug.title = `Terug naar ${alsGetal(g.standaard)}`;
  }

  $('spelregels').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    const S = T.S;
    if (!b || !S) return;
    b.blur();
    if (b.dataset.actie === 'sluit') {
      T.ui.sluitSpelregels(S);
    } else if (b.dataset.actie === 'terug') {
      T.optiesTerug(S);
      toonSpelregels();
    } else if (b.dataset.actie === 'loot') {
      T.lootBoeren(S.dorp);
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
    if (!S) return;
    if (el.dataset.naam) {
      T.zetNaam(el.dataset.naam, el.value, S);
    } else if (el.dataset.pad && el.value !== '' && Number.isFinite(Number(el.value))) {
      T.zetGetal(el.dataset.pad, Number(el.value), S);
      werkRijBij(el.dataset.pad);
    }
  });

  // Eén stand trager of sneller, langs T.SNELHEDEN (js/tijd.js: pauze, 1×, 3×, 10×, 30×).
  // T.zetSnelheid onthoudt de laatste snelheid, zodat P na een stapje terug weer daar hervat. Wie
  // slaapt en zelf aan de tijd komt, is wakker (js/dag.js).
  function stapSnelheid(delta) {
    const S = T.S;
    if (!S || !S.kalender) return;
    if (S.slaap && T.wordWakker) T.wordWakker(S);
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
    if (T.S.slaap && T.wordWakker) T.wordWakker(T.S);
    T.zetSnelheid(T.S, Number(b.dataset.snelheid));
  });

  // De tijd stil, of weer op de snelheid van ervoor: P, en de zandloper op tafel (js/tafel.js).
  T.ui.wisselPauze = function (S) {
    const k = S.kalender;
    if (S.slaap) T.wordWakker(S);
    T.zetSnelheid(S, k.snelheid > 0 ? 0 : k.laatsteSnelheid || 1);
  };

  // Slapen tot de ochtend, of wakker worden: Z, en de kaars op tafel (js/tafel.js).
  T.ui.wisselSlapen = function (S) {
    if (S.slaap) T.wordWakker(S);
    else T.gaSlapen(S);
  };

  $('slaap-knop').addEventListener('click', (ev) => {
    ev.currentTarget.blur();
    if (T.S && T.S.kalender) T.ui.wisselSlapen(T.S);
  });

  // P, Z, - en = botsen nergens mee: de spatie en 1-4 zijn van het gevecht (CLAUDE.md). Z is slapen
  // tot de ochtend, of wakker worden (js/dag.js).
  window.addEventListener('keydown', (ev) => {
    if (!T.NIEUWE_HUD || !T.S || !T.S.kalender) return;
    // Niet terwijl je een naam typt, en niet in de spelregels of de velden (daar staat de tijd
    // bewust stil).
    if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA')) return;
    if (T.S.modus === 'spelregels' || T.S.modus === 'velden') return;
    if (ev.key === 'p' || ev.key === 'P') {
      T.ui.wisselPauze(T.S);
    } else if (ev.key === 'z' || ev.key === 'Z') {
      T.ui.wisselSlapen(T.S);
    } else if (ev.key === '-' || ev.key === '_') {
      stapSnelheid(-1);
    } else if (ev.key === '=' || ev.key === '+') {
      stapSnelheid(1);
    }
  });
})(globalThis.Spel = globalThis.Spel || {});
