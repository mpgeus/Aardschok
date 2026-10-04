// Het titelscherm en het menu (werklijst punt 3, vraag 48; Marcel, 28 sep: "Auto opslaan, maar ook zelf kunnen
// kiezen. Er moet ook een menu komen titel scherm etc", en op het plan: "A ja B ja C ja D ja").
//
// Het spel opent op het titelscherm: de naam, en Verder, Nieuw spel, Laden en Spelregels. Achter het scherm
// wacht een nieuw spel, stil, en de camera glijdt langzaam rond het plein (js/main.js, T.titelCamera). In
// het spel opent Esc, of de knop Menu, het menu: Verder spelen, Opslaan, Laden, Spelregels en Naar het
// titelscherm. Allebei zetten ze de tijd stil ('titel' en 'menu'). De regels van opslaan en laden staan in
// js/opslaan.js; dit bestand is alleen scherm.
(function (T) {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const veilig = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  // Wat er open is: het titelscherm of het menu, of niets. Daarin misschien de lijst met plekken ('opslaan'
  // of 'laden'), een vraag die eerst beantwoord moet worden, en wat er net gebeurde.
  let scherm = null;
  let lijst = null;
  let vraag = null; // { tekst, ja, doe }
  let melding = null;
  // Bij Nieuw spel eerst de naam van je dorp (Marcel, 29 sep, werklijst vraag 60): het voorstel dat in het veld staat.
  let naamVoorstel = null;

  T.ui.titelOpen = () => scherm === 'titel';
  T.ui.menuOpen = () => scherm === 'menu';

  // ── Hoe een bewaard spel heet ──

  const naamVanPlek = (plek) => (plek === 'auto' ? 'Vanzelf bewaard' : `Plek ${plek}`);

  // Wanneer, in echte tijd: "vandaag 21:40", "gisteren 9:12", of "27 sep 14:03".
  function wanneer(ms) {
    if (!ms) return '';
    const d = new Date(ms);
    const tijd = d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    const middernacht = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const dagen = Math.round((middernacht(new Date()) - middernacht(d)) / 86400000);
    if (dagen === 0) return `vandaag ${tijd}`;
    if (dagen === 1) return `gisteren ${tijd}`;
    return `${d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })} ${tijd}`;
  }

  // Een bewaard spel in één regel: hoe het dorp heet, de dag in het spel, hoe laat, hoeveel mensen, en wanneer je
  // opsloeg. Een spel van vóór 29 sep heeft geen naam.
  const beschrijf = (kop) =>
    `${kop.naam ? `${kop.naam} · ` : ''}${T.datumVanDag(kop.dag).tekst}, ${T.uurTekst(kop.dag)} · ${kop.bevolking} mensen · ${wanneer(kop.bewaardOm)}`;

  // ── Wat er te zien is ──

  function knop(actie, tekst, { uitleg = '', hoofd = false, uit = null, plek = null } = {}) {
    return (
      `<button class="menu-knop${hoofd ? ' hoofd' : ''}" data-actie="${actie}"${plek ? ` data-plek="${plek}"` : ''}${uit ? ' disabled' : ''}>` +
      `<span>${tekst}</span>${uit || uitleg ? `<small>${veilig(uit || uitleg)}</small>` : ''}</button>`
    );
  }

  function hoofdKnoppen(S) {
    const spellen = T.opgeslagenSpellen();
    if (scherm === 'titel') {
      const nieuwste = spellen.find((s) => !s.reden);
      return (
        (nieuwste ? knop('verder', 'Verder', { uitleg: beschrijf(nieuwste.kop), hoofd: true }) : '') +
        knop('nieuw', 'Nieuw spel', { hoofd: !nieuwste }) +
        (spellen.length ? knop('laden', 'Laden') : '') +
        knop('spelregels', 'Spelregels')
      );
    }
    return (
      knop('verder', 'Verder spelen', { hoofd: true }) +
      knop('opslaan', 'Opslaan', { uit: T.waaromNietOpslaan(S) }) +
      knop('laden', 'Laden', { uit: spellen.length ? null : 'Er is nog niets bewaard.' }) +
      knop('spelregels', 'Spelregels') +
      knop('titel', 'Naar het titelscherm')
    );
  }

  // De plekken: om op te slaan de vijf eigen, leeg of niet; om te laden alles wat er staat, het nieuwste
  // bovenaan (T.opgeslagenSpellen).
  function plekKnoppen() {
    const spellen = T.opgeslagenSpellen();
    if (lijst === 'opslaan') {
      return T.opslagPlekken()
        .filter((plek) => plek !== 'auto')
        .map((plek) => {
          const s = spellen.find((x) => x.plek === plek);
          return knop('bewaar', naamVanPlek(plek), { plek, uitleg: s ? (s.reden ? s.reden : beschrijf(s.kop)) : 'leeg' });
        })
        .join('');
    }
    return spellen.map((s) => knop('laad', naamVanPlek(s.plek), { plek: s.plek, uitleg: beschrijf(s.kop), uit: s.reden })).join('');
  }

  function inhoud(S) {
    let midden;
    if (vraag) midden = `<p class="menu-vraag">${veilig(vraag.tekst)}</p>` + knop('ja', vraag.ja, { hoofd: true }) + knop('terug', 'Terug');
    else if (naamVoorstel != null) {
      // Het land (vraag 112, a): zijn nummer, om een land dat je mooi vond opnieuw te spelen, en een ander land.
      const land = landNu(S);
      midden =
        `<label class="menu-kop" for="dorpsnaam">Hoe heet je dorp?</label>` +
        `<input id="dorpsnaam" class="menu-invoer" type="text" maxlength="24" autocomplete="off" spellcheck="false" value="${veilig(naamNu != null ? naamNu : naamVoorstel)}">` +
        (land != null
          ? `<label class="menu-kop" for="landzaad">Het land</label>` +
            `<div class="menu-land"><input id="landzaad" class="menu-invoer" type="text" inputmode="numeric" maxlength="5" autocomplete="off" spellcheck="false" value="${land}">` +
            `<button class="menu-knop" data-actie="anderland" title="Een ander land, uit een nieuw nummer"><span>Ander land</span></button></div>`
          : '') +
        knop('begin', 'Begin', { hoofd: true }) + knop('terug', 'Terug');
    }
    else if (lijst) midden = `<p class="menu-kop">${lijst === 'opslaan' ? 'Opslaan op' : 'Laden van'}</p>` + plekKnoppen() + knop('terug', 'Terug');
    else midden = hoofdKnoppen(S);
    const bericht = melding ? `<p class="menu-melding">${veilig(melding)}</p>` : '';
    if (scherm === 'titel') {
      const stand = T.STAND ? `<p class="menu-stand">${veilig(T.STAND)}</p>` : '';
      return `<div class="menu-titel"><h1 class="menu-naam">${veilig(T.NAAM)}</h1><div class="menu-knoppen">${bericht}${midden}</div></div>${stand}`;
    }
    const dag = S.kalender ? T.datumVanDag(S.kalender.dag).tekst : '';
    return (
      `<div class="paneel menu-venster">` +
      `<div class="venster-kop"><span class="venster-titel">Menu</span><span class="venster-wanneer">${dag}</span>` +
      `<button class="venster-sluit" data-actie="verder" title="Sluiten (Esc)">✕</button></div>` +
      `<div class="menu-knoppen">${bericht}${midden}</div></div>`
    );
  }

  function toon(S) {
    const doos = $('menu');
    doos.className = scherm || 'verborgen';
    if (scherm) doos.innerHTML = inhoud(S);
    const veld = $('dorpsnaam');
    if (veld) {
      veld.focus();
      veld.select();
    }
  }

  // ── Open en dicht ──

  T.ui.toonTitel = function (S) {
    scherm = 'titel';
    lijst = null;
    vraag = null;
    melding = null;
    naamVoorstel = null;
    T.houdTijdStil(S, 'titel');
    document.body.classList.add('titelscherm');
    S.camera = T.titelCamera(); // meteen goed, zonder eerst over het dorp te schuiven
    toon(S);
  };

  // Het menu gaat alleen open als er niets anders openstaat: in een venster sluit Esc eerst dat venster
  // (js/main.js), en de brief net zo.
  T.ui.openMenu = function (S) {
    if (scherm || (S.modus !== 'verkennen' && S.modus !== 'gevecht') || T.ui.briefOpen()) return;
    scherm = 'menu';
    lijst = null;
    vraag = null;
    melding = null;
    S.bouwSoort = null; // een gebouw dat nog aan de muis hing, ligt weer weg
    S.bouwMenuOpen = false;
    T.ui.toonBouwmenu(S);
    T.houdTijdStil(S, 'menu');
    $('menu-knop').classList.add('actief');
    toon(S);
  };

  // Het titelscherm dicht zonder iets te kiezen (Spel.debug.laden, js/main.js).
  T.ui.sluitTitel = (S) => {
    if (scherm === 'titel') sluit(S);
  };

  function sluit(S) {
    const was = scherm;
    scherm = null;
    lijst = null;
    vraag = null;
    melding = null;
    naamVoorstel = null;
    document.body.classList.remove('titelscherm');
    $('menu-knop').classList.remove('actief');
    toon(S);
    if (was) T.laatTijdGaan(S, was);
  }

  // ── Wat een knop doet ──

  // Nieuw spel: eerst de naam van je dorp, met een voorstel (T.voorgesteldeDorpsnaam, js/treden.js). Het spel zelf
  // wacht al achter het titelscherm.
  function kiesNaam(S) {
    // Zette je de spelregel "Je gehucht" om nadat dit spel klaarstond, dan eerst een vers spel (js/main.js), dat net
    // zo stil achter het titelscherm wacht.
    if (T.gehuchtNaarDeSpelregel()) {
      T.houdTijdStil(S, 'titel');
      S.camera = T.titelCamera();
    }
    naamVoorstel = T.voorgesteldeDorpsnaam(S.dorp.lot && S.dorp.lot.zaad);
    toon(S);
  }

  // Het nummer van het land achter het titelscherm, of null als het het ontworpen gehucht is (js/maker.js).
  const landNu = (S) => (T.MAKER_INSTELLINGEN.eigenGehucht && S.wereld && S.wereld.maker ? S.wereld.maker.zaad : null);
  // Wat er in het veld van de naam staat, als je het land verandert: dat blijft staan (tenzij het het voorstel was).
  let naamNu = null;

  // Een ander land achter het menu, uit dit nummer: een vers spel (js/main.js), dat net zo stil wacht. Het voorstel voor
  // de naam hoort bij het land; wie zelf een naam typte, houdt die.
  function naarLand(S, zaad) {
    const veld = $('dorpsnaam');
    const getypt = veld && veld.value.trim();
    naamNu = getypt && getypt !== naamVoorstel ? getypt : null;
    T.nieuwSpel(zaad);
    T.houdTijdStil(S, 'titel');
    S.camera = T.titelCamera();
    naamVoorstel = T.voorgesteldeDorpsnaam(S.dorp.lot && S.dorp.lot.zaad);
  }

  // Het nummer in het veld van het land, als het een land is (1 tot T.MAKER_INSTELLINGEN.zaden), anders null.
  function gekozenLand() {
    const veld = $('landzaad');
    const n = veld && /^\d+$/.test(veld.value.trim()) ? Number(veld.value.trim()) : null;
    return n != null && n >= 1 && n <= T.MAKER_INSTELLINGEN.zaden ? n : null;
  }

  // Begin: de naam die er staat (leeg is het voorstel), op het land dat er staat, en dan de brief van de heer.
  function begin(S) {
    const land = gekozenLand();
    if (land != null && land !== landNu(S)) naarLand(S, land);
    const veld = $('dorpsnaam');
    T.zetDorpsnaam(S.dorp, (veld && veld.value.trim()) || naamVoorstel);
    naamNu = null;
    sluit(S);
    T.ui.toonBrief(S.dorp, 'benoeming'); // een nieuw spel begint met de brief van de heer (js/brieven.js)
  }

  function laad(S, plek) {
    const r = T.laadSpel(plek); // js/main.js: een nieuw spel, en het bewaarde erover
    if (!r.gelukt) {
      melding = r.reden;
      lijst = null;
      toon(S);
      return;
    }
    sluit(S);
    T.ui.bericht(`${naamVanPlek(plek)} geladen: ${T.datumVanDag(r.kop.dag).tekst}.`, 'goed');
  }

  function bewaar(S, plek) {
    const r = T.slaOp(S, plek);
    melding = r.gelukt ? `Opgeslagen op ${naamVanPlek(plek).toLowerCase()}.` : r.reden;
    lijst = null;
    toon(S);
  }

  function doe(S, actie, plek) {
    melding = null;
    if (actie === 'ja') {
      const v = vraag;
      vraag = null;
      v.doe();
      return;
    }
    if (actie === 'terug') {
      if (vraag) vraag = null;
      else if (naamVoorstel != null) naamVoorstel = naamNu = null;
      else lijst = null;
    } else if (actie === 'verder') {
      if (scherm === 'menu') return sluit(S);
      const nieuwste = T.nieuwsteSpel();
      if (nieuwste) return laad(S, nieuwste.plek);
    } else if (actie === 'nieuw') {
      // Wie een nieuw spel begint, overschrijft straks wat er vanzelf bewaard is; zijn eigen plekken niet.
      if (T.opgeslagenSpellen().some((s) => s.plek === 'auto')) {
        vraag = {
          tekst: 'Een nieuw spel beginnen? Wat er vanzelf bewaard is, wordt dan overschreven. Je eigen plekken blijven.',
          ja: 'Nieuw spel',
          doe: () => kiesNaam(S),
        };
      } else {
        return kiesNaam(S);
      }
    } else if (actie === 'begin') {
      return begin(S);
    } else if (actie === 'anderland') {
      naarLand(S, T.nieuwLandZaad());
    } else if (actie === 'opslaan' || actie === 'laden') {
      lijst = actie;
    } else if (actie === 'spelregels') {
      return T.ui.openSpelregels(S); // over het menu heen; dicht is weer het menu
    } else if (actie === 'titel') {
      vraag = {
        tekst: 'Naar het titelscherm? Wat je sinds het laatste opslaan deed, ben je kwijt.',
        ja: 'Naar het titelscherm',
        doe: () => {
          sluit(S);
          T.naarTitelscherm();
        },
      };
    } else if (actie === 'bewaar') {
      const s = T.opgeslagenSpellen().find((x) => x.plek === plek);
      if (!s) return bewaar(S, plek);
      vraag = {
        tekst: `${naamVanPlek(plek)} overschrijven? Daar staat nu ${s.reden ? 'een spel dat niet meer past' : beschrijf(s.kop)}.`,
        ja: 'Overschrijven',
        doe: () => bewaar(S, plek),
      };
    } else if (actie === 'laad') {
      // Midden in een spel eerst vragen; op het titelscherm is er nog niets om kwijt te raken.
      if (scherm === 'titel') return laad(S, plek);
      vraag = { tekst: 'Dit spel laden? Wat je sinds het laatste opslaan deed, ben je kwijt.', ja: 'Laden', doe: () => laad(S, plek) };
    }
    toon(S);
  }

  $('menu').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    if (!b || b.disabled || !T.S) return;
    b.blur();
    doe(T.S, b.dataset.actie, b.dataset.plek);
  });
  $('menu-knop').addEventListener('click', (ev) => {
    ev.currentTarget.blur();
    if (!T.S) return;
    if (scherm === 'menu') sluit(T.S);
    else T.ui.openMenu(T.S);
  });

  // Zolang het titelscherm of het menu open is, zijn de toetsen van hier: vóór die van het spel (js/main.js)
  // en de kalender (js/hud.js), die ze dus niet meer zien. Esc gaat een stap terug, of sluit het menu. Liggen
  // de spelregels erbovenop, dan zijn de toetsen van hen.
  window.addEventListener(
    'keydown',
    (ev) => {
      if (!scherm || !T.S || T.ui.spelregelsOpen()) return;
      ev.stopImmediatePropagation();
      if (ev.key === 'Enter' && naamVoorstel != null) {
        ev.preventDefault();
        return doe(T.S, 'begin');
      }
      if (ev.key !== 'Escape') return;
      if (vraag || lijst || naamVoorstel != null) doe(T.S, 'terug');
      else if (scherm === 'menu') sluit(T.S);
    },
    true,
  );

  // ── Vanzelf opgeslagen ──

  // Elke ochtend (js/main.js, T.werkOpslaanBij): één woord in de hoek, dat weer wegvaagt. Lukte het niet, dan
  // zegt een bericht waarom, één keer zolang het spel open is.
  let fout = null;
  T.ui.opgeslagen = function (r) {
    if (!r.gelukt) {
      if (fout !== r.reden) {
        fout = r.reden;
        T.ui.bericht(`Het spel kon niet vanzelf opslaan: ${r.reden}`, 'gevaar');
      }
      return;
    }
    const el = $('opgeslagen');
    el.classList.remove('flits');
    void el.offsetWidth; // zo begint het vagen opnieuw
    el.classList.add('flits');
  };
})(globalThis.Spel = globalThis.Spel || {});
