// De teller van de renderproef: telt voor elk WebGL-doek hetzelfde, wie er ook tekent (js/gl.js of PixiJS): de
// opdrachten aan de kaart (draw calls), de wissels van programma, textuur en framebuffer, wat er naar de kaart gaat, en
// hoeveel textuurgeheugen er vastligt (breedte maal hoogte maal vier, een derde erbij met mipmaps). Moet geladen zijn
// vóór er een doek een WebGL-context krijgt. Alleen tellen: een extra functieaanroep per opdracht, voor beide gelijk.
(function (P) {
  'use strict';
  const tellers = new Map(); // canvas → teller
  P.tellerVan = (canvas) => (canvas ? tellers.get(canvas) || null : null);
  const oud = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (soort, ...rest) {
    const c = oud.call(this, soort, ...rest);
    if (c && /webgl/.test(soort) && !tellers.has(this)) tellers.set(this, meet(c, soort));
    if (c && soort === 'webgpu' && !tellers.has(this)) tellers.set(this, gpu);
    return c;
  };

  // WebGPU: één teller voor de bladzijde (meet met &alleen één tekenaar per bladzijde), op de prototypes, want de
  // opdrachten gaan naar een render pass en niet naar het doek. Een opdracht is een draw; een wissel van programma een
  // setPipeline, van textuur een setBindGroup.
  const gpu = leeg('webgpu');
  const gpuMaat = new WeakMap();
  const omProto = (proto, naam, f) => {
    const o = proto && proto[naam];
    if (typeof o !== 'function') return;
    proto[naam] = function (...a) {
      f(a);
      return o.apply(this, a);
    };
  };
  if (globalThis.GPURenderPassEncoder) {
    const RP = GPURenderPassEncoder.prototype;
    for (const n of ['draw', 'drawIndexed', 'drawIndirect', 'drawIndexedIndirect']) omProto(RP, n, () => gpu.opdrachten++);
    omProto(RP, 'executeBundles', (a) => { gpu.opdrachten += a[0].length; });
    omProto(RP, 'setPipeline', () => gpu.programmas++);
    omProto(RP, 'setBindGroup', () => gpu.texturen++);
    omProto(GPUCommandEncoder.prototype, 'beginRenderPass', () => gpu.framebuffers++);
    omProto(GPUQueue.prototype, 'writeBuffer', (a) => {
      const d = a[2];
      gpu.opgestuurd += a[4] != null ? a[4] * (d.BYTES_PER_ELEMENT || 1) : d.byteLength;
    });
    omProto(GPUQueue.prototype, 'writeTexture', (a) => { gpu.opgestuurd += a[1].byteLength || 0; });
    omProto(GPUQueue.prototype, 'copyExternalImageToTexture', (a) => {
      const m = a[2];
      gpu.opgestuurd += (Array.isArray(m) ? m[0] * (m[1] || 1) : m.width * (m.height || 1)) * 4;
    });
    const maak = GPUDevice.prototype.createTexture;
    GPUDevice.prototype.createTexture = function (d) {
      const t = maak.call(this, d);
      const z = d.size;
      const [b, h, l] = Array.isArray(z) ? [z[0], z[1] || 1, z[2] || 1] : [z.width, z.height || 1, z.depthOrArrayLayers || 1];
      const bytes = b * h * l * 4 * ((d.mipLevelCount || 1) > 1 ? 4 / 3 : 1);
      gpuMaat.set(t, bytes);
      gpu.geheugen += bytes;
      gpu.aantalTexturen++;
      return t;
    };
    const weg = GPUTexture.prototype.destroy;
    GPUTexture.prototype.destroy = function () {
      const was = gpuMaat.get(this);
      if (was != null) { gpu.geheugen -= was; gpu.aantalTexturen--; gpuMaat.delete(this); }
      return weg.call(this);
    };
  }

  function leeg(soort) {
    const t = { soort, opdrachten: 0, programmas: 0, texturen: 0, framebuffers: 0, opgestuurd: 0, geheugen: 0, aantalTexturen: 0, renderbuffers: 0 };
    t.nul = () => { t.opdrachten = t.programmas = t.texturen = t.framebuffers = t.opgestuurd = 0; };
    t.stand = () => ({
      opdrachten: t.opdrachten, programmas: t.programmas, texturen: t.texturen, framebuffers: t.framebuffers,
      opgestuurdMB: +(t.opgestuurd / 1048576).toFixed(2), textuurMB: +(t.geheugen / 1048576).toFixed(1),
      aantalTexturen: t.aantalTexturen, renderbufferMB: +(t.renderbuffers / 1048576).toFixed(1), soort,
    });
    return t;
  }

  function meet(gl, soort) {
    const t = leeg(soort);
    t.gl = gl;
    const maat = new Map(); // WebGLTexture → bytes
    const rbMaat = new Map();
    let eenheid = 0;
    const gebonden = [];
    let gebondenStapel = null; // de TEXTURE_2D_ARRAY (gl2weg.js)
    let rb = null;
    const om = (naam, f) => {
      const o = gl[naam];
      if (typeof o !== 'function') return;
      gl[naam] = function (...a) {
        f(a);
        return o.apply(gl, a);
      };
    };
    const zetMaat = (tex, bytes) => {
      if (!tex) return;
      const was = maat.get(tex) || 0;
      if (!maat.has(tex)) t.aantalTexturen++;
      maat.set(tex, bytes);
      t.geheugen += bytes - was;
    };
    for (const n of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced']) om(n, () => t.opdrachten++);
    om('useProgram', () => t.programmas++);
    om('bindFramebuffer', () => t.framebuffers++);
    om('activeTexture', (a) => { eenheid = a[0] - gl.TEXTURE0; });
    om('bindTexture', (a) => { t.texturen++; if (a[0] === gl.TEXTURE_2D) gebonden[eenheid] = a[1]; else if (a[0] === gl.TEXTURE_2D_ARRAY) gebondenStapel = a[1]; });
    om('texImage2D', (a) => {
      if (a[0] !== gl.TEXTURE_2D) return;
      let b;
      let h;
      if (a.length >= 8) { b = a[3]; h = a[4]; } else { const s = a[5]; b = s.naturalWidth || s.videoWidth || s.width; h = s.naturalHeight || s.videoHeight || s.height; }
      t.opgestuurd += b * h * 4;
      if (a[1] === 0) zetMaat(gebonden[eenheid], b * h * 4);
    });
    om('texSubImage2D', (a) => {
      let b;
      let h;
      if (a.length >= 9) { b = a[4]; h = a[5]; } else { const s = a[6]; b = s.naturalWidth || s.width; h = s.naturalHeight || s.height; }
      t.opgestuurd += b * h * 4;
    });
    om('texStorage2D', (a) => zetMaat(gebonden[eenheid], a[3] * a[4] * 4 * (a[1] > 1 ? 4 / 3 : 1)));
    om('texStorage3D', (a) => zetMaat(gebondenStapel, a[3] * a[4] * a[5] * 4 * (a[1] > 1 ? 4 / 3 : 1)));
    om('texSubImage3D', (a) => { const s = a[10]; t.opgestuurd += (a.length >= 11 && s && s.width ? (s.naturalWidth || s.width) * (s.naturalHeight || s.height) : a[5] * a[6]) * 4; });
    om('generateMipmap', () => { const tex = gebonden[eenheid]; if (tex) zetMaat(tex, Math.round((maat.get(tex) || 0) * 4 / 3)); });
    om('deleteTexture', (a) => { const was = maat.get(a[0]); if (was != null) { t.geheugen -= was; t.aantalTexturen--; maat.delete(a[0]); } });
    om('bindRenderbuffer', (a) => { rb = a[1]; });
    om('renderbufferStorage', (a) => { const was = rbMaat.get(rb) || 0; const bytes = a[2] * a[3] * 4; rbMaat.set(rb, bytes); t.renderbuffers += bytes - was; });
    om('renderbufferStorageMultisample', (a) => { const was = rbMaat.get(rb) || 0; const bytes = a[3] * a[4] * 4 * Math.max(1, a[1]); rbMaat.set(rb, bytes); t.renderbuffers += bytes - was; });
    return t;
  }
})(globalThis.Proef = globalThis.Proef || {});
