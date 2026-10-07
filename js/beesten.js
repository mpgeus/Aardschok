// Het wild in het bos: roedels wolven en groepjes herten (werklijst vraag 116; Marcel, 4 okt: "Ik wil dat er beesten
// kunnen rondlopen in het bos. Wolven etc. Die de houthakker kunnen bedreigen. Rode ogen uit het duister.", en 7 okt:
// "a ja, b ja, c ja").
//
// Stap 1 is het beeld; de regels van het dorp veranderen nog niet:
//   wie      per land zoveel roedels wolven (twee tot vier) en groepjes herten als het bos groot is, elk met een plek
//            diep in het bos: het hol van de roedel, de legerplek van de herten (T.zetBeesten, de eerste keer dat het
//            dorp leeft, in T.werkBeestenBij; ook in een oud bewaard spel).
//   ritme    overdag rusten de wolven bij hun hol; vanaf een uur voor zonsondergang lopen ze naar de bosrand, en 's nachts
//            erlangs, van plek naar plek; na zonsopgang terug. De herten grazen rond zonsopgang en zonsondergang op
//            open grond aan de bosrand, en liggen de rest van de tijd op hun legerplek.
//   schuw    komt er een mens dichtbij (de schout, een bewoner, een bezoeker), dan gaat de groep van hem weg, terug het
//            bos in: de wolven sluipen weg, de herten rennen. Wie sluipt (S), komt dichterbij (T.SLUIP_ZICHT). Een wolf
//            begint nooit zelf een gevecht (T.zoekOntdekking in js/verkennen.js); de schout kan hem wel aanvallen
//            (Marcel: "a ja"). Dat ze in de winter met honger toch komen, is stap 2.
//   groep    alleen de leider zoekt een weg (T.zoekRoute, js/lopen.js); de anderen lopen in zijn spoor (G.spoor), en
//            staan om hem heen als hij stilstaat: Marcels "group steering" (2 okt, werklijst vraag 117). Een roedel
//            kost zo bijna niets.
//   ogen     's nachts lichten de ogen van een wolf rood op (js/tekenen.js, tekenOgen, met beelden/ogen.js).
//
// Stap 2a is het leven in het bos (Marcel, 7 okt: "d ja, e ja, f ja" en "g ja, h ja, i ja"), elke nacht in
// T.tikBeestenDag; ook dit verandert de regels van het dorp nog niet (dat is stap 2b):
//   honger   in de winter krijgt een roedel elke nacht honger, een grote roedel sneller. Met genoeg honger jaagt hij op
//            de herten in zijn bos, en vangt hij er soms een; dan is zijn honger weg (g). Zijn er geen herten, dan
//            blijft de honger, en die doet in stap 2b wat hij doet.
//   jongen   elke lente krijgt elke groep jongen, tot hij groot is (zes); dan splitst hij, en de helft zoekt een eigen
//            thuis als het bos plaats heeft, en trekt anders weg (e). Zonder jager wordt het bos zo elk jaar voller.
//   verhuizen ligt een thuis niet meer diep genoeg in het bos (er kwam een erf, een werkplaats of een akker), dan zoekt
//            de groep dieper een nieuw; is er geen bos meer dat diep genoeg is, dan trekt hij weg (d).
//
// Stap 2b is de dreiging (Marcel, 7 okt: "a ja", en "h ja, i ja"); nu raakt het het dorp:
//   schrik   ziet een roedel met honger iemand die aan het bos werkt, en die hem, dan rent hij naar huis: hij werkt die dag
//            niet meer, en zijn werkplaats maakte die dag de helft (T.blijftThuis, js/bewoners.js). Dat valt vanzelf in
//            het laatste werkuur, want de wolven komen een uur voor zonsondergang naar de rand, en het werk houdt op met de
//            zon; en honger is er alleen in de winter.
//   stout    een roedel met honger is in het donker niet schuw meer (T.wolvenStout): hij zoekt prooi in het dorp, eerst een
//            schaap op de meent (zonder hek), en anders wie alleen in het donker loopt. Hij neemt het schaap, en de herder komt
//            het je de ochtend erna zeggen (het voorval "wolven"); wie hij aanvalt, is gewond en ligt een paar dagen in
//            bed, of is een enkele keer dood (de spelregel "Beesten": "Zonder doden" maakt het alleen gewond).
//   licht    licht houdt hem weg: wie in het licht staat, valt hij niet aan, en bij de schout met zijn lantaarn blijft hij
//            aan de rand van het licht, met zijn ogen. Wie sluipt, heeft geen licht: die valt hij aan, en dan is het een
//            gevecht in beurten.
//   status   "Er zijn wolven bij het dorp" (T.OORZAKEN.wolven, js/voorvallen.js) voor het rapport, zolang ze het laatst
//            iets deden niet lang geleden is; en de raad zegt het.
//
// Een groep is een ding dat de dieren delen (e.groep, zoals e.praatje in js/praatje.js), zonder lijst ernaast:
//   G = { soort ('wolf' of 'hert'), zaad, thuis {x, y} (het hol of de legerplek), rand [{x, y}] (plekken aan de
//         bosrand), bij (bij welke plek van de rand), doel ('thuis' of 'rand'), spoor [{x, y}] (de weg van de leider),
//         wacht (de dag tot wanneer hij op zijn plek aan de rand staat), weg (de dag tot wanneer hij van mensen
//         wegblijft), vluchtNaar {x, y}, keek en zoekt (S.wereldTijd: zijn laatste blik, en wanneer hij weer een weg
//         zoekt als er geen was), honger (dagen, voor een roedel van vier), leedOp (de laatste dag dat hij honger leed:
//         dan geen jongen), gevangen (hoeveel herten de roedel ving),
//         geteld (hoeveel dieren de groep ooit had: het zaad van een jong), jongenJaar (het jaar van de laatste jongen),
//         trektWeg (de groep gaat weg: T.werkBeestenBij haalt hem van de kaart), prooi { e, soort } en prooiDoel (een
//         roedel met honger: wie of wat hij zoekt, en waar zijn leider heen loopt), kiest (S.wereldTijd: wanneer hij weer
//         een prooi kiest) }
// In het dorp: D.beesten = { gezet, gezien { dag, wat ('gezien', 'schaap' of 'aanval'), wie } (het laatste wat de wolven
// bij het dorp deden: de status), roedel (de roedel die het laatst een schaap nam: daar gaat de jacht heen), hek (true:
// een hek om de schapen) }. Op een bewoner: p.thuisTot en p.gewond.
// Op een dier: e.beest (zijn soort), e.groep, e.leider, e.rust (wat het doet als het stilstaat: 'staan', 'grazen',
// 'liggen'; js/sprites.js), e.rent (een hert dat vlucht: dan 'rennen'), e.zoektWeg (S.wereldTijd waarna een volger weer
// een weg mag zoeken). In het dorp: D.beesten = { gezet }.
// Alles komt uit het zaad van het land en van de groep, niet uit Math.random.
(function (T) {
  'use strict';

  // Alle getallen in één blok, zoals elders (CLAUDE.md); ze staan ook in de werkbank (js/opties.js).
  T.BEESTEN_INSTELLINGEN = {
    // De spelregel "Beesten": aan, zonder doden of uit. Uit: ze gaan weg, en er komen er geen. Zonder doden: wie de wolven
    // aanvallen, is gewond, nooit dood.
    aan: true,
    doden: true,
    // Hoeveel groepen er komen: een roedel per zoveel tegels bos (T.isBos, js/bos.js) en een groepje herten per zoveel,
    // minstens een van elk als er zoveel bos is, en niet meer dan zoveel. Op de landen van de maker is het bos 800 tot
    // 1.600 tegels (de rest staat om de kaart heen): een of twee roedels, en een tot vier groepjes herten.
    bosPerRoedel: 700,
    bosPerKudde: 400,
    minstensBos: 300,
    maxRoedels: 3,
    maxKuddes: 4,
    // Zoveel dieren in een groep, van tot.
    roedel: [2, 4],
    kudde: [2, 4],
    // Het hol en de legerplek liggen zoveel stappen in het bos, en zoveel tegels van elkaar.
    diep: 3,
    uitElkaar: 18,
    // Plekken aan de bosrand: zoveel per groep, binnen zoveel tegels van zijn hol en hooguit zoveel stappen lopen
    // (een plek vlak bij het hol kan aan de andere kant van een vijver liggen), en zoveel tegels van elkaar.
    randPlekken: 3,
    randBinnen: 26,
    randLopen: 36,
    randUitElkaar: 5,
    // Zo dicht komt een mens voor de groep weggaat, en zoveel uur blijft hij dan weg van de rand.
    schuw: { wolf: 8, hert: 7 },
    wegUren: 1,
    // Wolven komen zoveel uur voor zonsondergang naar de rand en blijven er tot zonsopgang; herten grazen aan de rand
    // van zoveel uur voor tot zoveel uur na zonsopgang en zonsondergang.
    wolvenVoorDonker: 1,
    hertenRondDeZon: 1.5,
    // Zoveel uur staat een groep op een plek aan de rand, voor hij naar de volgende gaat.
    randUren: [0.6, 1.6],
    // Zoveel blokjes tijd (seconden op het scherm) graast een hert, of staat het om zich heen te kijken, en zo vaak
    // graast het.
    graasBlok: 7,
    grazen: 0.65,

    // ── Stap 2a, het leven in het bos ──
    // De honger (g): in de winter komt er elke nacht een dag honger bij voor een roedel van vier (een roedel van zes
    // anderhalve). Vanaf jagenVanaf jaagt hij 's nachts op de herten in zijn bos (de dichtste groep binnen jaagStraal van
    // zijn hol, waar hij kan komen), en vangt hij er met vangKans een. Buiten de winter vindt hij genoeg.
    honger: { jagenVanaf: 20, jaagStraal: 40, vangKans: 0.2 },
    // Een roedel die de afgelopen winter zoveel honger leed (geen herten), krijgt in de lente geen jongen: zonder prooi
    // groeit hij niet.
    zonderJongen: 45,
    // De jongen (e): op de eerste dag van deze maand krijgt elke groep er zoveel bij, van tot, en niet meer dan tot hij
    // groot is; dan splitst hij. De helft zoekt een eigen thuis als het bos plaats heeft: niet meer roedels dan een per
    // plaatsPerRoedel tegels bos, en groepjes herten een per plaatsPerKudde (bij het begin zijn het er de helft).
    jongen: { wolf: { maand: 'grasmaand', aantal: [1, 2] }, hert: { maand: 'bloeimaand', aantal: [1, 2] } },
    groot: 6,
    plaatsPerRoedel: 500,
    plaatsPerKudde: 200,
    // Een thuis blijft goed zolang het zoveel stappen in het bos ligt (een nieuw ligt er diep); daaronder zoekt de groep
    // een nieuw (d).
    diepBlijven: 2,

    // ── Stap 2b, de dreiging ──
    // Een roedel met zoveel honger is in het donker (vanaf zoveel nacht, T.lichtVan) niet schuw meer: hij zoekt prooi
    // binnen zoekStraal tegels van zijn leider, een schaap op de meent of wie alleen in het donker loopt (niemand anders
    // binnen alleen tegels, en geen licht), en rent erheen. Wie hij aanvalt, ligt gewondDagen dagen in bed, of is met
    // doodKans dood (met de spelregel). Wie aan het werk de wolven ziet, rent naar huis, en zijn werkplaats maakte die dag
    // schrik minder. De status "Wolven" speelt tot statusDagen dagen na wat ze het laatst deden.
    // Wie aan het werk de wolven ziet: alleen wie aan of in het bos werkt (BOSWERK), alleen als de roedel honger heeft
    // (vanaf honger.jagenVanaf: dan laten ze zich zien), en per uur met schrikKans.
    dreiging: { stout: 30, donker: 0.6, zoekStraal: 30, alleen: 4, gewondDagen: 3, doodKans: 0.2, schrik: 0.5, schrikKans: 0.5, statusDagen: 10 },
    // ── Stap 3b, de jacht te voet ──
    // Een jacht op de wolven (het voorval "wolven"; Marcel, 7 okt: "Ja dat is goed"): de mannen van de militie, of zonder
    // militie zoveel weerbare mannen, lopen met de schout mee naar de roedel; komt hij binnen bij tegels van een wolf, dan
    // is het een gevecht in beurten. Gaat hij niet binnen dagen dagen, dan gaan ze zonder hem: de roedel verliest
    // zonderJou wolven, en met sterfkans procent kans komt een van de mannen niet terug.
    jacht: { mannen: 2, bij: 9, dagen: 2, zonderJou: 2, sterfkans: 15 },

    // ── Stap 3a, de jager ──
    // De jager jaagt echt (vraag 116, stap 3; Marcel, 7 okt: "Altijd een paar herten over houden. Anders krijgen we geen
    // jonge hertjes meer"): zijn vlees en huiden (T.GEBOUWEN.jager.maakt) komen uit de herten binnen straal tegels van zijn
    // deur (het thuis van de groep), en elke perDier vlees is er een dier minder. Van een groepje herten laat hij er altijd
    // laatStaan staan; een roedel die groter is dan hooguit, maakt hij kleiner, een wolf per wolfDagen (een wolf is een huid,
    // geen vlees). Is er binnen
    // zijn bereik niets dat hij mag nemen, dan staat hij stil, en werkt zijn hand elders (zoals de houthakker zonder boom).
    // Uit (jaagt: false): zijn vlees komt uit het niets, zoals tot 7 okt. Het poppetje loert op loerAfstand tegels van de
    // groep, loerUren aan een stuk, en gaat dan terug naar zijn hut.
    jager: { jaagt: true, straal: 50, perDier: 30, laatStaan: 2, hooguit: 3, wolfDagen: 5, loerAfstand: 9, loerUren: 2 },
  };
  const IN = () => T.BEESTEN_INSTELLINGEN;

  // Per soort: hoe het heet, hoe snel het loopt en vlucht. De wolf vecht als een monster (T.WEZENS.wolf, js/wereld.js);
  // hier staat alleen hoe hij loopt. Het hert (gereedschap/pixelart/wild.cjs): twee hindes (hert0, hert1) en een hert
  // met een gewei (hert2), dat de groep leidt.
  T.BEESTEN = {
    wolf: { naam: 'wolf', meervoud: 'wolven', snelheid: 1.4, vlucht: 2.2 },
    hert: { naam: 'hert', meervoud: 'herten', snelheid: 1.0, vlucht: 4.0, vellen: ['hert0', 'hert1'], leider: 'hert2' },
  };

  const RICHTINGEN = ['Z', 'ZW', 'W', 'NW', 'N', 'NO', 'O', 'ZO'];
  const BUREN = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, 1], [1, -1], [-1, -1]];
  // Waar de anderen gaan staan als de leider stilstaat: om hem heen, elk op zijn eigen plek.
  const KRING = [[1, 1], [-1, 1], [1, -1], [-1, -1], [2, 0], [0, 2], [-2, 0], [0, -2], [1, 0], [0, 1], [-1, 0], [0, -1], [2, 1], [-1, 2], [1, -2], [-2, -1], [2, 2], [-2, 2], [2, -2], [-2, -2]];
  const lot = (a, b, c) => T.lotVanDier(a, b, c);

  // ---------------------------------------------------------------------------------------------
  // Waar het bos is, en hoe diep
  // ---------------------------------------------------------------------------------------------

  // Per tegel of hij bos is (T.isBos), en hoe ver (in stappen, ook schuin) hij van een tegel ligt die geen bos is. De
  // rand van de kaart telt niet als open grond: daar loopt het bos door (js/tekenen.js tekent het erachter). Met `ookJong`
  // telt wat de houthakker kapt en inplant ook als bos (js/bos.js, vraag 129, f): 's nachts, als een groep kijkt of zijn
  // thuis nog goed is.
  function bosKaart(w, ookJong = false) {
    const H = w.tegels.length;
    const B = w.tegels[0].length;
    const bos = new Uint8Array(B * H);
    const diep = new Int16Array(B * H).fill(-1);
    const rij = [];
    let n = 0;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < B; x++) {
        if (T.isBos(w, x, y, ookJong)) {
          bos[y * B + x] = 1;
          n++;
        } else {
          diep[y * B + x] = 0;
          rij.push(y * B + x);
        }
      }
    }
    for (let k = 0; k < rij.length; k++) {
      const i = rij[k];
      const x = i % B;
      const y = (i - x) / B;
      for (const [dx, dy] of BUREN) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= B || ny >= H) continue;
        const j = ny * B + nx;
        if (diep[j] >= 0) continue;
        diep[j] = diep[i] + 1;
        rij.push(j);
      }
    }
    return { bos, diep, n, B, H };
  }

  // Een tegel waar een dier kan staan: begaanbaar, en niemand erop.
  const vrij = (w, x, y) => T.isBegaanbaar(w, x, y, { wezensBlokkeren: true });

  // Open grond waar een hert graast: geen akker of weide, geen pad, niet op het plein of een erf, en niet bij een gebouw.
  function bebouwd(D) {
    const w = D.wereld;
    const B = w.tegels[0].length;
    const H = w.tegels.length;
    const uit = new Uint8Array(B * H);
    const zet = (x0, y0, b, h, rand) => {
      for (let y = Math.max(0, y0 - rand); y < Math.min(H, y0 + h + rand); y++) {
        for (let x = Math.max(0, x0 - rand); x < Math.min(B, x0 + b + rand); x++) uit[y * B + x] = 1;
      }
    };
    for (const g of D.gebouwen || []) {
      const v = T.voetVanGebouw(g);
      if (v) zet(v.x, v.y, v.b, v.h, 3);
    }
    for (const v of w.akkers || []) zet(v.x, v.y, v.b, v.h, 0);
    for (const e of D.erven || []) zet(e.x, e.y, e.b, e.h, 1);
    return uit;
  }

  // ---------------------------------------------------------------------------------------------
  // De groepen neerzetten
  // ---------------------------------------------------------------------------------------------

  // Zet de roedels en de herten in het bos van dit dorp, uit het zaad van het land. Geeft de groepen. Eén keer per dorp
  // (D.beesten.gezet); T.werkBeestenBij vraagt het zelf.
  T.zetBeesten = function (D) {
    const w = D.wereld;
    const B = D.beesten || (D.beesten = {});
    B.gezet = true;
    if (!w || !w.tegels || !w.tegels.length) return [];
    const kaart = bosKaart(w);
    const zaad = landZaad(D);
    const r = T.dobbelsteen(zaad * 7919 + 116);
    const aantal = (per, max) => (kaart.n < IN().minstensBos ? 0 : Math.max(1, Math.min(max, Math.floor(kaart.n / per))));
    const roedels = aantal(IN().bosPerRoedel, IN().maxRoedels);
    const kuddes = aantal(IN().bosPerKudde, IN().maxKuddes);
    const midden = T.pleinVan(w);
    const open = bebouwd(D);
    const kandidaten = thuisKandidaten(w, kaart, midden, zaad);
    const thuizen = [];
    const groepen = [];
    // Eerst de herten, dan de wolven: een roedel woont alleen waar hij herten kan halen (g), dus waar er een groepje herten
    // binnen jaagStraal woont, waar hij kan komen.
    const prooi = (k) => groepen.some((G) => G.soort === 'hert' && T.afstand(G.thuis, k) <= IN().honger.jaagStraal && T.kanErKomen(w, k, G.thuis));
    for (let i = 0; i < kuddes + roedels; i++) {
      const soort = i < kuddes ? 'hert' : 'wolf';
      const plek = nieuwThuis(w, kaart, open, midden, soort, soort === 'wolf' ? kandidaten.filter(prooi) : kandidaten, thuizen);
      if (!plek) continue;
      thuizen.push(plek.thuis);
      const G = nieuweGroep(soort, Math.floor(r() * 1e9), plek);
      const [van, tot] = soort === 'wolf' ? IN().roedel : IN().kudde;
      plekkenBij(w, G.thuis, van + Math.floor(r() * (tot - van + 1))).forEach((p) => w.wezens.push(maakBeest(G, p, G.geteld++)));
      groepen.push(G);
    }
    return groepen;
  };

  // Het nummer van het land, waar het lot van de beesten uit komt.
  const landZaad = (D) => (D.wereld.maker && D.wereld.maker.zaad) || (D.lot && D.lot.zaad) || 1;

  // Een nieuwe groep, met zijn thuis en zijn plekken aan de rand ({ thuis, rand }, uit nieuwThuis).
  const nieuweGroep = (soort, zaad, plek) => ({
    soort, zaad, thuis: { x: plek.thuis.x, y: plek.thuis.y }, rand: plek.rand.map((q) => ({ x: q.x, y: q.y })),
    bij: 0, doel: 'thuis', spoor: [], wacht: 0, weg: 0, vluchtNaar: null, keek: 0, zoekt: 0, honger: 0, geteld: 0,
  });

  // Een thuis voor een groep van deze soort: de eerste plek uit de kandidaten (thuisKandidaten) die ver genoeg van de
  // andere thuizen ligt (uitElkaar) en plekken aan de rand heeft. Geeft { thuis, rand }, of null. Hooguit `proeven`
  // plekken zoeken hun rand (dat zijn wegen): 's nachts is het niet eindeloos.
  function nieuwThuis(w, kaart, open, midden, soort, kandidaten, thuizen, proeven = Infinity) {
    let n = 0;
    for (const k of kandidaten) {
      if (thuizen.some((t) => T.afstand(t, k) < IN().uitElkaar)) continue;
      if (++n > proeven) break;
      const rand = randVan(w, kaart, open, k, soort, midden);
      if (rand.length) return { thuis: { x: k.x, y: k.y }, rand };
    }
    return null;
  }

  // Plekken voor een hol of een legerplek: diep genoeg in het bos, begaanbaar, en met een weg naar het dorp (anders komt
  // de groep nooit aan de rand). In een volgorde uit het zaad, zodat elk land andere holen heeft. Waar er nu iemand staat,
  // telt niet: dan zijn het dezelfde holen, wanneer ze er ook komen.
  function thuisKandidaten(w, kaart, midden, zaad) {
    const uit = [];
    for (let y = 0; y < kaart.H; y++) {
      for (let x = 0; x < kaart.B; x++) {
        const i = y * kaart.B + x;
        if (!kaart.bos[i] || kaart.diep[i] < IN().diep || !T.isBegaanbaar(w, x, y)) continue;
        uit.push({ x, y, sleutel: lot(zaad, y * kaart.B + x, 117) }); // per tegel: een tegel meer of minder schudt de rest niet
      }
    }
    uit.sort((a, b) => a.sleutel - b.sleutel);
    return midden ? uit.filter((p) => T.kanErKomen(w, p, midden)) : uit;
  }

  // De plekken aan de bosrand waar een groep heen gaat: een wolf net binnen het bos, met het dorp in zicht (de plekken
  // die het dichtst bij het midden van het dorp liggen); een hert op open grond vlak bij het bos, het dichtst bij zijn
  // legerplek. Allemaal binnen randBinnen van zijn thuis, met een weg erheen van hooguit randLopen stappen, en een eind
  // uit elkaar.
  function randVan(w, kaart, open, thuis, soort, midden) {
    const kandidaten = [];
    const R = IN().randBinnen;
    for (let y = Math.max(0, thuis.y - R); y <= Math.min(kaart.H - 1, thuis.y + R); y++) {
      for (let x = Math.max(0, thuis.x - R); x <= Math.min(kaart.B - 1, thuis.x + R); x++) {
        if (!randGoed(w, kaart, open, x, y, soort)) continue;
        const naar = soort === 'wolf' && midden ? midden : thuis;
        kandidaten.push({ x, y, d: Math.hypot(x - naar.x, y - naar.y) });
      }
    }
    kandidaten.sort((a, b) => a.d - b.d);
    const uit = [];
    let gezocht = 0;
    for (const k of kandidaten) {
      if (uit.length >= IN().randPlekken || gezocht >= 40) break;
      if (uit.some((p) => T.afstand(p, k) < IN().randUitElkaar)) continue;
      if (!T.kanErKomen(w, thuis, k)) continue;
      gezocht++;
      const pad = T.zoekRoute(w, thuis, k, { tot: 0 });
      if (!pad || pad.length > IN().randLopen) continue;
      uit.push({ x: k.x, y: k.y });
    }
    return uit;
  }

  // Of een groep van deze soort op (x, y) aan de rand kan staan: een wolf net binnen het bos, een hert op open grond
  // vlak bij het bos (geen akker, weide of erf, geen pad, niet op het plein en niet bij een gebouw).
  function randGoed(w, kaart, open, x, y, soort) {
    const i = y * kaart.B + x;
    if (!T.isBegaanbaar(w, x, y)) return false;
    if (soort === 'wolf') return kaart.bos[i] === 1 && kaart.diep[i] <= 2;
    if (kaart.bos[i] || open[i] || T.opPad(w, x, y) || T.opHetPlein(w, x, y)) return false;
    return BUREN.some(([dx, dy]) => x + dx >= 0 && y + dy >= 0 && x + dx < kaart.B && y + dy < kaart.H && kaart.bos[(y + dy) * kaart.B + (x + dx)]);
  }

  // Zoveel vrije tegels om een plek, de dichtste eerst: waar de dieren van een groep komen te staan, en de jongen.
  function plekkenBij(w, bij, n) {
    const plekken = [];
    const gezien = new Set([`${bij.x},${bij.y}`]);
    const rij = [bij];
    for (let k = 0; k < rij.length && plekken.length < n && k < 400; k++) {
      const p = rij[k];
      if (vrij(w, p.x, p.y) && !plekken.some((q) => q.x === p.x && q.y === p.y)) plekken.push(p);
      for (const [dx, dy] of BUREN) {
        const q = { x: p.x + dx, y: p.y + dy };
        const s = `${q.x},${q.y}`;
        if (gezien.has(s) || !T.isBegaanbaar(w, q.x, q.y)) continue;
        gezien.add(s);
        rij.push(q);
      }
    }
    return plekken;
  }

  // Eén dier: een wolf is een monster om mee te vechten (T.maakWezen, js/wereld.js), een hert loopt als een dorpeling
  // (T.maakDorpeling, js/mensen.js), met het vel van een hinde of, als hij leidt, een hert met een gewei.
  function maakBeest(G, p, i) {
    const soort = T.BEESTEN[G.soort];
    const zaad = (G.zaad + i * 7919) % 1000000007;
    let e;
    if (G.soort === 'wolf') e = T.maakWezen('wolf', p.x, p.y);
    else {
      e = T.maakDorpeling(zaad, p.x, p.y, 0, null);
      e.soort = 'hert';
      e.naam = soort.naam;
      e.vel = i === 0 ? soort.leider : soort.vellen[Math.floor(lot(zaad, 1, 116) * soort.vellen.length)];
    }
    Object.assign(e, {
      beest: G.soort, groep: G, leider: i === 0, dwaalt: false, thuis: null, straal: 0, zaad,
      snelheid: soort.snelheid, rust: G.soort === 'hert' ? 'liggen' : 'staan', rent: false,
      fase: lot(zaad, 2, 116) * 2 * Math.PI,
      beginRichting: RICHTINGEN[Math.floor(lot(zaad, 3, 116) * RICHTINGEN.length)],
    });
    return e;
  }

  // De spelregel ging uit: de dieren gaan weg, het bos in.
  function haalWeg(D) {
    const w = D.wereld;
    if (w) w.wezens = w.wezens.filter((e) => !e.beest);
    D.beesten.gezet = false;
  }

  // ---------------------------------------------------------------------------------------------
  // Elk beeld
  // ---------------------------------------------------------------------------------------------

  // Elk beeld, als er rondgelopen wordt (js/main.js voor waar je bent, T.werkDorpBij in js/dorp.js voor een ander dorp):
  // de groepen kijken of er een mens komt, kiezen waar ze heen gaan naar het uur, en lopen.
  T.werkBeestenBij = function (S, D) {
    const w = D && D.wereld;
    if (!w || !D.kalender) return;
    const B = D.beesten || (D.beesten = {});
    if (!IN().aan) {
      if (B.gezet) haalWeg(D);
      return;
    }
    if (!B.gezet) T.zetBeesten(D);
    if (B.jacht) werkJachtBij(S, D);
    const groepen = new Map();
    let weg = false;
    for (const e of w.wezens) {
      if (!e.groep || e.dood) continue;
      if (e.groep.trektWeg) {
        weg = true;
        continue;
      }
      const leden = groepen.get(e.groep);
      if (leden) leden.push(e);
      else groepen.set(e.groep, [e]);
    }
    // Een groep die wegtrekt (T.tikBeestenDag), gaat van de kaart; niet midden in een gevecht, waar een wolf meevecht.
    if (weg && S.modus !== 'gevecht') w.wezens = w.wezens.filter((e) => !(e.groep && e.groep.trektWeg));
    for (const [G, leden] of groepen) werkGroepBij(S, D, G, leden);
  };

  // Wat een groep nu wil, naar het uur: aan de rand ('rand') of thuis ('thuis').
  T.beestenWillen = function (D, G) {
    const dag = D.kalender.dag;
    const u = T.uurVanDag(dag);
    const zon = T.zonVan(dag);
    if (G.soort === 'wolf') return u >= zon.onder - IN().wolvenVoorDonker || u < zon.op ? 'rand' : 'thuis';
    const r = IN().hertenRondDeZon;
    return Math.abs(u - zon.op) <= r || Math.abs(u - zon.onder) <= r ? 'rand' : 'thuis';
  };

  // De dichtste mens bij een van de dieren, binnen hoe schuw ze zijn: een wezen dat geen dier is, niet dood en niet
  // binnen. Wie sluipt, komt dichterbij. Herten gaan ook voor een wolf weg. Geeft hem, of null.
  function mensBij(S, w, leden, schuw) {
    let beste = null;
    let d = Infinity;
    const hert = leden[0].beest === 'hert';
    for (const m of w.wezens) {
      if (m.dier || m.dood || m.binnen || (m.beest && !(hert && m.beest === 'wolf'))) continue;
      const ver = schuw - (m === S.schout && S.sluipen ? T.SLUIP_ZICHT : 0);
      for (const e of leden) {
        const a = T.afstand(T.tegelVan(m), T.tegelVan(e));
        if (a <= ver && a < d) {
          d = a;
          beste = m;
        }
      }
    }
    return beste;
  }

  function werkGroepBij(S, D, G, leden) {
    const w = D.wereld;
    const dag = D.kalender.dag;
    const t = S.wereldTijd || 0;
    const soort = T.BEESTEN[G.soort];
    let leider = leden.find((e) => e.leider);
    if (!leider) {
      leider = leden[0];
      leider.leider = true;
    }
    // 0. Een roedel met honger, in het donker (stap 2b): niet schuw, maar op zoek naar prooi.
    const stout = G.soort === 'wolf' && T.wolvenStout(D, G);
    // 1. Komt er een mens? Dan weg van hem: naar de plek (zijn thuis of een plek aan de rand) die het verst van hem ligt.
    // Was hij aan het werk, en ziet hij de wolven, dan rent hij naar huis (schrik).
    if (!stout && t >= (G.keek || 0)) {
      G.keek = t + 0.5;
      const mens = mensBij(S, w, leden, IN().schuw[G.soort]);
      if (mens && G.soort === 'wolf') schrik(D, G, mens, leden);
      if (mens) {
        const m = T.tegelVan(mens);
        const naar = [G.thuis, ...G.rand].reduce((a, b) => (T.afstand(b, m) > T.afstand(a, m) ? b : a));
        const nieuw = !(G.weg > dag) || !G.vluchtNaar || G.vluchtNaar.x !== naar.x || G.vluchtNaar.y !== naar.y;
        G.weg = dag + IN().wegUren / 24;
        if (nieuw) {
          G.vluchtNaar = { x: naar.x, y: naar.y };
          G.zoekt = 0;
          for (const e of leden) {
            e.snelheid = soort.vlucht;
            e.rent = G.soort === 'hert';
            if (e === leider && e.pad.length > 1) e.pad = e.pad.slice(0, 1);
          }
        }
      }
    }
    const weg = G.weg > dag;
    if (!weg && G.vluchtNaar) {
      G.vluchtNaar = null;
      for (const e of leden) {
        e.snelheid = soort.snelheid;
        e.rent = false;
      }
    }
    // 2. Waar de groep heen wil: met honger in het donker naar zijn prooi, anders naar het uur.
    const prooi = stout && !weg ? prooiVan(S, D, G, leider, t) : null;
    const wil = weg ? 'weg' : prooi ? 'prooi' : T.beestenWillen(D, G);
    if (wil !== G.doel) {
      G.doel = wil;
      G.wacht = 0;
      G.zoekt = 0;
      if (leider.pad.length > 1) leider.pad = leider.pad.slice(0, 1); // zijn stap af, en dan een nieuwe weg
      if (wil === 'rand' && G.rand.length) G.bij = Math.floor(lot(G.zaad, Math.floor(dag), 7) * G.rand.length);
    }
    const doel = wil === 'weg' ? G.vluchtNaar : wil === 'prooi' ? prooi.doel : wil === 'rand' && G.rand.length ? G.rand[G.bij % G.rand.length] : G.thuis;
    // Een prooi loopt: is hij een eind van waar de leider heen gaat, dan een nieuwe weg. Op jacht rennen ze.
    if (wil === 'prooi' && (!G.prooiDoel || T.afstand(G.prooiDoel, doel) >= 2)) {
      G.prooiDoel = { x: doel.x, y: doel.y };
      G.zoekt = 0;
      if (leider.pad.length > 1) leider.pad = leider.pad.slice(0, 1);
    }
    if (wil !== 'prooi') G.prooiDoel = null;
    if (!weg) for (const e of leden) e.snelheid = wil === 'prooi' && prooi.slaat ? soort.vlucht : soort.snelheid;
    // 3. De leider zoekt een weg; staat hij aan de rand, dan na een tijd naar de volgende plek.
    const lt = T.tegelVan(leider);
    const daar = T.afstand(lt, doel) <= 1;
    if (!leider.pad.length) {
      if (!daar) {
        if (t >= (G.zoekt || 0)) {
          // Tot op de plek zelf: een plek van een hert aan de rand is open grond, en de tegel ernaast misschien bos.
          const pad = T.zoekRoute(w, lt, doel, { tot: 0 });
          if (pad && pad.length) {
            T.geefRoute(leider, pad, { x: doel.x, y: doel.y, tot: 1 });
            // Zijn spoor is zijn hele weg, van waar hij vertrekt: de anderen lopen hem af.
            G.spoor = [{ x: lt.x, y: lt.y }, ...pad.map((q) => ({ x: q.x, y: q.y }))];
          } else G.zoekt = t + 10; // geen weg: over een poos opnieuw, niet elk beeld
        }
      } else if (wil === 'rand' && G.rand.length > 1) {
        const [van, tot] = IN().randUren;
        if (!G.wacht) G.wacht = dag + (van + lot(G.zaad, Math.floor(dag * 24), 9) * (tot - van)) / 24;
        else if (dag >= G.wacht) {
          G.bij = (G.bij + 1) % G.rand.length;
          G.wacht = 0;
        }
      }
    }
    // Liep de leider om (een omweg om wie er stond, js/lopen.js), dan begint zijn spoor opnieuw, bij waar hij nu is.
    const eind = G.spoor[G.spoor.length - 1];
    const pe = leider.pad[leider.pad.length - 1];
    if (leider.pad.length && (!eind || !pe || eind.x !== pe.x || eind.y !== pe.y || leider.pad.length >= G.spoor.length)) {
      G.spoor = [{ x: lt.x, y: lt.y }, ...leider.pad.map((q) => ({ x: q.x, y: q.y }))];
    }
    // Een hert rent tot de groep er is; wie dan stilstaat, rent niet meer.
    if (weg && G.soort === 'hert' && daar) for (const e of leden) if (!e.pad.length) e.rent = false;
    // Is de roedel bij zijn prooi, dan slaat hij toe (stap 2b).
    if (wil === 'prooi' && prooi.slaat && T.afstand(T.tegelVan(leider), T.tegelVan(prooi.e)) <= 1) slaToe(S, D, G, leider, prooi);
    // 4. De anderen: in het spoor van de leider zolang hij loopt, en om hem heen als hij staat.
    let i = 0;
    for (const e of leden) {
      if (e === leider) continue;
      i++;
      volg(w, G, leider, e, i, t);
    }
    // 5. Wat ze doen als ze stilstaan: thuis liggen de herten (en de wolven, als hun vel het kan), aan de rand grazen de
    // herten of kijken ze om zich heen, en staan de wolven.
    const thuis = wil === 'thuis' && daar;
    for (const e of leden) {
      if (thuis) e.rust = 'liggen';
      else if (G.soort === 'hert' && wil === 'rand') e.rust = lot(e.zaad, Math.floor((S.tijd || 0) / IN().graasBlok + lot(e.zaad, 5, 116) * 4), 6) < IN().grazen ? 'grazen' : 'staan';
      else e.rust = 'staan';
    }
  }

  // Eén dier dat volgt (de i-de achter de leider): loopt de leider, dan zijn spoor (zijn weg) af tot 2·i stappen achter
  // hem (staat hij al verder, dan wacht hij); staat de leider, dan komt hij bij hem staan, op zijn eigen plek in de kring
  // (KRING), als hij er nog niet vlakbij staat.
  function volg(w, G, leider, e, i, t) {
    if (e.pad.length) return;
    const et = T.tegelVan(e);
    const lt = T.tegelVan(leider);
    if (leider.pad.length) {
      const s = G.spoor;
      const bij = Math.max(0, s.length - 1 - leider.pad.length); // waar de leider nu is op zijn spoor
      const k = Math.max(0, bij - 2 * i);
      const doel = s[k];
      if (!doel || (doel.x === et.x && doel.y === et.y)) return;
      let j = -1;
      for (let m = k + 2 * i; m >= 0; m--) {
        if (s[m] && s[m].x === et.x && s[m].y === et.y) {
          j = m;
          break;
        }
      }
      if (j > k) return;
      if (j >= 0) T.geefRoute(e, s.slice(j + 1, k + 1).map((p) => ({ x: p.x, y: p.y })), doel);
      else naar(w, e, doel, t);
      return;
    }
    if (T.afstand(et, lt) <= 2) return;
    for (let n = 0; n < KRING.length; n++) {
      const [dx, dy] = KRING[(i - 1 + n) % KRING.length];
      if (!vrij(w, lt.x + dx, lt.y + dy)) continue;
      naar(w, e, { x: lt.x + dx, y: lt.y + dy }, t);
      return;
    }
  }

  // Een dier naar een tegel: een stap als hij ernaast staat, anders een weg, en vindt hij die niet, dan niet elk beeld
  // opnieuw (e.zoektWeg).
  function naar(w, e, p, t) {
    const et = T.tegelVan(e);
    if (T.afstand(et, p) <= 1) {
      T.geefRoute(e, [{ x: p.x, y: p.y }], p);
      return;
    }
    if (t < (e.zoektWeg || 0)) return;
    const pad = T.zoekRoute(w, et, p, { tot: 1 });
    if (pad && pad.length) T.geefRoute(e, pad, { x: p.x, y: p.y, tot: 1 });
    else e.zoektWeg = t + 3;
  }

  // ---------------------------------------------------------------------------------------------
  // Elke nacht: het leven in het bos (stap 2a)
  // ---------------------------------------------------------------------------------------------

  // Elke nacht (T.tikGebouwenDag in js/gebouwen.js, na het bos): wie zijn thuis kwijt is, zoekt een nieuw of trekt weg
  // (d); in de winter krijgen de roedels honger en jagen ze op de herten (g); en in de lente komen er jongen (e). `nu` is
  // voor Spel.debug.beesten: { jongen: true } geeft de jongen vandaag, { jacht: true } laat elke roedel nu jagen, alsof
  // het winter is en hij honger heeft.
  T.tikBeestenDag = function (D, dag, nu = {}) {
    const w = D.wereld;
    // Wie de wolven beten, is na zijn dagen in bed weer beter (T.blijftThuis, js/bewoners.js).
    for (const p of (D.bewoners && D.bewoners.mensen) || []) {
      if (p.thuisTot != null && dag >= p.thuisTot) {
        delete p.thuisTot;
        delete p.gewond;
      }
    }
    if (!IN().aan || !D.beesten || !D.beesten.gezet || !w || !w.tegels || !w.tegels.length) return;
    // Een wolf die in een gevecht viel, ligt er niet meer.
    if (w.wezens.some((e) => e.beest && e.dood)) w.wezens = w.wezens.filter((e) => !(e.beest && e.dood));
    let groepen = T.beestenVan(D).filter(({ G }) => !G.trektWeg);
    if (!groepen.length) return;
    const kaart = bosKaart(w, true);
    const open = bebouwd(D);
    const midden = T.pleinVan(w);
    const datum = T.datumVanDag(dag);
    for (const g of groepen) blijfOfVerhuis(D, kaart, open, midden, g, groepen);
    groepen = groepen.filter(({ G }) => !G.trektWeg);
    for (const g of groepen) if (g.G.soort === 'wolf') jaag(D, g, groepen, datum, dag, nu.jacht);
    groepen = groepen.filter(({ leden }) => leden.length);
    for (const g of [...groepen]) jongen(D, kaart, open, midden, g, groepen, datum, dag, nu.jongen);
  };

  // Ligt het thuis van een groep nog diep genoeg in het bos (diepBlijven), en zijn zijn plekken aan de rand nog goed?
  // Kan alleen de rand niet meer, dan zoekt hij een nieuwe rand; ligt zijn thuis niet meer in het bos, dan een nieuw thuis,
  // zo dicht bij het oude als het kan (d). Vindt hij er geen, dan trekt hij weg, en zegt het dorp het.
  function blijfOfVerhuis(D, kaart, open, midden, { G }, groepen) {
    const w = D.wereld;
    const i = G.thuis.y * kaart.B + G.thuis.x;
    const thuisGoed = kaart.bos[i] === 1 && kaart.diep[i] >= IN().diepBlijven;
    if (thuisGoed && G.rand.length && G.rand.every((p) => randGoed(w, kaart, open, p.x, p.y, G.soort))) return;
    let plek = null;
    if (thuisGoed) {
      const rand = randVan(w, kaart, open, G.thuis, G.soort, midden);
      if (rand.length) plek = { thuis: G.thuis, rand };
    }
    if (!plek) {
      const kandidaten = thuisKandidaten(w, kaart, midden, landZaad(D)).sort((a, b) => T.afstand(a, G.thuis) - T.afstand(b, G.thuis));
      const thuizen = groepen.filter((g) => g.G !== G && !g.G.trektWeg).map((g) => g.G.thuis);
      plek = nieuwThuis(w, kaart, open, midden, G.soort, kandidaten, thuizen, 15);
    }
    if (plek) {
      Object.assign(G, { thuis: { x: plek.thuis.x, y: plek.thuis.y }, rand: plek.rand, bij: 0, wacht: 0, doel: null });
      return;
    }
    G.trektWeg = true;
    T.zeg(D, `De ${T.BEESTEN[G.soort].meervoud} zijn weggetrokken: hun bos is te klein geworden.`, G.soort === 'wolf' ? 'goed' : '');
  }

  // De honger van een roedel en zijn jacht (g): in de winter komt er elke nacht een dag honger bij, voor een roedel van
  // vier (een grotere roedel heeft sneller honger); buiten de winter vindt hij genoeg. Met genoeg honger jaagt hij op de
  // herten in zijn bos: de dichtste groep binnen jaagStraal van zijn hol waar hij kan komen. Vangt hij er een (vangKans),
  // dan is zijn honger weg. Hij vangt het laatste dier van de groep, en het hert dat leidt pas als het alleen is.
  function jaag(D, { G, leden }, groepen, datum, dag, nu) {
    const h = IN().honger;
    if (!nu && datum.seizoen !== 'winter') {
      G.honger = 0;
      return;
    }
    G.honger = nu ? Math.max(G.honger || 0, h.jagenVanaf) : (G.honger || 0) + leden.length / 4;
    if (G.honger >= IN().zonderJongen) G.leedOp = Math.floor(dag); // honger geleden: deze lente geen jongen
    if (G.honger < h.jagenVanaf) return;
    const w = D.wereld;
    const herten = groepen
      .filter((g) => g.G.soort === 'hert' && g.leden.length && T.afstand(g.G.thuis, G.thuis) <= h.jaagStraal && T.kanErKomen(w, G.thuis, g.G.thuis))
      .sort((a, b) => T.afstand(a.G.thuis, G.thuis) - T.afstand(b.G.thuis, G.thuis));
    if (!herten.length || lot(G.zaad, Math.floor(dag), 31) >= h.vangKans) return;
    const prooi = herten[0].leden;
    const hert = prooi.filter((e) => !e.leider).pop() || prooi[0];
    prooi.splice(prooi.indexOf(hert), 1);
    w.wezens = w.wezens.filter((e) => e !== hert);
    G.honger = 0;
    G.gevangen = (G.gevangen || 0) + 1;
  }

  // De jongen (e): op de eerste dag van hun maand krijgt elke groep er een of twee bij, bij zijn thuis, en niet meer dan
  // tot hij groot is; is hij dat, dan splitst hij.
  function jongen(D, kaart, open, midden, g, groepen, datum, dag, nu) {
    const { G, leden } = g;
    const j = IN().jongen[G.soort];
    if (!nu && (datum.dagVanMaand !== 1 || T.MAANDEN[datum.maand].naam !== j.maand || G.jongenJaar === datum.jaar)) return;
    G.jongenJaar = datum.jaar;
    // Een roedel die deze winter honger leed, krijgt geen jongen (zonderJongen).
    if (!nu && G.leedOp != null && dag - G.leedOp < 4 * T.DAGEN_PER_MAAND) return;
    G.geteld = Math.max(G.geteld || 0, leden.length);
    const [van, tot] = j.aantal;
    const n = Math.min(van + Math.floor(lot(G.zaad, Math.floor(dag), 41) * (tot - van + 1)), Math.max(0, IN().groot - leden.length));
    for (const p of plekkenBij(D.wereld, G.thuis, n)) {
      const e = maakBeest(G, p, G.geteld++);
      D.wereld.wezens.push(e);
      leden.push(e);
    }
    if (leden.length >= IN().groot) splits(D, kaart, open, midden, g, groepen);
  }

  // Een groep die groot is, splitst (e): de tweede helft gaat met een eigen leider een eigen thuis zoeken, als het bos
  // plaats heeft (niet meer roedels dan een per plaatsPerRoedel tegels bos, en groepjes herten een per plaatsPerKudde, en
  // ver genoeg van de andere thuizen); anders trekt die helft weg. Wie een groepje herten gaat leiden, krijgt een gewei.
  function splits(D, kaart, open, midden, g, groepen) {
    const { G, leden } = g;
    const helft = leden.filter((e) => !e.leider).slice(-Math.floor(leden.length / 2));
    const zelfde = groepen.filter((x) => x.G.soort === G.soort && !x.G.trektWeg).length;
    const plaats = Math.floor(kaart.n / (G.soort === 'wolf' ? IN().plaatsPerRoedel : IN().plaatsPerKudde));
    const thuizen = groepen.filter((x) => !x.G.trektWeg).map((x) => x.G.thuis);
    const plek = zelfde < plaats ? nieuwThuis(D.wereld, kaart, open, midden, G.soort, thuisKandidaten(D.wereld, kaart, midden, landZaad(D)), thuizen, 15) : null;
    const G2 = nieuweGroep(G.soort, Math.floor(lot(G.zaad, G.geteld, 43) * 1e9), plek || G);
    Object.assign(G2, { honger: G.honger, jongenJaar: G.jongenJaar, geteld: helft.length, trektWeg: !plek });
    helft.forEach((e, i) => {
      e.groep = G2;
      e.leider = i === 0;
      leden.splice(leden.indexOf(e), 1);
    });
    if (G.soort === 'hert') helft[0].vel = T.BEESTEN.hert.leider;
    groepen.push({ G: G2, leden: helft });
  }

  // ---------------------------------------------------------------------------------------------
  // De dreiging (stap 2b)
  // ---------------------------------------------------------------------------------------------

  // Is deze roedel nu stout: met zoveel honger (dreiging.stout; honger komt alleen in de winter, js/beesten.js hierboven)
  // en in het donker. Dan is hij niet schuw meer, maar zoekt hij prooi.
  T.wolvenStout = function (D, G) {
    return G.soort === 'wolf' && (G.honger || 0) >= IN().dreiging.stout && T.lichtVan(D.kalender.dag).nacht >= IN().dreiging.donker;
  };

  // Werk aan of in het bos (e.werkt.soort, js/veldwerk.js): de houthakker aan zijn boom, wie sprokkelt, rooit of ontgint.
  const BOSWERK = new Set(['hakken', 'rooien', 'ontginnen', 'sprokkelen']);

  // Wie aan het bos werkt en een wolf van deze roedel ziet, rent naar huis: hij werkt die dag niet meer (T.blijftThuis,
  // js/bewoners.js), en wat zijn werkplaats die dag maakte (T.tikGebouwenDag schreef het bij het begin van de dag bij),
  // gaat voor zijn deel voor de helft weer af. Alleen een roedel met honger laat zich zo zien (vanaf honger.jagenVanaf;
  // anders blijft hij uit het zicht), en per uur met schrikKans. Het dorp zegt het als de status "Wolven" begint, niet
  // elke keer (Marcel, 1 okt: een toestand is een status).
  function schrik(D, G, mens, leden) {
    const w = D.wereld;
    const dag = D.kalender.dag;
    if (!mens.werkt || !BOSWERK.has(mens.werkt.soort) || mens === D.schout || (G.honger || 0) < IN().honger.jagenVanaf) return;
    if (lot(G.zaad, Math.floor(dag * 24), 61) >= IN().dreiging.schrikKans) return;
    const p = T.bewonerVan(D, mens);
    if (!p || T.blijftThuis(p, dag)) return;
    const m = T.tegelVan(mens);
    if (!leden.some((e) => T.zichtTussen(w, m, T.tegelVan(e)))) return;
    p.thuisTot = Math.floor(dag) + T.dagindeling(dag).werkEind / 24;
    const g = p.werk;
    const maakt = g && T.GEBOUWEN[g.soort] && T.GEBOUWEN[g.soort].maakt;
    if (maakt && maakt.uit && g.werkte) {
      const handen = D.bewoners.mensen.filter((q) => q.werk === g).length || 1;
      for (const [wat, n] of Object.entries(T.maaktUit(D, T.GEBOUWEN[g.soort]))) {
        const minder = Math.min(D.voorraad[wat] || 0, (n * g.werkte * IN().dreiging.schrik) / handen);
        if (minder > 0) T.wijzigVoorraad(D, wat, -minder);
      }
    }
    const nieuw = T.wolvenBijHetDorp(D, dag) == null;
    D.beesten.gezien = { dag, wat: 'gezien', wie: T.naamVanBewoner(p) };
    if (nieuw) T.zeg(D, `${T.naamVanBewoner(p)} zag wolven bij de bosrand, en rende naar huis.`);
  }

  // Wat een roedel met honger zoekt: elke halve seconde kiest hij opnieuw (kiesProoi), en daartussen houdt hij wat hij
  // had, zolang dat er nog is. Geeft { e, soort, doel (waar de leider heen loopt), slaat (of hij er toeslaat) }, of null.
  // Bij de schout met zijn lantaarn blijft hij aan de rand van het licht, en slaat hij niet toe.
  function prooiVan(S, D, G, leider, t) {
    const w = D.wereld;
    const oud = G.prooi;
    if (t >= (G.kiest || 0) || !oud || oud.e.dood || oud.e.binnen || !w.wezens.includes(oud.e)) {
      G.kiest = t + 0.5;
      G.prooi = kiesProoi(D, leider);
    }
    const P = G.prooi;
    if (!P) return null;
    if (P.soort === 'schout' && T.draagtLantaarn(D)) return { ...P, doel: randVanHetLicht(w, P.e, T.tegelVan(leider)), slaat: false };
    return { ...P, doel: T.tegelVan(P.e), slaat: true };
  }

  // De prooi: eerst een schaap (het dichtste, waar het ook staat), zonder hek om de schapen; anders de dichtste binnen
  // zoekStraal van de leider: wie van het dorp alleen in het donker buiten is (niemand anders binnen `alleen` tegels, en
  // geen licht om hem heen), of de schout. Geeft { e, soort ('schaap', 'mens' of 'schout') } of null.
  function kiesProoi(D, leider) {
    const w = D.wereld;
    const lt = T.tegelVan(leider);
    const R = IN().dreiging.zoekStraal;
    const bronnen = T.lichtBronnen(D);
    const inLicht = (q) => bronnen.some((b) => Math.hypot(b.x - q.x, b.y - q.y) <= b.straal);
    const mensen = w.wezens.filter((e) => (e.bewoner || e.werkAkkers || e === D.schout) && !e.binnen && !e.dood && !e.beest);
    let beste = null;
    let d = Infinity;
    const neem = (e, soort) => {
      const a = T.afstand(lt, T.tegelVan(e));
      if (a <= R && a < d) {
        d = a;
        beste = { e, soort };
      }
    };
    if (!D.beesten.hek) {
      let schaap = null;
      for (const e of w.wezens) if (e.dier === 'schaap' && !e.dood && (!schaap || T.afstand(lt, T.tegelVan(e)) < T.afstand(lt, T.tegelVan(schaap)))) schaap = e;
      if (schaap && T.kanErKomen(w, lt, T.tegelVan(schaap))) return { e: schaap, soort: 'schaap' };
    }
    for (const e of mensen) {
      if (e === D.schout) {
        if (!T.schoutIsWeg(D)) neem(e, 'schout');
        continue;
      }
      const q = T.tegelVan(e);
      if (inLicht(q) || mensen.some((m) => m !== e && T.afstand(T.tegelVan(m), q) <= IN().dreiging.alleen)) continue;
      neem(e, 'mens');
    }
    return beste;
  }

  // Waar een roedel blijft staan bij de schout met zijn lantaarn: net buiten zijn licht (T.ZIEN_INSTELLINGEN.lantaarn),
  // aan de kant waar de leider staat.
  function randVanHetLicht(w, s, lt) {
    const r = T.ZIEN_INSTELLINGEN.lantaarn.straal + 1.5;
    const dx = lt.x - s.x;
    const dy = lt.y - s.y;
    const d = Math.hypot(dx, dy) || 1;
    if (d >= r - 0.5 && d <= r + 1) return { x: lt.x, y: lt.y };
    const p = { x: Math.round(s.x + (dx / d) * r), y: Math.round(s.y + (dy / d) * r) };
    return T.isBegaanbaar(w, p.x, p.y) ? p : plekkenBij(w, p, 1)[0] || { x: lt.x, y: lt.y };
  }

  // De roedel slaat toe: een schaap neemt hij mee, en de herder zegt het je de ochtend erna; wie hij aanvalt, is gewond
  // of dood (bijt); de schout zonder licht vecht met hem, in beurten. Daarna is zijn honger weg (een gevecht beslist zelf),
  // en gaat hij terug naar zijn hol. Ook voor Spel.debug.beesten('schaap').
  T.wolvenSlaanToe = (S, D, G, leider, prooi) => slaToe(S, D, G, leider, prooi);
  function slaToe(S, D, G, leider, prooi) {
    const dag = D.kalender.dag;
    const B = D.beesten;
    if (prooi.soort === 'schout') {
      if (S.modus === 'verkennen' && S.wereld === D.wereld && !S.spreektMet) T.startGevecht(S, leider, false);
    } else if (prooi.soort === 'schaap') {
      T.verliesDier(D, prooi.e);
      B.gezien = { dag, wat: 'schaap', wie: null };
      B.roedel = G;
      T.zeg(D, 'De wolven hebben een schaap van de meent gehaald.', 'gevaar');
      wolvenVoorval(D, dag);
    } else {
      const p = T.bewonerVan(D, prooi.e);
      if (!p) {
        G.prooi = null; // geen mens van het dorp (meer): een andere prooi
        return;
      }
      bijt(D, G, p, dag);
    }
    if (prooi.soort !== 'schout') G.honger = 0;
    G.prooi = null;
    G.weg = dag + IN().wegUren / 24;
    G.vluchtNaar = { x: G.thuis.x, y: G.thuis.y };
  }

  // Wie de wolven aanvallen: met de spelregel een enkele keer dood (doodKans), anders gewond, een paar dagen in bed.
  function bijt(D, G, p, dag) {
    const naam = T.naamVanBewoner(p);
    D.beesten.gezien = { dag, wat: 'aanval', wie: naam };
    if (IN().doden && lot(G.zaad, Math.floor(dag * 24), 53) < IN().dreiging.doodKans) {
      T.wijzigBevolking(D, -1, 'wolven', 'In het donker vielen de wolven aan', [p]);
      return;
    }
    p.thuisTot = Math.floor(dag) + 1 + IN().dreiging.gewondDagen;
    p.gewond = true;
    T.zeg(D, `${naam} is in het donker door de wolven gebeten, en ligt ${T.telwoord(IN().dreiging.gewondDagen)} dagen in bed.`, 'gevaar');
  }

  // Het voorval "wolven" (js/voorvallen.js, met de vlag wolvenNamenSchaap: dan zijn de antwoorden echt): de herder, of een
  // man, komt het je zeggen, de ochtend erna. Loopt er al een voorval, dan wacht het (V.wacht), en komt er geen tweede.
  function wolvenVoorval(D, dag) {
    const V = D.voorvallen || (D.voorvallen = T.nieuweVoorvallen());
    if (V.wacht.some((x) => x.id === 'wolven') || (V.lopend && V.lopend.id === 'wolven')) return;
    const morgen = Math.floor(dag) + (T.uurVanDag(dag) >= 12 ? 1 : 0);
    const mensen = T.wieZegtHet(D, 'wolven', morgen);
    if (!mensen) return; // er is niemand die het kan zeggen
    if (V.lopend) {
      V.wacht.push({ id: 'wolven', op: morgen, wie: mensen.wie, ander: mensen.ander, vlaggen: ['wolvenNamenSchaap'] });
      return;
    }
    const L = T.beginVoorval(D, 'wolven', mensen.wie, mensen.ander, morgen);
    L.vlaggen = ['wolvenNamenSchaap'];
    T.zetVlag(D, 'wolvenNamenSchaap');
  }

  // ---------------------------------------------------------------------------------------------
  // De jager (stap 3a)
  // ---------------------------------------------------------------------------------------------

  // Jaagt deze jager echt: een jager, de spelregel "Beesten" aan, de beesten gezet, en jager.jaagt? Anders maakt hij zijn
  // vlees uit het niets (het ontworpen gehucht heeft geen beesten).
  const isJager = (g) => g.soort === 'jager';
  const jaagtEcht = (D, g) => isJager(g) && IN().aan && IN().jager.jaagt && !!(D.beesten && D.beesten.gezet);

  // Wat deze jager binnen zijn bereik mag nemen (jager.straal tegels van zijn deur tot het thuis van de groep, waar hij kan
  // komen, het dichtste eerst): { hert: het groepje herten met meer dan jager.laatStaan dieren, wolf: de roedel die groter
  // is dan jager.hooguit }, elk { G, leden } of null. Zet g.wild: het thuis van de groep waar hij op jaagt (de roedel
  // eerst), of null: dan staat hij stil.
  T.wildVanJager = function (D, g) {
    if (!jaagtEcht(D, g)) {
      delete g.wild;
      return { hert: null, wolf: null };
    }
    const w = D.wereld;
    const deur = T.deurVan(w, g);
    const J = IN().jager;
    const groepen = deur ? T.beestenVan(D).filter(({ G }) => !G.trektWeg && T.afstand(deur, G.thuis) <= J.straal && T.kanErKomen(w, deur, G.thuis)) : [];
    groepen.sort((a, b) => T.afstand(deur, a.G.thuis) - T.afstand(deur, b.G.thuis));
    const wild = {
      hert: groepen.find(({ G, leden }) => G.soort === 'hert' && leden.length > J.laatStaan) || null,
      wolf: groepen.find(({ G, leden }) => G.soort === 'wolf' && leden.length > J.hooguit) || null,
    };
    const op = wild.wolf || wild.hert;
    g.wild = op ? { x: op.G.thuis.x, y: op.G.thuis.y, soort: op.G.soort } : null;
    return wild;
  };

  // Staat deze jager stil omdat er binnen zijn bereik niets is dat hij mag nemen (g.wild null, gezet door
  // T.wildVanJager)? Dan wil hij geen handen (T.verdeelHanden, js/gebouwen.js), zoals de houthakker zonder boom.
  T.jagerZonderWild = (g) => isJager(g) && g.wild === null;

  // Waarom deze jager vandaag niet jaagt (T.tikGebouwenDag, vóór zijn werk), of null.
  T.waaromJaagtHijNiet = function (D, g) {
    if (!jaagtEcht(D, g)) return null;
    const wild = T.wildVanJager(D, g);
    if (wild.hert || wild.wolf) return null;
    return `er is binnen ${T.telwoord(IN().jager.straal)} tegels van zijn hut geen wild meer dat hij mag schieten (de laatste herten laat hij staan voor de jongen)`;
  };

  // Een dier uit een groep halen: het laatste, de leider nooit. Geeft het dier, of null.
  function neemUit(D, g, { G, leden }) {
    const dier = leden.filter((e) => !e.leider).pop();
    if (!dier) return null;
    leden.splice(leden.indexOf(dier), 1);
    D.wereld.wezens = D.wereld.wezens.filter((e) => e !== dier);
    g.gevangen = g.gevangen || {};
    g.gevangen[G.soort] = (g.gevangen[G.soort] || 0) + 1;
    return dier;
  }

  // Wat deze jager vandaag maakt (T.tikGebouwenDag, uit T.maaktUit): is er geen hert dat hij mag nemen, dan jaagt hij op
  // de wolven, en een wolf is een huid, geen vlees.
  T.watDeJagerSchiet = function (D, g, uit) {
    if (!uit || !jaagtEcht(D, g) || T.wildVanJager(D, g).hert) return uit;
    const zonder = { ...uit };
    delete zonder.vlees;
    return zonder;
  };

  // Na zijn werk van vandaag (T.tikGebouwenDag): het vlees dat hij maakte, kwam uit de herten (g.gejaagd), en elke
  // jager.perDier is er een hert minder. Een roedel die te groot is, verliest elke jager.wolfDagen een wolf. Morgen kiest
  // hij opnieuw. `werkte`: hoeveel van een dag hij werkte (de factor van T.tikGebouwenDag).
  T.jagerJaagde = function (D, g, vlees, dag, werkte = 1) {
    if (!jaagtEcht(D, g) || !(werkte > 0)) return;
    let wild = T.wildVanJager(D, g);
    if (wild.hert) g.gejaagd = (g.gejaagd || 0) + (vlees || 0);
    while (g.gejaagd >= IN().jager.perDier && wild.hert) {
      g.gejaagd -= IN().jager.perDier;
      neemUit(D, g, wild.hert);
      wild = T.wildVanJager(D, g);
    }
    if (wild.wolf && !(dag - (g.wolfDag ?? -Infinity) < IN().jager.wolfDagen) && neemUit(D, g, wild.wolf)) {
      g.wolfDag = dag;
      T.zeg(D, wild.wolf.leden.length > IN().jager.hooguit ? 'De jager schoot een wolf.' : 'De jager schoot een wolf: de roedel is weer klein.', 'goed');
    }
    T.wildVanJager(D, g);
  };

  // Is er een jager die de wolven in de gaten houdt: een jager die echt jaagt, met een roedel binnen zijn bereik? Voor
  // de raad en de status: zonder is "geen jager" de oorzaak die je had kunnen zien.
  T.jagerBijDeWolven = function (D) {
    const J = IN().jager;
    const roedels = T.beestenVan(D).filter(({ G }) => G.soort === 'wolf' && !G.trektWeg);
    return (D.gebouwen || []).some((g) => g.klaar && jaagtEcht(D, g) && roedels.some(({ G }) => {
      const deur = T.deurVan(D.wereld, g);
      return deur && T.afstand(deur, G.thuis) <= J.straal;
    }));
  };

  // Een jacht op de wolven (het voorval "wolven"): de roedel die het laatst een schaap nam (of, is die er niet meer, de
  // roedel met de meeste honger) verliest er zoveel, de leider het laatst. Geeft hoeveel.
  T.jaagOpDeWolven = function (D, n = IN().jacht.zonderJou) {
    const doel = roedelVoorDeJacht(D);
    if (!doel) return 0;
    const weg = doel.leden.filter((e) => !e.leider).concat(doel.leden.filter((e) => e.leider)).slice(0, n);
    D.wereld.wezens = D.wereld.wezens.filter((e) => !weg.includes(e));
    T.zeg(D, weg.length === doel.leden.length ? 'De jacht: de roedel is er niet meer.' : `De jacht: ${T.telwoord(weg.length)} ${weg.length === 1 ? 'wolf' : 'wolven'} minder.`, 'goed');
    return weg.length;
  };

  // De roedel waar een jacht heen gaat: die het laatst een schaap nam, of, is die er niet meer, die met de meeste honger.
  // Geeft { G, leden } of null.
  function roedelVoorDeJacht(D) {
    const roedels = T.beestenVan(D).filter(({ G }) => G.soort === 'wolf' && !G.trektWeg);
    return roedels.find(({ G }) => G === D.beesten.roedel) || roedels.sort((a, b) => (b.G.honger || 0) - (a.G.honger || 0))[0] || null;
  }

  // ---------------------------------------------------------------------------------------------
  // De jacht te voet (stap 3b)
  // ---------------------------------------------------------------------------------------------
  // D.beesten.jacht = { roedel (G), tot (de dag waarop de mannen zonder je gaan), mannen [wezens] }, zolang hij loopt.

  // Een jacht begint (het voorval "wolven", doe.jacht): de mannen van de militie (T.militieVan, js/rovers.js), of zonder
  // militie de weerbare mannen (T.weerbareMannen, js/bewoners.js), komen bij de schout en lopen met hem mee.
  T.beginJacht = function (D, dag) {
    const doel = roedelVoorDeJacht(D);
    if (!doel) {
      T.zeg(D, 'De wolven zijn al weg: er is niets meer om op te jagen.');
      return null;
    }
    const militie = T.militieVan(D);
    const mannen = (militie.length ? militie : T.weerbareMannen(D).filter((p) => p.wezen && !p.wezen.dood).slice(0, IN().jacht.mannen).map((p) => p.wezen));
    for (const e of mannen) T.roepOp(e);
    D.beesten.jacht = { roedel: doel.G, tot: dag + IN().jacht.dagen, mannen };
    const wie = mannen.length ? `${T.opsomming(mannen.map((e) => e.naam))} ${mannen.length === 1 ? 'gaat' : 'gaan'} met je mee` : 'Er is niemand die meegaat';
    T.zeg(D, `De jacht op de wolven: ${wie}. Hun hol ligt in het bos, in goud op de grond. Ga je niet binnen ${T.telwoord(IN().jacht.dagen)} dagen, dan gaan ze zonder je.`);
    return D.beesten.jacht;
  };

  // Elk beeld (T.werkBeestenBij): de mannen lopen met de schout mee, en komt hij binnen jacht.bij tegels van een wolf van
  // de roedel, dan begint het gevecht. Is zijn tijd om, dan gaan ze zonder hem.
  function werkJachtBij(S, D) {
    const J = D.beesten.jacht;
    const leden = D.wereld.wezens.filter((e) => e.groep === J.roedel && !e.dood);
    if (!leden.length || J.roedel.trektWeg) {
      eindJacht(D, 'De jacht: de roedel is weg.');
      return;
    }
    if (S.modus === 'gevecht' || S.modus === 'overgang' || S.modus === 'dood') return;
    if (D.kalender.dag >= J.tot) {
      zonderJou(D, J);
      return;
    }
    if (T.schoutIsWeg(D)) return;
    for (const e of J.mannen) if (!e.dood && e.opgeroepen && !e.onderweg) T.loopNaastDeSchout(D, e);
    if (S.modus !== 'verkennen' || S.wereld !== D.wereld || S.spreektMet) return;
    const h = T.tegelVan(D.schout);
    let wolf = null;
    for (const e of leden) if (T.afstand(h, T.tegelVan(e)) <= IN().jacht.bij && (!wolf || T.afstand(h, T.tegelVan(e)) < T.afstand(h, T.tegelVan(wolf)))) wolf = e;
    if (!wolf) return;
    J.gevecht = true;
    T.startGevecht(S, wolf, true);
  }

  // De tijd is om: de mannen gingen zonder de schout. De roedel verliest wolven, en een van de mannen komt misschien
  // niet terug.
  function zonderJou(D, J) {
    const dag = D.kalender.dag;
    const mannen = J.mannen.filter((e) => !e.dood);
    T.jaagOpDeWolven(D);
    if (mannen.length && lot(J.roedel.zaad, Math.floor(dag), 61) < IN().jacht.sterfkans / 100) {
      const e = mannen[Math.floor(lot(J.roedel.zaad, Math.floor(dag), 63) * mannen.length)];
      const p = T.bewonerVan(D, e);
      if (p) T.wijzigBevolking(D, -1, 'wolven', 'Hij kwam niet terug van de jacht op de wolven', [p]);
    }
    eindJacht(D, mannen.length ? 'De mannen gingen zonder je op jacht.' : null);
  }

  // Na een gevecht (T.eindeGevecht, js/gevecht.js): was het de jacht, dan is hij voorbij. Wie van de roedel overbleef,
  // vlucht naar zijn hol.
  T.naJacht = function (D) {
    const J = D.beesten && D.beesten.jacht;
    if (!J || !J.gevecht) return;
    const leden = D.wereld.wezens.filter((e) => e.groep === J.roedel && !e.dood);
    const dood = D.wereld.wezens.filter((e) => e.groep === J.roedel && e.dood).length;
    if (leden.length) {
      J.roedel.weg = D.kalender.dag + IN().wegUren / 24;
      J.roedel.vluchtNaar = { x: J.roedel.thuis.x, y: J.roedel.thuis.y };
    }
    eindJacht(D, !leden.length ? 'De jacht: de roedel is er niet meer.' : dood ? `De jacht: ${T.telwoord(dood)} ${dood === 1 ? 'wolf' : 'wolven'} minder, de rest is gevlucht.` : 'De jacht: de wolven zijn gevlucht.');
  };

  // De jacht is voorbij: de mannen gaan naar huis of aan het werk.
  function eindJacht(D, tekst) {
    const J = D.beesten.jacht;
    for (const e of J.mannen) if (!e.dood) T.laatGaan(e);
    D.beesten.jacht = null;
    if (tekst) T.zeg(D, tekst, 'goed');
  }

  // Het hol waar de jacht heen gaat, voor js/tekenen.js (in goud op de grond): { x, y }, of null.
  T.holVanDeJacht = function (D) {
    const J = D && D.beesten && D.beesten.jacht;
    return J ? { x: J.roedel.thuis.x, y: J.roedel.thuis.y } : null;
  };

  // Een hek om de schapen (het voorval "wolven"): een roedel met honger laat ze voortaan met rust, en zoekt andere prooi.
  T.hekOmDeSchapen = function (D) {
    (D.beesten || (D.beesten = {})).hek = true;
  };

  // De status "Wolven" (T.OORZAKEN.wolven, js/voorvallen.js): speelt hij, dan waarom (het stuk na "want"; '' als ze alleen
  // gezien zijn), anders null. Hij speelt tot statusDagen na wat de wolven het laatst bij het dorp deden.
  T.wolvenBijHetDorp = function (D, dag) {
    const g = D.beesten && D.beesten.gezien;
    if (!IN().aan || !g || dag - g.dag > IN().dreiging.statusDagen) return null;
    if (g.wat === 'gezien') return '';
    return T.beestenVan(D).some(({ G }) => G.soort === 'hert') ? 'ze hebben honger' : 'de herten in het bos zijn op';
  };

  // ---------------------------------------------------------------------------------------------
  // Voor het scherm en de muis
  // ---------------------------------------------------------------------------------------------

  // De groepen van een dorp, met hun dieren: [{ G, leden }].
  T.beestenVan = function (D) {
    const uit = new Map();
    for (const e of (D && D.wereld && D.wereld.wezens) || []) {
      if (!e.groep || e.dood) continue;
      if (!uit.has(e.groep)) uit.set(e.groep, []);
      uit.get(e.groep).push(e);
    }
    return [...uit].map(([G, leden]) => ({ G, leden }));
  };
})(globalThis.Spel = globalThis.Spel || {});
