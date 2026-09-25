// De regels van een quest, los van het scherm en dus in Node te toetsen (test/quest.test.cjs).
// De quests zelf staan in quests.js; hier staat alleen wat ermee gebeurt: in welke fase je zit,
// welke weg je nam, wanneer een fase vanzelf verder gaat, en wat een beloning doet. Zie
// ontwerp/toren.md, "Quests: waar het goud vandaan komt".
//
// Dit bestand hangt zichzelf aan het gesprekssysteem in plaats van andersom: gesprek.js roept
// T.questVoorwaarde en T.questGevolg alleen aan als ze bestaan. Zo blijft een gesprek zonder
// quests gewoon werken.
//
// De stand is expres saai: per quest één woord (de fase) en één woord (de weg die je nam), plus
// een lijstje uitgekeerde beloningen. Alles zijn strings, dus opslaan is later geen kunststuk.
(function (T) {
  'use strict';

  const lijst = (v) => (v == null ? [] : Array.isArray(v) ? v : [v]);
  const zeg = (tekst) => { if (T.ui && T.ui.bericht) T.ui.bericht(tekst); };

  // Waar een weg je op kost. Het is geen getal maar een soort: de toets van drie antwoorden
  // vraagt niet om drie prijzen maar om drie verschillende manieren om te betalen. 'niets' is
  // de stap die geen keuze is (iets afgeven), en telt daarom niet mee.
  const KOSTEN = ['jaren', 'goud', 'gunst', 'risico', 'niets'];
  T.QUEST_KOSTEN = KOSTEN;

  const stand = (S) => (S.quests || (S.quests = {}));
  const wegen = (S) => (S.questWeg || (S.questWeg = {}));
  const beloond = (S) => (S.questBeloond || (S.questBeloond = new Set()));

  // ── De stand ──

  T.questFase = (S, naam) => stand(S)[naam] || null;
  T.questLoopt = (S, naam) => !!stand(S)[naam];
  T.questWegVan = (S, naam) => wegen(S)[naam] || null;
  T.questAf = function (S, naam) {
    const q = T.QUESTS[naam];
    const f = T.questFase(S, naam);
    return !!(q && f && q.fasen[f] && q.fasen[f].eind);
  };

  // Een quest in een fase zetten. Dat is het enige wat de fase verandert, zodat er één plek is
  // waar een beloning wordt uitgekeerd en een melding komt — net zoals alle jaren via T.verouder
  // lopen. Dezelfde fase nog eens doet niets.
  T.zetQuest = function (S, naam, fase, weg) {
    const q = T.QUESTS[naam];
    if (!q) return console.warn(`T.zetQuest: onbekende quest "${naam}"`);
    if (!q.fasen[fase]) return console.warn(`T.zetQuest: "${naam}" heeft geen fase "${fase}"`);
    if (stand(S)[naam] === fase) return;
    stand(S)[naam] = fase;
    if (weg) wegen(S)[naam] = weg;
    const f = q.fasen[fase];
    if (f.melding) zeg(f.melding);
    keerUit(S, naam, fase, f.beloning);
    T.werkQuestVoorwerpen(S);
    T.werkGeheimenBij(S);
  };

  // Een beloning wordt één keer uitgekeerd, ook als je later nog eens in die fase komt. Wat er
  // al uit is, staat als "quest:fase" in een verzameling: weer gewoon strings.
  function keerUit(S, naam, fase, beloning) {
    if (!beloning) return;
    const sleutel = `${naam}:${fase}`;
    if (beloond(S).has(sleutel)) return;
    beloond(S).add(sleutel);
    if (beloning.goud) T.geefGoud(S, beloning.goud);
    for (const soort of lijst(beloning.geef)) S.inventaris.add(soort);
    for (const vlag of lijst(beloning.vlag)) T.zetVlag(S, vlag);
  }

  // Een weg nemen: het gevolg eerst (goud eraf, het voorwerp weg), dan pas de nieuwe fase, zodat
  // een beloning niet met het betalen door elkaar loopt.
  T.neemWeg = function (S, naam, wegId) {
    const q = T.QUESTS[naam];
    const fase = T.questFase(S, naam);
    const w = q && fase && q.fasen[fase].wegen && q.fasen[fase].wegen[wegId];
    if (!w) {
      console.warn(`T.neemWeg: "${naam}" heeft in fase "${fase}" geen weg "${wegId}"`);
      return false;
    }
    if (w.doe) T.doeGevolg(S, w.doe);
    T.zetQuest(S, naam, w.naar, wegId);
    return true;
  };

  // Elk beeld (js/main.js): gaat een weg vanzelf open? Per quest hoogstens
  // één stap per beeld — zo kan een lus van fasen die elkaar meteen waarmaken het spel niet
  // laten hangen, en zie je elke melding apart voorbijkomen.
  T.werkQuestsBij = function (S) {
    for (const naam of Object.keys(stand(S))) {
      const q = T.QUESTS[naam];
      if (!q) continue;
      const f = q.fasen[stand(S)[naam]];
      if (!f || !f.wegen) continue;
      for (const [id, w] of Object.entries(f.wegen)) {
        if (w.klaarAls && T.voorwaardeGeldt(S, q.gever, w.klaarAls)) {
          T.neemWeg(S, naam, id);
          break;
        }
      }
    }
    T.werkQuestVoorwerpen(S);
    T.werkGeheimenBij(S);
  };

  // Wat er linksboven staat: de eerste lopende quest die iets van je wil. Dat is de quest die je
  // het eerst aannam — wie een tweede aanneemt, ziet de eerste niet zomaar verdwijnen.
  T.questDoel = function (S) {
    for (const naam of Object.keys(stand(S))) {
      const q = T.QUESTS[naam];
      const f = q && q.fasen[stand(S)[naam]];
      if (f && f.doel) return { kop: q.naam, tekst: f.doel };
    }
    return null;
  };

  // ── Goud ──

  // Goud koopt nooit jaren terug (ontwerp/toren.md, "Wat de kernregel ervan vraagt"); het koopt
  // dingen waarmee je jaren kunt vermijden. Het vakje in beeld komt pas als je ooit goud had.
  // Sinds het gehuchtspel (js/voorraad.js) is goud ook een van de vier grondstoffen. Loopt die
  // mee (S.voorraad bestaat, en T.wijzigVoorraad is geladen), dan gaat de wijziging daarlangs en
  // blijft S.goud gewoon in de pas lopen; zonder S.voorraad (de bestaande toetsen, en het oude
  // gereedschap) werkt deze functie zoals hij altijd deed.
  T.geefGoud = function (S, n) {
    if (T.wijzigVoorraad && S.voorraad) {
      T.wijzigVoorraad(S, 'goud', n);
    } else {
      S.goud = Math.max(0, (S.goud || 0) + n);
      if (S.goud > 0) S.goudGehad = true;
    }
    if (T.ui && T.ui.toonGoud) T.ui.toonGoud(S);
  };

  // ── Wat een gesprek ermee kan (de haken uit gesprek.js) ──

  // Een voorwaarde. quest zonder fase betekent "die quest loopt"; fase mag een lijstje zijn.
  T.questVoorwaarde = function (S, als) {
    if (als.quest) {
      const fase = T.questFase(S, als.quest);
      if (!fase) return false;
      if (als.fase && !lijst(als.fase).includes(fase)) return false;
      if (als.weg && T.questWegVan(S, als.quest) !== als.weg) return false;
    }
    if (als.nietQuest && T.questLoopt(S, als.nietQuest)) return false;
    if (als.questAf && !T.questAf(S, als.questAf)) return false;
    if (als.goud != null && (S.goud || 0) < als.goud) return false;
    return true;
  };

  // Een gevolg: een quest in een fase zetten (of een weg nemen), en goud erbij of eraf.
  T.questGevolg = function (S, doe) {
    if (doe.goud) T.geefGoud(S, doe.goud);
    if (!doe.quest) return;
    if (doe.weg) T.neemWeg(S, doe.quest, doe.weg);
    else if (doe.fase) T.zetQuest(S, doe.quest, doe.fase);
    else {
      const q = T.QUESTS[doe.quest];
      if (q) T.zetQuest(S, doe.quest, q.begin);
    }
  };

  // ── Voorwerpen die aan een quest hangen ──

  // In Tiled: een voorwerp met de eigenschap quest="bakker:zoeken" ligt er alleen zolang die
  // quest in die fase is. Zo ligt de leem pas in de kuil als de bakker erom vroeg. Meer fasen
  // mag ook: "bakker:zoeken,terug".
  T.questGrendel = function (tekst) {
    if (typeof tekst !== 'string') return null;
    const deel = tekst.split(':');
    const quest = (deel[0] || '').trim();
    if (!quest) return null;
    const fase = (deel[1] || '').split(',').map((s) => s.trim()).filter(Boolean);
    return { quest, fase: fase.length ? fase : null };
  };

  // De grendel weer op de wereld leggen. De voorwerpen die eraan hangen staan apart in
  // w.questVoorwerpen en schuiven in en uit w.voorwerpen; zo hoeft niemand anders — tekenen,
  // lopen, klikken — iets van quests te weten.
  T.werkQuestVoorwerpen = function (S) {
    const w = S.wereld;
    if (!w || !w.questVoorwerpen) return;
    for (const v of w.questVoorwerpen) {
      const hoort = !v.grendel || T.questVoorwaarde(S, { quest: v.grendel.quest, fase: v.grendel.fase });
      const i = w.voorwerpen.indexOf(v);
      if (hoort && i < 0) w.voorwerpen.push(v);
      else if (!hoort && i >= 0) w.voorwerpen.splice(i, 1);
    }
  };

  // ── Geheime doorgangen ──

  // Een geheime doorgang ziet eruit als muur tot je ervan hoort (ontwerp/kaarten.md, "Geheim is:
  // je hoort ervan, en dan is hij er"): een dorpeling vertelt het, of een quest komt in een fase.
  // Daarna is het een gewone dichte deur, die je opent zoals elke andere. Dezelfde vorm als de
  // questvoorwerpen hierboven: ze staan apart in w.geheimen en schuiven in en uit w.deuren, zodat
  // lopen, tekenen en klikken niets van geheimen hoeven te weten.
  //
  // Waarom dit bij de kernregel past: de dure weg is er altijd (om de rots heen, of erlangs
  // zweven voor twee jaar). Een geheime doorgang is de goedkope weg, en die verdien je met
  // praten, niet met jaren. Zie CLAUDE.md, "Niets is een muur, alles is een prijs".
  T.werkGeheimenBij = function (S) {
    const w = S.wereld;
    if (!w || !w.geheimen) return;
    for (const g of w.geheimen) {
      const sleutel = g.x + ',' + g.y;
      const hoort = !g.als || T.voorwaardeGeldt(S, null, g.als);
      const staatEr = w.deuren.get(sleutel) === g;
      if (hoort && !staatEr) {
        w.deuren.set(sleutel, g);
        w.tegels[g.y][g.x] = 'deur';
      } else if (!hoort && staatEr) {
        w.deuren.delete(sleutel);
        w.tegels[g.y][g.x] = g.onder;
      }
    }
  };

  // ── Raakpunten: een spreuk op een ding ──

  // Het raakpunt onder de muis, als deze spreuk erop werkt en het nog te doen is. Zie de uitleg
  // boven in quests.js; js/toveren.js vraagt het bij elke spreuk, dus dit werkt net zo goed voor
  // een windstoot op een molen als voor een vuurschicht in een oven.
  T.raakpuntOp = function (S, doel, spreukId) {
    const w = S.wereld;
    const v = (doel && doel.voorwerp) || (w && doel && T.voorwerpOp(w, doel.x, doel.y));
    return v ? raakpuntVan(S, v, spreukId) : null;
  };

  function raakpuntVan(S, v, spreukId) {
    const r = v && v.raak && T.RAAKPUNTEN[v.raak];
    if (!r || r.spreuk !== spreukId) return null;
    if (lijst(r.zetVlag).some((vlag) => T.heeftVlag(S, vlag))) return null; // al gedaan
    if (!T.voorwaardeGeldt(S, null, r.als)) return null;
    return { voorwerp: v, raak: r };
  }

  // Staat er iets binnen bereik dat om deze spreuk vraagt? Daarop kijkt T.waaromNiet, zodat je
  // een vuurschicht buiten een gevecht wél mag pakken als er een scheur staat te wachten.
  T.raakpuntInBereik = function (S, spreukId, bereik) {
    const w = S.wereld;
    if (!w) return null;
    const h = T.tegelVan(S.held);
    for (const v of w.voorwerpen) {
      const rp = raakpuntVan(S, v, spreukId);
      if (rp && T.afstand(h, { x: v.x, y: v.y }) <= bereik) return rp;
    }
    return null;
  };

  // ── De toets van drie antwoorden ──

  // De regel uit ontwerp/toren.md, als iets wat npm test nakijkt: elke quest heeft minstens drie
  // echte wegen naar het einde, die niet allemaal hetzelfde kosten. Daar komt het gewone
  // nakijkwerk bij — een weg die nergens heen gaat, een fase waar je niet meer uit komt, een
  // einde dat onbereikbaar is — want dat is precies wat je in gegevens over het hoofd ziet.
  // Geeft een lijst klachten; leeg betekent goed.
  T.keurQuests = function (quests) {
    const klachten = [];
    for (const [id, q] of Object.entries(quests || {})) {
      const fasen = q.fasen || {};
      const namen = Object.keys(fasen);
      if (!q.naam) klachten.push(`${id}: geen naam`);
      if (!namen.length) { klachten.push(`${id}: geen fasen`); continue; }
      if (!fasen[q.begin]) klachten.push(`${id}: begin "${q.begin}" is geen fase`);
      if (!namen.some((n) => fasen[n].eind)) klachten.push(`${id}: geen enkele fase heeft eind: true`);

      const alle = [];
      for (const n of namen) {
        const f = fasen[n];
        const eruit = Object.entries(f.wegen || {});
        if (!eruit.length && !f.eind) klachten.push(`${id}: uit fase "${n}" komt geen weg`);
        for (const [wid, w] of eruit) {
          if (!fasen[w.naar]) klachten.push(`${id}: weg "${n}/${wid}" gaat naar "${w.naar}", en dat is geen fase`);
          if (!KOSTEN.includes(w.kost)) klachten.push(`${id}: weg "${n}/${wid}" kost "${w.kost}"; dat moet een van ${KOSTEN.join(', ')} zijn`);
          alle.push(w);
        }
      }

      const keuzes = alle.filter((w) => w.kost !== 'niets');
      if (keuzes.length < 3) {
        klachten.push(`${id}: ${keuzes.length} echte weg(en), en de toets van drie antwoorden vraagt er drie (ontwerp/toren.md)`);
      }
      const soorten = new Set(keuzes.map((w) => w.kost));
      if (keuzes.length >= 3 && soorten.size < 2) {
        klachten.push(`${id}: elke weg kost "${[...soorten][0]}"; drie keer hetzelfde is één antwoord`);
      }

      const bereikt = bereikbaar(fasen, q.begin);
      if (!namen.some((n) => fasen[n].eind && bereikt.has(n))) klachten.push(`${id}: het einde is vanaf "${q.begin}" niet te bereiken`);
      for (const n of namen) if (!bereikt.has(n)) klachten.push(`${id}: fase "${n}" is nergens vandaan te bereiken`);
    }
    return klachten;
  };

  function bereikbaar(fasen, begin) {
    const gezien = new Set();
    const nog = fasen[begin] ? [begin] : [];
    while (nog.length) {
      const n = nog.pop();
      if (gezien.has(n)) continue;
      gezien.add(n);
      for (const w of Object.values(fasen[n].wegen || {})) if (fasen[w.naar]) nog.push(w.naar);
    }
    return gezien;
  }
})(globalThis.Toren = globalThis.Toren || {});
