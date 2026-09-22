// Kleine webserver voor het proefje: serveert deze map op http://localhost:8123.
// Het spel werkt ook als je index.html los opent. Deze server is er voor een browser die
// losse bestanden niet laat bedienen (zoals het browserpaneel waarin Claude test), en straks
// voor alles wat een echte http-pagina nodig heeft (geluid, plaatjes laden).
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

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
    const bestand = path.normalize(path.join(MAP, pad === '/' ? 'index.html' : pad));
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
  .listen(POORT, '127.0.0.1', () => console.log(`Aardschok draait op http://localhost:${POORT}`));
