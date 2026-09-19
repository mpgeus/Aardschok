// Portretten voor het gesprek en het leeftijdspaneel: hoofd en schouders van een figuur, groter
// gerenderd en iets naar de camera gekanteld, zodat het gezicht onder de hoedrand vandaan komt.
'use strict';
const K = require('./kern.cjs');
const F = require('./figuren.cjs');

// hoofd = [x, y, z] van het midden van het hoofd in het model; o.kant = kijkrichting,
// o.schaal = hoeveel groter dan in het spel, o.midden = waar het hoofd valt (deel van de hoogte).
function portret(model, hoofd, o = {}) {
  const s = o.schaal || 2.4;
  const b = o.b || 64;
  const kant = o.kant || 'ZO';
  // kantelen om een liggende as, dwars op de richting naar de camera (in lokale assen)
  const hoek = ((K.RICHTING[kant] - 45) * Math.PI) / 180;
  const naarCamera = [-Math.sin(hoek), Math.cos(hoek)];
  const as = [naarCamera[1], -naarCamera[0], 0];
  const m = F.geschaald(F.gekanteld(model, as, o.kantel ?? 18, hoofd), s);
  // waar het hoofd op het scherm valt als het anker in (0, 0) ligt
  const graden = K.RICHTING[kant];
  const a = (graden * Math.PI) / 180;
  const fx = Math.cos(a);
  const fy = Math.sin(a);
  const X = (hoofd[0] * -fy + hoofd[1] * fx) * s;
  const Y = (hoofd[0] * fx + hoofd[1] * fy) * s;
  const [hx, hy] = K.naarScherm({ OX: 0, OY: 0 }, X, Y, hoofd[2] * s);
  const B = new K.Beeld(b, b, Math.round(b / 2 - hx), Math.round(b * (o.midden ?? 0.5) - hy));
  K.tekenModel(B, m, { richting: kant });
  K.belicht(B);
  K.omlijn(B);
  return K.Plaat.van(K.kwantiseer(B));
}

module.exports = { portret };
