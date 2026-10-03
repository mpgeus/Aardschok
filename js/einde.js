// Het eind van het spel, en het jaar in het kort (2e, werklijst vraag 101; Marcel, 3 okt: "101 ja"; vraag 79 en 80,
// F).
//
// Winnen: een stad waar iedereen een jaar lang super gelukkig is, zoals in Anno 1602. Elke nacht kijkt het dorp of
// alle huizen alles hebben wat hun stand wil (g.wensen.alles, js/wensen.js) en alle woningen in de hoogste stand zijn
// (stenen huizen; de boerderijen staan ernaast), en of er minstens `minstensMensen` mensen wonen (100, de maat van de
// demo; vraag 77: "een dorp van 50 is als doel te klein"). Dan loopt er een teller. Een slechte reeks van hooguit
// `magMissen` dagen zet hem stil, en een dag meer zet hem op nul (de spelregel "Het eind": "Een week mag", de standaard,
// of "Een jaar op rij": één slechte dag zet hem op nul; werklijst vraag 102, d). Na `dagen` (360) is het gewonnen: het dorp viert het grote feest op het plein
// (js/feesten.js), en die avond komt het eindscherm over het feest (js/hud.js, T.ui.toonGewonnen). Wie wint, kan
// verder spelen. Linksboven staat het doel zodra er geen trede meer te halen is (T.eindDoel, na marktrecht): hoeveel
// mensen nog, hoeveel huizen alles hebben, en hoeveel dagen op rij.
//
// Verliezen: je ambt kwijt (js/heer.js), de schout gevallen (js/gevecht.js), en sinds 3 okt ook een dorp met minder
// dan `minstensOver` mensen (10): de heer streept het door.
//
// Het jaar in het kort: wat er gebeurde, telt het dorp elke nacht op in zijn jaarboek (uit het dagboek van de
// raadsman, js/ochtendrapport.js, vóór dat opnieuw begint, en de oogst uit js/akkers.js), en op 1 lentemaand komt het
// jaarverslag (js/brieven.js, soort 'jaarverslag'): hoeveel mensen er kwamen, stierven en wegtrokken, wat de oogst
// bracht, welke huizen doorgroeiden, welke feesten er waren, wat de heer kreeg, wat het meest gemist werd, en op
// hoeveel dagen iedereen alles had. Regels zonder scherm; toetsen in test/einde.test.cjs.
//
// D.eind:        { dagen, beste, gewonnen, mis }: hoeveel dagen op rij iedereen gelukkig is, de langste reeks,
//                { dag, getoond } zodra het gewonnen is, en hoeveel slechte dagen op rij de teller nu stilstaat
// D.jaarboek:    { begin, mensen, kwamen, stierven, weg, doorgegroeid, gelukkig, geoogst, gemist: { wens: dagen } },
//                sinds begin
// D.jaarverslag: het laatste jaarverslag, { dag, regels }
(function (T) {
  'use strict';

  // Alle getallen in één blok, zoals elders (CLAUDE.md); ze staan ook in de werkbank (js/opties.js).
  T.EINDE_INSTELLINGEN = {
    // Zoveel dagen op rij iedereen super gelukkig, en het is gewonnen (vraag 79: "een jaar lang").
    dagen: 360,
    // Pas vanaf zoveel mensen telt het: anders win je met één stenen huis in een gehucht.
    minstensMensen: 100,
    // Zoveel slechte dagen op rij zetten de teller stil, niet terug; een dag meer, en hij begint opnieuw. Met 0 zet één
    // slechte dag hem terug (de spelregel "Het eind"; werklijst vraag 102, d: anders kost één aanval van de rovers of
    // één late marskramer een heel jaar, en dat is pech, geen spel).
    magMissen: 7,
    // Minder mensen dan dit, en het spel is uit.
    minstensOver: 10,
  };
  const IN = () => T.EINDE_INSTELLINGEN;

  // De hoogste stand van de ladder (de ambachtslieden, in een stenen huis); wie ernaast staat (de boeren) telt zo ook.
  const hoogste = () => Object.keys(T.STANDEN).filter((s) => !T.STANDEN[s].los).pop();
  const woningen = (D) => (D.gebouwen || []).filter((g) => g.wensen && g.wensen.mensen > 0);
  const gelukkig = (g) => g.wensen.alles && (g.wensen.stand === hoogste() || T.STANDEN[g.wensen.stand].los);

  // Is iedereen super gelukkig? Minstens zoveel mensen, en elk huis met mensen heeft alles, in de hoogste stand (of
  // ernaast).
  T.iedereenGelukkig = function (D) {
    if ((D.bevolking || 0) < IN().minstensMensen) return false;
    const huizen = woningen(D);
    return huizen.length > 0 && huizen.every(gelukkig);
  };

  // Staat de teller stil (een slechte dag, en het mag nog), dan zegt het doel hoe lang nog.
  function stil(E) {
    if (!E.mis) return '';
    const nog = IN().magMissen - E.mis;
    return nog > 0 ? `; de teller staat stil, nog ${nog} ${nog === 1 ? 'dag' : 'dagen'} om het goed te maken`
      : '; de teller staat stil: maak het vandaag goed, of hij begint opnieuw';
  }

  // Het doel linksboven (js/main.js) als er geen trede meer te halen is: { kop, tekst }, of null zolang er nog een trede
  // komt, of als hier niet gewonnen kan worden (een kaart zonder plein: geen gehucht).
  T.eindDoel = function (D) {
    if (T.volgendeTrede(D) || !(D.wereld && D.wereld.plein)) return null;
    const naam = T.dorpsnaam(D);
    const kop = `${naam ? `${naam} · ` : ''}iedereen een jaar gelukkig`;
    const E = D.eind || {};
    if (E.gewonnen) return { kop, tekst: `gewonnen op ${T.datumVanDag(E.gewonnen.dag).tekst}`, klaar: true };
    if ((D.bevolking || 0) < IN().minstensMensen) return { kop, tekst: `${D.bevolking || 0} van ${IN().minstensMensen} mensen` };
    if (E.dagen > 0) return { kop, tekst: `${E.dagen} van ${IN().dagen} dagen${stil(E)}` };
    const huizen = woningen(D);
    return { kop, tekst: `${huizen.filter(gelukkig).length} van ${huizen.length} huizen zijn super gelukkig` };
  };

  // ---------------------------------------------------------------------------------------------
  // Het jaarboek en het jaarverslag
  // ---------------------------------------------------------------------------------------------

  const nieuwJaarboek = (D, dag) => ({ begin: dag, mensen: D.bevolking || 0, kwamen: 0, stierven: 0, weg: 0, doorgegroeid: 0, gelukkig: 0, geoogst: 0, gemist: {} });

  // Wat het jaarboek telt dat niet in het dagboek staat: het graan van de oogst, tegel voor tegel (js/akkers.js).
  T.telOogstInJaarboek = function (D, graan) {
    const J = D.jaarboek || (D.jaarboek = nieuwJaarboek(D, D.kalender ? Math.floor(D.kalender.dag) : 0));
    J.geoogst = (J.geoogst || 0) + graan;
  };

  // Wat er vandaag gebeurde, in het jaarboek: uit het dagboek (wie er kwam, stierf of wegtrok, welke huizen doorgroeiden),
  // wat er vandaag gemist werd (D.behoeften.gemist, js/wensen.js), en of iedereen alles had.
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
    const huizen = woningen(D);
    if (huizen.length && huizen.every((g) => g.wensen.alles)) J.gelukkig++;
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
    regels.push(J.gelukkig ? `Op ${J.gelukkig} ${J.gelukkig === 1 ? 'dag' : 'dagen'} had iedereen alles wat hij wilde.` : 'Er was geen dag waarop iedereen alles had wat hij wilde.');
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
  // het spel gewonnen of verloren is. Een ander dorp (het buurdorp) wint en verliest nog niet.
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
    const E = D.eind || (D.eind = { dagen: 0, beste: 0, gewonnen: null });
    if (E.gewonnen) return;
    if (T.iedereenGelukkig(D)) {
      E.dagen++;
      E.mis = 0;
    } else if (E.dagen > 0 && (E.mis || 0) < IN().magMissen) {
      E.mis = (E.mis || 0) + 1; // de teller staat stil
    } else {
      E.dagen = 0;
      E.mis = 0;
    }
    E.beste = Math.max(E.beste, E.dagen);
    if (E.dagen < IN().dagen) return;
    E.gewonnen = { dag, getoond: false };
    T.vierVandaag(D, 'stad', dag);
    T.zeg(D, 'Een jaar lang had iedereen alles wat hij wilde. Vandaag viert het hele dorp het grote feest op het plein.', 'goed');
  };

  // Elk beeld (js/main.js): is het gewonnen, dan komt het eindscherm over het feest, 's avonds als het licht brandt, of
  // eerder als de schout bij het feest staat. Eén keer.
  T.werkEindeBij = function (S) {
    const D = S.dorp;
    const g = D && D.eind && D.eind.gewonnen;
    if (!g || g.getoond || !S.kalender) return;
    const feest = T.feestOp(D, S.kalender.dag);
    const bij = feest && feest.midden && S.schout && Math.max(Math.abs(S.schout.tx - feest.midden.x), Math.abs(S.schout.ty - feest.midden.y)) <= T.FEESTEN_INSTELLINGEN.kring;
    if (!bij && T.uurVanDag(S.kalender.dag) < 20 && Math.floor(S.kalender.dag) === g.dag) return;
    g.getoond = true;
    if (T.ui && T.ui.toonGewonnen) T.ui.toonGewonnen(D);
  };
})(globalThis.Spel = globalThis.Spel || {});
