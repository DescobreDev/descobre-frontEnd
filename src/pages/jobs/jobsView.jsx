import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DataTable } from "../../components/DataTable";
import { PlanGate } from "../../hooks/planGate";
import api from "../../services/api";
import AsyncSelect from "../../components/AsyncSelect"; // ajuste o caminho
import {
  Plus, PencilSimple, Eye, MapPin,
} from "@phosphor-icons/react";
import styles from "./CSS/jobs.module.css";

const STATUS_LABEL = {
  ACTIVE: { label: "Ativa", color: "#10b981", bg: "#f0fdf4" },
  INACTIVE: { label: "Inativa", color: "#94a3b8", bg: "#f1f5f9" },
  CLOSED: { label: "Encerrada", color: "#ef4444", bg: "#fef2f2" },
};

const PRIORITY_LABEL = {
  LOW: { label: "Baixa", color: "#64748b", bg: "#f1f5f9" },
  MEDIUM: { label: "Média", color: "#f97316", bg: "#fff7ed" },
  HIGH: { label: "Alta", color: "#6366f1", bg: "#eef2ff" },
  URGENT: { label: "Urgente", color: "#ef4444", bg: "#fef2f2" },
};

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Ativa" },
  { value: "INACTIVE", label: "Inativa" },
  { value: "CLOSED", label: "Encerrada" },
];

function Badge({ value, map }) {
  const config = map[value] ?? { label: value, color: "#64748b", bg: "#f1f5f9" };
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "3px 10px",
      borderRadius: 99,
      fontSize: 12,
      fontWeight: 600,
      color: config.color,
      background: config.bg,
    }}>
      {config.label}
    </span>
  );
}

export default function JobsView() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchJobs(1);
  }, []);

  async function fetchJobs(page = 1) {
    try {
      setLoading(true);
      const response = await api.get("/jobs", { params: { page, limit: 10 } });
      const { data, pagination } = response.data;
      setJobs(data || []);
      setPagination(pagination);
      setCurrentPage(page);
    } catch {
      setError("Não foi possível carregar as vagas.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(job, option) {
    try {
      await api.post(`/jobs/${job.id}/status`, { status: option.value });
      setJobs((prev) =>
        prev.map((j) =>
          j.id === job.id ? { ...j, status: option.value } : j
        )
      );
    } catch {
      alert("Erro ao atualizar status da vaga.");
    }
  }

  const columns = [
    {
      key: "title",
      title: "Vaga",
      render: (value, row) => (
        <div>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "var(--text)" }}>{value}</p>
          <p style={{ margin: 0, fontSize: 12, color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
            <MapPin size={11} /> {row.city} · {row.state}
          </p>
        </div>
      ),
    },
    {
      key: "contractType",
      title: "Contrato",
      render: (value) => (
        <span style={{ fontSize: 13, color: "var(--text-2)" }}>{value}</span>
      ),
    },
    {
      key: "workFormat",
      title: "Formato",
      render: (value) => {
        const map = { REMOTE: "Remoto", HYBRID: "Híbrido", ONSITE: "Presencial" };
        return <span style={{ fontSize: 13, color: "var(--text-2)" }}>{map[value] ?? value}</span>;
      },
    },
    {
      key: "priority",
      title: "Prioridade",
      render: (value) => <Badge value={value} map={PRIORITY_LABEL} />,
    },
    {
      key: "status",
      title: "Status",
      render: (value, row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <AsyncSelect
            name="status"
            value={{ value, label: STATUS_LABEL[value]?.label ?? value }}
            fetchOptions={async () => STATUS_OPTIONS}
            onChange={(option) => handleStatusChange(row, option)}
          />
        </div>
      ),
    },
    {
      key: "deadline",
      title: "Prazo",
      render: (value) => value
        ? <span style={{ fontSize: 13, color: "var(--text-2)" }}>{new Date(value).toLocaleDateString("pt-BR")}</span>
        : <span style={{ fontSize: 13, color: "var(--text-muted)" }}>—</span>,
    },
  ];

  return (
    <PlanGate>
      <div className="page-content">
        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Vagas</h1>
            <p className={styles.pageSubtitle}>Gerencie todas as vagas abertas da sua empresa</p>
          </div>
          <button className="btn-primary" onClick={() => navigate("/jobs/new")}>
            <Plus size={16} weight="bold" />
            Nova vaga
          </button>
        </div>

        {error && (
          <div className="feedback-banner feedback-error">{error}</div>
        )}

        <DataTable
          columns={columns}
          data={jobs}
          loading={loading}
          pagination={pagination}
          onPageChange={(page) => fetchJobs(page)}
          emptyMessage="Nenhuma vaga cadastrada ainda."
          onRowClick={(row) => navigate(`/jobs/${row.id}`)}
          actions={(row) => (
            <>
              <button
                className={styles.actionBtn}
                onClick={() => navigate(`/jobs/${row.id}`)}
                title="Ver detalhes"
              >
                <Eye size={15} />
              </button>

              <button
                className={styles.actionBtn}
                onClick={() => navigate(`/jobs/${row.id}/edit`)}
                title="Editar"
              >
                <PencilSimple size={15} />
              </button>
            </>
          )}
        />
      </div>
    </PlanGate>
  );
}