import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import styles from "./CSS/login.module.css";
import logo from "../assets/LOGO-DESCOBRE-BRANCA.svg";
import { CheckCircle, Circle, Eye, EyeSlash } from "@phosphor-icons/react";

const PASSWORD_RULES = [
  { id: "upper", label: "Pelo menos uma letra maiúscula", test: (v) => /[A-Z]/.test(v) },
  { id: "lower", label: "Pelo menos uma letra minúscula", test: (v) => /[a-z]/.test(v) },
  { id: "number", label: "Pelo menos um número", test: (v) => /[0-9]/.test(v) },
  { id: "special", label: "Pelo menos um caractere especial (!@#$)", test: (v) => /[^A-Za-z0-9]/.test(v) },
  { id: "length", label: "Mínimo de 8 caracteres", test: (v) => v.length >= 8 },
];

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState(false);

  const ruleResults = PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(password) }));
  const allRulesPassed = ruleResults.every((r) => r.passed);
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (!allRulesPassed) { setError("A senha não atende a todos os requisitos."); return; }
    if (!passwordsMatch) { setError("As senhas não coincidem."); return; }

    setLoading(true);
    try {
      await api.post("/auth/register", { name, email, password });
      navigate("/verify-email", { state: { email } });
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao registrar.");
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
              <h2>
                Comece sua jornada de{" "}
                <span className={styles.gradientText}>DESCOBERTAS</span> hoje!
              </h2>

              <p>
                Crie sua conta gratuita e acesse insights que transformam decisões.
              </p>
            </div>
          </div>

          <div className={styles.panelBadges}>
            <span className={styles.badge}>Configuração em minutos</span>
            <span className={styles.badge}>Suporte dedicado</span>
          </div>

        </div>
      </aside>

      {/* ── RIGHT PANEL 30% ── */}
      <main className={styles.authSide}>
        <div className={styles.authCard}>

          <div className={styles.authHeader}>
            <h1>Criar conta</h1>
            <p>Preencha os dados para se cadastrar</p>
          </div>

          <form onSubmit={handleRegister} className={styles.authForm}>

            <div className={styles.authField}>
              <label>Nome</label>
              <input
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
                  onChange={(e) => { setPassword(e.target.value); setTouched(true); }}
                  required
                />
                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
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
              <label>Confirmar senha</label>
              <div className={styles.inputWrapper}>
                <input
                  type={showConfirm ? "text" : "password"}
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
              disabled={loading || !allRulesPassed || !passwordsMatch}
            >
              {loading ? "Criando conta..." : "Criar conta"}
            </button>

          </form>

          <div className={styles.authFooter}>
            Já tem conta? <Link to="/">Entrar</Link>
          </div>

        </div>
      </main>

    </div>
  );
}

export default Register;