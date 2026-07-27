import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PlanGate } from "../../hooks/planGate";
import api from "../../services/api";
import JobCard from "../../components/jobCard";
import {
  Plus, MagnifyingGlass, CaretLeft, CaretRight,
  Briefcase, CloudWarning,
} from "@phosphor-icons/react";
import styles from "./CSS/jobs.module.css";

function SkeletonCard() {
  return (
    <div style={{
      background: "#fff", borderRadius: 16, padding: 18,
      border: "1px solid #eef1f6", display: "flex", flexDirection: "column", gap: 14,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ height: 15, width: "70%", background: "#eef1f6", borderRadius: 6 }} />
          <div style={{ height: 12, width: "45%", background: "#eef1f6", borderRadius: 6 }} />
        </div>
        <div style={{ height: 26, width: 80, background: "#eef1f6", borderRadius: 99 }} />
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <div style={{ height: 22, width: 60, background: "#eef1f6", borderRadius: 8 }} />
        <div style={{ height: 22, width: 70, background: "#eef1f6", borderRadius: 8 }} />
        <div style={{ height: 22, width: 55, background: "#eef1f6", borderRadius: 8 }} />
      </div>
      <div style={{ height: 1, background: "#f1f5f9" }} />
      <div style={{ height: 12, width: "40%", background: "#eef1f6", borderRadius: 6 }} />
    </div>
  );
}

function EmptyState({ hasFilters, onClear, onCreate }) {
  return (
    <div style={{
      gridColumn: "1 / -1", display: "flex", flexDirection: "column", alignItems: "center",
      gap: 8, padding: "56px 24px", textAlign: "center",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16, background: "#f8fafc",
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4,
      }}>
        <Briefcase size={26} color="#94a3b8" />
      </div>
      <p style={{ margin: 0, fontSize: 15.5, fontWeight: 600, color: "#0f172a" }}>
        {hasFilters ? "Nenhuma vaga encontrada" : "Nenhuma vaga cadastrada ainda"}
      </p>
      <p style={{ margin: 0, fontSize: 13.5, color: "#64748b", maxWidth: 320 }}>
        {hasFilters
          ? "Tente buscar por outro termo ou limpar a busca."
          : "Crie a primeira vaga da sua empresa para começar a receber candidaturas."}
      </p>
      <button
        className="btn-primary"
        onClick={hasFilters ? onClear : onCreate}
        style={{ marginTop: 10 }}
      >
        {hasFilters ? "Limpar busca" : "Criar vaga"}
      </button>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div style={{
      gridColumn: "1 / -1", display: "flex", flexDirection: "column", alignItems: "center",
      gap: 8, padding: "56px 24px", textAlign: "center",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: 16, background: "#fef2f2",
        display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4,
      }}>
        <CloudWarning size={26} color="#dc2626" />
      </div>
      <p style={{ margin: 0, fontSize: 15.5, fontWeight: 600, color: "#0f172a" }}>Não foi possível carregar</p>
      <p style={{ margin: 0, fontSize: 13.5, color: "#64748b" }}>{message}</p>
      <button className="btn-primary" onClick={onRetry} style={{ marginTop: 10 }}>
        Tentar de novo
      </button>
    </div>
  );
}

function Pagination({ pagination, currentPage, onPageChange }) {
  if (!pagination) return null;
  const totalPages = pagination.totalPages
    ?? Math.max(1, Math.ceil((pagination.total ?? 0) / (pagination.limit ?? 10)));
  if (totalPages <= 1) return null;

  const btnStyle = (disabled) => ({
    display: "flex", alignItems: "center", gap: 6,
    padding: "8px 14px", borderRadius: 10,
    border: "1px solid #e4e9f0", background: "#fff",
    fontSize: 13, fontWeight: 500, color: disabled ? "#cbd5e1" : "#334155",
    cursor: disabled ? "default" : "pointer",
  });

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 28 }}>
      <button
        style={btnStyle(currentPage <= 1)}
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <CaretLeft size={13} weight="bold" /> Anterior
      </button>
      <span style={{ fontSize: 13, fontWeight: 500, color: "#64748b" }}>
        Página {currentPage} de {totalPages}
      </span>
      <button
        style={btnStyle(currentPage >= totalPages)}
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Próxima <CaretRight size={13} weight="bold" />
      </button>
    </div>
  );
}

export default function JobsView() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => { fetchJobs(1); }, []);

  async function fetchJobs(page = 1) {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/jobs", { params: { page, limit: 10 } });
      const { data, pagination } = response.data;
      setJobs(data || []);
      setPagination(pagination);
      setCurrentPage(page);
    } catch {
      setError("Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(job, status) {
    const previousStatus = job.status;
    setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status } : j)));

    try {
      await api.post(`/jobs/${job.id}/status`, { status });
    } catch {
      setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: previousStatus } : j)));
      alert("Erro ao atualizar status da vaga.");
    }
  }

  // Filtro simples no client, sobre a página já carregada — cobre o caso comum
  // de achar rápido uma vaga na página atual sem precisar de uma rota nova na API.
  const visibleJobs = search.trim()
    ? jobs.filter((j) => j.title.toLowerCase().includes(search.trim().toLowerCase()))
    : jobs;

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

        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "#fff", border: "1px solid #eef1f6", borderRadius: 12,
          padding: "10px 14px", marginBottom: 20, maxWidth: 360,
        }}>
          <MagnifyingGlass size={16} color="#94a3b8" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar vaga por título"
            style={{ border: "none", outline: "none", fontSize: 13.5, width: "100%", color: "#0f172a" }}
          />
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 16,
        }}>
          {loading && Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

          {!loading && error && <ErrorState message={error} onRetry={() => fetchJobs(currentPage)} />}

          {!loading && !error && visibleJobs.length === 0 && (
            <EmptyState
              hasFilters={Boolean(search)}
              onClear={() => setSearch("")}
              onCreate={() => navigate("/jobs/new")}
            />
          )}

          {!loading && !error && visibleJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onOpen={(j) => navigate(`/jobs/${j.id}`)}
              onEdit={(j) => navigate(`/jobs/${j.id}/edit`)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>

        {!loading && !error && !search && (
          <Pagination pagination={pagination} currentPage={currentPage} onPageChange={fetchJobs} />
        )}
      </div>
    </PlanGate>
  );
}