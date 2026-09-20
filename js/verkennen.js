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
    return held.onderweg ? [held.pad[0], ...pad] : pad;
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

  // Monsters die dwalen, zetten af en toe een stap binnen hun eigen kamer. Wie op een
  // dwaallicht afgaat, dwaalt zolang niet: dat monster heeft iets beters te doen (toveren.js).
  T.laatDwalen = function (S, dt) {
    const w = S.wereld;
    for (const m of w.wezens) {
      if (m.dood || !m.dwaalt || m.pad.length || m.gelokt) continue;
      m.dwaalTijd -= dt;
      if (m.dwaalTijd > 0) continue;
      m.dwaalTijd = 1.5 + Math.random() * 2.5;
      const k = T.kamerVan(w, m.tx, m.ty);
      const opties = [];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const x = m.tx + dx;
        const y = m.ty + dy;
        if (k && T.kamerVan(w, x, y) === k && T.isBegaanbaar(w, x, y, { wezensBlokkeren: true, wie: m })) opties.push({ x, y });
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
