import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { JobForm } from "./JobForm";
import { PlanGate } from "../../hooks/planGate";
import api from "../../services/api";
import styles from "./CSS/jobs.module.css";

export default function JobsEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [sector, setSector] = useState(null);
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/jobs/${id}`)
      .then((res) => {
        setJob(res.data[0]);
        setSector(res.data[1])
        setPosition(res.data[2])

        console.log('SAPOHA', res.data[1], res.data[2])
      })
      .catch(() => setError("Vaga não encontrada."))
      .finally(() => setFetching(false));
  }, [id]);

  async function handleSubmit(data) {
    setLoading(true);
    setError(null);
    try {
      await api.patch(`/jobs/${id}`, data);
      navigate("/jobs");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao atualizar a vaga.");
      setLoading(false);
    }
  }

  if (fetching) {
    return (
      <div className="page-content" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 300 }}>
        <div style={{ textAlign: "center", color: "var(--text-muted)" }}>Carregando...</div>
      </div>
    );
  }

  return (
    <PlanGate>
      <div className="page-content">

        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Editar vaga</h1>
            <p className={styles.pageSubtitle}>{job?.title}</p>
          </div>
        </div>

        {error && (
          <div className="feedback-banner feedback-error">{error}</div>
        )}

        {job && sector != null && position != null && (
          <JobForm
            initialData={{
              ...job,
              benefitIds: job.benefits?.map((b) => b.benefitId) ?? [],
              sector: sector
                ? { value: sector.id, label: sector.name }
                : null,

              position: position
                ? { value: position.id, label: position.name }
                : null
            }}
            onSubmit={handleSubmit}
            loading={loading}
            submitLabel="Salvar alterações"
          />
        )}

      </div>
    </PlanGate>
  );
}