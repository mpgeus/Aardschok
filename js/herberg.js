// De herberg: waar het dorp 's avonds heen gaat (werklijst punt 2; ontwerp/spel.md, "Zaken waar de
// mensen zelf heen gaan"). Het voorstel van Claude, en Marcel zei op 27 sep "Werklijst doorzetten"
// (vraag 35 tot en met 37). Regels zonder scherm, zoals js/dag.js; toetsen in test/herberg.test.cjs.
//
// Wat hier staat:
//   - welke herberg het dorp heeft (T.herbergVan). In het gehucht staat er een vanaf het begin, in de
//     hoek tussen het plein en de weg, en daar woont de herbergierster (kaarten/gehucht.betekenis.json);
//   - wie er vanavond heen gaat (T.herbergGasten): een volwassene, naar zijn karakter (de drinker elke
//     avond, de vrome nooit), vaker in de winter als de avond lang is, en minder vaak naarmate hij
//     verder weg woont. Nooit meer dan er bier is. Het lot ligt vast per mens per dag, zodat het klopt
//     als je slaapt, door de kalender springt of op 30× speelt;
//   - waar ze 's avonds heen lopen (T.herbergAnker, voor T.dagAnker in js/dag.js): de herberg in, en bij
//     bedtijd in het donker naar huis. De herbergierster staat 's avonds achter de tap;
//   - de avond verrekend (T.tikHerbergDag, elke nacht vanuit T.tikGebouwenDag in js/gebouwen.js): elk
//     bezoek drinkt bier, en wie er was, onthoudt de dag;
//   - wat er gezegd werd (stuk 2, Marcel koos B op 27 sep, vraag 38): de roddelaar vertelt er wat er in
//     zijn kelder ligt, en de herbergierster weet de volgende dag wie er zat en wie te veel zei (haar
//     gesprek in js/gesprekken.js, met de woorden {gisteravond} en {roddelaar});
//   - wie er logeert (T.logiesAnker): de marskramer zit er 's avonds en slaapt er;
//   - wat het doet (T.herbergGezelligheid, voor js/behoeften.js): wie deze week in de herberg was, is
//     tevredener;
//   - wat er te zien is (T.herbergTekst, bij de muis op de herberg).
// Het brouwen zelf is gewoon werk van een gebouw (T.GEBOUWEN.herberg.maakt, js/gebouwen.js): de
// herbergierster brouwt graan tot bier, zolang er niet genoeg ligt.
(function (T) {
  'use strict';

  // Alle getallen in één blok, zoals elders (CLAUDE.md); ze staan ook in de werkbank (js/opties.js).
  // Een eerste voorstel van Claude (27 sep).
  T.HERBERG_INSTELLINGEN = {
    // De kans dat een volwassene vanavond gaat: gewoon, en in de winter, als de avond lang is. Een
    // karakter kan het anders willen: de drinker gaat elke avond, de vrome nooit.
    kansPerAvond: 0.3,
    kansWinter: 0.45,
    karakters: { drinker: 1, vrome: 0 },
    // Wie ver woont, gaat minder vaak: de kans zakt met de weg erheen, tot niets bij zoveel uur lopen.
    // En hij gaat niet als hij er dan niet minstens zo lang kan zitten voor het bedtijd is.
    verstWeg: 3,
    minstensUren: 0.5,
    // Wat een bezoek drinkt, aan bier. De herbergierster brouwt het zelf (T.GEBOUWEN.herberg.maakt).
    bierPerBezoek: 1,
    // Wie er de laatste zoveel dagen was, is tevredener: zoveel erbij als alle volwassenen er waren
    // (js/behoeften.js, T.berekenTevredenheid).
    gezelligheidDagen: 7,
    gezelligheid: 0.06,
  };
  const IN = () => T.HERBERG_INSTELLINGEN;

  // De herberg van het dorp: de eerste die klaar is, of null.
  T.herbergVan = function (S) {
    return (S.gebouwen || []).find((g) => g.soort === 'herberg' && g.klaar) || null;
  };

  // Het karakter van een bewoner: alleen een boer heeft er een (js/boeren.js zet het geloote op zijn
  // poppetje).
  function karakterVan(p) {
    if (!p.wie) return null;
    return (p.wezen && p.wezen.karakter) || (T.MENSEN && T.MENSEN[p.wie] && T.MENSEN[p.wie].karakter) || null;
  }

  // Kan hij vanavond gaan? Een volwassene, niet de schout (die loop jij), niet wie net komt of
  // wegtrekt, en niet wie in de herberg woont: die is er al.
  function kanGaan(p, herberg) {
    const e = p.wezen;
    return p.leeftijd === 'volwassen' && !p.schout && !p.komt && p.huis !== herberg && !!e && !e.dood && !e.vertrekt;
  }

  // Een vast lot per mens per dag, tussen 0 en 1: uit het zaad van het spel (js/bewoners.js), met de
  // dobbelsteen van js/boeren.js.
  function lot(B, p, dag) {
    const zaad = ((B.zaad >>> 0) + Math.imul(p.id, 7919) + Math.imul(dag + 1, 104729)) >>> 0;
    return T.dobbelsteen ? T.dobbelsteen(zaad)() : ((zaad * 2654435761) >>> 0) / 4294967296;
  }

  // Hoeveel uur de avond van deze dag duurt: van het eind van het werk (in de oogst tot het donker)
  // tot bedtijd (js/dag.js).
  function avondUren(dag) {
    if (!T.dagindeling) return 3;
    const d = T.dagindeling(dag);
    const begin = T.isOogstDag && T.isOogstDag(dag) ? d.werkEindOogst : d.werkEind;
    return Math.max(0, d.slapen - begin);
  }

  // Hoe groot de kans is dat p vanavond gaat, en hoe lang hij onderweg is: { kans, heen }.
  function kansVan(S, p, deur, dag) {
    const B = S.bewoners;
    const w = B.wereld;
    const k = karakterVan(p);
    const winter = T.datumVanDag ? T.datumVanDag(dag).seizoen === 'winter' : false;
    const basis = k && IN().karakters[k] != null ? IN().karakters[k] : winter ? IN().kansWinter : IN().kansPerAvond;
    if (!(basis > 0) || !p.huis) return { kans: 0, heen: 0 };
    const heen = T.looptijdVan ? T.looptijdVan(w, p, T.deurVan(w, p.huis), { x: deur.x, y: deur.y, straal: 0 }, 'herberg') : 0;
    if (heen + IN().minstensUren > avondUren(dag)) return { kans: 0, heen };
    // Wie er altijd heen gaat (de drinker), laat zich door een lange weg niet tegenhouden.
    const kans = basis >= 1 ? 1 : basis * Math.max(0, 1 - heen / IN().verstWeg);
    return { kans, heen };
  }

  // Wie er op de avond van dag `dag` naar de herberg gaat: een lijst bewoners, wie het dichtst bij woont
  // eerst, en niet meer dan er bier is. Hetzelfde antwoord voor het scherm (wie er loopt) en voor de
  // regels (T.tikHerbergDag), en bewaard zolang de dag, het bier en het dorp hetzelfde zijn.
  T.herbergGasten = function (S, dag) {
    const B = S.bewoners;
    const g = T.herbergVan(S);
    if (!B || !B.wereld || !g) return [];
    const d = Math.floor(dag);
    const bier = (S.voorraad && S.voorraad.bier) || 0;
    const plaats = Math.floor(bier / IN().bierPerBezoek + 1e-9);
    const sleutel = `${d}:${plaats}:${B.mensen.length}`;
    const H = S.herberg || (S.herberg = {});
    if (H.gasten && H.gasten.sleutel === sleutel) return H.gasten.lijst;
    const deur = T.deurVan(B.wereld, g);
    const wie = [];
    for (const p of B.mensen) {
      if (!kanGaan(p, g)) continue;
      const { kans, heen } = kansVan(S, p, deur, d);
      if (kans > 0 && lot(B, p, d) < kans) wie.push({ p, heen });
    }
    wie.sort((a, b) => a.heen - b.heen);
    const lijst = wie.slice(0, plaats).map((x) => x.p);
    H.gasten = { sleutel, lijst };
    return lijst;
  };

  // Waar iemand 's avonds heen gaat, als het de herberg is (T.dagAnker, js/dag.js): de deur van de
  // herberg, en naar binnen. Wie er woont, staat er 's avonds achter de tap. Anders null: dan gaat hij
  // naar zijn erf, zoals altijd. Bij bedtijd zegt T.dagAnker "naar huis", en dan komt hij naar buiten en
  // loopt hij in het donker naar zijn eigen deur (T.laatDwalen, js/verkennen.js).
  T.herbergAnker = function (S, e) {
    const g = T.herbergVan(S);
    if (!g || !S.bewoners || !S.kalender) return null;
    const p = T.bewonerVan(S, e);
    if (!p) return null;
    const deur = T.deurVan(S.bewoners.wereld, g);
    const binnen = { x: deur.x, y: deur.y, straal: 0, binnen: true };
    if (p.huis === g) return binnen;
    return T.herbergGasten(S, S.kalender.dag).includes(p) ? binnen : null;
  };

  // Is hij vanavond in de herberg, of op weg erheen? Voor de muis (js/bewoners.js).
  T.gaatNaarDeHerberg = function (S, p) {
    const g = T.herbergVan(S);
    if (!g || !S.kalender || !T.dagdeelVan || T.dagdeelVan(S.kalender.dag, T.isOogstDag && T.isOogstDag(S.kalender.dag)) !== 'avond') return false;
    return p.huis !== g && T.herbergGasten(S, S.kalender.dag).includes(p);
  };

  const opsomming = (delen) => (delen.length > 1 ? `${delen.slice(0, -1).join(', ')} en ${delen[delen.length - 1]}` : delen[0] || '');

  // Vertelt p in de herberg wat er in zijn kelder ligt? Wie het karakter heeft dat het in de herberg
  // rondvertelt (de roddelaar: `inDeHerberg` in T.VERSTOP_INSTELLINGEN, js/verstoppen.js), als er in
  // zijn kelder iets verstopt ligt. Dan weet de halve herberg het, en vinden de soldaten het met
  // Sint-Maarten makkelijker. Zijn kelder is zijn huis (de boerderij).
  function vertelt(p) {
    const kelder = p.huis;
    return !!(T.vertelInDeHerberg && T.vertelInDeHerberg(p) && kelder && kelder.verstopt && T.inhoudTekst(kelder.verstopt));
  }

  // Elke nacht de avond verrekenen (T.tikGebouwenDag, js/gebouwen.js, aan het begin van dag `dag`): wie
  // er gisteravond was, dronk zijn bier en onthoudt dat (p.herbergDag, voor T.herbergGezelligheid).
  // En wat er gezegd werd: de roddelaar vertelde wat er in zijn kelder ligt (g.verteld op die kelder,
  // js/verstoppen.js), en wat hij de schout zag doen (T.getuigenVertellen, js/zien.js). De
  // herbergierster weet het de volgende dag (haar gesprek in js/gesprekken.js): de vlaggen
  // herbergGasten, herbergRoddel, herbergGetuige en herbergDroog, en de namen in S.herberg.gisteravond.
  T.tikHerbergDag = function (S, dag) {
    if (!T.herbergVan(S) || !S.bewoners) return;
    const gisteren = Math.floor(dag) - 1;
    const droog = T.herbergDroog(S);
    const gasten = T.herbergGasten(S, gisteren);
    const roddel = gasten.find(vertelt) || null;
    const gezien = T.getuigenVertellen ? T.getuigenVertellen(S, gasten, gisteren) : [];
    const H = S.herberg || (S.herberg = {});
    H.gisteravond = { dag: gisteren, gasten: gasten.length, namen: gasten.map(T.naamVanBewoner), roddel: roddel ? T.naamVanBewoner(roddel) : null, gezien };
    if (T.zetVlag) {
      for (const v of ['herbergGasten', 'herbergRoddel', 'herbergGetuige', 'herbergDroog']) T.wisVlag(S, v);
      if (gasten.length) T.zetVlag(S, 'herbergGasten');
      if (roddel) T.zetVlag(S, 'herbergRoddel');
      if (gezien.length) T.zetVlag(S, 'herbergGetuige');
      if (droog) T.zetVlag(S, 'herbergDroog');
    }
    if (roddel) roddel.huis.verteld = gisteren;
    if (!gasten.length) return;
    T.wijzigVoorraad(S, 'bier', -gasten.length * IN().bierPerBezoek);
    for (const p of gasten) p.herbergDag = gisteren;
  };

  // Wat de herbergierster invult in haar gesprek (js/gesprek.js, T.vulWoordenIn): wie er gisteravond
  // aan de tap zat, en wie er te veel zei.
  T.GESPREK_WOORDEN = T.GESPREK_WOORDEN || {};
  T.GESPREK_WOORDEN.gisteravond = (S) => opsomming((S.herberg && S.herberg.gisteravond && S.herberg.gisteravond.namen) || []) || 'niemand';
  T.GESPREK_WOORDEN.roddelaar = (S) => (S.herberg && S.herberg.gisteravond && S.herberg.gisteravond.roddel) || 'iemand';

  // Wie over de weg kwam en een paar dagen blijft, logeert in de herberg (Marcel koos het met B, vraag
  // 38): de marskramer, die tien dagen op het plein staat (js/handel.js), zit er 's avonds en slaapt er,
  // en staat 's ochtends weer bij zijn waar. Voor T.dagAnker in js/dag.js; anders null.
  T.logiesAnker = function (S, e) {
    const m = S.marskramer;
    if (!m || m.wezen !== e || !m.staat || m.weg) return null;
    const g = T.herbergVan(S);
    if (!g || !S.kalender || !T.dagdeelVan) return null;
    const deel = T.dagdeelVan(S.kalender.dag, T.isOogstDag && T.isOogstDag(S.kalender.dag));
    if (deel !== 'avond' && deel !== 'nacht') return null;
    const deur = T.deurVan(S.wereld, g);
    return { x: deur.x, y: deur.y, straal: 0, binnen: true };
  };

  // Hoeveel tevredener het dorp is door de herberg, op dag `dag` (js/behoeften.js): het deel van de
  // volwassenen dat er de laatste gezelligheidDagen was, maal gezelligheid. Puur.
  T.herbergGezelligheid = function (S, dag) {
    const g = T.herbergVan(S);
    const B = S.bewoners;
    if (!g || !B) return 0;
    const wie = B.mensen.filter((p) => kanGaan(p, g));
    if (!wie.length) return 0;
    const sinds = Math.floor(dag) - IN().gezelligheidDagen;
    const waren = wie.filter((p) => p.herbergDag != null && p.herbergDag >= sinds).length;
    return (IN().gezelligheid * waren) / wie.length;
  };

  // Is de herberg droog? Dan mist het dorp bier (js/behoeften.js).
  T.herbergDroog = function (S) {
    return !!T.herbergVan(S) && ((S.voorraad && S.voorraad.bier) || 0) < IN().bierPerBezoek;
  };

  // Het licht van de herberg, voor de nacht (js/tekenen.js): 's avonds brandt de lantaarn bij de deur,
  // en hoe meer gasten er binnen zitten, hoe warmer de gloed. Blijft er na bedtijd nog iemand hangen,
  // dan brandt hij nog. En dan branden ook de ramen, met de gasten erachter als schimmen (Marcel, 27 sep,
  // vraag 39: "Misschien een raam waar je mensen doorheen ziet", en "Ja idd" op de schimmen): `ramenVan`
  // is het gebouw waarvan de ramen branden, `schimmen` hoeveel gasten er binnen zitten. Geeft een lijst
  // { x, y, straal, sterkte, ramenVan, schimmen } (tegels, 0..1), of een lege lijst.
  T.herbergLicht = function (S) {
    const g = T.herbergVan(S);
    if (!g || !S.kalender || !S.bewoners || !T.dagdeelVan) return [];
    const deur = T.deurVan(S.bewoners.wereld, g);
    const avond = T.dagdeelVan(S.kalender.dag, T.isOogstDag && T.isOogstDag(S.kalender.dag)) === 'avond';
    const zitBinnen = (e) => !!(e && e.binnen && e.deur && e.deur.x === deur.x && e.deur.y === deur.y);
    const binnen = S.bewoners.mensen.filter((p) => p.huis !== g && zitBinnen(p.wezen)).length
      + (S.marskramer && zitBinnen(S.marskramer.wezen) ? 1 : 0);
    if (!avond && !binnen) return [];
    return [{ x: deur.x, y: deur.y, straal: 3.5 + Math.min(3, binnen * 0.5), sterkte: Math.min(0.65, 0.3 + 0.08 * binnen), ramenVan: g, schimmen: binnen }];
  };

  // Wat er bij de muis op de herberg staat, na wat het gebouw doet (T.gebouwToestand, js/gebouwen.js):
  // hoeveel gasten er vanavond zijn (of gisteravond waren), en hoeveel bier er ligt.
  T.herbergTekst = function (S, g) {
    const bier = Math.floor((S.voorraad && S.voorraad.bier) || 0);
    const gasten = S.kalender ? T.herbergGasten(S, S.kalender.dag) : [];
    const avond = S.kalender && T.dagdeelVan && T.dagdeelVan(S.kalender.dag, T.isOogstDag && T.isOogstDag(S.kalender.dag)) === 'avond';
    const binnen = avond ? gasten.filter((p) => p.wezen && p.wezen.binnen).length : 0;
    const vanavond = avond
      ? binnen ? `${binnen} ${binnen === 1 ? 'gast' : 'gasten'} binnen` : 'nog niemand binnen'
      : `vanavond ${gasten.length ? `${gasten.length} ${gasten.length === 1 ? 'gast' : 'gasten'}` : 'geen gasten'}`;
    const m = S.marskramer;
    const logeert = m && m.staat && !m.weg ? '; de marskramer logeert hier' : '';
    return `${vanavond}; ${bier ? `${bier} bier` : 'geen bier meer'}${logeert}.`;
  };
  T.GEBOUW_ERBIJ = T.GEBOUW_ERBIJ || {};
  T.GEBOUW_ERBIJ.herberg = T.herbergTekst;
})(globalThis.Spel = globalThis.Spel || {});
