import { Bell, Database, ShieldCheck, Smartphone } from "lucide-react";

const settingsGroups = [
  {
    icon: ShieldCheck,
    title: "Bloqueo",
    body: "Centralizar aqui perfiles de bloqueo, apps restringidas y reglas por horario.",
  },
  {
    icon: Bell,
    title: "Notificaciones",
    body: "Recordatorios de sesion, avisos de racha y resumen despues de estudiar.",
  },
  {
    icon: Database,
    title: "Datos",
    body: "Preferencias de privacidad, exportacion de historial y sincronizacion de datos.",
  },
  {
    icon: Smartphone,
    title: "Nativo",
    body: "Preparado para permisos iOS/Android cuando el proyecto migre a Capacitor.",
  },
];

export function SettingsPage() {
  return (
    <section className="page-grid">
      <div className="page-intro">
        <p className="eyebrow">Ajustes</p>
        <h1>Controles listos para crecer</h1>
        <p className="lead">
          Esta seccion separa preferencias globales de la sesion activa. Asi podremos agregar bloqueo nativo, privacidad
          y perfiles sin romper el flujo principal.
        </p>
      </div>

      <div className="settings-grid">
        {settingsGroups.map((group) => {
          const Icon = group.icon;
          return (
            <article className="settings-card" key={group.title}>
              <Icon size={22} />
              <h2>{group.title}</h2>
              <p>{group.body}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
