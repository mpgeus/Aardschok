# Texturen voor het model van de speerman (vraag 190)

Van Poly Haven (https://polyhaven.com), **CC0**: vrij te gebruiken, ook in een spel dat we verkopen, zonder naamsvermelding.
Gedownload op 24 okt 2026 in 1K (de md5 nagekeken tegen https://api.polyhaven.com/files/<naam>), op Marcels ja ("Allebei":
de stoffen van Poly Haven en de baard opnieuw).

- `rough_linen_*`: grof linnen (Rough Linen, colormass), voor de wapenrok en de mouwen van het wambuis; een tegel is 27 cm.
- `hessian_230_*`: jute (Hessian 230), voor de hozen.
- `brown_leather_*`: bruin leer (Brown Leather), voor de riem, de laarzen, de armstukken, de handschoenen en de schede.
- `rusty_metal_sheet_*`: plaatstaal met een zachte patina (Rusty Metal Sheet), voor de helm, het blad en de gespen; een
  tegel is 30 cm. Gedownload op 24 okt, op Marcels ja ("Allebei download maar").
- `ash_veneer_*`: essenhout (Ash Veneer), het hout van speren, voor de schacht; de nerf loopt in het beeld dwars, en
  `mat_hout` legt hem langs de schacht. Zelfde dag, zelfde ja.

Per textuur de kleur (`diff`/`albedo`), de normal map (`nor_gl`, OpenGL) en de ruwheid (`rough`). `speerman_hd.py` neemt van
de kleur alleen het licht en donker (de draad en de slijtage); de kleur zelf blijft die van het model.
