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

  T.ui = {
    reset(S) {
      $('berichten').innerHTML = '';
      vorigeAp = '';
      this.toonLeeftijd(S.held);
      this.toonInventaris(S);
      this.toonGevecht(false);
      this.zetKnoppen(false);
      this.sluitDialoog();
      this.verbergOverlay();
      this.verbergTooltip();
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

    toonInventaris(S) {
      $('inventaris').innerHTML = S.inventaris.has('sleutel')
        ? `<div class="item" title="IJzeren sleutel">${SLEUTEL_ICOON}</div>`
        : '';
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
      const el = document.createElement('div');
      el.className = 'bericht' + (soort ? ' ' + soort : '');
      el.textContent = tekst;
      const box = $('berichten');
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
