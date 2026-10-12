// Het briefje bij een huis (2c, werklijst vraag 100; Marcel, 3 okt: "100 ja", in de stijl van vraag 98: "98 C", de
// schrijftafel): staat de muis op een huis met mensen, dan hangt er naast zijn deur een papiertje aan een spijker, met wie
// er woont, wat het huis wil (✓ en ✗) en wat helpt, en hoe ver het is met doorgroeien. Alles uit T.huisToestand
// (js/wensen.js), zodat het zegt wat de raad zegt. Het
// eerste venster in de stijl van de schrijftafel; de rest van de ui volgt later (vraag 98, c).
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
})(globalThis.Spel = globalThis.Spel || {});
