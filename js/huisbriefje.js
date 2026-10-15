// Het briefje bij een huis (2c, werklijst vraag 100; Marcel, 3 okt: "100 ja", in de stijl van vraag 98: "98 C", de
// schrijftafel): staat de muis op een huis met mensen, dan hangt er naast zijn deur een papiertje aan een spijker, met wie
// er woont, wat het huis wil (✓ en ✗) en wat helpt, en hoe ver het is met doorgroeien. Alles uit T.huisToestand
// (js/wensen.js), zodat het zegt wat de raad zegt. Het
// eerste venster in de stijl van de schrijftafel; de rest van de ui volgt later (vraag 98, c).
// Onderaan ook het briefje van een gebouw na een klik (vraag 156): wat erop staat, zegt js/gebouwbriefje.js; hier
// staat alleen hoe het op het scherm komt, want dit bestand is alleen scherm (het laadt niet in de toetsen).
(function (T) {
  'use strict';

  T.ui = T.ui || {};
  const $ = (id) => document.getElementById(id);
  const MARGE = 12;
  const ONDER_DE_BALK = 72; // de balk bovenin (js/hud.js) blijft te lezen
  let laatste = '';

  const toets = (tekst) => tekst.replace(/\[(\w)\]/g, '<kbd>$1</kbd>');
  const kosten = (k) => T.opsomming(Object.keys(k).map((wat) => T.hoeveel(k[wat], wat)));

  function inhoud(D, g, t) {
    const soort = T.GEBOUWEN[g.soort];
    const wie = t.wie.length ? t.wie[0] : null;
    // Het huis waar de schout woont, is het jouwe ("Your house", niet "the reeve's reeve's house").
    const kop = g.huis === 'schout'
      ? (g.soort === 'schout' ? T.t('Your house') : T.t('Your {gebouw}', { gebouw: soort.naam }))
      : T.hoofdletter(wie ? T.t("{wie}'s {gebouw}", { wie, gebouw: soort.naam }) : soort.naam);
    const stand = T.t('{stand}, {n|# person|# people}, {procent}% content', {
      stand: T.hoofdletter(T.STANDEN[t.stand].naam),
      n: t.mensen,
      procent: Math.round(t.tevredenheid * 100),
    });
    const wensen = t.wensen.map((w) => `<span class="${w.heeft ? 'ja' : 'nee'}">${w.heeft ? '✓' : '✗'} ${w.naam}</span>`).join('');
    const eerste = t.wensen.find((w) => !w.heeft && w.helpt);
    const helpt = eerste ? `<div class="briefje-helpt">${T.t('{wens}: {helpt}.', { wens: T.hoofdletter(eerste.naam), helpt: toets(eerste.helpt) })}</div>` : '';
    let groei = '';
    if (t.groei) {
      const nog = Math.max(0, t.groei.nodig - t.groei.dagen);
      const wordt = T.eenNaam(t.groei.wordt);
      if (t.teken === 'bouwstof') groei = T.t('It could become {gebouw}, but that needs {kosten}.', { gebouw: wordt, kosten: kosten(t.groei.kosten) });
      else if (t.groei.waarom) groei = T.t('It could become {gebouw}, but {waarom}.', { gebouw: wordt, waarom: t.groei.waarom });
      else if (!t.teken) {
        groei = Object.keys(t.groei.kosten).length
          ? T.t('{n|# more day|# more days} with everything, then it grows into {gebouw} ({kosten}).', { n: nog, gebouw: wordt, kosten: kosten(t.groei.kosten) })
          : T.t('{n|# more day|# more days} with everything, then it grows into {gebouw}.', { n: nog, gebouw: wordt });
      } else groei = T.t('With everything for {n|# day|# days}, it grows into {gebouw}.', { n: t.groei.nodig, gebouw: wordt });
    }
    return (
      `<div class="briefje-kop">${kop}</div>` +
      `<div class="briefje-stand">${stand}</div>` +
      `<div class="briefje-wensen">${wensen}</div>` +
      helpt +
      (groei ? `<div class="briefje-groei">${groei}</div>` : '')
    );
  }

  // Toon het briefje van huis g, met zijn spijker bij (x, y): de deur van het huis, in css-pixels (js/main.js). Het blijft
  // in beeld: past het niet rechts van de deur, dan links.
  T.ui.toonHuisbriefje = function (S, g, x, y) {
    const box = $('huisbriefje');
    const t = box && T.huisToestand(S.dorp, g);
    if (!t) {
      T.ui.verbergHuisbriefje();
      return;
    }
    const html = inhoud(S.dorp, g, t);
    if (html !== laatste) {
      box.innerHTML = html;
      laatste = html;
    }
    box.classList.remove('verborgen');
    const b = box.offsetWidth;
    const h = box.offsetHeight;
    let links = x + 40;
    if (links + b > window.innerWidth - MARGE) links = x - 40 - b;
    const boven = Math.min(Math.max(ONDER_DE_BALK, y - h - 60), window.innerHeight - h - MARGE);
    box.style.left = `${Math.max(MARGE, links)}px`;
    box.style.top = `${boven}px`;
  };

  T.ui.verbergHuisbriefje = function () {
    const box = $('huisbriefje');
    if (box) box.classList.add('verborgen');
  };

  // ── Het briefje van een gebouw (js/gebouwbriefje.js; vraag 156) ──
  // Na een klik op een gebouw (S.gekozen) ligt het rechts onder de datum, zolang je rondloopt; wat erop staat, zegt
  // T.gebouwBriefje.
  let laatsteGebouw = '';
  let bijgewerkt = -Infinity;
  const ALLE = 0.25; // zo vaak (seconden) wordt het briefje opnieuw opgemaakt, want de dag loopt door

  // Een regel is tekst, of tekst met knoppen (het wachthuis, js/soldaten.js): een knop draagt waar hij staat (deel, regel,
  // knop), zodat een klik hem terugvindt in het briefje dat er ligt (`huidig`), en daar zijn `doe` doet.
  let huidig = null;
  const attr = (t) => String(t || '').replace(/"/g, '&quot;');
  const regel = (r, i, j) =>
    typeof r === 'string'
      ? `<div>${r}</div>`
      : `<div class="briefje-regel"><span>${r.tekst}</span><span class="briefje-knoppen">${r.knoppen
        .map((k, n) => `<button type="button" class="briefje-knop" data-knop="${i}.${j}.${n}" title="${attr(k.uitleg)}"${k.kan ? '' : ' disabled'}>${k.tekst}</button>`)
        .join('')}</span></div>`;
  const html = (b) =>
    `<div class="briefje-kop">${b.kop}</div>` +
    (b.doet ? `<div class="briefje-doet">${b.doet}</div>` : '') +
    b.delen.map((d, i) => `<div class="briefje-deel"><b>${d.titel}</b>${d.regels.map((r, j) => regel(r, i, j)).join('')}</div>`).join('');

  function knopGeklikt(ev) {
    const knop = ev.target.closest && ev.target.closest('[data-knop]');
    if (!knop || !huidig) return;
    const [i, j, n] = knop.dataset.knop.split('.').map(Number);
    const r = huidig.delen[i] && huidig.delen[i].regels[j];
    const k = r && r.knoppen && r.knoppen[n];
    if (k && k.kan) k.doe();
    laatsteGebouw = ''; // meteen opnieuw opmaken
    bijgewerkt = -Infinity;
  }

  // Elk beeld (js/main.js): het briefje van het gekozen gebouw, zolang je rondloopt. Is het gebouw weg (afgebroken), dan
  // is er niets meer gekozen.
  T.ui.werkGebouwbriefjeBij = function (S) {
    const box = $('gebouwbriefje');
    if (!box) return;
    const g = S.gekozen;
    const D = g ? (S.dorpen || []).find((d) => d.gebouwen.includes(g)) : null;
    if (g && !D) S.gekozen = null;
    if (!D || S.modus !== 'verkennen') {
      box.classList.add('verborgen');
      laatsteGebouw = '';
      return;
    }
    box.classList.remove('verborgen');
    if (!box.dataset.knoppen) {
      box.addEventListener('click', knopGeklikt);
      box.dataset.knoppen = '1';
    }
    if (laatsteGebouw && S.tijd - bijgewerkt < ALLE) return;
    bijgewerkt = S.tijd;
    huidig = T.gebouwBriefje(D, g);
    const nu = html(huidig);
    if (nu !== laatsteGebouw) box.innerHTML = nu;
    laatsteGebouw = nu;
  };
})(globalThis.Spel = globalThis.Spel || {});
