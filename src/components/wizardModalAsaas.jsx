import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/authContext";
import { Modal } from "../components/modal";
import { CheckCircle, Lock, CreditCard, Buildings, StarIcon, LightningIcon, CrownIcon } from "@phosphor-icons/react";
import api from "../services/api";
import styles from "./AsaasPaymentWizard.module.css";

// ─── Ícones inline ────────────────────────────────────────────────────────────
const SpinnerIcon = () => (
  <svg className={styles.spinner} width="17" height="17" viewBox="0 0 17 17" fill="none">
    <circle cx="8.5" cy="8.5" r="6.5" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
    <path d="M8.5 2a6.5 6.5 0 0 1 6.5 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ANNUAL_PRICES = {
    Bronze: 2500,
    Prata: 6600,
    Ouro: 15900,
};

// ─── Steps ────────────────────────────────────────────────────────────────────
const STEPS = [
  { label: "Dados da empresa" },
  { label: "Dados do cartão" },
];

const PLAN_STYLE = {
  Starter: { icon: StarIcon, color: "#64748b", colorSoft: "#f1f5f9" },
  Basic: { icon: LightningIcon, color: "#f97316", colorSoft: "#fff7ed" },
  Ouro: { icon: CrownIcon, color: "#6366f1", colorSoft: "#eef2ff" },
};

// ─── Máscaras ─────────────────────────────────────────────────────────────────
function maskCpfCnpj(value = "") {
  const n = value.replace(/\D/g, "");
  if (n.length <= 11)
    return n.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return n.slice(0, 14)
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
}
function maskPhone(v = "") {
  return v.replace(/\D/g, "").slice(0, 11)
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}
function maskCard(v = "") {
  return v.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 ");
}
function maskExpiry(v = "") {
  return v.replace(/\D/g, "").slice(0, 2);
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current }) {
  return (
    <div className={styles.stepIndicator}>
      {STEPS.map((step, i) => (
        <div key={i} className={styles.stepItem}>
          <div className={`${styles.stepCircle} ${i < current ? styles.stepDone :
            i === current ? styles.stepActive :
              styles.stepIdle
            }`}>
            {i < current
              ? <CheckCircle size={15} weight="fill" />
              : <span>{i + 1}</span>
            }
          </div>
          <span className={`${styles.stepLabel} ${i === current ? styles.stepLabelActive : ""}`}>
            {step.label}
          </span>
          {i < STEPS.length - 1 && (
            <div className={`${styles.stepLine} ${i < current ? styles.stepLineDone : ""}`} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Etapa 1: Confirmar empresa ───────────────────────────────────────────────
function StepCompany({ form, onChange, onNext, loading, error }) {
  return (
    <div className={styles.stepContent}>
      <p className={styles.stepDesc}>
        Confirme os dados abaixo. Eles serão usados para criar seu perfil de cobrança.
      </p>

      {error && <div className="feedback-banner feedback-error">{error}</div>}

      <div className="form-field">
        <label className="form-label">Razão social / Nome</label>
        <input name="name" value={form.name} onChange={onChange}
          placeholder="Empresa X Ltda" className="input" />
      </div>

      <div className="form-field">
        <label className="form-label">CPF / CNPJ</label>
        <input name="cpfCnpj" value={form.cpfCnpj} onChange={onChange}
          placeholder="00.000.000/0001-00" className="input" />
      </div>

      <div className={styles.row}>
        <div className={`form-field ${styles.rowField}`}>
          <label className="form-label">E-mail</label>
          <input name="email" value={form.email} onChange={onChange}
            placeholder="contato@empresa.com" className="input" />
        </div>
        <div className={`form-field ${styles.rowField}`}>
          <label className="form-label">Telefone</label>
          <input name="mobilePhone" value={form.mobilePhone} onChange={onChange}
            placeholder="(11) 99999-9999" className="input" />
        </div>
      </div>

      <button className="btn-primary" onClick={onNext} disabled={loading}
        style={{ width: "100%", justifyContent: "center", marginTop: 4 }}>
        {loading
          ? <span className={styles.btnInner}><SpinnerIcon />Criando perfil de cobrança...</span>
          : "Confirmar e continuar →"
        }
      </button>
    </div>
  );
}

function StepCard({ cardForm, onChange, onSubmit, loading, error, waitingActivation, plan, isAnnual  }) {
  return (
    <div>
      <div className={styles.stepContent}>
        <p className={styles.stepDesc}>
          Seus dados são enviados com criptografia diretamente ao Asaas. Nenhuma informação do cartão toca nosso servidor.
        </p>

        <div className={styles.securityBadge}>
          <Lock size={11} weight="fill" />
          Ambiente seguro — PCI DSS
        </div>

        {error && <div className="feedback-banner feedback-error">{error}</div>}


        <div className="flex gap-6">
          <div className="flex-column w-3/4">
            <div className="form-field mt-2">
              <label className="form-label">Número do cartão</label>
              <input
                name="number"
                value={cardForm.number}
                onChange={onChange}
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                className="input"
              />
            </div>

            <div className="form-field mt-3">
              <label className="form-label">Nome impresso no cartão</label>
              <input
                name="holderName"
                value={cardForm.holderName}
                onChange={onChange}
                placeholder="JOSE DA SILVA"
                className="input"
                style={{ textTransform: "uppercase" }}
              />
            </div>

            <div className={`${styles.row} mt-3`}>
              <div className={`form-field ${styles.rowField}`}>
                <label className="form-label">Mês</label>
                <input
                  name="expiryMonth"
                  value={cardForm.expiryMonth}
                  onChange={onChange}
                  placeholder="05"
                  maxLength={2}
                  className="input"
                />
              </div>

              <div className={`form-field ${styles.rowField}`}>
                <label className="form-label">Ano</label>
                <input
                  name="expiryYear"
                  value={cardForm.expiryYear}
                  onChange={onChange}
                  placeholder="2028"
                  maxLength={4}
                  className="input"
                />
              </div>

              <div className={`form-field  ${styles.rowFieldSmall}`}>
                <label className="form-label">CVV</label>
                <input
                  name="ccv"
                  value={cardForm.ccv}
                  onChange={onChange}
                  placeholder="123"
                  maxLength={4}
                  className="input"
                />
              </div>
            </div>

            <hr className="divider" />
            <p className={styles.sectionLabel}>Titular do cartão</p>

            <div className={styles.row}>
              <div className={`form-field ${styles.rowField}`}>
                <label className="form-label">CPF do titular</label>
                <input
                  name="holderCpfCnpj"
                  value={cardForm.holderCpfCnpj}
                  onChange={onChange}
                  placeholder="000.000.000-00"
                  className="input"
                />
              </div>

              <div className={`${styles.row} mt-2`}>
                <div className={`form-field ${styles.rowField}`}>
                  <label className="form-label">CEP</label>
                  <input
                    name="holderPostalCode"
                    value={cardForm.holderPostalCode}
                    onChange={onChange}
                    placeholder="12345-678"
                    className="input"
                  />
                </div>

                <div className={`form-field ${styles.rowFieldSmall}`}>
                  <label className="form-label">Número</label>
                  <input
                    name="holderAddressNumber"
                    value={cardForm.holderAddressNumber}
                    onChange={onChange}
                    placeholder="123"
                    className="input"
                  />
                </div>
              </div>
            </div>

            <div className={`${styles.row} mt-3`}>
              <div className={`form-field ${styles.rowField}`}>
                <label className="form-label">E-mail do titular</label>
                <input
                  name="holderEmail"
                  value={cardForm.holderEmail}
                  onChange={onChange}
                  placeholder="jose@email.com"
                  className="input"
                />
              </div>

              <div className={`form-field ${styles.rowField}`}>
                <label className="form-label">Telefone do titular</label>
                <input
                  name="holderPhone"
                  value={cardForm.holderPhone}
                  onChange={onChange}
                  placeholder="(11) 99999-9999"
                  className="input"
                />
              </div>
            </div>
          </div>

          {/* RESUMO DO PLANO */}
          {plan && (() => {
            const ps = PLAN_STYLE[plan.name] ?? { icon: Buildings, color: "#6366f1", colorSoft: "#eef2ff" };
            const PlanIcon = ps.icon;
            return (
              <div className={styles.planPreview} style={{ '--plan-color': ps.color, '--plan-soft': ps.colorSoft }}>

                <div className={styles.planPreviewHeader}>
                  <div className={styles.planPreviewIconWrap}>
                    <PlanIcon size={22} weight="duotone" color={ps.color} />
                  </div>
                  <div>
                    <span className={styles.planPreviewLabel}>Você está contratando</span>
                    <strong className={styles.planPreviewName}>{plan.name}</strong>
                  </div>
                </div>

                <div className={styles.planPreviewPriceWrap}>
                  <span className={styles.planPreviewCurrency}>R$</span>
                  <span className={styles.planPreviewPrice}>
                    {isAnnual
                      ? Number(ANNUAL_PRICES[plan.name] ?? plan.price).toLocaleString("pt-BR", { minimumFractionDigits: 0 })
                      : Number(plan.price).toLocaleString("pt-BR", { minimumFractionDigits: 0 })
                    }
                  </span>
                  <span className={styles.planPreviewPriceUnit}>{isAnnual ? "/ano" : "/mês"}</span>
                </div>

                <div className={styles.planPreviewDivider} />

                <div className={styles.planPreviewFeatures}>
                  {[
                    `Até ${plan.maxJobs} vagas ativas`,
                    `${plan.maxAiResume} resumos com IA/mês`,
                    `${plan.maxAiSalary} análises salariais`,
                    `${plan.maxInterviews} entrevistas com IA`,
                  ].map((f) => (
                    <div key={f} className={styles.planPreviewFeature}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--plan-color)" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                      {f}
                    </div>
                  ))}
                </div>

                <div className={styles.planPreviewNote}>
                  <Lock size={11} weight="fill" color={ps.color} />
                  {isAnnual ? "Cobrança anual · Cancele quando quiser" : "Cobrança mensal · Cancele quando quiser"}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* BOTÃO */}
      <button
        className="btn-primary"
        onClick={onSubmit}
        disabled={loading || waitingActivation}
        style={{ width: "100%", justifyContent: "center", marginTop: 16 }}
      >
        {loading ? (
          <span className={styles.btnInner}>
            <SpinnerIcon />
            Tokenizando cartão...
          </span>
        ) : waitingActivation ? (
          <span className={styles.btnInner}>
            <SpinnerIcon />
            Confirmando pagamento...
          </span>
        ) : (
          <span className={styles.btnInner}>
            <Lock size={13} weight="fill" />
            Finalizar e ativar plano
          </span>
        )}
      </button>
    </div>
  );
}

// ─── Wizard principal ─────────────────────────────────────────────────────────
export default function AsaasPaymentWizard({ isOpen, onClose, onComplete, plan, isAnnual }) {
  const { user, setUser } = useContext(AuthContext);
  const company = user?.company;

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Guardamos customerId e token entre steps
  const [asaasCustomerId, setAsaasCustomerId] = useState(null);
  const [waitingActivation, setWaitingActivation] = useState(false);

  const [companyForm, setCompanyForm] = useState({
    name: "", cpfCnpj: "", email: "", mobilePhone: "",
  });

  const [cardForm, setCardForm] = useState({
    number: "", holderName: "", expiryMonth: "", expiryYear: "", ccv: "",
    holderCpfCnpj: "", holderPostalCode: "", holderEmail: "", holderPhone: "", holderAddressNumber: "",
  });

  // Pré-popula com dados da empresa
  useEffect(() => {
    if (company) {
      setCompanyForm({
        name: company.name || "",
        cpfCnpj: maskCpfCnpj(company.cnpj || ""),
        email: company.email || "",
        mobilePhone: maskPhone(company.phone || ""),
      });
      setCardForm((p) => ({
        ...p,
        holderEmail: company.email || "",
        holderPhone: maskPhone(company.phone || ""),
      }));
    }
  }, [company]);

  useEffect(() => {
    if (!waitingActivation) return;

    const interval = setInterval(async () => {
      try {
        const { data } = await api.get("/users/me");

        if (data?.company?.subscription?.[0]?.active) {
          setUser(data);
          setWaitingActivation(false);
          clearInterval(interval);
          onComplete?.();
        }
      } catch (err) {
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [waitingActivation]);

  function handleCompanyChange(e) {
    const { name, value } = e.target;
    setCompanyForm((p) => ({
      ...p,
      [name]: name === "cpfCnpj" ? maskCpfCnpj(value)
        : name === "mobilePhone" ? maskPhone(value)
          : value,
    }));
  }

  function handleCardChange(e) {
    const { name, value } = e.target;
    setCardForm((p) => ({
      ...p,
      [name]: name === "number" ? maskCard(value)
        : name === "expiryMonth" ? maskExpiry(value)
          : name === "holderCpfCnpj" ? maskCpfCnpj(value)
            : name === "holderPhone" ? maskPhone(value)
              : value,
    }));
  }

  // ── Step 1: criar customer ────────────────────────────────────────────────
  async function handleCreateCustomer() {
    setError(null);
    setLoading(true);
    try {
      const { data } = await api.post("/payments/asaas/customer", companyForm);
      setAsaasCustomerId(data.customerId);
      setStep(1);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao criar perfil de cobrança.");
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: tokenizar + criar assinatura ─────────────────────────────────
  async function handleTokenizeAndSubscribe() {
    setError(null);
    setLoading(true);
    try {
      // 2a. Tokeniza o cartão
      const { data: tokenData } = await api.post("/payments/asaas/tokenize", {
        customerId: asaasCustomerId,
        creditCard: {
          holderName: cardForm.holderName,
          number: cardForm.number.replace(/\s/g, ""),
          expiryMonth: cardForm.expiryMonth,
          expiryYear: cardForm.expiryYear,
          ccv: cardForm.ccv,
        },
        creditCardHolderInfo: {
          name: cardForm.holderName,
          cpfCnpj: cardForm.holderCpfCnpj,
          email: cardForm.holderEmail,
          postalCode: cardForm.holderPostalCode,
          addressNumber: cardForm.holderAddressNumber,
          phone: cardForm.holderPhone,
        },
      });

      const planId = plan.id;

      // 2b. Cria a assinatura recorrente
      await api.post("/payments/asaas/subscribe", {
        planId,
        isAnnual,
        creditCardToken: tokenData.creditCardToken,
      });

      setWaitingActivation(true);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao ativar plano.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ativar plano" maxWidth="max-w-5xl" canClose>
      <div className={styles.wrapper}>
        <StepIndicator current={step} />

        {step === 0 && (
          <StepCompany
            form={companyForm}
            onChange={handleCompanyChange}
            onNext={handleCreateCustomer}
            loading={loading}
            error={error}
          />
        )}

        {step === 1 && (
          <StepCard
            cardForm={cardForm}
            onChange={handleCardChange}
            onSubmit={handleTokenizeAndSubscribe}
            plan={plan}
            isAnnual={isAnnual}
            loading={loading}
            error={error}
            waitingActivation={waitingActivation}
          />
        )}
      </div>
    </Modal>
  );
}