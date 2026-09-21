// De knoppen en teksten over het beeld heen: leven, actiepunten, beurtvolgorde, berichten,
// gesprekken en de schermen voor begin en einde. Het beeld zelf staat in tekenen.js; hier
// staat alleen html.
(function (T) {
  'use strict';

  const $ = (id) => document.getElementById(id);
  let vorigeAp = '';
  let vorigeTip = '';
  let keuzes = [];
  const vorigeSpreuk = new Map(); // per spreuk: waaraan te zien is dat er iets veranderd is

  const SLEUTEL_ICOON =
    '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">' +
    '<circle cx="7" cy="12" r="4.2" fill="none" stroke="#e2b64a" stroke-width="2.4"/>' +
    '<path d="M11 12h10M17 12v4M20.5 12v3" stroke="#e2b64a" stroke-width="2.4" stroke-linecap="round" fill="none"/>' +
    '</svg>';

  T.ui = {
    reset(S) {
      $('berichten').innerHTML = '';
      vorigeAp = '';
      vorigeSpreuk.clear();
      this.toonSpreuken(S);
      this.toonLeeftijd(S.held);
      this.toonSluipen(false);
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

    toonSluipen(aan) {
      $('sluip-knop').classList.toggle('aan', aan);
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

    // De spreukbalk. Die staat er ook buiten een gevecht, want een dwaallicht en een windstoot
    // horen juist bij het rondlopen. Hij wordt elk beeld nagelopen, maar alleen aangeraakt als
    // er iets veranderd is: een gekozen spreuk, punten erbij of eraf, een trede hoger.
    toonSpreuken(S) {
      const box = $('spreukbalk');
      if (!box.children.length) bouwSpreuken(box);
      for (const id of T.SPREUK_VOLGORDE) {
        const eig = T.spreuk(S.held, id);
        const v = T.voortgang(S.held, id);
        const waarom = T.waaromNiet(S, id);
        const sleutel = [eig.ap, eig.maanden, v.aantal, v.trede, S.spreuk === id, waarom || ''].join('|');
        const knop = box.querySelector(`[data-spreuk="${id}"]`);
        const vorig = vorigeSpreuk.get(id);
        if (vorig && vorig.sleutel === sleutel) continue;
        vorigeSpreuk.set(id, { sleutel, trede: v.trede });
        knop.querySelector('.prijs').textContent = `${eig.ap} AP · ${T.duurKort(eig.maanden)}`;
        knop.querySelector('.tredenaam').textContent = v.naam;
        knop.querySelector('.stippen').innerHTML = v.volgende
          ? Array.from({ length: v.nodig }, (_, i) => `<span class="stip${i < v.binnen ? ' vol' : ''}"></span>`).join('')
          : '<span class="ster">✦</span>';
        knop.classList.toggle('gekozen', S.spreuk === id);
        knop.classList.toggle('uit', !!waarom);
        knop.title = spreukUitleg(eig, v, waarom);
        // Een trede erbij laat de knop even gloeien.
        if (vorig && v.trede > vorig.trede) {
          knop.classList.remove('hoger');
          void knop.offsetWidth;
          knop.classList.add('hoger');
        }
      }
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

  // De knoppen van de spreukbalk worden één keer gemaakt; daarna verandert alleen hun inhoud.
  function bouwSpreuken(box) {
    box.innerHTML = T.SPREUK_VOLGORDE.map((id) => {
      const s = T.SPREUKEN[id];
      return (
        `<button class="spreuk" data-spreuk="${id}" style="--kleur: ${s.kleur}">` +
        `<span class="kop"><kbd>${s.toets}</kbd><span class="naam">${T.hoofdletter(s.naam)}</span></span>` +
        '<span class="prijs"></span>' +
        '<span class="trede"><span class="tredenaam"></span><span class="stippen"></span></span>' +
        '</button>'
      );
    }).join('');
  }

  // De uitleg bij de muis boven een spreukknop: wat hij doet, hoe goed je hem beheerst, wat de
  // volgende trede geeft, en waarom hij nu niet kan.
  function spreukUitleg(eig, v, waarom) {
    const regels = [`${T.hoofdletter(eig.naam)} · kring ${eig.kring}`, T.SPREUKEN[eig.id].uitleg];
    regels.push(`${v.naam}: ${v.aantal} keer raak.`);
    if (v.volgende) regels.push(`Nog ${v.volgende.nog} tot ${v.volgende.naam}: ${v.volgende.tekst}.`);
    else regels.push('Hoger kan niet.');
    if (waarom) regels.push(waarom);
    return regels.join('\n');
  }
})(globalThis.Toren = globalThis.Toren || {});
