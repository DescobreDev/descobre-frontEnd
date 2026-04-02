import { useContext, useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import api from "../services/api";
import "./CSS/myCompany.css";

/* ─── helpers ─── */
const fmtCNPJ = (v = "") =>
    v.replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/, "$1.$2")
        .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        .replace(/\.(\d{3})(\d)/, ".$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2")
        .slice(0, 18);

const fmtPhone = (v = "") =>
    v.replace(/\D/g, "")
        .replace(/^(\d{2})(\d)/, "($1) $2")
        .replace(/(\d{5})(\d{4})$/, "$1-$2")
        .slice(0, 15);

const fmtCEP = (v = "") =>
    v.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9);

const planColors = {
    Starter: { pill: "#f97316", bg: "rgba(249,115,22,0.08)", ring: "rgba(249,115,22,0.25)" },
    Basic: { pill: "#6366f1", bg: "rgba(99,102,241,0.08)", ring: "rgba(99,102,241,0.25)" },
    Pro: { pill: "#10b981", bg: "rgba(16,185,129,0.08)", ring: "rgba(16,185,129,0.25)" },
};

/* ─── UsageBar ─── */
function UsageBar({ label, used, total, color = "#6366f1" }) {
    const pct = Math.min(100, Math.round((used / total) * 100));
    const warn = pct >= 80;

    return (
        <div className="usage-bar">
            <div className="usage-bar__row">
                <span className="usage-bar__label">{label}</span>
                <span className={`usage-bar__count usage-bar__count--${warn ? "warn" : "normal"}`}>
                    {used}/{total}
                </span>
            </div>
            <div className="usage-bar__track">
                <div
                    className={`usage-bar__fill usage-bar__fill--${warn ? "warn" : "normal"}`}
                    style={{
                        width: `${pct}%`,
                        background: warn ? undefined : `linear-gradient(90deg, ${color}, ${color}cc)`,
                    }}
                />
            </div>
        </div>
    );
}

/* ─── Section ─── */
function Section({ title, subtitle, children }) {
    return (
        <div className="mycompany-section">
            <div className="mycompany-section__header">
                <span className="mycompany-section__title">{title}</span>
                {subtitle && <span className="mycompany-section__subtitle">{subtitle}</span>}
            </div>
            <div className="mycompany-section__body">{children}</div>
        </div>
    );
}

/* ─── Field ─── */
function Field({ label, span2 = false, children }) {
    return (
        <div className={`mycompany-field${span2 ? " mycompany-field--span2" : ""}`}>
            <label className="mycompany-field__label">{label}</label>
            {children}
        </div>
    );
}

/* ─── main ─── */
export default function MyCompany() {
    const { user } = useContext(AuthContext);
    const { setUser } = useContext(AuthContext);
    const company = user?.company ?? {};

    const subscription = company.subscription?.[0];
    const plan = subscription?.plan;
    const planStyle = planColors[plan?.name] ?? planColors.Basic;

    const [editing, setEditing] = useState(false);
    const [saved, setSaved] = useState(false);

    // ── usage state ──
    const [usage, setUsage] = useState(null);
    const [usageLoading, setUsageLoading] = useState(true);

    const [form, setForm] = useState({
        name: company.name ?? "",
        email: company.email ?? "",
        phone: company.phone ?? "",
        site: company.site ?? "",
        cnpj: company.cnpj ?? "",
        cep: company.cep ?? "",
        address: company.address ?? "",
        number: company.number ?? "",
        complement: company.complement ?? "",
        city: company.city ?? "",
        state: company.state ?? "",
        about: company.about ?? "",
        employees: company.employees ?? "",
    });

    // ── busca usage ao montar ──
    useEffect(() => {
        async function fetchUsage() {
            try {
                const { data } = await api.get("/company/usage");
                setUsage(data);
            } catch (err) {
                console.error("Erro ao buscar usage:", err);
            } finally {
                setUsageLoading(false);
            }
        }
        fetchUsage();
    }, []);

    const set = (k) => (e) => {
        let v = e.target.value;
        if (k === "cnpj") v = fmtCNPJ(v);
        if (k === "phone") v = fmtPhone(v);
        if (k === "cep") v = fmtCEP(v);
        setForm((p) => ({ ...p, [k]: v }));
    };

    const handleSave = async () => {
        try {
            await api.post("/company/update", form);
            setEditing(false);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
            window.location.reload();
        } catch (error) {
            console.error(error);
        }
    };

    const inputClass = `input ${editing ? "mycompany-input--editing" : "mycompany-input--readonly"}`;

    return (
        <div className="page-content">

            {/* ── header ── */}
            <div className="mycompany-header">
                <div>
                    <h1 className="mycompany-header__title">Perfil da empresa</h1>
                    <p className="mycompany-header__subtitle">Gerencie as informações da sua empresa no D.escobre</p>
                </div>

                <div className="mycompany-header__actions">
                    {editing ? (
                        <>
                            <button className="btn-secondary" onClick={() => setEditing(false)}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <path d="M18 6L6 18M6 6l12 12" />
                                </svg>
                                Cancelar
                            </button>
                            <button className="btn-primary" onClick={handleSave}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                                    <polyline points="17 21 17 13 7 13 7 21" />
                                    <polyline points="7 3 7 8 15 8" />
                                </svg>
                                Salvar alterações
                            </button>
                        </>
                    ) : (
                        <button className="btn-primary" onClick={() => setEditing(true)}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Editar empresa
                        </button>
                    )}
                </div>
            </div>

            {/* ── feedback ── */}
            {saved && (
                <div className="feedback-banner feedback-success">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Informações salvas com sucesso!
                </div>
            )}

            {/* ── grid ── */}
            <div className="mycompany-grid">

                {/* ── coluna esquerda ── */}
                <div className="mycompany-col-left">

                    {/* identidade */}
                    <Section title="Identidade da empresa" subtitle="Nome, CNPJ e informações básicas">
                        <div className="form-grid">
                            <Field label="Razão social" span2>
                                <input className={inputClass} disabled={!editing} value={form.name} onChange={set("name")} placeholder="Nome da empresa" />
                            </Field>
                            <Field label="CNPJ">
                                <input className={inputClass} disabled={!editing} value={form.cnpj} onChange={set("cnpj")} placeholder="00.000.000/0000-00" />
                            </Field>
                            <Field label="Nº de funcionários">
                                <input className={inputClass} disabled={!editing} type="number" value={form.employees} onChange={set("employees")} placeholder="Ex: 10" />
                            </Field>
                            <Field label="E-mail corporativo">
                                <input className={inputClass} disabled={!editing} type="email" value={form.email} onChange={set("email")} placeholder="email@empresa.com" />
                            </Field>
                            <Field label="Telefone">
                                <input className={inputClass} disabled={!editing} value={form.phone} onChange={set("phone")} placeholder="(00) 00000-0000" />
                            </Field>
                            <Field label="Site" span2>
                                <input className={inputClass} disabled={!editing} value={form.site} onChange={set("site")} placeholder="https://suaempresa.com.br" />
                            </Field>
                        </div>
                    </Section>

                    {/* endereço */}
                    <Section title="Endereço" subtitle="Localização registrada da empresa">
                        <div className="form-grid">
                            <Field label="CEP">
                                <input className={inputClass} disabled={!editing} value={form.cep} onChange={set("cep")} placeholder="00000-000" />
                            </Field>
                            <Field label="Estado (UF)">
                                <input className={inputClass} disabled={!editing} value={form.state} onChange={set("state")} placeholder="SP" maxLength={2} />
                            </Field>
                            <Field label="Cidade">
                                <input className={inputClass} disabled={!editing} value={form.city} onChange={set("city")} placeholder="Cidade" />
                            </Field>
                            <Field label="Logradouro">
                                <input className={inputClass} disabled={!editing} value={form.address} onChange={set("address")} placeholder="Rua, Av…" />
                            </Field>
                            <Field label="Número">
                                <input className={inputClass} disabled={!editing} value={form.number} onChange={set("number")} placeholder="Nº" />
                            </Field>
                            <Field label="Complemento">
                                <input className={inputClass} disabled={!editing} value={form.complement} onChange={set("complement")} placeholder="Sala, Loja…" />
                            </Field>
                        </div>
                    </Section>

                    {/* sobre */}
                    <Section title="Sobre a empresa" subtitle="Descrição pública exibida para candidatos">
                        <textarea
                            className={`${inputClass} textarea`}
                            disabled={!editing}
                            value={form.about}
                            onChange={set("about")}
                            placeholder="Conte um pouco sobre a missão, cultura e diferenciais da empresa…"
                        />
                        <p className="mycompany-char-count">{form.about.length} caracteres</p>
                    </Section>
                </div>

                {/* ── coluna direita ── */}
                <div className="mycompany-col-right">

                    {/* plano */}
                    {plan && (
                        <div
                            className="mycompany-plan"
                            style={{ background: planStyle.bg, border: `1.5px solid ${planStyle.ring}` }}
                        >
                            <div className="mycompany-plan__top">
                                <span className="mycompany-plan__label">Plano atual</span>
                                <span className="mycompany-plan__badge" style={{ background: planStyle.pill }}>
                                    {plan.name}
                                </span>
                            </div>

                            <div className="mycompany-plan__price">
                                R$ {Number(plan.price).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                <span className="mycompany-plan__price-unit">/mês</span>
                            </div>

                            <p className="mycompany-plan__desc">{plan.description}</p>

                            <div className="mycompany-plan__features">
                                {[
                                    `Até ${plan.maxJobs} vagas ativas`,
                                    `${plan.maxAiResume} resumos com IA/mês`,
                                    `${plan.maxAiSalary} análises salariais com IA`,
                                    `${plan.maxInterviews} entrevistas com IA`,
                                ].map((f) => (
                                    <div key={f} className="mycompany-plan__feature">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={planStyle.pill} strokeWidth="2.5">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        {f}
                                    </div>
                                ))}
                            </div>

                            <NavLink to="/plans" className="btn-primary mycompany-plan__upgrade">
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                                </svg>
                                Fazer upgrade
                            </NavLink>
                        </div>
                    )}

                    {/* consumo */}
                    {plan && (
                        <div className="mycompany-consumption">
                            <div className="mycompany-consumption__header">
                                <span className="mycompany-consumption__title">Consumo do plano</span>
                            </div>
                            <div className="mycompany-consumption__body">
                                {usageLoading ? (
                                    <p className="mycompany-consumption__loading">Carregando uso…</p>
                                ) : usage ? (
                                    <>
                                        <UsageBar
                                            label="Vagas"
                                            used={usage.jobsUsed.used}
                                            total={usage.jobsUsed.limit}
                                            color="#6366f1"
                                        />
                                        <UsageBar
                                            label="Resumos com IA"
                                            used={usage.aiResumeUsed.used}
                                            total={usage.aiResumeUsed.limit}
                                            color="#f97316"
                                        />
                                        <UsageBar
                                            label="Faixa Salarial com IA"
                                            used={usage.aiSalaryUsed.used}
                                            total={usage.aiSalaryUsed.limit}
                                            color="#6366f1"
                                        />
                                        <UsageBar
                                            label="Entrevistas com IA"
                                            used={usage.interviewsUsed.used}
                                            total={usage.interviewsUsed.limit}
                                            color="#6366f1"
                                        />
                                    </>
                                ) : (
                                    <p className="mycompany-consumption__loading">Dados indisponíveis.</p>
                                )}

                                <div className="mycompany-consumption__footer">
                                    <p className="mycompany-consumption__since">
                                        {subscription?.endDate ? (
                                            <>Próxima renovação: <strong>{new Date(subscription.endDate).toLocaleDateString("pt-BR")}</strong></>
                                        ) : (
                                            <>Plano ativo desde <strong>{new Date(subscription?.startDate).toLocaleDateString("pt-BR")}</strong></>
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* onboarding */}
                    <div
                        className="mycompany-onboarding"
                        style={{
                            background: company.onboardingCompleted ? "rgba(16,185,129,0.06)" : "rgba(249,115,22,0.06)",
                            border: `1px solid ${company.onboardingCompleted ? "rgba(16,185,129,0.25)" : "rgba(249,115,22,0.25)"}`,
                        }}
                    >
                        <div
                            className="mycompany-onboarding__icon"
                            style={{ background: company.onboardingCompleted ? "rgba(16,185,129,0.15)" : "rgba(249,115,22,0.15)" }}
                        >
                            {company.onboardingCompleted ? (
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            ) : (
                                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.2">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                            )}
                        </div>
                        <div>
                            <p className="mycompany-onboarding__title">
                                {company.onboardingCompleted ? "Onboarding concluído" : "Onboarding pendente"}
                            </p>
                            <p className="mycompany-onboarding__desc">
                                {company.onboardingCompleted
                                    ? "Perfil da empresa 100% configurado."
                                    : "Complete as informações para melhor uso do sistema."}
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}