// Toveren: een spreuk kiezen, richten en uitspreken, in en buiten een gevecht. Wat een spreuk
// kost en kan, staat in spreuken.js; hier staat wat er gebeurt als je hem uitspreekt.
//
// De volgorde is altijd dezelfde: eerst het effect, dan de tijd (via T.verouder, zoals elke
// maand in dit spel), en pas dan telt het meesterschap. Wie zo zijn honderdste haalt, ziet zijn
// laatste spreuk nog werken.
//
// Een spreuk in de hand verandert wat de muis doet: het scherm en de klik stellen dezelfde
// vraag, net als bij lopen en slaan. Escape of de rechtermuisknop legt hem weer weg.
//
// Elke spreuk begint met een worp (T.worp): de tovenaar draait naar zijn doel, heft zijn staf,
// en de spreuk groeit in de bol tot hij hem loslaat. Dan de vlucht, dan de inslag, en dan pas
// de prijs: T.verouder int de maanden, en op dat moment gaat er grijs van hem af (de zucht,
// js/tekenen.js), hoe groter de prijs hoe groter.
(function (T) {
  'use strict';

  // Hoe lang de worp duurt, in seconden: tot de bol opvlamt (beeld 3 van de houding spreuk,
  // 12 beelden per seconde). Een dwaallicht is maar een klein lichtje.
  T.WORP = { vuurschicht: 0.3, windstoot: 0.27, dwaallicht: 0.22 };

  // De worp, voor elke tovenaar: de held, en ook de meester of Wim in een scène (js/regie.js).
  // Het wezen krijgt `tovert` mee, zoals een uitval `uitval`: daaruit halen de sprites de houding
  // en de kijkrichting, en tekenen.js wat er in de bol groeit en welk grijs erin wordt gezogen.
  // De belofte loopt af op het moment dat de spreuk loskomt.
  T.worp = function (S, wie, id, doel) {
    const duur = T.WORP[id] || 0.25;
    const eig = T.SPREUKEN[id];
    wie.tovert = {
      spreuk: id, begin: S.tijd, duur,
      doel: doel ? { x: doel.x, y: doel.y } : null,
      maanden: eig ? eig.basis.maanden : 0,
    };
    return T.anim.wacht(S, duur * 1000);
  };

  const worp = (b) => b[0] + Math.floor(Math.random() * (b[1] - b[0] + 1));
  const heldAanDeBeurt = (S) => !!S.gevecht && S.gevecht.volgorde[S.gevecht.beurt] === S.held;
  const namen = (lijst) => lijst.map((m) => `de ${m.naam}`).join(' en ');
  const tegels = (n) => `${n} ${n === 1 ? 'tegel' : 'tegels'}`;

  // Waarom een spreuk hier niet past. Dat is geen foutmelding maar een regel van het spel, dus
  // hij zegt ook waarom.
  const NIET_IN_GEVECHT = {
    dwaallicht: 'Midden in een gevecht kijkt geen monster naar een dwaallicht. Pas als je het Legendarisch beheerst.',
  };
  const NIET_BUITEN = {
    vuurschicht: 'Een vuurschicht bewaar je voor een gevecht.',
  };

  // ── Een spreuk in de hand nemen ──

  // Kan de held deze spreuk nu kiezen? Geeft null, of de reden van niet.
  T.waaromNiet = function (S, id) {
    const held = S.held;
    const eig = T.spreuk(held, id);
    if (!T.kentSpreuk(held, id)) return `De ${eig.kring}e kring is nog dicht: die gaat open met de jaren.`;
    if (S.modus === 'gevecht') {
      if (!eig.gevecht) return NIET_IN_GEVECHT[id] || 'Niet in een gevecht.';
      if (!heldAanDeBeurt(S) || S.bezig) return 'Wacht tot je weer aan de beurt bent.';
      if (held.ap < eig.ap) return `Daar heb je de punten niet meer voor: een ${eig.naam} kost er ${eig.ap}.`;
      return null;
    }
    if (S.modus === 'verkennen') {
      if (eig.buiten) return null;
      // Een vuurschicht bewaar je voor een gevecht — behalve als er iets staat dat er juist om
      // vraagt (de scheur in de oven; T.RAAKPUNTEN in js/quests.js). Dat is geen uitzondering op
      // de kernregel maar een toepassing ervan: de jaren kost hij net zo goed.
      if (T.raakpuntInBereik && T.raakpuntInBereik(S, id, eig.bereik)) return null;
      return NIET_BUITEN[id] || 'Niet hier.';
    }
    return 'Nu even niet.';
  };

  // id = null of dezelfde spreuk nog eens: leg hem weer weg.
  T.kiesSpreuk = function (S, id) {
    if (!id || !T.SPREUKEN[id] || S.spreuk === id) {
      neemAan(S, null);
      return;
    }
    const waarom = T.waaromNiet(S, id);
    if (waarom) {
      T.ui.bericht(waarom);
      return;
    }
    neemAan(S, id);
  };

  function neemAan(S, id) {
    if (S.spreuk === id) return;
    S.spreuk = id;
    if (S.modus === 'gevecht' && heldAanDeBeurt(S) && !S.bezig) T.knoppenAan(S);
  }

  // ── Richten: wat een klik met deze spreuk zou doen ──

  // Het monster onder de muis: op de figuur zelf of op zijn tegel. In een gevecht alleen wie
  // meedoet, anders zou een schicht iemand raken die geen beurt heeft.
  function monsterBij(S, doel) {
    const w = S.wereld;
    const m = doel.wezen || T.wezenOp(w, doel.x, doel.y);
    if (!m || m.dood || m.kant !== 'monster' || !T.isZichtbaar(w, m.tx, m.ty)) return null;
    if (S.gevecht && !S.gevecht.monsters.includes(m)) return null;
    return m;
  }

  T.handelingSpreuk = function (S, doel) {
    if (!doel || !S.spreuk) return null;
    const eig = T.spreuk(S.held, S.spreuk);
    // Eerst de dingen die op een spreuk wachten: dat geldt voor elke spreuk, dus het staat hier
    // en niet drie keer hieronder.
    const rp = T.raakpuntOp && T.raakpuntOp(S, doel, S.spreuk);
    if (rp) return richtOpDing(S, eig, rp);
    if (S.spreuk === 'vuurschicht') return richtVuurschicht(S, eig, doel);
    if (S.spreuk === 'windstoot') return richtWindstoot(S, eig, doel);
    if (S.spreuk === 'dwaallicht') return richtDwaallicht(S, eig, doel);
    return null;
  };

  // Een ding dat om deze spreuk vraagt: dezelfde afstand, hetzelfde vrije zicht en dezelfde prijs
  // als wanneer je een monster raakt. Buiten een gevecht kost hij geen punten, net als de
  // windstoot op een deur — maar wel zijn maanden, en die staan bij de muis vóór je klikt.
  function richtOpDing(S, eig, rp) {
    const w = S.wereld;
    const h = T.tegelVan(S.held);
    const p = { x: rp.voorwerp.x, y: rp.voorwerp.y };
    const naam = eig.naam.charAt(0).toUpperCase() + eig.naam.slice(1);
    const mis = (waarom) => ({ tekst: `${naam}: ${waarom}`, kosten: 0, kan: false, fout: true, lijn: p, kleur: eig.kleur });
    if (!T.isZichtbaar(w, p.x, p.y)) return null;
    if (T.afstand(h, p) > eig.bereik) return mis('te ver weg');
    if (!T.zichtTussen(w, h, p)) return mis('geen vrij zicht');
    return {
      tekst: `${naam}: ${rp.raak.tekst}`,
      kosten: S.gevecht ? eig.ap : 0, maanden: eig.maanden,
      kan: !S.gevecht || S.held.ap >= eig.ap,
      doe: () => spreukOpDing(S, eig, rp, p),
      lijn: p, kleur: eig.kleur,
    };
  }

  function richtVuurschicht(S, eig, doel) {
    if (!S.gevecht) return null;
    const w = S.wereld;
    const m = monsterBij(S, doel);
    if (!m) return null;
    const h = T.tegelVan(S.held);
    const p = T.tegelVan(m);
    if (T.afstand(h, p) > eig.bereik) return { tekst: 'Vuurschicht: te ver weg', kosten: 0, kan: false, lijn: p };
    if (!T.zichtTussen(w, h, p)) return { tekst: 'Vuurschicht: geen vrij zicht', kosten: 0, kan: false, lijn: p };
    const tweede = eig.doorboort ? T.volgendOpLijn(w, h, p, eig.bereik, S.gevecht.monsters) : null;
    const schade = T.schichtSchade(S.held).join('–');
    return {
      tekst: `Vuurschicht op ${namen(tweede ? [m, tweede] : [m])}: ${schade} schade${eig.brandt ? ', brandt na' : ''}`,
      kosten: eig.ap, maanden: eig.maanden, kan: S.held.ap >= eig.ap,
      doe: () => vuurschicht(S, eig, m, tweede),
      lijn: p, tweede: tweede ? T.tegelVan(tweede) : null, kleur: eig.kleur,
    };
  }

  function richtWindstoot(S, eig, doel) {
    const w = S.wereld;
    const h = T.tegelVan(S.held);
    const m = monsterBij(S, doel);
    if (m) {
      if (!S.gevecht) return { tekst: 'Windstoot: buiten een gevecht alleen op een open deur', kosten: 0, kan: false, fout: true };
      const p = T.tegelVan(m);
      if (T.afstand(h, p) > eig.bereik) return { tekst: 'Windstoot: te ver weg', kosten: 0, kan: false, lijn: p, kleur: eig.kleur };
      if (!T.zichtTussen(w, h, p)) return { tekst: 'Windstoot: geen vrij zicht', kosten: 0, kan: false, lijn: p, kleur: eig.kleur };
      const duwen = T.windstootDuwen(w, S.held, m, eig);
      const ver = duwen[0].pad.length;
      const ernaast = duwen.slice(1).filter((d) => d.pad.length).length;
      if (!ver && !ernaast) return { tekst: `Windstoot: ${m.naam} staat klem`, kosten: 0, kan: false, lijn: p, kleur: eig.kleur };
      let tekst = ver ? `Windstoot: ${m.naam} ${tegels(ver)} terug` : `Windstoot: ${m.naam} staat klem`;
      if (ernaast) tekst += `, en ${ernaast === 1 ? 'één ernaast' : 'twee ernaast'}`;
      return {
        tekst, kosten: eig.ap, maanden: eig.maanden, kan: S.held.ap >= eig.ap,
        doe: () => windstootOpWezens(S, eig, duwen),
        lijn: p, duw: duwen, kleur: eig.kleur,
      };
    }
    const d = doel.voorwerp ? null : T.deurOp(w, doel.x, doel.y);
    if (!d || d.staat !== 'open' || !T.isZichtbaar(w, d.x, d.y)) return null;
    const kosten = S.gevecht ? eig.ap : 0;
    if (T.afstand(h, d) > eig.deurBereik) return { tekst: 'Windstoot: te ver weg', kosten: 0, kan: false, fout: true, lijn: d, kleur: eig.kleur };
    if (!T.zichtTussen(w, h, d)) return { tekst: 'Windstoot: geen vrij zicht', kosten: 0, kan: false, fout: true, lijn: d, kleur: eig.kleur };
    if (T.wezenOp(w, d.x, d.y)) return { tekst: 'Windstoot: er staat iemand in de deur', kosten: 0, kan: false, fout: true, lijn: d, kleur: eig.kleur };
    return {
      tekst: 'Windstoot: de deur dichtgooien', kosten, maanden: eig.maanden, kan: !S.gevecht || S.held.ap >= eig.ap,
      doe: () => windstootOpDeur(S, eig, d), lijn: d, deur: d, kleur: eig.kleur,
    };
  }

  function richtDwaallicht(S, eig, doel) {
    const w = S.wereld;
    const h = T.tegelVan(S.held);
    const t = { x: doel.x, y: doel.y };
    if (t.x === h.x && t.y === h.y) return null;
    if (!T.isZichtbaar(w, t.x, t.y) || !T.isBegaanbaar(w, t.x, t.y)) return null;
    if (T.afstand(h, t) > eig.bereik) return { tekst: 'Dwaallicht: te ver weg', kosten: 0, kan: false, fout: true };
    if (!T.zichtTussen(w, h, t)) return { tekst: 'Dwaallicht: geen vrij zicht', kosten: 0, kan: false, fout: true };
    if (S.gevecht) {
      // In een gevecht weet je meteen wie ernaar kijkt; lukt dat bij niemand, dan is het zonde
      // van de maand.
      const gelokt = S.gevecht.monsters.filter((m) => T.zietLicht(w, m, t));
      if (!gelokt.length) return { tekst: 'Dwaallicht: geen monster dat het hier ziet', kosten: 0, kan: false, licht: t, kleur: eig.kleur };
      return {
        tekst: `Dwaallicht hierheen: lokt ${namen(gelokt)}`, kosten: eig.ap, maanden: eig.maanden,
        kan: S.held.ap >= eig.ap, doe: () => dwaallichtInGevecht(S, eig, t, gelokt),
        licht: t, gelokt, kleur: eig.kleur,
      };
    }
    const gelokt = w.wezens.filter((m) => T.lokt(w, m, t) && T.isZichtbaar(w, m.tx, m.ty));
    return {
      tekst: gelokt.length ? `Dwaallicht hierheen: lokt ${namen(gelokt)}` : 'Dwaallicht hierheen',
      maanden: eig.maanden, doe: () => dwaallichtBuiten(S, eig, t),
      licht: t, gelokt, kleur: eig.kleur,
    };
  }

  // Waar kan de gekozen spreuk bij? Voor het oplichten van het bereik op de vloer.
  T.spreukBereik = function (S) {
    const id = S.spreuk;
    if (!id) return null;
    const w = S.wereld;
    const eig = T.spreuk(S.held, id);
    const h = T.tegelVan(S.held);
    // Buiten een gevecht gaat een windstoot alleen over deuren; dan licht de vloer niet op.
    const bereik = id === 'windstoot' && !S.gevecht ? 0 : eig.bereik;
    const deuren = id !== 'windstoot' ? [] : [...w.deuren.values()].filter(
      (d) => d.staat === 'open' && T.afstand(h, d) <= eig.deurBereik && T.isZichtbaar(w, d.x, d.y)
        && T.zichtTussen(w, h, d) && !T.wezenOp(w, d.x, d.y),
    );
    return { tegels: bereik ? T.tegelsInZicht(w, h, bereik) : [], deuren, kleur: eig.kleur };
  };

  // ── Uitspreken ──

  // In een gevecht: punten eraf, knoppen uit, het effect, de tijd, en dan is de held weer aan
  // zet. Buiten een gevecht kost een spreuk geen punten, maar wel dezelfde maanden.
  async function inGevecht(S, eig, werk) {
    T.bezigMet(S);
    S.spreuk = null;
    S.held.ap -= eig.ap;
    T.ui.toonAp(S.held.ap, S.held.maxAp, 0, true);
    const telt = await werk();
    S.held.tovert = null;
    T.verouder(S, eig.maanden, false);
    if (S.held.dood) return;
    if (telt) T.oefen(S, eig.id);
    await T.anim.wacht(S, 320);
    T.naHandeling(S);
  }

  // Buiten een gevecht blijft de held staan om te toveren: een stap die hij al zette, maakt
  // hij nog af.
  async function buitenGevecht(S, eig, werk) {
    const held = S.held;
    held.pad = held.onderweg ? [held.pad[0]] : [];
    S.naLopen = null;
    S.spreuk = null;
    const telt = await werk();
    held.tovert = null;
    T.verouder(S, eig.maanden, false);
    if (held.dood) return;
    if (telt) T.oefen(S, eig.id);
  }

  // De schicht vliegt eerst en raakt; pas daarna eist de spreuk haar jaar op. Wie zo zijn
  // honderdste haalt, velt met zijn laatste spreuk nog wel het monster. Tussen de inslag en
  // het jaar zit een tel, zodat je eerst de klap ziet en dan wat hij kostte: anders gebeuren
  // ze tegelijk op twee plekken, en mis je er één.
  async function vuurschicht(S, eig, m, tweede) {
    await inGevecht(S, eig, async () => {
      const kost = `Het kost je ${T.duurTekst(eig.maanden)}.`;
      await T.worp(S, S.held, 'vuurschicht', m);
      await T.anim.schicht(S, T.tegelVan(S.held), T.tegelVan(m));
      const van = T.tegelVan(m);
      schroei(S, eig, m, 'Je vuurschicht raakt de', tweede ? '' : kost);
      if (tweede && !tweede.dood) {
        await T.anim.schicht(S, van, T.tegelVan(tweede));
        schroei(S, eig, tweede, 'Hij vliegt door en raakt de', kost);
      }
      await T.anim.wacht(S, 200);
      return true;
    });
  }

  // Dezelfde volgorde als bij een monster (ontwerp/toren.md, de kernregel): eerst het effect,
  // dan de tijd via T.verouder, dan pas het meesterschap. De wikkel hieronder doet die laatste
  // twee; wat er hier gebeurt is het effect.
  async function spreukOpDing(S, eig, rp, p) {
    const werk = async () => {
      await T.worp(S, S.held, eig.id, p);
      await T.anim.schicht(S, T.tegelVan(S.held), p);
      if (rp.raak.melding) T.ui.bericht(rp.raak.melding);
      for (const vlag of [].concat(rp.raak.zetVlag || [])) T.zetVlag(S, vlag);
      if (rp.raak.doe) T.doeGevolg(S, rp.raak.doe);
      await T.anim.wacht(S, 200);
      return true; // iets gedaan, dus het telt voor het meesterschap
    };
    if (S.gevecht) await inGevecht(S, eig, werk);
    else await buitenGevecht(S, eig, werk);
  }

  function schroei(S, eig, m, zin, staart) {
    const n = worp(T.schichtSchade(S.held));
    T.ui.bericht(`${zin} ${m.naam}: ${n} schade.${staart ? ' ' + staart : ''}`);
    T.raak(S, m, n);
    if (eig.brandt && !m.dood) m.brandt = Math.max(m.brandt || 0, eig.brandt);
  }

  async function windstootOpWezens(S, eig, duwen) {
    await inGevecht(S, eig, async () => {
      const doel = duwen[0].wezen;
      await T.worp(S, S.held, 'windstoot', doel);
      await T.anim.wind(S, T.tegelVan(S.held), T.tegelVan(doel));
      const gaan = duwen.filter((d) => d.pad.length && !d.wezen.dood);
      await Promise.all(gaan.map((d) => T.anim.duw(d.wezen, d.pad)));
      if (!gaan.length) {
        T.ui.bericht(`De ${doel.naam} houdt stand.`);
        return false;
      }
      const stuk = gaan.map((d) => `de ${d.wezen.naam} ${tegels(d.pad.length)}`).join(' en ');
      T.ui.bericht(`Je windstoot duwt ${stuk} terug. Het kost je ${T.duurTekst(eig.maanden)}.`);
      // Vanaf Geoefend wankelt wie geduwd is: zijn volgende beurt is korter. Twee stoten
      // tellen dubbel, tot zijn punten op zijn.
      if (eig.apVerlies) {
        for (const d of gaan) {
          d.wezen.apVerlies = Math.min(d.wezen.maxAp, (d.wezen.apVerlies || 0) + eig.apVerlies);
          T.anim.tekst(S, d.wezen, `−${eig.apVerlies} AP`, '#bfe0ff');
        }
        T.ui.bericht(`${gaan.length === 1 ? 'Hij is' : 'Ze zijn'} van slag: ${eig.apVerlies} actiepunten minder in de volgende beurt.`);
      }
      return true;
    });
  }

  // Een deur dichtgooien van een afstand. Buiten een gevecht is dat het echte nut: een monster
  // opent geen deuren, dus zo sluit je een kamer af zonder dat het je een gevecht kost.
  async function windstootOpDeur(S, eig, d) {
    const werk = async () => {
      await T.worp(S, S.held, 'windstoot', d);
      await T.anim.wind(S, T.tegelVan(S.held), d);
      if (d.staat !== 'open' || T.wezenOp(S.wereld, d.x, d.y)) {
        T.ui.bericht('De windstoot vindt de deur niet meer vrij.');
        return false;
      }
      d.staat = 'dicht';
      T.ui.bericht(`Je windstoot gooit de deur dicht. Het kost je ${T.duurTekst(eig.maanden)}.`);
      return true;
    };
    if (S.gevecht) await inGevecht(S, eig, werk);
    else await buitenGevecht(S, eig, werk);
  }

  function dwaallichtBuiten(S, eig, t) {
    buitenGevecht(S, eig, async () => {
      await T.worp(S, S.held, 'dwaallicht', t);
      maakLicht(S, eig, t, false);
      T.ui.bericht(`Je stuurt een dwaallicht weg. Het kost je ${T.duurTekst(eig.maanden)}.`);
      // Het telt pas als er werkelijk een monster op afgaat; dat gebeurt in werkLichtenBij.
      return false;
    });
  }

  async function dwaallichtInGevecht(S, eig, t, gelokt) {
    await inGevecht(S, eig, async () => {
      await T.worp(S, S.held, 'dwaallicht', t);
      const l = maakLicht(S, eig, t, true);
      await T.anim.wacht(S, l.vlucht * 1000);
      for (const m of gelokt) {
        m.afgeleid = { x: t.x, y: t.y };
        m.vraag = 1.2;
      }
      T.ui.bericht(`Het dwaallicht trekt de blik van ${namen(gelokt)}. Het kost je ${T.duurTekst(eig.maanden)}.`);
      return gelokt.length > 0;
    });
  }

  // ── Dwaallichten in de wereld ──

  function maakLicht(S, eig, t, inGevechtLicht) {
    const held = S.held;
    const vlucht = 0.22 + T.afstand(T.tegelVan(held), t) * 0.05;
    // `wie`: het licht komt uit de bol op zijn staf (js/tekenen.js).
    const l = {
      x: t.x, y: t.y, van: { x: held.x, y: held.y }, wie: held,
      begin: S.tijd, vlucht, aankomst: S.tijd + vlucht,
      // Een licht in een gevecht hangt er tot de held weer aan de beurt is; buiten een gevecht
      // telt de klok van het spel.
      tot: inGevechtLicht ? Infinity : S.tijd + vlucht + eig.duur,
      nablijven: inGevechtLicht ? 0 : eig.nablijven,
      inGevecht: inGevechtLicht, telde: false,
    };
    S.lichten.push(l);
    return l;
  }

  // Elk beeld: lichten die uit zijn verdwijnen, en buiten een gevecht gaat elk dwalend monster
  // op het nieuwste licht af dat het ziet. Wie op een licht afgaat, dwaalt niet meer; is het
  // licht uit (en, vanaf Meesterlijk, nog even na), dan dwaalt hij weer verder. Het wachten
  // gaat in speltijd, niet in kloktijd.
  T.werkLichtenBij = function (S, dt) {
    const w = S.wereld;
    for (const m of w.wezens) {
      const l = m.gelokt;
      if (l && (m.dood || S.tijd >= l.tot + l.nablijven)) laatGaan(m);
    }
    S.lichten = S.lichten.filter((l) => l.inGevecht || S.tijd < l.tot + l.nablijven);
    if (S.modus !== 'verkennen') return;
    for (const m of w.wezens) {
      if (m.dood || !m.dwaalt) continue;
      for (let i = S.lichten.length - 1; i >= 0; i--) {
        const l = S.lichten[i];
        if (m.gelokt && l.begin <= m.gelokt.begin) break; // ouder dan wat het al volgt
        if (l.inGevecht || S.tijd < l.aankomst || S.tijd >= l.tot) continue;
        if (T.lokt(w, m, l)) {
          lok(S, m, l);
          break;
        }
      }
      // Onderweg klem komen te staan kan: probeer het af en toe opnieuw.
      if (m.gelokt && !m.pad.length && T.afstand(T.tegelVan(m), m.gelokt) > 0) {
        m.dwaalTijd -= dt;
        if (m.dwaalTijd <= 0) {
          m.dwaalTijd = 0.7;
          const pad = T.lokPad(w, m, m.gelokt);
          if (pad && pad.length) m.pad = pad;
        }
      }
    }
  };

  function lok(S, m, l) {
    const w = S.wereld;
    m.gelokt = l;
    m.vraag = 1.2;
    m.dwaalTijd = 0.7;
    const pad = T.lokPad(w, m, l) || [];
    m.pad = m.onderweg ? [m.pad[0], ...pad] : pad;
    if (T.isZichtbaar(w, m.tx, m.ty)) T.ui.bericht(`De ${m.naam} gaat op het licht af.`);
    // Eén licht telt één keer, hoeveel monsters er ook op afkomen.
    if (!l.telde) {
      l.telde = true;
      T.oefen(S, 'dwaallicht');
    }
  }

  function laatGaan(m) {
    m.gelokt = null;
    m.pad = m.onderweg ? [m.pad[0]] : [];
    m.dwaalTijd = 1 + Math.random() * 2;
  }

  // ── Meesterschap ──

  // Een spreuk deed iets: hij telt. Stijgt hij daarmee een trede, dan zie je dat boven het
  // hoofd van de held, net als de jaren.
  T.oefen = function (S, id) {
    const hoger = T.telGebruik(S.held, id);
    if (!hoger) return;
    const spreuk = T.SPREUKEN[id];
    T.anim.tekst(S, S.held, `${T.hoofdletter(spreuk.naam)}: ${hoger.naam}`, '#c8b8ff', { na: 0.55, duur: 2 });
    const roest = hoger.trede === 1 ? 'Het roest gaat eraf. ' : '';
    T.ui.bericht(`${roest}Je ${spreuk.naam} wordt ${hoger.naam}: ${hoger.tekst}.`, 'goed');
  };
})(globalThis.Toren = globalThis.Toren || {});
