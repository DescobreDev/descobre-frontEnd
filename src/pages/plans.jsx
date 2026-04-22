import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CSS/plans.module.css";
import { CheckCircle, Star, ArrowRight, Lightning, Buildings, Crown, Briefcase, Robot, CurrencyDollar, Microphone } from "@phosphor-icons/react";
import api from "../services/api";
import { Modal } from '../components/modal';
import WizardModalAsaas from "../components/wizardModalAsaas";
import { AuthContext } from "../context/authContext";

const ANNUAL_PRICES = {
    Bronze: 2500,
    Prata: 6600,
    Ouro: 15900,
};

const MONTHLY_PRICES = {
    Bronze: 229,
    Prata: 599,
    Ouro: 1490,
};

const PLAN_FEATURES = {
    Bronze: {
        dashboard: { label: "Dashboard Simples", included: true },
        disc: { label: "Análise DISC", included: false },
        cv: { label: "CV Importado", included: true },
    },
    Prata: {
        dashboard: { label: "Dashboard Intermediário", included: true },
        disc: { label: "Análise DISC", included: true },
        cv: { label: "CV Importado + Guiado", included: true },
    },
    Ouro: {
        dashboard: { label: "Dashboard Avançado", included: true },
        disc: { label: "Análise DISC", included: true },
        cv: { label: "CV Importado + Guiado", included: true },
    },
};

const PLAN_STYLE = {
    Bronze: { icon: Star, color: "#64748b", colorSoft: "#f1f5f9" },
    Prata: { icon: Lightning, color: "#f97316", colorSoft: "#fff7ed" },
    Ouro: { icon: Crown, color: "#6366f1", colorSoft: "#eef2ff" },
};

function buildFeatures(plan, isAnnual) {
    const extras = PLAN_FEATURES[plan.name] ?? {};
    return [
        { label: `${plan.maxJobs} vagas ativas`, included: true },
        { label: `${plan.maxAiResume} usos de Resumo de Cargo IA`, included: true },
        { label: `${plan.maxAiSalary} usos de Faixa Salarial IA`, included: true },
        { label: `${plan.maxInterviews} entrevistas com IA`, included: true },
        ...(extras.dashboard ? [{ label: extras.dashboard.label, included: extras.dashboard.included }] : []),
        ...(extras.disc ? [{ label: extras.disc.label, included: extras.disc.included }] : []),
        ...(extras.cv ? [{ label: extras.cv.label, included: extras.cv.included }] : []),
    ];
}

function PlanCard({ plan, index, currentPlanId, isAnnual }) {
    const style = PLAN_STYLE[plan.name] ?? {
        icon: Buildings,
        color: "#6366f1",
        colorSoft: "#eef2ff",
    };

    const Icon = style.icon;
    const isCurrent = plan.id === currentPlanId;
    const [activeModal, setActiveModal] = useState(null);
    const [openWizard, setOpenWizard] = useState(false);
    const navigate = useNavigate();

    function redirectForMainPage() {
        setActiveModal(null);
        navigate("/dashboard");
    }

    return (
        <div
            className={`${styles.card} ${plan.recommended ? styles.cardRecommended : ""} ${isCurrent ? styles.cardCurrent : ""}`}
            style={{ animationDelay: `${index * 100}ms` }}
        >
            <Modal isOpen={activeModal === "purchasedPlan"} onClose={() => setActiveModal(null)} title="">
                <div className={styles.purchased_modal}>

                    <div className={styles.purchased_modal_icon}>
                        <CheckCircle size={40} color="white" weight="fill" />
                    </div>

                    <h2 className={styles.purchased_modal_title}>Plano assinado com sucesso! 🚀</h2>
                    <p className={styles.purchased_modal_subtitle}>
                        Seu plano já está ativo. Agora você tem acesso a todos os recursos liberados.
                    </p>

                    <div className={styles.purchased_modal_features}>
                        <div className={styles.purchased_modal_feature}>
                            <Briefcase size={20} color="#6366f1" weight="duotone" />
                            <span>{plan?.maxJobs} vagas ativas</span>
                        </div>
                        <div className={styles.purchased_modal_feature}>
                            <Robot size={20} color="#6366f1" weight="duotone" />
                            <span>{plan?.maxAiResume} resumos com IA</span>
                        </div>
                        <div className={styles.purchased_modal_feature}>
                            <CurrencyDollar size={20} color="#6366f1" weight="duotone" />
                            <span>{plan?.maxAiSalary} faixas salariais</span>
                        </div>
                        <div className={styles.purchased_modal_feature}>
                            <Microphone size={20} color="#6366f1" weight="duotone" />
                            <span>{plan?.maxInterviews} entrevistas com IA</span>
                        </div>
                    </div>

                    <button className={styles.purchased_modal_btn} onClick={redirectForMainPage}>
                        Começar a usar
                        <ArrowRight size={18} weight="bold" />
                    </button>

                </div>
            </Modal>

            <WizardModalAsaas
                isOpen={openWizard}
                onClose={() => setOpenWizard(false)}
                plan={plan}
                isAnnual={isAnnual}
                onComplete={() => {
                    setOpenWizard(false);
                    setActiveModal("purchasedPlan");
                }}
            />

            {plan.recommended && (
                <div className={styles.badge}>
                    <Lightning size={12} weight="fill" />
                    Recomendado
                </div>
            )}

            <div className={styles.cardHeader}>
                <div className={styles.planIconWrap} style={{ background: style.colorSoft }}>
                    <Icon size={20} weight="duotone" color={style.color} />
                </div>
                <div>
                    <h2 className={styles.planName}>{plan.name}</h2>
                    <p className={styles.planDesc}>{plan.description}</p>
                </div>
            </div>

            {/* ── Preço ── */}
            {isAnnual ? (
                <div className={styles.priceRow}>
                    <span className={styles.currency}>R$</span>
                    <span className={styles.priceInt}>
                        {Number(ANNUAL_PRICES[plan.name] ?? plan.price).toLocaleString("pt-BR", {
                            minimumFractionDigits: 0,
                        })}
                    </span>
                    <div className={styles.priceSuffix}>
                        <span className={styles.priceCents}>,00</span>
                        <span className={styles.pricePer}>/ano</span>
                    </div>
                </div>
            ) : (
                <div className={styles.priceRow}>
                    <span className={styles.currency}>R$</span>
                    <span className={styles.priceInt}>
                        {Number(plan.price).toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                    </span>
                    <div className={styles.priceSuffix}>
                        <span className={styles.priceCents}>,00</span>
                        <span className={styles.pricePer}>/mês</span>
                    </div>
                </div>
            )}

            {MONTHLY_PRICES[plan.name] && (
                <span className={`${styles.saveBadge} ${isAnnual ? styles.saveBadgeVisible : ""}`}>
                    Economize R${" "}
                    {(
                        MONTHLY_PRICES[plan.name] * 12 - ANNUAL_PRICES[plan.name]
                    ).toLocaleString("pt-BR")}
                </span>
            )}

            <hr className={styles.divider} />

            <p className={styles.featuresLabel}>Recursos mensais inclusos</p>
            <ul className={styles.featureList}>
                {buildFeatures(plan, isAnnual).map((f) => (
                    <li key={f.label} className={`${styles.featureItem} ${!f.included ? styles.featureItemDisabled : ""}`}>
                        <CheckCircle
                            size={17}
                            weight="fill"
                            color={!f.included ? "#cbd5e1" : plan.recommended ? style.color : "#10b981"}
                            style={{ flexShrink: 0 }}
                        />
                        <span style={{ color: !f.included ? "#94a3b8" : undefined, textDecoration: !f.included ? "line-through" : undefined }}>
                            {f.label}
                        </span>
                    </li>
                ))}
            </ul>

            {index === 2 && (
                <div className={`${styles.card_future} card`}>
                    <span className={styles.featuresLabel} style={{ color: "#6366f1" }}>
                        Próximas Funcionalidades
                    </span>

                    <ul className={styles.futureList}>
                        <li>
                            <span className={styles.bullet}></span>
                            Entrevista por IA
                        </li>
                        <li>
                            <span className={styles.bullet}></span>
                            Checagem legal do candidato
                        </li>
                    </ul>
                </div>
            )}

            {isCurrent ? (
                <button className={styles.btnCurrent} disabled>
                    <Star size={15} weight="fill" />
                    Plano Atual
                </button>
            ) : (
                <button
                    className={`${styles.btnSubscribe} ${plan.recommended ? styles.btnSubscribeAccent : ""}`}
                    onClick={() => setOpenWizard(true)}
                >
                    Assinar Agora
                    <ArrowRight size={16} weight="bold" />
                </button>
            )}
        </div>
    );
}

function Plans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isAnnual, setIsAnnual] = useState(false);
    const { user } = useContext(AuthContext);

    const pillRef = useRef(null);
    const btnMRef = useRef(null);
    const btnARef = useRef(null);

    let currentPlanId = null;

    if (user?.company?.subscription?.[0]?.active === true) {
        currentPlanId = user?.company?.subscription?.[0]?.planId ?? null;
    }

    useEffect(() => {
        api.get("/plans")
            .then((res) => setPlans(res.data))


            .catch(() => setError("Não foi possível carregar os planos."))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const pill = pillRef.current;
        const target = btnMRef.current;
        if (!pill || !target) return;
        pill.style.left = (target.offsetLeft - 4) + "px";
        pill.style.width = target.offsetWidth + "px";
    }, []);

    if (loading) {
        return (
            <div className={styles.page}>
                <div className={styles.loadingWrap}>
                    <div className={styles.spinner} />
                    <p>Carregando planos...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.page}>
                <p className={styles.errorMsg}>{error}</p>
            </div>
        );
    }

    return (
        <div className="page-content">
            <div className={styles.pageHeader}>
                <div className={styles.pageTitleWrap}>
                    <h1 className={styles.pageTitle}>Escolha seu plano</h1>
                    <p className={styles.pageSubtitle}>
                        Escale conforme o crescimento da sua empresa. Sem taxas ocultas.
                    </p>
                </div>
                <div className={styles.billingToggle}>
                    <div className={styles.billingPill} ref={pillRef} />
                    <div
                        className={`${styles.billingBtn} ${!isAnnual ? styles.billingBtnActive : ""}`}
                        ref={btnMRef}
                        onClick={() => setIsAnnual(false)}
                    >
                        Mensal
                    </div>
                    <div
                        className={`${styles.billingBtn} ${isAnnual ? styles.billingBtnActive : ""}`}
                        ref={btnARef}
                        onClick={() => setIsAnnual(true)}
                    >
                        Anual
                        <em className={styles.discount}>−5%</em>
                    </div>
                </div>
            </div>

            <div className={styles.flex}>
                {plans.map((plan, i) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        index={i}
                        currentPlanId={currentPlanId}
                        isAnnual={isAnnual}
                        setError={setError}
                        setLoading={setLoading}
                    />
                ))}
            </div>

            <p className={styles.footerNote}>
                Todos os planos incluem suporte por e-mail · Cancele a qualquer momento · Dados protegidos com criptografia
            </p>
        </div>
    );
}

export default Plans;