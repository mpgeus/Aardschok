// De getallen van het spel, uit de bestanden zelf (werklijst vraag 142; Marcel, 8 okt: "echt een robuuste losse tool.
// Voor alle settings etc.", "een bladzijde met duidelijk overzicht van alles", en "Gelijk veranderen").
//
// Dit leest een blok als `T.SCHOVEN_INSTELLINGEN = { ... }` uit de tekst van een bestand, en geeft elk blad terug: zijn
// pad (de sleutels ernaartoe), zijn waarde, waar die precies in de tekst staat, en het commentaar erboven, want daar
// staat al wat het getal doet en waarom het zo is. Schrijven verandert alleen de tekens van dat ene getal: wat erom staat,
// het commentaar en de opmaak, blijft letterlijk zoals het was (zoals gereedschap/bronblok.js voor de bewerkers).
//
// Er wordt niets uitgevoerd: wat geen gewoon getal, waar/onwaar of tekst is (een som, een functie, maandIdx('...')), is
// een blad van soort 'anders', dat de bladzijde laat zien maar niet verandert. Zonder scherm, dus te toetsen
// (test/instellingen.test.cjs), en dezelfde code in de browser (gereedschap/instellingen.html) en in de server
// (server.cjs, die het getal schrijft).
(function (T) {
  'use strict';

  const ID_BEGIN = /[A-Za-z_$]/;
  const ID = /[A-Za-z0-9_$]/;

  // Een bestand kan eindigen op \r\n of op \n (met git core.autocrlf=true staat het op Windows met \r\n in de werkmap).
  // De lezer werkt op de tekst zoals hij is, zodat schrijven de regeleinden van het bestand laat staan; alleen wat hij als
  // tekst teruggeeft om te tonen, krijgt \n.
  const metN = (s) => s.replace(/\r\n?/g, '\n');

  // Staat er na positie i niets meer bij de waarde: een komma, een sluitteken, het eind van de regel of commentaar?
  function losNa(t, i) {
    return i >= t.length || /^\s*[,}\]\r\n;]/.test(t.slice(i, i + 3)) || /^\s*\/\//.test(t.slice(i, i + 4));
  }

  // Een lezer over de tekst, vanaf positie i.
  function lezer(tekst, i) {
    const L = { tekst, i };
    // Wit en commentaar overslaan; de commentaarregels die je tegenkwam, krijg je terug (voor een sleutel erna). Een lege
    // regel tussen commentaar en sleutel breekt de band niet: in deze bestanden staat er soms een witregel tussen.
    L.wit = function () {
      const commentaar = [];
      for (;;) {
        const c = tekst[L.i];
        if (c === undefined) return commentaar;
        if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
          L.i++;
        } else if (c === '/' && tekst[L.i + 1] === '/') {
          const eind = tekst.indexOf('\n', L.i);
          const regel = tekst.slice(L.i + 2, eind < 0 ? tekst.length : eind).trim();
          commentaar.push(regel);
          L.i = eind < 0 ? tekst.length : eind;
        } else if (c === '/' && tekst[L.i + 1] === '*') {
          const eind = tekst.indexOf('*/', L.i + 2);
          commentaar.push(metN(tekst.slice(L.i + 2, eind < 0 ? tekst.length : eind)).replace(/^\s*\*\s?/gm, '').trim());
          L.i = eind < 0 ? tekst.length : eind + 2;
        } else return commentaar;
      }
    };
    // Commentaar achter een waarde op dezelfde regel ("dag: 1, // de eerste").
    L.staart = function () {
      let j = L.i;
      while (tekst[j] === ' ' || tekst[j] === '\t') j++;
      if (tekst[j] === ',') {
        j++;
        while (tekst[j] === ' ' || tekst[j] === '\t') j++;
      }
      if (tekst[j] === '/' && tekst[j + 1] === '/') {
        const eind = tekst.indexOf('\n', j);
        return tekst.slice(j + 2, eind < 0 ? tekst.length : eind).trim();
      }
      return null;
    };
    return L;
  }

  // Een tekst tussen aanhalingstekens, vanaf de aanhaling op L.i; geeft de inhoud.
  function leesTekst(L) {
    const t = L.tekst;
    const q = t[L.i];
    let j = L.i + 1;
    let uit = '';
    while (j < t.length && t[j] !== q) {
      if (t[j] === '\\') {
        const n = t[j + 1];
        uit += n === 'n' ? '\n' : n === 't' ? '\t' : n;
        j += 2;
      } else uit += t[j++];
    }
    L.i = j + 1;
    return uit;
  }

  // Iets wat geen gewone waarde is: alles tot de komma of het sluitteken op dezelfde diepte.
  function slaUitdrukkingOver(L) {
    const t = L.tekst;
    let diepte = 0;
    while (L.i < t.length) {
      const c = t[L.i];
      if (c === "'" || c === '"' || c === '`') {
        leesTekst(L);
        continue;
      }
      if (c === '/' && t[L.i + 1] === '/') {
        L.wit();
        continue;
      }
      if (c === '(' || c === '[' || c === '{') diepte++;
      else if (c === ')' || c === ']' || c === '}') {
        if (diepte === 0) return;
        diepte--;
      } else if (c === ',' && diepte === 0) return;
      L.i++;
    }
  }

  const GETAL = /^-?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/;

  // Een waarde vanaf L.i: een knoop { soort, ... }, met begin en eind in de tekst.
  function leesWaarde(L) {
    L.wit();
    const t = L.tekst;
    const begin = L.i;
    const c = t[L.i];
    if (c === '{') return leesObject(L);
    if (c === '[') return leesLijst(L);
    if (c === "'" || c === '"') {
      const waarde = leesTekst(L);
      return eindVan(L, { soort: 'tekst', waarde, begin });
    }
    const m = GETAL.exec(t.slice(L.i, L.i + 40));
    if (m) {
      L.i += m[0].length;
      if (losNa(t, L.i)) return { soort: 'getal', waarde: Number(m[0]), begin, eind: L.i };
    }
    L.i = begin;
    for (const [woord, waarde] of [['true', true], ['false', false]]) {
      if (t.startsWith(woord, L.i) && !ID.test(t[L.i + woord.length] || '')) {
        L.i += woord.length;
        if (losNa(t, L.i)) return { soort: 'waar', waarde, begin, eind: L.i };
        L.i = begin;
      }
    }
    slaUitdrukkingOver(L);
    let eind = L.i;
    while (eind > begin && /\s/.test(t[eind - 1])) eind--;
    return { soort: 'anders', waarde: metN(t.slice(begin, eind)), begin, eind };
  }

  // Een tekst is alleen een blad als er niets achter staat ('a' + b is een uitdrukking).
  function eindVan(L, knoop) {
    if (losNa(L.tekst, L.i)) {
      knoop.eind = L.i;
      return knoop;
    }
    L.i = knoop.begin;
    slaUitdrukkingOver(L);
    return { soort: 'anders', waarde: metN(L.tekst.slice(knoop.begin, L.i).trim()), begin: knoop.begin, eind: L.i };
  }

  function leesObject(L) {
    const t = L.tekst;
    const knoop = { soort: 'object', delen: [], begin: L.i };
    L.i++; // {
    for (;;) {
      const uitleg = L.wit();
      const c = t[L.i];
      if (c === '}' || c === undefined) {
        L.i++;
        break;
      }
      if (c === ',') {
        L.i++;
        continue;
      }
      let sleutel;
      if (c === "'" || c === '"') sleutel = leesTekst(L);
      else if (t.startsWith('...', L.i)) {
        // ...iets: niet te lezen, overslaan
        slaUitdrukkingOver(L);
        continue;
      } else if (ID_BEGIN.test(c) || /\d/.test(c)) {
        const b = L.i;
        while (ID.test(t[L.i] || '')) L.i++;
        sleutel = t.slice(b, L.i);
      } else {
        slaUitdrukkingOver(L);
        continue;
      }
      L.wit();
      if (t[L.i] !== ':') {
        // een methode of een korte schrijfwijze ({ a }): niet te lezen
        slaUitdrukkingOver(L);
        continue;
      }
      L.i++;
      const waarde = leesWaarde(L);
      const staart = L.staart();
      knoop.delen.push({ sleutel, uitleg: staart ? [...uitleg, staart] : uitleg, waarde });
    }
    knoop.eind = L.i;
    return knoop;
  }

  function leesLijst(L) {
    const t = L.tekst;
    const knoop = { soort: 'lijst', delen: [], begin: L.i };
    L.i++; // [
    let n = 0;
    for (;;) {
      const uitleg = L.wit();
      const c = t[L.i];
      if (c === ']' || c === undefined) {
        L.i++;
        break;
      }
      if (c === ',') {
        L.i++;
        continue;
      }
      const waarde = leesWaarde(L);
      const staart = L.staart();
      knoop.delen.push({ sleutel: n++, uitleg: staart ? [...uitleg, staart] : uitleg, waarde });
    }
    knoop.eind = L.i;
    return knoop;
  }

  const I = (T.instellingen = {});

  // Waar in deze tekst begint `T.NAAM = `? Geeft de positie na het =-teken, en het commentaar erboven; of null.
  I.vindBlok = function (tekst, naam) {
    const re = new RegExp(`^([ \\t]*)T\\.${naam}\\s*=(?!=)`, 'm');
    const m = re.exec(tekst);
    if (!m) return null;
    // Het commentaar direct boven de regel.
    const regels = tekst.slice(0, m.index).split(/\r?\n/);
    regels.pop();
    const uitleg = [];
    while (regels.length && /^\s*\/\//.test(regels[regels.length - 1])) uitleg.unshift(regels.pop().replace(/^\s*\/\/\s?/, '').trim());
    return { na: m.index + m[0].length, uitleg };
  };

  // Lees het blok `T.NAAM` uit deze tekst: { naam, uitleg, waarde (de knoop) }, of null.
  I.leesBlok = function (tekst, naam) {
    const plek = I.vindBlok(tekst, naam);
    if (!plek) return null;
    const L = lezer(tekst, plek.na);
    return { naam, uitleg: plek.uitleg, waarde: leesWaarde(L) };
  };

  // Alle bladen van een knoop, met hun pad (een lijst sleutels) en het commentaar van hun eigen sleutel en die erboven.
  I.bladen = function (knoop, pad = [], uitlegBoven = []) {
    const uit = [];
    if (knoop.soort === 'object' || knoop.soort === 'lijst') {
      for (const d of knoop.delen) uit.push(...I.bladen(d.waarde, [...pad, d.sleutel], d.uitleg && d.uitleg.length ? d.uitleg : []).map((b) => ({ ...b, boven: b.boven || (uitlegBoven.length ? uitlegBoven : null) })));
      return uit;
    }
    return [{ pad, soort: knoop.soort, waarde: knoop.waarde, begin: knoop.begin, eind: knoop.eind, uitleg: uitlegBoven }];
  };

  // Een knoop op een pad in een blok, of null.
  I.knoopOp = function (knoop, pad) {
    let k = knoop;
    for (const s of pad) {
      if (!k || (k.soort !== 'object' && k.soort !== 'lijst')) return null;
      const d = k.delen.find((x) => x.sleutel === s || String(x.sleutel) === String(s));
      k = d ? d.waarde : null;
    }
    return k;
  };

  // Hoe een nieuwe waarde in de tekst komt: een getal zoals JavaScript het schrijft, een tekst tussen enkele aanhalingen.
  I.alsBron = function (soort, waarde) {
    if (soort === 'getal') return String(waarde);
    if (soort === 'waar') return waarde ? 'true' : 'false';
    if (soort === 'tekst') return `'${String(waarde).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
    throw new Error(`een ${soort} schrijf ik niet`);
  };

  // Verander één blad in de tekst van een bestand. Geeft de nieuwe tekst, of gooit een fout die zegt waarom niet: het blok
  // of het pad is er niet, het is geen gewoon getal, of de nieuwe waarde past niet bij wat er stond.
  I.zet = function (tekst, naam, pad, waarde) {
    const blok = I.leesBlok(tekst, naam);
    if (!blok) throw new Error(`T.${naam} staat niet in dit bestand`);
    const k = I.knoopOp(blok.waarde, pad);
    if (!k) throw new Error(`${naam}.${pad.join('.')} bestaat niet`);
    if (k.soort === 'getal') {
      const n = typeof waarde === 'number' ? waarde : Number(String(waarde).replace(',', '.'));
      if (!Number.isFinite(n)) throw new Error(`"${waarde}" is geen getal`);
      waarde = n;
    } else if (k.soort === 'waar') {
      if (typeof waarde !== 'boolean') throw new Error('kies waar of niet waar');
    } else if (k.soort === 'tekst') {
      if (typeof waarde !== 'string') throw new Error('dat is geen tekst');
    } else throw new Error(`${naam}.${pad.join('.')} is geen gewoon getal, maar ${k.waarde}`);
    return tekst.slice(0, k.begin) + I.alsBron(k.soort, waarde) + tekst.slice(k.eind);
  };

  // Welke blokken staan in deze tekst? De namen van `T.NAAM = ` aan het begin van een regel, in hoofdletters.
  I.blokkenIn = function (tekst) {
    return [...tekst.matchAll(/^[ \t]*T\.([A-Z][A-Z0-9_]*)\s*=(?!=)/gm)].map((m) => m[1]);
  };

  // ---------------------------------------------------------------------------------------------
  // Het overzicht voor de bladzijde: alles uit de tekst van de bestanden, zonder het spel te draaien
  // ---------------------------------------------------------------------------------------------

  // Wat niet in de werkbank staat (T.WERKBANK in js/opties.js), krijgt hier een naam. Het versienummer van het opslaan
  // staat er niet bij: wie dat verzet, kan geen oud spel meer laden.
  I.NAMEN = {
    SCHOVEN_INSTELLINGEN: 'De oogst binnenhalen en de dagloners',
    WIJNGAARD_INSTELLINGEN: 'De wijngaard',
    DOORZOEKEN_INSTELLINGEN: 'De soldaten zoeken',
    DORP_INSTELLINGEN: 'De dorpen',
    EILAND_INSTELLINGEN: 'Het eiland',
    HOOGTE_INSTELLINGEN: 'De hoogte van het land',
    TEKENEN_INSTELLINGEN: 'Het tekenen',
  };
  I.VERBORGEN = new Set(['OPSLAAN_INSTELLINGEN']);

  // Een knoop als gewone waarde (voor wat een spelregel zet): een blad zijn waarde, een object of lijst zijn tekst.
  const alsWaarde = (k, tekst) => (k.soort === 'object' || k.soort === 'lijst' ? metN(tekst.slice(k.begin, k.eind)) : k.waarde);
  const deel = (k, sleutel) => (k && k.delen ? (k.delen.find((d) => d.sleutel === sleutel) || {}).waarde : null);

  // Het overzicht uit de bestanden: `bronnen` is { 'js/akkers.js': tekst, ... }. Geeft { onderwerpen, spelregels,
  // gebouwen }; elk blad met { bestand, blok, pad, soort, waarde, uitleg, boven, spelregels }, zodat de bladzijde het kan
  // tonen en de server het kan schrijven.
  I.model = function (bronnen) {
    const waar = {}; // blok -> bestand
    for (const bestand of Object.keys(bronnen)) for (const n of I.blokkenIn(bronnen[bestand])) if (!waar[n]) waar[n] = bestand;
    const lees = (naam) => (waar[naam] ? I.leesBlok(bronnen[waar[naam]], naam) : null);

    // De spelregels (T.OPTIES), en per pad wat ze erop zetten.
    const spelregels = [];
    const zetten = {}; // 'BLOK.a.b' -> [{ optie, keuze, waarde, standaard }]
    const opties = lees('OPTIES');
    if (opties && opties.waarde.soort === 'lijst') {
      for (const d of opties.waarde.delen) {
        const o = d.waarde;
        const id = deel(o, 'id');
        if (!id || id.soort !== 'tekst') continue;
        const tekst = (sl) => { const k = deel(o, sl); return k && k.soort === 'tekst' ? k.waarde : null; };
        const standaard = tekst('standaard');
        const keuzes = [];
        const kz = deel(o, 'keuzes');
        for (const kd of (kz && kz.delen) || []) {
          const k = kd.waarde;
          const kid = deel(k, 'id');
          const knaam = deel(k, 'naam');
          const kuitleg = deel(k, 'uitleg');
          const zet = {};
          for (const z of (deel(k, 'zet') || {}).delen || []) {
            zet[z.sleutel] = alsWaarde(z.waarde, bronnen[waar.OPTIES]);
            (zetten[z.sleutel] = zetten[z.sleutel] || []).push({ optie: tekst('naam') || id.waarde, keuze: knaam && knaam.waarde, waarde: zet[z.sleutel], standaard: kid && kid.waarde === standaard });
          }
          keuzes.push({ id: kid && kid.waarde, naam: knaam && knaam.waarde, uitleg: kuitleg && kuitleg.waarde, zet });
        }
        spelregels.push({ id: id.waarde, naam: tekst('naam'), uitleg: tekst('uitleg'), standaard, keuzes, voorProeven: !!(deel(o, 'voorProeven') || {}).waarde,
          bestand: waar.OPTIES, blok: 'OPTIES', pad: [d.sleutel, 'standaard'], boven: d.uitleg });
      }
    }

    const metBlad = (bestand, blok, b) => ({ bestand, blok, pad: b.pad, soort: b.soort, waarde: b.waarde, uitleg: b.uitleg, boven: b.boven, spelregels: zetten[[blok, ...b.pad].join('.')] || [] });

    // De onderwerpen: eerst de werkbank, in zijn volgorde en met zijn namen, dan de blokken die er niet in staan.
    const onderwerpen = [];
    const gehad = new Set();
    const voegToe = (naam, blok) => {
      const b = lees(blok);
      if (!b) return;
      gehad.add(blok);
      onderwerpen.push({ naam, blok, bestand: waar[blok], uitleg: b.uitleg, bladen: I.bladen(b.waarde).map((x) => metBlad(waar[blok], blok, x)) });
    };
    const werkbank = lees('WERKBANK');
    if (werkbank && werkbank.waarde.soort === 'lijst') {
      for (const d of werkbank.waarde.delen) {
        const naam = deel(d.waarde, 'naam');
        const blok = deel(d.waarde, 'blok');
        const losse = deel(d.waarde, 'losse');
        if (blok && blok.soort === 'tekst') voegToe(naam ? naam.waarde : blok.waarde, blok.waarde);
        else if (losse && losse.delen) {
          const bladen = [];
          for (const l of losse.delen) {
            const b = lees(l.sleutel);
            if (!b) continue;
            gehad.add(l.sleutel);
            for (const x of I.bladen(b.waarde)) bladen.push({ ...metBlad(waar[l.sleutel], l.sleutel, x), naam: l.waarde.waarde, uitleg: b.uitleg });
          }
          onderwerpen.push({ naam: naam ? naam.waarde : 'Losse getallen', bladen });
        }
      }
    }
    for (const blok of Object.keys(waar).sort()) {
      if (gehad.has(blok) || I.VERBORGEN.has(blok) || !/_INSTELLINGEN$/.test(blok)) continue;
      voegToe(I.NAMEN[blok] || blok, blok);
    }

    // De gebouwen (T.GEBOUWEN): per soort zijn getallen.
    const gebouwen = [];
    const G = lees('GEBOUWEN');
    if (G && G.waarde.soort === 'object') {
      for (const d of G.waarde.delen) {
        const naam = deel(d.waarde, 'naam');
        gebouwen.push({ soort: d.sleutel, naam: naam && naam.soort === 'tekst' ? naam.waarde : d.sleutel, uitleg: d.uitleg,
          bladen: I.bladen(d.waarde).map((x) => metBlad(waar.GEBOUWEN, 'GEBOUWEN', { ...x, pad: [d.sleutel, ...x.pad] })) });
      }
    }
    return { onderwerpen, spelregels, gebouwen };
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = I;
})(globalThis.Spel = globalThis.Spel || {});
