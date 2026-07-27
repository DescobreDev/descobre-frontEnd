import { useState } from "react";
import { MapPin, Eye, PencilSimple, Trophy } from "@phosphor-icons/react";
import StatusMenu from "./StatusMenu";
import { STATUS_CONFIG, PRIORITY_CONFIG, WORK_FORMAT_LABEL } from "../constants/jobConstants";

function Tag({ children }) {
  return (
    <span style={{
      fontSize: 12, fontWeight: 500, color: "var(--text-2)",
      background: "var(--surface-2)", padding: "4px 10px", borderRadius: 8,
    }}>
      {children}
    </span>
  );
}

function PriorityBadge({ value }) {
  const cfg = PRIORITY_CONFIG[value] ?? { label: value, color: "var(--text-2)", bg: "var(--surface-2)", dot: "var(--text-muted)" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 12, fontWeight: 600, color: cfg.color, background: cfg.bg,
      padding: "4px 10px", borderRadius: 8,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 99, background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

function HiredBadge() {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "5px 12px", borderRadius: 99,
      fontSize: 12, fontWeight: 700,
      color: "#065f46", background: "#d1fae5",
      border: "1px solid #6ee7b7", whiteSpace: "nowrap",
    }}>
      <Trophy size={12} weight="fill" color="var(--green)" />
      Contratada
    </span>
  );
}

function IconButton({ icon, title, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 32, height: 32, borderRadius: 9,
        display: "flex", alignItems: "center", justifyContent: "center",
        border: "1px solid var(--border)",
        background: hovered ? "var(--surface-2)" : "var(--surface)",
        color: "var(--text-2)", cursor: "pointer",
        transition: "background .12s ease",
      }}
    >
      {icon}
    </button>
  );
}

function formatDeadline(value) {
  if (!value) return null;
  const date = new Date(value);
  return { text: date.toLocaleDateString("pt-BR"), isPast: date.getTime() < Date.now() };
}

export default function JobCard({ job, onOpen, onEdit, onStatusChange }) {
  const [hovered, setHovered] = useState(false);
  const isHired = job.status === "HIRED";
  const deadline = formatDeadline(job.deadline);
  const priorityDot = PRIORITY_CONFIG[job.priority]?.dot ?? "var(--text-muted)";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(job)}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(job); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        background: "var(--surface)",
        borderRadius: 18,
        padding: "20px 20px 18px",
        overflow: "hidden",
        border: `1px solid ${hovered ? "var(--color-border)" : "var(--border)"}`,
        boxShadow: hovered ? "var(--shadow-md)" : "var(--shadow-xs)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "box-shadow .16s ease, transform .16s ease, border-color .16s ease",
        cursor: "pointer",
      }}
    >
      <span style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: priorityDot, opacity: isHired ? 0.35 : 1,
      }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <h3 style={{
            margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text)",
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {job.title}
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "var(--text-2)", display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin size={12} />
            {job.city ? `${job.city} · ${job.state}` : "Remoto"}
          </p>
        </div>

        <div style={{ flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
          {isHired ? (
            <HiredBadge />
          ) : (
            <StatusMenu
              value={job.status}
              options={STATUS_CONFIG}
              onChange={(status) => onStatusChange(job, status)}
            />
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        <Tag>{job.contractType}</Tag>
        <Tag>{WORK_FORMAT_LABEL[job.workFormat] ?? job.workFormat}</Tag>
        <PriorityBadge value={job.priority} />
      </div>

      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        paddingTop: 12, borderTop: "1px solid var(--border)",
      }}>
        <span style={{ fontSize: 12.5, fontWeight: 500, color: deadline?.isPast ? "var(--red)" : "var(--text-muted)" }}>
          {deadline
            ? (deadline.isPast ? `Prazo encerrado em ${deadline.text}` : `Prazo até ${deadline.text}`)
            : "Sem prazo definido"}
        </span>

        <div style={{ display: "flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
          <IconButton icon={<Eye size={15} />} title="Ver detalhes" onClick={() => onOpen(job)} />
          {!isHired && (
            <IconButton icon={<PencilSimple size={15} />} title="Editar" onClick={() => onEdit(job)} />
          )}
        </div>
      </div>
    </div>
  );
}