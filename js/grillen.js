// De grillen van de heer: elke maand een brief (werklijst vraag 106, a en stap 2; Marcel, 3 okt: "106 a b c d ja").
// De heer eist niet alleen zijn schatting: elke maand wil hij iets, in een brief (een standbeeld, het bier voor de
// bruiloft van zijn neef, zijn jacht in je velden), en elk antwoord weegt zijn gunst tegen het vertrouwen van het dorp
// (js/bazen.js): wie hem geeft wat hij wil, geeft het van het dorp; wie het dorp spaart, ergert hem. Antwoord je niet
// binnen `antwoordBinnen` dagen, dan neemt hij het je kwalijk (`stil`).
//
// Zoals de heervaart (js/heervaart.js): een vraag die wacht (D.grillen.vraag), een brief met knoppen (js/brieven.js,
// soort 'gril'; de knop Brief opent hem weer), en wat een antwoord kost, zegt hetzelfde als bij een voorval
// (T.prijsVanKeuze, js/voorvallen.js). Alleen met de spelregel "Twee bazen" (T.bazenTellen).
//
// D.grillen: { vraag: { id, dag, uiterlijk }, geweest: { id: dag }, aantal, beantwoord, stil }
(function (T) {
  'use strict';

  // Alle getallen in één blok, zoals elders (CLAUDE.md); ze staan ook in de werkbank (js/opties.js).
  T.GRILLEN_INSTELLINGEN = {
    // Op deze dag van de maand komt zijn brief.
    dag: 12,
    // Niet in de maanden waarin hij al schrijft of zelf komt: de schatting (wijnmaand) en Sint-Maarten (slachtmaand).
    nietIn: ['wijnmaand', 'slachtmaand'],
    // Niet in de eerste zoveel dagen van je ambt.
    nietVoor: 30,
    // Zoveel dagen wacht hij op je antwoord.
    antwoordBinnen: 10,
    // Dezelfde gril komt niet binnen zoveel dagen terug: een jaar.
    pauze: 360,
  };
  const IN = () => T.GRILLEN_INSTELLINGEN;

  // Wat hij kan willen. Per gril: de titel (voor de brief en het waarom bij de balk), de tekst van zijn brief, de
  // antwoorden (`doe`: goud en waren, gunst en vertrouwen in punten; zoals een voorval, js/voorvallen.js), en
  // wat het kost als je niet antwoordt (`stil`).
  T.GRILLEN = {
    standbeeld: {
      titel: T.t('the statue'),
      tekst: [
        T.t('It has come to Our attention that your square is empty. A square without Us is merely a square.'),
        T.t('Put up a statue of Us there, large enough to be seen from the road, with Our good side to the south. We have only good sides.'),
      ],
      keuzes: [
        { tekst: T.t('A large statue, in oak.'), doe: { hout: -16, goud: -6, gunst: 10, vertrouwen: -3 } },
        { tekst: T.t('A modest statue. Modesty becomes you.'), doe: { hout: -6, gunst: 3 } },
        { tekst: T.t('The square is too small for your greatness.'), doe: { gunst: -6, vertrouwen: 2 } },
      ],
      stil: { gunst: -8 },
    },
    varken: {
      titel: T.t('the fat pig'),
      tekst: [
        T.t('We are expecting noble guests, and Our cook says the cellars are empty. That cannot be, for We told him they are full.'),
        T.t('Send Us your fattest pig. Or something else that is fat.'),
      ],
      keuzes: [
        { tekst: T.t('Ten sides of meat, the best we have.'), doe: { vlees: -10, gunst: 6, vertrouwen: -2 } },
        { tekst: T.t('Twenty sacks of grain. The fat will come by itself.'), doe: { graan: -20, gunst: 3 } },
        { tekst: T.t('Our pigs are thin, my lord. Like us.'), doe: { gunst: -5, vertrouwen: 3 } },
      ],
      stil: { gunst: -6 },
    },
    bruiloft: {
      titel: T.t("his nephew's wedding"),
      tekst: [
        T.t('Our nephew is to be married. You do not know him, but he knows you: he is the one who wants your office.'),
        T.t('Your village will provide the ale. A great deal of ale. He has yet to meet the bride.'),
      ],
      keuzes: [
        { tekst: T.t('Fifteen barrels, of the best.'), doe: { bier: -15, gunst: 8, vertrouwen: -4 } },
        { tekst: T.t('Eight gold, for ale from elsewhere.'), doe: { goud: -8, gunst: 4 } },
        { tekst: T.t('The ale is all gone, my lord.'), doe: { gunst: -6 } },
      ],
      stil: { gunst: -6 },
    },
    jacht: {
      titel: T.t('the hunt'),
      tekst: [
        T.t('We are coming to hunt. There is said to be game in your parts, and failing that We shall take your chickens.'),
        T.t('See that the fields are clear. Horses are poor at going round grain.'),
      ],
      keuzes: [
        { tekst: T.t('Hunt wherever you please, my lord.'), doe: { graan: -15, gunst: 8, vertrouwen: -6 } },
        { tekst: T.t('The game is fattest on the heath.'), doe: { gunst: 3, vertrouwen: -1 } },
        { tekst: T.t('The game has the mange, my lord. Very catching.'), doe: { gunst: -6, vertrouwen: 2 } },
      ],
      stil: { gunst: -8 },
    },
    ramen: {
      titel: T.t('the window tax'),
      tekst: [
        T.t('It has occurred to Us that whoever looks through a window sees something, and whoever sees something can pay for it.'),
        T.t('Henceforth every window owes Us a penny. We begin now.'),
      ],
      keuzes: [
        { tekst: T.t('Ten gold, for all the windows.'), doe: { goud: -10, gunst: 5, vertrouwen: -3 } },
        { tekst: T.t('We board up the windows.'), doe: { gunst: 2, vertrouwen: -6 } },
        { tekst: T.t('We do not pay for daylight, my lord.'), doe: { gunst: -8, vertrouwen: 5 } },
      ],
      stil: { gunst: -6 },
    },
    dichter: {
      titel: T.t('the court poet'),
      tekst: [
        T.t('We are sending you Our court poet. He is writing an ode to Us, and needs peace and quiet for it. And food. For a month.'),
      ],
      keuzes: [
        { tekst: T.t('He eats with us, for a month.'), doe: { graan: -12, gunst: 5, vertrouwen: -1 } },
        { tekst: T.t('The inn is full, my lord. For a month.'), doe: { gunst: -5, vertrouwen: 2 } },
      ],
      stil: { gunst: -5 },
    },
    klok: {
      titel: T.t("the bishop's bell"),
      tekst: [
        T.t('The bishop wants a new bell. We told him that We would pay. We meant you.'),
      ],
      keuzes: [
        { tekst: T.t('Twelve gold, for the bell.'), doe: { goud: -12, gunst: 6, vertrouwen: 1 } },
        { tekst: T.t('Our chapel already has a bell, my lord. It does not ring, but it is there.'), doe: { gunst: -5 } },
      ],
      stil: { gunst: -6 },
    },
    soldaten: {
      titel: T.t('the soldiers passing through'),
      tekst: [
        T.t('Our soldiers are marching through your village, on their way to a war We have yet to think of.'),
        T.t('Give them three nights of shelter and food. They are hardly ever any trouble.'),
      ],
      keuzes: [
        { tekst: T.t('They are lodged with the farmers, and eat with them.'), doe: { graan: -15, gunst: 8, vertrouwen: -6 } },
        { tekst: T.t('They sleep at the inn.'), doe: { bier: -12, gunst: 4, vertrouwen: -2 } },
        { tekst: T.t('The village is full, my lord.'), doe: { gunst: -10, vertrouwen: 3 } },
      ],
      stil: { gunst: -8 },
    },
    verjaardag: {
      titel: T.t('his birthday'),
      tekst: [
        T.t('We are turning fifty, or forty; Our chancellor is checking. The whole land is celebrating, and your village is part of the land.'),
      ],
      keuzes: [
        { tekst: T.t('A feast on the square, with ale for everyone.'), doe: { bier: -10, gunst: 6, vertrouwen: 5 } },
        { tekst: T.t('A letter with our good wishes.'), doe: { gunst: 1 } },
        { tekst: T.t('We had forgotten, my lord.'), doe: { gunst: -6 } },
      ],
      stil: { gunst: -6 },
    },
    valk: {
      titel: T.t('the falcon'),
      tekst: [
        T.t('Our falcon has escaped. He is surely with you, for he is fond of rich villages.'),
        T.t('Find him, and bring him back. Alive.'),
      ],
      keuzes: [
        { tekst: T.t('The whole village searches for a day.'), doe: { gunst: 5, vertrouwen: -3 } },
        { tekst: T.t('He is not here, my lord.'), doe: { gunst: -3 } },
        { tekst: T.t('We found him. Roasted, alas.'), doe: { gunst: -10, vertrouwen: 6 } },
      ],
      stil: { gunst: -5 },
    },
    lening: {
      titel: T.t('the loan'),
      tekst: [
        T.t('We are doing splendidly, but for the moment We are a little short. Lend Us twenty gold. We shall pay you back, with thanks.'),
      ],
      keuzes: [
        { tekst: T.t('Twenty gold, my lord.'), doe: { goud: -20, gunst: 10 } },
        { tekst: T.t('The chest is empty, my lord.'), doe: { gunst: -6 } },
      ],
      stil: { gunst: -6 },
    },
    weg: {
      titel: T.t('the road to the castle'),
      tekst: [
        T.t('The road from your village to Our castle is poor. That is why Our gold arrives so slowly.'),
        T.t('Build a better one. Your men have nothing to do anyway.'),
      ],
      keuzes: [
        { tekst: T.t('Fifteen loads of wood, and the men.'), doe: { hout: -15, gunst: 8, vertrouwen: -5 } },
        { tekst: T.t('After the harvest, my lord.'), doe: { gunst: -4 } },
      ],
      stil: { gunst: -6 },
    },
    portret: {
      titel: T.t('the portrait'),
      tekst: [
        T.t('A painter is coming to paint Our portrait, for your town hall. You have no town hall? Then for your inn.'),
      ],
      keuzes: [
        { tekst: T.t('Ten gold for the painter.'), doe: { goud: -10, gunst: 6, vertrouwen: -1 } },
        { tekst: T.t('The light is poor here, my lord.'), doe: { gunst: -3 } },
      ],
      stil: { gunst: -4 },
    },
    pest: {
      titel: T.t('the plague in the district'),
      tekst: [
        T.t('There is plague in the district. It does not trouble Us; We live up high.'),
        T.t('Close your village. No one in, no one out, until We say otherwise.'),
      ],
      keuzes: [
        { tekst: T.t('We close the road.'), doe: { gunst: 5, vertrouwen: -4 } },
        { tekst: T.t('We are healthy, my lord, and the market must go on.'), doe: { gunst: -4, vertrouwen: 2 } },
      ],
      stil: { gunst: -4 },
    },
  };

  const WAREN = ['goud', 'graan', 'hout', 'wol', 'bier', 'ijzer', 'zout', 'vlees', 'vis', 'kaas', 'hooi'];

  T.nieuweGrillen = () => ({ vraag: null, geweest: {}, aantal: 0, beantwoord: 0, stil: 0 });
  const grillenVan = (D) => D.grillen || (D.grillen = T.nieuweGrillen());

  // Wat een antwoord doet: de waren, en wat de heer en het dorp ervan vinden (js/bazen.js), met de titel als waarom.
  function pasToe(D, doe, waarom) {
    for (const wat of WAREN) if (doe[wat]) T.wijzigVoorraad(D, wat, doe[wat]);
    if (doe.gunst) T.wijzigGunst(D, doe.gunst, waarom);
    if (doe.vertrouwen) T.wijzigVertrouwen(D, doe.vertrouwen, waarom);
  }

  // Elke dag (T.tikGebouwenDag, js/gebouwen.js, na de heervaart): wacht er een gril op je, en is zijn tijd om, dan
  // telt het als geen antwoord. Anders, op de dag van de maand, een nieuwe: geloot uit wat er niet kort geleden was, als
  // er geen andere brief van de heer wacht en hij niet in het dorp is.
  T.tikGrillenDag = function (D, dag) {
    if (!T.bazenTellen(D) || D.einde || T.heerLaatMetRust(D, dag)) return;
    const G = grillenVan(D);
    if (G.vraag) {
      if (dag >= G.vraag.uiterlijk) zonderAntwoord(D);
      return;
    }
    const d = T.datumVanDag(dag);
    if (d.dagVanMaand !== IN().dag || dag < IN().nietVoor || IN().nietIn.includes(T.MAANDEN[d.maand].naam)) return;
    const h = D.heer;
    if ((h && (h.brief || h.bezoek)) || (D.heervaart && D.heervaart.vraag)) return;
    const kan = Object.keys(T.GRILLEN).filter((id) => G.geweest[id] == null || dag - G.geweest[id] >= IN().pauze);
    if (!kan.length) return;
    const id = kan[Math.floor(T.lotVanDeDag(D, dag, 61) * kan.length)];
    G.vraag = { id, dag, uiterlijk: dag + IN().antwoordBinnen };
    G.geweest[id] = dag;
    G.aantal++;
    if (T.ui && T.ui.toonBrief && !D.ander) T.ui.toonBrief(D, 'gril');
    else T.zeg(D, T.t('There is a letter from the lord about {titel}.', { titel: T.GRILLEN[id].titel }));
  };

  // Geen antwoord: hij neemt het je kwalijk.
  function zonderAntwoord(D) {
    const G = grillenVan(D);
    const g = T.GRILLEN[G.vraag.id];
    G.vraag = null;
    G.stil++;
    T.zeg(D, T.t('"We heard nothing from you, reeve." You did not answer the lord about {titel}.', { titel: g.titel }), 'gevaar');
    pasToe(D, g.stil, T.t('you did not answer him about {titel}', { titel: g.titel }));
  }

  // De gril die op je antwoord wacht, of null: { id, titel, tekst, dag, uiterlijk }.
  T.grilNu = function (D) {
    const v = D.grillen && D.grillen.vraag;
    const g = v && T.GRILLEN[v.id];
    return g ? { id: v.id, titel: g.titel, tekst: g.tekst, dag: v.dag, uiterlijk: v.uiterlijk } : null;
  };

  // De knoppen onder zijn brief (js/brieven.js): elk antwoord met wat het kost (T.prijsVanKeuze, js/voorvallen.js), en
  // of het kan. [{ actie, tekst, prijs, kan, waarom, hoofd, doe }]
  T.grilKeuzes = function (D) {
    const v = D.grillen && D.grillen.vraag;
    const g = v && T.GRILLEN[v.id];
    if (!g) return [];
    return g.keuzes.map((k, i) => {
      const prijs = T.prijsVanKeuze(D, k.doe);
      // Geen knop gaat voor: het spel kiest niet voor je tussen de heer en het dorp.
      return { actie: `gril${i}`, tekst: k.tekst, prijs: prijs.tekst, kan: prijs.kan, waarom: prijs.waarom, hoofd: false, doe: () => T.beantwoordGril(D, i) };
    });
  };

  // Je antwoordt met keuze `i`: wat het kost en doet, en de vraag is weg. Geeft of het kon.
  T.beantwoordGril = function (D, i) {
    const G = grillenVan(D);
    const g = G.vraag && T.GRILLEN[G.vraag.id];
    const k = g && g.keuzes[i];
    if (!k || !T.prijsVanKeuze(D, k.doe).kan) return false;
    G.vraag = null;
    G.beantwoord++;
    pasToe(D, k.doe, g.titel);
    return true;
  };
})(globalThis.Spel = globalThis.Spel || {});
