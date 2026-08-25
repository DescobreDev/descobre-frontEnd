import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import styles from "./CSS/login.module.css";
import logo from "../assets/LOGO-DESCOBRE-BRANCA.svg";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/forgot-password", { email });
      navigate("/reset-password", { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao solicitar redefinição.");
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
            <h1>Esqueceu a senha?</h1>
            <p>Enviaremos um código para o seu e-mail</p>
          </div>

          <form onSubmit={handleSubmit} className={styles.authForm}>
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

            {error && <div className={styles.authError}>⚠️ {error}</div>}

            <button type="submit" className={styles.authButton} disabled={loading}>
              {loading ? "Enviando..." : "Enviar código"}
            </button>
          </form>

          <div className={styles.authFooter}>
            Lembrou a senha? <Link to="/login">Voltar ao login</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ForgotPassword;