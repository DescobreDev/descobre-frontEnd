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
    <div className={styles.skeletonCard}>
      <div className={styles.skeletonRow}>
        <div className={styles.skeletonCol}>
          <div className={`${styles.skeletonBlock} ${styles.skeletonTitle}`} />
          <div className={`${styles.skeletonBlock} ${styles.skeletonSubtitle}`} />
        </div>
        <div className={`${styles.skeletonBlock} ${styles.skeletonBadge}`} />
      </div>
      <div className={styles.skeletonTags}>
        <div className={`${styles.skeletonBlock} ${styles.skeletonTag}`} />
        <div className={`${styles.skeletonBlock} ${styles.skeletonTag}`} />
        <div className={`${styles.skeletonBlock} ${styles.skeletonTagSm}`} />
      </div>
      <div className={styles.skeletonDivider} />
      <div className={`${styles.skeletonBlock} ${styles.skeletonFooter}`} />
    </div>
  );
}

function EmptyState({ hasFilters, onClear, onCreate }) {
  return (
    <div className={styles.stateWrap}>
      <div className={styles.stateIcon}>
        <Briefcase size={22} weight="bold" />
      </div>
      <p className={styles.stateTitle}>
        {hasFilters ? "Nenhuma vaga encontrada" : "Nenhuma vaga cadastrada ainda"}
      </p>
      <p className={styles.stateText}>
        {hasFilters
          ? "Tente buscar por outro termo ou limpar a busca."
          : "Crie a primeira vaga da sua empresa para começar a receber candidaturas."}
      </p>
      <button className={styles.btnPrimary} onClick={hasFilters ? onClear : onCreate}>
        {hasFilters ? "Limpar busca" : "Criar vaga"}
      </button>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className={styles.stateWrap}>
      <div className={styles.stateIcon} data-tone="error">
        <CloudWarning size={22} weight="bold" />
      </div>
      <p className={styles.stateTitle}>Não foi possível carregar</p>
      <p className={styles.stateText}>{message}</p>
      <button className={styles.btnPrimary} onClick={onRetry}>
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

  return (
    <div className={styles.pagination}>
      <button
        className={styles.pageBtn}
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <CaretLeft size={13} weight="bold" /> Anterior
      </button>
      <span className={styles.pageLabel}>
        Página {currentPage} de {totalPages}
      </span>
      <button
        className={styles.pageBtn}
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

  const visibleJobs = search.trim()
    ? jobs.filter((j) => j.title.toLowerCase().includes(search.trim().toLowerCase()))
    : jobs;

  const totalVagas = pagination?.total ?? jobs.length;
  const vagasAtivas = jobs.filter((j) => j.status === "ACTIVE").length;

  return (
    <PlanGate>
      <div className="page-content">
        <div className={styles.page}>

          {/* ── Cabeçalho — mesma estrutura do detalhe: título,
               metadados em linha e barra de ações ── */}
          <header className={styles.header}>
            <div className={styles.headerTop}>
              <div className={styles.headerTitleBlock}>
                <h1 className={styles.title}>Vagas</h1>
                <p className={styles.subtitle}>Gerencie todas as vagas abertas da sua empresa</p>
              </div>

              <button className={styles.btnPrimary} onClick={() => navigate("/jobs/new")}>
                <Plus size={16} weight="bold" /> Nova vaga
              </button>
            </div>

            <div className={styles.metaLine}>
              <span className={styles.metaItem}>
                <strong className={styles.metaValue}>{totalVagas}</strong>
                {totalVagas === 1 ? "vaga cadastrada" : "vagas cadastradas"}
              </span>
              <span className={styles.metaDivider}>•</span>
              <span className={styles.metaItem}>
                <strong className={styles.metaValue}>{vagasAtivas}</strong>
                {vagasAtivas === 1 ? "ativa" : "ativas"}
              </span>
            </div>
          </header>

          {/* ── Busca ─────────────────────────── */}
          <div className={styles.toolbar}>
            <div className={styles.searchBox}>
              <MagnifyingGlass size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar vaga por título"
                className={styles.searchInput}
              />
            </div>
            {search && (
              <span className={styles.resultsCount}>
                {visibleJobs.length} {visibleJobs.length === 1 ? "resultado" : "resultados"}
              </span>
            )}
          </div>

          {/* ── Lista ─────────────────────────── */}
          <div className={styles.grid}>
            {loading && Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}

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
      </div>
    </PlanGate>
  );
}