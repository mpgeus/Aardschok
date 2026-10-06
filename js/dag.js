// De dag: de zon, de dagindeling en het licht, als regels zonder scherm (zoals js/tijd.js), en het
// slapen tot de ochtend. Marcel koos op 26 sep een echte dag: vijf minuten bij 1×, in een maand van
// dertig dagen (ontwerp/spel.md, "Een dorp dat leeft en groeit"; werklijst punt 3b, stap 1).
// Toetsen: test/dag.test.cjs.
//
// Wat hier staat:
//   - de zon: hoeveel uur licht een dag heeft, per dag van het jaar (T.zonVan), op zo'n 53 graden
//     noorderbreedte: zo'n zestien uur rond 21 zomermaand, en acht rond de kortste dag;
//   - de dagindeling: wanneer men opstaat, werkt, schaft, naar huis gaat en slaapt (T.dagindeling),
//     en welk deel van de dag het nu is (T.dagdeelVan);
//   - het licht: hoe donker het is (T.lichtVan), voor js/tekenen.js;
//   - het ritme van de dag, voor de boeren en de bewoners (js/bewoners.js): waar ze 's ochtends,
//     overdag, 's avonds en 's nachts zijn (T.dagAnker, voor T.laatDwalen in js/verkennen.js), en of
//     ze nu werken (T.isWerktijd, voor T.werkOogstBij in js/akkers.js);
//   - slapen tot de ochtend, bij je eigen huis (T.magSlapen, T.gaSlapen, T.wordWakker, T.werkDagBij).
//
// Het uur is het deel achter de komma van de dagteller (T.uurVanDag, js/tijd.js), en de zon staat
// om twaalf uur het hoogst: zonnetijd, zoals in 1323, zonder zomertijd.
(function (T) {
  'use strict';

  // Alle getallen in één blok, zoals elders (CLAUDE.md); ze staan ook in de werkbank (js/opties.js).
  // Een eerste voorstel van Claude (26 sep), nog niet door Marcel bijgesteld.
  T.DAG_INSTELLINGEN = {
    // De zon, in uren licht: gemiddeld over het jaar, hoeveel langer in de zomer en korter in de
    // winter, en de dag van het jaar (vanaf 1 louwmaand) met het meeste licht (21 zomermaand). Zo
    // heeft de langste dag 16,4 uur licht en de kortste 7,6, op zo'n 53 graden noorderbreedte.
    daglichtGemiddeld: 12,
    daglichtSchommeling: 4.4,
    langsteDag: 170,
    // Opstaan met de zon, maar niet vóór vijf uur en niet na half acht: in de winter is het dan nog
    // donker, en voert men het vee bij een lamp. Na het ochtenduur begint het werk.
    opstaanVroegst: 5,
    opstaanLaatst: 7.5,
    ochtendUren: 1,
    // De schaft: brood op de akker, of thuis.
    schaftBegin: 12,
    schaftEind: 13,
    // Buiten de oogst stopt het werk om zeven uur, of eerder als het donker wordt. In de oogst (hooi
    // en graan) werkt iedereen tot het donker.
    werkTotLaatst: 19,
    // Naar bed zo'n drie uur na zonsondergang, maar niet vóór half negen en niet na tien uur.
    slapenNaZonOnder: 3,
    slapenVroegst: 20.5,
    slapenLaatst: 22,
    // Hoe ver een boer 's ochtends en 's avonds van zijn voordeur rondloopt: zijn erf.
    erfStraal: 2,
    // De marskramer, de heer en de inner komen overdag, vanaf dit uur.
    bezoekUur: 9,
    // Het licht: hoe donker de nacht is (0 is licht, 1 is zwart), hoe lang de schemering duurt, en
    // hoe ver het rond de schout 's nachts minder donker is, in tegels.
    nachtDonker: 0.68,
    schemerUren: 1,
    lichtStraal: 5,
    // De kleur van het uur (werklijst vraag 125, A; T.lichtKleurVan): de wereld wordt ermee vermenigvuldigd, dus 255 is de
    // kunst zoals hij is. Roze bij het opkomen, neutraal overdag, oranje bij het ondergaan, blauw in de nacht. Het roze
    // en het oranje liggen op de zon zelf, en gaan in kleurUren over naar de dag; de nacht komt in de schemering.
    lichtKleuren: {
      nacht: { r: 70, g: 86, b: 150 },
      dageraad: { r: 255, g: 200, b: 214 },
      dag: { r: 255, g: 255, b: 255 },
      avondrood: { r: 255, g: 186, b: 128 },
    },
    kleurUren: 2,
    // De zon voor de schaduwen (werklijst vraag 125, B; T.zonStand): hoe hoog ze op de middag staat (graden), hoe lang een
    // schaduw hooguit wordt (keer de hoogte van wat hem werpt), en hoe laag de zon mag staan voor er een schaduw is
    // (graden; daaronder zakt hij weg).
    zonHoogte: 50,
    schaduwLangst: 2.5,
    zonLaag: 6,
    // Slapen kan zo dichtbij je eigen huis, in tegels.
    slaapAfstand: 3,
  };
  const IN = () => T.DAG_INSTELLINGEN;
  const tussen = (v, a, b) => Math.max(a, Math.min(b, v));

  function bericht(tekst, soort) {
    if (T.ui && T.ui.bericht) T.ui.bericht(tekst, soort);
  }

  // ---------------------------------------------------------------------------------------------
  // De zon en de dagindeling
  // ---------------------------------------------------------------------------------------------

  // De dag van het jaar, van 0 (1 louwmaand) tot 359 (30 wintermaand).
  T.dagVanJaar = function (dag) {
    const d = T.datumVanDag(dag);
    return d.maand * T.DAGEN_PER_MAAND + d.dagVanMaand - 1;
  };

  // Zonsopgang en zonsondergang, in uren, rond twaalf uur 's middags.
  T.zonVan = function (dag) {
    const i = IN();
    const hoek = (2 * Math.PI * (T.dagVanJaar(dag) - i.langsteDag)) / T.DAGEN_PER_JAAR;
    const licht = i.daglichtGemiddeld + i.daglichtSchommeling * Math.cos(hoek);
    return { op: 12 - licht / 2, onder: 12 + licht / 2, licht };
  };

  // De dagindeling van deze dag, in uren. werkEindOogst is het eind van het werk in de oogst: tot
  // het donker.
  T.dagindeling = function (dag) {
    const i = IN();
    const zon = T.zonVan(dag);
    const opstaan = tussen(zon.op, i.opstaanVroegst, i.opstaanLaatst);
    const werkBegin = opstaan + i.ochtendUren;
    const werkEind = Math.max(werkBegin, Math.min(zon.onder, i.werkTotLaatst));
    const werkEindOogst = Math.max(werkBegin, zon.onder);
    const slapen = tussen(zon.onder + i.slapenNaZonOnder, i.slapenVroegst, i.slapenLaatst);
    return { zon, opstaan, werkBegin, schaftBegin: i.schaftBegin, schaftEind: i.schaftEind, werkEind, werkEindOogst, slapen };
  };

  // Welk deel van de dag het is: 'nacht', 'ochtend', 'werk', 'schaft' of 'avond'. In de oogst
  // (oogst: true) loopt het werk door tot het donker.
  T.dagdeelVan = function (dag, oogst) {
    const u = T.uurVanDag(dag);
    const d = T.dagindeling(dag);
    const eind = oogst ? d.werkEindOogst : d.werkEind;
    if (u < d.opstaan || u >= d.slapen) return 'nacht';
    if (u < d.werkBegin) return 'ochtend';
    if (u < eind && u >= d.schaftBegin && u < d.schaftEind) return 'schaft';
    if (u < eind) return 'werk';
    return 'avond';
  };

  T.isWerktijd = (dag, oogst) => T.dagdeelVan(dag, oogst) === 'werk';

  // Is het op deze dag oogst, van het graan of het hooi? Dan werkt iedereen tot het donker, en begint de
  // avond later (js/herberg.js).
  T.isOogstDag = function (dag) {
    const d = T.datumVanDag(dag);
    return T.akkerStadium(d.maand, d.dagVanMaand) === 'rijp' || !!T.isHooitijd(d);
  };

  // Het uur zoals je het zegt: "zeven uur", "half acht". Wat voor of na de middag is, zegt het deel
  // van de dag dat de balk eronder zet (js/hud.js).
  const GETALLEN = ['twaalf', 'een', 'twee', 'drie', 'vier', 'vijf', 'zes', 'zeven', 'acht', 'negen', 'tien', 'elf'];
  T.uurTekst = function (dag) {
    const u = T.uurVanDag(dag);
    const heel = Math.floor(u);
    if (u - heel >= 0.5) return 'half ' + GETALLEN[(heel + 1) % 12];
    return GETALLEN[heel % 12] + ' uur';
  };

  // ---------------------------------------------------------------------------------------------
  // Het licht
  // ---------------------------------------------------------------------------------------------

  // Hoe donker het is, van 0 (de zon is op) tot nachtDonker (nacht), met een schemering van
  // schemerUren vóór zonsopgang en na zonsondergang; en een gloed (0 tot 1) rond zonsopgang en
  // zonsondergang, voor een warm randje aan de dag (js/tekenen.js). `nacht` is hetzelfde van 0 tot 1:
  // hoe ver het naar de nacht is, voor wie wat ziet (js/zien.js) en wat 's avonds brandt.
  T.lichtVan = function (dag) {
    const i = IN();
    const u = T.uurVanDag(dag);
    const zon = T.zonVan(dag);
    const s = Math.max(0.01, i.schemerUren);
    let donker = 0;
    if (u < zon.op) donker = Math.min(1, (zon.op - u) / s);
    else if (u > zon.onder) donker = Math.min(1, (u - zon.onder) / s);
    const gloed = Math.max(0, 1 - Math.min(Math.abs(u - zon.op), Math.abs(u - zon.onder)) / s);
    return { donker: donker * i.nachtDonker, nacht: donker, gloed };
  };

  // Waar de schaduwen van de zon heen vallen (werklijst vraag 125, B, de proefplaat): { x, y } de richting over de grond
  // (in tegels, lengte 1), `lengte` hoe lang een schaduw is tegen de hoogte van wat hem werpt, en `sterkte` van 0 (de zon
  // is onder) tot 1. Op de middag valt hij naar rechtsonder op het scherm (x+), zoals de schaduw die in de plaatjes
  // gebakken is: hun licht komt van linksboven (vraag 124). 's Ochtends draait hij een kwartslag naar rechtsboven (y-), en
  // 's avonds naar linksonder (y+); hoe lager de zon, hoe langer.
  T.zonStand = function (dag) {
    const i = IN();
    const u = T.uurVanDag(dag);
    const zon = T.zonVan(dag);
    const f = (u - zon.op) / Math.max(0.01, zon.onder - zon.op); // 0 bij zonsopgang, 1 bij zonsondergang
    const hoogte = f > 0 && f < 1 ? i.zonHoogte * Math.sin(Math.PI * f) : 0;
    const draai = (f - 0.5) * Math.PI;
    const lengte = hoogte > 0 ? Math.min(i.schaduwLangst, 1 / Math.tan((hoogte * Math.PI) / 180)) : 0;
    return { x: Math.cos(draai), y: Math.sin(draai), lengte, sterkte: tussen(hoogte / Math.max(0.01, i.zonLaag), 0, 1) };
  };

  // De kleur van het licht op dit uur (werklijst vraag 125, A; Marcel, 4 okt: "A ja"): [r, g, b] van 0 tot 1, waarmee
  // js/gl.js de wereld vermenigvuldigt. Van de nacht naar de dageraad in de schemering voor zonsopgang, dan in kleurUren
  // naar de dag; voor zonsondergang in kleurUren naar het avondrood, en in de schemering erna naar de nacht.
  T.lichtKleurVan = function (dag) {
    const i = IN();
    const k = i.lichtKleuren;
    const u = T.uurVanDag(dag);
    const zon = T.zonVan(dag);
    const s = Math.max(0.01, i.schemerUren);
    const o = Math.max(0.01, i.kleurUren);
    const meng = (a, b, t) => {
      const f = tussen(t, 0, 1);
      return [a.r + (b.r - a.r) * f, a.g + (b.g - a.g) * f, a.b + (b.b - a.b) * f].map((v) => v / 255);
    };
    if (u < zon.op) return meng(k.nacht, k.dageraad, 1 - (zon.op - u) / s);
    if (u < zon.op + o) return meng(k.dageraad, k.dag, (u - zon.op) / o);
    if (u < zon.onder - o) return meng(k.dag, k.dag, 0);
    if (u < zon.onder) return meng(k.dag, k.avondrood, (u - (zon.onder - o)) / o);
    return meng(k.avondrood, k.nacht, (u - zon.onder) / s);
  };

  // ---------------------------------------------------------------------------------------------
  // Het ritme van de boeren
  // ---------------------------------------------------------------------------------------------

  // Waar iemand nu hoort, als het deel van de dag het zegt ("Wie wanneer waar is" in ontwerp/spel.md):
  //   - 's nachts binnen (binnen: true; T.laatDwalen zet hem naar binnen als hij voor zijn deur staat);
  //   - 's ochtends op zijn erf, en wie van het gezin water haalt, bij de put;
  //   - overdag, bij het werk en de schaft, bij zijn werk. Wie geen werk heeft: een kind op het plein,
  //     een oude en een kleuter bij huis (de plekken zet js/bewoners.js, per bewoner);
  //   - 's avonds op zijn erf, of in de herberg als hij vanavond gaat (js/herberg.js, T.herbergAnker);
  //   - op een feest op het plein: een hele dag, of de avond (js/feesten.js, T.feestAnker);
  //   - wie net in het gehucht komt, eerst naar zijn huis, en wie wegtrekt, overdag naar de uitgang
  //     van de kaart (js/bewoners.js, T.werkBewonersBij).
  // Een boer volgt hetzelfde. Overdag werkt hij op zijn land (T.werkVeldwerkBij, js/veldwerk.js) en maait hij in de
  // oogst (T.werkOogstBij, js/akkers.js), en zolang hij dat doet, dwaalt hij niet; is er niets te doen, dan is hij bij
  // zijn boerderij (zijn werk). Zijn boerin en grote kinderen helpen bij het zaaien en de oogst (T.helpAnker).
  //
  // Voor de boeren (een huis en een akker) en de bewoners (e.bewoner, js/bewoners.js); de schout, het
  // vee en een bezoeker volgen hun eigen weg, en een man van de militie bij een aanval ook (opgeroepen: hij
  // loopt met de schout mee, js/rovers.js). Wie ergens anders moet zijn (moetNaar: de schandpaal,
  // js/heer.js), volgt dat en niet de dag, en wie de schout zoekt met een voorval ook (js/voorvallen.js).
  T.dagAnker = function (D, e, oogst) {
    if (!D || !D.kalender || !e || !e.thuis || e.moetNaar || e.opgeroepen || e.zoektSchout) return null;
    // Wie in de herberg logeert (de marskramer), zit er 's avonds en slaapt er (js/herberg.js).
    const logies = T.logiesAnker ? T.logiesAnker(D, e) : null;
    if (logies) return logies;
    // De raadsman die zijn rapport brengt (js/ochtendrapport.js): vóór het opstaan al naar de deur van de schout, en
    // staat die buiten bij zijn huis, naar hem toe. Ook als het nog nacht is.
    const rapport = T.rapportAnker ? T.rapportAnker(D, e) : null;
    if (rapport) return rapport;
    const p = e.bewoner;
    if (!p && !e.werkAkkers) return null;
    const deel = T.dagdeelVan(D.kalender.dag, oogst);
    if (deel === 'nacht') return { x: e.thuis.x, y: e.thuis.y, straal: 0, binnen: true };
    // Wie wegtrekt, loopt overdag de weg af; wie nieuw is, loopt eerst naar zijn huis (js/bewoners.js,
    // T.werkBewonersBij).
    if (e.vertrekt) return { x: e.vertrekt.x, y: e.vertrekt.y, straal: 1 };
    // Op een feest staat het hele dorp op het plein (js/feesten.js): een hele dag vanaf het begin van het werk, of
    // 's avonds; ook een boer, en de herbergierster tapt er.
    const feest = T.feestAnker ? T.feestAnker(D, e) : null;
    if (feest) return feest;
    const erf = { x: e.thuis.x, y: e.thuis.y, straal: IN().erfStraal };
    // 's Avonds de herberg in, wie vanavond gaat (ook een boer, en de herbergierster zelf).
    const herberg = deel === 'avond' && T.herbergAnker ? T.herbergAnker(D, e) : null;
    if (herberg) return herberg;
    if (!p) return deel === 'ochtend' || deel === 'avond' ? erf : null;
    if (p.komt) return erf;
    const plek = p.plek || {};
    if (deel === 'ochtend') return (p.haaltWater && plek.put) || erf;
    if (deel === 'avond') return erf;
    // Wie zijn eigen hut bouwt op een erf (js/erven.js), werkt er overdag aan, en niet op zijn werk.
    if (p.huis && p.huis.erf && !p.huis.klaar) return erf;
    // De boerin en de grote kinderen helpen hun boer bij het zaaien en de oogst (js/veldwerk.js).
    const helpt = deel === 'werk' && T.helpAnker ? T.helpAnker(D, e) : null;
    if (helpt) return helpt;
    return plek.werk || plek.vrij || erf;
  };

  // Komen de marskramer, de heer en de inner al? Overdag, vanaf het bezoekuur. Zonder kalender (een
  // toets) meteen.
  T.isBezoektijd = function (D) {
    if (!D || !D.kalender) return true;
    return T.uurVanDag(D.kalender.dag) >= IN().bezoekUur;
  };

  // Een bezoeker komt aan: de marskramer (S.marskramer), de heer (S.heer.bezoek) of de inner
  // (S.inner.bezoek). Eén manier voor alle drie; tot 26 sep had elk zijn eigen variant. Elk bezoek
  // draagt zijn eigen aankomst mee:
  //   bezoek.aankomst = { tekst, soort, naarGewoon }  // het bericht, en of de tijd naar 1× gaat
  //   bezoek.meteen = true                            // niet op het bezoekuur wachten: Spel.debug
  //                                                   // riep hem, of er is geen wereld om in te lopen
  // Hij komt overdag, vanaf het bezoekuur. De eerste keer dat hij er mag zijn, zegt het bericht dat
  // hij komt, en met naarGewoon gaat de tijd naar 1× (de heer en de inner: wie sneller speelt, ziet
  // hen anders nauwelijks komen). Geeft true zodra hij er mag zijn; zijn poppetje zet de module zelf.
  T.bezoekerKomtAan = function (D, bezoek) {
    if (!bezoek) return false;
    if (bezoek.aangekomen) return true;
    if (!bezoek.meteen && !T.isBezoektijd(D)) return false;
    bezoek.aangekomen = true;
    const a = bezoek.aankomst || {};
    if (a.tekst) T.zeg(D, a.tekst, a.soort);
    if (a.naarGewoon) T.naarGewoneSnelheid(D);
    return true;
  };

  // ---------------------------------------------------------------------------------------------
  // Slapen tot de ochtend
  // ---------------------------------------------------------------------------------------------

  // Hoe ver de schout van zijn huis staat, in tegels tot de rand ervan (het huis met huis: 'schout'
  // in kaarten/gehucht.betekenis.json, door T.zetBestaandeGebouwen in S.gebouwen gezet). Voor het slapen,
  // en voor de raadsman die 's ochtends zijn rapport brengt (js/ochtendrapport.js).
  T.afstandTotHuis = function (D) {
    const g = (D.gebouwen || []).find((x) => x.huis === 'schout');
    const h = D.schout;
    if (!g || !h) return Infinity;
    const voet = g.voet || { b: 1, h: 1 };
    const dx = Math.max(g.x - h.tx, 0, h.tx - (g.x + voet.b - 1));
    const dy = Math.max(g.y - h.ty, 0, h.ty - (g.y + voet.h - 1));
    return Math.max(dx, dy);
  };

  // Slapen kan 's avonds en 's nachts, bij je eigen huis, als je gewoon rondloopt.
  T.magSlapen = function (S) {
    if (!S || !S.kalender || S.slaap || (S.dorp && S.dorp.einde) || S.modus !== 'verkennen') return false;
    const deel = T.dagdeelVan(S.kalender.dag);
    if (deel !== 'nacht' && deel !== 'avond') return false;
    return T.afstandTotHuis(S.dorp) <= IN().slaapAfstand;
  };

  // De schout gaat naar binnen, en de nacht gaat snel voorbij (T.SLAAP_SNELHEID) tot het opstaan.
  // Een venster dat intussen opengaat, zet de tijd stil en daarna weer op slaapsnelheid.
  T.gaSlapen = function (S) {
    if (!T.magSlapen(S)) return false;
    const nu = S.kalender.dag;
    const morgen = T.uurVanDag(nu) >= T.dagindeling(nu).opstaan ? Math.floor(nu) + 1 : Math.floor(nu);
    const tot = morgen + T.dagindeling(morgen).opstaan / 24;
    S.slaap = { tot, vorige: S.kalender.snelheid || S.kalender.laatsteSnelheid || 1 };
    const h = S.schout;
    if (h) {
      h.pad = h.onderweg && h.pad.length ? [h.pad[0]] : [];
      h.binnen = true;
      h.deurSinds = S.tijd; // hij vervaagt, en verdwijnt niet in één klap (js/tekenen.js)
    }
    S.naLopen = null;
    T.zetSnelheid(S, T.SLAAP_SNELHEID);
    bericht('Je gaat slapen. Bij het eerste licht word je wakker.');
    if (T.ui && T.ui.werkSlaapKnopBij) T.ui.werkSlaapKnopBij(S);
    return true;
  };

  // Wakker: de schout staat weer voor zijn deur, en de tijd loopt zoals vóór het slapen.
  T.wordWakker = function (S) {
    if (!S || !S.slaap) return;
    const vorige = S.slaap.vorige;
    S.slaap = null;
    if (S.schout) {
      S.schout.binnen = false;
      S.schout.deurSinds = S.tijd;
    }
    if (S.kalender && S.kalender.snelheid === T.SLAAP_SNELHEID) T.zetSnelheid(S, vorige || 1);
    if (T.ui && T.ui.werkSlaapKnopBij) T.ui.werkSlaapKnopBij(S);
  };

  // Elk beeld (js/main.js): is het ochtend, dan wordt de schout wakker.
  T.werkDagBij = function (S) {
    if (S && S.slaap && S.kalender && S.kalender.dag >= S.slaap.tot) {
      T.wordWakker(S);
      bericht('Het is ochtend.');
    }
  };
})(globalThis.Spel = globalThis.Spel || {});
