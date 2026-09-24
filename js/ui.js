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
  const ICONEN = [
    ['sleutel', 'IJzeren sleutel', SLEUTEL_ICOON],
  ];

  // De opdracht van dit moment (js/tutorial.js of een quest), linksboven onder de leeftijd. Het element staat
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
      this.toonLeeftijd(S.held);
      this.toonSluipen(false);
      this.toonInventaris(S);
      this.toonGoud(S);
      this.toonGevecht(false);
      this.zetKnoppen(false);
      this.sluitDialoog();
      this.verbergOverlay();
      this.verbergTooltip();
      this.opdracht(null);
      // De kalender en de voorraad van het gehuchtspel (js/hud.js); dat bestand laadt na dit
      // bestand, dus staan de functies er dan al, maar niet als ui.js ooit alleen gebruikt wordt.
      if (this.toonKalender) this.toonKalender(S);
      if (this.toonVoorraad) this.toonVoorraad(S);
    },

    // De leeftijd is de levensbalk. De balk loopt van zeventig tot honderd en vult zich: hoe
    // voller, hoe minder tijd er over is.
    toonLeeftijd(held) {
      const m = held.leeftijd;
      const f = Math.min(1, Math.max(0, (m - 70 * 12) / (30 * 12)));
      const vul = $('leeftijd-vul');
      vul.style.width = Math.round(f * 100) + '%';
      vul.classList.toggle('laat', T.jaren(m) >= 95);
      $('leeftijd-jaren').textContent = T.leeftijdTekst(m);
      const rest = T.EINDLEEFTIJD - m;
      $('leeftijd-rest').textContent = rest > 0 ? `nog ${T.duurTekst(rest)}` : 'geen tijd meer';
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
    // De kop zegt wie het vraagt: de meester in de tutorial, anders de naam van de quest.
    opdracht(tekst, kop) {
      const nu = tekst ? `${kop || 'De meester vraagt'}|${tekst}` : null;
      if (nu === vorigeOpdracht) return;
      vorigeOpdracht = nu;
      const el = opdrachtVak();
      el.classList.toggle('verborgen', !tekst);
      if (tekst) {
        el.innerHTML =
          `<div style="font: 12px var(--kop); color: var(--gedempt); letter-spacing: 0.04em">${kop || 'De meester vraagt'}</div>` +
          `<div>${tekst}</div>`;
      }
    },

    // Goud, naast de leeftijd. Het vakje komt pas als je ooit goud had: in de tutorial heeft
    // niemand het erover, en een leeg vakje dat nul zegt is alleen maar ruis.
    toonGoud(S) {
      const el = $('goud');
      if (!el) return;
      el.classList.toggle('verborgen', !S.goudGehad);
      $('goud-aantal').textContent = S.goud || 0;
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
            const stand = e.kant === 'held' ? `${T.jaren(e.leeftijd)} jr` : e.leven;
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

    // De deurknop staat er alleen als de held naast een open deur staat.
    toonDeurKnop(zichtbaar, kan) {
      const b = document.querySelector('#knoppen button[data-actie="deur"]');
      b.classList.toggle('verborgen', !zichtbaar);
      b.disabled = !kan;
    },

    bericht(tekst, soort) {
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

    toonDialoog(naam, tekst, lijst) {
      keuzes = lijst;
      $('dialoog-naam').textContent = naam;
      $('dialoog-tekst').textContent = tekst;
      const box = $('dialoog-keuzes');
      box.innerHTML = '';
      lijst.forEach((k, i) => {
        const b = document.createElement('button');
        b.innerHTML = `<kbd>${i + 1}</kbd>`;
        b.appendChild(document.createTextNode(k.tekst));
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
      if (k) k.kies();
    },

    toonOverlay(titel, html, knop, opKlik) {
      $('overlay-titel').textContent = titel;
      $('overlay-tekst').innerHTML = html;
      const b = $('overlay-knop');
      b.textContent = knop;
      b.onclick = () => {
        this.verbergOverlay();
        opKlik();
      };
      $('overlay').classList.remove('verborgen');
      this.verbergTooltip();
    },

    verbergOverlay() {
      $('overlay').classList.add('verborgen');
    },
  };
})(globalThis.Toren = globalThis.Toren || {});
