import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./CSS/plans.module.css";
import { CheckCircle, Star, ArrowRight, Lightning, Buildings, Crown, Briefcase, Robot, CurrencyDollar, Microphone   } from "@phosphor-icons/react";
import api from "../services/api";
import { Modal } from '../components/modal';
import { AuthContext } from "../context/authContext";

const PLAN_STYLE = {
    Starter: { icon: Star, color: "#64748b", colorSoft: "#f1f5f9" },
    Basic: { icon: Lightning, color: "#f97316", colorSoft: "#fff7ed" },
    Ouro: { icon: Crown, color: "#6366f1", colorSoft: "#eef2ff" },
};

function buildFeatures(plan) {
    return [
        `${plan.maxJobs} vagas ativas`,
        `${plan.maxAiResume} usos de Resumo de Cargo IA`,
        `${plan.maxAiSalary} usos de Faixa Salarial IA`,
        `${plan.maxInterviews} entrevistas com IA`,
    ];
}

function PlanCard({ plan, index, currentPlanId, setError, setLoading }) {
    const style = PLAN_STYLE[plan.name] ?? {
        icon: Buildings,
        color: "#6366f1",
        colorSoft: "#eef2ff",
    };

    const Icon = style.icon;
    const isCurrent = plan.id === currentPlanId;
    const features = buildFeatures(plan);
    const [activeModal, setActiveModal] = useState(null);
    const { setUser } = useContext(AuthContext)
    const navigate = useNavigate();

    function redirectForMainPage() {
        setActiveModal(null);
        navigate("/dashboard");
    }

    async function subscribePlan(e) {
        e.preventDefault();

        try {
            const response = await api.post("/plans/subscribe", {
                planId: plan.id
            });

            if (response.status === 201) {
                const updatedUser = await api.get("/users/me");
                setUser(updatedUser.data);

                setActiveModal("purchasedPlan");
            }

        } catch (err) {
            setError(err.response?.data?.message || "Erro ao adquirir um plano");
        } finally {
            setLoading(false);
        }
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

            <div className={styles.priceRow}>
                <span className={styles.currency}>R$</span>
                <span className={styles.priceInt}>
                    {Number(plan.price).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                </span>
                <div className={styles.priceSuffix}>
                    <span className={styles.priceCents}>,00</span>
                    <span className={styles.pricePer}>/mês</span>
                </div>
            </div>

            <hr className={styles.divider} />

            <p className={styles.featuresLabel}>Recursos mensais inclusos</p>
            <ul className={styles.featureList}>
                {features.map((f) => (
                    <li key={f} className={styles.featureItem}>
                        <CheckCircle
                            size={17}
                            weight="fill"
                            color={plan.recommended ? style.color : "#10b981"}
                            style={{ flexShrink: 0 }}
                        />
                        {f}
                    </li>
                ))}
            </ul>

            {isCurrent ? (
                <button className={styles.btnCurrent} disabled>
                    <Star size={15} weight="fill" />
                    Plano Atual
                </button>
            ) : (
                <button
                    className={`${styles.btnSubscribe} ${plan.recommended ? styles.btnSubscribeAccent : ""}`}
                    onClick={subscribePlan}
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
    const { user } = useContext(AuthContext);

    const currentPlanId = user?.company?.subscription?.[0]?.planId ?? null;

    useEffect(() => {
        api.get("/plans")
            .then((res) => setPlans(res.data))
            .catch(() => setError("Não foi possível carregar os planos."))
            .finally(() => setLoading(false));
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
                    <span className={styles.billingActive}>Mensal</span>
                    <span className={styles.billingInactive}>
                        Anual <em className={styles.discount}>−20%</em>
                    </span>
                </div>
            </div>

            <div className={styles.flex}>
                {plans.map((plan, i) => (
                    <PlanCard
                        key={plan.id}
                        plan={plan}
                        index={i}
                        currentPlanId={currentPlanId}
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