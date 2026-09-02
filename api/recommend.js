const catalogs = {
  balance: {
    nutre: [
      [5, 'Añade una fruta a tu refrigerio de hoy.'],
      [10, 'Prepara una comida con al menos dos colores de vegetales.'],
      [15, 'Planifica una opción simple y casera para tu siguiente comida.']
    ],
    mueve: [
      [5, 'Camina 5 minutos después de una comida.'],
      [10, 'Haz 10 minutos de caminata a ritmo cómodo.'],
      [15, 'Realiza una rutina suave de movilidad y caminata durante 15 minutos.']
    ],
    equilibra: [
      [5, 'Haz 3 minutos de respiración lenta y deja 2 minutos sin pantalla.'],
      [10, 'Realiza una pausa consciente de 5 minutos y anota una prioridad para hoy.'],
      [15, 'Dedica 10 minutos a desconectarte de pantallas y 5 minutos a una pausa consciente.']
    ]
  },
  energia: {
    nutre: [
      [5, 'Toma un vaso de agua y elige una fruta para acompañar tu mañana.'],
      [10, 'Prepara un refrigerio simple con fruta y una fuente de proteína.'],
      [15, 'Organiza una comida sencilla basada en alimentos poco procesados.']
    ],
    mueve: [
      [5, 'Activa tu cuerpo con 5 minutos de caminata o movilidad.'],
      [10, 'Haz una caminata activa de 10 minutos.'],
      [15, 'Combina 10 minutos de caminata con 5 minutos de movilidad.']
    ],
    equilibra: [
      [5, 'Haz una pausa de respiración de 2 minutos y estira durante 3 minutos.'],
      [10, 'Haz una pausa sin pantalla y una respiración guiada durante 10 minutos.'],
      [15, 'Reserva 15 minutos para una pausa tranquila, sin multitarea.']
    ]
  },
  constancia: {
    nutre: [
      [5, 'Define una sola elección saludable que repetirás hoy.'],
      [10, 'Planifica con anticipación un refrigerio saludable para evitar improvisar.'],
      [15, 'Deja preparada una opción saludable para mañana.']
    ],
    mueve: [
      [5, 'Haz 5 minutos de movimiento a la misma hora que ayer.'],
      [10, 'Cumple 10 minutos de movimiento y registra cómo te sentiste.'],
      [15, 'Completa 15 minutos de actividad y programa el siguiente bloque en tu agenda.']
    ],
    equilibra: [
      [5, 'Marca una pausa fija de 5 minutos para cerrar el día.'],
      [10, 'Anota un hábito cumplido y una pequeña mejora para mañana.'],
      [15, 'Revisa tu día durante 5 minutos y realiza 10 minutos de descanso consciente.']
    ]
  }
};

function pickByTime(list, minutes) {
  const target = Number(minutes) || 10;
  return list.reduce((best, item) => Math.abs(item[0] - target) < Math.abs(best[0] - target) ? item : best, list[0]);
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const goal = catalogs[body.goal] ? body.goal : 'balance';
  const time = Math.min(20, Math.max(5, Number(body.time) || 10));
  const mood = ['baja', 'media', 'alta'].includes(body.mood) ? body.mood : 'media';
  const plan = catalogs[goal];
  const moodFactor = mood === 'baja' ? 0.8 : mood === 'alta' ? 1.1 : 1;
  const adaptedTime = Math.max(5, Math.round(time * moodFactor));

  const habits = [
    { id: 'nutre', pillar: 'Nutre', icon: 'leaf', minutes: pickByTime(plan.nutre, adaptedTime)[0], text: pickByTime(plan.nutre, adaptedTime)[1] },
    { id: 'mueve', pillar: 'Muévete', icon: 'walk', minutes: pickByTime(plan.mueve, adaptedTime)[0], text: pickByTime(plan.mueve, adaptedTime)[1] },
    { id: 'equilibra', pillar: 'Equilibra', icon: 'lotus', minutes: pickByTime(plan.equilibra, adaptedTime)[0], text: pickByTime(plan.equilibra, adaptedTime)[1] }
  ];

  return res.status(200).json({
    goal,
    message: 'Tu plan se adapta al tiempo disponible y busca priorizar acciones pequeñas y sostenibles.',
    habits,
    disclaimer: 'Contenido educativo de bienestar. No sustituye evaluación, diagnóstico ni tratamiento médico, nutricional o psicológico.'
  });
}
