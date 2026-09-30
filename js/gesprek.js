// De regels van een gesprek, los van het scherm en dus in Node te toetsen
// (test/gesprek.test.cjs). De teksten zelf staan in gesprekken.js; hier staat alleen hoe we
// daaruit kiezen: welke regel van een lijst wint (de eerste die past), welke keuzes je te zien
// krijgt, en wat een antwoord doet. Een voorwaarde kijkt naar vlaggen, bezit en quests. (Tot 25 sep
// ook naar de leeftijd van de held, de tovenaar van het oude spel: ouderDan, jongerDan en
// ouderGewordenSinds; die gingen eruit met dat spel.)
//
// Een gesprek speelt tussen jou en iemand in een dorp (js/dorp.js; werklijst, vraag 71). Het krijgt daarom twee
// dingen mee: het spel (S: wat je in je tas hebt, je quests) en het dorp waar het gesprek is (D: wat er in het dorp
// speelt, als vlaggen, en het goud). De gespreksschrijver geeft twee keer dezelfde proefstaat mee. Wie beslist
// zonder jou (de raadsman, js/raadsman.js), geeft geen spel mee: dan telt niets uit je tas.
(function (T) {
  'use strict';

  // Eén verzameling vlaggen per dorp: wat er in het dorp speelt ("de heer is op bezoek", "de marskramer vertrekt"),
  // gezet door de regels van dat dorp (js/heer.js, js/handel.js, js/inner.js, js/herberg.js) en door een antwoord.
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
  // in T.GESPREKKEN. Maar negentien dorpelingen delen één soort ("dorpeling", zie js/kaart.js), en
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

  T.voorwaardeGeldt = function (S, D, wieId, als) {
    if (!als) return true;
    if (!elk(als.vlag).every((n) => T.heeftVlag(D, n))) return false;
    if (elk(als.nietVlag).some((n) => T.heeftVlag(D, n))) return false;
    const tas = S && S.inventaris;
    if (!elk(als.heeft).every((n) => tas && tas.has(n))) return false;
    if (elk(als.nietHeeft).some((n) => tas && tas.has(n))) return false;
    // Quests en goud wonen in js/quest.js en haken hier in: zonder dat bestand werkt een gesprek
    // gewoon door.
    if (T.questVoorwaarde && !T.questVoorwaarde(S, D, als)) return false;
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
  T.GESPREK_WOORDEN = T.GESPREK_WOORDEN || {};
  T.vulWoordenIn = (D, zin) => String(zin || '').replace(/\{(\w+)\}/g, (heel, w) => (T.GESPREK_WOORDEN[w] ? T.GESPREK_WOORDEN[w](D) : heel));

  // Eén knoop, opgelost tot wat er nu staat: de tekst die nu geldt, met de woorden ingevuld, en de
  // keuzes die nu tonen.
  T.gesprekKnoop = function (S, D, wieId, knoopId) {
    const knoop = T.GESPREKKEN[wieId].knopen[knoopId];
    const regel = T.eersteDiePast(S, D, wieId, knoop.tekst);
    return { tekst: regel ? T.vulWoordenIn(D, regel.zeg) : '', keuzes: T.zichtbareKeuzes(S, D, wieId, knoop.keuzes) };
  };

  // Wat een antwoord doet: een vlag zetten of wissen, en iets in je tas stoppen of eruit halen
  // (een naam, of een lijstje namen). Goud en quests staan in js/quest.js en haken hier in.
  T.doeGevolg = function (S, D, doe) {
    if (!doe) return;
    const lijst = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
    for (const naam of lijst(doe.zetVlag)) T.zetVlag(D, naam);
    for (const naam of lijst(doe.wisVlag)) T.wisVlag(D, naam);
    // Je tas: alleen als jij het gesprek voert (de raadsman heeft geen tas van je).
    const tas = S ? lijst(doe.geef).concat(lijst(doe.neem)) : [];
    if (S) for (const soort of lijst(doe.geef)) S.inventaris.add(soort);
    if (S) for (const soort of lijst(doe.neem)) S.inventaris.delete(soort);
    // Wat je in een gesprek krijgt of afgeeft, hoort meteen in beeld te staan; rondlopen doet
    // dat zelf (js/verkennen.js), maar een gesprek kwam daar niet langs.
    if (tas.length && T.ui && T.ui.toonInventaris) T.ui.toonInventaris(S);
    T.questGevolg(S, D, doe);
    // Handelen met de marskramer (js/handel.js): het venster staat in js/hud.js. Het gesprek sluit
    // daarna gewoon (sluit: true op hetzelfde antwoord); het venster blijft open.
    if (doe.handel && T.ui && T.ui.openHandel) T.ui.openHandel(D);
    // De heer betalen op Sint-Maarten (js/heer.js): net zo, het venster staat in js/hud.js.
    if (doe.heer && S && T.ui && T.ui.openHeer) T.ui.openHeer(S);
    // De inner een geschenk geven, voor minder op zijn rapport (js/inner.js).
    if (doe.omkopen && T.koopInnerOm) T.koopInnerOm(D, doe.omkopen);
    // Wat een antwoord op een voorval doet (js/voorvallen.js): graan, tevreden, verban, een vervolg, ... De
    // gespreksschrijver laadt dat bestand niet.
    if (T.voorvalGevolg) T.voorvalGevolg(D, doe);
  };
})(globalThis.Spel = globalThis.Spel || {});
