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

  // De scène die nu loopt, of null. `versnel` is de nooddeur van de stap die op dit moment
  // wacht: overslaan roept hem aan, die past meteen de eindtoestand toe en meldt de stap klaar.
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
      const meld = () => {
        if (gedaan) return;
        gedaan = true;
        if (scn) scn.versnel = null;
        klaar();
      };
      if (scn) {
        scn.versnel = () => {
          versneld();
          meld();
        };
      }
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
  function zeg(wie, tekst) {
    return metOverslaan(
      () => new Promise((klaar) => {
        T.ui.toonDialoog(T.hoofdletter(wie.naam), tekst, [
          { tekst: 'Verder', kies: () => { T.ui.sluitDialoog(); klaar(); } },
        ]);
      }),
      () => T.ui.sluitDialoog(),
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

  // tover(wie, spreuk, doel) — een spreuk uitspreken als een ander wezen dan de held: eerst het
  // (zichtbare) effect, dan pas het jaar via T.verouder — dezelfde volgorde als de held
  // (js/toveren.js). Dit is geen tweede spreukenmotor: het kost geen actiepunten en telt niet
  // voor meesterschap (dat is alleen van de held); het speelt de vlucht af die bij de spreuk
  // hoort en laat T.verouder de tijd innen. Een eigen wachtje zorgt dat dat jaar hooguit één
  // keer wordt geïnd, of de stap nu uitgekeken of overgeslagen wordt.
  function tover(wie, spreukId, doel) {
    const eig = T.SPREUKEN[spreukId];
    let geind = false;
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
        await (eig.basis.schade ? T.anim.schicht(S, van, naar) : T.anim.wind(S, van, naar));
        verouder();
      },
      verouder,
    );
  }

  T.regie = {
    // Speel `scene` (een async functie zonder argumenten) af: de invoer gaat op slot
    // (S.modus = 'regie', zie js/main.js) en weer open zodra de scène klaar is of overgeslagen
    // wordt.
    async speel(S, scene) {
      T.S = S; // zodat loop/zeg/wacht/kijk/camera/tover, die geen S krijgen, de goede spelstaat zien
      const scn = { overgeslagen: false, versnel: null };
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
      if (huidige.versnel) huidige.versnel();
    },

    loop, zeg, wacht, kijk, camera, tover,
  };
})(globalThis.Toren = globalThis.Toren || {});
