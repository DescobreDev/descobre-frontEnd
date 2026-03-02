import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/register", { name, email, password });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        <div style={styles.header}>
          <div style={styles.logo}>D</div>
          <h1 style={styles.title}>Criar conta</h1>
          <p style={styles.subtitle}>Preencha os dados para se cadastrar</p>
        </div>

        <form onSubmit={handleRegister} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Nome</label>
            <input
              placeholder="Seu nome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.input)}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.input)}
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.input)}
              required
            />
          </div>

          {error && <div style={styles.errorBox}>⚠️ {error}</div>}

          <button
            type="submit"
            disabled={loading}
            style={loading ? { ...styles.button, opacity: 0.6, cursor: "not-allowed" } : styles.button}
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p style={styles.loginText}>
          Já tem conta?{" "}
          <Link to="/" style={styles.link}>Entrar</Link>
        </p>
      </div>

      <style>{`input::placeholder { color: rgba(255,255,255,0.25); }`}</style>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f4f6f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', sans-serif",
    padding: "40px 20px",
  },

  card: {
    background: "#ffffff",
    borderRadius: "12px",
    padding: "48px",
    width: "100%",
    maxWidth: "480px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
    border: "1px solid #e5e7eb",
  },

  header: {
    textAlign: "center",
    marginBottom: "32px",
  },

  logo: {
    width: "56px",
    height: "56px",
    borderRadius: "14px",
    background: "#361CF8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px",
    fontWeight: "bold",
    color: "#fff",
    margin: "0 auto 16px",
  },

  title: {
    color: "#111827",
    fontSize: "24px",
    fontWeight: "700",
    margin: "0 0 6px",
  },

  subtitle: {
    color: "#6b7280",
    fontSize: "14px",
    margin: 0,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  label: {
    color: "#374151",
    fontSize: "13px",
    fontWeight: "500",
  },

  input: {
    background: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    padding: "12px 14px",
    color: "#111827",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
    transition: "0.2s",
  },

  inputFocus: {
    background: "#ffffff",
    border: "1px solid #361CF8",
    borderRadius: "8px",
    padding: "12px 14px",
    color: "#111827",
    fontSize: "14px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },

  errorBox: {
    background: "#fff4f2",
    border: "1px solid #FF5F00",
    borderRadius: "8px",
    padding: "12px 14px",
    color: "#b91c1c",
    fontSize: "14px",
  },

  button: {
    background: "#361CF8",
    border: "none",
    borderRadius: "8px",
    padding: "14px",
    color: "#fff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    width: "100%",
    transition: "0.2s",
  },

  loginText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: "14px",
    marginTop: "24px",
    marginBottom: 0,
  },

  link: {
    color: "#FF5F00",
    textDecoration: "none",
    fontWeight: "600",
  },
};

export default Register;