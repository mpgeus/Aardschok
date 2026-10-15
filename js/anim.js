// Beweging en effecten. Wie loopt, loopt in de tik van de wereld (T.beweegWezens); wat alleen scherm is (de zwevende
// schade, de pijl die vliegt), staat in S.effecten en werkt de spellus elk beeld bij. Tot 15 okt gaven de functies in
// T.anim een belofte terug, zodat een beurt in het gevecht las als gewone code (loop hierheen, sla toe, wacht even); het
// gevecht is nu in real time, in de tik (js/gevecht.js; werklijst vraag 170, stap 2).
(function (T) {
  'use strict';

  T.anim = {
    // opties.na: zoveel seconden later beginnen, zodat twee teksten boven hetzelfde hoofd
    // elkaar niet in de weg zitten (de jaren eerst, dan de trede). opties.duur: hoe lang.
    tekst(S, e, tekst, kleur, opties) {
      const o = opties || {};
      S.effecten.push({ soort: 'tekst', x: e.x, y: e.y, tekst, kleur, t: -(o.na || 0), duur: o.duur || 1.1 });
    },

    // Een pijl of een bout die van tegel `van` naar tegel `naar` vliegt (js/gevecht.js): een korte streep, in code
    // getekend (js/tekenen.js, tekenEffecten).
    pijl(S, van, naar) {
      S.effecten.push({ soort: 'pijl', van: { x: van.x, y: van.y }, naar: { x: naar.x, y: naar.y }, t: 0, duur: 0.25 });
    },
  };

  // `dtLopen` is de tijd van de wereld (js/tik.js): de tik maal de snelheid van de kalender (T.wereldFactor,
  // js/tijd.js). Lopen gaat daarop, zodat een tocht op elke snelheid even veel uren kost; een uitval en een flits lopen
  // op de tik zelf (`dt`). Wie loopt, loopt verder op de kaart w: waar je bent (T.wereldTik), of in een dorp waar je
  // niet bent en dat niet getekend wordt (js/dorp.js, T.werkDorpBij; werklijst, vraag 71, A).
  T.beweegWezens = function (S, w, dt, dtLopen) {
    const lopen = dtLopen == null ? dt : dtLopen;
    for (const e of w.wezens) {
      beweeg(S, w, e, lopen);
      // Een uitval naar wie hij slaat (js/gevecht.js), en terug.
      if (e.uitval) {
        e.uitval.t += dt / e.uitval.duur;
        if (e.uitval.t >= 1) e.uitval = null;
      }
      if (e.flits > 0) e.flits = Math.max(0, e.flits - dt);
      if (e.alarm > 0) e.alarm = Math.max(0, e.alarm - dt);
      if (e.dood) e.sterfTijd += dt;
    }
  };

  // Elk beeld (js/main.js): de zwevende teksten en de pijlen. Alleen scherm; wie loopt, loopt in de tik van de wereld
  // (T.beweegWezens in T.wereldTik, js/tik.js).
  T.werkEffectenBij = function (S, dt) {
    const blijft = [];
    for (const fx of S.effecten) {
      fx.t += dt;
      if (fx.t < fx.duur) blijft.push(fx);
    }
    S.effecten = blijft;
  };

  // Een stap begint pas als de volgende tegel vrij is. Bij het begin wordt die tegel
  // gereserveerd (tx, ty), zodat niemand anders er tegelijk in stapt. Staat er iemand, dan lost hij dat op (T.ontwijk,
  // js/lopen.js; werklijst vraag 119, D): even wachten, langs elkaar schuiven, de ander opzij laten gaan, of eromheen.
  //
  // Wie in één beeld verder komt dan de volgende tegel, loopt door naar de tegel daarna: bij 30×
  // legt iemand zo'n 45 tegels per seconde af, en tot 26 sep bleef er na elke aankomst de rest van
  // het beeld liggen, zodat snel lopen vanzelf werd afgeremd.
  function beweeg(S, w, e, dt) {
    const hier = w === S.wereld; // alleen waar je bent, is er een schout die een deur opent, of een gevecht
    let rest = dt;
    for (let veilig = 0; rest > 0 && e.pad.length && veilig < 64; veilig++) {
      const volgende = e.pad[0];
      if (!e.onderweg) {
        if (!T.magStappen(S, e, volgende, w)) {
          const keus = T.ontwijk(S, w, e, volgende, rest);
          if (keus === 'wacht') return;
          if (keus === 'klaar') {
            e.pad = [];
            klaar(e);
            return;
          }
          if (!e.onderweg) continue; // een omweg: nu naar de eerste tegel daarvan
        } else {
          e.onderweg = true;
          e.tx = volgende.x;
          e.ty = volgende.y;
        }
        e.gewacht = 0;
        if (hier) T.bijStapBegin(S, e, volgende);
      }
      const dx = volgende.x - e.x;
      const dy = volgende.y - e.y;
      const afstand = Math.hypot(dx, dy);
      // Wie sluipt, gaat half zo snel.
      let snelheid = T.snelheidVan(e);
      if (e === S.schout && S.sluipen) snelheid *= 0.5;
      // De ossenkar rijdt sneller over een weg (js/wegen.js), net zo snel als de regel van zijn rit rekent (js/kar.js).
      if (e.kar) snelheid /= T.karKostOp(w, volgende.x, volgende.y);
      if (!(snelheid > 0)) return;
      const nodig = afstand / snelheid;
      if (nodig <= rest) {
        rest -= nodig;
        e.x = volgende.x;
        e.y = volgende.y;
        e.pad.shift();
        e.onderweg = false;
        // Waar mensen lopen, slijt het gras tot een paadje (js/paden.js); een koe, een schaap of het wild telt niet.
        if (w.paden && !e.dier && !e.beest) T.telStap(w, volgende.x, volgende.y);
        if (hier) T.bijAankomst(S, e, volgende);
        if (!e.pad.length) klaar(e);
      } else {
        const stap = snelheid * rest;
        e.x += (dx / afstand) * stap;
        e.y += (dy / afstand) * stap;
        rest = 0;
      }
    }
  }

  // Zijn weg is af, of hij gaf het op: zijn doel is er niet meer (js/lopen.js).
  function klaar(e) {
    if (e.padDoel) e.padDoel = null;
  }
})(globalThis.Spel = globalThis.Spel || {});
