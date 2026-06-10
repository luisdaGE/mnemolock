from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    KeepTogether,
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


OUT = Path("docs/MnemoLock_Brief_Claude_Codex.pdf")

BLUE = colors.HexColor("#2E74B5")
DARK_BLUE = colors.HexColor("#1F4D78")
INK = colors.HexColor("#172334")
MUTED = colors.HexColor("#5B6773")
LIGHT_BLUE = colors.HexColor("#E8EEF5")
LIGHT_GRAY = colors.HexColor("#F2F4F7")
BORDER = colors.HexColor("#C9D3DF")
CALLOUT = colors.HexColor("#F6F8FB")


def make_styles():
    base = getSampleStyleSheet()
    styles = {
        "title": ParagraphStyle(
            "title",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=27,
            leading=32,
            textColor=colors.black,
            alignment=TA_LEFT,
            spaceAfter=5,
        ),
        "subtitle": ParagraphStyle(
            "subtitle",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=13,
            leading=17,
            textColor=MUTED,
            spaceAfter=14,
        ),
        "h1": ParagraphStyle(
            "h1",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=20,
            textColor=BLUE,
            spaceBefore=13,
            spaceAfter=7,
            keepWithNext=True,
        ),
        "h2": ParagraphStyle(
            "h2",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=12.5,
            leading=16,
            textColor=DARK_BLUE,
            spaceBefore=8,
            spaceAfter=5,
            keepWithNext=True,
        ),
        "body": ParagraphStyle(
            "body",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=10.2,
            leading=14,
            textColor=INK,
            spaceAfter=6,
        ),
        "small": ParagraphStyle(
            "small",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=8.7,
            leading=11,
            textColor=INK,
            spaceAfter=0,
        ),
        "table": ParagraphStyle(
            "table",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=8.2,
            leading=10.5,
            textColor=INK,
            spaceAfter=0,
        ),
        "table_header": ParagraphStyle(
            "table_header",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=8.3,
            leading=10.5,
            textColor=DARK_BLUE,
            spaceAfter=0,
        ),
        "callout_title": ParagraphStyle(
            "callout_title",
            parent=base["BodyText"],
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=13,
            textColor=DARK_BLUE,
            spaceAfter=3,
        ),
        "prompt": ParagraphStyle(
            "prompt",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=8.4,
            leading=11.3,
            textColor=INK,
            borderPadding=0,
            spaceAfter=0,
        ),
        "footer": ParagraphStyle(
            "footer",
            parent=base["BodyText"],
            fontName="Helvetica",
            fontSize=7.8,
            leading=9,
            textColor=MUTED,
            alignment=TA_CENTER,
        ),
    }
    return styles


def p(text: str, style: ParagraphStyle):
    return Paragraph(text.replace("\n", "<br/>"), style)


def bullets(items, styles):
    return ListFlowable(
        [ListItem(p(item, styles["body"]), leftIndent=10) for item in items],
        bulletType="bullet",
        leftIndent=18,
        bulletFontName="Helvetica",
        bulletFontSize=7,
        bulletColor=BLUE,
        spaceAfter=5,
    )


def numbers(items, styles):
    return ListFlowable(
        [ListItem(p(item, styles["body"]), leftIndent=10) for item in items],
        bulletType="1",
        leftIndent=18,
        bulletFontName="Helvetica",
        bulletFontSize=9,
        bulletColor=BLUE,
        spaceAfter=5,
    )


def table(headers, rows, widths, styles):
    data = [[p(h, styles["table_header"]) for h in headers]]
    for row in rows:
        data.append([p(str(cell), styles["table"]) for cell in row])
    tbl = Table(data, colWidths=[w * inch for w in widths], repeatRows=1, hAlign="LEFT")
    tbl.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), LIGHT_BLUE),
                ("TEXTCOLOR", (0, 0), (-1, 0), DARK_BLUE),
                ("GRID", (0, 0), (-1, -1), 0.45, BORDER),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return [tbl, Spacer(1, 9)]


def meta_table(rows, styles):
    data = [[p(f"<b>{label}</b>", styles["table"]), p(value, styles["table"])] for label, value in rows]
    tbl = Table(data, colWidths=[1.45 * inch, 4.75 * inch], hAlign="LEFT")
    tbl.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), LIGHT_GRAY),
                ("GRID", (0, 0), (-1, -1), 0.45, BORDER),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    return tbl


def callout(title, body, styles):
    data = [[p(title, styles["callout_title"])], [p(body, styles["prompt"])]]
    tbl = Table(data, colWidths=[6.35 * inch], hAlign="LEFT")
    tbl.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), CALLOUT),
                ("BOX", (0, 0), (-1, -1), 0.6, colors.HexColor("#D3DCE8")),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    return [tbl, Spacer(1, 9)]


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(colors.white)
    canvas.rect(0, 0, doc.pagesize[0], doc.pagesize[1], stroke=0, fill=1)
    canvas.setFont("Helvetica", 7.8)
    canvas.setFillColor(MUTED)
    canvas.drawRightString(
        doc.pagesize[0] - doc.rightMargin,
        doc.pagesize[1] - 0.52 * inch,
        "MnemoLock | Brief para mejora con Claude y ejecucion con Codex",
    )
    canvas.drawCentredString(
        doc.pagesize[0] / 2,
        0.47 * inch,
        f"Documento generado desde el repositorio local · Pagina {doc.page}",
    )
    canvas.restoreState()


def section(story, title, styles):
    story.append(Paragraph(title, styles["h1"]))


def build():
    styles = make_styles()
    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=letter,
        rightMargin=1 * inch,
        leftMargin=1 * inch,
        topMargin=0.82 * inch,
        bottomMargin=0.8 * inch,
        title="MnemoLock Brief Claude Codex",
        author="Codex",
    )

    story = [
        p("MnemoLock", styles["title"]),
        p("Brief completo de flujo, negocio, arquitectura y mejoras", styles["subtitle"]),
        meta_table(
            [
                ("Objetivo", "Pasar a Claude una vision completa de la app y recibir mejoras concretas."),
                ("Uso esperado", "Claude propone mejoras; Codex implementa cambios verificables en este repositorio."),
                ("Estado", "MVP web/PWA con bloqueo simulado, quiz de desbloqueo y Supabase preparado."),
                ("Fecha de referencia", "9 de junio de 2026"),
            ],
            styles,
        ),
        Spacer(1, 10),
    ]

    section(story, "1. Resumen ejecutivo", styles)
    story += callout(
        "Idea central",
        "MnemoLock es una PWA de estudio que bloquea la sesion hasta que el usuario demuestra aprendizaje con preguntas del tema. El desbloqueo no depende de fuerza de voluntad, sino de memoria activa.",
        styles,
    )
    story.append(
        bullets(
            [
                "Promesa: convertir cada intento de salir de una distraccion en una microevaluacion util.",
                "MVP actual: experiencia web responsive, rutas de producto, demo de bloqueo, quiz configurable, modo estricto, login Supabase preparado y ruta de fuentes.",
                "Diferenciador: preguntas enlazadas a fragmentos citables del material del estudiante para evitar IA opaca o bancos genericos.",
                "Limite tecnico: la PWA no puede bloquear otras apps a nivel sistema operativo; el bloqueo real requiere app nativa posterior.",
            ],
            styles,
        )
    )

    section(story, "2. Flujo principal del usuario", styles)
    story += table(
        ["Paso", "Pantalla / modulo", "Que ocurre", "Dato clave"],
        [
            ("1", "Estudio / Dashboard", "El usuario elige materia, duracion y modo estricto.", "study_set, unlockTarget, cooldownMinutes"),
            ("2", "Sesion bloqueada", "La app entra en fullscreen, activa wake lock si el navegador lo permite y avisa antes de cerrar.", "SessionState = locked"),
            ("3", "Quiz", "Al terminar el tiempo, el usuario responde preguntas del tema.", "answers, activeQuestion, correctCount"),
            ("4", "Desbloqueo", "Si alcanza los aciertos requeridos, sale de fullscreen y la sesion queda desbloqueada.", "SessionState = unlocked"),
            ("5", "Penalizacion", "Si falla, modo estricto reinicia bloqueo con cooldown; sin estricto se queda en quiz.", "cooldownMinutes x 60"),
        ],
        [0.48, 1.42, 3.02, 1.45],
        styles,
    )
    story.append(p("Flujo visual resumido: Elegir tema -> Iniciar bloqueo -> Esperar foco -> Responder quiz -> Desbloquear si aprende -> Penalizar si falla.", styles["body"]))

    section(story, "3. Rutas y experiencia actual", styles)
    story += table(
        ["Ruta", "Funcion", "Estado actual"],
        [
            ("/", "Home de estudio y demo", "Explica la promesa, muestra vista rapida e inicia demo."),
            ("/login", "Acceso", "Email/password y Google OAuth conectados a Supabase cuando existen variables de entorno."),
            ("/sources", "Fuentes", "Selector local de PDF/TXT/MD y pipeline visual de extraccion, filtrado, preguntas y citas."),
            ("/dashboard", "Espacio de estudio", "Guia paso a paso, controles de sesion y CTA para subir apuntes."),
            ("/strategy", "Producto", "Diferenciadores, debilidades del mercado y modelo de negocio."),
            ("/settings", "Ajustes", "Estructura futura para bloqueo, notificaciones, datos y permisos nativos."),
            ("/info/:slug", "Contenido informativo", "Paginas educativas sobre metodo, estudiantes y escuelas."),
        ],
        [0.9, 1.65, 3.82],
        styles,
    )

    section(story, "4. Modelo mental del producto", styles)
    story.append(
        bullets(
            [
                "El bloqueo no debe sentirse como castigo permanente: es una puerta cognitiva temporal.",
                "El estudiante recupera acceso cuando demuestra dominio, no cuando negocia con la app.",
                "La IA debe ser verificable: cada pregunta generada tiene fuente, fragmento y pagina cuando aplique.",
                "El MVP debe preservar una experiencia simple; las funciones avanzadas no deben esconder el boton principal: estudiar.",
                "El camino nativo debe tratarse como fase posterior, no como promesa falsa de la PWA.",
            ],
            styles,
        )
    )

    story.append(PageBreak())
    section(story, "5. Arquitectura tecnica actual", styles)
    story += table(
        ["Capa", "Implementacion", "Observaciones"],
        [
            ("Frontend", "React 18 + TypeScript + Vite", "App responsive con CSS propio y lucide-react."),
            ("Rutas", "react-router-dom", "Shell global en src/app y pantallas por feature."),
            ("Estado de sesion", "useStudySession", "Controla selectedSet, timer, quiz, fullscreen, wake lock y penalizacion."),
            ("Datos demo", "src/data/studySets.ts", "Materias iniciales: Biologia celular, Historia de Mexico y Algebra esencial."),
            ("Auth", "Supabase client", "Email/password y Google OAuth; fallback si faltan env vars."),
            ("Base de datos", "supabase/schema.sql", "RLS, perfiles, ajustes, fuentes, chunks, sesiones e intentos."),
            ("Deploy", "Vercel", "Scripts listos: dev, typecheck, build, preview."),
        ],
        [1.25, 2.0, 3.12],
        styles,
    )

    section(story, "6. Modelo de datos propuesto", styles)
    story += table(
        ["Tabla", "Proposito"],
        [
            ("profiles", "Perfil y rol: student, guardian, teacher o admin."),
            ("user_settings", "Aciertos por defecto, cooldown, modo estricto y preferencias."),
            ("study_sets", "Materias/conjuntos de estudio por usuario."),
            ("questions", "Preguntas, opciones, respuesta, dificultad, explicacion y source_chunk_id."),
            ("study_sources", "Archivos cargados por usuario: nombre, ruta, MIME y estado."),
            ("source_chunks", "Fragmentos citables con indice, contenido, pagina y metadata."),
            ("focus_sessions", "Ciclo de bloqueo: duracion, estado, inicio, fin y metadata."),
            ("quiz_attempts", "Resultado agregado de cada intento de desbloqueo."),
            ("question_attempts", "Respuesta seleccionada y acierto/error por pregunta."),
        ],
        [1.55, 4.82],
        styles,
    )
    story += callout(
        "Decision critica de confianza",
        "No generar preguntas sueltas sin source_chunk_id cuando vengan de materiales del usuario. La trazabilidad es parte del producto, no solo una mejora tecnica.",
        styles,
    )

    section(story, "7. Modelo de negocio", styles)
    story += table(
        ["Linea", "Oferta", "Razon estrategica"],
        [
            ("Gratis", "Sesiones, bancos manuales, rachas y estadisticas basicas.", "Reduce friccion y valida habito."),
            ("Pro individual", "IA desde apuntes, fotos, PDFs y videos; repasos espaciados; analiticas.", "Monetiza el valor principal: convertir material propio en desbloqueo confiable."),
            ("Escuelas", "Panel docente, retos por grupo, reportes agregados, privacidad y SSO.", "Expande a B2B con valor institucional."),
            ("Marketplace", "Packs verificados por docentes y creadores.", "Crea inventario educativo y revenue share."),
            ("B2B2C", "Convenios con academias, preparatorias y plataformas de cursos.", "Canal de adquisicion y retencion por cohortes."),
        ],
        [1.0, 2.48, 2.89],
        styles,
    )

    section(story, "8. Oportunidad de mercado y diferenciadores", styles)
    story.append(
        bullets(
            [
                "Bloqueadores tradicionales dependen de autocontrol y pueden ser faciles de rodear.",
                "Apps de estudio suelen usar bancos genericos que no coinciden con el examen real.",
                "Herramientas de IA educativas fallan cuando no muestran fuente ni explican de donde sale la pregunta.",
                "MnemoLock combina foco, recuperacion activa y trazabilidad: tres problemas en un flujo corto.",
            ],
            styles,
        )
    )

    section(story, "9. Roadmap recomendado", styles)
    story.append(
        numbers(
            [
                "Persistir sesiones reales en Supabase y separar datos demo de datos del usuario.",
                "Crear CRUD de materias y preguntas con validaciones y estados vacios profesionales.",
                "Subir PDFs a Supabase Storage, insertar study_sources y procesar texto server-side.",
                "Partir texto en source_chunks y generar preguntas con source_chunk_id obligatorio.",
                "Guardar quiz_attempts y question_attempts para analiticas y repaso espaciado.",
                "Agregar dashboard de progreso por materia, debilidad, racha y confiabilidad de fuentes.",
                "Convertir PWA en app nativa con Capacitor y modulos iOS/Android para bloqueo real.",
                "Construir modo escuela: grupos, docentes, assignments, reportes agregados y SSO.",
            ],
            styles,
        )
    )

    story.append(PageBreak())
    section(story, "10. Riesgos y limites", styles)
    story += table(
        ["Riesgo", "Impacto", "Mitigacion"],
        [
            ("Bloqueo web limitado", "La PWA no puede bloquear otras apps del celular.", "Comunicarlo con honestidad y planear fase nativa."),
            ("IA sin fuente", "Preguntas incorrectas reducen confianza.", "Exigir citas y revisar fragmentos antes de aceptar."),
            ("Friccion al estudiar", "El usuario abandona si configurar toma demasiado.", "Primer flujo con demo, defaults y subida simple."),
            ("Privacidad escolar", "Datos de menores o grupos requieren cuidado.", "RLS, politicas claras, roles y reportes agregados."),
            ("Complejidad de permisos nativos", "iOS/Android requieren caminos distintos.", "Aislar logica de sesion y planear adaptadores nativos."),
        ],
        [1.65, 2.12, 2.6],
        styles,
    )

    section(story, "11. Prompt listo para Claude", styles)
    story.append(p("Copia y pega este bloque en Claude para pedirle una mejora estructurada del producto:", styles["body"]))
    story += callout(
        "Prompt para Claude",
        "Actua como estratega de producto, arquitecto tecnico y UX lead. Estoy construyendo MnemoLock, una PWA de estudio que bloquea una sesion hasta que el usuario demuestra aprendizaje con un quiz. El MVP actual tiene React + TypeScript + Vite, Supabase preparado, rutas de estudio/fuentes/dashboard/producto/ajustes, bloqueo simulado con fullscreen/wake lock/beforeunload, quiz configurable y modo estricto. La promesa es desbloquear por memoria activa, no por fuerza de voluntad. La futura ventaja es subir PDFs/apuntes, extraer fragmentos citables y generar preguntas enlazadas a source_chunk_id. Revisa el flujo, modelo de negocio, UX, datos, riesgos, monetizacion y roadmap. Devuelveme: 1) mejoras priorizadas por impacto, 2) cambios concretos en pantallas, 3) cambios de arquitectura/base de datos, 4) experimentos de negocio, 5) texto de producto mejorado, 6) lista exacta de tareas para que Codex implemente en el repo. No propongas bloqueo real web de otras apps; si hablas de bloqueo real, marcala como fase nativa con iOS/Android.",
        styles,
    )

    section(story, "12. Formato de respuesta que Claude debe devolver", styles)
    story.append(
        bullets(
            [
                "Prioridad: P0, P1 o P2.",
                "Tipo: producto, UX, frontend, datos, backend, negocio o copy.",
                "Archivos probables a tocar.",
                "Cambio esperado en una frase.",
                "Criterios de aceptacion verificables.",
                "Riesgos o dependencias.",
            ],
            styles,
        )
    )

    section(story, "13. Instrucciones para Codex al implementar", styles)
    story.append(
        bullets(
            [
                "Leer primero README.md, PRODUCT_STRATEGY.md, docs/PROJECT_STRUCTURE.md, docs/SCALABILITY_PLAN.md y supabase/schema.sql.",
                "Mantener la arquitectura por features; no volver a concentrar logica en App.tsx.",
                "No prometer bloqueo real del sistema desde la PWA; cualquier texto debe distinguir demo web vs fase nativa.",
                "Preservar la trazabilidad: preguntas generadas desde fuentes deben enlazarse a source_chunks.",
                "Antes de cambios grandes, correr npm run typecheck y npm run build si las dependencias estan instaladas.",
                "Agregar tests en utils/study.ts y luego cubrir LockPanel / flujo E2E cuando el alcance toque sesion.",
                "Mantener UI simple, responsive y enfocada en iniciar una sesion rapido.",
            ],
            styles,
        )
    )

    section(story, "14. Tareas iniciales sugeridas para Codex", styles)
    story += table(
        ["Prioridad", "Tarea", "Archivos probables", "Aceptacion"],
        [
            ("P0", "Persistir focus_sessions y quiz_attempts cuando Supabase este configurado.", "useStudySession, lib/supabase, types/database", "Una sesion crea/actualiza registros y maneja fallback demo."),
            ("P0", "Crear CRUD basico de study_sets/questions.", "features/dashboard, data, supabase helpers", "Usuario autenticado puede crear materia y preguntas propias."),
            ("P1", "Implementar subida real a Supabase Storage.", "SourcesPage, lib/supabase, schema/storage docs", "Archivo sube, crea study_sources y muestra estado."),
            ("P1", "Crear Edge Function o worker para chunking.", "supabase/functions, sourcePipeline", "source_chunks quedan asociados con pagina/metadata."),
            ("P1", "Mejorar dashboard con progreso real.", "DashboardPage, query layer", "Muestra sesiones, intentos, aciertos y materias debiles."),
            ("P2", "Preparar arquitectura nativa Capacitor.", "docs, config, future native adapters", "Documento tecnico separa PWA y bloqueo nativo."),
        ],
        [0.68, 2.17, 1.76, 1.76],
        styles,
    )

    section(story, "15. Glosario operativo", styles)
    story += table(
        ["Termino", "Definicion"],
        [
            ("Memoria activa", "Recuperar informacion sin verla; base pedagogica del desbloqueo."),
            ("Modo estricto", "Si el usuario falla el quiz, vuelve a bloqueo con cooldown."),
            ("source_chunk", "Fragmento de material usado como evidencia para una pregunta."),
            ("unlockTarget", "Cantidad minima de aciertos para desbloquear."),
            ("focus_session", "Registro persistente de una sesion de enfoque/bloqueo."),
            ("quiz_attempt", "Intento de desbloqueo con resultado passed/failed."),
        ],
        [1.5, 4.87],
        styles,
    )

    section(story, "16. Cierre", styles)
    story.append(
        p(
            "La mejora mas importante no es agregar muchas funciones: es cerrar el ciclo entre material propio, pregunta verificable, intento de desbloqueo y aprendizaje medible. Todo cambio deberia reforzar ese ciclo.",
            styles["body"],
        )
    )

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(OUT)


if __name__ == "__main__":
    build()
