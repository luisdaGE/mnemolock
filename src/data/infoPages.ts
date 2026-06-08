export const infoPages = [
  {
    slug: "estudiantes",
    title: "Para estudiantes",
    eyebrow: "Enfoque individual",
    summary:
      "Sesiones de estudio con bloqueo, preguntas de desbloqueo y progreso claro para convertir distraccion en practica activa.",
    image: "/info-students.svg",
    bullets: ["Sesiones guiadas", "Preguntas de repaso", "Historial de progreso"],
  },
  {
    slug: "escuelas",
    title: "Para escuelas",
    eyebrow: "Modelo institucional",
    summary:
      "Una base para grupos, docentes y reportes agregados sin convertir el aprendizaje en vigilancia innecesaria.",
    image: "/info-schools.svg",
    bullets: ["Panel por grupo", "Retos academicos", "Privacidad por defecto"],
  },
  {
    slug: "metodo",
    title: "Metodo de aprendizaje",
    eyebrow: "Memoria activa",
    summary:
      "El desbloqueo por preguntas crea una pequena prueba que ayuda a confirmar si la sesion dejo aprendizaje real.",
    image: "/info-method.svg",
    bullets: ["Active recall", "Fuentes citables", "Repeticion futura"],
  },
];

export type InfoPageSlug = (typeof infoPages)[number]["slug"];
