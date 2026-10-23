// De bewoners: wie er in het dorp woont, met wie en in welk huis, en wie waar werkt. Werklijst punt
// 3b, stap 2: mensen worden poppetjes (ontwerp/spel.md, "Mensen worden poppetjes"; Marcel: "Ja, zo",
// 26 sep). Regels zonder scherm, zoals js/dag.js; toetsen in test/bewoners.test.cjs.
//
// Het getal in de balk (S.bevolking) blijft de waarheid: eten, groei, de winter en het hoofdgeld
// rekenen ermee, en het verandert alleen via T.wijzigBevolking (js/gebouwen.js). De bewoners zijn wie
// het zijn: één per mond, elk met een naam, een leeftijd, een huis en een poppetje. Wat hier staat:
//   - wie er bij een nieuw spel woont (T.zetBeginBewoners): op elke boerderij een gezin van drie, bij de aanvoerder zijn vrouw en drie kinderen (Marcel koos het,
//     26 sep, vraag 27), en in een gewoon huis wie de kaart zegt: een oud stel, of een jong gezin
//     (Marcel koos het, 26 sep, vraag 31);
//   - wie erbij komt of weggaat als het getal verandert (T.bewonersVolgen, vanuit T.wijzigBevolking):
//     een nieuw gezin in een huis met plaats, of wie sterft of wegtrekt;
//   - dat je ze ziet komen en gaan (T.werkBewonersBij, elk beeld; stuk 2): een nieuw gezin komt overdag
//     over de weg binnen en loopt naar zijn huis, een gezin dat wegtrekt loopt de weg af, en het
//     bericht zegt wie het zijn, ook wie in de winter sterft;
//   - wie waar werkt (T.werkendeHanden, T.wijsWerkToe): hoeveel handen een gebouw krijgt, zegt nog
//     steeds T.verdeelHanden (js/gebouwen.js); hier staat wíé dat zijn, en wie werk heeft, houdt het;
//   - de plekken waar iemand heen gaat: zijn deur (T.deurVan), de put, zijn werk, en waar hij is als
//     hij vrij is. Wannéér hij waar is, zegt de dag: T.dagAnker in js/dag.js, voor iedereen;
//   - wie het is, bij de muis (T.overBewonerTekst).
//
// De aanvoerder en de vijf boeren stonden er al (de kaart zet ze neer): zij zijn ook bewoners, en hun
// poppetje is het wezen dat er al was. Voor de rest maakt dit bestand een poppetje.
(function (T) {
  'use strict';

  // Alle getallen in één blok, zoals elders (CLAUDE.md); ze staan ook in de werkbank (js/opties.js).
  // Een eerste voorstel van Claude (26 sep).
  T.BEWONERS_INSTELLINGEN = {
    // Hoe snel ze lopen, in tegels per seconde bij 1× (de boeren lopen 1,4 à 1,5).
    snelheidVolwassen: 1.35,
    snelheidKind: 1.6,
    snelheidOud: 1.0,
    // Hoe ver ze rondlopen rond hun plek, in tegels. Het erf staat bij de dag
    // (T.DAG_INSTELLINGEN.erfStraal); een oude en een kleuter blijven dichter bij huis.
    straalBijHuis: 1,
    straalWerk: 2,
    straalPut: 1,
    straalPlein: 3,
    straalHeide: 4,
    // Kleren naar stand (vraag 149; T.klerenVan): wie in een hut woont, draagt arme kleren, en wie in een stenen huis of
    // een woontoren woont, deftige. Alleen beeld. Een optie in de spelregels ("Kleren").
    klerenNaarStand: true,
  };
  const IN = () => T.BEWONERS_INSTELLINGEN;
  const erfStraal = () => (T.DAG_INSTELLINGEN ? T.DAG_INSTELLINGEN.erfStraal : 2);

  // Een leeftijd zegt welk vel iemand draagt (per geslacht), hoe snel hij loopt, en of hij kan werken:
  // `werkt` is de volgorde waarin het dorp hem daarvoor neemt (eerst de volwassenen, dan de
  // jongeren, de kinderen en de ouden); een kleuter werkt niet. Een jongere is een knaap of een meid
  // van twaalf tot zeventien. Er is nog geen eigen vel voor een knaap: hij draagt dat van een jongen.
  T.LEEFTIJDEN = {
    volwassen: { man: 'boer', vrouw: 'boerin', snelheid: 'snelheidVolwassen', werkt: 0 },
    jong: { man: 'jongen', vrouw: 'meisje', snelheid: 'snelheidKind', werkt: 1 },
    kind: { man: 'jongen', vrouw: 'meisje', snelheid: 'snelheidKind', werkt: 2 },
    oud: { man: 'oudeman', vrouw: 'boerin-grijsaard', snelheid: 'snelheidOud', werkt: 3 },
    kleuter: { man: 'kleuter', vrouw: 'kleuter', snelheid: 'snelheidKind', werkt: null },
  };

  // Engelse voornamen uit de middeleeuwen (Marcel, 11 okt: "Engelse namen"; ontwerp/engels.md; tot dan oude
  // Nederlandse). De namen van de boeren staan in T.MENSEN en in de spelregels. Niemand krijgt een naam die al in het
  // dorp is, zolang er nog een vrije is.
  T.VOORNAMEN = {
    man: [
      'Adam', 'Alan', 'Bartholomew', 'Edmund', 'Geoffrey', 'Gilbert', 'Godfrey', 'Hamon', 'Henry', 'Hugh', // geen tekst
      'John', 'Lambert', 'Laurence', 'Martin', 'Osbert', 'Peter', 'Ralph', 'Reginald', 'Richard', 'Robert', // geen tekst
      'Roger', 'Simon', 'Stephen', 'Thomas', 'Wat', 'William', // geen tekst
    ],
    vrouw: [
      'Agnes', 'Amice', 'Avice', 'Beatrice', 'Cecily', 'Christina', 'Edith', 'Emma', 'Hawise', 'Isabel', // geen tekst
      'Joan', 'Juliana', 'Lettice', 'Mabel', 'Margery', 'Matilda', 'Maud', 'Petronilla', 'Rose', 'Sybil', // geen tekst
      'Thomasina', // geen tekst
    ],
  };

  // Wie er in een gezin woont naast het hoofd, als [band, leeftijd, geslacht]; de band is wat hij van
  // het hoofd is ("zoon van Klaas"). Het hoofd is de aanvoerder, of bij een nieuw gezin een man. (Tot ronde 2 van het snoeien,
  // stap 6, woonden er ook boerengezinnen, een oud stel en een jong gezin die de kaart in een huis zette: het dorp dat er
  // al was.)
  // Het gezin van de aanvoerder: zijn vrouw en drie kinderen (Marcel, 26 sep, vraag 27).
  const AANVOERDERSGEZIN = [['vrouw', 'volwassen', 'vrouw'], ['zoon', 'kind', 'man'], ['dochter', 'kind', 'vrouw'], ['zoon', 'kleuter', 'man']];
  // Een nieuw gezin (js/gebouwen.js, T.GEBOUWEN_INSTELLINGEN.gezinGrootte): een man, een vrouw, en de
  // rest kinderen, geloot uit deze.
  const NIEUWE_KINDEREN = [['zoon', 'kind', 'man'], ['dochter', 'kind', 'vrouw'], ['zoon', 'kleuter', 'man'], ['dochter', 'kleuter', 'vrouw']];
  // Wie van een gezin 's ochtends water haalt bij de put: de eerste die er is.
  const WATERHALERS = ['vrouw', 'schoondochter', 'dochter', 'zoon'];

  // ---------------------------------------------------------------------------------------------
  // Wie iemand is
  // ---------------------------------------------------------------------------------------------

  // Een bewoner (S.bewoners.mensen):
  //   { id: 7, naam: 'Geert', geslacht: 'man', leeftijd: 'jong',   // T.LEEFTIJDEN
  //     gezin: 3, hoofd: <het hoofd van zijn gezin, of null>, band: 'zoon',
  //     huis: <gebouw in S.gebouwen>, werk: <gebouw, of null>, wezen: <zijn poppetje>,
  //     haaltWater: true,          // hij gaat 's ochtends naar de put
  //     plek: { put, werk, vrij,   // waar hij heen gaat (zetPlekken hieronder); T.dagAnker kiest
  //             heen },            // en hoeveel uur hij onderweg is naar zijn werk (T.werkUrenVan)
  //     komt: true,                // hij is nieuw en nog niet bij zijn huis (T.werkBewonersBij)
  //     aanvoerder: true,              // alleen de aanvoerder zelf
  //     weg: { waarom: 'heervaart' },  // hij is een tijd weg (T.stuurWeg): hij telt mee, maar werkt nergens
  //     veteraan: true,            // hij kwam terug van de heervaart, en vecht mee als er rovers komen
  //     soldaat: { wapen, wachthuis } } // hij is soldaat (js/soldaten.js): hij werkt nergens, en staat overdag bij het wachthuis
  // Wie wegtrekt, staat niet meer in S.bewoners.mensen; zijn poppetje loopt nog tot de uitgang
  // (e.vertrekt, S.bewoners.vertrekken).

  // Hoe hij heet: een boer zoals T.MENSEN (en de spelregels) het zeggen, de aanvoerder "the commander". Ook
  // voor de herberg (js/herberg.js).
  const naamVan = (p) => (p.aanvoerder ? T.t('the commander') : p.naam);
  T.naamVanBewoner = naamVan;
  // Hoort hij bij het gezin van de aanvoerder?
  const vanAanvoerder = (p) => !!(p.aanvoerder || (p.hoofd && p.hoofd.aanvoerder));
  T.vanAanvoerder = vanAanvoerder;
  // Kan hij werken? Iedereen, behalve de aanvoerder zelf, een kleuter, en wie een tijd weg is (p.weg: de heervaart,
  // js/heervaart.js). Het gezin van de aanvoerder werkt alleen als er niemand anders meer is (T.wijsWerkToe).
  // Wie rooit wat er staat waar zijn huis groter wordt, werkt nog nergens (js/bos.js; vraag 130).
  // Wie in de wijnboerderij woont, plukt in wijnmaand (`g.plukt`, js/wijngaard.js) en werkt dan nergens anders. En een
  // soldaat werkt nergens (p.soldaat, js/soldaten.js; vraag 159: "een soldaat is voltijds").
  const kanWerken = (p) => !p.aanvoerder && !p.weg && !p.soldaat && !(p.huis && p.huis.plukt) && !(p.huis && p.huis.groeitNaRooien && !p.hoofd) && !!T.LEEFTIJDEN[p.leeftijd] && T.LEEFTIJDEN[p.leeftijd].werkt != null;
  T.kanWerken = kanWerken;

  // De bewoner van een poppetje: een nieuw poppetje draagt hem mee (e.bewoner); de aanvoerder heeft zijn wezen al van de
  // kaart, en die zoeken we op.
  T.bewonerVan = function (D, e) {
    if (!e) return null;
    if (e.bewoner) return e.bewoner;
    return (D && D.bewoners && D.bewoners.mensen.find((p) => p.wezen === e)) || null;
  };

  // ---------------------------------------------------------------------------------------------
  // Plekken: een deur, de put, het plein, en waar iemand werkt
  // ---------------------------------------------------------------------------------------------

  // De rechthoek die een gebouw beslaat (T.voetVanGebouw, js/gebouwen.js).
  const voetVan = (g) => T.voetVanGebouw(g);

  // De begaanbare tegel rond een rechthoek die het dichtst bij `bij` ligt, of null.
  function tegelRond(w, r, bij) {
    let beste = null;
    let afstand = Infinity;
    for (let y = r.y - 1; y <= r.y + r.h; y++) {
      for (let x = r.x - 1; x <= r.x + r.b; x++) {
        const rand = x < r.x || x >= r.x + r.b || y < r.y || y >= r.y + r.h;
        if (!rand || !T.isBegaanbaar(w, x, y)) continue;
        const a = Math.hypot(x - bij.x, y - bij.y);
        if (a < afstand) {
          afstand = a;
          beste = { x, y };
        }
      }
    }
    return beste;
  }

  // De begaanbare tegel die het dichtst bij een punt ligt (het punt zelf als dat kan), of null.
  function tegelBij(w, punt, ver) {
    const cx = Math.round(punt.x);
    const cy = Math.round(punt.y);
    for (let r = 0; r <= (ver || 6); r++) {
      let beste = null;
      let afstand = Infinity;
      for (let y = cy - r; y <= cy + r; y++) {
        for (let x = cx - r; x <= cx + r; x++) {
          if (Math.max(Math.abs(x - cx), Math.abs(y - cy)) !== r || !T.isBegaanbaar(w, x, y)) continue;
          const a = Math.hypot(x - punt.x, y - punt.y);
          if (a < afstand) {
            afstand = a;
            beste = { x, y };
          }
        }
      }
      if (beste) return beste;
    }
    return null;
  }

  // De deur van een gebouw: de tegel voor zijn deur. Een huis van de huizenbouwer weet zelf waar die
  // is (`deur` bij zijn tekening, tegels/huizen.tsx: links- of rechtsvoor, of achter het huis, naar
  // het plein); een oudere tekening niet, en dan is het de tegel midden voor zijn voorkant, aan de
  // kant van het zuiden. Kan dat niet, dan de begaanbare tegel rond zijn voet die daar het dichtst
  // bij ligt.
  T.deurVan = function (w, g) {
    const v = voetVan(g);
    const eigen = deurVanTekening(g);
    // (een tent in het kamp zegt zijn deur zelf: voor zijn opening, js/begin.js)
    const voor = g.deur ? { x: g.deur.x, y: g.deur.y } : eigen ? { x: v.x + eigen[0], y: v.y + eigen[1] } : { x: v.x + Math.floor(v.b / 2), y: v.y + v.h };
    if (!w || T.isBegaanbaar(w, voor.x, voor.y)) return voor;
    return tegelRond(w, v, voor) || voor;
  };

  // [dx, dy] vanaf de achterste tegel van de voet, of null: wat de tekening van dit gebouw zegt
  // (een gebouw dat je bouwt en een gebouw op de kaart kennen allebei hun `tekening`).
  function deurVanTekening(g) {
    if (!g.tekening || !T.opzoekTegelNaam) return null;
    const opz = T.opzoekTegelNaam(g.tekening);
    return opz && opz.eig && opz.eig.deur ? opz.eig.deur : null;
  }

  // Het plein, als één plek: waar de marskramer zijn waar uitstalt en de heer op Sint-Maarten staat
  // (D.plek.marskramer, van de maker, js/maker.js).
  T.pleinVan = function (D) {
    const b = D && D.plek && D.plek.marskramer;
    return b ? { x: b.x, y: b.y } : null;
  };

  // Een plek óp het plein, voor wie daar speelt of rondhangt: de kinderen, en wie geen werk heeft. Elk
  // krijgt zijn eigen plek (n: zijn nummer), zodat ze over het hele plein verspreid zijn en niet
  // allemaal bij de marskramer staan. Heeft de kaart geen plein (T.opHetPlein, js/wereld.js), dan null.
  // `tegels`: die van het plein waar je op kunt (T.pleinVrij), als wie voor iedereen een plek zoekt ze al heeft.
  T.plekOpHetPlein = function (D, n, tegels = T.pleinVrij(D)) {
    const t = tegels.length ? tegels[(Math.imul(n | 0, 2654435761) >>> 0) % tegels.length] : null;
    return t ? { x: t.x, y: t.y } : null;
  };

  // De tegels van het plein waar je nu op kunt: één keer voor iedereen die elke dag zijn plek krijgt (T.wijsWerkToe),
  // niet voor elk kind opnieuw (18 okt: 262 tegels per kind, twee derde van het verdelen van het werk).
  T.pleinVrij = (D) => T.pleinTegels(D).filter((t) => T.isBegaanbaar(D.wereld, t.x, t.y));

  // De put het dichtst bij deze tegel, als plek om te staan: een begaanbare tegel ernaast. Een put
  // staat op de kaart als voorwerp (in het gehucht op het plein), of is gebouwd (T.GEBOUWEN.put).
  function putBij(D, w, van) {
    const putten = T.plekkenVan(D, 'put');
    let beste = null;
    let afstand = Infinity;
    for (const r of putten) {
      const a = Math.hypot(r.x + r.b / 2 - van.x, r.y + r.h / 2 - van.y);
      if (a < afstand) {
        afstand = a;
        beste = r;
      }
    }
    const t = beste && tegelRond(w, beste, van);
    return t ? { x: t.x, y: t.y, straal: IN().straalPut } : null;
  }

  // Waar iemand werkt: op de heide bij de schapen (de herder), op het erf van een boerderij, en
  // anders bij de deur van zijn werkplaats. Een eigen plek per soort werk (de houthakker bij de
  // bomen, de visser aan het water) komt later (ontwerp/opmerkingen.md). Een soldaat staat bij zijn wachthuis
  // (js/soldaten.js).
  function werkplekVan(D, w, p) {
    const g = p.werk || (p.soldaat && p.soldaat.wachthuis);
    if (!g) return null;
    if (g.soort === 'schaapskooi') {
      const meent = T.meentVan(w);
      const t = meent && tegelBij(w, { x: meent.x + (meent.b - 1) / 2, y: meent.y + (meent.h - 1) / 2 });
      if (t) return { x: t.x, y: t.y, straal: IN().straalHeide };
    }
    const d = T.deurVan(w, g);
    return { x: d.x, y: d.y, straal: g.soort === 'boerderij' ? erfStraal() : IN().straalWerk };
  }

  // Waar iemand is als hij vrij is, overdag: een kind of een jongere speelt op het plein, en daar hangt
  // ook rond wie volwassen is en geen werk heeft (zo zie je dat er een werkplaats bij moet). Een oude
  // en een kleuter blijven bij huis, en de vrouw van de aanvoerder doet zijn huishouden.
  function vrijePlekVan(D, w, p, deur, plein) {
    const bijHuis = { x: deur.x, y: deur.y, straal: IN().straalBijHuis };
    if (p.leeftijd === 'oud' || p.leeftijd === 'kleuter') return bijHuis;
    if (p.leeftijd === 'volwassen' && vanAanvoerder(p)) return { x: deur.x, y: deur.y, straal: erfStraal() };
    const hier = T.plekOpHetPlein(D, p.id, plein) || T.pleinVan(D);
    const t = hier && tegelBij(w, hier);
    return t ? { x: t.x, y: t.y, straal: IN().straalPlein } : bijHuis;
  }

  // Hoe lang iemand onderweg is van `van` naar `doel` (tot binnen doel.straal), in uren (stuk 2; Marcel
  // koos op 26 sep de looptijd): langs de weg die zijn poppetje ook loopt (T.zoekRoute, js/lopen.js: om
  // wat vaststaat), met zijn eigen snelheid, en schuin telt als √2, zoals bij het lopen zelf (js/anim.js). Een
  // uur is T.DAG_LENGTE / 24 seconden van de wereld. Een pad zoeken kost een paar milliseconden, en dit
  // gebeurt elke dag voor iedereen; daarom bewaart hij zijn weg per doel (p.wegen[sleutel]: 'werk', of
  // 'herberg' in js/herberg.js), zolang begin en doel dezelfde zijn en er niets op staat.
  T.looptijdVan = function (w, p, van, doel, sleutel) {
    if (!doel) return 0;
    const straal = doel.straal || 0;
    const wegen = p.wegen || (p.wegen = {});
    let o = wegen[sleutel];
    const zelfde = o && o.van.x === van.x && o.van.y === van.y && o.doel.x === doel.x && o.doel.y === doel.y && o.straal === straal;
    if (!zelfde || !o.pad.every((t) => T.isBegaanbaar(w, t.x, t.y))) {
      const pad = T.zoekRoute(w, van, doel, { tot: straal, veld: true });
      let lengte = 0;
      let vorig = van;
      for (const t of pad || []) {
        lengte += Math.hypot(t.x - vorig.x, t.y - vorig.y);
        vorig = t;
      }
      // Geen weg (een kaart die niet overal aansluit): hemelsbreed.
      if (!pad) lengte = Math.max(0, T.afstand(van, doel) - straal);
      o = wegen[sleutel] = { van: { x: van.x, y: van.y }, doel: { x: doel.x, y: doel.y }, straal, pad: pad || [], lengte };
    }
    // Zijn eigen snelheid: die van zijn poppetje (een boer loopt zoals T.MENSEN zegt), anders die van
    // zijn leeftijd.
    const snelheid = (p.wezen && p.wezen.snelheid) || IN()[T.LEEFTIJDEN[p.leeftijd].snelheid] || 1;
    return o.lengte / snelheid / (T.DAG_LENGTE / 24);
  };
  // Van zijn deur naar zijn werk.
  const looptijd = (w, p, deur) => T.looptijdVan(w, p, deur, p.plek.werk, 'werk');

  // Zijn plekken opnieuw uitrekenen: bij een nieuw poppetje, en elke dag na het verdelen van het werk
  // (zijn werk kan veranderd zijn). T.dagAnker (js/dag.js) kiest er per deel van de dag een uit.
  // `plein`: de vrije tegels van het plein (T.pleinVrij), als de aanroeper ze voor iedereen al heeft.
  function zetPlekken(D, p, plein) {
    const w = D.bewoners && D.bewoners.wereld;
    if (!w || p.aanvoerder) return;
    const deur = T.deurVanBewoner(D, p);
    p.plek = { put: putBij(D, w, deur), werk: werkplekVan(D, w, p), vrij: vrijePlekVan(D, w, p, deur, plein) };
    p.plek.heen = looptijd(w, p, deur);
  }
  T.zetPlekken = zetPlekken; // ook als iemand soldaat wordt of zijn wapen inlevert (js/soldaten.js)

  // ---------------------------------------------------------------------------------------------
  // Gezinnen en poppetjes
  // ---------------------------------------------------------------------------------------------

  // Een naam die nog niet in het dorp is, zolang dat kan.
  function kiesNaam(D, geslacht, r) {
    const lijst = T.VOORNAMEN[geslacht] || T.VOORNAMEN.man;
    const bezet = new Set(D.bewoners.mensen.map(naamVan));
    const vrij = lijst.filter((n) => !bezet.has(n));
    const uit = vrij.length ? vrij : lijst;
    return uit[Math.floor(r() * uit.length)];
  }

  function nieuweBewoner(D, velden) {
    const p = Object.assign({ werk: null, wezen: null, hoofd: null, band: null, haaltWater: false, plek: null }, velden);
    p.id = D.bewoners.volgende++;
    D.bewoners.mensen.push(p);
    return p;
  }

  // De anderen van een gezin bij het hoofd zetten, als [band, leeftijd, geslacht].
  function zetGezin(D, hoofd, anderen, r) {
    const leden = [hoofd];
    for (const [band, leeftijd, geslacht] of anderen) {
      leden.push(nieuweBewoner(D, { naam: kiesNaam(D, geslacht, r), geslacht, leeftijd, band, hoofd, gezin: hoofd.gezin, huis: hoofd.huis }));
    }
    for (const band of WATERHALERS) {
      const p = leden.find((x) => x !== hoofd && x.band === band);
      if (p) {
        p.haaltWater = true;
        break;
      }
    }
    return leden;
  }

  const partnerVan = (hoofd) => (hoofd.geslacht === 'vrouw' ? ['man', 'volwassen', 'man'] : ['vrouw', 'volwassen', 'vrouw']);

  // Een nieuw gezin van `n` mensen in huis g: een man, een vrouw, en de rest kinderen.
  function nieuwGezin(D, g, n, r) {
    const hoofd = nieuweBewoner(D, { naam: kiesNaam(D, 'man', r), geslacht: 'man', leeftijd: 'volwassen', gezin: D.bewoners.gezinnen++, huis: g });
    const anderen = [];
    if (n >= 2) anderen.push(partnerVan(hoofd));
    const kinderen = NIEUWE_KINDEREN.slice();
    while (anderen.length < n - 1) anderen.push(kinderen.splice(Math.floor(r() * kinderen.length), 1)[0] || ['zoon', 'kind', 'man']);
    return zetGezin(D, hoofd, anderen, r);
  }

  // Een gezin van het lege begin (vraag 152, js/begin.js) in tent g, het `n`-de: een man, een vrouw, en een of meer
  // kinderen (T.BEGIN_INSTELLINGEN.kinderen); bij de eerste `grootvader` gezinnen woont zijn vader erbij.
  function kampGezin(D, g, n, r) {
    const I = T.BEGIN_INSTELLINGEN;
    const hoofd = nieuweBewoner(D, { naam: kiesNaam(D, 'man', r), geslacht: 'man', leeftijd: 'volwassen', gezin: D.bewoners.gezinnen++, huis: g });
    const anderen = [partnerVan(hoofd)];
    const kinderen = NIEUWE_KINDEREN.slice();
    const tal = I.kinderen[0] + Math.floor(r() * (I.kinderen[1] - I.kinderen[0] + 1));
    for (let i = 0; i < tal; i++) anderen.push(kinderen.splice(Math.floor(r() * kinderen.length), 1)[0] || ['zoon', 'kind', 'man']);
    if (n < I.grootvader) anderen.push(['vader', 'oud', 'man']);
    return zetGezin(D, hoofd, anderen, r);
  }

  // Een kind van moeder, net geboren (T.bewonersVolgen met reden 'geboorte', vanuit js/leven.js, dat zijn geboortedag
  // zet): een kleuter in haar gezin en haar huis, met haar haar of dat van de vader (p.haar, voor het uiterlijk), en een poppetje bij de deur.
  function geboren(D, moeder) {
    const geslacht = T.vastLot(D, D.bewoners.volgende, 4300) < 0.5 ? 'man' : 'vrouw';
    const hoofd = moeder.hoofd || moeder;
    const vader = hoofd !== moeder ? hoofd : D.bewoners.mensen.find((x) => x.hoofd === moeder && x.geslacht === 'man' && x.leeftijd === 'volwassen');
    const p = nieuweBewoner(D, { naam: kiesNaam(D, geslacht, worp(D)), geslacht, leeftijd: 'kleuter', band: geslacht === 'man' ? 'zoon' : 'dochter', hoofd, gezin: moeder.gezin, huis: moeder.huis });
    const ouder = vader && T.vastLot(D, p.id, 4301) < 0.5 ? vader : moeder;
    if (ouder.haar) p.haar = ouder.haar;
    zetPlekken(D, p);
    maakPoppetje(D, p);
    return p;
  }

  // ---------------------------------------------------------------------------------------------
  // Hoe iemand eruitziet (vraag 145; gereedschap/pixelart/uiterlijk.cjs)
  // ---------------------------------------------------------------------------------------------

  // Bij welk lijf van de uiterlijken het vel van een leeftijd hoort (T.LEEFTIJDEN).
  T.UITERLIJK_LIJF = { boer: 'boer', boerin: 'boerin', jongen: 'jongen', meisje: 'meisje', kleuter: 'kleuter', oudeman: 'oudeman', 'boerin-grijsaard': 'oudevrouw' };
  const OUDE_LIJVEN = ['oudeman', 'oudevrouw'];
  // Het uiterlijk van een bewoner bij zijn leeftijd (p.uiterlijk: het nummer in T.BEELDEN.uiterlijken[lijf], waar per
  // uiterlijk zijn haar staat). Zijn trek is zijn haar (p.haar): een kind krijgt dat van een ouder, en wie een fase verder
  // gaat, houdt het, tot hij oud en grijs is. Verder het uiterlijk dat in het dorp het minst voorkomt, en niet dat van
  // iemand uit zijn gezin of van een buur. Zonder uiterlijken (geen beelden, of een toets) blijft het null.
  T.kiesUiterlijk = function (D, p) {
    const e = p.wezen;
    const lijf = e && T.UITERLIJK_LIJF[e.vel];
    const haren = lijf && T.BEELDEN && T.BEELDEN.uiterlijken && T.BEELDEN.uiterlijken[lijf];
    if (!haren || !haren.length) return null;
    if (!p.haar && (p.band === 'zoon' || p.band === 'dochter')) {
      const ouders = D.bewoners.mensen.filter((x) => x.gezin === p.gezin && x !== p && x.haar && (x === p.hoofd || x.hoofd === p.hoofd) && x.leeftijd !== 'kind' && x.leeftijd !== 'kleuter');
      if (ouders.length) p.haar = ouders[Math.floor(T.vastLot(D, p.id, 4401) * ouders.length)].haar;
    }
    const oud = OUDE_LIJVEN.includes(lijf);
    const w = D.bewoners.wereld;
    const deurVan = (x) => (w && x.huis ? T.deurVan(w, x.huis) : null);
    const mijnDeur = deurVan(p);
    const score = haren.map((haar, nr) => {
      let s = T.vastLot(D, p.id * 64 + nr, 4400);
      if (p.haar && !oud && haar !== p.haar) s += 50;
      for (const x of D.bewoners.mensen) {
        if (x === p || x.uiterlijk !== nr || !x.wezen || T.UITERLIJK_LIJF[x.wezen.vel] !== lijf) continue;
        s += 10;
        if (x.gezin === p.gezin) s += 100;
        else {
          const d = mijnDeur && deurVan(x);
          if (d && T.afstand(d, mijnDeur) < 15) s += 30;
        }
      }
      return s;
    });
    const nr = score.indexOf(Math.min(...score));
    if (!p.haar && !oud) p.haar = haren[nr];
    return nr;
  };

  // In welke kleren een bewoner loopt (vraag 149; Marcel, 10 okt: "Hogere niveau sociale mensen moeten duurdere kleren
  // krijgen"): zijn gezicht is zijn uiterlijk, en zijn kleren zijn die van de stand van zijn huis (T.standVan, js/treden.js):
  // 'arm' in een hut, 'deftig' in een stenen huis of een woontoren, en anders 'gewoon'. Het volgt het huis, dus groeit dat
  // door, dan heeft hij andere kleren aan. (Tot 16 okt liep een stenen huis pas deftig als het zijn laken kreeg, een wens
  // van zijn stand, js/wensen.js.) Alleen de volwassenen (de kinderen en de ouden komen later), en aan het werk dragen ze
  // hun gewone kleren (js/sprites.js). Alleen beeld: niets ervan staat in Spel.S.
  T.klerenVan = function (p) {
    if (!IN().klerenNaarStand || !p || p.leeftijd !== 'volwassen' || !p.huis) return 'gewoon';
    const stand = T.standVan(p.huis);
    return stand === 'keuters' ? 'arm' : stand === 'ambachtslieden' ? 'deftig' : 'gewoon';
  };

  // Wie een fase verder is (js/leven.js): zijn poppetje krijgt het vel en de snelheid van zijn nieuwe leeftijd.
  T.poppetjeNaarLeeftijd = function (D, p) {
    const e = p.wezen;
    const L = T.LEEFTIJDEN[p.leeftijd];
    if (!e || !L || e.soort !== 'bewoner') return;
    e.vel = L[p.geslacht] || L.man;
    e.snelheid = IN()[L.snelheid];
    p.uiterlijk = T.kiesUiterlijk(D, p);
  };
  // Hoeveel plaats er in huis g nog is.
  T.plaatsInHuis = (D, g) => T.woonruimteVan(D, g) - inHetHuis(D, g);

  // Het poppetje van een bewoner, bij zijn deur, of waar hij het gehucht in komt (`bij`: de weg); wie
  // er al staat, schuift een tegel op. De aanvoerder en de boeren hebben er al een.
  function maakPoppetje(D, p, bij) {
    const w = D.bewoners.wereld;
    if (p.wezen || !w) return p.wezen;
    const L = T.LEEFTIJDEN[p.leeftijd];
    const deur = T.deurVanBewoner(D, p);
    const van = bij || deur;
    let plek = van;
    for (let r = 0; r <= 3; r++) {
      const vrij = [];
      for (let y = van.y - r; y <= van.y + r; y++) {
        for (let x = van.x - r; x <= van.x + r; x++) {
          if (Math.max(Math.abs(x - van.x), Math.abs(y - van.y)) === r && T.isBegaanbaar(w, x, y, { wezensBlokkeren: true })) vrij.push({ x, y });
        }
      }
      if (vrij.length) {
        plek = vrij[0];
        break;
      }
    }
    const e = T.maakDorpeling(p.id, plek.x, plek.y, erfStraal());
    // Zijn soort heeft geen vel en geen gesprek: hij draagt het vel van zijn leeftijd (e.vel, zie
    // D.houding in js/sprites.js), en bij de muis staat wie hij is (js/verkennen.js).
    e.soort = 'bewoner';
    e.zaad = null;
    e.vel = L[p.geslacht] || L.man;
    e.naam = p.naam;
    e.snelheid = IN()[L.snelheid];
    e.thuis = { x: deur.x, y: deur.y };
    e.bewoner = p;
    e.dorp = D;
    p.wezen = e;
    w.wezens.push(e);
    if (p.uiterlijk == null) p.uiterlijk = T.kiesUiterlijk(D, p);
    return e;
  }

  // Een dobbelsteen voor het volgende gezin: uit het zaad van het spel, en elke keer een andere worp.
  function worp(D) {
    const B = D.bewoners;
    B.worpen = (B.worpen || 0) + 1;
    const zaad = ((B.zaad >>> 0) + B.worpen * 7919) >>> 0;
    return T.dobbelsteen(zaad);
  }

  // Hoeveel mensen er in huis g wonen.
  const inHetHuis = (D, g) => D.bewoners.mensen.filter((p) => p.huis === g).length;

  // De huizen van het dorp: wat klaar is en mensen een plek geeft, met hoeveel er nog bij kunnen.
  function huizenMetPlaats(D) {
    return (D.gebouwen || [])
      .filter((g) => g.klaar && T.woonruimteVan(D, g) > 0)
      .map((g) => ({ g, vrij: T.woonruimteVan(D, g) - inHetHuis(D, g) }));
  }

  // `n` mensen erbij, als gezin: zoveel mogelijk samen in het huis met de meeste plaats. Bij het begin
  // staan ze meteen bij hun deur. Een gezin dat later komt (`overDeWeg`), telt vanaf nu mee, maar is
  // nog onderweg: het komt overdag over de weg binnen (T.werkBewonersBij hieronder).
  function komenErBij(D, n, overDeWeg) {
    const B = D.bewoners;
    const r = worp(D);
    const gezinnen = [];
    while (n > 0) {
      const huizen = huizenMetPlaats(D).sort((a, b) => b.vrij - a.vrij);
      if (!huizen.length) break;
      const { g, vrij } = huizen[0];
      const k = vrij >= n ? n : Math.max(1, Math.min(n, vrij));
      gezinnen.push(nieuwGezin(D, g, k, r));
      n -= k;
    }
    const weg = overDeWeg && T.wegInEnUit(D);
    for (const leden of gezinnen) {
      for (const p of leden) zetPlekken(D, p);
      if (!weg) {
        for (const p of leden) maakPoppetje(D, p);
        continue;
      }
      for (const p of leden) p.komt = true;
      const tekst = T.t('A new family is coming along the road: {gezin}. (+{n})', { gezin: gezinTekst(D, leden), n: leden.length });
      B.komen.push({ mensen: leden, aankomst: { tekst } });
    }
    return gezinnen.flat();
  }

  // Wie het eerst gaat als er `n` minder zijn. Nooit de aanvoerder, zijn gezin of een boer zelf (T.isBoer, js/boerderij.js:
  // zonder hem ligt zijn boerderij stil). Wie sterft (de winter, de
  // honger): de ouden eerst, dan de kleinsten. Wie wegtrekt: eerst een heel gezin dat later kwam (het
  // laatste het eerst), en dan de jongeren van de boerderijen; een man of vrouw laat zijn gezin het
  // laatst achter.
  const STERFTE = { oud: 0, kleuter: 1, kind: 2, jong: 3, volwassen: 4 };
  const VERTREK = { jong: 0, volwassen: 1, kind: 2, kleuter: 3, oud: 4 };
  // Wie het eerst gaat als er iemand wegtrekt of sterft, in volgorde; ook voor wie uit een bepaald huis wegtrekt (js/behoeften.js:
  // achteruitgaan per huis, werklijst vraag 85, c).
  T.wieGaatEerst = (D, reden) => wieGaat(D, reden);
  function wieGaat(D, reden) {
    const kan = D.bewoners.mensen.filter((p) => !T.isBoer(D, p) && !vanAanvoerder(p) && !p.weg);
    if (reden === 'vertrek') {
      const later = (p) => !T.isBoer(D, p.hoofd || p); // een gezin dat later kwam: zijn hoofd is geen boer
      const partner = (p) => p.band === 'vrouw' || p.band === 'man';
      return kan.sort((a, b) => (later(b) - later(a)) || (later(a) ? b.gezin - a.gezin : 0) || (partner(a) - partner(b))
        || (VERTREK[a.leeftijd] - VERTREK[b.leeftijd]) || (b.id - a.id));
    }
    return kan.sort((a, b) => (STERFTE[a.leeftijd] - STERFTE[b.leeftijd]) || (b.id - a.id));
  }

  // Wie in `weg` staat, telt niet meer mee en werkt nergens meer. Wie wegtrekt, loopt de weg af: zijn
  // poppetje gaat pas van de kaart bij de uitgang (T.werkBewonersBij), en een jongere of volwassene gaat het
  // bos in en komt terug als rover (js/rovers.js). Wie sterft, is er niet meer; wie in een gevecht viel, ligt er
  // tot de volgende dag (js/rovers.js begraaft hem). Wie nog onderweg was hierheen, komt niet meer.
  function gaanWeg(D, weg, reden) {
    const B = D.bewoners;
    const w = B.wereld;
    const uitgang = reden === 'vertrek' && T.wegInEnUit(D);
    for (const p of weg) {
      B.mensen.splice(B.mensen.indexOf(p), 1);
      p.werk = null;
      const e = p.wezen;
      if (e && w && w.wezens.includes(e)) {
        if (uitgang) {
          e.vertrekt = { x: uitgang.x, y: uitgang.y };
          B.vertrekken.push(e);
        } else if (!e.dood) w.wezens.splice(w.wezens.indexOf(e), 1);
      }
      if (reden === 'vertrek') T.wordtRover(D, p);
      // Was hij het hoofd van zijn gezin, dan wordt de volgende dat (zijn vrouw, of de oudste).
      const rest = B.mensen.filter((x) => x.hoofd === p);
      if (rest.length) {
        const volgorde = { volwassen: 0, jong: 1, oud: 2, kind: 3, kleuter: 4 };
        const nieuw = rest.slice().sort((a, b) => volgorde[a.leeftijd] - volgorde[b.leeftijd])[0];
        nieuw.hoofd = null;
        nieuw.band = null;
        for (const x of rest) if (x !== nieuw) x.hoofd = nieuw;
      }
    }
    for (const a of B.komen) a.mensen = a.mensen.filter((p) => B.mensen.includes(p));
    B.komen = B.komen.filter((a) => a.mensen.length);
    return weg;
  }

  // ---------------------------------------------------------------------------------------------
  // Komen en gaan: wie het zijn, en dat je ze ziet (stuk 2; ontwerp/spel.md, "Stuk 2 uitgewerkt")
  // ---------------------------------------------------------------------------------------------

  // De band met het hoofd van het gezin, voor de speler (in de gegevens blijft hij Nederlands: 'zoon', 'vrouw').
  const BAND = {
    zoon: T.t('son'), dochter: T.t('daughter'), moeder: T.t('mother'), vader: T.t('father'), schoondochter: T.t('daughter-in-law'),
    vrouw: T.t('wife'), man: T.t('husband'),
  };
  // Zijn naam, met "old" of "little" ervoor als hij oud of een kleuter is.
  const naamMetLeeftijd = (p) => (p.leeftijd === 'oud' ? T.t('old {naam}', { naam: naamVan(p) })
    : p.leeftijd === 'kleuter' ? T.t('little {naam}', { naam: naamVan(p) }) : naamVan(p));
  const hoofdletter = (t) => t.charAt(0).toUpperCase() + t.slice(1);

  // Eén mens: "old John, father of Nicholas", "Gerard, son of Nicholas", "Albert, husband of Alice".
  function persoonTekst(D, p) {
    const naam = naamMetLeeftijd(p);
    if (p.hoofd) return T.t('{naam}, {band} of {van}', { naam, band: BAND[p.band], van: naamVan(p.hoofd) });
    const partner = D.bewoners.mensen.find((x) => x.hoofd === p && (x.band === 'vrouw' || x.band === 'man'));
    return partner ? T.t('{naam}, {band} of {van}', { naam, band: p.geslacht === 'vrouw' ? BAND.vrouw : BAND.man, van: naamVan(partner) }) : naam;
  }

  // Een heel gezin: "Albert and Alice, with two children", "Kate, with three children".
  function gezinTekst(D, leden) {
    const hoofd = leden.find((p) => !p.hoofd) || leden[0];
    const partner = leden.find((p) => p.hoofd === hoofd && (p.band === 'vrouw' || p.band === 'man'));
    const kinderen = leden.length - 1 - (partner ? 1 : 0);
    const t = partner ? T.opsomming([naamVan(hoofd), naamVan(partner)]) : naamVan(hoofd);
    if (kinderen === 1) return T.t('{gezin}, with a child', { gezin: t });
    if (kinderen > 1) return T.t('{gezin}, with {n} children', { gezin: t, n: T.telwoord(kinderen) });
    return t;
  }

  // Wie er gaat, in woorden: een heel gezin samen, de anderen één voor één. "old Agnes, mother of Walter, and little
  // Cecily, daughter of Gerard": een bijstelling sluit met een komma.
  function wieTekst(D, lijst) {
    const delen = [];
    const gehad = new Set();
    for (const p of lijst) {
      if (gehad.has(p)) continue;
      const gezin = D.bewoners.mensen.filter((x) => x.gezin === p.gezin);
      const heel = gezin.length > 1 && gezin.every((x) => lijst.includes(x));
      for (const x of heel ? gezin : [p]) gehad.add(x);
      delen.push(heel ? gezinTekst(D, gezin) : persoonTekst(D, p));
    }
    if (delen.length < 2) return delen[0] || '';
    const laatste = delen.pop();
    const rest = delen.join(', ');
    return delen[delen.length - 1].includes(',') ? T.t('{lijst}, and {laatste}', { lijst: rest, laatste }) : T.t('{lijst} and {laatste}', { lijst: rest, laatste });
  }

  // Het bericht bij wie sterft of wegtrekt, met `waarom` van wie het besliste (js/behoeften.js):
  // "The winter is harsh: old John, father of Nicholas, died." en "Albert and Alice, with two
  // children, leave: the village is not content enough. (-4)"
  function berichtOverWieGaat(D, weg, wie, reden, waarom) {
    if (!waarom || !weg.length || !T.ui || !T.ui.bericht) return;
    const komma = wie.includes(',') ? ',' : '';
    if (reden === 'vertrek') T.zeg(D, T.t('{n|{wie} leaves: {waarom}. (-#)|{wie} leave: {waarom}. (-#)}', { n: weg.length, wie: hoofdletter(wie) + komma, waarom }), 'gevaar');
    else T.zeg(D, T.t('{waarom}: {wie} died.', { waarom, wie: wie + komma }), 'gevaar');
  }

  // Elk beeld (js/main.js, werkBij), zoals T.werkMarskramerBij in js/handel.js. Wie komt, verschijnt
  // overdag op de weg, op dezelfde manier als de marskramer en de heer (T.bezoekerKomtAan in
  // js/dag.js, met het bericht wie het zijn), en loopt eerst naar zijn huis (p.komt, T.dagAnker). Wie
  // wegtrekt, loopt naar de uitgang (e.vertrekt, T.dagAnker) en gaat daar van de kaart.
  T.werkBewonersBij = function (D) {
    const B = D.bewoners;
    if (!B || !B.wereld) return;
    const w = B.wereld;
    for (const a of B.komen.slice()) {
      if (!T.bezoekerKomtAan(D, a)) continue;
      B.komen.splice(B.komen.indexOf(a), 1);
      const weg = T.wegInEnUit(D);
      for (const p of a.mensen) maakPoppetje(D, p, weg);
    }
    for (const p of B.mensen) {
      const e = p.komt && p.wezen;
      if (e && T.afstand(e.thuis, { x: e.tx, y: e.ty }) <= erfStraal()) delete p.komt;
    }
    for (const e of B.vertrekken.slice()) {
      if (e.onderweg || T.afstand(e.vertrekt, { x: e.tx, y: e.ty }) > 1) continue;
      // De bode en wie meegaat, vertrekken samen (js/bode.js).
      if (T.wachtOpDeAnderen(D, e)) continue;
      B.vertrekken.splice(B.vertrekken.indexOf(e), 1);
      if (w.wezens.includes(e)) w.wezens.splice(w.wezens.indexOf(e), 1);
      // Wie een tijd weg is (T.stuurWeg), krijgt een nieuw poppetje als hij terugkomt (T.komtTerug).
      if (e.bewoner && e.bewoner.weg && e.bewoner.wezen === e) e.bewoner.wezen = null;
    }
  };

  // ---------------------------------------------------------------------------------------------
  // Een tijd weg, en terug (de heervaart, js/heervaart.js)
  // ---------------------------------------------------------------------------------------------

  // Wie weerbaar is: mannen, jong of volwassen, die hier zijn: wie te hulp schiet tegen de wolven, in de militie gaat, op
  // jacht of mee met de bode. Nooit de aanvoerder of zijn gezin; een boer wel (alleen naar de heervaart gaat hij niet, js/heervaart.js), en niet wie nog onderweg hierheen is of al weg is. Wie geen
  // werk heeft, het eerst; dan de volwassenen, en de jongens pas als er niet genoeg mannen zijn.
  const WEERBAAR = { volwassen: 0, jong: 1 };
  T.weerbareMannen = function (D) {
    if (!D.bewoners) return [];
    return D.bewoners.mensen
      .filter((p) => p.geslacht === 'man' && WEERBAAR[p.leeftijd] != null && !vanAanvoerder(p) && !p.komt && !p.weg)
      .sort((a, b) => (!!a.werk - !!b.werk) || (WEERBAAR[a.leeftijd] - WEERBAAR[b.leeftijd]) || (a.id - b.id));
  };

  // Een tijd weg (`waarom`: 'heervaart'). Hij blijft bewoner: hij telt mee en eet, en zijn plaats in huis blijft van
  // hem, maar hij werkt nergens (kanWerken) en loopt overdag de weg af, zoals wie wegtrekt (e.vertrekt, T.dagAnker).
  // Bij de uitgang gaat zijn poppetje van de kaart (T.werkBewonersBij).
  T.stuurWeg = function (D, wie, waarom) {
    const B = D.bewoners;
    const uitgang = T.wegInEnUit(D);
    for (const p of wie) {
      p.weg = { waarom };
      p.werk = null;
      const e = p.wezen;
      if (!e) continue;
      if (uitgang && !e.dood) {
        e.vertrekt = { x: uitgang.x, y: uitgang.y };
        if (!B.vertrekken.includes(e)) B.vertrekken.push(e);
      } else {
        if (B.wereld.wezens.includes(e)) B.wereld.wezens.splice(B.wereld.wezens.indexOf(e), 1);
        p.wezen = null;
      }
    }
  };

  // Terug: hij komt overdag over de weg binnen, zoals een nieuw gezin (T.bezoekerKomtAan, met `aankomst` als
  // bericht), en loopt naar huis. Staat zijn poppetje nog op de kaart (hij haalde de uitgang niet), dan keert het om.
  T.komtTerug = function (D, wie, aankomst) {
    const B = D.bewoners;
    const onderweg = [];
    for (const p of wie) {
      delete p.weg;
      const e = p.wezen;
      if (e && B.wereld.wezens.includes(e)) {
        delete e.vertrekt;
        if (B.vertrekken.includes(e)) B.vertrekken.splice(B.vertrekken.indexOf(e), 1);
      } else {
        p.wezen = null;
        p.komt = true;
        onderweg.push(p);
      }
      zetPlekken(D, p);
    }
    if (onderweg.length) B.komen.push({ mensen: onderweg, aankomst });
    else T.zeg(D, aankomst.tekst, aankomst.soort);
  };

  // ---------------------------------------------------------------------------------------------
  // Het begin, en het getal volgen
  // ---------------------------------------------------------------------------------------------

  // Wie er bij een nieuw spel woont (T.beginOpKaart, js/gebied.js). Daarna evenveel bewoners als het getal, elk met een poppetje,
  // en meteen het werk verdeeld, zodat de eerste dag niet stil begint.
  T.zetBeginBewoners = function (D) {
    const w = D.wereld;
    if (!w || !D.gebouwen) return;
    const zaad = (((D.lot && D.lot.zaad) || 1) ^ 0x2545f491) >>> 0;
    // komen: wie onderweg is hierheen, per gezin; vertrekken: de poppetjes van wie wegtrekt.
    D.bewoners = { wereld: w, mensen: [], volgende: 1, gezinnen: 1, zaad, worpen: 0, komen: [], vertrekken: [] };
    const r = worp(D);
    // De aanvoerder en zijn gezin, in zijn huis: in het lege begin zijn tent in het kamp (js/begin.js).
    for (const g of D.gebouwen) {
      const soort = T.GEBOUWEN[g.soort];
      if (!g.klaar || !(soort && (soort.woonruimte > 0 || soort.tijdelijk)) || g.huis !== 'aanvoerder' || !D.aanvoerder) continue;
      const aanvoerder = nieuweBewoner(D, { aanvoerder: true, geslacht: 'man', leeftijd: 'volwassen', gezin: D.bewoners.gezinnen++, huis: g, wezen: D.aanvoerder });
      zetGezin(D, aanvoerder, AANVOERDERSGEZIN, r);
    }
    // Het lege begin (vraag 152, js/begin.js): in elke tent van het kamp een gezin dat met de kar meekwam, en het getal is
    // zoveel als er zijn. Ze komen over de weg, achter de kar aan (T.werkBeginBij), dus nog zonder poppetje.
    const kamp = D.gebouwen.filter((g) => g.klaar && g.bewoners === 'kamp');
    kamp.forEach((g, n) => kampGezin(D, g, n, r));
    // De wacht van de demo (T.DEMO_INSTELLINGEN.wacht, js/einde.js; werklijst Q, vraag 181, e): in hun eigen tent elk een
    // man, soldaat van zijn soort met zijn eigen stukken (die liggen niet in de voorraad), zonder wachthuis (js/soldaten.js).
    for (const g of D.gebouwen.filter((x) => x.klaar && x.bewoners === 'wacht')) {
      for (const soort of T.DEMO_INSTELLINGEN.wacht) {
        const p = nieuweBewoner(D, { naam: kiesNaam(D, 'man', r), geslacht: 'man', leeftijd: 'volwassen', gezin: D.bewoners.gezinnen++, huis: g });
        p.soldaat = { soort, wachthuis: null, sinds: D.kalender ? Math.floor(D.kalender.dag) : 0 };
      }
    }
    if (kamp.length) {
      T.wijzigBevolking(D, D.bewoners.mensen.length - (D.bevolking || 0), 'begin');
      D.woonruimte = T.telWoonruimte(D);
      for (const p of D.bewoners.mensen) if (!p.wezen) p.komt = true;
    }
    // Evenveel bewoners als het getal: wie er nog bij moet, komt als gezin in een huis met plaats.
    const verschil = (D.bevolking || 0) - D.bewoners.mensen.length;
    if (verschil > 0) komenErBij(D, verschil);
    else if (verschil < 0) gaanWeg(D, wieGaat(D, 'vertrek').slice(0, -verschil), 'vertrek');
    for (const p of D.bewoners.mensen) if (!p.komt) maakPoppetje(D, p);
    T.verdeelHanden(D);
  };

  // Een huis kreeg een andere tekening, en dus misschien een andere deur (een hut die een huis werd,
  // js/behoeften.js): wie er woont, gaat voortaan naar die deur, en rekent zijn wegen opnieuw uit. Tot
  // 28 sep bleef zijn deur waar die was.
  T.huisVeranderd = function (D, g) {
    const w = D.bewoners && D.bewoners.wereld;
    if (!w) return;
    const deur = T.deurVan(w, g);
    for (const p of D.bewoners.mensen) {
      if (p.huis !== g) continue;
      if (p.wezen) p.wezen.thuis = { x: deur.x, y: deur.y };
      // Wie binnen is, komt er door de nieuwe deur weer uit: de oude kan nu muur zijn (werklijst vraag 88).
      const e = p.wezen;
      if (e && e.binnen) {
        e.x = e.tx = deur.x;
        e.y = e.ty = deur.y;
        e.deur = { x: deur.x, y: deur.y };
        e.pad = [];
      }
      zetPlekken(D, p);
    }
  };

  // Waar een bewoner thuis is: de deur van zijn huis, of zonder huis zijn plek op het plein (T.dakloosPlek).
  T.deurVanBewoner = (D, p) => (p.huis ? T.deurVan(D.wereld, p.huis) : T.dakloosPlek(D));

  // Waar wie geen huis heeft, slaapt en rondhangt: de tegel van het plein die het dichtst bij zijn midden ligt (zonder
  // plein, een kaart van de toetsen: de plek van de kar in het kamp, of de hoek van de kaart).
  T.dakloosPlek = function (D) {
    const w = D.wereld;
    const tegels = T.pleinTegels(D);
    const k = D.plek.kamp;
    if (!tegels.length) return k && k.kar ? { x: k.kar.x, y: k.kar.y } : { x: D.plek.vak.x, y: D.plek.vak.y };
    const m = { x: tegels.reduce((s, t) => s + t.x, 0) / tegels.length, y: tegels.reduce((s, t) => s + t.y, 0) / tegels.length };
    let beste = tegels[0];
    for (const t of tegels) if (T.afstand(t, m) < T.afstand(beste, m)) beste = t;
    return { x: beste.x, y: beste.y };
  };

  // Een gezin zonder huis (je brak het af, js/afbreken.js; werklijst C, stap 5; Marcel, 14 okt: "ze lopen los, met een
  // melding dat er huizen nodig zijn"): het slaapt buiten op het plein (T.dagAnker, js/dag.js), werkt gewoon, en trekt in
  // de eerste woning met plaats (T.verhuisUitHetKamp, js/begin.js). Zolang het duurt, is het een status (dakloos,
  // js/statussen.js).
  T.wordtDakloos = function (D, leden) {
    const plek = T.dakloosPlek(D);
    for (const p of leden) {
      p.huis = null;
      if (p.wezen) p.wezen.thuis = { x: plek.x, y: plek.y };
      zetPlekken(D, p);
    }
  };
  // De gezinnen zonder huis, elk als lijst van zijn leden (wie nog leeft en niet wegtrekt).
  T.daklozeGezinnen = function (D) {
    const per = new Map();
    for (const p of (D.bewoners && D.bewoners.mensen) || []) {
      if (p.huis || p.aanvoerder || p.weg) continue;
      if (!per.has(p.gezin)) per.set(p.gezin, []);
      per.get(p.gezin).push(p);
    }
    return [...per.values()];
  };

  // Een gezin verhuist naar huis g (uit het kamp van het lege begin, js/begin.js): voortaan is dat zijn deur, en zijn
  // plekken (de put, het werk) gaan mee. Wie binnen is, komt de oude deur uit en loopt naar de nieuwe (js/verkennen.js:
  // zijn deur is niet meer die van zijn anker); wie nog onderweg is hierheen, loopt meteen naar de nieuwe.
  T.verhuis = function (D, leden, g) {
    const w = D.bewoners && D.bewoners.wereld;
    const deur = w && T.deurVan(w, g);
    for (const p of leden) {
      p.huis = g;
      if (p.wezen && deur) p.wezen.thuis = { x: deur.x, y: deur.y };
      zetPlekken(D, p);
    }
  };

  // Het getal veranderde (T.wijzigBevolking, js/gebouwen.js): de bewoners gaan mee. `reden`: 'groei'
  // (een nieuw gezin, dat over de weg komt), 'winter' (wie sterft), 'vertrek' (wie wegtrekt) of 'gesneuveld'
  // (een wachter tegen de rovers, js/rovers.js; `wie` zegt dan wie). Het begin ('begin') regelt
  // T.zetBeginBewoners zelf. Met `waarom` (js/behoeften.js: "De winter is
  // hard") komt er een bericht dat zegt wie het zijn. Geeft wie het zijn, in woorden ("old John, father of Nicholas"),
  // voor het dagboek (js/einde.js), of '' zonder bewoners.
  T.bewonersVolgen = function (D, verschil, reden, waarom, wie) {
    if (!D.bewoners || reden === 'begin') return '';
    // Een kind dat geboren wordt (js/leven.js): in het gezin van zijn moeder (`wie`), niet als een nieuw gezin.
    if (verschil > 0 && reden === 'geboorte' && wie) return wieTekst(D, wie.slice(0, verschil).map((moeder) => geboren(D, moeder)));
    if (verschil > 0) return wieTekst(D, komenErBij(D, verschil, true));
    if (verschil < 0) {
      // Gaat het om bepaalde mensen (een wachter die sneuvelt, js/rovers.js), dan zij; anders wie het eerst gaat.
      const weg = wie ? wie.filter((p) => D.bewoners.mensen.includes(p)).slice(0, -verschil) : wieGaat(D, reden).slice(0, -verschil);
      // In woorden zolang ze er nog zijn: een heel gezin heet samen, en dat zie je alleen zolang het gezin er is.
      const tekst = wieTekst(D, weg);
      berichtOverWieGaat(D, weg, tekst, reden, waarom);
      gaanWeg(D, weg, reden);
      return tekst;
    }
    return '';
  };

  // ---------------------------------------------------------------------------------------------
  // Wie waar werkt
  // ---------------------------------------------------------------------------------------------

  // Hoeveel handen het dorp heeft: wie kan werken. Zonder bewoners (een toets met een eigen, kleine
  // wereld) is dat het hele getal, zoals vóór de poppetjes.
  T.werkendeHanden = function (D) {
    if (!D.bewoners) return D.bevolking || 0;
    return D.bewoners.mensen.filter(kanWerken).length;
  };

  // Hoe goed iemand past op een plek bij gebouw g: hoe lager, hoe liever. Naar leeftijd
  // (T.LEEFTIJDEN: eerst de volwassenen) en wie het dichtstbij woont; wie de werkplaats het liefst heeft
  // (T.GEBOUWEN[soort].liefst: de schaapskooi een knaap) gaat vóór, en het gezin van de aanvoerder het laatst.
  function voorkeur(D, p, g, deur) {
    let s = T.LEEFTIJDEN[p.leeftijd].werkt * 100 + T.afstand(p.huis ? deur(p.huis) : T.deurVanBewoner(D, p), deur(g));
    const soort = T.GEBOUWEN[g.soort];
    if (soort && soort.liefst === p.leeftijd) s -= 500;
    if (vanAanvoerder(p)) s += 10000;
    return s;
  }

  // Wie werkt waar: hoeveel handen een gebouw heeft, zei T.verdeelHanden al (g.handen); hier staat wíé
  // dat zijn. Wie werk heeft, houdt het. Eerst werkt een gezin op zijn eigen boerderij (de boer zelf,
  // en wie er volwassen of een knaap is), daarna krijgt een plek zonder hand de vrije hand die het
  // best past (voorkeur hierboven). Vraagt een gebouw minder handen, dan gaat wie het minst past.
  T.wijsWerkToe = function (D) {
    const B = D.bewoners;
    if (!B) return;
    const w = B.wereld;
    const deuren = new Map();
    const deur = (g) => {
      if (!deuren.has(g)) deuren.set(g, T.deurVan(w, g));
      return deuren.get(g);
    };
    const wil = (g) => (g.klaar ? g.handen || 0 : 0);
    const kunnen = B.mensen.filter(kanWerken);
    for (const p of B.mensen) if (p.werk && (!kanWerken(p) || !D.gebouwen.includes(p.werk))) p.werk = null;
    for (const g of D.gebouwen) {
      const hier = kunnen.filter((p) => p.werk === g);
      if (hier.length <= wil(g)) continue;
      hier.sort((a, b) => voorkeur(D, b, g, deur) - voorkeur(D, a, g, deur));
      for (const p of hier.slice(0, hier.length - wil(g))) p.werk = null;
    }
    const vul = (g, wie) => {
      let hier = kunnen.filter((p) => p.werk === g).length;
      while (hier < wil(g)) {
        let beste = null;
        let score = Infinity;
        for (const p of kunnen) {
          if (p.werk || !wie(p)) continue;
          const s = voorkeur(D, p, g, deur);
          if (s < score) {
            score = s;
            beste = p;
          }
        }
        if (!beste) return;
        beste.werk = g;
        hier++;
      }
    };
    // Eerst het eigen gezin: de boer op zijn eigen boerderij, en wie er volwassen of een knaap is.
    for (const g of D.gebouwen) vul(g, (p) => p.huis === g && T.LEEFTIJDEN[p.leeftijd].werkt <= 1);
    for (const g of D.gebouwen) vul(g, () => true);
    const plein = T.pleinVrij(D);
    for (const p of B.mensen) zetPlekken(D, p, plein);
  };

  // Hoeveel uur er op dag `dag` gewerkt wordt bij gebouw g (stuk 2; js/gebouwen.js, stap 6 van
  // T.tikGebouwenDag, maakt ernaar): per hand de werkuren van die dag (T.dagindeling in js/dag.js: van
  // het begin van het werk tot het eind, zonder de schaft), min zijn weg heen (p.plek.heen). Hij
  // vertrekt als het werk begint; de weg terug gaat van zijn avond af. Wie vandaag pas komt (p.komt),
  // werkt nog niet. Geeft { gewerkt, onderweg, nodig } in uren, nodig voor alle handen die het gebouw
  // vraagt; zonder bewoners (een toets met een eigen, kleine wereld) null.
  // Wie thuis blijft (p.thuisTot, een dag met uur; js/beesten.js): wie de wolven zag rennen, tot het eind van het werk, en
  // wie ze beten, een paar dagen in bed (p.gewond). Hij werkt niet (T.werkUrenVan, en het veldwerk), maar houdt zijn werk,
  // en T.dagAnker houdt hem binnen. Net zo wie voor rovers in het town hall schuilt (p.schuilt, js/gevecht.js), tot het
  // rustig is.
  T.blijftThuis = (p, dag) => !!p && (!!p.schuilt || (p.thuisTot != null && dag < p.thuisTot));

  T.werkUrenVan = function (D, g, dag) {
    const B = D.bewoners;
    const soort = T.GEBOUWEN[g.soort];
    if (!B || !soort) return null;
    const d = T.dagindeling(dag);
    const perHand = Math.max(0, d.werkEind - d.werkBegin - (d.schaftEind - d.schaftBegin));
    let gewerkt = 0;
    let onderweg = 0;
    for (const p of B.mensen) {
      if (p.werk !== g) continue;
      const heen = p.komt || T.blijftThuis(p, dag) ? perHand : Math.min(perHand, (p.plek && p.plek.heen) || 0);
      gewerkt += perHand - heen;
      onderweg += heen;
    }
    return { gewerkt, onderweg, nodig: (soort.handen || 0) * perHand };
  };

  // ---------------------------------------------------------------------------------------------
  // Wie het is, bij de muis
  // ---------------------------------------------------------------------------------------------

  function werkTekst(D, p) {
    const g = p.werk;
    // wie geen werk heeft, bouwt of draagt (js/bouwen.js, js/kar.js; vraag 184)
    if (!g && p.bouwt && !p.bouwt.klaar && T.GEBOUWEN[p.bouwt.soort]) return T.t('builds the {gebouw}', { gebouw: T.GEBOUWEN[p.bouwt.soort].naam });
    if (!g && T.dragerTekst(D, p)) return T.dragerTekst(D, p);
    if (!g) return p.leeftijd === 'volwassen' && !vanAanvoerder(p) ? T.t('no work') : '';
    if (g === p.huis) return ''; // wie op zijn eigen boerderij werkt: dat spreekt vanzelf
    if (g.soort === 'schaapskooi') return T.t('shepherd');
    if (g.soort === 'boerderij') {
      const boer = T.boerVan(D, g);
      if (boer && boer !== p) return T.t('helps on the farm of {wie}', { wie: naamVan(boer) });
    }
    return T.t('works at the {gebouw}', { gebouw: T.GEBOUWEN[g.soort] ? T.GEBOUWEN[g.soort].naam : g.soort });
  }

  // "Gerard, son of Nicholas · shepherd", "Hilje, wife of the commander", "Albert · no work",
  // "Albert · leaving". Zonder poppetje (hij is nog onderweg hierheen) met de bewoner zelf als `p`.
  T.overBewonerTekst = function (D, e, p = T.bewonerVan(D, e)) {
    if (!p || p.aanvoerder) return '';
    let wie = naamVan(p);
    if (p.hoofd) wie = T.t('{naam}, {band} of {van}', { naam: wie, band: BAND[p.band], van: naamVan(p.hoofd) });
    const werk = e && e.vertrekt ? T.t('leaving')
      : p.komt ? T.t('new in the hamlet')
      : T.gaatNaarDeHerberg(D, p) ? T.t('off to the inn') // 's avonds (js/herberg.js)
      : werkTekst(D, p);
    return werk ? `${wie} · ${werk}` : wie;
  };
})(globalThis.Spel = globalThis.Spel || {});
