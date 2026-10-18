# De proef met één wagenwiel: AI-texturen in onze eigen renderer

Technische evaluatie van Claude, 18 okt 2026, op Marcels derde opdracht (`opdracht-comfyui.md`; werklijst vraag 180).
De platen staan in `gereedschap/pixelart/uit/wielproef/` (niet in git; opnieuw met `node gereedschap/pixelart/wielproef.cjs`,
zo'n halve minuut), de getallen in `uit/wielproef/metingen.json`.

## Wat er gebouwd is

- **`kern.cjs`, optioneel:** een materiaal met een textuur (`mat.textuur`) krijgt per pixel zijn kleur op de plek in de
  rusthouding van het onderdeel, met de normaal in rust, belicht met het licht dat de renderer al uitrekent (`stap`
  tussen `lo` en `hi`), en de vlag `VLAG.RGB`. `kleurBeeld(B, { palet })` maakt het beeld: de gewone pixels precies zoals
  `kwantiseer` en `Plaat`, de textuurpixels naar een palet per ding. Wat na het tekenen met de stap gebeurt (de lamp in
  `belicht`, een binnennaad in `omlijn`), gaat als factor over de kleur. Op verzoek (`o.rust`) bewaart `tekenModel` per
  pixel de plek in rust, om te meten. Zonder textuur loopt geen van die regels.
- **`textuur.cjs`, het herbruikbare materiaalsysteem:** texturen met mip-niveaus (bilineair, herhalend); afwikkelingen op
  het onderdeel (`rond` om een as, `langs` een as, `vlak`, en triplanair als terugval), met de afspraak dat de nerf
  horizontaal loopt (u) en dat een gesloten richting zijn omtrek opgeeft, zodat er een geheel aantal herhalingen rondom
  past (geen naad); `textuurMateriaal` met de dichtheid (texels per eenheid), de toon (het gemiddelde naar een
  doelkleur), en de mip-keuze naar hoe schuin een vlak staat; en `palet` (median cut, één palet over alle beelden).
- **Het wiel van de ossenkar** draagt nu zijn afwikkelingen (`uv` op elk onderdeel: de velg, de band, de naaf en de ring
  rond, de spaken langs). Het oude wiel is verder gelijk; het nieuwe wordt in rust gebouwd en gedraaid met
  `houding.cjs` (`beweging`, `beweegDelen`), zodat elk punt zijn plek in rust houdt (`terug`).
- **De texturen** (`gereedschap/ai/textuur-ai.cjs`, SDXL in ComfyUI; `gereedschap/pixelart/texturen/hout.png` en
  `ijzer.png`, met hun instellingen ernaast): een foto-achtige opname van het materiaal (een eerste ronde als "game
  texture" gaf versiering), naadloos gemaakt per as, de nerf zo nodig een kwartslag gedraaid, 512 bij 512.
- **`gelijk.cjs`:** een nulmeting van 65 bestaande beelden (de ossenkar uit acht richtingen, stilstaand en lopend, de heer,
  de soldaat, de os, de koe, het paard), om na elke wijziging aan de renderer te vergelijken.

## De eisen, een voor een

| | Eis | Uitkomst |
|---|---|---|
| 1 | De bestaande renderer behouden, RGB optioneel | Ja: alleen een materiaal met een textuur gebruikt het nieuwe pad. |
| 2 | De rusthouding voor de afwikkeling | Ja: `naarDeel`/`terug`, het wiel gedraaid met `houding.cjs`. |
| 3 | Een houttextuur en een metaaltextuur | Ja, uit SDXL. Het hout is goed (natuurlijke nerf); het ijzer is matig (vage vlekken). |
| 4 | Acht richtingen en meer standen | 8 richtingen × 9 standen (de 8 beelden van het lopen en een volle slag) × 5 varianten = 360 beelden in 34 s. |
| 5 | Zit het patroon vast | Ja: de ruitjes draaien met het wiel mee, en de meting hieronder. |
| 6 | Op de maat van het spel | De plaat `spelmaat.png`: zie de bevindingen. |
| 7 | Flikkeren, vervorming, naden, aliasing | Geen naden (rondom een geheel aantal herhalingen), geen zichtbare vervorming in de ruitjes, de mip-niveaus halveren het verspringen op dezelfde plek. |
| 8 | Tegen de procedurele materialen | De platen naast elkaar, en de meting. |
| 9 | De oude renderer pixel voor pixel gelijk | Ja: alle 65 beelden van de nulmeting gelijk, na elke wijziging opnieuw gemeten. |

## De metingen

"Vastzitten": op de zijvlakken van het wiel (waar het licht bij het draaien gelijk blijft) het gemiddelde kleurverschil van
dezelfde plek op het wiel over de acht standen, met de plek los van de renderer uitgerekend (de plek in de wereld terug
naar de kar, en terug gedraaid over de hoek van die stand). Lager is vaster. "Verspringen": het gemiddelde kleurverschil
per pixel tussen twee opeenvolgende standen (het wiel draait, dus nooit nul; het zegt hoe onrustig het is).

| Variant | Vastzitten | Volle slag gelijk | Verspringen | Silhouet tegen het oude wiel |
|---|---|---|---|---|
| oud (procedureel hout) | 4,41 | 100% | 10,5 | — |
| AI-texturen zonder rusthouding (glijdend) | 3,44 | 100% | 10,6 | 0% anders |
| **nieuw (AI-texturen, vast)** | **1,21** | **100%** | 13,6 | **0% anders** |
| nieuw zonder mip-niveaus | 4,15 | 100% | 16,3 | 0% anders |
| controle (ruitjes) | 2,86 | 100% | 27,1 | 0% anders |

- **Vast:** met dezelfde textuur en hetzelfde contrast is "nieuw" bijna drie keer zo vast als "glijdend" (1,21 tegen 3,44):
  dat is het effect van de rusthouding alleen. Wat er overblijft, komt van het monsteren op een iets andere plek binnen
  de pixel en van het palet. De ruitjes laten het met het oog zien: de vakjes draaien met de spaken mee.
- **Volle slag:** in elke variant precies hetzelfde beeld als stand 0.
- **Silhouet:** het nieuwe wiel (in rust gebouwd en gedraaid) is pixel voor pixel het silhouet van het oude.
- **Aliasing:** zonder mip-niveaus zit de textuur net zo goed vast, maar een plek verspringt dan van kleur (4,15 tegen
  1,21) en het beeld wordt onrustiger (16,3 tegen 13,6): de mip-niveaus zijn nodig.
- **Onrust:** "nieuw" verspringt meer dan het oude wiel (13,6 tegen 10,5), omdat de AI-textuur meer variatie heeft dan
  het vlakke procedurele hout, en die variatie draait mee. Dat is geen flikkeren maar beweging; de bewegende beelden
  (`draaien-*.png`) laten het zien.

## Bevindingen

1. **De techniek werkt.** Een AI-textuur zit in onze eigen renderer vast aan het oppervlak, in alle richtingen en
   standen, zonder naden en zonder dat het silhouet of de oude kunst verandert.
2. **Op de maat van het spel is een wiel klein.** Een spaak is twee à drie pixels breed: daar blijft vooral de kleur
   over, met een beetje variatie; op de velg zie je de nerf vergroot net, op spelmaat nauwelijks. Een textuur loont het
   meest op **grote vlakken**: de planken van de bak, de huid van de os, het zeil, de zakken.
3. **De toon moet kloppen.** Het eerste hout was te donker en te grijs naast het warme hout van de ossenkar; met `toon`
   (het gemiddelde van de textuur naar een doelkleur) past het. Per materiaal één doelkleur, uit de goedgekeurde sprites.
4. **De textuur bepaalt de kwaliteit.** Het hout uit SDXL is goed; het ijzer niet (vage vlekken in plaats van gesmeed
   metaal). Een "game texture" vragen geeft versiering; een foto-achtige opname van het materiaal werkt beter.

## Wat nog niet is gedaan, en wat ik voorstel

- **Normaal- of hoogtekaarten** uit de textuur, zodat de nerf en de hamerslagen het licht vangen: dat geeft op spelmaat
  meer dan de kleur alleen.
- **Een beter ijzer** (een andere opdracht, of een ander model), en tegels voor de planken, de huid, het zeil en de zakken.
- **Decals**, zoals de gouden leeuw op een paneel: een textuur op één vaste plek in plaats van herhalend.
- **Daarna de os en de wagen** (stap 2 en 3 van `hybride-voorstel.md`), waar de grote vlakken zitten; de terugprojectie
  uit meesterbeelden pas na Marcels akkoord, zoals hij vroeg.
