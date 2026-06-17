import { BarChart3, ExternalLink, FileUp, Settings, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { MindLatchLogo } from "../components/Logo";

const appNav = [
  { to: "/dashboard", label: "Estudio", icon: BarChart3 },
  { to: "/sources", label: "Fuentes", icon: FileUp },
  { to: "/strategy", label: "Producto", icon: Sparkles },
  { to: "/settings", label: "Ajustes", icon: Settings },
];

export function AppShell() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="app app-themed">
      <section className="shell">
        <nav className={scrolled ? "topbar app-topbar scrolled" : "topbar app-topbar"} aria-label="Navegación de la app">
          <Link to="/dashboard" className="app-brand" aria-label="MindLatch inicio">
            <MindLatchLogo />
          </Link>

          <div className="app-nav" aria-label="Secciones">
            {appNav.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => (isActive ? "app-nav-link active" : "app-nav-link")}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          <Link className="app-exit" to="/">
            <ExternalLink size={15} />
            <span>Ver sitio</span>
          </Link>
        </nav>

        <Outlet />
      </section>
    </main>
  );
}
