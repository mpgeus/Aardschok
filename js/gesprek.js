// De regels van een gesprek, los van het scherm en dus in Node te toetsen
// (test/gesprek.test.cjs). De teksten zelf staan in gesprekken.js; hier staat alleen hoe we
// daaruit kiezen: welke regel van een lijst wint (de eerste die past), welke keuzes je te zien
// krijgt, en wat een antwoord doet. Een voorwaarde kijkt naar vlaggen, bezit en quests. (Tot 25 sep
// ook naar de leeftijd van de held: ouderDan, jongerDan en ouderGewordenSinds; die gingen eruit
// met het oude spel.)
(function (T) {
  'use strict';

  // Eén verzameling vlaggen op de spelstaat, zoals S.inventaris al een verzameling voorwerpen is:
  // dat houdt opslaan later simpel. Een vlag telt ook als hij een bestaand veld op de spelstaat is
  // (zoals S.sleutelGebruikt) — zo hoeft zoiets niet twee keer bijgehouden te worden.
  function vlaggen(S) {
    if (!S.vlaggen) S.vlaggen = new Set();
    return S.vlaggen;
  }
  T.zetVlag = (S, naam) => vlaggen(S).add(naam);
  T.wisVlag = (S, naam) => vlaggen(S).delete(naam);
  T.heeftVlag = (S, naam) => vlaggen(S).has(naam) || S[naam] === true;

  // Wiens gesprek voert dit wezen? Normaal zijn soort ("wim", "bakker"), want daaronder staat het
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
  // { vlag: ['meesterDood', 'sleutelGebruikt'] } geldt pas als ze allebei staan. Dat is er op
  // 22 sep bij gekomen omdat een situatie in de gespreksschrijver een toestand is en er dus twee
  // vlaggen tegelijk in kunnen staan; zonder dit kon je in zo'n situatie geen antwoord toevoegen
  // dat er ook echt stond.
  const elk = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);

  T.voorwaardeGeldt = function (S, wieId, als) {
    if (!als) return true;
    if (!elk(als.vlag).every((n) => T.heeftVlag(S, n))) return false;
    if (elk(als.nietVlag).some((n) => T.heeftVlag(S, n))) return false;
    if (!elk(als.heeft).every((n) => S.inventaris && S.inventaris.has(n))) return false;
    if (elk(als.nietHeeft).some((n) => S.inventaris && S.inventaris.has(n))) return false;
    // Quests en goud wonen in js/quest.js en haken hier in: zonder dat bestand werkt een gesprek
    // gewoon door.
    if (T.questVoorwaarde && !T.questVoorwaarde(S, als)) return false;
    return true;
  };

  // De eerste regel uit een lijst (tekst-varianten) waarvan de voorwaarde klopt. Een regel zonder
  // 'als' klopt altijd, en hoort daarom onderaan als vangnet.
  T.eersteDiePast = function (S, wieId, lijst) {
    return lijst.find((regel) => T.voorwaardeGeldt(S, wieId, regel.als)) || null;
  };

  // Welke keuzes van een knoop nu zichtbaar zijn.
  T.zichtbareKeuzes = function (S, wieId, keuzes) {
    return (keuzes || []).filter((keuze) => T.voorwaardeGeldt(S, wieId, keuze.als));
  };

  // Eén knoop, opgelost tot wat er nu staat: de tekst die nu geldt, en de keuzes die nu tonen.
  T.gesprekKnoop = function (S, wieId, knoopId) {
    const knoop = T.GESPREKKEN[wieId].knopen[knoopId];
    const regel = T.eersteDiePast(S, wieId, knoop.tekst);
    return { tekst: regel ? regel.zeg : '', keuzes: T.zichtbareKeuzes(S, wieId, knoop.keuzes) };
  };

  // Wat een antwoord doet: een vlag zetten of wissen, en iets in je tas stoppen of eruit halen
  // (een naam, of een lijstje namen). Goud en quests staan in js/quest.js en haken hier in.
  T.doeGevolg = function (S, doe) {
    if (!doe) return;
    const lijst = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
    for (const naam of lijst(doe.zetVlag)) T.zetVlag(S, naam);
    for (const naam of lijst(doe.wisVlag)) T.wisVlag(S, naam);
    const tas = lijst(doe.geef).concat(lijst(doe.neem));
    for (const soort of lijst(doe.geef)) S.inventaris.add(soort);
    for (const soort of lijst(doe.neem)) S.inventaris.delete(soort);
    // Wat je in een gesprek krijgt of afgeeft, hoort meteen in beeld te staan; rondlopen doet
    // dat zelf (js/verkennen.js), maar een gesprek kwam daar niet langs.
    if (tas.length && T.ui && T.ui.toonInventaris) T.ui.toonInventaris(S);
    if (T.questGevolg) T.questGevolg(S, doe);
    // Handelen met de marskramer (js/handel.js): het venster staat in js/hud.js. Het gesprek sluit
    // daarna gewoon (sluit: true op hetzelfde antwoord); het venster blijft open.
    if (doe.handel && T.ui && T.ui.openHandel) T.ui.openHandel(S);
    // De heer betalen op Sint-Maarten (js/heer.js): net zo, het venster staat in js/hud.js.
    if (doe.heer && T.ui && T.ui.openHeer) T.ui.openHeer(S);
  };
})(globalThis.Toren = globalThis.Toren || {});
