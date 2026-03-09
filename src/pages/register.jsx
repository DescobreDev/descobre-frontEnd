import { useContext ,useState } from "react";
import { AuthContext } from "../context/authContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import styles from "./CSS/login.module.css";
import logo from "../assets/LOGO-DESCOBRE.svg";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { setUser } = useContext(AuthContext);

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

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
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className={styles.authError}>⚠️ {error}</div>}

          <button type="submit" className={styles.authButton} disabled={loading}>
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