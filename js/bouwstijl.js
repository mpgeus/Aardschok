// De bouwstijl van een land (werklijst vraag 114, stap 2; Marcel, 4 okt: de vier stijlen, "ja drie per soort, hutten
// houden riet", en voor de eerste stijl "A ja B ja C ik wil overal bouwfase voor. ... D ja"). Elk land van de maker
// bouwt in één stijl: per soort een paar eigen vormen, elk met zijn deur naar elke kant (zuid, oost, noord of west), onder
// het dak van de trede waarin het gebouwd wordt of doorgroeit (dat van het gehucht, leien in een dorp, pannen met
// marktrecht), en een stenen huis in baksteen pas als het dorp een steenbakkerij heeft. Wat er al staat, houdt zijn dak:
// aan de daken zie je de geschiedenis van het dorp.
//
// De tekeningen komen van de huizenbouwer (gereedschap/pixelart/huizen.cjs, STIJLEN), en elk zegt in tegels.js zelf wat
// het is (`stijl`: { stijl, vorm, soort, dak, steen, stand }); dit bestand zoekt ze op. Wat de huizenbouwer een stand
// noemt, heet hier de kant van de deur (`kant`), want in het spel is een stand die van de mensen (js/wensen.js). Een land
// zonder stijl (het ontworpen gehucht, een kaart uit Tiled, een spel dat eerder bewaard is) bouwt met de tekeningen in
// T.GEBOUWEN, zoals het altijd deed (T.tekeningenVan, js/gebouwen.js).
//
//   w.stijl                         de stijl van een kaart (de maker zet hem, js/maker.js), en dus van zijn dorp
//   T.stijlVan(D)                   de stijl van een dorp, als er tekeningen voor zijn; anders null
//   T.stijlTekeningen(D, soort)     de tekeningen die een nieuw gebouw van die soort nu kan krijgen, één per vorm
//   T.deurKantVan(tekening)         naar welke kant zijn deur kijkt: 'z', 'o', 'n' of 'w' (null zonder stijl)
//   T.metDeurNaar(tekening, kant)   dezelfde vorm, dak en steen, met de deur naar een andere kant
//   T.zoalsNu(D, tekening, soort)   dezelfde vorm en kant, met het dak en de steen van nu (wie doorgroeit)
//   T.zijdenNaarDeWeg(w, r)         de kanten van een erf of een voet, de kant die het dichtst bij de weg ligt eerst
//   T.keerNaarDeWeg(D, soort, x, y) een verzoek keert zijn deur naar de weg (js/verzoeken.js)
(function (T) {
  'use strict';

  // De vier kanten waar een deur naar kan kijken: zuid (+y) en oost (+x) naar je toe, noord en west van je af. Bij gelijke
  // afstand tot de weg gaat een deur die je ziet voor.
  T.DEURKANTEN = ['z', 'o', 'n', 'w'];

  // De tekeningen per stijl, uit tegels.js: stijl → soort → [{ naam, stijl, vorm, soort, dak, steen, kant }], en per
  // naam. Eén keer opgebouwd: tegels.js verandert niet terwijl het spel draait.
  let INDEX = null;
  function index() {
    if (INDEX) return INDEX;
    INDEX = { stijlen: {}, naam: new Map() };
    const vel = T.TEGELS && T.TEGELS.huizen;
    for (const t of (vel && vel.tiles) || []) {
      const s = t && t.stijl;
      if (!s) continue;
      const ding = { naam: `huizen/${t.naam}`, stijl: s.stijl, vorm: s.vorm, soort: s.soort, dak: s.dak, steen: s.steen, kant: s.stand };
      const per = INDEX.stijlen[s.stijl] || (INDEX.stijlen[s.stijl] = {});
      (per[s.soort] || (per[s.soort] = [])).push(ding);
      INDEX.naam.set(ding.naam, ding);
    }
    return INDEX;
  }
  const ding = (tekening) => (tekening ? index().naam.get(tekening) || null : null);
  function zoek(stijl, soort, vorm, dak, steen, kant) {
    const lijst = (index().stijlen[stijl] || {})[soort] || [];
    return lijst.find((t) => t.vorm === vorm && t.dak === dak && t.kant === kant && t.steen === steen) || null;
  }
  // het dak van het gehucht in een stijl: dat van zijn hutten, want een hut houdt het
  const gehuchtDak = (stijl) => (((index().stijlen[stijl] || {}).hut || [])[0] || {}).dak || 'riet';

  // De stijlen waar tekeningen voor zijn, op naam.
  T.bouwstijlen = () => Object.keys(index().stijlen).sort();

  // Welke stijl een nieuw land van de maker krijgt, uit zijn nummer: elk nummer altijd dezelfde.
  T.stijlVoorLand = function (zaad) {
    const stijlen = T.bouwstijlen();
    return stijlen.length ? stijlen[Math.abs(Math.floor(zaad)) % stijlen.length] : null;
  };

  T.stijlVan = function (D) {
    const s = D && D.wereld && D.wereld.stijl;
    return s && index().stijlen[s] ? s : null;
  };

  // De vorm van een tekening (een huis van een stijl, met zijn deur naar welke kant ook), of de tekening zelf: zo krijgt
  // een nieuw gebouw nooit twee keer achter elkaar dezelfde vorm (T.volgendeTekening, js/gebouwen.js).
  T.vormVan = (tekening) => {
    const d = ding(tekening);
    return d ? d.vorm : tekening;
  };
  T.deurKantVan = (tekening) => {
    const d = ding(tekening);
    return d ? d.kant : null;
  };

  T.heeftSteenbakkerij = (D) => (D.gebouwen || []).some((g) => g.soort === 'steenbakkerij' && g.klaar);

  // Het dak en de steen van wat nu gebouwd wordt of doorgroeit: het dak van het gehucht, leien in een dorp, pannen met
  // marktrecht en daarna; een hut houdt het dak van het gehucht. Een stenen huis ligt nooit onder riet (in een gehucht
  // krijgt het leien), is van de natuursteen van zijn stijl, en van baksteen onder pannen als het dorp een steenbakkerij
  // heeft (Marcel, 4 okt: "Ja, baksteen na de steenbakker").
  function nu(D, stijl, soort) {
    const gehucht = gehuchtDak(stijl);
    const trede = Math.max(0, T.GEBOUW_TREDEN.indexOf(D.trede || 'gehucht'));
    if (soort === 'hut') return { dak: gehucht, steen: null };
    if (soort === 'stenenHuis') {
      if (T.heeftSteenbakkerij(D)) return { dak: 'pannen', steen: 'baksteen' };
      const natuur = (index().stijlen[stijl].stenenHuis || []).find((t) => t.steen !== 'baksteen');
      return { dak: trede >= 2 ? 'pannen' : 'leien', steen: natuur ? natuur.steen : null };
    }
    return { dak: trede >= 2 ? 'pannen' : trede === 1 ? 'leien' : gehucht, steen: null };
  }

  // De tekeningen die een nieuw gebouw van deze soort nu kan krijgen: één per vorm, met de deur naar het zuiden, het dak
  // en de steen van nu. Null als het dorp geen stijl heeft, of zijn stijl deze soort niet kent.
  T.stijlTekeningen = function (D, soort) {
    const stijl = T.stijlVan(D);
    const lijst = stijl && index().stijlen[stijl][soort];
    if (!lijst) return null;
    const { dak, steen } = nu(D, stijl, soort);
    const vormen = [...new Set(lijst.map((t) => t.vorm))];
    const uit = vormen.map((v) => zoek(stijl, soort, v, dak, steen, 'z')).filter(Boolean).map((t) => t.naam);
    return uit.length ? uit : null;
  };

  // De vormen van een soort in een stijl, voor de maker (js/maker.js): per vorm de namen met de deur naar elke kant,
  // onder het dak van het gehucht, zonder "huizen/" (zoals de maker ze opzoekt).
  T.vormenVanStijl = function (stijl, soort) {
    const lijst = (index().stijlen[stijl] || {})[soort] || [];
    const dak = gehuchtDak(stijl);
    const vormen = [...new Set(lijst.map((t) => t.vorm))];
    return vormen
      .map((v) => T.DEURKANTEN.map((kant) => zoek(stijl, soort, v, dak, null, kant)).filter(Boolean).map((t) => t.naam.replace(/^huizen\//, '')))
      .filter((namen) => namen.length);
  };

  // Dezelfde vorm, dak en steen, met de deur naar een andere kant. Een tekening zonder stijl blijft zichzelf.
  T.metDeurNaar = function (tekening, kant) {
    const d = ding(tekening);
    if (!d) return tekening;
    const t = zoek(d.stijl, d.soort, d.vorm, d.dak, d.steen, kant);
    return t ? t.naam : tekening;
  };

  // Wat een huis wordt als het doorgroeit (js/behoeften.js): dezelfde vorm en kant als `tekening`, maar van soort `soort`
  // en met het dak en de steen van nu. Van een huis naar een stenen huis is dat zijn stenen broertje: "huis1" wordt
  // "steen1", zoals de huizenbouwer ze maakt (huizen.cjs, stijlHuizen). Null als die er niet is.
  T.zoalsNu = function (D, tekening, soort) {
    const d = ding(tekening);
    if (!d) return null;
    const vorm = d.soort === 'huis' && soort === 'stenenHuis' ? d.vorm.replace('huis', 'steen') : d.vorm;
    const { dak, steen } = nu(D, d.stijl, soort);
    const t = zoek(d.stijl, soort, vorm, dak, steen, d.kant);
    return t ? t.naam : null;
  };

  // De vormen van een soort met de deur naar dezelfde kant als `tekening`, met het dak en de steen van nu: voor een huis
  // dat doorgroeit en zijn broertje er niet kwijt kan.
  T.andereVormen = function (D, tekening, soort) {
    const d = ding(tekening);
    const lijst = T.stijlTekeningen(D, soort) || [];
    return d ? lijst.map((t) => T.metDeurNaar(t, d.kant)) : lijst;
  };

  // ---------------------------------------------------------------------------------------------
  // De deur naar de weg
  // ---------------------------------------------------------------------------------------------

  // Hoe ver een tegel van de weg ligt (de weg en de paden van de kaart, T.opPad in js/wereld.js, en het plein), in
  // stappen, ook schuin. Eén keer per kaart uitgerekend: die verandert niet (de paadjes van de deuren tellen niet mee,
  // die volgen de huizen, js/paden.js). Een kaart zonder weg geeft overal Infinity.
  const WEG = new WeakMap();
  function wegVeld(w) {
    let v = WEG.get(w);
    if (v) return v;
    const H = w.tegels.length;
    const B = w.tegels[0].length;
    v = new Float64Array(B * H).fill(Infinity);
    let rij = [];
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < B; x++) {
        if (T.opPad(w, x, y) || T.opHetPlein(w, x, y)) {
          v[y * B + x] = 0;
          rij.push(y * B + x);
        }
      }
    }
    for (let stap = 1; rij.length; stap++) {
      const volgende = [];
      for (const i of rij) {
        const x = i % B;
        const y = (i - x) / B;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx < 0 || ny < 0 || nx >= B || ny >= H || v[ny * B + nx] <= stap) continue;
            v[ny * B + nx] = stap;
            volgende.push(ny * B + nx);
          }
        }
      }
      rij = volgende;
    }
    WEG.set(w, v);
    return v;
  }
  T.afstandTotDeWeg = function (w, x, y) {
    if (!w || !w.tegels || !w.tegels.length) return Infinity;
    const B = w.tegels[0].length;
    if (x < 0 || y < 0 || x >= B || y >= w.tegels.length) return Infinity;
    return wegVeld(w)[y * B + x];
  };

  // De vier kanten van een rechthoek { x, y, b, h } (een erf, de voet van een gebouw), de kant die het dichtst bij de weg
  // ligt eerst: gemeten vanaf het midden net buiten elke kant. Bij gelijke afstand gaat een kant die je ziet voor.
  T.zijdenNaarDeWeg = function (w, r) {
    const midden = {
      z: [r.x + Math.floor(r.b / 2), r.y + r.h],
      o: [r.x + r.b, r.y + Math.floor(r.h / 2)],
      n: [r.x + Math.floor(r.b / 2), r.y - 1],
      w: [r.x - 1, r.y + Math.floor(r.h / 2)],
    };
    return T.DEURKANTEN.map((kant, i) => ({ kant, i, ver: T.afstandTotDeWeg(w, ...midden[kant]) }))
      .sort((a, b) => a.ver - b.ver || a.i - b.i)
      .map((x) => x.kant);
  };

  // Een gebouw van een bouwstijl op plek (x, y) (een verzoek, js/verzoeken.js): keer zijn deur naar de weg, naar de
  // eerste kant waarmee het daar past, en leg die vast als de volgende tekening van zijn soort (T.volgendeTekening,
  // js/gebouwen.js), zodat de plek in goud op de grond en het gebouw dat er komt dezelfde voet hebben. Geeft de tekening.
  T.keerNaarDeWeg = function (D, soort, x, y) {
    const t = T.volgendeTekening(D, soort);
    if (!ding(t)) return t;
    const v = T.gebouwVoet(soort, t);
    for (const kant of T.zijdenNaarDeWeg(D.wereld, { x, y, b: v.b, h: v.h })) {
      const s = T.metDeurNaar(t, kant);
      if (s !== t && !T.gebouwPast(D, soort, x, y, s)) continue;
      D.volgendeTekening[soort] = s;
      return s;
    }
    return t;
  };
})(globalThis.Spel = globalThis.Spel || {});
