import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import styles from "./CSS/login.module.css";
import logo from "../assets/LOGO-DESCOBRE-BRANCA.svg";
import { EnvelopeSimple, ShieldCheck } from "@phosphor-icons/react";

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
      {/* ── LEFT PANEL ── */}
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
              <div className={styles.panelIconOrb}>
                <EnvelopeSimple size={64} weight="duotone" />
              </div>
            </div>

            <div className={styles.panelHeadline}>
              <h2 className="flex flex-col gap-2">
                <span>Esqueceu sua senha?</span>
                <span>Sem problema.</span>
              </h2>
              <p>
                Enviamos um código de verificação para o seu e-mail.<br />
                Use-o para criar uma nova senha com segurança.
              </p>
            </div>
          </div>

          <div className={styles.panelBadges}>
            <span className={styles.badge}>Código de 6 dígitos</span>
            <span className={styles.badge}>Expira em 15 min</span>
            <span className={styles.badge}>Processo seguro</span>
          </div>

        </div>
      </aside>

      {/* ── RIGHT PANEL ── */}
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