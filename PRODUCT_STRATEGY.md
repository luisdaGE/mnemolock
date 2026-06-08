# MnemoLock - estrategia de producto

## Posicionamiento

Una app de enfoque para estudiantes que no solo bloquea distracciones: convierte el desbloqueo en una prueba corta de memoria activa. El valor no es castigar al usuario, sino hacer que cada intento de salir refuerce lo que estudia.

## Modelo de negocio

- Gratis: sesiones de bloqueo, bancos manuales de preguntas, rachas y estadisticas basicas.
- Pro individual: generacion de preguntas con IA desde apuntes, fotos, PDFs y videos; repasos espaciados; analiticas por materia.
- Escuelas: panel para profesores, retos por grupo, reportes agregados, politicas de privacidad y SSO.
- Marketplace: packs de preguntas verificados por docentes y creadores; revenue share por venta o suscripcion.
- B2B2C: convenios con academias, preparatorias y plataformas de cursos para mejorar retencion.

## Diferenciadores

- Desbloqueo por dominio, no por fuerza de voluntad.
- Modo estricto con penalizacion corta si falla.
- Logo/filosofia: una puerta cognitiva; el usuario recupera libertad cuando demuestra aprendizaje, no cuando negocia con el impulso.
- PDFs con preguntas citables: cada pregunta debe enlazar al fragmento que la origino para evitar respuestas inventadas.
- Adaptacion futura por dificultad: si falla conceptos, el sistema sube frecuencia de repaso.
- PWA para MVP web y camino nativo posterior para bloqueo real del sistema.

## Debilidades del mercado detectadas

- Bloqueadores que confian demasiado en que el usuario no hara trampa.
- Apps de estudio con preguntas genericas que no se parecen al material real del estudiante.
- Herramientas de IA que no muestran fuente, por lo que el usuario no sabe si confiar.
- Experiencias cargadas de funciones que distraen del objetivo: estudiar y salir solo si aprendiste.

## Roadmap

1. Autenticacion Supabase y guardado real de sesiones.
2. CRUD de materias y preguntas.
3. Importador de PDFs/apuntes con `study_sources` y `source_chunks`.
4. PWA instalable con notificaciones y estadisticas.
5. Version nativa: iOS FamilyControls/Screen Time y Android Device Policy/Accessibility.
