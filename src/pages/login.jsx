import { useContext, useState } from "react";
import { AuthContext } from "../context/authContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import styles from "./CSS/login.module.css";
import logo from "../assets/LOGO-DESCOBRE-BRANCA.svg";
import { Eye, EyeSlash } from "@phosphor-icons/react";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setUser } = useContext(AuthContext);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password, rememberMe });

      const token = response.data.access_token;
      localStorage.setItem("token", token);

      const userResponse = await api.get("/users/me");
      setUser(userResponse.data);

      navigate("/dashboard");
    } catch (err) {
      const data = err.response?.data;

      if (err.response?.status === 403 && data?.error === "email_not_verified") {
        navigate("/verify-email", { state: { email: data.email } });
        return;
      }

      setError(data?.message || "Email ou senha incorretos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.authContainer}>
      {/* ── LEFT PANEL 70% ── */}
      <aside className={styles.authPanel}>
        <div className={styles.panelContent}>

          <div className={styles.panelLogo}>
            <img src={logo} alt="Descobre" className={styles.panelLogoImg} />
          </div>

          <div className={styles.panelArt}>
            <div className={styles.orbStack}>
              <div className={`${styles.orb} ${styles.orbOuter}`} />
              <div className={`${styles.orb} ${styles.orbMid}`} />
              <div className={`${styles.orb} ${styles.orbInner}`} />
              <div className={styles.orbGlow} />
              <div className={styles.orbRing} />
            </div>

            <div className={styles.panelHeadline}>

              <h2 className="flex flex-col gap-2">
                <span>Contrate mais rápido,</span>
                <span>com menos esforço</span>
              </h2>
              <p>Vagas, candidatos e entrevistas<br />gerenciados com alta segurança e desempenho.</p>
            </div>
          </div>

          <div className={styles.panelBadges}>
            <span className={styles.badge}>Descrições geradas por IA</span>
            <span className={styles.badge}>Triagem automática</span>
            <span className={styles.badge}>Gestão de vagas</span>
          </div>

        </div>
      </aside>

      {/* ── RIGHT PANEL 30% ── */}
      <main className={styles.authSide}>
        <div className={styles.authCard}>

          <div className={styles.authHeader}>
            <h1>Entrar</h1>
            <p>Bem-vindo de volta</p>
          </div>

          <form onSubmit={handleLogin} className={styles.authForm}>

            <div className={styles.authField}>
              <label>E-mail</label>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.authField}>
              <label>Senha</label>
              <div className={styles.inputWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label="Alternar visibilidade da senha"
                >
                  {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className={styles.rememberRow}>
              <label className={styles.rememberLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={styles.rememberCheckbox}
                />
                Mantenha-me conectado
              </label>
            </div>

            {error && <div className={styles.authError}>⚠️ {error}</div>}

            <button type="submit" className={styles.authButton} disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>

          </form>

          <div className={styles.authFooter}>
            Não tem conta? <Link to="/register">Criar conta</Link>
          </div>

        </div>
      </main>

    </div>
  );
}

export default Login;