// Zet de HD-pixel art om in tegelvellen die Tiled kan lezen: een .png per vel en een .tsx erbij,
// in tegels/ (wel in git, zie ontwerp/wereld.md § "De kaarten tekenen we in een editor"). Marcel
// tekent daarmee de wereld in Tiled; js/kaart.js leest wat hij tekent weer in.
//
//   node gereedschap/pixelart/naar-tiled.cjs      (of: npm run tiled)
//
// Dit script rendert rechtstreeks vanuit dorp.cjs, dorp2.cjs en bomen.cjs (net als
// dorp-export.cjs en dorp2-export.cjs al deden voor hun eigen platen) in plaats van bestaande
// platen te kopiëren: zo draait het gewoon opnieuw als daar iets aan verandert, ook terwijl er
// nog aan gebouwd wordt. Wat er nu niet (meer) bestaat, wordt overgeslagen met een melding op de
// console — dit script mag nooit vastlopen op een enkel voorwerp.
//
// Elk vel wordt eerst een raster van cellen van gelijke afmeting, met de bijbehorende platen op ware
// grootte (zie kern.cjs). Grond is precies 64×32: gewone tegels, geen speling, en dat raster blijft.
// Elk ander vel (bomen, begroeiing, gebouwen, erf, tuin, huizen) wordt daarna ingepakt: elke tekening
// strak gesneden, met zijn eigen rechthoek en anker (schrijfVel, inpakken.cjs; werklijst vraag 114,
// 2a), want een raster kost de browser elke lege pixel. Voor gebouwen komt er ook `beslaat` bij:
// het aantal tegels dat de voet inneemt, gemeten aan het model zelf (net als dorp-export.cjs se
// meetGebouw). js/kaart.js gebruikt dat om de hele voet vast te zetten.
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const K = require('./kern.cjs');
const { vasteVolgordeEnCapaciteit: vasteVolgordeEnCapaciteitBasis, nodigeCapaciteit } = require('./vaste-volgorde.cjs');
const D = require('./dorp.cjs');
const P = require('./dorp2.cjs');
const Bm = require('./bomen.cjs');
const Tn = require('./tuin-sdf.cjs');
const HZ = require('./huizen.cjs');
const I = require('./inpakken.cjs');

const TEGELS = path.join(__dirname, '..', '..', 'tegels');
fs.mkdirSync(TEGELS, { recursive: true });

function schrijfPng(bestand, plaat) {
  fs.writeFileSync(path.join(TEGELS, bestand), K.png(plaat, 1));
}

// Iets proberen dat op dit moment kan mislukken (een andere agent werkt in dorp.cjs, dorp2.cjs en
// bomen.cjs): meld het en ga door met de rest van het vel.
function veilig(naam, f) {
  try {
    return f();
  } catch (e) {
    console.warn(`  overgeslagen: ${naam} (${e.message})`);
    return null;
  }
}

// ---------------------------------------------------------------- vaste volgorde, vaste capaciteit
//
// Tiled slaat per kaart alleen een beginnummer (firstgid) per tegelvel op; alle nummers erna
// liggen dus vast zodra Marcel een kaart met de hand tekent. Groeit een vel later (een boom of
// een huis erbij), dan schoof vroeger alles wat erna kwam mee — dat overkwam gebouwen.tsx op
// 20 sep 2026 (van 15 naar 27 tegels, met de twaalf nieuwe huizen midden in de lijst in plaats
// van achteraan) en eerder al rand.tsx (van 246 naar 262 tegels, zie test/kaart.test.cjs). Twee
// regels lossen dat voorgoed op, voor altijd:
//
//  1. Vaste volgorde: elk vel houdt in tegels/<vel>.volgorde.json bij welke tegel bij welk
//     nummer hoort (vasteVolgordeEnCapaciteit hieronder). Een tegel die de code nu levert maar
//     nog niet in dat bestand staat, komt er ACHTERAAN bij — nooit ertussen, ook niet als de
//     code zelf hem ergens in het midden van zijn eigen lijst produceert (zie gebouwenLijst).
//     Verdwijnt een tegel uit de code (een boom die niet meer bestaat), dan houdt hij zijn
//     plaats als lege cel: er wordt nooit opgeschoven.
//  2. Vaste capaciteit: elk vel wordt aangevuld met lege cellen tot een vast aantal (tilecount),
//     zodat dat aantal niet verandert als er een tegel bijkomt — en dus ook de vellen die in een
//     kaart NA dit vel staan hun nummer houden. De marges hieronder zijn ruim: bij gebouwen kwam
//     er vandaag in één keer twaalf bij, en 96 is nog niet eens vier keer zoveel als er nu al in
//     zit.
//
// Beide gelden niet voor tegels/rand.tsx: dat vel komt uit randtegels.cjs (npm run randtegels),
// een eigen script met een eigen agent. Zijn volgorde ligt al vast zolang niemand de lijsten
// SOORTEN/PAREN daar herschikt (een nieuw paar komt er vanzelf achteraan bij, zie de toelichting
// daar); zijn capaciteit vullen we hieronder aan zonder dat script aan te raken, zie
// RAND_CAPACITEIT en padGrondVel() verderop.
const VELCONFIG = {
  grond: { capaciteit: 160, kolommen: 4 }, // nu 58 (3 grondsoorten × 19 + water): vijf soorten erbij kan
  bomen: { capaciteit: 80, kolommen: 8 }, // nu 54 in 64 vakken: de vormen en de nieuwe soorten (vraag 148, a), en daarvoor 11 in 16 (het boompje en de jonge bomen, 6 okt). Groter maken kan: een kaart leest een gid zoals Tiled (js/kaart.js), dus wat erbij komt, valt niet over het vel erna
  begroeiing: { capaciteit: 40, kolommen: 8 }, // nu 10: dertig planten erbij kan
  gebouwen: { capaciteit: 96, kolommen: 8 }, // nu 27, en daar kwamen er vandaag al twaalf van: een heel dorp moet erin passen
  toren: { capaciteit: 8, kolommen: 4 }, // nu 1 (er is er maar één); een beetje lucht is vrijwel gratis
  erf: { capaciteit: 24, kolommen: 8 }, // nu 7: nog een stuk of zeventien erfstukken erbij kan
  tuin: { capaciteit: 48, kolommen: 8 }, // nu 33 (tuin-sdf.cjs se STUKKEN): ruim voor een derde hek of meer groente
  huizen: { capaciteit: 640, kolommen: 8 }, // nu 559 in 576 vakken: de 128 grote gebouwen van de stijlen erbij (vraag 114, stap 3), en daarvoor 431: de 32 van ronde 4b (23 huizen en 9 lege), de 108 van de stijl wit en de 300 van oker, planken en roze (huizen.cjs, STIJLEN; vraag 114, stap 2a en 2b). Een leeg vak kost sinds het inpakken (vraag 114, 2a) geen geheugen meer in de browser; huizen is het laatste vel in elke kaart, dus een grotere capaciteit schuift geen nummers op
};

// items: [{ key, ...eigen velden zoals `plaat` }]. `key` is de identiteit die nooit meer
// verandert — meestal gewoon de naam, behalve bij grond, waar "gras" negentien keer voorkomt en
// dus een fijnere sleutel nodig heeft (zie bouwGrondVel). De eigenlijke logica staat in
// vaste-volgorde.cjs, een eigen bestand zonder dorp.cjs/bomen.cjs erbij, zodat
// test/tegelvolgorde.test.cjs hem kan toetsen zonder ook maar één tegel te hoeven renderen.
function vasteVolgordeEnCapaciteit(veldNaam, items, capaciteit, kolommen) {
  return vasteVolgordeEnCapaciteitBasis(TEGELS, veldNaam, items, capaciteit, kolommen);
}

// Hoe ver reikt wat er op een plaat getekend is vanaf zijn ankerpunt: [links, boven, rechts,
// onder]. Een cel is voor alle tegels van een vel even groot, maar een berk is smaller dan een
// eik en een bank kleiner dan een waslijn; het spel heeft de echte maat nodig om te weten of dit
// ding iemand verbergt (doorkijk, js/tekenen.js).
function krapDoos(plaat, ax, ay) {
  let x0 = plaat.b;
  let y0 = plaat.h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < plaat.h; y++) {
    for (let x = 0; x < plaat.b; x++) {
      if (plaat.px[(y * plaat.b + x) * 2] < 0) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < 0) return [0, 0, 0, 0];
  return [ax - x0, ay - y0, x1 + 1 - ax, y1 + 1 - ay];
}

// ---------------------------------------------------------------- de .tsx zelf

const XML_ESC = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function eigenschapXml(naam, waarde) {
  if (typeof waarde === 'boolean') return `    <property name="${naam}" type="bool" value="${waarde}"/>\n`;
  if (typeof waarde === 'number') return `    <property name="${naam}" type="int" value="${waarde}"/>\n`;
  return `    <property name="${naam}" value="${XML_ESC(waarde)}"/>\n`;
}

// vel = { naam, bestand, breedte, hoogte, tegelB, tegelH, aantal, kolommen, notitie,
//         tileoffset: [x,y]|null, objectalignment: bool,
//         tiles: [{ naam, vast, beslaat: [b,d]|null, groep }] }
function schrijfTsx(vel) {
  let x = '<?xml version="1.0" encoding="UTF-8"?>\n';
  if (vel.ingepakt) {
    // Een verzameling (Tiled 1.9 en later): elke tegel is een eigen rechthoek op hetzelfde beeld, of (een vel per
    // tekening) een eigen beeld (schrijfVel).
    const grootste = (i) => Math.max(1, ...vel.tiles.map((t) => (t.cel ? t.cel[i] : 0)));
    x += `<tileset version="1.10" tiledversion="1.11.0" name="${vel.naam}" tilewidth="${grootste(2)}" tileheight="${grootste(3)}" tilecount="${vel.aantal}" columns="0" objectalignment="bottom">\n`;
    x += ' <grid orientation="orthogonal" width="1" height="1"/>\n';
  } else {
    x += `<tileset version="1.10" tiledversion="1.11.0" name="${vel.naam}" tilewidth="${vel.tegelB}" tileheight="${vel.tegelH}" tilecount="${vel.aantal}" columns="${vel.kolommen || vel.aantal}"`;
    if (vel.objectalignment) x += ' objectalignment="bottom"';
    x += '>\n';
    if (vel.tileoffset) x += ` <tileoffset x="${vel.tileoffset[0]}" y="${vel.tileoffset[1]}"/>\n`;
  }
  // Een korte notitie bij het hele vel (Tiled toont dit bij de eigenschappen van de tileset
  // zelf, niet van een tegel): hoe Marcel de tegels moet gebruiken, zie ook het verslag.
  const ingepakt = vel.perTekening
    ? `Een plaatje per tekening (tegels/${vel.naam}/): het spel laadt een tekening pas als hij op de kaart staat.`
    : 'Ingepakt: elke tegel is een eigen rechthoek op het vel.';
  const notitie = [vel.notitie, vel.ingepakt && `${ingepakt} In Tiled staan de voorwerpen daardoor niet precies op hun plek; het spel zet ze neer met hun eigen anker (tegels.json).`].filter(Boolean).join(' ');
  if (notitie) x += ` <properties>\n  ${eigenschapXml('notitie', notitie).trim()}\n </properties>\n`;
  if (!vel.ingepakt) x += ` <image source="${vel.bestand}" width="${vel.breedte}" height="${vel.hoogte}"/>\n`;
  vel.tiles.forEach((t, id) => {
    const rechthoek = vel.ingepakt && !vel.perTekening && t.cel ? ` x="${t.cel[0]}" y="${t.cel[1]}" width="${t.cel[2]}" height="${t.cel[3]}"` : '';
    x += ` <tile id="${id}"${rechthoek}>\n  <properties>\n`;
    // Een lege cel (t.naam is null: gereserveerd voor een tegel die er later bij komt, zie
    // vasteVolgordeEnCapaciteit) krijgt een lege naam in plaats van de tekst "null", zodat
    // naar-kaarten.cjs se wachter hem herkent als leeg.
    x += eigenschapXml('naam', t.naam || '');
    x += eigenschapXml('vast', !!t.vast);
    if (t.beslaat) x += eigenschapXml('beslaat', `${t.beslaat[0]}x${t.beslaat[1]}`);
    if (t.groep) x += eigenschapXml('groep', t.groep);
    if (t.staat) x += eigenschapXml('staat_op_erf', t.staat);
    // de tegel voor de deur, vanaf de achterste tegel van de voet (huizen.cjs): "dx,dy"
    if (t.deur) x += eigenschapXml('deur', t.deur.join(','));
    x += '  </properties>\n';
    if (vel.perTekening && t.bestand) x += `  <image source="${t.bestand}" width="${t.cel[2]}" height="${t.cel[3]}"/>\n`;
    else if (vel.ingepakt && t.cel) x += `  <image source="${vel.bestand}" width="${vel.breedte}" height="${vel.hoogte}"/>\n`;
    x += ' </tile>\n';
  });
  x += '</tileset>\n';
  fs.writeFileSync(path.join(TEGELS, `${vel.naam}.tsx`), x);
}

// ---------------------------------------------------------------- een vel wegschrijven: raster, ingepakt of per tekening
//
// De grond blijft een raster van even grote cellen, want Tiled schildert ermee (Marcel, 4 okt: Tiled is "alleen nog de
// grond"). Elk ander vel hier wordt ingepakt (inpakken.cjs; werklijst vraag 114, 2a): elke tekening strak gesneden, met
// zijn eigen rechthoek (`cel`) en anker in tegels.json, en het vel zo klein als dat toelaat; de huizen en de gebouwen
// krijgen elke tekening in een eigen bestand (PER_TEKENING hieronder). In Tiled is zo'n vel een verzameling met een
// rechthoek of een plaatje per tegel (schrijfTsx); de voorwerpen staan daar niet precies op hun plek, want Tiled kent
// geen anker per tegel, maar het spel wel.
const RASTER = new Set(['grond']);
// De wind buigt een plant naar hoe hoog een pixel in zijn cel staat (js/sprites.js, bakWindStand). Op deze vellen houdt
// elke tekening daarom de hoogte van zijn cel, en snijden we alleen links en rechts bij: dan buigt hij als voorheen.
const MET_WIND = new Set(['bomen', 'begroeiing', 'erf']);
// Een vel per tekening (werklijst vraag 114, stap 1; Marcel, 4 okt: "A ja B ja"): op deze vellen staan veel grote
// tekeningen, waarvan er maar een paar tegelijk op een kaart staan (bij het begin 10 van de 23 huizen en 1 van de 27
// gebouwen). Elke tekening krijgt een eigen bestand in tegels/<vel>/, strak gesneden zoals op een ingepakt vel, en het
// spel laadt hem pas als hij op de kaart staat (js/sprites.js). Dan kost een tekening die er niet staat niets, hoeveel
// het er ook worden (de bouwstijlen van stap 2).
const PER_TEKENING = new Set(['huizen', 'gebouwen']);

// Het punt in een cel van het raster dat op het midden van de tegel komt: een vel met een eigen afspraak (een voethoek)
// zet het zelf; anders volgt het uit tileoffset (een model op zijn voetpunt), of is het het midden van de cel (grond).
const rasterAnker = (v) => v.anker || (v.tileoffset
  ? [Math.round(v.tegelB / 2) - v.tileoffset[0], v.tegelH - v.tileoffset[1]]
  : [Math.round(v.tegelB / 2), Math.round(v.tegelH / 2)]);

// `vel` is het raster zoals een bouwfunctie hierboven het samenstelde, `beschrijving` wat erbij hoort (tegelB, tegelH,
// kolommen, tiles). Na het inpakken staat in de beschrijving de maat van het ingepakte vel, en per tegel zijn cel en anker.
function schrijfVel(vel, beschrijving) {
  beschrijving.anker = rasterAnker(beschrijving);
  const { tegelB: cb, tegelH: ch, kolommen, anker } = beschrijving;
  const tegels = beschrijving.tiles.map((t, i) => (t.naam ? { cel: [(i % kolommen) * cb, Math.floor(i / kolommen) * ch, cb, ch], anker } : null));
  if (RASTER.has(beschrijving.naam)) {
    schrijfPng(beschrijving.bestand, vel);
  } else if (PER_TEKENING.has(beschrijving.naam)) {
    // De map helemaal opnieuw, zodat een tekening die er niet meer is, ook als bestand verdwijnt; en het vel van vóór
    // 4 okt weg.
    const map = path.join(TEGELS, beschrijving.naam);
    fs.rmSync(map, { recursive: true, force: true });
    fs.mkdirSync(map, { recursive: true });
    fs.rmSync(path.join(TEGELS, beschrijving.bestand), { force: true });
    const los = I.snijLos(I.beeldVanPlaat(vel), tegels);
    beschrijving.ingepakt = true;
    beschrijving.perTekening = true;
    beschrijving.tiles.forEach((t, i) => {
      if (!los[i]) {
        if (t.naam) console.warn(`  ${beschrijving.naam}/${t.naam}: niets getekend`);
        return;
      }
      const bestand = `${beschrijving.naam}/${t.naam}.png`;
      fs.writeFileSync(path.join(TEGELS, bestand), I.pngVanBeeld(los[i].beeld));
      Object.assign(t, { bestand, cel: los[i].cel, anker: los[i].anker });
    });
  } else {
    const uit = I.pakVelIn(I.beeldVanPlaat(vel), tegels, { houdHoogte: MET_WIND.has(beschrijving.naam) });
    fs.writeFileSync(path.join(TEGELS, beschrijving.bestand), I.pngVanBeeld(uit.beeld));
    beschrijving.ingepakt = true;
    beschrijving.breedte = uit.beeld.b;
    beschrijving.hoogte = uit.beeld.h;
    beschrijving.tiles.forEach((t, i) => {
      if (uit.tegels[i]) Object.assign(t, uit.tegels[i]);
      else if (t.naam) console.warn(`  ${beschrijving.naam}/${t.naam}: niets getekend`);
    });
  }
  schrijfTsx(beschrijving);
}

// Eén regel voor het verslag: het ingepakte vel met zijn maat, of de map met een bestand per tekening.
const velVerslag = (b) => (b.perTekening ? `${b.naam}/  een bestand per tekening` : `${b.bestand}  ${b.breedte}×${b.hoogte}, ingepakt`);

// ---------------------------------------------------------------- grond (64×32, geen speling)

// Eerst ging dit per tegel: dorp.grondTex() van precies 1×1 tegel renderen. Dat bleek in Tiled
// meteen te herhalen — elke "gras"-tegel is dan letterlijk dezelfde bitmap, dus de plukjes en
// het kasseienrooster vormen nette rijen zodra Marcel een stuk grond vult. In onze eigen platen
// (dorp-export.cjs) viel dat niet op, want die tekenen de ruis in één keer over een groot vlak.
//
// De oplossing: een lap van STEMPEL × STEMPEL tegels in één moeite door renderen (de ruis loopt
// dus gewoon door, op de echte wereld-gx/gy) en die achteraf in losse 64×32-tegels knippen
// (Plaat.uitsnede, hetzelfde stukje gereedschap als de sprites-agent gebruikte voor de vloeren
// binnen — zie naar-spel.cjs/beschrijving.json: vloeren.cel is ook een lap, 2×2 tegels, waar het
// spel zelf een ruit uit snijdt; hier snijden wij vooraf, want Tiled kent geen "knip een ruit uit
// een grotere plaat", alleen losse tegels). Marcel selecteert in Tiled de STEMPEL × STEMPEL-blok
// tegels van één grondsoort als één stempel (ze staan expres aaneengesloten in de tileset, zie
// "kolommen" hieronder) en herhaalt die over het veld: de herhaling valt dan om de vier tegels in
// plaats van om de één, en binnen een stempel sluiten de randen exact aan, want dat is één
// doorlopend bovenvlak. Erachteraan staan een paar LOSSE tegels (uit een ander stuk van diezelfde
// ruis, dus geen kopie van iets in de stempel) om tussen het stempelwerk te strooien met Tiled se
// eigen stempel-op-toeval; bij gras staat er ook net iets vaker een grasPol of bloem op.
const STEMPEL = 4; // 4×4 tegels: ver genoeg uit elkaar dat het oog de herhaling niet meer volgt
const DIKTE = 0.3; // net genoeg lager dan de vloer om de buitenrand van de lap heel te houden
// (kwantiseer mist een randpixel bij 0 dik door een rakende lichtstraal; interne sneden in de lap
// hebben dit niet nodig, want dat is geen rand van de doos maar gewoon het bovenvlak zelf).

const GROND = [
  ['gras', D.grondKaart({}), false],
  ['zandpad', D.grondKaart({ vast: D.PAD }), false],
  ['kasseien', D.grondKaart({ vast: D.KASSEI }), false],
];
// Losse tegels: telkens een flink stuk verderop in dezelfde ruis, zodat ze niet toevallig op een
// tegel uit de stempel lijken. Geen vaste betekenis (geen "altijd een kiezel op tegel 2"): het
// zijn gewoon andere plekken in hetzelfde grondtype, met bij gras een zwaardere grasPollen-hand.
const LOS_OFFSETS = [[9, 2], [3, 12], [15, 8]];

// Eén lap van tegelsB × tegelsH tegels, met de linkerbovenhoek op wereldtegel (gx0, gy0). Het
// canvas is precies zo groot als de lap (geen rand); die hoek valt op de bovenpunt van het
// canvas, net als bij (gx0, gy0) = (0, 0) op een gewoon canvas van 64×32.
function grondLap(kaart, tegelsB, tegelsH, gx0, gy0, dicht) {
  const b = tegelsB * 64;
  const h = tegelsH * 32;
  const OX = tegelsB * 32 - (gx0 - gy0) * 32;
  const OY = -(gx0 + gy0) * 16;
  const B = new K.Beeld(b, h, OX, OY);
  K.tekenDozen(B, [K.doos(gx0, gy0, gx0 + tegelsB, gy0 + tegelsH, -DIKTE, 0, D.grondTex(kaart))]);
  if (dicht) D.grasPollen(B, kaart, { dicht, bloemen: dicht });
  K.belicht(B, { omgeving: () => 0.15 });
  return K.Plaat.van(K.kwantiseer(B));
}

// Tegel (tx, ty), 0-based binnen de lap, uit de lap-plaat snijden.
function snijTegel(lapPlaat, tegelsB, tx, ty) {
  const OX = tegelsB * 32;
  return lapPlaat.uitsnede(OX + (tx - ty) * 32 - 32, (tx + ty) * 16, 64, 32);
}

function bouwGrondVel() {
  const { capaciteit, kolommen } = VELCONFIG.grond;
  const soorten = [];
  for (const [naam, kaart, vast] of GROND) {
    const gelukt = veilig(naam, () => {
      const stempel = [];
      const lap = grondLap(kaart, STEMPEL, STEMPEL, 0, 0, naam === 'gras' ? 1 : 0);
      for (let ty = 0; ty < STEMPEL; ty++) for (let tx = 0; tx < STEMPEL; tx++) stempel.push(snijTegel(lap, STEMPEL, tx, ty));
      // een lap van 1×1 is al precies 64×32: grondLap zelf hoeft dan niet meer gesneden te worden.
      const los = LOS_OFFSETS.map(([gx0, gy0]) => grondLap(kaart, 1, 1, gx0, gy0, naam === 'gras' ? 7 : 0));
      return { naam, vast, stempel, los };
    });
    if (gelukt) soorten.push(gelukt);
  }
  // water blijft zoals het was: één tegel, geen stempel nodig voor iets wat toch overal
  // hetzelfde golft.
  const water = veilig('water', () => grondLap(D.grondKaart({ vast: D.WATER }), 1, 1, 0, 0, 0));

  // Elke losse tegel krijgt een sleutel die nooit verandert: <soort>#stempel#<i> of
  // <soort>#los#<i> ("gras" alleen is geen goede sleutel — die naam komt negentien keer voor).
  // Eerst ALLE stempels (zo blijft elk stempelblok van STEMPEL×STEMPEL een nette rechthoek van
  // hele rijen, ook als er later een grondsoort bij komt: vasteVolgordeEnCapaciteit rondt af op
  // een veelvoud van kolommen, dus die komt met een hele nieuwe rij), dan alle losse tegels, dan
  // het water.
  const items = [];
  for (const s of soorten) s.stempel.forEach((p, i) => items.push({ key: `${s.naam}#stempel#${i}`, naam: s.naam, vast: s.vast, groep: 'stempel', plaat: p }));
  for (const s of soorten) s.los.forEach((p, i) => items.push({ key: `${s.naam}#los#${i}`, naam: s.naam, vast: s.vast, groep: 'los', plaat: p }));
  if (water) items.push({ key: 'water', naam: 'water', vast: true, groep: 'los', plaat: water });

  const geordend = vasteVolgordeEnCapaciteit('grond', items, capaciteit, kolommen);
  const rijen = Math.ceil(capaciteit / kolommen);
  const vel = new K.Plaat(64 * kolommen, 32 * rijen);
  geordend.forEach((it, i) => { if (it) vel.plak(it.plaat, (i % kolommen) * 64, Math.floor(i / kolommen) * 32); });
  const namen = soorten.map((s) => s.naam).join('/');
  const beschrijving = {
    naam: 'grond', bestand: 'grond.png', breedte: vel.b, hoogte: vel.h,
    tegelB: 64, tegelH: 32, aantal: geordend.length, kolommen, tileoffset: null, objectalignment: false,
    notitie: `Elke grondsoort (${namen}) staat eerst als stempel van ${STEMPEL}×${STEMPEL} tegels (groep "stempel"): sleep dat blok in de tileset in één keer op de kaart en herhaal het, dan valt de herhaling niet meer op. Daarna een paar losse tegels (groep "los", ook water): die mag je er individueel tussen strooien, bijvoorbeeld met Tiled se stempel-op-toeval. Tegels zonder naam, verderop in het vel, zijn gereserveerd voor een grondsoort die er later bij komt — laat ze met rust.`,
    tiles: geordend.map((it) => (it ? { naam: it.naam, vast: it.vast, groep: it.groep } : { naam: null, vast: false })),
  };
  schrijfVel(vel, beschrijving);
  console.log(`grond.png  ${vel.b}×${vel.h}  (${items.length} echte tegels van ${capaciteit}: ${soorten.map((s) => `${s.naam} ${s.stempel.length}+${s.los.length}`).join(', ')}${water ? ', water 1' : ''})`);
  return beschrijving;
}

// ------------------------------------------------------- bomen & begroeiing (SDF-modellen)

// Eén boom of plant los renderen, net als gereedschap/pixelart/bosgebied-proef.cjs dat doet om een
// los onderdeel te bekijken: K.losRenderen geeft de tekening op een doorzichtig vlak, met het
// ankerpunt waar de voet de grond raakt. ontspikkel haalt losse pixels uit blad- en grastinten weg.
function meetModel(model) {
  const b = Math.ceil(model.straal * 2 + 30);
  const h = Math.ceil(model.straal * 1.7 + 40);
  return { b, h };
}
function renderModel(model, cb, ch, ankerY) {
  const p = K.losRenderen(model, { b: cb, h: ch, anker: [Math.round(cb / 2), ankerY], richting: 'Z' });
  Bm.ontspikkel(p);
  return p;
}

// lijst: de sleutels in Bm (bomen.cjs), elk het eerste exemplaar (zaad 1); of { key, naam, zaad, o, vorm }: een andere
// vorm van een soort (BOOM_VORMEN), met de naam van de soort en `vorm` erbij.
function bouwModelVel(veldNaam, lijst, vastVan) {
  const { capaciteit, kolommen } = VELCONFIG[veldNaam];
  const RAND_ONDER = 26; // ruimte onder het ankerpunt, voor schaduw/anti-aliasing (zie bosgebied-proef.cjs)
  const gevonden = [];
  for (const ding of lijst) {
    const { key, naam, zaad = 1, o = {}, vorm } = typeof ding === 'string' ? { key: ding, naam: ding } : ding;
    const gelukt = veilig(key, () => {
      const model = Bm[naam](zaad, o);
      const { b, h } = meetModel(model);
      return { key, naam, vorm, model, b, h };
    });
    if (gelukt) gevonden.push(gelukt);
  }
  if (!gevonden.length) return null;
  const cb = Math.max(...gevonden.map((i) => i.b));
  const ch = Math.max(...gevonden.map((i) => i.h));
  const ankerX = Math.round(cb / 2);
  const ankerY = ch - RAND_ONDER;
  const items = [];
  for (const it of gevonden) {
    const p = veilig(it.key, () => renderModel(it.model, cb, ch, ankerY));
    if (p) items.push({ key: it.key, naam: it.naam, vorm: it.vorm, vast: vastVan(it.naam), doos: krapDoos(p, ankerX, ankerY), plaat: p });
  }
  if (!items.length) return null;
  const geordend = vasteVolgordeEnCapaciteit(veldNaam, items, capaciteit, kolommen);
  const rijen = Math.ceil(capaciteit / kolommen);
  const vel = new K.Plaat(cb * kolommen, ch * rijen);
  geordend.forEach((it, i) => { if (it) vel.plak(it.plaat, (i % kolommen) * cb, Math.floor(i / kolommen) * ch); });
  const beschrijving = {
    naam: veldNaam, bestand: `${veldNaam}.png`, breedte: vel.b, hoogte: vel.h,
    tegelB: cb, tegelH: ch, aantal: geordend.length, kolommen,
    // Het model zet zijn eigen voet altijd op (ankerX, ankerY); "bottom" is dus alleen goed met
    // deze correctie: Tiled schuift het plaatje cb/2−ankerX opzij en ch−ankerY omlaag terug.
    tileoffset: [Math.round(cb / 2) - ankerX, ch - ankerY],
    objectalignment: true,
    tiles: geordend.map((it) => (it ? { naam: it.naam, vast: it.vast, doos: it.doos || null, ...(it.vorm ? { vorm: it.vorm } : {}) } : { naam: null, vast: false })),
  };
  schrijfVel(vel, beschrijving);
  console.log(`${velVerslag(beschrijving)}  (${items.length} echte tegels van ${capaciteit})`);
  return beschrijving;
}

// Achteraan het boompje dat de houthakker plant en de jonge bomen waar het in een jaar of twee via
// groeit (vraag 115, f).
const BOMEN = ['eik', 'herfstEik', 'den', 'berk', 'dodeBoom', 'wilg', 'appelboom', 'boompje', 'jongeEik', 'jongeDen', 'jongeBerk'];
// Elke boom anders (vraag 148, a; Marcel, 9 okt: "Ja goed idee"): per soort zijn vormen, de eerste is de tekening van
// altijd (zaad 1, in BOMEN), de andere een ander zaad, en bij de eik een vorm (EIK_VORMEN in bomen.cjs). Ze heten
// "<soort>.<n>" en hebben de naam van hun soort, met `vorm: n`; welke een boom op de kaart krijgt, zegt zijn tegel
// (T.sprites.tekeningVan, js/sprites.js). Met de nieuwe soorten: de beuk, de linde, de els, de populier, de knotwilg, de
// grove den, en de meidoorn en de hazelaar, die struiken zijn (T.BOMEN, js/wereld.js).
const zaden = (n) => Array.from({ length: n }, (_, i) => ({ zaad: i + 1 }));
const BOOM_VORMEN = {
  eik: [{}, { zaad: 2, o: { vorm: 'breed' } }, { zaad: 3, o: { vorm: 'hoog' } }, { zaad: 4, o: { vorm: 'scheef' } }, { zaad: 5, o: { vorm: 'tweestam' } }, { zaad: 6, o: { vorm: 'oud' } }],
  den: zaden(4),
  berk: zaden(4),
  dodeBoom: zaden(3),
  wilg: zaden(3),
  appelboom: zaden(4),
  beuk: zaden(4),
  linde: zaden(3),
  els: zaden(3),
  populier: zaden(3),
  knotwilg: zaden(3),
  groveDen: zaden(3),
  meidoorn: zaden(3),
  hazelaar: zaden(3),
};
const BOMEN_MET_VORMEN = [
  ...BOMEN,
  ...Object.entries(BOOM_VORMEN).flatMap(([naam, vormen]) =>
    vormen.map((v, i) => (i === 0 ? (BOMEN.includes(naam) ? null : naam) : { key: `${naam}.${i + 1}`, naam, zaad: v.zaad || 1, o: v.o || {}, vorm: i + 1 })).filter(Boolean),
  ),
];
// een boom staat altijd in de weg, ook een jonge; langs een boompje dat net geplant is, loop je
const BOMEN_VAST = (naam) => naam !== 'boompje';

// Bm.BEGROEIING komt uit bomen.cjs zelf (zie module.exports daar): zo blijft dit script kloppen
// als daar later iets bij komt of verandert, zonder dat hier iets hoeft mee te veranderen.
const BEGROEIING = Bm.BEGROEIING || ['struik', 'bessenStruik', 'varen', 'grasPol', 'hoogGras', 'bloemen', 'paddenstoelen', 'boomstronk', 'rots', 'kleineRots'];
// Lage planten (varen, gras, bloemen, paddenstoelen, los steengruis) zijn geen obstakel; struiken
// en een stronk of rots wel. Een korte, expliciete lijst: makkelijker te lezen dan een regel.
const BEGROEIING_VAST = { struik: true, bessenStruik: true, boomstronk: true, rots: true };

// ------------------------------------------------------- tuin (losse tuinstukken, SDF, ronde 4a)
//
// Anders dan bomen/begroeiing (die op hun voetpunt staan) hoort een tuinstuk op het MIDDEN van
// zijn tegel te staan (tuin-sdf.cjs, en ontwerp/werklijst.md ronde 4): een recht stuk hek staat
// voor de helft op de ene buurtegel, voor de helft op de andere, dus het anker kan niet een
// voethoek of -punt zijn. tuin-sdf.cjs bouwt met toren.cjs se Wereld/tekenWereld (zoals de toren
// en het erf), niet met de "model"-vorm van figuren.cjs/bomen.cjs, dus dit vel rendert met
// Tr.tekenWereld op een eigen Beeld in plaats van met K.losRenderen (bouwModelVel hierboven).
//
// Geen analytische maat zoals model.straal voorhanden, dus eerst een ruime proefplaat per stuk om
// zijn werkelijke bereik vanaf het midden te meten (net als krapDoos dat al doet), en pas daarna
// de cel op maat renderen — dat scheelt gokken naar hoe groot de cel moet zijn.
const TUIN_VAST = (naam) => naam.startsWith('hek-') || naam.startsWith('bankje-') || naam === 'regenton';

function renderTuinstuk(naam, b, h, ankerX, ankerY) {
  const B = new K.Beeld(b, h, ankerX, ankerY);
  Tr.tekenWereld(B, Tn.tuinstuk(naam, 1));
  K.belicht(B);
  K.omlijn(B);
  const p = K.Plaat.van(K.kwantiseer(B));
  Bm.ontspikkel(p);
  return p;
}

function bouwTuinVel() {
  const { capaciteit, kolommen } = VELCONFIG.tuin;
  const RAND = 6; // marge rond het gemeten bereik, voor de omlijning
  const proefB = 260;
  const proefH = 220;
  const proefAnkerX = Math.round(proefB / 2);
  const proefAnkerY = proefH - 40;
  const gevonden = [];
  for (const naam of Tn.STUKKEN) {
    const gelukt = veilig(naam, () => ({ naam, doos: krapDoos(renderTuinstuk(naam, proefB, proefH, proefAnkerX, proefAnkerY), proefAnkerX, proefAnkerY) }));
    if (gelukt) gevonden.push(gelukt);
  }
  if (!gevonden.length) return null;
  const links = Math.max(...gevonden.map((i) => i.doos[0])) + RAND;
  const boven = Math.max(...gevonden.map((i) => i.doos[1])) + RAND;
  const rechts = Math.max(...gevonden.map((i) => i.doos[2])) + RAND;
  const onder = Math.max(...gevonden.map((i) => i.doos[3])) + RAND;
  const cb = links + rechts;
  const ch = boven + onder;
  const ankerX = links;
  const ankerY = boven;
  const items = [];
  for (const { naam } of gevonden) {
    const p = veilig(naam, () => renderTuinstuk(naam, cb, ch, ankerX, ankerY));
    if (p) items.push({ key: naam, naam, vast: TUIN_VAST(naam), doos: krapDoos(p, ankerX, ankerY), plaat: p });
  }
  if (!items.length) return null;
  const geordend = vasteVolgordeEnCapaciteit('tuin', items, capaciteit, kolommen);
  const rijen = Math.ceil(capaciteit / kolommen);
  const vel = new K.Plaat(cb * kolommen, ch * rijen);
  geordend.forEach((it, i) => { if (it) vel.plak(it.plaat, (i % kolommen) * cb, Math.floor(i / kolommen) * ch); });
  const beschrijving = {
    naam: 'tuin', bestand: 'tuin.png', breedte: vel.b, hoogte: vel.h,
    tegelB: cb, tegelH: ch, aantal: geordend.length, kolommen,
    tileoffset: [Math.round(cb / 2) - ankerX, ch - ankerY],
    objectalignment: true,
    // Expliciet, in plaats van de val op tileoffset terug (zie de toelichting bij "alles samen"
    // onderaan): die val neemt aan dat het anker horizontaal in het midden van de cel staat, en
    // dat klopt hier niet voor een hoek- of eindstuk (asymmetrisch bereik vanaf het midden).
    anker: [ankerX, ankerY],
    notitie: 'Losse tuinstukken, één per tegel, niet vast aan een huis (ontwerp/beeld.md, "Een tuintje erbij"): twee hekken (hek-tenen-*, van gevlochten wilgentenen, en hek-lat-*, van een paar latten — elk met een recht stuk in beide richtingen, een hoek, een eind en een hekje), groente, een kruidenbed, bloemen langs een muur, een bankje en een regenton. Het anker staat op het midden van de tegel, niet op een voethoek: een recht stuk hek staat voor de helft op de ene buurtegel. Vast zijn de hekken, de bank en de regenton; het hekje, de bedden en de bloemen niet — daar loop je doorheen of overheen.',
    tiles: geordend.map((it) => (it ? { naam: it.naam, vast: it.vast, doos: it.doos || null } : { naam: null, vast: false })),
  };
  schrijfVel(vel, beschrijving);
  console.log(`${velVerslag(beschrijving)}  (${items.length} echte tegels van ${capaciteit})`);
  return beschrijving;
}

// ---------------------------------------------------------------- gebouwen & plekken (vormen)

// Zelfde recept als gebouwLos/plekLos in dorp-export.cjs en dorp2-export.cjs: het gebouw zelf
// tekenen, de avondzon-schaduw van zijn eigen vormen erop, het avondlicht erover, dan omlijnen.
// hoek: waar (in schermpixels, gemeten vanaf hetzelfde punt als bij meetGebouw) de achterste
// voethoek van dit gebouw valt — dat punt komt op (anker[0], anker[1]) te staan, niet het
// wereldnulpunt van maak(0, 0). Zie de toelichting bij meetGebouw hieronder.
function gebouwLos(g, b, h, anker, hoek) {
  const B = new K.Beeld(b, h, anker[0] - hoek[0], anker[1] - hoek[1]);
  D.zetGebouw(B, g);
  D.zonSchaduw(B, g.vormen, { zon: D.AVONDZON });
  K.belicht(B, { omgeving: () => 0.15 });
  D.avondlicht(B);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}
// De rand van het model meten op een ruim schaduwblad, zoals dorp-export.cjs se maten() doet.
// Let op: maak(0, 0) zet zijn wereldnulpunt niet op de achterste voethoek maar een halve tegel
// erin (g.voet[0], g.voet[1] is net iets minder dan 0), dus meten we hier ook waar die hoek
// zelf op het scherm valt: de marges (links/rechts/boven/onder) en straks het ankerpunt gaan
// over díe hoek, zodat "beslaat" tegels ook precies vanaf de aangeklikte tegel beginnen.
function meetGebouw(g) {
  const OX = 450, OY = 550;
  const B = new K.Beeld(900, 900, OX, OY);
  D.zetGebouw(B, g);
  let x0 = 1e9, x1 = -1, y0 = 1e9, y1 = -1;
  for (let i = 0; i < B.b * B.h; i++) {
    if (B.ramp[i] < 0) continue;
    const x = i % B.b;
    const y = (i / B.b) | 0;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  const voet = g.voet || [0, 0, 0, 0];
  const [hsx, hsy] = K.naarScherm(B, voet[0], voet[1], 0);
  const hoek = [hsx - OX, hsy - OY]; // de achterste voethoek, t.o.v. het wereldnulpunt
  return {
    links: hsx - x0 + 1, rechts: x1 - hsx + 1, boven: hsy - y0 + 1, onder: y1 - hsy + 1,
    hoek,
  };
}

// (naam, maakFn); maakFn bouwt het gebouw op (0, 0), zoals de bestaande -export.cjs-scripts doen.
function gebouwenLijst() {
  const lijst = [
    ['vakwerkhuis', () => D.vakwerkhuis(0, 0)],
    ['stenenHuis', () => D.stenenHuis(0, 0)],
    ['herberg', () => D.herberg(0, 0, { rook: false })],
  ];
  if (typeof D.smidse === 'function') lijst.push(['smidse', () => D.smidse(0, 0)]);
  if (typeof D.dorpshuis === 'function') {
    lijst.push(['dorpshuis1', () => D.dorpshuis(0, 0, 1, { maat: [7, 5], rook: false })]);
    lijst.push(['dorpshuis3', () => D.dorpshuis(0, 0, 3, { maat: [6, 8], rook: false })]);
    lijst.push(['dorpshuis5', () => D.dorpshuis(0, 0, 5, { maat: [5, 7], rook: false, muur: 'blokhut' })]);
    // Twaalf nieuwe gebouwen voor het dorp (20 sep 2026), in de geest van de leidende referentie
    // (ontwerp/beeld.md): klein 5×7, gewoon 6×8, groot 7×9, riet als meerderheid, een enkele
    // schaliën en hooguit één rode pannen, en geen twee met hetzelfde silhouet. dorpKlein/Gewoon/
    // Groot leunen op dorpshuis (dat rolt zelf dakkapel/erker/windveer/schoorsteen/ouderdom per
    // zaad); aanbouwhuis en vleugelhuis zijn expliciet, want die tonen de nieuwe o.aanbouw-optie
    // op huis() (zie dorp.cjs): dezelfde optie, eenmaal laag als aanbouw tegen de zijkant en
    // eenmaal breed als L-vormige plattegrond.
    lijst.push(['dorpKlein1', () => D.dorpshuis(0, 0, 101, { maat: [5, 7], muur: 'vlecht', dak: 'riet', rook: false })]);
    lijst.push(['dorpKlein2', () => D.dorpshuis(0, 0, 102, { maat: [5, 7], muur: 'planken', dak: 'leien', rook: false })]);
    lijst.push(['dorpKlein3', () => D.dorpshuis(0, 0, 103, { maat: [5, 7], muur: 'blokhut', dak: 'riet', rook: false })]);
    lijst.push(['dorpGewoonAanbouw', () => D.aanbouwhuis(0, 0)]);
    lijst.push(['dorpGewoonVleugel', () => D.vleugelhuis(0, 0)]);
    lijst.push(['dorpGewoon3', () => D.dorpshuis(0, 0, 106, { maat: [6, 8], muur: 'veldsteen', dak: 'leien', rook: false })]);
    lijst.push(['dorpGewoon4', () => D.dorpshuis(0, 0, 107, { maat: [6, 8], muur: 'planken', dak: 'riet', rook: false })]);
    lijst.push(['dorpGroot1', () => D.dorpshuis(0, 0, 108, { maat: [7, 9], muur: 'vlecht', dak: 'riet', rook: false })]);
    lijst.push(['dorpGroot2', () => D.dorpshuis(0, 0, 109, { maat: [7, 9], muur: 'planken', dak: 'pannen', rook: false })]);
  }
  if (typeof P.schuur === 'function') lijst.push(['schuurBlokhut', () => P.schuur(0, 0, { b: 5, d: 7, muur: 'blokhut', dakMos: 0.7, zaad: 77 })]);
  if (typeof P.houtschuur === 'function') lijst.push(['houtschuur', () => P.houtschuur(0, 0)]);
  if (typeof P.kippenhok === 'function') lijst.push(['kippenhok', () => P.kippenhok(0, 0)]);
  if (typeof P.kapel === 'function') lijst.push(['kapel', () => P.kapel(0, 0)]);
  if (typeof P.kerkhof === 'function') lijst.push(['kerkhof', () => P.kerkhof(0, 0, { b: 6, d: 4, rijen: 4, kol: 3 })]);
  if (typeof P.watermolen === 'function') lijst.push(['watermolen', () => P.watermolen(0, 0, { radVlak: 'y', rook: false })]);
  if (typeof P.bakkerij === 'function') lijst.push(['bakkerij', () => P.bakkerij(0, 0, { rook: false })]);
  if (typeof P.kruidenhut === 'function') lijst.push(['kruidenhut', () => P.kruidenhut(0, 0, { rook: false })]);
  if (typeof P.jagershut === 'function') lijst.push(['jagershut', () => P.jagershut(0, 0, { rook: false })]);
  if (typeof P.oudstehuis === 'function') lijst.push(['oudstehuis', () => P.oudstehuis(0, 0, { rook: false })]);
  if (typeof P.wijnboerderij === 'function') lijst.push(['wijnboerderij', () => P.wijnboerderij(0, 0, { rook: false })]);
  // Het wijnhuis (vraag 140, 8 okt): alleen het huis met de wijntonnen voor de deur, 5 bij 4, zonder wijngaard: de wijngaard komt uit
  // de ranken op de tegels (wijnrank.cjs).
  if (typeof P.wijnboerderij === 'function') lijst.push(['wijnhuis', () => P.wijnboerderij(0, 0, { rook: false, alleenHuis: true, metTonnen: true })]);
  if (typeof P.schuur === 'function') lijst.push(['schuur', () => P.schuur(0, 0)]);
  // brug slaan we over: die is geen heel aantal tegels breed, en hoort dus niet in "beslaat".
  return lijst;
}

function bouwGebouwenVel() {
  const { capaciteit, kolommen } = VELCONFIG.gebouwen;
  const RAND = 6;
  const acht = (n) => Math.ceil(n / 8) * 8;
  const metingen = [];
  for (const [naam, maak] of gebouwenLijst()) {
    const gelukt = veilig(naam, () => {
      const g = maak();
      const m = meetGebouw(g);
      const v = g.voet || [0, 0, 0, 0];
      const beslaat = [Math.max(1, Math.round((v[2] - v[0]) / K.TEGEL)), Math.max(1, Math.round((v[3] - v[1]) / K.TEGEL))];
      return { naam, maak, m, beslaat };
    });
    if (gelukt) metingen.push(gelukt);
  }
  if (!metingen.length) return null;
  const links = Math.max(...metingen.map((i) => i.m.links)) + RAND;
  const rechts = Math.max(...metingen.map((i) => i.m.rechts)) + RAND;
  const boven = Math.max(...metingen.map((i) => i.m.boven)) + RAND;
  const onder = Math.max(...metingen.map((i) => i.m.onder)) + RAND;
  const cb = acht(links + rechts);
  const ch = acht(boven + onder);
  const ankerX = links + Math.floor((cb - links - rechts) / 2);
  const ankerY = boven + (ch - boven - onder);

  const items = [];
  for (const it of metingen) {
    const p = veilig(it.naam, () => gebouwLos(it.maak(), cb, ch, [ankerX, ankerY], it.m.hoek));
    if (!p) continue;
    // Het anker van een gebouw is zijn achterste voethoek; die ligt een halve tegel boven het
    // midden van zijn tegel, en het spel tekent op dat midden (zie `anker` onderaan).
    items.push({ key: it.naam, naam: it.naam, vast: true, beslaat: it.beslaat, doos: krapDoos(p, ankerX, ankerY + 16), plaat: p });
  }
  if (!items.length) return null;
  const geordend = vasteVolgordeEnCapaciteit('gebouwen', items, capaciteit, kolommen);
  const rijen = Math.ceil(capaciteit / kolommen);
  const vel = new K.Plaat(cb * kolommen, ch * rijen);
  geordend.forEach((it, i) => { if (it) vel.plak(it.plaat, (i % kolommen) * cb, Math.floor(i / kolommen) * ch); });
  const beschrijving = {
    naam: 'gebouwen', bestand: 'gebouwen.png', breedte: vel.b, hoogte: vel.h,
    tegelB: cb, tegelH: ch, aantal: geordend.length, kolommen,
    tileoffset: [Math.round(cb / 2) - ankerX, ch - ankerY],
    objectalignment: true,
    // Het anker dat het spel gebruikt is zijn achterste voethoek, niet (ankerX, ankerY) zelf: die
    // hoek ligt een halve tegel (16 px) boven het midden van de tegel waar het spel op tekent (zie
    // de toelichting hierboven bij `items.push`). Dezelfde +16 staat bij `bouwErfVel`.
    anker: [ankerX, ankerY + 16],
    tiles: geordend.map((it) => (it ? { naam: it.naam, vast: true, beslaat: it.beslaat, doos: it.doos || null } : { naam: null, vast: false })),
  };
  schrijfVel(vel, beschrijving);
  console.log(`${velVerslag(beschrijving)}  (${items.length} echte tegels van ${capaciteit})`);
  items.forEach((it) => console.log(`  ${it.naam.padEnd(14)} beslaat ${it.beslaat[0]}x${it.beslaat[1]}`));
  return beschrijving;
}

// ---------------------------------------------------------------- het erf: de toren en wat er op
// staat (erf-scene.cjs)
//
// Het erf van de toren is geen verzameling losse modellen zoals de bomen, maar één scène: het
// schuurtje, de put, de houtstapel, de waslijn en de moestuin worden daar met dezelfde tekenaar
// gebouwd als de toren zelf (toren.cjs se Wereld/tekenWereld). Hier bouwen we per ding een
// wereldje met alleen dat ding erin, op precies de plek waar erf-scene.cjs het zet, en renderen
// dat los. Zo staat de plaatsing maar op één plek: verzet Marcel de put in erf-scene.cjs, dan
// verschuift hij mee in Tiled én in het spel (erf-kaart.cjs maakt kaarten/erf.tmj uit dezelfde
// lijst).
//
// voet: [x0, y0, breed, diep] in tegels vanaf de voet van de toren — welke tegels het ding
// inneemt. De tegel (x0, y0) is de tegel die je in Tiled aanklikt, en het ankerpunt van de cel
// is het midden van díe tegel (zie `anker` onderaan: het spel legt dat punt op T.naarScherm).
const Tr = require('./toren.cjs');
const Es = require('./erf-scene.cjs');

const ERF_STAAT = { oud: 1, onkruid: 1 };

// De wereld met alleen dit ene ding erin, op de plek waar erf-scene.cjs het zet.
function erfWereld(bouw) {
  const W = new Tr.Wereld();
  if (bouw) {
    Es.materialen(W, ERF_STAAT);
    bouw(W, ERF_STAAT);
  } else {
    // Zonder aanbouw (schuur: null), net als erf-scene.cjs: op het erf staat een eigen schuurtje,
    // en twee schuren tegen elkaar aan wordt rommelig.
    const Wt = Tr.bouwToren({ ...Tr.STATEN.krakkemikkig, schuur: null });
    W.groepen.push(...Wt.groepen);
    Object.assign(W.mat, Wt.mat);
    W.lichten.push(...Wt.lichten);
  }
  return W;
}

// De voetafdruk van een gebouwd ding opmeten in plaats van hem als getal op te schrijven: vanuit
// het midden naar binnen zoeken tot het afstandsveld iets raakt, net boven de grond, in tweeënzestig
// richtingen. Zo klopt de voet nog steeds zodra de toren dikker gemaakt wordt (hij moet om zijn
// eigen hal passen, zie ontwerp/wereld.md), zonder dat hier of in erf-kaart.cjs een getal staat.
// Geeft [x0, y0, breed, diep] in tegels, plus de hoogte van het model in eenheden.
function meetVoet(W) {
  const groepen = W.groepen.filter((g) => g.delen.length);
  // tekenWereld sluit de groepen (grenscilinders); op een vlak van 1×1 kost dat niets.
  Tr.tekenWereld(new K.Beeld(1, 1, 0, 0), W);
  const n = groepen.length;
  // Tien eenheden boven de grond: hoog genoeg om over het puin en de losse stenen om de voet heen
  // te kijken (daar loop je gewoon omheen, dat hoeft geen muur te zijn), laag genoeg om nog in de
  // plint te zitten en niet in het dak.
  const Z = 10;
  const MAXR = 900;
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (let i = 0; i < 62; i++) {
    const a = (i / 62) * Math.PI * 2;
    const cx = Math.cos(a);
    const cy = Math.sin(a);
    let r = MAXR;
    while (r > 0 && Tr.veld(groepen, n, cx * r, cy * r, Z) > 0) r -= 2;
    if (r <= 0) continue;
    x0 = Math.min(x0, cx * r);
    x1 = Math.max(x1, cx * r);
    y0 = Math.min(y0, cy * r);
    y1 = Math.max(y1, cy * r);
  }
  if (!Number.isFinite(x0)) return { voet: [0, 0, 1, 1], hoog: 100 };
  const tx0 = Math.round(x0 / K.TEGEL);
  const ty0 = Math.round(y0 / K.TEGEL);
  const hoog = Math.max(...groepen.map((g) => g.z1 || 0), 1);
  return { voet: [tx0, ty0, Math.max(1, Math.round(x1 / K.TEGEL) - tx0 + 1), Math.max(1, Math.round(y1 / K.TEGEL) - ty0 + 1)], hoog };
}

// Eén ding van het erf op een ruim vlak renderen. Het anker van het vlak komt op het midden van
// tegel (x0, y0) te liggen; daarna snijden we de plaat strak om wat er getekend is en schuift het
// anker mee. Zo is de cel niet groter dan nodig en weet het spel waar de voet ligt.
function erfDingLos(naam, opgegeven, bouw, vlak) {
  // Zonder opgegeven voet meten we hem op (de toren), en dan groeit ook het vlak mee.
  let voet = opgegeven;
  let hoog = 0;
  if (!voet) {
    const gemeten = meetVoet(erfWereld(bouw));
    voet = gemeten.voet;
    hoog = gemeten.hoog;
  }
  const [x0, y0, vb, vd] = voet;
  const breedPx = (vb + vd) * 32;
  const cb = (vlak && vlak[0]) || Math.ceil(breedPx * 1.6 + 200);
  const ch = (vlak && vlak[1]) || Math.ceil(hoog * K.PXH + breedPx / 2 + 320);
  // Het anker ruim genoeg van de rand: het meeste steekt naar boven uit (daken, de toren), dus het
  // ankerpunt ligt laag in het vlak. Eronder moet nog wel de rest van de voet passen: de tegel
  // (x0, y0) is de achterste hoek, en de voorste hoek ligt ((b−1)+(d−1)) halve tegelhoogtes lager,
  // plus wat het model zelf nog onder de grond heeft (palen, puin).
  const ax = Math.round(cb / 2);
  const ay = ch - (((vb - 1) + (vd - 1)) * 16 + 96);
  // B.OX/B.OY horen bij wereldpunt (0, 0, 0) = de voet van de toren; het anker moet op tegel
  // (x0, y0) vallen, dus schuift de oorsprong daar vandaan terug.
  const B = new K.Beeld(cb, ch, ax - (x0 - y0) * 32, ay - (x0 + y0) * 16);
  const W = erfWereld(bouw);
  Tr.tekenWereld(B, W);
  if (bouw) {
    K.belicht(B, { omgeving: () => 0.15 });
  } else {
    // De toren krijgt het licht van buiten dat toren.cjs zelf gebruikt; zonder de grondplaat van
    // toren(), want het spel tekent zijn eigen gras eronder.
    K.belicht(B, { omgeving: (X, Y, Z, px, py, i) => 0.05 + 0.25 * B.nrm[i * 3 + 2] });
    Tr.zonKleur(B, 6.2);
  }
  K.verwarm(B, 1.6);
  K.omlijn(B);
  const plaat = K.Plaat.van(K.kwantiseer(B));
  // strak snijden
  let x1 = -1;
  let y1 = -1;
  let xa = plaat.b;
  let ya = plaat.h;
  for (let y = 0; y < plaat.h; y++) {
    for (let x = 0; x < plaat.b; x++) {
      if (plaat.px[(y * plaat.b + x) * 2] < 0) continue;
      if (x < xa) xa = x;
      if (x > x1) x1 = x;
      if (y < ya) ya = y;
      if (y > y1) y1 = y;
    }
  }
  if (x1 < 0) throw new Error('niets getekend');
  if (xa === 0 || ya === 0 || x1 === plaat.b - 1 || y1 === plaat.h - 1) {
    console.warn(`  let op: ${naam} raakt de rand van zijn vlak (${cb}×${ch}) — maak het ruimer`);
  }
  return { plaat: plaat.uitsnede(xa, ya, x1 - xa + 1, y1 - ya + 1), anker: [ax - xa, ay - ya], voet };
}

function bouwErfVel(veldNaam, dingen, notitie) {
  const items = [];
  for (const { naam, voet, vast, bouw, vlak } of dingen) {
    const t0 = Date.now();
    const gelukt = veilig(naam, () => erfDingLos(naam, voet, bouw, vlak));
    if (!gelukt) continue;
    // `staat`: op welke tegel dit ding hoort te staan, in tegels vanaf de voet van de toren. Zo
    // hoeft erf-kaart.cjs de plaatsing niet nog eens uit te rekenen, en klopt hij ook als de voet
    // van de toren opgemeten wordt in plaats van opgeschreven.
    items.push({ naam, vast, plaat: gelukt.plaat, anker: gelukt.anker, beslaat: [gelukt.voet[2], gelukt.voet[3]], staat: `${gelukt.voet[0]},${gelukt.voet[1]}` });
    console.log(`  ${naam.padEnd(12)} ${gelukt.plaat.b}×${gelukt.plaat.h}  anker ${gelukt.anker.join(',')}  voet ${gelukt.voet.join(',')}  ${Date.now() - t0} ms`);
  }
  return bouwLosVel(veldNaam, items, notitie);
}

// Een vel uit losse, al gerenderde tekeningen, elk met zijn eigen maat en zijn eigen anker: het erf
// en de huizen (huizen.cjs). items: [{ naam, vast, plaat, anker, beslaat, staat?, deur? }], met
// `anker` de achterste voethoek in de plaat.
function bouwLosVel(veldNaam, items, notitie) {
  const { capaciteit, kolommen } = VELCONFIG[veldNaam];
  if (!items.length) return null;
  // Eén cel die om alles heen past: het anker op dezelfde plek in elke cel, zoals bij de andere
  // vellen, zodat Tiled er met één tileoffset mee uit de voeten kan.
  const links = Math.max(...items.map((i) => i.anker[0]));
  const rechts = Math.max(...items.map((i) => i.plaat.b - i.anker[0]));
  const boven = Math.max(...items.map((i) => i.anker[1]));
  const onder = Math.max(...items.map((i) => i.plaat.h - i.anker[1]));
  const cb = links + rechts;
  const ch = boven + onder;
  const geordend = vasteVolgordeEnCapaciteit(veldNaam, items.map((i) => ({ key: i.naam, ...i })), capaciteit, kolommen);
  const rijen = Math.ceil(capaciteit / kolommen);
  const vel = new K.Plaat(cb * kolommen, ch * rijen);
  geordend.forEach((it, i) => { if (it) vel.plak(it.plaat, (i % kolommen) * cb + links - it.anker[0], Math.floor(i / kolommen) * ch + boven - it.anker[1]); });
  const beschrijving = {
    naam: veldNaam, bestand: `${veldNaam}.png`, breedte: vel.b, hoogte: vel.h,
    tegelB: cb, tegelH: ch, aantal: geordend.length, kolommen,
    // Tiled se "bottom" zet het onderste midden van de cel op de tegel; (links, boven) is het punt
    // waarop elke tekening is opgehangen (haar achterste voethoek), dus dat corrigeren we daarheen
    // terug, net als bij de bomen en de gebouwen.
    tileoffset: [Math.round(cb / 2) - links, ch - boven],
    objectalignment: true,
    // Het anker dat het spel gebruikt is de achterste voethoek, niet (links, boven) zelf: die hoek
    // ligt een halve tegel (16 px) boven het midden van de tegel waarop het spel tekent (dezelfde
    // afspraak als bij de gebouwen, zie de toelichting bij `bouwGebouwenVel`).
    anker: [links, boven + 16],
    notitie,
    // `doos`: hoe ver het beeld links, boven, rechts en onder het ankerpunt reikt (dezelfde +16 als
    // hierboven). De cel is voor alle tegels van een vel even groot (Tiled wil dat zo), maar een
    // bank is geen waslijn; het spel heeft de echte maat nodig om te weten of dit ding iemand
    // verbergt (doorkijk).
    tiles: geordend.map((it) => (it ? {
      naam: it.naam, vast: it.vast, beslaat: it.beslaat, staat: it.staat || null, deur: it.deur || null,
      doos: [it.anker[0], it.anker[1] + 16, it.plaat.b - it.anker[0], it.plaat.h - it.anker[1] - 16],
      // de ramen die je ziet, alleen bij een huis (huizen.cjs, ramenVan): 's avonds branden ze
      ...(it.ramen ? { ramen: it.ramen } : {}),
      ...(it.schoorsteen ? { schoorsteen: it.schoorsteen } : {}),
      ...(it.nok ? { nok: it.nok } : {}),
      // bij een huis van een bouwstijl: welke stijl, vorm, soort, dak, steen en stand (huizen.cjs, STIJLEN)
      ...(it.stijl ? { stijl: it.stijl } : {}),
    } : { naam: null, vast: false })),
  };
  schrijfVel(vel, beschrijving);
  console.log(`${velVerslag(beschrijving)}  (${items.length} echte tegels van ${capaciteit})`);
  return beschrijving;
}

// ---------------------------------------------------------------- de huizen (huizen.cjs, ronde 4b)
//
// De huizen van de huizenbouwer, elk met een vaste opgave in huizen.cjs. Een huis kost zo'n halve
// minuut, dus ze gaan in draden tegelijk; daarom is dit het enige vel dat op zich laat wachten.
// Elk huis beslaat een rechthoek (die js/kaart.js helemaal vastzet) en draagt `deur`: de tegel voor
// zijn deur, vanaf de achterste tegel van de voet. Daar gaan de bewoners heen (T.deurVan).
async function bouwHuizenVel() {
  // Eerst of alles op het vel past, vóór een half uur renderen (4 okt: dat ging één keer pas aan het eind mis).
  const { capaciteit, kolommen } = VELCONFIG.huizen;
  const nodig = nodigeCapaciteit(TEGELS, 'huizen', Object.keys(HZ.HUIZEN), kolommen);
  if (nodig > capaciteit) throw new Error(`huizen: ${nodig} vakken nodig, maar de vaste capaciteit is ${capaciteit} — verhoog VELCONFIG.huizen.capaciteit`);
  const t0 = Date.now();
  const lijst = await HZ.renderHuizen();
  const items = lijst.map((r) => ({ naam: r.naam, vast: true, plaat: r.plaat, anker: r.anker, beslaat: r.voet, deur: r.deur, ramen: r.ramen, schoorsteen: r.schoorsteen, nok: r.nok, stijl: HZ.HUIZEN[r.naam].stijl }));
  console.log(`  huizen: ${lijst.length} in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  // Een huis van een bouwstijl moet zijn deur hebben aan de kant die zijn stand zegt (huizen.cjs, STANDEN): het spel
  // kiest er de stand mee die zijn deur naar de weg keert.
  const kantVan = ([b, d], [dx, dy]) => (dy === d ? 'z' : dx === b ? 'o' : dy === -1 ? 'n' : dx === -1 ? 'w' : '?');
  const scheef = items.filter((i) => i.stijl && kantVan(i.beslaat, i.deur) !== i.stijl.stand);
  for (const i of scheef) console.warn(`  LET OP: ${i.naam} heeft zijn deur aan de kant ${kantVan(i.beslaat, i.deur)}, niet ${i.stijl.stand}`);
  return bouwLosVel('huizen', items, 'De huizen van de huizenbouwer (huizen.cjs): de hutten, huizen en boerderijen van ronde 4b en het huis van de schout, en de huizen van de bouwstijlen in hun vier standen. Zet ze neer op de tegel linksboven van hun voet ("beslaat"); "deur" is de tegel voor de deur, gerekend vanaf die tegel.');
}

// ---------------------------------------------------------------- een vel dat elders gemaakt is
//
// De randtegels, oevers en de brug komen uit een eigen script (randtegels.cjs, npm run
// randtegels): die worden heel anders gebouwd dan de rest — per overgang tussen twee grondsoorten,
// met terreinsets (wangsets) erbij waaruit Tiled zelf de goede hoektegel kiest. Dat script
// schrijft tegels/rand.png en tegels/rand.tsx, maar niet tegels.json, en juist dat laatste is wat
// het spel leest (js/kaart.js, js/sprites.js).
//
// Daarom lezen we hier de .tsx in plaats van opnieuw te renderen. Dat heeft twee voordelen: de
// tekening staat maar op één plek, en `npm run tiled` hoeft geen minuten renderwerk over te doen
// voor een vel dat niet van hem is. Wat in de .tsx staat is precies wat tegels.json nodig heeft:
// de maten, en per tegel `naam`, `vast`, `groep` en eventueel `beslaat`.
function attr(tekst, naam) {
  const m = tekst.match(new RegExp(`${naam}="([^"]*)"`));
  return m ? m[1] : null;
}
const XML_UIT = (s) => String(s).replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');

// De eigenschappen van één <tile>-blok, in dezelfde vorm als de tiles hierboven.
function tileUitXml(blok) {
  const t = { naam: null, vast: false };
  for (const m of blok.matchAll(/<property\s+([^>]*?)\/>/g)) {
    const naam = attr(m[1], 'name');
    const waarde = XML_UIT(attr(m[1], 'value') || '');
    if (naam === 'naam') t.naam = waarde;
    else if (naam === 'vast') t.vast = waarde === 'true';
    else if (naam === 'groep') t.groep = waarde;
    else if (naam === 'beslaat') t.beslaat = waarde.split('x').map(Number);
    else if (naam === 'staat_op_erf') t.staat = waarde;
  }
  return t;
}

function leesVelUitTsx(veldNaam) {
  const pad = path.join(TEGELS, `${veldNaam}.tsx`);
  if (!fs.existsSync(pad)) {
    console.warn(`  overgeslagen: ${veldNaam}.tsx bestaat nog niet — draai eerst npm run ${veldNaam === 'rand' ? 'randtegels' : veldNaam === 'kust' ? 'randtegels kust' : veldNaam}`);
    return null;
  }
  const xml = fs.readFileSync(pad, 'utf8');
  const kop = xml.slice(xml.indexOf('<tileset'), xml.indexOf('>', xml.indexOf('<tileset')));
  const beeld = xml.slice(xml.indexOf('<image'), xml.indexOf('>', xml.indexOf('<image')));
  const offset = xml.includes('<tileoffset') ? xml.slice(xml.indexOf('<tileoffset'), xml.indexOf('>', xml.indexOf('<tileoffset'))) : null;
  const tiles = [];
  // De id's staan in de .tsx op volgorde en zonder gaten (zo schrijft elk van onze scripts ze),
  // maar we zetten elke tegel toch op zijn eigen id neer: een gat zou anders alles opschuiven.
  for (const m of xml.matchAll(/<tile\s+id="(\d+)"[^>]*>([\s\S]*?)<\/tile>/g)) {
    tiles[Number(m[1])] = tileUitXml(m[2]);
  }
  const aantal = Number(attr(kop, 'tilecount')) || tiles.length;
  // Een gat (geen <tile>-blok voor dit id) is een lege cel, geen tegel die toevallig "de naam
  // van het vel" draagt: anders zou naar-kaarten.cjs se wachter zo'n lege cel niet herkennen.
  for (let i = 0; i < aantal; i++) if (!tiles[i]) tiles[i] = { naam: '', vast: false };
  const vel = {
    naam: veldNaam,
    bestand: attr(beeld, 'source'),
    breedte: Number(attr(beeld, 'width')),
    hoogte: Number(attr(beeld, 'height')),
    tegelB: Number(attr(kop, 'tilewidth')),
    tegelH: Number(attr(kop, 'tileheight')),
    aantal,
    kolommen: Number(attr(kop, 'columns')) || aantal,
    tileoffset: offset ? [Number(attr(offset, 'x')), Number(attr(offset, 'y'))] : null,
    objectalignment: kop.includes('objectalignment="bottom"'),
    tiles,
  };
  console.log(`${veldNaam}.tsx  ${vel.breedte}×${vel.hoogte}  (${aantal} tegels, ingelezen — gemaakt door een eigen script)`);
  return vel;
}

// ---------------------------------------------------------------- rand: vaste capaciteit zonder
// randtegels.cjs aan te raken
//
// rand.tsx/rand.png komen uit randtegels.cjs (npm run randtegels), een eigen script met een eigen
// agent (zie hierboven). Zijn VOLGORDE ligt al vast zolang niemand de lijsten SOORTEN/PAREN daar
// herschikt: elke terreinset levert zijn veertien hoekcombinaties in een vaste volgorde, en een
// nieuw paar of een nieuwe grondsoort komt er vanzelf aan het EIND van tiles/platen bij (zie
// bouw() daar). Wat randtegels.cjs niet uit zichzelf doet, is een vaste CAPACITEIT: tilecount is
// er elke keer precies het echte aantal. Dat vullen we hier aan — na het lezen, en zonder
// randtegels.cjs zelf aan te raken — door rand.tsx en rand.png een stuk te vergroten met lege
// cellen.
//
// rand is verreweg het grootste vel en groeit het snelst: één nieuw PAREN-paar levert in één klap
// 14 hoekcombinaties × 4 varianten = 56 tegels op. Met de huidige vier grondsoorten liggen er nog
// twee paren niet vast (zandpad-water, kasseien-water: samen 112), en een hele nieuwe grondsoort
// met volledige koppeling aan de bestaande vier kost in één klap 4×56+8 = 232. 600 is dus geen
// overdreven marge: dat is nog niet eens twee van zulke stappen boven de huidige 262.
const RAND_CAPACITEIT = 600;
// De grond van het eiland (tegels/kust.tsx): de zee, het strand, het veen en het broek. Een kaart zet hem na de
// andere vellen (de maker na rand: js/maker.js), dus groeit hij, dan schuift er niets op.
const KUST_CAPACITEIT = 600;

// Precies de omkering van K.png (kern.cjs): 8-bit RGBA, geen filter (filterbyte 0), één IDAT. We
// lezen geen pixel uit om te "begrijpen" wat erop staat — de bestaande rijen kopiëren we als ruwe
// bytes één-op-één mee naar een groter canvas, en de nieuwe rijen blijven overal nul. Dat is
// precies hoe K.png een lege cel van een Plaat toch al zou wegschrijven (Plaat.rgba: een cel
// zonder tekening is (0,0,0,0)), dus verandert er aan bestaande tegels pixel voor pixel niets. De
// twee kleine helpers hieronder (crc32/chunk) staan ook al in kern.cjs, maar daar niet naar
// buiten toe geëxporteerd — hier gekopieerd om kern.cjs niet aan te hoeven raken.
const PNG_CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function pngCrc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = PNG_CRC[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(pngCrc32(td));
  return Buffer.concat([len, td, crc]);
}

// Vergroot een PNG die door K.png geschreven is tot `nieuweHoogte` (méér rijen, zelfde breedte),
// met alleen doorzichtige pixels erbij. Gooit een duidelijke fout in plaats van te gokken zodra
// het bestand er niet exact zo uitziet als verwacht (bijvoorbeeld met de hand bewerkt, of met een
// ander programma dan K.png weggeschreven).
function vergrootPngHoogte(pngPad, breedte, huidigeHoogte, nieuweHoogte) {
  const buf = fs.readFileSync(pngPad);
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error(`${pngPad}: geen PNG (verkeerde signature)`);
  let o = 8;
  let ihdr = null;
  const idatDelen = [];
  while (o < buf.length) {
    const len = buf.readUInt32BE(o);
    const type = buf.toString('ascii', o + 4, o + 8);
    const data = buf.subarray(o + 8, o + 8 + len);
    if (type === 'IHDR') ihdr = data;
    else if (type === 'IDAT') idatDelen.push(data);
    o += 12 + len;
  }
  if (!ihdr) throw new Error(`${pngPad}: geen IHDR-blok gevonden`);
  const breedteInBeeld = ihdr.readUInt32BE(0);
  const hoogteInBeeld = ihdr.readUInt32BE(4);
  const bitdiepte = ihdr[8];
  const kleurtype = ihdr[9];
  if (breedteInBeeld !== breedte || hoogteInBeeld !== huidigeHoogte) {
    throw new Error(`${pngPad}: is ${breedteInBeeld}×${hoogteInBeeld}, verwacht ${breedte}×${huidigeHoogte} — draai npm run randtegels opnieuw`);
  }
  if (bitdiepte !== 8 || kleurtype !== 6) {
    throw new Error(`${pngPad}: bitdiepte ${bitdiepte} kleurtype ${kleurtype}, verwacht 8-bit RGBA zoals K.png dat schrijft — is dit met de hand bewerkt?`);
  }
  const raw = zlib.inflateSync(Buffer.concat(idatDelen));
  const rijLengte = breedte * 4 + 1;
  if (raw.length !== rijLengte * huidigeHoogte) {
    throw new Error(`${pngPad}: ${raw.length} bytes uitgepakt, verwacht ${rijLengte * huidigeHoogte}`);
  }
  for (let y = 0; y < huidigeHoogte; y++) {
    if (raw[y * rijLengte] !== 0) throw new Error(`${pngPad}: rij ${y} heeft filterbyte ${raw[y * rijLengte]}, verwacht 0 — dit komt niet zomaar uit K.png`);
  }
  const nieuw = Buffer.concat([raw, Buffer.alloc(rijLengte * (nieuweHoogte - huidigeHoogte))]);
  const nieuweIhdr = Buffer.from(ihdr);
  nieuweIhdr.writeUInt32BE(nieuweHoogte, 4);
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    pngChunk('IHDR', nieuweIhdr),
    pngChunk('IDAT', zlib.deflateSync(nieuw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ]);
  fs.writeFileSync(pngPad, png);
}

// Vult tegels/rand.tsx (en zo nodig rand.png) aan met lege cellen tot RAND_CAPACITEIT. Haalt
// eerst een eerdere opvulling weg (aan de lege naam te herkennen) en telt dan de echte tegels
// opnieuw: zo werkt dit ook goed na een nieuwe npm run randtegels (dan is er geen eerdere
// opvulling) en na een latere wijziging van RAND_CAPACITEIT zelf. Net zo de grond van het eiland,
// tegels/kust.tsx (KUST_CAPACITEIT; werklijst vraag 117, B van 2a), uit `npm run randtegels kust`.
function padGrondVel(naam, capaciteit) {
  const tsxPad = path.join(TEGELS, `${naam}.tsx`);
  const pngPad = path.join(TEGELS, `${naam}.png`);
  if (!fs.existsSync(tsxPad) || !fs.existsSync(pngPad)) return; // leesVelUitTsx klaagt hier al over

  const legeTileRe = / <tile id="\d+"><properties><property name="naam" value=""\/><property name="vast" type="bool" value="false"\/><\/properties><\/tile>\n/g;
  let xml = fs.readFileSync(tsxPad, 'utf8').replace(legeTileRe, '');

  const nEcht = (xml.match(/<tile id="\d+">/g) || []).length;
  const kop = xml.slice(xml.indexOf('<tileset'), xml.indexOf('>', xml.indexOf('<tileset')));
  const kolommen = Number(attr(kop, 'columns'));
  const beeldKop = xml.slice(xml.indexOf('<image'), xml.indexOf('>', xml.indexOf('<image')) + 1);
  const breedte = Number(attr(beeldKop, 'width'));
  const huidigeHoogte = Number(attr(beeldKop, 'height'));

  if (nEcht > capaciteit) {
    fs.writeFileSync(tsxPad, xml); // wel de weggehaalde oude opvulling laten staan weg
    console.warn(`  let op: ${naam}.tsx heeft ${nEcht} echte tegels, meer dan de capaciteit (${capaciteit}) in naar-tiled.cjs — verhoog die eerst, anders schuiven de vellen na ${naam} in een kaart op`);
    return;
  }

  let nieuweTiles = '';
  for (let id = nEcht; id < capaciteit; id++) {
    nieuweTiles += ` <tile id="${id}"><properties><property name="naam" value=""/><property name="vast" type="bool" value="false"/></properties></tile>\n`;
  }
  const wangsetsAt = xml.indexOf(' <wangsets>');
  if (wangsetsAt < 0) throw new Error(`${tsxPad}: geen <wangsets> gevonden — is dit nog wel het bestand dat randtegels.cjs schrijft?`);
  xml = xml.slice(0, wangsetsAt) + nieuweTiles + xml.slice(wangsetsAt);
  xml = xml.replace(/tilecount="\d+"/, `tilecount="${capaciteit}"`);

  const rijenNodig = Math.ceil(capaciteit / kolommen);
  const nieuweHoogte = rijenNodig * 32;
  xml = xml.replace(/(<image[^>]*\bheight=")\d+(")/, `$1${nieuweHoogte}$2`);
  fs.writeFileSync(tsxPad, xml);

  if (nieuweHoogte > huidigeHoogte) vergrootPngHoogte(pngPad, breedte, huidigeHoogte, nieuweHoogte);
  console.log(`${naam}.tsx aangevuld: ${nEcht} echte tegels, lege cellen tot ${capaciteit} (${kolommen}×${rijenNodig}, ${naam}.png nu ${breedte}×${nieuweHoogte})`);
}

// ---------------------------------------------------------------- alles samen, en het zijspoor
// voor js/kaart.js: welke eigenschappen elke tegel heeft, zonder dat het spel de .tsx (xml) hoeft
// te lezen. tegels.json is de bron, tegels.js dezelfde inhoud als gewoon script (zie
// beelden/beschrijving.js): dat werkt ook als index.html los open staat, want fetch mag dan niet.
//
// tegels.json draagt ook `anker`: het punt in een cel dat op T.naarScherm(x, y) van de tegel komt
// te liggen, in dezelfde vorm als beelden/beschrijving.json. Daarmee kan js/sprites.js de vellen
// tekenen zonder Tiled se tileoffset-rekenwerk na te doen. Voor grond is dat het midden van de
// ruit, voor een model (boom, struikje) zijn voetpunt: T.naarScherm(x, y) is waar zijn stam de
// grond raakt. Voor een gebouw, de toren of iets van het erf — alles met een "beslaat" — is het de
// achterste voethoek: de tegel die je in Tiled aanklikt is de achterste van de voet, en die hoek
// ligt een halve tegel (16 px) hoger dan het midden van die tegel, vandaar de +16 bij
// `bouwGebouwenVel` en `bouwErfVel`. Eén afspraak voor alles met een voet, op één plek per vel
// gezet — niet hier met een uitzondering per naam.

// Welke vellen maken we deze keer? Zonder argumenten allemaal; met `node naar-tiled.cjs erf` alleen
// dat vel, en dan blijft de rest van tegels.json staan. Dat scheelt minuten als er maar aan één
// ding gewerkt wordt.
const GEVRAAGD = process.argv.slice(2).filter((a) => !a.startsWith('-'));
const wil = (naam) => !GEVRAAGD.length || GEVRAAGD.includes(naam);

// rand komt uit randtegels.cjs; hier vullen we hem aan tot RAND_CAPACITEIT (zie padGrondVel
// hierboven) en lezen we daarna pas zijn .tsx in, zodat tegels.json de aangevulde staat krijgt.
// Net zo kust, de grond van het eiland (`npm run randtegels kust`).
if (wil('rand')) padGrondVel('rand', RAND_CAPACITEIT);
if (wil('kust')) padGrondVel('kust', KUST_CAPACITEIT);

(async () => {
  const velden = [
    wil('grond') && bouwGrondVel(),
    wil('rand') && leesVelUitTsx('rand'),
    wil('kust') && leesVelUitTsx('kust'),
    wil('bomen') && bouwModelVel('bomen', BOMEN_MET_VORMEN, BOMEN_VAST),
    wil('begroeiing') && bouwModelVel('begroeiing', BEGROEIING, (n) => !!BEGROEIING_VAST[n]),
    wil('gebouwen') && bouwGebouwenVel(),
    // Het vel van de toren (tegels/toren.png) ging op 25 sep weg met het oude spel: geen kaart
    // gebruikte hem nog. Het model staat nog in toren.cjs, en het erf hieronder meet zich eraan.
    wil('erf') && bouwErfVel('erf', Es.ERF_TEGELS, 'Wat er op het erf van de toren staat: het schuurtje, de put, de houtstapel, de waslijn, de moestuin, de bank en de lantaarn. Zet ze neer op de tegel linksboven van hun voet ("beslaat"); kaarten/erf.tmj doet dat al vanzelf uit erf-scene.cjs.'),
    wil('tuin') && bouwTuinVel(),
    wil('huizen') && (await bouwHuizenVel()),
  ].filter(Boolean);

  // Het bestaande tegels.json blijft staan voor de vellen die deze keer niet aan de beurt waren.
  let TEGELS_JSON = {};
  try {
    TEGELS_JSON = JSON.parse(fs.readFileSync(path.join(TEGELS, 'tegels.json'), 'utf8'));
  } catch (e) {
    /* nog niets: dan bouwen we hem van voren af aan op */
  }
  for (const v of velden) {
    // Een vel met een eigen voetpunt- of hoekafspraak (bomen, begroeiing, gebouwen, toren, erf) zet
    // `anker` zelf op de bouwfunctie hierboven; hier valt het alleen terug op het midden van de cel
    // (grond) of op tileoffset zonder verdere correctie (voetpunt: het model hangt al op het midden
    // van zijn tegel, dat is geen achterste hoek en heeft dus ook geen +16 nodig, zie bouwModelVel).
    // per lokaal tegel-id (0, 1, 2, …, zoals in de .tsx) dezelfde eigenschappen als daar.
    // En bij een huis de ramen die je ziet (huizen.cjs, ramenVan), zijn bouwstijl (STIJLEN) en waar zijn rook uitkomt (rookVan:
    // schoorsteen of nok, vraag 145, 3): alleen in dit bestand, niet in de .tsx.
    const eigenschappen = (t) => ({ naam: t.naam, vast: t.vast, beslaat: t.beslaat || null, groep: t.groep || null, staat: t.staat || null, deur: t.deur || null, doos: t.doos || null, ...(t.vorm ? { vorm: t.vorm } : {}), ...(t.ramen ? { ramen: t.ramen } : {}), ...(t.stijl ? { stijl: t.stijl } : {}), ...(t.schoorsteen ? { schoorsteen: t.schoorsteen } : {}), ...(t.nok ? { nok: t.nok } : {}) });
    // Een ingepakt vel (schrijfVel) zegt per tegel waar hij staat: `cel` [x, y, b, h] op het vel, en `anker`, het punt
    // in die cel dat op het midden van de tegel komt. Een raster (de grond) zegt het één keer voor het hele vel.
    // Een vel per tekening (PER_TEKENING) heeft geen vel van zichzelf: elke tegel zegt ook in welk bestand hij staat.
    if (v.perTekening) {
      TEGELS_JSON[v.naam] = {
        tsx: `tegels/${v.naam}.tsx`,
        ingepakt: true,
        perTekening: true,
        tiles: v.tiles.map((t) => ({ ...eigenschappen(t), ...(t.bestand ? { bestand: `tegels/${t.bestand}`, cel: t.cel, anker: t.anker } : {}) })),
      };
      continue;
    }
    TEGELS_JSON[v.naam] = v.ingepakt ? {
      tsx: `tegels/${v.naam}.tsx`,
      bestand: `tegels/${v.bestand}`,
      breedte: v.breedte,
      hoogte: v.hoogte,
      ingepakt: true,
      tiles: v.tiles.map((t) => ({ ...eigenschappen(t), ...(t.cel ? { cel: t.cel, anker: t.anker } : {}) })),
    } : {
      tsx: `tegels/${v.naam}.tsx`,
      bestand: `tegels/${v.bestand}`,
      breedte: v.breedte,
      hoogte: v.hoogte,
      tegelB: v.tegelB,
      tegelH: v.tegelH,
      kolommen: v.kolommen || v.aantal,
      tileoffset: v.tileoffset,
      objectalignment: v.objectalignment,
      anker: rasterAnker(v),
      tiles: v.tiles.map(eigenschappen),
    };
  }
  const json = JSON.stringify(TEGELS_JSON, null, 1);
  fs.writeFileSync(path.join(TEGELS, 'tegels.json'), json + '\n');
  fs.writeFileSync(
    path.join(TEGELS, 'tegels.js'),
    '// Gemaakt door gereedschap/pixelart/naar-tiled.cjs — niet met de hand bijwerken.\n' +
      '// Dezelfde inhoud als tegels.json, als script, zodat file:// het ook kan lezen (zie js/kaart.js).\n' +
      '(function (T) {\n  T.TEGELS = ' +
      json.replace(/\n/g, '\n  ') +
      ';\n})(globalThis.Spel = globalThis.Spel || {});\n',
  );

  let totaal = 0;
  for (const f of fs.readdirSync(TEGELS)) {
    const p = path.join(TEGELS, f);
    if (fs.statSync(p).isDirectory()) continue;
    totaal += fs.statSync(p).size;
  }
  console.log(`tegels/ klaar: ${velden.length} vel(len) opnieuw, ${Math.round(totaal / 1024)} kB`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
