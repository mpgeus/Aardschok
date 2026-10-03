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
  // antwoorden (`doe`: goud en waren, gunst, vertrouwen, argwaan in procenten; zoals een voorval, js/voorvallen.js), en
  // wat het kost als je niet antwoordt (`stil`).
  T.GRILLEN = {
    standbeeld: {
      titel: 'het standbeeld',
      tekst: [
        'Het is Ons opgevallen dat uw plein leeg is. Een plein zonder Ons is maar een plein.',
        'Zet er een standbeeld van Ons op, groot genoeg om vanaf de weg te zien, met Onze goede kant naar het zuiden. Wij hebben alleen goede kanten.',
      ],
      keuzes: [
        { tekst: 'Een groot beeld, van eikenhout.', doe: { hout: -16, goud: -6, gunst: 10, vertrouwen: -3 } },
        { tekst: 'Een bescheiden beeld. Bescheidenheid siert u.', doe: { hout: -6, gunst: 3 } },
        { tekst: 'Het plein is te klein voor uw grootheid.', doe: { gunst: -6, vertrouwen: 2 } },
      ],
      stil: { gunst: -8 },
    },
    varken: {
      titel: 'het vette varken',
      tekst: [
        'Wij krijgen gasten van adel, en Onze kok zegt dat de kelders leeg zijn. Dat kan niet, want Wij hebben hem gezegd dat ze vol zijn.',
        'Zend Ons uw vetste varken. Of iets anders vets.',
      ],
      keuzes: [
        { tekst: 'Tien vlees, het beste dat we hebben.', doe: { vlees: -10, gunst: 6, vertrouwen: -2 } },
        { tekst: 'Twintig graan. Vet wordt het vanzelf.', doe: { graan: -20, gunst: 3 } },
        { tekst: 'Onze varkens zijn mager, heer. Net als wij.', doe: { gunst: -5, vertrouwen: 3 } },
      ],
      stil: { gunst: -6 },
    },
    bruiloft: {
      titel: 'de bruiloft van zijn neef',
      tekst: [
        'Onze neef trouwt. U kent hem niet, maar hij kent u: hij is degene die uw ambt wil.',
        'Uw dorp schenkt het bier. Veel bier. Hij moet de bruid nog leren kennen.',
      ],
      keuzes: [
        { tekst: 'Vijftien vaten, van het beste.', doe: { bier: -15, gunst: 8, vertrouwen: -4 } },
        { tekst: 'Acht goud, voor bier van elders.', doe: { goud: -8, gunst: 4 } },
        { tekst: 'Het bier is op, heer.', doe: { gunst: -6 } },
      ],
      stil: { gunst: -6 },
    },
    jacht: {
      titel: 'de jacht',
      tekst: [
        'Wij komen jagen. Er schijnt wild te zijn in uw streek, en anders nemen Wij uw kippen.',
        'Zorg dat de velden vrij zijn. Paarden lopen slecht om graan heen.',
      ],
      keuzes: [
        { tekst: 'Jaag waar u wilt, heer.', doe: { graan: -15, gunst: 8, vertrouwen: -6 } },
        { tekst: 'Op de heide is het wild het vetst.', doe: { gunst: 3, vertrouwen: -1 } },
        { tekst: 'Het wild heeft de schurft, heer. Erg besmettelijk.', doe: { gunst: -6, vertrouwen: 2 } },
      ],
      stil: { gunst: -8 },
    },
    ramen: {
      titel: 'de belasting op ramen',
      tekst: [
        'Wij hebben bedacht dat wie door een raam kijkt, iets ziet, en wie iets ziet, kan ervoor betalen.',
        'Voortaan kost elk raam Ons een penning. Wij beginnen nu.',
      ],
      keuzes: [
        { tekst: 'Tien goud, voor alle ramen.', doe: { goud: -10, gunst: 5, vertrouwen: -3 } },
        { tekst: 'We timmeren de ramen dicht.', doe: { gunst: 2, vertrouwen: -6 } },
        { tekst: 'Voor licht betalen we niet, heer.', doe: { gunst: -8, vertrouwen: 5 } },
      ],
      stil: { gunst: -6 },
    },
    dichter: {
      titel: 'de hofdichter',
      tekst: [
        'Wij zenden u Onze hofdichter. Hij schrijft een lofdicht op Ons, en heeft daarvoor rust nodig. En eten. Een maand lang.',
      ],
      keuzes: [
        { tekst: 'Hij eet bij ons, een maand.', doe: { graan: -12, gunst: 5, vertrouwen: -1 } },
        { tekst: 'De herberg zit vol, heer. Een maand lang.', doe: { gunst: -5, vertrouwen: 2 } },
      ],
      stil: { gunst: -5 },
    },
    klok: {
      titel: 'de klok van de bisschop',
      tekst: [
        'De bisschop wil een nieuwe klok. Wij hebben hem gezegd dat Wij betalen. Wij bedoelden u.',
      ],
      keuzes: [
        { tekst: 'Twaalf goud, voor de klok.', doe: { goud: -12, gunst: 6, vertrouwen: 1 } },
        { tekst: 'Onze kapel heeft al een klok, heer. Hij luidt niet, maar hij is er.', doe: { gunst: -5 } },
      ],
      stil: { gunst: -6 },
    },
    soldaten: {
      titel: 'de soldaten op doortocht',
      tekst: [
        'Onze soldaten trekken door uw dorp, op weg naar een oorlog die Wij nog moeten bedenken.',
        'Geef ze drie nachten onderdak en eten. Ze zijn bijna nooit lastig.',
      ],
      keuzes: [
        { tekst: 'Ze slapen bij de boeren, en eten met hen.', doe: { graan: -15, gunst: 8, vertrouwen: -6 } },
        { tekst: 'Ze slapen in de herberg.', doe: { bier: -12, gunst: 4, vertrouwen: -2 } },
        { tekst: 'Het dorp is vol, heer.', doe: { gunst: -10, vertrouwen: 3 } },
      ],
      stil: { gunst: -8 },
    },
    verjaardag: {
      titel: 'zijn verjaardag',
      tekst: [
        'Wij worden vijftig, of veertig; Onze kanselier telt na. Het hele land viert het, en uw dorp is een deel van het land.',
      ],
      keuzes: [
        { tekst: 'Een feest op het plein, met bier voor iedereen.', doe: { bier: -10, gunst: 6, vertrouwen: 5 } },
        { tekst: 'Een brief met onze gelukwensen.', doe: { gunst: 1 } },
        { tekst: 'We waren het vergeten, heer.', doe: { gunst: -6 } },
      ],
      stil: { gunst: -6 },
    },
    valk: {
      titel: 'de valk',
      tekst: [
        'Onze valk is ontsnapt. Hij is zeker bij u, want hij houdt van rijke dorpen.',
        'Zoek hem, en breng hem terug. Levend.',
      ],
      keuzes: [
        { tekst: 'Het hele dorp zoekt een dag lang.', doe: { gunst: 5, vertrouwen: -3 } },
        { tekst: 'Hij is hier niet, heer.', doe: { gunst: -3 } },
        { tekst: 'We vonden hem. Gebraden, helaas.', doe: { gunst: -10, vertrouwen: 6 } },
      ],
      stil: { gunst: -5 },
    },
    lening: {
      titel: 'de lening',
      tekst: [
        'Het gaat Ons uitstekend, maar Wij komen tijdelijk iets tekort. Leen Ons twintig goud. Wij betalen u terug, met dank.',
      ],
      keuzes: [
        { tekst: 'Twintig goud, heer.', doe: { goud: -20, gunst: 10 } },
        { tekst: 'De kist is leeg, heer.', doe: { gunst: -6, argwaan: 5 } },
      ],
      stil: { gunst: -6 },
    },
    weg: {
      titel: 'de weg naar het kasteel',
      tekst: [
        'De weg van uw dorp naar Ons kasteel is slecht. Daardoor komt Ons goud zo traag aan.',
        'Leg een betere aan. Uw mannen hebben toch niets te doen.',
      ],
      keuzes: [
        { tekst: 'Vijftien hout, en de mannen.', doe: { hout: -15, gunst: 8, vertrouwen: -5 } },
        { tekst: 'Na de oogst, heer.', doe: { gunst: -4 } },
      ],
      stil: { gunst: -6 },
    },
    portret: {
      titel: 'het portret',
      tekst: [
        'Er komt een schilder Ons portret maken, voor uw raadhuis. U heeft geen raadhuis? Dan voor uw herberg.',
      ],
      keuzes: [
        { tekst: 'Tien goud voor de schilder.', doe: { goud: -10, gunst: 6, vertrouwen: -1 } },
        { tekst: 'Het licht is hier slecht, heer.', doe: { gunst: -3 } },
      ],
      stil: { gunst: -4 },
    },
    pest: {
      titel: 'de pest in de streek',
      tekst: [
        'Er is pest in de streek. Wij hebben er geen last van; Wij wonen hoog.',
        'Sluit uw dorp. Niemand erin, niemand eruit, tot Wij anders zeggen.',
      ],
      keuzes: [
        { tekst: 'We sluiten de weg.', doe: { gunst: 5, vertrouwen: -4 } },
        { tekst: 'We zijn gezond, heer, en de markt moet door.', doe: { gunst: -4, vertrouwen: 2 } },
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
    if (doe.argwaan) T.zetArgwaan(D, doe.argwaan / 100, waarom);
  }

  // Elke dag (T.tikGebouwenDag, js/gebouwen.js, na de heervaart): wacht er een gril op je, en is zijn tijd om, dan
  // telt het als geen antwoord. Anders, op de dag van de maand, een nieuwe: geloot uit wat er niet kort geleden was, als
  // er geen andere brief van de heer wacht en hij niet in het dorp is.
  T.tikGrillenDag = function (D, dag) {
    if (!T.bazenTellen(D) || D.einde) return;
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
    else T.zeg(D, `Er is een brief van de heer, over ${T.GRILLEN[id].titel}.`);
  };

  // Geen antwoord: hij neemt het je kwalijk.
  function zonderAntwoord(D) {
    const G = grillenVan(D);
    const g = T.GRILLEN[G.vraag.id];
    G.vraag = null;
    G.stil++;
    T.zeg(D, `"Wij hoorden niets van u, schout." Je antwoordde de heer niet over ${g.titel}.`, 'gevaar');
    pasToe(D, g.stil, `je antwoordde hem niet over ${g.titel}`);
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
