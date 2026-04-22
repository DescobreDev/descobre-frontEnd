// src/pages/VerifyEmail.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/authContext";
import api from "../services/api";
import styles from "./CSS/login.module.css";

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useContext(AuthContext);

  const email = location.state?.email ?? "";

  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

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

    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (clean && index === 5) {
      const fullCode = [...next].join("");
      if (fullCode.length === 6) handleVerify(fullCode);
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
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
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || "Código inválido.";
      setError(msg);
      setDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  // ── Reenvio ──
  async function handleResend() {
    setError("");
    setSuccess("");
    try {
      await api.post("/auth/resend-code", { email });
      setSuccess("Novo código enviado!");
      setResendCooldown(60);
    } catch (err) {
      const msg = err.response?.data?.message || "Erro ao reenviar código.";
      setError(msg);
    }
  }

  const code = digits.join("");

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>

        <div className={styles.authHeader}>
          <h1>Verifique seu email</h1>
          <p>
            Enviamos um código de 6 dígitos para{" "}
            <strong>{email || "seu email"}</strong>
          </p>
        </div>

        <div className={styles.authForm}>
          <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "24px" }}>
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
                style={{
                  width: "44px",
                  height: "54px",
                  textAlign: "center",
                  fontSize: "22px",
                  fontWeight: "700",
                  border: error
                    ? "2px solid #EF4444"
                    : d
                    ? "2px solid #4F46E5"
                    : "2px solid #E5E7EB",
                  borderRadius: "10px",
                  outline: "none",
                  transition: "border-color 0.15s",
                  background: "#FAFAFA",
                }}
              />
            ))}
          </div>

          {error && (
            <div className={styles.authError} style={{ marginBottom: "16px" }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div style={{ color: "#16A34A", fontSize: "14px", textAlign: "center", marginBottom: "16px" }}>
              ✅ {success}
            </div>
          )}

          <button
            className={styles.authButton}
            onClick={() => handleVerify(code)}
            disabled={loading || code.length < 6}
          >
            {loading ? "Verificando..." : "Confirmar código"}
          </button>

          <div style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "#6B7280" }}>
            Não recebeu o código?{" "}
            {resendCooldown > 0 ? (
              <span style={{ color: "#9CA3AF" }}>
                Reenviar em {resendCooldown}s
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                style={{
                  background: "none",
                  border: "none",
                  color: "#4F46E5",
                  cursor: "pointer",
                  fontWeight: "600",
                  padding: 0,
                  fontSize: "14px",
                }}
              >
                Reenviar código
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default VerifyEmail;