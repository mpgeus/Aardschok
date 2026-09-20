// Rondlopen buiten een gevecht: klikken om te lopen, praten, oppakken en deuren. De monsters
// dwalen intussen door hun eigen kamer, en zodra er één de held ziet, begint het gevecht op
// de plek waar iedereen op dat moment staat.
(function (T) {
  'use strict';

  const heldMag = (S) => (x, y) => T.isBegaanbaar(S.wereld, x, y, { deurenOpenen: true, wezensBlokkeren: true, wie: S.held });
  const vast = (S) => (x, y) => T.isVast(S.wereld, x, y);

  // Is de held midden in een stap, dan maakt hij die eerst af en rekent het nieuwe pad
  // vanaf de tegel waar hij naartoe stapt.
  function heldPad(S, doel, naast) {
    const held = S.held;
    const pad = T.zoekPad(T.tegelVan(held), doel, heldMag(S), vast(S), { naast });
    if (pad === null) return null;
    // `onderweg` zonder een tegel om heen te stappen kan niet, maar als het toch gebeurt (iets
    // dat de held verzette zonder het af te maken) zou er een leeg vakje voorin het pad komen, en
    // daar loopt de beweging op stuk.
    return held.onderweg && held.pad[0] ? [held.pad[0], ...pad] : pad;
  }

  function loopNaar(S, doel) {
    const pad = heldPad(S, doel, false);
    if (!pad) {
      T.ui.bericht('Daar kun je niet komen.');
      return;
    }
    S.held.pad = pad;
    S.naLopen = null;
  }

  // Loop tot naast het doel en doe daar `actie`. Staat de held er al naast, dan meteen.
  function loopNaast(S, doel, actie) {
    const held = S.held;
    if (!held.onderweg && T.raakt(S.wereld, T.tegelVan(held), doel)) {
      held.pad = [];
      S.naLopen = null;
      actie();
      return;
    }
    const pad = heldPad(S, doel, true);
    if (!pad) {
      T.ui.bericht('Daar kun je niet bij.');
      return;
    }
    held.pad = pad;
    S.naLopen = { doel: { x: doel.x, y: doel.y }, actie };
  }

  // Wat gebeurt er als je hierop klikt? Geeft { tekst, doe, fout } terug, of null.
  // De tekst komt bij de muis te staan; het scherm en de klik stellen dus dezelfde vraag.
  T.handelingVerkennen = function (S, doel) {
    // Met een spreuk in de hand richt elke klik die spreuk (zie toveren.js).
    if (S.spreuk) return T.handelingSpreuk(S, doel);
    if (!doel) return null;
    const w = S.wereld;
    if (doel.wezen) {
      const e = doel.wezen;
      if (e.soort === 'wim') return { tekst: 'Praten met Wim', doe: () => loopNaast(S, e, () => T.openDialoog(S, e)) };
      if (e.kant === 'monster') return { tekst: `De ${e.naam} aanvallen`, doe: () => T.startGevecht(S, e, true) };
      return null;
    }
    if (doel.voorwerp) {
      const v = doel.voorwerp;
      if (v.soort === 'fontein') {
        if (S.fonteinLeeg) return { tekst: 'De fontein staat droog', fout: true, doe: () => T.ui.bericht('De fontein staat droog. Wim had gelijk: het was de laatste slok.') };
        return { tekst: `De laatste slok drinken (${T.duurTekst(T.FONTEIN.maanden)} jonger)`, doe: () => loopNaast(S, v, () => T.drinkLaatsteSlok(S)) };
      }
      if (v.soort === 'sleutel') return { tekst: 'De sleutel oppakken', doe: () => loopNaar(S, v) };
      if (v.soort === 'trap') return { tekst: 'De trap op', doe: () => loopNaast(S, v, () => T.gewonnen(S)) };
      if (v.soort === 'kist') {
        return { tekst: 'De kist bekijken', doe: () => loopNaast(S, v, () => T.ui.bericht('Een kist vol versleten bezems. Wim gooit niets weg.')) };
      }
    }
    const d = T.deurOp(w, doel.x, doel.y);
    if (d && d.staat === 'opslot') {
      if (S.inventaris.has('sleutel')) return { tekst: 'De deur openen met de sleutel', doe: () => loopNaast(S, d, () => ontsluit(S, d)) };
      return { tekst: 'Op slot', fout: true, doe: () => T.ui.bericht('De deur zit op slot. Misschien weet Wim waar de sleutel is.') };
    }
    // Een open deur is gewoon een doorgang: wie erop klikt, wil erdoor. Dichtgooien kan
    // in een gevecht, met een eigen knop.
    if (!T.isZichtbaar(w, doel.x, doel.y) || !T.isBegaanbaar(w, doel.x, doel.y, { deurenOpenen: true })) return null;
    // Een tegel die naar een ander gebied leidt, zegt dat erbij: anders loop je de toren uit
    // zonder dat je het wilde.
    const o = T.overgangOp(w, doel.x, doel.y);
    if (o) {
      const naam = (T.GEBIEDEN[o.naar] && T.GEBIEDEN[o.naar].naam) || o.naar;
      return { tekst: `Naar ${naam.toLowerCase()}`, doe: () => loopNaar(S, { x: doel.x, y: doel.y }) };
    }
    return { tekst: null, doe: () => loopNaar(S, { x: doel.x, y: doel.y }) };
  };

  function ontsluit(S, d) {
    d.staat = 'open';
    S.inventaris.delete('sleutel');
    S.sleutelGebruikt = true;
    T.ontdekBijDeur(S.wereld, d);
    T.ui.toonInventaris(S);
    T.ui.bericht('De sleutel past. De zware deur zwaait open.', 'goed');
  }

  // Staat deze tegel een doorgang in de weg? Een deur, of de tegel er pal naast: daar mag niemand
  // blijven staan te dwalen. Anders sta je voor een dichte deur te wachten tot iemand opschuift,
  // en dat mag je nooit jaren kosten (ontwerp/wereld.md).
  function bijDeur(w, x, y) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) if (T.tegel(w, x + dx, y + dy) === 'deur') return true;
    }
    return false;
  }

  // Waar hoort dit wezen rond te blijven? Wie een plek en een straal heeft (`thuis`), blijft daar
  // in de buurt: de smid bij de smidse, Wim bij zijn trap, de wolf bij zijn stuk bos. Wie die niet
  // heeft, blijft in zijn eigen kamer — binnen is een kamer vanzelf een stuk wereld, buiten is de
  // hele kaart één kamer en zou een wolf tot de andere kant van het erf wandelen.
  function magDwalenNaar(w, e, x, y) {
    if (!T.isBegaanbaar(w, x, y, { wezensBlokkeren: true, wie: e })) return false;
    if (bijDeur(w, x, y)) return false;
    if (e.thuis) return T.afstand(e.thuis, { x, y }) <= (e.straal || 3);
    const k = T.kamerVan(w, e.tx, e.ty);
    return !!k && T.kamerVan(w, x, y) === k;
  }

  // Wie dwaalt, zet af en toe een stap binnen zijn eigen stukje wereld en staat er daarna weer
  // even bij stil — dan doet hij wat bij hem past (Wim veegt). Een dorpeling gebruikt hetzelfde
  // loopwerk als een dwalend monster; het verschil is dat hij nooit een gevecht begint (hij is
  // `neutraal`, en T.zoekOntdekking en T.deelnemers kijken alleen naar monsters).
  //
  // Wie op een dwaallicht afgaat, dwaalt zolang niet: dat monster heeft iets beters te doen
  // (toveren.js). En wie een gesprek voert, staat stil tot het uit is.
  T.laatDwalen = function (S, dt) {
    const w = S.wereld;
    for (const m of w.wezens) {
      if (m.dood || !m.dwaalt || m.pad.length || m.gelokt || m === S.spreektMet) continue;
      m.dwaalTijd -= dt;
      // Staat hij toevallig stil op een tegel waar hij een doorgang blokkeert, dan wacht hij daar
      // niet zijn hele pauze uit maar stapt meteen door.
      if (m.dwaalTijd > 0 && !bijDeur(w, m.tx, m.ty)) continue;
      m.dwaalTijd = 1.5 + Math.random() * 2.5;
      const opties = [];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (magDwalenNaar(w, m, m.tx + dx, m.ty + dy)) opties.push({ x: m.tx + dx, y: m.ty + dy });
      }
      if (opties.length) m.pad = [opties[Math.floor(Math.random() * opties.length)]];
    }
  };

  // Wie sluipt, loopt half zo snel, maar wordt pas van twee tegels dichterbij opgemerkt.
  // Een gevecht dat je zo ontloopt, kost je geen enkel jaar.
  T.SLUIP_ZICHT = 2;

  // Ziet een monster de held? Dan geeft dit het monster terug.
  T.zoekOntdekking = function (S) {
    const w = S.wereld;
    const h = T.tegelVan(S.held);
    const minder = S.sluipen ? T.SLUIP_ZICHT : 0;
    for (const m of w.wezens) {
      if (m.dood || m.kant !== 'monster') continue;
      const p = T.tegelVan(m);
      if (T.afstand(p, h) <= m.zicht - minder && T.zichtTussen(w, p, h)) return m;
    }
    return null;
  };

  T.wisselSluipen = function (S) {
    if (S.modus !== 'verkennen') return;
    S.sluipen = !S.sluipen;
    T.ui.toonSluipen(S.sluipen);
    T.ui.bericht(S.sluipen ? 'Je sluipt: trager, maar minder snel opgemerkt.' : 'Je loopt weer gewoon.');
  };

  // Mag deze stap nog? Tijdens het rondlopen kan er intussen een monster in de weg staan.
  T.magStappen = function (S, e, t) {
    return T.isBegaanbaar(S.wereld, t.x, t.y, { deurenOpenen: e === S.held, wezensBlokkeren: true, wie: e });
  };

  // Een dichte deur gaat open op het moment dat de held erdoor stapt, niet pas als hij er
  // al half doorheen is.
  T.bijStapBegin = function (S, e, t) {
    if (e !== S.held) return;
    const d = T.deurOp(S.wereld, t.x, t.y);
    if (d && d.staat === 'dicht') {
      d.staat = 'open';
      T.ontdekBijDeur(S.wereld, d);
    }
  };

  T.bijAankomst = function (S, e, t) {
    const w = S.wereld;
    if (e === S.held) {
      const k = T.kamerVan(w, t.x, t.y);
      if (k) {
        w.bekend.add(k.id);
        w.huidigeKamer = k.id;
        if (!S.bezocht.has(k.id)) {
          S.bezocht.add(k.id);
          T.ui.plek(k.naam);
        }
      }
      const d = T.deurOp(w, t.x, t.y);
      if (d) T.ontdekBijDeur(w, d);
      const v = T.voorwerpOp(w, t.x, t.y);
      if (v && v.soort === 'sleutel') {
        w.voorwerpen.splice(w.voorwerpen.indexOf(v), 1);
        S.inventaris.add('sleutel');
        T.ui.toonInventaris(S);
        T.ui.bericht('Je vindt de ijzeren sleutel.', 'goed');
      }
      // Stap je op een tegel die naar een ander gebied leidt, dan gaan we daarheen — maar niet
      // hier, midden in de beweging: de spellus loopt nu door de lijst wezens van deze wereld
      // heen, en die lijst verandert bij een overgang. main.js pakt het zo op.
      //
      // Alleen als je er echt op stápt. Wie er net is neergezet (S.netGeland, gezet door
      // T.gaNaarGebied), staat er al, en dan zou de overgang meteen weer afgaan: heen en weer
      // tussen twee gebieden. Die tegel staat pas weer scherp als hij er een keer af is geweest.
      //
      // En alleen als je daar je pas beëindigt. Buiten ligt de overgang midden op het erf, vóór
      // de deur van de toren, en daar loop je aan één stuk door langs; wie naar de moestuin loopt,
      // wil niet halverwege binnen staan. Wie naar de deur loopt, klikt op de deur (en het scherm
      // zegt er "Naar de toren" bij).
      const zojuist = S.netGeland && S.netGeland.x === t.x && S.netGeland.y === t.y;
      if (!zojuist) S.netGeland = null;
      const o = !zojuist && !e.pad.length && S.modus === 'verkennen' && !S.gevecht ? T.overgangOp(w, t.x, t.y) : null;
      if (o) {
        e.pad = [];
        S.naLopen = null;
        S.naarGebied = o.naar;
      }
    }
    if (S.gevecht) T.gevechtBijAankomst(S, e, t);
    if (e === S.held && S.modus === 'verkennen' && !e.pad.length && S.naLopen) {
      const n = S.naLopen;
      S.naLopen = null;
      if (T.raakt(w, t, n.doel)) n.actie();
    }
  };

  // Wat telt aan het eind, is hoe oud je boven aankomt.
  T.gewonnen = function (S) {
    S.modus = 'einde';
    const verschil = S.held.leeftijd - T.STARTLEEFTIJD;
    const kosten = verschil > 0 ? `Deze verdieping kostte je ${T.duurTekst(verschil)}.` : 'Deze verdieping kostte je geen dag.';
    T.ui.toonOverlay(
      'De trap op',
      `<p>Je klimt naar de volgende verdieping. Boven is het stil, op iets na dat ademt.</p>` +
        `<p>Je bent nu ${T.leeftijdTekst(S.held.leeftijd)}. ${kosten}</p><p>Hier eindigt het proefje.</p>`,
      'Opnieuw spelen',
      () => T.nieuwSpel(true),
    );
  };
})(globalThis.Toren = globalThis.Toren || {});
