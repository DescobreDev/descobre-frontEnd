import { useContext, useState } from "react";
import { AuthContext } from "../context/authContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import styles from "./CSS/login.module.css";
import logo from "../assets/LOGO-DESCOBRE.svg";
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
      const response = await api.post("/auth/login", {
        email,
        password,
        rememberMe,
      });

      const token = response.data.access_token;

        if (rememberMe) {
          localStorage.setItem("token", token);
        } else {
          localStorage.setItem("token", token);
        }
      const userResponse = await api.get("/users/me");
      setUser(userResponse.data);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Email ou senha incorretos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>

        <div className={styles.authHeader}>
          <div className={styles.logoBox}>
            <img src={logo} alt="Logo Descobre" className={styles.logoImg} />
          </div>
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
    </div>
  );
}

export default Login;