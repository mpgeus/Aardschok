// De taal van het spel (vraag 147; Marcel, 9 okt: "We moeten alles naar het Engels halen. Ook moeten we een translate
// tool hebben. Mochten we leden uit de community krijgen die een vertaling willen maken."). Besloten: alles wat de
// speler ziet, met Engels als brontaal; Nederlands is een vertaling zoals elke andere. De code, het commentaar en
// ontwerp/ blijven Nederlands.
//
// Eén manier om tekst te tonen: T.t('Engelse zin met {wie}', { wie }). De Engelse zin in de code is zelf de sleutel;
// een taal (taal/nl.js) zegt per zin wat hij in die taal is. Ontbreekt een zin, dan staat er het Engels. Het eerste
// argument is altijd een gewone tekst tussen aanhalingstekens, nooit een variabele of een `sjabloon`: npm run teksten
// (gereedschap/teksten.cjs) leest de zinnen zo uit de code, voor taal/bron.js en de vertaaltool
// (gereedschap/vertalen.html), en test/taal.test.cjs bewaakt het.
//
// In een zin:
//   {wie}                 wat er in `woorden` staat; staat het er niet in, dan blijft {wie} staan (een gesprek vult
//                         het later in, js/gesprek.js).
//   {n|# man|# men}       meervoud: n is een getal, en de vormen staan in de volgorde van de meervoudsvormen van de
//                         taal (T.meervoudsVormen: in het Engels en het Nederlands één en meer, in het Pools vier); #
//                         is het getal.
//   {g|man:he|vrouw:she}  een keuze: g is een woord, en de vorm met dat woord ervoor wint (* voor de rest).
//
// Een zin wordt vertaald als hij gevraagd wordt. In een tabel die bij het laden gevuld wordt (de naam van een gebouw),
// is dat bij het laden, dus de taal ligt vast voor het spel begint: een andere taal kiezen herlaadt de bladzijde
// (js/menu.js). Daarom staat dit bestand in de kop van index.html, met de talen direct erna (taal/*.js), vóór alle
// regels.
//
// Welke taal: ?taal=nl in het adres, anders wat de speler koos (de browser onthoudt het), anders de taal van de
// browser als die er is, anders Engels. De toetsen spelen in het Nederlands (test/laad.cjs zet T.TAAL_GEZET), zodat
// wat een toets van een tekst verwacht, gelijk bleef toen de teksten Engels werden.
//
// Een vertaling uit de community hoeft niet in taal/ te staan: de vertaaltool bewaart hem in de browser
// (T.EIGEN_TALEN_SLEUTEL), en dit bestand meldt hem hier aan, zodat hij in de lijst van het titelscherm staat.
(function (T) {
  'use strict';

  T.BRONTAAL = { code: 'en', naam: 'English', locale: 'en-GB', zinnen: {} };
  T.TALEN = T.TALEN || {};
  T.TALEN.en = T.BRONTAAL;

  const SLEUTEL = `${T.OPSLAG_SLEUTEL}.taal`;
  T.EIGEN_TALEN_SLEUTEL = `${T.OPSLAG_SLEUTEL}.talen.eigen`;
  // Wat de vertaaltool nog niet in taal/ schreef, per taal; alleen het spel dat de tool opent (?klad=1) leest het.
  T.KLAD_SLEUTEL = (code) => `${T.OPSLAG_SLEUTEL}.talen.klad.${code}`;
  // Een taalcode: twee of drie letters, eventueel met een streek erachter (pt-BR, zh-Hans).
  T.isTaalCode = (code) => typeof code === 'string' && /^[a-z]{2,3}(-[A-Za-z]{2,4})?$/.test(code);

  const opslag = () => {
    try {
      return typeof localStorage !== 'undefined' ? localStorage : null;
    } catch (e) {
      return null; // een browser die het niet toestaat
    }
  };
  const leesJson = (sleutel) => {
    try {
      const s = opslag();
      const tekst = s && s.getItem(sleutel);
      return tekst ? JSON.parse(tekst) : null;
    } catch (e) {
      return null;
    }
  };
  const adresVraag = (naam) =>
    typeof location !== 'undefined' && location.search ? new URLSearchParams(location.search).get(naam) : null;

  // Een taal aanmelden: zo begint elk bestand in taal/ (Spel.taal({ ... })). Een taal is gegevens, geen code: de
  // vertaaltool leest het bestand als JSON (T.leesTaalBestand), en schrijft het zo terug (T.schrijfTaalBestand).
  T.taal = function (def) {
    if (!def || !T.isTaalCode(def.code) || def.code === T.BRONTAAL.code) return;
    T.TALEN[def.code] = { code: def.code, naam: def.naam || def.code, locale: def.locale || def.code, zinnen: def.zinnen || {}, eigen: !!def.eigen };
  };

  // De talen uit de community, die de vertaaltool in de browser bewaarde. Een taal die ook in taal/ staat, gaat voor,
  // dus ze komen pas na de bestanden in taal/: bij de eerste zin (T.taalNu) of de lijst (T.talen).
  T.eigenTalen = () => leesJson(T.EIGEN_TALEN_SLEUTEL) || {};
  T.meldEigenTalenAan = function () {
    for (const def of Object.values(T.eigenTalen())) if (def && !T.TALEN[def.code]) T.taal({ ...def, eigen: true });
  };

  // ── Welke taal ──

  // Wat er gekozen is, of null.
  function voorkeur() {
    if (T.TAAL_GEZET) return T.TAAL_GEZET;
    const adres = adresVraag('taal');
    if (adres) return adres;
    const s = opslag();
    try {
      const gekozen = s && s.getItem(SLEUTEL);
      if (gekozen) return gekozen;
    } catch (e) {
      // geen opslag: dan de browser
    }
    return null;
  }

  // De taal waarin het spel nu speelt: een aangemelde taal, anders Engels. Eén keer bepaald, bij de eerste zin.
  let nu = null;
  T.taalNu = function () {
    if (nu) return nu;
    T.meldEigenTalenAan();
    const kies = voorkeur();
    const browser = typeof navigator !== 'undefined' && navigator.language ? navigator.language : null;
    const kandidaten = kies ? [kies] : browser ? [browser, browser.split('-')[0]] : [];
    nu = kandidaten.find((c) => T.TALEN[c]) || T.BRONTAAL.code;
    // De tool opent het spel met ?klad=1: wat er nog niet in taal/ staat, gaat over de taal heen.
    if (adresVraag('klad') && nu !== T.BRONTAAL.code) {
      const klad = leesJson(T.KLAD_SLEUTEL(nu));
      if (klad && klad.zinnen) T.TALEN[nu] = { ...T.TALEN[nu], zinnen: { ...T.TALEN[nu].zinnen, ...klad.zinnen } };
    }
    return nu;
  };
  T.taalLocale = () => T.TALEN[T.taalNu()].locale;

  // Een andere taal kiezen: de browser onthoudt hem, en de bladzijde herlaadt (zie boven).
  T.kiesTaal = function (code) {
    const s = opslag();
    try {
      if (s) s.setItem(SLEUTEL, code);
    } catch (e) {
      // niet te onthouden: dan alleen voor nu, met het adres
    }
    if (typeof location !== 'undefined') {
      const url = new URL(location.href);
      url.searchParams.delete('taal');
      if (!s) url.searchParams.set('taal', code);
      location.replace(url.toString());
    }
  };

  // Alle talen om uit te kiezen: Engels eerst, dan op naam.
  T.talen = function () {
    T.meldEigenTalenAan();
    const rest = Object.values(T.TALEN).filter((t) => t.code !== T.BRONTAAL.code);
    rest.sort((a, b) => a.naam.localeCompare(b.naam));
    return [T.BRONTAAL, ...rest];
  };

  // ── Een zin ──

  // De meervoudsvormen van een taal, in een vaste volgorde: zo schrijft een vertaler ze in {n|…|…}.
  const VORM_VOLGORDE = ['zero', 'one', 'two', 'few', 'many', 'other'];
  const regels = {};
  function pluralRules(locale) {
    if (!regels[locale]) {
      try {
        regels[locale] = new Intl.PluralRules(locale);
      } catch (e) {
        regels[locale] = new Intl.PluralRules('en');
      }
    }
    return regels[locale];
  }
  T.meervoudsVormen = (locale) => {
    const r = pluralRules(locale).resolvedOptions().pluralCategories;
    return VORM_VOLGORDE.filter((v) => r.includes(v));
  };

  // Splitst wat tussen { en } staat op de | op het bovenste niveau: "n|# man|{x} men" → ['n', '# man', '{x} men'].
  function splits(binnen) {
    const delen = [];
    let diep = 0;
    let begin = 0;
    for (let i = 0; i < binnen.length; i++) {
      const c = binnen[i];
      if (c === '{') diep++;
      else if (c === '}') diep--;
      else if (c === '|' && diep === 0) {
        delen.push(binnen.slice(begin, i));
        begin = i + 1;
      }
    }
    delen.push(binnen.slice(begin));
    return delen;
  }

  // Loopt de zin af, en geeft voor elk stuk tussen { en } (het bovenste niveau) wat erin staat aan `doe`.
  function vervangBlokken(tekst, doe) {
    let uit = '';
    let i = 0;
    while (i < tekst.length) {
      const open = tekst.indexOf('{', i);
      if (open < 0) break;
      let diep = 0;
      let dicht = -1;
      for (let j = open; j < tekst.length; j++) {
        if (tekst[j] === '{') diep++;
        else if (tekst[j] === '}' && --diep === 0) {
          dicht = j;
          break;
        }
      }
      if (dicht < 0) break; // een { zonder }: laten staan
      uit += tekst.slice(i, open) + doe(tekst.slice(open + 1, dicht));
      i = dicht + 1;
    }
    return uit + tekst.slice(i);
  }

  // Vult de woorden in een zin in, met het meervoud en de keuzes van de taal (locale).
  function vul(tekst, woorden, locale) {
    if (tekst.indexOf('{') < 0) return tekst;
    return vervangBlokken(tekst, (binnen) => {
      const delen = splits(binnen);
      const naam = delen[0].trim();
      const heeft = woorden && Object.prototype.hasOwnProperty.call(woorden, naam) && woorden[naam] != null;
      if (delen.length === 1) return heeft ? String(woorden[naam]) : `{${binnen}}`;
      if (!heeft) return `{${binnen}}`;
      const waarde = woorden[naam];
      const vormen = delen.slice(1);
      let vorm;
      if (typeof waarde === 'number') {
        const i = T.meervoudsVormen(locale).indexOf(pluralRules(locale).select(waarde));
        vorm = vormen[Math.min(i < 0 ? vormen.length - 1 : i, vormen.length - 1)];
        vorm = vorm.replace(/#/g, String(waarde));
      } else {
        const sleutel = (v) => v.slice(0, v.indexOf(':')).trim();
        const metSleutel = vormen.filter((v) => v.indexOf(':') > 0);
        const raak = metSleutel.find((v) => sleutel(v) === String(waarde)) || metSleutel.find((v) => sleutel(v) === '*');
        vorm = raak ? raak.slice(raak.indexOf(':') + 1) : vormen[vormen.length - 1];
      }
      return vul(vorm, woorden, locale);
    });
  }
  T.vulTekst = vul;

  // De zin in de taal van nu, met de woorden erin.
  T.t = function (bron, woorden) {
    const taal = T.TALEN[T.taalNu()];
    const zin = taal.zinnen[bron];
    return vul(zin != null && zin !== '' ? zin : bron, woorden, taal.locale);
  };

  // ── Voor de vertaaltool en de toetsen ──

  // De namen tussen { en } in een zin, ook in de vormen van een meervoud of een keuze (zonder dubbele).
  T.namenIn = function (tekst) {
    const namen = new Set();
    const loop = (t) =>
      vervangBlokken(t, (binnen) => {
        const delen = splits(binnen);
        namen.add(delen[0].trim());
        for (const v of delen.slice(1)) loop(v.indexOf(':') > 0 && !/^\s*#/.test(v) ? v.slice(v.indexOf(':') + 1) : v);
        return '';
      });
    loop(tekst);
    return namen;
  };
  const tagsIn = (tekst) => (tekst.match(/<\/?[a-z][a-z0-9]*/gi) || []).map((t) => t.toLowerCase()).sort();

  // Wat er mis is aan een vertaling, in het Engels, want de vertaaltool is voor vertalers van overal: andere {namen}
  // dan de bron, andere html, of een meervoud met een ander aantal vormen dan de taal heeft.
  T.keurVertaling = function (bron, vertaling, locale) {
    const fout = [];
    if (vertaling == null || vertaling === '') return fout;
    const a = T.namenIn(bron);
    const b = T.namenIn(vertaling);
    const mist = [...a].filter((n) => !b.has(n));
    const teVeel = [...b].filter((n) => !a.has(n));
    const lijst = (namen) => namen.map((n) => `{${n}}`).join(', ');
    if (mist.length) fout.push(`Put ${lijst(mist)} back in: the game fills ${mist.length === 1 ? 'it' : 'them'} in here.`);
    if (teVeel.length) {
      const een = teVeel.length === 1;
      fout.push(`${lijst(teVeel)} ${een ? 'is' : 'are'} not in the English sentence, so the game cannot fill ${een ? 'it' : 'them'} in.`);
    }
    if (tagsIn(bron).join() !== tagsIn(vertaling).join()) fout.push('Keep the same markup as the English sentence (the parts between < and >).');
    const aantal = T.meervoudsVormen(locale).length;
    vervangBlokken(vertaling, (binnen) => {
      const delen = splits(binnen);
      const vormen = delen.slice(1);
      if (vormen.length && !vormen.some((v) => v.indexOf(':') > 0 && !/^\s*#/.test(v)) && vormen.length !== aantal) {
        const vormenTaal = T.meervoudsVormen(locale).join(', ');
        fout.push(`{${delen[0].trim()}|…} has ${vormen.length} form${vormen.length === 1 ? '' : 's'}, but this language needs ${aantal}: ${vormenTaal}.`);
      }
      return '';
    });
    return fout;
  };

  // Een taalbestand is `Spel.taal(` + JSON + `);`, met commentaar erboven: zo laadt het als script, ook vanaf file://,
  // en leest de tool het als gegevens, zonder het uit te voeren (een bestand van een ander is dan nooit code).
  T.leesTaalBestand = function (tekst) {
    const m = /Spel\.taal\(\s*([\s\S]*?)\s*\)\s*;?\s*$/.exec(tekst);
    const def = JSON.parse(m ? m[1] : tekst);
    if (!def || !T.isTaalCode(def.code) || typeof def.zinnen !== 'object') throw new Error('not a language file');
    for (const [k, v] of Object.entries(def.zinnen)) {
      if (typeof k !== 'string' || typeof v !== 'string') throw new Error('a sentence is not text');
    }
    return { code: def.code, naam: String(def.naam || def.code), locale: String(def.locale || def.code), zinnen: def.zinnen };
  };
  T.schrijfTaalBestand = function (def) {
    const kop =
      `// ${def.naam} (${def.code}): de vertaling van de spelteksten (vraag 147). Per Engelse zin uit het spel wat hij in\n` +
      '// deze taal is. Gemaakt en bijgehouden met de vertaaltool (gereedschap/vertalen.html); zie js/taal.js.\n';
    const inhoud = { code: def.code, naam: def.naam, locale: def.locale, zinnen: def.zinnen };
    return `${kop}Spel.taal(${JSON.stringify(inhoud, null, 2)});\n`;
  };
})(globalThis.Spel = globalThis.Spel || {});
