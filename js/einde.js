// Het eind van het spel, en het jaar in het kort (2e, werklijst vraag 101; Marcel, 3 okt: "101 ja"; vraag 79 en 80,
// F).
//
// Winnen: dat staat hier niet meer. Het doel van de oude demo, een jaar lang iedereen super gelukkig (de teller van dagen
// op rij, het doel linksboven, het eindscherm, het grote feest en de spelregel "Het eind"), is op 11 okt weggehaald
// (snoeironde, vraag 153; Marcel koos "Weg": het hoort bij het oude spel). Het nieuwe doel van de demo komt er nog, en
// wacht op Marcel (werklijst, "Wacht op Marcel"); het komt dan hier, of in een eigen bestand.
//
// Verliezen: je ambt kwijt (js/heer.js), de schout gevallen (js/gevecht.js), en sinds 3 okt ook een dorp met minder
// dan `minstensOver` mensen (10): de heer streept het door (T.tikEindeDag, met het eindscherm in js/hud.js).
//
// Het jaar in het kort: wat er gebeurde, telt het dorp elke nacht op in zijn jaarboek (uit het dagboek van de
// raadsman, js/ochtendrapport.js, vóór dat opnieuw begint, en de oogst uit js/akkers.js), en op 1 lentemaand komt het
// jaarverslag (js/brieven.js, soort 'jaarverslag'): hoeveel mensen er kwamen, stierven en wegtrokken, wat de oogst
// bracht, welke huizen doorgroeiden, welke feesten er waren, wat de heer kreeg, en wat het meest gemist werd. Regels
// zonder scherm; toetsen in test/einde.test.cjs.
//
// D.jaarboek:    { begin, mensen, kwamen, stierven, weg, doorgegroeid, geoogst, gemist: { wens: dagen } },
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
  // en wat er vandaag gemist werd (D.behoeften.gemist, js/wensen.js).
  function schrijfJaarboek(D, dag) {
    const J = D.jaarboek || (D.jaarboek = nieuwJaarboek(D, dag));
    for (const r of (D.dagboek && D.dagboek.regels) || []) {
      if (r.soort === 'huis') J.doorgegroeid++;
      if (r.soort !== 'mensen' || !r.verschil) continue;
      if (r.verschil > 0) J.kwamen += r.verschil;
      else if (r.reden === 'vertrek') J.weg -= r.verschil;
      else J.stierven -= r.verschil;
    }
    for (const g of (D.behoeften && D.behoeften.gemist) || []) J.gemist[g.id] = (J.gemist[g.id] || 0) + 1;
  }

  const jaarVan = (dag) => T.datumVanDag(dag).jaar;

  // Het jaar in het kort, als regels in de hand van de raadsman: uit jaarboek J, tot dag `dag`.
  T.jaarverslagRegels = function (D, J, dag) {
    const regels = [];
    const nu = D.bevolking || 0;
    const naam = T.dorpsnaam(D) || 'het dorp';
    const groei = nu > J.mensen ? `groeide ${naam} van ${J.mensen} naar ${nu} mensen` : nu < J.mensen ? `kromp ${naam} van ${J.mensen} naar ${nu} mensen` : `bleef ${naam} op ${nu} mensen`;
    regels.push(`In het jaar ${jaarVan(J.begin)} ${groei}.`);
    const mensen = [
      J.kwamen ? `${J.kwamen} ${J.kwamen === 1 ? 'mens kwam' : 'mensen kwamen'} erbij` : '',
      J.stierven ? `${J.stierven} ${J.stierven === 1 ? 'stierf' : 'stierven'}` : '',
      J.weg ? `${J.weg} ${J.weg === 1 ? 'trok' : 'trokken'} weg` : '',
    ].filter(Boolean);
    if (mensen.length) regels.push(`${T.opsomming(mensen)}.`);
    if (J.geoogst) regels.push(`De oogst bracht ${Math.round(J.geoogst)} graan.`);
    if (J.doorgegroeid) regels.push(`${J.doorgegroeid === 1 ? 'Eén huis groeide' : `${T.hoofdletter(T.telwoord(J.doorgegroeid))} huizen groeiden`} door.`);
    const feesten = ((D.feesten && D.feesten.gevierd) || []).filter((f) => f.dag >= J.begin && f.dag < dag).map((f) => T.FEESTEN[f.id].naam);
    if (feesten.length) regels.push(`We vierden ${T.opsomming(feesten)}.`);
    const heer = ((D.heer && D.heer.jaren) || []).find((j) => j.jaar === jaarVan(J.begin));
    if (heer) regels.push(`De heer kreeg ${Math.floor(heer.deel * 100 + 1e-9)}% van wat hij vroeg${heer.straf ? `, en strafte met ${heer.straf}` : ''}.`);
    const meest = Object.entries(J.gemist).sort((a, b) => b[1] - a[1])[0];
    if (meest) regels.push(`Het meest gemist werd ${T.WENSEN[meest[0]] ? T.WENSEN[meest[0]].naam : meest[0]}, op ${meest[1]} dagen.`);
    return regels;
  };

  const nieuwJaar = (dag) => {
    const d = T.datumVanDag(dag);
    return d.maand === T.TIJD_START_MAAND && d.dagVanMaand === 1;
  };

  // ---------------------------------------------------------------------------------------------
  // Elke nacht
  // ---------------------------------------------------------------------------------------------

  // Elke nacht (T.tikGebouwenDag, js/gebouwen.js, vóór het rapport): het jaarboek, op 1 lentemaand het jaarverslag, en of
  // het spel verloren is. Een ander dorp (het buurdorp) verliest nog niet.
  T.tikEindeDag = function (D, dag) {
    if (D.einde || D.ander) return;
    if ((D.bevolking || 0) < IN().minstensOver) {
      D.einde = { reden: 'leeg', dag };
      T.zeg(D, `Er zijn nog maar ${D.bevolking || 0} mensen over. De heer streept het dorp door in zijn boek.`, 'gevaar');
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
