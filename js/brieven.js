// De brieven van de heer, op één plek (werklijst vraag 60; het eerste stuk van js/hud.js splitsen, vraag 25, C).
// Ze staan allemaal in hetzelfde venster (#brief) en in dezelfde hand: de benoeming als een nieuw spel begint
// (js/menu.js), de schatting op 1 wijnmaand (js/heer.js), de heervaart op 1 hooimaand (js/heervaart.js), en een
// brief bij elke trede: als het gehucht een dorp is, en als het dorp marktrecht krijgt (js/treden.js). Elke brief is
// een soort in BRIEVEN hieronder: wat erin staat, en welke knoppen eronder staan. T.ui.toonBrief(D, soort) zet hem
// neer (D: het dorp waar hij heen gaat; alleen jouw dorp komt in beeld), en zolang je leest, staat de tijd stil. In
// hetzelfde venster, in een andere hand: de brief aan de marskramer (js/bode.js) en het jaar in het kort (js/einde.js).
// Een brief die op je wacht (de schatting tot je betaald hebt, de heervaart tot je kiest), opent de knop Brief weer. Wat
// een knop doet, vraagt de brief aan de regels
// (T.heervaartKeuzes), zodat de knop en wat hij doet uit hetzelfde antwoord komen.
(function (T) {
  'use strict';

  const $ = (id) => document.getElementById(id);
  // Een naam kan de speler zelf geven (js/opties.js, en het dorp bij Nieuw spel), dus die gaat nooit rauw in de html.
  const veilig = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const hebNu = (S, wat) => Math.floor((S.dorp.voorraad && S.dorp.voorraad[wat]) || 0);
  const vandaag = (S) => (S.kalender ? T.datumVanDag(S.kalender.dag).tekst : '');
  const eisInTaal = (eis) => T.opsomming(eis.volgorde.map((wat) => T.hoeveel(eis.per[wat], wat)));
  // "Our hamlet of Heathside", of zonder naam "this hamlet"; en zo ook het dorp.
  const onsGehucht = (S) => (T.dorpsnaam(S.dorp) ? T.t('Our hamlet of {naam}', { naam: veilig(T.dorpsnaam(S.dorp)) }) : T.t('this hamlet'));
  const onsDorp = (S) => (T.dorpsnaam(S.dorp) ? T.t('Our village of {naam}', { naam: veilig(T.dorpsnaam(S.dorp)) }) : T.t('this village'));
  // Een datum zonder jaar ({ maand, dag }, met de naam van de maand uit de code): "1 September".
  const maandToon = (naam) => (T.MAANDEN.find((m) => m.naam === naam) || { toon: naam }).toon;
  const datumZonderJaar = (d) => `${d.dag} ${maandToon(d.maand)}`;

  // De benoeming van het lege begin (werklijst vraag 152; js/begin.js): de heer stuurt je met de gezinnen naar een stuk
  // van zijn wildernis, met wat er op de kar ligt, en vraagt het eerste jaar niets (T.heerLaatMetRust).
  function benoemingInDeWildernis(S) {
    const I = T.BEGIN_INSTELLINGEN;
    return {
      wanneer: vandaag(S),
      aan: T.t('To Our new reeve,'),
      tekst:
        `<p>${T.t('It has pleased Us to send you, with {n|# family|# families}, to a piece of Our wilderness. Make a village of it. A village brings Us money; wilderness does not.', { n: I.gezinnen })}</p>` +
        `<p>${T.t('The cart carries what We could spare: some logs, grain for the spring, seed grain, a few tools and {goud} gold. Do not expect more.', { goud: I.kar.goud })}</p>` +
        `<p>${T.t('This year We ask nothing of you. We are generous. Next year, at Martinmas, We shall come in person to collect what is Ours.')}</p>` +
        `<p>${T.t('Laws you may make, as many as you like. Our forest you leave alone.')}</p>`,
      knoppen: [{ actie: 'sluit', tekst: T.t('To work'), hoofd: true }],
    };
  }

  // Welke brief nu open staat (alleen scherm; na het laden staat er geen open).
  let open = null;

  // Het venster: een kop met de datum, de brief in de hand van de heer (aanhef, tekst, groet), en daaronder wat
  // het spel er zelf bij zegt (staat), de knoppen en een voetregel. Een knop die nu niet kan, staat er wel, maar
  // grijs; waarom zegt de staat. Wie geen brief van de heer is (het jaar in het kort), geeft zijn eigen titel en groet.
  function venster({ titel = T.t('A letter from the lord'), wanneer, aan, tekst, groet, staat = '', knoppen = [], voet = '' }) {
    const naam = T.naamVanDeHeer();
    const knop = (k) => `<button${k.hoofd ? ' class="heer-geef-knop"' : ''} data-actie="${k.actie}"${k.kan === false ? ' disabled' : ''}>${k.tekst}</button>`;
    return (
      `<div class="venster-kop"><span class="venster-titel">${titel}</span><span class="venster-wanneer">${wanneer}</span>` +
      `<button class="venster-sluit" data-actie="sluit" title="${T.t('Close (Esc)')}">✕</button></div>` +
      `<div class="brief-tekst"><p>${aan}</p>${tekst}` +
      `<p class="brief-groet">${groet || `${T.t('Your gracious lord')}${naam ? `,<br>${veilig(naam)}` : ''}`}</p></div>` +
      staat +
      (knoppen.length ? `<div class="heer-knoppen">${knoppen.map(knop).join('')}</div>` : '') +
      voet
    );
  }

  const BRIEVEN = {
    // De benoeming: de eerste brief, als een nieuw spel begint. Marcel koos hem op 25 sep in plaats van een
    // titelscherm (ontwerp/spel.md, onder Open): de tutorial van het oude spel vertelde je waarom je er was, en nu
    // doet de heer dat zelf, in dezelfde hand als zijn andere brieven.
    // In het lege begin (vraag 152, js/begin.js) een andere: hij stuurt je met de gezinnen naar zijn wildernis.
    benoeming: (S) => (S.dorp.begin ? benoemingInDeWildernis(S) : {
      wanneer: vandaag(S),
      aan: T.t('To Our new reeve,'),
      tekst:
        `<p>${T.t('It has pleased Us to appoint you reeve of {dorp}. Your predecessor could not count, or counted too well; We no longer quite remember which. He is elsewhere now.', { dorp: onsGehucht(S) })}</p>` +
        `<p>${T.t('At Martinmas We shall come in person to collect what is Ours. What that is, We shall see for Ourselves.')}</p>` +
        `<p>${T.t('We trust you completely. We shall count it again all the same.')}</p>` +
        // Het doel van de proef (js/treden.js; Marcel, 29 sep, vraag 53, A): de heer wil groei, want hij verdient eraan.
        `<p>${T.t('We expect Our hamlet to become a village, with {eis}. A village brings Us more.', { eis: T.tredeEisTekst('dorp') })}</p>` +
        // De wetten (js/wetten.js; Marcel, 29 sep, vraag 54): het menu onder W.
        `<p>${T.t('Laws you may make, as many as you like. Our forest you leave alone.')}</p>`,
      knoppen: [{ actie: 'sluit', tekst: T.t('To work'), hoofd: true }],
    }),

    // In wijnmaand van het eerste jaar van het lege begin (T.heerLaatMetRust, js/begin.js): geen schatting, hij spaart je.
    gespaard: (S) => ({
      wanneer: vandaag(S),
      aan: T.t('To Our reeve,'),
      tekst:
        `<p>${T.t('Martinmas is coming, and We have decided to spare you this year. Do not thank Us.')}</p>` +
        `<p>${T.t('Next year We shall count all the more carefully.')}</p>`,
      knoppen: [{ actie: 'sluit', tekst: T.t('Thank you, my lord'), hoofd: true }],
    }),

    // De schatting op 1 wijnmaand (js/heer.js, T.stuurBrief): wat hij op Sint-Maarten komt halen. Hij wacht tot je
    // betaald hebt; de knop Brief opent hem weer.
    schatting: (S) => {
      const brief = S.dorp.heer && S.dorp.heer.brief;
      if (!brief) return null;
      const regels = brief.eis.regels.map((r) => `<li><b>${T.hoeveel(r.aantal, r.wat)}</b> <span>${r.waarom}</span></li>`).join('');
      const samen = brief.eis.regels.length > 1 ? `<p class="brief-samen">${T.t('In all: {eis}.', { eis: eisInTaal(brief.eis) })}</p>` : '';
      const nu = T.opsomming(brief.eis.volgorde.map((wat) => T.hoeveel(hebNu(S, wat), wat))) || T.t('nothing');
      return {
        wanneer: T.datumVanDag(brief.dag).tekst,
        aan: T.t('To Our faithful reeve,'),
        tekst:
          `<p>${T.t('It has come to Our ears that you are doing well. That pleases Us greatly, for We too like to do well. At Martinmas We shall come in person to collect what is Ours. From what We see now, that is:')}</p>` +
          `<ul class="brief-lijst">${regels || `<li>${T.t('nothing. That cannot be right.')}</li>`}</ul>${samen}` +
          `<p>${T.t('Whatever is added before Martinmas, We shall see too. Whoever gives Us short measure will know it, for We count most carefully. Nearly always.')}</p>`,
        staat: `<p class="venster-staat">${T.t('You now have {nu}. Whatever grain you give him, you cannot sow in spring.', { nu })}${marskramerKomtNog(S, 'wijnmaand')}</p>`,
        voet: `<p class="venster-voet">${T.t('While you read, time stands still. <kbd>Esc</kbd> closes it; the letter on the table opens it again.')}</p>`,
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
        aan: T.t('To Our reeve,'),
        tekst:
          `<p>${T.t('We go to war {oorlog}.', { oorlog: veilig(v.oorlog) })}</p>` +
          `<p>${T.t('Send Us {n|one able-bodied man|{telwoord} able-bodied men}. You shall have them back after the harvest, on {datum}. Most of them.', { n: v.mannen, telwoord, datum: datumZonderJaar(T.HEERVAART_INSTELLINGEN.terug) })}</p>` +
          `<p>${T.t('Whoever would rather pay sends Us {goud}; then We hire them Ourselves. We do not ask where that gold comes from. We do remember it.', { goud: T.hoeveel(v.goud, 'goud') })}</p>`,
        staat:
          `<p class="venster-staat">${T.t('The game chooses who goes: {wie}. Their work stands still until they are back, and the village feeds them.', { wie: wie || T.t('there is no one who can go') })} ` +
          `${T.t('On average one in four does not come back; whoever does has learnt to fight.')} ${vrij.kan ? T.t('Buying them out costs {goud} of your {heb} gold, and the lord wonders how you came by it.', { goud: v.goud, heb: hebNu(S, 'goud') }) : vrij.waarom}${marskramerKomtNog(S, 'hooimaand')}</p>`,
        knoppen: keuzes,
        voet: `<p class="venster-voet">${T.t('If you have not chosen before {datum}, they go. <kbd>Esc</kbd> closes it; the letter on the table opens it again.', { datum: T.datumVanDag(v.uiterlijk).tekst })}</p>`,
      };
    },

    // Het gehucht is een dorp (js/treden.js; Marcel, 29 sep, vraag 53, B): het eind van de proef "van gehucht tot
    // dorp". Je speelt door als dorp, of gaat naar het titelscherm. "Dat kost u vanaf nu meer": de heervaart
    // (vraag 60, A).
    dorp: (S) => ({
      wanneer: vandaag(S),
      aan: T.t('To Our reeve,'),
      tekst:
        `<p>${T.t('We hear that {dorp} has become a village. Congratulations. From now on that will cost you more.', { dorp: onsGehucht(S) })}</p>` +
        (T.HEERVAART_INSTELLINGEN.aan ? `<p>${T.t('When We go to war, you shall henceforth send Us men as well. It is an honour. For them.')}</p>` : ''),
      knoppen: [
        { actie: 'titel', tekst: T.t('To the title screen') },
        { actie: 'sluit', tekst: T.t('Carry on as a village'), hoofd: true },
      ],
    }),

    // Een gril van de heer (js/grillen.js; werklijst vraag 106, stap 2): elke maand iets wat hij wil, met de antwoorden en
    // wat ze kosten onder elke knop. Hij wacht tot je antwoordt; de knop Brief opent hem weer.
    gril: (S) => {
      const g = T.grilNu(S.dorp);
      if (!g) return null;
      const knoppen = T.grilKeuzes(S.dorp).map((k) => ({
        actie: k.actie, kan: k.kan, hoofd: k.hoofd,
        tekst: `${veilig(k.tekst)}<span class="brief-prijs">${veilig(k.kan ? k.prijs || T.t('it costs nothing') : k.waarom)}</span>`,
      }));
      return {
        wanneer: T.datumVanDag(g.dag).tekst,
        aan: T.t('To Our reeve,'),
        tekst: g.tekst.map((p) => `<p>${veilig(p)}</p>`).join(''),
        knoppen,
        voet: `<p class="venster-voet">${T.t('If you have not answered before {datum}, he will hold it against you. <kbd>Esc</kbd> closes it; the letter on the table opens it again.', { datum: T.datumVanDag(g.uiterlijk).tekst })}</p>`,
      };
    },

    // De waarschuwing (js/bazen.js; werklijst vraag 106, a): zijn gunst zakte onder de grens. Nog één tegenvaller, en je
    // bent je ambt kwijt.
    waarschuwing: (S) => {
      const w = S.dorp.bazen && S.dorp.bazen.brief;
      return {
        wanneer: w ? T.datumVanDag(w.dag).tekst : vandaag(S),
        aan: T.t('To Our reeve,'),
        tekst:
          `<p>${veilig((w && w.waarom) || T.t('We are not pleased with you.'))}</p>` +
          `<p>${T.t('Once more, reeve. We have a nephew who would like to be reeve too. He cannot count, but evidently neither can you.')}</p>`,
        staat: `<p class="venster-staat">${T.t("The lord's favour is {n}. At 0 you lose your office.", { n: Math.round(S.dorp.bazen ? S.dorp.bazen.gunst : 0) })}</p>`,
        knoppen: [{ actie: 'sluit', tekst: T.t('Understood'), hoofd: true }],
      };
    },

    // Het dorp krijgt marktrecht (js/treden.js; Marcel, 2 okt, vraag 90, C: bij 20 ambachtslieden). Net als bij het
    // dorp voorlopig alleen woorden.
    marktrecht: (S) => ({
      wanneer: vandaag(S),
      aan: T.t('To Our reeve,'),
      tekst: `<p>${T.t('We hear that there is trade in {dorp}. We grant you a market charter. From now on that will cost you more.', { dorp: onsDorp(S) })}</p>`,
      knoppen: [{ actie: 'sluit', tekst: T.t('To work'), hoofd: true }],
    }),

    // De brief aan de marskramer (js/bode.js; werklijst vraag 143; Marcel, 9 okt: "soort van brief sturen met een bode"):
    // jouw papier, in een moeilijke tijd. Je schrijft wat hij moet brengen, en een dorpeling brengt hem; tot
    // drie weerbare mannen kunnen mee, tegen de rovers onderweg (het gevaar staat eronder, T.bodeGevaarTekst).
    bode: (S) => {
      const D = S.dorp;
      const k = T.kanBodeSturen(D);
      const B = T.BODE_INSTELLINGEN;
      const rijen = Object.keys(B.waren).map((wat) => {
        const W = B.waren[wat];
        const prijs = Math.ceil(W.prijs * k.maal);
        const veld = `<input type="number" min="0" max="${W.hooguit}" step="1" value="0" data-wat="${wat}">`;
        return `<p class="bode-rij"><label>${T.t('{waar}: {veld} {n|pack|packs} of {per}', { waar: T.hoofdletter(T.waarNaam(wat)), veld, n: W.hooguit, per: W.per })}</label> ` +
          `<small>${T.t('({goud} gold a pack, up to {hooguit})', { goud: prijs, hooguit: W.hooguit })}</small></p>`;
      });
      const kunnen = Math.min(B.meeHooguit, T.bodeBegeleiders(D, B.meeHooguit).length);
      const mee = kunnen
        ? `<p class="bode-rij"><label>${T.t('Along for protection: {veld} {n|able-bodied man|able-bodied men}', { veld: `<input type="number" min="0" max="${kunnen}" step="1" value="0" data-mee="1">`, n: kunnen })}</label> ` +
          `<small>${T.t('(up to {n}, {zilver} silver each)', { n: kunnen, zilver: Math.round(B.loon * 10) })}</small></p>`
        : '';
      const gevaar = k.kan ? `<p class="bode-gevaar"><small>${veilig(T.bodeGevaarTekst(D, 0))}</small></p>` : '';
      const waarom = !k.kan ? k.reden : '';
      const dagen = { n: k.dagen, dagen: T.telwoord(k.dagen), maal: k.maal };
      const tijd = k.winter ? T.t('He can be here in {n|a day|{dagen} days}, for it is winter: the roads are bad, and he asks double.', dagen)
        : k.maal === 1.5 ? T.t('He can be here in {n|a day|{dagen} days}, and he asks half as much again as usual.', dagen)
          : T.t('He can be here in {n|a day|{dagen} days}, and he asks {maal} times what he usually asks.', dagen);
      return {
        titel: T.t('A letter to the merchant'),
        wanneer: vandaag(S),
        aan: T.t('To the merchant, wherever he may be,'),
        tekst: `<p>${veilig(k.status ? k.status.zin : '')} ${T.t('Come to {dorp}, and bring:', { dorp: veilig(T.dorpsnaam(D) || T.t('our village')) })}</p>${rijen.join('')}${mee}${gevaar}`,
        groet: T.t('Your reeve'),
        staat: `<p class="venster-staat">${waarom ? veilig(waarom) : `${tijd} ${T.t('The messenger gets {zilver} silver from the chest.', { zilver: Math.round(B.loon * 10) })}`}</p>`,
        knoppen: [
          { actie: 'bode', tekst: T.t('Give the messenger the letter'), hoofd: true, kan: k.kan },
          { actie: 'sluit', tekst: T.t('Never mind') },
        ],
        voet: `<p class="venster-voet">${T.t('While you write, time stands still. <kbd>Esc</kbd> closes it.')}</p>`,
      };
    },
    // Het jaar in het kort (js/einde.js; werklijst vraag 101, e): op 1 lentemaand, uit het jaarboek (tot 15 okt in de
    // hand van je raadsman, die in ronde 3 van het snoeien wegging).
    jaarverslag: (S) => {
      const J = S.dorp.jaarverslag;
      if (!J) return null;
      return {
        titel: T.t('The year in brief'),
        wanneer: T.datumVanDag(J.dag).tekst,
        aan: T.t('Master reeve,'),
        tekst: J.regels.map((r) => `<p>${veilig(r)}</p>`).join(''),
        groet: T.t('Entered in the yearbook'),
        knoppen: [{ actie: 'sluit', tekst: T.t('A new year'), hoofd: true }],
        voet: `<p class="venster-voet">${T.t('While you read, time stands still. <kbd>Esc</kbd> closes it.')}</p>`,
      };
    },
  };

  // Komt de marskramer nog deze maand, dan kun je nog verkopen voor zijn goud: de brief zegt het erbij.
  function marskramerKomtNog(S, maand) {
    const bezoek = T.HANDEL_INSTELLINGEN && T.HANDEL_INSTELLINGEN.bezoeken.find((b) => b.maand === maand);
    if (!bezoek || !S.kalender) return '';
    const nu = T.datumVanDag(S.kalender.dag);
    const komtNog = T.MAANDEN[nu.maand].naam === bezoek.maand && nu.dagVanMaand < bezoek.dag;
    return komtNog ? ` ${T.t('The merchant comes on {datum}: you can still sell to him for gold then.', { datum: datumZonderJaar(bezoek) })}` : '';
  }

  // Welke brief van de heer op je wacht: de heervaart (daar hoort een dag bij), dan een gril, dan de schatting.
  const briefVanDeHeer = (S) => (S.dorp.heervaart && S.dorp.heervaart.vraag ? 'heervaart'
    : T.grilNu(S.dorp) ? 'gril'
    : S.dorp.heer && S.dorp.heer.brief ? 'schatting' : null);
  // De knoppen onderaan (js/balk.js; vraag 164) staan er alleen zolang ze er zijn: de brief van de heer zolang hij op
  // je wacht (en dan wippen ze, stijl.css), en de bode in een moeilijke tijd, zolang er niemand onderweg
  // is (js/bode.js).
  T.ui.werkBriefKnopBij = function (S) {
    $('brief-knop').classList.toggle('verborgen', !briefVanDeHeer(S));
    $('bode-knop').classList.toggle('verborgen', !(S.dorp.kalender && T.kanBodeSturen(S.dorp).zichtbaar));
  };

  // Een brief in het venster: `soort` uit BRIEVEN, of zonder soort de brief die op je wacht.
  T.ui.toonBrief = function (D, soort) {
    const S = T.S;
    if (D !== S.dorp) return; // een ander dorp zegt het niet tegen jou (js/dorp.js; vraag 71, C)
    soort = soort || briefVanDeHeer(S);
    const brief = soort && BRIEVEN[soort] && BRIEVEN[soort](S);
    if (!brief) return;
    open = soort;
    const box = $('brief');
    box.innerHTML = venster(brief);
    box.dataset.soort = soort; // de hand (stijl.css), en wat de speeltest leest
    T.houdTijdStil(S, 'brief');
    box.classList.remove('verborgen');
    T.ui.werkBriefKnopBij(S);
  };

  T.ui.sluitBrief = function (S) {
    $('brief').classList.add('verborgen');
    open = null;
    T.laatTijdGaan(S, 'brief');
    T.ui.werkBriefKnopBij(S);
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
})(globalThis.Spel = globalThis.Spel || {});
