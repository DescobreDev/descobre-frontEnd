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

/* O ponto (dot) sobe em intensidade de laranja conforme a prioridade
   sobe — só a Urgente quebra pra vermelho, de propósito, pra continuar
   lendo como alerta mesmo num sistema onde laranja já é a cor de tudo. */
const PRIORITY_STYLE = {
    LOW: { dot: "#a8a29e" },
    MEDIUM: { dot: "#fdba74" },
    HIGH: { dot: "var(--orange)" },
    URGENT: { dot: "#ef4444" },
};

const STATUS_STYLE = {
    ACTIVE: { color: "#86efac", bg: "#052e1b" },
    INACTIVE: { color: "#d6d3d1", bg: "#1c1410" },
    HIRED: { color: "#6ee7b7", bg: "#052e1b" },
};

function StatTile({ label, value, icon: Icon }) {
    return (
        <div className={styles.statTile}>
            <div className={styles.statIconWrap}>
                <Icon size={16} color="var(--orange)" weight="duotone" />
            </div>
            <div className={styles.statBody}>
                <span className={styles.statLabel}>{label}</span>
                <span className={styles.statValue}>{value || "—"}</span>
            </div>
        </div>
    );
}

function DetailsRow({ label, value, icon: Icon }) {
    return (
        <div className={styles.detailsRow}>
            <span className={styles.detailsLabel}>
                {Icon && <Icon size={13} weight="bold" className={styles.detailsIcon} />}
                {label}
            </span>
            <span className={styles.detailsValue}>{value || "—"}</span>
        </div>
    );
}

function SectionCard({ title, subtitle, children, extra }) {
    return (
        <div className={styles.card}>
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

                <nav className={styles.breadcrumb}>
                    <button className={styles.breadcrumbLink} onClick={() => navigate("/jobs")}>
                        Vagas
                    </button>
                    <span className={styles.breadcrumbSep}>›</span>
                    <span>{sector}</span>
                    <span className={styles.breadcrumbSep}>›</span>
                    <span className={styles.breadcrumbCurrent}>{job.title}</span>
                </nav>

                {/* ── HERO + STATS FLUTUANTES ─────── */}
                <div className={styles.heroWrap}>
                    <div className={styles.heroCard}>
                        <div className={styles.heroTopRow}>
                            <div className={styles.heroTitleRow}>
                                <button
                                    className={styles.heroBackBtn}
                                    onClick={() => navigate("/jobs")}
                                    title="Voltar"
                                >
                                    <ArrowLeft size={15} weight="bold" />
                                </button>

                                <div className={styles.heroTitleBlock}>
                                    <h1 className={styles.heroTitle}>{job.title}</h1>
                                    <p className={styles.heroSubtitle}>
                                        <span className={styles.heroSubtitleAccent}>{sector}</span>
                                        <span className={styles.heroSubtitleDivider}>·</span>
                                        {position}
                                    </p>

                                    <div className={styles.heroChipRow}>
                                        <span className={styles.heroChip}>
                                            <span
                                                className={styles.heroChipDot}
                                                style={{ background: priorityStyle.dot }}
                                            />
                                            Prioridade {PRIORITY_MAP[job.priority]}
                                        </span>

                                        <span className={styles.heroChip}>
                                            {job.visible
                                                ? <Eye size={12} weight="fill" />
                                                : <EyeSlash size={12} weight="fill" />
                                            }
                                            {job.visible ? "Visível" : "Oculta"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.heroStatusZone}>
                                <span className={styles.heroStatusLabel}>Status</span>
                                {isHired ? (
                                    <span className={styles.hiredBadge}>
                                        <Trophy size={14} weight="fill" color="#6ee7b7" />
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
                        </div>

                        <div className={styles.heroDivider} />

                        <div className={styles.heroFooter}>
                            <div className={styles.heroMeta}>
                                <span>Criada {fmt(job.createdAt)}</span>
                                <span className={styles.heroMetaDivider}>·</span>
                                <span>Atualizada {fmt(job.updatedAt)}</span>
                            </div>

                            <div className={styles.heroActions}>
                                {!isHired && (
                                    <button className={styles.btnGhostOnDark} onClick={() => navigate(`/jobs/${id}/edit`)}>
                                        <PencilSimple size={14} weight="bold" /> Editar
                                    </button>
                                )}

                                <button className={styles.btnPrimary} onClick={() => navigate(`/jobs/${id}/candidates`)}>
                                    <Users size={14} weight="bold" /> Candidatos
                                </button>

                                {!isHired && (
                                    <button className={styles.btnDangerGhost} onClick={handleDelete}>
                                        <Trash size={14} weight="bold" /> Desativar
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className={styles.statsBar}>
                        <StatTile label="Salário" value={formattedSalary} icon={CurrencyDollar} />
                        <StatTile label="Prazo" value={formattedDeadline} icon={Calendar} />
                        <StatTile label="Formato" value={FORMAT_MAP[job.workFormat]} icon={Buildings} />
                        <StatTile label="Carga horária" value={`${job.workload}h/semana`} icon={Clock} />
                    </div>
                </div>

                {/* ── DESCRIÇÃO + SIDEBAR ─────────── */}
                <div className={styles.twoCol}>
                    <div className={styles.twoColMain}>
                        <SectionCard title="Descrição da vaga">
                            <p className={styles.descriptionText}>{job.description}</p>
                        </SectionCard>
                    </div>

                    <div className={styles.twoColSide}>
                        <SectionCard title="Localização" subtitle="Onde a vaga será exercida">
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
                            </div>
                        </SectionCard>

                        <SectionCard title="Detalhes da vaga">
                            <div className={styles.detailsList}>
                                <DetailsRow icon={Briefcase} label="Contrato" value={CONTRACT_MAP[job.contractType]} />
                                <DetailsRow icon={Tag} label="Tipo de vaga" value={TYPE_MAP[job.jobType]} />
                                <DetailsRow icon={Users} label="Vaga afirmativa" value={AFFIRMATIVE_MAP[job.affirmative]} />
                                <DetailsRow icon={Calendar} label="Publicada em" value={fmt(job.createdAt)} />
                            </div>
                        </SectionCard>
                    </div>
                </div>

                {/* ── BENEFÍCIOS ───────────────────── */}
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