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
    return c;
  };

  function meet(gl, soort) {
    const t = {
      gl, soort, opdrachten: 0, programmas: 0, texturen: 0, framebuffers: 0, opgestuurd: 0,
      geheugen: 0, aantalTexturen: 0, renderbuffers: 0,
    };
    const maat = new Map(); // WebGLTexture → bytes
    const rbMaat = new Map();
    let eenheid = 0;
    const gebonden = [];
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
    om('bindTexture', (a) => { t.texturen++; if (a[0] === gl.TEXTURE_2D) gebonden[eenheid] = a[1]; });
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
    om('generateMipmap', () => { const tex = gebonden[eenheid]; if (tex) zetMaat(tex, Math.round((maat.get(tex) || 0) * 4 / 3)); });
    om('deleteTexture', (a) => { const was = maat.get(a[0]); if (was != null) { t.geheugen -= was; t.aantalTexturen--; maat.delete(a[0]); } });
    om('bindRenderbuffer', (a) => { rb = a[1]; });
    om('renderbufferStorage', (a) => { const was = rbMaat.get(rb) || 0; const bytes = a[2] * a[3] * 4; rbMaat.set(rb, bytes); t.renderbuffers += bytes - was; });
    om('renderbufferStorageMultisample', (a) => { const was = rbMaat.get(rb) || 0; const bytes = a[3] * a[4] * 4 * Math.max(1, a[1]); rbMaat.set(rb, bytes); t.renderbuffers += bytes - was; });
    t.nul = () => { t.opdrachten = t.programmas = t.texturen = t.framebuffers = t.opgestuurd = 0; };
    t.stand = () => ({
      opdrachten: t.opdrachten, programmas: t.programmas, texturen: t.texturen, framebuffers: t.framebuffers,
      opgestuurdMB: +(t.opgestuurd / 1048576).toFixed(2), textuurMB: +(t.geheugen / 1048576).toFixed(1),
      aantalTexturen: t.aantalTexturen, renderbufferMB: +(t.renderbuffers / 1048576).toFixed(1), soort,
    });
    return t;
  }
})(globalThis.Proef = globalThis.Proef || {});
