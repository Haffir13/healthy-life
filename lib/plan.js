const GOALS = {
  equilibrio: {
    name: "Equilibrio integral",
    intro: "Un plan balanceado que combina alimentación, movimiento y autocuidado.",
    nutre: [
      "Agrega una fruta o vegetal a una comida que ya ibas a consumir.",
      "Prepara una comida con al menos dos colores de alimentos naturales.",
      "Deja lista una opción simple de snack: fruta, yogur natural o frutos secos."
    ],
    mueve: [
      "Camina a ritmo cómodo durante {{time}} minutos.",
      "Haz una pausa activa de {{time}} minutos: movilidad de hombros, espalda y piernas.",
      "Suma movimiento a tu rutina: camina mientras haces una llamada durante {{time}} minutos."
    ],
    equilibra: [
      "Realiza 3 minutos de respiración lenta antes de continuar con tu día.",
      "Haz una pausa sin pantalla y anota una prioridad realista para hoy.",
      "Cierra el día registrando una cosa que salió bien y una que quieres mejorar mañana."
    ]
  },
  energia: {
    name: "Más energía",
    intro: "Pequeñas acciones para reducir la sensación de inercia y activar tu día.",
    nutre: [
      "Toma un vaso de agua y acompaña tu próxima comida con una fruta.",
      "Evita saltarte tu próxima comida: elige una opción simple con alimentos reales.",
      "Prepara agua para tenerla visible durante tu jornada."
    ],
    mueve: [
      "Camina a paso ligero durante {{time}} minutos.",
      "Haz {{time}} minutos de movilidad y una caminata corta.",
      "Sube el ritmo durante {{time}} minutos con una actividad que ya toleres bien."
    ],
    equilibra: [
      "Haz una pausa de 2 minutos: respira, estira y vuelve a una sola tarea.",
      "Reduce una distracción durante 20 minutos y enfócate en una tarea importante.",
      "Programa una hora razonable para desconectarte de pantallas esta noche."
    ]
  },
  movimiento: {
    name: "Moverme más",
    intro: "Un plan para aumentar el movimiento sin exigir rutinas largas.",
    nutre: [
      "Acompaña tu actividad con agua y una comida normal, sin compensaciones extremas.",
      "Incluye una fuente de alimentos naturales en tu próxima comida.",
      "Deja lista una botella de agua para tu pausa de movimiento."
    ],
    mueve: [
      "Completa {{time}} minutos de caminata continua.",
      "Divide {{time}} minutos en dos pausas activas durante el día.",
      "Haz {{time}} minutos combinando caminata y movilidad suave."
    ],
    equilibra: [
      "Antes de moverte, define una meta mínima: terminar, no hacerlo perfecto.",
      "Después de tu pausa activa, registra cómo cambió tu nivel de energía.",
      "Deja preparado el momento y lugar de tu siguiente pausa de movimiento."
    ]
  },
  alimentacion: {
    name: "Comer de forma más consciente",
    intro: "Cambios simples que se apoyan en tu rutina actual, sin dietas extremas.",
    nutre: [
      "Agrega una porción de fruta o verdura a una comida habitual.",
      "Cambia una bebida azucarada por agua en una ocasión de hoy.",
      "Planifica tu próxima comida antes de tener mucha hambre."
    ],
    mueve: [
      "Camina {{time}} minutos después de una comida, si te resulta cómodo.",
      "Haz una pausa de movimiento de {{time}} minutos durante tu jornada.",
      "Aprovecha {{time}} minutos para caminar en lugar de permanecer sentado."
    ],
    equilibra: [
      "Come una comida sin pantalla y presta atención a ritmo, hambre y saciedad.",
      "Anota qué situación suele dificultar tus decisiones de alimentación.",
      "Elige una mejora pequeña para repetir mañana, en vez de cambiar todo a la vez."
    ]
  },
  bienestar: {
    name: "Bienestar y autocuidado",
    intro: "Un plan suave para crear pausas de autocuidado dentro de un día ocupado.",
    nutre: [
      "Mantén agua visible y toma un vaso en tu próxima pausa.",
      "Elige una comida sencilla con alimentos que ya conoces y toleras bien.",
      "Incluye una fruta o vegetal en una comida sin modificar todo tu menú."
    ],
    mueve: [
      "Haz {{time}} minutos de caminata o movilidad a un ritmo cómodo.",
      "Realiza una pausa activa de {{time}} minutos lejos de la pantalla.",
      "Estira y camina durante {{time}} minutos para cortar un periodo largo sentado."
    ],
    equilibra: [
      "Respira lentamente durante 3 minutos y relaja hombros y mandíbula.",
      "Haz una pausa breve sin notificaciones y elige una sola prioridad.",
      "Antes de dormir, anota tres pendientes para sacar esas ideas de tu cabeza."
    ]
  }
};

function clampTime(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 10;
  return Math.min(30, Math.max(5, Math.round(n)));
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pick(items, seed) {
  return items[seed % items.length];
}

function scaleByEnergy(text, energy, time) {
  let adjusted = time;
  if (energy === "baja") adjusted = Math.max(5, Math.round(time * 0.65));
  if (energy === "alta") adjusted = Math.min(30, Math.round(time * 1.15));
  return text.replaceAll("{{time}}", String(adjusted));
}

function generatePlan(input = {}) {
  const goalKey = GOALS[input.goal] ? input.goal : "equilibrio";
  const energy = ["baja", "media", "alta"].includes(input.energy) ? input.energy : "media";
  const time = clampTime(input.time);
  const goal = GOALS[goalKey];
  const seedBase = hashString(`${goalKey}|${energy}|${time}|${new Date().toISOString().slice(0, 10)}`);

  const habits = [
    {
      id: "nutre",
      pillar: "Nutre",
      icon: "leaf",
      title: "Elección consciente",
      action: scaleByEnergy(pick(goal.nutre, seedBase + 3), energy, time),
      points: 34
    },
    {
      id: "mueve",
      pillar: "Muévete",
      icon: "walk",
      title: "Movimiento posible",
      action: scaleByEnergy(pick(goal.mueve, seedBase + 11), energy, time),
      points: 33
    },
    {
      id: "equilibra",
      pillar: "Equilibra",
      icon: "heart",
      title: "Pausa de bienestar",
      action: scaleByEnergy(pick(goal.equilibra, seedBase + 19), energy, time),
      points: 33
    }
  ];

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    profile: {
      goal: goal.name,
      time,
      energy
    },
    intro: goal.intro,
    habits,
    disclaimer: "Healthy Life promueve hábitos generales de bienestar y no reemplaza atención médica, nutricional o psicológica profesional."
  };
}

module.exports = { generatePlan };
