import { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import {
  VideoCamera,
  Buildings,
  CalendarBlank,
  Clock,
  Info,
  Warning,
  ClipboardText,
  CheckFat,
  XCircle,
  ArrowsClockwise,
  ArrowLeft,
  X,
  ArrowRight,
  FileText,
  Brain,
  CheckCircle,
  Trophy,
  EnvelopeSimple,
  SealCheck,
  Phone,
  Briefcase,
  MapPin,
  CurrencyDollar,
  GraduationCap,
  Repeat,
  Target,
  ChatCircleDots,
  HandHeart,
  MagnifyingGlass,
  Sparkle,
  Globe,
  ChartBar,
  IdentificationBadge,
  Medal,
  ShieldCheck,
} from "@phosphor-icons/react";
import { AuthContext } from "../../context/authContext";
import { PlanGate } from "../../hooks/planGate";
import { Modal } from "../../components/modal";
import api from "../../services/api";
import styles from "./CSS/jobsCandidateDetail.module.css";

const STATUS_LABELS = {
  RECEBIDA: "Aguardando",
  ANALISE: "Análise",
  ENTREVISTA: "Entrevista",
  APROVADO: "Aprovado",
  REPROVADO: "Reprovado",
  DESISTIU: "Desistiu",
};

const STATUS_COLORS = {
  RECEBIDA: { color: "#f59e0b", bg: "#fef3c7", dot: "#f59e0b" },
  ANALISE: { color: "#3b82f6", bg: "#dbeafe", dot: "#3b82f6" },
  ENTREVISTA: { color: "#8b5cf6", bg: "#ede9fe", dot: "#8b5cf6" },
  APROVADO: { color: "#10b981", bg: "#d1fae5", dot: "#10b981" },
  REPROVADO: { color: "#ef4444", bg: "#fee2e2", dot: "#ef4444" },
  DESISTIU: { color: "#6b7280", bg: "#f3f4f6", dot: "#6b7280" },
};

const TIMELINE_STEPS = [
  { key: "RECEBIDA", label: "Recebida", num: 1 },
  { key: "ANALISE", label: "Análise", num: 2 },
  { key: "ENTREVISTA", label: "Entrevista", num: 3 },
  { key: "APROVADO", label: "Aprovado", num: 4 },
];

const NEXT_STATUS = {
  RECEBIDA: "ANALISE",
  ANALISE: "ENTREVISTA",
  ENTREVISTA: "APROVADO",
};

const CONFIRM_COPY = {
  ANALISE: {
    title: "Mover para Análise",
    body: "Você confirma que deseja mover este candidato para a etapa de Análise? Ele terá acesso ao currículo completo.",
    btn: "Confirmar",
  },
  ENTREVISTA: {
    title: "Convidar para Entrevista",
    body: null,
    btn: "Enviar convite",
  },
  APROVADO: {
    title: "Contratar candidato",
    body: "Ao confirmar, o candidato será marcado como Aprovado e a vaga será encerrada automaticamente. Essa ação não pode ser desfeita.",
    btn: "Confirmar contratação",
  },
};

const PROFILE_TYPE_INFO = {
  EXECUTOR: {
    label: "Dominância", short: "D", color: "#b91c1c", bg: "#fee2e2",
    icon: Target,
    desc: "Direto, decidido, orientado a resultados.",
    traits: ["Objetivo e direto", "Gosta de desafios", "Decide rápido", "Foco em resultado"],
  },
  COMMUNICATOR: {
    label: "Influência", short: "I", color: "#b45309", bg: "#fef3c7",
    icon: ChatCircleDots,
    desc: "Comunicativo, entusiasta, persuasivo.",
    traits: ["Sociável e entusiasta", "Bom em persuadir", "Gosta de trabalhar com pessoas", "Otimista"],
  },
  PLANNER: {
    label: "Estabilidade", short: "S", color: "#047857", bg: "#d1fae5",
    icon: HandHeart,
    desc: "Paciente, colaborativo, constante.",
    traits: ["Paciente e leal", "Colaborativo", "Consistente", "Evita conflitos"],
  },
  ANALYST: {
    label: "Conformidade", short: "C", color: "#1d4ed8", bg: "#dbeafe",
    icon: MagnifyingGlass,
    desc: "Analítico, preciso, criterioso.",
    traits: ["Analítico e detalhista", "Preciso", "Segue processos", "Criterioso"],
  },
};

const BREAKDOWN_ICONS = {
  disc: Brain,
  cargo: Briefcase,
  salario: CurrencyDollar,
  regime: Repeat,
  localizacao: MapPin,
  experiencia: GraduationCap,
};

const EXPERIENCE_LABELS = {
  ESTAGIO: "Estágio",
  JUNIOR: "Júnior",
  PLENO: "Pleno",
  SENIOR: "Sênior",
  ESPECIALISTA: "Especialista",
};

const CONTRACT_LABELS = { CLT: "CLT", PJ: "PJ", FREELANCER: "Freelancer" };

const INTERVIEW_EVENT_LABELS = {
  INVITE_SENT: { title: "Convite enviado", type: "invite_sent" },
  CONFIRMED: { title: "Candidato confirmou presença", type: "confirmed" },
  DECLINED: { title: "Candidato recusou a entrevista", type: "declined" },
  RESCHEDULED: { title: "Candidato sugeriu novo horário", type: "rescheduled" },
};

function initials(name = "") {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function fmtDate(val) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("pt-BR");
}

function fmtDateTime(val) {
  if (!val) return "—";
  return new Date(val).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function fmtMoney(val) {
  if (val == null) return "—";
  return Number(val).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function SectionHeading({ icon: Icon, children }) {
  return (
    <p className={styles.sectionHeading}>
      {Icon && (
        <span className={styles.sectionHeadingIcon}>
          <Icon size={13} weight="bold" />
        </span>
      )}
      {children}
    </p>
  );
}

function InfoPopover({ text }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const btnRef = useRef(null);

  function updatePos() {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({
      top: rect.top + window.scrollY - 8,
      left: rect.left + window.scrollX + rect.width / 2,
    });
  }

  useEffect(() => {
    if (!open) return;
    updatePos();

    function handler(e) {
      if (btnRef.current && !btnRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const popover = open && createPortal(
    <div style={{
      position: "absolute",
      top: pos.top,
      left: pos.left,
      transform: "translate(-50%, -100%)",
      width: 240,
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 8,
      padding: "10px 12px",
      fontSize: 12,
      lineHeight: 1.6,
      color: "var(--text-2)",
      zIndex: 99999,
      boxShadow: "0 8px 24px rgba(0,0,0,0.14)",
      pointerEvents: "none",
    }}>
      <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
        <Warning size={13} weight="fill" color="var(--orange)" style={{ flexShrink: 0, marginTop: 2 }} />
        <span>{text}</span>
      </div>
      <div style={{
        position: "absolute",
        bottom: -6,
        left: "50%",
        transform: "translateX(-50%) rotate(45deg)",
        width: 10,
        height: 10,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        borderBottom: "1px solid var(--border)",
      }} />
    </div>,
    document.body
  );

  return (
    <>
      <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
        <button
          ref={btnRef}
          type="button"
          onMouseEnter={() => setOpen(true)}
          onMouseLeave={() => setOpen(false)}
          onClick={() => setOpen(v => !v)}
          className={styles.infoPopoverBtn}
        >
          <Info size={15} weight="fill" />
        </button>
      </span>
      {popover}
    </>
  );
}

function MatchBadge({ score }) {
  const tier =
    score >= 80 ? { bg: "#d1fae5", color: "#065f46", label: "Recomendado", icon: Medal } :
      score >= 50 ? { bg: "#dbeafe", color: "#1e40af", label: "Compatível", icon: ShieldCheck } :
        { bg: "#fee2e2", color: "#991b1b", label: "Baixo match", icon: Warning };
  const TierIcon = tier.icon;

  return (
    <div className={styles.matchBadgeWrap}>
      <div className={styles.matchCircle} style={{ "--score": score }}>
        <svg viewBox="0 0 36 36" className={styles.matchSvg}>
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--border)" strokeWidth="2.5" />
          <circle
            cx="18" cy="18" r="15.9" fill="none"
            stroke={tier.color} strokeWidth="2.5"
            strokeDasharray={`${(score / 100) * 99.9} 99.9`}
            strokeLinecap="round"
            transform="rotate(-90 18 18)"
          />
        </svg>
        <span className={styles.matchPct}>{score}%</span>
      </div>
      <div>
        <p className={styles.matchLabel}>Compatibilidade</p>
        <span className={styles.matchTag} style={{ background: tier.bg, color: tier.color }}>
          <TierIcon size={12} weight="fill" />
          {tier.label}
        </span>
      </div>
    </div>
  );
}

function DiscBadge({ type, size = 32 }) {
  const info = PROFILE_TYPE_INFO[type];
  if (!info) return null;
  const Icon = info.icon;
  return (
    <span
      className={styles.discBadge}
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, ${info.color}, ${info.color}cc)`,
        boxShadow: `0 3px 10px ${info.color}40`,
      }}
    >
      <Icon size={size * 0.52} weight="bold" color="#fff" />
      <span className={styles.discBadgeTag} style={{ color: info.color }}>{info.short}</span>
    </span>
  );
}

function DiscRow({ type, tag }) {
  const info = PROFILE_TYPE_INFO[type];
  if (!info) return null;
  return (
    <div className={styles.discRow}>
      <DiscBadge type={type} size={38} />
      <div>
        <p className={styles.discRowName}>{info.label}</p>
        <span className={styles.discRowTag}>{tag}</span>
      </div>
    </div>
  );
}

function BreakdownGrid({ breakdown }) {
  const order = ["disc", "cargo", "salario", "regime", "localizacao", "experiencia"];
  return (
    <div className={styles.profileGrid}>
      {order.map((key) => {
        const item = breakdown[key];
        if (!item) return null;
        const hasData = item.score !== null;
        const pct = hasData ? Math.round(item.score * 100) : null;
        const Icon = BREAKDOWN_ICONS[key];
        return (
          <div key={key} className={styles.profileCard}>
            <div className={styles.profileCardTop}>
              {Icon && (
                <span className={styles.profileCardIconWrap}>
                  <Icon size={16} weight="bold" />
                </span>
              )}
              <div>
                <p className={styles.profileLabel}>{item.label}</p>
                <p className={styles.profileScore}>
                  {hasData ? `${pct}%` : "—"}
                  <span> peso {Math.round(item.weight * 100)}%</span>
                </p>
              </div>
            </div>
            <div className={styles.profileBarWrap}>
              <div className={styles.profileBar}>
                <div
                  className={styles.profileFill}
                  style={{ width: hasData ? `${pct}%` : "0%", opacity: hasData ? 1 : 0.3 }}
                />
              </div>
              <span className={styles.profilePct}>{hasData ? `${pct}%` : "S/ dado"}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MatchTab({ candidate, jobProfile, score, breakdown, eligible, ineligibleReason }) {
  if (!eligible) {
    return (
      <div className={styles.tabContent}>
        <div className={styles.profileWarning}>
          <Warning size={18} weight="fill" color="#d97706" style={{ flexShrink: 0 }} />
          <p>{ineligibleReason || "Este candidato não atende aos critérios elegíveis desta vaga."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tabContent}>
      <div className={styles.matchHero}>
        <MatchBadge score={score ?? 0} />
        <p className={styles.matchHint}>
          O score compara perfil comportamental, cargo, salário, regime, localização e experiência
          entre a vaga e o candidato.
        </p>
      </div>

      {jobProfile?.primaryProfile && candidate?.profileType && (
        <div className={styles.matchCompareCard}>
          <div className={styles.matchCompareCol}>
            <p className={styles.matchCompareLabel}>
              <Briefcase size={12} weight="bold" /> Vaga busca
            </p>
            <DiscRow type={jobProfile.primaryProfile} tag="1º perfil" />
            {jobProfile.secondaryProfile && <DiscRow type={jobProfile.secondaryProfile} tag="2º perfil" />}
          </div>
          <div className={styles.matchCompareDivider}><ArrowsClockwise size={20} /></div>
          <div className={styles.matchCompareCol}>
            <p className={styles.matchCompareLabel}>
              <IdentificationBadge size={12} weight="bold" /> Candidato tem
            </p>
            <DiscRow type={candidate.profileType} tag="1º perfil" />
            {candidate.profileTypeSecondary && <DiscRow type={candidate.profileTypeSecondary} tag="2º perfil" />}
          </div>
        </div>
      )}

      {breakdown && (
        <div>
          <SectionHeading icon={ChartBar}>Detalhamento do score</SectionHeading>
          <div style={{ marginTop: 12 }}>
            <BreakdownGrid breakdown={breakdown} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Card unificado: etapa da candidatura + preferências do candidato   */
/* ------------------------------------------------------------------ */

function TimelineBar({ status, embedded = false }) {
  const currentIdx = TIMELINE_STEPS.findIndex((s) => s.key === status);

  const content = (
    <>
      <SectionHeading icon={ClipboardText}>Etapa da candidatura</SectionHeading>
      <div className={styles.timeline}>
        {TIMELINE_STEPS.map((step, idx) => {
          const done = idx < currentIdx;
          const current = idx === currentIdx;
          const future = idx > currentIdx;
          return (
            <div key={step.key} className={styles.timelineStep}>
              {idx < TIMELINE_STEPS.length - 1 && (
                <div className={`${styles.timelineConnector} ${done ? styles.connectorDone : ""}`} />
              )}
              <div className={`${styles.timelineDot} ${done ? styles.dotDone : ""} ${current ? styles.dotCurrent : ""} ${future ? styles.dotFuture : ""}`}>
                {done ? <CheckCircle size={18} weight="fill" /> : <span className={styles.stepNumber}>{step.num}</span>}
              </div>
              <span className={`${styles.timelineLabel} ${done || current ? styles.labelActive : ""}`}>
                {step.label}
              </span>
              {current && <span className={styles.timelinePulse} />}
            </div>
          );
        })}
      </div>
    </>
  );

  if (embedded) return content;
  return <div className={styles.timelineCard}>{content}</div>;
}

function CandidatePreferencesCard({ candidate, embedded = false }) {
  const hasAny =
    candidate.desiredPosition ||
    candidate.desiredSalaryMin != null ||
    candidate.desiredSalaryMax != null ||
    candidate.city ||
    candidate.state ||
    candidate.experienceLevel ||
    (candidate.contractTypes?.length > 0);

  if (!hasAny) return null;

  const isFlexibleContract = (candidate.contractTypes?.length ?? 0) > 1;

  function salaryLabel() {
    const { desiredSalaryMin: min, desiredSalaryMax: max } = candidate;
    if (min != null && max != null) return `${fmtMoney(min)} — ${fmtMoney(max)}`;
    if (min != null) return `A partir de ${fmtMoney(min)}`;
    if (max != null) return `Até ${fmtMoney(max)}`;
    return null;
  }

  const content = (
    <>
      <SectionHeading icon={Sparkle}>Preferências do candidato</SectionHeading>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
        {candidate.desiredPosition && (
          <span className={styles.chip}>
            <Briefcase size={13} weight="bold" style={{ marginRight: 4 }} />
            {candidate.desiredPosition.name}
          </span>
        )}
        {salaryLabel() && (
          <span className={styles.chip}>
            <CurrencyDollar size={13} weight="bold" style={{ marginRight: 4 }} />
            Pretende {salaryLabel()}
            {candidate.salaryNegotiable ? " (negociável)" : ""}
          </span>
        )}
        {candidate.contractTypes?.length > 0 && (
          <span className={styles.chip}>
            <Repeat size={13} weight="bold" style={{ marginRight: 4 }} />
            {candidate.contractTypes.map((c) => CONTRACT_LABELS[c] || c).join(" / ")}
            {isFlexibleContract ? " (flexível)" : ""}
          </span>
        )}
        {(candidate.city || candidate.state) && (
          <span className={styles.chip}>
            <MapPin size={13} weight="bold" style={{ marginRight: 4 }} />
            {[candidate.city, candidate.state].filter(Boolean).join("/")}
            {candidate.acceptsTravel ? " · aceita viajar" : ""}
          </span>
        )}
        {candidate.experienceLevel && (
          <span className={styles.chip}>
            <GraduationCap size={13} weight="bold" style={{ marginRight: 4 }} />
            {EXPERIENCE_LABELS[candidate.experienceLevel] || candidate.experienceLevel}
          </span>
        )}
      </div>
    </>
  );

  if (embedded) return content;
  return <div className={styles.timelineCard}>{content}</div>;
}

// Junta timeline + preferências num único card quando ambos existem,
// evitando dois blocos separados empilhados no layout.
function ApplicationOverviewCard({ status, candidate }) {
  const showTimeline = !["REPROVADO", "DESISTIU"].includes(status);

  const hasPreferences =
    candidate.desiredPosition ||
    candidate.desiredSalaryMin != null ||
    candidate.desiredSalaryMax != null ||
    candidate.city ||
    candidate.state ||
    candidate.experienceLevel ||
    (candidate.contractTypes?.length > 0);

  if (!showTimeline) {
    // Sem etapa (reprovado/desistiu): mostra só preferências, se houver.
    return <CandidatePreferencesCard candidate={candidate} />;
  }

  return (
    <div className={styles.timelineCard}>
      <TimelineBar status={status} embedded />
      {hasPreferences && (
        <>
          <hr className="divider" style={{ margin: "20px 0" }} />
          <CandidatePreferencesCard candidate={candidate} embedded />
        </>
      )}
    </div>
  );
}

function CurriculoTab({ resume }) {
  if (!resume) return (
    <div className={styles.emptyState}>
      <span className={styles.emptyIconWrap}><FileText size={30} weight="duotone" /></span>
      <p>Candidato não possui currículo cadastrado.</p>
    </div>
  );

  return (
    <div className={styles.tabContent}>
      {resume.experiences?.length > 0 && (
        <div className={styles.section}>
          <SectionHeading icon={Briefcase}>Experiências</SectionHeading>
          <div className={styles.itemList}>
            {resume.experiences.map((exp) => (
              <div key={exp.id} className={styles.itemCard}>
                <div className={styles.itemAccent} />
                <div className={styles.itemBody}>
                  <p className={styles.itemTitle}>{exp.position}</p>
                  <p className={styles.itemSub}>{exp.company} · {fmtDate(exp.startDate)} — {exp.current ? "Atual" : fmtDate(exp.endDate)}</p>
                  {exp.description && <p className={styles.itemDesc}>{exp.description}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {resume.educations?.length > 0 && (
        <div className={styles.section}>
          <SectionHeading icon={GraduationCap}>Formação</SectionHeading>
          <div className={styles.itemList}>
            {resume.educations.map((edu) => (
              <div key={edu.id} className={styles.itemCard}>
                <div className={styles.itemAccent} style={{ background: "#8b5cf6" }} />
                <div className={styles.itemBody}>
                  <p className={styles.itemTitle}>{edu.course}</p>
                  <p className={styles.itemSub}>{edu.institution} · {fmtDate(edu.startDate)} — {edu.current ? "Atual" : fmtDate(edu.endDate)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {resume.skills?.length > 0 && (
        <div className={styles.section}>
          <SectionHeading icon={Sparkle}>Habilidades</SectionHeading>
          <div className={styles.chipList}>
            {resume.skills.map((s) => (
              <span key={s.id} className={styles.chip}>{s.name}{s.level ? ` · ${s.level}` : ""}</span>
            ))}
          </div>
        </div>
      )}

      {resume.languages?.length > 0 && (
        <div className={styles.section}>
          <SectionHeading icon={Globe}>Idiomas</SectionHeading>
          <div className={styles.chipList}>
            {resume.languages.map((l) => (
              <span key={l.id} className={`${styles.chip} ${styles.chipLang}`}>{l.language} · {l.level}</span>
            ))}
          </div>
        </div>
      )}

      {resume.cvFileUrl && (
        <div className={styles.section}>
          <SectionHeading icon={FileText}>Currículo em PDF</SectionHeading>
          <div className={styles.pdfWrap}>
            <iframe src={resume.cvFileUrl} title="Currículo PDF" />
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileHeroCard({ type, tag, big }) {
  const info = PROFILE_TYPE_INFO[type];
  if (!info) return null;
  const Icon = info.icon;

  return (
    <div
      className={styles.discHeroCard}
      style={{
        padding: big ? 24 : 18, flex: big ? "1 1 320px" : "1 1 240px",
        background: `linear-gradient(135deg, ${info.bg}, var(--surface))`,
        borderColor: `${info.color}2b`,
      }}
    >
      <div className={styles.discHeroTop}>
        <span
          className={styles.discHeroIconWrap}
          style={{
            width: big ? 64 : 48, height: big ? 64 : 48,
            background: `linear-gradient(135deg, ${info.color}, ${info.color}cc)`,
            boxShadow: `0 6px 16px ${info.color}45`,
          }}
        >
          <Icon size={big ? 30 : 24} weight="bold" />
        </span>
        <div>
          <span className={styles.discHeroTagRow}>
            {tag}
            <span
              className={styles.discHeroShort}
              style={{ color: info.color, border: `1px solid ${info.color}55` }}
            >
              {info.short}
            </span>
          </span>
          <p className={styles.discHeroTitle} style={{ fontSize: big ? 19 : 16 }}>
            {info.label}
          </p>
          <p className={styles.discHeroDesc}>{info.desc}</p>
        </div>
      </div>

      <div className={styles.discHeroTraits}>
        {info.traits.map((trait) => (
          <span
            key={trait}
            className={styles.discHeroTraitChip}
            style={{ border: `1px solid ${info.color}33`, color: info.color }}
          >
            {trait}
          </span>
        ))}
      </div>
    </div>
  );
}

function PerfilTab({ candidate }) {
  if (!candidate.profileCompleted || !candidate.profileType) {
    return (
      <div className={styles.tabContent}>
        <div className={styles.profileWarning}>
          <Warning size={18} weight="fill" color="#d97706" style={{ flexShrink: 0 }} />
          <p>Este candidato ainda não respondeu o questionário comportamental.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tabContent}>
      <div className={styles.discHeroGroup}>
        <ProfileHeroCard type={candidate.profileType} tag="Perfil primário" big />
        {candidate.profileTypeSecondary && (
          <ProfileHeroCard type={candidate.profileTypeSecondary} tag="Perfil secundário" />
        )}
      </div>
    </div>
  );
}

function buildAuditEvents(interviewEvents = []) {
  return interviewEvents.map((event) => {
    const meta = INTERVIEW_EVENT_LABELS[event.type] ?? { title: event.type, type: "status_change" };

    let description = null;
    if (event.type === "INVITE_SENT") {
      const parts = [];
      if (event.interviewType) parts.push(event.interviewType === "presencial" ? "Presencial" : "Online");
      if (event.scheduledAt) parts.push(`Agendada para ${fmtDateTime(event.scheduledAt)}`);
      if (event.meetingLink) parts.push(`Link: ${event.meetingLink}`);
      if (event.address) parts.push(`Local: ${event.address}`);
      description = parts.join(" · ") || null;
    }

    if (event.type === "RESCHEDULED" && event.proposedAt) {
      description = `Novo horário sugerido: ${fmtDateTime(event.proposedAt)}`;
    }

    return {
      type: meta.type,
      title: meta.title,
      date: event.createdAt,
      description,
      note: event.message || event.note || null,
    };
  });
}

function AuditoriaTab({ interviewEvents = [] }) {
  const auditEvents = buildAuditEvents(interviewEvents);

  if (auditEvents.length === 0) {
    return (
      <div className={styles.emptyState}>
        <span className={styles.emptyIconWrap}><ClipboardText size={30} weight="duotone" /></span>
        <p>Nenhum evento de auditoria registrado ainda.</p>
      </div>
    );
  }

  return (
    <div className={styles.tabContent}>
      <div style={{ marginBottom: 12 }}>
        <SectionHeading icon={ClipboardText}>Linha do tempo da entrevista</SectionHeading>
        <p style={{ fontSize: 13, color: "var(--text-muted)", margin: "4px 0 0" }}>
          Registro automático de todos os eventos relacionados à entrevista.
        </p>
      </div>

      <div className={styles.auditTimeline}>
        {auditEvents.map((event, idx) => (
          <div key={idx} className={styles.auditItem}>
            <div className={styles.auditDotWrap}>
              <div className={`${styles.auditDot} ${styles[`auditDot_${event.type}`]}`}>
                {event.type === "invite_sent" && <EnvelopeSimple size={13} weight="bold" />}
                {event.type === "confirmed" && <CheckFat size={13} weight="bold" />}
                {event.type === "declined" && <XCircle size={13} weight="bold" />}
                {event.type === "rescheduled" && <ArrowsClockwise size={13} weight="bold" />}
                {event.type === "status_change" && <Clock size={13} weight="bold" />}
              </div>
              {idx < auditEvents.length - 1 && <div className={styles.auditLine} />}
            </div>
            <div className={styles.auditContent}>
              <div className={styles.auditHeader}>
                <span className={styles.auditTitle}>{event.title}</span>
                <span className={styles.auditTime}>
                  <Clock size={11} weight="bold" style={{ marginRight: 3, verticalAlign: -1 }} />
                  {fmtDateTime(event.date)}
                </span>
              </div>
              {event.description && <p className={styles.auditDescription}>{event.description}</p>}
              {event.note && (
                <div className={styles.auditNote}><p>{event.note}</p></div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.auditLegend}>
        <span className={styles.auditLegendItem}>
          <span className={`${styles.auditDotMini} ${styles.auditDot_invite_sent}`} />
          Convite enviado
        </span>
        <span className={styles.auditLegendItem}>
          <span className={`${styles.auditDotMini} ${styles.auditDot_confirmed}`} />
          Confirmado
        </span>
        <span className={styles.auditLegendItem}>
          <span className={`${styles.auditDotMini} ${styles.auditDot_declined}`} />
          Recusado
        </span>
        <span className={styles.auditLegendItem}>
          <span className={`${styles.auditDotMini} ${styles.auditDot_rescheduled}`} />
          Sugeriu novo horário
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Cabeçalho compartilhado entre os modais de ação                    */
/* ------------------------------------------------------------------ */

function ModalHeader({ icon, title, subtitle, onClose, loading, tone = "default" }) {
  return (
    <div className={styles.modalHeader}>
      <div className={styles.modalHeaderLeft}>
        <div className={`${styles.modalHeaderIconWrap} ${tone === "danger" ? styles.modalHeaderIconWrapDanger : ""}`}>
          {icon}
        </div>
        <div>
          <div className={styles.modalHeaderTitle}>{title}</div>
          {subtitle && <div className={styles.modalHeaderSubtitle}>{subtitle}</div>}
        </div>
      </div>
      {!loading && onClose && (
        <button onClick={onClose} className={styles.modalCloseBtn}>
          <X size={16} weight="bold" />
        </button>
      )}
    </div>
  );
}

function ModalConfirm({ open, onClose, onConfirm, loading, nextStatus }) {
  const copy = CONFIRM_COPY[nextStatus];
  if (!copy || copy.body === null) return null;

  return (
    <Modal isOpen={open} onClose={onClose} title="" canClose={!loading} maxWidth="max-w-xl">
      <ModalHeader
        icon={<Warning size={16} weight="fill" color="var(--orange)" />}
        title={copy.title}
        subtitle="Esta operação não pode ser desfeita"
        onClose={onClose}
        loading={loading}
      />

      <div className={styles.modalConfirmBody}>
        <div className={styles.modalConfirmChip}>
          <span className={styles.modalConfirmChipDot} />
          {copy.title}
        </div>
        <p className={styles.modalConfirmText}>
          {copy.body}
        </p>
      </div>

      <div className={styles.modalFooter}>
        <button className={styles.btnSecondary} onClick={onClose} disabled={loading}>Cancelar</button>
        <button className={styles.btnModalPrimary} onClick={onConfirm} disabled={loading}>
          {loading ? "Aguarde..." : copy.btn}
        </button>
      </div>
    </Modal>
  );
}

function ModalReprovar({ open, onClose, onConfirm, loading, candidateName }) {
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!open) setConfirmed(false);
  }, [open]);

  return (
    <Modal isOpen={open} onClose={onClose} title="" canClose={!loading}>
      <ModalHeader
        icon={<XCircle size={16} weight="fill" color="#ef4444" />}
        title="Reprovar candidato"
        subtitle="Esta ação não pode ser desfeita"
        onClose={onClose}
        loading={loading}
        tone="danger"
      />

      <div className={styles.modalReprovarBody}>
        <div className={styles.modalReprovarCandidate}>
          <div className={styles.modalReprovarAvatar}>
            {initials(candidateName)}
          </div>
          <div>
            <div className={styles.modalReprovarAvatarName}>{candidateName}</div>
            <div className={styles.modalReprovarAvatarSub}>Candidato(a)</div>
          </div>
          <span className={styles.modalReprovarBadge}>
            <span className={styles.modalReprovarBadgeDot} />
            Reprovado
          </span>
        </div>

        <div className={styles.modalReprovarWarning}>
          <Warning size={15} weight="fill" color="#f97316" style={{ flexShrink: 0, marginTop: 1 }} />
          <p className={styles.modalReprovarWarningText}>
            Ao reprovar, o candidato será notificado e removido do processo seletivo.
            Você não poderá reverter esta decisão posteriormente.
          </p>
        </div>

        <label className={`${styles.modalReprovarCheckLabel} ${confirmed ? styles.modalReprovarCheckLabelActive : ""}`}>
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            style={{ width: 15, height: 15, accentColor: "#ef4444", cursor: "pointer", flexShrink: 0 }}
          />
          <span className={styles.modalReprovarCheckText}>
            Entendo que esta ação é <strong>irreversível</strong> e desejo reprovar este candidato.
          </span>
        </label>
      </div>

      <div className={styles.modalReprovarFooter}>
        <button className={styles.btnSecondary} onClick={onClose} disabled={loading}>
          Cancelar
        </button>
        <button
          className={styles.btnReprovarConfirm}
          onClick={onConfirm}
          disabled={loading || !confirmed}
        >
          <XCircle size={15} weight="bold" />
          {loading ? "Aguarde..." : "Reprovar candidato"}
        </button>
      </div>
    </Modal>
  );
}
function toDateInputValue(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toTimeInputValue(d) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function findLastInviteEvent(events = []) {
  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].type === "INVITE_SENT") return events[i];
  }
  return null;
}

const RESCHEDULE_DEFAULT_MESSAGE = `Olá!

Recebemos sua sugestão de novo horário e confirmamos a entrevista para a data abaixo.

Qualquer dúvida, estamos à disposição.

Atenciosamente,
Equipe de Recrutamento`;

/* Vive dentro do rodapé do hero — por isso é só a linha (ícone + texto +
   botão), sem card/borda próprios. */
function RescheduleRow({ event, onRespond }) {
  return (
    <div className={styles.rescheduleRow}>
      <div className={styles.rescheduleIconWrap}>
        <ArrowsClockwise size={16} weight="bold" color="#2b1608" />
      </div>
      <div className={styles.rescheduleText}>
        <p className={styles.rescheduleTitle}>Candidato sugeriu um novo horário</p>
        <p className={styles.rescheduleSub}>
          Nova data proposta: <strong>{fmtDateTime(event.proposedAt)}</strong>
          {event.note && <> — <em>"{event.note}"</em></>}
        </p>
      </div>
      <button className={styles.btnRespond} onClick={onRespond}>
        Responder
        <ArrowRight size={14} weight="bold" />
      </button>
    </div>
  );
}

const DEFAULT_INTERVIEW_MESSAGE = `Olá!

Sua candidatura avançou para a etapa de entrevista.

Gostaríamos de convidá-lo(a) para uma conversa em nossa empresa.

Por favor, confirme sua disponibilidade respondendo esta mensagem.

Atenciosamente,
Equipe de Recrutamento`;

function ModalEntrevista({
  open,
  onClose,
  onConfirm,
  loading,
  company,
  initialValues,
  title,
  subtitle,
  submitLabel,
}) {
  const [form, setForm] = useState({
    interviewType: "presencial",
    cep: "",
    address: "",
    number: "",
    complement: "",
    city: "",
    state: "",
    meetingLink: "",
    date: "",
    time: "",
    message: DEFAULT_INTERVIEW_MESSAGE,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setForm({
      interviewType: initialValues?.interviewType || "presencial",
      cep: company?.cep || "",
      address: company?.address || "",
      number: company?.number || "",
      complement: company?.complement || "",
      city: company?.city || "",
      state: company?.state || "",
      meetingLink: initialValues?.meetingLink || "",
      date: initialValues?.date || "",
      time: initialValues?.time || "",
      message: initialValues?.message || DEFAULT_INTERVIEW_MESSAGE,
    });
  }, [open, company, initialValues]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleTypeChange(type) {
    setForm((prev) => ({ ...prev, interviewType: type }));
    setErrors({});
  }

  function validate() {
    const errs = {};
    if (!form.date) errs.date = "Informe a data da entrevista";
    if (!form.time) errs.time = "Informe o horário da entrevista";
    if (form.interviewType === "presencial") {
      if (!form.address) errs.address = "Informe o endereço";
      if (!form.city) errs.city = "Informe a cidade";
      if (!form.state) errs.state = "Informe o estado";
    } else {
      if (!form.meetingLink) errs.meetingLink = "Informe o link da reunião";
    }
    return errs;
  }

  function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const fullAddress =
      form.interviewType === "presencial"
        ? `${form.address}, ${form.number}` +
        `${form.complement ? `, ${form.complement}` : ""}` +
        ` - ${form.city}/${form.state}` +
        `${form.cep ? ` - CEP ${form.cep}` : ""}`
        : null;

    onConfirm({ ...form, fullAddress });
  }
  const isPresencial = form.interviewType === "presencial";

  return (
    <Modal isOpen={open} onClose={onClose} title="" canClose={!loading}>
      <ModalHeader
        icon={<VideoCamera size={16} weight="fill" color="var(--orange)" />}
        title={title || "Convidar para entrevista"}
        subtitle={subtitle || "Defina o formato, data e local da conversa"}
        onClose={onClose}
        loading={loading}
      />

      <div className={styles.switchWrapper}>
        <button
          type="button"
          onClick={() => handleTypeChange("presencial")}
          className={`${styles.switchBtn} ${isPresencial ? styles.switchBtnActive : ""}`}
        >
          <Buildings size={15} weight={isPresencial ? "fill" : "regular"} />
          Presencial
        </button>
        <button
          type="button"
          onClick={() => handleTypeChange("online")}
          className={`${styles.switchBtn} ${!isPresencial ? styles.switchBtnActive : ""}`}
        >
          <VideoCamera size={15} weight={!isPresencial ? "fill" : "regular"} />
          Online
        </button>
      </div>

      <div className={styles.dateTimeRow}>
        <div className="form-field">
          <label className="form-label">Data da entrevista</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className={`input${errors.date ? " input-error" : ""}`}
          />
          {errors.date && <span className="form-error">{errors.date}</span>}
        </div>
        <div className="form-field">
          <label className="form-label">Horário</label>
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={handleChange}
            className={`input${errors.time ? " input-error" : ""}`}
          />
          {errors.time && <span className="form-error">{errors.time}</span>}
        </div>
        <InfoPopover text="Recomendamos agendar entrevistas fora do horário comercial (antes das 8h, após as 18h ou no almoço) para evitar que o candidato precise sair do trabalho atual." />
      </div>

      <hr className="divider" />

      {isPresencial && (
        <div className={styles.formGrid}>
          <div className={styles.formGridCepAddress}>
            <div className="form-field">
              <label className="form-label">CEP</label>
              <input name="cep" value={form.cep} onChange={handleChange} className="input" />
            </div>
            <div className="form-field">
              <label className="form-label">Endereço</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className={`input${errors.address ? " input-error" : ""}`}
              />
              {errors.address && <span className="form-error">{errors.address}</span>}
            </div>
          </div>
          <div className="form-field">
            <label className="form-label">Número</label>
            <input name="number" value={form.number} onChange={handleChange} className="input" />
          </div>
          <div className="form-field">
            <label className="form-label">Complemento</label>
            <input name="complement" value={form.complement} onChange={handleChange} className="input" />
          </div>
          <div className="form-field">
            <label className="form-label">Cidade</label>
            <input
              name="city"
              value={form.city}
              onChange={handleChange}
              className={`input${errors.city ? " input-error" : ""}`}
            />
            {errors.city && <span className="form-error">{errors.city}</span>}
          </div>
          <div className="form-field">
            <label className="form-label">Estado</label>
            <input
              name="state"
              value={form.state}
              onChange={handleChange}
              className={`input${errors.state ? " input-error" : ""}`}
            />
            {errors.state && <span className="form-error">{errors.state}</span>}
          </div>
        </div>
      )}

      {!isPresencial && (
        <div className="form-field" style={{ marginBottom: 16 }}>
          <label className="form-label">Link da reunião</label>
          <input
            name="meetingLink"
            value={form.meetingLink}
            onChange={handleChange}
            className={`input${errors.meetingLink ? " input-error" : ""}`}
            placeholder="https://meet.google.com/..."
          />
          {errors.meetingLink && <span className="form-error">{errors.meetingLink}</span>}
        </div>
      )}

      <hr className="divider" />

      <div className="form-field">
        <label className="form-label">Mensagem para o candidato</label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={7}
          className="input textarea"
        />
      </div>

      <div className="form-actions">
        <button type="button" className={styles.btnSecondary} onClick={onClose} disabled={loading}>
          Cancelar
        </button>
        <button type="button" className={styles.btnModalPrimary} onClick={handleSubmit} disabled={loading}>
          {loading ? "Aguarde..." : (submitLabel || "Enviar convite")}
        </button>
      </div>
    </Modal>
  );
}

function ModalParabens({ open, onClose, candidateName }) {
  const navigate = useNavigate();
  return (
    <Modal isOpen={open} onClose={() => { }} title="">
      <div className={styles.parabensWrap}>
        <div className={styles.parabensIcon}>
          <Trophy size={48} weight="fill" color="var(--orange)" />
        </div>
        <h2 className={styles.parabensTitle}>Parabéns!</h2>
        <p className={styles.parabensText}>
          <strong>{candidateName}</strong> foi contratado com sucesso.<br />
          A vaga foi encerrada automaticamente.
        </p>
        <button className={styles.btnModalPrimary} onClick={() => { onClose(); navigate("/jobs"); }}>
          Ir para minhas vagas
          <ArrowRight size={15} weight="bold" />
        </button>
      </div>
    </Modal>
  );
}

export default function JobsCandidateDetail() {
  const { id, applicationId } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("curriculo");
  const [updating, setUpdating] = useState(false);
  const [jobStatus, setJobStatus] = useState(null);

  const [confirmModal, setConfirmModal] = useState(false);
  const [entrevistaModal, setEntrevistaModal] = useState(false);
  const [entrevistaMode, setEntrevistaMode] = useState("invite");
  const [parabensModal, setParabensModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

  const interviewEvents = application?.interviewEvents ?? [];
  const lastInterviewEvent = interviewEvents[interviewEvents.length - 1];

  const awaitingRescheduleResponse =
    application?.status === "ENTREVISTA" &&
    lastInterviewEvent?.type === "RESCHEDULED";

  const { user } = useContext(AuthContext);
  const company = user?.company;

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/jobs/${id}/candidates/${applicationId}`);
        setJobStatus(res.data.jobStatus ?? null);
        setApplication(res.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, applicationId]);

  const autoSwitchedToMatchRef = useRef(false);

  useEffect(() => {
    if (!application?.status) return;

    if (application.status === "ANALISE" && !autoSwitchedToMatchRef.current) {
      setTab("match");
      autoSwitchedToMatchRef.current = true;
    }
  }, [application?.status]);

  function handleAdvanceClick() {
    const next = NEXT_STATUS[application.status];
    if (!next) return;
    setPendingStatus(next);
    if (next === "ENTREVISTA") {
      setEntrevistaMode("invite");
      setEntrevistaModal(true);
    } else {
      setConfirmModal(true);
    }
  }

  function handleRespondReschedule() {
    setEntrevistaMode("reschedule");
    setEntrevistaModal(true);
  }

  function buildRescheduleInitialValues() {
    const lastInvite = findLastInviteEvent(interviewEvents);
    const proposed = lastInterviewEvent?.proposedAt ? new Date(lastInterviewEvent.proposedAt) : null;

    return {
      interviewType: lastInvite?.interviewType ? lastInvite.interviewType.toLowerCase() : "presencial",
      meetingLink: lastInvite?.meetingLink || "",
      date: proposed ? toDateInputValue(proposed) : "",
      time: proposed ? toTimeInputValue(proposed) : "",
      message: RESCHEDULE_DEFAULT_MESSAGE,
    };
  }

  async function handleConfirm() {
    setUpdating(true);

    try {
      await api.patch(
        `/jobs/${id}/candidates/${applicationId}/status`,
        { status: pendingStatus }
      );
      setApplication((prev) => ({
        ...prev,
        status: pendingStatus,
      }));
      setConfirmModal(false);
      if (pendingStatus === "APROVADO") {
        setParabensModal(true);
      }
    } finally {
      setUpdating(false);
    }
  }

  async function handleEntrevistaConfirm(form) {
    setUpdating(true);
    try {
      await api.patch(`/jobs/${id}/candidates/${applicationId}/status`, {
        status: "ENTREVISTA",
        note: form.message,
        interviewData: {
          type: form.interviewType,
          scheduledAt: new Date(`${form.date}T${form.time}`),
          meetingLink: form.meetingLink || undefined,
          address: form.fullAddress || undefined,
        },
      });
      setApplication((prev) => ({
        ...prev,
        status: "ENTREVISTA",
        interviewEvents: [
          ...(prev.interviewEvents || []),
          {
            type: "INVITE_SENT",
            interviewType: form.interviewType,
            scheduledAt: new Date(`${form.date}T${form.time}`).toISOString(),
            meetingLink: form.meetingLink || null,
            address: form.fullAddress || null,
            message: form.message || null,
            createdAt: new Date().toISOString(),
          },
        ],
      }));
      setEntrevistaModal(false);
      setTab("auditoria");
    } finally {
      setUpdating(false);
    }
  }

  const [reprovarModal, setReprovarModal] = useState(false);

  async function handleReject() {
    setUpdating(true);
    try {
      await api.patch(`/jobs/${id}/candidates/${applicationId}/status`, { status: "REPROVADO" });
      setApplication((prev) => ({ ...prev, status: "REPROVADO" }));
      setReprovarModal(false);
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="page-content">
        <div className={styles.loadingState}>
          <span className={styles.loadingSpinner} />
          Carregando...
        </div>
      </div>
    );
  }
  if (!application) {
    return (
      <div className="page-content">
        <div className={styles.loadingState}>Candidatura não encontrada.</div>
      </div>
    );
  }

  const { candidate, compatibility, jobProfile, matchBreakdown, matchEligible, matchIneligibleReason } = application;
  const statusStyle = STATUS_COLORS[application.status] || STATUS_COLORS.RECEBIDA;
  const isHired = jobStatus === "HIRED";
  const canAdvance = !isHired && !!NEXT_STATUS[application.status];
  const canReject = !isHired && !["REPROVADO", "APROVADO", "DESISTIU"].includes(application.status);
  const isTheHire = isHired && application.status === "APROVADO";
  const hasHeroFooter = !isHired && (awaitingRescheduleResponse || canAdvance || canReject);

  const showMatch = ["ANALISE", "ENTREVISTA", "APROVADO"].includes(application.status);
  const showPerfil = ["ANALISE", "ENTREVISTA", "APROVADO"].includes(application.status);
  const showInfoCandidato = application.status === "APROVADO";
  const showAuditoria = (application.interviewEvents?.length ?? 0) > 0;

  return (
    <PlanGate>
      <div className="page-content">
        <div className={styles.container}>

          <div className={styles.header}>
            <button className={styles.backBtn} onClick={() => navigate(`/jobs/${id}/candidates`)}>
              <ArrowLeft size={16} weight="bold" />
              <span>Voltar</span>
            </button>
            <div className={styles.headerDivider} />
            <div>
              <h1 className={styles.pageTitle}>Informações do Candidato</h1>
              <p className={styles.pageSubtitle}>
                <IdentificationBadge size={13} weight="bold" style={{ marginRight: 4, verticalAlign: -2 }} />
                Candidatura #{applicationId}
              </p>
            </div>
          </div>

          {isHired && (
            <div className={`${styles.hiredBanner} ${isTheHire ? styles.hiredBannerSuccess : ""}`}>
              {isTheHire
                ? <Trophy size={20} weight="fill" color="#059669" />
                : <SealCheck size={20} weight="regular" color="var(--text-muted)" />
              }
              <p>
                {isTheHire
                  ? "Este candidato foi contratado. A vaga está encerrada."
                  : "Esta vaga foi encerrada por contratação. Visualização somente leitura."
                }
              </p>
            </div>
          )}

          <div className={styles.heroCard}>
            <div className={styles.heroTop}>
              <div className={styles.heroLeft}>
                <div className={styles.avatarWrap}>
                  <div className={styles.avatar}>{initials(candidate.name)}</div>
                  <span className={styles.statusDot} style={{ background: statusStyle.dot }} />
                </div>
                <div>
                  <p className={styles.candidateLabel}>Candidato(a)</p>
                  <h2 className={styles.heroName}>{candidate.name}</h2>
                  {showInfoCandidato ? (
                    <div className={styles.heroMeta}>
                      <span className={styles.contactBadge}>
                        <EnvelopeSimple size={13} weight="bold" />
                        {candidate.email}
                      </span>
                      {candidate.phone && (
                        <span className={styles.contactBadge}>
                          <Phone size={13} weight="bold" />
                          {candidate.phone}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className={styles.contactHidden}>
                      <EnvelopeSimple size={13} weight="regular" />
                      Contato liberado após aprovação
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.heroRight}>
                <span
                  className={styles.statusBadge}
                  style={{
                    color: statusStyle.color,
                    background: statusStyle.bg,
                    ...(isTheHire && { outline: "2px solid #059669", outlineOffset: 2 }),
                  }}
                >
                  {isTheHire && <Trophy size={13} weight="fill" style={{ marginRight: 4 }} />}
                  <span className={styles.statusBadgeDot} style={{ background: statusStyle.dot }} />
                  {isTheHire ? "Contratado" : STATUS_LABELS[application.status]}
                </span>
                <span className={styles.appliedAt}>
                  <CalendarBlank size={12} weight="bold" style={{ marginRight: 4, verticalAlign: -1 }} />
                  Candidatou-se em <strong>{fmtDate(application.appliedAt)}</strong>
                </span>
              </div>
            </div>

            {hasHeroFooter && (
              <>
                <div className={styles.heroDivider} />
                <div className={styles.heroFooter}>
                  {awaitingRescheduleResponse && (
                    <RescheduleRow event={lastInterviewEvent} onRespond={handleRespondReschedule} />
                  )}

                  {(canAdvance || canReject) && (
                    <div className={styles.actionsRow}>
                      <p className={styles.heroFooterHint}>Mover candidato para próxima etapa ou reprovar</p>
                      <div className={styles.heroActions}>
                        {canReject && (
                          <button className={styles.btnReject} onClick={() => setReprovarModal(true)} disabled={updating}>
                            <X size={15} weight="bold" /> Reprovar
                          </button>
                        )}
                        {canAdvance && (
                          <button className={styles.btnAdvance} onClick={handleAdvanceClick} disabled={updating}>
                            {updating ? "Aguarde..." : (
                              <>
                                {application.status === "ENTREVISTA"
                                  ? "Contratar"
                                  : `Avançar para ${STATUS_LABELS[NEXT_STATUS[application.status]]}`}
                                <ArrowRight size={15} weight="bold" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <ApplicationOverviewCard status={application.status} candidate={candidate} />

          <div className={styles.tabsCard}>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${tab === "curriculo" ? styles.tabActive : ""}`}
                onClick={() => setTab("curriculo")}
              >
                <FileText size={15} weight={tab === "curriculo" ? "fill" : "regular"} />
                Currículo
              </button>
              {showMatch && (
                <button
                  className={`${styles.tab} ${tab === "match" ? styles.tabActive : ""}`}
                  onClick={() => setTab("match")}
                >
                  <Brain size={15} weight={tab === "match" ? "fill" : "regular"} />
                  Match
                </button>
              )}
              {showPerfil && (
                <button
                  className={`${styles.tab} ${tab === "perfil" ? styles.tabActive : ""}`}
                  onClick={() => setTab("perfil")}
                >
                  <IdentificationBadge size={15} weight={tab === "perfil" ? "fill" : "regular"} />
                  Perfil Comportamental
                </button>
              )}
              {showAuditoria && (
                <button
                  className={`${styles.tab} ${tab === "auditoria" ? styles.tabActive : ""}`}
                  onClick={() => setTab("auditoria")}
                >
                  <ClipboardText size={15} weight={tab === "auditoria" ? "fill" : "regular"} />
                  Auditoria
                </button>
              )}
            </div>

            <div className={styles.tabBody}>
              {tab === "match" && (
                <MatchTab
                  candidate={candidate}
                  jobProfile={jobProfile}
                  score={compatibility ?? 0}
                  breakdown={matchBreakdown}
                  eligible={matchEligible !== false}
                  ineligibleReason={matchIneligibleReason}
                />
              )}
              {tab === "curriculo" && <CurriculoTab resume={candidate.resume} />}
              {tab === "perfil" && <PerfilTab candidate={candidate} />}
              {tab === "auditoria" && <AuditoriaTab interviewEvents={application.interviewEvents ?? []} />}
            </div>
          </div>
        </div>
      </div>

      <ModalConfirm
        open={confirmModal}
        onClose={() => setConfirmModal(false)}
        onConfirm={handleConfirm}
        loading={updating}
        nextStatus={pendingStatus}
      />

      <ModalEntrevista
        open={entrevistaModal}
        onClose={() => setEntrevistaModal(false)}
        onConfirm={handleEntrevistaConfirm}
        loading={updating}
        company={company}
        initialValues={entrevistaMode === "reschedule" ? buildRescheduleInitialValues() : undefined}
        title={entrevistaMode === "reschedule" ? "Responder à remarcação" : undefined}
        subtitle={
          entrevistaMode === "reschedule"
            ? "Confirme a data sugerida pelo candidato ou proponha outro horário"
            : undefined
        }
        submitLabel={entrevistaMode === "reschedule" ? "Confirmar e enviar" : undefined}
      />

      <ModalParabens
        open={parabensModal}
        onClose={() => setParabensModal(false)}
        candidateName={candidate?.name}
      />

      <ModalReprovar
        open={reprovarModal}
        onClose={() => setReprovarModal(false)}
        onConfirm={handleReject}
        loading={updating}
        candidateName={candidate?.name}
      />
    </PlanGate>
  );
}