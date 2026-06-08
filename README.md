# MnemoLock

MnemoLock es una PWA de estudio que bloquea la sesion hasta que el usuario demuestra aprendizaje con preguntas del tema que esta repasando.

La idea central: no desbloquear por fuerza de voluntad, sino por memoria activa.

## Estado actual

- App web responsive para computadora y celular.
- Navegacion por rutas para separar estudio, fuentes, datos, producto y ajustes.
- Simulador de bloqueo con fullscreen, wake lock cuando el navegador lo soporta y aviso al intentar cerrar.
- Quiz de desbloqueo con aciertos configurables.
- Modo estricto con penalizacion si el usuario falla.
- Login preparado con Supabase: Google OAuth y registro por email.
- UI para subir PDFs/apuntes como futura fuente de preguntas.
- PWA instalable con manifiesto e icono propio.
- Schema inicial de Supabase con RLS, fuentes, fragmentos citables, sesiones, perfiles, ajustes e intentos.
- Configuracion lista para Vercel.

## Stack

- React + TypeScript
- Vite
- React Router
- Supabase
- CSS propio responsive
- lucide-react para iconos

## Comandos

```bash
npm install
npm run dev
npm run typecheck
npm run build
npm run preview
```

## Estructura

```text
src/
  app/              Router, shell de navegacion y config de rutas.
  components/       UI reutilizable.
  data/             Datos demo y contenido de producto.
  features/         Dominios escalables: auth, estudio, fuentes, dashboard, settings.
  lib/              Clientes externos, como Supabase.
  types/            Tipos de dominio y base de datos.
  utils/            Funciones puras de sesiones de estudio.
  App.tsx           Monta el router.
  styles.css        Sistema visual global.
supabase/
  schema.sql        Tablas, indices y politicas RLS.
docs/
  PROJECT_STRUCTURE.md
  SUPABASE_SETUP.md
  SCALABILITY_PLAN.md
```

## Supabase

1. Copia `.env.example` a `.env.local`.
2. Agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
3. Corre `supabase/schema.sql` en el SQL editor de Supabase.
4. Activa Google Provider en Supabase Auth.
5. Registra tus redirect URLs locales y de Vercel.

Mas detalle en `docs/SUPABASE_SETUP.md`.

## Limite importante

La version web/PWA no puede bloquear otras apps del celular a nivel sistema operativo. Para bloqueo real en celular se necesita una app nativa con iOS FamilyControls/Screen Time y Android Device Policy o Accessibility Service.

## Siguiente fase recomendada

1. Guardar sesiones reales en Supabase.
2. Subir PDFs a Supabase Storage.
3. Extraer texto server-side.
4. Crear `source_chunks`.
5. Generar preguntas enlazadas a `source_chunk_id`.
6. Guardar `quiz_attempts` y `question_attempts`.
7. Crear app nativa con Capacitor + modulos Swift/Kotlin para bloqueo real.
