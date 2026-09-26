// Het vee: koeien en schapen, op één plek.
//
// Marcel wil weides met koeien en schapen (25 sep 2026; ontwerp/spel.md, "Weides met koeien en
// schapen"). Hij koos: eerst de dieren tekenen, dan de regels. Bovenaan dus wat een dier is, en hoe
// je er een neerzet dat rond zijn plek graast, staat, loopt en ligt. De kunst komt uit
// gereedschap/pixelart/vee.cjs (koe0..2, schaap0..2 in beelden/), en js/sprites.js kiest per beeld
// de houding (T.rustVanDier hieronder).
//
// Daaronder de regels van stap 1 (spel.md, "Uitwerking in drie stappen"), zonder scherm en dus te
// toetsen (test/vee.test.cjs): het vee hoort bij een weide (een veld met bestemming 'weide',
// js/akkers.js), heeft daar plaats nodig, geeft van grasmaand tot wijnmaand melk, en werpt in
// grasmaand jongen zolang er plaats is. Wat het dorp van de melk niet op dezelfde dag eet, wordt
// kaas (js/behoeften.js, T.eetVandaag). Nog niet: hooi en slachten (stap 2), en de inner die de
// kudde telt en de marskramer die vee koopt en verkoopt (stap 3).
(function (T) {
  'use strict';

  // Alle getallen van de regels in één blok (ook in de werkbank van de spelregels, js/opties.js).
  // Een eerste gok, uit het voorstel dat Marcel op 25 sep koos; nog niet door hem bijgesteld.
  T.VEE_INSTELLINGEN = {
    // Zoveel tegels weide heeft één dier nodig. Staan er meer op een weide dan er passen, dan geven
    // de koeien daar naar verhouding minder melk, en werpt er niemand jongen. Een schaap heeft op
    // de meent (de heide) evenveel nodig als op een weide.
    plaats: { koe: 4, schaap: 2 },
    // Velden die weide zijn en hooguit zoveel tegels uit elkaar liggen, zijn samen één weide met één
    // kudde (Marcel, 25 sep). Eén, omdat er onder de es een strook van één tegel tussen de blokken
    // van Klaas en Gerrit ligt; nul is: alleen velden die elkaar raken.
    weideTussen: 1,
    // Zoveel schapen slapen er in één schaapskooi. Op de meent grazen er niet meer dan de kooien
    // samen kunnen bergen: wie geen plaats in de kooi heeft, werpt geen lam.
    kooiPlaats: 20,
    // Een koe geeft elke dag melk voor zoveel mensen (zoals in Lords of the Realm 2, waar een portie
    // kaas er vijf voedt), van grasmaand tot en met wijnmaand. In graan gerekend is dat zoveel keer
    // T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag. Melk houdt niet: wat het dorp er die dag niet van
    // eet, wordt kaas.
    melkVoorMensen: 5,
    melk: { van: 'grasmaand', tot: 'wijnmaand' },
    // Van melk naar kaas: zoveel van wat de melk voedt, blijft over in de kaas (de wei gaat eraf).
    // Kaas telt in dezelfde maat als graan: één kaas voedt zoveel als één graan.
    melkNaarKaas: 0.5,
    // Of de kudde vanzelf groeit: een optie in de spelregels ("Het vee"). Op de dag hieronder werpt
    // elk dier van minstens een jaar oud met zijn kans een jong, zolang er op zijn weide plaats is.
    groeit: true,
    werpen: { maand: 'grasmaand', dag: 1 },
    kansOpJong: { koe: 0.5, schaap: 0.3 },
    // Waar het gehucht mee begint, op de weide(s) die de kaart noemt (T.zetBeginKudde).
    beginKudde: { koe: 3, schaap: 8 },

    // ── De winter (stap 2; spel.md, "Het hooi beslist hoeveel land een koe kost") ──
    // Of het vee 's winters hooi nodig heeft: een optie in de spelregels ("Winterzorg"). Uit: er is
    // geen hooi om te maaien of te voeren, er komt geen honger, en een koe kost weer alleen haar
    // plaats op de weide, zoals in stap 1.
    winterzorg: true,
    // In deze maand maaien de boeren het hooi van de weides (js/akkers.js, T.werkOogstBij).
    hooien: 'hooimaand',
    // Wat één gemaaide tegel weide aan hooi geeft. Eén hooi is wat een koe op één winterdag eet. Een
    // winter (hieronder) duurt 150 dagen, en een koe heeft daarvoor het hooi van zo'n 12 tegels nodig:
    // 150 / 12 = 12,5. De weide van Klaas (30 tegels) brengt zo twee à drie koeien de winter door.
    hooiPerTegel: 12.5,
    // De maanden waarin het vee niet graast maar hooi eet: van slachtmaand tot en met lentemaand. In
    // grasmaand staat het gras er weer.
    winter: { van: 'slachtmaand', tot: 'lentemaand' },
    // Wat een dier op een winterdag eet. Een schaap eet 's winters heide (Marcel, 25 sep), dus niets;
    // de optie "Schapen eten ook hooi" zet het op 0,2. Een jong (nog geen jaar oud) eet de helft.
    hooiPerDag: { koe: 1, schaap: 0 },
    jongEet: 0.5,
    // Zoveel dagen zonder genoeg hooi houdt een dier het vol; dan sterft het. Wie weer genoeg eet,
    // knapt per dag een dag op.
    hongerDagen: 10,
    // Hoeveel dagen vooraf het dorp zegt dat het hooi opraakt.
    hooiWaarschuwing: 15,
    // Op deze dag opent het slachtvenster vanzelf (js/hud.js): de winter begint, en het hooi zegt
    // hoeveel vee je houdt.
    slachten: { maand: 'slachtmaand', dag: 1 },
    // Wat een geslacht dier geeft. Een jong geeft de helft van het vlees, en ook een huid. Vlees vult
    // een maag (sinds 25 sep, een optie), en het bederft tenzij het gezouten is (js/behoeften.js).
    slacht: { koe: { vlees: 20, huiden: 1 }, schaap: { vlees: 6, huiden: 1 } },

    // ── De schapen en de kooi (stap 2; Marcel, 25 sep, naar de Drentse esdorpen) ──
    // Op deze dag worden de schapen geschoren: elk volwassen schaap geeft zoveel wol. Een lam van
    // dit voorjaar nog niet. De heer vraagt 20 wol per schaapskooi (js/gebouwen.js).
    scheren: { maand: 'zomermaand', dag: 1 },
    wolPerSchaap: 4,
    // Zoveel karren mest geeft één schaap per jaar in de kooi, als de kooi zijn herder heeft (zijn
    // hand, js/gebouwen.js). De mest leg je in het veldenvenster op een akker (js/akkers.js).
    mestPerSchaap: 2.5,
  };
  const IN = () => T.VEE_INSTELLINGEN;

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
  //     graast:   'weide',      // waar het graast: 'weide' (een veld) of 'meent' (de heide); zie
  //                             // "Waar een dier graast" hieronder
  //     jong:     'kalf',       // hoe een jong heet, en in het meervoud
  //     jongen:   'kalveren',
  //   }
  T.VEE = {
    // roodbruin, zwart en zwartbont; een koe kuiert
    koe: {
      naam: 'koe', meervoud: 'koeien', snelheid: 0.9, straal: 4, kleuren: 3, pauze: [6, 16],
      rust: { grazen: 0.6, liggen: 0.15, blok: 12 }, graast: 'weide', jong: 'kalf', jongen: 'kalveren',
    },
    // vuilwit, bruin, en een met een zwarte kop; een schaap trippelt iets vlotter, en graast meer
    schaap: {
      naam: 'schaap', meervoud: 'schapen', snelheid: 1.1, straal: 3, kleuren: 3, pauze: [4, 12],
      rust: { grazen: 0.7, liggen: 0.1, blok: 9 }, graast: 'meent', jong: 'lam', jongen: 'lammeren',
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

  // ---------------------------------------------------------------------------------------------
  // De regels: het vee op de weide (stap 1) en op de meent (stap 2)
  // ---------------------------------------------------------------------------------------------

  const maandIdx = (naam) => T.MAANDEN.findIndex((m) => m.naam === naam);
  const isWeide = (veld) => !!veld && !veld.meent && (T.bestemmingVan ? T.bestemmingVan(veld) : veld.bestemming || 'akker') === 'weide';
  const tegelsVan = (veld) => veld.b * veld.h;
  const opVeld = (v, x, y) => x >= v.x && x < v.x + v.b && y >= v.y && y < v.y + v.h;
  // Hoeveel plaats een dier (of een soort) nodig heeft.
  const plaatsVan = (e) => IN().plaats[typeof e === 'string' ? e : e.dier] || 0;
  // Een kalf is nog geen koe: wie dit spel geboren is, melkt en werpt pas als het een jaar oud is.
  const volwassen = (e, dag) => e.geboren == null || dag - e.geboren >= T.DAGEN_PER_JAAR;
  const etenPerMens = () => (T.GEBOUWEN_INSTELLINGEN ? T.GEBOUWEN_INSTELLINGEN.etenPerMensPerDag : 0);
  const spelZaad = (S) => (S.lot && S.lot.zaad) || 1;

  function bericht(tekst, soort) {
    if (T.ui && T.ui.bericht) T.ui.bericht(tekst, soort);
  }

  // "3 koeien en 8 schapen", "1 koe", "geen vee".
  function telKudde(dieren) {
    const delen = [];
    for (const [soort, v] of Object.entries(T.VEE)) {
      const n = dieren.filter((e) => (typeof e === 'string' ? e : e.dier) === soort).length;
      if (n) delen.push(`${n} ${n === 1 ? v.naam : v.meervoud}`);
    }
    if (!delen.length) return 'geen vee';
    return delen.length === 1 ? delen[0] : `${delen.slice(0, -1).join(', ')} en ${delen[delen.length - 1]}`;
  }
  const tegelsTekst = (n) => `${n} ${n === 1 ? 'tegel' : 'tegels'}`;

  // Wat het spel van het vee onthoudt, naast de dieren zelf (die staan als wezens in de wereld, met
  // e.weide): de melk van vandaag, en hoeveel dieren het spel al een zaad gaf.
  T.nieuwVee = () => ({ melk: 0, zaden: 0 });

  // ── Waar een dier graast: een weide, of de meent ──
  //
  // Een koe graast op een weide: een veld met bestemming 'weide' (js/akkers.js). Velden die weide
  // zijn en naast elkaar liggen, zijn samen één weide met één kudde (Marcel, 25 sep: "meer velden
  // als één weide"): het vee loopt erover alsof het hek ertussen weg is, en de plaats is die van
  // alle velden samen. Naast elkaar is: ze raken elkaar, of er ligt hooguit IN().weideTussen tegels
  // tussen (een pad, een greppel). Die strook hoort er dan bij om over te lopen, maar telt niet als
  // gras. Elk stuk blijft van zijn eigen boer, die er zijn eigen hooi maait (js/akkers.js).
  //
  // Een schaap graast op de meent: de heide buiten de velden, van het dorp samen (js/kaart.js,
  // w.meenten), en het slaapt in de schaapskooi (Marcel, 25 sep, naar de Drentse esdorpen: de
  // koeien op de weide, de schapen op de heide). Heeft een kaart geen meent, dan graast het op de
  // weide, zoals in stap 1.
  //
  // Een dier onthoudt één plek, e.weide: een veld, of de meent. Dat is genoeg: de weide waar het
  // bij hoort, is de groep van dat veld. Zo hoeft er niets om te zetten als twee velden samen weide
  // worden, of weer uit elkaar gaan.

  // Alle levende dieren in de wereld.
  T.veeVan = (S) => ((S && S.wereld && S.wereld.wezens) || []).filter((e) => e.dier && !e.dood);
  // Het vee dat op een weide graast, niet op de meent: daar gaan de plaats op de velden en de wissel
  // over (T.plaatsVoorVee, T.verhuisVee, en T.wisselVelden in js/akkers.js).
  T.weideVee = (S) => T.veeVan(S).filter((e) => e.weide && !e.weide.meent);
  // De meent van deze wereld (de heide), of null. Eén is genoeg; een kaart met meer komt later.
  T.meentVan = (w) => ((w && w.meenten) || [])[0] || null;
  // De meent op tegel (x, y), voor de muis (js/verkennen.js), of null.
  T.meentOp = (w, x, y) => ((w && w.meenten) || []).find((m) => opVeld(m, x, y)) || null;
  // Waar deze soort graast: op de meent als hij daar hoort én de kaart er een heeft, anders op een
  // weide.
  T.graastOp = (w, soort) => (T.VEE[soort] && T.VEE[soort].graast === 'meent' && T.meentVan(w) ? 'meent' : 'weide');

  // De strook tussen twee velden, als ze naast elkaar liggen: [] als ze elkaar raken, de tegels
  // ertussen als er hooguit IN().weideTussen tussen liggen, en anders null. Alleen recht naast
  // elkaar, met een stuk rand dat ze delen; schuin met alleen een hoek telt niet.
  function strookTussen(a, b) {
    const max = Math.max(0, Math.floor(IN().weideTussen || 0));
    const y0 = Math.max(a.y, b.y);
    const y1 = Math.min(a.y + a.h, b.y + b.h) - 1;
    if (y0 <= y1) {
      const [links, rechts] = a.x < b.x ? [a, b] : [b, a];
      const gat = rechts.x - (links.x + links.b);
      if (gat >= 0 && gat <= max) {
        const strook = [];
        for (let x = links.x + links.b; x < rechts.x; x++) for (let y = y0; y <= y1; y++) strook.push({ x, y });
        return strook;
      }
    }
    const x0 = Math.max(a.x, b.x);
    const x1 = Math.min(a.x + a.b, b.x + b.b) - 1;
    if (x0 <= x1) {
      const [boven, onder] = a.y < b.y ? [a, b] : [b, a];
      const gat = onder.y - (boven.y + boven.h);
      if (gat >= 0 && gat <= max) {
        const strook = [];
        for (let y = boven.y + boven.h; y < onder.y; y++) for (let x = x0; x <= x1; x++) strook.push({ x, y });
        return strook;
      }
    }
    return null;
  }

  // Alle weides van een wereld, als groepen velden die samen één weide zijn:
  // [{ velden, tussen, tegels }]. `velden` staan in de volgorde van w.akkers, `tussen` is een Set
  // ("x,y") van de strookjes ertussen, en `tegels` is het gras: de velden samen, zonder strook.
  // Welke velden weide zijn, zegt `isWeideVeld`: standaard wat ze nu zijn, en T.plaatsVoorVee vraagt
  // het voor het plan van volgend jaar.
  T.weideGroepen = function (w, isWeideVeld) {
    const akkers = (w && w.akkers) || [];
    const weides = akkers.filter(isWeideVeld || isWeide);
    const groepen = [];
    const gedaan = new Set();
    for (const begin of weides) {
      if (gedaan.has(begin)) continue;
      const velden = [];
      const rij = [begin];
      gedaan.add(begin);
      while (rij.length) {
        const a = rij.pop();
        velden.push(a);
        for (const b of weides) {
          if (gedaan.has(b) || !strookTussen(a, b)) continue;
          gedaan.add(b);
          rij.push(b);
        }
      }
      velden.sort((a, b) => akkers.indexOf(a) - akkers.indexOf(b));
      const tussen = new Set();
      for (let i = 0; i < velden.length; i++) {
        for (let j = i + 1; j < velden.length; j++) {
          for (const t of strookTussen(velden[i], velden[j]) || []) {
            if (!akkers.some((v) => opVeld(v, t.x, t.y))) tussen.add(t.x + ',' + t.y);
          }
        }
      }
      groepen.push({ velden, tussen, tegels: velden.reduce((n, v) => n + tegelsVan(v), 0) });
    }
    return groepen;
  };

  // De weide waar dit veld bij hoort (een groep uit T.weideGroepen), of null als het geen weide is.
  T.weideVan = function (w, veld, isWeideVeld) {
    if (!veld || veld.meent) return null;
    return T.weideGroepen(w, isWeideVeld).find((g) => g.velden.includes(veld)) || null;
  };

  // Welke velden er samen met dit veld één weide zijn: de hele groep, of alleen dit veld (de meent,
  // of een veld dat geen weide is).
  const veldenVan = (w, veld) => {
    const groep = T.weideVan(w, veld);
    return groep ? groep.velden : [veld];
  };

  // Waar dit dier graast, en dus mag lopen: { velden, tussen, tegels, op(x, y) }. Op een weide is
  // dat de hele groep, met de strookjes ertussen; op de meent die rechthoek; en op een veld dat geen
  // weide (meer) is alleen dat veld, want daar loopt het na een wissel vandaan (T.verhuisVee).
  // Zonder plek null. js/verkennen.js laat het vee hierbinnen dwalen.
  T.graaslandVan = function (w, e) {
    const plek = e && e.weide;
    if (!plek) return null;
    const groep = T.weideVan(w, plek);
    const velden = groep ? groep.velden : [plek];
    const tussen = groep ? groep.tussen : new Set();
    return {
      velden, tussen,
      tegels: velden.reduce((n, v) => n + tegelsVan(v), 0),
      op: (x, y) => tussen.has(x + ',' + y) || velden.some((v) => opVeld(v, x, y)),
    };
  };

  // Het vee van één weide: van de hele groep waar dit veld bij hoort (of van de meent).
  T.dierenOp = function (S, veld) {
    const velden = veldenVan(S && S.wereld, veld);
    return T.veeVan(S).filter((e) => velden.includes(e.weide));
  };

  // Hoe het ervoor staat op een weide (de hele groep) of op de meent, voor het venster en voor de
  // regels hieronder: { tegels, nodig, vrij, vol, koeien, schapen }. `nodig` is wat zijn dieren aan
  // plaats nodig hebben, `vrij` wat er over is (onder nul: te vol), en `vol` de factor voor de melk:
  // 1 zolang ze passen, en naar verhouding minder als het te vol is (30 tegels voor 40 nodig geeft
  // 0,75).
  T.weideStand = function (S, veld) {
    const dieren = T.dierenOp(S, veld);
    const tegels = veldenVan(S && S.wereld, veld).reduce((n, v) => n + tegelsVan(v), 0);
    const nodig = dieren.reduce((n, e) => n + plaatsVan(e), 0);
    return {
      tegels, nodig, vrij: tegels - nodig,
      vol: nodig > tegels ? tegels / nodig : 1,
      koeien: dieren.filter((e) => e.dier === 'koe').length,
      schapen: dieren.filter((e) => e.dier === 'schaap').length,
    };
  };

  // Een dier bij een weide zetten. Het dwaalt dan binnen de rechthoek van e.weide, en loopt na een
  // wissel vanzelf naar zijn nieuwe weide (js/verkennen.js, T.dwaalTegelsOpWeide en T.wegNaarWeide).
  // Een plek en een straal rond het midden krijgt het er ook bij, zoals elk dwalend wezen: voor wie
  // daarnaar kijkt (gereedschap/wereld.html tekent de dwaalstraal), niet meer voor het dwalen zelf.
  T.zetOpWeide = function (e, veld) {
    e.weide = veld;
    e.thuis = { x: veld.x + (veld.b - 1) / 2, y: veld.y + (veld.h - 1) / 2 };
    e.straal = Math.max(1, Math.floor(Math.min(veld.b, veld.h) / 2));
    return e;
  };

  // Een tegel op de weide waar nog niemand staat, zo dicht mogelijk bij `bij` (of het midden).
  function vrijeTegel(S, veld, bij) {
    const bezet = new Set(((S.wereld && S.wereld.wezens) || []).filter((e) => !e.dood).map((e) => e.tx + ',' + e.ty));
    const doel = bij || { x: veld.x + (veld.b - 1) / 2, y: veld.y + (veld.h - 1) / 2 };
    let beste = null;
    let afstand = Infinity;
    for (let y = veld.y; y < veld.y + veld.h; y++) {
      for (let x = veld.x; x < veld.x + veld.b; x++) {
        if (bezet.has(x + ',' + y)) continue;
        const d = Math.abs(x - doel.x) + Math.abs(y - doel.y);
        if (d < afstand) {
          afstand = d;
          beste = { x, y };
        }
      }
    }
    return beste || { x: Math.round(doel.x), y: Math.round(doel.y) };
  }

  // Elk dier een eigen zaad (zijn kleur, zijn ritme), uit het zaad van het spel en een teller: zo
  // krijgt hetzelfde spel dezelfde kudde, en een ander spel een andere.
  function nieuwZaad(S) {
    const V = S.vee || (S.vee = T.nieuwVee());
    V.zaden = (V.zaden || 0) + 1;
    return 1 + Math.floor(lot(spelZaad(S), V.zaden, 17) * 2147483646);
  }

  // Zet elk dier (of elke soort) op een weide: de grootste eerst, elk op de weide met de meeste
  // vrije plaats waar het past. `vrij` is een Map weide (een groep uit T.weideGroepen) → vrije
  // tegels, en loopt mee. Met `teVol` komt wie nergens past toch op de weide met de meeste plaats
  // (die wordt dan te vol); zonder blijft hij over. Geeft een Map dier → weide.
  function verdeel(dieren, vrij, teVol) {
    const plek = new Map();
    for (const e of dieren.slice().sort((a, b) => plaatsVan(b) - plaatsVan(a))) {
      let beste = null;
      for (const [v, n] of vrij) {
        if ((teVol || n >= plaatsVan(e)) && (beste === null || n > vrij.get(beste))) beste = v;
      }
      if (beste === null) continue;
      plek.set(e, beste);
      vrij.set(beste, vrij.get(beste) - plaatsVan(e));
    }
    return plek;
  }

  // Het veld van deze weide waar dit dier het dichtst bij staat: daar hoort het bij, en daarheen
  // loopt het na een wissel.
  function dichtstbij(velden, e) {
    let beste = velden[0];
    let afstand = Infinity;
    for (const v of velden) {
      const dx = Math.max(v.x - e.tx, 0, e.tx - (v.x + v.b - 1));
      const dy = Math.max(v.y - e.ty, 0, e.ty - (v.y + v.h - 1));
      if (dx + dy < afstand) {
        afstand = dx + dy;
        beste = v;
      }
    }
    return beste;
  }

  // Past het vee, als elk veld wordt wat plan(veld) zegt? Wie nu op een veld staat dat dan geen weide
  // is, moet naar een weide met plaats; wie blijft, houdt zijn plaats. Een weide is een groep velden
  // (T.weideGroepen): worden twee velden naast elkaar allebei weide, dan telt hun plaats samen.
  // T.kanBestemming (js/akkers.js) vraagt het vooraf, met het plan voor volgend jaar; T.verhuisVee
  // doet op 1 lentemaand dezelfde verdeling echt. Een dier zonder weide (Spel.debug.vee zet ze los
  // bij de schout) en een schaap op de meent tellen niet mee.
  // { past, reden, moeten: [dier], plek: Map(dier → weide), vrij: Map(weide → vrij) }.
  T.plaatsVoorVee = function (S, plan) {
    const weides = T.weideGroepen(S.wereld, (v) => plan(v) === 'weide');
    const weideVan = (v) => weides.find((g) => g.velden.includes(v)) || null;
    const dieren = T.weideVee(S);
    const vrij = new Map(weides.map((g) => [g, g.tegels]));
    for (const e of dieren) {
      const g = weideVan(e.weide);
      if (g) vrij.set(g, vrij.get(g) - plaatsVan(e));
    }
    const moeten = dieren.filter((e) => !weideVan(e.weide));
    const vrijVooraf = [...vrij.values()].reduce((n, x) => n + Math.max(0, x), 0);
    const plek = verdeel(moeten, vrij, false);
    if (plek.size === moeten.length) return { past: true, reden: null, moeten, plek, vrij };
    const nodig = moeten.reduce((n, e) => n + plaatsVan(e), 0);
    const een = moeten.length === 1;
    const reden = weides.length
      ? `Dan is er te weinig weide: ${telKudde(moeten)} ${een ? 'moet' : 'moeten'} ergens anders grazen ` +
        `en ${een ? 'heeft' : 'hebben'} ${tegelsTekst(nodig)} nodig, ` +
        `en op de andere weides ${vrijVooraf === 1 ? 'is' : 'zijn'} nog ${tegelsTekst(vrijVooraf)} vrij.`
      : `Dan is er volgend jaar geen weide meer voor ${telKudde(moeten)}. Maak eerst een ander veld weide.`;
    return { past: false, reden, moeten, plek, vrij };
  };

  // Op 1 lentemaand, na de wissel van de velden (js/akkers.js, T.wisselVelden): wie op een veld staat
  // dat geen weide meer is, gaat naar een weide met plaats. Past niet iedereen (de kudde groeide na
  // het plan), dan gaat de rest naar de weide met de meeste plaats, ook al wordt die te vol: dan
  // geeft het vee daar minder melk en werpt het geen jongen, tot je meer weide maakt. Zonder enige
  // weide blijft het staan waar het stond. Geeft de dieren die verhuisden.
  T.verhuisVee = function (S) {
    const r = T.plaatsVoorVee(S, (v) => (T.bestemmingVan ? T.bestemmingVan(v) : v.bestemming));
    if (!r.moeten.length) return [];
    const teVol = verdeel(r.moeten.filter((e) => !r.plek.has(e)), r.vrij, true);
    const verhuisd = [];
    for (const [e, weide] of [...r.plek, ...teVol]) {
      T.zetOpWeide(e, dichtstbij(weide.velden, e));
      verhuisd.push(e);
    }
    if (teVol.size) {
      const wie = telKudde([...teVol.keys()]);
      bericht(`Er is te weinig weide: ${wie} ${teVol.size === 1 ? 'staat' : 'staan'} te krap, en de koeien daar geven minder melk.`, 'gevaar');
    } else if (verhuisd.length) {
      bericht(`Het vee gaat naar zijn nieuwe weide: ${telKudde(verhuisd)}.`);
    }
    return verhuisd;
  };

  // Zet deze soorten neer op deze velden (een weide, of de meent), verspreid en niet op een kluitje.
  // Een Fibonacci-rooster over de rechthoek om de velden heen: elke rij één dier, en de kolom telkens
  // een gulden snede verder. Tot 25 sep stonden ze rij na rij op volgorde, en pasten er precies
  // zoveel dieren als de breedte telde, dan stonden ze allemaal in één kolom. Elk dier hoort bij het
  // veld waar het terechtkomt. Geeft de dieren.
  function spreid(S, velden, soorten) {
    const x0 = Math.min(...velden.map((v) => v.x));
    const y0 = Math.min(...velden.map((v) => v.y));
    const b = Math.max(...velden.map((v) => v.x + v.b)) - x0;
    const h = Math.max(...velden.map((v) => v.y + v.h)) - y0;
    return soorten.map((soort, k) => {
      const bij = {
        x: x0 + Math.floor(((k * 0.6180339887 + 0.5) % 1) * b),
        y: y0 + Math.floor(((k + 0.5) / soorten.length) * h),
      };
      const veld = velden.find((v) => opVeld(v, bij.x, bij.y)) || dichtstbij(velden, { tx: bij.x, ty: bij.y });
      const t = vrijeTegel(S, veld, bij);
      const e = T.zetOpWeide(T.maakDier(soort, t.x, t.y, nieuwZaad(S)), veld);
      S.wereld.wezens.push(e);
      return e;
    });
  }

  // Het begin: de beginkudde op de weide(s) die de kaart noemt (js/kaart.js; in het gehucht het blok
  // van Klaas, akker6), en de schapen op de meent als er een is. T.beginOpKaart (js/gebied.js) roept
  // dit aan, net als T.zetBestaandeGebouwen, ná het lot van de boeren, want het zaad van het spel
  // kiest ook de kleuren van het vee. Zonder weide geen koeien, en zonder weide of meent geen
  // schapen. Geeft de dieren.
  T.zetBeginKudde = function (S) {
    const w = S.wereld;
    const weides = T.weideGroepen(w);
    const meent = T.meentVan(w);
    const naarWeide = [];
    const naarMeent = [];
    for (const soort of Object.keys(T.VEE)) {
      for (let i = 0; i < (IN().beginKudde[soort] || 0); i++) (T.graastOp(w, soort) === 'meent' ? naarMeent : naarWeide).push(soort);
    }
    const dieren = [];
    if (weides.length) {
      const vrij = new Map(weides.map((g) => [g, T.weideStand(S, g.velden[0]).vrij]));
      const plek = verdeel(naarWeide.map((soort) => ({ dier: soort })), vrij, true);
      for (const g of weides) dieren.push(...spreid(S, g.velden, [...plek].filter(([, x]) => x === g).map(([d]) => d.dier)));
    }
    if (meent) dieren.push(...spreid(S, [meent], naarMeent));
    return dieren;
  };

  // ── De melk ──

  // Is het vandaag melktijd (van grasmaand tot en met wijnmaand)?
  function melkTijd(dag) {
    const m = T.datumVanDag(dag).maand;
    const van = maandIdx(IN().melk.van);
    const tot = maandIdx(IN().melk.tot);
    return van <= tot ? m >= van && m <= tot : m >= van || m <= tot;
  }

  // De melk van één dag, in graan gerekend (wat het dorp ervan kan eten): elke volwassen koe op een
  // weide geeft melk voor IN().melkVoorMensen mensen, maal hoe vol haar weide is. Buiten de melktijd
  // niets.
  T.melkVanDag = function (S, dag) {
    if (!melkTijd(dag)) return 0;
    const perKoe = IN().melkVoorMensen * etenPerMens();
    const vol = new Map();
    let melk = 0;
    for (const e of T.veeVan(S)) {
      if (e.dier !== 'koe' || !isWeide(e.weide) || !volwassen(e, dag)) continue;
      if (!vol.has(e.weide)) vol.set(e.weide, T.weideStand(S, e.weide).vol);
      melk += perKoe * vol.get(e.weide);
    }
    return melk;
  };

  // Hoeveel melk het dorp van dag `van` tot (niet met) dag `tot` zal drinken, met de kudde en de
  // monden van nu: elke dag hooguit wat het nodig heeft, want de rest wordt kaas. Voor het venster
  // van de heer (js/heer.js, T.heerVooruitzicht): wat je overhoudt tot de oogst.
  T.verwachteMelk = function (S, van, tot) {
    const nodig = (S.bevolking || 0) * etenPerMens();
    let som = 0;
    for (let d = Math.floor(van); d < tot; d++) som += Math.min(nodig, T.melkVanDag(S, d));
    return som;
  };

  // ── De jongen ──

  // Op 1 grasmaand werpt elk volwassen dier met zijn kans (IN().kansOpJong) een jong, zolang er op
  // zijn weide plaats is (Marcel, 25 sep: "de kudde groeit in de lente als er plaats is"). Het jong
  // blijft bij zijn moeder. Het lot komt uit het zaad van het spel (S.lot.zaad, js/boeren.js), het
  // jaar en het dier zelf, niet uit Math.random: hetzelfde spel werpt elk jaar dezelfde jongen, en
  // een toets komt vast uit. Wie het laagst loot, werpt het eerst, zodat bij krappe plaats niet
  // altijd dezelfde soort voorgaat. Geeft de nieuwe dieren.
  T.werpJongen = function (S, dag) {
    const w = S.wereld;
    const jaar = T.datumVanDag(dag).jaar;
    const nieuw = [];
    let geenPlaats = 0;
    // Elke weide (een groep velden) met zijn vrije plaats, en de meent: daar telt ook de kooi, want
    // wie er geen plaats in heeft, werpt geen lam.
    const plekken = T.weideGroepen(w).map((g) => ({ velden: g.velden, vrij: T.weideStand(S, g.velden[0]).vrij }));
    const meent = T.meentVan(w);
    if (meent) {
      const schapen = T.dierenOp(S, meent).length;
      const inKooi = (T.kooiPlaats(S) - schapen) * plaatsVan('schaap');
      plekken.push({ velden: [meent], vrij: Math.min(T.weideStand(S, meent).vrij, inKooi) });
    }
    for (const plek of plekken) {
      const moeders = T.veeVan(S)
        .filter((e) => plek.velden.includes(e.weide) && volwassen(e, dag))
        .map((e) => ({ e, lot: lot(spelZaad(S), jaar, Math.floor(e.zaad) || 0) }))
        .filter((m) => m.lot < (IN().kansOpJong[m.e.dier] || 0))
        .sort((a, b) => a.lot - b.lot);
      let vrij = plek.vrij;
      for (const { e } of moeders) {
        if (vrij < plaatsVan(e)) {
          geenPlaats++;
          continue;
        }
        const t = vrijeTegel(S, e.weide, { x: e.tx, y: e.ty });
        const jong = T.zetOpWeide(T.maakDier(e.dier, t.x, t.y, nieuwZaad(S)), e.weide);
        jong.geboren = dag;
        w.wezens.push(jong);
        vrij -= plaatsVan(e);
        nieuw.push(jong);
      }
    }
    const wat = [];
    for (const [soort, v] of Object.entries(T.VEE)) {
      const n = nieuw.filter((e) => e.dier === soort).length;
      if (n) wat.push(`${n} ${n === 1 ? v.jong : v.jongen}`);
    }
    const meer = geenPlaats ? ' Meer paste er niet.' : '';
    if (wat.length) bericht(`Het is grasmaand: er ${nieuw.length === 1 ? 'is' : 'zijn'} ${wat.join(' en ')} geboren.${meer}`, 'goed');
    else if (geenPlaats) bericht('Het is grasmaand, maar er is geen plaats voor jongen: niet op de weide, of niet in de kooi.');
    return nieuw;
  };

  // Hoeveel schapen de schaapskooien samen bergen: IN().kooiPlaats per kooi die klaar is
  // (js/gebouwen.js, S.gebouwen).
  const kooienVan = (S) => ((S && S.gebouwen) || []).filter((g) => g.soort === 'schaapskooi' && g.klaar);
  T.kooiPlaats = (S) => kooienVan(S).length * IN().kooiPlaats;

  // ── De schapen en de kooi (stap 2) ──
  //
  // Zoals in de Drentse esdorpen (Marcel, 25 sep): overdag grazen de schapen op de heide, 's nachts
  // staan ze in de schaapskooi, en de mest uit de kooi maakt de es vruchtbaar. In zomermaand worden
  // ze geschoren. De kooi maakt dus zelf geen wol meer (js/gebouwen.js): die komt van de schapen.

  // De schapen die in een kooi slapen: alle schapen op de meent, tot de kooien vol zijn.
  T.schapenInKooi = function (S) {
    const meent = T.meentVan(S && S.wereld);
    const schapen = meent ? T.dierenOp(S, meent).filter((e) => e.dier === 'schaap').length : 0;
    return Math.min(schapen, T.kooiPlaats(S));
  };

  // De mest van één dag: IN().mestPerSchaap per jaar voor elk schaap in de kooi, naar rato van hoeveel
  // kooien hun herder hebben (een kooi zonder hand: de mest blijft liggen).
  T.mestVanDag = function (S) {
    const kooien = kooienVan(S);
    if (!kooien.length) return 0;
    const soort = T.GEBOUWEN && T.GEBOUWEN.schaapskooi;
    const nodig = (soort && soort.handen) || 0;
    const herders = nodig ? kooien.reduce((n, g) => n + Math.min(1, (g.handen || 0) / nodig), 0) / kooien.length : 1;
    return (T.schapenInKooi(S) * IN().mestPerSchaap * herders) / T.DAGEN_PER_JAAR;
  };

  // Scheren: elk volwassen schaap geeft IN().wolPerSchaap wol. Geeft de wol.
  T.scheerSchapen = function (S, dag) {
    const schapen = T.veeVan(S).filter((e) => e.dier === 'schaap' && volwassen(e, dag));
    const wol = schapen.length * IN().wolPerSchaap;
    if (wol > 0 && S.voorraad && T.wijzigVoorraad) {
      T.wijzigVoorraad(S, 'wol', wol);
      bericht(`Het is ${T.MAANDEN[T.datumVanDag(dag).maand].naam}: ${schapen.length} ${schapen.length === 1 ? 'schaap is' : 'schapen zijn'} geschoren. Dat geeft ${wol} wol.`, 'goed');
    }
    return wol;
  };

  // ── De winter: hooi (stap 2) ──
  //
  // Van slachtmaand tot en met lentemaand graast het vee niet, maar eet het hooi, dat de boeren in
  // hooimaand van de weides maaiden (js/akkers.js). Zo beslist het hooi hoeveel vee je houdt, en
  // niet het gras in de zomer (Marcel, 25 sep: "het hooi beslist hoeveel land een koe kost"). Wat het
  // hooi niet de winter door helpt, slacht je op 1 slachtmaand (T.slacht hieronder), of het sterft.

  // Is het vandaag winter voor het vee?
  function winterTijd(dag) {
    const m = T.datumVanDag(dag).maand;
    const van = maandIdx(IN().winter.van);
    const tot = maandIdx(IN().winter.tot);
    return van <= tot ? m >= van && m <= tot : m >= van || m <= tot;
  }
  T.isVeeWinter = winterTijd;

  // Wat dit dier op een winterdag aan hooi eet: een jong de helft, en niets zonder winterzorg.
  T.hooiVanDier = (e, dag) => (IN().winterzorg ? (IN().hooiPerDag[e.dier] || 0) * (volwassen(e, dag) ? 1 : IN().jongEet) : 0);
  // Wat deze dieren (standaard de hele kudde) samen op één winterdag eten.
  T.hooiPerWinterdag = (S, dag, dieren) => (dieren || T.veeVan(S)).reduce((n, e) => n + T.hooiVanDier(e, dag), 0);

  // Hoe lang een hele winter duurt, in dagen (150: van slachtmaand tot en met lentemaand).
  T.winterLengte = function () {
    const van = maandIdx(IN().winter.van);
    const tot = maandIdx(IN().winter.tot);
    return (((tot - van + 12) % 12) + 1) * T.DAGEN_PER_MAAND;
  };

  // Hoeveel winterdagen er vanaf `dag` (die meegeteld) nog komen voordat het vee weer graast. Is het
  // nu geen winter, dan de hele volgende winter.
  T.winterDagen = function (dag) {
    let d = Math.floor(dag);
    for (let n = 0; n < T.DAGEN_PER_JAAR && !winterTijd(d); n++) d++;
    let dagen = 0;
    while (winterTijd(d) && dagen < T.DAGEN_PER_JAAR) {
      dagen++;
      d++;
    }
    return dagen;
  };

  // Het oudste eerst: de beginkudde (zonder geboortedag), dan wie het eerst geboren is. Bij hetzelfde
  // de volgorde van het zaad, zodat het vast is.
  const geborenOp = (e) => (e.geboren == null ? -1e9 : e.geboren);
  const oudsteEerst = (a, b) => geborenOp(a) - geborenOp(b) || (Math.floor(a.zaad) || 0) - (Math.floor(b.zaad) || 0);

  // Hoe een dier heet: een jong is een kalf of een lam.
  const naamVan = (e, dag, n) => {
    const v = T.VEE[e.dier];
    const jong = !volwassen(e, dag);
    return n === 1 ? (jong ? v.jong : v.naam) : jong ? v.jongen : v.meervoud;
  };
  // "een koe en twee kalveren": dieren geteld, met jongen apart.
  function dierenTekst(dieren, dag) {
    const delen = [];
    for (const soort of Object.keys(T.VEE)) {
      for (const jong of [false, true]) {
        const hier = dieren.filter((e) => e.dier === soort && !volwassen(e, dag) === jong);
        if (hier.length) delen.push(`${hier.length === 1 ? 'een' : hier.length} ${naamVan(hier[0], dag, hier.length)}`);
      }
    }
    return delen.length < 2 ? delen.join('') : `${delen.slice(0, -1).join(', ')} en ${delen[delen.length - 1]}`;
  }
  T.dierenTekst = dierenTekst;

  // Een dier uit de wereld halen: geslacht, of gestorven.
  function haalWeg(S, e) {
    const w = S.wereld;
    const i = w.wezens.indexOf(e);
    if (i >= 0) w.wezens.splice(i, 1);
    e.dood = true;
  }

  // ── Slachten (stap 2) ──
  //
  // Op 1 slachtmaand vraagt het dorp wie er naar de slager gaat (het venster in js/hud.js; je kunt het
  // ook zelf openen in het veldenvenster). Het vee staat er in groepen: volwassen dieren en jongen,
  // per soort, het oudste eerst. Uit elke groep gaan de oudste; zo worden de jongen van dit jaar
  // volgend jaar de melkkoeien.

  // De groepen van de kudde: [{ soort, jong, naam, meervoud, dieren }], met de dieren het oudste eerst.
  // Een lege groep staat er niet in.
  T.kuddeGroepen = function (S, dag) {
    const groepen = [];
    for (const [soort, v] of Object.entries(T.VEE)) {
      for (const jong of [false, true]) {
        const dieren = T.veeVan(S).filter((e) => e.dier === soort && !volwassen(e, dag) === jong).sort(oudsteEerst);
        if (dieren.length) groepen.push({ soort, jong, naam: jong ? v.jong : v.naam, meervoud: jong ? v.jongen : v.meervoud, dieren });
      }
    }
    return groepen;
  };

  // Wat deze dieren geslacht opleveren: { vlees, huiden }.
  T.slachtOpbrengst = function (dieren, dag) {
    let vlees = 0;
    let huiden = 0;
    for (const e of dieren) {
      const s = IN().slacht[e.dier] || { vlees: 0, huiden: 0 };
      vlees += s.vlees * (volwassen(e, dag) ? 1 : 0.5);
      huiden += s.huiden;
    }
    return { vlees, huiden };
  };

  // Het hooi voor de winter: in de winter zelf wat er in de voorraad ligt; daarbuiten ook wat er dit
  // jaar nog op de weides staat (js/akkers.js, T.verwachtHooi), want dat is voor de volgende winter.
  T.hooiVoorDeWinter = (S, dag) => ((S.voorraad && S.voorraad.hooi) || 0)
    + (T.verwachtHooi && !winterTijd(dag) ? T.verwachtHooi(S, dag) : 0);

  // Het voorstel: zo weinig dieren als kan, zodat het hooi de rest van de winter haalt. Is één dier
  // genoeg, dan het kleinste dat volstaat (een kalf eet de helft); anders het oudste. Alleen wie hooi
  // eet, komt erin: een schaap op de heide niet. { hooi, winter, perDag, dieren }: `perDag` is wat
  // de kudde eet zonder de dieren van het voorstel.
  T.slachtVoorstel = function (S, dag) {
    const hooi = T.hooiVoorDeWinter(S, dag);
    const winter = T.winterDagen(dag);
    const eters = T.veeVan(S).filter((e) => T.hooiVanDier(e, dag) > 0).sort(oudsteEerst);
    let perDag = T.hooiPerWinterdag(S, dag, eters);
    const dieren = [];
    while (perDag * winter > hooi + 1e-9) {
      const over = eters.filter((e) => !dieren.includes(e));
      if (!over.length) break;
      const tekort = perDag - hooi / winter;
      const genoeg = over.filter((e) => T.hooiVanDier(e, dag) >= tekort - 1e-9)
        .sort((a, b) => T.hooiVanDier(a, dag) - T.hooiVanDier(b, dag) || oudsteEerst(a, b));
      const kies = genoeg[0] || over[0];
      dieren.push(kies);
      perDag -= T.hooiVanDier(kies, dag);
    }
    return { hooi, winter, perDag, dieren };
  };

  // Slacht deze dieren: weg uit de wereld, en hun vlees en huiden in de voorraad. Geeft
  // { vlees, huiden }.
  T.slacht = function (S, dieren, dag) {
    const o = T.slachtOpbrengst(dieren, dag);
    for (const e of dieren) haalWeg(S, e);
    if (S.voorraad && T.wijzigVoorraad) {
      if (o.vlees > 0) T.wijzigVoorraad(S, 'vlees', o.vlees);
      if (o.huiden > 0) T.wijzigVoorraad(S, 'huiden', o.huiden);
    }
    if (S.vee) S.vee.slachtVraag = false;
    if (dieren.length) {
      bericht(`${T.hoofdletter(dierenTekst(dieren, dag))} ${dieren.length === 1 ? 'gaat' : 'gaan'} naar de slager: ${Math.round(o.vlees)} vlees en ${o.huiden} ${o.huiden === 1 ? 'huid' : 'huiden'}.`, 'goed');
    }
    return o;
  };

  // Eén winterdag (T.tikVeeDag): het vee eet hooi uit de voorraad, het oudste eerst (de kern van de
  // kudde; het jongste eet als laatste). Wie niet genoeg krijgt, krijgt honger (e.honger, in dagen,
  // naar hoeveel het tekortkwam); na IN().hongerDagen sterft het. Wie weer genoeg eet, knapt per dag
  // een dag op. Raakt het hooi binnenkort op, dan zegt het dorp dat vooraf. Geeft
  // { nodig, gegeten, gestorven }.
  T.voerHooi = function (S, dag) {
    const V = S.vee || (S.vee = T.nieuwVee());
    const dieren = T.veeVan(S).filter((e) => T.hooiVanDier(e, dag) > 0).sort(oudsteEerst);
    let hooi = (S.voorraad && S.voorraad.hooi) || 0;
    const nodig = T.hooiPerWinterdag(S, dag, dieren);
    let gegeten = 0;
    const gestorven = [];
    for (const e of dieren) {
      const portie = T.hooiVanDier(e, dag);
      const krijgt = Math.min(portie, hooi);
      hooi -= krijgt;
      gegeten += krijgt;
      const tekort = 1 - krijgt / portie;
      e.honger = tekort > 1e-9 ? (e.honger || 0) + tekort : Math.max(0, (e.honger || 0) - 1);
      if (e.honger >= IN().hongerDagen - 1e-9) gestorven.push(e);
    }
    if (gegeten > 0 && S.voorraad && T.wijzigVoorraad) T.wijzigVoorraad(S, 'hooi', -gegeten);
    for (const e of gestorven) haalWeg(S, e);
    if (gestorven.length) {
      const een = gestorven.length === 1;
      bericht(`${T.hoofdletter(dierenTekst(gestorven, dag))} ${een ? 'is' : 'zijn'} van honger gestorven: het hooi was op.`, 'gevaar');
    }
    // Vooraf zeggen, één keer per winter: het hooi is binnenkort op, of nu al.
    const over = nodig > 0 ? hooi / nodig : Infinity;
    const winterNog = T.winterDagen(dag) - 1;
    if (gegeten < nodig - 1e-9) {
      if (!V.hongerGemeld) {
        V.hongerGemeld = true;
        bericht(`Het hooi is op. Het vee krijgt honger, en wie ${IN().hongerDagen} dagen tekortkomt, sterft. Slacht wat je niet kunt voeren.`, 'gevaar');
      }
    } else {
      V.hongerGemeld = false;
      if (over < winterNog && over <= IN().hooiWaarschuwing && !V.hooiGewaarschuwd) {
        V.hooiGewaarschuwd = true;
        bericht(`Het hooi is over ${Math.max(1, Math.floor(over))} dagen op, en de winter duurt nog ${winterNog} dagen.`, 'gevaar');
      }
    }
    return { nodig, gegeten, gestorven };
  };

  // ── Elke dag ──

  // Eén dag, vanuit T.tikGebouwenDag (js/gebouwen.js, stap 0): ná de akkers (op 1 lentemaand
  // verhuist daar het vee naar zijn nieuwe weide) en vóór de behoeften, want het dorp eet de melk
  // van vandaag als eerste (js/behoeften.js, T.eetVandaag). Op 1 grasmaand eerst de jongen, dan de
  // melk. S.vee.melk is de melk van vandaag; wat er na het eten van over is, wordt kaas. In de
  // winter eet het vee hooi (T.voerHooi).
  T.tikVeeDag = function (S, dag) {
    const V = S.vee || (S.vee = T.nieuwVee());
    V.melk = 0;
    if (!T.veeVan(S).length) return;
    const d = T.datumVanDag(dag);
    const werpen = IN().werpen;
    if (IN().groeit && d.maand === maandIdx(werpen.maand) && d.dagVanMaand === werpen.dag) T.werpJongen(S, dag);
    // Op 1 slachtmaand: wie gaat er naar de slager? Het venster opent zodra je rondloopt (niet midden
    // in een gesprek of een ander venster), en tot dan blijft de vraag staan.
    const s = IN().slachten;
    if (d.maand === maandIdx(s.maand) && d.dagVanMaand === s.dag) V.slachtVraag = true;
    if (V.slachtVraag && T.ui && T.ui.openSlachten && (!S.modus || S.modus === 'verkennen')) T.ui.openSlachten(S);
    if (IN().winterzorg && winterTijd(dag)) T.voerHooi(S, dag);
    else V.hooiGewaarschuwd = V.hongerGemeld = false; // een nieuwe winter mag weer waarschuwen
    // De schapen: scheren in zomermaand, en elke dag de mest uit de kooi.
    const sch = IN().scheren;
    if (d.maand === maandIdx(sch.maand) && d.dagVanMaand === sch.dag) T.scheerSchapen(S, dag);
    const mest = T.mestVanDag(S);
    if (mest > 0 && S.voorraad && T.wijzigVoorraad) T.wijzigVoorraad(S, 'mest', mest);
    V.melk = T.melkVanDag(S, dag);
  };
})(globalThis.Spel = globalThis.Spel || {});
