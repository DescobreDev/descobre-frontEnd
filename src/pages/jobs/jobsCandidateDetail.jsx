import { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const PROFILE_ITEMS = [
  { key: "profileAnalyst", jobKey: "analyst", label: "Analista", icon: "📊" },
  { key: "profileCommunicator", jobKey: "communicator", label: "Comunicador", icon: "💬" },
  { key: "profileExecutor", jobKey: "executor", label: "Executor", icon: "⚡" },
  { key: "profilePlanner", jobKey: "planner", label: "Planejador", icon: "🗂️" },
];

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

function InfoPopover({ text }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <span ref={ref} style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onClick={() => setOpen((v) => !v)}
        style={{
          background: "none", border: "none", cursor: "pointer",
          color: "var(--text-muted)", padding: 2, display: "flex",
        }}
      >
        <Info size={15} weight="fill" />
      </button>
      {open && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 8px)", left: "50%",
          transform: "translateX(-50%)", width: 240, background: "var(--surface)",
          border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px",
          fontSize: 12, lineHeight: 1.6, color: "var(--text-2)", zIndex: 10000,
          boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
          pointerEvents: "none",
        }}>
          <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
            <Warning size={13} weight="fill" color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{text}</span>
          </div>
        </div>
      )}
    </span>
  );
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
            strokeDasharray={`${(score / 100) * 99.9} 99.9`}
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Constrói lista unificada de eventos de auditoria a partir de interviewEvents
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
        <ClipboardText size={40} />
        <p>Nenhum evento de auditoria registrado ainda.</p>
      </div>
    );
  }

  return (
    <div className={styles.tabContent}>
      <div style={{ marginBottom: 12 }}>
        <p className={styles.sectionHeading}>Linha do tempo da entrevista</p>
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
                <span className={styles.auditTime}>{fmtDateTime(event.date)}</span>
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

function ModalConfirm({ open, onClose, onConfirm, loading, nextStatus }) {
  const copy = CONFIRM_COPY[nextStatus];
  if (!copy || copy.body === null) return null;

  return (
    <Modal isOpen={open} onClose={onClose} title="" canClose={!loading} maxWidth="max-w-xl">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingBottom: 16, borderBottom: "1px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--orange-light)", border: "1px solid var(--orange-border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L2 13h12L8 2z" stroke="var(--orange)" strokeWidth="1.5" strokeLinejoin="round" />
              <line x1="8" y1="7" x2="8" y2="10" stroke="var(--orange)" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="8" cy="11.5" r="0.75" fill="var(--orange)" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{copy.title}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 1 }}>Esta operação não pode ser desfeita</div>
          </div>
        </div>
        {!loading && (
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: 4, borderRadius: "var(--r-sm)", display: "flex" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <line x1="1" y1="1" x2="13" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              <line x1="13" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, textAlign: "center", marginBottom: 20 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 999, background: "var(--orange-light)", border: "1px solid var(--orange-border)", fontSize: 12, fontWeight: 500, color: "var(--orange-dark)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--orange)", display: "inline-block" }} />
          {copy.title}
        </div>
        <p style={{ fontSize: 13.5, color: "var(--text-2)", lineHeight: 1.7, margin: 0 }}>
          {copy.body}
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 16, borderTop: "1px solid var(--border)", margin: "0 -24px -24px", padding: "14px 24px", background: "var(--surface-2)", borderRadius: "0 0 var(--r-lg) var(--r-lg)" }}>
        <button className={styles.btnSecondary} onClick={onClose} disabled={loading}>Cancelar</button>
        <button className={styles.btnAdvance} onClick={onConfirm} disabled={loading}>
          {loading ? "Aguarde..." : copy.btn}
        </button>
      </div>
    </Modal>
  );
}

const DEFAULT_INTERVIEW_MESSAGE = `Olá!

Sua candidatura avançou para a etapa de entrevista.

Gostaríamos de convidá-lo(a) para uma conversa em nossa empresa.

Por favor, confirme sua disponibilidade respondendo esta mensagem.

Atenciosamente,
Equipe de Recrutamento`;

function ModalEntrevista({ open, onClose, onConfirm, loading, company }) {
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
      interviewType: "presencial",
      cep: company?.cep || "",
      address: company?.address || "",
      number: company?.number || "",
      complement: company?.complement || "",
      city: company?.city || "",
      state: company?.state || "",
      meetingLink: "",
      date: "",
      time: "",
      message: DEFAULT_INTERVIEW_MESSAGE,
    });
  }, [open, company]);

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
    <Modal isOpen={open} onClose={onClose} title="Convidar para entrevista" canClose={!loading}>
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
        <button type="button" className={styles.btnAdvance} onClick={handleSubmit} disabled={loading}>
          {loading ? "Aguarde..." : "Enviar convite"}
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
  const [tab, setTab] = useState("curriculo");
  const [updating, setUpdating] = useState(false);
  const [jobStatus, setJobStatus] = useState(null);

  const [confirmModal, setConfirmModal] = useState(false);
  const [entrevistaModal, setEntrevistaModal] = useState(false);
  const [parabensModal, setParabensModal] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);

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

  useEffect(() => {
    if (!application) return;
    if (application.status === "RECEBIDA") setTab("curriculo");
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
  const isHired = jobStatus === "HIRED";
  const canAdvance = !isHired && !!NEXT_STATUS[application.status];
  const canReject = !isHired && !["REPROVADO", "APROVADO", "DESISTIU"].includes(application.status);
  const isTheHire = isHired && application.status === "APROVADO";

  const showMatch = ["ANALISE", "ENTREVISTA", "APROVADO"].includes(application.status);
  const showPerfil = ["ANALISE", "ENTREVISTA", "APROVADO"].includes(application.status);
  const showInfoCandidato = application.status === "APROVADO";
  // Mostra aba auditoria sempre que houver eventos de entrevista
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
              <p className={styles.pageSubtitle}>Candidatura #{applicationId}</p>
            </div>
          </div>

          {isHired && (
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              background: isTheHire ? "linear-gradient(135deg,#d1fae5,#a7f3d0)" : "#f9fafb",
              border: `1px solid ${isTheHire ? "#6ee7b7" : "var(--border)"}`,
              borderRadius: 12, padding: "12px 18px", marginBottom: 4,
            }}>
              {isTheHire
                ? <Trophy size={20} weight="fill" color="#059669" />
                : <SealCheck size={20} weight="regular" color="var(--text-muted)" />
              }
              <p style={{ margin: 0, fontSize: 13, color: isTheHire ? "#065f46" : "var(--text-muted)" }}>
                {isTheHire
                  ? "Este candidato foi contratado. A vaga está encerrada."
                  : "Esta vaga foi encerrada por contratação. Visualização somente leitura."
                }
              </p>
            </div>
          )}

          {!isHired && (canAdvance || canReject) && (
            <div className={styles.actionsBar}>
              <p className={styles.actionsHint}>Mover candidato para próxima etapa ou reprovar</p>
              <div className={styles.actionsGroup}>
                {canReject && (
                  <button className={styles.btnReject} onClick={handleReject} disabled={updating}>
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

          <div className={styles.heroCard}>
            <div className={styles.heroGlow} />
            <div className={styles.heroLeft}>
              <div className={styles.avatarWrap}>
                <div className={styles.avatar}>{initials(candidate.name)}</div>
                <span className={styles.statusDot} style={{ background: statusStyle.dot }} />
              </div>
              <div>
                <p className="subtitle">Candidato(a):</p>
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
                Candidatou-se em <strong>{fmtDate(application.appliedAt)}</strong>
              </span>
            </div>
          </div>

          {!["REPROVADO", "DESISTIU"].includes(application.status) && (
            <TimelineBar status={application.status} />
          )}

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
                  <Brain size={15} weight={tab === "perfil" ? "fill" : "regular"} />
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
              {tab === "match" && <MatchTab candidate={candidate} jobProfile={jobProfile} score={compatibility ?? 0} />}
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
      />
      <ModalParabens
        open={parabensModal}
        onClose={() => setParabensModal(false)}
        candidateName={candidate?.name}
      />
    </PlanGate>
  );
}