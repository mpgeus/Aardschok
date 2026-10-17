// De huidige weg (renderproef): js/gl.js, de eigen laag op WebGL1 die zich voordoet als het 2D-doek, gebruikt zoals
// js/tekenen.js het doet. Per beeld: de grond (stukken), de lijst van wat in beeld is, gesorteerd, eerst als silhouet
// op het masker van de schaduwen (beginSchaduw ... eindSchaduw), dan alles, dan het licht (tekenLichtkaart).
(function (P) {
  'use strict';
  const G = globalThis.Spel.gl;
  const weg = { naam: 'huidig', canvas: null, b: 0, h: 0, zicht: 0 };
  const zicht = [];
  const grond = [];

  weg.init = function (b, h) {
    if (!G.kan()) throw new Error('js/gl.js kan hier niet met de videokaart tekenen');
    G.zetMaat(b, h, 1);
    weg.canvas = G.doek();
    weg.b = b;
    weg.h = h;
  };
  weg.maat = function (b, h) {
    G.zetMaat(b, h, 1);
    weg.b = b;
    weg.h = h;
  };

  weg.teken = function (sc, cam, inst) {
    const ctx = G.begin();
    if (!ctx) return;
    const z = cam.zoom;
    const tx = Math.round(weg.b / 2 - cam.x * z);
    const ty = Math.round(weg.h / 2 - cam.y * z);
    ctx.setTransform(z, 0, 0, z, tx, ty);
    for (const s of P.grondStukken(sc, cam, weg.b, weg.h, grond)) ctx.drawImage(s.doek, 0, 0, 512, 512, s.x, s.y, s.S, s.S);

    // De lijst: wat in beeld is, en hoe het eruitziet, gesorteerd op volgorde.
    const v = P.vak(cam, weg.b, weg.h);
    zicht.length = 0;
    for (const d of sc.dingen) {
      const o = P.weergave(d, inst, v);
      if (o && P.inVak(d, o, v)) zicht.push(d);
    }
    zicht.sort((a, b) => a.d - b.d);
    weg.zicht = zicht.length;

    if (inst.schaduw) {
      ctx.globalAlpha = 1;
      ctx.beginSchaduw(P.ZON.rx, P.ZON.ry);
      for (const d of zicht) {
        const o = d.nu;
        if (o.schaduw) ctx.drawImage(o.img, o.sx, o.sy, o.sw, o.sh, d.wx - o.ax, d.wy - o.ay, o.sw, o.sh);
      }
      ctx.eindSchaduw(P.SCHADUW.sterkte, P.SCHADUW.kleur);
    }
    for (const d of zicht) {
      const o = d.nu;
      ctx.globalAlpha = o.alpha;
      const w = o.sw * o.schaal;
      const h = o.sh * o.schaal;
      ctx.drawImage(o.img, o.sx, o.sy, o.sw, o.sh, d.wx - o.ax * o.schaal, d.wy - o.ay * o.schaal, w, h);
    }
    ctx.globalAlpha = 1;
    if (inst.licht) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.tekenLichtkaart(P.AVOND, []);
    }
    G.klaar();
  };
  // Wachten tot de kaart klaar is (één pixel teruglezen), zoals de tekenmeting.
  weg.wacht = () => G.wacht();

  P.wegen = P.wegen || {};
  P.wegen.huidig = weg;
})(globalThis.Proef = globalThis.Proef || {});
