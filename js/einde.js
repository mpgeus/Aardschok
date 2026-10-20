// Het eind van het spel, en het jaar in het kort (2e, werklijst vraag 101; Marcel, 3 okt: "101 ja"; vraag 79 en 80,
// F).
//
// Winnen: dat staat hier niet meer. Het doel van de oude demo, een jaar lang iedereen super gelukkig (de teller van dagen
// op rij, het doel linksboven, het eindscherm, het grote feest en de spelregel "Het eind"), is op 11 okt weggehaald
// (snoeironde, vraag 153; Marcel koos "Weg": het hoort bij het oude spel). Het nieuwe doel van de demo komt er nog, en
// wacht op Marcel (werklijst, "Wacht op Marcel"); het komt dan hier, of in een eigen bestand.
//
// Verliezen: je ambt kwijt (js/heer.js), de aanvoerder gevallen (js/gevecht.js), en sinds 3 okt ook een dorp met minder
// dan `minstensOver` mensen (10): de heer streept het door (T.tikEindeDag, met het eindscherm in js/hud.js).
//
// Het jaar in het kort: wat er gebeurde, telt het dorp elke nacht op in zijn jaarboek (uit het dagboek, T.schrijfOp
// hieronder, vóór dat opnieuw begint, en de oogst uit js/akkers.js), en op 1 lentemaand komt het
// jaarverslag (js/brieven.js, soort 'jaarverslag'): hoeveel mensen er kwamen, stierven en wegtrokken, wat de oogst
// bracht, welke huizen doorgroeiden, wat de heer kreeg, en wat het meest gemist werd. Regels
// zonder scherm; toetsen in test/einde.test.cjs.
//
// D.jaarboek:    { begin, mensen, kwamen, stierven, weg, doorgegroeid, geoogst, gemist: { wat het miste: dagen } },
//                sinds begin
// D.jaarverslag: het laatste jaarverslag, { dag, regels }
(function (T) {
  'use strict';

  // Alle getallen in één blok, zoals elders (CLAUDE.md); ze staan ook in de werkbank (js/opties.js).
  T.EINDE_INSTELLINGEN = {
    // Minder mensen dan dit, en het spel is uit.
    minstensOver: 10,
  };
  const IN = () => T.EINDE_INSTELLINGEN;

  // De demo (werklijst, E, stap 6; Marcel, 18 okt, D2): de demo eindigt op het eerste Sint-Maarten, ook als je betaalt
  // (dan rijdt de heer weg met je waren; wie weigert, krijgt zijn leger, ook in het volle spel). Uit in het volle spel en
  // bij het spelen hier; aan bij het verpakken van de demo voor Next Fest (ontwerp/verpakken.md), zoals het debugvenster.
  // `steam`: het adres van de Steam-pagina, voor de link om het spel op je verlanglijst te zetten (in januari 2027); zonder
  // adres staat de link er niet.
  // `dicht` (werklijst Q, vraag 181, e; Marcel, 20 okt: W1 en L1): wat in de demo op slot is, voor het volle spel; het
  // staat in het bouwmenu, met "In the full game", maar je zet het niet neer (T.inDeDemoDicht, js/gebouwen.js). Bij het
  // verpakken van de demo gaat het er echt uit, niet alleen met deze vlag (verpakken.md). `wacht` (S1: "2 speermannen en
  // 1 kruisboogschutter"): wie in de demo met de huifkar meekomt, om te proeven wat vechten is: soldaten met hun eigen
  // stukken en zonder wachthuis, in een eigen tent; ze staan waar je ze neerzet (js/bewoners.js, js/soldaten.js). `slot`:
  // of wat `dicht` is op slot zit; null volgt `aan`, en het debugvenster zet het aan of uit om te proberen (Marcel, 20 okt:
  // "dat we de gebouwen ook aan en uit kunnen zetten om te testen"; js/debugvenster.js).
  T.DEMO_INSTELLINGEN = {
    aan: false,
    steam: null,
    dicht: ['wachthuis', 'wapenmaker'],
    slot: null,
    wacht: ['speerman', 'speerman', 'kruisboogschutter'],
  };

  // ---------------------------------------------------------------------------------------------
  // Het dagboek: wat er vandaag gebeurde
  // ---------------------------------------------------------------------------------------------

  const dagNu = (D) => Math.floor((D.kalender && D.kalender.dag) || 0);

  // Het dagboek van de dag die begint: een lege bladzijde (elke nacht, T.tikGebouwenDag, na het jaarboek).
  T.nieuwDagboek = (D, dag) => ({ dag, regels: [] });

  // Schrijf op wat er vandaag gebeurde (D.dagboek), voor het jaarboek hieronder. `soort`: 'mensen' (wie er kwam, stierf
  // of wegtrok: verschil, reden, waarom en wie, T.wijzigBevolking), 'huis' (een huis groeide door: wie er woont, van, naar
  // en de stand, js/behoeften.js), en wat het jaarboek niet telt maar wel gebeurde ('boeren', 'brand', 'bode': tekst).
  // Tot 15 okt stond het dagboek bij het rapport van de raadsman; het verhuisde in ronde 3 van het snoeien
  // (ontwerp/snoeien.md), omdat het rapport wegging en het jaarboek bleef.
  T.schrijfOp = function (D, soort, wat) {
    const boek = D.dagboek || (D.dagboek = T.nieuwDagboek(D, dagNu(D)));
    boek.regels.push({ dag: dagNu(D), soort, ...wat });
  };

  // ---------------------------------------------------------------------------------------------
  // Het jaarboek en het jaarverslag
  // ---------------------------------------------------------------------------------------------

  const nieuwJaarboek = (D, dag) => ({ begin: dag, mensen: D.bevolking || 0, kwamen: 0, stierven: 0, weg: 0, doorgegroeid: 0, geoogst: 0, gemist: {} });

  // Wat het jaarboek telt dat niet in het dagboek staat: het graan van de oogst, tegel voor tegel (js/akkers.js).
  T.telOogstInJaarboek = function (D, graan) {
    const J = D.jaarboek || (D.jaarboek = nieuwJaarboek(D, D.kalender ? Math.floor(D.kalender.dag) : 0));
    J.geoogst = (J.geoogst || 0) + graan;
  };

  // Wat er vandaag gebeurde, in het jaarboek: uit het dagboek (wie er kwam, stierf of wegtrok, welke huizen doorgroeiden),
  // en wat het dorp vandaag miste (D.behoeften.mist, js/behoeften.js: het eten, het brandhout, een kerk, bier).
  function schrijfJaarboek(D, dag) {
    const J = D.jaarboek || (D.jaarboek = nieuwJaarboek(D, dag));
    for (const r of (D.dagboek && D.dagboek.regels) || []) {
      if (r.soort === 'huis') J.doorgegroeid++;
      if (r.soort !== 'mensen' || !r.verschil) continue;
      if (r.verschil > 0) J.kwamen += r.verschil;
      else if (r.reden === 'vertrek') J.weg -= r.verschil;
      else J.stierven -= r.verschil;
    }
    for (const wat of (D.behoeften && D.behoeften.mist) || []) J.gemist[wat] = (J.gemist[wat] || 0) + 1;
  }

  const jaarVan = (dag) => T.datumVanDag(dag).jaar;

  // Het jaar in het kort, als regels: uit jaarboek J, tot dag `dag`.
  T.jaarverslagRegels = function (D, J, dag) {
    const regels = [];
    const nu = D.bevolking || 0;
    const woorden = { jaar: jaarVan(J.begin), naam: T.dorpsnaam(D) || T.t('the village'), van: J.mensen, naar: nu, n: nu };
    regels.push(nu > J.mensen ? T.t('In the year {jaar} {naam} grew from {van} to {naar} people.', woorden)
      : nu < J.mensen ? T.t('In the year {jaar} {naam} shrank from {van} to {naar} people.', woorden)
        : T.t('In the year {jaar} {naam} stayed at {n} people.', woorden));
    const mensen = [
      J.kwamen ? T.t('{n|# person joined|# people joined}', { n: J.kwamen }) : '',
      J.stierven ? T.t('{n} died', { n: J.stierven }) : '',
      J.weg ? T.t('{n} left', { n: J.weg }) : '',
    ].filter(Boolean);
    if (mensen.length) regels.push(`${T.opsomming(mensen)}.`);
    if (J.geoogst) regels.push(T.t('The harvest brought {graan}.', { graan: T.hoeveel(Math.round(J.geoogst), 'graan') }));
    if (J.doorgegroeid) regels.push(T.t('{n|One house grew larger.|{getal} houses grew larger.}', { n: J.doorgegroeid, getal: T.hoofdletter(T.telwoord(J.doorgegroeid)) }));
    const heer = ((D.heer && D.heer.jaren) || []).find((j) => j.jaar === jaarVan(J.begin));
    if (heer && heer.geweigerd) regels.push(T.t('You refused the lord what he asked.'));
    else if (heer) {
      const pct = Math.floor(heer.deel * 100 + 1e-9);
      regels.push(heer.straf ? T.t('The lord received {pct}% of what he asked for, and punished with {straf}.', { pct, straf: T.STRAF_TOON[heer.straf] })
        : T.t('The lord received {pct}% of what he asked for.', { pct }));
    }
    const meest = Object.entries(J.gemist).sort((a, b) => b[1] - a[1])[0];
    if (meest) regels.push(T.t('The most missed was {wens}, for {n|# day|# days}.', { wens: meest[0], n: meest[1] }));
    return regels;
  };

  // Het eind van de demo, of zijn leger (js/hud.js, T.ui.toonEinde): het jaar tot nu in het kort (T.jaarverslagRegels),
  // en wat er staat. Geeft regels.
  T.eindRegels = function (D) {
    const dag = dagNu(D);
    const regels = T.jaarverslagRegels(D, D.jaarboek || nieuwJaarboek(D, dag), dag);
    const staat = (D.gebouwen || []).filter((g) => g.klaar && !T.isVeldSoort(g.soort) && g.soort !== 'tent').length;
    if (staat) regels.splice(1, 0, T.t('{n|One building stands|# buildings stand} where there was wilderness.', { n: staat }));
    return regels;
  };

  const nieuwJaar = (dag) => {
    const d = T.datumVanDag(dag);
    return d.maand === T.TIJD_START_MAAND && d.dagVanMaand === 1;
  };

  // ---------------------------------------------------------------------------------------------
  // Elke nacht
  // ---------------------------------------------------------------------------------------------

  // Elke nacht (T.tikGebouwenDag, js/gebouwen.js): het jaarboek, op 1 lentemaand het jaarverslag, en of
  // het spel verloren is. Een ander dorp (het buurdorp) verliest nog niet.
  T.tikEindeDag = function (D, dag) {
    if (D.einde || D.ander) return;
    if ((D.bevolking || 0) < IN().minstensOver) {
      D.einde = { reden: 'leeg', dag };
      T.zeg(D, T.t('{n|Only one person is left.|Only # people are left.} The lord strikes the village out of his book.', { n: D.bevolking || 0 }), 'gevaar');
      T.houdTijdStil(D, 'einde');
      if (T.ui && T.ui.toonEinde) T.ui.toonEinde(D);
      return;
    }
    schrijfJaarboek(D, dag);
    if (dag > 0 && nieuwJaar(dag)) {
      D.jaarverslag = { dag, regels: T.jaarverslagRegels(D, D.jaarboek, dag) };
      D.jaarboek = nieuwJaarboek(D, dag);
      if (T.ui && T.ui.toonBrief) T.ui.toonBrief(D, 'jaarverslag');
    }
  };
})(globalThis.Spel = globalThis.Spel || {});
