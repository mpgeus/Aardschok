# Aardschok art bible

Versie 1, 30 okt 2026, bij vraag 192. De verhouding is gekozen (A). **De rest wacht nog op Marcels oordeel**, in
`kwaliteitsrapport.md`. Hoe de stijl dichter bij de plaat komt (geschilderd licht, verf en een AI-laag per richting), staat als proef in `methodeproef.md`; dat is nog niet de productie.

Referenties, in volgorde van gewicht: `referentie/aardschok-speerman-draai-vrij.png` (31 okt, de bron om in 3D van te bouwen: één pose rondom, `hunyuan/PLAAT-EISEN.md`), `referentie/aardschok-speerman-detail.png` (leidend voor de stijl tot die dag),
`aardschok-speerman-acht.png`, `aardschok-personages.png`, `aardschok-stijlplaat.png`, `aardschok-stijlplaat-2.png` en `aardschok-dorp.png`
(de wereld). De tekst is Marcels specificatie van 30 okt. Inspiratie: The Settlers II: 10th Anniversary. We kopiëren niets.

## De stijl in één zin

Compacte, kleurrijke figuren uit gesculpte 3D-vormen, met schone geschilderde materialen, warm licht van linksboven, en leesbaar op
80 pixels. Marcel (30 okt): "Het mag meer 'cartoony'". We gaan niet terug naar de semi-realistische figuren.

## Wat de stijl maakt

- **Grote vormen boven detail.** Op 80 pixels is 1 pixel bijna 2 cm: wat kleiner is, bestaat niet. De speerschacht is 6 cm dik, de
  gesp 13 cm breed.
- **Vijf hoofdvormen in het silhouet:** helm, schouders, romp, benen, laarzen.
- **Schone kleurvlakken** met weinig ruis. Korrel en vlekken zijn gedempt, en de vorm geeft het licht.
- **Lagen die los lezen**, door contactschaduw en een dunne donkere lijn op spelmaat.
- **Geen vuil op het gezicht:** de contactschaduw telt daar minder, en de helm werpt geen slagschaduw.

## Verhoudingen

**Gekozen: A, de plaat** (Marcel, 30 okt: "Laten we A proberen"). De specificatie zegt hoofd 24 procent, de plaat zo'n 33; zo koos hij
tussen de twee (`bewijs/blockout-verhoudingen.png`). Alle drie komen uit hetzelfde model (`figuur.py`, `kop=` en `benen=`):

| | Lengte | Hoofd met helm | Heup tot grond | Wat het is |
|---|---|---|---|---|
| **A** | **1,39 m** | **32%** | **30%** | **de plaat: de standaard** |
| C | 1,54 m | 28% | 38% | het midden |
| B | 1,67 m | 24% | 44% | de specificatie |

Gelijk in alle drie:
- schouders 0,67 m breed (specificatie 0,57 tot 0,62), romp met tabberd 0,51 m (0,44 tot 0,49);
- handen 1,5 keer gewoon (10 tot 20 procent groter), laarzen 0,38 m lang (0,29 tot 0,32): groter dan de specificatie, zoals de plaat;
- speer 1,3 keer de lengte.

## Links en rechts

Altijd **vanuit de figuur**. De figuur kijkt in het model naar -Y; zijn linkerkant is +X. De speer zit altijd in de rechterhand, zonder
wisselen, ook al wisselen de platen per richting.

De tabberd is gevierendeeld: rechterborst blauw, linkerborst geel, rechterheup geel, linkerheup blauw. De kleur hangt aan de plek op het
lijf, dus het achterpand volgt dezelfde kant.

## Materialen

Eén shader (`materialen.py`), met per materiaal een recept in `materialen.json`: basis, schaduw, licht, vlek, korrel, ruwheid, metaal, stof en spiegeling. De
verf staat op de punten van de mesh, in de ruimte van het model, dus hij schuift niet mee als de figuur beweegt.

- **In lagen:** grote vlekken, de korrel, het licht over de hele vorm (boven lichter, onder donkerder, in de eigen licht- en schaduwkleur), dan holten en randen.
- **Kleur op het scherm, niet in het recept:** de kleuren zijn geijkt op de plaat (`oorzaak.py`), want licht en spiegeling kosten verzadiging. De kleuren uit de specificatie waren de start.
- **Spiegeling per materiaal:** stof bijna geen (dat haalt de waas weg), leer en staal wel.
- **Textuur alleen waar het wat oplevert:** tot 4096 was op sprites en op deze schaal niet te zien (`kwaliteitsronde.md`); de GLB heeft texturen, de sprites komen uit de punten.

| Groep | Materialen |
|---|---|
| Hout | `geschilderd_hout`, `verweerd_hout`, `licht_eiken`, `essenhout` |
| Leer | `donker_leer`, `licht_leer`, `handschoen`, `laars`, `omslag`, `riem`, `buidel`, `zool` |
| Stof | `bruine_watten`, `kap`, `blauw_geverfd`, `geel_geverfd`, `hozen` |
| Metaal | `gesmeed_ijzer`, `mat_staal` |
| Bouw en land | `natuursteen`, `kalkpleister`, `stro`, `dakpannen`, `gras`, `aarde` |
| Figuur | `huid`, `haar` |

## Licht

Uit `instellingen.json`, één opstelling voor alles (`licht.py`):

- warme zon van linksboven; meer van opzij kost kleur en maakt het gezicht modderig (gemeten, `kwaliteitsronde.md`);
- een zwak glanslicht dat alleen in de glans telt, zodat staal staal blijft zonder zilveren bol;
- een hemel die boven koel is en onder warm teruggekaatst, dus de schaduw blijft kleurig en nooit zwart;
- geen bloom;
- view transform Standard, zodat de kleuren blijven wat ze zijn.

De camera staat stil en de figuur draait, dus het licht valt in elke richting van linksboven in beeld.

## Camera

Orthografisch. Getest op spelmaat (`bewijs/` en `elevatie.py`): 20, 25, 30, 35,264 en 40 graden.

| Hoek | Oordeel op 80 pixels |
|---|---|
| 20 tot 25 | het gezicht het duidelijkst, en het dichtst bij de platen; past niet bij de tegels |
| **30** | **gekozen voor het spel**: past exact bij de tegels van 2:1, en het gezicht is nog te lezen |
| 35,264 | wat gedrukter, en past niet op de tegels |
| 40 | de helm drukt de figuur samen; afgewezen |

Voor de beoordeling van het model: 12 graden, zoals de specificatie vraagt (10 tot 15).

## Richtingen en anker

Acht richtingen, op het scherm: Z, ZW, W, NW, N, NO, O, ZO. De figuur draait precies 45 graden per stap. Het anker is de oorsprong
tussen de voeten; hij ligt in elk beeld op dezelfde pixel, omdat camera en vak vastliggen.

## Van model tot sprite

1. `figuur.py` bouwt het model: onderdelen uit afstandsvelden, verf, gewichten, skelet.
2. `render.py` rendert in de vaste opstelling, plus een ID-beeld per beeld.
3. `vel.py` verkleint, werkt af op spelmaat (scherpte, kleur, lijnen, rand) en maakt vel en JSON.

Automatisch: alles hierboven. **Menselijk oordeel blijft nodig** voor de vorm, de uitstraling en de beweging. Een technisch geslaagde
render is geen artistiek geslaagde render.

## Nog vast te leggen

Gebouwen en terreintegels volgen dezelfde camera, hetzelfde licht en dezelfde materialen, maar zijn nog niet gemaakt.
