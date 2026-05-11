import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PlanGate } from "../../hooks/planGate";
import AsyncSelect from "../../components/asyncSelect";
import api from "../../services/api";
import {
    ArrowLeft, PencilSimple, Trash, MapPin, Clock,
    Briefcase, CurrencyDollar, Calendar, Eye, EyeSlash,
    CheckCircle, Buildings, Tag, Users, Warning, Trophy
} from "@phosphor-icons/react";
import styles from "./CSS/JobsDetail.module.css";

const CONTRACT_MAP = { CLT: "CLT", PJ: "PJ", FREELANCER: "Freelancer" };
const FORMAT_MAP = { REMOTE: "Remoto", HYBRID: "Híbrido", ONSITE: "Presencial" };
const TYPE_MAP = { STANDARD: "Padrão", INTERNSHIP: "Estágio", TRAINEE: "Trainee" };
const PRIORITY_MAP = { LOW: "Baixa", MEDIUM: "Média", HIGH: "Alta", URGENT: "Urgente" };
const STATUS_MAP = {
    ACTIVE: "Ativa",
    INACTIVE: "Inativa",
    HIRED: "Contratada",
};
const AFFIRMATIVE_MAP = {
    NOT_INFORMED: "Não informado", PCD: "PCD", WOMEN: "Mulheres",
    FIFTY_PLUS: "50+", LGBTQIAPN: "LGBTQIAPN+",
};

const PRIORITY_STYLE = {
    LOW: { color: "#64748b", bg: "#f1f5f9", dot: "#94a3b8" },
    MEDIUM: { color: "#f97316", bg: "#fff7ed", dot: "#f97316" },
    HIGH: { color: "#6366f1", bg: "#eef2ff", dot: "#6366f1" },
    URGENT: { color: "#ef4444", bg: "#fef2f2", dot: "#ef4444" },
};

const STATUS_STYLE = {
    ACTIVE: { color: "#16a34a", bg: "#f0fdf4" },
    INACTIVE: { color: "#64748b", bg: "#f1f5f9" },
    HIRED: { color: "#059669", bg: "#d1fae5" },
};

const PROFILE_COLORS = {
    analyst: { color: "#3b82f6", label: "Analista" },
    communicator: { color: "#eab308", label: "Comunicador" },
    executor: { color: "#ef4444", label: "Executor" },
    planner: { color: "#22c55e", label: "Planejador" },
};

function InfoCard({ label, value, icon: Icon }) {
    return (
        <div className={styles.infoCard}>
            <div className={styles.infoCardAccent} />
            <div className={styles.infoCardTop}>
                {Icon && (
                    <div className={styles.infoIconWrap}>
                        <Icon size={15} color="var(--orange)" weight="duotone" />
                    </div>
                )}
                <p className={styles.infoLabel}>{label}</p>
            </div>
            <p className={styles.infoValue}>{value || "—"}</p>
        </div>
    );
}

function ProfileBar({ field, value = 0 }) {
    const cfg = PROFILE_COLORS[field];
    const max = 5;
    const pct = Math.min((value / max) * 100, 100);
    return (
        <div className={styles.profileItem}>
            <div className={styles.profileLabel}>
                <span>{cfg.label}</span>
                <span style={{ color: cfg.color, fontWeight: 700 }}>{value} pts</span>
            </div>
            <div className={styles.profileBarBg}>
                <div
                    className={styles.profileBarFill}
                    style={{ width: `${pct}%`, background: cfg.color }}
                />
            </div>
        </div>
    );
}

function SectionCard({ title, subtitle, children, className = "", extra }) {
    return (
        <div className={`${styles.card} ${className}`}>
            <div className={styles.cardHeader}>
                <div>
                    <p className={styles.cardTitle}>{title}</p>
                    {subtitle && <p className={styles.cardSub}>{subtitle}</p>}
                </div>
                {extra}
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
    const [statusSaved, setStatusSaved] = useState(false);

    useEffect(() => {
        api.get(`/jobs/${id}`)
            .then((res) => {
                setJob(res.data[0]);
                setSector(res.data[1].name);
                setPosition(res.data[2].name);
            })
            .catch(() => setError("Vaga não encontrada."))
            .finally(() => setLoading(false));
    }, [id]);

    const STATUS_OPTIONS = [
        { value: "ACTIVE", label: "Ativa" },
        { value: "INACTIVE", label: "Inativa" },
    ];

    async function fetchStatusOptions(search = "") {
        return STATUS_OPTIONS.filter((s) =>
            s.label.toLowerCase().includes(search.toLowerCase())
        );
    }

    async function handleStatusChange(option) {
        try {
            await api.post(`/jobs/${id}/status`, { status: option.value });
            setJob((prev) => ({ ...prev, status: option.value }));
            setStatusSaved(true);
            setTimeout(() => setStatusSaved(false), 3000);
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
            <div className={styles.centered}>
                <div className={styles.spinner} />
                <span className={styles.spinnerLabel}>Carregando vaga...</span>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className={styles.centered}>
                <div className={styles.errorIconWrap}>
                    <Warning size={22} color="#ef4444" weight="duotone" />
                </div>
                <p className={styles.errorText}>
                    {error ?? "Vaga não encontrada."}
                </p>
                <button className={styles.btnSecondary} onClick={() => navigate("/jobs")}>
                    <ArrowLeft size={14} /> Voltar para vagas
                </button>
            </div>
        );
    }

    const isHired = job.status === "HIRED";
    const priorityStyle = PRIORITY_STYLE[job.priority] ?? PRIORITY_STYLE.MEDIUM;

    const fullAddress = job.workFormat === "REMOTE"
        ? "Trabalho remoto"
        : [job.address, job.number, job.complement, job.neighborhood, job.city, job.state, job.cep]
            .filter(Boolean).join(", ");

    const formattedSalary = job.salary
        ? `R$ ${Number(job.salary).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
        : "A combinar";

    const formattedDeadline = job.deadline
        ? new Date(job.deadline).toLocaleDateString("pt-BR")
        : "Sem prazo";

    const fmt = (d) =>
        new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

    const hasBenefits =
        (job.benefits?.length > 0) || (job.customBenefits?.length > 0);

    return (
        <PlanGate>
            <div className="page-content"><div className={styles.page}>
                {statusSaved && (
                    <div className={styles.toast}>
                        <CheckCircle size={16} weight="fill" />
                        Status da vaga atualizado com sucesso!
                    </div>
                )}

                <div className={styles.header}>
                    <div className={styles.headerLeft_wrap}>
                        <button
                            className={styles.btnBack}
                            onClick={() => navigate("/jobs")}
                            title="Voltar"
                        >
                            <ArrowLeft size={15} weight="bold" />
                        </button>

                        <div className={styles.headerLeft}>
                            <div className={styles.headerMeta}>
                                <h1 className={styles.headerTitle}>{job.title}</h1>

                                <span className={`${styles.visibilityChip} ${job.visible ? styles.visibilityChipVisible : styles.visibilityChipHidden}`}>
                                    {job.visible
                                        ? <Eye size={12} weight="fill" />
                                        : <EyeSlash size={12} weight="fill" />
                                    }
                                    {job.visible ? "Visível" : "Oculta"}
                                </span>

                                <span
                                    className={styles.badge}
                                    style={{ color: priorityStyle.color, background: priorityStyle.bg }}
                                >
                                    <span
                                        className={styles.priorityDot}
                                        style={{ background: priorityStyle.dot }}
                                    />
                                    {PRIORITY_MAP[job.priority]}
                                </span>

                                {isHired ? (
                                    <span className={styles.hiredBadge}>
                                        <Trophy size={13} weight="fill" color="#059669" />
                                        Contratada
                                    </span>
                                ) : (
                                    <AsyncSelect
                                        name="status"
                                        value={{ value: job.status, label: STATUS_MAP[job.status] }}
                                        fetchOptions={fetchStatusOptions}
                                        onChange={handleStatusChange}
                                        placeholder="Status"
                                        colorMap={STATUS_STYLE}
                                    />
                                )}
                            </div>

                            <p className={styles.headerSub}>
                                <span className={styles.sectorAccent}>{sector}</span>
                                <span className={styles.headerSubDivider}>·</span>
                                {position}
                            </p>
                        </div>
                    </div>

                    <div className={styles.headerActions}>
                        <div className={styles.headerDates}>
                            <span>Criada {fmt(job.createdAt)}</span>
                            <span className={styles.headerDatesDivider}>·</span>
                            <span>Atualizada {fmt(job.updatedAt)}</span>
                        </div>

                        <div className={styles.divider} />

                        {!isHired && (
                            <button className={styles.btnEdit} onClick={() => navigate(`/jobs/${id}/edit`)}>
                                <PencilSimple size={14} weight="bold" /> Editar
                            </button>
                        )}

                        <button className={styles.btnCandidates} onClick={() => navigate(`/jobs/${id}/candidates`)}>
                            <Users size={14} weight="bold" /> Candidatos
                        </button>

                        {!isHired && (
                            <button className={styles.btnDanger} onClick={handleDelete}>
                                <Trash size={14} weight="bold" /> Desativar
                            </button>
                        )}
                    </div>
                </div>

                <div className={styles.infoGrid}>
                    <InfoCard label="Contrato" value={CONTRACT_MAP[job.contractType]} icon={Briefcase} />
                    <InfoCard label="Formato" value={FORMAT_MAP[job.workFormat]} icon={Buildings} />
                    <InfoCard label="Tipo de vaga" value={TYPE_MAP[job.jobType]} icon={Tag} />
                    <InfoCard label="Carga horária" value={`${job.workload}h/semana`} icon={Clock} />
                    <InfoCard label="Salário" value={formattedSalary} icon={CurrencyDollar} />
                    <InfoCard label="Prazo" value={formattedDeadline} icon={Calendar} />
                    <InfoCard label="Vaga afirmativa" value={AFFIRMATIVE_MAP[job.affirmative]} icon={Users} />
                    <InfoCard label="Publicada em" value={fmt(job.createdAt)} icon={Calendar} />
                </div>

                <SectionCard
                    title="Perfil comportamental esperado"
                    subtitle="Distribuição de competências para o candidato ideal"
                    className={styles.sectionMb}
                >
                    <div className={styles.profileGrid}>
                        {["analyst", "communicator", "executor", "planner"].map((f) => (
                            <ProfileBar key={f} field={f} value={job.profile?.[f] ?? 0} />
                        ))}
                    </div>
                </SectionCard>

                <div className={styles.twoCol}>
                    <div className={styles.twoColMain}>
                        <SectionCard title="Descrição da vaga">
                            <p className={styles.descriptionText}>{job.description}</p>
                        </SectionCard>
                    </div>

                    <div className={styles.twoColSide}>
                        <SectionCard
                            title="Localização"
                            subtitle="Onde a vaga será exercida"
                        >
                            <div className={styles.locationWrap}>
                                <div className={styles.locationAddress}>
                                    <MapPin
                                        size={16}
                                        color="var(--orange)"
                                        weight="duotone"
                                        className={styles.locationAddressIcon}
                                    />
                                    <p className={styles.locationText}>{fullAddress}</p>
                                </div>

                                {job.workFormat === "REMOTE" && (
                                    <div className={styles.remoteNote}>
                                        <Buildings size={14} weight="duotone" />
                                        Trabalho 100% remoto
                                    </div>
                                )}

                                <div className={styles.locationMeta}>
                                    {[
                                        ["Formato", FORMAT_MAP[job.workFormat]],
                                        ["Modalidade", TYPE_MAP[job.jobType]],
                                        ["Contrato", CONTRACT_MAP[job.contractType]],
                                    ].map(([lbl, val]) => (
                                        <div key={lbl} className={styles.locationMetaRow}>
                                            <span className={styles.locationMetaLabel}>{lbl}</span>
                                            <span className={styles.locationMetaValue}>{val}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </SectionCard>
                    </div>
                </div>

                {hasBenefits && (
                    <SectionCard
                        title="Benefícios"
                        subtitle="Benefícios oferecidos para esta vaga"
                        extra={
                            <span className={styles.benefitsCount}>
                                {(job.benefits?.length ?? 0) + (job.customBenefits?.length ?? 0)} benefícios
                            </span>
                        }
                    >
                        <div className={styles.benefitsWrap}>
                            {job.benefits?.map((b) => (
                                <span key={b.benefitId} className={styles.chip}>
                                    {b.benefit?.name}
                                </span>
                            ))}
                            {job.customBenefits?.map((b) => (
                                <span key={b} className={styles.chipCustom}>
                                    {b}
                                </span>
                            ))}
                        </div>
                    </SectionCard>
                )}

            </div>
        </div>
        </PlanGate>
    );
}