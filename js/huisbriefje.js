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
    // Kan het niet doorgroeien, dan zegt het waarom; staat er iets in de weg wat het gezin rooit, dan zegt het dat erbij,
    // of dat het daar nu aan werkt (werklijst vraag 130, c).
    let groei = '';
    const gr = t.groei;
    if (gr) {
      const nog = Math.max(0, gr.nodig - gr.dagen);
      const eerst = gr.rooit ? ` Eerst rooit het gezin ${gr.rooit}.` : '';
      if (gr.waarom) groei = `Het kan geen ${gr.wordt} worden: ${gr.waarom}.`;
      else if (gr.bezig) groei = `Het gezin rooit ${gr.rooit}, en dan wordt het een ${gr.wordt}.`;
      else if (t.teken === 'bouwstof') groei = `Het kan een ${gr.wordt} worden, maar daar is ${kosten(gr.kosten)} voor nodig.${eerst}`;
      else if (!t.teken) groei = `Nog ${nog} ${nog === 1 ? 'dag' : 'dagen'} alles, dan wordt het een ${gr.wordt}${Object.keys(gr.kosten).length ? ` (${kosten(gr.kosten)})` : ''}.${eerst}`;
      else groei = `Heeft het ${gr.nodig} dagen alles, dan wordt het een ${gr.wordt}.${eerst}`;
    }
    return (
      `<div class="briefje-kop">${kop}</div>` +
      `<div class="briefje-stand">${stand}</div>` +
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
