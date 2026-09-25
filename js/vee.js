// Het vee: koeien en schapen, op één plek.
//
// Marcel wil weides met koeien en schapen (25 sep 2026; ontwerp/spel.md, "Weides met koeien en
// schapen"). Hij koos: eerst de dieren tekenen, dan de regels. Dit bestand is dus nog klein: wat een
// dier is, en hoe je er een neerzet dat rond zijn plek graast, staat, loopt en ligt. De kunst komt
// uit gereedschap/pixelart/vee.cjs (koe0..2, schaap0..2 in beelden/), en js/sprites.js kiest per
// beeld de houding (T.rustVanDier hieronder).
//
// Wat hier later bij komt, als de regels er zijn (spel.md):
//   - weides aanleggen, zoals akkers, en de dieren erop zetten;
//   - wat ze geven, door het jaar heen: een koe elke dag melk, die je tot kaas maakt (kaas houdt
//     goed, dus wintervoer), en in slachtmaand vlees en huiden voor de slager en de leerlooier; een
//     schaap wol, en misschien meer;
//   - de inner telt de kudde, want vee is rijkdom die je ziet: wie slim is, drijft een deel het bos
//     in voordat hij komt.
// Getallen om bij te stellen komen dan net als elders bovenaan in een blok (zoals
// T.BEHOEFTEN_INSTELLINGEN), en een keuze met meer dan één goed antwoord wordt een optie
// (js/opties.js).
(function (T) {
  'use strict';

  // ── Vorm van één soort ──
  //
  //   T.VEE.<soort> = {
  //     naam:     'koe',        // bij de muis: "Een koe"
  //     meervoud: 'koeien',
  //     snelheid: 0.9,          // tegels per seconde; moet gelijk zijn aan SNELHEID in
  //                             // gereedschap/pixelart/vee.cjs, anders glijden de voeten
  //     straal:   4,            // hoe ver het van zijn plek af dwaalt
  //     kleuren:  3,            // hoeveel vellen er zijn: koe0, koe1, koe2 (het zaad kiest er een)
  //     pauze:    [6, 16],      // seconden stilstaan tussen twee stappen: vee loopt weinig
  //     rust:     { grazen, liggen, blok },  // zie T.rustVanDier
  //   }
  T.VEE = {
    // roodbruin, zwart en zwartbont; een koe kuiert
    koe: {
      naam: 'koe', meervoud: 'koeien', snelheid: 0.9, straal: 4, kleuren: 3, pauze: [6, 16],
      rust: { grazen: 0.6, liggen: 0.15, blok: 12 },
    },
    // vuilwit, bruin, en een met een zwarte kop; een schaap trippelt iets vlotter, en graast meer
    schaap: {
      naam: 'schaap', meervoud: 'schapen', snelheid: 1.1, straal: 3, kleuren: 3, pauze: [4, 12],
      rust: { grazen: 0.7, liggen: 0.1, blok: 9 },
    },
  };

  // Een vast getal in [0, 1) uit drie gehele getallen: dezelfde invoer geeft altijd hetzelfde getal
  // (dezelfde menging als de hash in gereedschap/pixelart/kern.cjs). Zo kan het spel elk beeld
  // opnieuw vragen wat een dier doet, zonder iets te onthouden en zonder Math.random.
  function lot(a, b, c) {
    let h = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(c | 0, 2147483647)) >>> 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  T.lotVanDier = lot;

  // Welke kleur krijgt een dier met dit zaad? Het zaad kiest een van de vellen, zoals bij een gewone
  // dorpeling (S.dorpelingVariant in js/sprites.js): hetzelfde zaad geeft altijd dezelfde koe.
  T.dierKleur = function (soort, zaad) {
    const n = (T.VEE[soort] && T.VEE[soort].kleuren) || 1;
    const z = Math.floor(zaad) || 0;
    return ((z % n) + n) % n;
  };

  const RICHTINGEN = ['Z', 'ZW', 'W', 'NW', 'N', 'NO', 'O', 'ZO'];
  const PERIODE = 6; // blokken in een periode waarin het dier al of niet een tijd gaat liggen

  // Wat doet een dier dat stilstaat, op tijd t (seconden: S.tijd)? Meestal grazen, soms staan te
  // herkauwen, en af en toe een tijd liggen: 'grazen', 'staan' of 'liggen'.
  //
  // De tijd is verdeeld in blokken; elk dier heeft een eigen bloklengte (80 tot 120 procent van
  // `rust.blok`) en een eigen begin, allebei uit zijn zaad, zodat de kudde niet op hetzelfde moment
  // omslaat. Elk blok loot met het zaad of het dier graast of staat. Liggen duurt langer: per
  // periode van zes blokken loot het dier of het gaat liggen, en zo ja voor twee tot vier blokken
  // achter elkaar. Gemiddeld ligt het zo `rust.liggen` van de tijd, en graast het `rust.grazen`.
  // Omdat alles uit de tijd en het zaad komt, flikkert het niet, en gaat niet de hele kudde
  // tegelijk liggen: elk dier loot voor zich.
  T.rustVanDier = function (e, t) {
    const r = T.VEE[e.soort].rust;
    const zaad = Math.floor(e.zaad) || 0;
    const blok = r.blok * (0.8 + 0.4 * lot(zaad, 1, 11));
    const k = Math.floor(Math.max(0, t) / blok + lot(zaad, 2, 11) * PERIODE);
    const periode = Math.floor(k / PERIODE);
    const inPeriode = k - periode * PERIODE;
    // gemiddeld drie blokken van de zes: zo vaak een periode waarin het ligt, dat het samen `liggen` is
    if (lot(zaad, periode, 13) < (r.liggen * PERIODE) / 3) {
      const lang = 2 + Math.floor(lot(zaad, periode, 14) * 3);
      const begin = Math.floor(lot(zaad, periode, 15) * (PERIODE - lang + 1));
      if (inPeriode >= begin && inPeriode < begin + lang) return 'liggen';
    }
    return lot(zaad, k, 12) < r.grazen / (1 - r.liggen) ? 'grazen' : 'staan';
  };

  // Een dier neerzetten: een wezen dat neutraal is, niet vecht en rond zijn plek dwaalt. Dezelfde
  // vorm als een gewone dorpeling (T.maakDorpeling, js/mensen.js), zodat alles wat met wezens
  // omgaat er vanzelf mee overweg kan; wat een dier anders maakt, staat erbij:
  //   dier          zijn soort, en het teken dat het een dier is (js/verkennen.js en js/sprites.js
  //                 vragen erom: het praat niet, en het graast in plaats van te staan)
  //   kleur, vel    welke kleur het zaad koos, en dus welk vel (koe0..2, schaap0..2)
  //   pauze         hoe lang het stilstaat tussen twee stappen (T.laatDwalen)
  //   beginRichting de kant waarop het kijkt voordat het een stap zet, zodat een kudde niet
  //                 allemaal dezelfde kant op begint te kijken
  // Alles wat per dier verschilt, komt uit het zaad, niet uit Math.random: hetzelfde zaad geeft
  // hetzelfde dier, dat op dezelfde momenten gaat liggen.
  T.maakDier = function (soort, x, y, zaad) {
    const v = T.VEE[soort];
    if (!v) throw new Error(`onbekend dier "${soort}"`);
    const z = Math.floor(zaad) || 0;
    const e = T.maakDorpeling(z, x, y, v.straal, null);
    const kleur = T.dierKleur(soort, z);
    e.soort = soort;
    e.naam = v.naam;
    e.dier = soort;
    e.kleur = kleur;
    e.vel = soort + kleur;
    e.snelheid = v.snelheid;
    e.pauze = v.pauze.slice();
    e.dwaalTijd = v.pauze[0] + lot(z, 3, 11) * (v.pauze[1] - v.pauze[0]);
    e.fase = lot(z, 4, 11) * 2 * Math.PI;
    e.beginRichting = RICHTINGEN[Math.floor(lot(z, 5, 11) * RICHTINGEN.length)];
    return e;
  };
})(globalThis.Toren = globalThis.Toren || {});
