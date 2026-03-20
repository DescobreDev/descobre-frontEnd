import { useContext, useState } from "react";
import { AuthContext } from "../context/authContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import styles from "./CSS/login.module.css";
import logo from "../assets/LOGO-DESCOBRE.svg";
import { CheckCircle, Circle, Eye, EyeSlash } from "@phosphor-icons/react";

// Regras de senha
const PASSWORD_RULES = [
  {
    id: "upper",
    label: "Pelo menos uma letra maiúscula",
    test: (v) => /[A-Z]/.test(v),
  },
  {
    id: "lower",
    label: "Pelo menos uma letra minúscula",
    test: (v) => /[a-z]/.test(v),
  },
  {
    id: "number",
    label: "Pelo menos um número",
    test: (v) => /[0-9]/.test(v),
  },
  {
    id: "special",
    label: "Pelo menos um caractere especial (!@#$...)",
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
  {
    id: "length",
    label: "Mínimo de 8 caracteres",
    test: (v) => v.length >= 8,
  },
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

  const { setUser } = useContext(AuthContext);

  // Avalia cada regra
  const ruleResults = PASSWORD_RULES.map((rule) => ({
    ...rule,
    passed: rule.test(password),
  }));

  const allRulesPassed = ruleResults.every((r) => r.passed);
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (!allRulesPassed) {
      setError("A senha não atende a todos os requisitos.");
      return;
    }

    if (!passwordsMatch) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      const token = response.data.access_token;
      localStorage.setItem("token", token);

      const userResponse = await api.get("/users/me");
      setUser(userResponse.data);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao registrar");
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
          <h1>Criar conta</h1>
          <p>Preencha os dados para se cadastrar</p>
        </div>

        <form onSubmit={handleRegister} className={styles.authForm}>

          {/* Nome */}
          <div className={styles.authField}>
            <label>Nome</label>
            <input
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Email */}
          <div className={styles.authField}>
            <label>Email</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Senha */}
          <div className={styles.authField}>
            <label>Senha</label>
            <div className={styles.inputWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setTouched(true);
                }}
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

          {/* Checklist de requisitos — aparece ao começar a digitar */}
          {touched && (
            <ul className={styles.passwordChecklist}>
              {ruleResults.map((rule) => (
                <li
                  key={rule.id}
                  className={`${styles.checklistItem} ${rule.passed ? styles.checklistPassed : styles.checklistFailed}`}
                >
                  {rule.passed
                    ? <CheckCircle size={15} weight="fill" />
                    : <Circle size={15} />
                  }
                  {rule.label}
                </li>
              ))}
            </ul>
          )}

          {/* Confirmar Senha */}
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
                aria-label="Alternar visibilidade da confirmação"
              >
                {showConfirm ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {/* Feedback inline de confirmação */}
            {confirmPassword && (
              <span
                className={
                  passwordsMatch ? styles.matchSuccess : styles.matchError
                }
              >
                {passwordsMatch ? "✓ As senhas coincidem" : "✗ As senhas não coincidem"}
              </span>
            )}
          </div>

          {/* Erro geral */}
          {error && <div className={styles.authError}>⚠️ {error}</div>}

          <button
            type="submit"
            className={styles.authButton}
            disabled={loading}
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <div className={styles.authFooter}>
          Já tem conta? <Link to="/">Entrar</Link>
        </div>

      </div>
    </div>
  );
}

export default Register;