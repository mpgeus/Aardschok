# Hunyuan3D-2mv op de speerman (31 okt 2026)

**Dit is de eerste proef, op de oude plaat.** De stand van zaken staat in `docs/art/hunyuan/`: `AUDIT.md`, `KWALITEITSRAPPORT.md`, `PRODUCTIEADVIES.md` en `PLAAT-EISEN.md`. De camerahoek van 25 graden hieronder klopt niet: de plaat staat op zo'n 20 graden.

Marcel wilde Hunyuan3D-2 op de 1080 Ti proberen. Dit is één proef: één mesh met één zaad, zonder verf en zonder skelet. Het is een technische proef van de vorm, geen afgerond karakter. De productie, V4 en D8 zijn niet aangeraakt.

Bewijs: `docs/art/bewijs/hunyuan/` (`speerman-vergelijking.png`, `invoer-vier-aanzichten.png`, `speerman-overlap.json`, `speerman-run.json`, `speerman-mesh.json`). De mesh zelf: `gereedschap/pixelart/uit/stijl/hunyuan/speerman.glb` (niet in git).

## Rechten

De publieke licentie sluit de EU, het VK en Zuid-Korea uit, ook voor de uitvoer. Marcel heeft direct contact met Tencent gehad en een mail met akkoord; **Claude heeft die mail niet gezien**. Zie `methodeproef.md`, kop 12. Komt dit in het spel, dan hoort het bij de AI-opgave op Steam.

## Hoe

- ComfyUI 0.41.0, dat het model zelf kent; geen Pinokio en geen wheels van derden. Torch 2.14 cu126 heeft 6.1 voor de 1080 Ti.
- Model: `tencent/Hunyuan3D-2mv`, `hunyuan3d-dit-v2-mv/model.fp16.safetensors`, revisie `3a761b5`, 4,93 GB, sha256 `d36f5881bcdc56726b73e517cd444c13c60732431622da7268145355c8d38e9c` (gecontroleerd na het downloaden).
- De instellingen van het eigen sjabloon van ComfyUI: 20 stappen, cfg 7,5, euler, normal, resolutie 3072, octree 256, surface net, drempel 0,6, zaad 1.
- Invoer: Z, W, N en O van de plaat op wit, met dezelfde schaal, de as in het midden en de zolen op één lijn (`hy_invoer.py`).
- Opnieuw: `bash gereedschap/blender/stijl/proef/keten_hy.sh <naam>`, als ComfyUI draait; daarna `hy_meet.py`.

## Gemeten

| | Waarde |
|---|---|
| Tijd voor de mesh | 277 s, inclusief het laden |
| Piek VRAM | 6753 MiB van de 11264, inclusief 1331 MiB voor het bureaublad |
| Piek RAM | 13,5 GB in gebruik op de hele pc, van de 23,9 |
| Mesh | 113.355 punten, 232.658 vlakken, 1 stuk, 8.614 randen niet dicht |

Silhouetoverlap zonder speer, op gelijke figuurhoogte, met het masker uit `hy_invoer.py`:

| Richting | V4, 25 graden | Hunyuan, 25 graden | Hunyuan, vlak |
|---|---|---|---|
| Z | 0,799 | **0,849** | 0,841 |
| W | 0,698 | **0,781** | 0,800 |
| N | 0,772 | 0,755 | 0,796 |
| O | 0,750 | **0,793** | 0,842 |

Op de spelcamera is Hunyuan in drie van de vier richtingen beter, in N iets slechter. Dit blijft een benadering: de plaat staat niet zuiver gedraaid, en in W en O staan de handen op de plaat voor de buik. **Overlap zegt niets over de details erbinnen.**

## Wat er te zien is

Wat goed gaat:

- De figuur klopt rondom: in Z, W, N en O is het dezelfde man.
- De speer zit in de rechterhand, ook in O, waar hij op de plaat ontbreekt.
- De vormtaal van de plaat is er: de gebogen schouders, de volle mouwen, de rok met de split, de riem met gesp, de tassen en de laarzen met omslag.
- De plaat spreekt zichzelf tegen (zie onder), en het model koos de stand van Z en N.

Wat niet goed gaat:

- **De schuine plaat zit ingebakken.** Het model leest de plaat als een vlak aanzicht. De helmrand hangt daardoor rondom af, en op 25 graden dekt die rand de ogen. Vlak bekeken lijkt de mesh sterk op de plaat, maar het spel kijkt van boven, dus dan kantelt het nog eens. **Dit is de grootste fout.**
- Het gezicht is zwak: geen baard als vorm, geen duidelijke ogen.
- Het oppervlak is hobbelig, met putjes in de naden en een rafelige omslag bij de laarzen.
- De speerpunt heeft inkepingen.

## Wat het niet is

- **Niet te animeren zoals hij is:** geen skelet en geen gewichten. De speer zit vast aan de hand, en de rok aan de benen.
- Geen UV en geen verf. De verf uit D8 past er niet zomaar op.
- Veel te zwaar om direct te gebruiken, en hij is niet dicht.

## Niet getest

Andere zaden, de turbo-versie, de textuur van Tencent, de spelmaat van 80 pixels, de spelcamera van 30 graden, een skelet, beweging, en het spel zelf.

## De plaat spreekt zichzelf tegen

Dit is geen draaiing van één pose. In Z en N houdt hij de speer opzij, in W en O staan de handen voor de buik, en in O ontbreekt de speer. Dat gold ook voor elke eerdere vergelijking met W en O.
