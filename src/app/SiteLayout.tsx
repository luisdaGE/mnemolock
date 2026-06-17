import { ArrowRight, Github, Linkedin, Menu, Twitter, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { MindLatchLogo } from "../components/Logo";

const navLinks = [
  { href: "/#como-funciona", label: "Cómo funciona" },
  { href: "/#caracteristicas", label: "Características" },
  { href: "/#casos", label: "Casos de uso" },
  { href: "/#preguntas", label: "Preguntas" },
];

const footerCols = [
  {
    title: "Producto",
    links: [
      { href: "/#como-funciona", label: "Cómo funciona" },
      { href: "/#caracteristicas", label: "Características" },
      { href: "/#comparativa", label: "Comparativa" },
      { href: "/login", label: "Crear cuenta" },
    ],
  },
  {
    title: "Recursos",
    links: [
      { href: "/info/metodo", label: "El método" },
      { href: "/info/estudiantes", label: "Para estudiantes" },
      { href: "/info/escuelas", label: "Para escuelas" },
      { href: "/#preguntas", label: "Preguntas frecuentes" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { href: "/#casos", label: "Casos de uso" },
      { href: "mailto:hola@mindlatch.app", label: "Contacto" },
      { href: "/login", label: "Iniciar sesión" },
    ],
  },
];

export function SiteLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="site">
      <header className={scrolled ? "ml-header scrolled" : "ml-header"}>
        <div className="ml-container">
          <div className="ml-header-inner">
            <Link to="/" onClick={() => setMenuOpen(false)} aria-label="MindLatch inicio">
              <MindLatchLogo />
            </Link>

            <nav className="ml-nav" aria-label="Navegación principal">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="ml-header-actions">
              <Link className="ml-link-quiet ml-desktop-only" to="/login">
                Iniciar sesión
              </Link>
              <Link className="ml-btn ml-btn-primary ml-btn-sm ml-desktop-only" to="/login">
                Empezar gratis
                <ArrowRight size={16} />
              </Link>
              <button
                className="ml-burger"
                aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen((v) => !v)}
              >
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          <div className={menuOpen ? "ml-mobile-menu open" : "ml-mobile-menu"}>
            <nav aria-label="Navegación móvil">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="ml-mobile-actions">
              <Link className="ml-btn ml-btn-ghost" to="/login" onClick={() => setMenuOpen(false)}>
                Iniciar sesión
              </Link>
              <Link className="ml-btn ml-btn-primary" to="/login" onClick={() => setMenuOpen(false)}>
                Empezar gratis
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main id="contenido">
        <Outlet />
      </main>

      <footer className="ml-footer">
        <div className="ml-container">
          <div className="ml-footer-grid">
            <div className="ml-footer-brand">
              <Link to="/" aria-label="MindLatch inicio">
                <MindLatchLogo />
              </Link>
              <p>
                La puerta cognitiva para estudiar: bloquea el impulso y desbloquea solo cuando demuestras que aprendiste.
              </p>
            </div>

            {footerCols.map((col) => (
              <div className="ml-footer-col" key={col.title}>
                <h4>{col.title}</h4>
                <ul>
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="ml-footer-bottom">
            <span>© {new Date().getFullYear()} MnemoLock. Hecho para quien estudia en serio.</span>
            <div className="ml-footer-social">
              <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noreferrer">
                <Twitter size={18} />
              </a>
              <a href="https://github.com" aria-label="GitHub" target="_blank" rel="noreferrer">
                <Github size={18} />
              </a>
              <a href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noreferrer">
                <Linkedin size={18} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
