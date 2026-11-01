# TripoSplat op de speerman

31 okt 2026, avond. Marcel gaf de link ("Kunnen we dit proberen"), daarna de plaat met alle kanten (`referentie/aardschok-speerman-draai-alle.png`: "Dit is denk ik de beste"), en toen dezelfde figuur met de speer in de hand (`referentie/aardschok-speerman-draai-speer.png`: "Dit is voor de speerman"). Platen, film en logs staan in `docs/art/bewijs/triposplat/`; die van de plaat zonder speer in `zonder-speer/`. Begin bij `in-het-spel.png`, `spelmaat-beide.png`, `speerman-staan-lopen-steken.png` en `boogschutter-staan-lopen-schieten.png`; `geraakt-en-sterven.png` en `sterven-in-het-spel.png`; de films heten `speerman-…` en `boogschutter-…`, met `-lopen`, `-aanval`, `-geraakt` en `-sterven`.

**Hoe een speerman zijn speer houdt** (Marcel, 1 nov):

- **Staan:** in één hand, met de onderkant rustend op de grond.
- **Lopen:** met twee handen, schuin voor zich, van zijn rechtervoet naar zijn linkerschouder.
- **Steken:** hij buigt iets door, zet door, en houdt de speer met twee handen: "je kunt met 1 hand geen kracht zetten".

**Hoe een boogschutter zijn boog houdt** (Marcel, 1 nov: "Ja dat klopt"):

- **Staan en lopen:** in de linkerhand, met de arm omlaag, zoals op de plaat.
- **Schieten:** de linkerschouder naar het doel, de boog omhoog, spannen en loslaten.

## De boogschutter (1 nov)

Marcel stuurde de plaat `referentie/aardschok-boogschutter-draai.png`, en later `aardschok-boogschutter-draai-koker.png`, waarop de koker in elke richting op dezelfde schouder zit (uit GPT, met `prompt-boogschutter.txt`). De figuur komt nu uit die tweede plaat; die van de eerste staat in `splat/boog-koker-links`. Dat is de tweede figuur door deze keten: `keten_splat_vel.sh boog`, in zo'n 25 minuten tot en met de vellen. Wat voor de speerman was gebouwd, werkte meteen voor de rig en de verf. Wat hij nieuw vroeg:

- **De boog komt uit code.** De run zet hem op een verkeerde diepte, achter de arm en niet door de hand, en twee runs zetten hem niet op dezelfde plek. In elke plak is hij een los stukje naast het lijf: door die stukjes past één gladde lijn, en daaromheen gaat hij uit de wolk. Daarna komt hij als Gaussians in de hand, zodat de pees mee kan met de rechterhand.
- **De koker zit vast op de rug.** Hij hangt aan de borst, en niet aan de rok, het hoofd of de arm.
- **Schieten:** de linkerschouder naar het doel, de boog omhoog, de rechterhand naar de pees, spannen, loslaten en terug. Marcel, 1 nov: "Ja dat klopt".
- **Getest in een echt gevecht tegen rovers**, in vier richtingen, zonder consolefouten. De aanval is voor de proef alleen in de browser aangezet: het spel zet voor een schutter nog geen uitval.

Wat de tweede plaat vroeg:

- **De pijlen zijn geen helm.** De koker zit nu aan dezelfde kant als de goede kant van de helm in de run op Z. De vaste straal om de helm pakte de pijlen mee: de helmrand werd verkeerd gemeten, bij het spiegelen kwamen er witte vlekken op het staal, en de veren werden staal. Bij de boogschutter wordt de straal nu gemeten aan de kant zonder koker (16,6 cm).
- **De voorste helft van de pijlen komt uit Z.** Ze steken achter het lijf uit en vallen dus in de helft van N, en die verzint hun voorkant donker. Van voren waren de veren grijs.
- **De boog staat rechtop, en 35 graden naar buiten gedraaid.** Eerst stond hij 19 graden schuin en liep hij in ZW en W voor het been langs. Recht naar voren is hij van voren en achteren een streep, en op de plaat is hij daar juist een boog. Schietend draait hij terug naar recht vooruit.

Een run op NO, om de koker op de goede schouder te krijgen, viel eerder al af: bij een schuin aanzicht kiest het model zelf hoe de figuur staat, en achter op zijn hoofd verscheen een gezicht. Een betere plaat was hier de goedkoopste oplossing.

Gemeten bij de boogschutter: staan 260 × 792 (196 KB; cel 65 × 99), lopen 852 × 792 (709 KB; cel 71 × 99), aanval 1350 × 920 (616 KB; cel 135 × 115).

## Geraakt worden en sterven (1 nov)

De regels komen uit de ronde van 26 okt (`gereedschap/blender/bakken.py`). Marcel toen: "Geraakt worden is akkoord", en voor sterven "op zn knieën valt en dan zijn hoofd naar de grond laat vallen op zn gezicht", en "Hij moet een beetje plat komen te liggen nu is het meer een propje". De tabellen staan nu in `hy_v4_pose.py`, op deze korte benen.

- **Geraakt:** drie beelden, 12 per seconde, naar achteren ten opzichte van waar hij kijkt: het bovenlijf gaat 12, 18 en 6 graden achterover, de linkervoet schuift terug, en de speer zwiept mee met zijn onderkant op de grond.
- **Sterven:** zeven beelden, 8 per seconde: de klap, op de knieën, en dan voorover tot plat op de buik met de benen gestrekt. Het spel houdt het laatste beeld vast.
- **Hij valt 22 graden schuin.** Recht naar de camera of ervan af was hij een propje. Met 22 graden blijft in alle acht richtingen zijn lengte in beeld. Dit is mijn toevoeging aan de regel van Marcel.
- **Het wapen valt plat naast hem**, steeds sneller, en komt tegelijk met hem op de grond. Speer rechts, boog links. Eerst lag de speer dwars, en dan leek hij in één richting rechtop te staan of uit de helm te steken; nu ligt hij langs het lijf.
- **De hand die het wapen hield, zakt langs het lijf.** Anders stak de lege vuist naast de rug uit.
- **Wat je alleen ziet als hij ligt:** de vuist zat deels in het masker van de speer en werd een bal op de schacht (daar komt nu een stuk schacht van erboven), de zolen waren zwart met spikkels (nu effen donkerbruin), en onder de achterkant van de rok was een donker gat (die valt nu op de dijen).

Gemeten: speerman geraakt 183 × 936 (193 KB; cel 61 × 117), sterven 1274 × 1224 (438 KB; cel 182 × 153); boogschutter geraakt 195 × 800 (182 KB; cel 65 × 100), sterven 1022 × 976 (400 KB; cel 146 × 122).

Getest in de browser, zonder consolefouten: de speerman is in een echt gevecht door een rover gedood, de boogschutter op een open plek met de regel van het spel (`T.raak`), omdat zijn rover wegliep. De klap speelt `geraakt` en de dood `sterven`, via de gewone regels (`e.flits` en `e.dood`). Marcel heeft dit nog niet beoordeeld.

## De verbeterronde (1 nov)

Voor beide figuren, op de restpunten:

| Wat | Hoe | Stand |
|---|---|---|
| Het gezicht onder de helm | Het hoofd 8 graden achterover | Beter te zien, nog deels onder de rand |
| De lichte streep over de helm | Op de naad de kleur van wat ernaast ligt, en de helmrand gemeten zonder wat ernaast steekt | Weg |
| De knie door de rok | De rok gaat 1,7 keer zo ver mee met de dij | Minder |
| Geel per run anders, en strepen | De kleuren per helft op de plaat, en elk punt half naar het gemiddelde van zijn buren | Gelijker, strepen minder maar nog te zien |
| Witte vegen en blauw op leer | De kleur van de buren in plaats van een vaste kleur | Weg |
| De verf van de arm op de zij | Onder de oksel de stof van die kant | Schoner als de arm opgaat |

Een eerste poging voor de zij kleurde ook de schouders geel; die is meteen hersteld.

## De uitkomst

- **Dit is de beste figuur tot nu toe, op eigen oordeel.** Hij lijkt het meest op de plaat, de vuist zit echt om de speer, en hij is op spelmaat rustiger dan de Hunyuan-versie. Hij staat, loopt en steekt in het spel, in acht richtingen, zonder consolefouten. Marcel heeft deze stand nog niet beoordeeld, en het is geen productie-asset.
- **De steek is getest in een echt gevecht:** rovers op de kaart, de opdracht "volg", en het spel kiest zelf de aanval. De mannen lopen erheen, steken in de goede richting, en de schade komt door (`gevecht-in-het-spel.png`). De armen kunnen dus los bewegen, ook op deze wolk zonder vlakken.
- **De plaat telde opnieuw het zwaarst.** Pas toen de voor- en achterkant op één plaat echt bij elkaar pasten, viel het raden weg. En nu de plaat de speer in de hand heeft, hoeft de rig de staande houding niet meer te maken.
- **De plaat zonder speer blijft bruikbaar als basis** voor een figuur zonder speer: `keten_splat_vel.sh alle` gebruikt dan de speer van de mesh en de arm op de rig. Na de laatste aanpassingen is die weg alleen op een paar beelden nagekeken, en niet helemaal gedraaid.
- **Het is geen mesh.** TripoSplat maakt 3D Gaussians: kleine gekleurde wolkjes. Blender tekent die niet, dus `hy_splat.py` heeft een eigen renderer. Dat past bij offline sprites, wat toch al het advies was. Een GLB of realtime 3D levert het niet op.

## Licentie

Niet juridisch getoetst; dit is wat de teksten zeggen.

| Onderdeel | Licentie | Wat dat betekent |
|---|---|---|
| TripoSplat, code en eigen gewichten (VAST) | MIT | Geen uitsluiting van de EU, in tegenstelling tot Hunyuan |
| BiRefNet (achtergrond weg) | MIT | |
| Flux.2-autoencoder (Black Forest Labs) | Apache 2.0, volgens hun eigen README | De Flux.2-modellen zelf zijn deels niet-commercieel; dit bestand niet, en die modellen zitten er niet in |
| DINOv3 (Meta) | Eigen DINOv3-licentie | Royaltyvrij. Ik vond in de tekst geen verbod op commercieel gebruik, wel voorwaarden: de licentie doorgeven als je het model verspreidt, geen militair gebruik, handelsregels. Wij verspreiden alleen sprites. De modelkaart noemt alleen MIT, en dat klopt dus niet voor dit onderdeel |

Hoort met de AI-opgave bij de stukken voor Steam. In de vellen van de speerman zit geen Hunyuan: de speer komt nu van de plaat. Alleen op de plaat zonder speer komt hij uit eigen code (`maak_speer`, gelezen uit `v_spel.npz`).

## De keten

`keten_splat_vel.sh speer` doet dit achter elkaar. Gemeten op de 1080 Ti.

| Stap | Wat | Tijd |
|---|---|---|
| 1 | Een run op Z en een op N van de plaat (`hy_splat.py maak`): 262.144 Gaussians per run, piek 6,34 GB VRAM. BiRefNet haalt de achtergrond en de schaduw weg | 2 × 3 min |
| 2 | Samen (`samen`): de voorste helft uit Z, de achterste uit N, de naad langs de zij, per hoogte op het midden van wat daar staat. Gepast op een band langs de naad: schaal 0,98, draaiing 2,2°, afstand 9 mm. De speer komt alleen uit Z: de speer van N gaat eruit, want twee runs zetten hem niet op dezelfde plek. Omdat de run hem in de diepte scheef raadt, staat hij in de rig weer recht, zoals op de plaat | Onder de minuut |
| 3 | Rechtzetten, in `samen` en `verf`: de donkere kant van de helm krijgt in elke run het spiegelbeeld van zijn goede kant (zo'n 24.000 Gaussians per run), de donkere streep langs de naad de kleur van de stof ernaast (32.274), blauw op leer wordt leer (4.298), groen op de naad weg (564), en de wapenrok krijgt de kleuren van de plaat | Onder de minuut |
| 4 | Rig (`rig`): `hy_rig.py` op de Gaussians, met buren in plaats van vlakken. Beide armen in drie stukken (bovenarm, onderarm, hand). Staan: de arm zoals op de plaat, de speer op de grond. Lopen: benen en lijf van V4, de speer vast aan de borst. Steken: lijf en benen uit `steek2` in `hy_v4_pose.py`: de linkerschouder naar voren, de linkervoet uit, door de knieën en doorzetten. De linkerhand gaat op de schacht, en de speer schuift een stuk door de hand. De speer (20.777 Gaussians, 1,35 keer dikker: anders is de schacht op spelmaat te dun) hangt aan de vuist, en draait de kant die de run zag naar de camera. 1.509 losse stukjes weg | Een minuut rekenen |
| 5 | Sprites op de spelcamera, `vel.py`: 288 beelden (staan 4, lopen 12, aanval 10, geraakt 3, sterven 7, in 8 richtingen) | 1208 s bij de boogschutter, met een tweede keten ernaast |

De vellen van de speerman: staan 244 × 952, lopen 804 × 952, aanval 1830 × 1008 (cel 183 × 126, want de speer ligt). De aanval duurt 0,62 s, tegen 0,8 s bij het oude vel. De lengte is 1,35 m van zool tot helm, de speertop 1,56 m. De gewichten zijn 3,78 GB, in `C:/ComfyUI/triposplat`, met de hash nagekeken.

## Wat niet werkte

Elk hiervan is geprobeerd en teruggedraaid.

| Proef | Wat er misging |
|---|---|
| Eén run, de rest geraden | Voorkant prachtig. Achter: helm half zwart, rug helemaal blauw, laars blauw |
| Eén run, met de andere aanzichten van de plaat erop geprojecteerd | Blauw op de armen en wazig: de aanzichten zijn getekend en passen niet exact |
| Eén run, met spiegelen en kleurregels | Schoon, maar de rug blijft verzonnen. Als terugval bruikbaar voor een plaat zonder goede achterkant |
| Vier runs (Z, W, N, O), de vormen door elkaar | Vlekken, gezicht weg: ze liggen een centimeter uit elkaar, en de geraden kanten komen erdoorheen |
| Vier runs, één vorm, alleen de kleur overnemen | Wazig en vlekkerig achter |
| **Twee runs, gesneden langs de zij** | **Werkt.** Elke run houdt wat hij zag, en er ligt nergens iets dubbel |
| De lengte meten op het hoogste punt bij het midden van de bovenste brede plak | Viel op de speer: daar zijn boven in de helm meer punten dan helmpunten, dus de speer werd niet meer herkend. Gevangen in het log, en hersteld |
| Een brede straal rond de speer over het bovenste stuk van 30 cm | Hapte uit de helmrand (Marcel: "Helm is niet overal compleet"): dat stuk telde als speer en draaide met de speer weg. De brede straal geldt nu alleen boven de helm, waar het blad zit |
| Een rechte naad over het midden van het lijf | De figuur leek afgeknipt in ZW, W en O (Marcel: "Lijken afgeknipt"). De helm staat zo'n 6 cm achter het midden van het lijf, dus de naad sneed er scheef door en er viel een stuk weg. Nu volgt de naad per hoogte het midden van de middenkolom, in elke run dat van hemzelf, en schuift de helm als star geheel |
| Eerst gegokt: de diepte oprekken, en de helm rond duwen per hoek | Meten liet zien dat de helm in elke run op zich wel rond genoeg is. Beide stappen losten het verkeerde op en zijn weer weg |
| De steek met één hand, op het lijf van V4 (`proef_steek`) | Werkte als beweging, maar Marcel: "je kunt met 1 hand geen kracht zetten" |
| De speer om de vaste as draaien bij een liggende speer | De schacht werd donker: dan zie je de kant die de run moest raden. Nu draait de kant die hij zag altijd naar de camera |
| De vuist met de speer mee laten kantelen, zonder grens | De arm is 33 cm: te ver gereikt scheurde de vuist los van de onderarm en rekte wat ertussen zit. Nu rolt de vuist om de schacht met de pols naar de schouder, en is de reikwijdte een grens |
| Lopen precies op de lijn van rechtervoet naar linkerschouder | Zijn rechterhand haalt die lijn niet: de speer verdween in zijn buik. Nu de richting van die lijn, door de plek die de hand wel haalt. De onderkant staat daardoor zo'n 15 cm buiten de rechtervoet |
| Een lijn van stippen tussen de hand en het hoofd | Randjes naast de speer die half aan de hand en half aan het hoofd hingen. Het masker is nu per hoogte (ruim boven de helmrand, smal langs de laars), en wat geen arm is, heeft geen handgewicht |

## Naast de Hunyuan-versie

Oordeel op `spelmaat.png`, `in-het-spel.png` en `../bewijs/hunyuan/textuur-vergelijking.png`.

| | Hunyuan + textuurmodel | TripoSplat |
|---|---|---|
| Lijkt op de plaat | Goed op voor en achter | Beter, ook de bouw en het gezicht |
| Op 80 pixels | Korrelige mouwen, drukke zij | Rustiger, gezicht beter leesbaar. Iets zachter |
| Staal | Helder | Wat donkerder |
| Licht | Plaat plus 30% echt licht | Alleen wat in de kleur zit, dus geen ander licht mogelijk |
| Stappen | Mesh, verf, textuurmodel, rig | Twee runs, snede, rig |
| Vorm voor andere uitvoer | Mesh (niet dicht, geen bruikbare UV) | Geen |
| Licentie | Publiek sluit de EU uit, mail van Tencent | MIT en de tabel hierboven |

## Wat nog niet goed is

De restpunten staan in `ontwerp/opmerkingen.md`, bij "De figuren uit TripoSplat".

## Advies

**Maak TripoSplat de route voor de figuren, als Marcel deze stand goedkeurt.** Hij is beter op spelmaat, heeft minder stappen en een eenvoudiger licentie. De Hunyuan-keten blijft staan als terugval. De steek en het schieten zijn nu bewezen, en de tweede figuur ging in zo'n 25 minuten rekenen, met één nieuw stuk code (de boog). Geraakt worden en sterven staan er nu ook. Een nieuwe plaat is goedkoop (zo'n 25 minuten tot en met de vellen): neem de vaste houding op de plaat mee, want de rig maakt die dan niet na.
