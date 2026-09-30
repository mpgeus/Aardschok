// Het land (werklijst vraag 63 en 69; Marcel, 29 sep: "Denk in dagen. Het moet voelen meer als Lords of the Realm. Met
// een land met provincies"): een kaart met provincies, waarop de schout in dagen reist. Stap 1a, stuk 1: de kaart van
// het land en reizen. Loopt de schout over de weg zijn gehucht uit, dan opent de kaart (js/landkaart.js); kiest hij een
// provincie, dan gaan de dagen snel voorbij, zoals bij slapen, en is hij er. Een provincie zonder dorp is voor nu land
// om doorheen te reizen (vraag 63, D), zonder eigen kaart. Wat je nog niet zag, is donker.
//
// Wie reist, verlaat de kaart van het dorp niet: de schout gaat eruit (uit de wezens van de wereld), en het dorp blijft
// de wereld van het spel. Zo doen de heer, de inner, de marskramer en de rovers thuis hun werk zonder hem, want zij
// lopen in S.wereld. Of de schout weg is, vraag je aan T.schoutIsWeg (ook in een ander gebied); of hij op reis is of in
// een andere provincie, aan T.opReis. Wat er thuis gebeurt terwijl hij reist, hoort hij als hij terugkomt: de berichten
// (js/ui.js) en de brieven van de heer (js/brieven.js) wachten in S.land.
//
// Het land komt uit het zaad van het spel (S.lot.zaad): elk spel een ander land, en hetzelfde zaad geeft hetzelfde land.
// Tot het buurdorp er is (stuk 3), staat het achter de spelregel "Land" (standaard uit), en speelt de proef zoals nu.
// Regels zonder scherm; toetsen in test/land.test.cjs.
(function (T) {
  'use strict';

  // Alle getallen in één blok, zoals elders (CLAUDE.md); ze staan ook in de werkbank (js/opties.js). Een eerste
  // voorstel van Claude (30 sep; vraag 63: zo'n negen provincies, met één tot drie dagen reizen per stap).
  T.LAND_INSTELLINGEN = {
    aan: false,
    // Hoeveel provincies, en hoe groot de kaart is waarop ze liggen (in punten; de kaart op het scherm schaalt mee).
    provincies: 9,
    breed: 800,
    hoog: 560,
    // Hoeveel dagen reizen een weg is: naar zijn lengte, van zo kort tot zo lang.
    dagenMin: 1,
    dagenMax: 3,
    // Een grens korter dan dit (in punten) telt niet: wie elkaar met een punt raakt, heeft geen weg ertussen.
    grensMinstens: 24,
    // Hoe snel de tijd gaat als je reist (zoals slapen: T.SLAAP_SNELHEID).
    reisSnelheid: 60,
    // Zoveel berichten van thuis bewaart het, om te lezen als je terug bent.
    gemistHoogstens: 40,
  };
  const IN = () => T.LAND_INSTELLINGEN;

  // Wat voor land een provincie is: hoe hij heet, en wat je er ziet als je er bent (js/landkaart.js). Het gehucht heet
  // naar je dorp (T.dorpsnaam), de rest naar zijn soort.
  T.LANDSOORTEN = {
    gehucht: { naam: null, uitleg: 'Je eigen gehucht.' },
    kasteel: { naam: 'Het kasteel van de heer', uitleg: 'Hier woont de heer. Hij ontvangt geen schout die niet geroepen is.' },
    stad: { naam: 'De stad', uitleg: 'Hier komt de marskramer vandaan. De poort blijft dicht voor een schout zonder brief.' },
    woud: { naam: 'Het woud', uitleg: 'Bos, zover je kijkt.' },
    heide: { naam: 'De heide', uitleg: 'Heide en wind, en verder niemand.' },
    veen: { naam: 'Het veen', uitleg: 'Nat land. Wie hier van de weg raakt, vinden ze in het voorjaar terug.' },
    broek: { naam: 'Het broek', uitleg: 'Elzen en water, en muggen.' },
    zand: { naam: 'Het zand', uitleg: 'Stuifzand, waar niets wil groeien.' },
    kampen: { naam: 'De kampen', uitleg: 'Oude akkers, lang geleden verlaten. Niemand weet waarom.' },
  };
  // In deze volgorde krijgen de provincies na het gehucht hun soort: het kasteel en de stad altijd, dan de wildernis.
  const SOORTEN = ['kasteel', 'stad', 'woud', 'heide', 'veen', 'broek', 'zand', 'kampen'];

  const dagNu = (S) => (S.kalender ? S.kalender.dag : 0);
  const rond = (x) => Math.round(x * 10) / 10;
  const bericht = (tekst, soort) => T.ui && T.ui.bericht && T.ui.bericht(tekst, soort);

  // ---------------------------------------------------------------------------------------------
  // Het land maken
  // ---------------------------------------------------------------------------------------------

  // Een veelhoek houden waar a·x + b·y ≤ c.
  function knip(veelhoek, a, b, c) {
    const uit = [];
    for (let i = 0; i < veelhoek.length; i++) {
      const p = veelhoek[i];
      const q = veelhoek[(i + 1) % veelhoek.length];
      const fp = a * p[0] + b * p[1] - c;
      const fq = a * q[0] + b * q[1] - c;
      if (fp <= 0) uit.push(p);
      if ((fp <= 0) !== (fq <= 0)) {
        const t = fp / (fp - fq);
        uit.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]);
      }
    }
    return uit;
  }
  // De lijn midden tussen twee punten, als a·x + b·y = c: aan de kant van p is het kleiner.
  const tussen = (p, o) => [2 * (o.x - p.x), 2 * (o.y - p.y), o.x * o.x + o.y * o.y - p.x * p.x - p.y * p.y];

  // Het stuk land dat dichter bij p ligt dan bij elke andere plek (Voronoi), binnen de vorm van het land.
  function vlakVan(p, plekken, vorm) {
    let v = vorm;
    for (const o of plekken) if (o !== p) v = knip(v, ...tussen(p, o));
    return v;
  }

  // Hoe lang de grens is die het vlak van p deelt met o: de randen die op de lijn midden tussen hen liggen.
  function grensLengte(vlak, p, o) {
    const [a, b, c] = tussen(p, o);
    const norm = Math.hypot(a, b);
    const op = (q) => Math.abs(a * q[0] + b * q[1] - c) / norm < 0.5;
    let lengte = 0;
    for (let i = 0; i < vlak.length; i++) {
      const q = vlak[i];
      const r = vlak[(i + 1) % vlak.length];
      if (op(q) && op(r)) lengte += Math.hypot(r[0] - q[0], r[1] - q[1]);
    }
    return lengte;
  }

  // Het land zelf: een rechthoek met ronde hoeken (een superellips), zodat de kaart niet in een rechte lijn eindigt en er
  // in de hoeken toch land is (de rand golft op het scherm).
  function vormVan(dobbel, B, H) {
    const punten = [];
    const n = 16;
    const macht = 2 / 3.5;
    for (let i = 0; i < n; i++) {
      const hoek = (i / n) * Math.PI * 2;
      const c = Math.cos(hoek);
      const z = Math.sin(hoek);
      const f = 0.93 + dobbel() * 0.07;
      punten.push([B / 2 + Math.sign(c) * Math.abs(c) ** macht * (B / 2 - 16) * f, H / 2 + Math.sign(z) * Math.abs(z) ** macht * (H / 2 - 16) * f]);
    }
    return punten;
  }

  // Ligt punt p in veelhoek v?
  function binnenIn(v, p) {
    let binnen = false;
    for (let i = 0, j = v.length - 1; i < v.length; j = i++) {
      const [xi, yi] = v[i];
      const [xj, yj] = v[j];
      if ((yi > p.y) !== (yj > p.y) && p.x < ((xj - xi) * (p.y - yi)) / (yj - yi) + xi) binnen = !binnen;
    }
    return binnen;
  }

  // Een plek die buiten het land valt, of vlak aan de rand, schuift naar het midden tot hij er ruim binnen ligt: een
  // provincie ligt altijd om zijn eigen plek heen.
  function naarBinnen(p, vorm, B, H) {
    const krap = vorm.map(([x, y]) => [B / 2 + (x - B / 2) * 0.85, H / 2 + (y - H / 2) * 0.85]);
    for (let i = 0; i < 30 && !binnenIn(krap, p); i++) {
      p.x += (B / 2 - p.x) * 0.1;
      p.y += (H / 2 - p.y) * 0.1;
    }
    return p;
  }

  // Waar de provincies liggen: in een raster van zoveel vakken als er provincies zijn (drie bij drie voor negen), elk
  // ergens in het midden van zijn vak.
  function plekkenVan(dobbel, n, B, H) {
    const kol = Math.ceil(Math.sqrt(n));
    const rij = Math.ceil(n / kol);
    const vb = (B - 80) / kol;
    const vh = (H - 80) / rij;
    const uit = [];
    for (let j = 0; j < rij; j++) {
      for (let i = 0; i < kol && uit.length < n; i++) uit.push({ x: 40 + vb * (i + 0.2 + dobbel() * 0.6), y: 40 + vh * (j + 0.2 + dobbel() * 0.6) });
    }
    return uit;
  }

  // Het land van dit spel, uit zijn zaad: de provincies met hun vlak op de kaart, de wegen ertussen met hoeveel dagen
  // reizen, en waar de schout is. Het gehucht ligt niet in het midden: er ligt land aan één kant van je, en de rest
  // verder weg.
  T.nieuwLand = function (S) {
    const dobbel = T.dobbelsteen(((S.lot && S.lot.zaad) || 1) * 131 + 7);
    const B = IN().breed;
    const H = IN().hoog;
    const vorm = vormVan(dobbel, B, H);
    const plekken = plekkenVan(dobbel, IN().provincies, B, H).map((p) => naarBinnen(p, vorm, B, H));
    const vlakken = plekken.map((p) => vlakVan(p, plekken, vorm));
    const midden = plekken.reduce((m, p) => (Math.hypot(p.x - B / 2, p.y - H / 2) < Math.hypot(m.x - B / 2, m.y - H / 2) ? p : m));
    const kan = plekken.filter((p) => p !== midden);
    const thuis = kan[Math.floor(dobbel() * kan.length)];
    // De rest krijgt een soort, in een geloote volgorde: het kasteel en de stad eerst.
    const rest = plekken.filter((p) => p !== thuis);
    for (let i = rest.length - 1; i > 0; i--) {
      const j = Math.floor(dobbel() * (i + 1));
      [rest[i], rest[j]] = [rest[j], rest[i]];
    }
    const soortVan = new Map([[thuis, 'gehucht']]);
    rest.forEach((p, i) => soortVan.set(p, SOORTEN[i % SOORTEN.length]));
    const provincies = plekken.map((p, i) => ({
      id: `p${i}`,
      soort: soortVan.get(p),
      x: rond(p.x),
      y: rond(p.y),
      vlak: vlakken[i].map((q) => [rond(q[0]), rond(q[1])]),
    }));
    // De wegen: tussen provincies met een grens, langer eerst. Wie dan nog los ligt, krijgt de langste grens die hij
    // heeft, zodat je overal kunt komen.
    const paren = [];
    for (let i = 0; i < plekken.length; i++) {
      for (let j = i + 1; j < plekken.length; j++) {
        const lengte = grensLengte(vlakken[i], plekken[i], plekken[j]);
        if (lengte > 0) paren.push({ i, j, lengte });
      }
    }
    paren.sort((a, b) => b.lengte - a.lengte || a.i - b.i || a.j - b.j);
    const groep = plekken.map((_, i) => i);
    const hoofd = (i) => (groep[i] === i ? i : (groep[i] = hoofd(groep[i])));
    const gekozen = [];
    for (const p of paren) {
      if (p.lengte >= IN().grensMinstens) {
        gekozen.push(p);
        groep[hoofd(p.i)] = hoofd(p.j);
      }
    }
    for (const p of paren) {
      if (p.lengte < IN().grensMinstens && hoofd(p.i) !== hoofd(p.j)) {
        gekozen.push(p);
        groep[hoofd(p.i)] = hoofd(p.j);
      }
    }
    // Hoeveel dagen: naar de lengte van de weg, van de kortste (dagenMin) tot de langste (dagenMax).
    const lang = gekozen.map((p) => Math.hypot(plekken[p.i].x - plekken[p.j].x, plekken[p.i].y - plekken[p.j].y));
    const kort = Math.min(...lang);
    const langst = Math.max(...lang);
    const wegen = gekozen.map((p, k) => ({
      van: `p${p.i}`,
      naar: `p${p.j}`,
      dagen: IN().dagenMin + Math.round(((lang[k] - kort) / Math.max(1, langst - kort)) * (IN().dagenMax - IN().dagenMin)),
    }));
    wegen.sort((a, b) => a.van.localeCompare(b.van) || a.naar.localeCompare(b.naar));
    const thuisId = `p${plekken.indexOf(thuis)}`;
    return {
      breed: B,
      hoog: H,
      vorm: vorm.map((q) => [rond(q[0]), rond(q[1])]),
      provincies,
      wegen,
      thuis: thuisId, // waar je gehucht ligt
      waar: thuisId, // waar de schout is
      gezien: new Set([thuisId]), // wat je zag; de rest is donker
      reis: null, // { route, stap, vertrek, volgende, aankomst, snelheid } zolang je onderweg bent
      weg: null, // { vertrek, stand }: sinds wanneer je van huis bent, en hoe het dorp er toen voor stond
      gemist: [], // [{ dag, tekst, soort }]: wat er thuis gebeurde terwijl je weg was (js/ui.js)
      brieven: [], // de brieven van de heer die kwamen terwijl je weg was (js/brieven.js)
      terug: null, // { dagen, gemist, stand } zodra je thuiskomt, voor het venster (js/landkaart.js)
      netTerug: false, // stond de schout net op de weg het dorp uit, zonder te reizen? dan eerst eraf
    };
  };

  // ---------------------------------------------------------------------------------------------
  // Vragen over het land
  // ---------------------------------------------------------------------------------------------

  T.provincie = (L, id) => (L ? L.provincies.find((p) => p.id === id) || null : null);
  // Het gehucht heet naar je dorp; zonder naam (een proefje) is het "Je gehucht".
  T.provincieNaam = (S, p) => (p.soort === 'gehucht' ? T.dorpsnaam(S) || 'Je gehucht' : T.LANDSOORTEN[p.soort].naam);
  const wegTussen = (L, a, b) => L.wegen.find((w) => (w.van === a && w.naar === b) || (w.van === b && w.naar === a)) || null;
  T.wegTussen = wegTussen;
  T.buurProvincies = (L, id) => L.wegen.filter((w) => w.van === id || w.naar === id).map((w) => (w.van === id ? w.naar : w.van));

  // Is de schout op reis, of in een andere provincie dan zijn gehucht?
  T.opReis = (S) => !!(S.land && (S.land.reis || S.land.waar !== S.land.thuis));

  // Is de schout weg uit zijn dorp: op reis, in een andere provincie, of in een ander gebied (js/gebied.js)? Dan
  // beslist de raadsman (js/voorvallen.js), en roept niemand de militie bij hem (js/rovers.js).
  T.schoutIsWeg = function (S) {
    if (S.bewoners && S.bewoners.wereld && S.wereld !== S.bewoners.wereld) return true;
    return T.opReis(S);
  };

  // De kortste reis in dagen van waar je bent naar `naar`, over wegen die je kent: door provincies die je al zag, en de
  // laatste stap mag het donker in. Geeft { route: [id, ...] (zonder waar je bent), dagen } of null.
  T.reisNaar = function (S, naar) {
    const L = S.land;
    if (!L || !T.provincie(L, naar) || naar === L.waar) return null;
    const afstand = new Map([[L.waar, 0]]);
    const vorige = new Map();
    const open = new Set([L.waar]);
    const klaar = new Set();
    while (open.size) {
      let u = null;
      for (const x of open) if (u === null || afstand.get(x) < afstand.get(u)) u = x;
      open.delete(u);
      klaar.add(u);
      if (u === naar) break;
      // Verder dan een provincie die je niet zag, reis je niet: daar ken je de wegen nog niet.
      if (u !== L.waar && !L.gezien.has(u)) continue;
      for (const v of T.buurProvincies(L, u)) {
        if (klaar.has(v)) continue;
        const d = afstand.get(u) + wegTussen(L, u, v).dagen;
        if (!afstand.has(v) || d < afstand.get(v)) {
          afstand.set(v, d);
          vorige.set(v, u);
          open.add(v);
        }
      }
    }
    if (!afstand.has(naar)) return null;
    const route = [];
    for (let x = naar; x !== L.waar; x = vorige.get(x)) route.unshift(x);
    return { route, dagen: afstand.get(naar) };
  };

  // Hoe het dorp ervoor staat, om na een reis te zeggen wat er veranderde.
  const standVan = (S) => ({
    bevolking: S.bevolking || 0,
    graan: Math.floor((S.voorraad && S.voorraad.graan) || 0),
    hout: Math.floor((S.voorraad && S.voorraad.hout) || 0),
    goud: Math.floor((S.voorraad && S.voorraad.goud) || 0),
    doorRaadsman: (S.voorvallen && S.voorvallen.doorRaadsman) || 0,
  });

  // ---------------------------------------------------------------------------------------------
  // Reizen
  // ---------------------------------------------------------------------------------------------

  // De kaart van het land openen: de schout staat op de weg het dorp uit (T.werkLandBij), of je bent in een andere
  // provincie. Zolang je kijkt, staat de tijd stil.
  T.openLand = function (S) {
    S.modus = 'land';
    S.naLopen = null;
    T.houdTijdStil(S, 'land');
  };

  // Terug het gehucht in, zonder te reizen. Hij staat nog op de weg: daar moet hij eerst af, anders gaat de kaart
  // meteen weer open.
  T.sluitLand = function (S) {
    const L = S.land;
    if (!L || T.opReis(S)) return false;
    S.modus = 'verkennen';
    L.netTerug = true;
    T.laatTijdGaan(S, 'land');
    return true;
  };

  // Op reis naar `naar`: de schout gaat het dorp uit, en de dagen gaan snel voorbij tot hij er is.
  T.beginReis = function (S, naar) {
    const L = S.land;
    if (!L || L.reis) return { kan: false, reden: 'Je bent al onderweg.' };
    const r = T.reisNaar(S, naar);
    if (!r) return { kan: false, reden: naar === L.waar ? 'Daar ben je al.' : 'Daar weet je de weg nog niet.' };
    const dag = dagNu(S);
    L.reis = {
      route: r.route,
      stap: 0,
      vertrek: dag,
      volgende: dag + wegTussen(L, L.waar, r.route[0]).dagen,
      aankomst: dag + r.dagen,
      snelheid: S.kalender.snelheid || S.kalender.laatsteSnelheid || 1,
    };
    // Weg van huis: onthoud hoe het dorp ervoor stond, en haal de schout van de kaart van het dorp.
    if (L.waar === L.thuis) L.weg = { vertrek: dag, stand: standVan(S) };
    const w = S.wereld;
    const i = w ? w.wezens.indexOf(S.schout) : -1;
    if (i >= 0) w.wezens.splice(i, 1);
    const h = S.schout;
    h.pad = [];
    h.onderweg = false;
    S.naLopen = null;
    S.modus = 'land';
    T.laatTijdGaan(S, 'land');
    T.zetSnelheid(S, IN().reisSnelheid);
    return { kan: true, dagen: r.dagen };
  };

  // Een tegel naast de weg het dorp uit, zo dicht mogelijk bij het plein: daar komt de schout binnen.
  function binnenBijDeWeg(w) {
    const uit = T.wegInEnUit(w);
    if (!uit) return { x: Math.floor(w.b / 2), y: Math.floor(w.h / 2) };
    const doel = T.pleinVan(w) || { x: w.b / 2, y: w.h / 2 };
    let beste = null;
    for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      const x = uit.x + dx;
      const y = uit.y + dy;
      if (!T.isBegaanbaar(w, x, y, { wezensBlokkeren: true })) continue;
      const d = Math.hypot(x - doel.x, y - doel.y);
      if (!beste || d < beste.d) beste = { x, y, d };
    }
    return beste || uit;
  }

  // Thuis: de schout staat weer in zijn gehucht, net binnen de weg, en het venster zegt wat er gebeurde terwijl hij weg
  // was (js/landkaart.js).
  function komThuis(S, L) {
    const w = S.bewoners ? S.bewoners.wereld : S.wereld;
    const plek = binnenBijDeWeg(w);
    const h = S.schout;
    if (!w.wezens.includes(h)) w.wezens.push(h);
    h.x = h.tx = plek.x;
    h.y = h.ty = plek.y;
    h.pad = [];
    h.onderweg = false;
    S.modus = 'verkennen';
    T.laatTijdGaan(S, 'land');
    const weg = L.weg || { vertrek: dagNu(S), stand: standVan(S) };
    L.terug = { dagen: Math.max(1, Math.round(dagNu(S) - weg.vertrek)), gemist: L.gemist, van: weg.stand, nu: standVan(S) };
    L.gemist = [];
    L.weg = null;
    L.netTerug = false;
  }

  // Een stap verder op de reis: is de dag van de volgende provincie er, dan ben je daar. Aan het eind van de reis: thuis,
  // of op de kaart in een andere provincie, waar de tijd stilstaat tot je verder kiest.
  function reisVerder(S, L) {
    const R = L.reis;
    while (L.reis && dagNu(S) >= R.volgende) {
      const hier = R.route[R.stap];
      L.waar = hier;
      L.gezien.add(hier);
      R.stap++;
      if (R.stap < R.route.length) {
        R.volgende += wegTussen(L, hier, R.route[R.stap]).dagen;
        continue;
      }
      L.reis = null;
      if (S.kalender.snelheid === IN().reisSnelheid) T.zetSnelheid(S, R.snelheid);
      if (hier === L.thuis) komThuis(S, L);
      else T.houdTijdStil(S, 'land');
    }
  }

  // Elk beeld (js/main.js): op reis de volgende provincie; en loopt de schout over de weg zijn gehucht uit, dan opent
  // de kaart. Staat de spelregel uit, dan is er geen land, en komt wie weg was meteen thuis.
  T.werkLandBij = function (S) {
    if (!S.land && IN().aan && S.lot && S.bewoners && !S.proefje) S.land = T.nieuwLand(S);
    const L = S.land;
    if (!L || !S.kalender) return;
    if (!IN().aan) {
      if (T.opReis(S)) {
        L.reis = null;
        L.waar = L.thuis;
        komThuis(S, L);
      }
      return;
    }
    if (L.reis) return reisVerder(S, L);
    if (S.modus !== 'verkennen' || !S.bewoners || S.wereld !== S.bewoners.wereld) return;
    const h = S.schout;
    const uit = T.wegInEnUit(S.wereld);
    const opDeWeg = !!uit && h.tx === uit.x && h.ty === uit.y && !h.onderweg && !(h.pad && h.pad.length);
    if (!opDeWeg) {
      L.netTerug = false;
      return;
    }
    if (!L.netTerug) T.openLand(S);
  };

  // Wat er thuis gebeurde terwijl je weg was (js/ui.js): een bericht, bewaard tot je terug bent.
  T.bewaarVoorLater = function (S, tekst, soort) {
    const L = S.land;
    L.gemist.push({ dag: Math.floor(dagNu(S)), tekst, soort: soort || '' });
    if (L.gemist.length > IN().gemistHoogstens) L.gemist.shift();
  };

  // Een brief van de heer die kwam terwijl je weg was (js/brieven.js): hij wacht tot je thuis bent.
  T.briefVoorLater = function (S, soort) {
    if (!S.land.brieven.includes(soort)) S.land.brieven.push(soort);
  };

  // Na een reis: wat er veranderde, in woorden, voor het venster (js/landkaart.js).
  T.watVeranderde = function (terug) {
    const v = terug.van;
    const n = terug.nu;
    const regels = [];
    const verschil = (a, b) => (b - a > 0 ? `+${b - a}` : b - a < 0 ? `−${a - b}` : 'gelijk');
    regels.push(`${n.bevolking} mensen (${verschil(v.bevolking, n.bevolking)})`);
    for (const [ding, naam] of [['graan', 'graan'], ['hout', 'hout'], ['goud', 'goud']]) regels.push(`${n[ding]} ${naam} (${verschil(v[ding], n[ding])})`);
    const raad = n.doorRaadsman - v.doorRaadsman;
    if (raad > 0) regels.push(raad === 1 ? 'je raadsman besliste een voorval' : `je raadsman besliste ${raad} voorvallen`);
    return regels;
  };
})(globalThis.Spel = globalThis.Spel || {});
