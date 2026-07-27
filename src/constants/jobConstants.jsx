export const STATUS_CONFIG = {
  ACTIVE: {
    label: "Ativa",
    color: "var(--green)",
    bg: "rgba(16, 185, 129, 0.1)",
    dot: "var(--green)",
  },
  INACTIVE: {
    label: "Inativa",
    color: "var(--text-muted)",
    bg: "var(--surface-2)",
    dot: "var(--text-muted)",
  },
};

export const PRIORITY_CONFIG = {
  LOW: {
    label: "Baixa",
    color: "var(--text-muted)",
    bg: "var(--surface-2)",
    accent: "var(--border)",
  },
  MEDIUM: {
    label: "Média",
    color: "var(--indigo)",
    bg: "var(--indigo-soft)",
    accent: "var(--indigo)",
  },
  HIGH: {
    label: "Alta",
    color: "var(--orange-dark)",
    bg: "var(--orange-light)",
    accent: "var(--orange)",
  },
  URGENT: {
    label: "Urgente",
    color: "var(--red)",
    bg: "rgba(239, 68, 68, 0.1)",
    accent: "var(--red)",
  },
};

export const WORK_FORMAT_LABEL = {
  REMOTE: "Remoto",
  HYBRID: "Híbrido",
  ONSITE: "Presencial",
};