// De regels van een gesprek, los van het scherm en dus in Node te toetsen
// (test/gesprek.test.cjs). De teksten zelf staan in gesprekken.js; hier staat alleen hoe we
// daaruit kiezen: welke regel van een lijst wint (de eerste die past), welke keuzes je te zien
// krijgt, en wat een antwoord doet. Zie ontwerp/spreuken.md, "Het dorp ziet je ouder worden": dat
// is de reden dat een voorwaarde ook naar de klok mag kijken (ouderGewordenSinds), niet alleen
// naar vlaggen en bezit.
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

  // Hoeveel maanden ouder de held is geworden sinds hij <wieId> voor het laatst sprak; null als
  // ze elkaar nog nooit gesproken hebben (dan geldt de voorwaarde nooit — er is nog geen "vorige
  // keer" om mee te vergelijken). js/dialoog.js roept onthoudAfscheid aan zodra het gesprek stopt.
  T.ouderGewordenSinds = function (S, wieId) {
    const bij = S.gesprekLeeftijd && S.gesprekLeeftijd[wieId];
    return bij == null ? null : S.held.leeftijd - bij;
  };
  T.onthoudAfscheid = function (S, wieId) {
    if (!S.gesprekLeeftijd) S.gesprekLeeftijd = {};
    S.gesprekLeeftijd[wieId] = S.held.leeftijd;
  };

  // Eén voorwaarde (als); zie de uitleg boven in gesprekken.js voor wat erin mag staan.
  T.voorwaardeGeldt = function (S, wieId, als) {
    if (!als) return true;
    if (als.vlag && !T.heeftVlag(S, als.vlag)) return false;
    if (als.nietVlag && T.heeftVlag(S, als.nietVlag)) return false;
    if (als.heeft && !(S.inventaris && S.inventaris.has(als.heeft))) return false;
    if (als.nietHeeft && S.inventaris && S.inventaris.has(als.nietHeeft)) return false;
    if (als.ouderDan != null && T.jaren(S.held.leeftijd) <= als.ouderDan) return false;
    if (als.jongerDan != null && T.jaren(S.held.leeftijd) >= als.jongerDan) return false;
    if (als.ouderGewordenSinds != null) {
      const maanden = T.ouderGewordenSinds(S, wieId);
      if (maanden == null || maanden < als.ouderGewordenSinds) return false;
    }
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

  // Wat een antwoord doet: een vlag zetten en/of wissen (een naam, of een lijstje namen). Goud en
  // quests bestaan nog niet; die kunnen hier later bij.
  T.doeGevolg = function (S, doe) {
    if (!doe) return;
    const lijst = (v) => (Array.isArray(v) ? v : [v]);
    if (doe.zetVlag) for (const naam of lijst(doe.zetVlag)) T.zetVlag(S, naam);
    if (doe.wisVlag) for (const naam of lijst(doe.wisVlag)) T.wisVlag(S, naam);
  };
})(globalThis.Toren = globalThis.Toren || {});
