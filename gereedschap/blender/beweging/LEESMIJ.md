# Bewegingen voor de figuren (vraag 190)

Motion capture van de CMU Graphics Lab Motion Capture Database (http://mocap.cs.cmu.edu), opgenomen met een Vicon-systeem op
120 beelden per seconde. De voorwaarden (de FAQ van de database): *"The motion capture data may be copied, modified, or
redistributed without permission."* Dus ook in een spel dat we verkopen. Gedownload op 25 okt 2026, op Marcels ja ("Cmu dan
maar").

- `35.asf`: het skelet van proefpersoon 35 (de lengtes in inches, maal 0,45; `mocap.py`, SCHAAL).
- `35_01.amc`, `35_02.amc`, `35_03.amc`: drie gewone loopjes van proefpersoon 35 (zo'n drie seconden elk).

`mocap.py` leest ze, knipt er één pas uit, haalt de voorwaartse beweging eruit (lopen op de plaats) en zet benen, bekken,
rug en hoofd op het skelet van MakeHuman; de armen houden met de IK de speer.
