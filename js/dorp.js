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
// Elk dorp leeft (vraag 71, A): zijn dag, zijn bezoekers, zijn mensen, zijn rovers en zijn voorvallen, elk beeld, ook
// als je er niet bent (T.werkDorpBij). Een dorp waar je niet bent, heeft zijn poppetjes, die lopen, maaien en dwalen
// zoals thuis, alleen niet getekend. Een ander dorp dan het jouwe (D.ander) spreekt niet tegen jou: wat het zegt,
// bewaart het (T.zeg), en een venster dat het zou openen, komt niet bij jou (js/hud.js, js/brieven.js).
//
// Tot 30 sep stond dit allemaal los in S, en kon er maar één dorp zijn.
(function (T) {
  'use strict';

  T.DORP_INSTELLINGEN = {
    gezegd: 20, // zoveel berichten bewaart een ander dorp (D.gezegd), voor wie later vertelt hoe het er staat
  };

  // Een nieuw dorp op kaart w, met zijn schout: wat er op de kaart staat (de gebouwen, de boeren, het vee), en wie er
  // verder woont. `zaad` is het lot van de boeren (js/boeren.js): hetzelfde zaad geeft hetzelfde dorp. `ander`: het is
  // niet jouw dorp (het buurdorp): het spreekt niet tegen jou.
  T.nieuwDorp = function (S, w, schout, opties) {
    const o = opties || {};
    const D = {
      ander: !!o.ander,
      wereld: w,
      kalender: S.kalender,
      schout,
      voorraad: T.nieuweVoorraad(), // goud, graan, wol, hout (js/voorraad.js)
      gebouwen: [], // wat er staat of in aanbouw is (js/gebouwen.js), en hoe ver D.gebouwenDag is
      bevolking: 0, woonruimte: 0, // aantal mensen, en hoeveel er als woonruimte gegeven is
      behoeften: T.nieuweBehoeften(), // tevredenheid en wat het dorp mist (js/behoeften.js)
      trede: 'gehucht', // de trede van het dorp: een dorp bij 20 dorpelingen, marktrecht bij 20 ambachtslieden (js/treden.js)
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
    // Wat er gelopen wordt, telt vanaf de eerste stap, en wat van het dorp is, heeft meteen zijn lantaarn (js/paden.js).
    T.nieuwePaden(w);
    T.zetLantaarns(D);
    return D;
  };

  // Is de schout van dit dorp weg: op reis over het land (js/land.js haalt hem dan van de kaart), in een andere
  // provincie, of in een ander gebied (js/gebied.js)? Dan beslist de raadsman (js/voorvallen.js), en roept niemand de
  // militie bij hem (js/rovers.js). Een dorp zonder schout heeft er ook geen die er is.
  T.schoutIsWeg = (D) => !D.schout || !D.wereld.wezens.includes(D.schout);

  // Wat een dorp tegen het scherm zegt (vraag 71, C): een bericht komt bij jou als het jouw dorp is. Een ander dorp
  // bewaart het, de laatste twintig (D.gezegd), zodat later de marskramer, of wie je stuurt, kan vertellen hoe het er
  // staat. Zo zegt een regel over een dorp het altijd: T.zeg(D, tekst, soort), en nooit rechtstreeks T.ui.bericht.
  T.zeg = function (D, tekst, soort) {
    if (!D.ander) {
      if (T.ui && T.ui.bericht) T.ui.bericht(tekst, soort);
      return;
    }
    const g = D.gezegd || (D.gezegd = []);
    g.push({ dag: Math.floor((D.kalender && D.kalender.dag) || 0), tekst, soort: soort || '' });
    if (g.length > T.DORP_INSTELLINGEN.gezegd) g.shift();
  };

  // Elk beeld, voor elk dorp (js/main.js): zijn dag, zijn bezoekers, zijn mensen, zijn rovers, zijn voorvallen en het
  // rapport van de raadsman. Ligt het dorp niet waar je bent (S.wereld), dan lopen, maaien en dwalen zijn poppetjes hier
  // ook, zoals js/main.js het doet voor waar je wel bent: op zijn eigen kaart, en niet getekend. `dt` is de tijd van het
  // scherm, `dtWereld` die van de wereld (js/tijd.js).
  T.werkDorpBij = function (S, D, dt, dtWereld) {
    T.werkGebouwenBij(D); // merkt zelf een nieuwe dag op de kalenderklok (js/gebouwen.js)
    T.werkMarskramerBij(D); // zijn poppetje: over de weg binnen, naar het plein, en weer weg (js/handel.js)
    T.werkHeerBij(D); // net zo: de heer en zijn soldaten op Sint-Maarten (js/heer.js)
    T.werkDoorzoekenBij(D); // zijn soldaten zoeken, met de schout mee of waar de heer wijst (js/doorzoeken.js)
    T.werkInnerBij(S, D); // en de inner in oogstmaand: hij loopt zijn ronde, of met de schout mee (js/inner.js)
    T.werkBewonersBij(D); // een nieuw gezin komt over de weg, wie wegtrekt gaat (js/bewoners.js)
    T.werkRoversBij(S, D); // rovers komen naar een akker, roven en gaan weer; de militie loopt met je mee (js/rovers.js)
    T.werkVoorvallenBij(S, D); // wie je zoekt met een voorval, loopt naar je toe en spreekt je aan (js/voorvallen.js)
    T.werkZaakBij(S, D); // staat de schout bij het spoor van de graanzak, dan ziet hij het (js/zaak.js)
    T.werkOchtendrapportBij(S, D); // 's ochtends geeft je raadsman je zijn rapport (js/ochtendrapport.js)
    if (D.wereld === S.wereld) return; // waar je bent, lopen en dwalen ze in js/main.js, en worden ze getekend
    T.werkBeestenBij(S, D); // de wolven en de herten in zijn bos (js/beesten.js)
    T.beweegWezens(S, D.wereld, dt, dtWereld); // lopen (js/anim.js)
    T.werkOogstBij(S, D, dtWereld); // maaien (js/akkers.js)
    T.werkVeldwerkBij(S, D); // de boeren op hun land (js/veldwerk.js)
    T.dwaal(S, D.wereld, D, dtWereld); // en dwalen, naar het ritme van de dag (js/verkennen.js)
  };

  // Het dorp waar de schout nu is: het dorp met de kaart waarop hij staat, of null (een ander gebied, of op reis
  // over het land; dan blijft S.wereld de kaart van zijn dorp, js/land.js, en is dat het dorp hier).
  T.dorpHier = (S) => (S.dorpen || []).find((D) => D.wereld === S.wereld) || null;
})(globalThis.Spel = globalThis.Spel || {});
