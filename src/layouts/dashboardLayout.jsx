import { Outlet, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import logo from "../assets/LOGO-DESCOBRE.svg";
import styles from "../pages/CSS/Dashboard.module.css";
import { Modal } from '../components/modal'

function DashboardLayout() {
  const { user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [form, setForm] = useState({
    companyName: '',
    cnpj: '',
    employees: '',
    email: '',
    phone: '',
    site: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    city: '',
    state: '',
    about: '',
  })

  useEffect(() => {
    if (user) {
      setShowOnboarding(true);
      setIsOpen(true);
    }
  }, [user]);

  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
  e.preventDefault()
  try {
    await salvarNaApi(form)
    setIsOpen(false)
  } catch (err) {
    console.error(err)
  }
}

  return (
    <div className={styles.dashboard}>

      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <img src={logo} alt="Logo Descobre" className={styles.logoImg} />
        </div>
        <nav>
          <a href="/dashboard">Home</a>
          <a href="/reports">Relatórios</a>
          <a href="/settings">Configurações</a>
        </nav>
      </aside>

      <main className={styles.main}>

        <header className={styles.header}>
          <div>
            <h2>Dashboard</h2>
            {user && <p>Bem-vindo, {user.email}</p>}
          </div>
          <button onClick={handleLogout}>Sair</button>
        </header>

        {showOnboarding && (
          <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Dados da empresa">
            <form onSubmit={handleSubmit}>

              {/* Seção: Informações da Empresa */}
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                Informações da empresa
              </p>
              <div className="grid grid-cols-2 gap-4 mb-4">

                <div className="form-field col-span-2">
                  <label>Razão Social</label>
                  <input name="companyName" value={form.companyName} onChange={handleChange}
                    placeholder="Ex: Descobre Tecnologia Ltda" maxLength="50" className="input" required/>
                </div>

                <div className="form-field">
                  <label>CNPJ</label>
                  <input name="cnpj" value={form.cnpj} onChange={handleChange}
                    placeholder="00.000.000/0000-00" className="input" maxLength="14" required/>
                </div>

                <div className="form-field">
                  <label>Qtd. de funcionários</label>
                  <input name="employees" type="number" value={form.employees} maxLength="8" onChange={handleChange}
                    placeholder="Ex: 50" className="input" required/>
                </div>

                <div className="form-field">
                  <label>E-mail</label>
                  <input name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder="empresa@email.com" className="input" required/>
                </div>

                <div className="form-field">
                  <label>Telefone</label>
                  <input name="phone" value={form.phone} onChange={handleChange}
                    placeholder="(00) 00000-0000" className="input" required/>
                </div>

                <div className="form-field col-span-2">
                  <label>Site</label>
                  <input name="site" value={form.site} onChange={handleChange}
                    placeholder="https://www.suaempresa.com.br" className="input" />
                </div>

              </div>

              {/* Divider */}
              <hr className="my-4 border-gray-100" />

              {/* Seção: Endereço */}
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                Endereço
              </p>
              <div className="grid grid-cols-2 gap-4 mb-4">

                <div className="form-field">
                  <label>CEP</label>
                  <input name="cep" value={form.cep} onChange={handleChange}
                    placeholder="00000-000" className="input" required/>
                </div>

                <div className="form-field col-span-2">
                  <label>Endereço</label>
                  <input name="address" value={form.address} onChange={handleChange}
                    placeholder="Rua, Avenida..." className="input" required/>
                </div>

                <div className="form-field">
                  <label>Número</label>
                  <input name="number" value={form.number} onChange={handleChange}
                    placeholder="123" className="input" required/>
                </div>

                <div className="form-field">
                  <label>Complemento</label>
                  <input name="complement" value={form.complement} onChange={handleChange}
                    placeholder="Sala 4, Andar 2..." className="input" required/>
                </div>

                <div className="form-field">
                  <label>Cidade</label>
                  <input name="city" value={form.city} onChange={handleChange}
                    placeholder="São Paulo" className="input" required/>
                </div>

                <div className="form-field">
                  <label>Estado</label>
                  <input name="state" value={form.state} onChange={handleChange}
                    placeholder="SP" maxLength={2} className="input" required/>
                </div>

              </div>

              {/* Divider */}
              <hr className="my-4 border-gray-100" />

              {/* Seção: Sobre */}
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                Sobre a empresa
              </p>
              <div className="form-field mb-6">
                <textarea name="about" value={form.about} onChange={handleChange}
                  placeholder="Descreva brevemente o que sua empresa faz..."
                  rows={3}
                  className="input resize-none w-full"
                />
              </div>

              <div className="flex justify-end">
                <button type="submit" className="btn btn-primary">
                  Salvar
                </button>
              </div>

            </form>
          </Modal>
        )}

        <section className={styles.content}>
          <Outlet />
        </section>

      </main>
    </div>
  );
}

export default DashboardLayout;