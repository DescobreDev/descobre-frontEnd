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

/* Um único acento de cor (--orange) carrega a marca da vaga.
   Prioridade e status usam apenas peso/opacidade de neutro,
   exceto Urgente e Contratada, que têm sinal semântico próprio
   por serem estados que pedem atenção imediata. */
const PRIORITY_STYLE = {
    LOW: { dot: "var(--text-muted)" },
    MEDIUM: { dot: "var(--orange)" },
    HIGH: { dot: "var(--orange)" },
    URGENT: { dot: "#e5484d" },
};

const STATUS_STYLE = {
    ACTIVE: { color: "#1a7f4e", bg: "#e9f9f0" },
    INACTIVE: { color: "var(--text-muted)", bg: "var(--surface-2)" },
    HIRED: { color: "#1a7f4e", bg: "#e9f9f0" },
};

function DetailRow({ label, value, icon: Icon }) {
    return (
        <div className={styles.detailRow}>
            <span className={styles.detailLabel}>
                {Icon && <Icon size={14} weight="regular" />}
                {label}
            </span>
            <span className={styles.detailValue}>{value || "—"}</span>
        </div>
    );
}

function Card({ title, subtitle, extra, children, className = "" }) {
    return (
        <section className={`${styles.card} ${className}`}>
            {(title || extra) && (
                <header className={styles.cardHeader}>
                    <div>
                        {title && <h2 className={styles.cardTitle}>{title}</h2>}
                        {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
                    </div>
                    {extra}
                </header>
            )}
            {children}
        </section>
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
            <div className={styles.stateWrap}>
                <div className={styles.spinner} />
                <span className={styles.stateLabel}>Carregando vaga...</span>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className={styles.stateWrap}>
                <div className={styles.stateIcon} data-tone="error">
                    <Warning size={20} weight="bold" />
                </div>
                <p className={styles.stateText}>{error ?? "Vaga não encontrada."}</p>
                <button className={styles.btnSecondary} onClick={() => navigate("/jobs")}>
                    <ArrowLeft size={14} weight="bold" /> Voltar para vagas
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

    const hasBenefits = (job.benefits?.length > 0) || (job.customBenefits?.length > 0);
    const benefitsTotal = (job.benefits?.length ?? 0) + (job.customBenefits?.length ?? 0);

    return (
        <PlanGate>
            <div className="page-content">
                <div className={styles.page}>
                    {statusSaved && (
                        <div className={styles.toast} role="status">
                            <CheckCircle size={16} weight="fill" />
                            Status atualizado com sucesso
                        </div>
                    )}

                    {/* ── Navegação ─────────────────────── */}
                    <nav className={styles.breadcrumb} aria-label="Navegação">
                        <button className={styles.breadcrumbBack} onClick={() => navigate("/jobs")} aria-label="Voltar para vagas">
                            <ArrowLeft size={15} weight="bold" />
                        </button>
                        <button className={styles.breadcrumbLink} onClick={() => navigate("/jobs")}>
                            Vagas
                        </button>
                        <span className={styles.breadcrumbSep}>/</span>
                        <span>{sector}</span>
                        <span className={styles.breadcrumbSep}>/</span>
                        <span className={styles.breadcrumbCurrent}>{job.title}</span>
                    </nav>

                    {/* ── Cabeçalho ─────────────────────── */}
                    <header className={styles.header}>
                        <div className={styles.headerTop}>
                            <div className={styles.headerTitleBlock}>
                                <h1 className={styles.title}>{job.title}</h1>
                                <p className={styles.subtitle}>
                                    {sector} <span className={styles.subtitleSep}>·</span> {position}
                                </p>
                            </div>

                            {isHired ? (
                                <span className={styles.hiredBadge}>
                                    <Trophy size={14} weight="fill" />
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

                        <div className={styles.metaLine}>
                            <span className={styles.metaItem}>
                                <span className={styles.metaDot} style={{ background: priorityStyle.dot }} />
                                Prioridade {PRIORITY_MAP[job.priority]}
                            </span>
                            <span className={styles.metaDivider}>•</span>
                            <span className={styles.metaItem}>
                                {job.visible ? <Eye size={13} /> : <EyeSlash size={13} />}
                                {job.visible ? "Visível para candidatos" : "Oculta"}
                            </span>
                            <span className={styles.metaDivider}>•</span>
                            <span className={styles.metaItem}>Criada {fmt(job.createdAt)}</span>
                            <span className={styles.metaDivider}>•</span>
                            <span className={styles.metaItem}>Atualizada {fmt(job.updatedAt)}</span>
                        </div>

                        <div className={styles.actionBar}>
                            <button className={styles.btnPrimary} onClick={() => navigate(`/jobs/${id}/candidates`)}>
                                <Users size={15} weight="bold" /> Ver candidatos
                            </button>
                            {!isHired && (
                                <button className={styles.btnSecondary} onClick={() => navigate(`/jobs/${id}/edit`)}>
                                    <PencilSimple size={14} weight="bold" /> Editar
                                </button>
                            )}
                            {!isHired && (
                                <button className={styles.btnDanger} onClick={handleDelete}>
                                    <Trash size={14} weight="bold" /> Desativar
                                </button>
                            )}
                        </div>
                    </header>

                    {/* ── Resumo ────────────────────────── */}
                    <div className={styles.summaryGrid}>
                        <div className={styles.summaryItem}>
                            <CurrencyDollar size={16} weight="bold" />
                            <div>
                                <span className={styles.summaryLabel}>Salário</span>
                                <span className={styles.summaryValue}>{formattedSalary}</span>
                            </div>
                        </div>
                        <div className={styles.summaryItem}>
                            <Calendar size={16} weight="bold" />
                            <div>
                                <span className={styles.summaryLabel}>Prazo</span>
                                <span className={styles.summaryValue}>{formattedDeadline}</span>
                            </div>
                        </div>
                        <div className={styles.summaryItem}>
                            <Buildings size={16} weight="bold" />
                            <div>
                                <span className={styles.summaryLabel}>Formato</span>
                                <span className={styles.summaryValue}>{FORMAT_MAP[job.workFormat]}</span>
                            </div>
                        </div>
                        <div className={styles.summaryItem}>
                            <Clock size={16} weight="bold" />
                            <div>
                                <span className={styles.summaryLabel}>Carga horária</span>
                                <span className={styles.summaryValue}>{job.workload}h/semana</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Conteúdo ──────────────────────── */}
                    <div className={styles.layout}>
                        <div className={styles.layoutMain}>
                            <Card title="Descrição da vaga">
                                <p className={styles.description}>{job.description}</p>
                            </Card>

                            {hasBenefits && (
                                <Card
                                    title="Benefícios"
                                    extra={<span className={styles.countPill}>{benefitsTotal}</span>}
                                >
                                    <div className={styles.benefitsWrap}>
                                        {job.benefits?.map((b) => (
                                            <span key={b.benefitId} className={styles.chip}>{b.benefit?.name}</span>
                                        ))}
                                        {job.customBenefits?.map((b) => (
                                            <span key={b} className={styles.chipAccent}>{b}</span>
                                        ))}
                                    </div>
                                </Card>
                            )}
                        </div>

                        <aside className={styles.layoutSide}>
                            <Card title="Localização">
                                <div className={styles.locationRow}>
                                    <MapPin size={16} weight="bold" className={styles.locationIcon} />
                                    <p className={styles.locationText}>{fullAddress}</p>
                                </div>
                            </Card>

                            <Card title="Detalhes">
                                <div className={styles.detailList}>
                                    <DetailRow icon={Briefcase} label="Contrato" value={CONTRACT_MAP[job.contractType]} />
                                    <DetailRow icon={Tag} label="Tipo de vaga" value={TYPE_MAP[job.jobType]} />
                                    <DetailRow icon={Users} label="Vaga afirmativa" value={AFFIRMATIVE_MAP[job.affirmative]} />
                                </div>
                            </Card>
                        </aside>
                    </div>
                </div>
            </div>
        </PlanGate>
    );
}