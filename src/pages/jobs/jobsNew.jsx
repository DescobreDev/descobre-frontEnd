import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { JobForm } from "./JobForm";
import { PlanGate } from "../../hooks/planGate";
import api from "../../services/api";
import styles from "./CSS/jobs.module.css";

export default function JobsNew() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(data) {
    setLoading(true);
    setError(null);
    try {
      await api.post("/jobs", data);
      navigate("/jobs");
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao criar a vaga.");
      setLoading(false);
    }
  }

  return (
    <PlanGate>
      <div className="page-content">

        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Nova vaga</h1>
            <p className={styles.pageSubtitle}>Preencha os dados para publicar uma nova vaga</p>
          </div>
        </div>

        {error && (
          <div className="feedback-banner feedback-error">{error}</div>
        )}

        <JobForm
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel="Publicar vaga"
        />

      </div>
    </PlanGate>
  );
}