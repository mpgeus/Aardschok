// De spelregels: wat de speler zelf instelt, en Marcel om te proberen, op één plek (Marcel, 24 sep
// 2026: "Dit moeten allemaal opties worden die instelbaar zijn"; ontwerp/spel.md, "Instelbaar").
// Drie soorten:
//   - T.OPTIES: ontwerpvragen met meer dan één goed antwoord, als keuzes. Een keuze zet alleen
//     waarden in de instellingenblokken die er al zijn (T.HEER_INSTELLINGEN, …), zodat elk getal
//     één plek houdt. De standaard is wat Marcel koos, en dat zijn ook de waarden in de bestanden
//     zelf (test/opties.test.cjs bewaakt dat).
//   - T.NAAM_OPTIES: de naam van de heer (tot ronde 2 van het snoeien ook die van de vijf boeren van het gehucht dat er
//     al was).
//   - T.WERKBANK: alle getallen uit de instellingenblokken, elk apart te verzetten. Wat je daar
//     zet, gaat vóór wat een keuze zet.
// T.pasOptiesToe zet eerst alles terug op de bestanden, dan de keuzes, dan de werkbank, dan de
// namen. De browser onthoudt wat je instelt (localStorage). Het venster staat in js/hud.js
// (T.ui.openSpelregels). Dit bestand komt ná alle regels en gesprekken (index.html), want het
// neemt hun waarden als standaard. Het gereedschap laadt het bewust niet: een naam die je in het
// spel geeft, mag nooit via de gespreksschrijver in js/gesprekken.js terechtkomen.
(function (T) {
  'use strict';

  // De straffen van "hij telt slecht" (de standaard, zoals in js/heer.js) en "hij telt precies".
  const TELT_SLECHT = [
    { vanaf: 0.9, straf: null },
    { vanaf: 2 / 3, straf: 'boete' },
    { vanaf: 0.5, straf: 'soldaten' },
    { vanaf: 0, straf: 'schandpaal' },
  ];
  const TELT_PRECIES = [
    { vanaf: 1, straf: null },
    { vanaf: 2 / 3, straf: 'boete' },
    { vanaf: 1 / 3, straf: 'soldaten' },
    { vanaf: 0, straf: 'schandpaal' },
  ];

  // ── Vorm van één optie ──
  //   { id, naam, uitleg, standaard: '<keuze-id>', keuzes: [{ id, naam, uitleg, zet: { pad: waarde } }] }
  // Een pad wijst in T: 'GRAAN_PER_TEGEL', of 'HEER_INSTELLINGEN.betalenIn'.
  // De naam en de uitleg zijn wat de speler leest, in het Engels (vraag 147, deel 7): `naam: T.t('Grain')`, een gewone tekst
  // zonder woorden erin, want de bladzijde met getallen (gereedschap/instellingen, I.tekstVan) leest ze zo uit de tekst.
  // De ids en de paden in `zet` blijven zoals ze zijn: de regels en wat de browser onthield letten erop. Een datum als
  // "8 October" is een dag van Marcels besluiten, geen dag in het spel (daar staat T.MAANDEN[i].toon).
  T.OPTIES = [
    {
      id: 'graan', naam: T.t('Grain'), standaard: 'netRond',
      uitleg: T.t('How tight an ordinary year is if you pay the lord everything in grain.'),
      keuzes: [
        { id: 'ruim', naam: T.t('Generous'), zet: { GRAAN_PER_TEGEL: 5 },
          uitleg: T.t('If you pay everything, you keep enough to grow. An arable tile gives 5 grain.') },
        { id: 'netRond', naam: T.t('Just enough'), zet: { GRAAN_PER_TEGEL: 4 },
          uitleg: T.t('If you pay everything, you get through the year with a small surplus, but you do not grow. An arable tile gives 4 grain.') },
        { id: 'honger', naam: T.t('Hunger'), zet: { GRAAN_PER_TEGEL: 3.5 },
          uitleg: T.t('If you pay everything, you run short of grain every year: cheating the lord becomes a necessity. An arable tile gives 3.5 grain.') },
      ],
    },
    {
      id: 'betalenIn', naam: T.t('What the lord wants to be paid in'), standaard: 'watHijZiet',
      uitleg: T.t('What he asks for at Martinmas for what he sees. He always takes gold, in place of anything else.'),
      keuzes: [
        { id: 'watHijZiet', naam: T.t('By what he sees'), zet: { 'HEER_INSTELLINGEN.betalenIn': 'watHijZiet' }, // geen tekst
          uitleg: T.t('Grain for the fields, wool for the sheep, eggs for the hens, logs for his forest, and the rest in gold.') },
        { id: 'graanEnGoud', naam: T.t('Grain and gold'), zet: { 'HEER_INSTELLINGEN.betalenIn': 'graanEnGoud' }, // geen tekst
          uitleg: T.t('The rent in grain, and everything else converted to gold.') },
        { id: 'alleenGoud', naam: T.t('Gold only'), zet: { 'HEER_INSTELLINGEN.betalenIn': 'alleenGoud' }, // geen tekst
          uitleg: T.t('Everything in gold, the rent too. Then you have to sell to the merchant first.') },
      ],
    },
    {
      id: 'telt', naam: T.t('How the lord counts'), standaard: 'slecht',
      uitleg: T.t('What he does if you give him too little.'),
      keuzes: [
        {
          id: 'slecht', naam: T.t('Badly'),
          zet: { 'HEER_INSTELLINGEN.telWijze': 'hoeveel', 'HEER_INSTELLINGEN.straffen': TELT_SLECHT, 'HEER_INSTELLINGEN.veelTeWeinig': 0.5, 'HEER_INSTELLINGEN.ambtKwijtNa': 2 }, // geen tekst
          uitleg: T.t('Up to a tenth short he does not notice. Up to a third short, a fine; up to half short, soldiers too; worse, the pillory too. Less than half paid twice in a row: you lose your office.'),
        },
        {
          id: 'precies', naam: T.t('Exactly'),
          zet: { 'HEER_INSTELLINGEN.telWijze': 'hoeveel', 'HEER_INSTELLINGEN.straffen': TELT_PRECIES, 'HEER_INSTELLINGEN.veelTeWeinig': 1 / 3, 'HEER_INSTELLINGEN.ambtKwijtNa': 2 }, // geen tekst
          uitleg: T.t('Every shortfall counts. Up to a third short, a fine; up to two thirds short, soldiers too; worse, the pillory too. More than two thirds short twice in a row: you lose your office.'),
        },
        {
          id: 'steedsZwaarder', naam: T.t('Harsher each time'),
          zet: { 'HEER_INSTELLINGEN.telWijze': 'hoeVaak', 'HEER_INSTELLINGEN.ambtKwijtNa': 4 }, // geen tekst
          uitleg: T.t('What counts is not how much you are short, but how many times in a row: the first time a fine, the second soldiers too, the third the pillory too, the fourth your office.'),
        },
      ],
    },
    {
      id: 'schoutAanDePaal', naam: T.t('The reeve in the pillory'), standaard: 'mag',
      uitleg: T.t('Whether you may name yourself when somebody has to go in the pillory.'),
      keuzes: [
        { id: 'mag', naam: T.t('Allowed'), zet: { 'HEER_INSTELLINGEN.schoutMagZelf': true }, // geen tekst
          uitleg: T.t('The village does not hold it against you, but the lord finds it laughable and raises the fine.') },
        { id: 'magNiet', naam: T.t('Not allowed'), zet: { 'HEER_INSTELLINGEN.schoutMagZelf': false }, // geen tekst
          uitleg: T.t('You always name somebody else. It stays dirty work.') },
      ],
    },
    {
      id: 'graanVoorDeHeer', naam: T.t('What the lord asks of the grain'), standaard: 'deel',
      uitleg: T.t('The grain on his bill.'),
      keuzes: [
        { id: 'deel', naam: T.t('A share of what is stored'), zet: { 'HEER_INSTELLINGEN.graan': 'deel' }, // geen tekst
          uitleg: T.t('A share of the grain in the barns.') },
        { id: 'pacht', naam: T.t('Rent per field'), zet: { 'HEER_INSTELLINGEN.graan': 'pacht' }, // geen tekst
          uitleg: T.t('A fixed share per arable tile, however the harvest turned out.') },
      ],
    },
    {
      id: 'hongerBuitenWinter', naam: T.t('Hunger outside winter'), standaard: 'tevredenheid',
      uitleg: T.t('What happens when the grain runs out in spring, summer or autumn. In winter hunger always costs lives.'),
      keuzes: [
        { id: 'tevredenheid', naam: T.t('Only discontent'), zet: { 'BEHOEFTEN_INSTELLINGEN.hongerBuitenWinter': 'tevredenheid' }, // geen tekst
          uitleg: T.t('Hungry people work less hard and have no children, but nobody leaves or dies.') },
        { id: 'wegtrekken', naam: T.t('Families leave'), zet: { 'BEHOEFTEN_INSTELLINGEN.hongerBuitenWinter': 'wegtrekken' }, // geen tekst
          uitleg: T.t('As long as there is not enough food, a family leaves every twenty days.') },
        { id: 'sterven', naam: T.t('People die'), zet: { 'BEHOEFTEN_INSTELLINGEN.hongerBuitenWinter': 'sterven' }, // geen tekst
          uitleg: T.t('As in winter, hunger costs lives all year round.') },
      ],
    },
    // De weides (Marcel, 25 sep; ontwerp/spel.md, "Weides met koeien en schapen"): wat hij niet
    // koos, wordt een keuze. "Vee alleen kopen" komt erbij met stap 3, als de marskramer vee
    // verkoopt.
    {
      id: 'vruchtbaarheid', naam: T.t('Fertility'), standaard: 'putUit',
      uitleg: T.t('Whether an arable field wears out the land, so that you have to let fields rest.'),
      keuzes: [
        { id: 'putUit', naam: T.t('The land wears out'), zet: { 'VELDEN_INSTELLINGEN.vruchtbaarheid': true }, // geen tekst
          uitleg: T.t('An arable field gives a little less each year. Fallow land rests, and a meadow with livestock makes the land fertile again faster.') },
        { id: 'blijftGoed', naam: T.t('The land stays good'), zet: { 'VELDEN_INSTELLINGEN.vruchtbaarheid': false }, // geen tekst
          uitleg: T.t('An arable field gives its full grain every year, however often it was arable. A meadow is then only for the livestock.') },
      ],
    },
    {
      id: 'veeGroeit', naam: T.t('The livestock'), standaard: 'groeit',
      uitleg: T.t('Whether the herd grows by itself.'),
      keuzes: [
        { id: 'groeit', naam: T.t('Grows in spring'), zet: { 'VEE_INSTELLINGEN.groeit': true }, // geen tekst
          uitleg: T.t('In April the cows calve and the sheep lamb, as long as there is room on their meadow.') },
        { id: 'groeitNiet', naam: T.t('Does not grow'), zet: { 'VEE_INSTELLINGEN.groeit': false }, // geen tekst
          uitleg: T.t('No young are born: the herd stays as big as it began.') },
      ],
    },
    // Stap 2 van de weides (Marcel, 25 sep; spel.md, "Marcel koos voor stap 2").
    {
      id: 'winterzorg', naam: T.t('Livestock in winter'), standaard: 'hooi',
      uitleg: T.t('Whether livestock needs hay in winter: that decides how many animals you keep.'),
      keuzes: [
        { id: 'hooi', naam: T.t('Eats hay'), zet: { 'VEE_INSTELLINGEN.winterzorg': true }, // geen tekst
          uitleg: T.t('In July the farmers mow their meadows. From November through March the livestock eats that hay, and animals the hay cannot carry through the winter are slaughtered by you, or die.') },
        { id: 'geenZorg', naam: T.t('Grazes all year'), zet: { 'VEE_INSTELLINGEN.winterzorg': false }, // geen tekst
          uitleg: T.t('No hay and no hunger: a cow costs only her place on the meadow, and you slaughter only for the meat.') },
      ],
    },
    {
      id: 'schapenHooi', naam: T.t('What the sheep eat in winter'), standaard: 'heide',
      uitleg: T.t('The sheep graze on the heath. Do they eat there in winter too, or do they eat hay?'),
      keuzes: [
        { id: 'heide', naam: T.t('Heath'), zet: { 'VEE_INSTELLINGEN.hooiPerDag.schaap': 0 }, // geen tekst
          uitleg: T.t('They eat heath all year: a sheep costs no hay.') },
        { id: 'ookHooi', naam: T.t('Hay too'), zet: { 'VEE_INSTELLINGEN.hooiPerDag.schaap': 0.2 }, // geen tekst
          uitleg: T.t('In winter a sheep eats a fifth of what a cow eats. The hay gets tighter.') },
      ],
    },
    {
      id: 'mest', naam: T.t('The dung from the sheepfold'), standaard: 'perVeld',
      uitleg: T.t('Where the dung goes that the sheep make in the fold.'),
      keuzes: [
        { id: 'perVeld', naam: T.t('You choose per field'), zet: { 'VELDEN_INSTELLINGEN.mestVanzelf': false }, // geen tekst
          uitleg: T.t('In the fields window you put it on an arable field. A field with enough dung can stay arable every year.') },
        { id: 'vanzelf', naam: T.t('Automatically over all fields'), zet: { 'VELDEN_INSTELLINGEN.mestVanzelf': true }, // geen tekst
          uitleg: T.t("On 1 March all the dung is shared over that year's arable fields in proportion. You need do nothing.") },
      ],
    },
    // Het seizoen (Marcel, 30 sep, werklijst vraag 74: "Het zaaien wordt gewoon iets wat de boeren doen, zo ook het
    // oogsten en de winter. Jij moet als schout wel een oogje in het zeil houden"; js/akkers.js, js/vee.js en
    // js/behoeften.js).
    {
      id: 'seizoen', naam: T.t('The season'), standaard: 'boeren',
      uitleg: T.t('Who chooses what the fields become, who slaughters the livestock for winter, and whether firewood is gathered.'),
      keuzes: [
        { id: 'boeren', naam: T.t('The farmers'), zet: { 'VELDEN_INSTELLINGEN.boerenKiezen': true, 'VEE_INSTELLINGEN.boerenSlachten': true, 'BEHOEFTEN_INSTELLINGEN.sprokkelen': true }, // geen tekst
          uitleg: T.t('After the harvest each farmer chooses what his fields become next year: an exhausted field rests for a year, or gets dung. On 1 November they slaughter what the hay cannot carry, and all year round people gather firewood, though that is not enough for the winter. You keep an eye on things: in the fields window you see what they chose, and you can change it.') },
        { id: 'jij', naam: T.t('You'), zet: { 'VELDEN_INSTELLINGEN.boerenKiezen': false, 'VEE_INSTELLINGEN.boerenSlachten': false, 'BEHOEFTEN_INSTELLINGEN.sprokkelen': false }, // geen tekst
          uitleg: T.t('In the fields window you choose what the fields become, on 1 November the slaughter window asks who goes to the butcher, and nobody gathers firewood: all the logs come from the woodcutter.') },
      ],
    },
    // Marcel, 25 sep (een vraag uit de proef van stap 2 van de weides): "Ja vlees moet ook eten zijn."
    {
      id: 'vlees', naam: T.t('Meat'), standaard: 'eten',
      uitleg: T.t('Whether meat is also food, so that slaughtering in November helps through the winter.'),
      keuzes: [
        { id: 'eten', naam: T.t('Fills a stomach'), zet: { 'BEHOEFTEN_INSTELLINGEN.vleesIsEten': true }, // geen tekst
          uitleg: T.t('What the salt does not keep well, the village eats first, since it spoils anyway. It keeps salted meat until the grain runs out.') },
        { id: 'tevredenheid', naam: T.t('Only more content'), zet: { 'BEHOEFTEN_INSTELLINGEN.vleesIsEten': false }, // geen tekst
          uitleg: T.t('The village eats meat as well for variety, but it does not help against hunger.') },
      ],
    },
    // Marcel, 8 okt (werklijst vraag 132): "Vis mag een maag vullen, zoals vlees".
    {
      id: 'vis', naam: T.t('Fish'), standaard: 'eten',
      uitleg: T.t('Whether the village also eats fish when it is hungry, or only what the houses want of it.'),
      keuzes: [
        { id: 'eten', naam: T.t('Fills a stomach'), zet: { 'BEHOEFTEN_INSTELLINGEN.visIsEten': true }, // geen tekst
          uitleg: T.t('What the salt does not keep well, the village eats first, since it spoils anyway. It keeps salted fish until the grain runs out.') },
        { id: 'tevredenheid', naam: T.t('Only for the wants'), zet: { 'BEHOEFTEN_INSTELLINGEN.visIsEten': false }, // geen tekst
          uitleg: T.t('The houses eat the fish they want; what is left spoils. As before 8 October.') },
      ],
    },
    // Marcel, 8 okt (werklijst vraag 140): "Dagloners is een goed idee", en "mensen in het dorp".
    {
      id: 'dagloners', naam: T.t('Day labourers'), standaard: 'maaien',
      uitleg: T.t('Whether people in the village with no work help the farmers reap, bind and carry at harvest.'),
      keuzes: [
        { id: 'maaien', naam: T.t('Reap, bind and carry'), zet: { 'SCHOVEN_INSTELLINGEN.dagloners': true, 'SCHOVEN_INSTELLINGEN.daglonersMaaien': true }, // geen tekst
          uitleg: T.t('When the harvest is ripe, those with no work help the nearest farm, up to three per farm: first reaping, then binding and carrying.') },
        { id: 'binden', naam: T.t('Bind and carry'), zet: { 'SCHOVEN_INSTELLINGEN.dagloners': true, 'SCHOVEN_INSTELLINGEN.daglonersMaaien': false }, // geen tekst
          uitleg: T.t('The farmer reaps alone; those with no work help bind the sheaves and carry them to the barn.') },
        { id: 'uit', naam: T.t('Family only'), zet: { 'SCHOVEN_INSTELLINGEN.dagloners': false }, // geen tekst
          uitleg: T.t('Only the farmer, his wife and the older children bring in the harvest. As before 8 October.') },
      ],
    },
    // Marcel, 9 okt (werklijst vraag 77, stap 2): "1. Beiden 2. Ook in beeld 3. Ja kleine beekjes ook, goed idee!".
    {
      id: 'weer', naam: T.t('The weather'), standaard: 'aan',
      uitleg: T.t('Whether it rains, snows and turns dry, and whether drought costs the harvest and the brooks.'),
      keuzes: [
        { id: 'aan', naam: T.t('With drought'), zet: { 'WEER_INSTELLINGEN.aan': true, 'WEER_INSTELLINGEN.droogte': true }, // geen tekst
          uitleg: T.t('Every day sun, clouds, rain or snow. If no rain falls for a long time in the growing season, there is drought: the fields give less and the small brooks run dry.') },
        { id: 'zonder', naam: T.t('Without drought'), zet: { 'WEER_INSTELLINGEN.aan': true, 'WEER_INSTELLINGEN.droogte': false }, // geen tekst
          uitleg: T.t('The weather is there and you see it, but it costs the harvest and the brooks nothing.') },
        { id: 'uit', naam: T.t('Always sunny'), zet: { 'WEER_INSTELLINGEN.aan': false }, // geen tekst
          uitleg: T.t('No weather: every day is like the last. As before 9 October.') },
      ],
    },
    // Marcel, 9 okt (werklijst vraag 143): "soort van brief sturen met een bode".
    {
      id: 'bode', naam: T.t('The messenger'), standaard: 'aan',
      uitleg: T.t('Whether in a hard time you can send a messenger with a letter to the merchant.'),
      keuzes: [
        { id: 'aan', naam: T.t('Yes'), zet: { 'BODE_INSTELLINGEN.aan': true }, // geen tekst
          uitleg: T.t('In hunger, cold or drought you write a letter at your house; a villager carries it, and after a few days the merchant comes with what you asked for, dearer than usual.') },
        { id: 'uit', naam: T.t('No'), zet: { 'BODE_INSTELLINGEN.aan': false }, // geen tekst
          uitleg: T.t('The merchant comes only on his three fixed rounds. As before 9 October.') },
      ],
    },
    // Marcel, 9 okt (werklijst vraag 144, 3): "Ziekte en brand als status is ook goed".
    {
      id: 'brand', naam: T.t('Fire'), standaard: 'aan',
      uitleg: T.t('Whether a fire really burns a house down, and whether there is a fire risk in a drought.'),
      keuzes: [
        { id: 'aan', naam: T.t('Yes'), zet: { 'BRAND_INSTELLINGEN.aan': true }, // geen tekst
          uitleg: T.t('The house burns; with the buckets it mostly survives, otherwise it burns down and the family rebuilds it. In a drought there is a fire risk, and fires are more frequent.') },
        { id: 'uit', naam: T.t('No'), zet: { 'BRAND_INSTELLINGEN.aan': false }, // geen tekst
          uitleg: T.t('Fire is only a question with a price, and there is no fire risk. As before 9 October.') },
      ],
    },
    {
      id: 'ouderWorden', naam: T.t('Growing old'), standaard: 'aan',
      uitleg: T.t('Whether people grow older, have children and die of old age.'),
      keuzes: [
        { id: 'aan', naam: T.t('Yes'), zet: { 'LEVEN_INSTELLINGEN.aan': true }, // geen tekst
          uitleg: T.t('A toddler becomes a child, a child grows up, and anyone old dies after a few years. A family sometimes has a child, if there is room in the house.') },
        { id: 'uit', naam: T.t('No'), zet: { 'LEVEN_INSTELLINGEN.aan': false }, // geen tekst
          uitleg: T.t('Everyone stays as old as when they came, and children only come with a new family. As before 9 October.') },
      ],
    },
    {
      id: 'kleren', naam: T.t('Clothes'), standaard: 'laken',
      uitleg: T.t('Those of higher standing wear dearer clothes: poor and worn in a hut, smart in a stone house. Looks only.'),
      keuzes: [
        { id: 'laken', naam: T.t('By standing, smart with cloth'), zet: { 'BEWONERS_INSTELLINGEN.klerenNaarStand': true, 'BEWONERS_INSTELLINGEN.lakenVoorDeftig': true }, // geen tekst
          uitleg: T.t('A stone house only goes about smartly once it gets its cloth: in the street you can see what is missing.') },
        { id: 'stand', naam: T.t('By standing'), zet: { 'BEWONERS_INSTELLINGEN.klerenNaarStand': true, 'BEWONERS_INSTELLINGEN.lakenVoorDeftig': false }, // geen tekst
          uitleg: T.t('Whoever lives in a stone house goes about smartly, with or without cloth.') },
        { id: 'uit', naam: T.t('Everyone plain'), zet: { 'BEWONERS_INSTELLINGEN.klerenNaarStand': false }, // geen tekst
          uitleg: T.t('Everyone in the clothes of a villager, as before 10 October.') },
      ],
    },
    {
      id: 'kleinLeven', naam: T.t('Small life'), standaard: 'aan',
      uitleg: T.t('Smoke from the chimneys, hens, a dog, children playing and washing on the line. Looks only.'),
      keuzes: [
        { id: 'aan', naam: T.t('Yes'), zet: { 'KLEIN_LEVEN_INSTELLINGEN.aan': true }, uitleg: T.t('The village lives: whoever is at home lights a fire, and all manner of creatures potter about.') }, // geen tekst
        { id: 'uit', naam: T.t('No'), zet: { 'KLEIN_LEVEN_INSTELLINGEN.aan': false }, uitleg: T.t('Without, as before 9 October.') }, // geen tekst
      ],
    },
    {
      id: 'koorts', naam: T.t('Fever'), standaard: 'aan',
      uitleg: T.t('Whether the fever goes round for a time, or is only a chance that someone dies.'),
      keuzes: [
        { id: 'aan', naam: T.t('Yes'), zet: { 'KOORTS_INSTELLINGEN.aan': true }, // geen tekst
          uitleg: T.t('Whoever is ill lies in bed for a week and sometimes infects another, more often in the cold and in a crowded village; now and then someone dies. What you do makes it spread less.') },
        { id: 'uit', naam: T.t('No'), zet: { 'KOORTS_INSTELLINGEN.aan': false }, // geen tekst
          uitleg: T.t('The event costs only what it costs, and nobody falls ill.') },
      ],
    },
    {
      id: 'kist', naam: T.t('The gold in the chest'), standaard: 'telt',
      uitleg: T.t('Whether the lord also wants a share of the gold in the village chest.'),
      keuzes: [
        { id: 'telt', naam: T.t('He wants a share'), zet: { 'HEER_INSTELLINGEN.kist': true }, // geen tekst
          uitleg: T.t('The lord sees only money. Of what is in the chest when he comes, he asks a share.') },
        { id: 'teltNiet', naam: T.t('The chest does not count'), zet: { 'HEER_INSTELLINGEN.kist': false }, // geen tekst
          uitleg: T.t('The lord asks about people, buildings and grain, not about what is in the chest.') },
      ],
    },
    // De doorkijk (Marcel, 26 sep, vraag 34: "Ja dit is een goede optie" en "Raster ook als keuze";
    // ontwerp/beeld.md, "Doorkijk"; js/doorkijk.js).
    {
      id: 'doorkijk', naam: T.t('Seeing through a house'), standaard: 'venster',
      uitleg: T.t('How you see someone standing behind a house or a tree.'),
      keuzes: [
        { id: 'venster', naam: T.t('Viewing window'), zet: { 'DOORKIJK_INSTELLINGEN.manier': 'venster' }, // geen tekst
          uitleg: T.t('The house stays, and around whoever stands behind it a soft round window opens, in which you see them and the ground behind the house.') },
        { id: 'raster', naam: T.t('Grid'), zet: { 'DOORKIJK_INSTELLINGEN.manier': 'raster' }, // geen tekst
          uitleg: T.t('The whole house opens on every other pixel, as in old games: you see the house and what is behind it mixed together.') },
      ],
    },
    // Tekenen met de videokaart (werklijst vraag 123; js/gl.js): sneller, vooral op een groot scherm. Zonder is het
    // 2D-doek van de browser, voor een browser zonder WebGL en om te vergelijken.
    {
      id: 'tekenen', naam: T.t('Drawing'), standaard: 'met',
      uitleg: T.t('How the game draws the picture. The same picture; with the graphics card it is faster.'),
      keuzes: [
        { id: 'met', naam: T.t('With the graphics card'), zet: { 'TEKENEN_INSTELLINGEN.videokaart': true }, // geen tekst
          uitleg: T.t('The picture goes to the graphics card (WebGL) in a few commands. Without a real graphics card, or if your browser cannot do it, the game draws without.') },
        { id: 'zonder', naam: T.t('Without'), zet: { 'TEKENEN_INSTELLINGEN.videokaart': false }, // geen tekst
          uitleg: T.t('The browser draws the picture itself, as before 4 October 2026.') },
      ],
    },
    {
      id: 'doorkijkPlein', naam: T.t('Who you see through a house'), standaard: 'ookHetPlein',
      uitleg: T.t('Always the reeve, whoever you are talking to, whoever you are looking for, whoever is fighting, and the lord, the merchant and the soldiers.'),
      keuzes: [
        // De standaard houdt zijn naam (Marcel, 10 okt: op een feest niet), zodat een browser die hem onthield, meegaat.
        { id: 'ookHetPlein', naam: T.t('The square too'), zet: { 'DOORKIJK_INSTELLINGEN.plein': true, 'DOORKIJK_INSTELLINGEN.pleinOpEenFeest': false }, // geen tekst
          uitleg: T.t('Everyone standing on the square as well, so that you can see the square, except at a feast: then the whole village is there, and a roof in front of it would be full of holes. Not through a tree, or the oaks would be full of holes as long as the children play.') },
        { id: 'ookOpEenFeest', naam: T.t('The square, even at a feast'), zet: { 'DOORKIJK_INSTELLINGEN.plein': true, 'DOORKIJK_INSTELLINGEN.pleinOpEenFeest': true }, // geen tekst
          uitleg: T.t('Everyone on the square, always, as before 10 October 2026: at a feast a roof in front of them gets a hole for each person.') },
        { id: 'wieErToeDoet', naam: T.t('Only those who matter'), zet: { 'DOORKIJK_INSTELLINGEN.plein': false }, // geen tekst
          uitleg: T.t('Whoever plays on the square disappears behind a house, as everywhere in the village.') },
      ],
    },
    // De schaduwen van de zon (Marcel, 4 okt, werklijst vraag 125, B: "B graag", en "A ja, B goed zo"; js/tekenen.js,
    // js/gl.js).
    {
      id: 'schaduwen', naam: T.t('Shadows'), standaard: 'zon',
      uitleg: T.t('Whether whatever stands casts a shadow over the ground that moves with the sun. Only with the graphics card.'),
      keuzes: [
        { id: 'zon', naam: T.t('With the sun'), zet: { 'LICHT_INSTELLINGEN.zonneschaduw': true }, // geen tekst
          uitleg: T.t('Whatever stands casts its silhouette over the ground: long towards the upper right in the morning, short towards the lower right at noon, long towards the lower left in the evening.') },
        { id: 'uit', naam: T.t('Without'), zet: { 'LICHT_INSTELLINGEN.zonneschaduw': false }, // geen tekst
          uitleg: T.t('Only the small shadow under the feet of whoever walks, as before 4 October 2026.') },
      ],
    },
    // De hoogte van het land (Marcel, 7 okt, werklijst vraag 121: "ik doel ook meer op heuvels in het landschap"; js/hoogte.js).
    // Vlak tot de speeltest van stap 3 laat zien dat het spel er net zo goed mee loopt.
    {
      id: 'hoogte', naam: T.t('Height'), standaard: 'vlak',
      uitleg: T.t('Whether a new land has hills. Only for a land from the maker; the designed hamlet stays flat.'),
      keuzes: [
        { id: 'vlak', naam: T.t('Flat'), zet: { 'HOOGTE_INSTELLINGEN.aan': false }, // geen tekst
          uitleg: T.t('The land is flat, as before 7 October 2026.') },
        { id: 'heuvels', naam: T.t('Hills'), zet: { 'HOOGTE_INSTELLINGEN.aan': true }, // geen tekst
          uitleg: T.t('High hills in the wild land, a gentle swell around the village, and a ridge with a rock face by the rocks. Nobody walks through a rock face, nobody builds on steep ground, and a hill blocks the view and hides what is behind it.') },
      ],
    },
    // Twee bazen (werklijst vraag 106; Marcel, 3 okt: "106 a b c d ja"; js/bazen.js): de heer en het dorp kunnen je
    // allebei wegsturen. Uit is het spel van vóór 3 okt.
    {
      id: 'tweeBazen', naam: T.t('Two masters'), standaard: 'aan',
      uitleg: T.t('Whether the lord and the village can both send you away.'),
      keuzes: [
        { id: 'aan', naam: T.t('The lord and the village'), zet: { 'BAZEN_INSTELLINGEN.aan': true }, // geen tekst
          uitleg: T.t("The lord's favour and the village's trust are in the bar. Below 20 comes a warning, at 0 you are gone: dismissed, or driven out.") },
        { id: 'uit', naam: T.t('Only the lord'), zet: { 'BAZEN_INSTELLINGEN.aan': false }, // geen tekst
          uitleg: T.t('As before 3 October: the lord dismisses you only if you gave him far too little two years in a row, and the village does not send you away.') },
      ],
    },
    // De paadjes (werklijst vraag 108, b; js/paden.js): van elke deur een paadje naar de weg, en waar veel gelopen wordt,
    // slijt het gras (Marcel, 25 sep: "paden ontstaan vanzelf", en 3 okt: "108 a tab, b c d e ja").
    {
      id: 'paadjes', naam: T.t('Footpaths'), standaard: 'lopen',
      uitleg: T.t('Where the footpaths in the village come from.'),
      keuzes: [
        { id: 'lopen', naam: T.t('Where people walk'), zet: { 'PADEN_INSTELLINGEN.paadjes': 'lopen' }, // geen tekst
          uitleg: T.t('A path runs from every door to the road, and where many people walk, the grass wears into a path. Where nobody walks any more, it grows over again.') },
        { id: 'deuren', naam: T.t('Only from the doors'), zet: { 'PADEN_INSTELLINGEN.paadjes': 'deuren' }, // geen tekst
          uitleg: T.t('A path runs from every door to the road; elsewhere the grass stays.') },
        { id: 'uit', naam: T.t('None'), zet: { 'PADEN_INSTELLINGEN.paadjes': 'uit' }, // geen tekst
          uitleg: T.t('Only the road from the map, as before 3 October.') },
      ],
    },
    // De bomen in het jaar (werklijst vraag 148, stap 2; Marcel, 9 okt: "Ja vegetatie en bomen met seizoenen mee. Ook
    // vruchten etc."; js/bos.js).
    {
      id: 'bomenInHetJaar', naam: T.t('Trees through the year'), standaard: 'mee',
      uitleg: T.t('Whether the trees and the greenery beneath them follow the seasons.'),
      keuzes: [
        { id: 'mee', naam: T.t('With the seasons'), zet: { 'BOS_INSTELLINGEN.seizoenen': true }, // geen tekst
          uitleg: T.t('In spring young leaves and blossom, in summer full, in autumn yellow, orange and red with leaves on the ground, and in winter bare. If there is snow, it lies on the branches and the pines too. The apples are ripe in autumn. The greenery beneath likewise: the ferns turn rust-brown, the grass straw-yellow, the heather flowers purple in summer, and the brambles are ripe in late summer.') },
        { id: 'zomer', naam: T.t('Always summer'), zet: { 'BOS_INSTELLINGEN.seizoenen': false }, // geen tekst
          uitleg: T.t('The trees and the greenery beneath them stay in their summer green all year, as before 10 October.') },
      ],
    },
    // Een praatje (werklijst vraag 120; Marcel, 4 okt: "Het dorp moet echt levendig en realistisch aanvoelen", en "geen
    // praatjes forceren. Alleen als mensen een reden hebben en elkaar toevallig tegenkomen"; js/praatje.js).
    {
      id: 'praatjes', naam: T.t('Chats'), standaard: 'aan',
      uitleg: T.t('Whether somebody with a free moment stops for a chat.'),
      keuzes: [
        { id: 'aan', naam: T.t('On'), zet: { 'PRAATJE_INSTELLINGEN.aan': true }, // geen tekst
          uitleg: T.t('Whoever is free and happens to meet a neighbour or someone from work sometimes stops for a chat of a quarter of an hour to an hour, and whoever passes by joins in. A little cloud shows above whoever is talking.') },
        { id: 'uit', naam: T.t('Off'), zet: { 'PRAATJE_INSTELLINGEN.aan': false }, // geen tekst
          uitleg: T.t('Everyone goes their own way, without stopping. As before 4 October.') },
      ],
    },
    // De beesten in het bos (werklijst vraag 116; Marcel, 4 okt: "Ik wil dat er beesten kunnen rondlopen in het bos",
    // en "doden mag"; 7 okt: "a ja, b ja, c ja", en "i ja": aan, zonder doden of uit; js/beesten.js).
    {
      id: 'beesten', naam: T.t('Animals'), standaard: 'aan',
      uitleg: T.t('Whether wolves and deer live in the forest, and what the wolves do when they are hungry.'),
      keuzes: [
        { id: 'aan', naam: T.t('On'), zet: { 'BEESTEN_INSTELLINGEN.aan': true, 'BEESTEN_INSTELLINGEN.doden': true }, // geen tekst
          uitleg: T.t('Packs of wolves rest by their den by day and walk along the forest edge at night, where you see their eyes light up; deer graze at the edge at dusk. In winter the wolves hunt the deer, and once those are gone they come to the village hungry: they take a sheep, and they can attack whoever walks alone in the dark. Now and then the victim dies.') },
        { id: 'zonderDoden', naam: T.t('Without deaths'), zet: { 'BEESTEN_INSTELLINGEN.aan': true, 'BEESTEN_INSTELLINGEN.doden': false }, // geen tekst
          uitleg: T.t('As on, but whoever the wolves attack is wounded and lies in bed for a few days; nobody dies.') },
        { id: 'uit', naam: T.t('Off'), zet: { 'BEESTEN_INSTELLINGEN.aan': false }, // geen tekst
          uitleg: T.t('The forest is empty. As before 7 October.') },
      ],
    },
    // Een gezin wacht op de winter (werklijst vraag 59, B; Marcel, 1 okt, vraag 78: "D dat is prima"; js/gebouwen.js,
    // T.waaromGeenGezin). Altijd is het spel van vóór 1 okt.
    {
      id: 'groei', naam: T.t('Growth'), standaard: 'wacht',
      uitleg: T.t('Whether a family comes if the village does not get through the winter.'),
      keuzes: [
        { id: 'wacht', naam: T.t('A family waits for winter'), zet: { 'GEBOUWEN_INSTELLINGEN.gezinWachtOpDeWinter': true }, // geen tekst
          uitleg: T.t('If the logs or the food will not last the winter, no family comes from 1 September until there is enough, or the winter is over. The village and the advice say so.') },
        { id: 'altijd', naam: T.t('Always'), zet: { 'GEBOUWEN_INSTELLINGEN.gezinWachtOpDeWinter': false }, // geen tekst
          uitleg: T.t('A family comes as long as there is grain, room and contentment, even if the winter will not last. Anything gained then is lost again in winter.') },
      ],
    },
    // Het zaaigraan (werklijst vraag 81; Marcel, 1 okt: "zaaigraan wordt bij nood opgegeten, anders sterven er mensen";
    // js/akkers.js, T.zaaigraanApart). Als ander graan is het spel van vóór 1 okt.
    {
      id: 'zaaigraan', naam: T.t('Seed grain'), standaard: 'bewaken',
      uitleg: T.t('When the village eats the seed grain for next year.'),
      keuzes: [
        { id: 'bewaken', naam: T.t('Guard it'), zet: { 'VELDEN_INSTELLINGEN.zaaigraanApart': true, 'GRAANSCHUUR_INSTELLINGEN.bewaken': true }, // geen tekst
          uitleg: T.t('From the harvest to the sowing the seed grain lies in the granary. If hunger is coming, a farmer asks you what is to happen: if you put men on guard, one per twenty people, it stays, but every hungry day costs trust. Without a granary the village eats it in need (question 132, 8 October).') },
        { id: 'nood', naam: T.t('Only in need'), zet: { 'VELDEN_INSTELLINGEN.zaaigraanApart': true, 'GRAANSCHUUR_INSTELLINGEN.bewaken': false }, // geen tekst
          uitleg: T.t('From the harvest to the sowing the farmers keep the seed grain back. The village eats it only when there is nothing else, and the winter counts the food without it.') },
        { id: 'gewoon', naam: T.t('Like other grain'), zet: { 'VELDEN_INSTELLINGEN.zaaigraanApart': false, 'GRAANSCHUUR_INSTELLINGEN.bewaken': false }, // geen tekst
          uitleg: T.t('The village eats the seed grain like any other grain. Whoever eats everything in winter has nothing to sow in spring.') },
      ],
    },
    // De wensen per stand (werklijst vraag 80 en 85; Marcel, 1 okt; js/wensen.js). Het dorp als geheel is het spel van
    // vóór 1 okt.
    {
      id: 'wensen', naam: T.t('Wants'), standaard: 'huis',
      uitleg: T.t("Where the village's contentment comes from."),
      keuzes: [
        { id: 'huis', naam: T.t('Per house'), zet: { 'WENSEN_INSTELLINGEN.perHuis': true }, // geen tekst
          uitleg: T.t('Each house wants what its standing wants: cottars in a hut want food, firewood and a well; villagers in a house also ale, meat or fish, a chapel and the inn; craftsmen in a stone house also bread, cloth and a market. The highest standing takes first. The village is the average.') },
        { id: 'dorp', naam: T.t('The village as a whole'), zet: { 'WENSEN_INSTELLINGEN.perHuis': false }, // geen tekst
          uitleg: T.t('One number for the whole village: food, with vegetables, fish or meat on top, firewood in winter, and a chapel. If the village is content enough for a month, all the houses grow into the next kind, without building materials.') },
      ],
    },
    // De herberg en de markt (werklijst vraag 96, a; Marcel, 3 okt: "1 markt 1 herberg voor nu"; js/wensen.js). Alleen met
    // de wensen per huis.
    {
      id: 'herbergEnMarkt', naam: T.t('The inn and the market'), standaard: 'heelDorp',
      uitleg: T.t('Whether one inn and one market are enough for the whole village, or a house wants them nearby.'),
      keuzes: [
        { id: 'heelDorp', naam: T.t('One for the whole village'), zet: { 'WENSEN_INSTELLINGEN.kring.herberg': null, 'WENSEN_INSTELLINGEN.kring.markt': null }, // geen tekst
          uitleg: T.t('If the village has an inn and a market, every house that wants them has them, wherever it stands.') },
        { id: 'kring', naam: T.t('Within a range'), zet: { 'WENSEN_INSTELLINGEN.kring.herberg': 30, 'WENSEN_INSTELLINGEN.kring.markt': 30 }, // geen tekst
          uitleg: T.t('A house wants the inn and a market within 30 tiles, like a well and a chapel within their range. A growing village then needs more of them, and there is not always room for that.') },
      ],
    },
    // Achteruitgaan (werklijst vraag 85, c; Marcel, 1 okt: "c zacht"; js/behoeften.js). Alleen met de wensen per huis.
    {
      id: 'achteruit', naam: T.t('Decline'), standaard: 'zacht',
      uitleg: T.t('What happens when a house lacks something its standing wants.'),
      keuzes: [
        { id: 'zacht', naam: T.t('Gentle'), zet: { 'WENSEN_INSTELLINGEN.achteruit': 'zacht' }, // geen tekst
          uitleg: T.t('As in Anno 1602: a house that lacks something stops growing and is less content. A family only leaves when the house falls below the leaving threshold, and that happens only when it lacks food or firewood.') },
        { id: 'streng', naam: T.t('Strict'), zet: { 'WENSEN_INSTELLINGEN.achteruit': 'streng' }, // geen tekst
          uitleg: T.t('If a house lacks something for a month, its family leaves, at most one house a day. A house that has just grown wants more at once: make sure it is there.') },
      ],
    },
    // De raad onder het doel (Marcel, 29 sep, werklijst vraag 58: "B onder het doel"; js/raad.js).
    {
      id: 'raad', naam: T.t('Advice'), standaard: 'aan',
      uitleg: T.t('A line under the goal at the top left.'),
      keuzes: [
        { id: 'aan', naam: T.t('On'), zet: { 'RAAD_INSTELLINGEN.aan': true }, // geen tekst
          uitleg: T.t('Under the goal is what now stands between you and a village: why no family is coming, or when the next one will, the logs for winter, what you lack for the chapel and the smithy and where it comes from, the robbers. With the key to press beside it.') },
        { id: 'uit', naam: T.t('Off'), zet: { 'RAAD_INSTELLINGEN.aan': false }, // geen tekst
          uitleg: T.t('Only the goal. What the village tells you, you see in the messages.') },
      ],
    },
    // De heervaart (Marcel, 29 sep, werklijst vraag 60: "A ja B ja"; js/heervaart.js).
    {
      id: 'heervaart', naam: T.t('The levy'), standaard: 'aan',
      uitleg: T.t('Whether the lord asks for men for his war, once the hamlet is a village.'),
      keuzes: [
        { id: 'aan', naam: T.t('On'), zet: { 'HEERVAART_INSTELLINGEN.aan': true }, // geen tekst
          uitleg: T.t('On 1 July he asks for one man per ten souls, or gold. Those who go are back after the harvest, as veterans who fight with you against the robbers; not everyone comes back. Whoever pays makes him suspicious.') },
        { id: 'uit', naam: T.t('Off'), zet: { 'HEERVAART_INSTELLINGEN.aan': false }, // geen tekst
          uitleg: T.t('He asks only for gold and grain, at Martinmas.') },
      ],
    },
    // De voorvallen (Marcel, 29 sep, werklijst vraag 65: "A ja"; js/voorvallen.js).
    {
      id: 'voorvallen', naam: T.t('Events'), standaard: 'gewoon',
      uitleg: T.t('How often somebody from the village comes looking for you with a question, a quarrel or a disaster.'),
      keuzes: [
        { id: 'vaak', naam: T.t('Often'), zet: { 'VOORVALLEN_INSTELLINGEN.aan': true, 'VOORVALLEN_INSTELLINGEN.dagenTussen': 6, 'VOORVALLEN_INSTELLINGEN.dagenTussenWinter': 4 }, // geen tekst
          uitleg: T.t('About every six days, in winter every four.') },
        { id: 'gewoon', naam: T.t('Normal'), zet: { 'VOORVALLEN_INSTELLINGEN.aan': true, 'VOORVALLEN_INSTELLINGEN.dagenTussen': 10, 'VOORVALLEN_INSTELLINGEN.dagenTussenWinter': 6 }, // geen tekst
          uitleg: T.t('About every ten days, in winter every six. Every answer says in advance what it costs.') },
        { id: 'zelden', naam: T.t('Rarely'), zet: { 'VOORVALLEN_INSTELLINGEN.aan': true, 'VOORVALLEN_INSTELLINGEN.dagenTussen': 20, 'VOORVALLEN_INSTELLINGEN.dagenTussenWinter': 12 }, // geen tekst
          uitleg: T.t('About every twenty days, in winter every twelve.') },
        { id: 'uit', naam: T.t('Off'), zet: { 'VOORVALLEN_INSTELLINGEN.aan': false }, // geen tekst
          uitleg: T.t('Nobody comes looking for you. The village goes its own way.') },
      ],
    },
    // De feesten (Marcel, 3 okt, werklijst vraag 97: het oogstfeest "Ja, een hele dag vrij", en "De meiboom"; js/feesten.js).
    {
      id: 'feesten', naam: T.t('Feasts'), standaard: 'vieren',
      uitleg: T.t('What happens when you say yes to a feast, such as the harvest feast or the maypole.'),
      keuzes: [
        { id: 'vieren', naam: T.t('The village celebrates'), zet: { 'FEESTEN_INSTELLINGEN.vieren': true }, // geen tekst
          uitleg: T.t("The whole village is on the square, with light and ale. After a big feast nobody works the next day: that costs a day's work.") },
        { id: 'stemming', naam: T.t('Mood only'), zet: { 'FEESTEN_INSTELLINGEN.vieren': false }, // geen tekst
          uitleg: T.t('A feast costs what the answer says and makes the village happy, but you see nothing of it. As before 3 October.') },
      ],
    },
    // De raadsman (Marcel, 30 sep, werklijst vraag 66: "c Nee, wordt automatisch als de schout er niet is"; en vraag 68:
    // "Ja B inderdaad", alleen als je echt weg bent; js/raadsman.js).
    {
      id: 'raadsman', naam: T.t('Advisor'), standaard: 'aan',
      uitleg: T.t('When your advisor decides an event.'),
      keuzes: [
        { id: 'aan', naam: T.t('When you are away'), zet: { 'RAADSMAN_INSTELLINGEN.aan': true, 'RAADSMAN_INSTELLINGEN.nietGesproken': false }, // geen tekst
          uitleg: T.t('If you are not in the village when somebody comes looking for you with an event, your advisor decides, according to his character and what he can do. If you are there but do not speak to whoever is looking for you, it passes. Whoever is the advisor reaps more slowly.') },
        { id: 'ook', naam: T.t('Even when you do not speak'), zet: { 'RAADSMAN_INSTELLINGEN.aan': true, 'RAADSMAN_INSTELLINGEN.nietGesproken': true }, // geen tekst
          uitleg: T.t('He also decides when you are in the village but do not speak in time to whoever is looking for you; anyone you send away, you leave to him.') },
        { id: 'uit', naam: T.t('Off'), zet: { 'RAADSMAN_INSTELLINGEN.aan': false, 'RAADSMAN_INSTELLINGEN.nietGesproken': false }, // geen tekst
          uitleg: T.t('What you miss passes, and the village holds it against you.') },
      ],
    },
    // Het rapport van de raadsman, 's ochtends (werklijst vraag 75, 3a; Marcel, 1 okt: "A Ja dat is goed";
    // js/ochtendrapport.js). Uit is het spel van vóór 1 okt.
    {
      id: 'rapport', naam: T.t('The morning report'), standaard: 'aan',
      uitleg: T.t('Whether your advisor brings you a report every morning.'),
      keuzes: [
        { id: 'aan', naam: T.t('On'), zet: { 'OCHTENDRAPPORT_INSTELLINGEN.aan': true }, // geen tekst
          uitleg: T.t('If you have an advisor, he is at your door in the morning with what happened, how the grain and the logs are doing, whether they will last the winter, what is going on and what is coming. How accurate his numbers are depends on how good he is with figures. If you were not there, it waits under the Morning report button.') },
        { id: 'uit', naam: T.t('Off'), zet: { 'OCHTENDRAPPORT_INSTELLINGEN.aan': false }, // geen tekst
          uitleg: T.t('No report: what happened, you see in the messages, and you make your own rounds.') },
      ],
    },
    // Het land (werklijst vraag 63 en 69; js/land.js): tot het buurdorp er is, staat het uit, en speelt de proef zoals
    // nu. Dan wordt het een keuze bij Nieuw spel: 0 of 1 tegenspeler.
    {
      id: 'land', naam: T.t('Land'), standaard: 'uit',
      uitleg: T.t('Whether you can leave your hamlet along the road, into the land.'),
      keuzes: [
        { id: 'uit', naam: T.t('Off'), zet: { 'LAND_INSTELLINGEN.aan': false }, // geen tekst
          uitleg: T.t('Your hamlet is the whole world, as in the try-out.') },
        { id: 'aan', naam: T.t('On'), zet: { 'LAND_INSTELLINGEN.aan': true }, // geen tekst
          uitleg: T.t('Walk out of your hamlet along the road and the map of the land opens: provinces where you travel for days, and what you have not seen is dark. At home everything goes on without you; you hear what happened when you are back. The next village is still to come.') },
      ],
    },
  ];

  // De namen die je zelf geeft (js/mensen.js). De heer heeft standaard geen naam: dan heet hij
  // "de heer", en tekent hij zijn brief zonder naam.
  T.NAAM_OPTIES = ['heer'];

  // De werkbank: alle getallen uit deze blokken (T.<blok>), en een paar losse getallen in T.
  T.WERKBANK = [
    {
      naam: T.t('Grain and time'),
      losse: {
        GRAAN_PER_TEGEL: T.t('grain per arable tile'),
        ZAAIGRAAN_PER_TEGEL: T.t('seed grain per arable tile'),
        DAG_LENGTE: T.t('seconds per day, at 1×'),
        OOGST_UREN_PER_TEGEL: T.t('hours of reaping per arable tile'),
      },
    },
    { naam: T.t('The day'), blok: 'DAG_INSTELLINGEN' }, // geen tekst
    { naam: T.t('The weather'), blok: 'WEER_INSTELLINGEN' }, // geen tekst
    { naam: T.t('The messenger'), blok: 'BODE_INSTELLINGEN' }, // geen tekst
    { naam: T.t('Fire'), blok: 'BRAND_INSTELLINGEN' }, // geen tekst
    { naam: T.t('Fever'), blok: 'KOORTS_INSTELLINGEN' }, // geen tekst
    { naam: T.t('Growing old'), blok: 'LEVEN_INSTELLINGEN' }, // geen tekst
    { naam: T.t('Small life'), blok: 'KLEIN_LEVEN_INSTELLINGEN' }, // geen tekst
    { naam: T.t('The light'), blok: 'LICHT_INSTELLINGEN' }, // geen tekst
    { naam: T.t('Buildings and population'), blok: 'GEBOUWEN_INSTELLINGEN' }, // geen tekst
    { naam: T.t('The residents'), blok: 'BEWONERS_INSTELLINGEN' }, // geen tekst
    { naam: T.t('The island map'), blok: 'WERELD_INSTELLINGEN' }, // geen tekst
    { naam: T.t('The fog'), blok: 'MIST_INSTELLINGEN' }, // geen tekst
    { naam: T.t('Walking'), blok: 'LOPEN_INSTELLINGEN' }, // geen tekst
    { naam: T.t('Footpaths'), blok: 'PADEN_INSTELLINGEN' }, // geen tekst
    { naam: T.t('Chats'), blok: 'PRAATJE_INSTELLINGEN' }, // geen tekst
    { naam: T.t('Village stages'), blok: 'TREDEN_INSTELLINGEN' }, // geen tekst
    { naam: T.t('The laws'), blok: 'WETTEN_INSTELLINGEN' }, // geen tekst
    { naam: T.t('The robbers'), blok: 'ROVERS_INSTELLINGEN' }, // geen tekst
    { naam: T.t('Soldiers'), blok: 'SOLDATEN_INSTELLINGEN' }, // geen tekst
    { naam: T.t('Advice'), blok: 'RAAD_INSTELLINGEN' }, // geen tekst
    { naam: T.t('The inn'), blok: 'HERBERG_INSTELLINGEN' }, // geen tekst
    { naam: T.t('Needs and the winter'), blok: 'BEHOEFTEN_INSTELLINGEN' }, // geen tekst
    { naam: T.t('Wants'), blok: 'WENSEN_INSTELLINGEN' }, // geen tekst
    { naam: T.t('The merchant'), blok: 'HANDEL_INSTELLINGEN' }, // geen tekst
    { naam: T.t('The lord'), blok: 'HEER_INSTELLINGEN' }, // geen tekst
    { naam: T.t('The levy'), blok: 'HEERVAART_INSTELLINGEN' }, // geen tekst
    { naam: T.t('Events'), blok: 'VOORVALLEN_INSTELLINGEN' }, // geen tekst
    { naam: T.t('Feasts'), blok: 'FEESTEN_INSTELLINGEN' }, // geen tekst
    { naam: T.t('The market'), blok: 'MARKT_INSTELLINGEN' }, // geen tekst
    { naam: T.t('The ending'), blok: 'EINDE_INSTELLINGEN' }, // geen tekst
    { naam: T.t('The two masters'), blok: 'BAZEN_INSTELLINGEN' }, // geen tekst
    { naam: T.t("The lord's whims"), blok: 'GRILLEN_INSTELLINGEN' }, // geen tekst
    { naam: T.t('The advisor'), blok: 'RAADSMAN_INSTELLINGEN' }, // geen tekst
    { naam: T.t('The morning report'), blok: 'OCHTENDRAPPORT_INSTELLINGEN' }, // geen tekst
    { naam: T.t('The land'), blok: 'LAND_INSTELLINGEN' }, // geen tekst
    { naam: T.t('The maker'), blok: 'MAKER_INSTELLINGEN' }, // geen tekst
    { naam: T.t('The empty start'), blok: 'BEGIN_INSTELLINGEN' }, // geen tekst
    { naam: T.t('Helping build'), blok: 'BOUWEN_INSTELLINGEN' }, // geen tekst
    { naam: T.t('The ox cart'), blok: 'KAR_INSTELLINGEN' }, // geen tekst
    { naam: T.t('Roads'), blok: 'WEGEN_INSTELLINGEN' }, // geen tekst
    { naam: T.t('Farmers from nothing'), blok: 'BOERDERIJ_INSTELLINGEN' }, // geen tekst
    { naam: T.t('The fields'), blok: 'VELDEN_INSTELLINGEN' }, // geen tekst
    { naam: T.t('Fieldwork'), blok: 'VELDWERK_INSTELLINGEN' }, // geen tekst
    { naam: T.t('Animals in the forest'), blok: 'BEESTEN_INSTELLINGEN' }, // geen tekst
    { naam: T.t('The granary and the seed grain'), blok: 'GRAANSCHUUR_INSTELLINGEN' }, // geen tekst
    { naam: T.t('The forest'), blok: 'BOS_INSTELLINGEN' }, // geen tekst
    { naam: T.t('The livestock'), blok: 'VEE_INSTELLINGEN' }, // geen tekst
    { naam: T.t('Seeing through houses'), blok: 'DOORKIJK_INSTELLINGEN' }, // geen tekst
    { naam: T.t('Light in the village'), blok: 'ZIEN_INSTELLINGEN' }, // geen tekst
  ];

  // ---------------------------------------------------------------------------------------------
  // Paden in T, en de standaard: de waarden zoals de bestanden ze zetten
  // ---------------------------------------------------------------------------------------------

  const kloon = (w) => (w === undefined ? undefined : JSON.parse(JSON.stringify(w)));
  const delen = (pad) => pad.split('.');

  T.leesPad = function (pad) {
    let o = T;
    for (const d of delen(pad)) {
      if (o == null) return undefined;
      o = o[d];
    }
    return o;
  };

  T.zetPad = function (pad, waarde) {
    const d = delen(pad);
    let o = T;
    for (let i = 0; i < d.length - 1; i++) {
      if (o[d[i]] == null) return false;
      o = o[d[i]];
    }
    o[d[d.length - 1]] = waarde;
    return true;
  };

  let standaard = null;
  function neemStandaard() {
    standaard = { blokken: {}, losse: {}, namen: {} };
    for (const deel of T.WERKBANK) {
      if (deel.blok) standaard.blokken[deel.blok] = kloon(T[deel.blok]);
      for (const k of Object.keys(deel.losse || {})) standaard.losse[k] = T[k];
    }
    for (const id of T.NAAM_OPTIES) standaard.namen[id] = T.MENSEN && T.MENSEN[id] ? T.MENSEN[id].naam : id;
  }

  // Wat nu is ingesteld, voor zover het van de standaard afwijkt.
  T.OPTIES_NU = { keuzes: {}, namen: {}, getallen: {} };

  T.optieKeuze = function (id) {
    const o = T.OPTIES.find((x) => x.id === id);
    return (T.OPTIES_NU.keuzes && T.OPTIES_NU.keuzes[id]) || (o && o.standaard);
  };

  // Een mens een naam geven, overal waar die naam staat: zijn regel in T.MENSEN, zijn gesprek, en
  // zijn poppetje als het er al staat.
  T.zetNaamVanMens = function (id, naam, S) {
    if (!T.MENSEN || !T.MENSEN[id]) return;
    T.MENSEN[id].naam = naam;
    if (T.GESPREKKEN && T.GESPREKKEN[id]) T.GESPREKKEN[id].naam = naam;
    const w = S && S.wereld;
    if (w) for (const e of w.wezens || []) if (e.wie === id) e.naam = naam;
  };

  // De naam die in het bestand staat (js/mensen.js), zonder wat je zelf invulde.
  T.standaardNaam = (id) => (standaard ? standaard.namen[id] : T.naamVanMens(id));

  // De naam van de heer, als je hem een naam gaf; anders null.
  T.naamVanDeHeer = function () {
    const naam = T.MENSEN && T.MENSEN.heer && T.MENSEN.heer.naam;
    return naam && standaard && naam !== standaard.namen.heer ? naam : null;
  };

  // Alles toepassen: terug naar de bestanden, dan de keuzes, dan de werkbank, dan de namen.
  // `instelling` is { keuzes, namen, getallen } (wat van de standaard afwijkt); S is optioneel,
  // alleen om de namen van poppetjes die er al staan bij te werken.
  T.pasOptiesToe = function (instelling, S) {
    if (!standaard) neemStandaard();
    const i = instelling || {};
    const nu = { keuzes: {}, namen: {}, getallen: {} };
    for (const blok in standaard.blokken) T[blok] = kloon(standaard.blokken[blok]);
    for (const k in standaard.losse) T[k] = standaard.losse[k];
    for (const o of T.OPTIES) {
      const gekozen = (i.keuzes && i.keuzes[o.id]) || o.standaard;
      const keuze = o.keuzes.find((k) => k.id === gekozen) || o.keuzes.find((k) => k.id === o.standaard);
      for (const pad in keuze.zet) T.zetPad(pad, kloon(keuze.zet[pad]));
      if (keuze.id !== o.standaard) nu.keuzes[o.id] = keuze.id;
    }
    for (const pad in i.getallen || {}) {
      const w = Number(i.getallen[pad]);
      if (typeof T.leesPad(pad) === 'number' && Number.isFinite(w)) {
        T.zetPad(pad, w);
        nu.getallen[pad] = w;
      }
    }
    for (const id of T.NAAM_OPTIES) {
      const eigen = ((i.namen && i.namen[id]) || '').trim();
      T.zetNaamVanMens(id, eigen || standaard.namen[id], S);
      if (eigen && eigen !== standaard.namen[id]) nu.namen[id] = eigen;
    }
    T.OPTIES_NU = nu;
    return nu;
  };

  // Eén ding veranderen, alles opnieuw toepassen, en onthouden.
  function verander(fn, S) {
    const i = kloon(T.OPTIES_NU);
    fn(i);
    T.pasOptiesToe(i, S);
    T.bewaarOpties();
  }
  T.zetOptie = (id, keuzeId, S) => verander((i) => { i.keuzes[id] = keuzeId; }, S);
  T.zetGetal = (pad, waarde, S) => verander((i) => {
    if (waarde == null || waarde === '') delete i.getallen[pad];
    else i.getallen[pad] = Number(waarde);
  }, S);
  T.zetNaam = (id, naam, S) => verander((i) => { i.namen[id] = naam; }, S);
  T.optiesTerug = (S) => verander((i) => {
    i.keuzes = {};
    i.namen = {};
    i.getallen = {};
  }, S);

  // ---------------------------------------------------------------------------------------------
  // De werkbank: alle getallen, met een leesbare naam en een bereik voor de schuif
  // ---------------------------------------------------------------------------------------------

  // Elk getal heet naar de sleutels van zijn pad ("pachtPerAkkertegel", "rovers" · "perRover"): hier staat wat een sleutel in
  // het Engels is, één keer voor alle blokken, want dezelfde sleutel bedoelt overal hetzelfde. Bedoelt hij in één blok iets
  // anders, dan staat hij bij NAAM_VAN_PAD, met het hele pad. Een sleutel die hier niet staat, toont zich in woorden
  // (inWoorden, in het Nederlands van de code): test/opties.test.cjs laat dat niet toe.
  const NAAM_VAN_SLEUTEL = {
    // Graan en tijd, de dag, het weer
    daglichtGemiddeld: T.t('average daylight'),
    daglichtSchommeling: T.t('daylight variation'),
    langsteDag: T.t('longest day'),
    opstaanVroegst: T.t('earliest rising'),
    opstaanLaatst: T.t('latest rising'),
    ochtendUren: T.t('morning hours'),
    schaftBegin: T.t('break begins'),
    schaftEind: T.t('break ends'),
    werkTotLaatst: T.t('work until at latest'),
    slapenNaZonOnder: T.t('bedtime after sunset'),
    slapenVroegst: T.t('earliest bedtime'),
    slapenLaatst: T.t('latest bedtime'),
    erfStraal: T.t('plot radius'),
    bezoekUur: T.t('visiting hour'),
    nachtDonker: T.t('night darkness'),
    schemerUren: T.t('twilight hours'),
    lichtStraal: T.t('light radius'),
    lichtKleuren: T.t('light colours'),
    nacht: T.t('night'),
    dageraad: T.t('dawn'),
    dag: T.t('day'),
    avondrood: T.t('sunset glow'),
    r: T.t('red'),
    g: T.t('green'),
    b: T.t('blue'),
    kleurUren: T.t('colour hours'),
    zonHoogte: T.t('sun height'),
    schaduwLangst: T.t('longest shadow'),
    zonLaag: T.t('low sun'),
    slaapAfstand: T.t('sleeping distance'),
    regenKans: T.t('chance of rain'),
    lente: T.t('spring'),
    zomer: T.t('summer'),
    herfst: T.t('autumn'),
    winter: T.t('winter'),
    blijftNat: T.t('stays wet'),
    jaarVan: T.t('year factor from'),
    jaarTot: T.t('year factor to'),
    wolkenKans: T.t('chance of clouds'),
    regenMaaktGoed: T.t('rain makes up the deficit'),
    droogteVanaf: T.t('drought from'),
    ernstigVanaf: T.t('severe drought from'),
    verliesPerDag: T.t('loss per day'),
    droogte: T.t('drought'),
    ernstig: T.t('severe drought'),
    verliesHooguit: T.t('loss at most'),
    sneeuwLaag: T.t('snow cover'),
    erbij: T.t('added'),
    smeltWinter: T.t('melts in winter'),
    smelt: T.t('melts'),
    dakSneeuw: T.t('roof snow'),
    meerBreed: T.t('lake width'),
    beeld: T.t('visuals'),
    tint: T.t('tint'),
    zon: T.t('sun'),
    wolken: T.t('clouds'),
    regen: T.t('rain'),
    sneeuw: T.t('snow'),
    waas: T.t('haze'),
    druppels: T.t('drops'),
    vlokken: T.t('flakes'),
    hooguit: T.t('at most'),
    druppelLengte: T.t('drop length'),
    valRegen: T.t('rain fall speed'),
    valSneeuw: T.t('snow fall speed'),
    wind: T.t('wind'),
    windSneeuw: T.t('snow wind'),
    // De bode
    loon: T.t('wage'),
    dagen: T.t('days'),
    gewoon: T.t('normal'),
    blijftDagen: T.t('days he stays'),
    prijsMaal: T.t('price multiplier'),
    nietBijZich: T.t('chance he lacks it'),
    halfBijZich: T.t('chance he has only half'),
    rovers: T.t('robbers'),
    basis: T.t('base'),
    perRover: T.t('per robber'),
    donker: T.t('dark'),
    aanvallers: T.t('attackers'),
    hinderlaag: T.t('ambush'),
    afstand: T.t('distance'),
    uren: T.t('hours'),
    heer: T.t('lord'),
    gunst: T.t('favour'),
    meeHooguit: T.t('men along at most'),
    kracht: T.t('strength'),
    bode: T.t('messenger'),
    man: T.t('man'),
    veteraan: T.t('veteran'),
    wapens: T.t('weapons'),
    // de soldaten (js/soldaten.js)
    plaatsen: T.t('places'),
    kosten: T.t('action points'),
    bereik: T.t('reach in tiles'),
    bescherming: T.t('stops damage'),
    hooivork: T.t('pitchfork'),
    speer: T.t('spear'),
    piek: T.t('pike'),
    zwaard: T.t('sword'),
    boog: T.t('bow'),
    kruisboog: T.t('crossbow'),
    schild: T.t('shield'),
    harnas: T.t('leather armour'),
    afgeslagen: T.t('beaten off'),
    dood: T.t('death'),
    gewond: T.t('wounded'),
    roverDood: T.t('robber dies'),
    beroofd: T.t('robbed'),
    gewondDagen: T.t('days wounded'),
    waren: T.t('goods'),
    graan: T.t('grain'),
    per: T.t('per'),
    prijs: T.t('price'),
    zout: T.t('salt'),
    hout: T.t('logs'),
    planken: T.t('planks'),
    ijzer: T.t('iron'),
    // De brand, de koorts, ouder worden
    brandUren: T.t('burning hours'),
    blusUren: T.t('extinguishing hours'),
    redKans: T.t('chance of saving the house'),
    gevaar: T.t('fire risk'),
    puinDagen: T.t('rubble days'),
    rookDagen: T.t('smoke days'),
    herbouwHout: T.t('logs for rebuilding'),
    minHout: T.t('fewest logs'),
    herbouwVanFase: T.t('rebuild from stage'),
    puinFase: T.t('rubble stage'),
    overslaan: T.t('spreading'),
    kans: T.t('chance'),
    licht: T.t('light'),
    straal: T.t('radius'),
    sterkte: T.t('brightness'),
    tongen: T.t('tongues of flame'),
    vlammen: T.t('flames'),
    vlamHoog: T.t('flame height'),
    rook: T.t('smoke'),
    rookHoog: T.t('smoke height'),
    sintels: T.t('embers'),
    fasen: T.t('stages'),
    geschroeid: T.t('scorched'),
    dakvalt: T.t('roof falls in'),
    binnengestort: T.t('collapsed'),
    opgeruimd: T.t('cleared away'),
    begin: T.t('start'),
    besmet: T.t('chance of infecting'),
    vol: T.t('crowded'),
    kou: T.t('cold'),
    ziekDagen: T.t('days ill'),
    sterft: T.t('chance of dying'),
    volwassen: T.t('adult'),
    jong: T.t('young'),
    kind: T.t('child'),
    kleuter: T.t('toddler'),
    oud: T.t('old'),
    epidemie: T.t('epidemic'),
    epidemieMinstens: T.t('epidemic at least'),
    sterftBinnen: T.t('dies within'),
    geboorte: T.t('birth'),
    // Klein leven
    ochtend: T.t('morning'),
    avond: T.t('evening'),
    werk: T.t('work'),
    schaft: T.t('break'),
    hut: T.t('hut'),
    rookBeeld: T.t('smoke visuals'),
    pluimen: T.t('plumes'),
    hoog: T.t('height'),
    klein: T.t('small'),
    groot: T.t('large'),
    dicht: T.t('dense'),
    water: T.t('water'),
    rimpels: T.t('ripples'),
    snel: T.t('fast'),
    glinster: T.t('glint'),
    knipper: T.t('twinkle'),
    spelen: T.t('playing'),
    groep: T.t('group size'),
    duur: T.t('duration'),
    rust: T.t('rest'),
    kippen: T.t('hens'),
    perBoerderij: T.t('per farm'),
    haan: T.t('rooster'),
    periode: T.t('period'),
    lopen: T.t('walking'),
    honden: T.t('dogs'),
    achter: T.t('behind'),
    blaffen: T.t('barking'),
    was: T.t('washing'),
    lang: T.t('long'),
    stukken: T.t('pieces'),
    // Het licht
    breedte: T.t('width'),
    hoogte: T.t('height'),
    boven: T.t('height above the foot'),
    kleuren: T.t('colours'),
    lantaarn: T.t('lantern'),
    herberg: T.t('inn'),
    huis: T.t('house'),
    feest: T.t('feast'),
    schout: T.t('reeve'),
    brand: T.t('fire'),
    flakkeren: T.t('flicker'),
    flakkerSnelheid: T.t('flicker speed'),
    ogen: T.t('eyes'),
    schaduw: T.t('shadow'),
    // Gebouwen en bevolking, de bewoners, lopen
    gezinDagen: T.t('days between families'),
    gezinGrootte: T.t('family size'),
    etenPerMensPerDag: T.t('food per person per day'),
    graanBufferVoorGroei: T.t('grain buffer for growth'),
    gereedschapBonus: T.t('tools bonus'),
    gereedschapSlijtDagen: T.t('days until tools wear out'),
    oudNaDagen: T.t('old after days'),
    werkplaatsMaaktTot: T.t('workshop makes up to'),
    looppad: T.t('walkway'),
    gemaaktDagen: T.t('days counted on a building note'),
    snelheidVolwassen: T.t('adult speed'),
    snelheidKind: T.t('child speed'),
    snelheidOud: T.t('old person speed'),
    straalBijHuis: T.t('radius at home'),
    straalWerk: T.t('work radius'),
    straalPut: T.t('well radius'),
    straalPlein: T.t('square radius'),
    straalHeide: T.t('heath radius'),
    geenWegKeer: T.t('no route: tries before waiting'),
    geenWegWacht: T.t('no route: wait'),
    zoekPerBeeld: T.t('route searches per frame'),
    wachtOpLoper: T.t('wait for walker'),
    geduld: T.t('patience'),
    omwegTegels: T.t('detour tiles'),
    omwegLanger: T.t('detour longer by'),
    omwegOpnieuw: T.t('detour again after'),
    wegenOnthouden: T.t('routes remembered'),
    veldenOnthouden: T.t('fields remembered'),
    // De paadjes, de praatjes, de erven, de treden, de wetten
    slijtDagen: T.t('wear days'),
    wordtPad: T.t('becomes a path'),
    blijftPad: T.t('stays a path'),
    deurZoekt: T.t('door searches'),
    lantaarnAfstand: T.t('lantern distance'),
    buren: T.t('neighbours'),
    kansOpPlek: T.t('chance at a spot'),
    vastePlek: T.t('fixed spot'),
    duurMin: T.t('shortest duration'),
    duurMax: T.t('longest duration'),
    doorlopen: T.t('walking on'),
    breed: T.t('width'),
    diep: T.t('depth'),
    dorp: T.t('village'),
    mensen: T.t('people'),
    marktrecht: T.t('market charter'),
    hoofdgeldInDorp: T.t('poll tax in a village'),
    rantsoen: T.t('rations'),
    krap: T.t('short'),
    eten: T.t('food'),
    tevreden: T.t('contentment'),
    ruim: T.t('generous'),
    vreemden: T.t('strangers'),
    aangenomen: T.t('passed'),
    gezinnen: T.t('families'),
    houtkap: T.t('felling'),
    boete: T.t('fine'),
    belasting: T.t('tax'),
    goud: T.t('gold'),
    // De rovers, de raad, de herberg
    terugNaDagen: T.t('return after days'),
    opnieuwNaDagen: T.t('again after days'),
    wildePerJaar: T.t('wild attacks per year'),
    eersteWildeNa: T.t('first wild attack after'),
    wildeEerst: T.t('wild robbers in the first year'),
    wildeErbijPerJaar: T.t('wild robbers added per year'),
    wildeMeest: T.t('wild robbers at most'),
    uur: T.t('arrival hour'),
    roofUren: T.t('raiding hours'),
    opUren: T.t('give up after hours'),
    graanPerRover: T.t('grain per robber'),
    kansAkkerKapot: T.t('chance a field is ruined'),
    militieBij: T.t('militia within'),
    mensenPerVisser: T.t('people per fisherman'),
    waterPerVisser: T.t('water per fisherman'),
    visEnVleesMarge: T.t('fish and meat margin'),
    roversNa: T.t('robbers after'),
    raadsmanNa: T.t('advisor after'),
    afwisselingTot: T.t('advice at this many kinds of food'),
    kansPerAvond: T.t('chance per evening'),
    kansWinter: T.t('chance in winter'),
    verstWeg: T.t('furthest away'),
    minstensUren: T.t('least hours'),
    groteHerberg: T.t('large inn'),
    bierPerBezoek: T.t('ale per visit'),
    bierApartDagen: T.t('ale set aside days'),
    gezelligheidDagen: T.t('days of company'),
    gezelligheid: T.t('company'),
    // Behoeften en de winter, de wensen
    afwisselingDeel: T.t('share of the meal that counts'),
    werkBijEenSoort: T.t('work with one kind of food'),
    werkPerSoortErbij: T.t('work per kind of food more'),
    brandhoutPerHuishoudenPerDag: T.t('firewood per household per day'),
    sprokkelPerHuishoudenPerDag: T.t('gathered firewood per household per day'),
    gewichtEten: T.t('weight of food'),
    gewichtBrandhout: T.t('weight of firewood'),
    gewichtKerk: T.t('weight of the chapel'),
    kerkBasis: T.t('contentment without a chapel'),
    werkBasis: T.t('output at 0% contentment'),
    groeiDrempel: T.t('growth threshold'),
    vertrekDrempel: T.t('leaving threshold'),
    winterVerliesFactor: T.t('winter loss factor'),
    winterVooraf: T.t('winter ahead'),
    opraakWaarschuwing: T.t('running-out warning'),
    winterVoorafDagen: T.t('days of warning before winter'),
    huisGroeiDagen: T.t('house growth days'),
    huisGroeiDrempel: T.t('house growth threshold'),
    groeiVanafFase: T.t('growth from stage'),
    zoutHoudtGoed: T.t('salt keeps well'),
    bederfPerDag: T.t('spoilage per day'),
    vleesAlsGraan: T.t('meat as grain'),
    broodAlsGraan: T.t('bread as grain'),
    visAlsGraan: T.t('fish as grain'),
    wijnAlsGraan: T.t('wine as grain'),
    groenteAlsGraan: T.t('vegetables as grain'),
    eierenAlsGraan: T.t('eggs as grain'),
    gewichtRest: T.t('weight of the rest'),
    perMens: T.t('per person'),
    bier: T.t('ale'),
    vleesOfVis: T.t('meat or fish'),
    brood: T.t('bread'),
    laken: T.t('cloth'),
    wijn: T.t('wine'),
    blijheid: T.t('delight'),
    kring: T.t('range'),
    put: T.t('well'),
    kapel: T.t('chapel'),
    bouwstof: T.t('building materials'),
    stenenHuis: T.t('stone house'),
    steen: T.t('stone'),
    woontoren: T.t('tower house'),
    missenDagen: T.t('days of lacking'),
    keuters: T.t('cottars'),
    dorpelingen: T.t('villagers'),
    ambachtslieden: T.t('craftsmen'),
    boeren: T.t('farmers'),
    // De marskramer
    bezoeken: T.t('visits'),
    beurs: T.t('purse'),
    plaats: T.t('room'),
    verkoopt: T.t('sells'),
    heeft: T.t('has'),
    naDroogte: T.t('after a drought'),
    koopt: T.t('buys'),
    wol: T.t('wool'),
    eieren: T.t('eggs'),
    groente: T.t('vegetables'),
    vis: T.t('fish'),
    vlees: T.t('meat'),
    kaas: T.t('cheese'),
    huiden: T.t('hides'),
    // De heer, de heervaart, de voorvallen, de feesten
    brief: T.t('letter'),
    pachtPerAkkertegel: T.t('rent per arable tile'),
    hoofdgeldPerMens: T.t('poll tax per person'),
    deelVanGraan: T.t('share of grain'),
    deelVanGoud: T.t('share of gold'),
    straffen: T.t('punishments'),
    vanaf: T.t('from'),
    veelTeWeinig: T.t('far too little'),
    ambtKwijtNa: T.t('lose office after'),
    boeteZelf: T.t('fine if you name yourself'),
    soldaten: T.t('soldiers'),
    soldaatEetAls: T.t('a soldier eats as much as'),
    soldatenOntevreden: T.t('discontent from soldiers'),
    soldatenTot: T.t('soldiers until'),
    schandpaalDagen: T.t('pillory days'),
    schandpaalKost: T.t('pillory cost'),
    wrokDagen: T.t('grudge days'),
    wachtDagen: T.t('waiting days'),
    waarde: T.t('value'),
    waardeAnders: T.t('value of anything else'),
    kiesBinnenDagen: T.t('days to choose'),
    terug: T.t('return'),
    zielenPerMan: T.t('souls per man'),
    goudPerMan: T.t('gold per man'),
    kansNietTerug: T.t('chance of not returning'),
    gunstPerGoud: T.t('favour per gold'),
    dagenTussen: T.t('days between'),
    dagenTussenWinter: T.t('days between in winter'),
    spreiding: T.t('spread'),
    eersteNa: T.t('first after'),
    pauze: T.t('pause'),
    vastMarge: T.t('fixed-day margin'),
    vervolgVan: T.t('follow-up from'),
    vervolgTot: T.t('follow-up to'),
    zoektVanaf: T.t('looks for you from'),
    zoektTot: T.t('looks for you until'),
    zoektDagen: T.t('days looking'),
    stemmingDagen: T.t('mood days'),
    nietGevonden: T.t('not found'),
    metOorzaak: T.t('with a cause'),
    zonderOorzaak: T.t('without a cause'),
    onvrede: T.t('discontent'),
    onrust: T.t('unrest'),
    hongersnood: T.t('famine'),
    lichtSterkte: T.t('light brightness'),
    meiboomDagen: T.t('maypole days'),
    kerstboom: T.t('Christmas tree'),
    tot: T.t('until'),
    kaarsStraal: T.t('candle radius'),
    kaarsSterkte: T.t('candle brightness'),
    // De markt, het eind, de verzoeken, de ondernemers
    vrij: T.t('buildings keep clear by'),
    beginTegels: T.t('starting tiles'),
    perMensen: T.t('one tile per this many people'),
    rijLengte: T.t('row length'),
    tussenRijen: T.t('between rows'),
    vanHetFeest: T.t('from the feast'),
    vanDeHeer: T.t('from the lord'),
    vanBomen: T.t('from trees'),
    achterDak: T.t('behind a roof'),
    achterBoom: T.t('behind a tree'),
    straatTot: T.t('street up to'),
    straatAfstand: T.t('street spacing'),
    kramen: T.t('stalls'),
    lengte: T.t('length'),
    potten: T.t('pots'),
    minstensOver: T.t('at least left'),
    schade: T.t('damage'),
    // De twee bazen, de grillen, de raadsman, het rapport
    gunstBegin: T.t('favour at the start'),
    vertrouwenBegin: T.t('trust at the start'),
    waarschuwing: T.t('warning'),
    opnieuwBoven: T.t('again above'),
    laatsteWaarschuwing: T.t('last warning'),
    schatting: T.t('tribute'),
    goed: T.t('paid well'),
    schandpaal: T.t('pillory'),
    nietGekomen: T.t('did not come'),
    heervaart: T.t('levy'),
    gestuurd: T.t('sent'),
    vrijgekocht: T.t('bought out'),
    gehaald: T.t('taken by the lord'),
    voorval: T.t('event'),
    doorRaadsman: T.t('by the advisor'),
    heervaartWeg: T.t('levy men away'),
    heervaartVrij: T.t('levy bought out'),
    doodDoorWinter: T.t('death by winter'),
    gesneuveld: T.t('fallen'),
    schandpaalZelf: T.t('pillory yourself'),
    schandpaalPerAanzien: T.t('pillory per standing'),
    volgDagen: T.t('days to follow'),
    nietVoor: T.t('not before'),
    antwoordBinnen: T.t('answer within'),
    kandidaten: T.t('candidates'),
    maaien: T.t('reaping'),
    vaardigheden: T.t('skills'),
    rechtspreken: T.t('judging'),
    zwijgen: T.t('keeping quiet'),
    rekenen: T.t('figures'),
    bouwen: T.t('building'),
    vechten: T.t('fighting'),
    verban: T.t('banish'),
    gezin: T.t('family'),
    marge: T.t('margin'),
    bijHuis: T.t('at his house'),
    slechtNaast: T.t('badly off by'),
    afrondenOp: T.t('round to'),
    telTot: T.t('counts exactly up to'),
    gebeurdOnthouden: T.t('events remembered'),
    herhaalNa: T.t('repeat after'),
    winterVerschil: T.t('winter difference'),
    wensenPerRapport: T.t('wants per report'),
    raadTot: T.t('advice until'),
    // Het land, de maker
    provincies: T.t('provinces'),
    dagenMin: T.t('least days'),
    dagenMax: T.t('most days'),
    grensMinstens: T.t('border at least'),
    reisSnelheid: T.t('travel speed'),
    gemistHoogstens: T.t('missed at most'),
    leegRand: T.t('empty margin'),
    eilandBrug: T.t('island bridge'),
    kost: T.t('cost'),
    zicht: T.t('in sight'),
    zaden: T.t('seeds'),
    pogingen: T.t('attempts'),
    losseBomen: T.t('single trees'),
    struikgroepjes: T.t('clumps of shrubs'),
    vak: T.t('per square of'),
    rotsen: T.t('rocks'),
    groei: T.t('growth'),
    bos: T.t('forest'),
    varen: T.t('fern'),
    struik: T.t('shrub'),
    bessenStruik: T.t('berry bush'),
    paddenstoelen: T.t('mushrooms'),
    boomstronk: T.t('tree stump'),
    grasPol: T.t('grass tuft'),
    weide: T.t('meadow'),
    kleineRots: T.t('small rock'),
    bloemen: T.t('flowers'),
    oever: T.t('bank'),
    hoogGras: T.t('tall grass'),
    heide: T.t('heath'),
    heideGroen: T.t('heath greenery'),
    distel: T.t('thistle'),
    brem: T.t('broom'),
    oeverGroen: T.t('bank greenery'),
    lisdodde: T.t('bulrush'),
    waterGroen: T.t('water greenery'),
    waterlelie: T.t('water lily'),
    bosrand: T.t('forest edge'),
    braam: T.t('bramble'),
    pleinBreed: T.t('square width'),
    pleinDiep: T.t('square depth'),
    pleinTegels: T.t('square tiles'),
    eikenTot: T.t('oaks up to'),
    marktRij: T.t('market row at least'),
    openRond: T.t('land opens within'),
    vooruit: T.t('land made ahead within'),
    vooruitDeel: T.t('land made in parts of'),
    vooruitMsPerSeconde: T.t('ms per second for land made ahead'),
    veldRand: T.t('walking fields reach beyond the village'),
    // Het lege begin, meebouwen, boeren uit het niets, de boeren
    kar: T.t('cart'),
    zaaigraan: T.t('seed grain'),
    gereedschap: T.t('tools'),
    kinderen: T.t('children'),
    grootvader: T.t('grandfather'),
    kamp: T.t('camp'),
    plekken: T.t('spots'),
    dx: T.t('offset across'),
    dy: T.t('offset down'),
    karSnelheid: T.t('cart speed'),
    voorsprong: T.t('head start'),
    naastDeKar: T.t('beside the cart'),
    vuur: T.t('fire'),
    smeult: T.t('smoulders'),
    heerVrij: T.t('years free of the lord'),
    bouwBereik: T.t('build range'),
    werkPerBouwdag: T.t('workdays per day of build time'),
    perPlaats: T.t('per building site'),
    rooiBoom: T.t('clearing a tree'),
    rooiStruik: T.t('clearing a shrub'),
    veldWerk: T.t('fieldwork'),
    lading: T.t('load per trip'),
    stapelVol: T.t('full stack'),
    minstens: T.t('smallest stack fetched'),
    laden: T.t('loading time'),
    voorraadIn: T.t('kept at a workshop'),
    nietMetDeKar: T.t('not by ox cart'),
    werkPerTegel: T.t('workdays per tile'),
    karSneller: T.t('ox cart faster on a road'),
    langst: T.t('longest road at once'),
    alWegKost: T.t('a tile of road already there costs'),
    akker: T.t('arable'),
    wijngaard: T.t('vineyard'),
    veldMin: T.t('smallest field'),
    veldMax: T.t('largest field'),
    veldSmal: T.t('narrowest side'),
    veldAfstand: T.t('field distance'),
    zaaien: T.t('sowing'),
    // De velden en het veldwerk
    weideNaHonger: T.t('meadow after hunger'),
    beginVruchtbaarheid: T.t('starting fertility'),
    akkerPutUit: T.t('arable field wears out'),
    braakRust: T.t('fallow rests'),
    weideMest: T.t('meadow manured'),
    laagste: T.t('lowest'),
    mestPerTegel: T.t('dung per tile'),
    mestErbij: T.t('dung added'),
    rustOnder: T.t('rests below'),
    wieden: T.t('weeding'),
    wiedenRust: T.t('weeding rest'),
    mesten: T.t('dunging'),
    spitten: T.t('digging'),
    spittenRust: T.t('digging rest'),
    hakken: T.t('chopping'),
    rooien: T.t('clearing'),
    rooienRust: T.t('clearing rest'),
    rapen: T.t('gathering'),
    bosrandStraal: T.t('forest edge radius'),
    helpStraal: T.t('helping radius'),
    bosBomen: T.t('trees that make a forest'),
    bosVanDeHeer: T.t("trees that make the lord's forest"),
    // De beesten in het bos
    bosPerRoedel: T.t('forest per pack'),
    bosPerKudde: T.t('forest per herd'),
    minstensBos: T.t('least forest'),
    maxRoedels: T.t('most packs'),
    maxKuddes: T.t('most herds'),
    roedel: T.t('pack'),
    kudde: T.t('herd'),
    uitElkaar: T.t('apart'),
    randPlekken: T.t('edge spots'),
    randBinnen: T.t('edge within'),
    randLopen: T.t('edge walking distance'),
    randUitElkaar: T.t('edge spots apart'),
    schuw: T.t('shyness'),
    wolf: T.t('wolf'),
    hert: T.t('deer'),
    wegUren: T.t('away hours'),
    wolvenVoorDonker: T.t('wolves before dark'),
    hertenRondDeZon: T.t('deer around sunrise and sunset'),
    randUren: T.t('edge hours'),
    graasBlok: T.t('grazing block'),
    grazen: T.t('grazing'),
    honger: T.t('hunger'),
    jagenVanaf: T.t('hunting from'),
    jaagStraal: T.t('hunting radius'),
    vangKans: T.t('chance to catch'),
    zonderJongen: T.t('no young below'),
    jongen: T.t('young'),
    aantal: T.t('number'),
    plaatsPerRoedel: T.t('room per pack'),
    plaatsPerKudde: T.t('room per herd'),
    diepBlijven: T.t('stays deep'),
    dreiging: T.t('threat'),
    stout: T.t('bold from hunger'),
    zoekStraal: T.t('search radius'),
    alleen: T.t('alone, nobody within'),
    doodKans: T.t('chance of death'),
    schrik: T.t('fright'),
    schrikKans: T.t('chance of fright'),
    statusDagen: T.t('status days'),
    jacht: T.t('hunt'),
    mannen: T.t('men'),
    bij: T.t('fight within'),
    zonderJou: T.t('wolves lost without you'),
    sterfkans: T.t('chance a man dies'),
    hulp: T.t('help'),
    hoort: T.t('hearing distance'),
    jager: T.t('hunter'),
    kleinWild: T.t('share of small game'),
    perDier: T.t('meat per deer'),
    laatStaan: T.t('deer left standing'),
    wolfDagen: T.t('days per wolf'),
    loerAfstand: T.t('lurking distance'),
    loerUren: T.t('lurking hours'),
    // De graanschuur, het bos, het vee
    mensenPerWachter: T.t('people per guard'),
    minstensWachters: T.t('least guards'),
    vertrouwenPerHongerdag: T.t('trust per hungry day'),
    wachtStraal: T.t('guard radius'),
    houtPerBoom: T.t('logs per tree'),
    rooiHout: T.t('logs per cleared tree (empty start)'),
    rooiDagen: T.t('clearing days'),
    hakStraal: T.t('chopping radius'),
    boompjesPerBoom: T.t('saplings per tree'),
    boompjeDagen: T.t('sapling days'),
    jongeBoomDagen: T.t('young tree days'),
    stronkDagen: T.t('stump days'),
    hakUren: T.t('chopping hours'),
    sneeuwOpDeBomen: T.t('snow on the trees'),
    koe: T.t('cow'),
    schaap: T.t('sheep'),
    weideTussen: T.t('gap between meadows'),
    kooiPlaats: T.t('room in the fold'),
    melkVoorMensen: T.t('milk feeds people'),
    melkNaarKaas: T.t('milk to cheese'),
    werpen: T.t('birthing'),
    kansOpJong: T.t('chance of young'),
    beginKudde: T.t('starting herd'),
    hooiPerTegel: T.t('hay per tile'),
    hooiPerDag: T.t('hay per day'),
    jongEet: T.t('young eat'),
    hongerDagen: T.t('hungry days'),
    hooiWaarschuwing: T.t('hay warning'),
    slachten: T.t('slaughtering'),
    slacht: T.t('slaughter yields'),
    scheren: T.t('shearing'),
    wolPerSchaap: T.t('wool per sheep'),
    mestPerSchaap: T.t('dung per sheep'),
    // De doorkijk, het licht in het dorp
    tijd: T.t('time'),
    hoogGenoeg: T.t('high enough'),
    kijkgatStraal: T.t('peephole radius'),
    kijkgatOmhoog: T.t('peephole raised'),
    rasterCel: T.t('grid cell'),
    lantaarnStraal: T.t('lantern radius'),
    lantaarnSterkte: T.t('lantern brightness'),
    huisStraal: T.t('house radius'),
    huisSterkte: T.t('house brightness'),
  };
  const NAAM_VAN_PAD = {
    'KOORTS_INSTELLINGEN.begin': T.t('ill at the start'), // geen tekst
    'LICHT_INSTELLINGEN.kracht': T.t('lamp power'), // geen tekst
    'MIST_INSTELLINGEN.zicht': T.t('how far they see'), // geen tekst
    'MIST_INSTELLINGEN.zicht.dorpeling': T.t('villager'), // geen tekst
    'MIST_INSTELLINGEN.zicht.gebouw': T.t('building, from its edge'), // geen tekst
    'MIST_INSTELLINGEN.beginKring': T.t('known at the start, within'), // geen tekst
    'MIST_INSTELLINGEN.ontkleurd': T.t('colour taken out in the grey'), // geen tekst
    'MIST_INSTELLINGEN.donker': T.t('darker in the grey'), // geen tekst
    'MIST_INSTELLINGEN.zwart': T.t('black'), // geen tekst
    'MIST_INSTELLINGEN.rand': T.t('soft edge'), // geen tekst
    'RAADSMAN_INSTELLINGEN.kiest': T.t('how the advisor weighs'), // geen tekst
    'BEESTEN_INSTELLINGEN.groot': T.t('splits at size'), // geen tekst
    'BEESTEN_INSTELLINGEN.jager.hooguit': T.t('pack size limit'), // geen tekst
    'MAKER_INSTELLINGEN.b': T.t('width'), // geen tekst
    'MAKER_INSTELLINGEN.h': T.t('height'), // geen tekst
  };
  // De naam van de sleutel die bij dit pad hoort, of null als die ontbreekt.
  T.werkbankNaam = (pad) => {
    const sleutel = pad.slice(pad.lastIndexOf('.') + 1);
    return NAAM_VAN_PAD[pad] || NAAM_VAN_SLEUTEL[sleutel] || null;
  };

  // "brandhoutPerHuishoudenPerDag" wordt "brandhout per huishouden per dag"; alleen als de sleutel geen naam heeft.
  const inWoorden = (s) => s.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase();
  const sleutelNaam = (pad, s) => NAAM_VAN_PAD[pad] || NAAM_VAN_SLEUTEL[s] || inWoorden(s);

  // Hoe heet plek `i` in een rij: wat de speler van het ding ziet (een bezoek van de marskramer heeft `toon`, want zijn
  // `naam` is de sleutel waar de regels op letten; een straf staat in T.STRAF_TOON), bij een prijs het bezoek waar hij bij
  // hoort, en anders zijn nummer.
  function plekNaam(ouderSleutel, rij, i) {
    const x = rij[i];
    if (x && typeof x === 'object') {
      if (typeof x.toon === 'string') return x.toon;
      if (typeof x.naam === 'string') return x.naam;
      if ('straf' in x) return x.straf ? T.STRAF_TOON[x.straf] || x.straf : T.t('no punishment');
    }
    const bezoeken = T.HANDEL_INSTELLINGEN && T.HANDEL_INSTELLINGEN.bezoeken;
    if ((ouderSleutel === 'prijs' || ouderSleutel === 'heeft') && bezoeken && bezoeken[i]) return bezoeken[i].toon; // per bezoek (js/handel.js)
    return String(i + 1);
  }

  // Welke keuze zet dit pad (of een pad erboven)? De naam van de optie, of null.
  function doorOptie(pad) {
    for (const o of T.OPTIES) {
      const keuze = o.keuzes.find((k) => k.id === T.optieKeuze(o.id));
      if (keuze && Object.keys(keuze.zet).some((p) => pad === p || pad.startsWith(p + '.'))) return o.naam;
    }
    return null;
  }

  // Een bereik voor de schuif, naar de standaard: een fractie tussen 0 en 1 (of wat ruimer als hij
  // klein is), een heel getal tot drie keer zo groot. Het getalveld ernaast kent geen grenzen. Een getal onder
  // nul (wat een wet van de tevredenheid afhaalt, js/wetten.js) krijgt hetzelfde bereik in spiegelbeeld, tot nul.
  T.werkbankBereik = function (st) {
    if (st < 0) {
      const b = T.werkbankBereik(-st);
      return { min: -b.max, max: 0, stap: b.stap };
    }
    if (!(st > 0)) return { min: 0, max: 1, stap: 0.01 };
    if (Number.isInteger(st)) return { min: 0, max: Math.max(3, st * 3), stap: 1 };
    if (st < 1) return { min: 0, max: Math.min(1, Math.max(0.1, Math.ceil(st * 400) / 100)), stap: st < 0.1 ? 0.001 : 0.01 };
    return { min: 0, max: Math.ceil(st * 3), stap: 0.1 };
  };

  // Alle getallen van één deel van de werkbank: [{ pad, label, waarde, standaard, eigen, doorOptie }].
  // `standaard` is wat er staat zonder werkbank (dus met de keuzes van nu), `eigen` of je hem zelf
  // verzette.
  T.werkbankGetallen = function (deel) {
    if (!standaard) neemStandaard();
    const lijst = [];
    const eigen = T.OPTIES_NU.getallen || {};
    const metKeuzes = {}; // de waarden met de keuzes van nu, zonder de werkbank
    const voeg = (pad, label, waarde) => {
      lijst.push({ pad, label, waarde, standaard: pad in eigen ? metKeuzes[pad] : waarde, eigen: pad in eigen, doorOptie: doorOptie(pad) });
    };
    // Wat de keuzes zetten, zonder de werkbank: even uitrekenen op een kopie.
    const zonderWerkbank = (pad) => {
      for (const o of T.OPTIES) {
        const keuze = o.keuzes.find((k) => k.id === T.optieKeuze(o.id));
        for (const p in keuze.zet) {
          if (pad === p) return keuze.zet[p];
          if (pad.startsWith(p + '.')) {
            let v = keuze.zet[p];
            for (const d of delen(pad.slice(p.length + 1))) v = v == null ? undefined : v[d];
            return v;
          }
        }
      }
      const d = delen(pad);
      if (d.length === 1) return standaard.losse[pad];
      let v = standaard.blokken[d[0]];
      for (const x of d.slice(1)) v = v == null ? undefined : v[x];
      return v;
    };
    for (const k of Object.keys(deel.losse || {})) {
      metKeuzes[k] = zonderWerkbank(k);
      voeg(k, deel.losse[k], T[k]);
    }
    if (deel.blok) {
      const loop = (waarde, pad, labels) => {
        if (typeof waarde === 'number') {
          metKeuzes[pad] = zonderWerkbank(pad);
          voeg(pad, labels.join(' · '), waarde);
        } else if (Array.isArray(waarde)) {
          const ouder = delen(pad).pop();
          waarde.forEach((x, i) => loop(x, `${pad}.${i}`, labels.concat(plekNaam(ouder, waarde, i))));
        } else if (waarde && typeof waarde === 'object') {
          for (const s of Object.keys(waarde)) loop(waarde[s], `${pad}.${s}`, labels.concat(sleutelNaam(`${pad}.${s}`, s)));
        }
      };
      loop(T[deel.blok], deel.blok, []);
    }
    return lijst;
  };

  // ---------------------------------------------------------------------------------------------
  // Onthouden, in de browser: waar, zegt T.opslagPlek (js/opslaan.js), dezelfde plek als voor de
  // opgeslagen spellen. Kan dat niet (een toets, een privévenster), dan gewoon niet: het spel werkt
  // dan met de standaard.
  // ---------------------------------------------------------------------------------------------

  const SLEUTEL = T.OPSLAG_SLEUTEL + '.spelregels';
  const opslag = () => T.opslagPlek();

  T.bewaarOpties = function (waar) {
    const o = waar || opslag();
    try {
      if (o) o.setItem(SLEUTEL, JSON.stringify(T.OPTIES_NU));
    } catch (e) {
      /* vol, of geblokkeerd: dan onthoudt de browser het niet */
    }
  };

  // Wat de browser onthield. Een keus voor een spelregel die er niet meer is (zoals "Het begin" en "Je gehucht", weg
  // sinds ronde 2 van het snoeien, stap 3), telt niet: pasOptiesToe kent hem niet.
  T.laadOpties = function (waar) {
    const o = waar || opslag();
    try {
      const tekst = o && o.getItem(SLEUTEL);
      const i = tekst ? JSON.parse(tekst) : null;
      if (!i || typeof i !== 'object') return null;
      return i;
    } catch (e) {
      return null;
    }
  };

  // Bij het laden: de standaard vastleggen, en wat de browser onthield meteen toepassen, zodat de
  // wereld en de poppetjes al met de juiste namen en getallen beginnen.
  neemStandaard();
  T.pasOptiesToe(T.laadOpties());
})(globalThis.Spel = globalThis.Spel || {});
