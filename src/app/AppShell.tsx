import { LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { BrandMark } from "../components/BrandMark";

const landingLinks = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#mas-informacion", label: "Mas informacion" },
];

export function AppShell() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="app">
      <section className="shell">
        <nav className={scrolled ? "topbar scrolled" : "topbar"} aria-label="Navegacion principal">
          <Link className="brand" to="/">
            <BrandMark />
            <span>MnemoLock</span>
          </Link>
          <div className="nav-links" aria-label="Secciones de la pagina">
            {landingLinks.map((item) => (
              <a href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
          </div>
          <div className="topbar-actions">
            <Link className="secondary-btn" to="/login">
              <LogIn size={16} />
              Iniciar sesion
            </Link>
          </div>
        </nav>

        <Outlet />
      </section>
    </main>
  );
}
