import { useEffect, useState, useContext } from "react";
import { PlanGate } from "../hooks/planGate";
import styles from "./CSS/payments.module.css";
import { AuthContext } from "../context/authContext";
import { Modal } from "../components/Modal";
import api from "../services/api";

const STATUS_MAP = {
    RECEIVED:  { label: "Pago",       style: "success", dotClass: "dotSuccess" },
    CONFIRMED: { label: "Confirmado", style: "info",    dotClass: "dotInfo"    },
    OVERDUE:   { label: "Atrasado",   style: "danger",  dotClass: "dotDanger"  },
    PENDING:   { label: "Pendente",   style: "warning", dotClass: "dotWarning" },
};

const fmt = (val) =>
    Number(val).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

const fmtDate = (val) =>
    val ? new Date(val).toLocaleDateString("pt-BR") : null;

const monthLabel = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR", {
        month: "short",
        year: "numeric",
    });
};

function copyToClipboard(text, el) {
    navigator.clipboard?.writeText(text);
    const orig = el.textContent;
    el.textContent = "copiado";
    setTimeout(() => (el.textContent = orig), 1200);
}

function PaymentRow({ payment }) {
    const status = STATUS_MAP[payment.status] || {
        label: payment.status,
        style: "default",
        dotClass: "dotDefault",
    };

    const subLabel =
        payment.status === "RECEIVED" || payment.status === "CONFIRMED"
            ? `Pago em: ${fmtDate(payment.paidAt) ?? '- Aguardando pagamento'}`
            : payment.status === "PENDING"
                ? `Vence em ${fmtDate(payment.dueDate)}`
                : `Venceu em ${fmtDate(payment.dueDate)}`;

    return (
        <div className={styles.paymentRow}>
            <div className={`${styles.monthDot} ${styles[status.dotClass]}`} />
            <div className={styles.rowMonth}>{monthLabel(payment.dueDate)}</div>
            <div className={styles.rowDesc}>
                <div className={styles.rowDescMain}>{payment.plan} — renovação</div>
                <div className={styles.rowDescSub}>{subLabel}</div>
            </div>
            <div className={styles.rowAmount}>R$ {fmt(payment.value)}</div>
            <span className={`${styles.badge} ${styles[`badge-${status.style}`]}`}>
                {status.label}
            </span>
            <span
                className={styles.idChip}
                title="Copiar ID"
                onClick={(e) => copyToClipboard(payment.asaasId, e.currentTarget)}
            >
                {payment.asaasId.slice(0, 8)}…
            </span>
        </div>
    );
}

function CancelModal({ isOpen, onClose, subscription, onCanceled }) {
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState(null);

    async function handleConfirm() {
        setLoading(true);
        setError(null);
        try {
            await api.post("/payments/asaas/cancel");
            onCanceled();
            onClose();
        } catch (err) {
            setError(
                err?.response?.data?.message ?? "Erro ao cancelar. Tente novamente."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Cancelar assinatura"
            canClose={!loading}
            maxWidth="max-w-md"
        >
            <div className={styles.cancelBody}>
                <div className={styles.cancelIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                </div>

                <p className={styles.cancelTitle}>Tem certeza que deseja cancelar?</p>
                <p className={styles.cancelDesc}>
                    Seu acesso será mantido até{" "}
                    <strong>{fmtDate(subscription?.endDate) ?? "o fim do período"}</strong>.
                    Após essa data, o plano será desativado e você não será cobrado novamente.
                </p>

                {error && <p className={styles.cancelError}>{error}</p>}

                <div className={styles.cancelActions}>
                    <button
                        className={styles.cancelBtnSecondary}
                        onClick={onClose}
                        disabled={loading}
                    >
                        Manter assinatura
                    </button>
                    <button
                        className={styles.cancelBtnDanger}
                        onClick={handleConfirm}
                        disabled={loading}
                    >
                        {loading ? "Cancelando..." : "Confirmar cancelamento"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}

export default function Payments() {
    const [data, setData]             = useState([]);
    const [loading, setLoading]       = useState(true);
    const [showCancel, setShowCancel] = useState(false);

    const { user, setUser } = useContext(AuthContext);
    const company      = user?.company ?? {};
    const subscription = company.subscription?.[0];
    const isCanceled   = !!subscription?.canceledAt;

    useEffect(() => {
        async function load() {
            try {
                const res = await api.get("/payments/asaas/history");
                setData(res.data);
            } catch (err) {
                console.error("Erro ao buscar pagamentos:", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []);

    const nextDue = data.find(
        (p) => p.status === "PENDING" || p.status === "CONFIRMED"
    );

    const totalPaid = data
        .filter((p) => p.status === "RECEIVED" || p.status === "CONFIRMED")
        .reduce((sum, p) => sum + Number(p.value), 0);

    const totalOpen = data
        .filter((p) => p.status === "PENDING" || p.status === "OVERDUE")
        .reduce((sum, p) => sum + Number(p.value), 0);

    function handleCanceled() {
        if (!setUser) return;
        setUser((prev) => ({
            ...prev,
            company: {
                ...prev.company,
                subscription: [
                    {
                        ...subscription,
                        canceledAt: new Date().toISOString(),
                    },
                ],
            },
        }));
    }

    return (
        <PlanGate>
            <div className="page-content">
                <div className={styles.header}>
                    <h1 className="pageTitle">Pagamentos</h1>
                    <p className="pageSubtitle">Histórico da sua assinatura</p>
                </div>

                {/* Card do plano */}
                {subscription && (
                    <div className={styles.planCard}>
                        <div className={styles.planInfo}>
                            <div className={styles.planIcon}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                                    stroke="currentColor" strokeWidth="1.5">
                                    <rect x="1" y="3" width="14" height="10" rx="2" />
                                    <path d="M1 6h14" />
                                    <path d="M4 10h2" />
                                </svg>
                            </div>
                            <div>
                                <div className={styles.planName}>
                                    Plano {subscription.plan?.name}
                                </div>
                                <div className={styles.planCycle}>
                                    Cobrança {subscription.isAnnual ? "anual" : "mensal"}
                                    {nextDue?.dueDate &&
                                        ` · próxima em ${fmtDate(nextDue.dueDate)}`}
                                </div>
                                {isCanceled ? (
                                    <div className={styles.planCanceledBadge}>
                                        <span className={styles.planCanceledDot} />
                                        Cancelado · acesso até {fmtDate(subscription.endDate)}
                                    </div>
                                ) : (
                                    <div className={styles.planActiveBadge}>
                                        <span className={styles.planActiveDot} />
                                        Ativo
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.planRight}>
                            <div className={styles.planPrice}>
                                R$ {fmt(
                                    subscription.isAnnual
                                        ? subscription.plan?.annualPrice
                                        : subscription.plan?.price
                                )}
                                <span>/{subscription.isAnnual ? "ano" : "mês"}</span>
                            </div>

                            {!isCanceled && (
                                <button
                                    className={styles.cancelTrigger}
                                    onClick={() => setShowCancel(true)}
                                >
                                    Cancelar assinatura
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Métricas */}
                {!loading && data.length > 0 && (
                    <div className={styles.statsRow}>
                        <div className={styles.statCard}>
                            <div className={styles.statLabel}>Total pago</div>
                            <div className={styles.statVal}>R$ {fmt(totalPaid)}</div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statLabel}>Cobranças</div>
                            <div className={styles.statVal}>
                                {data.length}
                                <span> registros</span>
                            </div>
                        </div>
                        <div className={styles.statCard}>
                            <div className={styles.statLabel}>Em aberto</div>
                            <div className={styles.statVal}>R$ {fmt(totalOpen)}</div>
                        </div>
                    </div>
                )}

                <div className={styles.sectionLabel}>Histórico de cobranças</div>

                {loading ? (
                    <p className={styles.empty}>Carregando...</p>
                ) : data.length === 0 ? (
                    <p className={styles.empty}>Nenhum pagamento encontrado.</p>
                ) : (
                    <div className={styles.paymentList}>
                        {data.map((p) => (
                            <PaymentRow key={p.asaasId} payment={p} />
                        ))}
                    </div>
                )}
            </div>

            <CancelModal
                isOpen={showCancel}
                onClose={() => setShowCancel(false)}
                subscription={subscription}
                onCanceled={handleCanceled}
            />
        </PlanGate>
    );
}