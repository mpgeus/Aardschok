// De statussen van het dorp (werklijst vraag 77, stap 2; Marcel, 1 okt: "Iets wat begint en eindigt. Mogelijk in
// verschillende niveaus"): wat er in het dorp speelt en een probleem is, zoals honger, kou, droogte of de koorts, met
// sinds wanneer en op welk niveau. Een status is iets wat je kunt zien en zelf kunt veranderen; de kaartjes in de balk
// (js/hud.js) tonen hem, met wat helpt. Tot 15 okt stonden ze bij de voorvallen (js/voorvallen.js), die er hun oorzaak
// uit haalden; ze verhuisden in ronde 3 van het snoeien (ontwerp/snoeien.md), omdat de voorvallen weggaan en de
// statussen blijven. Regels zonder scherm; toetsen in test/statussen.test.cjs.
(function (T) {
  'use strict';

  // Alle getallen in één blok, zoals elders (CLAUDE.md); ze staan ook in de werkbank (js/opties.js).
  T.STATUSSEN_INSTELLINGEN = {
    // Onder deze tevredenheid is het dorp ontevreden (de status onvrede), en onder onrust is het onrustig (het tweede
    // niveau).
    onvrede: 0.5,
    onrust: 0.35,
    // Is er vandaag minder dan dit deel van het eten dat het dorp nodig heeft, dan is het hongersnood.
    hongersnood: 0.5,
  };
  const IN = () => T.STATUSSEN_INSTELLINGEN;

  const inWinter = (dag) => T.datumVanDag(dag).seizoen === 'winter';

  // Wat het dorp mist (D.behoeften.mist, js/behoeften.js), zoals de speler het ziet: dus met dezelfde T.t-zin.
  const mist = (D, wat) => !!(D.behoeften && D.behoeften.mist && D.behoeften.mist.includes(wat));
  const brandhout = (D) => ((D.voorraad && D.voorraad.hout) || 0) + ((D.voorraad && D.voorraad.turf) || 0);

  // Wat in het dorp speelt en een probleem uitlokt: iets wat je kunt zien (de balk zegt het, of de raad) en zelf kunt
  // veranderen. Zo komt een ramp niet uit de lucht, maar uit iets wat je had kunnen zien (het concept,
  // ontwerp/concept.md: "problemen hebben oorzaken"). Per oorzaak: wat er dan is (kop), en of hij nu speelt (speelt:
  // geeft waarom, het stuk zin na "want", of '' als er niets bij hoeft; null als hij niet speelt). Voor het rapport van
  // de raadsman (tot 15 okt, js/ochtendrapport.js) ook hoe je zegt dat hij blijft (nog) en dat hij over is (voorbij).
  // Een status die zijn begin en eind zelf zegt (het gevecht, de koorts), heeft `zegtZelf`.
  //
  // Sinds 9 okt (werklijst vraag 77, stap 2; de richtlijn van 1 okt: "Iets wat begint en eindigt. Mogelijk in
  // verschillende niveaus") is een oorzaak een status: `naam` voor de balk, en `erger` het tweede niveau, met zijn eigen
  // naam, kop en `speelt` (dat alleen gevraagd wordt als het eerste niveau speelt). `helpt` zegt wat helpt, voor het
  // kaartje in de balk (js/hud.js).
  T.OORZAKEN = {
    // Een gevecht (js/gevecht.js; werklijst vraag 170, stap 2): zolang er gevochten wordt, loopt de tijd hooguit op 1×.
    gevecht: {
      zegtZelf: true,
      inVeldslag: true, // de enige die een leger in een veldslag heeft (js/veldslag.js): het is geen dorp
      naam: T.t('Fighting'),
      kop: T.t('There is fighting'),
      nog: T.t('There is still fighting'),
      voorbij: T.t('The fighting is over'),
      speelt: (D) => (D.gevecht ? '' : null),
      helpt: () => T.t('your soldiers: choose them, and right-click an enemy'),
    },
    honger: {
      naam: T.t('Hunger'),
      kop: T.t('There is hunger'),
      nog: T.t('There is still hunger'),
      voorbij: T.t('The hunger is over'),
      speelt: (D) => (T.standVanWet(D, 'rantsoen') === 'krap' ? T.t('the rations are short') : mist(D, T.t('food')) ? T.t('there is not enough food') : null),
      erger: {
        naam: T.t('Famine'),
        kop: T.t('There is famine'),
        minder: T.t('The famine is over, but there is still hunger'),
        speelt: (D) => (D.behoeften && D.behoeften.voedselDekking < IN().hongersnood ? T.t('there is not even half a ration to eat') : null),
      },
      helpt: (D) => {
        const h = T.watHelptAanEten(D);
        return h.length ? T.opsomming(h.map((x) => x.zin)) : T.t('more food: more fields, livestock, a fisherman or a hunter');
      },
    },
    // De afwisseling (vraag 154; Marcel, 13 okt: "A1, B1"): eet het dorp minder dan vier soorten, dan werkt het trager
    // (T.werkVanAfwisseling, js/behoeften.js); met één soort het traagst. Wat helpt: T.watHelptAanAfwisseling (js/raad.js).
    eentonig: {
      naam: T.t('Plain fare'),
      kop: T.t('The food is plain'),
      nog: T.t('The food is still plain'),
      voorbij: T.t('The food is varied again'),
      // Niets te eten is honger, geen eentonig eten: dan speelt alleen die status.
      speelt: (D) => (T.werkVanAfwisseling(D) < 1 && D.behoeften.afwisseling.length ? T.t('the village eats only {soorten}, and works at {werk}%', afwisselingWoorden(D)) : null),
      erger: {
        naam: T.t('One dish'),
        kop: T.t('The village eats one dish'),
        minder: T.t('The village eats more than one dish again, but the food is still plain'),
        speelt: (D) => (D.behoeften.afwisseling.length === 1 ? T.t('there is only {soorten}, and it works at {werk}%', afwisselingWoorden(D)) : null),
      },
      helpt: (D) => {
        const h = T.watHelptAanAfwisseling(D);
        return h.length ? T.opsomming(h.map((x) => x.zin)) : T.t('another kind of food');
      },
    },
    // Wie geen huis heeft (js/afbreken.js; werklijst C, stap 5; Marcel, 14 okt: "ze lopen los, met een melding dat er
    // huizen nodig zijn"): het gezin slaapt op het plein tot er een woning met plaats is (T.verhuisUitHetKamp, js/begin.js).
    dakloos: {
      naam: T.t('Homeless'),
      kop: T.t('People have no home'),
      nog: T.t('People still have no home'),
      voorbij: T.t('Everyone has a home again'),
      speelt: (D) => {
        const n = T.daklozeGezinnen(D).length;
        return n ? T.t('{n|one family sleeps|# families sleep} on the square', { n }) : null;
      },
      helpt: () => T.t('a hut or a house with room for them'),
    },
    kou: {
      naam: T.t('Cold'),
      kop: T.t('It is cold in the houses'),
      nog: T.t('It is still cold in the houses'),
      voorbij: T.t('It is no longer cold in the houses'),
      speelt: (D, dag) => (!inWinter(dag) || !mist(D, T.t('firewood for the winter')) ? null : brandhout(D) < 1 ? T.t('the firewood has run out') : T.t('the logs will not last the winter')),
      erger: {
        naam: T.t('Bitter cold'),
        kop: T.t('It is freezing in the houses'),
        minder: T.t('It is no longer freezing in the houses, but it is still cold'),
        speelt: (D) => (brandhout(D) < 1 ? T.t('the firewood has run out') : null),
      },
      helpt: () => T.t('firewood: a woodcutter, peat, or logs from the merchant'),
    },
    vol: {
      naam: T.t('Full'),
      kop: T.t('The houses are full'),
      nog: T.t('The houses are still full'),
      voorbij: T.t('There is room in the houses again'),
      speelt: (D) => ((D.bevolking || 0) > 0 && D.bevolking >= T.telWoonruimte(D) ? '' : null),
      erger: {
        naam: T.t('Overcrowded'),
        kop: T.t('The houses are overcrowded'),
        minder: T.t('The houses are no longer overcrowded, but they are full'),
        speelt: (D) => ((D.bevolking || 0) > T.telWoonruimte(D) ? T.t('more people live here than there is room for') : null),
      },
      helpt: () => T.t('room to live: mark out a plot, or let a house grow'),
    },
    // De wolven (js/beesten.js; werklijst vraag 116, stap 2b): de laatste dagen kwamen ze bij het dorp (wie werkte, zag
    // ze; ze namen een schaap; ze vielen iemand aan).
    wolven: {
      naam: T.t('Wolves'),
      kop: T.t('There are wolves near the village'),
      nog: T.t('There are still wolves near the village'),
      voorbij: T.t('The wolves keep to the forest again'),
      speelt: (D, dag) => T.wolvenBijHetDorp(D, dag),
      helpt: () => T.t('your soldiers: choose them, and right-click a wolf; and light in the dark'),
    },
    // De droogte (js/weer.js; Marcel, 9 okt): lang geen regen in het groeiseizoen.
    droogte: {
      naam: T.t('Drought'),
      kop: T.t('It is dry'),
      nog: T.t('It is still dry'),
      voorbij: T.t('The drought is over'),
      speelt: (D) => (T.droogteNiveau(D) >= 1 ? droogteWaarom(D) : null),
      erger: {
        naam: T.t('Severe drought'),
        kop: T.t('The drought is severe'),
        minder: T.t('The drought is no longer severe, but it is still dry'),
        speelt: (D) => (T.droogteNiveau(D) >= 2 ? droogteWaarom(D) : null),
      },
      helpt: (D) => T.t('rain; until then it costs the harvest ({n}% less now), and the brooks are dry. Keep grain aside for the winter, or buy it from the merchant', { n: Math.round((1 - T.droogteFactor(D)) * 100) }),
    },
    // De koorts (js/koorts.js; vraag 144, 3): zolang er iemand ziek is.
    koorts: {
      zegtZelf: true,
      naam: T.t('Fever'),
      kop: T.t('There is fever in the village'),
      nog: T.t('There is still fever in the village'),
      voorbij: T.t('The fever is over'),
      speelt: (D) => (T.koortsNiveau(D) >= 1 ? T.koortsWaarom(D) : null),
      erger: {
        naam: T.t('Epidemic'),
        kop: T.t('The fever is an epidemic'),
        minder: T.t('It is no longer an epidemic, but there is still fever'),
        speelt: (D) => (T.koortsNiveau(D) >= 2 ? T.koortsWaarom(D) : null),
      },
      helpt: () => T.t('a clean well, ale instead of water, and fewer people crowded together (a full village and the cold make it worse)'),
    },
    // Brandgevaar (js/brand.js; vraag 144, 3): in de droogte vat een dak makkelijk vlam.
    brandgevaar: {
      naam: T.t('Fire risk'),
      kop: T.t('There is a risk of fire'),
      nog: T.t('There is still a risk of fire'),
      voorbij: T.t('The risk of fire is over'),
      speelt: (D, dag) => (T.brandgevaarNiveau(D, dag) >= 1 ? T.t('it is dry, and a thatched roof catches fire easily') : null),
      erger: {
        naam: T.t('High fire risk'),
        kop: T.t('There is a high risk of fire'),
        minder: T.t('The risk of fire is no longer high, but it is still there'),
        speelt: (D, dag) => (T.brandgevaarNiveau(D, dag) >= 2 ? (T.droogteNiveau(D) >= 2 ? T.t('the drought is severe') : T.t('it is dry, and the houses are full')) : null),
      },
      helpt: () => T.t('rain; until then logs in store, to put out fires and rebuild, and a village that is not too full'),
    },
    onvrede: {
      naam: T.t('Discontent'),
      kop: T.t('The village is discontented'),
      nog: T.t('The village is still discontented'),
      voorbij: T.t('The village is no longer discontented'),
      speelt: (D) => {
        const b = D.behoeften;
        if (!b || b.tevredenheid >= IN().onvrede) return null;
        if (b.last && b.last.length) return T.t('it is troubled by {last}', { last: T.opsomming(b.last) });
        return b.mist && b.mist.length ? T.t('it lacks {mist}', { mist: T.opsomming(b.mist) }) : '';
      },
      erger: {
        naam: T.t('Unrest'),
        kop: T.t('There is unrest in the village'),
        minder: T.t('The unrest is over, but the village is still discontented'),
        speelt: (D) => (D.behoeften && D.behoeften.tevredenheid < IN().onrust ? T.t('it is deeply discontented') : null),
      },
      helpt: (D) => {
        const b = D.behoeften;
        return b && b.mist && b.mist.length ? T.t('what it lacks: {mist}', { mist: T.opsomming(b.mist) }) : T.t('what the village lacks (the advice says what)');
      },
    },
  };
  // Wat het dorp eet en hoe hard het werkt, voor de status eentonig.
  const afwisselingWoorden = (D) => ({
    soorten: T.opsomming(D.behoeften.afwisseling.map((wat) => T.waarNaam(wat))),
    werk: Math.round(T.werkVanAfwisseling(D) * 100),
  });
  function droogteWaarom(D) {
    const W = T.weerVan(D);
    return W && W.droog >= 3 ? T.t('it has not rained for {getal} days', { getal: T.telwoord(W.droog) }) : T.t('too little rain is falling');
  }

  // Speelt oorzaak `o` nu? Dan { id, zin, waarom }, met de zin die het bericht erbij zegt: "There is hunger, for the
  // rations are short." Anders null.
  // Met `niveau` (1, of 2 als het erger is: hongersnood, strenge kou, ...) en de `naam` van dat niveau, voor de balk.
  T.oorzaakNu = function (D, o, dag) {
    const O = T.OORZAKEN[o];
    const waarom = O.speelt(D, dag);
    if (waarom == null) return null;
    const erger = O.erger ? O.erger.speelt(D, dag) : null;
    const N = erger != null ? O.erger : O;
    const w = erger != null ? erger : waarom;
    const zin = w ? T.t('{kop}, for {waarom}.', { kop: N.kop, waarom: w }) : `${N.kop}.`;
    return { id: o, niveau: erger != null ? 2 : 1, naam: N.naam, zin, waarom: w };
  };

  // Welke oorzaken er nu spelen, in de volgorde van T.OORZAKEN, als [{ id, zin }].
  T.oorzakenNu = (D, dag) =>
    Object.keys(T.OORZAKEN)
      .filter((o) => !D.veldslag || T.OORZAKEN[o].inVeldslag)
      .map((o) => T.oorzaakNu(D, o, dag))
      .filter(Boolean);

  // De statussen van het dorp (werklijst vraag 77, stap 2; de richtlijn van 1 okt: "Iets wat begint en eindigt"): wat er
  // nu speelt, met sinds wanneer en op welk niveau (`D.statussen`, elke nacht), voor de kaartjes in de balk (js/hud.js).
  // Een bericht zegt het als hij begint, erger of minder wordt, of ophoudt (CLAUDE.md, "Een toestand is een status"; tot
  // 15 okt zei het rapport van de raadsman dat, en dat ging in ronde 3 van het snoeien weg).
  T.tikStatussenDag = function (D, dag) {
    const oud = D.statussen || {};
    const nieuw = {};
    for (const o of T.oorzakenNu(D, dag)) {
      const m = oud[o.id];
      nieuw[o.id] = { sinds: m ? m.sinds : dag, niveau: o.niveau };
      if (T.OORZAKEN[o.id].zegtZelf) continue;
      if (!m || o.niveau > m.niveau) T.zeg(D, o.zin, 'gevaar');
      else if (o.niveau < m.niveau) T.zeg(D, `${T.OORZAKEN[o.id].erger.minder}.`);
    }
    for (const id of Object.keys(oud)) {
      const O = T.OORZAKEN[id];
      if (!nieuw[id] && O && !O.zegtZelf) T.zeg(D, `${O.voorbij}.`, 'goed');
    }
    D.statussen = nieuw;
    if (T.ui && T.ui.toonStatussen) T.ui.toonStatussen(D);
  };
  // Wat er nu speelt, als [{ id, niveau, naam, zin, sinds, helpt }]: de oorzaken van vandaag, met sinds wanneer.
  T.statussenVan = function (D, dag = D.kalender ? Math.floor(D.kalender.dag) : 0) {
    const st = D.statussen || {};
    return T.oorzakenNu(D, dag).map((o) => {
      const O = T.OORZAKEN[o.id];
      return Object.assign(o, { sinds: st[o.id] ? st[o.id].sinds : dag, helpt: O.helpt ? O.helpt(D) : '' });
    });
  };
})(globalThis.Spel = globalThis.Spel || {});
