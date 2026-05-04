import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, EnvelopeSimple, Phone,
  CheckCircle, FileText, Brain, X, ArrowRight,
  Trophy, MapPin, TextT,
} from "@phosphor-icons/react";
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

function MatchBadge({ score }) {
  const color =
    score >= 80 ? { bg: "#d1fae5", color: "#065f46", label: "Recomendado" } :
      score >= 50 ? { bg: "#dbeafe", color: "#1e40af", label: "Compatível" } :
        { bg: "#fee2e2", color: "#991b1b", label: "Baixo match" };

  return (
    <div className={styles.matchBadgeWrap}>
      <div className={styles.matchCircle} style={{ "--score": score }}>
        <svg viewBox="0 0 36 36" className={styles.matchSvg}>
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--border)" strokeWidth="2.5" />
          <circle
            cx="18" cy="18" r="15.9" fill="none"
            stroke={color.color} strokeWidth="2.5"
            strokeDasharray={`${score} 100`}
            strokeLinecap="round"
            transform="rotate(-90 18 18)"
          />
        </svg>
        <span className={styles.matchPct}>{score}%</span>
      </div>
      <div>
        <p className={styles.matchLabel}>Compatibilidade</p>
        <span className={styles.matchTag} style={{ background: color.bg, color: color.color }}>
          {color.label}
        </span>
      </div>
    </div>
  );
}

function MatchTab({ candidate, jobProfile, score }) {
  if (!jobProfile) return (
    <div className={styles.emptyState}>
      <Brain size={40} />
      <p>Esta vaga não possui perfil comportamental definido.</p>
    </div>
  );

  return (
    <div className={styles.tabContent}>
      <div className={styles.matchHero}>
        <MatchBadge score={score} />
        <p className={styles.matchHint}>
          O score leva em conta o peso de cada dimensão definido pela vaga.
          Dimensões mais importantes para a vaga penalizam mais em caso de diferença.
        </p>
      </div>

      <div className={styles.matchGrid}>
        {PROFILE_ITEMS.map((item) => {
          const jobVal = jobProfile?.[item.jobKey] ?? 0;
          const candVal = candidate?.[item.key] ?? 0;
          const diff = Math.abs(jobVal - candVal);
          const weight = jobVal / 10;
          const penalty = diff * weight;

          return (
            <div key={item.key} className={styles.matchCard}>
              <div className={styles.matchCardHeader}>
                <span className={styles.profileIcon}>{item.icon}</span>
                <span className={styles.matchCardLabel}>{item.label}</span>
                <span className={styles.matchCardWeight}>peso {Math.round(weight * 100)}%</span>
              </div>

              <div className={styles.matchRow}>
                <div className={styles.matchSide}>
                  <span className={styles.matchSideLabel}>Vaga</span>
                  <div className={styles.profileBar}>
                    <div className={styles.profileFill} style={{ width: `${(jobVal / 5) * 100}%`, background: "var(--orange)" }} />
                  </div>
                  <span className={styles.matchSideVal}>{jobVal}/5</span>
                </div>
                <div className={styles.matchSide}>
                  <span className={styles.matchSideLabel}>Candidato</span>
                  <div className={styles.profileBar}>
                    <div className={styles.profileFill} style={{ width: `${(candVal / 5) * 100}%`, background: "#3b82f6" }} />
                  </div>
                  <span className={styles.matchSideVal}>{candVal}/5</span>
                </div>
              </div>

              <div className={styles.matchPenalty} style={{ color: penalty > 0.4 ? "#ef4444" : penalty > 0.2 ? "#f59e0b" : "#10b981" }}>
                penalidade {penalty.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
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
  return (
    <div className={styles.tabContent}>
      {!candidate.profileCompleted && (
        <div className={styles.profileWarning}>
          <span>⚠️</span>
          <p>Este candidato ainda não respondeu o questionário comportamental.</p>
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

function ModalConfirm({ open, onClose, onConfirm, loading, nextStatus }) {
  const copy = CONFIRM_COPY[nextStatus];
  if (!copy || copy.body === null) return null;
  return (
    <Modal isOpen={open} onClose={onClose} title={copy.title} canClose={!loading}>
      <p style={{ fontSize: 14, color: "var(--text-2)", margin: "0 0 24px", lineHeight: 1.6 }}>
        {copy.body}
      </p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <button className={styles.btnSecondary} onClick={onClose} disabled={loading}>Cancelar</button>
        <button className={styles.btnAdvance} onClick={onConfirm} disabled={loading}>
          {loading ? "Aguarde..." : copy.btn}
        </button>
      </div>
    </Modal>
  );
}

function ModalEntrevista({ open, onClose, onConfirm, loading }) {
  const [form, setForm] = useState({ address: "", message: "" });

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  return (
    <Modal isOpen={open} onClose={onClose} title="Convidar para entrevista" canClose={!loading}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="form-field">
          <label className="form-label">
            <MapPin size={13} weight="bold" style={{ marginRight: 4 }} />
            Endereço da entrevista
          </label>
          <input
            name="address"
            value={form.address}
            onChange={handleChange}
            className="input"
            placeholder="Ex: Rua das Flores, 123 — Sala 4, São Paulo/SP"
          />
        </div>

        <div className="form-field">
          <label className="form-label">
            <TextT size={13} weight="bold" style={{ marginRight: 4 }} />
            Mensagem para o candidato
          </label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            className="input textarea"
            rows={5}
            placeholder="Ex: Olá! Gostaríamos de convidá-lo para uma entrevista presencial. Por favor compareça no endereço abaixo no dia combinado..."
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 8 }}>
          <button className={styles.btnSecondary} onClick={onClose} disabled={loading}>Cancelar</button>
          <button
            className={styles.btnAdvance}
            onClick={() => onConfirm(form)}
            disabled={loading || !form.address.trim() || !form.message.trim()}
          >
            {loading ? "Aguarde..." : "Confirmar convite"}
          </button>
        </div>
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
        <button className={styles.btnAdvance} onClick={() => { onClose(); navigate("/jobs"); }}>
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
  const [tab, setTab] = useState("match");
  const [updating, setUpdating] = useState(false);

  const [confirmModal, setConfirmModal] = useState(false);
  const [entrevistaModal, setEntrevistaModal] = useState(false);
  const [parabensModal, setParabensModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

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

  useEffect(() => {
    if (!application) return;
    if (application.status === "RECEBIDA") setTab("match");
    else if (application.status === "ANALISE") setTab("curriculo");
  }, [application?.status]);

  function handleAdvanceClick() {
    const next = NEXT_STATUS[application.status];
    if (!next) return;
    setPendingStatus(next);

    if (next === "ENTREVISTA") {
      setEntrevistaModal(true);
    } else {
      setConfirmModal(true);
    }
  }

  async function handleConfirm() {
    setUpdating(true);
    try {
      await api.patch(`/jobs/${id}/candidates/${applicationId}/status`, { status: pendingStatus });
      setApplication((prev) => ({ ...prev, status: pendingStatus }));
      setConfirmModal(false);
      if (pendingStatus === "APROVADO") setParabensModal(true);
    } finally {
      setUpdating(false);
    }
  }

  async function handleEntrevistaConfirm(form) {
    setUpdating(true);
    try {
      await api.patch(`/jobs/${id}/candidates/${applicationId}/status`, {
        status: "ENTREVISTA",
        note: `Endereço: ${form.address}\n\n${form.message}`,
      });
      setApplication((prev) => ({ ...prev, status: "ENTREVISTA" }));
      setEntrevistaModal(false);
    } finally {
      setUpdating(false);
    }
  }

  async function handleReject() {
    setUpdating(true);
    try {
      await api.patch(`/jobs/${id}/candidates/${applicationId}/status`, { status: "REPROVADO" });
      setApplication((prev) => ({ ...prev, status: "REPROVADO" }));
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <div className="page-content"><div className={styles.loadingState}>Carregando...</div></div>;
  if (!application) return <div className="page-content"><div className={styles.loadingState}>Candidatura não encontrada.</div></div>;

  const { candidate, compatibility, jobProfile } = application;
  const statusStyle = STATUS_COLORS[application.status] || STATUS_COLORS.RECEBIDA;
  const canAdvance = !!NEXT_STATUS[application.status];
  const canReject = !["REPROVADO", "APROVADO", "DESISTIU"].includes(application.status);

  const showMatch = true;
  const showCurriculo = ["ANALISE", "ENTREVISTA", "APROVADO"].includes(application.status);
  const showPerfil = ["ANALISE", "ENTREVISTA", "APROVADO"].includes(application.status);

  return (
    <PlanGate>
      <div className="page-content">
        <div className={styles.container}>

          {/* Header */}
          <div className={styles.header}>
            <button className={styles.backBtn} onClick={() => navigate(`/jobs/${id}/candidates`)}>
              <ArrowLeft size={16} weight="bold" />
              <span>Voltar</span>
            </button>
            <div className={styles.headerDivider} />
            <div>
              <h1 className={styles.pageTitle}>Informações do Candidato</h1>
              <p className={styles.pageSubtitle}>Candidatura #{applicationId}</p>
            </div>
          </div>

          {/* Actions bar */}
          {(canAdvance || canReject) && (
            <div className={styles.actionsBar}>
              <p className={styles.actionsHint}>Mover candidato para próxima etapa ou reprovar</p>
              <div className={styles.actionsGroup}>
                {canReject && (
                  <button className={styles.btnReject} onClick={handleReject} disabled={updating}>
                    <X size={15} weight="bold" />
                    Reprovar
                  </button>
                )}
                {canAdvance && (
                  <button className={styles.btnAdvance} onClick={handleAdvanceClick} disabled={updating}>
                    {updating ? "Aguarde..." : (
                      <>
                        {application.status === "ENTREVISTA" ? "Contratar" : `Avançar para ${STATUS_LABELS[NEXT_STATUS[application.status]]}`}
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
                <span className={styles.statusDot} style={{ background: statusStyle.dot }} />
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
              <span className={styles.statusBadge} style={{ color: statusStyle.color, background: statusStyle.bg }}>
                <span className={styles.statusBadgeDot} style={{ background: statusStyle.dot }} />
                {STATUS_LABELS[application.status]}
              </span>
              <span className={styles.appliedAt}>
                Candidatou-se em <strong>{fmtDate(application.appliedAt)}</strong>
              </span>
            </div>
          </div>

          {/* Timeline */}
          {!["REPROVADO", "DESISTIU"].includes(application.status) && (
            <TimelineBar status={application.status} />
          )}

          {/* Tabs */}
          <div className={styles.tabsCard}>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${tab === "match" ? styles.tabActive : ""}`}
                onClick={() => setTab("match")}
              >
                <Brain size={15} weight={tab === "match" ? "fill" : "regular"} />
                Match
              </button>
              {showCurriculo && (
                <button
                  className={`${styles.tab} ${tab === "curriculo" ? styles.tabActive : ""}`}
                  onClick={() => setTab("curriculo")}
                >
                  <FileText size={15} weight={tab === "curriculo" ? "fill" : "regular"} />
                  Currículo
                </button>
              )}
              {showPerfil && (
                <button
                  className={`${styles.tab} ${tab === "perfil" ? styles.tabActive : ""}`}
                  onClick={() => setTab("perfil")}
                >
                  <Brain size={15} weight={tab === "perfil" ? "fill" : "regular"} />
                  Perfil Comportamental
                </button>
              )}
            </div>

            <div className={styles.tabBody}>
              {tab === "match" && <MatchTab candidate={candidate} jobProfile={jobProfile} score={compatibility ?? 0} />}
              {tab === "curriculo" && <CurriculoTab resume={candidate.resume} />}
              {tab === "perfil" && <PerfilTab candidate={candidate} />}
            </div>
          </div>
        </div>
      </div>

      {/* Modais */}
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
      />
      <ModalParabens
        open={parabensModal}
        onClose={() => setParabensModal(false)}
        candidateName={candidate?.name}
      />
    </PlanGate>
  );
}