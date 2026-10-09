// De brieven van de heer, op één plek (werklijst vraag 60; het eerste stuk van js/hud.js splitsen, vraag 25, C).
// Ze staan allemaal in hetzelfde venster (#brief) en in dezelfde hand: de benoeming als een nieuw spel begint
// (js/menu.js), de schatting op 1 wijnmaand (js/heer.js), de heervaart op 1 hooimaand (js/heervaart.js), en een
// brief bij elke trede: als het gehucht een dorp is, en als het dorp marktrecht krijgt (js/treden.js). Elke brief is
// een soort in BRIEVEN hieronder: wat erin staat, en welke knoppen eronder staan. T.ui.toonBrief(D, soort) zet hem
// neer (D: het dorp waar hij heen gaat; alleen jouw dorp komt in beeld), en zolang je leest, staat de tijd stil. In
// hetzelfde venster, in een andere hand: het rapport van je raadsman, 's ochtends (js/ochtendrapport.js; werklijst
// vraag 75, 3a).
// Een brief die op je wacht (de schatting tot je betaald hebt, de heervaart tot je kiest, het rapport tot je het las),
// opent de knop Brief bovenin weer; voor het rapport heet hij Rapport. Wat een knop doet, vraagt de brief aan de regels
// (T.heervaartKeuzes), zodat de knop en wat hij doet uit hetzelfde antwoord komen.
(function (T) {
  'use strict';

  const $ = (id) => document.getElementById(id);
  // Een naam kan de speler zelf geven (js/opties.js, en het dorp bij Nieuw spel), dus die gaat nooit rauw in de html.
  const veilig = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const opsomming = (delen) => (delen.length > 1 ? `${delen.slice(0, -1).join(', ')} en ${delen[delen.length - 1]}` : delen[0] || 'niets');
  const hebNu = (S, wat) => Math.floor((S.dorp.voorraad && S.dorp.voorraad[wat]) || 0);
  const vandaag = (S) => (S.kalender ? T.datumVanDag(S.kalender.dag).tekst : '');
  const eisInTaal = (eis) => opsomming(eis.volgorde.map((wat) => `${eis.per[wat]} ${wat}`));
  // "Ons gehucht Heikant", of zonder naam "dit gehucht".
  const hetDorp = (S, wat) => (T.dorpsnaam(S.dorp) ? `Ons ${wat} ${veilig(T.dorpsnaam(S.dorp))}` : `dit ${wat}`);

  // Welke brief nu open staat (alleen scherm; na het laden staat er geen open).
  let open = null;

  // Het venster: een kop met de datum, de brief in de hand van de heer (aanhef, tekst, groet), en daaronder wat
  // het spel er zelf bij zegt (staat), de knoppen en een voetregel. Een knop die nu niet kan, staat er wel, maar
  // grijs; waarom zegt de staat. Wie geen brief van de heer is (het rapport), geeft zijn eigen titel en groet.
  function venster({ titel = 'Een brief van de heer', wanneer, aan, tekst, groet, staat = '', knoppen = [], voet = '' }) {
    const naam = T.naamVanDeHeer();
    const knop = (k) => `<button${k.hoofd ? ' class="heer-geef-knop"' : ''} data-actie="${k.actie}"${k.kan === false ? ' disabled' : ''}>${k.tekst}</button>`;
    return (
      `<div class="venster-kop"><span class="venster-titel">${titel}</span><span class="venster-wanneer">${wanneer}</span>` +
      `<button class="venster-sluit" data-actie="sluit" title="Sluiten (Esc)">✕</button></div>` +
      `<div class="brief-tekst"><p>${aan}</p>${tekst}` +
      `<p class="brief-groet">${groet || `Uw genadige heer${naam ? `,<br>${veilig(naam)}` : ''}`}</p></div>` +
      staat +
      (knoppen.length ? `<div class="heer-knoppen">${knoppen.map(knop).join('')}</div>` : '') +
      voet
    );
  }

  const BRIEVEN = {
    // De benoeming: de eerste brief, als een nieuw spel begint. Marcel koos hem op 25 sep in plaats van een
    // titelscherm (ontwerp/spel.md, onder Open): de tutorial van het oude spel vertelde je waarom je er was, en nu
    // doet de heer dat zelf, in dezelfde hand als zijn andere brieven.
    benoeming: (S) => ({
      wanneer: vandaag(S),
      aan: 'Aan Onze nieuwe schout,',
      tekst:
        `<p>Het heeft Ons behaagd u tot schout te benoemen over ${hetDorp(S, 'gehucht')}. Uw voorganger kon niet tellen, of juist te goed; dat weten Wij niet meer precies. Hij is nu elders.</p>` +
        `<p>Op Sint-Maarten komen Wij persoonlijk halen wat Ons toekomt. In oogstmaand komt Onze inner kijken hoeveel dat is.</p>` +
        `<p>Wij vertrouwen u volkomen. Onze inner telt toch even na.</p>` +
        // Het doel van de proef (js/treden.js; Marcel, 29 sep, vraag 53, A): de heer wil groei, want hij verdient eraan.
        `<p>Wij verwachten dat Ons gehucht een dorp wordt, met ${T.tredeEisTekst('dorp')}. Een dorp brengt Ons meer op.</p>` +
        // De wetten (js/wetten.js; Marcel, 29 sep, vraag 54): het menu onder W. De houtkap in zijn bos is er een van.
        `<p>Wetten mag u maken, zoveel u wilt. Over Ons bos gaat u niet.</p>`,
      knoppen: [{ actie: 'sluit', tekst: 'Aan het werk', hoofd: true }],
    }),

    // De schatting op 1 wijnmaand (js/heer.js, T.stuurBrief): wat hij op Sint-Maarten komt halen. Hij wacht tot je
    // betaald hebt; de knop Brief opent hem weer.
    schatting: (S) => {
      const brief = S.dorp.heer && S.dorp.heer.brief;
      if (!brief) return null;
      const regels = brief.eis.regels.map((r) => `<li><b>${r.aantal} ${r.wat}</b> <span>${r.waarom}</span></li>`).join('');
      const samen = brief.eis.regels.length > 1 ? `<p class="brief-samen">Samen: ${eisInTaal(brief.eis)}.</p>` : '';
      const nu = opsomming(brief.eis.volgorde.map((wat) => `${hebNu(S, wat)} ${wat}`));
      return {
        wanneer: T.datumVanDag(brief.dag).tekst,
        aan: 'Aan Onze trouwe schout,',
        tekst:
          `<p>Het is Ons ter ore gekomen dat het u goed gaat. Dat verheugt Ons zeer, want het gaat Ons ook graag goed. Op Sint-Maarten komen Wij persoonlijk ophalen wat Ons toekomt. ${brief.eis.rapport ? 'Naar wat Onze inner in oogstmaand zag' : 'Naar wat Wij nu zien'}, is dat:</p>` +
          `<ul class="brief-lijst">${regels || '<li>niets. Dat kan niet kloppen.</li>'}</ul>${samen}` +
          `<p>Wat er tot Sint-Maarten bijkomt, zien Wij ook. Wie Ons tekortdoet, zal het merken, want Wij tellen zeer zorgvuldig. Bijna altijd.</p>`,
        staat: `<p class="venster-staat">Je hebt nu ${nu}. Wat je hem aan graan geeft, kun je in de lente niet zaaien.${marskramerKomtNog(S, 'wijnmaand')}</p>`,
        voet: `<p class="venster-voet">Zolang je leest, staat de tijd stil. <kbd>Esc</kbd> sluit; de knop Brief bovenin opent hem weer.</p>`,
      };
    },

    // De heervaart op 1 hooimaand (js/heervaart.js; Marcel, 29 sep, vraag 60, A): mannen voor zijn oorlog, of goud.
    // Twee knoppen, die vooraf zeggen wat ze kosten; wie niet kiest, stuurt ze (op de dag die de voet noemt).
    heervaart: (S) => {
      const v = S.dorp.heervaart && S.dorp.heervaart.vraag;
      if (!v) return null;
      const keuzes = T.heervaartKeuzes(S.dorp);
      const vrij = keuzes.find((k) => k.actie === 'vrijkopen');
      const wie = T.heervaartWieTekst(S.dorp, v.wie);
      const telwoord = T.telwoord(v.mannen);
      return {
        wanneer: T.datumVanDag(v.dag).tekst,
        aan: 'Aan Onze schout,',
        tekst:
          `<p>Wij trekken ten strijde ${veilig(v.oorlog)}.</p>` +
          `<p>Zend Ons ${telwoord} weerbare ${v.mannen === 1 ? 'man' : 'mannen'}. Na de oogst krijgt u ze terug, op ${T.HEERVAART_INSTELLINGEN.terug.dag} ${T.HEERVAART_INSTELLINGEN.terug.maand}. De meesten.</p>` +
          `<p>Wie liever betaalt, zendt Ons ${v.goud} goud; dan huren Wij ze zelf. Wij vragen niet waar dat goud vandaan komt. Onze inner wel.</p>`,
        staat:
          `<p class="venster-staat">Het spel kiest wie: ${wie || 'er is niemand die kan gaan'}. Hun werk ligt stil tot ze terug zijn, en het dorp voedt ze. ` +
          `Van elke vier komt er gemiddeld één niet terug; wie terugkomt, heeft leren vechten. ${vrij.kan ? `Vrijkopen kost ${v.goud} van je ${hebNu(S, 'goud')} goud, en de heer vraagt zich af hoe je eraan komt.` : vrij.waarom}${marskramerKomtNog(S, 'hooimaand')}</p>`,
        knoppen: keuzes,
        voet: `<p class="venster-voet">Kies je niet vóór ${T.datumVanDag(v.uiterlijk).tekst}, dan gaan ze. <kbd>Esc</kbd> sluit; de knop Brief bovenin opent hem weer.</p>`,
      };
    },

    // Het gehucht is een dorp (js/treden.js; Marcel, 29 sep, vraag 53, B): het eind van de proef "van gehucht tot
    // dorp". Je speelt door als dorp, of gaat naar het titelscherm. "Dat kost u vanaf nu meer": de heervaart
    // (vraag 60, A).
    dorp: (S) => ({
      wanneer: vandaag(S),
      aan: 'Aan Onze schout,',
      tekst:
        `<p>Wij vernemen dat ${hetDorp(S, 'gehucht')} een dorp is geworden. Gefeliciteerd. Dat kost u vanaf nu meer.</p>` +
        (T.HEERVAART_INSTELLINGEN.aan ? `<p>Trekken Wij ten strijde, dan zendt u Ons voortaan ook mannen. Dat is een eer. Voor hen.</p>` : ''),
      knoppen: [
        { actie: 'titel', tekst: 'Naar het titelscherm' },
        { actie: 'sluit', tekst: 'Verder als dorp', hoofd: true },
      ],
    }),

    // Een gril van de heer (js/grillen.js; werklijst vraag 106, stap 2): elke maand iets wat hij wil, met de antwoorden en
    // wat ze kosten onder elke knop. Hij wacht tot je antwoordt; de knop Brief opent hem weer.
    gril: (S) => {
      const g = T.grilNu(S.dorp);
      if (!g) return null;
      const knoppen = T.grilKeuzes(S.dorp).map((k) => ({
        actie: k.actie, kan: k.kan, hoofd: k.hoofd,
        tekst: `${veilig(k.tekst)}<span class="brief-prijs">${veilig(k.kan ? k.prijs || 'het kost niets' : k.waarom)}</span>`,
      }));
      return {
        wanneer: T.datumVanDag(g.dag).tekst,
        aan: 'Aan Onze schout,',
        tekst: g.tekst.map((p) => `<p>${veilig(p)}</p>`).join(''),
        knoppen,
        voet: `<p class="venster-voet">Antwoord je niet vóór ${T.datumVanDag(g.uiterlijk).tekst}, dan neemt hij het je kwalijk. <kbd>Esc</kbd> sluit; de knop Brief bovenin opent hem weer.</p>`,
      };
    },

    // De waarschuwing (js/bazen.js; werklijst vraag 106, a): zijn gunst zakte onder de grens. Nog één tegenvaller, en je
    // bent je ambt kwijt.
    waarschuwing: (S) => {
      const w = S.dorp.bazen && S.dorp.bazen.brief;
      return {
        wanneer: w ? T.datumVanDag(w.dag).tekst : vandaag(S),
        aan: 'Aan Onze schout,',
        tekst:
          `<p>${veilig((w && w.waarom) || 'Wij zijn niet tevreden over u.')}</p>` +
          `<p>Nog één keer, schout. Wij hebben een neef die ook schout wil worden. Hij kan niet tellen, maar dat kunt u blijkbaar ook niet.</p>`,
        staat: `<p class="venster-staat">De gunst van de heer is ${Math.round(S.dorp.bazen ? S.dorp.bazen.gunst : 0)}. Op 0 ben je je ambt kwijt.</p>`,
        knoppen: [{ actie: 'sluit', tekst: 'Begrepen', hoofd: true }],
      };
    },

    // Het dorp krijgt marktrecht (js/treden.js; Marcel, 2 okt, vraag 90, C: bij 20 ambachtslieden). Net als bij het
    // dorp voorlopig alleen woorden.
    marktrecht: (S) => ({
      wanneer: vandaag(S),
      aan: 'Aan Onze schout,',
      tekst: `<p>Wij vernemen dat in ${hetDorp(S, 'dorp')} gehandeld wordt. Wij verlenen u marktrecht. Dat kost u vanaf nu meer.</p>`,
      knoppen: [{ actie: 'sluit', tekst: 'Aan het werk', hoofd: true }],
    }),

    // Het rapport van je raadsman, 's ochtends (js/ochtendrapport.js; werklijst vraag 75, 3a): wat er gebeurde, hoe het
    // gaat, de winter, wat er speelt en wat er komt. In zijn hand, niet in die van de heer. Wat het spel erbij zegt (de
    // staat), is hoe goed hij rekent: daar hangt af hoe ver je zijn getallen kunt vertrouwen.
    rapport: (S) => {
      const R = S.dorp.ochtendrapport;
      if (!R) return null;
      const p = T.raadsmanVan(S.dorp);
      const rekenen = p && T.vaardighedenVan(S.dorp, p).rekenen;
      const staat = !p ? '' : rekenen === 'goed' ? 'Hij kan rekenen: zijn getallen kloppen.'
        : rekenen === 'slecht' ? 'Hij kan niet rekenen: zijn getallen zitten er soms flink naast. Wie het zeker wil weten, gaat zelf kijken.'
        : "Hij rekent zoals ieder ander: wat hij zegt, rondt hij af.";
      return {
        titel: `Het rapport van ${veilig(R.door)}`,
        wanneer: T.datumVanDag(R.dag).tekst,
        aan: 'Heer schout,',
        tekst: R.regels.map((r) => `<p>${veilig(r)}</p>`).join(''),
        groet: `Uw raadsman,<br>${veilig(R.door)}`,
        staat: staat ? `<p class="venster-staat">${staat}</p>` : '',
        knoppen: [{ actie: 'sluit', tekst: 'Aan het werk', hoofd: true }],
        voet: `<p class="venster-voet">Zolang je leest, staat de tijd stil. <kbd>Esc</kbd> sluit.</p>`,
      };
    },
    // De zaak van de graanzak (js/zaak.js; werklijst vraag 128): je eigen papier, met wat je weet, apart wat je zelf zag,
    // wat mensen je vertelden en wat er gezegd wordt. Onder de knop De zaak, zolang je het uitzoekt.
    zaak: (S) => {
      const Z = S.dorp.zaak;
      if (!Z || Z.fase !== 'onderzoek') return null;
      const delen = T.zaakWetenPerSoort(S.dorp).map((d) => `<p><b>${d.kop}</b></p>` +
        (d.regels.length ? d.regels.map((r) => `<p>${veilig(r)}</p>`).join('') : '<p><i>Nog niets.</i></p>'));
      const zitting = T.datumVanDag(Z.zitting).tekst.replace(/ \d+$/, '');
      return {
        titel: 'De zaak van de graanzak',
        wanneer: vandaag(S),
        aan: `Een zak graan uit de schuur van ${veilig(T.naamVanBewoner(Z.aanklager))}.`,
        tekst: delen.join(''),
        groet: `De zitting: ${zitting}, 's middags op het plein.`,
        staat: '<p class="venster-staat">Wie je aanklikt, vraag je ernaar. Wat er gezegd wordt, is nog geen bewijs.</p>',
        knoppen: [{ actie: 'sluit', tekst: 'Verder zoeken', hoofd: true }],
        voet: `<p class="venster-voet">Zolang je leest, staat de tijd stil. <kbd>Esc</kbd> sluit.</p>`,
      };
    },
    // De brief aan de marskramer (js/bode.js; werklijst vraag 143; Marcel, 9 okt: "soort van brief sturen met een bode"):
    // jouw papier, bij je huis, in een moeilijke tijd. Je schrijft wat hij moet brengen, en een dorpeling brengt hem; tot
    // drie weerbare mannen kunnen mee, tegen de rovers onderweg (het gevaar staat eronder, T.bodeGevaarTekst).
    bode: (S) => {
      const D = S.dorp;
      const k = T.kanBodeSturen(D);
      const B = T.BODE_INSTELLINGEN;
      const bijHuis = T.afstandTotHuis(D) <= T.DAG_INSTELLINGEN.slaapAfstand;
      const rijen = Object.keys(B.waren).map((wat) => {
        const W = B.waren[wat];
        const prijs = Math.ceil(W.prijs * k.maal);
        return `<p class="bode-rij"><label>${T.hoofdletter(wat)}: <input type="number" min="0" max="${W.hooguit}" step="1" value="0" data-wat="${wat}"> ` +
          `pak${W.hooguit === 1 ? '' : 'ken'} van ${W.per}</label> <small>(${prijs} goud per pak, tot ${W.hooguit})</small></p>`;
      });
      const kunnen = Math.min(B.meeHooguit, T.bodeBegeleiders(D, B.meeHooguit).length);
      const mee = kunnen
        ? `<p class="bode-rij"><label>Mee ter bescherming: <input type="number" min="0" max="${kunnen}" step="1" value="0" data-mee="1"> weerbare ${kunnen === 1 ? 'man' : 'mannen'}</label> <small>(tot ${kunnen}, elk ${Math.round(B.loon * 10)} zilver)</small></p>`
        : '';
      const gevaar = k.kan ? `<p class="bode-gevaar"><small>${veilig(T.bodeGevaarTekst(D, 0))}</small></p>` : '';
      const waarom = !k.kan ? k.reden : !bijHuis ? 'Je schrijft de brief bij je huis.' : '';
      const tijd = `Hij kan er over ${T.telwoord(k.dagen)} dagen zijn${k.winter ? ', want het is winter: de wegen zijn slecht, en hij vraagt het dubbele' : `, en hij vraagt ${k.maal === 1.5 ? 'anderhalf keer' : `${k.maal} keer`} wat hij anders vraagt`}.`;
      return {
        titel: 'Een brief aan de marskramer',
        wanneer: vandaag(S),
        aan: 'Aan de marskramer, waar hij ook is,',
        tekst: `<p>${veilig(k.status ? k.status.zin : '')} Kom naar ${veilig(T.dorpsnaam(D) || 'ons dorp')}, en breng mee:</p>${rijen.join('')}${mee}${gevaar}`,
        groet: `Uw schout`,
        staat: `<p class="venster-staat">${waarom ? veilig(waarom) : `${tijd} De bode krijgt ${Math.round(B.loon * 10)} zilver uit de kas.`}</p>`,
        knoppen: [
          { actie: 'bode', tekst: 'Geef de bode de brief', hoofd: true, kan: k.kan && bijHuis },
          { actie: 'sluit', tekst: 'Toch niet' },
        ],
        voet: `<p class="venster-voet">Zolang je schrijft, staat de tijd stil. <kbd>Esc</kbd> sluit.</p>`,
      };
    },
    // Het jaar in het kort (js/einde.js; werklijst vraag 101, e): op 1 lentemaand, in de hand van je raadsman, zoals zijn
    // rapport; zonder raadsman staat het gewoon in het jaarboek.
    jaarverslag: (S) => {
      const J = S.dorp.jaarverslag;
      if (!J) return null;
      const p = T.raadsmanVan(S.dorp);
      return {
        titel: 'Het jaar in het kort',
        wanneer: T.datumVanDag(J.dag).tekst,
        aan: 'Heer schout,',
        tekst: J.regels.map((r) => `<p>${veilig(r)}</p>`).join(''),
        groet: p ? `Uw raadsman,<br>${veilig(T.naamVanBewoner(p))}` : 'Opgetekend in het jaarboek',
        knoppen: [{ actie: 'sluit', tekst: 'Een nieuw jaar', hoofd: true }],
        voet: `<p class="venster-voet">Zolang je leest, staat de tijd stil. <kbd>Esc</kbd> sluit.</p>`,
      };
    },
  };

  // Komt de marskramer nog deze maand, dan kun je nog verkopen voor zijn goud: de brief zegt het erbij.
  function marskramerKomtNog(S, maand) {
    const bezoek = T.HANDEL_INSTELLINGEN && T.HANDEL_INSTELLINGEN.bezoeken.find((b) => b.maand === maand);
    if (!bezoek || !S.kalender) return '';
    const nu = T.datumVanDag(S.kalender.dag);
    const komtNog = T.MAANDEN[nu.maand].naam === bezoek.maand && nu.dagVanMaand < bezoek.dag;
    return komtNog ? ` De marskramer komt op ${bezoek.dag} ${bezoek.maand}: dan kun je nog verkopen voor zijn goud.` : '';
  }

  // Welke brief van de heer op je wacht: de heervaart (daar hoort een dag bij), dan een gril, dan de schatting.
  const briefVanDeHeer = (S) => (S.dorp.heervaart && S.dorp.heervaart.vraag ? 'heervaart'
    : T.grilNu(S.dorp) ? 'gril'
    : S.dorp.heer && S.dorp.heer.brief ? 'schatting' : null);
  // Wat er op je wacht: een rapport dat je nog niet las eerst (het geldt maar voor vandaag), dan de brief van de heer.
  const wachtend = (S) => (T.rapportKlaar(S.dorp) ? 'rapport' : briefVanDeHeer(S));

  // De papieren op tafel (js/tafel.js; vraag 146, c) liggen er alleen zolang ze er zijn: de brief van de heer en het
  // rapport zolang ze op je wachten (en dan lichten ze op, stijl.css), de zaak zolang je uitzoekt wie de zak graan nam
  // (js/zaak.js), en de inktpot van de bode in een moeilijke tijd, zolang er niemand onderweg is (js/bode.js).
  T.ui.werkBriefKnopBij = function (S) {
    $('brief-knop').classList.toggle('verborgen', !briefVanDeHeer(S));
    $('rapport-knop').classList.toggle('verborgen', !T.rapportKlaar(S.dorp));
    $('zaak-knop').classList.toggle('verborgen', !T.zaakOnderzoek(S.dorp));
    $('bode-knop').classList.toggle('verborgen', !(S.dorp.kalender && T.kanBodeSturen(S.dorp).zichtbaar));
  };

  // Een brief in het venster: `soort` uit BRIEVEN, of zonder soort de brief die op je wacht.
  T.ui.toonBrief = function (D, soort) {
    const S = T.S;
    if (D !== S.dorp) return; // een ander dorp zegt het niet tegen jou (js/dorp.js; vraag 71, C)
    // Een brief die komt terwijl de schout op reis is (js/land.js), wacht tot hij thuis is.
    if (soort && T.opReis(S)) {
      T.briefVoorLater(S, soort);
      return;
    }
    soort = soort || wachtend(S);
    const brief = soort && BRIEVEN[soort] && BRIEVEN[soort](S);
    if (!brief) return;
    open = soort;
    const box = $('brief');
    box.innerHTML = venster(brief);
    box.dataset.soort = soort; // de hand (stijl.css), en wat de speeltest leest
    if (soort === 'rapport') T.leesRapport(S.dorp);
    T.houdTijdStil(S, 'brief');
    box.classList.remove('verborgen');
    T.ui.werkBriefKnopBij(S);
  };

  T.ui.sluitBrief = function (S) {
    $('brief').classList.add('verborgen');
    open = null;
    T.laatTijdGaan(S, 'brief');
    T.ui.werkBriefKnopBij(S);
    T.ui.toonBriefVanLater(S);
  };

  // De brieven die kwamen terwijl je op reis was (js/land.js), een voor een, nu je thuis bent.
  T.ui.toonBriefVanLater = function (S) {
    const L = S.land;
    if (!L || !L.brieven.length || T.opReis(S) || T.ui.briefOpen()) return;
    T.ui.toonBrief(S.dorp, L.brieven.shift());
  };

  T.ui.briefOpen = () => !$('brief').classList.contains('verborgen');

  // Een knop onder een brief. Sluiten en het titelscherm kan elke brief; de heervaart en een gril vragen het aan de regels.
  $('brief').addEventListener('click', (ev) => {
    const b = ev.target.closest('button');
    const S = T.S;
    if (!b || !S || b.disabled) return;
    const actie = b.dataset.actie;
    if (actie === 'sluit') return T.ui.sluitBrief(S);
    if (actie === 'titel') {
      T.ui.sluitBrief(S);
      return T.naarTitelscherm();
    }
    if (open === 'bode' && actie === 'bode') {
      const box = $('brief');
      const bestelling = {};
      for (const inp of box.querySelectorAll('input[data-wat]')) bestelling[inp.dataset.wat] = Number(inp.value) || 0;
      const mee = Number((box.querySelector('input[data-mee]') || {}).value) || 0;
      const r = T.stuurBode(S.dorp, bestelling, mee);
      if (!r.kan) {
        const staat = box.querySelector('.venster-staat');
        if (staat) staat.textContent = r.reden;
        return;
      }
      return T.ui.sluitBrief(S);
    }
    if (open === 'heervaart' || open === 'gril') {
      const keuzes = open === 'gril' ? T.grilKeuzes(S.dorp) : T.heervaartKeuzes(S.dorp);
      const keuze = keuzes.find((k) => k.actie === actie);
      if (!keuze || !keuze.kan) return;
      keuze.doe();
      T.ui.sluitBrief(S);
    }
  });

  // In de brief aan de marskramer: wie meegaat, verandert het gevaar eronder.
  $('brief').addEventListener('input', (ev) => {
    if (open !== 'bode' || !ev.target.matches('input[data-mee]')) return;
    const regel = $('brief').querySelector('.bode-gevaar small');
    if (regel) regel.textContent = T.bodeGevaarTekst(T.S.dorp, Number(ev.target.value) || 0);
  });
  $('zaak-knop').addEventListener('click', (ev) => {
    ev.currentTarget.blur();
    if (!T.S) return;
    if (open === 'zaak') T.ui.sluitBrief(T.S);
    else T.ui.toonBrief(T.S.dorp, 'zaak');
  });

  $('bode-knop').addEventListener('click', (ev) => {
    ev.currentTarget.blur();
    if (!T.S) return;
    if (open === 'bode') T.ui.sluitBrief(T.S);
    else T.ui.toonBrief(T.S.dorp, 'bode');
  });

  $('brief-knop').addEventListener('click', (ev) => {
    ev.currentTarget.blur();
    if (!T.S) return;
    if (T.ui.briefOpen()) T.ui.sluitBrief(T.S);
    else T.ui.toonBrief(T.S.dorp, briefVanDeHeer(T.S));
  });

  $('rapport-knop').addEventListener('click', (ev) => {
    ev.currentTarget.blur();
    if (!T.S) return;
    if (open === 'rapport') T.ui.sluitBrief(T.S);
    else T.ui.toonBrief(T.S.dorp, 'rapport');
  });
})(globalThis.Spel = globalThis.Spel || {});
