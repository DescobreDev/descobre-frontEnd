import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../services/api";
import styles from "./CSS/login.module.css";
import logo from "../assets/LOGO-DESCOBRE-BRANCA.svg";
import { Eye, EyeSlash, LockKey, CheckCircle } from "@phosphor-icons/react";

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
  const [countdown, setCountdown] = useState(3);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/reset-password", { email, code, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!success) return;

    if (countdown === 0) {
      navigate("/login");
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [success, countdown, navigate]);

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
                <LockKey size={64} weight="duotone" />
              </div>
            </div>

            <div className={styles.panelHeadline}>
              <h2 className="flex flex-col gap-2">
                <span>Última etapa</span>
                <span>quase lá</span>
              </h2>
              <p>
                Digite o código recebido por e-mail<br />
                e escolha uma nova senha para sua conta.
              </p>
            </div>
          </div>

          <div className={styles.panelBadges}>
            <span className={styles.badge}>Verificação em 2 passos</span>
            <span className={styles.badge}>Dados criptografados</span>
          </div>

        </div>
      </aside>

      {/* ── RIGHT PANEL ── */}
      <main className={styles.authSide}>
        <div className={styles.authCard}>

          {success ? (
            <div className={styles.successState}>
              <div className={styles.successIconWrap}>
                <CheckCircle size={30} weight="fill" color="#16a34a" />
              </div>
              <h2 className={styles.successTitle}>Senha redefinida!</h2>
              <p className={styles.successText}>
                Sua senha foi alterada com sucesso.<br />
                Você já pode entrar com a nova senha.
              </p>
              <div className={styles.redirectHint}>
                <span className={styles.redirectSpinner} />
                Redirecionando em {countdown}s...
              </div>
            </div>
          ) : (
            <>
              <div className={styles.authHeader}>
                <h1>Redefinir senha</h1>
                <p>Digite o código enviado para o seu e-mail</p>
              </div>

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

              <div className={styles.authFooter}>
                <Link to="/login">Voltar ao login</Link>
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}

export default ResetPassword;