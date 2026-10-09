// De knoppen en teksten over het beeld heen: leven, actiepunten, beurtvolgorde, berichten,
// gesprekken en de schermen voor begin en einde. Het beeld zelf staat in tekenen.js; hier
// staat alleen html.
(function (T) {
  'use strict';

  const $ = (id) => document.getElementById(id);
  let vorigeAp = '';
  let vorigeTip = '';
  let keuzes = [];

  const SLEUTEL_ICOON =
    '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">' +
    '<circle cx="7" cy="12" r="4.2" fill="none" stroke="#e2b64a" stroke-width="2.4"/>' +
    '<path d="M11 12h10M17 12v4M20.5 12v3" stroke="#e2b64a" stroke-width="2.4" stroke-linecap="round" fill="none"/>' +
    '</svg>';
  const ICONEN = [['sleutel', 'IJzeren sleutel', SLEUTEL_ICOON]];

  // De opdracht van dit moment (een quest), linksboven. Het element staat
  // niet in index.html maar wordt hier gemaakt, zoals het portret in js/dialoog.js, en de opmaak
  // staat erbij. Alleen als de tekst verandert, wordt hij aangeraakt.
  let opdrachtEl = null;
  let vorigeOpdracht = null;
  function opdrachtVak() {
    if (opdrachtEl) return opdrachtEl;
    opdrachtEl = document.createElement('div');
    opdrachtEl.id = 'opdracht';
    opdrachtEl.className = 'paneel verborgen';
    Object.assign(opdrachtEl.style, {
      position: 'fixed', left: '16px', top: '128px', width: '260px', padding: '8px 12px 9px',
      fontSize: '13px', lineHeight: '1.5', pointerEvents: 'none',
    });
    document.body.appendChild(opdrachtEl);
    return opdrachtEl;
  }

  T.ui = {
    reset(S) {
      $('berichten').innerHTML = '';
      vorigeAp = '';
      this.toonSluipen(false);
      this.toonInventaris(S);
      this.toonGoud();
      this.toonGevecht(false);
      this.zetKnoppen(false);
      this.sluitDialoog();
      this.verbergOverlay();
      this.verbergTooltip();
      this.opdracht(null);
      this.toonOverzicht(S); // een geladen of nieuw spel volgt de schout weer
      $('terug').classList.add('verborgen'); // wat er gebeurde toen je op reis was (js/landkaart.js)
      // De kalender en de voorraad van het gehuchtspel (js/hud.js); dat bestand laadt na dit
      // bestand, dus staan de functies er dan al, maar niet als ui.js ooit alleen gebruikt wordt.
      if (this.toonKalender) this.toonKalender(S);
      // De balk is die van je eigen dorp (js/dorp.js): met het spel zelf (S) bleef hij leeg tot er iets veranderde.
      if (this.toonVoorraad && S.dorp) this.toonVoorraad(S.dorp);
      if (this.toonBevolking && S.dorp) this.toonBevolking(S.dorp);
      if (this.toonStatussen && S.dorp && S.dorp.kalender) this.toonStatussen(S.dorp); // honger, droogte, ... (js/hud.js)
    },

    // Het overzicht (js/main.js, Tab; werklijst vraag 108, a): het label bovenin zegt hoe je kijkt en hoe je terugkomt.
    toonOverzicht(S) {
      $('overzicht-label').classList.toggle('verborgen', !S.overzicht);
    },

    toonSluipen(aan) {
      $('sluip-knop').classList.toggle('aan', aan);
    },

    toonInventaris(S) {
      $('inventaris').innerHTML = ICONEN.filter(([id]) => S.inventaris.has(id))
        .map(([, titel, icoon]) => `<div class="item" title="${titel}">${icoon}</div>`)
        .join('');
    },

    // Wat er nu van je gevraagd wordt; null laat het vak verdwijnen. `tekst` mag <kbd> bevatten.
    // De kop zegt wie het vraagt: de naam van de quest. Daaronder de raad (js/raad.js), met een
    // toets tussen haken ([B]) als toets.
    opdracht(tekst, kop, raad) {
      const nu = tekst || raad ? `${kop || 'Te doen'}|${tekst || ''}|${raad || ''}` : null;
      if (nu === vorigeOpdracht) return;
      vorigeOpdracht = nu;
      const el = opdrachtVak();
      el.classList.toggle('verborgen', !nu);
      if (nu) {
        el.innerHTML =
          `<div style="font: 12px var(--kop); color: var(--gedempt); letter-spacing: 0.04em">${kop || 'Te doen'}</div>` +
          (tekst ? `<div>${tekst}</div>` : '') +
          (raad ? `<div class="raad" style="${tekst ? 'margin-top: 6px; padding-top: 6px; border-top: 1px solid var(--rand); ' : ''}color: var(--goud)">${raad.replace(/\[([^\]]+)\]/g, '<kbd>$1</kbd>')}</div>` : '');
      }
    },

    // Goud, naast sluipen. Het vakje komt pas als je ooit goud had: een leeg vakje dat nul
    // zegt is alleen maar ruis.
    toonGoud() {
      const S = T.S;
      const el = $('goud');
      if (!el || !S.dorp) return;
      el.classList.toggle('verborgen', !S.dorp.goudGehad);
      $('goud-aantal').textContent = S.dorp.goud || 0;
    },

    // De gevechtsbalken schuiven in en uit beeld via één klasse op body, zodat de overgang
    // net zo glijdt als het raster op de vloer.
    toonGevecht(aan) {
      document.body.classList.toggle('in-gevecht', aan);
      vorigeAp = '';
    },

    toonVolgorde(S) {
      const g = S.gevecht;
      if (!g) return;
      $('volgorde').innerHTML =
        g.volgorde
          .map((e, i) => {
            // Het leven dat nog over is, bij de schout net als bij een monster.
            const stand = e.leven;
            return `<div class="chip ${e.kant}${i === g.beurt ? ' aan' : ''}"><span>${T.hoofdletter(e.naam)}</span><small>${stand}</small></div>`;
          })
          .join('') + `<div class="ronde">Ronde ${g.ronde}</div>`;
    },

    // kosten: wat de handeling onder de muis zou kosten; die punten lichten op.
    // kan = false: dat past niet meer in deze beurt, dan kleuren ze rood.
    toonAp(ap, max, kosten, kan) {
      const sleutel = [ap, max, kosten, kan].join('|');
      if (sleutel === vorigeAp) return;
      vorigeAp = sleutel;
      let html = '<span class="ap-label">AP</span>';
      for (let i = 0; i < max; i++) {
        let c = 'pip';
        if (i < ap) {
          c += ' vol';
          if (kosten > 0 && !kan) c += ' tekort';
          else if (kosten > 0 && i >= ap - kosten) c += ' kost';
        }
        html += `<span class="${c}"></span>`;
      }
      $('ap').innerHTML = html;
    },

    zetKnoppen(aan, actie) {
      for (const b of document.querySelectorAll('#knoppen button')) {
        b.disabled = !aan;
        b.classList.toggle('gekozen', !!aan && b.dataset.actie === actie);
      }
    },

    // De deurknop staat er alleen als wie aan de beurt is (de schout of een man van de militie) naast een open deur staat.
    toonDeurKnop(zichtbaar, kan) {
      const b = document.querySelector('#knoppen button[data-actie="deur"]');
      b.classList.toggle('verborgen', !zichtbaar);
      b.disabled = !kan;
    },

    bericht(tekst, soort) {
      // Is de schout op reis (js/land.js), dan hoort hij het als hij terug is: het bericht wacht in S.land.
      if (T.S && T.opReis(T.S)) {
        T.bewaarVoorLater(T.S, tekst, soort);
        return;
      }
      const box = $('berichten');
      // Dezelfde melding vlak achter elkaar ("Daar kun je niet komen.", vier keer geklikt) wordt
      // één regel met een teller, en komt weer vers onderaan in beeld, in plaats van de hele
      // lijst te vullen met hetzelfde.
      const laatste = box.lastElementChild;
      if (laatste && laatste.dataset.tekst === tekst && laatste.dataset.soort === (soort || '')) {
        const keer = Number(laatste.dataset.keer || 1) + 1;
        laatste.dataset.keer = keer;
        laatste.textContent = `${tekst} (${keer}×)`;
        // Het vervagen opnieuw laten beginnen, anders telt hij op in een regel die al half weg is.
        laatste.style.animation = 'none';
        void laatste.offsetWidth;
        laatste.style.animation = '';
        return;
      }
      const el = document.createElement('div');
      el.className = 'bericht' + (soort ? ' ' + soort : '');
      el.textContent = tekst;
      el.dataset.tekst = tekst;
      el.dataset.soort = soort || '';
      box.appendChild(el);
      while (box.children.length > 5) box.removeChild(box.firstChild);
    },

    // De naam van een kamer, groot in beeld, als je er voor het eerst binnenloopt.
    plek(naam) {
      const el = $('plek');
      el.textContent = naam;
      el.classList.remove('toon');
      void el.offsetWidth;
      el.classList.add('toon');
    },

    tooltip(tekst, x, y, fout) {
      const el = $('tooltip');
      const sleutel = tekst + '|' + (fout ? 1 : 0);
      if (sleutel !== vorigeTip) {
        el.textContent = tekst;
        el.classList.toggle('fout', !!fout);
        vorigeTip = sleutel;
      }
      el.classList.remove('verborgen');
      el.style.left = Math.min(x + 16, window.innerWidth - el.offsetWidth - 8) + 'px';
      el.style.top = y + 18 + 'px';
    },

    verbergTooltip() {
      $('tooltip').classList.add('verborgen');
      vorigeTip = '';
    },

    toonDialoog(naam, tekst, lijst, wie) {
      keuzes = lijst;
      $('dialoog-naam').textContent = naam;
      // Onder de naam: wie hij is en wat hij kan (een boer, js/boeren.js); anders niets.
      $('dialoog-wie').textContent = wie || '';
      $('dialoog-wie').classList.toggle('verborgen', !wie);
      $('dialoog-tekst').textContent = tekst;
      const box = $('dialoog-keuzes');
      box.innerHTML = '';
      lijst.forEach((k, i) => {
        const b = document.createElement('button');
        b.innerHTML = `<kbd>${i + 1}</kbd>`;
        b.appendChild(document.createTextNode(k.tekst));
        // Wat het kost of oplevert (een voorval, js/voorvallen.js), onder het antwoord; kan het niet, dan staat de
        // knop uit, met erbij waarom.
        if (k.prijs) {
          const p = document.createElement('span');
          p.className = 'dialoog-prijs';
          p.textContent = k.kan === false && k.waarom ? `${k.prijs} · ${k.waarom}` : k.prijs;
          b.appendChild(p);
        }
        b.disabled = k.kan === false;
        b.addEventListener('click', () => k.kies());
        box.appendChild(b);
      });
      $('dialoog').classList.remove('verborgen');
      this.verbergTooltip();
    },

    sluitDialoog() {
      keuzes = [];
      $('dialoog').classList.add('verborgen');
    },

    kiesKeuze(i) {
      const k = keuzes[i];
      if (k && k.kan !== false) k.kies();
    },

    // Een scherm over het spel, met een knop; `tweede` is een tweede knop ({ knop, opKlik }), zoals Verder spelen naast
    // Naar het titelscherm als je wint (js/hud.js, T.ui.toonGewonnen).
    toonOverlay(titel, html, knop, opKlik, tweede) {
      $('overlay-titel').textContent = titel;
      $('overlay-tekst').innerHTML = html;
      const b = $('overlay-knop');
      b.textContent = knop;
      b.onclick = () => {
        this.verbergOverlay();
        opKlik();
      };
      const b2 = $('overlay-knop2');
      b2.classList.toggle('verborgen', !tweede);
      if (tweede) {
        b2.textContent = tweede.knop;
        b2.onclick = () => {
          this.verbergOverlay();
          tweede.opKlik();
        };
      }
      $('overlay').classList.remove('verborgen');
      this.verbergTooltip();
    },

    verbergOverlay() {
      $('overlay').classList.add('verborgen');
    },
  };

  // ── Eén manier om een venster te openen en te sluiten (vraag 146, b2) ──
  // Een venster meldt zich één keer aan: T.ui.meldVenster(naam, { el, knop, toets, typt, open, sluit }). Zijn eigen open
  // en sluit (T.ui.openWetten, ...) doen wat alleen dat venster doet, en roepen voor de rest T.ui.openVenster en
  // T.ui.sluitVenster aan: openen sluit eerst het venster dat open is en de brief, legt een gebouw in de hand weg, zet
  // S.modus op de naam van het venster, houdt de tijd stil onder die naam (js/tijd.js) en zet zijn knop aan; sluiten doet
  // het omgekeerde. Er is dus altijd hooguit één venster open (T.ui.vensterOpen), en geen venster hoeft de andere te
  // kennen. De brief, een gesprek, het menu en de kaart van het land zijn hier geen venster: die hebben hun eigen gang.
  const VENSTERS = {};

  T.ui.meldVenster = function (naam, v) {
    VENSTERS[naam] = v;
  };

  T.ui.vensterOpen = function () {
    for (const naam in VENSTERS) if (!$(VENSTERS[naam].el).classList.contains('verborgen')) return naam;
    return null;
  };

  // Wat er open is, dicht, met zijn eigen sluit. Geeft false als het niet dicht wil (de heer bij de schandpaal: daar moet
  // je kiezen).
  T.ui.sluitOpenVenster = function (S) {
    const nu = T.ui.vensterOpen();
    if (!nu) return true;
    VENSTERS[nu].sluit(S);
    return T.ui.vensterOpen() !== nu;
  };

  // Geeft false als het venster dat open is, niet dicht wil; dan opent het nieuwe niet.
  T.ui.openVenster = function (S, naam) {
    if (T.ui.vensterOpen() !== naam && !T.ui.sluitOpenVenster(S)) return false;
    if (T.ui.briefOpen()) T.ui.sluitBrief(S);
    S.modus = naam;
    S.bouwSoort = null;
    S.bouwMenuOpen = false;
    T.ui.toonBouwmenu(S);
    T.ui.verbergTooltip();
    T.houdTijdStil(S, naam);
    const v = VENSTERS[naam];
    $(v.el).classList.remove('verborgen');
    if (v.knop) $(v.knop).classList.add('actief');
    return true;
  };

  T.ui.sluitVenster = function (S, naam) {
    const v = VENSTERS[naam];
    $(v.el).classList.add('verborgen');
    if (v.knop) $(v.knop).classList.remove('actief');
    if (S.modus === naam) S.modus = 'verkennen';
    T.laatTijdGaan(S, naam);
  };

  // Een knop in de balk, of de toets van een venster bij het rondlopen: open is dicht, dicht is open (en wat er open was,
  // gaat dicht). Alleen bij het rondlopen gaat er een open, niet midden in een gesprek of een gevecht.
  T.ui.wisselVenster = function (S, naam) {
    const v = VENSTERS[naam];
    if (T.ui.vensterOpen() === naam) {
      v.sluit(S);
      return;
    }
    if (T.ui.sluitOpenVenster(S) && S.modus === 'verkennen') v.open(S);
  };

  T.ui.vensterMetToets = function (toets) {
    const k = (toets || '').toLowerCase();
    for (const naam in VENSTERS) if (VENSTERS[naam].toets === k) return naam;
    return null;
  };

  // Een toets terwijl er een venster open is (js/main.js). Esc sluit het. Heeft het een toets en typ je er niet in (in de
  // spelregels typ je namen), dan sluit zijn eigen toets het ook, en gaat de toets van een ander venster of B (het
  // bouwmenu) er meteen heen: dan sluit het hier en geeft het false, zodat js/main.js het andere opent. Verder ligt alles
  // stil. Geeft true als de toets op is.
  T.ui.toetsBijVenster = function (S, ev) {
    const naam = T.ui.vensterOpen();
    if (!naam) return false;
    const v = VENSTERS[naam];
    const k = (ev.key || '').toLowerCase();
    if (k === 'escape') {
      v.sluit(S);
      return true;
    }
    if (!v.toets || v.typt) return true;
    if (k === v.toets) {
      v.sluit(S);
      return true;
    }
    if (k === 'b' || T.ui.vensterMetToets(k)) {
      v.sluit(S);
      return false;
    }
    return true;
  };
})(globalThis.Spel = globalThis.Spel || {});
