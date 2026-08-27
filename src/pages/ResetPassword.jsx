import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../services/api";
import styles from "./CSS/login.module.css";
import logo from "../assets/LOGO-DESCOBRE-BRANCA.svg";
import { Eye, EyeSlash, LockKey, CheckCircle, Circle } from "@phosphor-icons/react";

const PASSWORD_RULES = [
  { id: "upper", label: "Pelo menos uma letra maiúscula", test: (v) => /[A-Z]/.test(v) },
  { id: "lower", label: "Pelo menos uma letra minúscula", test: (v) => /[a-z]/.test(v) },
  { id: "number", label: "Pelo menos um número", test: (v) => /[0-9]/.test(v) },
  { id: "special", label: "Pelo menos um caractere especial (!@#$)", test: (v) => /[^A-Za-z0-9]/.test(v) },
  { id: "length", label: "Mínimo de 8 caracteres", test: (v) => v.length >= 8 },
];

function maskEmail(email) {
  const [user, domain] = (email || "").split("@");
  if (!user || !domain) return email || "";
  const visible = user.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(user.length - 2, 1))}@${domain}`;
}

const RESEND_COOLDOWN = 60;

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [touched, setTouched] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState("");

  const ruleResults = PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(newPassword) }));
  const allRulesPassed = ruleResults.every((r) => r.passed);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== "";
  const codeComplete = code.length === 6;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!codeComplete) { setError("Informe o código de 6 dígitos enviado por e-mail."); return; }
    if (!allRulesPassed) { setError("A senha não atende a todos os requisitos."); return; }
    if (!passwordsMatch) { setError("As senhas não coincidem."); return; }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email: email.trim().toLowerCase(), code, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao redefinir senha.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setResendMessage("");
    setError("");
    try {
      await api.post("/auth/forgot-password", { email: email.trim().toLowerCase() });
      setResendMessage("Novo código enviado!");
      setResendCooldown(RESEND_COOLDOWN);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao reenviar código.");
    }
  }

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

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
                <p>
                  {email
                    ? <>Enviamos um código para <strong>{maskEmail(email)}</strong></>
                    : "Digite o código enviado para o seu e-mail"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className={styles.authForm}>
                <div className={styles.authField}>
                  <label>E-mail</label>
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className={styles.authField}>
                  <label>Código</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    required
                    maxLength={6}
                    style={{ letterSpacing: "0.5em", textAlign: "center", fontSize: "1.1rem" }}
                  />
                  <div style={{ marginTop: "6px", fontSize: "0.85rem" }}>
                    {resendCooldown > 0 ? (
                      <span style={{ opacity: 0.7 }}>Reenviar código em {resendCooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResend}
                        style={{ background: "none", border: "none", padding: 0, cursor: "pointer", color: "inherit", textDecoration: "underline" }}
                      >
                        Reenviar código
                      </button>
                    )}
                    {resendMessage && (
                      <span style={{ marginLeft: "8px", color: "#16a34a" }}>✓ {resendMessage}</span>
                    )}
                  </div>
                </div>

                <div className={styles.authField}>
                  <label>Nova senha</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setTouched(true); }}
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

                {touched && (
                  <ul className={styles.passwordChecklist}>
                    {ruleResults.map((rule) => (
                      <li
                        key={rule.id}
                        className={`${styles.checklistItem} ${rule.passed ? styles.checklistPassed : styles.checklistFailed}`}
                      >
                        {rule.passed ? <CheckCircle size={14} weight="fill" /> : <Circle size={14} />}
                        {rule.label}
                      </li>
                    ))}
                  </ul>
                )}

                <div className={styles.authField}>
                  <label>Confirmar nova senha</label>
                  <div className={styles.inputWrapper}>
                    <input
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className={styles.eyeButton}
                      onClick={() => setShowConfirm((v) => !v)}
                      tabIndex={-1}
                      aria-label="Alternar visibilidade da confirmação de senha"
                    >
                      {showConfirm ? <EyeSlash size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {confirmPassword && (
                    <span className={passwordsMatch ? styles.matchSuccess : styles.matchError}>
                      {passwordsMatch ? "✓ As senhas coincidem" : "✗ As senhas não coincidem"}
                    </span>
                  )}
                </div>

                {error && <div className={styles.authError}>⚠️ {error}</div>}

                <button
                  type="submit"
                  className={styles.authButton}
                  disabled={loading || !codeComplete || !allRulesPassed || !passwordsMatch}
                >
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