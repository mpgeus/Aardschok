// Isometrisch rekenen en tekenen. Een tegel is een ruit van 64 bij 32 pixels, en
// wereldpunt (x, y) is het midden van tegel (x, y). Alles wat getekend wordt, is voorlopig
// een blok of een ruit: de plaatjes komen later, de maten blijven.
(function (T) {
  'use strict';

  const HB = 32; // halve tegelbreedte
  const HH = 16; // halve tegelhoogte
  T.HB = HB;
  T.HH = HH;
  T.MUUR_HOOG = 64;
  T.MUUR_LAAG = 10;

  T.naarScherm = (x, y) => ({ x: (x - y) * HB, y: (x + y) * HH });
  T.naarWereld = (sx, sy) => ({ x: (sx / HB + sy / HH) / 2, y: (sy / HH - sx / HB) / 2 });

  const kleuren = new Map();
  // '#rrggbb' → [r, g, b]
  T.kleur = function (hex) {
    let c = kleuren.get(hex);
    if (!c) {
      const n = parseInt(hex.slice(1), 16);
      c = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
      kleuren.set(hex, c);
    }
    return c;
  };

  // Een kleur als css-tekst. f > 1 mengt naar wit, f < 1 naar zwart.
  T.rgb = function (c, f, a) {
    let r = c[0];
    let g = c[1];
    let b = c[2];
    if (f > 1) {
      const m = f - 1;
      r += (255 - r) * m;
      g += (255 - g) * m;
      b += (255 - b) * m;
    } else if (f < 1) {
      r *= f;
      g *= f;
      b *= f;
    }
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);
    return a == null ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${a})`;
  };

  // Een ruit rond (cx, cy). s = 1 is een hele tegel.
  T.ruit = function (ctx, cx, cy, s) {
    const k = s == null ? 1 : s;
    ctx.beginPath();
    ctx.moveTo(cx, cy - HH * k);
    ctx.lineTo(cx + HB * k, cy);
    ctx.lineTo(cx, cy + HH * k);
    ctx.lineTo(cx - HB * k, cy);
    ctx.closePath();
  };

  // Een punt op een blok: (dx, dy) in tegels vanaf het midden, z in pixels omhoog.
  T.blokPunt = (cx, cy, dx, dy, z) => [cx + (dx - dy) * HB, cy + (dx + dy) * HH - z];

  // Een blok met een grondvlak van fx bij fy (halve tegels) rond (cx, cy), `hoogte` pixels
  // hoog. opties.basis: zweeft zoveel pixels boven de vloer. opties.helder: 1 = normaal,
  // lager = gedimd (kamers waar je niet bent). Licht van linksboven: het linkervlak is iets
  // donkerder dan de bovenkant, het rechtervlak het donkerst.
  T.blok = function (ctx, cx, cy, fx, fy, hoogte, hex, opties) {
    const o = opties || {};
    const c = T.kleur(hex);
    const h = o.helder == null ? 1 : o.helder;
    const basis = [c[0] * h, c[1] * h, c[2] * h];
    const z0 = o.basis || 0;
    const z1 = z0 + hoogte;
    const p = (dx, dy, z) => T.blokPunt(cx, cy, dx, dy, z);
    const vlak = (punten, f) => {
      ctx.beginPath();
      ctx.moveTo(punten[0][0], punten[0][1]);
      for (let i = 1; i < punten.length; i++) ctx.lineTo(punten[i][0], punten[i][1]);
      ctx.closePath();
      ctx.fillStyle = T.rgb(basis, f);
      ctx.fill();
      if (o.rand !== false) {
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    };
    if (hoogte > 0) {
      vlak([p(-fx, fy, z0), p(fx, fy, z0), p(fx, fy, z1), p(-fx, fy, z1)], 0.84);
      vlak([p(fx, fy, z0), p(fx, -fy, z0), p(fx, -fy, z1), p(fx, fy, z1)], 0.64);
    }
    vlak([p(-fx, -fy, z1), p(fx, -fy, z1), p(fx, fy, z1), p(-fx, fy, z1)], 1.1);
  };
})(globalThis.Spel = globalThis.Spel || {});
