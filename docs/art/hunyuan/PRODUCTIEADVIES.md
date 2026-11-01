# Productieadvies

31 okt 2026. De onderbouwing staat in `KWALITEITSRAPPORT.md` en `AUDIT.md`.

## De aanbeveling

**Bijgewerkt, 31 okt avond:** TripoSplat is op spelmaat beter dan deze route, met minder stappen en een eenvoudiger licentie (`TRIPOSPLAT.md`). Mijn advies is nu TripoSplat, als Marcel die stand goedkeurt, met de keten hieronder als terugval. De rig en de sprites zijn voor allebei dezelfde.

**Maak Hunyuan3D plus verf uit de plaat de route voor de figuren, met offline sprites, en stop met V4 als basis.** V4 blijft staan als werkend terugvalpunt. Dit is geen goedkeuring van deze speerman: hij is een geslaagde proef van de methode, geen productie-asset.

De keten voor een nieuwe figuur:

1. **Plaat:** acht aanzichten in één pose, zonder achtergrond (`PLAAT-EISEN.md`). Marcel maakt en beoordeelt die.
2. **Mesh:** Hunyuan3D-2mv in ComfyUI uit vier aanzichten (`hy_invoer.py`, `hy_comfy.py`).
3. **Bewerken:** kraters eruit, verf uit de plaat op de mesh, wapen los (`hy_bouw.py`, per figuur een regel in `hy_config.json`).
4. **Rig:** gewrichten gemeten op de mesh, rok en armen los, de beweging van V4 op lijf en benen, de armen op de referentie (`hy_v4_pose.py`, `hy_rig.py`).
5. **Verf op wat de plaat niet zag:** het textuurmodel op de figuur met de armen wijd (`hy_paint.py`), en `hy_rig.py verf=<kleur.npz>` mengt dat erin.
6. **Sprites:** in acht richtingen op de spelcamera, naar het vel met de bestaande afwerking (`keten_hy_vel.sh`, `vel.py`).
7. **In het spel kijken:** `inspel.js`, en daarna pas opnemen.

## Waarom offline sprites

| | Offline sprites | Realtime 3D | Hybride |
|---|---|---|---|
| Kwaliteit | Hoog: dichte mesh, en verf per punt zonder UV | Lager: vraagt een lichte mesh met goede UV, en die hebben we niet | Geen voordeel voor eenheden op 80 pixels |
| Prestaties | Zoals nu: `js/gl.js` tekent sprites, het vel is even groot of kleiner (lopen 717 KB, V4 881 KB) | Niet getest. Honderden figuren met skinning passen niet in de huidige engine | Ingewikkelder |
| Kosten | Laag: 3,3 s per beeld | Hoog: nieuwe weg in de engine, nieuwe topologie | Hoogst |
| Risico | Geheugen voor vellen, bij veel figuren | Performance, die bij ons hoge prioriteit heeft | Twee wegen |

## Wat het per figuur kost (gemeten op de 1080 Ti)

| Stap | Tijd | Opmerking |
|---|---|---|
| Plaat maken en nakijken | Hangt af van de plaat | Hier zit het kwaliteitsverschil |
| Mesh | 6 tot 10 minuten | 3072 of 8192 latents met octree 256. Maximaal (octree 512) 24 minuten en al het RAM |
| Bewerken | Onder de minuut | |
| Rig | Enkele minuten rekenen | Voor deze speerman was het een dag uitzoeken. Of het voor een tweede figuur vanzelf gaat, is niet getest: de plek van de hand en de kleurregel van de rok zijn per figuur |
| Textuurmodel | 2,5 minuut | Gemeten: 12 s licht eraf en 122 s verven, piek 9,33 GB VRAM, dus op de 1080 Ti met weinig ruimte over |
| Sprites | 7 minuten voor 128 beelden | Gemeten: 417 s, staan 4 en lopen 12 in 8 richtingen, op 768 pixels |

**Advies voor de instelling:** 8192 latents met octree 256 voor productie, en de verf op een fijnere mesh. De maximale mesh gebruikte ik omdat Marcel daarom vroeg en om de grens te kennen. Op 80 pixels is het verschil niet aangetoond.

## De volgende stappen, op volgorde

1. **Marcel beoordeelt de platen en kiest het ontwerp**: een plaat met gekwartierde of met tweedelige tabberd.
2. **Een schonere en grotere plaat**, als die er komt: zie `PLAAT-EISEN.md`. Vooral 900 pixels, en dan is de keten in 10 minuten opnieuw te draaien.
3. **Het gezicht op 30 graden** en **de korrel op 80 pixels**, beoordeeld in het spel.
4. **Aanval, geraakt worden en sterven** op deze rig. Daar blijkt of de rig ook andere bewegingen aankan dan lopen.
5. **Een tweede figuur** door de keten (een dorpeling of de kruisboogschutter), om te toetsen of dit schaalt. Pas daarna is dit bewezen als route voor tientallen figuren.

## De keuzes die bij Marcel liggen

- **Klopt de loop en de houding in het spel?** Rok en rig zijn af tot hier, en hij is nu in beweging te beoordelen (`rig-lopen-klei-verf.mp4`, `F-in-het-spel.png`).
- **De wapenrok: rechts blauw, links geel, ook opzij.** De platen spreken elkaar daar tegen, dus dit is mijn keuze. Een andere regel is één functie (`helften` in `hy_rig.py`).
- **Spelcamera:** de plaat staat op 10 graden, het spel op 30. Ik adviseer 30 graden te houden, want de tegels en gebouwen staan daarop, en het gezicht op te lossen met de helm of de plaat.
- **Licentie:** de mail van Tencent hoort bij de stukken voor Steam, net als de AI-opgave.
