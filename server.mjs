import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 3000);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

function send(res, status, body, contentType='text/plain; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': contentType, 'Cache-Control': 'no-store' });
  res.end(body);
}

function choose(items, minutes) {
  return items.reduce((best, item) => Math.abs(item[0] - minutes) < Math.abs(best[0] - minutes) ? item : best, items[0]);
}

const plans = {
  balance: {
    nutre: [[5,'Añade una fruta a tu refrigerio de hoy.'],[10,'Prepara una comida con al menos dos colores de vegetales.'],[15,'Planifica una opción simple y casera para tu siguiente comida.']],
    mueve: [[5,'Camina 5 minutos después de una comida.'],[10,'Haz 10 minutos de caminata a ritmo cómodo.'],[15,'Realiza una rutina suave de movilidad y caminata durante 15 minutos.']],
    equilibra: [[5,'Haz 3 minutos de respiración lenta y deja 2 minutos sin pantalla.'],[10,'Realiza una pausa consciente de 5 minutos y anota una prioridad para hoy.'],[15,'Dedica 10 minutos a desconectarte de pantallas y 5 minutos a una pausa consciente.']]
  },
  energia: {
    nutre: [[5,'Toma un vaso de agua y elige una fruta para acompañar tu mañana.'],[10,'Prepara un refrigerio simple con fruta y una fuente de proteína.'],[15,'Organiza una comida sencilla basada en alimentos poco procesados.']],
    mueve: [[5,'Activa tu cuerpo con 5 minutos de caminata o movilidad.'],[10,'Haz una caminata activa de 10 minutos.'],[15,'Combina 10 minutos de caminata con 5 minutos de movilidad.']],
    equilibra: [[5,'Haz una pausa de respiración de 2 minutos y estira durante 3 minutos.'],[10,'Haz una pausa sin pantalla y una respiración guiada durante 10 minutos.'],[15,'Reserva 15 minutos para una pausa tranquila, sin multitarea.']]
  },
  constancia: {
    nutre: [[5,'Define una sola elección saludable que repetirás hoy.'],[10,'Planifica con anticipación un refrigerio saludable para evitar improvisar.'],[15,'Deja preparada una opción saludable para mañana.']],
    mueve: [[5,'Haz 5 minutos de movimiento a la misma hora que ayer.'],[10,'Cumple 10 minutos de movimiento y registra cómo te sentiste.'],[15,'Completa 15 minutos de actividad y programa el siguiente bloque en tu agenda.']],
    equilibra: [[5,'Marca una pausa fija de 5 minutos para cerrar el día.'],[10,'Anota un hábito cumplido y una pequeña mejora para mañana.'],[15,'Revisa tu día durante 5 minutos y realiza 10 minutos de descanso consciente.']]
  }
};

async function handleApi(req, res) {
  let raw = '';
  for await (const chunk of req) raw += chunk;
  let data = {};
  try { data = JSON.parse(raw || '{}'); } catch {}
  const goal = plans[data.goal] ? data.goal : 'balance';
  const requested = Math.min(20, Math.max(5, Number(data.time) || 10));
  const mood = ['baja','media','alta'].includes(data.mood) ? data.mood : 'media';
  const adapted = Math.max(5, Math.round(requested * (mood === 'baja' ? .8 : mood === 'alta' ? 1.1 : 1)));
  const p = plans[goal];
  const habits = [['nutre','Nutre'],['mueve','Muévete'],['equilibra','Equilibra']].map(([id,pillar]) => {
    const item = choose(p[id], adapted);
    return { id, pillar, minutes:item[0], text:item[1] };
  });
  send(res, 200, JSON.stringify({goal, habits, message:'Tu plan se adapta al tiempo disponible y prioriza acciones pequeñas y sostenibles.', disclaimer:'Contenido educativo de bienestar. No sustituye evaluación, diagnóstico ni tratamiento profesional.'}), 'application/json; charset=utf-8');
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  if (url.pathname === '/api/recommend') {
    if (req.method !== 'POST') return send(res, 405, JSON.stringify({error:'Método no permitido'}), 'application/json; charset=utf-8');
    return handleApi(req, res);
  }
  let filePath = url.pathname === '/' ? '/index.html' : url.pathname;
  filePath = path.normalize(filePath).replace(/^\.\.(\/|\\)/, '');
  const full = path.join(__dirname, filePath);
  if (!full.startsWith(__dirname)) return send(res, 403, 'Forbidden');
  try {
    const stat = await fs.stat(full);
    if (stat.isDirectory()) filePath = path.join(filePath, 'index.html');
    const data = await fs.readFile(path.join(__dirname, filePath));
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream', 'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600' });
    res.end(data);
  } catch {
    send(res, 404, 'No encontrado');
  }
});

server.listen(port, () => console.log(`Healthy Life disponible en http://localhost:${port}`));
