// Een dorp: alles wat bij een dorp hoort, bij elkaar (werklijst, vraag 71; Marcel, 30 sep: "A ja B ja C ja").
//
// Het spel (S, in de browser Spel.S) is: de kalender, het land, jij (de schout, S.schout), waar je bent (S.wereld),
// wat er op het scherm is, en de dorpen (S.dorpen). Een dorp (D) heeft alles van zichzelf: zijn kaart (D.wereld), zijn
// voorraad, gebouwen en mensen, zijn wetten, hoe de heer en de inner ertegenover staan, zijn rovers, voorvallen en
// raadsman, zijn trede en zijn vee, en zijn eigen schout (D.schout; in jouw dorp ben jij dat, in een buurdorp later
// een schout in code). De kalender is voor alle dorpen dezelfde: D.kalender is S.kalender.
//
// Een regel over een dorp krijgt het dorp mee (D). Heeft hij ook het spel nodig (of je vecht, praat of slaapt, de
// klok van het scherm), dan krijgt hij allebei: (S, D). Je eigen dorp is S.dorp: daarover gaat de balk, ook als je
// elders bent (vraag 71, C). Het dorp waar je nu bent, zegt T.dorpHier.
//
// Tot 30 sep stond dit allemaal los in S, en kon er maar één dorp zijn.
(function (T) {
  'use strict';

  // Een nieuw dorp op kaart w, met zijn schout: wat er op de kaart staat (de gebouwen, de boeren, het vee), en wie er
  // verder woont. `zaad` is het lot van de boeren (js/boeren.js): hetzelfde zaad geeft hetzelfde dorp. `speler`: dit
  // is het dorp van de speler.
  T.nieuwDorp = function (S, w, schout, opties) {
    const o = opties || {};
    const D = {
      speler: !!o.speler,
      wereld: w,
      kalender: S.kalender,
      schout,
      voorraad: T.nieuweVoorraad(), // goud, graan, wol, hout (js/voorraad.js)
      gebouwen: [], // wat er staat of in aanbouw is (js/gebouwen.js), en hoe ver D.gebouwenDag is
      bevolking: 0, woonruimte: 0, // aantal mensen, en hoeveel er als woonruimte gegeven is
      behoeften: T.nieuweBehoeften(), // tevredenheid en wat het dorp mist (js/behoeften.js)
      trede: 'gehucht', // de trede van het dorp: een dorp bij genoeg mensen, een kapel en een smidse (js/treden.js)
      wetten: T.nieuweWetten(), // welke wetten het dorp aannam (js/wetten.js)
      goud: 0,
      goudGehad: false, // ooit goud gehad? dan blijft het vakje in beeld, ook op nul
      einde: null, // de heer ontsloeg de schout (js/heer.js, T.ambtKwijt); in jouw dorp is het spel dan uit
    };
    // Een klein beginvoorraadje (kaarten/<naam>.betekenis.json, "beginVoorraad") en de gebouwen die al op de kaart
    // staan (js/gebouwen.js), zodat een dorp niet leeg begint.
    for (const wat in w.beginVoorraad || {}) T.zetVoorraad(D, wat, w.beginVoorraad[wat]);
    T.zetBestaandeGebouwen(D);
    // Wie de boeren zijn en wat ze kunnen, wordt bij elk nieuw dorp geloot (js/boeren.js).
    T.lootBoeren(D, o.zaad != null ? o.zaad : undefined);
    // De beginkudde op de weide(s) die de kaart noemt (js/vee.js), net als de gebouwen hierboven; ná het lot, want
    // het zaad van het dorp kiest ook de kleuren van het vee.
    T.zetBeginKudde(D);
    // Wie er verder woont, en wie waar werkt (js/bewoners.js): ná het lot, want het karakter van een boer zegt wie er
    // bij hem woont (de weduwe heeft drie kleine kinderen).
    T.zetBeginBewoners(D);
    return D;
  };

  // Is de schout van dit dorp weg: op reis over het land (js/land.js haalt hem dan van de kaart), in een andere
  // provincie, of in een ander gebied (js/gebied.js)? Dan beslist de raadsman (js/voorvallen.js), en roept niemand de
  // militie bij hem (js/rovers.js). Een dorp zonder schout heeft er ook geen die er is.
  T.schoutIsWeg = (D) => !D.schout || !D.wereld.wezens.includes(D.schout);

  // Het dorp waar de schout nu is: het dorp met de kaart waarop hij staat, of null (een ander gebied, of op reis
  // over het land; dan blijft S.wereld de kaart van zijn dorp, js/land.js, en is dat het dorp hier).
  T.dorpHier = (S) => (S.dorpen || []).find((D) => D.wereld === S.wereld) || null;
})(globalThis.Spel = globalThis.Spel || {});
