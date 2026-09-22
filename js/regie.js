// Een korte reeks handelingen afspelen: geen gevecht, maar een scène. Dit is het regieboek
// waarmee de tutorial straks de meester laat lopen, praten en toveren terwijl hij ouder wordt
// (ontwerp/verhaal.md, "De opening" en "Hij doet zijn moestuin, tot hij sterft"). Elke functie
// hier geeft, net als js/anim.js, een belofte terug, zodat een scène als gewone code met await
// leest: T.regie.speel(S, async () => { await T.regie.loop(meester, 7, 5); ... }).
//
// Tijdens een scène staat S.modus op 'regie': de speler kan niet wegklikken (js/main.js sluit
// de invoer af, zoals tijdens een gevecht of gesprek). Wél kan hij de scène overslaan (Escape).
// Overslaan verandert alleen het tempo, nooit de uitkomst: elke stap kent naast zijn normale,
// geanimeerde weg ook een versnelde versie die meteen dezelfde eindtoestand neerzet (waar iemand
// staat, hoeveel ouder hij werd), zodat de wereld er na het overslaan hetzelfde bij ligt als na
// het uitkijken.
(function (T) {
  'use strict';

  // De scène die nu loopt, of null. `lopend` zijn de nooddeuren van de stappen die op dit moment
  // wachten: overslaan roept ze allemaal aan, en elk past meteen zijn eindtoestand toe en meldt
  // zijn stap klaar. Meestal is dat er één, maar twee mensen kunnen tegelijk lopen (Wim rent de
  // toren uit terwijl het skelet hem volgt, js/tutorial.js): dan wachten er twee.
  let huidige = null;

  // Eén stap met twee wegen: `normaal` speelt hem af (geeft een belofte terug), `versneld` zet
  // in één klap de eindtoestand neer. Is de scène al overgeslagen vóór deze stap begint, dan
  // slaat hij `normaal` helemaal over. Begint hij te lopen en wordt er ondertussen overgeslagen,
  // dan rondt `versneld` hem meteen af; wat `normaal` daarna nog doet (een animatie die op haar
  // eigen tempo uitloopt) telt niet meer mee.
  function metOverslaan(normaal, versneld) {
    const scn = huidige;
    if (scn && scn.overgeslagen) {
      versneld();
      return Promise.resolve();
    }
    return new Promise((klaar) => {
      let gedaan = false;
      const versnel = () => {
        versneld();
        meld();
      };
      const meld = () => {
        if (gedaan) return;
        gedaan = true;
        if (scn) scn.lopend.delete(versnel);
        klaar();
      };
      if (scn) scn.lopend.add(versnel);
      normaal().then(meld);
    });
  }

  // Een wezen of een los punt naar tegelcoördinaten: wat T.tegelVan doet, maar ook goed voor
  // een voorwerp of een kale {x, y}.
  const punt = (o) => (o.tx != null ? { x: o.tx, y: o.ty } : { x: o.x, y: o.y });

  // loop(wie, x, y) — erheen lopen via T.zoekPad, en wachten tot hij er is. Geen weg (een doel
  // midden in een muur, bijvoorbeeld)? Dan blijft hij staan; een scène kiest zelf een haalbaar
  // doel, net zoals bij de held (js/verkennen.js kent hetzelfde patroon).
  function loop(wie, x, y) {
    return metOverslaan(
      async () => {
        const S = T.S;
        const w = S.wereld;
        const pad = T.zoekPad(
          T.tegelVan(wie),
          { x, y },
          (px, py) => T.isBegaanbaar(w, px, py, { deurenOpenen: wie === S.held, wezensBlokkeren: true, wie }),
          (px, py) => T.isVast(w, px, py),
        );
        if (pad) await T.anim.loop(wie, pad);
      },
      () => {
        wie.pad = [];
        wie.onderweg = false;
        wie.opKlaar = null; // niemand wacht er meer op; een lopende T.anim.loop-belofte laten we bewust hangen
        wie.tx = x;
        wie.ty = y;
        wie.x = x;
        wie.y = y;
      },
    );
  }

  // zeg(wie, tekst) — een regel in het gespreksvenster, met één knop om verder te gaan. Dat
  // hergebruikt het scherm van een gesprek (T.ui.toonDialoog) zonder de knopenboom van
  // js/gesprek.js: een scène is geen gesprek met keuzes, maar een tekst die de speler wegklikt.
  // Wie praat, is zolang S.spreektMet, net als in een gesprek: hij blijft dan zichtbaar achter
  // een boom (js/tekenen.js, doorkijk) en Wim praat met zijn handen in plaats van te vegen.
  function zeg(wie, tekst) {
    const S = T.S;
    const klaarMetPraten = () => {
      if (S.spreektMet === wie) S.spreektMet = null;
    };
    return metOverslaan(
      () => new Promise((klaar) => {
        S.spreektMet = wie;
        T.ui.toonDialoog(T.hoofdletter(wie.naam), tekst, [
          { tekst: 'Verder', kies: () => { T.ui.sluitDialoog(); klaarMetPraten(); klaar(); } },
        ]);
      }),
      () => {
        T.ui.sluitDialoog();
        klaarMetPraten();
      },
    );
  }

  // wacht(seconden) — even niets doen, in speltijd (T.anim.wacht), niet met setTimeout.
  function wacht(seconden) {
    return metOverslaan(() => T.anim.wacht(T.S, seconden * 1000), () => {});
  }

  // kijk(wie, naar) — draai naar een kijkrichting zonder te lopen. De richting staat in
  // e.beeldStand (js/sprites.js), dat elk beeld opnieuw zet zodra iemand beweegt en anders laat
  // staan zoals hij stond — precies waar dit op leunt, dus zonder sprites.js aan te raken. Nog
  // nooit getekend (geen beeldStand)? Dan is er niets om te draaien.
  function kijk(wie, naar) {
    if (!wie.beeldStand) return;
    const dx = naar.x - wie.x;
    const dy = naar.y - wie.y;
    if (dx || dy) wie.beeldStand.richting = T.sprites.richtingVan(dx, dy);
  }

  // camera(naar) — het beeld op iets richten dat niet de held is (de fontein, de meester). Dit
  // zet alleen het doel; main.js schuift er zelf soepel naartoe zolang S.modus 'regie' is
  // (cameraDoel), en T.regie.speel zet hem na afloop weer los. naar = null geeft de camera
  // meteen terug aan de held.
  function camera(naar) {
    T.S.regieCamera = naar ? punt(naar) : null;
  }

  // tover(wie, spreuk, doel, effect) — een spreuk uitspreken als een ander wezen dan de held:
  // eerst het (zichtbare) effect, dan pas het jaar via T.verouder — dezelfde volgorde als de held
  // (js/toveren.js). Dit is geen tweede spreukenmotor: het kost geen actiepunten en telt niet
  // voor meesterschap (dat is alleen van de held); het speelt de vlucht af die bij de spreuk
  // hoort en laat T.verouder de tijd innen. `effect` (mag weg) is wat de spreuk bij aankomst
  // doet — een skelet raken, bijvoorbeeld — en komt dus vóór het jaar: wie met zijn laatste
  // spreuk honderd wordt, ziet hem nog raken. Eigen wachtjes zorgen dat het effect en het jaar
  // allebei precies één keer gebeuren, of de stap nu uitgekeken of overgeslagen wordt.
  function tover(wie, spreukId, doel, effect) {
    const eig = T.SPREUKEN[spreukId];
    let geraakt = false;
    let geind = false;
    const raak = () => {
      if (geraakt) return;
      geraakt = true;
      if (effect) effect();
    };
    const verouder = () => {
      if (geind) return;
      geind = true;
      T.verouder(T.S, eig.basis.maanden, false, wie);
    };
    return metOverslaan(
      async () => {
        const S = T.S;
        const van = punt(wie);
        const naar = punt(doel);
        // Dezelfde worp als de held (js/toveren.js): de staf omhoog en de spreuk die in de bol
        // opbouwt, met de grijze vlokjes die uit zijn lijf worden gezogen. Zonder dit vertrok de
        // schicht van de meester zonder opbouw. Zonder js/toveren.js (in een toets) is er geen
        // worp, en dan vertrekt hij gewoon.
        if (T.worp) await T.worp(S, wie, spreukId, naar);
        await (eig.basis.schade ? T.anim.schicht(S, van, naar) : T.anim.wind(S, van, naar));
        // Opruimen zoals de held dat doet, anders eindigt uitkijken anders dan overslaan.
        wie.tovert = null;
        raak();
        verouder();
      },
      () => {
        wie.tovert = null;
        raak();
        verouder();
      },
    );
  }

  // sla(wie, doel, effect) — uithalen met de staf naar een tegel ernaast: de klap zelf is de
  // uitval uit js/anim.js (dezelfde als in een gevecht), en `effect` gebeurt op het moment van
  // de klap. Een klap met de staf kost niemand jaren; dat is juist wat de meester ermee laat zien.
  function sla(wie, doel, effect) {
    let geklapt = false;
    const klap = () => {
      if (geklapt) return;
      geklapt = true;
      if (effect) effect();
    };
    return metOverslaan(
      async () => {
        await T.anim.uitval(wie, punt(doel));
        klap();
      },
      () => {
        wie.uitval = null;
        klap();
      },
    );
  }

  T.regie = {
    // Speel `scene` (een async functie zonder argumenten) af: de invoer gaat op slot
    // (S.modus = 'regie', zie js/main.js) en weer open zodra de scène klaar is of overgeslagen
    // wordt.
    async speel(S, scene) {
      T.S = S; // zodat loop/zeg/wacht/kijk/camera/tover, die geen S krijgen, de goede spelstaat zien
      const scn = { overgeslagen: false, lopend: new Set() };
      const vorige = huidige;
      huidige = scn;
      const vorigeModus = S.modus;
      S.modus = 'regie';
      try {
        await scene();
      } finally {
        huidige = vorige;
        S.regieCamera = null;
        T.ui.sluitDialoog();
        if (S.modus === 'regie') S.modus = vorigeModus;
      }
    },

    // De speler drukt op de overslaan-toets (Escape tijdens 'regie', zie js/main.js): rond de
    // stap die nu loopt in één klap af. Alle stappen daarna zien meteen dat er overgeslagen is
    // en versnellen zichzelf.
    overslaan() {
      if (!huidige || huidige.overgeslagen) return;
      huidige.overgeslagen = true;
      for (const versnel of [...huidige.lopend]) versnel();
    },

    // Loopt er nu een scène? Voor wie iets anders wil doen zolang er geregisseerd wordt.
    bezig: () => !!huidige,

    // Een nieuw hoofdstuk in dezelfde scène: wie hiervóór oversloeg, heeft dat stuk overgeslagen,
    // niet de rest. Zo slaat Escape tijdens het gevecht aan het eind van de tutorial het gevecht
    // over, maar niet Wim die daarna om de meester rouwt (js/tutorial.js). Het einde van wat
    // overgeslagen werd, ligt er dan al precies zo bij als na uitkijken.
    hoofdstuk() {
      if (huidige) huidige.overgeslagen = false;
    },

    loop, zeg, wacht, kijk, camera, tover, sla,
  };
})(globalThis.Toren = globalThis.Toren || {});
