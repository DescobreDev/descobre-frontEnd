import { useRef, useState } from "react";
import {
  ArrowRight, Sparkle, CheckCircle, WarningCircle, Buildings,
} from "@phosphor-icons/react";
import { Modal } from "../modal";
import api from "../../services/api";
import styles from "./CompanyOnboardingModal.module.css";

const ESTADOS = [
  { value: "AC", label: "Acre" }, { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" }, { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" }, { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" }, { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" }, { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" }, { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" }, { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" }, { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" }, { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" }, { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" }, { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" }, { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" }, { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

function maskCNPJ(value) {
  return value.replace(/\D/g, "").slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}

function maskPhone(value) {
  return value.replace(/\D/g, "").slice(0, 11)
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

function maskCEP(value) {
  return value.replace(/\D/g, "").slice(0, 8).replace(/^(\d{5})(\d)/, "$1-$2");
}

function rawCNPJ(value) {
  return value.replace(/\D/g, "");
}

const EMPTY_FORM = {
  name: "", cnpj: "", employees: "", email: "", phone: "", site: "",
  cep: "", address: "", number: "", district: "", complement: "",
  city: "", state: "", about: "",
};

/**
 * Fluxo de onboarding: passo 1 (boas-vindas) -> passo 2 (form da empresa).
 * `open` controla se o passo de boas-vindas aparece; o form pode ser
 * aberto direto pulando o step 1 chamando onClose + reabrindo, mas
 * o fluxo padrão é sempre welcome -> company.
 */
function CompanyOnboardingModal({ open, onClose, user, setUser }) {
  const [step, setStep] = useState("welcome"); // 'welcome' | 'company'
  const [loading, setLoading] = useState(false);
  const [loadingCNPJ, setLoadingCNPJ] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: "" });
  const [form, setForm] = useState({ ...EMPTY_FORM, email: user?.email || "" });
  const modalBodyRef = useRef(null);

  function handleClose() {
    setStep("welcome");
    setFeedback({ type: null, message: "" });
    onClose?.();
  }

  function handleChange(e) {
    const { name, value } = e.target;
    let masked = value;
    if (name === "cnpj") {
      masked = maskCNPJ(value);
      const raw = rawCNPJ(masked);
      if (raw.length === 14) setTimeout(() => handleBuscarCNPJ(raw), 0);
    }
    if (name === "phone") masked = maskPhone(value);
    if (name === "cep") masked = maskCEP(value);
    setForm((prev) => ({ ...prev, [name]: masked }));
    if (feedback.type) setFeedback({ type: null, message: "" });
  }

  async function handleBuscarCNPJ(cnpjParam) {
    const cnpjLimpo = cnpjParam || rawCNPJ(form.cnpj);
    if (cnpjLimpo.length !== 14) {
      setFeedback({ type: "error", message: "Digite um CNPJ completo antes de buscar." });
      return;
    }
    setLoadingCNPJ(true);
    setFeedback({ type: null, message: "" });
    try {
      const response = await fetch(`https://publica.cnpj.ws/cnpj/${cnpjLimpo}`);
      if (!response.ok) throw new Error("CNPJ não encontrado.");
      const data = await response.json();
      const endereco = data.estabelecimento;
      setForm((prev) => ({
        ...prev,
        name: data.razao_social || prev.name,
        email: endereco?.email?.toLowerCase() || prev.email,
        phone: maskPhone((endereco?.ddd1 ?? "") + (endereco?.telefone1 ?? "")) || prev.phone,
        cep: maskCEP(endereco?.cep ?? "") || prev.cep,
        address: `${endereco?.tipo_logradouro ?? ""} ${endereco?.logradouro ?? ""}`.trim() || prev.address,
        district: endereco?.bairro ?? "",
        number: endereco?.numero || prev.number,
        complement: endereco?.complemento || prev.complement,
        city: endereco?.cidade?.nome || prev.city,
        state: endereco?.estado?.sigla || prev.state,
      }));
    } catch (err) {
      setFeedback({ type: "error", message: err.message || "Erro ao buscar CNPJ." });
    } finally {
      setLoadingCNPJ(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setFeedback({ type: null, message: "" });

    try {
      const response = await api.post("/company/create", {
        ...form,
        cnpj: rawCNPJ(form.cnpj),
        employees: Number(form.employees),
        userId: user.id,
      });

      localStorage.setItem("token", response.data.token);
      const updatedUser = await api.get("/users/me");
      setUser(updatedUser.data);

      setFeedback({ type: "success", message: "Empresa cadastrada com sucesso!" });
      setTimeout(() => modalBodyRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 50);
      setTimeout(handleClose, 1500);
    } catch (err) {
      setFeedback({ type: "error", message: err.response?.data?.message || "Erro ao cadastrar empresa." });
      setTimeout(() => modalBodyRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 50);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Modal isOpen={open && step === "welcome"} onClose={handleClose} title="">
        <div className={styles.welcome}>
          <div className={styles.welcomeIcon}>
            <Sparkle size={32} color="white" weight="fill" />
          </div>
          <h2 className={styles.welcomeTitle}>Bem-vindo ao Descobre! 🎉</h2>
          <p className={styles.welcomeSubtitle}>
            Olá, <strong>{user?.name || user?.email}</strong>!
            <br />
            Antes de começar, precisamos de algumas informações sobre sua empresa.
          </p>
          <div className={styles.welcomeCard}>
            <Buildings size={28} color="#6366f1" weight="duotone" />
            <div>
              <p className={styles.welcomeCardTitle}>Cadastro da empresa</p>
              <p className={styles.welcomeCardSubtitle}>Leva menos de 2 minutos para preencher</p>
            </div>
          </div>
          <button type="button" className={styles.welcomeBtn} onClick={() => setStep("company")}>
            Cadastrar empresa
            <ArrowRight size={18} weight="bold" />
          </button>
        </div>
      </Modal>

      <Modal
        isOpen={open && step === "company"}
        onClose={handleClose}
        title="Dados da empresa"
        bodyRef={modalBodyRef}
      >
        <form onSubmit={handleSubmit}>
          {feedback.type && (
            <div className={`feedback-banner ${feedback.type === "success" ? "feedback-success" : "feedback-error"}`}>
              {feedback.type === "success" ? <CheckCircle size={18} weight="fill" /> : <WarningCircle size={18} weight="fill" />}
              {feedback.message}
            </div>
          )}

          <p className="form-section-label">Informações da empresa</p>
          <div className="form-grid">
            <div className="form-field col-span-2">
              <label className="form-label">CNPJ</label>
              <div className="input-wrap">
                <input name="cnpj" value={form.cnpj} onChange={handleChange}
                  placeholder="00.000.000/0000-00" className="input" maxLength={18} required />
                {loadingCNPJ && <span className="input-badge">Buscando...</span>}
              </div>
            </div>

            <div className="form-field col-span-2">
              <label className="form-label">Razão Social</label>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="Preenchido automaticamente pelo CNPJ" maxLength={50}
                className="input" required />
            </div>

            <div className="form-field">
              <label className="form-label">Funcionários</label>
              <input name="employees" type="number" value={form.employees} onChange={handleChange}
                placeholder="Ex: 50" className="input" required />
            </div>

            <div className="form-field">
              <label className="form-label">E-mail</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="empresa@email.com" className="input" required />
            </div>

            <div className="form-field">
              <label className="form-label">Telefone</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                placeholder="(00) 00000-0000" className="input" required />
            </div>

            <div className="form-field">
              <label className="form-label">Site</label>
              <input name="site" value={form.site} onChange={handleChange}
                placeholder="https://suaempresa.com.br" className="input" />
            </div>
          </div>

          <hr className="divider" />

          <p className="form-section-label">Endereço</p>
          <div className="form-grid">
            <div className="form-field">
              <label className="form-label">CEP</label>
              <input name="cep" value={form.cep} onChange={handleChange}
                placeholder="00000-000" className="input" required />
            </div>

            <div className="form-field">
              <label className="form-label">Endereço</label>
              <input name="address" value={form.address} onChange={handleChange}
                placeholder="Rua, Avenida..." className="input" required />
            </div>

            <div className="form-field">
              <label className="form-label">Bairro</label>
              <input name="district" value={form.district} onChange={handleChange}
                placeholder="Vila..." className="input" required />
            </div>

            <div className="form-field">
              <label className="form-label">Número</label>
              <input name="number" value={form.number} onChange={handleChange}
                placeholder="123" className="input" required />
            </div>

            <div className="form-field">
              <label className="form-label">Complemento</label>
              <input name="complement" value={form.complement} onChange={handleChange}
                placeholder="Sala 4, Andar 2..." className="input" />
            </div>

            <div className="form-field">
              <label className="form-label">Cidade</label>
              <input name="city" value={form.city} onChange={handleChange}
                placeholder="São Paulo" className="input" required />
            </div>

            <div className="form-field">
              <label className="form-label">Estado</label>
              <select name="state" value={form.state} onChange={handleChange} className="input" required>
                <option value="">Selecione...</option>
                {ESTADOS.map(({ value, label }) => (
                  <option key={value} value={value}>{value} – {label}</option>
                ))}
              </select>
            </div>
          </div>

          <hr className="divider" />

          <p className="form-section-label">Sobre a empresa</p>
          <div className="form-field" style={{ marginBottom: 8 }}>
            <textarea name="about" value={form.about} onChange={handleChange}
              placeholder="Descreva brevemente o que sua empresa faz..."
              rows={3} maxLength={255} className="input textarea" required />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Salvando..." : "Salvar empresa"}
              {!loading && <ArrowRight size={16} weight="bold" />}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

export default CompanyOnboardingModal;