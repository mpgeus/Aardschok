// De weg met PixiJS v8 (renderproef): dezelfde scène als huidig.js, zoals je hem in Pixi zou bouwen. Pixi houdt een
// boom van dingen vast (retained): elk ding is één keer een Sprite, en per beeld zet je alleen wat veranderde (plek,
// plaatje, volgorde, zichtbaar) en tekent Pixi de boom. De schaduwen zijn een laag met dezelfde plaatjes, scheef en in
// de schaduwkleur, met een AlphaFilter (anders worden schaduwen die elkaar overlappen donkerder), en het licht een
// ColorMatrixFilter over de hele wereld.
//
// Opties (inst): mip (lineair met mipmaps in plaats van naaste pixel), culler ('eigen': zichtbaar per ding uit
// hetzelfde vak als huidig.js; 'pixi': Culler.shared van Pixi), sorteer ('pixi': wat in beeld is, hangt in de laag
// (erbij als het in beeld komt, eraf als het eruit gaat), en Pixi sorteert op zIndex met sortableChildren, de gewone
// manier; 'alles': elk ding hangt er altijd, onzichtbaar als het niet in beeld is; 'eigen': de laag krijgt elk beeld
// opnieuw alleen wat in beeld is, zelf gesorteerd, zoals js/tekenen.js zijn lijst maakt).
(function (P) {
  'use strict';
  const X = globalThis.PIXI;
  const weg = { naam: 'pixi', canvas: null, b: 0, h: 0, zicht: 0, renderer: null };
  let stage = null;
  let wereld = null;
  let grondLaag = null;
  let schaduwLaag = null;
  let dingLaag = null;
  let kleurFilter = null;
  let alfaFilter = null;
  let mip = false;
  let lichtAan = false;
  let scherm = null; // het vak van de filters: het scherm in wereldpixels (anders rekent Pixi elk beeld de omtrek van alles uit)
  const bronnen = new Map(); // Image of doek → TextureSource
  const texturen = new Map(); // sleutel → Texture
  const grond = [];
  const lijst = []; // sorteer 'eigen': wat in beeld is, op volgorde
  const kinderen = [];
  const grondPerZoom = new Map(); // zoom → Container
  const hex = (k) => (Math.round(k[0] * 255) << 16) | (Math.round(k[1] * 255) << 8) | Math.round(k[2] * 255);

  weg.init = async function (b, h, inst) {
    mip = !!inst.mip;
    X.TextureStyle.defaultOptions.scaleMode = mip ? 'linear' : 'nearest';
    const r = new X.WebGLRenderer();
    await r.init({
      width: b, height: h, resolution: 1, antialias: false, backgroundAlpha: 0, roundPixels: !mip && !inst.zonderAfronden,
      powerPreference: 'high-performance', preferWebGLVersion: inst.webgl1 ? 1 : 2, preserveDrawingBuffer: false,
      failIfMajorPerformanceCaveat: true,
    });
    weg.renderer = r;
    weg.canvas = r.canvas;
    weg.b = b;
    weg.h = h;
    stage = new X.Container();
    wereld = new X.Container();
    grondLaag = new X.Container();
    schaduwLaag = new X.Container();
    dingLaag = new X.Container();
    dingLaag.sortableChildren = true;
    wereld.addChild(grondLaag, schaduwLaag, dingLaag);
    stage.addChild(wereld);
    alfaFilter = new X.AlphaFilter({ alpha: P.SCHADUW.sterkte });
    schaduwLaag.filters = [alfaFilter];
    scherm = new X.Rectangle(0, 0, b, h);
    schaduwLaag.filterArea = scherm;
    wereld.filterArea = scherm;
    kleurFilter = new X.ColorMatrixFilter();
    const k = P.AVOND;
    kleurFilter.matrix = [k[0], 0, 0, 0, 0, 0, k[1], 0, 0, 0, 0, 0, k[2], 0, 0, 0, 0, 0, 1, 0];
  };
  weg.maat = function (b, h) {
    weg.renderer.resize(b, h);
    weg.b = b;
    weg.h = h;
  };

  function bronVan(img) {
    let s = bronnen.get(img);
    if (!s) {
      const opties = { resource: img, autoGenerateMipmaps: mip && !(img instanceof HTMLCanvasElement), scaleMode: mip ? 'linear' : 'nearest' };
      s = img instanceof HTMLCanvasElement ? new X.CanvasSource(opties) : new X.ImageSource(opties);
      if (mip) s.style.mipmapFilter = 'linear';
      bronnen.set(img, s);
    }
    return s;
  }
  // Eén Texture per uitsnede (een vel deelt zijn bron), en elke uitsnede maar één keer: zo ontstaat er per beeld niets.
  function textuur(img, sx, sy, sw, sh) {
    const s = bronVan(img);
    let m = texturen.get(s);
    if (!m) texturen.set(s, (m = new Map()));
    const sleutel = sx * 1e8 + sy * 1e4 + sw + sh / 1e4;
    let t = m.get(sleutel);
    if (!t) m.set(sleutel, (t = new X.Texture({ source: s, frame: new X.Rectangle(sx, sy, sw, sh) })));
    return t;
  }

  // Eén keer: elk ding een Sprite in de laag van de dingen, en wie een schaduw heeft ook een in de schaduwlaag.
  weg.bouw = function (sc) {
    const kleur = hex(P.SCHADUW.kleur);
    const so = P.inst.sorteer;
    dingLaag.sortableChildren = so !== 'eigen';
    for (const d of sc.dingen) {
      const s = new X.Sprite(textuur(d.img, d.sx, d.sy, d.sw, d.sh));
      s.zIndex = d.d;
      s.visible = so !== 'alles';
      if (so === 'alles') dingLaag.addChild(s);
      let sh = null;
      if (d.schaduw) {
        sh = new X.Sprite(s.texture);
        sh.tint = kleur;
        sh.visible = false;
        schaduwLaag.addChild(sh);
      }
      d.pixi = { s, sh, tex: s.texture, schaduwTex: null, zicht: false, schaduwZicht: false, x: NaN, y: NaN, sx: NaN, sy: NaN, alpha: 1, schaal: 1, z: d.d };
      if (P.inst.culler === 'pixi') {
        s.cullable = true;
        if (sh) sh.cullable = true;
      }
    }
  };

  // De schaduw van een plaatje: dezelfde vierhoek als drawImage in js/gl.js bij this.schaduw. Een punt (u, v) in het
  // plaatje (v = 0 bovenaan) komt op x = dx + u + (dh - v) * rx, y = dy + dh + (dh - v) * ry.
  const schaduwMatrix = new X.Matrix();
  function zetSchaduw(sh, dx, dy, dh) {
    const { rx, ry } = P.ZON;
    schaduwMatrix.set(1, 0, -rx, -ry, dx + dh * rx, dy + dh + dh * ry);
    sh.setFromMatrix(schaduwMatrix);
  }

  weg.teken = function (sc, cam, inst) {
    const z = cam.zoom;
    wereld.scale.set(z);
    wereld.position.set(Math.round(weg.b / 2 - cam.x * z), Math.round(weg.h / 2 - cam.y * z));
    // Het vak van de filters ligt in de coördinaten van de laag zelf (Pixi legt er de wereldstand overheen).
    scherm.x = -wereld.position.x / z;
    scherm.y = -wereld.position.y / z;
    scherm.width = weg.b / z;
    scherm.height = weg.h / z;

    // De grond: per zoom een eigen laag met de stukken (dezelfde doeken als huidig.js).
    let laag = grondPerZoom.get(z);
    if (!laag) {
      grondPerZoom.set(z, (laag = new X.Container()));
      grondLaag.addChild(laag);
    }
    for (const l of grondPerZoom.values()) l.visible = l === laag;
    for (const s of laag.children) s.visible = false;
    for (const s of P.grondStukken(sc, cam, weg.b, weg.h, grond)) {
      if (!s.pixi) {
        s.pixi = new X.Sprite(textuur(s.doek, 0, 0, 512, 512));
        s.pixi.position.set(s.x, s.y);
        s.pixi.scale.set(s.S / 512);
        laag.addChild(s.pixi);
      }
      s.pixi.visible = true;
    }

    // Wat veranderde, naar de sprites; zichtbaar of niet uit hetzelfde vak als huidig.js (of Pixi's eigen Culler).
    const v = P.vak(cam, weg.b, weg.h);
    const eigen = inst.culler !== 'pixi';
    const so = inst.sorteer;
    const eigenVolgorde = so === 'eigen';
    let n = 0;
    lijst.length = 0;
    for (const d of sc.dingen) {
      const p = d.pixi;
      const o = P.weergave(d, inst, v);
      const zie = !!o && (!eigen || P.inVak(d, o, v));
      if (eigenVolgorde) { if (zie) lijst.push(d); } else if (zie !== p.zicht) {
        if (so === 'alles') p.s.visible = zie;
        else if (zie) dingLaag.addChild(p.s);
        else dingLaag.removeChild(p.s);
        p.zicht = zie;
      }
      const schaduwZie = zie && !!p.sh && o.schaduw;
      if (p.sh && schaduwZie !== p.schaduwZicht) { p.sh.visible = schaduwZie; p.schaduwZicht = schaduwZie; }
      if (!zie) continue;
      n++;
      const t = textuur(o.img, o.sx, o.sy, o.sw, o.sh);
      if (t !== p.tex) { p.s.texture = t; p.tex = t; if (p.sh) p.sh.texture = t; p.x = NaN; }
      const dx = d.wx - o.ax * o.schaal;
      const dy = d.wy - o.ay * o.schaal;
      if (dx !== p.x || dy !== p.y) {
        p.s.position.set(dx, dy);
        if (schaduwZie) zetSchaduw(p.sh, dx, dy, o.sh);
        p.x = dx;
        p.y = dy;
      }
      if (o.schaal !== p.schaal) { p.s.scale.set(o.schaal); p.schaal = o.schaal; }
      if (o.alpha !== p.alpha) { p.s.alpha = o.alpha; p.alpha = o.alpha; }
      if (!eigenVolgorde && d.d !== p.z) { p.s.zIndex = d.d; p.z = d.d; }
    }
    weg.zicht = n;
    if (eigenVolgorde) {
      lijst.sort((a, b) => a.d - b.d);
      kinderen.length = 0;
      for (const d of lijst) kinderen.push(d.pixi.s);
      dingLaag.removeChildren();
      if (kinderen.length) dingLaag.addChild(...kinderen);
    }
    if (!eigen) {
      const rect = { x: 0, y: 0, width: weg.b, height: weg.h };
      X.Culler.shared.cull(stage, rect, false);
    }
    if (!!inst.schaduw !== schaduwLaag.visible) schaduwLaag.visible = !!inst.schaduw;
    if (!!inst.licht !== lichtAan) {
      wereld.filters = inst.licht ? [kleurFilter] : null;
      lichtAan = !!inst.licht;
    }
    weg.renderer.render(stage);
  };
  weg.wacht = function () {
    const gl = weg.renderer.gl;
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4));
  };

  P.wegen = P.wegen || {};
  P.wegen.pixi = weg;
})(globalThis.Proef = globalThis.Proef || {});
