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

    schicht(S, van, naar) {
      return new Promise((klaar) => {
        const afstand = Math.hypot(naar.x - van.x, naar.y - van.y);
        S.effecten.push({
          soort: 'schicht', van: { x: van.x, y: van.y }, naar: { x: naar.x, y: naar.y },
          t: 0, duur: 0.15 + afstand * 0.055, opKlaar: klaar,
        });
      });
    },

    // Wachten in speltijd, niet in kloktijd: staat het spel stil (een verborgen tab, of
    // straks een pauzeknop), dan wacht dit mee.
    wacht(S, ms) {
      return new Promise((klaar) => S.wachters.push({ tot: S.tijd + ms / 1000, klaar }));
    },

    tekst(S, e, tekst, kleur) {
      S.effecten.push({ soort: 'tekst', x: e.x, y: e.y, tekst, kleur, t: 0, duur: 1.1 });
    },
  };

  T.werkAnimatiesBij = function (S, dt) {
    for (const e of S.wereld.wezens) {
      beweeg(S, e, dt);
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
      if (fx.t < fx.duur) {
        blijft.push(fx);
      } else if (fx.soort === 'schicht') {
        blijft.push({ soort: 'knal', x: fx.naar.x, y: fx.naar.y, t: 0, duur: 0.35 });
        fx.opKlaar();
      }
    }
    S.effecten = blijft;
  };

  // Een stap begint pas als de volgende tegel vrij is. Bij het begin wordt die tegel
  // gereserveerd (tx, ty), zodat niemand anders er tegelijk in stapt.
  function beweeg(S, e, dt) {
    if (!e.pad.length) return;
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
    const snelheid = S.gevecht ? Math.max(3.2, e.snelheid * 1.4) : e.snelheid;
    const stap = snelheid * dt;
    if (stap >= afstand) {
      e.x = volgende.x;
      e.y = volgende.y;
      e.pad.shift();
      e.onderweg = false;
      T.bijAankomst(S, e, volgende);
      if (!e.pad.length) klaar(e);
    } else {
      e.x += (dx / afstand) * stap;
      e.y += (dy / afstand) * stap;
    }
  }

  function klaar(e) {
    if (e.opKlaar) {
      const k = e.opKlaar;
      e.opKlaar = null;
      k();
    }
  }
})(globalThis.Toren = globalThis.Toren || {});
