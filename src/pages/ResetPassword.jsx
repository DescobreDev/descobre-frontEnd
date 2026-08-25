import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../services/api";
import styles from "./CSS/login.module.css";
import logo from "../assets/LOGO-DESCOBRE-BRANCA.svg";
import { Eye, EyeSlash } from "@phosphor-icons/react";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/reset-password", { email, code, newPassword });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.authContainer}>
      <aside className={styles.authPanel}>
        <div className={styles.panelContent}>
          <div className={styles.panelLogo}>
            <img src={logo} alt="Descobre" className={styles.panelLogoImg} />
          </div>
        </div>
      </aside>

      <main className={styles.authSide}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <h1>Redefinir senha</h1>
            <p>Digite o código enviado para o seu e-mail</p>
          </div>

          {success ? (
            <div className={styles.authForm}>
              <p>Senha redefinida com sucesso! Redirecionando...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.authForm}>
              <div className={styles.authField}>
                <label>E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.authField}>
                <label>Código</label>
                <input
                  type="text"
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  maxLength={6}
                />
              </div>

              <div className={styles.authField}>
                <label>Nova senha</label>
                <div className={styles.inputWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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

              {error && <div className={styles.authError}>⚠️ {error}</div>}

              <button type="submit" className={styles.authButton} disabled={loading}>
                {loading ? "Redefinindo..." : "Redefinir senha"}
              </button>
            </form>
          )}

          <div className={styles.authFooter}>
            <Link to="/login">Voltar ao login</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ResetPassword;