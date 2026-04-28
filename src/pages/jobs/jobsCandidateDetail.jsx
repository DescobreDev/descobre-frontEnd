import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, EnvelopeSimple, Phone,
  CheckCircle, FileText, Brain, X, ArrowRight,
} from "@phosphor-icons/react";
import { PlanGate } from "../../hooks/planGate";
import api from "../../services/api";
import styles from "./CSS/jobsCandidateDetail.module.css";

const STATUS_LABELS = {
  PENDING: "Aguardando",
  IN_REVIEW: "Em triagem",
  INTERVIEW: "Entrevista",
  APPROVED: "Aprovado",
  REJECTED: "Reprovado",
  WITHDRAWN: "Desistiu",
};

const STATUS_COLORS = {
  PENDING: { color: "#f59e0b", bg: "#fef3c7", dot: "#f59e0b" },
  IN_REVIEW: { color: "#3b82f6", bg: "#dbeafe", dot: "#3b82f6" },
  INTERVIEW: { color: "#8b5cf6", bg: "#ede9fe", dot: "#8b5cf6" },
  APPROVED: { color: "#10b981", bg: "#d1fae5", dot: "#10b981" },
  REJECTED: { color: "#ef4444", bg: "#fee2e2", dot: "#ef4444" },
  WITHDRAWN: { color: "#6b7280", bg: "#f3f4f6", dot: "#6b7280" },
};

const TIMELINE_STEPS = [
  { key: "PENDING", label: "Candidatura", num: 1 },
  { key: "IN_REVIEW", label: "Análise", num: 2 },
  { key: "INTERVIEW", label: "Entrevista", num: 3 },
  { key: "APPROVED", label: "Aprovado", num: 4 },
];

const NEXT_STATUS = {
  PENDING: "IN_REVIEW",
  IN_REVIEW: "INTERVIEW",
  INTERVIEW: "APPROVED",
};

const PROFILE_ITEMS = [
  { key: "profileAnalyst", label: "Analista", icon: "📊" },
  { key: "profileCommunicator", label: "Comunicador", icon: "💬" },
  { key: "profileExecutor", label: "Executor", icon: "⚡" },
  { key: "profilePlanner", label: "Planejador", icon: "🗂️" },
];

function initials(name = "") {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function fmtDate(val) {
  if (!val) return "—";
  return new Date(val).toLocaleDateString("pt-BR");
}

function TimelineBar({ status }) {
  const currentIdx = TIMELINE_STEPS.findIndex((s) => s.key === status);

  return (
    <div className={styles.timelineCard}>
      <p className={styles.sectionHeading}>Etapa da candidatura</p>
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
                {done ? <CheckCircle size={18} weight="fill" /> : <span>{step.num}</span>}
              </div>
              <span className={`${styles.timelineLabel} ${done || current ? styles.labelActive : ""}`}>
                {step.label}
              </span>
              {current && <span className={styles.timelinePulse} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CurriculoTab({ resume }) {
  if (!resume) return (
    <div className={styles.emptyState}>
      <FileText size={40} />
      <p>Candidato não possui currículo cadastrado.</p>
    </div>
  );

  return (
    <div className={styles.tabContent}>
      {resume.experiences?.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionHeading}>Experiências</p>
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
          <p className={styles.sectionHeading}>Formação</p>
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
          <p className={styles.sectionHeading}>Habilidades</p>
          <div className={styles.chipList}>
            {resume.skills.map((s) => (
              <span key={s.id} className={styles.chip}>{s.name}{s.level ? ` · ${s.level}` : ""}</span>
            ))}
          </div>
        </div>
      )}

      {resume.languages?.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionHeading}>Idiomas</p>
          <div className={styles.chipList}>
            {resume.languages.map((l) => (
              <span key={l.id} className={`${styles.chip} ${styles.chipLang}`}>{l.language} · {l.level}</span>
            ))}
          </div>
        </div>
      )}

      {resume.cvFileUrl && (
        <div className={styles.section}>
          <p className={styles.sectionHeading}>Currículo em PDF</p>
          <div className={styles.pdfWrap}>
            <iframe src={resume.cvFileUrl} title="Currículo PDF" />
          </div>
        </div>
      )}
    </div>
  );
}

function PerfilTab({ candidate }) {
  const completed = candidate.profileCompleted;

  return (
    <div className={styles.tabContent}>
      {!completed && (
        <div className={styles.profileWarning}>
          <span>⚠️</span>
          <p>Este candidato ainda não respondeu o questionário comportamental. Os valores abaixo são zerados.</p>
        </div>
      )}
      <div className={styles.profileGrid}>
        {PROFILE_ITEMS.map((item) => {
          const val = candidate[item.key] ?? 0;
          const pct = (val / 5) * 100;
          return (
            <div key={item.key} className={styles.profileCard}>
              <div className={styles.profileCardTop}>
                <span className={styles.profileIcon}>{item.icon}</span>
                <div>
                  <p className={styles.profileLabel}>{item.label}</p>
                  <p className={styles.profileScore}>{val} <span>/ 5</span></p>
                </div>
              </div>
              <div className={styles.profileBarWrap}>
                <div className={styles.profileBar}>
                  <div className={styles.profileFill} style={{ width: `${pct}%` }} />
                </div>
                <span className={styles.profilePct}>{Math.round(pct)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function JobsCandidateDetail() {
  const { id, applicationId } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("curriculo");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/jobs/${id}/candidates/${applicationId}`);
        setApplication(res.data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, applicationId]);

  async function handleAdvance() {
    const next = NEXT_STATUS[application.status];
    if (!next) return;
    setUpdating(true);
    try {
      await api.patch(`/jobs/${id}/candidates/${applicationId}/status`, { status: next });
      setApplication((prev) => ({ ...prev, status: next }));
    } finally {
      setUpdating(false);
    }
  }

  async function handleReject() {
    setUpdating(true);
    try {
      await api.patch(`/jobs/${id}/candidates/${applicationId}/status`, { status: "REJECTED" });
      setApplication((prev) => ({ ...prev, status: "REJECTED" }));
    } finally {
      setUpdating(false);
    }
  }

  async function handleReactivate() {
    setUpdating(true);
    try {
      await api.patch(`/jobs/${id}/candidates/${applicationId}/status`, { status: "PENDING" });
      setApplication((prev) => ({ ...prev, status: "PENDING" }));
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <div className="page-content"><div className={styles.loadingState}>Carregando...</div></div>;
  if (!application) return <div className="page-content"><div className={styles.loadingState}>Candidatura não encontrada.</div></div>;

  const { candidate } = application;
  const statusStyle = STATUS_COLORS[application.status] ?? STATUS_COLORS.PENDING;
  const canAdvance = !!NEXT_STATUS[application.status];
  const canReject = !["REJECTED", "APPROVED", "WITHDRAWN"].includes(application.status);

  return (
    <PlanGate>
      <div className="page-content">
        <div className={styles.container}>

          {/* Header */}
          <div className={styles.header}>
            <button
              className={styles.backBtn}
              onClick={() => navigate(`/jobs/${id}/candidates`)}
            >
              <ArrowLeft size={16} weight="bold" />
              <span>Voltar</span>
            </button>
            <div className={styles.headerDivider} />
            <div>
              <h1 className={styles.pageTitle}>Informações do Candidato</h1>
              <p className={styles.pageSubtitle}>Candidatura #{applicationId}</p>
            </div>
          </div>


          {/* Ações */}
          {(canAdvance || canReject || application.status === "REJECTED") && (
            <div className={styles.actionsBar}>
              <p className={styles.actionsHint}>Mover candidato para próxima etapa ou reprovar</p>
              <div className={styles.actionsGroup}>

                {application.status === "REJECTED" && (
                  <button
                    className={styles.btnAdvance}
                    onClick={handleReactivate}
                    disabled={updating}
                  >
                    <ArrowLeft size={15} weight="bold" />
                    {updating ? "Aguarde..." : "Reativar candidatura"}
                  </button>
                )}

                {canReject && (
                  <button
                    className={styles.btnReject}
                    onClick={handleReject}
                    disabled={updating}
                  >
                    <X size={15} weight="bold" />
                    Reprovar
                  </button>
                )}

                {canAdvance && (
                  <button
                    className={styles.btnAdvance}
                    onClick={handleAdvance}
                    disabled={updating}
                  >
                    {updating ? "Aguarde..." : (
                      <>
                        Avançar para {STATUS_LABELS[NEXT_STATUS[application.status]]}
                        <ArrowRight size={15} weight="bold" />
                      </>
                    )}
                  </button>
                )}

              </div>
            </div>
          )}

          {/* Hero */}
          <div className={styles.heroCard}>
            <div className={styles.heroGlow} />
            <div className={styles.heroLeft}>
              <div className={styles.avatarWrap}>
                <div className={styles.avatar}>{initials(candidate.name)}</div>
                <span
                  className={styles.statusDot}
                  style={{ background: statusStyle.dot }}
                  title={STATUS_LABELS[application.status]}
                />
              </div>
              <div>
                <h2 className={styles.heroName}>{candidate.name}</h2>
                <div className={styles.heroMeta}>
                  <span className={styles.heroBadge}>
                    <EnvelopeSimple size={13} weight="bold" />
                    {candidate.email}
                  </span>
                  {candidate.phone && (
                    <span className={styles.heroBadge}>
                      <Phone size={13} weight="bold" />
                      {candidate.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className={styles.heroRight}>
              <span
                className={styles.statusBadge}
                style={{ color: statusStyle.color, background: statusStyle.bg }}
              >
                <span className={styles.statusBadgeDot} style={{ background: statusStyle.dot }} />
                {STATUS_LABELS[application.status]}
              </span>
              <span className={styles.appliedAt}>
                Candidatou-se em <strong>{fmtDate(application.appliedAt)}</strong>
              </span>
            </div>
          </div>

          {/* Timeline */}
          {!["REJECTED", "WITHDRAWN"].includes(application.status) && (
            <TimelineBar status={application.status} />
          )}

          {/* Tabs + Content */}
          <div className={styles.tabsCard}>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${tab === "curriculo" ? styles.tabActive : ""}`}
                onClick={() => setTab("curriculo")}
              >
                <FileText size={15} weight={tab === "curriculo" ? "fill" : "regular"} />
                Currículo
              </button>
              <button
                className={`${styles.tab} ${tab === "perfil" ? styles.tabActive : ""}`}
                onClick={() => setTab("perfil")}
              >
                <Brain size={15} weight={tab === "perfil" ? "fill" : "regular"} />
                Perfil Comportamental
              </button>
            </div>

            <div className={styles.tabBody}>
              {tab === "curriculo" && <CurriculoTab resume={candidate.resume} />}
              {tab === "perfil" && <PerfilTab candidate={candidate} />}
            </div>
          </div>
        </div>
      </div>
    </PlanGate>
  );
}