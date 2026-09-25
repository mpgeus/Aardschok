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

  // Wat je opraapt door erop te stappen: de sleutel van het trappenhuis, en de leem voor de
  // bakker. De tekst bij de muis, en wat er gemeld wordt.
  // Ook naar buiten, zodat de keuring (gereedschap/keuring.js) kan zeggen dat een voorwerp
  // dat aan een quest hangt niet op te rapen is — dan ligt het er wel en doet het niets.
  const OPRAPEN = (T.OPRAPEN = {
    sleutel: { tekst: 'De sleutel oppakken', vind: 'Je vindt de ijzeren sleutel.' },
    // De leemkuil bij de beek (De koude oven, js/quests.js). De leem ligt er alleen zolang de
    // bakker erom vroeg: in Tiled heeft dat voorwerp quest="bakker:zoeken".
    leem: { tekst: 'Leem uit de kuil scheppen', vind: 'Je schept een handvol natte leem. Koud, en zwaarder dan je dacht.' },
  });

  // ── Wat een veld is (js/akkers.js, "Velden"; spel.md, "Weides met koeien en schapen") ──
  //
  // De muis op een veld zegt in één regel wat het is, en het veldenvenster (js/hud.js, V) zegt
  // hetzelfde uitgebreider: daarom staan de stukjes tekst hier, zonder scherm, en te toetsen
  // (test/velden.test.cjs).

  // Wanneer een plan ingaat: de dag waarop de boeren ploegen (T.AKKER_STADIA, "geploegd"), want
  // daar valt T.wisselVelden op. "1 lentemaand", zolang niemand die tabel verschuift.
  T.veldWisselTekst = function () {
    const g = T.AKKER_STADIA && T.AKKER_STADIA.find((s) => s.stadium === 'geploegd');
    return g ? `${g.dag} ${T.MAANDEN[g.maand].naam}` : '1 lentemaand';
  };

  // "3 koeien, 9 schapen", "1 koe", of '' zonder dieren: een lijst dieren (js/vee.js) geteld per
  // soort, in de volgorde van T.VEE.
  T.kuddeTekst = function (dieren) {
    const delen = [];
    for (const [soort, v] of Object.entries(T.VEE || {})) {
      const n = dieren.filter((e) => e.dier === soort).length;
      if (n) delen.push(`${n} ${n === 1 ? v.naam : v.meervoud}`);
    }
    return delen.join(', ');
  };

  // De regel bij de muis op de heide (js/vee.js, de meent): "De heide, de meent van het dorp · 8
  // schapen · de kooi bergt er 20". Het veldenvenster (js/hud.js) zegt het ook.
  T.meentTekst = function (S, meent) {
    const schapen = T.dierenOp(S, meent);
    const plaats = T.kooiPlaats ? T.kooiPlaats(S) : 0;
    const kooien = plaats && T.VEE_INSTELLINGEN ? Math.round(plaats / T.VEE_INSTELLINGEN.kooiPlaats) : 0;
    return [
      `De ${meent.naam}, de meent van het dorp`,
      schapen.length ? T.kuddeTekst(schapen) : 'geen schapen',
      !kooien ? 'geen schaapskooi' : kooien === 1 ? `de kooi bergt er ${plaats}` : `de ${kooien} kooien bergen er ${plaats}`,
    ].join(' · ');
  };

  // "Klaas", "Klaas en Gerrit", "Klaas, Jan en Gerrit".
  T.opsomming = (namen) => (namen.length < 2 ? namen.join('') : `${namen.slice(0, -1).join(', ')} en ${namen[namen.length - 1]}`);

  // Is deze weide samen met velden ernaast één weide (js/vee.js, T.weideGroepen)? Dan
  // "samen één weide met het veld van Gerrit"; anders ''.
  T.samenMetTekst = function (S, veld) {
    const groep = T.weideVan ? T.weideVan(S.wereld, veld) : null;
    if (!groep || groep.velden.length < 2) return '';
    const anderen = groep.velden.filter((v) => v !== veld);
    const namen = [...new Set(anderen.map((v) => T.boerVanVeld(S, v)).filter(Boolean).map((b) => b.naam))];
    const welke = anderen.length === 1 ? 'het veld' : `${anderen.length} velden`;
    return `samen één weide met ${welke}${namen.length ? ` van ${T.opsomming(namen)}` : ''}`;
  };

  // De regel bij de muis: "Weide van Klaas · 3 koeien, 9 schapen · vruchtbaar 90%". Staat er meer
  // vee op dan er plaats is, dan zegt hij dat; is de weide samen met een veld ernaast één weide, dan
  // ook dat; en wordt het veld volgend jaar iets anders, of krijgt het mest, dan ook wat en wanneer.
  T.veldTekst = function (S, veld) {
    const bestemming = T.bestemmingVan(veld);
    const boer = T.boerVanVeld(S, veld);
    const delen = [T.hoofdletter(bestemming) + (boer ? ` van ${boer.naam}` : '')];
    const samen = bestemming === 'weide' ? T.samenMetTekst(S, veld) : '';
    if (samen) delen.push(samen);
    const dieren = T.dierenOp ? T.dierenOp(S, veld) : [];
    if (dieren.length) delen.push(T.kuddeTekst(dieren) + (T.weideStand(S, veld).vrij < 0 ? ' (te vol)' : ''));
    else if (bestemming === 'weide') delen.push('nog geen vee');
    delen.push(`vruchtbaar ${Math.round(T.vruchtbaarheidVan(veld) * 100)}%`);
    const plan = T.planVan(veld);
    if (plan !== bestemming) delen.push(`wordt ${plan}${veld.mest ? ', met mest,' : ''} op ${T.veldWisselTekst()}`);
    else if (veld.mest) delen.push(`krijgt mest op ${T.veldWisselTekst()}`);
    return delen.join(' · ');
  };

  // Wat gebeurt er als je hierop klikt? Geeft { tekst, doe, fout } terug, of null.
  // De tekst komt bij de muis te staan; het scherm en de klik stellen dus dezelfde vraag.
  T.handelingVerkennen = function (S, doel) {
    // Met een spreuk in de hand richt elke klik die spreuk (zie toveren.js).
    if (S.spreuk) return T.handelingSpreuk(S, doel);
    if (!doel) return null;
    const w = S.wereld;
    if (doel.wezen) {
      const e = doel.wezen;
      if (e.kant === 'monster') return { tekst: `De ${e.naam} aanvallen`, doe: () => T.startGevecht(S, e, true) };
      // Een dier (js/vee.js) praat niet en doet nog niets: bij de muis staat alleen wat het is.
      if (e.dier) return { tekst: T.hoofdletter(`een ${e.naam}`) };
      // Wie een gesprek heeft (js/gesprekken.js), daar praat je mee: Wim, en de meester. Welk
      // gesprek dat is, zegt T.gesprekIdVan — een dorpeling kan er een eigen hebben.
      if (T.gesprekVan && T.gesprekVan(e)) {
        // Bij een boer ook wie hij is en wat hij kan (js/boeren.js; Marcel wilde het meteen zien).
        const over = T.overBoerTekst ? T.overBoerTekst(e, true) : '';
        return { tekst: `Praten met ${e.naam}${over ? ` (${over})` : ''}`, doe: () => loopNaast(S, e, () => T.openDialoog(S, e)) };
      }
      return null;
    }
    if (doel.voorwerp) {
      const v = doel.voorwerp;
      if (v.soort === 'fontein') {
        if (S.fonteinLeeg) return { tekst: 'De fontein staat droog', fout: true, doe: () => T.ui.bericht('De fontein staat droog. Je nam zelf de laatste slok.') };
        return { tekst: `De laatste slok drinken (${T.duurTekst(T.FONTEIN.maanden)} jonger)`, doe: () => loopNaast(S, v, () => T.drinkLaatsteSlok(S)) };
      }
      if (OPRAPEN[v.soort]) return { tekst: OPRAPEN[v.soort].tekst, doe: () => loopNaar(S, v) };
      if (v.soort === 'trap') return { tekst: 'De trap op', doe: () => loopNaast(S, v, () => T.gewonnen(S)) };
      if (v.soort === 'kist') {
        return { tekst: 'De kist bekijken', doe: () => loopNaast(S, v, () => T.ui.bericht('Een kist vol versleten bezems. Wim gooit niets weg.')) };
      }
    }
    // Een gebouw dat de speler neerzette (js/gebouwen.js): de muis op zijn voet zegt hoe het ermee
    // staat — in aanbouw, aan het werk, of stil en waarom (spel.md, "Handel": een smidse zonder
    // ijzer staat stil, en zegt dat).
    const gebouw = T.gebouwOp && T.gebouwOp(S, doel.x, doel.y);
    if (gebouw) {
      // Een huis, een boerderij of de kapel: daar verstop je graan en goud (js/verstoppen.js). Je
      // loopt erheen, en dan gaat het venster open (js/hud.js). Kan het nu niet (de vrome weigert,
      // de inner is in het dorp), dan zegt de klik waarom.
      const plek = T.verstopPlekVan && T.verstopPlekVan(S, gebouw);
      if (plek && T.ui.openVerstoppen) {
        const h = T.verstopHandeling(S, plek);
        const rand = h.kan && T.randVanGebouw(S, gebouw);
        if (rand) return { tekst: h.tekst, doe: () => loopNaast(S, rand, () => T.ui.openVerstoppen(S, gebouw)) };
        return { tekst: h.tekst, doe: () => T.ui.bericht(h.reden || 'Daar kun je niet bij.') };
      }
      const tekst = T.gebouwToestand(S, gebouw);
      return { tekst, doe: () => T.ui.bericht(tekst) };
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
    // Een veld (alleen het nieuwe spel): de muis zegt wat het is, en een klik is gewoon erheen
    // lopen, want de velden zijn groot en je moet eroverheen kunnen. Wat het volgend jaar wordt,
    // kies je in het veldenvenster (js/hud.js, V).
    const veld = T.veldOp && T.veldOp(w, doel.x, doel.y);
    if (veld) return { tekst: T.veldTekst(S, veld), doe: () => loopNaar(S, { x: doel.x, y: doel.y }) };
    // De heide, de meent (js/vee.js): wie er graast, en hoeveel de kooi bergt.
    const meent = T.meentOp && T.meentOp(w, doel.x, doel.y);
    if (meent) return { tekst: T.meentTekst(S, meent), doe: () => loopNaar(S, { x: doel.x, y: doel.y }) };
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

  // ── Vee op de weide (js/vee.js; spel.md, "Weides met koeien en schapen") ──
  //
  // Een dier blijft binnen zijn graasland (T.graaslandVan, js/vee.js): de velden van zijn weide, met
  // de strookjes ertussen als twee velden naast elkaar samen één weide zijn, of de meent. Niet rond
  // een middelpunt met een straal (e.thuis, e.straal): een strook van twee bij veertien heeft dan
  // maar vier tegels binnen de straal, en een blok van vijf bij zes laat zijn hoeken leeg. Het stapt
  // ook niet naar een tegel waar al iemand staat, of waar een ander net heen loopt: twee koeien op
  // één tegel zie je meteen. Staat het buiten zijn graasland (na een wissel op 1 lentemaand,
  // T.verhuisVee), dan loopt het er eerst heen.
  const doelVan = (e) => (e.pad && e.pad.length ? e.pad[e.pad.length - 1] : null);
  const vrijVoor = (w, e) => (x, y) => T.isBegaanbaar(w, x, y, { wezensBlokkeren: true, wie: e });

  // De buurtegels (vier kanten, zoals elke dwaalstap) waar dit dier heen mag.
  T.dwaalTegelsOpWeide = function (w, e) {
    const land = T.graaslandVan ? T.graaslandVan(w, e) : null;
    if (!land) return [];
    const onderweg = new Set();
    for (const o of w.wezens) {
      const d = o !== e && !o.dood && doelVan(o);
      if (d) onderweg.add(d.x + ',' + d.y);
    }
    const mag = vrijVoor(w, e);
    const opties = [];
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const x = e.tx + dx;
      const y = e.ty + dy;
      if (land.op(x, y) && !onderweg.has(x + ',' + y) && mag(x, y) && !bijDeur(w, x, y)) opties.push({ x, y });
    }
    return opties;
  };

  // De weg naar de dichtstbijzijnde vrije tegel van zijn graasland, of null (geen weide, er al op,
  // of geen weg: dan probeert het de volgende keer opnieuw).
  T.wegNaarWeide = function (w, e) {
    const land = T.graaslandVan ? T.graaslandVan(w, e) : null;
    if (!land || land.op(e.tx, e.ty)) return null;
    const mag = vrijVoor(w, e);
    const van = { x: e.tx, y: e.ty };
    let doel = null;
    let afstand = Infinity;
    for (const v of land.velden) {
      for (let y = v.y; y < v.y + v.h; y++) {
        for (let x = v.x; x < v.x + v.b; x++) {
          const d = T.afstand(van, { x, y });
          if (d < afstand && mag(x, y)) {
            afstand = d;
            doel = { x, y };
          }
        }
      }
    }
    if (!doel) return null;
    const pad = T.zoekPad(van, doel, mag, (x, y) => T.isVast(w, x, y), {});
    return pad && pad.length ? pad : null;
  };

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
      // Een dier dat ligt, blijft liggen tot zijn rust zegt dat het weer opstaat (js/vee.js).
      if (m.dier && T.rustVanDier && T.rustVanDier(m, S.tijd || 0) === 'liggen') continue;
      m.dwaalTijd -= dt;
      // Staat hij toevallig stil op een tegel waar hij een doorgang blokkeert, dan wacht hij daar
      // niet zijn hele pauze uit maar stapt meteen door.
      if (m.dwaalTijd > 0 && !bijDeur(w, m.tx, m.ty)) continue;
      // Wie een eigen pauze heeft (vee: dat staat lang te grazen voor het een stap zet), neemt die.
      m.dwaalTijd = m.pauze ? m.pauze[0] + Math.random() * (m.pauze[1] - m.pauze[0]) : 1.5 + Math.random() * 2.5;
      // Vee op een weide: binnen die rechthoek, of eerst ernaartoe (T.dwaalTegelsOpWeide hierboven).
      if (m.weide) {
        const weg = T.wegNaarWeide(w, m);
        const opties = weg ? null : T.dwaalTegelsOpWeide(w, m);
        if (weg) {
          m.pad = weg;
          // Onderweg naar zijn weide staat het niet te grazen: loopt het vast op een ander dier,
          // dan zoekt het na een tel een nieuwe weg, niet pas na een hele graaspauze.
          m.dwaalTijd = Math.min(m.dwaalTijd, 1);
        } else if (opties.length) m.pad = [opties[Math.floor(Math.random() * opties.length)]];
        continue;
      }
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
      () => T.nieuwSpel(),
    );
  };
})(globalThis.Toren = globalThis.Toren || {});
