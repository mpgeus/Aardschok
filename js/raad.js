// De raad onder het doel (werklijst vraag 58, B; Marcel, 29 sep: "B onder het doel"). Linksboven staat het doel,
// "26 of 50 people · no chapel yet · no smithy yet" (js/treden.js), en daaronder één regel die zegt wat nu tussen
// jou en een dorp staat, met de toets erbij. Het is geen rij opdrachten die je afwerkt, maar wat nu telt: de eerste
// raad uit T.RADEN die nu geldt. Zo blijft niemand op een stap hangen, komt een toets pas als je hem nodig hebt, en
// blijft het na de eerste weken nuttig. Het zijn de eerste weken als opdrachten (vraag 47), herschreven.
//
// Of er een gezin komt, vraagt de raad aan de groei zelf (T.waaromGeenGezin en T.volgendeGezinDag, js/gebouwen.js),
// of het hout en het eten de winter halen aan het dorp (T.houtVoorDeWinter en T.etenVoorDeWinter, js/behoeften.js),
// en wat de huizen missen aan de wensen (T.watDeHuizenMissen, js/wensen.js; vraag 87): de raad zegt wat het spel doet,
// en rekent niet naast het spel.
//
// Een toets staat tussen haken, [B]: in het vak wordt dat een toets (<kbd>, js/ui.js).
//
// Zonder scherm, en dus getoetst (test/raad.test.cjs). js/main.js zet hem onder het doel (T.ui.opdracht), en de
// speeltest schrijft op welke raad de bouwer hoe lang zag (gereedschap/speeltest/speler.js). Uit te zetten in de
// spelregels ("Raad", js/opties.js).
(function (T) {
  'use strict';

  T.RAAD_INSTELLINGEN = {
    // Of de raad er staat (de spelregel "Raad").
    aan: true,
    // Wat helpt aan eten (T.watHelptAanEten; vraag 132): een visser per zoveel mensen, en per zoveel tegels water.
    mensenPerVisser: 30,
    waterPerVisser: 60,
    // Vis en vlees voor de winter (T.visEnVleesVoorDeWinter; vraag 132, B): de raad zegt het als er meer dan dit deel
    // van wat de huizen in de winter willen, zal missen, of als er zout bij moet.
    visEnVleesMarge: 0.1,
    // Zoveel dagen na een aanval van de rovers zegt de raad wat een wachthuis doet, als er geen is.
    roversNa: 10,
    // Zoveel dagen nadat een voorval voorbijging dat een raadsman had beslist, als je er een had (js/voorvallen.js: je
    // was weg), zegt de raad: kies een raadsman (js/raadsman.js).
    raadsmanNa: 10,
    // De afwisseling (vraag 154): de raad zegt het als het dorp zoveel soorten eet of minder (2: 75% werk). Daarboven
    // staat het alleen in de balk (de status eentonig, js/voorvallen.js), zodat het doel en de groei aan het woord blijven.
    afwisselingTot: 2,
  };
  const IN = () => T.RAAD_INSTELLINGEN;

  const dagNu = (D) => Math.floor(D.kalender.dag);
  const over = (n) => (n <= 1 ? T.t('tomorrow') : T.t('in {n} days', { n }));
  const heeft = (D, soort) => (D.gebouwen || []).some((g) => g.soort === soort);
  // De naam van een gebouw, kaal ("woodcutter"), met lidwoord ("a woodcutter") en met een hoofdletter ("A woodcutter").
  const naamVan = (soort) => T.GEBOUWEN[soort].naam;
  const eenNaam = (soort) => T.eenNaam(naamVan(soort));
  // De maand zoals de speler hem ziet; T.volgendeMarskramer (js/handel.js) geeft de naam waar de regels op letten.
  const maandToon = (naam) => (T.MAANDEN.find((m) => m.naam === naam) || { toon: naam }).toon;
  const marskramerMaand = (dag) => maandToon(T.volgendeMarskramer(dag));
  // Staat elke houthakker stil omdat er binnen zijn bereik geen boom meer staat (T.houthakkerZonderBoom, js/bos.js)?
  const geenBoomMeer = (D) => {
    const hakkers = (D.gebouwen || []).filter((g) => g.klaar && T.GEBOUWEN[g.soort].bos);
    return hakkers.length > 0 && hakkers.every(T.houthakkerZonderBoom);
  };

  // Hoeveel mensen het doel nog vraagt: de volgende trede (js/treden.js); na de laatste is er geen doel meer (de winst
  // is op 11 okt weggehaald, js/einde.js).
  const mensenNodig = (D) => (T.volgendeTrede(D) ? T.tredeMensenNodig(D) : 0);

  // Het hout of het eten (`voorDeWinter`: T.houtVoorDeWinter of T.etenVoorDeWinter) haalt de winter niet, en die is
  // in zicht (T.winterInZicht, js/behoeften.js: vanaf 1 herfstmaand, net als het dorp zelf), of al begonnen. Eerst de
  // dagen tot de winter: dat is goedkoop, het eten niet.
  const haaltHetNiet = (D, voorDeWinter) => T.winterInZicht(D.kalender.dag) && !voorDeWinter(D, D.kalender.dag).haalt;
  // Haalt het de winter niet, dan komt er geen gezin (js/gebouwen.js, gezinWachtOpDeWinter): dat zegt de raad erbij.
  const geenGezin = () => (T.GEBOUWEN_INSTELLINGEN.gezinWachtOpDeWinter ? ` ${T.t('Until there is enough, no family will come.')}` : '');
  // Hoe ver het komt, zoals het dorp het zegt (js/behoeften.js): "26 of the 90 days". Zo weet je of één houthakker
  // genoeg is; de bouwer die alleen hoorde dat het niet genoeg was, bouwde er een na de ander (29 sep).
  const haalt = (v) => T.t('{dagen} of the {winter} days', { dagen: v.dagen, winter: v.winter });

  // Wat je mist om deze soorten te bouwen: { goud, hout, ... }, goud eerst, of null als je ze kunt betalen. Alles samen,
  // want wie eerst de kapel bouwt, heeft daarna minder voor de smidse.
  function tekortVoor(D, soorten) {
    const mist = { goud: 0, hout: 0 };
    for (const soort of soorten) for (const wat of Object.keys(T.GEBOUWEN[soort].kosten)) mist[wat] = 0;
    for (const wat of Object.keys(mist)) {
      const nodig = soorten.reduce((som, soort) => som + (T.GEBOUWEN[soort].kosten[wat] || 0), 0);
      const tekort = Math.ceil(nodig - (D.voorraad[wat] || 0) - 1e-9);
      if (tekort > 0) mist[wat] = tekort;
      else delete mist[wat];
    }
    return Object.keys(mist).length ? mist : null;
  }

  // Wat je mist voor de gebouwen die het doel nog vraagt (T.doelGebouwen, js/treden.js): { soorten, mist }, of null.
  function tekortVoorHetDoel(D) {
    const soorten = T.doelGebouwen(D);
    const mist = soorten.length ? tekortVoor(D, soorten) : null;
    return mist ? { soorten, mist } : null;
  }

  // Waar het vandaan komt (werklijst vraag 59, C): goud van de marskramer, die graan koopt, en van de belasting; hout
  // van een houthakker, behalve als je juist die wilt bouwen (`voor`).
  function waarVandaan(D, mist, voor) {
    const bronnen = [];
    if (mist.goud) {
      bronnen.push(T.kanHandelen(D) ? T.t('the merchant buys grain while he is here') : T.t('the merchant buys grain in {maand}', { maand: marskramerMaand(D.kalender.dag) }));
      bronnen.push(T.standVanWet(D, 'belasting') === 'aangenomen' ? T.t('the tax brings in gold every month') : T.t('tax [W] brings in gold every month'));
    }
    if (mist.hout && voor !== 'houthakker') {
      const hakker = naamVan('houthakker');
      bronnen.push(heeft(D, 'houthakker') ? T.t('the {hakker} cuts logs', { hakker })
        : T.t('{hakker} [B] cuts logs', { hakker: eenNaam('houthakker') }));
    }
    return bronnen;
  }
  const hoeveelTekst = (mist) => T.opsomming(Object.entries(mist).map(([wat, n]) => T.hoeveel(n, wat)));

  // Helpt een jager tegen een winter zonder eten: vlees vult een maag, en er is geen jager die geen hert vindt dat hij mag
  // schieten (T.jagersZonderHerten, js/beesten.js; Marcel, 7 okt, vraag 116, k). In de speeltest van 7 okt vroeg het dorp
  // anders jager na jager, tot er 9 tot 11 stonden, die alleen klein wild schoten.
  const jagerHelpt = (D) => T.BEHOEFTEN_INSTELLINGEN.vleesIsEten && T.jagersZonderHerten(D) === 0;
  // Wat er helpt als het eten de winter niet haalt (Marcel, 8 okt, vraag 132, b: "ze mogen advies geven op wat te doen.
  // dit kan kopen, planten, bakken etc zijn"): wat er nu kan, in deze volgorde, elk { id, zin, bouw (de soort die het
  // dorp dan vraagt, of geen) }. Een visser als er water is en het nog geen winter is, een jager als er herten zijn
  // (jagerHelpt), een graanschuur om het zaaigraan te houden (js/graanschuur.js), en in de lente zaaigraan kopen als er te
  // weinig is om te zaaien.
  T.watHelptAanEten = function (D) {
    const uit = [];
    const dag = D.kalender.dag;
    const datum = T.datumVanDag(dag);
    const w = D.wereld;
    const tB = ' [B]';
    // Vissers: een per vissersPer mensen, zolang er water genoeg is (een per waterPerVisser tegels).
    const water = waterBij(w);
    const visser = T.GEBOUWEN.visser;
    const vissers = (D.gebouwen || []).filter((g) => g.soort === 'visser').length;
    const kunnen = Math.min(Math.floor(water / IN().waterPerVisser), Math.max(1, Math.ceil((D.bevolking || 0) / IN().mensenPerVisser)));
    if (water && T.magGebouwd(D, 'visser') && !T.stilOp(visser, dag) && vissers < kunnen) {
      const woorden = { visser: vissers ? visser.naam : T.eenNaam(visser.naam), toets: tB, vis: T.hoeveel(visser.maakt.uit.vis, 'vis') };
      const zin = vissers ? T.t('another {visser} at the water{toets} ({vis} a day, not in winter)', woorden)
        : T.t('{visser} at the water{toets} ({vis} a day, not in winter)', woorden);
      uit.push({ id: 'visser', zin, bouw: 'visser' });
    }
    // Meer koeien: had het dorp honger in het voorjaar, dan maken de boeren na de oogst een weide erbij (js/akkers.js).
    if ((D.behoeften && D.behoeften.voorjaarsHonger) >= T.VELDEN_INSTELLINGEN.weideNaHonger) {
      uit.push({
        id: 'weide',
        zin: T.t('more meadow for the cows (milk for {n} people per cow, from {van} to {tot}; the farmers make it after the harvest, or you in the fields window [V])',
          { n: T.VEE_INSTELLINGEN.melkVoorMensen, van: maandToon('grasmaand'), tot: maandToon('wijnmaand') }),
      });
    }
    if (jagerHelpt(D) && T.magGebouwd(D, 'jager')) {
      uit.push({
        id: 'jager',
        zin: T.t('{jager}{toets} ({vlees} a day, and deer in the woods)', { jager: eenNaam('jager'), toets: tB, vlees: T.hoeveel(T.GEBOUWEN.jager.maakt.uit.vlees, 'vlees') }),
        bouw: 'jager',
      });
    }
    if (T.GRAANSCHUUR_INSTELLINGEN.bewaken && !heeft(D, 'graanschuur') && T.zaaigraanApart(D, dag) > 0 && T.magGebouwd(D, 'graanschuur')) {
      uit.push({ id: 'graanschuur', zin: T.t('{schuur}{toets}, so that the seed grain is kept', { schuur: eenNaam('graanschuur'), toets: tB }), bouw: 'graanschuur' });
    }
    const zaai = T.zaaigraanApart(D, dag);
    if (zaai > 0 && ((D.voorraad && D.voorraad.graan) || 0) < zaai) {
      uit.push({ id: 'kopen', zin: T.t('buy seed grain from the merchant (in {maand})', { maand: marskramerMaand(dag) }) });
    }
    return uit;
  };

  // Hoeveel tegels water er in het vak om het dorp liggen (voor een visser).
  const waterBij = (w) => (T.heeftTegels(w) ? T.natuurBij(w, 'water', T.kaartVak(w), 0) : 0);

  // Wat een soort eten op tafel brengt die er nu niet bij is (vraag 154, de afwisseling; Marcel, 13 okt: "A1"): per
  // soort het gebouw dat hem maakt, als het nu mag. Staat er al een, dan is wat hij maakt nog geen tiende van de
  // maaltijd: "another". De vis alleen met water bij het dorp, de wijn alleen zonder wijnboerderij (meer wijngaard zegt
  // de raad `wijn`), en het brood met een molen als die er niet is. Geeft [{ soort, bouw, zin }].
  const MAAKT_SOORT = { vlees: 'jager', groente: 'moestuin', eieren: 'kippenhok', vis: 'visser', wijn: 'wijnboerderij', brood: 'bakkerij' };
  T.watHelptAanAfwisseling = function (D) {
    const op = (D.behoeften && D.behoeften.afwisseling) || [];
    const uit = [];
    for (const [soort, bouw] of Object.entries(MAAKT_SOORT)) {
      if (op.includes(soort) || T.voedtAlsGraan(soort) <= 0 || !T.magGebouwd(D, bouw)) continue;
      if ((bouw === 'visser' && !waterBij(D.wereld)) || (bouw === 'wijnboerderij' && heeft(D, bouw))) continue;
      const namen = bouw === 'bakkerij' && !heeft(D, 'molen') ? [eenNaam('molen'), eenNaam(bouw)]
        : [heeft(D, bouw) ? T.t('another {gebouw}', { gebouw: naamVan(bouw) }) : eenNaam(bouw)];
      uit.push({ soort, bouw, zin: T.t('{gebouwen} [B] ({soort})', { gebouwen: T.opsomming(namen), soort: T.waarNaam(soort) }) });
    }
    return uit;
  };

  // Vis en vlees voor de winter (vraag 132, B; Marcel, 8 okt: "A en B samen"): { v (T.visEnVleesVoorDeWinter), mist (er
  // mist meer dan visEnVleesMarge), zout (er moet zout bij, en de marskramer komt nog voor de winter), hulp (wat meer
  // vangt: een visser of een jager, uit T.watHelptAanEten) }, of null als er niets te zeggen is.
  T.visEnVleesRaad = function (D) {
    const v = T.visEnVleesVoorDeWinter(D, D.kalender.dag);
    if (!v) return null;
    const H = T.HANDEL_INSTELLINGEN;
    const nogVoorDeWinter = T.kanHandelen(D) || T.volgendeMarskramer(D.kalender.dag) !== H.bezoeken[0].maand;
    const zout = v.zout >= 1 && nogVoorDeWinter;
    const mist = v.tekort > v.nodig * IN().visEnVleesMarge;
    if (!zout && !mist) return null;
    const hulp = mist ? T.watHelptAanEten(D).filter((h) => h.id === 'visser' || h.id === 'jager') : [];
    return { v, mist, zout, hulp };
  };
  function visEnVleesTekst(D, r) {
    const { v } = r;
    const zinnen = [];
    const n = (x) => Math.round(x);
    if (r.mist) {
      const woorden = { nodig: n(v.nodig), dan: n(v.dan), hulp: T.opsomming(r.hulp.map((h) => h.zin)) };
      zinnen.push(r.hulp.length
        ? T.t('In winter the houses want {nodig} fish or meat, when the brook is frozen over, and there will then be about {dan}: {hulp}.', woorden)
        : T.t('In winter the houses want {nodig} fish or meat, when the brook is frozen over, and there will then be about {dan}.', woorden));
    } else {
      zinnen.push(T.t('In winter the houses want {nodig} fish or meat, when the brook is frozen over.', { nodig: n(v.nodig) }));
    }
    if (r.zout) {
      const woorden = { zout: T.hoeveel(v.zout, 'zout'), aantal: T.telwoord(T.BEHOEFTEN_INSTELLINGEN.zoutHoudtGoed), maand: marskramerMaand(D.kalender.dag) };
      zinnen.push(T.kanHandelen(D)
        ? T.t('Without salt it spoils: buy {zout} from the merchant, now that he is here; one salt keeps {aantal} fish or meat good.', woorden)
        : T.t('Without salt it spoils: buy {zout} from the merchant in {maand}; one salt keeps {aantal} fish or meat good.', woorden));
    }
    return zinnen.join(' ');
  }

  // Het eerste wat de huizen missen waar je nu iets aan kunt doen (T.watDeHuizenMissen, js/wensen.js), van deze soort
  // ('bouwstof' of 'wens'), of null.
  const watNuHelpt = (D, soort) => T.watDeHuizenMissen(D).find((x) => x.soort === soort && x.kan) || null;
  // Wat erbij komt als je niet kunt betalen wat helpt: wat je mist, en waar het vandaan komt. Anders hoor je het niet
  // meer, want de wensen gaan voor wat het doel vraagt.
  function wensTekst(D, x) {
    const mist = tekortVoor(D, [x.bouw]);
    if (!mist) return x.tekst;
    const bronnen = waarVandaan(D, mist, x.bouw);
    const woorden = { lijst: hoeveelTekst(mist), bronnen: T.opsomming(bronnen) };
    return `${x.tekst} ${bronnen.length ? T.t('For that you are short of {lijst}: {bronnen}.', woorden) : T.t('For that you are short of {lijst}.', woorden)}`;
  }

  // De marskramer staat op het plein, op zijn laatste ronde vóór de heer komt (js/handel.js).
  function marskramerInDeHerfst(D) {
    const m = D.marskramer;
    return !!(m && m.staat && !m.weg && T.HANDEL_INSTELLINGEN.bezoeken[m.bezoek] && T.HANDEL_INSTELLINGEN.bezoeken[m.bezoek].naam === 'herfst');
  }

  // De raden, van wat het zwaarst weegt naar wat het minst weegt. `als(S)` zegt of hij nu geldt, `tekst(S)` wat er
  // dan staat. Wat aan een dag hangt, gaat voor; dan de winter; dan de eerste dag; dan een vol dorp; dan de afwisseling
  // (vraag 154); dan de wensen (vraag 87); dan de wijn een jaar vooruit (vraag 155); dan het doel en de groei.
  T.RADEN = [
    // Twee bazen (js/bazen.js; werklijst vraag 106): staat een van de twee onder de grens, dan gaat dat voor alles.
    {
      id: 'heerWaarschuwt',
      als: (D) => { const b = T.bazenNu(D); return !!b && b.gunst < T.BAZEN_INSTELLINGEN.waarschuwing; },
      tekst: () => T.t('The lord has given you a final warning. One more setback, and you lose your office.'),
    },
    {
      id: 'dorpMort',
      als: (D) => { const b = T.bazenNu(D); return !!b && b.vertrouwen < T.BAZEN_INSTELLINGEN.waarschuwing; },
      tekst: () => T.t('The village grumbles. One more setback, and they will drive you out: say yes for once, or give a feast.'),
    },
    {
      id: 'heerGoud',
      als: (D) => marskramerInDeHerfst(D) && (D.voorraad.goud || 0) < (T.eisVanDeHeer(D).per.goud || 0),
      tekst: (D) => T.t('The lord wants {eis}, and you have {heb}. The merchant buys grain, as long as he is here.',
        { eis: T.hoeveel(Math.ceil(T.eisVanDeHeer(D).per.goud), 'goud'), heb: Math.floor(D.voorraad.goud || 0) }),
    },
    {
      id: 'rovers',
      als: (D) => D.rovers && D.rovers.laatsteAanval != null && dagNu(D) - D.rovers.laatsteAanval < IN().roversNa && !heeft(D, 'wachthuis'),
      tekst: (D) => {
        const woorden = { gebouw: T.hoofdletter(eenNaam('wachthuis')), n: T.GEBOUWEN.wachthuis.handen, getal: T.telwoord(T.GEBOUWEN.wachthuis.handen) };
        return T.t('The robbers are coming back. {gebouw} [B] gives you {n|{getal} man|{getal} men} to fight at your side.', woorden);
      },
    },
    // De wolven (js/beesten.js; werklijst vraag 116, stap 2b): ze namen een schaap of vielen iemand aan. Wat ertegen helpt:
    // het licht, het hek uit het voorval, en een jager die de roedels klein houdt (stap 3a; is er geen bij de wolven, dan
    // zegt de raad het, met waar hij vandaan komt).
    {
      id: 'wolven',
      als: (D) => T.wolvenBijHetDorp(D, dagNu(D)) != null && D.beesten.gezien.wat !== 'gezien',
      tekst: (D) => {
        const zin = T.t('There are wolves near the village. Anyone who walks alone in the dark at night is in danger; light keeps them away.');
        if (T.jagerBijDeWolven(D)) return zin;
        const jager = T.hoofdletter(eenNaam('jager'));
        return `${zin} ${T.t('{jager} [B] keeps the packs small.', { jager })}`;
      },
    },
    {
      id: 'hout',
      als: (D) => haaltHetNiet(D, T.houtVoorDeWinter),
      tekst: (D) => {
        const nog = heeft(D, 'houthakker');
        const hakker = nog ? naamVan('houthakker') : eenNaam('houthakker');
        const helpt = nog ? T.t('another {hakker} [B] will cut more.', { hakker }) : T.t('build {hakker} [B].', { hakker });
        return `${T.t('The logs last {haalt} of winter: {helpt}', { haalt: haalt(T.houtVoorDeWinter(D, D.kalender.dag)), helpt })}${geenGezin()}`;
      },
    },
    {
      id: 'eten',
      als: (D) => haaltHetNiet(D, T.etenVoorDeWinter),
      // Wat helpt, zegt het dorp ook: wat er nu kan en het meest oplevert (T.watHelptAanEten hieronder; vraag 132, b).
      tekst: (D) => {
        const hulp = T.watHelptAanEten(D).slice(0, 2);
        const woorden = { haalt: haalt(T.etenVoorDeWinter(D, D.kalender.dag)), hulp: T.opsomming(hulp.map((h) => h.zin)) };
        const zin = hulp.length ? T.t('The food lasts {haalt} of winter. What helps: {hulp}.', woorden) : T.t('The food lasts {haalt} of winter.', woorden);
        return `${zin}${geenGezin()}`;
      },
    },
    // Vis en vlees voor de winter (vraag 132, B): zout, en een voorraad voordat de vissers stilliggen.
    {
      id: 'visEnVlees',
      als: (D) => !!T.visEnVleesRaad(D),
      tekst: (D) => visEnVleesTekst(D, T.visEnVleesRaad(D)),
    },
    // De houthakker hakt bomen om (js/bos.js; vraag 115): staat er binnen zijn bereik geen boom meer, dan hakt hij niets,
    // tot de boompjes die hij plantte, bomen zijn, en werkt zijn hand zolang elders (vraag 129, e). Haalt het hout de
    // winter niet, dan zegt de raad daarboven dat een houthakker zou helpen.
    {
      id: 'geenBoom',
      als: (D) => geenBoomMeer(D),
      tekst: () => T.t('The {hakker} stands idle: no tree is left within {n} tiles of his shed, until his saplings are trees. His hand works elsewhere meanwhile.',
        { hakker: naamVan('houthakker'), n: T.telwoord(T.BOS_INSTELLINGEN.hakStraal) }),
    },
    {
      // Marcel koos het zo (vraag 67, B): de raad zegt het zodra er een voorval voorbijging dat een raadsman had
      // beslist (vraag 68, B: je was weg), en de knop Raadsman (R) opent het venster (js/raadsmanvenster.js).
      id: 'raadsman',
      als: (D) => T.RAADSMAN_INSTELLINGEN.aan && !T.raadsmanVan(D) && D.voorvallen && D.voorvallen.laatstVoorbij != null
        && dagNu(D) - D.voorvallen.laatstVoorbij < IN().raadsmanNa,
      tekst: () => T.t('What you miss while you are away passes by: choose an advisor [R].'),
    },
    {
      id: 'tijd',
      als: (D) => D.kalender.dag < 1 && !(D.kalender.snelheid > 1),
      tekst: () => T.t('A day is long: [+] speeds up time, and [Z] sleeps until morning.'),
    },
    {
      // Een nieuw spel begint zonder raadsman, en zonder raadsman geen rapport (js/ochtendrapport.js): de eerste dagen
      // zegt de raad het (werklijst vraag 75, c; Marcel: "c ja").
      id: 'rapport',
      als: (D) => T.OCHTENDRAPPORT_INSTELLINGEN.aan && T.RAADSMAN_INSTELLINGEN.aan && !T.raadsmanVan(D)
        && D.kalender.dag >= 1 && dagNu(D) < T.OCHTENDRAPPORT_INSTELLINGEN.raadTot,
      tekst: () => T.t('An advisor brings you a report every morning: choose one [R].'),
    },
    {
      id: 'plaats',
      als: (D) => mensenNodig(D) > 0 && T.waaromGeenGezin(D).includes('plaats'),
      tekst: () => T.t('No family is coming: the village is full. Build {hut} or {huis}: [B].', { hut: eenNaam('hut'), huis: eenNaam('huis') }),
    },
    // De afwisseling (vraag 154): eet het dorp weinig soorten (afwisselingTot), dan werkt het trager
    // (T.werkVanAfwisseling, js/behoeften.js). Na een vol dorp, want eerst moet iedereen een dak hebben; vóór de wensen.
    {
      id: 'afwisseling',
      als: (D) => {
        const op = (D.behoeften && D.behoeften.afwisseling) || [];
        return op.length > 0 && op.length <= IN().afwisselingTot && T.werkVanAfwisseling(D) < 1 && T.watHelptAanAfwisseling(D).length > 0;
      },
      tekst: (D) => T.t('The village eats only {soorten}, and works at {werk}%. Another kind of food helps: {hulp}.', {
        soorten: T.opsomming(D.behoeften.afwisseling.map((wat) => T.waarNaam(wat))),
        werk: Math.round(T.werkVanAfwisseling(D) * 100),
        hulp: T.opsomming(T.watHelptAanAfwisseling(D).slice(0, 2).map((h) => h.zin)),
      }),
    },
    {
      // De wensen (werklijst vraag 86, a, en 87; Marcel, 2 okt: "a ja"): wat de huizen missen en wat helpt, zoals
      // T.watDeHuizenMissen (js/wensen.js) het zegt, en alleen wat je nu kunt doen. Eerst een huis dat een maand alles had
      // en op bouwstof wacht, dan wat de meeste mensen missen. Vóór wat het doel vraagt, want met de wensen win je (vraag
      // 80): "Five farms and a house want a chapel within 40 tiles [B]."
      id: 'doorgroeien',
      als: (D) => !!watNuHelpt(D, 'bouwstof'),
      tekst: (D) => wensTekst(D, watNuHelpt(D, 'bouwstof')),
    },
    {
      id: 'wens',
      als: (D) => !!watNuHelpt(D, 'wens'),
      tekst: (D) => wensTekst(D, watNuHelpt(D, 'wens')),
    },
    {
      // De wijn (js/wijngaard.js, T.wijnNaDePluk; werklijst vraag 136 en 155; Marcel, 10 okt: "Laten we vooruitkijken
      // doen"): is er een wijnboerderij en haalt wat er bij de pluk ligt plus de pluk het jaar niet, dan moet er een
      // wijngaard bij. Is er geen wijnboerderij, dan zeggen de wensen dat er een bij moet (T.watDeHuizenMissen). Na de
      // wensen: een jaar vooruit kijken, dus het wacht op wat er nu mist.
      id: 'wijn',
      als: (D) => heeft(D, 'wijnboerderij') && !T.wijnNaDePluk(D, D.kalender.dag).haalt,
      tekst: (D) => {
        const v = T.wijnNaDePluk(D, D.kalender.dag);
        const woorden = { dagen: v.dagen, jaar: v.winter, boerderij: naamVan('wijnboerderij') };
        const nog = (D.wereld.wijngaarden || []).length || D.gebouwen.some((g) => g.soort === 'wijngaard');
        return nog
          ? T.t('The wine from the harvest lasts {dagen} of the year\'s {jaar} days: lay another vineyard [B] by the {boerderij}.', woorden)
          : T.t('The wine from the harvest lasts {dagen} of the year\'s {jaar} days: lay a vineyard [B] by the {boerderij}.', woorden);
      },
    },
    {
      // Wat je mist voor wat het doel vraagt, en waar het vandaan komt (werklijst vraag 59, C; Marcel, 1 okt, vraag 78:
      // "D dat is prima"). De tweede bouwer van de speeltest kwam twee goud tekort voor de smidse (29 sep), en goud komt
      // alleen van de marskramer en de belasting.
      id: 'bouwen',
      als: (D) => !!tekortVoorHetDoel(D),
      tekst: (D) => {
        const { soorten, mist } = tekortVoorHetDoel(D);
        const wat = T.opsomming(soorten.map((soort) => T.t('the {gebouw}', { gebouw: naamVan(soort) })));
        return T.t('For {wat} you are short of {lijst}: {bronnen}.', { wat, lijst: hoeveelTekst(mist), bronnen: T.opsomming(waarVandaan(D, mist)) });
      },
    },
    {
      id: 'tevreden',
      als: (D) => mensenNodig(D) > 0 && T.waaromGeenGezin(D).includes('tevreden'),
      tekst: (D) => T.t('No family is coming: the village is {nu}% content, and a family wants {drempel}%.',
        { nu: Math.round(D.behoeften.tevredenheid * 100), drempel: Math.round(T.BEHOEFTEN_INSTELLINGEN.groeiDrempel * 100) }),
    },
    {
      id: 'graan',
      als: (D) => mensenNodig(D) > 0 && T.waaromGeenGezin(D).includes('graan'),
      tekst: () => T.t('No family is coming: there is less than {graan} in store.', { graan: T.hoeveel(T.GEBOUWEN_INSTELLINGEN.graanBufferVoorGroei, 'graan') }),
    },
    {
      id: 'gezin',
      als: (D) => mensenNodig(D) > 0,
      tekst: (D) => T.t('The next family arrives {wanneer}.', { wanneer: over(T.volgendeGezinDag(D) - dagNu(D)) }),
    },
  ];

  // De raad van nu: { id, tekst }, of null. Alleen in het gehucht zelf (een wereld met een plein, waar de heer
  // komt), en niet als de spelregel hem uitzette.
  T.raadNu = function (D) {
    if (!IN().aan || !(D.wereld && D.wereld.plein) || !D.kalender || !D.voorraad) return null;
    for (const r of T.RADEN) if (r.als(D)) return { id: r.id, tekst: r.tekst(D) };
    return null;
  };
})(globalThis.Spel = globalThis.Spel || {});
