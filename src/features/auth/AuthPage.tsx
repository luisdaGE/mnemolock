import { LogIn, ShieldCheck, UserPlus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleMark } from "../../components/GoogleMark";
import { appConfig } from "../../config/appConfig";
import { signInWithEmail, signInWithGoogle, signUpWithEmail } from "../../lib/supabase";

export function AuthPage() {
  const navigate = useNavigate();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [message, setMessage] = useState("Accede para guardar tus sesiones, materias y progreso.");

  async function handleLogin() {
    if (!loginEmail || loginPassword.length < appConfig.minPasswordLength) {
      setMessage(`Escribe tu correo y una contrasena de al menos ${appConfig.minPasswordLength} caracteres.`);
      return;
    }

    const { error } = await signInWithEmail(loginEmail, loginPassword);
    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Sesion iniciada.");
    navigate("/dashboard");
  }

  async function handleSignup() {
    if (!signupEmail || signupPassword.length < appConfig.minPasswordLength) {
      setMessage(`Crea una contrasena de al menos ${appConfig.minPasswordLength} caracteres.`);
      return;
    }

    const { error } = await signUpWithEmail(signupEmail, signupPassword);
    setMessage(error ? error.message : "Revisa tu correo para confirmar la cuenta.");
  }

  async function handleGoogleLogin() {
    const { error } = await signInWithGoogle();
    if (error) setMessage(error.message);
  }

  return (
    <section className="auth-page centered-auth-page" aria-labelledby="auth-page-title">
      <div className="auth-page-copy centered-auth-copy">
        <p className="eyebrow">Acceso</p>
        <h1 id="auth-page-title">Entra a MnemoLock</h1>
        <p className="lead">
          Guarda sesiones, materias y resultados. Al iniciar, iras directo a tu espacio de estudio.
        </p>
        <span className="auth-mini-proof">
          <ShieldCheck size={16} />
          Sin tarjeta para empezar
        </span>
      </div>

      <div className="auth-modules" aria-live="polite">
        <p className="auth-message">{message}</p>
        <div className="auth-card-grid">
          <article className="auth-module">
            <div className="auth-module-title">
              <LogIn size={20} />
              <h2>Iniciar sesion</h2>
            </div>
            <label>
              Correo electronico
              <input
                className="auth-input"
                onChange={(event) => setLoginEmail(event.target.value)}
                placeholder="tu@email.com"
                type="email"
                value={loginEmail}
              />
            </label>
            <label>
              Contrasena
              <input
                className="auth-input"
                onChange={(event) => setLoginPassword(event.target.value)}
                placeholder="Tu contrasena"
                type="password"
                value={loginPassword}
              />
            </label>
            <button className="auth-submit primary-btn full" onClick={handleLogin}>
              Iniciar sesion
            </button>
          </article>

          <article className="auth-module">
            <div className="auth-module-title">
              <UserPlus size={20} />
              <h2>Crear cuenta</h2>
            </div>
            <label>
              Correo electronico
              <input
                className="auth-input"
                onChange={(event) => setSignupEmail(event.target.value)}
                placeholder="tu@email.com"
                type="email"
                value={signupEmail}
              />
            </label>
            <label>
              Contrasena
              <input
                className="auth-input"
                onChange={(event) => setSignupPassword(event.target.value)}
                placeholder="Minimo 6 caracteres"
                type="password"
                value={signupPassword}
              />
            </label>
            <button className="auth-submit secondary-btn full" onClick={handleSignup}>
              Crear cuenta
            </button>
          </article>
        </div>

        <div className="google-auth-block">
          <span>O continua con tu cuenta favorita</span>
          <button className="google-btn" onClick={handleGoogleLogin}>
            <GoogleMark />
            Iniciar sesion con Google
          </button>
        </div>
      </div>
    </section>
  );
}
