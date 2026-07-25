import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import { AuthContext } from "../context/authContext";
import api from "../services/api";
import { AuthShell } from "../components/auth/AuthShell";
import { OtpInput } from "../components/auth/OtpInput";
import { VerifyIllustration } from "../components/auth/illustrations/VerifyIllustration";
import { useOtpCode } from "../hooks/useOtpCode";
import { useCountdown } from "../hooks/useCountdown";
import styles from "./CSS/verifyEmail.module.css";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 60;

function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useContext(AuthContext);
  const email = location.state?.email ?? "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendCooldown, setResendCooldown] = useCountdown();

  useEffect(() => {
    if (!email) navigate("/", { replace: true });
  }, [email, navigate]);

  async function handleVerify(code) {
    setLoading(true);
    setError("");
    try {
      const response = await api.post("/auth/verify-email", { email, code });
      localStorage.setItem("token", response.data.access_token);

      const { data: profile } = await api.get("/users/me");
      setUser(profile);

      setSuccess("Email verificado! Redirecionando...");
      setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Código inválido.");
      otp.reset();
    } finally {
      setLoading(false);
    }
  }

  const otp = useOtpCode(CODE_LENGTH, { onComplete: handleVerify });

  function handleDigitChange(index, value) {
    if (error) setError("");
    otp.setDigitAt(index, value);
  }

  async function handleResend() {
    setError("");
    setSuccess("");
    try {
      await api.post("/auth/resend-code", { email });
      setSuccess("Novo código enviado!");
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao reenviar código.");
    }
  }

  return (
    <AuthShell
      illustration={<VerifyIllustration />}
      headline={(
        <>
          <h2>Confirme seu<br />endereço de email</h2>
          <p>Enviamos um código de verificação<br />para garantir que é você mesmo.</p>
        </>
      )}
      badges={["Código expira em 15 min", "Verifique o spam"]}
    >
      <div className={styles.header}>
        <h1>Verifique seu email</h1>
        <p>
          Código enviado para{" "}
          <strong className={styles.emailHighlight}>{email || "seu email"}</strong>
        </p>
      </div>

      <div className={styles.form}>
        <OtpInput
          digits={otp.digits}
          hasError={Boolean(error)}
          registerRef={otp.registerRef}
          onDigitChange={handleDigitChange}
          onKeyDown={otp.handleKeyDown}
          onPaste={otp.handlePaste}
        />

        {error && (
          <div className={styles.alertError} role="alert">
            <WarningCircle size={16} weight="fill" />
            {error}
          </div>
        )}

        {success && (
          <div className={styles.alertSuccess} role="status">
            <CheckCircle size={16} weight="fill" />
            {success}
          </div>
        )}

        <button
          type="button"
          className={styles.submitBtn}
          onClick={() => handleVerify(otp.code)}
          disabled={loading || otp.code.length < CODE_LENGTH}
        >
          {loading ? "Verificando..." : "Confirmar código"}
        </button>

        <div className={styles.resendRow}>
          Não recebeu o código?{" "}
          {resendCooldown > 0 ? (
            <span className={styles.resendCooldown}>Reenviar em {resendCooldown}s</span>
          ) : (
            <button type="button" onClick={handleResend} className={styles.resendBtn}>
              Reenviar código
            </button>
          )}
        </div>
      </div>
    </AuthShell>
  );
}

export default VerifyEmail;