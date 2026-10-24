// De regie van de scènes op Sint-Maarten (werklijst E, stap 4; Marcel, 18 okt, C2, en 20 okt: "A1 B1 C1"). Wat er
// gebeurt, speelt in de wereld (js/heer.js: zijn leger komt over de weg en het dorp vlucht, of zijn mannen laden zijn
// wagen en hij rijdt weg); de regie maakt er een scène van: de balken en knoppen weg, zwarte banden boven en onder, de
// camera rijdt mee, en een zin onderin. Is het spel uit (D.einde), dan wordt het beeld zwart, en daarna komt het
// eindscherm (T.ui.toonEinde, js/hud.js). Een klik of Esc slaat de scène over: dan is het meteen het eind
// (T.eindVanSintMaarten, js/heer.js).
//
//   weigeren: hij gaat (de camera op de heer, 1×), de nacht valt (het plein, de tijd snel), zijn leger komt (de kop van
//             de rij, 1×). Ook in het volle spel, zolang weigeren de dood is (werklijst, F).
//   betalen:  alleen als het level het zegt (de trigger `scene`, js/scenario.js; het demojaar): zijn mannen halen het bij
//             je voorraad (de tijd wat sneller), ze brengen het naar zijn wagen (1×), en hij rijdt weg (de wagen, 1×).
//
// Wat de scène nu toont, komt uit wat de wereld nu is (T.welkeScene en T.regieShot, zonder scherm en getoetst in
// test/regie.test.cjs), zodat een spel dat midden in een scène geladen wordt, gewoon verder speelt. Wat alleen scherm
// is, staat in S.regie (T.schermVelden, js/opslaan.js) en in de html (#regie, stijl.css). Zolang een scène loopt, is
// S.modus 'scene': de wereld leeft door (js/tik.js), maar een klik, de muis en de toetsen doen niets.
(function (T) {
  'use strict';

  // Alle getallen in één blok (ook in de werkbank, js/opties.js).
  T.REGIE_INSTELLINGEN = {
    // Zo lang (seconden) kijkt de camera de heer na als je hem weigerde, voor de nacht valt.
    nakijken: 4,
    // Zo snel loopt de tijd (een stand van T.SNELHEDEN) terwijl de nacht valt, en terwijl zijn mannen naar je voorraad
    // lopen; de rest van een scène op 1×.
    nacht: 30,
    halen: 3,
    // Zo lang (seconden) duurt het zwart worden aan het eind, en als je de scène overslaat.
    zwart: 1.5,
    overslaan: 0.3,
  };
  const IN = () => T.REGIE_INSTELLINGEN;

  // Welke scène er nu in dorp D speelt: 'weigeren' (je weigerde de heer, en zijn leger komt), 'betalen' (met de scène van
  // het betalen, D.scene: hij gaat met wat hij nam, zijn mannen laden of hij rijdt al), of null. Een scène begint alleen
  // zolang het spel nog niet uit is.
  T.welkeScene = function (D) {
    const h = D && D.heer;
    if (!h || D.einde) return null;
    if (h.leger) return 'weigeren';
    const b = h.bezoek;
    const betaald = !!(b && b.betaald && !b.betaald.geweigerd);
    return D.scene === 'betalen' && betaald && (b.laden || b.weg) ? 'betalen' : null;
  };

  // Wat de scène `R` (S.regie) nu toont in dorp D: { stap, volg, zin, snelheid }. `volg` is waar de camera kijkt (in
  // tegels), `zin` de zin onderin, `snelheid` die van de tijd (of null: zoals hij is). Puur.
  T.regieShot = function (D, R) {
    const h = D.heer;
    const b = h && h.bezoek;
    const midden = T.plekVanDeHeer(D);
    const plek = (e) => ({ x: e.x, y: e.y });
    const inWereld = (e) => !!e && D.wereld.wezens.includes(e);
    if (R.soort === 'weigeren') {
      const leger = T.legerVanDeHeer(D);
      if (leger.length) {
        return { stap: 'leger', volg: plek(leger[0]), zin: T.t('Torches come up the road: the army of the lord.'), snelheid: 1 };
      }
      const heer = b && b.wezens && b.wezens[0];
      if (R.t < IN().nakijken && inWereld(heer)) {
        return { stap: 'gaat', volg: plek(heer), zin: T.t('The lord turns and leaves without a word.'), snelheid: 1 };
      }
      return { stap: 'nacht', volg: midden, zin: T.t('Night falls.'), snelheid: IN().nacht };
    }
    // Betalen: tussen de wagen en je voorraad zolang ze laden, en daarna de wagen.
    const wagen = b && inWereld(b.wagen) ? b.wagen : null;
    const voorraad = T.deVoorraad(D);
    const tussen = wagen && voorraad ? { x: (wagen.x + voorraad.x) / 2, y: (wagen.y + voorraad.y) / 2 } : midden;
    if (b && b.laden && b.laden.fase === 'heen') {
      return { stap: 'halen', volg: tussen, zin: T.t('His men fetch what he takes from your stores.'), snelheid: IN().halen };
    }
    if (b && b.laden) return { stap: 'brengen', volg: tussen, zin: T.t('They load it onto his wagon.'), snelheid: 1 };
    return { stap: 'weg', volg: wagen ? plek(wagen) : R.volg || midden, zin: T.t('The lord rides off down the road.'), snelheid: 1 };
  };

  // ---------------------------------------------------------------------------------------------
  // Het scherm (alleen in de browser: js/main.js roept T.werkRegieBij elk beeld aan)
  // ---------------------------------------------------------------------------------------------

  const el = (id) => document.getElementById(id);
  let getoond = false; // of #regie nu op het scherm staat

  function toon(aan) {
    if (aan === getoond) return;
    getoond = aan;
    const r = el('regie');
    document.body.classList.toggle('regie', aan);
    r.classList.toggle('verborgen', !aan);
    if (!aan) {
      r.classList.remove('aan', 'zwart');
      r.style.transitionDuration = '';
      el('regie-zin').classList.remove('zichtbaar');
      return;
    }
    void r.offsetWidth; // zo schuiven de banden erin, en staan ze er niet meteen
    r.classList.add('aan');
  }

  // De zin onderin: de oude vaagt weg en de nieuwe in.
  function zeg(zin) {
    const z = el('regie-zin');
    z.classList.remove('zichtbaar');
    void z.offsetWidth;
    z.textContent = zin;
    z.classList.add('zichtbaar');
  }

  function begin(S, soort) {
    S.regie = { soort, t: 0, stap: null, volg: null, zwart: null, snel: false, klaar: false };
    S.modus = 'scene';
    S.bouwSoort = null; // een gebouw dat nog aan de muis hing, ligt weer weg, zoals bij de fotomodus
    S.bouwMenuOpen = false;
    S.gekozen = null;
    T.ui.toonBouwmenu(S);
    T.ui.verbergTooltip();
    toon(true);
  }

  // Een klik of Esc: het eind nu (js/heer.js), en snel zwart.
  function slaOver(S) {
    const R = S.regie;
    if (!R || R.zwart != null) return;
    R.snel = true;
    T.eindVanSintMaarten(S.dorp);
  }

  T.werkRegieBij = function (S, dt) {
    const D = S.dorp;
    const R = S.regie;
    if (!R) {
      if (getoond) toon(false); // een ander spel, of terug naar het titelscherm
      if (S.modus === 'verkennen' && D && !T.ui.titelOpen() && !T.ui.menuOpen()) {
        const soort = T.welkeScene(D);
        if (soort) begin(S, soort);
      }
      return;
    }
    if (T.ui.titelOpen()) {
      S.regie = null;
      toon(false);
      return;
    }
    R.t += dt;
    if (S.modus === 'verkennen') S.modus = 'scene'; // een venster dat onderweg open- en dichtging, gaf de invoer terug
    if (R.zwart != null) {
      // Is het zwart, dan het eindscherm erover (dat wachtte, js/hud.js); het zwart blijft erachter tot het titelscherm.
      if (!R.klaar && R.t - R.zwart >= (R.snel ? IN().overslaan : IN().zwart)) {
        R.klaar = true;
        T.ui.toonEinde(D);
      }
      return;
    }
    if (D.einde) {
      R.zwart = R.t;
      const r = el('regie');
      r.style.transitionDuration = `${R.snel ? IN().overslaan : IN().zwart}s`;
      r.classList.add('zwart');
      el('regie-zin').classList.remove('zichtbaar');
      return;
    }
    const shot = T.regieShot(D, R);
    R.volg = shot.volg;
    if (shot.stap === R.stap) return;
    R.stap = shot.stap;
    if (shot.snelheid && D.kalender.snelheid !== shot.snelheid) T.zetSnelheid(S, shot.snelheid);
    zeg(shot.zin);
  };

  // Waar de camera heen glijdt zolang er een scène speelt (js/main.js), in pixels van de wereld zoals S.kijk; of null.
  T.regieCamera = function (S) {
    const R = S.regie;
    if (!R || !R.volg) return null;
    const p = T.naarSchermOp(S.wereld, R.volg.x, R.volg.y);
    return { x: p.x, y: p.y - 24 };
  };

  // De invoer: zolang er een scène loopt, gaat geen toets naar het spel (deze luistert als eerste), Esc slaat haar over,
  // en een klik op het beeld ook (#regie ligt over het doek). Het wiel zoomt niet.
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    window.addEventListener('keydown', (ev) => {
      const S = T.S;
      if (!S || !S.regie) return;
      ev.stopImmediatePropagation();
      if (ev.key === 'Escape') {
        ev.preventDefault();
        slaOver(S);
      }
    }, true);
    window.addEventListener('DOMContentLoaded', () => { // geen tekst
      const r = el('regie');
      r.addEventListener('mousedown', (ev) => {
        ev.preventDefault();
        if (T.S && T.S.regie) slaOver(T.S);
      });
      r.addEventListener('wheel', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
      }, { passive: false });
      r.addEventListener('contextmenu', (ev) => ev.preventDefault());
    });
  }
})(globalThis.Spel = globalThis.Spel || {});
