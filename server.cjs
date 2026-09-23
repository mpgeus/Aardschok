// Kleine webserver voor het proefje: serveert deze map op http://localhost:8123.
// Het spel werkt ook als je index.html los opent. Deze server is er voor een browser die
// losse bestanden niet laat bedienen (zoals het browserpaneel waarin Claude test), en straks
// voor alles wat een echte http-pagina nodig heeft (geluid, plaatjes laden).
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { execFile } = require('node:child_process');

const MAP = __dirname;
const POORT = Number(process.env.PORT) || 8123;
const SOORTEN = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ogg': 'audio/ogg',
  '.mp3': 'audio/mpeg',
};

// Voor het gereedschap in gereedschap/: dit zijn de enige adressen waarnaar geschreven mag
// worden, en elk schrijft altijd naar één vast bestand — nooit naar een pad uit het verzoek. Zo
// kan geen van deze adressen misbruikt worden om iets anders te overschrijven.
const OPSLAAN = {
  '/gereedschap/api/gesprekken-opslaan': path.join(MAP, 'js', 'gesprekken.js'),
  '/gereedschap/api/quests-opslaan': path.join(MAP, 'js', 'quests.js'),
};

// En het enige leesadres dat verder gaat dan een bestand teruggeven: welke kaarten staan er in
// kaarten/? Dat is er voor gereedschap/wereld.html, zodat een kaart die net in Tiled getekend is
// meteen in de keuzelijst staat, ook voordat npm run kaarten gedraaid heeft. Het kijkt altijd in
// die ene map en geeft alleen namen terug, nooit inhoud.
function kaartNamen(res) {
  fs.readdir(path.join(MAP, 'kaarten'), (fout, bestanden) => {
    if (fout) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Kaarten lezen mislukt: ' + fout.message);
      return;
    }
    const namen = bestanden.filter((b) => b.toLowerCase().endsWith('.tmj')).map((b) => b.slice(0, -4)).sort();
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify(namen));
  });
}

// De betekenis van één kaart opslaan: kaarten/<naam>.betekenis.json, geschreven door
// gereedschap/wereld.html. De naam komt wel uit het verzoek, en daarom staan er twee sloten op:
// hij mag alleen uit letters, cijfers en streepjes bestaan (dus geen ../ en geen punt), en er
// moet een kaarten/<naam>.tmj naast liggen. Het pad wordt daarna hier samengesteld, nooit
// overgenomen. Tiled schrijft dit bestand nooit — daarom is dit het enige bestand op schijf dat
// het gereedschap verandert, en blijven de .tmj-en van Marcel onaangeroerd.
//
// Tegen overschrijven: het gereedschap stuurt mee hoe het bestand eruitzag toen het het las
// ("vorige"). Klopt dat niet meer met wat er nu staat, dan schrijven we niet en zeggen we het,
// zodat twee open bladen elkaars werk niet wissen.
// De kaarten bundelen tot kaarten/kaarten.js, zodat het spel ziet wat het gereedschap zojuist
// opsloeg. Dit is hetzelfde als npm run kaarten; er komt niets uit het verzoek in, het is altijd
// precies dit ene script. De server luistert alleen op 127.0.0.1.
function bundel(res) {
  execFile(process.execPath, [path.join(MAP, 'gereedschap', 'pixelart', 'naar-kaarten.cjs')], { cwd: MAP }, (fout, uit, err) => {
    // naar-kaarten.cjs geeft een foutcode als een kaart een tegel noemt die niet bestaat; dat is
    // iets om te melden, maar kaarten.js is dan wel geschreven.
    res.writeHead(fout ? 500 : 200, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end((uit || '') + (err || '') || 'klaar');
  });
}

// Eén ding per regel. Dat is niet om mooi te doen: zo is het verplaatsen van één dorpeling ook
// één regel in `git diff`, en zie je in de geschiedenis terug wat er werkelijk veranderde.
function schrijfBetekenis(inhoud) {
  const { dingen, ...rest } = inhoud;
  const kop = Object.entries(rest).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`);
  const regels = (dingen || []).map((d) => '    ' + JSON.stringify(d));
  return `{\n${kop.join('\n')}\n  "dingen": [\n${regels.join(',\n')}\n  ]\n}\n`;
}

function betekenisPad(naam) {
  if (!/^[A-Za-z0-9_-]+$/.test(naam)) return null;
  const tmj = path.join(MAP, 'kaarten', naam + '.tmj');
  if (!fs.existsSync(tmj)) return null;
  return path.join(MAP, 'kaarten', naam + '.betekenis.json');
}

function slaBetekenisOp(req, res, naam) {
  const BESTAND = betekenisPad(naam);
  if (!BESTAND) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(`Geen kaart met de naam "${naam}"`);
    return;
  }
  leesLijf(req, res, (body) => {
    let pakket;
    try {
      pakket = JSON.parse(body);
      if (!pakket || typeof pakket !== 'object' || !Array.isArray(pakket.inhoud.dingen)) throw new Error('geen { vorige, inhoud: { dingen: [] } }');
    } catch (e) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Onleesbaar: ' + e.message);
      return;
    }
    const huidig = fs.existsSync(BESTAND) ? fs.readFileSync(BESTAND, 'utf8') : null;
    if ((pakket.vorige || null) !== huidig) {
      res.writeHead(409, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`kaarten/${naam}.betekenis.json is intussen veranderd; ververs eerst, anders gaat er werk verloren`);
      return;
    }
    const tekst = schrijfBetekenis(pakket.inhoud);
    try {
      if (huidig !== null) fs.writeFileSync(BESTAND + '.bak', huidig, 'utf8');
      fs.writeFileSync(BESTAND, tekst, 'utf8');
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Schrijven mislukt: ' + e.message);
      return;
    }
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ ok: true, tekst }));
  });
}

// Een schermafdruk van het spel als PNG bewaren in gereedschap/pixelart/uit/schermen/<naam>.png
// (niet in git), zodat een sessie of agent een blik op het spel kan laten zien zonder de hele
// afbeelding als tekst door zijn eigen gesprek te halen. Toren.debug.schermafdruk('naam') in
// js/main.js stuurt het doek hierheen. Alleen letters, cijfers en streepjes in de naam.
function slaSchermafdrukOp(req, res, naam) {
  if (!/^[a-z0-9-]{1,60}$/i.test(naam)) {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Ongeldige naam');
    return;
  }
  const stukken = [];
  let lengte = 0;
  req.on('data', (stuk) => {
    lengte += stuk.length;
    if (lengte > 30_000_000) req.destroy();
    else stukken.push(stuk);
  });
  req.on('end', () => {
    const map = path.join(MAP, 'gereedschap', 'pixelart', 'uit', 'schermen');
    const bestand = path.join(map, naam + '.png');
    fs.mkdir(map, { recursive: true }, () => {
      fs.writeFile(bestand, Buffer.concat(stukken), (fout) => {
        res.writeHead(fout ? 500 : 200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(fout ? { ok: false, fout: fout.message } : { ok: true, bestand }));
      });
    });
  });
}

// Het lijf van een POST binnenhalen, met een grens eraan.
function leesLijf(req, res, klaar) {
  let body = '';
  let teGroot = false;
  req.setEncoding('utf8');
  req.on('data', (stuk) => {
    body += stuk;
    if (body.length > 2_000_000) {
      teGroot = true;
      req.destroy();
    }
  });
  req.on('end', () => {
    if (teGroot) return;
    if (!body.trim()) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Lege inhoud, niets opgeslagen');
      return;
    }
    klaar(body);
  });
}

function slaOp(req, res, BESTAND) {
  let body = '';
  let teGroot = false;
  req.setEncoding('utf8');
  req.on('data', (stuk) => {
    body += stuk;
    if (body.length > 2_000_000) {
      teGroot = true;
      req.destroy();
    }
  });
  req.on('end', () => {
    if (teGroot) return;
    if (!body.trim()) {
      res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Lege inhoud, niets opgeslagen');
      return;
    }
    fs.readFile(BESTAND, 'utf8', (foutLezen, huidig) => {
      const schrijf = () => {
        fs.writeFile(BESTAND, body, 'utf8', (foutSchrijven) => {
          if (foutSchrijven) {
            res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Schrijven mislukt: ' + foutSchrijven.message);
            return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({ ok: true }));
        });
      };
      if (foutLezen) {
        // nog geen bestand om een reservekopie van te maken: dan meteen schrijven
        schrijf();
        return;
      }
      fs.writeFile(BESTAND + '.bak', huidig, 'utf8', (foutKopie) => {
        if (foutKopie) {
          res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('Reservekopie maken mislukt: ' + foutKopie.message);
          return;
        }
        schrijf();
      });
    });
  });
}

http
  .createServer((req, res) => {
    let pad;
    try {
      pad = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch {
      res.writeHead(400);
      res.end();
      return;
    }
    if (req.method === 'POST' && OPSLAAN[pad]) {
      slaOp(req, res, OPSLAAN[pad]);
      return;
    }
    if (req.method === 'GET' && pad === '/gereedschap/api/kaarten') {
      kaartNamen(res);
      return;
    }
    if (req.method === 'POST' && pad === '/gereedschap/api/bundelen') {
      bundel(res);
      return;
    }
    if (req.method === 'POST' && pad.startsWith('/gereedschap/api/betekenis/')) {
      slaBetekenisOp(req, res, pad.slice('/gereedschap/api/betekenis/'.length));
      return;
    }
    if (req.method === 'POST' && pad.startsWith('/gereedschap/api/schermafdruk/')) {
      slaSchermafdrukOp(req, res, pad.slice('/gereedschap/api/schermafdruk/'.length));
      return;
    }
    // Een map opvragen geeft zijn index.html: /gereedschap/ toont de drie bladzijden gereedschap.
    const bestand = path.normalize(path.join(MAP, pad.endsWith('/') ? pad + 'index.html' : pad));
    // Alleen bestanden uit deze map, niets daarboven.
    if (!bestand.startsWith(MAP + path.sep) && bestand !== MAP) {
      res.writeHead(403);
      res.end();
      return;
    }
    fs.readFile(bestand, (fout, data) => {
      if (fout) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Niet gevonden');
        return;
      }
      res.writeHead(200, {
        'Content-Type': SOORTEN[path.extname(bestand).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-store',
      });
      res.end(data);
    });
  })
  .listen(POORT, '127.0.0.1', () => {
    // De adressen erbij, want "waar zit het gereedschap?" is anders elke keer weer zoeken.
    const hier = `http://localhost:${POORT}`;
    console.log(`Aardschok draait op ${hier}`);
    console.log('');
    console.log(`  het spel       ${hier}/`);
    console.log(`  de wereld      ${hier}/gereedschap/wereld.html      kaarten, mensen, quests, controle`);
    console.log(`  de gesprekken  ${hier}/gereedschap/gesprekken.html`);
    console.log(`  de quests      ${hier}/gereedschap/quests.html`);
    console.log('');
    console.log(`  alles bij elkaar: ${hier}/gereedschap/index.html`);
  });
