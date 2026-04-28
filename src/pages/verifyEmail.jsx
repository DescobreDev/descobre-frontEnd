import { useState, useRef, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import api from "../services/api";
import styles from "./CSS/login.module.css";
import logo from "../assets/LOGO-DESCOBRE-BRANCA.svg";

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useContext(AuthContext);

  const email = location.state?.email ?? "";

  useEffect(() => {
    if (!email) navigate("/", { replace: true });
  }, [email, navigate]);

  const [digits, setDigits]             = useState(["", "", "", "", "", ""]);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState("");
  const [success, setSuccess]           = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  function handleDigitChange(index, value) {
    const clean = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    setError("");
    if (clean && index < 5) inputRefs.current[index + 1]?.focus();
    if (clean && index === 5) {
      const fullCode = next.join("");
      if (fullCode.length === 6) handleVerify(fullCode);
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !digits[index] && index > 0)
      inputRefs.current[index - 1]?.focus();
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    if (pasted.length === 6) handleVerify(pasted);
  }

  async function handleVerify(code) {
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/verify-email", { email, code });
      const token = response.data.access_token;
      localStorage.setItem("token", token);
      const userResponse = await api.get("/users/me");
      setUser(userResponse.data);
      setSuccess("Email verificado! Redirecionando...");
      setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Código inválido.");
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setError("");
    setSuccess("");
    try {
      await api.post("/auth/resend-code", { email });
      setSuccess("Novo código enviado!");
      setResendCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao reenviar código.");
    }
  }

  const code = digits.join("");

  return (
    <div className={styles.authContainer}>

      {/* ── LEFT PANEL 70% ── */}
      <aside className={styles.authPanel}>
        <div className={styles.panelContent}>

          <div className={styles.panelLogo}>
            <img src={logo} alt="Descobre" className={styles.panelLogoImg} />
          </div>

          <div className={styles.panelArt}>
            {/* Envelope illustration em SVG puro */}
            <div className={styles.verifyIllustration}>
              <svg viewBox="0 0 220 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.envelopeSvg}>
                {/* Sombra / glow */}
                <ellipse cx="110" cy="160" rx="70" ry="10" fill="rgba(249,115,22,0.15)" />

                {/* Corpo do envelope */}
                <rect x="20" y="50" width="180" height="110" rx="12" fill="#1a1a1f" stroke="rgba(249,115,22,0.35)" strokeWidth="1.5" />

                {/* Aba superior */}
                <path d="M20 62 L110 115 L200 62" stroke="rgba(249,115,22,0.4)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />

                {/* Divisor inferior */}
                <line x1="20" y1="130" x2="200" y2="130" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                {/* Carta saindo */}
                <rect x="62" y="18" width="96" height="72" rx="8" fill="#212126" stroke="rgba(249,115,22,0.5)" strokeWidth="1.5" className={styles.letterCard} />
                {/* Linhas da carta */}
                <line x1="78" y1="38" x2="142" y2="38" stroke="rgba(249,115,22,0.6)" strokeWidth="2" strokeLinecap="round" />
                <line x1="78" y1="50" x2="142" y2="50" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" />
                <line x1="78" y1="62" x2="120" y2="62" stroke="rgba(255,255,255,0.1)" strokeWidth="2" strokeLinecap="round" />

                {/* Check badge */}
                <circle cx="158" cy="22" r="14" fill="#16a34a" />
                <path d="M151 22 L156 27 L165 17" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

                {/* Partículas flutuantes */}
                <circle cx="42" cy="40" r="3" fill="rgba(249,115,22,0.5)" className={styles.particle1} />
                <circle cx="185" cy="35" r="2" fill="rgba(249,115,22,0.35)" className={styles.particle2} />
                <circle cx="30" cy="100" r="2" fill="rgba(249,115,22,0.25)" className={styles.particle3} />
                <circle cx="192" cy="95" r="3" fill="rgba(249,115,22,0.3)" className={styles.particle1} />
              </svg>
            </div>

            <div className={styles.panelHeadline}>
              <h2>Confirme seu<br />endereço de email</h2>
              <p>Enviamos um código de verificação<br />para garantir que é você mesmo.</p>
            </div>
          </div>

          <div className={styles.panelBadges}>
            <span className={styles.badge}>Código expira em 15 min</span>
            <span className={styles.badge}>Verifique o spam</span>
          </div>

        </div>
      </aside>

      {/* ── RIGHT PANEL 30% ── */}
      <main className={styles.authSide}>
        <div className={styles.authCard}>

          <div className={styles.authHeader}>
            <h1>Verifique seu email</h1>
            <p>
              Código enviado para{" "}
              <strong style={{ color: "#f97316", fontWeight: 600 }}>
                {email || "seu email"}
              </strong>
            </p>
          </div>

          <div className={styles.authForm}>

            {/* OTP inputs */}
            <div className={styles.otpRow}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  autoComplete={i === 0 ? "one-time-code" : "off"}
                  maxLength={1}
                  value={d}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  className={`${styles.otpInput} ${error ? styles.otpError : d ? styles.otpFilled : ""}`}
                />
              ))}
            </div>

            {error && (
              <div className={styles.authError}>⚠️ {error}</div>
            )}

            {success && (
              <div className={styles.successBox}>✅ {success}</div>
            )}

            <button
              className={styles.authButton}
              onClick={() => handleVerify(code)}
              disabled={loading || code.length < 6}
            >
              {loading ? "Verificando..." : "Confirmar código"}
            </button>

            <div className={styles.authFooter} style={{ marginTop: "20px" }}>
              Não recebeu o código?{" "}
              {resendCooldown > 0 ? (
                <span style={{ color: "#9ca3af" }}>Reenviar em {resendCooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className={styles.resendButton}
                >
                  Reenviar código
                </button>
              )}
            </div>

          </div>
        </div>
      </main>

    </div>
  );
}

export default VerifyEmail;