// Het geld: de munten, de kas van het dorp en de beurs van de schout (werklijst vraag 141, stap 1; Marcel, 8 okt: "Ik denk
// dat we binnen in het dorp ook een economie nodig hebben", "schout heeft losse beurs en beheert de dorpskas / stadsgeld",
// "Loon voor de schout", "Omkopen uit eigen zak", en de munten "Ja": 1 goud = 10 zilver = 100 koper).
//
// Het goud van het dorp (`D.voorraad.goud`) is de kas: daaruit gaan de bouw, de heer en de marskramer, en daar komt de
// belasting in. In de code blijft het één getal in goud; op het scherm staat het in goud, zilver en koper (T.muntTekst),
// zodat een brood straks een paar koper kost en de heer in goud rekent. Daarnaast heeft de schout een eigen beurs
// (`D.geld.beurs`): op de eerste van de maand krijgt hij zijn loon uit de kas (T.tikGeldDag), en wat hij uit eigen zak
// geeft (de inner omkopen, en straks anderen helpen), gaat daaruit (T.betaalUitBeurs). De spelregel "Geld" op "Alles van
// het dorp" zet het terug: geen beurs, geen loon, en alles uit de kas, zoals vóór 8 okt.
(function (T) {
  'use strict';

  T.GELD_INSTELLINGEN = {
    // Heeft de schout een eigen beurs (de spelregel "Geld")? Zonder gaat alles uit de kas, en krijgt hij geen loon.
    beurzen: true,
    // Zoveel zilver is een goud, en zoveel koper een zilver.
    zilverPerGoud: 10,
    koperPerZilver: 10,
    // Het loon van de schout, in goud per maand, uit de kas op de eerste van de maand.
    loon: 1,
    // Zoveel goud heeft hij in zijn beurs als het spel begint.
    beginBeurs: 2,
  };
  const IN = () => T.GELD_INSTELLINGEN;
  const koperPerGoud = () => IN().zilverPerGoud * IN().koperPerZilver;

  // Een bedrag in goud als munten: { goud, zilver, koper }, naar beneden afgerond op een koper.
  T.muntenVan = function (goud) {
    let koper = Math.floor((goud || 0) * koperPerGoud() + 1e-6);
    const g = Math.floor(koper / koperPerGoud());
    koper -= g * koperPerGoud();
    const z = Math.floor(koper / IN().koperPerZilver);
    return { goud: g, zilver: z, koper: koper - z * IN().koperPerZilver };
  };

  // Een bedrag als tekst: "3 goud, 2 zilver en 5 koper", of kort "3g 2z 5k"; wat nul is, staat er niet bij.
  T.muntTekst = function (goud, kort) {
    const m = T.muntenVan(goud);
    const delen = [['goud', 'g'], ['zilver', 'z'], ['koper', 'k']].filter(([w]) => m[w] > 0).map(([w, k]) => (kort ? `${m[w]}${k}` : `${m[w]} ${w}`));
    if (!delen.length) return kort ? '0' : 'niets';
    if (kort) return delen.join(' ');
    return delen.length > 1 ? `${delen.slice(0, -1).join(', ')} en ${delen[delen.length - 1]}` : delen[0];
  };

  // Heeft de schout een eigen beurs (de spelregel)?
  T.metBeurzen = () => !!IN().beurzen;

  function geldVan(D) {
    if (!D.geld) D.geld = { beurs: IN().beginBeurs, loonGehad: null };
    return D.geld;
  }

  // Wat er in de beurs van de schout zit; zonder beurzen is dat de kas.
  T.beursVan = (D) => (T.metBeurzen() ? geldVan(D).beurs : (D.voorraad ? D.voorraad.goud : D.goud) || 0);
  T.kasVan = (D) => (D.voorraad ? D.voorraad.goud : D.goud) || 0;

  // Iets erbij of eraf in de beurs van de schout (zonder beurzen: in de kas). Nooit onder nul.
  T.wijzigBeurs = function (D, n) {
    if (!T.metBeurzen()) {
      T.geefGoud(D, n);
      return;
    }
    const G = geldVan(D);
    G.beurs = Math.max(0, G.beurs + n);
    if (T.ui && T.ui.toonVoorraad && D.voorraad) T.ui.toonVoorraad(D);
  };

  // Kan de schout dit uit eigen zak betalen? En betaal het dan: true als het lukte.
  T.kanUitBeurs = (D, n) => T.beursVan(D) + 1e-9 >= n;
  T.betaalUitBeurs = function (D, n) {
    if (!T.kanUitBeurs(D, n)) return false;
    T.wijzigBeurs(D, -n);
    return true;
  };

  // Elke dag, na het werk (T.tikGebouwenDag, js/gebouwen.js): op de eerste van de maand krijgt de schout zijn loon uit de
  // kas, zoveel als erin zit.
  T.tikGeldDag = function (D, dag) {
    if (!T.metBeurzen() || !D.voorraad) return;
    const G = geldVan(D);
    const maand = Math.floor(dag / T.DAGEN_PER_MAAND);
    if (T.datumVanDag(dag).dagVanMaand !== 1 || G.loonGehad === maand) return;
    G.loonGehad = maand;
    const loon = Math.min(IN().loon, T.kasVan(D));
    if (!(loon > 0)) {
      T.zeg(D, 'Je loon blijft uit: de kas is leeg.', 'gevaar');
      return;
    }
    T.wijzigVoorraad(D, 'goud', -loon);
    T.wijzigBeurs(D, loon);
    T.schrijfOp(D, 'geld', { tekst: `Je kreeg je loon uit de kas: ${T.muntTekst(loon)}.` });
  };
})(globalThis.Spel = globalThis.Spel || {});
