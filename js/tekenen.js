// Het beeld. Eerst alle vloeren, dan het gevechtsraster en de markeringen daarop, dan muren,
// deuren, voorwerpen en wezens van achter naar voor, en als laatste de effecten. De muren aan
// de voorkant van de kamer waar de held staat, worden laag getekend: zo kijk je de kamer in,
// zoals bij een poppenhuis. Kamers waar je niet bent, staan gedimd; kamers waar je nooit
// geweest bent, blijven donker.
(function (T) {
  'use strict';

  const GEDIMD = 0.58;
  const HOOFD = '#e9c6a0';

  T.tekenScene = function (ctx, S, bw, bh) {
    const w = S.wereld;
    ctx.fillStyle = '#0c0b0a';
    ctx.fillRect(0, 0, bw, bh);
    ctx.save();
    // Dezelfde afronding als naarVlak in main.js, anders wijst de muis net naast de tegel.
    ctx.translate(Math.round(bw / 2), Math.round(bh / 2));
    ctx.scale(S.zoom, S.zoom);
    ctx.translate(-Math.round(S.camera.x), -Math.round(S.camera.y));

    const inBeeld = (id) => id === w.huidigeKamer || (!!S.gevecht && S.gevecht.kamers.has(id));
    // Opengewerkt: de kamer van de held, en in een gevecht elke kamer waarin gevochten wordt.
    const open = w.kamers.filter((k) => inBeeld(k.id));

    tekenVloeren(ctx, S, inBeeld);
    tekenRaster(ctx, S);
    tekenMarkeringen(ctx, S);

    const lijst = [];
    for (let y = 0; y < w.h; y++) {
      for (let x = 0; x < w.b; x++) {
        if (T.tegel(w, x, y) !== 'muur' || !T.isZichtbaar(w, x, y)) continue;
        const laag = isVoorrand(open, x, y);
        const helder = w.burenKamers[y][x].some(inBeeld) ? 1 : GEDIMD;
        lijst.push({ d: x + y, l: 0, f: () => tekenMuur(ctx, x, y, laag, helder) });
      }
    }
    for (const deur of w.deuren.values()) {
      if (!T.isZichtbaar(w, deur.x, deur.y)) continue;
      const laag = isVoorrand(open, deur.x, deur.y);
      const helder = w.burenKamers[deur.y][deur.x].some(inBeeld) ? 1 : GEDIMD;
      lijst.push({ d: deur.x + deur.y, l: 1, f: () => tekenDeur(ctx, deur, laag, helder) });
    }
    for (const v of w.voorwerpen) {
      if (!T.isZichtbaar(w, v.x, v.y)) continue;
      const k = T.kamerVan(w, v.x, v.y);
      const helder = k && inBeeld(k.id) ? 1 : GEDIMD;
      lijst.push({ d: v.x + v.y, l: 1, f: () => tekenVoorwerp(ctx, S, v, helder) });
    }
    for (const e of w.wezens) {
      if (e.dood && e.sterfTijd > 0.8) continue;
      if (!T.isZichtbaar(w, e.tx, e.ty)) continue;
      lijst.push({ d: e.x + e.y, l: 2, f: () => tekenWezen(ctx, S, e) });
    }
    lijst.sort((a, b) => a.d - b.d || a.l - b.l);
    for (const item of lijst) item.f();

    tekenEffecten(ctx, S);
    ctx.restore();
    tekenVignet(ctx, S, bw, bh);
  };

  // Ligt deze tegel aan de voorkant (zuid- of oostkant) van een van deze kamers?
  function isVoorrand(kamers, x, y) {
    return kamers.some(
      (k) => (y === k.y2 + 1 && x >= k.x1 - 1 && x <= k.x2 + 1) || (x === k.x2 + 1 && y >= k.y1 - 1 && y <= k.y2 + 1),
    );
  }

  function tekenVloeren(ctx, S, inBeeld) {
    const w = S.wereld;
    for (let y = 0; y < w.h; y++) {
      for (let x = 0; x < w.b; x++) {
        const t = T.tegel(w, x, y);
        if ((t !== 'vloer' && t !== 'deur') || !T.isZichtbaar(w, x, y)) continue;
        const p = T.naarScherm(x, y);
        let hex;
        let helder;
        if (t === 'vloer') {
          const k = T.kamerVan(w, x, y);
          hex = k.vloer[(x + y) % 2];
          helder = inBeeld(k.id) ? 1 : GEDIMD;
        } else {
          hex = '#5b4c3c';
          helder = w.burenKamers[y][x].some(inBeeld) ? 1 : GEDIMD;
        }
        const ruis = 0.95 + ((x * 73 + y * 151) % 11) / 100; // een tikje verschil per tegel
        T.ruit(ctx, p.x, p.y, 1);
        ctx.fillStyle = T.rgb(T.kleur(hex), helder * ruis);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.24)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  // Het raster rolt uit vanaf de plek van de held, als een rimpeling over de vloer, en
  // vervaagt weer als het gevecht voorbij is.
  function tekenRaster(ctx, S) {
    if (S.rasterAlpha < 0.01 || !S.rasterTegels.length) return;
    const van = S.rasterVan || T.tegelVan(S.held);
    const verstreken = S.tijd - S.rasterStart;
    ctx.save();
    ctx.strokeStyle = 'rgba(245, 230, 190, 0.42)';
    ctx.lineWidth = 1;
    for (const t of S.rasterTegels) {
      if (!T.isZichtbaar(S.wereld, t.x, t.y)) continue;
      const golf = S.modus === 'gevecht' ? Math.min(1, Math.max(0, verstreken * 16 - Math.hypot(t.x - van.x, t.y - van.y))) : 1;
      if (golf <= 0) continue;
      ctx.globalAlpha = S.rasterAlpha * golf;
      const p = T.naarScherm(t.x, t.y);
      T.ruit(ctx, p.x, p.y, 0.9);
      ctx.stroke();
    }
    ctx.restore();
  }

  function tekenMarkeringen(ctx, S) {
    const h = S.handeling;
    const licht = 'rgba(250, 240, 210, 0.9)';
    const rood = 'rgba(224, 96, 79, 0.9)';

    // Bereik: waar de held deze beurt nog kan komen.
    if (S.bereik && S.modus === 'gevecht' && !S.bezig && S.actie !== 'vuurschicht') {
      ctx.fillStyle = 'rgba(111, 160, 230, 0.17)';
      for (const k of S.bereik.keys()) {
        const [x, y] = k.split(',').map(Number);
        const p = T.naarScherm(x, y);
        T.ruit(ctx, p.x, p.y, 0.86);
        ctx.fill();
      }
    }

    // Het pad dat een klik zou lopen.
    if (h && h.pad && h.pad.length) {
      const kleur = h.kan === false ? rood : licht;
      ctx.fillStyle = kleur;
      for (const t of h.pad) {
        const p = T.naarScherm(t.x, t.y);
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, 4, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      const laatste = h.pad[h.pad.length - 1];
      const p = T.naarScherm(laatste.x, laatste.y);
      T.ruit(ctx, p.x, p.y, 0.82);
      ctx.strokeStyle = kleur;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // De lijn van een vuurschicht, over de vloer naar het doel.
    if (h && h.lijn) {
      const a = T.naarScherm(S.held.x, S.held.y);
      const b = T.naarScherm(h.lijn.x, h.lijn.y);
      ctx.save();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = h.kan === false ? rood : 'rgba(255, 170, 80, 0.95)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
      ctx.restore();
    }

    // Wat er onder de muis ligt.
    const doel = S.hover;
    if (!doel || !(S.modus === 'verkennen' || S.modus === 'gevecht')) return;
    if (doel.wezen || doel.voorwerp) {
      const e = doel.wezen || doel.voorwerp;
      const p = T.naarScherm(e.x, e.y);
      ctx.strokeStyle = doel.wezen && doel.wezen.kant === 'monster' ? rood : 'rgba(250, 240, 210, 0.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 20, 10, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (h && !(h.pad && h.pad.length)) {
      const p = T.naarScherm(doel.x, doel.y);
      T.ruit(ctx, p.x, p.y, 0.9);
      ctx.strokeStyle = h.fout || h.kan === false ? rood : 'rgba(250, 240, 210, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  function tekenMuur(ctx, x, y, laag, helder) {
    const p = T.naarScherm(x, y);
    const hoogte = laag ? T.MUUR_LAAG : T.MUUR_HOOG;
    T.blok(ctx, p.x, p.y, 0.5, 0.5, hoogte, '#7b7368', { helder });
    if (laag) return;
    // twee voegen, zodat het steen wordt en geen karton
    ctx.strokeStyle = 'rgba(0,0,0,0.16)';
    ctx.lineWidth = 1;
    for (const z of [21, 42]) {
      const a = T.blokPunt(p.x, p.y, -0.5, 0.5, z);
      const b = T.blokPunt(p.x, p.y, 0.5, 0.5, z);
      const c = T.blokPunt(p.x, p.y, 0.5, -0.5, z);
      ctx.beginPath();
      ctx.moveTo(a[0], a[1]);
      ctx.lineTo(b[0], b[1]);
      ctx.lineTo(c[0], c[1]);
      ctx.stroke();
    }
  }

  function tekenDeur(ctx, d, laag, helder) {
    const p = T.naarScherm(d.x, d.y);
    const ns = d.richting === 'ns'; // de muur loopt van noord naar zuid: het paneel is dun in x
    const muurHoogte = laag ? T.MUUR_LAAG : T.MUUR_HOOG;
    const steen = '#6f675c';
    if (d.staat === 'open') {
      for (const s of [-0.4, 0.4]) {
        const q = ns ? T.naarScherm(d.x, d.y + s) : T.naarScherm(d.x + s, d.y);
        T.blok(ctx, q.x, q.y, ns ? 0.5 : 0.1, ns ? 0.1 : 0.5, muurHoogte, steen, { helder });
      }
      if (!laag) T.blok(ctx, p.x, p.y, 0.5, 0.5, 12, steen, { helder, basis: muurHoogte - 12 });
      return;
    }
    const fx = ns ? 0.14 : 0.5;
    const fy = ns ? 0.5 : 0.14;
    const hoogte = laag ? T.MUUR_LAAG : 54;
    T.blok(ctx, p.x, p.y, fx, fy, hoogte, d.staat === 'opslot' ? '#6b4526' : '#7d5431', { helder });
    if (laag) {
      // ook een lage deur laat zien dat hij op slot zit
      if (d.staat === 'opslot') {
        rondje(ctx, p.x, p.y - hoogte, 4.5, '#e2b64a');
        rondje(ctx, p.x, p.y - hoogte + 0.5, 1.7, '#2a2016');
      }
      return;
    }
    // planken, en bij een deur op slot ijzeren banden en een slot
    const punt = (a, z) => (ns ? T.blokPunt(p.x, p.y, fx, a, z) : T.blokPunt(p.x, p.y, a, fy, z));
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    for (const a of [-0.25, 0, 0.25]) {
      const b = punt(a, 0);
      const c = punt(a, hoogte);
      ctx.beginPath();
      ctx.moveTo(b[0], b[1]);
      ctx.lineTo(c[0], c[1]);
      ctx.stroke();
    }
    if (d.staat === 'opslot') {
      ctx.strokeStyle = 'rgba(38, 38, 42, 0.95)';
      ctx.lineWidth = 3;
      for (const z of [13, 41]) {
        const b = punt(-0.5, z);
        const c = punt(0.5, z);
        ctx.beginPath();
        ctx.moveTo(b[0], b[1]);
        ctx.lineTo(c[0], c[1]);
        ctx.stroke();
      }
      const s = punt(0.2, 27);
      rondje(ctx, s[0], s[1], 4.2, '#e2b64a');
      rondje(ctx, s[0], s[1] + 0.5, 1.6, '#2a2016');
    }
  }

  function tekenVoorwerp(ctx, S, v, helder) {
    const p = T.naarScherm(v.x, v.y);
    if (v.soort === 'kist') {
      T.blok(ctx, p.x, p.y, 0.34, 0.34, 28, '#8a5a2c', { helder });
      T.blok(ctx, p.x, p.y, 0.36, 0.36, 4, '#6e4622', { helder, basis: 28 });
      return;
    }
    if (v.soort === 'pilaar') {
      T.blok(ctx, p.x, p.y, 0.32, 0.32, 8, '#6f6a62', { helder });
      T.blok(ctx, p.x, p.y, 0.22, 0.22, 74, '#8d877d', { helder, basis: 8 });
      T.blok(ctx, p.x, p.y, 0.32, 0.32, 8, '#6f6a62', { helder, basis: 82 });
      return;
    }
    if (v.soort === 'fontein') {
      T.blok(ctx, p.x, p.y, 0.42, 0.42, 16, '#8a8478', { helder });
      T.ruit(ctx, p.x, p.y - 16, 0.64);
      ctx.fillStyle = T.rgb(T.kleur('#3f7fc2'), helder);
      ctx.fill();
      const golf = (Math.sin(S.tijd * 2.2) + 1) / 2;
      ctx.strokeStyle = `rgba(200, 230, 255, ${0.25 + golf * 0.3})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y - 16, 8 + golf * 10, 4 + golf * 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      T.blok(ctx, p.x, p.y, 0.07, 0.07, 14, '#9c968a', { helder, basis: 16 });
      rondje(ctx, p.x, p.y - 32 + Math.sin(S.tijd * 5) * 1.5, 2.2, 'rgba(190, 225, 255, 0.9)');
      return;
    }
    if (v.soort === 'trap') {
      // treden die naar achteren oplopen, met een gloed boven: daar is de uitgang
      for (let i = 2; i >= 0; i--) {
        const o = T.naarScherm(v.x - 0.13 * i, v.y - 0.13 * i);
        T.blok(ctx, o.x, o.y, 0.45 - 0.13 * i, 0.45 - 0.13 * i, 12 * (i + 1), '#7d776d', { helder });
      }
      const top = T.naarScherm(v.x - 0.26, v.y - 0.26);
      gloed(ctx, top.x, top.y - 40, 26, 'rgba(255, 214, 120,', 0.35 + Math.sin(S.tijd * 2) * 0.1);
      return;
    }
    if (v.soort === 'sleutel') {
      const z = 13 + Math.sin(S.tijd * 3) * 3;
      gloed(ctx, p.x, p.y, 16, 'rgba(226, 182, 74,', 0.3);
      const kx = p.x - 5;
      const ky = p.y - z;
      ctx.strokeStyle = '#e8c04e';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(kx, ky, 4.5, 0, Math.PI * 2);
      ctx.moveTo(kx + 4.5, ky);
      ctx.lineTo(kx + 15, ky);
      ctx.moveTo(kx + 11, ky);
      ctx.lineTo(kx + 11, ky + 4);
      ctx.moveTo(kx + 14.5, ky);
      ctx.lineTo(kx + 14.5, ky + 3);
      ctx.stroke();
    }
  }

  const TEKENAARS = {
    // De meester wordt zichtbaar ouder: de baard groeit, de rug buigt, de hoedpunt zakt.
    // Zo zie je aan de figuur zelf hoeveel tijd er nog is, niet alleen aan de balk.
    held(ctx, cx, cy, bob, e, S) {
      const ouder = Math.min(1, Math.max(0, (e.leeftijd - T.STARTLEEFTIJD) / (T.EINDLEEFTIJD - T.STARTLEEFTIJD)));
      const krom = ouder * 4; // hoofd schuift naar voren en omlaag
      const lijf = 24 + bob - ouder * 3;
      T.blok(ctx, cx, cy, 0.2, 0.2, lijf, '#3f6fb7'); // gewaad
      const hx = cx + krom;
      const hy = cy - lijf - 7 + krom * 0.5;
      rondje(ctx, hx, hy, 7, HOOFD);
      rondje(ctx, hx - 2.5, hy - 1, 1.1, '#2b2118');
      rondje(ctx, hx + 2.5, hy - 1, 1.1, '#2b2118');
      ctx.fillStyle = '#ece8dd'; // baard
      ctx.beginPath();
      ctx.moveTo(hx - 6, hy + 1.5);
      ctx.lineTo(hx + 6, hy + 1.5);
      ctx.lineTo(hx + 1, hy + 15 + ouder * 12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#233f7a'; // punthoed, waarvan de punt steeds verder omzakt
      ctx.beginPath();
      ctx.ellipse(hx, hy - 5, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(hx - 8, hy - 5);
      ctx.lineTo(hx + 8, hy - 5);
      ctx.lineTo(hx + 4 + ouder * 10, hy - 28 + ouder * 10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#8b6b3d'; // staf
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx + 13, cy + 2);
      ctx.lineTo(cx + 13, cy - 44);
      ctx.stroke();
      // hoe ouder, hoe sterker de magie: de gloed op de staf groeit mee
      gloed(ctx, cx + 13, cy - 47, 8 + T.magieBonus(e.leeftijd) * 3, 'rgba(255, 214, 110,', 0.9);
      rondje(ctx, cx + 13, cy - 47, 2.8, '#fff0b0');
      return hy - 28;
    },

    wim(ctx, cx, cy, bob) {
      ctx.strokeStyle = '#9a7a4a'; // bezem
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx - 14, cy + 1);
      ctx.lineTo(cx - 11, cy - 40);
      ctx.stroke();
      ctx.fillStyle = '#c9a55a';
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy + 4);
      ctx.lineTo(cx - 8, cy + 4);
      ctx.lineTo(cx - 13.5, cy - 8);
      ctx.closePath();
      ctx.fill();
      T.blok(ctx, cx, cy, 0.19, 0.19, 22 + bob, '#7a5a3a'); // stofjas
      const hy = cy - 22 - bob - 7;
      rondje(ctx, cx, hy, 7, '#e3bf98');
      rondje(ctx, cx - 2.5, hy - 1, 1.1, '#2b2118');
      rondje(ctx, cx + 2.5, hy - 1, 1.1, '#2b2118');
      ctx.fillStyle = '#cfcac0'; // snor
      ctx.beginPath();
      ctx.ellipse(cx, hy + 3, 5, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3d4a5a'; // pet met klep
      ctx.beginPath();
      ctx.ellipse(cx, hy - 5, 8.5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 4, hy - 3.5, 6, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();
      return hy - 9;
    },

    slijm(ctx, cx, cy, bob, e, S) {
      const s = Math.sin(S.tijd * 4 + e.fase);
      const rb = 17 * (1 + s * 0.07);
      const rh = 14 * (1 - s * 0.07);
      ctx.fillStyle = '#4e9a3e';
      ctx.beginPath();
      ctx.ellipse(cx, cy - rh * 0.5, rb, rh, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.28)';
      ctx.beginPath();
      ctx.ellipse(cx - 6, cy - rh * 0.95, 5, 3, -0.4, 0, Math.PI * 2);
      ctx.fill();
      rondje(ctx, cx - 5, cy - rh * 0.6, 3.3, '#f4f1e6');
      rondje(ctx, cx + 5, cy - rh * 0.6, 3.3, '#f4f1e6');
      rondje(ctx, cx - 4.3, cy - rh * 0.57, 1.5, '#1b1b1b');
      rondje(ctx, cx + 5.7, cy - rh * 0.57, 1.5, '#1b1b1b');
      return cy - rh * 1.5;
    },

    skelet(ctx, cx, cy, bob) {
      ctx.strokeStyle = '#b9c0c8'; // zwaard
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx + 12, cy - 9);
      ctx.lineTo(cx + 21, cy - 40);
      ctx.stroke();
      ctx.strokeStyle = '#6b5a3a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + 8, cy - 12);
      ctx.lineTo(cx + 16, cy - 9);
      ctx.stroke();
      T.blok(ctx, cx, cy, 0.17, 0.17, 23 + bob, '#cfc8b3');
      ctx.strokeStyle = 'rgba(60, 50, 40, 0.55)'; // ribben
      ctx.lineWidth = 1.2;
      for (const z of [9, 14, 19]) {
        const a = T.blokPunt(cx, cy, -0.17, 0.17, z + bob);
        const b = T.blokPunt(cx, cy, 0.17, 0.17, z + bob);
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
      }
      const hy = cy - 23 - bob - 8;
      rondje(ctx, cx, hy, 7.5, '#e7e1cf');
      rondje(ctx, cx - 2.8, hy - 0.5, 2.1, '#1c1a17');
      rondje(ctx, cx + 2.8, hy - 0.5, 2.1, '#1c1a17');
      rondje(ctx, cx - 2.8, hy - 0.5, 0.8, '#e0604f');
      rondje(ctx, cx + 2.8, hy - 0.5, 0.8, '#e0604f');
      ctx.strokeStyle = 'rgba(40, 30, 20, 0.6)'; // tanden
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 3, hy + 4);
      ctx.lineTo(cx + 3, hy + 4);
      ctx.stroke();
      return hy - 9;
    },
  };

  function tekenWezen(ctx, S, e) {
    const p = T.naarScherm(e.x, e.y);
    let cx = p.x;
    let cy = p.y;
    if (e.uitval) {
      const q = T.naarScherm(e.uitval.doel.x, e.uitval.doel.y);
      const k = e.uitval.t < 0.5 ? e.uitval.t * 2 : (1 - e.uitval.t) * 2;
      cx += (q.x - p.x) * 0.32 * k;
      cy += (q.y - p.y) * 0.32 * k;
    }
    ctx.save();
    if (e.dood) {
      ctx.globalAlpha = Math.max(0, 1 - e.sterfTijd / 0.8);
      cy += e.sterfTijd * 10;
    }
    ctx.fillStyle = 'rgba(0,0,0,0.32)'; // schaduw
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, 14, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    const bob = Math.sin(S.tijd * 2.6 + e.fase) * 1.3;
    const huppel = e.onderweg ? Math.abs(Math.sin(S.tijd * 14)) * 2.5 : 0;
    const top = TEKENAARS[e.soort](ctx, cx, cy - huppel, bob, e, S);
    if (e.flits > 0) {
      ctx.fillStyle = `rgba(255, 70, 50, ${Math.min(0.55, e.flits * 2)})`;
      ctx.beginPath();
      ctx.ellipse(cx, (cy + top) / 2, 15, (cy - top) / 2 + 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    if (!e.dood && e.kant === 'monster' && (S.gevecht || e.leven < e.maxLeven)) levensbalk(ctx, cx, top - 9, e);
    if (e.alarm > 0) {
      const sprong = Math.abs(Math.sin(e.alarm * 9)) * 4;
      ctx.font = 'bold 24px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(0,0,0,0.8)';
      ctx.strokeText('!', cx, top - 14 - sprong);
      ctx.fillStyle = '#ffd24a';
      ctx.fillText('!', cx, top - 14 - sprong);
    }
  }

  function levensbalk(ctx, cx, y, e) {
    const b = 30;
    const f = e.leven / e.maxLeven;
    ctx.fillStyle = 'rgba(0,0,0,0.65)';
    ctx.fillRect(cx - b / 2 - 1, y - 1, b + 2, 6);
    ctx.fillStyle = f > 0.5 ? '#86c46f' : f > 0.25 ? '#e2b64a' : '#e0604f';
    ctx.fillRect(cx - b / 2, y, b * f, 4);
  }

  function tekenEffecten(ctx, S) {
    for (const fx of S.effecten) {
      const f = fx.t / fx.duur;
      if (fx.soort === 'tekst') {
        const p = T.naarScherm(fx.x, fx.y);
        const y = p.y - 64 - f * 30;
        ctx.save();
        ctx.globalAlpha = Math.max(0, 1 - f * f);
        ctx.font = 'bold 18px Georgia, serif';
        ctx.textAlign = 'center';
        ctx.lineWidth = 4;
        ctx.strokeStyle = 'rgba(0,0,0,0.75)';
        ctx.strokeText(fx.tekst, p.x, y);
        ctx.fillStyle = fx.kleur;
        ctx.fillText(fx.tekst, p.x, y);
        ctx.restore();
      } else if (fx.soort === 'schicht') {
        for (let i = 4; i >= 0; i--) {
          const g = Math.max(0, f - i * 0.05);
          const p = T.naarScherm(fx.van.x + (fx.naar.x - fx.van.x) * g, fx.van.y + (fx.naar.y - fx.van.y) * g);
          if (i === 0) {
            gloed(ctx, p.x, p.y - 24, 16, 'rgba(255, 150, 60,', 0.95);
            rondje(ctx, p.x, p.y - 24, 4.5, '#fff1b8');
          } else {
            rondje(ctx, p.x, p.y - 24, 4.5 - i * 0.7, `rgba(255, 170, 80, ${0.5 - i * 0.09})`);
          }
        }
      } else if (fx.soort === 'knal') {
        const p = T.naarScherm(fx.x, fx.y);
        ctx.strokeStyle = `rgba(255, 170, 80, ${1 - f})`;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(p.x, p.y - 20, 8 + f * 26, 4 + f * 13, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  // Donkere randen; in een gevecht kleuren ze een fractie rood mee.
  function tekenVignet(ctx, S, bw, bh) {
    const g = ctx.createRadialGradient(bw / 2, bh / 2, Math.min(bw, bh) * 0.32, bw / 2, bh / 2, Math.max(bw, bh) * 0.75);
    const r = Math.round(45 * S.rasterAlpha);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, `rgba(${r},0,0,0.6)`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, bw, bh);
  }

  function rondje(ctx, x, y, r, kleur) {
    ctx.fillStyle = kleur;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // prefix is bijvoorbeeld 'rgba(255, 214, 110,' — de dekking komt erachter.
  function gloed(ctx, x, y, r, prefix, dekking) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, prefix + dekking + ')');
    g.addColorStop(1, prefix + '0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
})(globalThis.Toren = globalThis.Toren || {});
