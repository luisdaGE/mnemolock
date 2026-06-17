import { ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMark } from "../../components/GoogleMark";
import { appConfig } from "../../config/appConfig";
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from "../../lib/supabase";

export function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("Accede para guardar tus sesiones, materias y progreso.");
  const [loadingAction, setLoadingAction] = useState<"login" | "signup" | "google" | null>(null);

  async function handleLogin() {
    if (!email || password.length < appConfig.minPasswordLength) {
      setMessage(`Escribe tu correo y una contraseña de al menos ${appConfig.minPasswordLength} caracteres.`);
      return;
    }

    setLoadingAction("login");
    const { error } = await signInWithEmail(email, password);
    setLoadingAction(null);
    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Sesión iniciada.");
    navigate("/dashboard?welcome=1");
  }

  async function handleSignup() {
    if (!email || password.length < appConfig.minPasswordLength) {
      setMessage(`Crea una contraseña de al menos ${appConfig.minPasswordLength} caracteres.`);
      return;
    }

    setLoadingAction("signup");
    const { error } = await signUpWithEmail(email, password);
    setLoadingAction(null);
    setMessage(error ? error.message : "Revisa tu correo para confirmar la cuenta.");
  }

  async function handleGoogleLogin() {
    setLoadingAction("google");
    const { error } = await signInWithGoogle();
    setLoadingAction(null);
    if (error) setMessage(error.message);
  }

  const isLogin = mode === "login";

  return (
    <section className="ml-section ml-auth" aria-labelledby="auth-title">
      <div className="ml-container ml-auth-card">
        <div className="ml-auth-head">
          <span className="ml-eyebrow" style={{ justifyContent: "center" }}>
            Acceso
          </span>
          <h1 id="auth-title">{isLogin ? "Bienvenido de vuelta" : "Crea tu cuenta"}</h1>
          <p>Guarda sesiones, materias y resultados. Al entrar irás directo a tu espacio de estudio.</p>
        </div>

        <div className="ml-auth-tabs" role="tablist">
          <button
            className={isLogin ? "active" : ""}
            role="tab"
            aria-selected={isLogin}
            onClick={() => setMode("login")}
          >
            Iniciar sesión
          </button>
          <button
            className={!isLogin ? "active" : ""}
            role="tab"
            aria-selected={!isLogin}
            onClick={() => setMode("signup")}
          >
            Crear cuenta
          </button>
        </div>

        <p className="ml-auth-msg" aria-live="polite">
          {message}
        </p>

        <div className="ml-field">
          <label htmlFor="auth-email">Correo electrónico</label>
          <input
            id="auth-email"
            className="ml-input"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="tu@email.com"
            type="email"
            value={email}
          />
        </div>
        <div className="ml-field">
          <label htmlFor="auth-password">Contraseña</label>
          <input
            id="auth-password"
            className="ml-input"
            onChange={(event) => setPassword(event.target.value)}
            placeholder={isLogin ? "Tu contraseña" : `Mínimo ${appConfig.minPasswordLength} caracteres`}
            type="password"
            value={password}
          />
        </div>

        {isLogin ? (
          <>
            <button
              className="ml-btn ml-btn-primary ml-btn-block"
              disabled={loadingAction === "login"}
              onClick={handleLogin}
            >
              {loadingAction === "login" ? "Entrando..." : "Iniciar sesión"}
            </button>
            <a className="ml-auth-link" href="mailto:soporte@mindlatch.app?subject=Recuperar%20contrasena">
              Olvidé mi contraseña
            </a>
          </>
        ) : (
          <button
            className="ml-btn ml-btn-primary ml-btn-block"
            disabled={loadingAction === "signup"}
            onClick={handleSignup}
          >
            {loadingAction === "signup" ? "Creando..." : "Crear cuenta gratis"}
          </button>
        )}

        <div className="ml-auth-divider">o continúa con</div>

        <button className="ml-google-btn" disabled={loadingAction === "google"} onClick={handleGoogleLogin}>
          <GoogleMark />
          {loadingAction === "google" ? "Abriendo Google..." : "Google"}
        </button>

        <small className="ml-auth-small">
          MindLatch funciona como bloqueo cognitivo web; el bloqueo total del sistema requiere apps nativas.
        </small>

        <div className="ml-auth-aside">
          <span>
            <ShieldCheck size={16} />
            Sin tarjeta
          </span>
          <span>
            <Zap size={16} />
            Listo en 30s
          </span>
          <span>
            <Sparkles size={16} />
            Plan gratis
          </span>
        </div>
      </div>
    </section>
  );
}
