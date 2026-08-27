import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import styles from "./CSS/login.module.css";
import logo from "../assets/LOGO-DESCOBRE-BRANCA.svg";
import { EnvelopeSimple, PaperPlaneTilt } from "@phosphor-icons/react";

function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState(3);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const cleanEmail = email.trim().toLowerCase();

    try {
      await api.post("/auth/forgot-password", { email: cleanEmail });
      setEmail(cleanEmail);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao solicitar redefinição.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!sent) return;

    if (countdown === 0) {
      navigate("/reset-password", { state: { email } });
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [sent, countdown, navigate, email]);

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

          {sent ? (
            <div className={styles.successState}>
              <div className={styles.successIconWrap}>
                <PaperPlaneTilt size={30} weight="fill" color="#16a34a" />
              </div>
              <h2 className={styles.successTitle}>Verifique seu e-mail</h2>
              <p className={styles.successText}>
                Se esse e-mail estiver cadastrado, você vai receber um<br />
                código de verificação em instantes. Confira o spam também.
              </p>
              <div className={styles.redirectHint}>
                <span className={styles.redirectSpinner} />
                Redirecionando em {countdown}s...
              </div>
            </div>
          ) : (
            <>
              <div className={styles.authHeader}>
                <h1>Esqueceu a senha?</h1>
                <p>Enviaremos um código para o seu e-mail</p>
              </div>

              <form onSubmit={handleSubmit} className={styles.authForm}>
                <div className={styles.authField}>
                  <label>E-mail</label>
                  <input
                    type="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {error && <div className={styles.authError}>⚠️ {error}</div>}

                <button
                  type="submit"
                  className={styles.authButton}
                  disabled={loading || !email.trim()}
                >
                  {loading ? "Enviando..." : "Enviar código"}
                </button>
              </form>

              <div className={styles.authFooter}>
                Lembrou a senha? <Link to="/login">Voltar ao login</Link>
              </div>
              <div className={styles.authFooter}>
                Não tem conta? <Link to="/register">Criar conta</Link>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}

export default ForgotPassword;