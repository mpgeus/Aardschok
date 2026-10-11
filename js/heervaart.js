// De heervaart (werklijst vraag 60, A en B; Marcel, 29 sep: "A ja B ja"): "Dat kost u vanaf nu meer". Zodra het
// gehucht een dorp is (js/treden.js), vraagt de heer elk jaar op 1 hooimaand ook mannen voor zijn oorlog: een man
// per tien zielen, of drie goud per man. Twee keuzes, onder zijn brief (js/brieven.js):
//   - sturen: het spel kiest wie (T.weerbareMannen, js/bewoners.js), en ze lopen de weg af tot 1 herfstmaand. Ze
//     blijven bewoner: ze tellen mee en eten, want het dorp voedt ze, en hun plaats in huis blijft van hen, maar ze
//     werken nergens (T.stuurWeg). Van elke vier komt er gemiddeld één niet terug; wie terugkomt, is veteraan
//     (p.veteraan): hij vecht mee als er rovers komen, ook zonder wachthuis (js/rovers.js), met het leven van
//     T.WEZENS.veteraan.
//   - vrijkopen: het goud, en de gunst van de heer daalt (js/bazen.js): wie kan betalen, is niet arm.
// Wie niet kiest, stuurt ze: na een week haalt de heer ze op. De regels staan hier, zonder scherm en dus getoetst
// (test/heervaart.test.cjs).
(function (T) {
  'use strict';

  T.HEERVAART_INSTELLINGEN = {
    // Een spelregel (js/opties.js, "Heervaart"): uit, en de heer vraagt nooit mannen.
    aan: true,
    // Vanaf welke trede (js/treden.js): pas in een dorp, zodat de proef "van gehucht tot dorp" blijft zoals hij
    // getest is.
    vanaf: 'dorp',
    // Zijn brief komt op deze dag. Wie niet kiest, stuurt ze: na zoveel dagen haalt hij ze op. Ze zijn terug op de
    // dag van `terug`, na de oogst.
    brief: { maand: 'hooimaand', dag: 1 },
    kiesBinnenDagen: 7,
    terug: { maand: 'herfstmaand', dag: 1 },
    // Wat hij vraagt: een man per zoveel zielen (naar boven afgerond), of zoveel goud per man.
    zielenPerMan: 10,
    goudPerMan: 3,
    // De kans dat een man niet terugkomt, en hoeveel gunst van de heer elk goud kost waarmee je ze vrijkoopt (in punten
    // van 0 tot 100; het was 0,5% argwaan per goud, vóór 11 okt).
    kansNietTerug: 0.25,
    gunstPerGoud: 0.5,
    // Waarom hij ten strijde trekt: elk jaar een van deze, na "We go to war". Zinnen, geen getallen, dus de werkbank
    // laat ze met rust.
    oorlogen: [
      T.t('against the lord of Crookwick, who did not greet Us'),
      T.t('against the bishop, over a meadow nobody has ever seen'),
      T.t('against Our nephew, who owes Us a horse'),
      T.t('against the lord of Eastwold, whose dog bit Our dog'),
      T.t('against the count, because the count started it. We think'),
    ],
  };
  const IN = () => T.HEERVAART_INSTELLINGEN;

  const dagNu = (D) => Math.floor(D.kalender ? D.kalender.dag : 0);
  const maandIdx = (naam) => T.MAANDEN.findIndex((m) => m.naam === naam);
  // De dag dat ze terug zijn, zonder jaar: "1 September".
  const terugTekst = () => `${IN().terug.dag} ${T.MAANDEN[maandIdx(IN().terug.maand)].toon}`;
  // Een getal 0..1, vast per spel, per dag en per vraag `n` (zoals in js/rovers.js), zodat een speeltest met
  // hetzelfde zaad hetzelfde jaar speelt.
  const lot = (D, dag, n) => T.dobbelsteen(((D.lot && D.lot.zaad) || 1) * 41 + Math.floor(dag) * 7919 + n)();
  const namen = (wie) => T.opsomming(wie.map(T.naamVanBewoner));
  const isDatum = (d, datum) => d.maand === maandIdx(datum.maand) && d.dagVanMaand === datum.dag;
  // De eerste dag na `dag` die { maand, dag } is.
  function volgende(dag, datum) {
    for (let d = Math.floor(dag) + 1; d <= dag + T.DAGEN_PER_JAAR; d++) if (isDatum(T.datumVanDag(d), datum)) return d;
    return null;
  }

  // S.heervaart: de vraag die op je antwoord wacht (tot je kiest), de mannen die weg zijn (tot ze terugkomen), en
  // hoe het de laatste keer ging.
  T.nieuweHeervaart = () => ({ vraag: null, tocht: null, laatste: null });
  const heervaartVan = (D) => D.heervaart || (D.heervaart = T.nieuweHeervaart());

  // Vraagt de heer dit jaar mannen? Alleen als de spelregel aan staat, en vanaf de trede (een dorp).
  T.heervaartGeldt = (D) => !!IN().aan && T.tredeMinstens(D, IN().vanaf);

  // Hoeveel mannen hij vraagt: een per zoveel zielen, naar boven afgerond.
  T.heervaartMannen = (D) => Math.max(1, Math.ceil((D.bevolking || 0) / IN().zielenPerMan));

  // Zijn brief op 1 hooimaand (T.tikHeervaartDag): wat hij vraagt, en wie het spel dan stuurt. Wie gaat, staat nu al
  // vast, zodat de brief ze bij naam noemt.
  T.vraagHeervaart = function (D, dag) {
    const H = heervaartVan(D);
    const d = T.datumVanDag(dag);
    const mannen = T.heervaartMannen(D);
    const oorlogen = IN().oorlogen;
    H.vraag = {
      dag, jaar: d.jaar, mannen, goud: mannen * IN().goudPerMan,
      wie: T.weerbareMannen(D).slice(0, mannen),
      oorlog: oorlogen[(((D.lot && D.lot.zaad) || 1) + d.jaar) % oorlogen.length],
      uiterlijk: dag + IN().kiesBinnenDagen,
    };
    if (T.ui && T.ui.toonBrief) T.ui.toonBrief(D, 'heervaart');
    else T.zeg(D, T.t('There is a letter from the lord: he asks for men for his war.'));
    return H.vraag;
  };

  // Wie er gaat, in woorden, met het werk dat stil komt te liggen: "Peter, Hugh and John (at the woodcutter)".
  T.heervaartWieTekst = function (D, wie) {
    return T.opsomming(wie.map((p) => (p.werk
      ? T.t('{naam} (at the {gebouw})', { naam: T.naamVanBewoner(p), gebouw: T.GEBOUWEN[p.werk.soort].naam })
      : T.naamVanBewoner(p))));
  };

  // Wat je kunt kiezen, voor de knoppen onder de brief (js/brieven.js): { actie, tekst, kan, waarom, hoofd, doe }.
  // De knop en de klik stellen dezelfde vraag (CLAUDE.md, "Afspraken in de code").
  T.heervaartKeuzes = function (D) {
    const v = D.heervaart && D.heervaart.vraag;
    if (!v) return [];
    const goud = Math.floor((D.voorraad && D.voorraad.goud) || 0);
    const kan = goud >= v.goud;
    return [
      {
        actie: 'vrijkopen', tekst: T.t('Buy them out: {goud}', { goud: T.hoeveel(v.goud, 'goud') }), kan,
        waarom: kan ? '' : T.t('Buying them out costs {goud}, and you have {heb}.', { goud: T.hoeveel(v.goud, 'goud'), heb: goud }),
        doe: () => T.koopHeervaartAf(D),
      },
      { actie: 'stuur', tekst: v.wie.length === 1 ? T.t('Send him') : T.t('Send them'), kan: true, hoofd: true, doe: () => T.stuurHeervaart(D, 'gestuurd') },
    ];
  };

  // Ze gaan: `hoe` is 'gestuurd' (je koos het) of 'gehaald' (je koos niet, en de heer haalde ze). Wie sinds de
  // brief stierf of wegtrok, gaat niet; de heer merkt het niet. Geeft terug wie er gingen.
  T.stuurHeervaart = function (D, hoe) {
    const H = heervaartVan(D);
    const v = H.vraag;
    if (!v) return [];
    H.vraag = null;
    const wie = v.wie.filter((p) => D.bewoners && D.bewoners.mensen.includes(p) && !p.weg);
    H.laatste = { jaar: v.jaar, antwoord: hoe, mannen: wie.length };
    if (!wie.length) {
      T.zeg(D, T.t('The lord asked for men, but there was no one who could go.'));
      return wie;
    }
    T.stuurWeg(D, wie, 'heervaart');
    H.tocht = { wie, terugOp: volgende(dagNu(D), IN().terug) };
    // Twee bazen (js/bazen.js): de heer krijgt zijn mannen, of haalde ze zelf; het dorp ziet ze gaan.
    const BZ = T.BAZEN_INSTELLINGEN;
    T.wijzigGunst(D, hoe === 'gehaald' ? BZ.heervaart.gehaald : BZ.heervaart.gestuurd, hoe === 'gehaald' ? T.t('you did not answer him') : T.t('you sent him men'));
    T.wijzigVertrouwen(D, BZ.heervaartWeg, T.t('you sent men to war'));
    const woorden = { wie: namen(wie), n: wie.length, terug: terugTekst() };
    if (hoe === 'gehaald') T.zeg(D, T.t('You did not answer the lord. His soldiers came for {wie}; back on {terug}.', woorden), 'gevaar');
    else T.zeg(D, T.t('{n|{wie} goes|{wie} go} to war with the lord. Back on {terug}.', woorden));
    return wie;
  };

  // Vrijkopen: het goud, en de heer vraagt zich af waar het vandaan kwam (zijn gunst daalt met gunstPerGoud per goud, en
  // stijgt met wat zijn goud hem waard is: T.BAZEN_INSTELLINGEN.heervaart.vrijgekocht). Eén verandering van de meter,
  // zodat de waarschuwing niet afhangt van welk deel eerst kwam.
  T.koopHeervaartAf = function (D) {
    const H = heervaartVan(D);
    const v = H.vraag;
    if (!v || ((D.voorraad && D.voorraad.goud) || 0) < v.goud) return false;
    H.vraag = null;
    T.wijzigVoorraad(D, 'goud', -v.goud);
    T.wijzigGunst(D, T.BAZEN_INSTELLINGEN.heervaart.vrijgekocht - v.goud * IN().gunstPerGoud, T.t('you bought your men out of his levy'));
    T.wijzigVertrouwen(D, T.BAZEN_INSTELLINGEN.heervaartVrij, T.t('you bought the men out'));
    H.laatste = { jaar: v.jaar, antwoord: 'vrijgekocht', goud: v.goud };
    T.zeg(D, T.t('You buy your men out for {goud}. The lord wonders where that came from.', { goud: T.hoeveel(v.goud, 'goud') }));
    return true;
  };

  // Ze komen terug (T.tikHeervaartDag, op 1 herfstmaand): een op de vier gemiddeld niet. Wie terugkomt, is veteraan,
  // en komt overdag over de weg binnen, met het bericht wie het zijn en wie er sneuvelde (T.komtTerug,
  // js/bewoners.js).
  T.heervaartKomtTerug = function (D) {
    const H = heervaartVan(D);
    const t = H.tocht;
    if (!t) return null;
    H.tocht = null;
    const wie = t.wie.filter((p) => D.bewoners && D.bewoners.mensen.includes(p));
    const dood = [];
    const terug = [];
    wie.forEach((p, i) => (lot(D, dagNu(D), i) < IN().kansNietTerug ? dood : terug).push(p));
    const over = dood.length
      ? ` ${T.t('{n|{wie} fell for the lord. He sends word that he was brave.|{wie} fell for the lord. He sends word that they were brave.}', { n: dood.length, wie: namen(dood) })}`
      : '';
    const tekst = terug.length ? `${T.t('The men of the levy come back: {wie}.', { wie: namen(terug) })}${over}` : `${T.t('None of the levy comes back.')}${over}`;
    if (dood.length) T.wijzigBevolking(D, -dood.length, 'gesneuveld', null, dood);
    for (const p of terug) p.veteraan = true;
    if (terug.length) T.komtTerug(D, terug, { tekst, soort: dood.length ? 'gevaar' : 'goed' });
    else T.zeg(D, tekst, 'gevaar');
    if (H.laatste) Object.assign(H.laatste, { gesneuveld: dood.length, terug: terug.length });
    return { terug, dood };
  };

  // Eén dag (T.tikGebouwenDag, js/gebouwen.js, na de heer): zijn brief op 1 hooimaand, de mannen die hij ophaalt
  // als je na een week nog niet koos, en wie er op 1 herfstmaand terugkomt. Wie weg is, komt ook terug als de
  // spelregel intussen uit ging.
  T.tikHeervaartDag = function (D, dag) {
    const H = D.heervaart;
    if (H && H.tocht && H.tocht.terugOp != null && dag >= H.tocht.terugOp) T.heervaartKomtTerug(D);
    if (D.einde || !D.bewoners) return;
    if (H && H.vraag && dag >= H.vraag.uiterlijk) T.stuurHeervaart(D, 'gehaald');
    if (!T.heervaartGeldt(D) || !isDatum(T.datumVanDag(dag), IN().brief)) return;
    if (H && (H.vraag || H.tocht)) return;
    T.vraagHeervaart(D, dag);
  };
})(globalThis.Spel = globalThis.Spel || {});
