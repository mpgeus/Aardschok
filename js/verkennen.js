// Rondlopen: wat een klik kiest (T.handelingVerkennen), deuren, en het dwalen van wie geen doel heeft. Het
// gevecht loopt in real time in de tik (js/gevecht.js; werklijst vraag 170, stap 2).
(function (T) {
  'use strict';

  // ── Wat een veld is (js/akkers.js, "Velden"; spel.md, "Weides met koeien en schapen") ──
  //
  // De muis op een veld zegt in één regel wat het is, en het veldenvenster (js/hud.js, V) zegt
  // hetzelfde uitgebreider: daarom staan de stukjes tekst hier, zonder scherm, en te toetsen
  // (test/velden.test.cjs).

  // Wanneer een plan ingaat: de dag waarop de boeren ploegen (T.AKKER_STADIA, "geploegd"), want
  // daar valt T.wisselVelden op. "1 March", zolang niemand die tabel verschuift.
  T.veldWisselTekst = function () {
    const g = T.AKKER_STADIA && T.AKKER_STADIA.find((s) => s.stadium === 'geploegd');
    return g ? `${g.dag} ${T.MAANDEN[g.maand].toon}` : T.t('1 March');
  };

  // "3 cows, 9 sheep", "1 cow", of '' zonder dieren: een lijst dieren (js/vee.js) geteld per
  // soort, in de volgorde van T.VEE.
  T.kuddeTekst = function (dieren) {
    const delen = [];
    for (const [soort, v] of Object.entries(T.VEE || {})) {
      const n = dieren.filter((e) => e.dier === soort).length;
      if (n) delen.push(`${n} ${n === 1 ? v.naam : v.meervoud}`);
    }
    return delen.join(', ');
  };

  // De regel bij de muis op de heide (js/vee.js, de meent): "The heath, the village common · 8 sheep · the fold
  // holds 20". Het veldenvenster (js/hud.js) zegt het ook.
  T.meentTekst = function (D, meent) {
    const schapen = T.dierenOp(D, meent);
    const plaats = T.kooiPlaats ? T.kooiPlaats(D) : 0;
    const kooien = plaats && T.VEE_INSTELLINGEN ? Math.round(plaats / T.VEE_INSTELLINGEN.kooiPlaats) : 0;
    return [
      T.t('The {meent}, the village common', { meent: meent.naam === 'heide' ? T.t('heath') : meent.naam }),
      schapen.length ? T.kuddeTekst(schapen) : T.t('no sheep'),
      !kooien ? T.t('no sheepfold') : T.t('{n|the fold holds {plaats}|the # folds hold {plaats}}', { n: kooien, plaats }),
    ].join(' · ');
  };

  // "Nicholas", "Nicholas and Gerard", "Nicholas, John and Gerard".
  T.opsomming = (namen) => (namen.length < 2 ? namen.join('')
    : T.t('{lijst} and {laatste}', { lijst: namen.slice(0, -1).join(', '), laatste: namen[namen.length - 1] }));

  // Is deze weide samen met velden ernaast één weide (js/vee.js, T.weideGroepen)? Dan
  // "one meadow with the field of Gerard"; anders ''.
  T.samenMetTekst = function (D, veld) {
    const groep = T.weideVan ? T.weideVan(D.wereld, veld) : null;
    if (!groep || groep.velden.length < 2) return '';
    const anderen = groep.velden.filter((v) => v !== veld);
    const namen = [...new Set(anderen.map((v) => T.boerVanVeld(D, v)).filter(Boolean).map((b) => b.naam))];
    const n = anderen.length;
    return namen.length
      ? T.t('{n|one meadow with the field of {namen}|one meadow with # fields of {namen}}', { n, namen: T.opsomming(namen) })
      : T.t('{n|one meadow with the field next to it|one meadow with the # fields next to it}', { n });
  };

  // De regel bij de muis: "Nicholas's meadow · 3 cows, 9 sheep · fertility 90%". Staat er meer
  // vee op dan er plaats is, dan zegt hij dat; is de weide samen met een veld ernaast één weide, dan
  // ook dat; en wordt het veld volgend jaar iets anders, of krijgt het mest, dan ook wat en wanneer.
  T.veldTekst = function (D, veld) {
    const bestemming = T.bestemmingVan(veld);
    const boer = T.boerVanVeld(D, veld);
    const naam = bestemming === 'akker' ? T.t('field') : T.BESTEMMING_NAAM[bestemming];
    const delen = [boer ? T.t("{boer}'s {veld}", { boer: boer.naam, veld: naam }) : T.hoofdletter(naam)];
    const samen = bestemming === 'weide' ? T.samenMetTekst(D, veld) : '';
    if (samen) delen.push(samen);
    const dieren = T.dierenOp ? T.dierenOp(D, veld) : [];
    const kudde = dieren.length && T.kuddeTekst(dieren);
    if (dieren.length) delen.push(T.weideStand(D, veld).vrij < 0 ? T.t('{kudde} (too full)', { kudde }) : kudde);
    else if (bestemming === 'weide') delen.push(T.t('no livestock yet'));
    delen.push(T.t('fertility {n}%', { n: Math.round(T.vruchtbaarheidVan(veld) * 100) }));
    const plan = T.planVan(veld);
    const datum = T.veldWisselTekst();
    if (plan !== bestemming) {
      delen.push(veld.mest
        ? T.t('becomes {plan}, with dung, on {datum}', { plan: T.BESTEMMING_NAAM[plan], datum })
        : T.t('becomes {plan} on {datum}', { plan: T.BESTEMMING_NAAM[plan], datum }));
    } else if (veld.mest) delen.push(T.t('gets dung on {datum}', { datum }));
    return delen.join(' · ');
  };

  // Wat gebeurt er als je hierop klikt? Geeft { tekst, doe, fout } terug, of null.
  // De tekst komt bij de muis te staan; het scherm en de klik stellen dus dezelfde vraag.
  // Wat links doet bij het rondlopen (werklijst vraag 170, stap 1; Marcel, 15 okt: "Je speelt dus niet meer de schout
  // zelf"): kiezen. De muis zegt wat iets is, en een klik kiest het (`kies`, js/main.js): een van je mannen of een
  // dorpeling, met zijn briefje (js/kiezen.js), of een gebouw (`doe`, js/gebouwbriefje.js). Wie een gesprek heeft en
  // geen dorpeling is, opent wat hij komt doen: de marskramer zijn handel, de heer zijn venster. Rechts stuurt je
  // mannen (T.handelingSturen, js/kiezen.js). Tot 15 okt liep de schout erheen: praten, oprapen, een deur van het slot,
  // een vijand aanvallen.
  T.handelingVerkennen = function (S, doel) {
    if (!doel) return null;
    const w = S.wereld;
    const D = T.dorpHier(S); // het dorp dat hier ligt (js/dorp.js), of geen

    if (doel.wezen) {
      const e = doel.wezen;
      // Een vijand, een dier (js/vee.js) of het wild (js/beesten.js): bij de muis staat alleen wat het is.
      if (e.kant === 'monster' || e.dier || e.beest) return { tekst: T.hoofdletter(T.eenNaam(e.naam)) };
      // De kar van het lege begin (js/begin.js) net zo: wat hij doet (js/kar.js).
      if (e.kar) return { tekst: T.karTekst(D, e) };
      // Je mannen: de held, een soldaat, een veteraan (js/kiezen.js).
      if (D && T.isMan(D, e)) return { tekst: T.manTekst(D, e), kies: e };
      // De waard (js/herberg.js): wie hij is.
      const p = e.bewoner && D ? T.bewonerVan(D, e) : null;
      if (p && p.werk && p.werk.soort === 'herberg') return { tekst: T.t('{wie}, the innkeeper', { wie: T.naamVanBewoner(p) }), kies: e };
      // Een andere bewoner (js/bewoners.js): wie hij is.
      if (e.bewoner && D && T.overBewonerTekst) return { tekst: T.overBewonerTekst(D, e), kies: e };
      // Het praten is geparkeerd (vraag 170, stap 5; de gesprekken in js/gesprekken.js blijven staan): een klik op de
      // marskramer opent zijn handel (js/handel.js), een klik op de heer het venster om hem te betalen (js/heer.js).
      if (D && e.soort === 'marskramer' && T.kanHandelen(D)) return { tekst: T.t('Trade with {wie}', { wie: e.naam }), doe: () => T.ui.openHandel(D) };
      if (D && e.soort === 'heer' && (T.heerWacht(D) || (D.heer.bezoek && D.heer.bezoek.schandpaal))) {
        return { tekst: T.t('Pay {wie}', { wie: e.naam }), doe: () => T.ui.openHeer(S) };
      }
      return e.naam ? { tekst: T.hoofdletter(e.naam) } : null;
    }
    // Een gebouw dat de speler neerzette (js/gebouwen.js): de muis op zijn voet zegt hoe het ermee
    // staat — in aanbouw, aan het werk, of stil en waarom (spel.md, "Handel": een smidse zonder
    // ijzer staat stil, en zegt dat). Een klik legt zijn briefje rechts neer (js/gebouwbriefje.js; vraag 156).
    const gebouw = D && T.gebouwOp(D, doel.x, doel.y);
    if (gebouw) return { tekst: T.gebouwToestand(D, gebouw), doe: () => T.kiesGebouw(S, gebouw) };
    const d = T.deurOp(w, doel.x, doel.y);
    if (d && d.staat === 'opslot') return { tekst: T.t('Locked'), fout: true };
    if (!T.isZichtbaar(w, doel.x, doel.y)) return null;
    // Een tegel die naar een ander gebied leidt, zegt dat erbij: wie de held erheen stuurt, gaat erheen.
    const o = T.overgangOp(w, doel.x, doel.y);
    if (o) {
      const naam = (T.GEBIEDEN[o.naar] && T.GEBIEDEN[o.naar].naam) || o.naar;
      return { tekst: o.tekst || T.t('To {plek}', { plek: naam.toLowerCase() }) };
    }
    // Een veld: de muis zegt wat het is. Wat het volgend jaar wordt, kies je in het veldenvenster (js/hud.js, V).
    const veld = T.veldOp(w, doel.x, doel.y);
    if (veld && D) return { tekst: T.veldTekst(D, veld) };
    // De heide, de meent (js/vee.js): wie er graast, en hoeveel de kooi bergt.
    const meent = T.meentOp && T.meentOp(w, doel.x, doel.y);
    if (meent && D) return { tekst: T.meentTekst(D, meent) };
    return null;
  };

  // Waar hoort dit wezen rond te blijven? Wie een plek en een straal heeft (`thuis`), blijft daar
  // in de buurt: de smid bij de smidse, een boer bij zijn akker, de wolf bij zijn stuk bos. Wie die niet
  // heeft, blijft in zijn eigen kamer — binnen is een kamer vanzelf een stuk wereld, buiten is de
  // hele kaart één kamer en zou een wolf tot de andere kant van het erf wandelen.
  //
  // `thuisNu` is waar T.laatDwalen hieronder nu voor deze wezen aanhoudt (normaal `e.thuis`, maar
  // voor een boer in het groeiseizoen zijn eigen akker — T.wandelAnker, js/akkers.js); die draagt
  // dan zijn eigen `straal` mee, en anders valt het terug op `e.straal`.
  function magDwalenNaar(w, e, x, y, thuisNu) {
    if (!T.isBegaanbaar(w, x, y, { wezensBlokkeren: true, wie: e })) return false;
    if (!T.kanStappen(w, e.tx, e.ty, x, y)) return false;
    if (T.bijDeur(w, x, y)) return false;
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
      if (land.op(x, y) && !onderweg.has(x + ',' + y) && mag(x, y) && !T.bijDeur(w, x, y) && T.kanStappen(w, e.tx, e.ty, x, y)) opties.push({ x, y });
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
    const pad = T.zoekRoute(w, van, doel, {});
    return pad && pad.length ? pad : null;
  };

  // Wie dwaalt, zet af en toe een stap binnen zijn eigen stukje wereld en staat er daarna weer
  // even bij stil — dan doet hij wat bij hem past (een boer maait). Een dorpeling gebruikt hetzelfde
  // loopwerk als een dwalend monster; het verschil is dat hij nooit een gevecht begint (hij is
  // `neutraal`, en het gevecht kijkt alleen naar monsters, js/gevecht.js).
  //
  // Wie een gesprek voert, staat stil tot het uit is. En wie aan het maaien is
  // (T.werkOogstBij, js/akkers.js — roep die vóór T.laatDwalen aan) staat ook stil: hij heeft
  // net zijn doel bereikt en zwaait daar de zeis, dat is geen moment om weg te dwalen.
  // Waar je bent (js/main.js), met het dorp dat er ligt (js/dorp.js): zijn bewoners hebben een ritme. Een dorp waar je
  // niet bent, dwaalt ook, op zijn eigen kaart (T.dwaal vanuit T.werkDorpBij).
  T.laatDwalen = (S, dt) => T.dwaal(S, S.wereld, T.dorpHier(S), dt);

  T.dwaal = function (S, w, D, dt) {
    // Eén keer per beurt de datum omrekenen, niet per wezen: T.wandelAnker heeft alleen het
    // stadium nodig (kiemend/groen/rijp), niet de datum zelf.
    const datum = T.datumVanDag && S.kalender ? T.datumVanDag(S.kalender.dag) : null;
    const dag = S.kalender ? S.kalender.dag : null;
    const basis = datum && T.akkerStadium(datum.maand, datum.dagVanMaand);
    // In de oogst (graan of hooi) werkt men tot het donker (js/dag.js).
    const oogst = basis === 'rijp' || !!(datum && T.isHooitijd(datum));
    // Het deel van de dag, voor een praatje (js/praatje.js). Wie een praatje maakt, blijft staan tot het om is, en wie
    // langskomt, schuift aan: dat gebeurt hier, vóór het dwalen, zodat elke kaart die dwaalt het ook doet (het
    // gereedschap laadt de praatjes niet).
    const deel = D && D.kalender ? T.dagdeelVan(D.kalender.dag, oogst) : null;
    if (deel && T.werkPraatjesBij) T.werkPraatjesBij(S, D);
    let zoekNog = T.LOPEN_INSTELLINGEN.zoekPerBeeld;
    for (const m of w.wezens) {
      // Wie op de jacht met de held meeloopt, dwaalt niet (js/beesten.js), en wie vecht ook niet: die loopt en slaat in
      // het gevecht (js/gevecht.js). Wie een praatje maakt evenmin (js/praatje.js), en een boer die op zijn land werkt
      // ook niet (js/veldwerk.js).
      if (m.dood || !m.dwaalt || m.pad.length || m === S.spreektMet || m.maait || m.werkt || m.doelwit || m.volgt || m.praatje) continue;
      // Een dier dat ligt, blijft liggen tot zijn rust zegt dat het weer opstaat (js/vee.js).
      if (m.dier && T.rustVanDier && T.rustVanDier(m, S.tijd || 0) === 'liggen') continue;
      // Het ritme van de dag (js/dag.js): 's ochtends en 's avonds op zijn erf, 's nachts binnen. Wie
      // voor zijn deur staat als het nacht is, gaat naar binnen; 's ochtends komt hij weer naar
      // buiten, zodra er niemand voor de deur staat. Overdag geeft T.dagAnker niets, en geldt het
      // gewone anker hieronder.
      // Staat er iemand anders in zijn deur (de schout voor zijn eigen huis, terwijl zijn gezin naar
      // binnen wil), dan gaat hij naar binnen vanaf de tegel ernaast. Wanneer hij binnen of buiten
      // kwam, en waar zijn deur is, onthoudt hij voor het scherm: js/tekenen.js laat hem de deur in
      // stappen en vervagen, of eruit komen, in plaats van in één klap te verdwijnen (Marcel, 26 sep:
      // "Zodra mensen bij de deur komen 'verdwijnen' ze naar binnen").
      const dagAnker = T.dagAnker(D, m, oogst);
      const deurBezet = !!(dagAnker && dagAnker.binnen && T.wezenOp(w, dagAnker.x, dagAnker.y, m));
      const naastDeur = deurBezet ? 1 : 0;
      if (m.binnen) {
        // Binnen blijft hij, zolang hij binnen hoort achter dezelfde deur. Wie 's avonds in de herberg
        // zat (js/herberg.js), komt bij bedtijd naar buiten en loopt naar zijn eigen deur.
        const zelfdeDeur = !m.deur || (dagAnker && m.deur.x === dagAnker.x && m.deur.y === dagAnker.y);
        if (dagAnker && dagAnker.binnen && zelfdeDeur) continue;
        if (T.wezenOp(w, m.tx, m.ty, m)) continue;
        m.binnen = false;
        m.deurSinds = S.tijd;
      } else if (dagAnker && dagAnker.binnen && !m.onderweg && T.afstand(dagAnker, { x: m.tx, y: m.ty }) <= naastDeur) {
        m.binnen = true;
        m.deurSinds = S.tijd;
        m.deur = { x: dagAnker.x, y: dagAnker.y };
        continue;
      }
      m.dwaalTijd -= dt;
      // Staat hij toevallig stil op een tegel waar hij een doorgang blokkeert, dan wacht hij daar
      // niet zijn hele pauze uit maar stapt meteen door.
      if (m.dwaalTijd > 0 && !T.bijDeur(w, m.tx, m.ty)) continue;
      // Wie een eigen pauze heeft (vee: dat staat lang te grazen voor het een stap zet), neemt die.
      m.dwaalTijd = m.pauze ? m.pauze[0] + T.toeval(D || w) * (m.pauze[1] - m.pauze[0]) : 1.5 + T.toeval(D || w) * 2.5;
      // Vee op een weide: binnen die rechthoek, of eerst ernaartoe (T.dwaalTegelsOpWeide hierboven).
      if (m.weide) {
        const weg = T.wegNaarWeide(w, m);
        const opties = weg ? null : T.dwaalTegelsOpWeide(w, m);
        if (weg) {
          T.geefRoute(m, weg, weg[weg.length - 1]);
          // Onderweg naar zijn weide staat het niet te grazen: loopt het vast op een ander dier,
          // dan zoekt het na een tel een nieuwe weg, niet pas na een hele graaspauze.
          m.dwaalTijd = Math.min(m.dwaalTijd, 1);
        } else if (opties.length) stap(m, opties[Math.floor(T.toeval(D || w) * opties.length)]);
        continue;
      }
      // Kijkt hij om zich heen en staat er een bekende die ook vrij is, dan blijven ze staan voor een praatje (js/praatje.js;
      // het gereedschap laadt het niet).
      if (T.zoekPraatje && T.zoekPraatje(S, w, D, m, deel)) continue;
      // Een kind dat vrij is, speelt soms met een ander kind: ze rennen om elkaar heen (js/kleinleven.js).
      if (T.speel(S, w, D, m, deel)) continue;
      const thuisNu = dagAnker || T.wandelAnker(m, basis) || m.thuis;
      // Ligt hij nu buiten die straal — een boer wiens huis niet naast zijn akker staat, bij het
      // begin van het groeiseizoen — dan is geen van de vier buurtegels ooit dichtbij genoeg, en
      // zou hij voor eeuwig blijven staan. Dan eerst een heuse weg ernaartoe (T.zoekRoute, js/lopen.js); eenmaal
      // aangekomen pakt de gewone dwaalstap het weer over. De weg eindigt binnen de straal (`tot`), niet per se op het
      // midden. Wie hij onderweg treft, lost hij onderweg op (T.ontwijk), en staat er op het eind al iemand, dan is hij
      // er ook (werklijst vraag 119, D).
      const straalNu = thuisNu && (thuisNu.straal != null ? thuisNu.straal : (m.straal || 3));
      if (thuisNu && T.afstand(thuisNu, { x: m.tx, y: m.ty }) > straalNu) {
        // Vond hij net twee keer geen weg, dan wacht hij (T.LOPEN_INSTELLINGEN, js/lopen.js).
        if (dag != null && m.geenWegTot > dag) continue;
        // Zochten er dit beeld al genoeg mensen een weg, dan het volgende beeld (zoekPerBeeld).
        if (zoekNog <= 0) {
          m.dwaalTijd = 0;
          continue;
        }
        zoekNog--;
        const doel = { x: Math.round(thuisNu.x), y: Math.round(thuisNu.y), tot: Math.max(straalNu, naastDeur) };
        // Waar hij hoort (zijn deur, zijn werk, de put, de herberg), daar gaan er meer heen: een veld (js/lopen.js). Niet
        // naar een plek die meeloopt (wie helpt, blijft bij zijn boer, js/veldwerk.js): die zoekt niemand anders.
        const pad = T.zoekRoute(w, { x: m.tx, y: m.ty }, doel, { tot: doel.tot, veld: thuisNu.veld !== false });
        if (pad && pad.length) {
          T.geefRoute(m, pad, doel);
          delete m.geenWeg;
          delete m.geenWegTot;
          continue;
        }
        // Geen weg: na geenWegKeer keer na elkaar wacht hij.
        if (!pad && dag != null) {
          m.geenWeg = (m.geenWeg || 0) + 1;
          if (m.geenWeg >= T.LOPEN_INSTELLINGEN.geenWegKeer) {
            m.geenWegTot = dag + T.LOPEN_INSTELLINGEN.geenWegWacht;
            m.geenWeg = 0;
          }
        }
        continue;
      }
      const opties = [];
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (magDwalenNaar(w, m, m.tx + dx, m.ty + dy, thuisNu)) opties.push({ x: m.tx + dx, y: m.ty + dy });
      }
      if (opties.length) stap(m, opties[Math.floor(T.toeval(D || w) * opties.length)]);
    }
  };

  // Eén stap van het dwalen: zonder doel, dus staat er iemand, dan blijft hij staan (js/lopen.js).
  function stap(m, t) {
    m.pad = [t];
    m.padDoel = null;
  }

  // Mag deze stap nog? Tijdens het rondlopen kan er intussen een monster in de weg staan.
  T.magStappen = function (S, e, t, w = S.wereld) {
    return T.isBegaanbaar(w, t.x, t.y, { deurenOpenen: e === S.schout, wezensBlokkeren: true, wie: e });
  };

  // Een dichte deur gaat open op het moment dat de schout erdoor stapt, niet pas als hij er
  // al half doorheen is.
  T.bijStapBegin = function (S, e, t) {
    if (e !== S.schout) return;
    const d = T.deurOp(S.wereld, t.x, t.y);
    if (d && d.staat === 'dicht') {
      d.staat = 'open';
      T.ontdekBijDeur(S.wereld, d);
    }
  };

  T.bijAankomst = function (S, e, t) {
    const w = S.wereld;
    if (e === S.schout) {
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
      // Stap je op een tegel die naar een ander gebied leidt, dan gaan we daarheen — maar niet
      // hier, midden in de beweging: de spellus loopt nu door de lijst wezens van deze wereld
      // heen, en die lijst verandert bij een overgang. main.js pakt het zo op.
      //
      // Alleen als je er echt op stápt. Wie er net is neergezet (S.netGeland, gezet door
      // T.gaNaarGebied), staat er al, en dan zou de overgang meteen weer afgaan: heen en weer
      // tussen twee gebieden. Die tegel staat pas weer scherp als hij er een keer af is geweest.
      //
      // En alleen als je daar je pas beëindigt. Een overgang kan midden op een pad liggen, en daar
      // loop je aan één stuk door langs; wie verderop wil zijn, wil niet halverwege weg zijn. Wie
      // echt weg wil, klikt op de overgang (en het scherm zegt erbij waarheen).
      const zojuist = S.netGeland && S.netGeland.x === t.x && S.netGeland.y === t.y;
      if (!zojuist) S.netGeland = null;
      const o = !zojuist && !e.pad.length && S.modus === 'verkennen' ? T.overgangOp(w, t.x, t.y) : null;
      if (o) {
        e.pad = [];
        S.naarGebied = o.naar;
      }
    }
  };
})(globalThis.Spel = globalThis.Spel || {});
