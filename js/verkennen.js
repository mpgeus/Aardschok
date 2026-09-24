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

  // Loop tot naast het doel en doe daar `actie`. Staat de held er al naast, dan meteen. Is het
  // doel een wezen, dan telt zijn tegel (tx, ty), niet zijn vloeiende plek: wie op Wim of de meester
  // klikt terwijl die net een stap zet, gaf anders een halve tegel aan het padzoeken, en dat liep
  // vast.
  function loopNaast(S, wat, actie) {
    const doel = wat.tx != null ? { x: wat.tx, y: wat.ty } : wat;
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

  // Voor js/tutorial.js, dat met dezelfde klik iets anders laat gebeuren: erheen lopen gaat
  // precies zoals hier.
  T.loopNaar = loopNaar;
  T.loopNaast = loopNaast;

  // Wat je opraapt door erop te stappen: de sleutel van het trappenhuis, en de zak zaaigoed die
  // de meester in de tutorial wil hebben. De tekst bij de muis, en wat er gemeld wordt.
  // Ook naar buiten, zodat de keuring (gereedschap/keuring.js) kan zeggen dat een voorwerp
  // dat aan een quest hangt niet op te rapen is — dan ligt het er wel en doet het niets.
  const OPRAPEN = (T.OPRAPEN = {
    sleutel: { tekst: 'De sleutel oppakken', vind: 'Je vindt de ijzeren sleutel.' },
    zak: { tekst: 'De zak zaaigoed oppakken', vind: 'Je tilt de zak zaaigoed op. Zwaarder dan hij eruitziet.' },
    // De leemkuil bij de beek (De koude oven, js/quests.js). De leem ligt er alleen zolang de
    // bakker erom vroeg: in Tiled heeft dat voorwerp quest="bakker:zoeken".
    leem: { tekst: 'Leem uit de kuil scheppen', vind: 'Je schept een handvol natte leem. Koud, en zwaarder dan je dacht.' },
  });

  // Een ton of iets anders dat breekt (T.VOORWERPEN, `breekt`), sla je met je staf in stukken.
  // Dat kost niets, net als slaan in een gevecht: het is het enige wat niets kost, en de meester
  // laat het je in de tutorial zelf doen.
  T.slaKapot = async function (S, v) {
    const eig = T.VOORWERPEN[v.soort];
    if (!eig || !eig.breekt) return;
    await T.anim.uitval(S.held, { x: v.x, y: v.y });
    if (T.VOORWERPEN[v.soort] !== eig) return; // intussen al gebroken
    v.soort = eig.breekt;
    T.ui.bericht(`Je slaat ${eig.naam || 'het'} in duigen. Het kost je niets.`, 'goed');
  };

  // Wat gebeurt er als je hierop klikt? Geeft { tekst, doe, fout } terug, of null.
  // De tekst komt bij de muis te staan; het scherm en de klik stellen dus dezelfde vraag.
  T.handelingVerkennen = function (S, doel) {
    // Met een spreuk in de hand richt elke klik die spreuk (zie toveren.js).
    if (S.spreuk) return T.handelingSpreuk(S, doel);
    if (!doel) return null;
    // Wat de tutorial op dit moment anders laat gaan (js/tutorial.js): de fontein schept water
    // voor de meester in plaats van dat je hem zelf leegdrinkt, en de meester neemt aan wat je
    // hem brengt.
    const anders = T.tutorialHandeling && T.tutorialHandeling(S, doel);
    if (anders) return anders;
    const w = S.wereld;
    if (doel.wezen) {
      const e = doel.wezen;
      if (e.kant === 'monster') return { tekst: `De ${e.naam} aanvallen`, doe: () => T.startGevecht(S, e, true) };
      // Wie een gesprek heeft (js/gesprekken.js), daar praat je mee: Wim, en de meester. Welk
      // gesprek dat is, zegt T.gesprekIdVan — een dorpeling kan er een eigen hebben.
      if (T.gesprekVan && T.gesprekVan(e)) {
        return { tekst: `Praten met ${e.naam}`, doe: () => loopNaast(S, e, () => T.openDialoog(S, e)) };
      }
      return null;
    }
    // Een gebouw in aanbouw zegt bij de muis hoe het ervoor staat (js/bouwen.js): hoe ver, met
    // hoeveel bouwers, hoe lang nog, en waarom het stilligt. Waar je ook op zijn voet wijst.
    const bouw = T.bouwplaatsOp && T.bouwplaatsOp(S, doel.x, doel.y);
    if (bouw) return { tekst: T.bouwStand(S, bouw).tekst };
    if (doel.voorwerp) {
      const v = doel.voorwerp;
      if (v.soort === 'fontein') {
        if (S.fonteinLeeg) return { tekst: 'De fontein staat droog', fout: true, doe: () => T.ui.bericht('De fontein staat droog. Je nam zelf de laatste slok.') };
        return { tekst: `De laatste slok drinken (${T.duurTekst(T.FONTEIN.maanden)} jonger)`, doe: () => loopNaast(S, v, () => T.drinkLaatsteSlok(S)) };
      }
      if (OPRAPEN[v.soort]) return { tekst: OPRAPEN[v.soort].tekst, doe: () => loopNaar(S, v) };
      const eig = T.VOORWERPEN[v.soort];
      if (eig && eig.breekt) {
        return { tekst: `${T.hoofdletter(eig.naam || 'het')} kapotslaan met je staf (kost niets)`, doe: () => loopNaast(S, v, () => T.slaKapot(S, v)) };
      }
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
      return { tekst: o.tekst || `Naar ${naam.toLowerCase()}`, doe: () => loopNaar(S, { x: doel.x, y: doel.y }) };
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
  //
  // `thuisNu` is waar T.laatDwalen hieronder nu voor deze wezen aanhoudt (normaal `e.thuis`, maar
  // voor een boer in het groeiseizoen zijn eigen akker — T.wandelAnker, js/akkers.js); die draagt
  // dan zijn eigen `straal` mee, en anders valt het terug op `e.straal`.
  function magDwalenNaar(w, e, x, y, thuisNu) {
    if (!T.isBegaanbaar(w, x, y, { wezensBlokkeren: true, wie: e })) return false;
    if (bijDeur(w, x, y)) return false;
    if (thuisNu) return T.afstand(thuisNu, { x, y }) <= (thuisNu.straal != null ? thuisNu.straal : (e.straal || 3));
    const k = T.kamerVan(w, e.tx, e.ty);
    return !!k && T.kamerVan(w, x, y) === k;
  }

  // Wie dwaalt, zet af en toe een stap binnen zijn eigen stukje wereld en staat er daarna weer
  // even bij stil — dan doet hij wat bij hem past (Wim veegt). Een dorpeling gebruikt hetzelfde
  // loopwerk als een dwalend monster; het verschil is dat hij nooit een gevecht begint (hij is
  // `neutraal`, en T.zoekOntdekking en T.deelnemers kijken alleen naar monsters).
  //
  // Wie op een dwaallicht afgaat, dwaalt zolang niet: dat monster heeft iets beters te doen
  // (toveren.js). Wie een gesprek voert, staat stil tot het uit is. En wie aan het maaien is
  // (T.werkOogstBij, js/akkers.js — roep die vóór T.laatDwalen aan) staat ook stil: hij heeft
  // net zijn doel bereikt en zwaait daar de zeis, dat is geen moment om weg te dwalen.
  T.laatDwalen = function (S, dt) {
    const w = S.wereld;
    // Eén keer per beurt de datum omrekenen, niet per wezen: T.wandelAnker heeft alleen het
    // stadium nodig (kiemend/groen/rijp), niet de datum zelf.
    const datum = T.datumVanDag && S.kalender ? T.datumVanDag(S.kalender.dag) : null;
    const basis = datum && T.akkerStadium ? T.akkerStadium(datum.maand, datum.dagVanMaand) : null;
    for (const m of w.wezens) {
      if (m.dood || !m.dwaalt || m.pad.length || m.gelokt || m === S.spreektMet || m.maait) continue;
      m.dwaalTijd -= dt;
      // Staat hij toevallig stil op een tegel waar hij een doorgang blokkeert, dan wacht hij daar
      // niet zijn hele pauze uit maar stapt meteen door.
      if (m.dwaalTijd > 0 && !bijDeur(w, m.tx, m.ty)) continue;
      m.dwaalTijd = 1.5 + Math.random() * 2.5;
      const thuisNu = (T.wandelAnker && T.wandelAnker(m, basis)) || m.thuis;
      // Ligt hij nu buiten die straal — een boer wiens huis niet naast zijn akker staat, bij het
      // begin van het groeiseizoen — dan is geen van de vier buurtegels ooit dichtbij genoeg, en
      // zou hij voor eeuwig blijven staan. Dan eerst een heus pad ernaartoe (T.zoekPad, net als
      // T.werkOogstBij dat doet); eenmaal aangekomen pakt de gewone dwaalstap het weer over.
      const straalNu = thuisNu && (thuisNu.straal != null ? thuisNu.straal : (m.straal || 3));
      if (thuisNu && T.afstand(thuisNu, { x: m.tx, y: m.ty }) > straalNu) {
        const doel = { x: Math.round(thuisNu.x), y: Math.round(thuisNu.y) };
        const pad = T.zoekPad(
          { x: m.tx, y: m.ty },
          doel,
          (x, y) => T.isBegaanbaar(w, x, y, { wezensBlokkeren: true, wie: m }),
          (x, y) => T.isVast(w, x, y),
          {},
        );
        if (pad && pad.length) {
          m.pad = pad;
          continue;
        }
      }
      const opties = [];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (magDwalenNaar(w, m, m.tx + dx, m.ty + dy, thuisNu)) opties.push({ x: m.tx + dx, y: m.ty + dy });
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
      if (v && OPRAPEN[v.soort]) {
        w.voorwerpen.splice(w.voorwerpen.indexOf(v), 1);
        S.inventaris.add(v.soort);
        T.ui.toonInventaris(S);
        T.ui.bericht(OPRAPEN[v.soort].vind, 'goed');
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
