// Beweging en effecten. De spellus werkt ze elk beeld bij. De functies in T.anim geven een
// belofte terug die afloopt als de animatie klaar is, zodat een beurt in het gevecht leest
// als gewone code: loop hierheen, sla toe, wacht even.
(function (T) {
  'use strict';

  T.anim = {
    loop(e, pad) {
      return new Promise((klaar) => {
        if (!pad.length) {
          klaar();
          return;
        }
        e.pad = pad.slice();
        e.opKlaar = klaar;
      });
    },

    // Een uitval naar het doel en terug. De belofte loopt af op het moment van de klap.
    uitval(e, doel) {
      return new Promise((klaar) => {
        e.uitval = { doel: { x: doel.x, y: doel.y }, t: 0, duur: 0.3, opKlap: klaar, geklapt: false };
      });
    },

    // Wachten in speltijd, niet in kloktijd: staat het spel stil (een verborgen tab, of
    // straks een pauzeknop), dan wacht dit mee.
    wacht(S, ms) {
      return new Promise((klaar) => S.wachters.push({ tot: S.tijd + ms / 1000, klaar }));
    },

    // opties.na: zoveel seconden later beginnen, zodat twee teksten boven hetzelfde hoofd
    // elkaar niet in de weg zitten (de jaren eerst, dan de trede). opties.duur: hoe lang.
    tekst(S, e, tekst, kleur, opties) {
      const o = opties || {};
      S.effecten.push({ soort: 'tekst', x: e.x, y: e.y, tekst, kleur, t: -(o.na || 0), duur: o.duur || 1.1 });
    },
  };

  // `dtLopen` is de tijd van de wereld (js/main.js): de schermtijd maal de snelheid van de kalender
  // (T.wereldFactor, js/tijd.js). Lopen gaat daarop, zodat een tocht op elke snelheid even veel uren
  // kost; een uitval, een flits en de zwevende teksten blijven op de klok van het scherm.
  T.werkAnimatiesBij = function (S, dt, dtLopen) {
    const lopen = dtLopen == null ? dt : dtLopen;
    for (const e of S.wereld.wezens) {
      beweeg(S, e, lopen);
      if (e.uitval) {
        const u = e.uitval;
        u.t += dt / u.duur;
        if (!u.geklapt && u.t >= 0.5) {
          u.geklapt = true;
          u.opKlap();
        }
        if (u.t >= 1) e.uitval = null;
      }
      if (e.flits > 0) e.flits = Math.max(0, e.flits - dt);
      if (e.alarm > 0) e.alarm = Math.max(0, e.alarm - dt);
      if (e.dood) e.sterfTijd += dt;
    }
    if (S.wachters.length) {
      const nogNiet = [];
      for (const w of S.wachters) {
        if (S.tijd >= w.tot) w.klaar();
        else nogNiet.push(w);
      }
      S.wachters = nogNiet;
    }
    const blijft = [];
    for (const fx of S.effecten) {
      fx.t += dt;
      if (fx.t < fx.duur) blijft.push(fx);
    }
    S.effecten = blijft;
  };

  // Een stap begint pas als de volgende tegel vrij is. Bij het begin wordt die tegel
  // gereserveerd (tx, ty), zodat niemand anders er tegelijk in stapt.
  //
  // Wie in één beeld verder komt dan de volgende tegel, loopt door naar de tegel daarna: bij 30×
  // legt iemand zo'n 45 tegels per seconde af, en tot 26 sep bleef er na elke aankomst de rest van
  // het beeld liggen, zodat snel lopen vanzelf werd afgeremd.
  function beweeg(S, e, dt) {
    let rest = dt;
    for (let veilig = 0; rest > 0 && e.pad.length && veilig < 64; veilig++) {
      const volgende = e.pad[0];
      if (!e.onderweg) {
        if (!T.magStappen(S, e, volgende)) {
          e.pad = [];
          klaar(e);
          return;
        }
        e.onderweg = true;
        e.tx = volgende.x;
        e.ty = volgende.y;
        T.bijStapBegin(S, e, volgende);
      }
      const dx = volgende.x - e.x;
      const dy = volgende.y - e.y;
      const afstand = Math.hypot(dx, dy);
      // In een gevecht lopen ook de trage monsters wat vlotter, anders duurt hun beurt te lang.
      // Wie sluipt, gaat half zo snel.
      let snelheid = S.gevecht ? Math.max(3.2, T.snelheidVan(e) * 1.4) : T.snelheidVan(e);
      if (e === S.schout && S.sluipen && !S.gevecht) snelheid *= 0.5;
      if (!(snelheid > 0)) return;
      const nodig = afstand / snelheid;
      if (nodig <= rest) {
        rest -= nodig;
        e.x = volgende.x;
        e.y = volgende.y;
        e.pad.shift();
        e.onderweg = false;
        T.bijAankomst(S, e, volgende);
        if (!e.pad.length) klaar(e);
      } else {
        const stap = snelheid * rest;
        e.x += (dx / afstand) * stap;
        e.y += (dy / afstand) * stap;
        rest = 0;
      }
    }
  }

  function klaar(e) {
    if (e.opKlaar) {
      const k = e.opKlaar;
      e.opKlaar = null;
      k();
    }
  }
})(globalThis.Spel = globalThis.Spel || {});
