import { useState } from "react";
import { MapPin, Eye, PencilSimple, Trophy } from "@phosphor-icons/react";
import StatusMenu from "./StatusMenu";
import { STATUS_CONFIG, PRIORITY_CONFIG, WORK_FORMAT_LABEL } from "../constants/jobConstants";

function Tag({ children }) {
  return (
    <span style={{
      fontSize: 12, fontWeight: 500, color: "var(--text-2)",
      background: "var(--surface-2)", padding: "4px 10px",
      borderRadius: "var(--r-sm)", whiteSpace: "nowrap",
    }}>
      {children}
    </span>
  );
}

function PriorityBadge({ value }) {
  const cfg = PRIORITY_CONFIG[value] ?? PRIORITY_CONFIG.LOW;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontSize: 12, fontWeight: 600, color: cfg.color, background: cfg.bg,
      padding: "4px 10px", borderRadius: "var(--r-sm)", whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 99, background: cfg.accent, flexShrink: 0 }} />
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
      color: "var(--green)", background: "rgba(16, 185, 129, 0.1)",
      border: "1px solid rgba(16, 185, 129, 0.3)", whiteSpace: "nowrap",
    }}>
      <Trophy size={12} weight="fill" color="var(--green)" />
      Contratada
    </span>
  );
}

// Mesma linguagem visual do .actionBtn do seu CSS (30x30, r-sm, hover laranja)
// — só reimplementado inline porque o card mora fora da pasta do módulo CSS.
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
        width: 30, height: 30, borderRadius: "var(--r-sm)",
        display: "flex", alignItems: "center", justifyContent: "center",
        border: `1px solid ${hovered ? "var(--orange-border)" : "var(--border)"}`,
        background: hovered ? "var(--orange-light)" : "var(--surface-2)",
        color: hovered ? "var(--orange)" : "var(--text-2)",
        cursor: "pointer",
        transition: "all 0.15s",
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
  const priorityAccent = PRIORITY_CONFIG[job.priority]?.accent ?? "var(--border)";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(job)}
      onKeyDown={(e) => { if (e.key === "Enter") onOpen(job); }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 20,
        flexWrap: "wrap",
        width: "100%",
        background: "var(--surface)",
        borderRadius: "var(--r-lg)",
        padding: "16px 20px",
        borderTop: `1px solid ${hovered ? "var(--orange-border)" : "var(--border)"}`,
        borderRight: `1px solid ${hovered ? "var(--orange-border)" : "var(--border)"}`,
        borderBottom: `1px solid ${hovered ? "var(--orange-border)" : "var(--border)"}`,
        // Barra de prioridade: dá pra escanear a fila de vagas sem ler nenhum badge.
        // Fica sempre com a cor da prioridade, mesmo no hover (por isso não usamos
        // o atalho `borderColor`, que sobrescreveria os 4 lados de uma vez).
        borderLeft: `3px solid ${priorityAccent}`,
        boxShadow: hovered ? "var(--shadow-sm)" : "var(--shadow-xs)",
        transition: "box-shadow 0.15s ease, border-color 0.15s ease",
        cursor: "pointer",
      }}
    >
      {/* Título + localização — âncora visual da linha, cresce livremente */}
      <div style={{ flex: "1 1 240px", minWidth: 200 }}>
        <h3 style={{
          margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text)",
          letterSpacing: "-0.01em", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>
          {job.title}
        </h3>
        <p style={{ margin: "3px 0 0", fontSize: 12.5, color: "var(--text-2)", display: "flex", alignItems: "center", gap: 4 }}>
          <MapPin size={12} />
          {job.city ? `${job.city} · ${job.state}` : "Remoto"}
        </p>
      </div>

      {/* Tags de contrato/formato + prioridade */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, flex: "1 1 220px" }}>
        <Tag>{job.contractType}</Tag>
        <Tag>{WORK_FORMAT_LABEL[job.workFormat] ?? job.workFormat}</Tag>
        <PriorityBadge value={job.priority} />
      </div>

      {/* Status */}
      <div style={{ minWidth: 128, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
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

      {/* Prazo */}
      <div style={{ minWidth: 116, flexShrink: 0, textAlign: "right" }}>
        <span style={{ fontSize: 12.5, fontWeight: 500, color: deadline?.isPast ? "var(--red)" : "var(--text-muted)" }}>
          {deadline
            ? (deadline.isPast ? `Encerrado ${deadline.text}` : deadline.text)
            : "Sem prazo"}
        </span>
      </div>

      {/* Ações */}
      <div style={{ display: "flex", gap: 6, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
        <IconButton icon={<Eye size={15} />} title="Ver detalhes" onClick={() => onOpen(job)} />
        {!isHired && (
          <IconButton icon={<PencilSimple size={15} />} title="Editar" onClick={() => onEdit(job)} />
        )}
      </div>
    </div>
  );
}