// De tekenaar op WebGL2 (renderproef; atlas.js): dezelfde scène als huidig.js, maar met wat WebGL2 erbij heeft. Alle
// plaatjes in één textuurstapel (TEXTURE_2D_ARRAY), een plaatje als één instantie (drawArraysInstanced, de vier hoeken
// uit gl_VertexID), de schaduwen uit dezelfde rij in de shader, en met inst.vast een vaste rij voor wat stilstaat met
// een dieptebuffer. Vier opdrachten per beeld plus één per stuk grond.
(function (P) {
  'use strict';
  const weg = { naam: 'gl2', canvas: null, b: 0, h: 0, zicht: 0 };
  let gl = null;
  let A = null; // de atlas
  let atlasTex = null;
  const R = {}; // de rijen (atlas.js)
  let dynBuf = null;
  let dynMaat = 0;
  let vastBuf = null;
  let masker = null; // { fb, tex, b, h }
  let sprite = null;
  let vlak = null;
  let scherm = null;
  const grondTex = new Map(); // stuk → textuur
  const grond = [];

  const VERT = `#version 300 es
  in vec4 aRect; in vec4 aUV; in vec4 aExtra;
  uniform vec4 uCam; uniform vec2 uMaat; uniform vec3 uSchaduw;
  out vec3 vUV; out float vAlpha;
  void main() {
    vec2 c = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1));
    vec2 p;
    if (uSchaduw.x > 0.5) {
      if (aExtra.z < 0.5) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); vUV = vec3(0.0); vAlpha = 0.0; return; }
      float t = 1.0 - c.y;
      p = vec2(aRect.x + c.x * aRect.z + t * aRect.w * uSchaduw.y, aRect.y + aRect.w + t * aRect.w * uSchaduw.z);
    } else p = aRect.xy + c * aRect.zw;
    vec2 s = p * uCam.x + uCam.yz;
    gl_Position = vec4(s.x / uMaat.x * 2.0 - 1.0, 1.0 - s.y / uMaat.y * 2.0, aExtra.w * 2.0 - 1.0, 1.0);
    vUV = vec3(mix(aUV.xy, aUV.zw, c), aExtra.x);
    vAlpha = aExtra.y;
  }`;
  const FRAG = `#version 300 es
  precision highp float; precision highp sampler2DArray;
  uniform sampler2DArray uAtlas; uniform float uHard; uniform float uMasker;
  in vec3 vUV; in float vAlpha; out vec4 kleur;
  void main() {
    vec4 c = texture(uAtlas, vUV);
    if (uMasker > 0.5) { if (c.a < 0.004) discard; kleur = vec4(0.0, 0.0, 0.0, c.a); return; }
    if (uHard > 0.5 && c.a < 0.5) discard;
    kleur = c * vAlpha;
  }`;
  const VERT_VLAK = `#version 300 es
  uniform vec4 uCam; uniform vec2 uMaat; uniform vec4 uRect;
  out vec2 vUV;
  void main() {
    vec2 c = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1));
    vec2 s = (uRect.xy + c * uRect.zw) * uCam.x + uCam.yz;
    gl_Position = vec4(s.x / uMaat.x * 2.0 - 1.0, 1.0 - s.y / uMaat.y * 2.0, 0.0, 1.0);
    vUV = c;
  }`;
  const FRAG_VLAK = `#version 300 es
  precision highp float; uniform sampler2D uBeeld; in vec2 vUV; out vec4 kleur;
  void main() { kleur = texture(uBeeld, vUV); }`;
  const VERT_SCHERM = `#version 300 es
  void main() { vec2 c = vec2(float(gl_VertexID & 1), float(gl_VertexID >> 1)); gl_Position = vec4(c * 2.0 - 1.0, 0.0, 1.0); }`;
  const FRAG_SCHERM = `#version 300 es
  precision highp float; uniform sampler2D uMasker; uniform vec4 uKleur; uniform vec2 uMaat; uniform float uMetMasker; out vec4 kleur;
  void main() { kleur = uMetMasker > 0.5 ? uKleur * texture(uMasker, gl_FragCoord.xy / uMaat).a : uKleur; }`;

  function programma(v, f) {
    const p = gl.createProgram();
    for (const [soort, bron] of [[gl.VERTEX_SHADER, v], [gl.FRAGMENT_SHADER, f]]) {
      const s = gl.createShader(soort);
      gl.shaderSource(s, bron);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      gl.attachShader(p, s);
    }
    gl.bindAttribLocation(p, 0, 'aRect');
    gl.bindAttribLocation(p, 1, 'aUV');
    gl.bindAttribLocation(p, 2, 'aExtra');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {};
    for (let i = 0; i < gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); i++) {
      const n = gl.getActiveUniform(p, i).name;
      u[n] = gl.getUniformLocation(p, n);
    }
    return { p, u };
  }

  weg.init = function (b, h) {
    weg.canvas = document.createElement('canvas');
    weg.canvas.width = b;
    weg.canvas.height = h;
    gl = weg.canvas.getContext('webgl2', {
      alpha: true, premultipliedAlpha: true, antialias: false, depth: true, stencil: false, preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: true, powerPreference: 'high-performance',
    });
    if (!gl) throw new Error('geen WebGL2');
    weg.b = b;
    weg.h = h;
    sprite = programma(VERT, FRAG);
    vlak = programma(VERT_VLAK, FRAG_VLAK);
    scherm = programma(VERT_SCHERM, FRAG_SCHERM);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.enable(gl.BLEND);
    dynBuf = gl.createBuffer();
    vastBuf = gl.createBuffer();
    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribDivisor(0, 1);
    gl.vertexAttribDivisor(1, 1);
    gl.vertexAttribDivisor(2, 1);
  };
  weg.maat = function (b, h) {
    weg.canvas.width = b;
    weg.canvas.height = h;
    weg.b = b;
    weg.h = h;
  };
  // Eén keer: de atlas, met twee lagen reserve (voor de platte tekeningen).
  weg.bouw = function (sc) {
    A = P.maakAtlas();
    const lagen = P.pakIn(A, sc) + 2;
    A.lagen = lagen;
    atlasTex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, atlasTex);
    gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, P.LAAG, P.LAAG, lagen);
    for (const k of [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER]) gl.texParameteri(gl.TEXTURE_2D_ARRAY, k, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  };

  function stuurNieuw() {
    if (!A.nieuw.length) return;
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, atlasTex);
    for (const p of A.nieuw) gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, p.x, p.y, p.l, p.b, p.h, 1, gl.RGBA, gl.UNSIGNED_BYTE, p.img);
    A.nieuw.length = 0;
  }
  function wijsRij(buf, start) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    const s = P.PER * 4;
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, s, start * s);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, s, start * s + 16);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, s, start * s + 32);
  }
  function maskerVan() {
    if (masker && masker.b === weg.b && masker.h === weg.h) return masker;
    if (!masker) masker = { fb: gl.createFramebuffer(), tex: null };
    if (masker.tex) gl.deleteTexture(masker.tex);
    masker.tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, masker.tex);
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, weg.b, weg.h);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.bindFramebuffer(gl.FRAMEBUFFER, masker.fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, masker.tex, 0);
    masker.b = weg.b;
    masker.h = weg.h;
    return masker;
  }
  function grondTextuur(s) {
    let t = grondTex.get(s);
    if (!t) {
      t = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, s.doek);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      grondTex.set(s, t);
    }
    return t;
  }
  function zetCamera(prog, cam, tx, ty) {
    gl.uniform4f(prog.u.uCam, cam.zoom, tx, ty, 0);
    gl.uniform2f(prog.u.uMaat, weg.b, weg.h);
  }

  weg.teken = function (sc, cam, inst) {
    const z = cam.zoom;
    const tx = Math.round(weg.b / 2 - cam.x * z);
    const ty = Math.round(weg.h / 2 - cam.y * z);
    P.rijen(sc, cam, weg.b, weg.h, inst, R, A);
    weg.zicht = R.getekend;
    stuurNieuw();
    // De rij van dit beeld naar de kaart (en de vaste rij als die nieuw is).
    gl.bindBuffer(gl.ARRAY_BUFFER, dynBuf);
    if (dynMaat < R.dyn.length) { gl.bufferData(gl.ARRAY_BUFFER, R.dyn.byteLength, gl.DYNAMIC_DRAW); dynMaat = R.dyn.length; }
    if (R.n) gl.bufferSubData(gl.ARRAY_BUFFER, 0, R.dyn, 0, R.n * P.PER);
    if (inst.vast && R.vastNieuw) {
      gl.bindBuffer(gl.ARRAY_BUFFER, vastBuf);
      gl.bufferData(gl.ARRAY_BUFFER, R.vastData, gl.STATIC_DRAW);
      R.vastNieuw = false;
    }
    const vast = inst.vast && R.nVast;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, atlasTex);
    gl.useProgram(sprite.p);
    zetCamera(sprite, cam, tx, ty);
    gl.uniform1i(sprite.u.uAtlas, 0);

    // De schaduwen: alles nog eens, scheef, op het masker (in de shader, uit dezelfde rij).
    if (inst.schaduw) {
      const M = maskerVan();
      gl.bindFramebuffer(gl.FRAMEBUFFER, M.fb);
      gl.viewport(0, 0, weg.b, weg.h);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      gl.uniform3f(sprite.u.uSchaduw, 1, P.ZON.rx, P.ZON.ry);
      gl.uniform1f(sprite.u.uMasker, 1);
      gl.uniform1f(sprite.u.uHard, 0);
      if (vast) { wijsRij(vastBuf, 0); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, R.nVast); }
      if (R.n) { wijsRij(dynBuf, 0); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, R.n); }
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, weg.b, weg.h);
    gl.clearColor(0, 0, 0, 0);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    // De grond.
    gl.useProgram(vlak.p);
    zetCamera(vlak, cam, tx, ty);
    gl.uniform1i(vlak.u.uBeeld, 0);
    for (const s of P.grondStukken(sc, cam, weg.b, weg.h, grond)) {
      gl.bindTexture(gl.TEXTURE_2D, grondTextuur(s));
      gl.uniform4f(vlak.u.uRect, s.x, s.y, s.S, s.S);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    // Het masker over de grond.
    if (inst.schaduw) {
      gl.useProgram(scherm.p);
      gl.bindTexture(gl.TEXTURE_2D, masker.tex);
      const k = P.SCHADUW.kleur;
      const a = P.SCHADUW.sterkte;
      gl.uniform4f(scherm.u.uKleur, k[0] * a, k[1] * a, k[2] * a, a);
      gl.uniform2f(scherm.u.uMaat, weg.b, weg.h);
      gl.uniform1f(scherm.u.uMetMasker, 1);
      gl.uniform1i(scherm.u.uMasker, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    // Alles.
    gl.useProgram(sprite.p);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, atlasTex);
    gl.uniform3f(sprite.u.uSchaduw, 0, 0, 0);
    gl.uniform1f(sprite.u.uMasker, 0);
    if (!inst.vast) {
      gl.uniform1f(sprite.u.uHard, 0);
      if (R.n) { wijsRij(dynBuf, 0); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, R.n); }
    } else {
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.depthMask(true);
      gl.uniform1f(sprite.u.uHard, 1);
      if (vast) { wijsRij(vastBuf, 0); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, R.nVast); }
      if (R.nHard) { wijsRij(dynBuf, 0); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, R.nHard); }
      gl.depthMask(false);
      gl.uniform1f(sprite.u.uHard, 0);
      if (R.n > R.nHard) { wijsRij(dynBuf, R.nHard); gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, R.n - R.nHard); }
      gl.depthMask(true);
      gl.disable(gl.DEPTH_TEST);
    }
    // Het licht: de wereld maal de avondkleur.
    if (inst.licht) {
      gl.useProgram(scherm.p);
      gl.blendFunc(gl.DST_COLOR, gl.ZERO);
      const k = P.AVOND;
      gl.uniform4f(scherm.u.uKleur, k[0], k[1], k[2], 1);
      gl.uniform1f(scherm.u.uMetMasker, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
  };
  weg.wacht = function () {
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  };

  P.wegen = P.wegen || {};
  P.wegen.gl2 = weg;
})(globalThis.Proef = globalThis.Proef || {});
