import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight, ArrowLeft, CheckCircle, WarningCircle, Buildings,
  MagnifyingGlass, MapPin, Info, Spinner, X,
} from "@phosphor-icons/react";
import { Modal } from "../modal";
import api from "../../services/api";
import { CompanyIllustration } from "./illustrations/CompanyIllustration";
import styles from "./CompanyOnboardingModal.module.css";
import logo from "../../assets/LOGO-DESCOBRE-BRANCA.svg";

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

const ABOUT_MAX = 255;
const STEPS = ["welcome", "company"];

function CompanyOnboardingModal({ open, onClose, user, setUser }) {
  const [step, setStep] = useState("welcome");
  const [loading, setLoading] = useState(false);
  const [loadingCNPJ, setLoadingCNPJ] = useState(false);
  const [cnpjFound, setCnpjFound] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: "" });
  const [form, setForm] = useState({ ...EMPTY_FORM, email: user?.email || "" });
  const modalBodyRef = useRef(null);
  const lastLookedUp = useRef("");

  const cnpjDigits = useMemo(() => rawCNPJ(form.cnpj), [form.cnpj]);
  const cnpjComplete = cnpjDigits.length === 14;
  const stepIndex = STEPS.indexOf(step);

  function scrollToTop() {
    setTimeout(() => modalBodyRef.current?.scrollTo({ top: 0, behavior: "smooth" }), 50);
  }

  function handleClose() {
    setStep("welcome");
    setFeedback({ type: null, message: "" });
    onClose?.();
  }

  function handleChange(e) {
    const { name, value } = e.target;
    let masked = value;
    if (name === "cnpj") masked = maskCNPJ(value);
    if (name === "phone") masked = maskPhone(value);
    if (name === "cep") masked = maskCEP(value);
    setForm((prev) => ({ ...prev, [name]: masked }));
    if (feedback.type) setFeedback({ type: null, message: "" });
  }

  useEffect(() => {
    if (cnpjComplete && cnpjDigits !== lastLookedUp.current) {
      handleBuscarCNPJ(cnpjDigits);
    }
    if (!cnpjComplete) setCnpjFound(false);
  }, [cnpjDigits]);

  function handleCnpjKeyDown(e) {
    if (e.key === "Enter") e.preventDefault();
  }

  async function handleBuscarCNPJ(cnpjParam) {
    const cnpjLimpo = cnpjParam || cnpjDigits;
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
      lastLookedUp.current = cnpjLimpo;
      setCnpjFound(true);
    } catch (err) {
      lastLookedUp.current = "";
      setCnpjFound(false);
      setFeedback({ type: "error", message: err.message || "Erro ao buscar CNPJ." });
      scrollToTop();
    } finally {
      setLoadingCNPJ(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!cnpjComplete) {
      setFeedback({ type: "error", message: "Informe um CNPJ válido com 14 dígitos." });
      scrollToTop();
      return;
    }

    setLoading(true);
    setFeedback({ type: null, message: "" });

    try {
      const response = await api.post("/company/create", {
        ...form,
        cnpj: cnpjDigits,
        employees: Number(form.employees),
        userId: user.id,
      });

      localStorage.setItem("token", response.data.token);
      const updatedUser = await api.get("/users/me");
      setUser(updatedUser.data);

      setFeedback({ type: "success", message: "Empresa cadastrada com sucesso!" });
      scrollToTop();
      setTimeout(handleClose, 1500);
    } catch (err) {
      setFeedback({ type: "error", message: err.response?.data?.message || "Erro ao cadastrar empresa." });
      scrollToTop();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={open} onClose={handleClose} title="" maxWidth="max-w-5xl">
      <div className={styles.shell}>

        <aside className={styles.leftPanel}>
          <div className={styles.leftTop}>
            <div className={styles.panelLogo}>
              <img src={logo} alt="Descobre" className={styles.panelLogoImg} />
            </div>
            <CompanyIllustration />
          </div>

          <div className={styles.leftBottom}>
            <p className={styles.leftHeadline}>Cadastro rápido,<br />sem burocracia.</p>
            <ul className={styles.leftList}>
              <li><CheckCircle size={13} weight="fill" /> Leva menos de 2 minutos</li>
              <li><CheckCircle size={13} weight="fill" /> Dados preenchidos pelo CNPJ</li>
            </ul>
            <div className={styles.progressDots}>
              {STEPS.map((s, i) => (
                <span key={s} className={`${styles.dot} ${i === stepIndex ? styles.dotActive : ""}`} />
              ))}
            </div>
          </div>
        </aside>

        <div className={styles.rightPanel} ref={modalBodyRef}>
          <button type="button" className={styles.closeBtn} onClick={handleClose} aria-label="Fechar">
            <X size={16} weight="bold" />
          </button>



          {step === "welcome" && (
            <div className={styles.sectorIntro}>
              <div className={styles.intro}>
                <span className={styles.stepTag}>Passo 1 de 2</span>
                <h2 className={styles.introTitle}>Bem-vindo ao Descobre</h2>
                <p className={styles.introSubtitle}>
                  Olá, <strong>{user?.name || user?.email}</strong>! Antes de explorar a plataforma,
                  vamos conhecer a sua empresa.
                </p>
                <button type="button" className={styles.primaryBtn} onClick={() => setStep("company")}>
                  Começar cadastro
                  <ArrowRight size={18} weight="bold" />
                </button>
              </div>
            </div>
          )}

          {step === "company" && (
            <form onSubmit={handleSubmit} noValidate className={styles.form}>
              <div className={styles.formHeader}>
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={() => setStep("welcome")}
                  aria-label="Voltar"
                >
                  <ArrowLeft size={16} weight="bold" />
                </button>
                <div>
                  <span className={styles.stepTag}>Passo 2 de 2</span>
                  <h2 className={styles.formTitle}>Dados da empresa</h2>
                </div>
              </div>

              {feedback.type && (
                <div
                  role="alert"
                  className={`feedback-banner ${feedback.type === "success" ? "feedback-success" : "feedback-error"}`}
                >
                  {feedback.type === "success" ? <CheckCircle size={18} weight="fill" /> : <WarningCircle size={18} weight="fill" />}
                  {feedback.message}
                </div>
              )}

              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <Buildings size={16} weight="bold" />
                  <span>Identificação</span>
                </div>

                <div className={styles.grid}>
                  <div className={`${styles.field} ${styles.colSpan2}`}>
                    <label htmlFor="cnpj" className={styles.label}>CNPJ</label>
                    <div className={styles.cnpjRow}>
                      <input
                        id="cnpj" name="cnpj" value={form.cnpj} onChange={handleChange}
                        onKeyDown={handleCnpjKeyDown}
                        placeholder="00.000.000/0000-00" className="input" maxLength={18}
                        inputMode="numeric" autoComplete="off" required
                      />
                      <button
                        type="button"
                        className={styles.cnpjSearchBtn}
                        onClick={() => handleBuscarCNPJ()}
                        disabled={!cnpjComplete || loadingCNPJ}
                      >
                        {loadingCNPJ ? <Spinner size={16} className={styles.spin} /> : <MagnifyingGlass size={16} weight="bold" />}
                      </button>
                    </div>
                    {cnpjFound && !loadingCNPJ && (
                      <span className={styles.fieldHint}>
                        <CheckCircle size={13} weight="fill" /> Dados encontrados e preenchidos automaticamente
                      </span>
                    )}
                  </div>

                  <div className={`${styles.field} ${styles.colSpan2}`}>
                    <label htmlFor="name" className={styles.label}>Razão Social</label>
                    <input
                      id="name" name="name" value={form.name} onChange={handleChange}
                      placeholder="Preenchido automaticamente pelo CNPJ" maxLength={120}
                      className="input" required
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="employees" className={styles.label}>Funcionários</label>
                    <input
                      id="employees" name="employees" type="number" min="1" value={form.employees}
                      onChange={handleChange} placeholder="Ex: 50" className="input" required
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="email" className={styles.label}>E-mail</label>
                    <input
                      id="email" name="email" type="email" value={form.email} onChange={handleChange}
                      placeholder="empresa@email.com" className="input" required
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="phone" className={styles.label}>Telefone</label>
                    <input
                      id="phone" name="phone" value={form.phone} onChange={handleChange}
                      placeholder="(00) 00000-0000" className="input" inputMode="numeric" required
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="site" className={styles.label}>Site <span className={styles.optional}>(opcional)</span></label>
                    <input
                      id="site" name="site" value={form.site} onChange={handleChange}
                      placeholder="https://suaempresa.com.br" className="input"
                    />
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <MapPin size={16} weight="bold" />
                  <span>Endereço</span>
                </div>

                <div className={styles.grid}>
                  <div className={styles.field}>
                    <label htmlFor="cep" className={styles.label}>CEP</label>
                    <input
                      id="cep" name="cep" value={form.cep} onChange={handleChange}
                      placeholder="00000-000" className="input" inputMode="numeric" required
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="address" className={styles.label}>Endereço</label>
                    <input
                      id="address" name="address" value={form.address} onChange={handleChange}
                      placeholder="Rua, Avenida..." className="input" required
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="district" className={styles.label}>Bairro</label>
                    <input
                      id="district" name="district" value={form.district} onChange={handleChange}
                      placeholder="Vila..." className="input" required
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="number" className={styles.label}>Número</label>
                    <input
                      id="number" name="number" value={form.number} onChange={handleChange}
                      placeholder="123" className="input" required
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="complement" className={styles.label}>
                      Complemento <span className={styles.optional}>(opcional)</span>
                    </label>
                    <input
                      id="complement" name="complement" value={form.complement} onChange={handleChange}
                      placeholder="Sala 4, Andar 2..." className="input"
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="city" className={styles.label}>Cidade</label>
                    <input
                      id="city" name="city" value={form.city} onChange={handleChange}
                      placeholder="São Paulo" className="input" required
                    />
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="state" className={styles.label}>Estado</label>
                    <select
                      id="state" name="state" value={form.state} onChange={handleChange}
                      className="input" required
                    >
                      <option value="">Selecione...</option>
                      {ESTADOS.map(({ value, label }) => (
                        <option key={value} value={value}>{value} – {label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <Info size={16} weight="bold" />
                  <span>Sobre a empresa</span>
                </div>

                <div className={styles.field}>
                  <label htmlFor="about" className={styles.label}>Descrição</label>
                  <textarea
                    id="about" name="about" value={form.about} onChange={handleChange}
                    placeholder="Descreva brevemente o que sua empresa faz..."
                    rows={3} maxLength={ABOUT_MAX} className="input textarea" required
                  />
                  <span className={styles.charCount}>{form.about.length}/{ABOUT_MAX}</span>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? "Salvando..." : "Salvar empresa"}
                  {!loading && <ArrowRight size={16} weight="bold" />}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default CompanyOnboardingModal;