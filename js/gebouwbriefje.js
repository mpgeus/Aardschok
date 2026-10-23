// Het briefje van een gebouw (werklijst vraag 156; Marcel, 14 okt: "De speler moet op een gebouw kunnen klikken om
// informatie over het gebouw te krijgen, wat het doet en hoeveel indien aan de orde, het produceert", en op de vragen
// "1a1, 1b ja"): een klik op een gebouw legt rechts een briefje neer, dat blijft liggen tot je ergens anders klikt (of
// Esc), terwijl het spel doorloopt, zoals in The Settlers en Anno. Erop: wat het doet, wie er werkt of woont, wat het
// maakt op vol en wat het de laatste zeven dagen echt maakte, wat erin gaat en wat er ligt, en wat het tegenhoudt. Dat
// laatste is de andere helft van "hoeveel": The Settlers draait om zien waar het stokt.
//
// T.gebouwBriefje(D, g) is de regel zonder scherm (test/gebouwbriefje.test.cjs): de kop, wat het doet, en de delen,
// elk met een titel en regels tekst. Een regel kan knoppen hebben ({ tekst, knoppen: [{ tekst, uitleg, kan, opdracht }] }:
// een klik geeft de opdracht, als gegevens, en die gaat in bij de volgende tik; js/tik.js, vraag 170): het wachthuis, waar
// je soldaten zet (js/soldaten.js; vraag 159). Een ander bestand geeft zijn
// eigen delen in T.GEBOUW_DELEN[soort](D, g). Alles wat erop staat, rekent het spel al: de nachtlus van de gebouwen (g.werkte,
// g.tekort, g.vol, g.stilWant, g.uren; js/gebouwen.js), het werktempo (T.werkVanAfwisseling), en wat het maakte (T.telGemaakt, via
// T.opStapel in js/kar.js). T.kiesGebouw zet S.gekozen (alleen scherm, T.schermVelden in js/opslaan.js), een klik op een
// gebouw (T.handelingVerkennen, js/verkennen.js); het briefje op het scherm legt T.ui.werkGebouwbriefjeBij (js/huisbriefje.js,
// bij het briefje van een huis, want dat bestand is alleen scherm en laadt niet in de toetsen).
(function (T) {
  'use strict';

  // Een getal op het briefje: onder de tien met één cijfer achter de komma (1.6 wood), anders heel.
  const getal = (n) => (n < 10 ? Math.round(n * 10) / 10 : Math.round(n));
  // { hout: 1.6, planken: 2 } als "1.6 wood and 2 planks"; wat minder dan een twintigste is, telt niet.
  const waren = (o) => T.opsomming(Object.keys(o || {}).filter((wat) => o[wat] >= 0.05).map((wat) => T.hoeveel(getal(o[wat]), wat)));
  const heeftWaren = (o) => Object.keys(o || {}).some((wat) => o[wat] >= 0.05);
  const keer = (o, f) => Object.fromEntries(Object.keys(o).map((wat) => [wat, o[wat] * f]));
  const procent = (f) => Math.round(f * 100);
  const zin = (tekst) => (tekst ? T.hoofdletter(tekst) + (/[.!?]$/.test(tekst) ? '' : '.') : '');
  const namen = (mensen) => T.opsomming(mensen.map((p) => T.naamVanBewoner(p)));

  // De kar van opslag g: een schuur heeft de zijne (g.kar, en e.thuis is de schuur; js/kar.js). Het raadhuis heeft er
  // geen: daar lossen de dragers (vraag 184).
  const karVan = (D, g) => g.kar || null;

  // Wat g tegenhoudt, als zinnen; leeg als hij op volle kracht werkt. Dezelfde getallen als de nachtlus
  // (T.tikGebouwenDag, js/gebouwen.js), en in die volgorde: stil, handen, onderweg, het werktempo, het water, en dan
  // wat hem afremt (te weinig om te bewerken, genoeg in de opslag).
  function remmen(D, g, soort) {
    const uit = [];
    if (g.stilWant) uit.push(zin(g.stilWant));
    if (soort.handen > 0 && !g.stilWant) {
      const n = g.handen || 0;
      if (n === 0) uit.push(T.t('No hands: nobody is free to work here.'));
      else if (n < soort.handen) uit.push(T.t('{n} of {m} hands: nobody else is free to work here.', { n, m: soort.handen }));
      const u = g.uren;
      if (u && u.onderweg >= 0.5) uit.push(T.t('{n|# hour|# hours} a day on the road, between home and work.', { n: Math.round(u.onderweg) }));
    }
    if (g.stilWant) return uit;
    const afwisseling = T.werkVanAfwisseling(D);
    if (afwisseling < 0.995) {
      const n = ((D.behoeften && D.behoeften.afwisseling) || []).length;
      uit.push(T.t('Little variety at table ({n|# kind|# kinds} of food): the village works at {p}%.', { n, p: procent(afwisseling) }));
    }
    const water = T.visserWater(D, g);
    if (water < 0.995) uit.push(T.t('The water is low: the catch is {p}% of a good day.', { p: procent(water) }));
    if (g.tekort) {
      uit.push(g.werkte > 0
        ? T.t('Too little {waar} to work with: it works part of the day.', { waar: T.waarNaam(g.tekort) })
        : T.t('No {waar} to work with.', { waar: T.waarNaam(g.tekort) }));
    }
    if (g.vol) {
      const tot = T.maaktTot(soort, D);
      uit.push(T.t('There is enough {waar} in store: it makes no more than {n}.', { waar: T.waarNaam(g.vol), n: tot ? tot[g.vol] : 0 }));
    }
    return uit;
  }

  // Het briefje van gebouw g in dorp D: { kop, doet, delen: [{ titel, regels }] }, of null als het geen gebouw is.
  T.gebouwBriefje = function (D, g) {
    const soort = T.GEBOUWEN[g.soort];
    if (!soort) return null;
    const kop = T.hoofdletter(soort.naam); // ook het town hall, waar de aanvoerder woont (vraag 170, stap 2)
    const doet = zin(soort.beschrijving);
    const delen = [];
    const deel = (titel, regels) => {
      const r = regels.filter(Boolean);
      if (r.length) delen.push({ titel, regels: r });
    };
    // In aanbouw: wie er bouwt en wat er nog nodig is (T.gebouwToestand, met "5 of 8 here"); de rest komt als hij af is.
    if (!g.klaar) {
      deel(T.t('Under construction'), [T.gebouwToestand(D, g)]);
      return { kop, doet, delen };
    }
    const mensen = (D.bewoners && D.bewoners.mensen) || [];
    const wonen = mensen.filter((p) => p.huis === g);
    if (wonen.length) deel(T.t('Lives here'), [zin(namen(wonen))]);
    if (soort.handen > 0) {
      const werken = mensen.filter((p) => p.werk === g);
      deel(T.t('At work'), [
        T.t('{n} of {m} hands', { n: g.handen || 0, m: soort.handen }) + (werken.length ? `: ${namen(werken)}.` : '.'),
      ]);
    }
    // Wat het maakt: op volle kracht (alle handen, het dorp op 100%), vandaag, de laatste dagen en dit jaar. Wie niets per
    // dag maakt maar wel oogst (de boerderij, de wijnboerderij), heeft alleen de laatste dagen en het jaar, en zijn velden.
    const week = T.gemaaktDoor(D, g);
    const jaar = T.gemaaktDoor(D, g, true);
    const dagen = T.GEBOUWEN_INSTELLINGEN.gemaaktDagen;
    const maakt = [];
    if (soort.maakt && soort.maakt.keuze) {
      // Wie kiest (de wapenmaker): één stuk per dag, wat er gevraagd wordt (T.receptVan, js/gebouwen.js); wat van hetzelfde
      // gemaakt wordt, samen.
      const van = new Map();
      for (const wat in soort.maakt.keuze) {
        const uit = waren(soort.maakt.keuze[wat]);
        van.set(uit, [...(van.get(uit) || []), T.waarNaam(wat)]);
      }
      maakt.push(T.t('At full strength: one piece a day, of what is asked for. {stukken}.', {
        stukken: T.hoofdletter([...van].map(([uit, wat]) => T.t('{wat} from {uit}', { wat: T.opsomming(wat), uit })).join('; ')),
      }));
      maakt.push(g.werkte > 0 && g.maaktNu
        ? T.t('Today: {uit} ({p}% of full strength).', { uit: waren({ [g.maaktNu]: soort.maakt.uit[g.maaktNu] * g.werkte }), p: procent(g.werkte) })
        : T.t('Today: nothing.'));
    } else if (soort.maakt) {
      const vol = T.maaktUit(D, soort);
      maakt.push(soort.maakt.in
        ? T.t('At full strength: {uit} a day, from {in}.', { uit: waren(vol), in: waren(soort.maakt.in) })
        : T.t('At full strength: {uit} a day.', { uit: waren(vol) }));
      maakt.push(g.werkte > 0
        ? T.t('Today: {uit} ({p}% of full strength).', { uit: waren(keer(vol, g.werkte)), p: procent(g.werkte) })
        : T.t('Today: nothing.'));
    }
    // De velden van een boerderij: wat af is, is een akker of een wijngaard op de kaart (js/boerderij.js, veldIsAf), en
    // wat nog gelegd wordt, een bouwplaats in D.gebouwen.
    const w = D.wereld || {};
    const velden = [...(w.akkers || []), ...(w.wijngaarden || [])].filter((a) => a.boerderij === g);
    if (velden.length) {
      const tegels = velden.reduce((n, a) => n + a.b * a.h, 0);
      maakt.push(T.t('{n|# field|# fields}, {tegels} tiles.', { n: velden.length, tegels }));
    }
    const gelegd = D.gebouwen.filter((v) => v.boerderij === g && T.isVeldSoort(v.soort)).length;
    if (gelegd) maakt.push(T.t('{n|# field|# fields} being laid.', { n: gelegd }));
    if (soort.maakt || heeftWaren(jaar)) {
      maakt.push(heeftWaren(week)
        ? T.t('Last {n} days: {uit}.', { n: dagen, uit: waren(week) })
        : T.t('Last {n} days: nothing.', { n: dagen }));
    }
    if (heeftWaren(jaar)) maakt.push(T.t('This year: {uit}.', { uit: waren(jaar) }));
    // Wat een ander bestand er nog over weet: in de herberg de gasten en het bier (js/herberg.js).
    const meer = T.GEBOUW_ERBIJ[g.soort];
    // (wie niets maakt, zoals het wachthuis, zegt dat in een eigen deel, hieronder)
    if (meer && soort.maakt) maakt.push(zin(meer(D, g)));
    deel(T.t('Makes'), maakt);
    // Wat een ander bestand er als eigen deel bij zet: bij het wachthuis de soldaten, met knoppen (js/soldaten.js).
    const eigen = T.GEBOUW_DELEN[g.soort];
    if (eigen) for (const d of eigen(D, g)) deel(d.titel, d.regels);
    if (soort.maakt) {
      const r = remmen(D, g, soort);
      deel(T.t('Held back by'), r.length ? r : [T.t('Nothing: it works at full strength.')]);
    }
    // En wat hem harder laat werken: het gereedschap van de smidse (T.gereedschapDekking), voor wie handen heeft.
    if (soort.maakt && soort.handen > 0 && g.werkte > 0) {
      const gereedschap = T.gereedschapDekking(D);
      if (gereedschap.factor > 1.005) deel(T.t('Helped by'), [T.t('Tools: the village works {p}% harder.', { p: procent(gereedschap.factor - 1) })]);
    }
    // Wat erbij ligt: wat de dragers of de kar brachten om te bewerken (g.in), en de stapel bij de deur die ze komen halen.
    const hier = [];
    if (soort.maakt && soort.maakt.in && T.metVervoer(D)) {
      hier.push(heeftWaren(g.in)
        ? T.t('Brought here, to work with: {waren}.', { waren: waren(g.in) })
        : T.t('Nothing brought here yet.'));
    }
    if (T.stapelVan(g) >= 0.05) {
      hier.push(T.t('At the door, to be carried off: {waren} ({n} of {vol}).', {
        waren: waren(g.stapel), n: getal(T.stapelVan(g)), vol: T.KAR_INSTELLINGEN.stapelVol,
      }));
    }
    deel(T.t('Here'), hier);
    // Een opslag: wat zijn kar doet.
    const kar = soort.opslag && karVan(D, g);
    if (kar) deel(T.t('Its ox cart'), [zin(T.karTekst(D, kar))]);
    return { kop, doet, delen };
  };

  // Een klik op een gebouw kiest het (T.handelingVerkennen, js/verkennen.js); een klik ergens anders of Esc legt het weg
  // (js/main.js), en T.ui.werkGebouwbriefjeBij (js/huisbriefje.js) legt het briefje op het scherm.
  T.kiesGebouw = function (S, g) {
    S.gekozen = g;
  };
  T.GEBOUW_DELEN = T.GEBOUW_DELEN || {};
})(globalThis.Spel = globalThis.Spel || {});
