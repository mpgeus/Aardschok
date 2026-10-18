// Tekenen met de videokaart (werklijst vraag 123; Marcel, 4 okt: "1 ja 2 voor de boeren"). Een eigen kleine laag op
// WebGL2, zonder bibliotheek, die zich voordoet als het 2D-doek: js/tekenen.js tekent er precies zo op als op het doek
// van de browser, in dezelfde volgorde, en hoeft niet te weten welke van de twee het is.
//
// Sinds 18 okt WebGL2 (vraag 178, B5 met B3 en E1; de renderproef, gereedschap/pixiproef/evaluatie.md): een plaatje is
// één instantie van PER_INST getallen, waar de kaart zelf de vier hoeken van maakt; wat klein is, staat op de lagen van
// één textuurstapel (TEXTURE_2D_ARRAY, de bladen); en een beeld gaat pas in G.klaar naar de kaart, in de volgorde van
// de opdrachten. Daardoor kan het masker van de zonneschaduw uit dezelfde plaatjes komen (schaduwHier, werptSchaduw):
// js/tekenen.js tekent de lijst niet meer een tweede keer. Zonder WebGL2 tekent het spel op het 2D-doek, zoals zonder
// videokaart.
//
// Sinds 18 okt ook vaste rijen met een dieptebuffer (vraag 178, B1 en B2; tekenVast, en js/tekenen.js, "de vaste rijen"):
// de bomen en het groen van een stuk land staan één keer op de kaart, en per beeld kiest de kaart zelf hun stand in de
// wind, of ze in de mist staan, hun schaduw en wat ervoor staat. Wat daarna in hetzelfde beeld komt, krijgt een diepte
// mee (Doek.diepte) en toetst daartegen.
//
// Wat de videokaart zelf kan, tekent ze: een plaatje uit een vel (drawImage), een vlak in één kleur (fillRect, en een
// vorm die bol is, zoals de schaduw onder een figuur of een ruitje van een raam), en een rond verloop (de nacht, het
// licht van een lantaarn, het vignet). Alle plaatjes van een beeld gaan in een paar opdrachten naar de kaart, en de
// samenstelmodi van de nacht en de ramen (source-atop, destination-out, destination-over) zijn mengstanden op de kaart.
//
// Al het andere (tekst, lijnen, een patroon, een uitsnede met clip, een filter dat geen helderheid is) gaat naar het
// kladdoek: een gewoon 2D-doek even groot als het scherm, met dezelfde stand (verplaatsing, zoom, doorzichtigheid).
// Komt er daarna weer iets wat de kaart zelf tekent, dan gaat eerst het stuk van het kladdoek waarop getekend werd als
// plaatje naar de kaart, op zijn plek. Zo klopt de volgorde altijd, ook voor wat nog niet op de kaart gezet is, en kan
// het snelle pad stukje bij beetje groeien. Wat er per beeld naar het kladdoek ging, zegt T.gl.telling.
//
// Een plaatje (Image) wordt één keer een textuur. Een doek (een buffer van js/tekenen.js) opnieuw als zijn `versie`
// veranderde; een doek zonder versie elke keer (dat zijn kleine, zoals het kijkgat van de doorkijk).
(function (T) {
  'use strict';

  const G = (T.gl = {});
  let doek = null; // het canvas van WebGL
  let gl = null;
  let kapot = false; // geen WebGL, of de kaart liet het los
  let geenKaart = false; // geen echte videokaart: zonder, tenzij ookOpDeProcessor later aangaat (de proeven)
  let ratio = 1;

  // ---------------------------------------------------------------- kleuren
  const kleurDoek = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null;
  const kleuren = new Map();
  // rgb(r, g, b) en rgba(r, g, b, a) met gewone getallen: die lezen we zelf. Het water en de rook maken er elk beeld
  // honderden met een eigen doorzichtigheid, en het 2D-doek ernaar vragen kost (vooral in Firefox).
  const RGBA = /^rgba?\(\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*,\s*(\d+(?:\.\d+)?)\s*(?:,\s*(\d*\.?\d+)\s*)?\)$/;
  const tot1 = (v) => Math.min(1, v);
  // Een css-kleur als [r, g, b, a], 0..1, niet voorvermenigvuldigd.
  function leesKleur(k) {
    let c = kleuren.get(k);
    if (c) return c;
    const m = RGBA.exec(k);
    if (m) c = [tot1(m[1] / 255), tot1(m[2] / 255), tot1(m[3] / 255), m[4] === undefined ? 1 : tot1(+m[4])];
    else {
      kleurDoek.fillStyle = '#000';
      kleurDoek.fillStyle = k;
      const s = kleurDoek.fillStyle; // #rrggbb of rgba(r, g, b, a)
      if (s[0] === '#') c = [parseInt(s.slice(1, 3), 16) / 255, parseInt(s.slice(3, 5), 16) / 255, parseInt(s.slice(5, 7), 16) / 255, 1];
      else {
        const d = s.slice(s.indexOf('(') + 1, -1).split(',').map(Number);
        c = [d[0] / 255, d[1] / 255, d[2] / 255, d.length > 3 ? d[3] : 1];
      }
    }
    if (kleuren.size > 2000) kleuren.clear();
    kleuren.set(k, c);
    return c;
  }
  // Een css-filter als { helder, grijs }: wat de kaart ervan kent (grayscale en brightness, samen in die volgorde), of
  // helder null als alleen het kladdoek het kan. Per tekst één keer gelezen.
  const filters = new Map();
  function filterVan(f) {
    let r = filters.get(f);
    if (r) return r;
    const h = /^(?:grayscale\(([\d.]+)\))?\s*(?:brightness\(([\d.]+)\))?$/.exec(f);
    const kent = f === 'none' || (h && (h[1] || h[2]));
    r = { helder: !kent ? null : h && h[2] ? Number(h[2]) : 1, grijs: kent && h && h[1] ? Number(h[1]) : 0 };
    if (filters.size > 100) filters.clear();
    filters.set(f, r);
    return r;
  }

  // ---------------------------------------------------------------- de programma's
  const VERT = /* // geen tekst */ `
    attribute vec2 aPlek; attribute vec2 aUv; attribute vec4 aKleur; attribute float aGrijs; attribute float aBron;
    uniform vec2 uMaat; uniform float uZ; varying vec2 vUv; varying vec4 vKleur; varying vec2 vPlek; varying float vGrijs; varying float vBron;
    void main() {
      vUv = aUv; vKleur = aKleur; vPlek = aPlek; vGrijs = aGrijs; vBron = aBron;
      gl_Position = vec4(aPlek.x / uMaat.x * 2.0 - 1.0, 1.0 - aPlek.y / uMaat.y * 2.0, uZ, 1.0);
    }`;
  // Een rij tekent uit zoveel texturen tegelijk (zie de rij hieronder), elk op zijn eigen plaats: vBron zegt welke. WebGL
  // 1 heeft er minstens acht, en kan een rij samplers niet met een variabele aanwijzen, dus kiest een keten van ifs.
  const RIJ_TEXTUREN = 8;
  const uBeelden = Array.from({ length: RIJ_TEXTUREN }, (_, i) => `uBeeld${i}`);
  // Een plaatje maal een kleur (voorvermenigvuldigd): helderheid en doorzichtigheid in één. Een vlak is het witte
  // plaatje van één pixel maal zijn kleur. vGrijs haalt er zoveel kleur uit (het filter grayscale, voor wat in de mist
  // staat; js/mist.js), met de helderheid van 'saturation' op het doek.
  // Een vBron onder nul is een laag van de textuurstapel (-1 is laag 0; uAtlas, de bladen), die geen plaats in de rij
  // kost. uMasker: alleen hoe dicht (voor het masker van de schaduwen). uHard (de vaste rijen, die de diepte schrijven):
  // een pixel is dicht of er is niets.
  const FRAG_BEELD = /* // geen tekst */ `#version 300 es
    precision highp float; precision highp sampler2DArray;
    in vec2 vUv; in vec4 vKleur; in float vGrijs; flat in float vBron;
    uniform sampler2DArray uAtlas; uniform float uMasker; uniform float uHard;
    ${/* // geen tekst */ uBeelden.map((u) => `uniform sampler2D ${u};`).join(' ')}
    out vec4 kleur;
    vec4 beeld() {
      if (vBron < -0.5) return texture(uAtlas, vec3(vUv, -vBron - 1.0));
      ${/* // geen tekst */ uBeelden.map((u, i) => (i < RIJ_TEXTUREN - 1 ? `if (vBron < ${i}.5) return texture(${u}, vUv);` : `return texture(${u}, vUv);`)).join('\n      ')}
    }
    void main() {
      vec4 c = beeld() * vKleur;
      if (uHard > 0.5 && c.a < 0.5) discard;
      if (uMasker > 0.5) { kleur = vec4(0.0, 0.0, 0.0, c.a); return; }
      kleur = vec4(mix(c.rgb, vec3(dot(c.rgb, vec3(0.3, 0.59, 0.11))), vGrijs), c.a);
    }`;
  // De hoeken van een vorm (een vlak, een waaier, een plaatje binnen vierhoeken), zoals VERT maar in de taal van FRAG_BEELD,
  // met hun diepte (aDiepte, Doek.diepte).
  const VERT_BEELD = /* // geen tekst */ `#version 300 es
    in vec2 aPlek; in vec2 aUv; in vec4 aKleur; in float aGrijs; in float aBron; in float aDiepte;
    uniform vec2 uMaat; out vec2 vUv; out vec4 vKleur; out float vGrijs; flat out float vBron;
    void main() {
      vUv = aUv; vKleur = aKleur; vGrijs = aGrijs; vBron = aBron;
      gl_Position = vec4(aPlek.x / uMaat.x * 2.0 - 1.0, 1.0 - aPlek.y / uMaat.y * 2.0, aDiepte, 1.0);
    }`;
  // Een plaatje als één instantie (zetInst, hieronder): zijn vier hoeken op het doek (linksboven, rechtsboven,
  // linksonder, rechtsonder; de stand van het doek zit er al in), de plek op de textuur, een kleur, en iX: de plaats van
  // de textuur (bron), een vlag (1: werpt een schaduw, 2: een driehoek, een vorm van fill, waarvan de vierde hoek op de
  // derde valt), r (de hoogte gedeeld door de breedte) en grijs. De hoeken rekent JavaScript uit, zoals tot 18 okt per
  // hoek: in de shader opgeteld rondt het net anders af, en op 50% valt elke pixel op de grens van twee texels (17 okt
  // gemeten: 0,3% van de pixels anders). Met uZon.x het masker van de schaduwen (vraag 125, B; schaduwHier): wie een
  // schaduw werpt, scheef over de grond vanaf zijn onderrand, uZon.y en uZon.z per pixel hoogte in de vlakte van het
  // plaatje, zoals tot 18 okt drawImage tussen beginSchaduw en eindSchaduw; de rest valt buiten beeld. iD is de diepte
  // (Doek.diepte).
  const VERT_INST = /* // geen tekst */ `#version 300 es
    in vec4 iP01; in vec4 iP23; in vec4 iUV; in vec4 iK; in vec4 iX; in float iD;
    uniform vec2 uMaat; uniform vec3 uZon;
    out vec2 vUv; out vec4 vKleur; out float vGrijs; flat out float vBron;
    void main() {
      int h = gl_VertexID;
      if (iX.y > 1.5 && h == 3) h = 2;
      vec2 c = vec2(float(h & 1), float(h >> 1));
      vec2 p = h == 0 ? iP01.xy : h == 1 ? iP01.zw : h == 2 ? iP23.xy : iP23.zw;
      if (uZon.x > 0.5) {
        if (iX.y < 0.5 || iX.y > 1.5) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); vUv = vec2(0.0); vKleur = vec4(0.0); vGrijs = 0.0; vBron = 0.0; return; }
        vec2 a = iP01.zw - iP01.xy;
        vec2 b = iP23.xy - iP01.xy;
        p = iP23.xy + c.x * a + (1.0 - c.y) * (uZon.y * iX.z * a + uZon.z * b);
      }
      gl_Position = vec4(p.x / uMaat.x * 2.0 - 1.0, 1.0 - p.y / uMaat.y * 2.0, iD, 1.0);
      vUv = mix(iUV.xy, iUV.zw, c);
      vKleur = iK;
      vGrijs = iX.w;
      vBron = iX.x;
    }`;
  // Een boom van een vaste rij (vraag 178, B1 en B2; tekenVast, hieronder): iA zijn anker (in pixels van de vlakte, vanaf
  // het stuk: uStuk is waar dat op het doek ligt, uZoom de vergroting) en zijn tegel in het stuk, iB het nummer van zijn
  // tekening en zijn fase in de wind. De kaart kiest zelf zijn stand (uWind: de stand per fase, die js/tekenen.js elk
  // beeld zet), en daarmee zijn plek op de stapel en zijn anker (uTabel: per tekening per stand u0, v0, u1, v1 en laag,
  // ax, ay); en uit uStand (per tegel, vanaf uTegel) of hij in het zwart staat (dan niet; ook wie er nu door de lijst
  // gaat, de doorkijk), in het grijs (uGrijs: hoeveel kleur eruit en hoe helder) of helder. De diepte is de sleutel van
  // het sorteren in js/tekenen.js: de som x + y vanaf uDiepte.x, met een stapje (uDiepte.z) per rij van een stuk en
  // T.STUK rijen per stuk (uDiepte.w is het hoeveelste stuk), naar het doek met uDiepte.y. Met uZon het masker van de
  // schaduwen, zoals VERT_INST.
  const VERT_VAST = /* // geen tekst */ `#version 300 es
    in vec4 iA; in vec4 iB;
    uniform vec2 uMaat; uniform vec3 uZon; uniform vec2 uZoom; uniform vec2 uStuk; uniform ivec2 uTegel; uniform vec4 uDiepte;
    uniform vec2 uGrijs; uniform float uLaag; uniform vec4 uWind[25];
    uniform highp sampler2D uTabel; uniform highp sampler2D uStand;
    out vec2 vUv; out vec4 vKleur; out float vGrijs; flat out float vBron;
    void main() {
      ivec2 t = ivec2(iA.zw) + uTegel;
      ivec2 m = textureSize(uStand, 0);
      float st = t.x >= 0 && t.y >= 0 && t.x < m.x && t.y < m.y ? texelFetch(uStand, t, 0).r : 0.0;
      if (st < 0.25) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); vUv = vec2(0.0); vKleur = vec4(0.0); vGrijs = 0.0; vBron = 0.0; return; }
      int k = int(iB.y);
      int n = (int(iB.x) * 5 + int(uWind[k >> 2][k & 3])) * 2;
      int b = textureSize(uTabel, 0).x;
      vec4 uv = texelFetch(uTabel, ivec2(n % b, n / b), 0);
      vec4 info = texelFetch(uTabel, ivec2((n + 1) % b, (n + 1) / b), 0);
      vec2 maat = (uv.zw - uv.xy) * uLaag;
      vec2 lb = iA.xy - info.yz;
      vec2 c = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1));
      vec2 p;
      if (uZon.x > 0.5) {
        vec2 a = vec2(uZoom.x * maat.x, 0.0);
        vec2 z = vec2(0.0, uZoom.y * maat.y);
        p = uStuk + uZoom * vec2(lb.x, lb.y + maat.y) + c.x * a + (1.0 - c.y) * (uZon.y * (maat.y / maat.x) * a + uZon.z * z);
      } else p = uStuk + uZoom * (lb + c * maat);
      float d = iA.z + iA.w + uDiepte.x + (uDiepte.w * 64.0 + iA.w) * uDiepte.z;
      gl_Position = vec4(p.x / uMaat.x * 2.0 - 1.0, 1.0 - p.y / uMaat.y * 2.0, clamp(1.0 - d * uDiepte.y, -0.999999, 0.999999), 1.0);
      vUv = mix(uv.xy, uv.zw, c);
      float h = st < 0.75 ? uGrijs.y : 1.0;
      vKleur = vec4(h, h, h, 1.0);
      vGrijs = st < 0.75 ? uGrijs.x : 0.0;
      vBron = -1.0 - info.x;
    }`;
  // Een stukje grond van een vaste rij (de renderproef van de grond, stap 1 tot 3: ontwerp/snelheid.md; tekenGrond,
  // hieronder, en js/tekenen.js, "de grond op de kaart"): iA waar zijn tekening links boven begint (in pixels van de
  // vlakte, vanaf het stuk: uStuk is waar dat op het doek ligt, uZoom de vergroting) en waar ze in haar bron staat, iB
  // haar maat, de bron en de soort. Soort 0 is een vel van de grond (de bron is zijn plaats in de rij: uBeeld0,
  // uBeeld1, ...; uVel de maten van de vellen), 1 een plaatje op de stapel (de bron is de laag van uAtlas, uLaag zijn
  // maat), en 2 de sneeuw op een tegel: iA.zw zijn a en f, en hoeveel er ligt is clamp(uSneeuwL + a, 0, 1) maal f (de som
  // van sneeuwDek in js/tekenen.js, met uSneeuwL de laag maal 1,15), in uSneeuwN standen (hooguit 16), elk een tegel op de
  // stapel (uSneeuw: x, y en laag). Zonder diepte, in de volgorde van de rij: rij na rij, zoals op het doek van de oude grond.
  const VERT_GROND = /* // geen tekst */ `#version 300 es
    in vec4 iA; in vec4 iB;
    uniform vec2 uMaat; uniform vec2 uZoom; uniform vec2 uStuk; uniform vec2 uVel[${RIJ_TEXTUREN}]; uniform float uLaag;
    uniform float uSneeuwL; uniform float uSneeuwN; uniform vec4 uSneeuw[17];
    out vec2 vUv; out vec4 vKleur; out float vGrijs; flat out float vBron;
    void main() {
      vec2 c = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1));
      vec2 bron = iA.zw;
      float b = iB.z;
      float soort = iB.w;
      vKleur = vec4(1.0);
      vGrijs = 0.0;
      if (soort > 1.5) {
        int stap = int(floor(clamp(uSneeuwL + iA.z, 0.0, 1.0) * iA.w * uSneeuwN + 0.5));
        if (stap <= 0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); vUv = vec2(0.0); vBron = 0.0; return; }
        bron = uSneeuw[stap].xy;
        b = uSneeuw[stap].z;
        soort = 1.0;
      }
      vec2 p = uStuk + uZoom * (iA.xy + c * iB.xy);
      gl_Position = vec4(p.x / uMaat.x * 2.0 - 1.0, 1.0 - p.y / uMaat.y * 2.0, 0.0, 1.0);
      if (soort > 0.5) {
        vUv = (bron + c * iB.xy) / uLaag;
        vBron = -1.0 - b;
      } else {
        vUv = (bron + c * iB.xy) / uVel[int(b)];
        vBron = b;
      }
    }`;
  // Een rond verloop zoals createRadialGradient met één middelpunt: tot vier stops, lineair ertussen.
  const FRAG_VERLOOP = /* // geen tekst */ `
    precision highp float; varying vec2 vPlek; varying vec4 vKleur;
    uniform vec2 uMidden; uniform float uR0; uniform float uR1; uniform int uN;
    uniform float uStop[4]; uniform vec4 uKleur[4];
    void main() {
      float t = clamp((distance(vPlek, uMidden) - uR0) / max(uR1 - uR0, 0.0001), 0.0, 1.0);
      vec4 k = uKleur[0];
      for (int i = 1; i < 4; i++) {
        if (i >= uN) break;
        float a = uStop[i - 1]; float b = uStop[i];
        if (t > a) k = mix(uKleur[i - 1], uKleur[i], clamp((t - a) / max(b - a, 0.0001), 0.0, 1.0));
      }
      k.rgb *= k.a;
      gl_FragColor = k * vKleur.a;
    }`;
  // De lichtkaart (werklijst vraag 125, A). Een plas licht: een ellips (aUv van -1 tot 1), in het midden zijn kleur,
  // zacht naar de rand. Op de lichtkaart worden ze opgeteld, op de helft van hun waarde (zie FRAG_MAAL).
  const FRAG_PLAS = /* // geen tekst */ `
    precision highp float; varying vec2 vUv; varying vec4 vKleur;
    void main() {
      float t = 1.0 - min(dot(vUv, vUv), 1.0);
      gl_FragColor = vec4(vKleur.rgb * t * t, 0.0);
    }`;
  // De wereld maal de lichtkaart. De lichtkaart staat op de helft (0,5 is "zoals de kunst is"), en de mengstand telt
  // het product twee keer (DST_COLOR, SRC_COLOR), zodat een lamp een muur tot twee keer zo licht kan maken. De
  // doorzichtigheid blijft: een gat voor een brandend raam blijft een gat, zoals met 'source-atop' (js/tekenen.js).
  const FRAG_MAAL = /* // geen tekst */ `
    precision highp float; uniform sampler2D uLicht; uniform vec2 uDoek;
    void main() { gl_FragColor = vec4(texture2D(uLicht, gl_FragCoord.xy / uDoek).rgb, 0.0); }`;
  // De schaduwen van de zon (vraag 125, B): het masker met alle silhouetten, als één vlak over de grond, in de kleur
  // van de schaduw.
  const FRAG_SCHADUW = /* // geen tekst */ `
    precision highp float; uniform sampler2D uMasker; uniform vec2 uDoek; uniform vec4 uKleur;
    void main() { gl_FragColor = uKleur * texture2D(uMasker, gl_FragCoord.xy / uDoek).a; }`;

  // De mist over de grond (js/tekenen.js, tekenMist; B2c): de wereld zoals hij tot nu toe getekend is (een kopie,
  // uWereld), ontkleurd en donkerder naar de mist op het scherm (uScherm: rood hoeveel kleur eruit gaat, groen hoeveel
  // donkerder, naar uZwart; het net hieronder legt hem daar). Tot vraag 174, stap b4 rekende dit een pixel van het doek
  // zelf terug naar een pixel van het masker, plat, en lag de mist op een heuvel tot twintig tegels naast zijn grond.
  const FRAG_MIST = /* // geen tekst */ `
    precision highp float; uniform sampler2D uWereld; uniform sampler2D uScherm; uniform vec2 uDoek; uniform vec3 uZwart;
    void main() {
      vec4 c = texture2D(uWereld, gl_FragCoord.xy / uDoek);
      vec4 m = texture2D(uScherm, gl_FragCoord.xy / uDoek);
      c.rgb = mix(c.rgb, vec3(dot(c.rgb, vec3(0.3, 0.59, 0.11))), m.r);
      c.rgb = mix(c.rgb, uZwart * c.a, m.g);
      gl_FragColor = c;
    }`;
  // Het net van de mist (vraag 174, stap b4; Marcel: "M2"): per stuk van het land een punt op het midden van elke tegel,
  // op zijn hoogte (aPlek, in pixels van de wereld; uStandX en uStandY zijn de stand van het doek), met de tegel zelf
  // (aUv), en daartussen het masker: uMasker.x bij uMasker.y pixels vanaf tegel uOorsprong, rood hoeveel kleur eruit
  // gaat, groen hoeveel donkerder (mistWerk; tot 18 okt twee helften naast elkaar). Buiten het masker niets.
  const VERT_NET = /* // geen tekst */ `
    attribute vec2 aPlek; attribute vec2 aUv;
    uniform vec2 uMaat; uniform vec3 uStandX; uniform vec3 uStandY; uniform vec2 uOorsprong; varying vec2 vMasker;
    void main() {
      vec3 p = vec3(aPlek, 1.0);
      vMasker = aUv - uOorsprong + 0.5;
      gl_Position = vec4(dot(uStandX, p) / uMaat.x * 2.0 - 1.0, 1.0 - dot(uStandY, p) / uMaat.y * 2.0, 0.0, 1.0);
    }`;
  const FRAG_NET = /* // geen tekst */ `
    precision highp float; uniform sampler2D uMist; uniform vec4 uMasker; varying vec2 vMasker;
    void main() {
      float u = vMasker.x;
      float v = vMasker.y;
      if (u < 0.0 || v < 0.0 || u > uMasker.x || v > uMasker.y) discard;
      vec4 m = texture2D(uMist, vec2(u / uMasker.x, v / uMasker.y));
      gl_FragColor = vec4(m.r, m.g, 0.0, 1.0);
    }`;

  // Het masker van de mist zelf (vraag 178; js/tekenen.js, mistOpDeKaart): wat je kent (uBasis, per tegel rood en groen),
  // en daar in een zachte kring om elke kijker (uKijkers: het midden en de twee stralen, uN stuks) uit weg, zoals tot 18
  // okt een verloop per kijker met destination-out op een 2D-doek: binnen de kleine straal alles, buiten de grote niets.
  const VERT_VLAK = /* // geen tekst */ `#version 300 es
    void main() { vec2 c = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1)); gl_Position = vec4(c * 2.0 - 1.0, 0.0, 1.0); }`;
  const FRAG_MISTWERK = /* // geen tekst */ `#version 300 es
    precision highp float;
    uniform sampler2D uBasis; uniform highp sampler2D uKijkers; uniform int uN;
    out vec4 kleur;
    void main() {
      vec4 c = texelFetch(uBasis, ivec2(gl_FragCoord.xy), 0);
      float f = 1.0;
      for (int i = 0; i < uN; i++) {
        vec4 k = texelFetch(uKijkers, ivec2(i, 0), 0);
        f *= clamp((distance(gl_FragCoord.xy, k.xy) - k.z) / max(k.w - k.z, 0.0001), 0.0, 1.0);
      }
      kleur = c * f;
    }`;

  function maakProgramma(vert, frag) {
    const p = gl.createProgram();
    for (const [soort, bron] of [[gl.VERTEX_SHADER, vert], [gl.FRAGMENT_SHADER, frag]]) {
      const s = gl.createShader(soort);
      gl.shaderSource(s, bron);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('WebGL: ' + gl.getShaderInfoLog(s)); // geen tekst
      gl.attachShader(p, s);
    }
    gl.bindAttribLocation(p, 0, 'aPlek');
    gl.bindAttribLocation(p, 1, 'aUv');
    gl.bindAttribLocation(p, 2, 'aKleur');
    gl.bindAttribLocation(p, 3, 'aGrijs');
    gl.bindAttribLocation(p, 4, 'aBron');
    gl.bindAttribLocation(p, 5, 'iP01');
    gl.bindAttribLocation(p, 6, 'iP23');
    gl.bindAttribLocation(p, 7, 'iUV');
    gl.bindAttribLocation(p, 8, 'iK');
    gl.bindAttribLocation(p, 9, 'iX');
    gl.bindAttribLocation(p, 10, 'iD');
    gl.bindAttribLocation(p, 11, 'iA');
    gl.bindAttribLocation(p, 12, 'iB');
    gl.bindAttribLocation(p, 13, 'aDiepte');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('WebGL: ' + gl.getProgramInfoLog(p)); // geen tekst
    const u = {};
    const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) {
      const naam = gl.getActiveUniform(p, i).name.replace(/\[0\]$/, '');
      u[naam] = gl.getUniformLocation(p, naam);
    }
    return { p, u };
  }

  let beeldProg = null;
  let verloopProg = null;
  let plasProg = null;
  let maalProg = null;
  let schaduwProg = null;
  let mistProg = null;
  let netProg = null;
  let mistWerkProg = null;
  let instProg = null;
  let vastProg = null;
  let grondProg = null;
  let wit = null; // een textuur van één witte pixel, voor vlakken
  let maxTextuur = 4096;
  const PER_HOEK = 11; // x, y, u, v, r, g, b, a, grijs, bron (de plaats van zijn textuur in de rij), diepte
  let grijsNu = 0; // hoeveel kleur eruit gaat (het filter grayscale van het doek); elke nieuwe hoek krijgt het mee
  let bronNu = 0; // de plaats van de textuur van de hoeken die nu in de rij komen (plekVoor)
  // Een vorm heeft vier hoeken (a, b, c, d: linksboven, rechtsboven, linksonder, rechtsonder), en een vaste lijst
  // nummers (INDEX, één keer naar de kaart) maakt er twee driehoeken van: a b c en b d c. Een losse driehoek (een vorm,
  // fill) krijgt een vierde hoek gelijk aan zijn derde: de tweede driehoek is dan een streep en tekent niets. Met nummers
  // van 16 bits gaan er hooguit MAX_HOEKEN hoeken in één opdracht. Sinds 18 okt gaat alleen een plaatje binnen
  // vierhoeken (tekenUitgeknipt) nog zo; een plaatje (drawImage), een vlak en een driehoek van een vorm zijn elk één
  // instantie van PER_INST getallen (VERT_INST), zodat ze in dezelfde rij passen.
  const MAX_HOEKEN = 65536;
  let hoeken = new Float32Array(PER_HOEK * 4 * 4096); // de hoeken van dit beeld, rij na rij
  let hoekAantal = 0;
  const PER_INST = 21; // vier hoeken (8), u0, v0, u1, v1, kleur (4), bron, vlag, r, grijs, diepte (VERT_INST)
  const WERPT = 1; // de vlag van een instantie
  const DRIEHOEK = 2;
  let inst = new Float32Array(PER_INST * 8192); // de plaatjes van dit beeld, rij na rij
  let instAantal = 0;
  let index = null; // de buffer met de nummers op de kaart (start)
  // Een beeld is een lijst opdrachten (G.klaar tekent ze): een rij hoeken, een rij plaatjes, of iets dat zelf tekent
  // (doe: een verloop, de mist, het licht, de schaduw over de grond). Een rij gaat naar de kaart in één opdracht.
  const HOEKEN = 0;
  const PLAATJES = 1;
  const DOE = 2;
  const VAST = 3; // de vaste rijen van een beeld (tekenVast)
  const GROND = 4; // de vaste rijen van de grond (tekenGrond)
  const opdrachten = [];
  const rij = []; // de texturen van de rij die nu groeit, op hun plaats (hooguit RIJ_TEXTUREN; de stapel telt niet mee)
  let rijMeng = 'source-over';
  let rijSoort = HOEKEN;
  let rijStart = 0;
  let aantal = 0; // hoeken of plaatjes in de rij die nu groeit
  let rijWerpt = false; // er staat een plaatje in dat een schaduw werpt
  let rijDiep = false; // de rij toetst tegen de diepte (Doek.diepte)
  let diepteNu = null; // de diepte op het doek (-1 tot 1) van wat nu getekend wordt, of null (Doek.diepte)
  let diepteBasis = null; // { d0, schaal }: van de sleutel van js/tekenen.js naar de diepte op het doek (tekenVast)
  let schaduwOp = null; // { sx, sy } na schaduwHier: wie daarna een schaduw werpt, komt op het masker
  let beeldNr = 0;
  let gewist = false; // het doek van dit beeld is al leeg gemaakt (G.klaar kan in een beeld vaker, getImageData)
  const opruimen = []; // texturen die na dit beeld weg mogen (textuurVan)
  let buffer = null; // voor wat zijn hoeken zelf stuurt (een verloop, een vlak over het doek)
  let hoekBuffer = null; // de hoeken van dit beeld
  let instBuffer = null; // de plaatjes van dit beeld
  const ATLAS_PLAATS = 8; // de plaats van de textuurstapel (de rij gebruikt 0 tot RIJ_TEXTUREN)

  // Hoe een samenstelmodus van het 2D-doek op de kaart mengt (voorvermenigvuldigde kleuren).
  const MENG = {
    'source-over': (g) => g.blendFuncSeparate(g.ONE, g.ONE_MINUS_SRC_ALPHA, g.ONE, g.ONE_MINUS_SRC_ALPHA),
    'source-atop': (g) => g.blendFuncSeparate(g.DST_ALPHA, g.ONE_MINUS_SRC_ALPHA, g.ZERO, g.ONE),
    'destination-over': (g) => g.blendFuncSeparate(g.ONE_MINUS_DST_ALPHA, g.ONE, g.ONE_MINUS_DST_ALPHA, g.ONE),
    'destination-out': (g) => g.blendFuncSeparate(g.ZERO, g.ONE_MINUS_SRC_ALPHA, g.ZERO, g.ONE_MINUS_SRC_ALPHA),
    'destination-in': (g) => g.blendFuncSeparate(g.ZERO, g.SRC_ALPHA, g.ZERO, g.SRC_ALPHA),
    lighter: (g) => g.blendFuncSeparate(g.ONE, g.ONE, g.ONE, g.ONE),
    wis: (g) => g.blendFuncSeparate(g.ZERO, g.ZERO, g.ZERO, g.ZERO),
  };

  function start() {
    if (kapot) return false;
    if (gl) return true;
    if (typeof document === 'undefined') return false;
    if (geenKaart && !T.TEKENEN_INSTELLINGEN.ookOpDeProcessor) return false;
    doek = document.createElement('canvas');
    doek.id = 'scherm-gl';
    // Zonder echte videokaart tekent WebGL op de processor (SwiftShader), en dat is vele malen trager dan het 2D-doek:
    // dan liever zonder. Alleen de proeven hier (zonder videokaart) zetten `ookOpDeProcessor`, om te zien of het klopt.
    const opties = {
      alpha: true, premultipliedAlpha: true, antialias: false, depth: true, stencil: false, preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: !T.TEKENEN_INSTELLINGEN.ookOpDeProcessor,
    };
    gl = doek.getContext('webgl2', opties);
    if (!gl) {
      // Op de processor kan het wel, als een proef dat later vraagt (dan met een nieuw doek); anders is het geen WebGL.
      if (opties.failIfMajorPerformanceCaveat) geenKaart = true;
      else kapot = true;
      doek = null;
      return false;
    }
    doek.addEventListener('webglcontextlost', (ev) => {
      ev.preventDefault();
      kapot = true;
      gl = null;
    });
    try {
      beeldProg = maakProgramma(VERT_BEELD, FRAG_BEELD);
      instProg = maakProgramma(VERT_INST, FRAG_BEELD);
      vastProg = maakProgramma(VERT_VAST, FRAG_BEELD);
      grondProg = maakProgramma(VERT_GROND, FRAG_BEELD);
      verloopProg = maakProgramma(VERT, FRAG_VERLOOP);
      plasProg = maakProgramma(VERT, FRAG_PLAS);
      maalProg = maakProgramma(VERT, FRAG_MAAL);
      schaduwProg = maakProgramma(VERT, FRAG_SCHADUW);
      mistProg = maakProgramma(VERT, FRAG_MIST);
      netProg = maakProgramma(VERT_NET, FRAG_NET);
      mistWerkProg = maakProgramma(VERT_VLAK, FRAG_MISTWERK);
    } catch (e) {
      console.error(e);
      kapot = true;
      gl = null;
      return false;
    }
    maxTextuur = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    maxLagen = gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS);
    buffer = gl.createBuffer();
    hoekBuffer = gl.createBuffer();
    instBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    maakIndex();
    // 0 tot 4 en 13: de hoeken (VERT, VERT_BEELD); 5 tot 10: een plaatje per instantie (VERT_INST). 11 en 12 zijn van de
    // vaste rijen, elk met een eigen lijst (G.vasteRij).
    for (let i = 0; i <= 10; i++) gl.enableVertexAttribArray(i);
    gl.enableVertexAttribArray(13);
    for (let i = 5; i <= 10; i++) gl.vertexAttribDivisor(i, 1);
    vergeetStand();
    hoekBron(buffer, 0);
    instBron(0);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enable(gl.BLEND);
    gl.depthFunc(gl.LEQUAL);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    // Plaats 0 is de werkplaats (bind, hieronder: opsturen, en de programma's met één textuur); de rij gebruikt er tot
    // RIJ_TEXTUREN (legRijAf), de mist plaats 1, en de textuurstapel ATLAS_PLAATS.
    gl.activeTexture(gl.TEXTURE0);
    bladen = [];
    atlas = null;
    rij.length = 0;
    opdrachten.length = 0;
    for (const prog of [beeldProg, instProg, vastProg, grondProg]) {
      gebruik(prog);
      uBeelden.forEach((u, i) => gl.uniform1i(prog.u[u], i));
      gl.uniform1i(prog.u.uAtlas, ATLAS_PLAATS);
      gl.uniform1f(prog.u.uMasker, 0);
      gl.uniform1f(prog.u.uHard, 0);
    }
    gebruik(vastProg); // een uniform hoort bij het programma dat in gebruik is
    gl.uniform1i(vastProg.u.uTabel, TABEL_PLAATS);
    gl.uniform1i(vastProg.u.uStand, STAND_PLAATS);
    gebruik(instProg);
    gl.uniform3f(instProg.u.uZon, 0, 0, 0);
    wit = nieuweTextuur();
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
    return true;
  }

  // Kan dit beeld met de videokaart? Dan staat het doek klaar.
  G.kan = () => start();
  G.doek = () => (start() ? doek : null);
  G.kapot = () => kapot;
  // Wat voor kaart het is (voor de meter): de naam die de browser geeft, of 'geen'.
  G.kaart = function () {
    if (!start()) return 'geen';
    const info = gl.getExtension('WEBGL_debug_renderer_info'); // geen tekst
    return info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : 'WebGL'; // geen tekst
  };

  // ---------------------------------------------------------------- de stand van de kaart
  // Wat de kaart nu gebruikt (het programma, de textuur, de mengstand, de maat van het beeldprogramma). Een opdracht zet
  // alleen wat anders is: elke aanroep aan WebGL kost, en in Firefox meer dan in Chrome (zie de bladen hieronder).
  let nuProg = null;
  let nuTex = null;
  let nuMeng = null;
  let nuDiep = null; // 'uit', 'toets' (wel toetsen, niet schrijven) of 'schrijf' (de vaste rijen)
  function gebruik(prog) {
    if (nuProg !== prog) gl.useProgram(prog.p);
    nuProg = prog;
  }
  function bind(tex) {
    if (nuTex !== tex) gl.bindTexture(gl.TEXTURE_2D, tex);
    nuTex = tex;
  }
  // Een textuur op plaats i (de rij, legRijAf); plaats 0 is die van bind.
  const nuOp = []; // de textuur op plaats 1 en verder
  function bindOp(i, tex) {
    if (!i) return bind(tex);
    if (nuOp[i] === tex) return;
    gl.activeTexture(gl.TEXTURE0 + i);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.activeTexture(gl.TEXTURE0);
    nuOp[i] = tex;
  }
  function zetMeng(naam) {
    if (nuMeng !== naam) MENG[naam](gl);
    nuMeng = naam;
  }
  function zetDiep(stand) {
    if (nuDiep === stand) return;
    if (stand === 'uit') gl.disable(gl.DEPTH_TEST);
    else {
      gl.enable(gl.DEPTH_TEST);
      gl.depthMask(stand === 'schrijf');
    }
    nuDiep = stand;
  }
  function vergeetStand() {
    nuProg = nuTex = nuMeng = nuDiep = null;
    nuOp.length = 0;
    hoekNu = null;
    for (const prog of [beeldProg, instProg, vastProg, grondProg]) if (prog) prog.maat = -1;
  }
  // De maat van het doek in een programma van de rij, alleen als hij anders is.
  function zetMaat(prog) {
    const maat = doek.width * 65536 + doek.height;
    if (prog.maat !== maat) gl.uniform2f(prog.u.uMaat, doek.width, doek.height);
    prog.maat = maat;
  }
  // Waar de hoeken vandaan komen (attributen 0 tot 4): buffer buf vanaf hoek start. De rijen van een beeld staan samen in
  // hoekBuffer, elk vanaf zijn eigen begin, zodat de nummers van 16 bits per rij weer bij 0 beginnen.
  let hoekNu = null;
  let hoekNuStart = -1;
  function hoekBron(buf, start) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    if (hoekNu === buf && hoekNuStart === start) return;
    const s = PER_HOEK * 4;
    const o = start * s;
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, s, o);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, s, o + 8);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, s, o + 16);
    gl.vertexAttribPointer(3, 1, gl.FLOAT, false, s, o + 32);
    gl.vertexAttribPointer(4, 1, gl.FLOAT, false, s, o + 36);
    gl.vertexAttribPointer(13, 1, gl.FLOAT, false, s, o + 40);
    hoekNu = buf;
    hoekNuStart = start;
  }
  // Waar de plaatjes vandaan komen (attributen 5 tot 10, een per instantie): instBuffer vanaf plaatje start.
  function instBron(start) {
    gl.bindBuffer(gl.ARRAY_BUFFER, instBuffer);
    const s = PER_INST * 4;
    const o = start * s;
    for (let i = 0; i < 5; i++) gl.vertexAttribPointer(5 + i, 4, gl.FLOAT, false, s, o + i * 16);
    gl.vertexAttribPointer(10, 1, gl.FLOAT, false, s, o + 80);
  }

  function nieuweTextuur() {
    const t = gl.createTexture();
    bind(t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  // ---------------------------------------------------------------- de bladen
  // Een opdracht aan de kaart tekent alles met één textuur, en ver uitgezoomd tekende het spel zo'n 3250 plaatjes per
  // beeld uit maar 120 bronnen (de standen van de bomen in de wind, een vel per huis, per figuur), maar in de volgorde van
  // de tekenlijst wisselde de textuur 2900 keer: bijna een opdracht per plaatje, elk met zijn stand erbij. Chrome haalde
  // zo 35 beelden per seconde, Firefox, dat per aanroep trager is, minder en haperend (Marcel, 10 okt: "firefox,
  // uitzoomen en snel bewegen met camera"). Nu staat wat klein is en niet meer verandert (een plaatje, of een doek met
  // versie 1: eens getekend, blijft hij zo) naast elkaar op een paar grote texturen, de bladen, in planken van boven naar
  // onder; plaatjes van hetzelfde blad gaan samen in één opdracht. Sinds 18 okt is een blad een laag van één
  // textuurstapel (TEXTURE_2D_ARRAY, de atlas): wat erop staat, kost geen plaats in de rij, dus de bladen breken een rij
  // niet meer; de stapel begint met BEGIN_LAGEN en groeit (stapelVoor), in plaats van per blad meteen 64 MB.
  const LAAG = 2048; // de maat van een blad (kleiner als de kaart dat niet kan)
  const BLAD_BEELD = 2046; // een plaatje dat breder of hoger is, of groter dan BLAD_PIXELS, krijgt een eigen textuur
  const BLAD_PIXELS = 1 << 21; // (zo past het graan, 1344 bij 936, en de rand van 512 bij 2400 niet)
  const BLAD_DOEK = 512; // een doek vanaf deze maat ook (de grond in stukken van 512, die opnieuw beschreven worden)
  // Zoveel lagen bij het begin (elk 16 MB op de kaart), en dan steeds zoveel erbij. Tot 18 okt twee keer zoveel, maar met
  // de bomen in vaste rijen (vraag 178, B2) staan alle standen in de wind er meteen op: ver uitgezoomd 9 bladen, en dat
  // werden 16 lagen, 256 MB.
  const BEGIN_LAGEN = 4;
  const MAX_LAGEN = 32; // zoveel bladen hooguit (512 MB); wat daarna komt, krijgt een eigen textuur
  let maxLagen = 256;
  let atlas = null; // { tex, lagen, maat }: de textuurstapel, op plaats ATLAS_PLAATS
  let bladen = []; // per laag { laag, maat, planken: [{ x, y, h }], vrijY }
  function opEenBlad(bron, isDoek, versie, b, h) {
    const maat = Math.min(LAAG, maxTextuur);
    if (bron === plak || b + 2 > maat || h + 2 > maat) return false;
    if (isDoek) return versie === 1 && b < BLAD_DOEK && h < BLAD_DOEK;
    return b <= BLAD_BEELD && h <= BLAD_BEELD && b * h <= BLAD_PIXELS;
  }
  // Een textuurstapel met minstens n lagen; wat er al op stond, gaat mee (de kaart kopieert het zelf, laag voor laag).
  function stapelVoor(n) {
    if (atlas && atlas.lagen >= n) return true;
    const lagen = Math.min(MAX_LAGEN, maxLagen, Math.max(n, BEGIN_LAGEN, atlas ? atlas.lagen + BEGIN_LAGEN : 0));
    if (lagen < n) return false;
    const maat = Math.min(LAAG, maxTextuur);
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + ATLAS_PLAATS);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, tex);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, maat, maat, lagen);
    if (atlas) {
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, fb);
      for (let l = 0; l < atlas.lagen; l++) {
        gl.framebufferTextureLayer(gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, atlas.tex, 0, l);
        gl.copyTexSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, l, 0, 0, maat, maat);
      }
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);
      gl.deleteFramebuffer(fb);
      gl.deleteTexture(atlas.tex);
    }
    gl.activeTexture(gl.TEXTURE0);
    atlas = { tex, lagen, maat };
    return true;
  }
  // Een plek van b bij h op een blad, met een pixel lucht rondom (het blad is leeg, dus doorzichtig): een verkleind
  // plaatje pakt zo nooit een pixel van zijn buur. Of null als alle bladen vol zijn.
  function plekOpBlad(b, h) {
    const pb = b + 2;
    const ph = h + 2;
    for (const blad of bladen) {
      for (const p of blad.planken) {
        if (ph <= p.h && ph * 3 >= p.h * 2 && p.x + pb <= blad.maat) {
          p.x += pb;
          return { blad, x: p.x - pb + 1, y: p.y + 1 };
        }
      }
      if (blad.vrijY + ph <= blad.maat && pb <= blad.maat) {
        blad.planken.push({ x: pb, y: blad.vrijY, h: ph });
        blad.vrijY += ph;
        return { blad, x: 1, y: blad.vrijY - ph + 1 };
      }
    }
    if (!stapelVoor(bladen.length + 1)) return null;
    bladen.push({ laag: bladen.length, maat: atlas.maat, planken: [], vrijY: 0 });
    return plekOpBlad(b, h);
  }

  // De textuur van een plaatje of een doek, of null als het (nog) niet kan: { tex, laag, x, y, tb, th, b, h, versie },
  // met (x, y) waar de bron op de textuur begint en tb bij th de maat van de textuur; op een blad is tex null en laag de
  // laag van de stapel. Hij staat op de bron zelf (opDeKaart), niet in een WeakMap: dat opzoeken kostte ver uitgezoomd in
  // Firefox bijna een ms per beeld (17 okt, E1).
  function textuurVan(bron) {
    let t = bron.opDeKaart;
    if (t !== undefined && t.plaatje && t.b === bron.naturalWidth && t.h === bron.naturalHeight) {
      t.beeld = beeldNr;
      return t;
    }
    const isDoek = typeof HTMLCanvasElement !== 'undefined' && bron instanceof HTMLCanvasElement;
    const b = isDoek ? bron.width : bron.naturalWidth;
    const h = isDoek ? bron.height : bron.naturalHeight;
    if (!b || !h || b > maxTextuur || h > maxTextuur || (!isDoek && !bron.complete)) return null;
    const versie = isDoek ? bron.versie : 0;
    if (t && t.b === b && t.h === h && (!isDoek || (versie !== undefined && t.versie === versie))) {
      t.beeld = beeldNr;
      return t;
    }
    // Een doek op een blad dat toch opnieuw beschreven werd, krijgt een eigen textuur; zijn plek op het blad blijft leeg.
    if (t && t.blad) t = null;
    if (!t) {
      const plek = opEenBlad(bron, isDoek, versie, b, h) && plekOpBlad(b, h);
      if (plek) {
        gl.activeTexture(gl.TEXTURE0 + ATLAS_PLAATS);
        try {
          gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, plek.x, plek.y, plek.blad.laag, b, h, 1, gl.RGBA, gl.UNSIGNED_BYTE, bron);
        } catch (e) {
          gl.activeTexture(gl.TEXTURE0);
          console.warn('Tekenen zonder de videokaart:', e.message); // geen tekst
          kapot = true;
          return null;
        }
        gl.activeTexture(gl.TEXTURE0);
        t = { tex: null, laag: plek.blad.laag, blad: true, plaatje: !isDoek, x: plek.x, y: plek.y, tb: atlas.maat, th: atlas.maat, b, h, versie, beeld: beeldNr };
        bron.opDeKaart = t;
        G.telling.opgestuurd++;
        return t;
      }
      t = { tex: nieuweTextuur(), laag: -1, blad: false, plaatje: false, x: 0, y: 0, tb: b, th: h, b, h, versie, beeld: -1 };
      bron.opDeKaart = t;
    } else if (t.beeld === beeldNr) {
      // Al getekend in dit beeld en nu anders (een doek zonder versie, zoals het kijkgat, één per wie achter een huis
      // staat): wat er al mee getekend werd, gaat pas in G.klaar naar de kaart, dus een nieuwe textuur, en de oude na het
      // beeld weg. Anders liet elke plek het laatste zien (Marcel, 9 okt: "art overlapt en klopt niet meer").
      opruimen.push(t.tex);
      t.tex = nieuweTextuur();
    }
    bind(t.tex);
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bron);
    } catch (e) {
      // Een plaatje van een los bestand (file://) mag in sommige browsers niet naar de kaart: dan zonder.
      console.warn('Tekenen zonder de videokaart:', e.message); // geen tekst
      kapot = true;
      return null;
    }
    Object.assign(t, { b, h, tb: b, th: h, versie, beeld: beeldNr, plaatje: !isDoek });
    G.telling.opgestuurd++;
    return t;
  }

  // ---------------------------------------------------------------- de rij met hoeken
  // Wat na elkaar getekend wordt, gaat in één opdracht naar de kaart, ook als het uit verschillende texturen komt: tot
  // RIJ_TEXTUREN, elk op zijn plaats (vBron in FRAG_BEELD). Tot 17 okt brak elke andere textuur de rij, en in de lente
  // stonden de bomen op twee bladen door elkaar (een naaldboom houdt zijn zomervel, en de standen in de wind komen op een
  // blad als ze voor het eerst in beeld komen): zo werden het na een paar dagen 800 opdrachten per beeld in plaats van
  // 60, wat in Firefox per aanroep meer kost dan in Chrome (Marcel, 17 okt: "performance is belangrijk spelelement").
  // De rij die nu groeit, af: als opdracht in de lijst van dit beeld (G.klaar tekent hem).
  function legRijAf() {
    if (aantal) {
      opdrachten.push({ soort: rijSoort, start: rijStart, n: aantal, meng: rijMeng, rij: rij.slice(), werpt: rijWerpt, diep: rijDiep });
      aantal = 0;
    }
    rij.length = 0;
    rijWerpt = false;
  }
  // Iets dat zelf tekent (een verloop, de mist, het licht), op zijn plek in de lijst: f doet het in G.klaar, met de diepte
  // van nu (een verloop van een lantaarn tussen de bomen).
  function doe(f) {
    legRijAf();
    opdrachten.push({ soort: DOE, f, diep: diepteNu !== null });
  }
  const groter = (a, n) => {
    const b = new Float32Array(Math.max(n, a.length * 2));
    b.set(a);
    return b;
  };
  // Plaats in de rij voor n hoeken (soort HOEKEN, vier per vorm) of n plaatjes (PLAATJES), uit textuur tex of laag
  // `laag` van de stapel, in mengstand meng: een nieuwe rij als de soort of de mengstand anders is, als er geen plaats
  // voor nog een textuur is, of als de hoeken er niet meer bij passen.
  function plekVoor(tex, meng, n, laag, soort = HOEKEN) {
    const opStapel = laag >= 0;
    const diep = diepteNu !== null;
    if (aantal && (meng !== rijMeng || soort !== rijSoort || diep !== rijDiep)) legRijAf();
    if (!opStapel && rij.length >= RIJ_TEXTUREN && !rij.includes(tex)) legRijAf();
    if (soort === HOEKEN) {
      if (aantal + n > MAX_HOEKEN) legRijAf();
      if ((hoekAantal + n) * PER_HOEK > hoeken.length) hoeken = groter(hoeken, (hoekAantal + n) * PER_HOEK);
    } else if ((instAantal + n) * PER_INST > inst.length) inst = groter(inst, (instAantal + n) * PER_INST);
    if (!aantal) rijStart = soort === HOEKEN ? hoekAantal : instAantal;
    if (opStapel) bronNu = -1 - laag;
    else {
      bronNu = rij.indexOf(tex);
      if (bronNu < 0) bronNu = rij.push(tex) - 1;
    }
    rijMeng = meng;
    rijSoort = soort;
    rijDiep = diep;
  }
  // Eén instantie (VERT_INST), op het doek: de vier hoeken (in pixels), (u0, v0)-(u1, v1) op de textuur, een kleur
  // (voorvermenigvuldigd: een plaatje is helder, helder, helder, alpha), de vlag (WERPT, DRIEHOEK) en r (de hoogte gedeeld
  // door de breedte, voor de schaduw). Zonder lijstjes: het gaat om duizenden per beeld.
  function zetInst(ax, ay, bx, by, cx, cy, dx, dy, u0, v0, u1, v1, k0, k1, k2, k3, vlag, r) {
    const i = instAantal * PER_INST;
    inst[i] = ax;
    inst[i + 1] = ay;
    inst[i + 2] = bx;
    inst[i + 3] = by;
    inst[i + 4] = cx;
    inst[i + 5] = cy;
    inst[i + 6] = dx;
    inst[i + 7] = dy;
    inst[i + 8] = u0;
    inst[i + 9] = v0;
    inst[i + 10] = u1;
    inst[i + 11] = v1;
    inst[i + 12] = k0;
    inst[i + 13] = k1;
    inst[i + 14] = k2;
    inst[i + 15] = k3;
    inst[i + 16] = bronNu;
    inst[i + 17] = vlag;
    inst[i + 18] = r;
    inst[i + 19] = grijsNu;
    inst[i + 20] = diepteNu === null ? 0 : diepteNu;
    instAantal++;
    aantal++;
    if (vlag === WERPT) rijWerpt = true;
  }
  // Een vierhoek op het doek (vier punten in pixels: linksboven, rechtsboven, linksonder, rechtsonder) met (u0, v0)-(u1,
  // v1) op de textuur en kleur k.
  function vierhoek(p, u0, v0, u1, v1, k) {
    zetInst(p[0], p[1], p[2], p[3], p[4], p[5], p[6], p[7], u0, v0, u1, v1, k[0], k[1], k[2], k[3], 0, 0);
  }
  // De nummers op de kaart: per plaatje q de hoeken 4q, 4q+1, 4q+2 en 4q+1, 4q+3, 4q+2 (a b c en b d c).
  function maakIndex() {
    const n = MAX_HOEKEN / 4;
    const lijst = new Uint16Array(n * 6);
    for (let q = 0; q < n; q++) lijst.set([4 * q, 4 * q + 1, 4 * q + 2, 4 * q + 1, 4 * q + 3, 4 * q + 2], q * 6);
    index = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index); // blijft gebonden: alleen de rij tekent met nummers
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, lijst, gl.STATIC_DRAW);
  }
  function hoekH(x, y, u, v, h, al) {
    const i = hoekAantal * PER_HOEK;
    hoeken[i] = x;
    hoeken[i + 1] = y;
    hoeken[i + 2] = u;
    hoeken[i + 3] = v;
    hoeken[i + 4] = h;
    hoeken[i + 5] = h;
    hoeken[i + 6] = h;
    hoeken[i + 7] = al;
    hoeken[i + 8] = grijsNu;
    hoeken[i + 9] = bronNu;
    hoeken[i + 10] = diepteNu === null ? 0 : diepteNu;
    hoekAantal++;
    aantal++;
  }
  // Een veelhoek [x, y, x, y, ...] geknipt op de rechthoek (x0, y0)-(x1, y1), zoals Sutherland en Hodgman: wat van een
  // bolle veelhoek overblijft, is weer bol (of minder dan drie punten).
  function knipOpVak(p, x0, y0, x1, y1) {
    for (const [as, grens, kant] of [[0, x0, 1], [0, x1, -1], [1, y0, 1], [1, y1, -1]]) {
      const uit = [];
      const n = p.length / 2;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const a = (p[2 * i + as] - grens) * kant;
        const b = (p[2 * j + as] - grens) * kant;
        if (a >= 0) uit.push(p[2 * i], p[2 * i + 1]);
        if ((a >= 0) !== (b >= 0)) {
          const f = a / (a - b);
          uit.push(p[2 * i] + (p[2 * j] - p[2 * i]) * f, p[2 * i + 1] + (p[2 * j + 1] - p[2 * i + 1]) * f);
        }
      }
      p = uit;
      if (p.length < 6) break;
    }
    return p;
  }
  // Een vierhoek [x0, y0, ..., x3, y3] in twee driehoeken, langs de diagonaal waarlangs ze allebei dezelfde kant op
  // draaien: zo klopt het ook als een hoek naar binnen valt (een tegel op een steile helling).
  function driehoekenVan(v) {
    const opp = (a, b, c) => (v[2 * b] - v[2 * a]) * (v[2 * c + 1] - v[2 * a + 1]) - (v[2 * b + 1] - v[2 * a + 1]) * (v[2 * c] - v[2 * a]);
    const delen = opp(0, 1, 2) * opp(0, 2, 3) >= 0 ? [[0, 1, 2], [0, 2, 3]] : [[1, 2, 3], [1, 3, 0]];
    return delen.map((d) => [v[2 * d[0]], v[2 * d[0] + 1], v[2 * d[1]], v[2 * d[1] + 1], v[2 * d[2]], v[2 * d[2] + 1]]);
  }
  // Een stuk dat buiten zijn bron valt, tekent een 2D-doek niet, en op een blad zou het de buren pakken: dus alleen het
  // stuk erbinnen, op zijn plek. [sx, sy, sw, sh, dx, dy, dw, dh], of null als er niets overblijft.
  function binnenDeBron(t, sx, sy, sw, sh, dx, dy, dw, dh) {
    const fx = dw / sw;
    const fy = dh / sh;
    const x0 = Math.max(0, sx);
    const y0 = Math.max(0, sy);
    const x1 = Math.min(t.b, sx + sw);
    const y1 = Math.min(t.h, sy + sh);
    if (!(x1 > x0 && y1 > y0)) return null;
    return [x0, y0, x1 - x0, y1 - y0, dx + (x0 - sx) * fx, dy + (y0 - sy) * fy, (x1 - x0) * fx, (y1 - y0) * fy];
  }
  // Een rond verloop over een vorm (hoeken als driehoeken, in pixels), met een eigen opdracht.
  function tekenVerloop(punten, v, m, alpha, meng) {
    const z = diepteNu === null ? 0 : diepteNu;
    doe(() => tekenVerloopNu(punten, v, m, alpha, meng, z));
  }
  function tekenVerloopNu(punten, v, m, alpha, meng, z) {
    gebruik(verloopProg);
    gl.uniform2f(verloopProg.u.uMaat, doek.width, doek.height);
    gl.uniform1f(verloopProg.u.uZ, z);
    const s = Math.hypot(m[0], m[1]); // het verloop staat in de vlakte van de vorm: zijn maten gaan mee
    gl.uniform2f(verloopProg.u.uMidden, m[0] * v.x + m[2] * v.y + m[4], m[1] * v.x + m[3] * v.y + m[5]);
    gl.uniform1f(verloopProg.u.uR0, v.r0 * s);
    gl.uniform1f(verloopProg.u.uR1, v.r1 * s);
    const stops = v.stops.slice().sort((a, b) => a[0] - b[0]);
    gl.uniform1i(verloopProg.u.uN, stops.length);
    const off = new Float32Array(4);
    const kl = new Float32Array(16);
    stops.forEach(([o, k], i) => {
      off[i] = o;
      kl.set(k, i * 4);
    });
    gl.uniform1fv(verloopProg.u.uStop, off);
    gl.uniform4fv(verloopProg.u.uKleur, kl);
    zetMeng(meng);
    const data = new Float32Array((punten.length / 2) * PER_HOEK);
    for (let i = 0, j = 0; i < punten.length; i += 2, j += PER_HOEK) {
      data[j] = punten[i];
      data[j + 1] = punten[i + 1];
      data[j + 7] = alpha;
    }
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STREAM_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, punten.length / 2);
    G.telling.opdrachten++;
  }

  // ---------------------------------------------------------------- de lichtkaart (vraag 125, A)
  // Op de halve maat van het doek: licht is zacht, en zo kost hij een kwart.
  let licht = null; // { fb, tex, b, h }
  function lichtkaart() {
    const b = Math.max(1, Math.ceil(doek.width / 2));
    const h = Math.max(1, Math.ceil(doek.height / 2));
    if (licht && licht.b === b && licht.h === h) return licht;
    if (!licht) licht = { fb: gl.createFramebuffer(), tex: nieuweTextuur() };
    bind(licht.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, b, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, licht.fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, licht.tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    Object.assign(licht, { b, h });
    return licht;
  }
  // Tekent de lichtkaart (de kleur van het uur, [r, g, b], en de plassen { x, y, rx, ry, k }, in pixels op het doek)
  // en vermenigvuldigt de wereld ermee.
  function tekenLicht(kleur, plassen) {
    const L = lichtkaart();
    gl.bindFramebuffer(gl.FRAMEBUFFER, L.fb);
    gl.viewport(0, 0, L.b, L.h);
    gl.clearColor(kleur[0] / 2, kleur[1] / 2, kleur[2] / 2, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (plassen.length) {
      gebruik(plasProg);
      gl.uniform2f(plasProg.u.uMaat, doek.width, doek.height);
      gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ZERO, gl.ONE);
      nuMeng = null;
      const data = new Float32Array(plassen.length * 6 * PER_HOEK);
      let i = 0;
      const zet = (x, y, u, v, k) => {
        data.set([x, y, u, v, k[0] / 2, k[1] / 2, k[2] / 2, 1], i);
        i += PER_HOEK;
      };
      for (const p of plassen) {
        const [x0, y0, x1, y1] = [p.x - p.rx, p.y - p.ry, p.x + p.rx, p.y + p.ry];
        zet(x0, y0, -1, -1, p.k);
        zet(x1, y0, 1, -1, p.k);
        zet(x0, y1, -1, 1, p.k);
        zet(x1, y0, 1, -1, p.k);
        zet(x1, y1, 1, 1, p.k);
        zet(x0, y1, -1, 1, p.k);
      }
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STREAM_DRAW);
      gl.drawArrays(gl.TRIANGLES, 0, plassen.length * 6);
      G.telling.opdrachten++;
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, doek.width, doek.height);
    gebruik(maalProg);
    gl.uniform1i(maalProg.u.uLicht, 0);
    bind(L.tex);
    gl.blendFuncSeparate(gl.DST_COLOR, gl.SRC_COLOR, gl.ZERO, gl.ONE);
    nuMeng = null;
    overHetDoek(maalProg);
    G.telling.lampen = plassen.length;
  }

  // ---------------------------------------------------------------- de schaduwen van de zon (vraag 125, B)
  // Een masker even groot als het doek: de silhouetten erop, en dan in één keer over de grond.
  let masker = null; // { fb, tex, b, h }
  function maskerVan() {
    if (masker && masker.b === doek.width && masker.h === doek.height) return masker;
    if (!masker) masker = { fb: gl.createFramebuffer(), tex: nieuweTextuur() };
    bind(masker.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, doek.width, doek.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, masker.fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, masker.tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    Object.assign(masker, { b: doek.width, h: doek.height });
    return masker;
  }
  // De silhouetten komen uit de rijen plaatjes van dit beeld zelf (G.klaar, maskerRonde): elke rij met een plaatje dat
  // een schaduw werpt, nog eens, met VERT_INST scheef (uZon) en alleen hoe dicht (uMasker). Tot 18 okt tekende
  // js/tekenen.js daarvoor de hele lijst een tweede keer, tussen beginSchaduw en eindSchaduw.
  function maskerRonde() {
    const M = maskerVan();
    bind(wit); // het masker zelf mag niet op een plaats van de rij staan terwijl erop getekend wordt
    gl.bindFramebuffer(gl.FRAMEBUFFER, M.fb);
    gl.viewport(0, 0, doek.width, doek.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gebruik(instProg);
    gl.uniform3f(instProg.u.uZon, 1, schaduwOp.sx, schaduwOp.sy);
    gl.uniform1f(instProg.u.uMasker, 1);
    for (const o of opdrachten) {
      if (o.soort === PLAATJES && o.werpt) tekenRij(o, 'source-over', true);
      else if (o.soort === VAST && o.werpt) tekenVast(o, true);
    }
    gebruik(instProg);
    gl.uniform3f(instProg.u.uZon, 0, 0, 0);
    gl.uniform1f(instProg.u.uMasker, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, doek.width, doek.height);
  }
  // Een rij van de lijst naar de kaart, in één opdracht (op het masker zonder diepte).
  function tekenRij(o, meng, opMasker = false) {
    const prog = o.soort === HOEKEN ? beeldProg : instProg;
    gebruik(prog);
    zetMaat(prog);
    for (let i = 0; i < o.rij.length; i++) bindOp(i, o.rij[i]);
    zetMeng(meng);
    zetDiep(o.diep && !opMasker ? 'toets' : 'uit');
    if (o.soort === HOEKEN) {
      hoekBron(hoekBuffer, o.start);
      gl.drawElements(gl.TRIANGLES, (o.n / 4) * 6, gl.UNSIGNED_SHORT, 0);
    } else {
      instBron(o.start);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, o.n);
    }
    G.telling.opdrachten++;
  }
  // Een vlak over het hele doek met een programma dat zijn kleur uit de plek op het scherm haalt.
  function overHetDoek(prog) {
    const w = doek.width;
    const h = doek.height;
    gl.uniform2f(prog.u.uMaat, w, h);
    gl.uniform2f(prog.u.uDoek, w, h);
    const data = new Float32Array(6 * PER_HOEK);
    [[0, 0], [w, 0], [0, h], [w, 0], [w, h], [0, h]].forEach(([x, y], i) => data.set([x, y, 0, 0, 0, 0, 0, 1, 0], i * PER_HOEK));
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STREAM_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    G.telling.opdrachten++;
  }

  // ---------------------------------------------------------------- de mist (B2c)
  // Eerst het net (VERT_NET): het masker op zijn plek op het scherm, op de grond van elke tegel, ook op een heuvel, naar
  // de mist op het scherm (op de halve maat: de rand van de mist is zacht). Dan wat er tot nu toe getekend is (de grond)
  // als kopie naar een textuur, en met FRAG_MIST terug op het doek: ontkleuren kan de kaart niet met een mengstand, want
  // daarvoor moet ze lezen wat er al staat.
  let wereldKopie = null; // { tex, b, h }
  let mistScherm = null; // { fb, tex, b, h }
  let mistBasis = null; // { tex, versie, b, h }: wat je kent (js/tekenen.js, mistOpDeKaart)
  let mistKijkers = null; // de textuur met wie er kijkt
  let mistWerk = null; // { fb, tex, b, h }: het masker van dit beeld (FRAG_MISTWERK)
  function mistOpHetScherm() {
    const b = Math.max(1, Math.ceil(doek.width / 2));
    const h = Math.max(1, Math.ceil(doek.height / 2));
    if (mistScherm && mistScherm.b === b && mistScherm.h === h) return mistScherm;
    if (!mistScherm) mistScherm = { fb: gl.createFramebuffer(), tex: nieuweTextuur() };
    bind(mistScherm.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, b, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, mistScherm.fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, mistScherm.tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    Object.assign(mistScherm, { b, h });
    return mistScherm;
  }
  // De punten van een stuk van het net gaan één keer naar de kaart (zolang js/tekenen.js dezelfde lijst geeft), en wat
  // een paar beelden niet gebruikt werd, gaat weg. De nummers (twee driehoeken per vierkant tussen vier punten, rij na
  // rij: wat verder naar voren ligt, komt later, zodat de grond vóór een heuvel zijn eigen mist houdt) zijn voor elk stuk
  // dezelfde.
  const netBuffers = new Map(); // punten → { buf, beeld }
  const NET_HOOGUIT = 48;
  let netBeeld = 0;
  let netNummers = null; // { buf, n, aantal }
  function netNummersVoor(n) {
    if (netNummers && netNummers.n === n) return netNummers;
    const p = n + 1;
    const lijst = new Uint16Array(n * n * 6);
    let k = 0;
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const a = j * p + i;
        lijst.set([a, a + 1, a + p, a + 1, a + p + 1, a + p], k);
        k += 6;
      }
    }
    if (!netNummers) netNummers = { buf: gl.createBuffer() };
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, netNummers.buf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, lijst, gl.STATIC_DRAW);
    Object.assign(netNummers, { n, aantal: lijst.length });
    return netNummers;
  }
  // Het masker van dit beeld, op de kaart (FRAG_MISTWERK): wat je kent alleen als het anders is, wie er kijkt elk beeld.
  // Het komt op plaats 1, uitgesmeerd (de zachte rand), voor tekenNet.
  function maakMistWerk(masker) {
    const { b, h } = masker;
    const opPlaats = (plaats, tex, lineair) => {
      gl.activeTexture(gl.TEXTURE0 + plaats);
      if (!tex) {
        tex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tex);
        const f = lineair ? gl.LINEAR : gl.NEAREST;
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      } else gl.bindTexture(gl.TEXTURE_2D, tex);
      return tex;
    };
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    if (!mistBasis) mistBasis = { tex: null, versie: -1, b: 0, h: 0 };
    mistBasis.tex = opPlaats(2, mistBasis.tex, false);
    if (mistBasis.versie !== masker.versie || mistBasis.b !== b || mistBasis.h !== h) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, b, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, masker.gekend);
      Object.assign(mistBasis, { versie: masker.versie, b, h });
      G.telling.opgestuurd++;
    }
    mistKijkers = opPlaats(3, mistKijkers, false);
    const n = masker.n;
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, Math.max(1, n), 1, 0, gl.RGBA, gl.FLOAT, n ? masker.kijkers.subarray(0, n * 4) : new Float32Array(4));
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    if (!mistWerk) mistWerk = { fb: gl.createFramebuffer(), tex: null, b: 0, h: 0 };
    mistWerk.tex = opPlaats(1, mistWerk.tex, true);
    if (mistWerk.b !== b || mistWerk.h !== h) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, b, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, mistWerk.fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, mistWerk.tex, 0);
      Object.assign(mistWerk, { b, h });
    }
    // het masker mag niet op plaats 1 staan terwijl erop getekend wordt
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, mistWerk.fb);
    gl.viewport(0, 0, b, h);
    gebruik(mistWerkProg);
    gl.uniform1i(mistWerkProg.u.uBasis, 2);
    gl.uniform1i(mistWerkProg.u.uKijkers, 3);
    gl.uniform1i(mistWerkProg.u.uN, n);
    gl.blendFuncSeparate(gl.ONE, gl.ZERO, gl.ONE, gl.ZERO);
    nuMeng = null;
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    G.telling.opdrachten++;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, doek.width, doek.height);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, mistWerk.tex);
    gl.activeTexture(gl.TEXTURE0);
    // plaats 1, 2 en 3 zijn ook plaatsen van de rij (bindOp): wat daar nu staat, weet die niet
    nuOp[1] = mistWerk.tex;
    nuOp[2] = mistBasis.tex;
    nuOp[3] = mistKijkers;
  }
  function tekenNet(S, net, b, h, m) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, S.fb);
    gl.viewport(0, 0, S.b, S.h);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gebruik(netProg);
    const u = netProg.u;
    gl.uniform1i(u.uMist, 1);
    gl.uniform2f(u.uMaat, doek.width, doek.height);
    gl.uniform3f(u.uStandX, m[0], m[2], m[4]);
    gl.uniform3f(u.uStandY, m[1], m[3], m[5]);
    gl.uniform2f(u.uOorsprong, net.x0, net.y0);
    gl.uniform4f(u.uMasker, b, h, 0, 0);
    gl.blendFuncSeparate(gl.ONE, gl.ZERO, gl.ONE, gl.ZERO);
    nuMeng = null;
    let nn = null;
    for (const punten of net.stukken) {
      const n = Math.round(Math.sqrt(punten.length / 4)) - 1;
      if (!nn || nn.n !== n) {
        nn = netNummersVoor(n);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, nn.buf);
      }
      let nb = netBuffers.get(punten);
      if (!nb) {
        netBuffers.set(punten, (nb = { buf: gl.createBuffer() }));
        gl.bindBuffer(gl.ARRAY_BUFFER, nb.buf);
        gl.bufferData(gl.ARRAY_BUFFER, punten, gl.STATIC_DRAW);
        G.telling.opgestuurd++;
      } else gl.bindBuffer(gl.ARRAY_BUFFER, nb.buf);
      nb.beeld = netBeeld;
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 16, 0);
      gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 16, 8);
      gl.drawElements(gl.TRIANGLES, nn.aantal, gl.UNSIGNED_SHORT, 0);
      G.telling.opdrachten++;
    }
    // terug naar de rij: zijn buffer, zijn hoeken en zijn nummers
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, PER_HOEK * 4, 0);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, PER_HOEK * 4, 8);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, index);
    if (netBuffers.size > NET_HOOGUIT) {
      for (const [p, nb] of netBuffers) {
        if (netBeeld - nb.beeld < 2) continue;
        gl.deleteBuffer(nb.buf);
        netBuffers.delete(p);
      }
    }
    netBeeld++;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, doek.width, doek.height);
  }
  function tekenMistOpDeKaart(masker, zwart, m, net) {
    const W = doek.width;
    const H = doek.height;
    const S = mistOpHetScherm(); // eerst: een nieuwe textuur komt op plaats 0, en daar moet zo de kopie
    if (!wereldKopie) wereldKopie = { tex: nieuweTextuur(), b: 0, h: 0 };
    bind(wereldKopie.tex);
    if (wereldKopie.b !== W || wereldKopie.h !== H) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, W, H, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      Object.assign(wereldKopie, { b: W, h: H });
    }
    gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, W, H);
    maakMistWerk(masker); // het masker op plaats 1, uitgesmeerd (de zachte rand)
    tekenNet(S, net, masker.b, masker.h, m);
    // de mist op het scherm op plek 1 (plaats 1 is ook een plaats van de rij, bindOp)
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, S.tex);
    gl.activeTexture(gl.TEXTURE0);
    nuOp[1] = S.tex;
    gebruik(mistProg);
    const u = mistProg.u;
    gl.uniform1i(u.uWereld, 0);
    gl.uniform1i(u.uScherm, 1);
    gl.uniform3f(u.uZwart, zwart[0] / 255, zwart[1] / 255, zwart[2] / 255);
    gl.blendFuncSeparate(gl.ONE, gl.ZERO, gl.ONE, gl.ZERO);
    nuMeng = null;
    overHetDoek(mistProg);
    G.telling.mist = 1;
  }

  // ---------------------------------------------------------------- de vaste rijen (vraag 178, B1 en B2)
  // Een vaste rij is een lijst bomen van een stuk land, één keer op de kaart (G.vasteRij, VAST_PER getallen per boom, zie
  // VERT_VAST), met de tabel van hun tekeningen (G.vasteTabel) en hun plaatjes op de stapel (G.opDeStapel). Per beeld
  // tekent tekenVast ze allemaal: eerst op het masker van de schaduwen (maskerRonde), dan op het doek, waar ze hun diepte
  // schrijven. js/tekenen.js geeft per beeld de stand per fase in de wind en de mist per tegel mee (Doek.tekenVast).
  const VAST_PER = 8;
  const TABEL_PLAATS = 9; // de plaatsen van de tabel en de mist per tegel (de rij gebruikt 0 tot 7, de stapel 8)
  const STAND_PLAATS = 10;
  const TABEL_B = 512; // zoveel getallen van vier per rij van de tabel
  let tabelTex = null;
  let standTex = null;
  function vasteTextuur(plaats, tex) {
    gl.activeTexture(gl.TEXTURE0 + plaats);
    if (!tex) {
      tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    } else gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    return tex;
  }
  function vasteTextuurKlaar() {
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    gl.activeTexture(gl.TEXTURE0);
  }
  // Waar een plaatje (of een doek met versie 1) op de stapel staat, { laag, x, y, maat }, of null als het daar niet kan.
  G.opDeStapel = function (bron) {
    if (!start()) return null;
    const t = textuurVan(bron);
    return t && t.blad ? { laag: t.laag, x: t.x, y: t.y, maat: t.tb } : null;
  };
  // De tabel van de tekeningen: n getallen van vier.
  G.vasteTabel = function (data, n) {
    if (!start()) return;
    const h = Math.max(1, Math.ceil(n / TABEL_B));
    const vol = new Float32Array(TABEL_B * h * 4);
    vol.set(data.subarray(0, n * 4));
    tabelTex = vasteTextuur(TABEL_PLAATS, tabelTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, TABEL_B, h, 0, gl.RGBA, gl.FLOAT, vol);
    vasteTextuurKlaar();
  };
  // Een vaste rij van n bomen (data: VAST_PER getallen per boom), met een eigen lijst van attributen (11 en 12).
  G.vasteRij = function (data, n) {
    if (!start() || !n) return null;
    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data.subarray(0, n * VAST_PER), gl.STATIC_DRAW);
    for (const [plek, o] of [[11, 0], [12, 16]]) {
      gl.enableVertexAttribArray(plek);
      gl.vertexAttribPointer(plek, 4, gl.FLOAT, false, VAST_PER * 4, o);
      gl.vertexAttribDivisor(plek, 1);
    }
    gl.bindVertexArray(null);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    G.telling.opgestuurd++;
    return { vao, buf, n };
  };
  // Hoe vol de stapel is (het meten): zijn lagen, en hoeveel daarvan een blad zijn.
  G.stapel = () => ({ lagen: atlas ? atlas.lagen : 0, bladen: bladen.length });
  G.weg = function (r) {
    if (!gl || !r) return;
    gl.deleteBuffer(r.buf);
    gl.deleteVertexArray(r.vao);
  };
  // De mist per tegel van een opdracht naar de kaart, één keer (het masker en het doek gebruiken hem allebei).
  function standVanVast(o) {
    if (o.opgestuurd) return;
    o.opgestuurd = true;
    const s = o.stand;
    standTex = vasteTextuur(STAND_PLAATS, standTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8, s.b, s.h, 0, gl.RED, gl.UNSIGNED_BYTE, s.perTegel);
    vasteTextuurKlaar();
  }
  function tekenVast(o, opMasker) {
    standVanVast(o);
    gebruik(vastProg);
    zetMaat(vastProg);
    const u = vastProg.u;
    const m = o.m;
    const s = o.stand;
    gl.uniform2f(u.uZoom, m[0], m[3]);
    gl.uniform4fv(u.uWind, s.wind);
    gl.uniform2f(u.uGrijs, s.grijs[0], s.grijs[1]);
    gl.uniform1f(u.uLaag, atlas ? atlas.maat : LAAG);
    gl.uniform3f(u.uZon, opMasker ? 1 : 0, opMasker ? schaduwOp.sx : 0, opMasker ? schaduwOp.sy : 0);
    gl.uniform1f(u.uMasker, opMasker ? 1 : 0);
    gl.uniform1f(u.uHard, opMasker ? 0 : 1);
    zetMeng('source-over');
    zetDiep(opMasker ? 'uit' : 'schrijf');
    for (const r of o.stukken) {
      gl.uniform2f(u.uStuk, m[0] * r.px + m[4], m[3] * r.py + m[5]);
      gl.uniform2i(u.uTegel, r.tx, r.ty);
      gl.uniform4f(u.uDiepte, r.som, s.schaal, s.stap, r.rang);
      gl.bindVertexArray(r.rij.vao);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, r.rij.n);
      G.telling.opdrachten++;
      if (!opMasker) G.telling.vast += r.rij.n;
    }
    gl.bindVertexArray(null);
    if (!opMasker) zetDiep('toets');
  }
  // De vaste rijen van de grond (VERT_GROND, Doek.tekenGrond), stuk na stuk in de volgorde van de lijst.
  function tekenGrond(o) {
    gebruik(grondProg);
    zetMaat(grondProg);
    const u = grondProg.u;
    const m = o.m;
    gl.uniform2f(u.uZoom, m[0], m[3]);
    gl.uniform2fv(u.uVel, o.maten);
    gl.uniform1f(u.uLaag, atlas ? atlas.maat : LAAG);
    gl.uniform1f(u.uSneeuwL, o.sneeuw.laag);
    gl.uniform1f(u.uSneeuwN, o.sneeuw.tabel.length / 4 - 1);
    gl.uniform4fv(u.uSneeuw, o.sneeuw.tabel);
    for (let i = 0; i < o.vellen.length; i++) bindOp(i, o.vellen[i].tex);
    zetMeng('source-over');
    zetDiep('uit');
    for (const r of o.stukken) {
      gl.uniform2f(u.uStuk, m[0] * r.px + m[4], m[3] * r.py + m[5]);
      gl.bindVertexArray(r.rij.vao);
      gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, r.rij.n);
      G.telling.opdrachten++;
      G.telling.grond += r.rij.n;
    }
    gl.bindVertexArray(null);
  }

  // ---------------------------------------------------------------- het kladdoek
  let klad = null; // { canvas, ctx }
  let kladVak = null; // [x0, y0, x1, y1] in pixels waarop getekend werd, of null
  let kladMeng = 'source-over';
  // Werd er sinds het laatste wissen op het kladdoek getekend (opKlad)? Anders is het nog leeg, en hoeft G.begin het niet
  // te wissen: ver uitgezoomd tekent het meestal niets, en een doek zo groot als het scherm wissen kostte in Firefox elk
  // beeld (17 okt).
  let kladBeschreven = true;
  let plak = null; // een klein doek om een stuk van het kladdoek naar de kaart te sturen
  function kladdoek() {
    if (!klad || klad.canvas.width !== doek.width || klad.canvas.height !== doek.height) {
      const c = document.createElement('canvas');
      c.width = doek.width;
      c.height = doek.height;
      klad = { canvas: c, ctx: c.getContext('2d') };
    }
    return klad;
  }
  // Het stuk van het kladdoek waarop getekend werd, als plaatje naar de kaart, met de modus waarmee het getekend werd.
  function legKladAf() {
    if (!kladVak) return;
    const x0 = Math.max(0, Math.floor(kladVak[0]));
    const y0 = Math.max(0, Math.floor(kladVak[1]));
    const x1 = Math.min(doek.width, Math.ceil(kladVak[2]));
    const y1 = Math.min(doek.height, Math.ceil(kladVak[3]));
    kladVak = null;
    if (x1 <= x0 || y1 <= y0) return;
    const b = x1 - x0;
    const h = y1 - y0;
    if (!plak) plak = document.createElement('canvas');
    if (plak.width < b || plak.height < h) {
      plak.width = Math.max(plak.width, b);
      plak.height = Math.max(plak.height, h);
    }
    const pc = plak.getContext('2d');
    pc.clearRect(0, 0, b, h);
    pc.drawImage(klad.canvas, x0, y0, b, h, 0, 0, b, h);
    const k = klad.ctx;
    k.save();
    k.setTransform(1, 0, 0, 1, 0, 0);
    k.clearRect(x0, y0, b, h);
    k.restore();
    plak.versie = (plak.versie || 0) + 1;
    const t = textuurVan(plak);
    if (!t) return;
    plekVoor(t.tex, MENG[kladMeng] ? kladMeng : 'source-over', 1, t.laag, PLAATJES);
    const grijs = grijsNu; // het kladdoek tekende al met het filter
    grijsNu = 0;
    zetInst(x0, y0, x1, y0, x0, y1, x1, y1, 0, 0, b / t.tb, h / t.th, 1, 1, 1, 1, 0, 0);
    grijsNu = grijs;
    G.telling.klad++;
    G.telling.kladPixels += b * h;
  }

  // ---------------------------------------------------------------- het doek dat zich voordoet als 2D
  const SNEL_MENG = new Set(['source-over', 'source-atop', 'destination-over', 'destination-out', 'destination-in', 'lighter']);
  const verlopen = new WeakMap(); // CanvasGradient → { x, y, r0, r1, stops }

  class Doek {
    constructor() {
      this.st = { m: [1, 0, 0, 1, 0, 0], alpha: 1, meng: 'source-over', filter: 'none', helder: 1, grijs: 0, vul: '#000', clip: false };
      this.stapel = [];
      this.pad = []; // deelpaden: { p: [x, y, ...] in pixels, bol: true als het een ellips of cirkel is }
      this.padRond = false; // het pad heeft bochten die het snelle pad niet kent
      this.werptSchaduw = false; // na schaduwHier: wat drawImage nu tekent, werpt een schaduw (js/tekenen.js zet het per item)
      this.dieptesleutel = null;
    }
    get canvas() {
      return doek;
    }
    get k() {
      return kladdoek().ctx;
    }
    // ---- de stand
    save() {
      this.stapel.push({ ...this.st, m: this.st.m.slice() });
      this.k.save();
    }
    restore() {
      if (this.stapel.length) this.st = this.stapel.pop();
      this.k.restore();
      grijsNu = this.st.grijs || 0;
    }
    setTransform(a, b, c, d, e, f) {
      if (typeof a === 'object') ({ a, b, c, d, e, f } = a);
      this.st.m = [a, b, c, d, e, f];
      this.k.setTransform(a, b, c, d, e, f);
    }
    resetTransform() {
      this.setTransform(1, 0, 0, 1, 0, 0);
    }
    transform(a, b, c, d, e, f) {
      const m = this.st.m;
      this.st.m = [m[0] * a + m[2] * b, m[1] * a + m[3] * b, m[0] * c + m[2] * d, m[1] * c + m[3] * d, m[0] * e + m[2] * f + m[4], m[1] * e + m[3] * f + m[5]];
      this.k.transform(a, b, c, d, e, f);
    }
    translate(x, y) {
      this.transform(1, 0, 0, 1, x, y);
    }
    scale(x, y) {
      this.transform(x, 0, 0, y, 0, 0);
    }
    getTransform() {
      const m = this.st.m;
      return new DOMMatrix([m[0], m[1], m[2], m[3], m[4], m[5]]);
    }
    get globalAlpha() {
      return this.st.alpha;
    }
    set globalAlpha(a) {
      if (!Number.isFinite(a) || a < 0 || a > 1) return;
      this.st.alpha = a;
      this.k.globalAlpha = a;
    }
    get globalCompositeOperation() {
      return this.st.meng;
    }
    set globalCompositeOperation(m) {
      this.st.meng = m;
    }
    get filter() {
      return this.st.filter;
    }
    // De kaart kent helderheid en grijs (grayscale, voor de mist; js/tekenen.js, mistOverLijst), samen in die volgorde.
    // Het kladdoek krijgt het filter pas als het hem nodig heeft (opKlad), net als fillStyle: de mist zet het om elk
    // plaatje in het grijs heen en terug, en een 2D-doek leest de tekst van een filter elke keer opnieuw. In Firefox was
    // dat 29% van het tekenen (17 okt, een profiel van Marcel).
    set filter(f) {
      this.st.filter = f;
      const { helder, grijs } = filterVan(f);
      this.st.helder = helder;
      this.st.grijs = grijs;
      grijsNu = grijs;
    }
    get fillStyle() {
      return this.st.vul;
    }
    set fillStyle(v) {
      this.st.vul = v; // het kladdoek krijgt hem pas als het hem nodig heeft (opKlad): de kaart leest hem zelf
    }
    get imageSmoothingEnabled() {
      return false;
    }
    set imageSmoothingEnabled(v) {
      this.k.imageSmoothingEnabled = v;
    }
    createRadialGradient(x0, y0, r0, x1, y1, r1) {
      const v = this.k.createRadialGradient(x0, y0, r0, x1, y1, r1);
      if (x0 === x1 && y0 === y1) {
        const info = { x: x0, y: y0, r0, r1, stops: [] };
        verlopen.set(v, info);
        const zet = v.addColorStop.bind(v);
        v.addColorStop = (o, k) => {
          info.stops.push([o, leesKleur(k)]);
          zet(o, k);
        };
      }
      return v;
    }
    createLinearGradient(...a) {
      return this.k.createLinearGradient(...a);
    }
    createPattern(...a) {
      return this.k.createPattern(...a);
    }
    measureText(t) {
      return this.k.measureText(t);
    }
    // ---- kan de kaart dit zelf?
    snel() {
      return !this.st.clip && this.st.helder !== null && SNEL_MENG.has(this.st.meng);
    }
    // Waar het kladdoek nu op tekent: met welke modus, en vóór alles wat de kaart zelf daarna tekent.
    opKlad(vak, f) {
      const meng = this.st.meng === 'destination-over' ? 'destination-over' : this.st.meng;
      if (kladVak && meng !== kladMeng) legKladAf();
      kladMeng = meng;
      const k = this.k;
      k.globalCompositeOperation = meng === 'destination-over' ? 'destination-over' : 'source-over';
      k.fillStyle = this.st.vul;
      if (k.filter !== this.st.filter) k.filter = this.st.filter;
      kladBeschreven = true;
      f(k);
      const v = vak || [0, 0, doek.width, doek.height];
      kladVak = kladVak ? [Math.min(kladVak[0], v[0]), Math.min(kladVak[1], v[1]), Math.max(kladVak[2], v[2]), Math.max(kladVak[3], v[3])] : v.slice();
    }
    // Het vak op het doek (pixels) van een rechthoek in de vlakte, met een rand.
    vakVan(x0, y0, x1, y1, rand) {
      const m = this.st.m;
      const xs = [];
      const ys = [];
      for (const [x, y] of [[x0, y0], [x1, y0], [x0, y1], [x1, y1]]) {
        xs.push(m[0] * x + m[2] * y + m[4]);
        ys.push(m[1] * x + m[3] * y + m[5]);
      }
      const r = (rand || 0) * Math.hypot(m[0], m[1]) + 2;
      return [Math.min(...xs) - r, Math.min(...ys) - r, Math.max(...xs) + r, Math.max(...ys) + r];
    }
    // ---- de vaste rijen en de diepte (vraag 178, B1 en B2; js/tekenen.js, "de vaste rijen")
    // `stukken`: per stuk { rij (G.vasteRij), px, py (waar het stuk begint, in pixels van de vlakte), tx, ty (zijn eerste
    // tegel min die van de mist per tegel), som (de som x + y van die eerste tegel min d0), rang (het hoeveelste stuk) };
    // `stand`: { wind (de stand per fase, 100 getallen), perTegel, b, h (de mist per tegel: 0 niet, 128 grijs, 255
    // helder), grijs ([hoeveel kleur eruit, hoe helder]), d0, schaal (van de sleutel naar het doek), stap (per rij) }.
    // Wat erna komt met een diepte (Doek.diepte), toetst tegen wat ze schrijven. Geeft false als het niet kan (een doek
    // dat gedraaid staat).
    tekenVast(stukken, stand) {
      const m = this.st.m;
      if (m[1] || m[2]) return false;
      legKladAf();
      legRijAf();
      diepteBasis = { d0: stand.d0, schaal: stand.schaal };
      opdrachten.push({ soort: VAST, stukken, stand, m: m.slice(), werpt: schaduwOp !== null, opgestuurd: false });
      return true;
    }
    // De grond als vaste rijen (de renderproef, stap 1 tot 3; js/tekenen.js, "de grond op de kaart"): `stukken` per rij
    // { rij (G.vasteRij, VERT_GROND), px, py (waar zijn getallen beginnen, in pixels van de vlakte) }, in de volgorde
    // waarin ze over elkaar gaan; `vellen` de vellen van de grond (hooguit RIJ_TEXTUREN, niet op de stapel; wat erop ligt,
    // staat op de stapel); `sneeuw` { laag, tabel } voor de sneeuw (VERT_GROND). Geeft false als het niet kan (een doek dat
    // gedraaid staat, een vel dat nog niet op de kaart kan).
    tekenGrond(stukken, vellen, sneeuw) {
      const m = this.st.m;
      if (m[1] || m[2] || vellen.length > RIJ_TEXTUREN) return false;
      const t = vellen.map(textuurVan);
      if (t.some((x) => !x || x.blad)) return false;
      legKladAf();
      legRijAf();
      const maten = new Float32Array(RIJ_TEXTUREN * 2);
      t.forEach((x, i) => maten.set([x.tb, x.th], i * 2));
      opdrachten.push({ soort: GROND, stukken, vellen: t, maten, sneeuw, m: m.slice() });
      return true;
    }
    // De sleutel van het sorteren (js/tekenen.js, diepteVanItem) van wat nu getekend wordt, of null: dan zonder diepte.
    get diepte() {
      return this.dieptesleutel;
    }
    set diepte(k) {
      const z = k == null || !diepteBasis ? null : Math.max(-0.999999, Math.min(0.999999, 1 - (k - diepteBasis.d0) * diepteBasis.schaal));
      this.dieptesleutel = k;
      if (z === diepteNu) return;
      if (kladVak) legKladAf();
      diepteNu = z;
    }
    // ---- de mist (js/tekenen.js, tekenMist en mistOpDeKaart; B2c): `masker` is { gekend, versie, kijkers, n, b, h }, wat
    // je kent per tegel (rood hoeveel kleur eruit gaat, groen hoeveel donkerder) en wie er kijkt, met pixel (0, 0) op tegel
    // (net.x0, net.y0); net.stukken de punten van het net (tekenNet), in pixels van de wereld, die de stand op het doek zet.
    tekenMist(masker, zwart, net) {
      legKladAf();
      const m = this.st.m;
      const kijkers = masker.kijkers.slice(0, masker.n * 4); // het masker van dit beeld: js/tekenen.js schrijft er het volgende in
      const M = { gekend: masker.gekend, versie: masker.versie, kijkers, n: masker.n, b: masker.b, h: masker.h };
      doe(() => tekenMistOpDeKaart(M, zwart, m, net));
    }
    // ---- plaatjes
    // Zonder ...a: geen lijstje per aanroep (17 okt, E1), want het gaat om duizenden per beeld.
    drawImage(bron, a0, a1, a2, a3, a4, a5, a6, a7) {
      if (!bron) return;
      const n = arguments.length;
      let sx = 0;
      let sy = 0;
      let sw;
      let sh;
      let dx;
      let dy;
      let dw;
      let dh;
      if (n === 3 || n === 5) {
        sw = bron.naturalWidth || bron.width;
        sh = bron.naturalHeight || bron.height;
        dx = a0;
        dy = a1;
        dw = n === 3 ? sw : a2;
        dh = n === 3 ? sh : a3;
      } else [sx, sy, sw, sh, dx, dy, dw, dh] = [a0, a1, a2, a3, a4, a5, a6, a7];
      if (this.snel()) {
        if (kladVak) legKladAf();
        const t = textuurVan(bron);
        if (t) {
          if (t.blad && (sx < 0 || sy < 0 || sx + sw > t.b || sy + sh > t.h)) {
            const r = binnenDeBron(t, sx, sy, sw, sh, dx, dy, dw, dh);
            if (!r) return;
            [sx, sy, sw, sh, dx, dy, dw, dh] = r;
          }
          const al = this.st.alpha;
          plekVoor(t.tex, this.st.meng, 1, t.laag, PLAATJES);
          const werpt = this.werptSchaduw && schaduwOp !== null && dw !== 0;
          const m = this.st.m;
          const h = this.st.helder * al;
          const x1 = dx + dw;
          const y1 = dy + dh;
          zetInst(
            m[0] * dx + m[2] * dy + m[4], m[1] * dx + m[3] * dy + m[5], m[0] * x1 + m[2] * dy + m[4], m[1] * x1 + m[3] * dy + m[5],
            m[0] * dx + m[2] * y1 + m[4], m[1] * dx + m[3] * y1 + m[5], m[0] * x1 + m[2] * y1 + m[4], m[1] * x1 + m[3] * y1 + m[5],
            (t.x + sx) / t.tb, (t.y + sy) / t.th, (t.x + sx + sw) / t.tb, (t.y + sy + sh) / t.th, h, h, h, al, werpt ? WERPT : 0, werpt ? dh / dw : 0,
          );
          G.telling.plaatjes++;
          return;
        }
      }
      const a = n === 3 ? [a0, a1] : n === 5 ? [a0, a1, a2, a3] : [a0, a1, a2, a3, a4, a5, a6, a7];
      this.opKlad(this.vakVan(dx, dy, dx + dw, dy + dh), (k) => k.drawImage(bron, ...a));
    }
    // Het hele plaatje `bron` op (dx, dy) tot (dx + dw, dy + dh), maar alleen binnen `vlakken`, vierhoeken [x0, y0, ...,
    // x3, y3] in de vlakte (js/tekenen.js, tekenTegelOpnieuw; vraag 174, c): wat een knip doet, als driehoeken met de
    // plek in de textuur, zodat het niet over het kladdoek gaat. Kan de kaart het niet, dan het kladdoek met een knip.
    tekenUitgeknipt(bron, dx, dy, dw, dh, vlakken) {
      const t = this.snel() ? textuurVan(bron) : null;
      if (!t) {
        this.opKlad(this.vakVan(dx, dy, dx + dw, dy + dh), (k) => {
          k.save();
          k.beginPath();
          for (const v of vlakken) {
            k.moveTo(v[0], v[1]);
            for (let i = 2; i < v.length; i += 2) k.lineTo(v[i], v[i + 1]);
            k.closePath();
          }
          k.clip();
          k.drawImage(bron, dx, dy, dw, dh);
          k.restore();
        });
        return;
      }
      if (kladVak) legKladAf();
      const delen = [];
      let vieren = 0; // twee driehoeken per vier hoeken (maakIndex)
      for (const v of vlakken) {
        for (const d of driehoekenVan(v)) {
          const p = knipOpVak(d, dx, dy, dx + dw, dy + dh);
          if (p.length < 6) continue;
          delen.push(p);
          vieren += Math.ceil((p.length / 2 - 2) / 2);
        }
      }
      if (!vieren) return;
      const m = this.st.m;
      const al = this.st.alpha;
      const h = this.st.helder * al;
      const fu = (bron.naturalWidth || bron.width) / dw / t.tb;
      const fv = (bron.naturalHeight || bron.height) / dh / t.th;
      plekVoor(t.tex, this.st.meng, vieren * 4, t.laag);
      const hk = (p, i) => {
        const x = p[2 * i];
        const y = p[2 * i + 1];
        hoekH(m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5], t.x / t.tb + (x - dx) * fu, t.y / t.th + (y - dy) * fv, h, al);
      };
      // een waaier uit punt 0, twee driehoeken (0 i i+1) en (0 i+1 i+2) per keer: a = i, b = i+1, c = 0, d = i+2
      for (const p of delen) {
        const n = p.length / 2;
        for (let i = 1; i < n - 1; i += 2) {
          hk(p, i);
          hk(p, i + 1);
          hk(p, 0);
          hk(p, i + 2 < n ? i + 2 : i + 1); // een driehoek over: de tweede valt weg
        }
      }
      G.telling.plaatjes++;
    }
    // ---- vlakken
    fillRect(x, y, b, h) {
      const v = this.st.vul;
      const verloop = typeof v === 'object' ? verlopen.get(v) : null;
      if (this.snel() && (typeof v === 'string' || verloop)) {
        if (kladVak) legKladAf();
        const m = this.st.m;
        const p = [];
        for (const [px, py] of [[x, y], [x + b, y], [x, y + h], [x + b, y + h]]) p.push(m[0] * px + m[2] * py + m[4], m[1] * px + m[3] * py + m[5]);
        if (verloop) {
          if (verloop.stops.length >= 1 && verloop.stops.length <= 4) {
            tekenVerloop([p[0], p[1], p[2], p[3], p[4], p[5], p[2], p[3], p[6], p[7], p[4], p[5]], verloop, m, this.st.alpha, this.st.meng);
            return;
          }
        } else {
          const k = leesKleur(v);
          const a = k[3] * this.st.alpha;
          plekVoor(wit, this.st.meng, 1, -1, PLAATJES);
          vierhoek(p, 0, 0, 1, 1, [k[0] * a, k[1] * a, k[2] * a, a]);
          return;
        }
      }
      this.opKlad(this.vakVan(x, y, x + b, y + h), (k) => k.fillRect(x, y, b, h));
    }
    // Veel rechthoeken in de kleur van fillStyle (r: x, y, b, h per vlak, n stuks), zoals n keer fillRect, maar zonder het
    // werk per aanroep (de regen; js/tekenen.js, tekenNeerslag).
    vlakjes(r, n) {
      const v = this.st.vul;
      if (!this.snel() || typeof v !== 'string') {
        for (let i = 0; i < n; i++) this.fillRect(r[4 * i], r[4 * i + 1], r[4 * i + 2], r[4 * i + 3]);
        return;
      }
      if (kladVak) legKladAf();
      const m = this.st.m;
      const k = leesKleur(v);
      const a = k[3] * this.st.alpha;
      const [k0, k1, k2] = [k[0] * a, k[1] * a, k[2] * a];
      plekVoor(wit, this.st.meng, n, -1, PLAATJES);
      for (let i = 0; i < n; i++) {
        const x = r[4 * i];
        const y = r[4 * i + 1];
        const x1 = x + r[4 * i + 2];
        const y1 = y + r[4 * i + 3];
        zetInst(
          m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5], m[0] * x1 + m[2] * y + m[4], m[1] * x1 + m[3] * y + m[5],
          m[0] * x + m[2] * y1 + m[4], m[1] * x + m[3] * y1 + m[5], m[0] * x1 + m[2] * y1 + m[4], m[1] * x1 + m[3] * y1 + m[5],
          0, 0, 1, 1, k0, k1, k2, a, 0, 0,
        );
      }
    }
    clearRect(x, y, b, h) {
      if (!this.st.clip) {
        if (kladVak) legKladAf();
        const m = this.st.m;
        const p = [];
        for (const [px, py] of [[x, y], [x + b, y], [x, y + h], [x + b, y + h]]) p.push(m[0] * px + m[2] * py + m[4], m[1] * px + m[3] * py + m[5]);
        plekVoor(wit, 'wis', 1, -1, PLAATJES);
        vierhoek(p, 0, 0, 1, 1, [0, 0, 0, 0]);
        return;
      }
      this.opKlad(this.vakVan(x, y, x + b, y + h), (k) => k.clearRect(x, y, b, h));
    }
    // ---- paden: het kladdoek krijgt ze altijd mee; de kaart tekent ze zelf als het bolle vormen zijn
    beginPath() {
      this.pad = [];
      this.padRond = false;
      this.k.beginPath();
    }
    punt(x, y) {
      const m = this.st.m;
      return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
    }
    moveTo(x, y) {
      this.pad.push({ p: this.punt(x, y), bol: false });
      this.k.moveTo(x, y);
    }
    lineTo(x, y) {
      if (!this.pad.length) this.pad.push({ p: [], bol: false });
      this.pad[this.pad.length - 1].p.push(...this.punt(x, y));
      this.k.lineTo(x, y);
    }
    closePath() {
      this.k.closePath();
    }
    rect(x, y, b, h) {
      this.pad.push({ p: [...this.punt(x, y), ...this.punt(x + b, y), ...this.punt(x + b, y + h), ...this.punt(x, y + h)], bol: false });
      this.k.rect(x, y, b, h);
    }
    ellipse(x, y, rx, ry, draai, van, tot, tegen) {
      const vol = Math.abs(tot - van) >= Math.PI * 2 - 1e-6 && !draai && !tegen;
      const p = [];
      const n = Math.max(12, Math.min(64, Math.ceil(Math.max(rx, ry) * Math.hypot(this.st.m[0], this.st.m[1]))));
      const stappen = vol ? n : Math.max(4, Math.ceil((n * Math.abs(tot - van)) / (Math.PI * 2)));
      for (let i = 0; i <= stappen - (vol ? 1 : 0); i++) {
        const h = van + ((tot - van) * i) / stappen;
        p.push(...this.punt(x + Math.cos(h) * rx, y + Math.sin(h) * ry));
      }
      if (vol) this.pad.push({ p, bol: true });
      else {
        this.padRond = true;
        this.pad.push({ p, bol: false });
      }
      this.k.ellipse(x, y, rx, ry, draai, van, tot, tegen);
    }
    arc(x, y, r, van, tot, tegen) {
      this.ellipse(x, y, r, r, 0, van, tot, tegen);
    }
    quadraticCurveTo(...a) {
      this.padRond = true;
      if (this.pad.length) this.pad[this.pad.length - 1].p.push(...this.punt(a[0], a[1]), ...this.punt(a[2], a[3]));
      this.k.quadraticCurveTo(...a);
    }
    bezierCurveTo(...a) {
      this.padRond = true;
      if (this.pad.length) for (let i = 0; i < 6; i += 2) this.pad[this.pad.length - 1].p.push(...this.punt(a[i], a[i + 1]));
      this.k.bezierCurveTo(...a);
    }
    arcTo(...a) {
      this.padRond = true;
      if (this.pad.length) this.pad[this.pad.length - 1].p.push(...this.punt(a[0], a[1]), ...this.punt(a[2], a[3]));
      this.k.arcTo(...a);
    }
    roundRect(x, y, b, h, r) {
      this.padRond = true;
      this.pad.push({ p: [...this.punt(x, y), ...this.punt(x + b, y), ...this.punt(x + b, y + h), ...this.punt(x, y + h)], bol: false });
      this.k.roundRect(x, y, b, h, r);
    }
    // Het vak van het pad op het doek (pixels), met een rand voor een lijn.
    padVak(rand) {
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      for (const d of this.pad) {
        for (let i = 0; i < d.p.length; i += 2) {
          x0 = Math.min(x0, d.p[i]);
          x1 = Math.max(x1, d.p[i]);
          y0 = Math.min(y0, d.p[i + 1]);
          y1 = Math.max(y1, d.p[i + 1]);
        }
      }
      if (x0 === Infinity) return null;
      const r = (rand || 0) + 2;
      return [x0 - r, y0 - r, x1 + r, y1 + r];
    }
    fill(...a) {
      const v = this.st.vul;
      const verloop = typeof v === 'object' ? verlopen.get(v) : null;
      if (!a.length && this.snel() && !this.padRond && (typeof v === 'string' || verloop) && this.pad.length && this.pad.every(bolPad)) {
        if (kladVak) legKladAf();
        const drie = [];
        for (const d of this.pad) {
          const p = d.p;
          for (let i = 2; i + 3 < p.length; i += 2) drie.push(p[0], p[1], p[i], p[i + 1], p[i + 2], p[i + 3]);
        }
        if (verloop && verloop.stops.length >= 1 && verloop.stops.length <= 4) {
          tekenVerloop(drie, verloop, this.st.m, this.st.alpha, this.st.meng);
          return;
        }
        if (!verloop) {
          const k = leesKleur(v);
          const al = k[3] * this.st.alpha;
          const kl = [k[0] * al, k[1] * al, k[2] * al, al];
          plekVoor(wit, this.st.meng, drie.length / 6, -1, PLAATJES);
          // per driehoek één instantie (zijn vierde hoek valt op de derde, VERT_INST)
          for (let i = 0; i < drie.length; i += 6) {
            zetInst(drie[i], drie[i + 1], drie[i + 2], drie[i + 3], drie[i + 4], drie[i + 5], drie[i + 4], drie[i + 5], 0, 0, 0, 0, kl[0], kl[1], kl[2], kl[3], DRIEHOEK, 0);
          }
          G.telling.vormen++;
          return;
        }
      }
      this.opKlad(this.padVak(0), (k) => k.fill(...a));
    }
    stroke(...a) {
      this.opKlad(this.padVak(this.k.lineWidth * Math.hypot(this.st.m[0], this.st.m[1])), (k) => k.stroke(...a));
    }
    clip(...a) {
      this.st.clip = true;
      this.k.clip(...a);
    }
    // ---- tekst
    tekstVak(t, x, y) {
      const w = this.k.measureText(t).width;
      const grootte = Number((/(\d+(?:\.\d+)?)px/.exec(this.k.font) || [0, 16])[1]);
      return this.vakVan(x - w, y - grootte * 1.5, x + w, y + grootte * 1.5, 4);
    }
    fillText(t, x, y, ...a) {
      this.opKlad(this.tekstVak(t, x, y), (k) => k.fillText(t, x, y, ...a));
    }
    strokeText(t, x, y, ...a) {
      this.opKlad(this.tekstVak(t, x, y), (k) => k.strokeText(t, x, y, ...a));
    }
    putImageData(...a) {
      legRijAf();
      this.opKlad(null, (k) => k.putImageData(...a));
    }
    // Het licht (vraag 125, A; tekenNacht in js/tekenen.js): de kleur van het uur, [r, g, b] van 0 tot 1, en de plassen
    // licht { x, y, rx, ry, k } in de vlakte van nu. Wat al klaarstaat, eerst; overdag zonder lampen doet het niets.
    tekenLichtkaart(kleur, plassen) {
      if (!plassen.length && kleur.every((c) => c > 0.999)) return;
      legKladAf();
      const m = this.st.m;
      const s = Math.hypot(m[0], m[1]);
      const pl = plassen.map((p) => ({ x: m[0] * p.x + m[2] * p.y + m[4], y: m[1] * p.x + m[3] * p.y + m[5], rx: p.rx * s, ry: p.ry * s, k: p.k }));
      doe(() => tekenLicht(kleur, pl));
    }
    // De schaduwen van de zon (vraag 125, B; tekenZonneschaduw in js/tekenen.js): hier komt het masker in één keer over
    // wat er al staat, met deze dekking en kleur ([r, g, b]). Wat daarna getekend wordt met werptSchaduw aan (elk item van
    // de tekenlijst dat een schaduw heeft), staat erop als silhouet, scheef met (sx, sy) per pixel hoogte in de vlakte van
    // het plaatje (maskerRonde, in G.klaar). Geeft true: de schaduw komt uit de rij, de lijst hoeft niet nog eens.
    schaduwHier(sx, sy, dekking, kleur) {
      legKladAf();
      schaduwOp = { sx, sy };
      doe(() => {
        gebruik(schaduwProg);
        gl.uniform1i(schaduwProg.u.uMasker, 0);
        gl.uniform4f(schaduwProg.u.uKleur, kleur[0] * dekking, kleur[1] * dekking, kleur[2] * dekking, dekking);
        bind(maskerVan().tex);
        zetMeng('source-over');
        overHetDoek(schaduwProg);
      });
      return true;
    }
    // Eén pixel teruglezen (het gereedschap van het meten): alles wat klaarstaat, eerst tekenen.
    getImageData(x, y, b, h) {
      G.klaar();
      const uit = new Uint8ClampedArray(b * h * 4);
      gl.readPixels(x, doek.height - y - h, b, h, gl.RGBA, gl.UNSIGNED_BYTE, uit);
      return { width: b, height: h, data: uit };
    }
  }
  // De rest van wat een 2D-doek kent (lijnen, letters), alleen voor het kladdoek.
  for (const naam of ['strokeStyle', 'lineWidth', 'lineCap', 'lineJoin', 'miterLimit', 'font', 'textAlign', 'textBaseline', 'direction', 'lineDashOffset', 'shadowColor', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY', 'imageSmoothingQuality', 'letterSpacing']) {
    Object.defineProperty(Doek.prototype, naam, {
      get() {
        return this.k[naam];
      },
      set(v) {
        this.k[naam] = v;
      },
    });
  }
  Doek.prototype.setLineDash = function (d) {
    this.k.setLineDash(d);
  };
  Doek.prototype.getLineDash = function () {
    return this.k.getLineDash();
  };
  // Is een deelpad een bolle vorm, die de kaart als een waaier van driehoeken mag vullen?
  function bolPad(d) {
    const p = d.p;
    if (d.bol) return true;
    const n = p.length / 2;
    if (n < 3) return false;
    let teken = 0;
    for (let i = 0; i < n; i++) {
      const [ax, ay] = [p[2 * i], p[2 * i + 1]];
      const [bx, by] = [p[(2 * i + 2) % p.length], p[(2 * i + 3) % p.length]];
      const [cx, cy] = [p[(2 * i + 4) % p.length], p[(2 * i + 5) % p.length]];
      const z = (bx - ax) * (cy - by) - (by - ay) * (cx - bx);
      if (Math.abs(z) < 1e-9) continue;
      if (teken && Math.sign(z) !== teken) return false;
      teken = Math.sign(z);
    }
    return true;
  }

  // ---------------------------------------------------------------- een beeld
  let hetDoek = null;
  G.telling = { plaatjes: 0, vormen: 0, opdrachten: 0, klad: 0, kladPixels: 0, opgestuurd: 0, lampen: 0, mist: 0, vast: 0, grond: 0 };
  // Het doek even groot als dat van de browser (formaat in js/main.js), met dezelfde ratio.
  G.zetMaat = function (b, h, r) {
    if (!start()) return;
    ratio = r;
    if (doek.width !== b) doek.width = b;
    if (doek.height !== h) doek.height = h;
  };
  // Een nieuw beeld: het doek om op te tekenen, met de stand van het doek van de browser (de ratio).
  G.begin = function () {
    if (!start()) return null;
    if (!hetDoek) hetDoek = new Doek();
    hetDoek.st = { m: [ratio, 0, 0, ratio, 0, 0], alpha: 1, meng: 'source-over', filter: 'none', helder: 1, grijs: 0, vul: '#000', clip: false };
    grijsNu = 0;
    hetDoek.stapel = [];
    hetDoek.werptSchaduw = false;
    hetDoek.dieptesleutel = null;
    diepteNu = null;
    diepteBasis = null;
    rijDiep = false;
    const k = kladdoek().ctx;
    if (kladBeschreven) {
      k.setTransform(1, 0, 0, 1, 0, 0);
      k.clearRect(0, 0, klad.canvas.width, klad.canvas.height);
      kladBeschreven = false;
    }
    k.setTransform(ratio, 0, 0, ratio, 0, 0);
    k.globalAlpha = 1;
    k.filter = 'none';
    kladVak = null;
    for (const s in G.telling) G.telling[s] = 0;
    opdrachten.length = 0;
    hoekAantal = 0;
    instAantal = 0;
    aantal = 0;
    rij.length = 0;
    schaduwOp = null;
    gewist = false;
    beeldNr++;
    begintijd();
    return hetDoek;
  };
  // ---------------------------------------------------------------- hoe lang de kaart over een beeld doet
  // Voor de meter (F2, js/main.js; Marcel, 18 okt: "de meter met de videokaart"): de tijd die de kaart zelf aan een beeld
  // werkt, van G.begin tot het eind van G.klaar, met de tijdmeter van de kaart (EXT_disjoint_timer_query_webgl2). De meter
  // in de processor ziet die niet: de kaart werkt na, terwijl het spel al verder is (`snelheid.md`, "Het advies van
  // buiten"). Chromium (en Electron) heeft hem meestal, Firefox niet; dan blijft het onbekend. De uitslag van een beeld
  // komt een paar beelden later, dus de meter telt wat er binnen is. Alleen zolang de meter aan staat.
  let tijdmeter = null; // { ext, vrij: [...], wacht: [...], loopt, n, som, max }, of null als hij uit staat
  G.meetKaart = function (aan) {
    if (tijdmeter && tijdmeter.loopt) gl.endQuery(tijdmeter.ext.TIME_ELAPSED_EXT); // anders weigert de kaart de volgende
    if (!aan || !start()) {
      tijdmeter = null;
      return false;
    }
    const ext = gl.getExtension('EXT_disjoint_timer_query_webgl2'); // geen tekst
    tijdmeter = ext ? { ext, vrij: [], wacht: [], loopt: null, n: 0, som: 0, max: 0 } : null;
    return !!tijdmeter;
  };
  // Wat er sinds de vorige vraag binnenkwam: { n, gem, max } in ms, of null (geen tijdmeter, of nog niets binnen).
  G.kaartTijden = function () {
    const m = tijdmeter;
    if (!m || !m.n) return null;
    const uit = { n: m.n, gem: m.som / m.n, max: m.max };
    Object.assign(m, { n: 0, som: 0, max: 0 });
    return uit;
  };
  function begintijd() {
    const m = tijdmeter;
    if (!m || m.loopt) return;
    m.loopt = m.vrij.pop() || gl.createQuery();
    gl.beginQuery(m.ext.TIME_ELAPSED_EXT, m.loopt);
  }
  function eindtijd() {
    const m = tijdmeter;
    if (!m || !m.loopt) return;
    gl.endQuery(m.ext.TIME_ELAPSED_EXT);
    m.wacht.push(m.loopt);
    m.loopt = null;
    // wat klaar is, van oud naar nieuw; liep er iets mis (de kaart deed iets anders tussendoor), dan telt het niet
    const mis = gl.getParameter(m.ext.GPU_DISJOINT_EXT);
    while (m.wacht.length && gl.getQueryParameter(m.wacht[0], gl.QUERY_RESULT_AVAILABLE)) {
      const q = m.wacht.shift();
      if (!mis) {
        const ms = gl.getQueryParameter(q, gl.QUERY_RESULT) / 1e6;
        m.n++;
        m.som += ms;
        if (ms > m.max) m.max = ms;
      }
      m.vrij.push(q);
    }
  }

  // Wachten tot de kaart klaar is met het beeld (het gereedschap van het meten): één pixel teruglezen.
  G.wacht = function () {
    if (!gl) return;
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  };
  // Het beeld af: alles naar de kaart, in de volgorde van de opdrachten. Eerst de rijen in één keer (de hoeken en de
  // plaatjes van het hele beeld), dan het masker van de schaduwen uit de plaatjes die er een werpen (maskerRonde), dan het
  // doek leeg en de opdrachten na elkaar. Wat zelf tekent (doe), krijgt de gewone buffer, zoals het gewend is.
  G.klaar = function () {
    if (!gl) return;
    legKladAf();
    legRijAf();
    if (hoekAantal) {
      gl.bindBuffer(gl.ARRAY_BUFFER, hoekBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, hoeken.subarray(0, hoekAantal * PER_HOEK), gl.STREAM_DRAW);
    }
    if (instAantal) {
      gl.bindBuffer(gl.ARRAY_BUFFER, instBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, inst.subarray(0, instAantal * PER_INST), gl.STREAM_DRAW);
    }
    if (schaduwOp) maskerRonde();
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, doek.width, doek.height);
    if (!gewist) {
      gl.clearColor(0, 0, 0, 0);
      gl.depthMask(true);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      nuDiep = null;
      gewist = true;
    }
    for (const o of opdrachten) {
      if (o.soort === VAST) tekenVast(o, false);
      else if (o.soort === GROND) tekenGrond(o);
      else if (o.soort !== DOE) tekenRij(o, o.meng);
      else {
        zetDiep(o.diep ? 'toets' : 'uit');
        hoekBron(buffer, 0);
        o.f();
        hoekNu = null; // wat zelf tekent, kan de hoeken elders laten wijzen (tekenNet)
      }
    }
    zetDiep('uit');
    hoekBron(buffer, 0);
    opdrachten.length = 0;
    hoekAantal = 0;
    instAantal = 0;
    schaduwOp = null;
    for (const t of opruimen) gl.deleteTexture(t);
    opruimen.length = 0;
    eindtijd();
  };
})(globalThis.Spel = globalThis.Spel || {});
