import { useState, useEffect, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import api from "../services/api";
import styles from "./CSS/login.module.css";
import logo from "../assets/LOGO-DESCOBRE.svg";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { user, loading, setUser } = useContext(AuthContext);
  const [loadingBtn, setLoadingBtn] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  async function handleLogin(e) {
  e.preventDefault();
  setLoadingBtn(true);
  setError("");

  try {
    const response = await api.post("/auth/login", { email, password });

    const token = response.data.access_token;
    localStorage.setItem("token", token);

    const userResponse = await api.get("/users/me");
    setUser(userResponse.data);

    navigate("/dashboard");

  } catch (err) {
    setError(err.response?.data?.message || "Erro ao fazer login");
  } finally {
    setLoadingBtn(true);
  }
}

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>

        <div className={styles.authHeader}>
          <div className={styles.logoBox}>
            <img src={logo} alt="Logo Descobre" className={styles.logoImg} />
          </div>
          <h1>Bem-vindo de volta</h1>
          <p>Entre na sua conta para continuar</p>
        </div>

        <form onSubmit={handleLogin} className={styles.authForm}>

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

          <div className={styles.authField}>
            <label>Senha</label>
            <input
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className={styles.authError}>{error}</div>}

          <button type="submit" className={styles.authButton} disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className={styles.authFooter}>
          Não tem conta? <Link to="/register">Criar conta</Link>
        </div>

      </div>
    </div>
  );
}

export default Login;