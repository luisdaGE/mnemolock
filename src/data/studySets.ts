import type { StudySet } from "../types/domain";

export const studySets: StudySet[] = [
  {
    id: "bio-cell",
    title: "Biologia celular",
    subject: "Ciencias",
    minutes: 35,
    questions: [
      {
        prompt: "Que organelo produce la mayor parte del ATP en celulas eucariotas?",
        options: ["Ribosoma", "Mitocondria", "Lisosoma", "Aparato de Golgi"],
        answerIndex: 1,
        explanation: "La mitocondria realiza respiracion celular y genera ATP.",
        tag: "Energia",
      },
      {
        prompt: "Cual estructura regula el paso de sustancias hacia dentro y fuera de la celula?",
        options: ["Membrana plasmatica", "Nucleolo", "Pared secundaria", "Citoesqueleto"],
        answerIndex: 0,
        explanation: "La membrana plasmatica actua como barrera selectiva.",
        tag: "Membrana",
      },
      {
        prompt: "Que molecula almacena la informacion genetica hereditaria?",
        options: ["ARNt", "ADN", "ATP", "Glucogeno"],
        answerIndex: 1,
        explanation: "El ADN contiene genes y dirige la sintesis de proteinas.",
        tag: "Genetica",
      },
    ],
  },
  {
    id: "history-mx",
    title: "Historia de Mexico",
    subject: "Humanidades",
    minutes: 25,
    questions: [
      {
        prompt: "En que ano inicio la Independencia de Mexico?",
        options: ["1810", "1821", "1910", "1857"],
        answerIndex: 0,
        explanation: "El movimiento inicio el 16 de septiembre de 1810.",
        tag: "Independencia",
      },
      {
        prompt: "Que documento promulgo la Constitucion mexicana vigente?",
        options: ["Plan de Iguala", "Constitucion de 1917", "Leyes de Reforma", "Tratados de Cordoba"],
        answerIndex: 1,
        explanation: "La Constitucion vigente fue promulgada en 1917.",
        tag: "Constitucion",
      },
      {
        prompt: "Quien encabezo el Ejercito Trigarante junto con Vicente Guerrero?",
        options: ["Benito Juarez", "Agustin de Iturbide", "Porfirio Diaz", "Francisco I. Madero"],
        answerIndex: 1,
        explanation: "Iturbide y Guerrero sellaron la alianza del Plan de Iguala.",
        tag: "Consumacion",
      },
    ],
  },
  {
    id: "math-core",
    title: "Algebra esencial",
    subject: "Matematicas",
    minutes: 30,
    questions: [
      {
        prompt: "Si 3x + 6 = 21, cuanto vale x?",
        options: ["3", "5", "7", "9"],
        answerIndex: 1,
        explanation: "Restas 6 y divides entre 3: x = 5.",
        tag: "Ecuaciones",
      },
      {
        prompt: "Cual es la pendiente de y = 2x - 4?",
        options: ["-4", "2", "0", "4"],
        answerIndex: 1,
        explanation: "En y = mx + b, m es la pendiente.",
        tag: "Rectas",
      },
      {
        prompt: "Que expresion equivale a (a + b)^2?",
        options: ["a2 + b2", "a2 + 2ab + b2", "2a + 2b", "a2 - b2"],
        answerIndex: 1,
        explanation: "El cuadrado de un binomio incluye el doble producto.",
        tag: "Productos",
      },
    ],
  },
];
