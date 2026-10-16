// Het briefje bij een huis (2c, werklijst vraag 100; Marcel, 3 okt: "100 ja", in de stijl van vraag 98: "98 C", de
// schrijftafel): staat de muis op een huis met mensen, dan hangt er naast zijn deur een papiertje aan een spijker, met wie
// er woont en hoe ver het is met doorgroeien. Alles uit T.huisToestand (js/behoeften.js), zodat het zegt wat de regel doet.
// (Tot 16 okt stond er ook wat het huis wilde, met ✓ en ✗, en wat hielp: de wensen per huis, js/wensen.js.) Het eerste
// venster in de stijl van de schrijftafel; de rest van de ui volgt later (vraag 98, c).
// Onderaan ook het briefje van een gebouw na een klik (vraag 156): wat erop staat, zegt js/gebouwbriefje.js; hier
// staat alleen hoe het op het scherm komt, want dit bestand is alleen scherm (het laadt niet in de toetsen).
(function (T) {
  'use strict';

  T.ui = T.ui || {};
  const $ = (id) => document.getElementById(id);
  const MARGE = 12;
  const ONDER_DE_BALK = 72; // de balk bovenin (js/hud.js) blijft te lezen
  let laatste = '';

  const kosten = (k) => T.opsomming(Object.keys(k).map((wat) => T.hoeveel(k[wat], wat)));

  function inhoud(D, g, t) {
    const soort = T.GEBOUWEN[g.soort];
    const wie = t.wie.length ? t.wie[0] : null;
    // Het town hall heet zo (vraag 170, stap 2); een ander huis waar de schout woont, is het jouwe ("Your hut").
    const kop = g.soort === 'schout' ? T.hoofdletter(soort.naam)
      : g.huis === 'schout' ? T.t('Your {gebouw}', { gebouw: soort.naam })
        : T.hoofdletter(wie ? T.t("{wie}'s {gebouw}", { wie, gebouw: soort.naam }) : soort.naam);
    const stand = T.standVan(g);
    const mensen = T.t('{n|# person|# people}', { n: t.mensen });
    const regel = stand ? T.t('{stand}, {mensen}', { stand: T.hoofdletter(T.STANDEN[stand].naam), mensen }) : T.hoofdletter(mensen);
    return (
      `<div class="briefje-kop">${kop}</div>` +
      `<div class="briefje-stand">${regel}</div>` +
      (t.groei ? `<div class="briefje-groei">${groeiTekst(t.groei)}</div>` : '')
    );
  }

  // Hoe ver het huis is met doorgroeien (js/behoeften.js, pasHuisGroeiToe), in één zin.
  function groeiTekst(gr) {
    const gebouw = T.eenNaam(gr.wordt);
    const woorden = { gebouw, kosten: kosten(gr.kosten), dagen: gr.nodig, soorten: gr.soorten, nu: gr.nu, n: Math.max(0, gr.nodig - gr.dagen) };
    if (gr.later) return T.t('It can only become {gebouw} in {trede}.', { gebouw, trede: T.tredeDoelNaam(gr.later) });
    if (gr.wacht) return T.t('It could become {gebouw}, but that needs {kosten}.', woorden);
    if (gr.waarom) return T.t('It could become {gebouw}, but {waarom}.', { gebouw, waarom: gr.waarom });
    if (gr.nu < gr.soorten) return T.t('It grows into {gebouw} after {dagen} days in which the village eats {soorten} kinds of food; now it eats {nu}.', woorden);
    if (!gr.tevreden) return T.t('It grows into {gebouw} after {dagen} days in which the village is content enough.', woorden);
    return Object.keys(gr.kosten).length
      ? T.t('{n|# more day|# more days} like this, then it grows into {gebouw} ({kosten}).', woorden)
      : T.t('{n|# more day|# more days} like this, then it grows into {gebouw}.', woorden);
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
  // knop), zodat een klik hem terugvindt in het briefje dat er ligt (`huidig`), en daar zijn opdracht geeft.
  let huidig = null;
  const briefjeVan = { S: null, D: null, wie: null }; // het spel, het dorp en het wezen van dat briefje, voor een knop
  let laatsteKeus = null; // wat er gekozen was toen het briefje opgemaakt werd
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
    // Een knop geeft een opdracht (js/tik.js): hij gaat in bij de volgende tik, en het briefje laat het dan zien.
    if (k && k.kan) T.geefOpdracht(briefjeVan.S, Object.assign({ dorp: briefjeVan.S.dorpen.indexOf(briefjeVan.D) }, k.opdracht));
    laatsteGebouw = ''; // meteen opnieuw opmaken
    bijgewerkt = -Infinity;
  }

  // Elk beeld (js/main.js): het briefje van het gekozen gebouw, zolang je rondloopt. Is het gebouw weg (afgebroken), dan
  // is er niets meer gekozen. Op dezelfde plek het briefje van een wezen of van je mannen (T.gekozenBriefje, js/kiezen.js;
  // vraag 170, stap 1): wie gevallen is, valt eruit.
  T.ui.werkGebouwbriefjeBij = function (S) {
    const box = $('gebouwbriefje');
    if (!box) return;
    if (Array.isArray(S.gekozen)) {
      const m = T.gekozenMannen(S);
      if (m.length !== S.gekozen.length) S.gekozen = m.length > 1 ? m : m[0] || null;
    }
    const g = S.gekozen;
    const isWezen = !!g && g.tx != null;
    const keus = isWezen || Array.isArray(g) ? T.gekozenBriefje(S) : null;
    if ((isWezen || Array.isArray(g)) && !keus) S.gekozen = null;
    const D = keus ? keus.D : g && !Array.isArray(g) ? (S.dorpen || []).find((d) => d.gebouwen.includes(g)) : null;
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
    if (laatsteGebouw && laatsteKeus === S.gekozen && S.tijd - bijgewerkt < ALLE) return;
    bijgewerkt = S.tijd;
    laatsteKeus = S.gekozen;
    huidig = keus ? keus.briefje : T.gebouwBriefje(D, g);
    briefjeVan.S = S;
    briefjeVan.D = D;
    briefjeVan.wie = keus ? keus.wie : null;
    const nu = html(huidig);
    if (nu !== laatsteGebouw) box.innerHTML = nu;
    laatsteGebouw = nu;
  };
})(globalThis.Spel = globalThis.Spel || {});
