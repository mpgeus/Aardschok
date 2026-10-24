// De regels van een gesprek, los van het scherm en dus in Node te toetsen
// (test/gesprek.test.cjs). De teksten zelf staan in gesprekken.js; hier staat alleen hoe we
// daaruit kiezen: welke regel van een lijst wint (de eerste die past), welke keuzes je te zien
// krijgt, en wat een antwoord doet. Een voorwaarde kijkt hier naar vlaggen. (Tot 25 sep ook naar de
// leeftijd van de held, de tovenaar van het oude spel: ouderDan, jongerDan en ouderGewordenSinds;
// die gingen eruit met dat spel. Tot 23 okt ook naar wat je in je tas had, naar de quests en naar
// het goud: die gingen weg met Tiled, in ronde 4 van het snoeien.)
//
// De voorwaarden en de gevolgen zijn één taal voor de gesprekken en de triggers van een scenario (vraag 187;
// ontwerp/scenario.md, 2): elk woord staat één keer in T.VOORWAARDEN of T.GEVOLGEN, hier de woorden van de gesprekken,
// en js/scenario.js zet die van de triggers erbij. De gespreksschrijver laadt js/scenario.js niet, en kent dus alleen
// de woorden van hier.

//
// Een gesprek speelt tussen jou en iemand in een dorp (js/dorp.js; werklijst, vraag 71). Het krijgt daarom twee
// dingen mee: het spel (S) en het dorp waar het gesprek is (D: wat er in het dorp speelt, als vlaggen). De
// gespreksschrijver geeft twee keer dezelfde proefstaat mee.
(function (T) {
  'use strict';

  // Eén verzameling vlaggen per dorp: wat er in het dorp speelt ("de heer is op bezoek", "de marskramer vertrekt"),
  // gezet door de regels van dat dorp (js/heer.js, js/handel.js, js/herberg.js) en door een antwoord.
  // Een vlag telt ook als hij een bestaand veld op het dorp is, zodat zoiets niet twee keer bijgehouden hoeft te
  // worden.
  function vlaggen(D) {
    if (!D.vlaggen) D.vlaggen = new Set();
    return D.vlaggen;
  }
  T.zetVlag = (D, naam) => vlaggen(D).add(naam);
  T.wisVlag = (D, naam) => vlaggen(D).delete(naam);
  T.heeftVlag = (D, naam) => vlaggen(D).has(naam) || D[naam] === true;

  // Wiens gesprek voert dit wezen? Normaal zijn soort ("heer", "marskramer"), want daaronder staat het
  // in T.GESPREKKEN. Maar alle dorpelingen delen één soort ("dorpeling"), en
  // die hoeven niet allemaal hetzelfde te zeggen: staat er `gesprek` op, dan telt die. Zo krijgt
  // de vrouw bij de put haar eigen tekst zonder dat er een wezensoort voor bij hoeft.
  T.gesprekIdVan = (wezen) => (wezen && wezen.gesprek) || (wezen && wezen.soort) || null;
  T.gesprekVan = (wezen) => {
    const id = T.gesprekIdVan(wezen);
    return id && T.GESPREKKEN ? T.GESPREKKEN[id] || null : null;
  };

  // Eén voorwaarde (als); zie de uitleg boven in gesprekken.js voor wat erin mag staan.
  // Eén naam, of een lijstje — net als zetVlag in een gevolg. Een lijstje betekent "allemaal":
  // { vlag: ['heerOpBezoek', 'heerSchuld'] } geldt pas als ze allebei staan. Dat is er op
  // 22 sep bij gekomen omdat een situatie in de gespreksschrijver een toestand is en er dus twee
  // vlaggen tegelijk in kunnen staan; zonder dit kon je in zo'n situatie geen antwoord toevoegen
  // dat er ook echt stond.
  const elk = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

  // Elk woord van een voorwaarde: (S, D, waarde) geeft of het geldt. Alle woorden van één `als` moeten gelden; een woord
  // dat niemand kent, geldt niet (een tikfout laat zo niets afgaan; de keuring van js/scenario.js meldt het). `wie` is
  // geen voorwaarde maar zegt over welk dorp ze gaat (js/scenario.js).
  T.VOORWAARDEN = {
    vlag: (S, D, v) => elk(v).every((n) => T.heeftVlag(D, n)),
    nietVlag: (S, D, v) => !elk(v).some((n) => T.heeftVlag(D, n)),
  };
  T.voorwaardeGeldt = function (S, D, wieId, als) {
    if (!als) return true;
    for (const [woord, waarde] of Object.entries(als)) {
      if (woord === 'wie') continue;
      const geldt = T.VOORWAARDEN[woord];
      if (!geldt || !geldt(S, D, waarde)) return false;
    }
    return true;
  };

  // De eerste regel uit een lijst (tekst-varianten) waarvan de voorwaarde klopt. Een regel zonder
  // 'als' klopt altijd, en hoort daarom onderaan als vangnet.
  T.eersteDiePast = function (S, D, wieId, lijst) {
    return lijst.find((regel) => T.voorwaardeGeldt(S, D, wieId, regel.als)) || null;
  };

  // Welke keuzes van een knoop nu zichtbaar zijn.
  T.zichtbareKeuzes = function (S, D, wieId, keuzes) {
    return (keuzes || []).filter((keuze) => T.voorwaardeGeldt(S, D, wieId, keuze.als));
  };

  // Woorden die het spel invult (27 sep): {gisteravond} in een zin wordt wat
  // T.GESPREK_WOORDEN.gisteravond(D) zegt over het dorp waar het gesprek is. Zo kan een zin een naam noemen die per spel
  // anders is, zoals wie er gisteravond in de herberg zat (js/herberg.js). Een woord dat niemand kent, blijft staan.
  // Een zin uit T.GESPREKKEN is gegevens (de gespreksschrijver schrijft hem terug), dus hij gaat eerst naar de taal van
  // nu (T.tGegevens, js/taal.js; vraag 147), en dan komen de woorden erin. Alles wat een gesprek toont, komt hierlangs:
  // de naam erboven, de tekst van een knoop, en een antwoord (js/dialoog.js).
  T.GESPREK_WOORDEN = T.GESPREK_WOORDEN || {};
  T.vulWoordenIn = (D, zin) => T.tGegevens(zin).replace(/\{(\w+)\}/g, (heel, w) => (T.GESPREK_WOORDEN[w] ? T.GESPREK_WOORDEN[w](D) : heel));

  // Eén knoop, opgelost tot wat er nu staat: de tekst die nu geldt, met de woorden ingevuld, en de
  // keuzes die nu tonen.
  T.gesprekKnoop = function (S, D, wieId, knoopId) {
    const knoop = T.GESPREKKEN[wieId].knopen[knoopId];
    const regel = T.eersteDiePast(S, D, wieId, knoop.tekst);
    return { tekst: regel ? T.vulWoordenIn(D, regel.zeg) : '', keuzes: T.zichtbareKeuzes(S, D, wieId, knoop.keuzes) };
  };

  // Wat een antwoord doet: een vlag zetten of wissen (een naam, of een lijstje namen), en een venster openen. Elk woord
  // van een gevolg: (S, D, waarde) doet het; een woord dat niemand kent, doet niets (de keuring meldt het).
  T.GEVOLGEN = {
    zetVlag: (S, D, v) => elk(v).forEach((naam) => T.zetVlag(D, naam)),
    wisVlag: (S, D, v) => elk(v).forEach((naam) => T.wisVlag(D, naam)),
    // Handelen met de marskramer (js/handel.js): het venster staat in js/hud.js. Het gesprek sluit
    // daarna gewoon (sluit: true op hetzelfde antwoord); het venster blijft open.
    handel: (S, D, v) => v && T.ui && T.ui.openHandel && T.ui.openHandel(D),
    // De heer betalen op Sint-Maarten (js/heer.js): net zo, het venster staat in js/hud.js.
    heer: (S, D, v) => v && S && T.ui && T.ui.openHeer && T.ui.openHeer(S),
  };
  T.doeGevolg = function (S, D, doe) {
    if (!doe) return;
    for (const [woord, waarde] of Object.entries(doe)) if (T.GEVOLGEN[woord]) T.GEVOLGEN[woord](S, D, waarde);
  };
})(globalThis.Spel = globalThis.Spel || {});
