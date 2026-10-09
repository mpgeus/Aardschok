// Het briefje bij een huis (2c, werklijst vraag 100; Marcel, 3 okt: "100 ja", in de stijl van vraag 98: "98 C", de
// schrijftafel): staat de muis op een huis met mensen, dan hangt er naast zijn deur een papiertje aan een spijker, met wie
// er woont, wat het huis wil (✓ en ✗) en wat helpt, en hoe ver het is met doorgroeien. Alles uit T.huisToestand
// (js/wensen.js), zodat het zegt wat de raad zegt. Een klik blijft wat hij was: verstoppen in de kelder (js/hud.js). Het
// eerste venster in de stijl van de schrijftafel; de rest van de ui volgt later (vraag 98, c).
(function (T) {
  'use strict';

  T.ui = T.ui || {};
  const $ = (id) => document.getElementById(id);
  const MARGE = 12;
  const ONDER_DE_BALK = 72; // de balk bovenin (js/hud.js) blijft te lezen
  let laatste = '';

  const toets = (tekst) => tekst.replace(/\[(\w)\]/g, '<kbd>$1</kbd>');
  const kosten = (k) => T.opsomming(Object.keys(k).map((wat) => `${k[wat]} ${wat}`));

  function inhoud(D, g, t) {
    const soort = T.GEBOUWEN[g.soort];
    const wie = t.wie.length ? t.wie[0] : null;
    const kop = wie ? `${T.hoofdletter(soort.naam)} van ${wie}` : T.hoofdletter(soort.naam);
    const stand = `${T.hoofdletter(T.STANDEN[t.stand].naam)}, ${t.mensen} ${t.mensen === 1 ? 'mens' : 'mensen'}, ${Math.round(t.tevredenheid * 100)}% tevreden`;
    const wensen = t.wensen.map((w) => `<span class="${w.heeft ? 'ja' : 'nee'}">${w.heeft ? '✓' : '✗'} ${w.naam}</span>`).join('');
    const eerste = t.wensen.find((w) => !w.heeft && w.helpt);
    const helpt = eerste ? `<div class="briefje-helpt">${T.hoofdletter(eerste.naam)}: ${toets(eerste.helpt)}.</div>` : '';
    let groei = '';
    if (t.groei) {
      const nog = Math.max(0, t.groei.nodig - t.groei.dagen);
      if (t.teken === 'bouwstof') groei = `Het kan een ${t.groei.wordt} worden, maar daar is ${kosten(t.groei.kosten)} voor nodig.`;
      else if (t.groei.waarom) groei = `Het kan een ${t.groei.wordt} worden, maar ${t.groei.waarom}.`;
      else if (!t.teken) groei = `Nog ${nog} ${nog === 1 ? 'dag' : 'dagen'} alles, dan wordt het een ${t.groei.wordt}${Object.keys(t.groei.kosten).length ? ` (${kosten(t.groei.kosten)})` : ''}.`;
      else groei = `Heeft het ${t.groei.nodig} dagen alles, dan wordt het een ${t.groei.wordt}.`;
    }
    // De beurs van het huis (js/geld.js): wat erin zit, wat het vorige maand verdiende, en wat het niet kon betalen.
    let geld = '';
    if (t.geld) {
      geld = `In de beurs ${T.muntTekst(t.geld.beurs)}` + (t.geld.verdiend > 0 ? `, vorige maand ${T.muntTekst(t.geld.verdiend)} verdiend` : '') + '.';
      if (t.geld.teArm.length) geld += ` Te arm voor ${T.opsomming(t.geld.teArm)}.`;
    }
    return (
      `<div class="briefje-kop">${kop}</div>` +
      `<div class="briefje-stand">${stand}</div>` +
      (geld ? `<div class="briefje-groei">${geld}</div>` : '') +
      `<div class="briefje-wensen">${wensen}</div>` +
      helpt +
      (t.nadraagt ? `<div class="briefje-groei">${t.nadraagt}</div>` : '') +
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
