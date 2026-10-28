// De veldheer (vraag 187 en 188, stap 3a3; ontwerp/scenario.md, 7 en 8): de AI van een leger. Hij speelt als een mens in
// zijn plaats (scenario.md, 8): hij weet alleen wat zijn mannen nu zien (zijn eigen mist, T.zietNu in js/mist.js) en waar
// de stroken van de anderen liggen, zoals een speler dat uit de lobby weet (Marcel, 28 okt: "1. A"); hij stelt dezelfde
// vraag als de muis (T.handelingSturen, js/kiezen.js) en geeft de opdracht die een klik geeft. Hij denkt in de tik, om de
// zoveel seconden, en wat hij onthoudt, staat in zijn dorp (D.veldheer): zo speelt hij op elke computer hetzelfde, en
// gaat een bewaard spel gewoon verder.
//
// De eerste veldheer (3a3) rukt meteen op (Marcel: "Oke"). Ziet hij vijanden, dan stuurt hij wie niet vecht naar de
// dichtste, en wie er een vlakbij heeft maar hem zelf niet ziet (een heuvel of een boom ertussen, js/wereld.js
// T.zichtTussen), valt hem aan zoals een klik op die vijand (Attack); ziet hij niemand, dan naar waar hij er het laatst een zag, en anders langs de plekken van de kaart die hij kent
// (de stroken van de anderen, het midden, de voorden en de brug). Ver weg gaat hij in etappes: een lange weg zoeken kost
// voor elke man een paar milliseconden (gemeten 28 okt: twaalf man over 70 tegels 35 ms in één tik, over 30 tegels 6 ms),
// en onderweg ziet hij wat er is. Wie vecht, laat hij vechten. Zijn held loopt achter zijn mannen, en is hij de laatste,
// dan vecht hij zelf (anders wachten twee helden tot de tijd om is). Afwachten, flanken en terugtrekken komen met de drie
// standen (3f).
(function (T) {
  'use strict';

  // Alle getallen in één blok (ook in de werkbank, js/opties.js).
  T.VELDHEER_INSTELLINGEN = {
    denkElke: 2, // zoveel seconden van de wereld tussen twee keer denken
    ver: 6, // een man wiens post zo ver (tegels) van het doel ligt, krijgt een nieuw bevel; de held ook
    aanval: 8, // wie niet vecht en een vijand die zijn leger ziet zo dichtbij heeft (tegels), valt hem aan
    erbij: 5, // zo dicht (tegels) bij een plek is zijn leger er
    etappe: 24, // zo ver (tegels) stuurt hij zijn mannen hooguit in één keer
    achterDeLinie: 4, // de held staat zoveel tegels achter zijn mannen (ook bij het begin van een veldslag, js/veldslag.js)
  };
  const IN = () => T.VELDHEER_INSTELLINGEN;

  // Een veldheer voor leger i. Hij denkt voor het eerst na een halve seconde per nummer, zodat niet alle veldheren in
  // dezelfde tik denken.
  T.nieuweVeldheer = (S, i = 0) => ({ denkt: (S.wereldTijd || 0) + (i % 4) * 0.5, stap: 0, laatst: null, held: null });

  // Elke tik, in elk dorp (T.werkDorpBij, js/dorp.js): heeft het een veldheer, en is het tijd, dan denkt hij.
  T.werkVeldheerBij = function (S, D) {
    const V = D.veldheer;
    const nu = S.wereldTijd || 0;
    if (!V || nu < V.denkt) return;
    V.denkt = nu + IN().denkElke;
    const held = D.aanvoerder;
    const soldaten = T.militieVan(D).filter((e) => T.isMan(D, e));
    const mannen = soldaten.length ? soldaten : T.isMan(D, held) ? [held] : [];
    if (!mannen.length) return;
    const midden = middenVan(mannen);
    const gezien = D.wereld.wezens.filter((x) => T.isVijandVan(D, x) && T.zietNu(D, x.tx, x.ty));
    const verDoel = kiesDoel(S, D, V, mannen, midden, gezien);
    if (!verDoel) return;
    const doel = etappe(midden, verDoel);
    const aanval = new Map(); // vijand → wie hem aanvalt
    const verder = [];
    for (const e of mannen) {
      if (e.doelwit || e.volgt) continue; // wie vecht, laat hij vechten
      const v = dichtste(gezien, T.tegelVan(e));
      if (v && T.afstand(T.tegelVan(v), T.tegelVan(e)) <= IN().aanval) aanval.set(v, [...(aanval.get(v) || []), e]);
      else if (!e.post || T.afstand(e.post, doel) > IN().ver) verder.push(e);
    }
    for (const [v, wie] of aanval) stuur(S, D, wie, { wezen: v, x: v.tx, y: v.ty });
    if (verder.length) stuur(S, D, verder, doel);
    if (!soldaten.length || held.doelwit || !T.isMan(D, held)) return;
    const plek = achter(midden, doel);
    if (V.held && T.afstand(V.held, plek) <= IN().ver) return;
    V.held = plek;
    stuur(S, D, [held], plek);
  };

  // Zoals een klik: dezelfde vraag als de muis, en de opdracht die erbij hoort.
  function stuur(S, D, mannen, naar) {
    const h = T.handelingSturen(S, naar, mannen, D);
    if (h && h.kan) h.doe();
  }

  // Waar hij heen wil: de dichtste vijand die hij ziet, anders waar hij er het laatst een zag, anders de volgende plek die
  // hij van de kaart kent (en is zijn leger daar, de plek erna).
  function kiesDoel(S, D, V, mannen, midden, gezien) {
    const beste = dichtste(gezien, midden);
    if (beste) return (V.laatst = T.tegelVan(beste));
    if (V.laatst && !erbij(mannen, midden, V.laatst)) return V.laatst;
    V.laatst = null;
    const punten = puntenVan(S, D);
    if (!punten.length) return null;
    if (erbij(mannen, midden, punten[V.stap % punten.length])) V.stap++;
    return punten[V.stap % punten.length];
  }

  // De dichtste van `wezens` bij tegel t, of null.
  function dichtste(wezens, t) {
    let beste = null;
    let bij = Infinity;
    for (const x of wezens) {
      const a = T.afstand(T.tegelVan(x), t);
      if (a < bij) {
        beste = x;
        bij = a;
      }
    }
    return beste;
  }

  // Is zijn leger bij plek p? Het midden is er, of iedereen staat stil op een post bij p: verder kwamen ze niet (de plek
  // ligt in de rivier, of er was geen weg), anders wacht hij daar voor altijd.
  const staat = (e) => !e.doelwit && !e.onderweg && !(e.pad && e.pad.length);
  const erbij = (mannen, midden, p) =>
    T.afstand(midden, p) <= IN().erbij || mannen.every((e) => staat(e) && e.post && T.afstand(e.post, p) <= IN().ver);

  // De plekken die hij van de kaart kent, in de volgorde waarin hij ze afloopt: in een veldslag de stroken van de anderen,
  // het midden, de voorden en de brug (het recept, levels/kaarten.js).
  function puntenVan(S, D) {
    if (!S.veldslag) return [];
    const R = T.eilandVan(D.wereld.eiland).recept;
    const rond = (x, y) => ({ x: Math.round(x), y: Math.round(y) });
    const strook = (st) => rond(...R.naarTegel((st.a[0] + st.a[1]) / 2, (st.b[0] + st.b[1]) / 2));
    const eigen = S.dorpen.indexOf(D);
    const anderen = R.stroken.filter((st, i) => i !== eigen && i < S.dorpen.length).map(strook);
    return [...anderen, rond(R.cx, R.cy), ...R.voorden.map((v) => rond(v.x, v.y)), ...(R.brug ? [rond(R.brug.x, R.brug.y)] : [])];
  }

  // Waar hij ze nu heen stuurt: het doel, of als dat verder is dan een etappe, een etappe die kant op.
  function etappe(midden, doel) {
    const dx = doel.x - midden.x;
    const dy = doel.y - midden.y;
    const lang = Math.max(Math.abs(dx), Math.abs(dy));
    if (lang <= IN().etappe) return doel;
    const a = IN().etappe / lang;
    return { x: Math.round(midden.x + dx * a), y: Math.round(midden.y + dy * a) };
  }

  // Het midden van zijn mannen, op een tegel.
  function middenVan(mannen) {
    const x = mannen.reduce((s, e) => s + e.tx, 0) / mannen.length;
    const y = mannen.reduce((s, e) => s + e.ty, 0) / mannen.length;
    return { x: Math.round(x), y: Math.round(y) };
  }

  // De plek van de held: achterDeLinie tegels achter het doel, gezien vanaf zijn mannen (Math.sqrt rekent op elke
  // computer gelijk; js/kiezen.js, "Alleen gewone rekensommen").
  function achter(midden, doel) {
    const dx = doel.x - midden.x;
    const dy = doel.y - midden.y;
    const lang = Math.sqrt(dx * dx + dy * dy);
    if (lang < 1) return { x: midden.x, y: midden.y };
    const a = IN().achterDeLinie / lang;
    return { x: Math.round(doel.x - dx * a), y: Math.round(doel.y - dy * a) };
  }
})(globalThis.Spel = globalThis.Spel || {});
