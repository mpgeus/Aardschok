// Tekenen met de videokaart (werklijst vraag 123; Marcel, 4 okt: "1 ja 2 voor de boeren"). Een eigen kleine laag op
// WebGL, zonder bibliotheek, die zich voordoet als het 2D-doek: js/tekenen.js tekent er precies zo op als op het doek
// van de browser, in dezelfde volgorde, en hoeft niet te weten welke van de twee het is.
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
  // Een css-kleur als [r, g, b, a], 0..1, niet voorvermenigvuldigd.
  function leesKleur(k) {
    let c = kleuren.get(k);
    if (c) return c;
    kleurDoek.fillStyle = '#000';
    kleurDoek.fillStyle = k;
    const s = kleurDoek.fillStyle; // #rrggbb of rgba(r, g, b, a)
    if (s[0] === '#') c = [parseInt(s.slice(1, 3), 16) / 255, parseInt(s.slice(3, 5), 16) / 255, parseInt(s.slice(5, 7), 16) / 255, 1];
    else {
      const d = s.slice(s.indexOf('(') + 1, -1).split(',').map(Number);
      c = [d[0] / 255, d[1] / 255, d[2] / 255, d.length > 3 ? d[3] : 1];
    }
    if (kleuren.size > 2000) kleuren.clear();
    kleuren.set(k, c);
    return c;
  }

  // ---------------------------------------------------------------- de programma's
  const VERT = `
    attribute vec2 aPlek; attribute vec2 aUv; attribute vec4 aKleur;
    uniform vec2 uMaat; varying vec2 vUv; varying vec4 vKleur; varying vec2 vPlek;
    void main() {
      vUv = aUv; vKleur = aKleur; vPlek = aPlek;
      gl_Position = vec4(aPlek.x / uMaat.x * 2.0 - 1.0, 1.0 - aPlek.y / uMaat.y * 2.0, 0.0, 1.0);
    }`;
  // Een plaatje maal een kleur (voorvermenigvuldigd): helderheid en doorzichtigheid in één. Een vlak is het witte
  // plaatje van één pixel maal zijn kleur.
  const FRAG_BEELD = `
    precision highp float; uniform sampler2D uBeeld; varying vec2 vUv; varying vec4 vKleur;
    void main() { gl_FragColor = texture2D(uBeeld, vUv) * vKleur; }`;
  // Een rond verloop zoals createRadialGradient met één middelpunt: tot vier stops, lineair ertussen.
  const FRAG_VERLOOP = `
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
  const FRAG_PLAS = `
    precision highp float; varying vec2 vUv; varying vec4 vKleur;
    void main() {
      float t = 1.0 - min(dot(vUv, vUv), 1.0);
      gl_FragColor = vec4(vKleur.rgb * t * t, 0.0);
    }`;
  // De wereld maal de lichtkaart. De lichtkaart staat op de helft (0,5 is "zoals de kunst is"), en de mengstand telt
  // het product twee keer (DST_COLOR, SRC_COLOR), zodat een lamp een muur tot twee keer zo licht kan maken. De
  // doorzichtigheid blijft: een gat voor een brandend raam blijft een gat, zoals met 'source-atop' (js/tekenen.js).
  const FRAG_MAAL = `
    precision highp float; uniform sampler2D uLicht; uniform vec2 uDoek;
    void main() { gl_FragColor = vec4(texture2D(uLicht, gl_FragCoord.xy / uDoek).rgb, 0.0); }`;
  // De schaduwen van de zon (vraag 125, B): het masker met alle silhouetten, als één vlak over de grond, in de kleur
  // van de schaduw.
  const FRAG_SCHADUW = `
    precision highp float; uniform sampler2D uMasker; uniform vec2 uDoek; uniform vec4 uKleur;
    void main() { gl_FragColor = uKleur * texture2D(uMasker, gl_FragCoord.xy / uDoek).a; }`;

  function maakProgramma(vert, frag) {
    const p = gl.createProgram();
    for (const [soort, bron] of [[gl.VERTEX_SHADER, vert], [gl.FRAGMENT_SHADER, frag]]) {
      const s = gl.createShader(soort);
      gl.shaderSource(s, bron);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('WebGL: ' + gl.getShaderInfoLog(s));
      gl.attachShader(p, s);
    }
    gl.bindAttribLocation(p, 0, 'aPlek');
    gl.bindAttribLocation(p, 1, 'aUv');
    gl.bindAttribLocation(p, 2, 'aKleur');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('WebGL: ' + gl.getProgramInfoLog(p));
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
  let wit = null; // een textuur van één witte pixel, voor vlakken
  let maxTextuur = 4096;
  const PER_HOEK = 8; // x, y, u, v, r, g, b, a
  let hoeken = new Float32Array(PER_HOEK * 6 * 2048);
  let aantal = 0; // hoeken in de rij
  let rijTextuur = null;
  let rijMeng = 'source-over';
  let buffer = null;

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
      alpha: true, premultipliedAlpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: !T.TEKENEN_INSTELLINGEN.ookOpDeProcessor,
    };
    gl = doek.getContext('webgl', opties);
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
      beeldProg = maakProgramma(VERT, FRAG_BEELD);
      verloopProg = maakProgramma(VERT, FRAG_VERLOOP);
      plasProg = maakProgramma(VERT, FRAG_PLAS);
      maalProg = maakProgramma(VERT, FRAG_MAAL);
      schaduwProg = maakProgramma(VERT, FRAG_SCHADUW);
    } catch (e) {
      console.error(e);
      kapot = true;
      gl = null;
      return false;
    }
    maxTextuur = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, PER_HOEK * 4, 0);
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, PER_HOEK * 4, 8);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, PER_HOEK * 4, 16);
    gl.enable(gl.BLEND);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
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
    const info = gl.getExtension('WEBGL_debug_renderer_info');
    return info ? gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : 'WebGL';
  };

  function nieuweTextuur() {
    const t = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  // De textuur van een plaatje of een doek, of null als het (nog) niet kan.
  const texturen = new WeakMap();
  function textuurVan(bron) {
    const isDoek = typeof HTMLCanvasElement !== 'undefined' && bron instanceof HTMLCanvasElement;
    const b = isDoek ? bron.width : bron.naturalWidth;
    const h = isDoek ? bron.height : bron.naturalHeight;
    if (!b || !h || b > maxTextuur || h > maxTextuur || (!isDoek && !bron.complete)) return null;
    let t = texturen.get(bron);
    const versie = isDoek ? bron.versie : 0;
    if (t && t.b === b && t.h === h && (!isDoek || (versie !== undefined && t.versie === versie))) return t;
    if (!t) {
      t = { tex: nieuweTextuur(), b, h, versie };
      texturen.set(bron, t);
    } else if (aantal && rijTextuur === t.tex) {
      // Staat hij nog in de rij, dan die eerst: anders tekent alles in de rij wat er nu op komt. Een doek dat per beeld
      // vaker opnieuw beschreven wordt (het kijkgat, één per wie achter een huis staat) liet zo op elke plek het laatste
      // zien (Marcel, 9 okt: "art overlapt en klopt niet meer").
      legRijAf();
    }
    gl.bindTexture(gl.TEXTURE_2D, t.tex);
    try {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bron);
    } catch (e) {
      // Een plaatje van een los bestand (file://) mag in sommige browsers niet naar de kaart: dan zonder.
      console.warn('Tekenen zonder de videokaart:', e.message);
      kapot = true;
      return null;
    }
    Object.assign(t, { b, h, versie });
    G.telling.opgestuurd++;
    return t;
  }

  // ---------------------------------------------------------------- de rij met hoeken
  function legRijAf() {
    if (!aantal) return;
    gl.useProgram(beeldProg.p);
    gl.uniform2f(beeldProg.u.uMaat, doek.width, doek.height);
    gl.uniform1i(beeldProg.u.uBeeld, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, rijTextuur);
    MENG[rijMeng](gl);
    gl.bufferData(gl.ARRAY_BUFFER, hoeken.subarray(0, aantal * PER_HOEK), gl.STREAM_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, aantal);
    G.telling.opdrachten++;
    aantal = 0;
  }
  function plekVoor(tex, meng, n) {
    if (aantal && (tex !== rijTextuur || meng !== rijMeng)) legRijAf();
    if ((aantal + n) * PER_HOEK > hoeken.length) {
      legRijAf();
      if (n * PER_HOEK > hoeken.length) hoeken = new Float32Array(n * PER_HOEK * 2);
    }
    rijTextuur = tex;
    rijMeng = meng;
  }
  function hoek(x, y, u, v, k) {
    const i = aantal * PER_HOEK;
    hoeken[i] = x;
    hoeken[i + 1] = y;
    hoeken[i + 2] = u;
    hoeken[i + 3] = v;
    hoeken[i + 4] = k[0];
    hoeken[i + 5] = k[1];
    hoeken[i + 6] = k[2];
    hoeken[i + 7] = k[3];
    aantal++;
  }
  // Een vierhoek: vier punten op het doek (in pixels) met hun plek in de textuur (0..1).
  function vierhoek(p, uv, k) {
    hoek(p[0], p[1], uv[0], uv[1], k);
    hoek(p[2], p[3], uv[2], uv[1], k);
    hoek(p[4], p[5], uv[0], uv[3], k);
    hoek(p[2], p[3], uv[2], uv[1], k);
    hoek(p[6], p[7], uv[2], uv[3], k);
    hoek(p[4], p[5], uv[0], uv[3], k);
  }
  // Een rond verloop over een vorm (hoeken als driehoeken, in pixels), met een eigen opdracht.
  function tekenVerloop(punten, v, m, alpha, meng) {
    legRijAf();
    gl.useProgram(verloopProg.p);
    gl.uniform2f(verloopProg.u.uMaat, doek.width, doek.height);
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
    MENG[meng](gl);
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
    gl.bindTexture(gl.TEXTURE_2D, licht.tex);
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
      gl.useProgram(plasProg.p);
      gl.uniform2f(plasProg.u.uMaat, doek.width, doek.height);
      gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ZERO, gl.ONE);
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
    gl.useProgram(maalProg.p);
    gl.uniform1i(maalProg.u.uLicht, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, L.tex);
    gl.blendFuncSeparate(gl.DST_COLOR, gl.SRC_COLOR, gl.ZERO, gl.ONE);
    overHetDoek(maalProg);
    G.telling.lampen = plassen.length;
  }

  // ---------------------------------------------------------------- de schaduwen van de zon (vraag 125, B)
  // Een masker even groot als het doek: de silhouetten erop, en dan in één keer over de grond.
  let masker = null; // { fb, tex, b, h }
  function maskerVan() {
    if (masker && masker.b === doek.width && masker.h === doek.height) return masker;
    if (!masker) masker = { fb: gl.createFramebuffer(), tex: nieuweTextuur() };
    gl.bindTexture(gl.TEXTURE_2D, masker.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, doek.width, doek.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, masker.fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, masker.tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    Object.assign(masker, { b: doek.width, h: doek.height });
    return masker;
  }
  // Een vlak over het hele doek met een programma dat zijn kleur uit de plek op het scherm haalt.
  function overHetDoek(prog) {
    const w = doek.width;
    const h = doek.height;
    gl.uniform2f(prog.u.uMaat, w, h);
    gl.uniform2f(prog.u.uDoek, w, h);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 0, 0, 0, 0, 0, 1, w, 0, 0, 0, 0, 0, 0, 1, 0, h, 0, 0, 0, 0, 0, 1, w, 0, 0, 0, 0, 0, 0, 1, w, h, 0, 0, 0, 0, 0, 1, 0, h, 0, 0, 0, 0, 0, 1]), gl.STREAM_DRAW);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    G.telling.opdrachten++;
  }

  // ---------------------------------------------------------------- het kladdoek
  let klad = null; // { canvas, ctx }
  let kladVak = null; // [x0, y0, x1, y1] in pixels waarop getekend werd, of null
  let kladMeng = 'source-over';
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
    plekVoor(t.tex, MENG[kladMeng] ? kladMeng : 'source-over', 6);
    vierhoek([x0, y0, x1, y0, x0, y1, x1, y1], [0, 0, b / t.b, h / t.h], [1, 1, 1, 1]);
    G.telling.klad++;
    G.telling.kladPixels += b * h;
  }

  // ---------------------------------------------------------------- het doek dat zich voordoet als 2D
  const SNEL_MENG = new Set(['source-over', 'source-atop', 'destination-over', 'destination-out', 'destination-in', 'lighter']);
  const verlopen = new WeakMap(); // CanvasGradient → { x, y, r0, r1, stops }

  class Doek {
    constructor() {
      this.st = { m: [1, 0, 0, 1, 0, 0], alpha: 1, meng: 'source-over', filter: 'none', helder: 1, vul: '#000', clip: false };
      this.stapel = [];
      this.pad = []; // deelpaden: { p: [x, y, ...] in pixels, bol: true als het een ellips of cirkel is }
      this.padRond = false; // het pad heeft bochten die het snelle pad niet kent
      this.schaduw = null; // { sx, sy } tussen beginSchaduw en eindSchaduw: alleen plaatjes, als silhouet op het masker
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
    set filter(f) {
      this.st.filter = f;
      this.k.filter = f;
      const h = /^brightness\(([\d.]+)\)$/.exec(f);
      this.st.helder = f === 'none' ? 1 : h ? Number(h[1]) : null; // null: een filter dat alleen het kladdoek kent
    }
    get fillStyle() {
      return this.st.vul;
    }
    set fillStyle(v) {
      this.st.vul = v;
      this.k.fillStyle = v;
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
    // ---- plaatjes
    drawImage(bron, ...a) {
      if (!bron) return;
      let sx = 0;
      let sy = 0;
      let sw = bron.naturalWidth || bron.width;
      let sh = bron.naturalHeight || bron.height;
      let dx;
      let dy;
      let dw;
      let dh;
      if (a.length === 2) [dx, dy, dw, dh] = [a[0], a[1], sw, sh];
      else if (a.length === 4) [dx, dy, dw, dh] = a;
      else [sx, sy, sw, sh, dx, dy, dw, dh] = a;
      if (this.schaduw) {
        // Het silhouet scheef over de grond: de onderrand blijft staan, een punt zo hoog erboven komt zo ver in de richting
        // van de schaduw te liggen.
        const t = textuurVan(bron);
        if (!t) return;
        const m = this.st.m;
        const yb = dy + dh;
        const { sx: rx, sy: ry } = this.schaduw;
        const p = [];
        for (const [x, y] of [[dx, dy], [dx + dw, dy], [dx, yb], [dx + dw, yb]]) {
          const h = yb - y;
          const gx = x + h * rx;
          const gy = yb + h * ry;
          p.push(m[0] * gx + m[2] * gy + m[4], m[1] * gx + m[3] * gy + m[5]);
        }
        const al = this.st.alpha;
        plekVoor(t.tex, 'source-over', 6);
        vierhoek(p, [sx / t.b, sy / t.h, (sx + sw) / t.b, (sy + sh) / t.h], [0, 0, 0, al]);
        return;
      }
      if (this.snel()) {
        if (kladVak) legKladAf();
        const t = textuurVan(bron);
        if (t) {
          const m = this.st.m;
          const p = [];
          for (const [x, y] of [[dx, dy], [dx + dw, dy], [dx, dy + dh], [dx + dw, dy + dh]]) p.push(m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]);
          const al = this.st.alpha;
          const h = this.st.helder * al;
          plekVoor(t.tex, this.st.meng, 6);
          vierhoek(p, [sx / t.b, sy / t.h, (sx + sw) / t.b, (sy + sh) / t.h], [h, h, h, al]);
          G.telling.plaatjes++;
          return;
        }
      }
      this.opKlad(this.vakVan(dx, dy, dx + dw, dy + dh), (k) => k.drawImage(bron, ...a));
    }
    // ---- vlakken
    fillRect(x, y, b, h) {
      if (this.schaduw) return;
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
          plekVoor(wit, this.st.meng, 6);
          vierhoek(p, [0, 0, 1, 1], [k[0] * a, k[1] * a, k[2] * a, a]);
          return;
        }
      }
      this.opKlad(this.vakVan(x, y, x + b, y + h), (k) => k.fillRect(x, y, b, h));
    }
    clearRect(x, y, b, h) {
      if (this.schaduw) return;
      if (!this.st.clip) {
        if (kladVak) legKladAf();
        const m = this.st.m;
        const p = [];
        for (const [px, py] of [[x, y], [x + b, y], [x, y + h], [x + b, y + h]]) p.push(m[0] * px + m[2] * py + m[4], m[1] * px + m[3] * py + m[5]);
        plekVoor(wit, 'wis', 6);
        vierhoek(p, [0, 0, 1, 1], [0, 0, 0, 0]);
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
      if (this.schaduw) return;
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
          plekVoor(wit, this.st.meng, drie.length / 2);
          for (let i = 0; i < drie.length; i += 2) hoek(drie[i], drie[i + 1], 0, 0, kl);
          G.telling.vormen++;
          return;
        }
      }
      this.opKlad(this.padVak(0), (k) => k.fill(...a));
    }
    stroke(...a) {
      if (this.schaduw) return;
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
      if (this.schaduw) return;
      this.opKlad(this.tekstVak(t, x, y), (k) => k.fillText(t, x, y, ...a));
    }
    strokeText(t, x, y, ...a) {
      if (this.schaduw) return;
      this.opKlad(this.tekstVak(t, x, y), (k) => k.strokeText(t, x, y, ...a));
    }
    putImageData(...a) {
      if (this.schaduw) return;
      legRijAf();
      this.opKlad(null, (k) => k.putImageData(...a));
    }
    // Het licht (vraag 125, A; tekenNacht in js/tekenen.js): de kleur van het uur, [r, g, b] van 0 tot 1, en de plassen
    // licht { x, y, rx, ry, k } in de vlakte van nu. Wat al klaarstaat, eerst; overdag zonder lampen doet het niets.
    tekenLichtkaart(kleur, plassen) {
      if (!plassen.length && kleur.every((c) => c > 0.999)) return;
      legKladAf();
      legRijAf();
      const m = this.st.m;
      const s = Math.hypot(m[0], m[1]);
      tekenLicht(kleur, plassen.map((p) => ({ x: m[0] * p.x + m[2] * p.y + m[4], y: m[1] * p.x + m[3] * p.y + m[5], rx: p.rx * s, ry: p.ry * s, k: p.k })));
    }
    // De schaduwen van de zon (vraag 125, B; tekenZonneschaduw in js/tekenen.js): tussen beginSchaduw en eindSchaduw
    // tekent alleen drawImage, als silhouet op het masker, scheef met (sx, sy) per pixel hoogte in de vlakte van het
    // plaatje. eindSchaduw legt het masker in één keer over wat er al staat, met deze dekking en kleur ([r, g, b]).
    beginSchaduw(sx, sy) {
      legKladAf();
      legRijAf();
      const M = maskerVan();
      gl.bindFramebuffer(gl.FRAMEBUFFER, M.fb);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      this.schaduw = { sx, sy };
    }
    eindSchaduw(dekking, kleur) {
      legRijAf();
      this.schaduw = null;
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.useProgram(schaduwProg.p);
      gl.uniform1i(schaduwProg.u.uMasker, 0);
      gl.uniform4f(schaduwProg.u.uKleur, kleur[0] * dekking, kleur[1] * dekking, kleur[2] * dekking, dekking);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, maskerVan().tex);
      MENG['source-over'](gl);
      overHetDoek(schaduwProg);
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
  G.telling = { plaatjes: 0, vormen: 0, opdrachten: 0, klad: 0, kladPixels: 0, opgestuurd: 0, lampen: 0 };
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
    hetDoek.st = { m: [ratio, 0, 0, ratio, 0, 0], alpha: 1, meng: 'source-over', filter: 'none', helder: 1, vul: '#000', clip: false };
    hetDoek.stapel = [];
    hetDoek.schaduw = null;
    const k = kladdoek().ctx;
    k.setTransform(1, 0, 0, 1, 0, 0);
    k.clearRect(0, 0, klad.canvas.width, klad.canvas.height);
    k.setTransform(ratio, 0, 0, ratio, 0, 0);
    k.globalAlpha = 1;
    k.filter = 'none';
    kladVak = null;
    for (const s in G.telling) G.telling[s] = 0;
    gl.viewport(0, 0, doek.width, doek.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    return hetDoek;
  };
  // Wachten tot de kaart klaar is met het beeld (het gereedschap van het meten): één pixel teruglezen.
  G.wacht = function () {
    if (!gl) return;
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  };
  // Het beeld af: wat nog in de rij of op het kladdoek staat, naar de kaart.
  G.klaar = function () {
    if (!gl) return;
    legKladAf();
    legRijAf();
  };
})(globalThis.Spel = globalThis.Spel || {});
