// De brieven van de heer, op één plek (werklijst vraag 60; het eerste stuk van js/hud.js splitsen, vraag 25, C).
// Ze staan allemaal in hetzelfde venster (#brief) en in dezelfde hand: de benoeming als een nieuw spel begint
// (js/menu.js), de schatting op 1 wijnmaand (js/heer.js), de heervaart op 1 hooimaand (js/heervaart.js), en de
// brief als het gehucht een dorp is (js/treden.js). Elke brief is een soort in BRIEVEN hieronder: wat erin staat,
// en welke knoppen eronder staan. T.ui.toonBrief(S, soort) zet hem neer, en zolang je leest, staat de tijd stil.
// Een brief die op je wacht (de schatting tot je betaald hebt, de heervaart tot je kiest), opent de knop Brief
// bovenin weer. Wat een knop doet, vraagt de brief aan de regels (T.heervaartKeuzes), zodat de knop en wat hij
// doet uit hetzelfde antwoord komen.
(function (T) {
  'use strict';

  const $ = (id) => document.getElementById(id);
  // Een naam kan de speler zelf geven (js/opties.js, en het dorp bij Nieuw spel), dus die gaat nooit rauw in de html.
  const veilig = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const opsomming = (delen) => (delen.length > 1 ? `${delen.slice(0, -1).join(', ')} en ${delen[delen.length - 1]}` : delen[0] || 'niets');
  const hebNu = (S, wat) => Math.floor((S.voorraad && S.voorraad[wat]) || 0);
  const vandaag = (S) => (S.kalender ? T.datumVanDag(S.kalender.dag).tekst : '');
  const eisInTaal = (eis) => opsomming(eis.volgorde.map((wat) => `${eis.per[wat]} ${wat}`));
  // "Ons gehucht Heikant", of zonder naam "dit gehucht".
  const hetDorp = (S, wat) => (T.dorpsnaam(S) ? `Ons ${wat} ${veilig(T.dorpsnaam(S))}` : `dit ${wat}`);

  // Welke brief nu open staat (alleen scherm; na het laden staat er geen open).
  let open = null;

  // Het venster: een kop met de datum, de brief in de hand van de heer (aanhef, tekst, groet), en daaronder wat
  // het spel er zelf bij zegt (staat), de knoppen en een voetregel. Een knop die nu niet kan, staat er wel, maar
  // grijs; waarom zegt de staat.
  function venster({ wanneer, aan, tekst, staat = '', knoppen = [], voet = '' }) {
    const naam = T.naamVanDeHeer();
    const knop = (k) => `<button${k.hoofd ? ' class="heer-geef-knop"' : ''} data-actie="${k.actie}"${k.kan === false ? ' disabled' : ''}>${k.tekst}</button>`;
    return (
      `<div class="venster-kop"><span class="venster-titel">Een brief van de heer</span><span class="venster-wanneer">${wanneer}</span>` +
      `<button class="venster-sluit" data-actie="sluit" title="Sluiten (Esc)">✕</button></div>` +
      `<div class="brief-tekst"><p>${aan}</p>${tekst}` +
      `<p class="brief-groet">Uw genadige heer${naam ? `,<br>${veilig(naam)}` : ''}</p></div>` +
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
      const brief = S.heer && S.heer.brief;
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
      const v = S.heervaart && S.heervaart.vraag;
      if (!v) return null;
      const keuzes = T.heervaartKeuzes(S);
      const vrij = keuzes.find((k) => k.actie === 'vrijkopen');
      const wie = T.heervaartWieTekst(S, v.wie);
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
  };

  // Komt de marskramer nog deze maand, dan kun je nog verkopen voor zijn goud: de brief zegt het erbij.
  function marskramerKomtNog(S, maand) {
    const bezoek = T.HANDEL_INSTELLINGEN && T.HANDEL_INSTELLINGEN.bezoeken.find((b) => b.maand === maand);
    if (!bezoek || !S.kalender) return '';
    const nu = T.datumVanDag(S.kalender.dag);
    const komtNog = T.MAANDEN[nu.maand].naam === bezoek.maand && nu.dagVanMaand < bezoek.dag;
    return komtNog ? ` De marskramer komt op ${bezoek.dag} ${bezoek.maand}: dan kun je nog verkopen voor zijn goud.` : '';
  }

  // Welke brief op je wacht, voor de knop Brief: de heervaart eerst (daar hoort een dag bij), dan de schatting.
  const wachtend = (S) => (S.heervaart && S.heervaart.vraag ? 'heervaart' : S.heer && S.heer.brief ? 'schatting' : null);

  // De knop Brief naast Bouwen: alleen zolang er een brief op je wacht.
  T.ui.werkBriefKnopBij = function (S) {
    $('brief-knop').classList.toggle('verborgen', !wachtend(S));
  };

  // Een brief in het venster: `soort` uit BRIEVEN, of zonder soort de brief die op je wacht.
  T.ui.toonBrief = function (S, soort) {
    soort = soort || wachtend(S);
    const brief = soort && BRIEVEN[soort] && BRIEVEN[soort](S);
    if (!brief) return;
    open = soort;
    const box = $('brief');
    box.innerHTML = venster(brief);
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

  // Een knop onder een brief. Sluiten en het titelscherm kan elke brief; de heervaart vraagt het aan de regels.
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
    if (open === 'heervaart') {
      const keuze = T.heervaartKeuzes(S).find((k) => k.actie === actie);
      if (!keuze || !keuze.kan) return;
      keuze.doe(S);
      T.ui.sluitBrief(S);
    }
  });

  $('brief-knop').addEventListener('click', (ev) => {
    ev.currentTarget.blur();
    if (!T.S) return;
    if (T.ui.briefOpen()) T.ui.sluitBrief(T.S);
    else T.ui.toonBrief(T.S);
  });
})(globalThis.Spel = globalThis.Spel || {});
