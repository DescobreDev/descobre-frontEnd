import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PlanGate } from "../../hooks/planGate";
import AsyncSelect from "../../components/asyncSelect";
import api from "../../services/api";
import {
    ArrowLeft, PencilSimple, Trash, MapPin, Clock,
    Briefcase, CurrencyDollar, Calendar, Eye, EyeSlash,
    CheckCircle, Buildings, Tag, Users
} from "@phosphor-icons/react";
import styles from "./CSS/jobs.module.css";

const CONTRACT_MAP = { CLT: "CLT", PJ: "PJ", FREELANCER: "Freelancer" };
const FORMAT_MAP = { REMOTE: "Remoto", HYBRID: "Híbrido", ONSITE: "Presencial" };
const TYPE_MAP = { STANDARD: "Padrão", INTERNSHIP: "Estágio", TRAINEE: "Trainee" };
const PRIORITY_MAP = { LOW: "Baixa", MEDIUM: "Média", HIGH: "Alta", URGENT: "Urgente" };
const AFFIRMATIVE_MAP = {
    NOT_INFORMED: "Não informado",
    PCD: "PCD",
    WOMEN: "Mulheres",
    FIFTY_PLUS: "50+",
    LGBTQIAPN: "LGBTQiapn+",
};
const STATUS_MAP = { ACTIVE: "Ativa", INACTIVE: "Inativa", CLOSED: "Encerrada" };

const PRIORITY_STYLE = {
    LOW: { color: "#64748b", bg: "#f1f5f9" },
    MEDIUM: { color: "#f97316", bg: "#fff7ed" },
    HIGH: { color: "#6366f1", bg: "#eef2ff" },
    URGENT: { color: "#ef4444", bg: "#fef2f2" },
};

const STATUS_STYLE = {
    ACTIVE: { color: "#16a34a", bg: "#f0fdf4" },
    INACTIVE: { color: "#64748b", bg: "#f1f5f9" },
    CLOSED: { color: "#ef4444", bg: "#fef2f2" },
};

function Badge({ label, color, bg }) {
    return (
        <span style={{
            fontSize: 12, fontWeight: 600, padding: "3px 10px",
            borderRadius: 99, color, background: bg,
            whiteSpace: "nowrap",
        }}>
            {label}
        </span>
    );
}

function InfoCard({ label, value, icon: Icon }) {
    return (
        <div className={styles.infoCard}>
            {Icon && <Icon size={16} color="var(--orange)" weight="duotone" />}
            <div>
                <p className={styles.infoLabel}>{label}</p>
                <p className={styles.infoValue}>{value || "—"}</p>
            </div>
        </div>
    );
}

function Section({ title, subtitle, children, className = "", headerClass = "" }) {
    return (
        <div className={`card ${className}`}>
            <div
                className={`card-header ${headerClass}`}
                style={{ marginBottom: 16 }}
            >
                <div>
                    <p className="card-title">{title}</p>
                    {subtitle && <p className="card-subtitle">{subtitle}</p>}
                </div>
            </div>

            {children}
        </div>
    );
}

export default function JobsDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [sector, setSector] = useState(null);
    const [position, setPosition] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get(`/jobs/${id}`)
            .then((res) => {
                setJob(res.data[0]);

                setSector(res.data[1].name);
                setPosition(res.data[2].name)
            })
            .catch(() => setError("Vaga não encontrada."))
            .finally(() => setLoading(false));
    }, [id]);

    const STATUS_OPTIONS = [
        { value: "ACTIVE", label: "Ativa" },
        { value: "INACTIVE", label: "Inativa" },
        { value: "CLOSED", label: "Encerrada" },
    ];

    async function fetchStatusOptions(search) {
        return STATUS_OPTIONS.filter((s) =>
            s.label.toLowerCase().includes(search.toLowerCase())
        );
    }

    async function handleStatusChange(option) {
        try {
            await api.post(`/jobs/${id}/status`, { status: option.value });
            setJob((prev) => ({ ...prev, status: option.value }));
        } catch {
            alert("Erro ao atualizar status da vaga.");
        }
    }

    async function handleDelete() {
        if (!confirm(`Desativar a vaga "${job.title}"?`)) return;
        try {
            await api.delete(`/jobs/${id}`);
            navigate("/jobs");
        } catch {
            alert("Erro ao desativar a vaga.");
        }
    }

    if (loading) {
        return (
            <div className="page-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
                <div style={{ textAlign: "center", color: "var(--text-muted)" }}>Carregando...</div>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="page-content">
                <div className="feedback-banner feedback-error">{error ?? "Vaga não encontrada."}</div>
            </div>
        );
    }

    const priorityStyle = PRIORITY_STYLE[job.priority] ?? PRIORITY_STYLE.MEDIUM;
    const statusStyle = STATUS_STYLE[job.status] ?? STATUS_STYLE.ACTIVE;

    const fullAddress = job.workFormat === "REMOTE"
        ? "Remoto"
        : [job.address, job.number, job.complement, job.neighborhood, job.city, job.state, job.cep]
            .filter(Boolean)
            .join(", ");

    const formattedSalary = job.salary
        ? `R$ ${Number(job.salary).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
        : "A combinar";

    const formattedDeadline = job.deadline
        ? new Date(job.deadline).toLocaleDateString("pt-BR")
        : "Sem prazo";

    const formattedCreatedAt = new Date(job.createdAt).toLocaleDateString("pt-BR", {
        day: "2-digit", month: "long", year: "numeric",
    });

    const formattedUpdatedAt = new Date(job.updatedAt).toLocaleDateString("pt-BR", {
        day: "2-digit", month: "long", year: "numeric",
    });

    return (
        <PlanGate>
            <div className="page-content">

                <div className={styles.pageHeader}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <button className="btn-secondary" style={{ padding: "8px 12px" }} onClick={() => navigate("/jobs")}>
                            <ArrowLeft size={16} weight="bold" />
                        </button>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                                <h1 className={styles.pageTitle}>{job.title}</h1>
                                <Badge label={PRIORITY_MAP[job.priority]} color={priorityStyle.color} bg={priorityStyle.bg} />
                                <Badge label={STATUS_MAP[job.status]} color={statusStyle.color} bg={statusStyle.bg} />
                                {job.visible
                                    ? <Eye size={16} color="var(--green)" title="Visível" />
                                    : <EyeSlash size={16} color="var(--text-muted)" title="Oculta" />
                                }
                            </div>
                            <p className={styles.pageSubtitle}>
                                {sector} · {position}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                Criada em {formattedCreatedAt}
                            </span>
                            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>·</span>
                            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                                Atualizada em {formattedUpdatedAt}
                            </span>
                        </div>

                        <AsyncSelect
                            name="status"
                            value={{ value: job.status, label: STATUS_MAP[job.status] }}
                            fetchOptions={fetchStatusOptions}
                            onChange={handleStatusChange}
                            placeholder="Status da vaga"
                        />

                        <button className="btn-secondary" onClick={() => navigate(`/jobs/${id}/edit`)}>
                            <PencilSimple size={16} />
                            Editar
                        </button>

                        <button
                            className="btn-primary"
                            style={{ background: "linear-gradient(135deg, #ef4444, #dc2626)" }}
                            onClick={handleDelete}
                        >
                            <Trash size={16} />
                            Desativar
                        </button>
                    </div>
                </div>

                {/* ── Info cards ── */}
                <div className={styles.infoGrid}>
                    <InfoCard label="Contrato" value={CONTRACT_MAP[job.contractType]} icon={Briefcase} />
                    <InfoCard label="Formato" value={FORMAT_MAP[job.workFormat]} icon={Buildings} />
                    <InfoCard label="Tipo de vaga" value={TYPE_MAP[job.jobType]} icon={Tag} />
                    <InfoCard label="Carga horária" value={`${job.workload}h/semana`} icon={Clock} />
                    <InfoCard label="Salário" value={formattedSalary} icon={CurrencyDollar} />
                    <InfoCard label="Prazo" value={formattedDeadline} icon={Calendar} />
                    <InfoCard label="Vaga afirmativa" value={AFFIRMATIVE_MAP[job.affirmative]} icon={Users} />
                    <InfoCard label="Criada em" value={formattedCreatedAt} icon={Calendar} />
                </div>

                <section className="flex gap-4">
                    {/* ── Descrição ── */}
                    <div className="w-3/4">
                        <Section title="Descrição da vaga">
                            <p className="text-sm text-[var(--text-2)] leading-7 whitespace-pre-wrap">
                                {job.description}
                            </p>
                        </Section>
                    </div>

                    {/* ── Localização ── */}
                    {job.workFormat !== "REMOTE" && (
                        <div className="w-1/4">
                            <Section title="Localização" subtitle="Endereço onde a vaga será exercida">
                                <div className="flex items-start gap-2.5">
                                    <MapPin
                                        size={16}
                                        className="mt-[2px] shrink-0 text-[var(--orange)]"
                                        weight="duotone"
                                    />
                                    <p className="text-sm text-[var(--text-2)] leading-7">
                                        {fullAddress}
                                    </p>
                                </div>
                            </Section>
                        </div>
                    )}
                </section>

                {/* ── Benefícios ── */}
                {job.benefits?.length > 0 && (
                    <Section title="Benefícios" subtitle="Benefícios oferecidos pela vaga">
                        <div className={styles.benefitsList}>
                            {job.benefits.map((b) => (
                                <span key={b.benefitId} className={styles.benefitChip} style={{ cursor: "default" }}>
                                    {b.benefit?.name}
                                </span>
                            ))}

                            {/* ── Benefícios complementares ── */}
                            {job.customBenefits?.length > 0 && (
                                job.customBenefits.map((b) => (
                                    <span key={b} className={styles.benefitChip} style={{ cursor: "default" }}>
                                        {b}
                                    </span>
                                ))
                            )}
                        </div>



                    </Section>
                )}


            </div>
        </PlanGate>
    );
}