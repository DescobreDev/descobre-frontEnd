import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { JobForm } from "./JobForm";
import { PlanGate } from "../../hooks/planGate";
import { Modal } from "../../components/Modal";
import api from "../../services/api";
import styles from "./CSS/jobs.module.css";
import {
  WarningIcon, UsersIcon, LockIcon, ArrowRightIcon
} from "@phosphor-icons/react";

const STORAGE_KEY = "jobs_new_warning_dismissed";

export default function JobsNew() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [warningOpen, setWarningOpen] = useState(
    () => localStorage.getItem(STORAGE_KEY) !== "true"
  );
  const [dontShowAgain, setDontShowAgain] = useState(false);

  function handleCloseWarning() {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY, "true");
    }
    setWarningOpen(false);
  }

  async function handleSubmit(data) {
    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/jobs", data);

      console.log('resposta do cabloco', res);

      const jobId = res.data.id;

      navigate(`/jobs/${jobId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Erro ao criar a vaga.");
      setLoading(false);
    }
  }
  return (
    <PlanGate>
      <div className="page-content">

        <Modal
          isOpen={warningOpen}
          onClose={handleCloseWarning}
          title=""
          canClose={false}
        >
          <div className={styles.warning_modal}>

            <div className={styles.warning_modal_icon}>
              <WarningIcon size={32} color="white" weight="fill" />
            </div>

            <h2 className={styles.warning_modal_title}>Atenção antes de continuar</h2>

            <p className={styles.warning_modal_subtitle}>
              Fique ciente das restrições que se aplicam após a criação da vaga.
            </p>

            <div className={styles.warning_modal_card}>
              <LockIcon size={28} color="#6366f1" weight="duotone" />
              <div>
                <p className={styles.warning_modal_card_title}>Campos permanentes</p>
                <p className={styles.warning_modal_card_subtitle}>
                  "Setor" e "Cargo/Nível" não poderão ser alterados após a criação.
                </p>
              </div>
            </div>

            <div className={styles.warning_modal_card}>
              <UsersIcon size={28} color="#6366f1" weight="duotone" />
              <div>
                <p className={styles.warning_modal_card_title}>Vaga com candidatos</p>
                <p className={styles.warning_modal_card_subtitle}>
                  Com candidatos vinculados, nenhuma informação poderá ser editada.
                </p>
              </div>
            </div>

            <label className={styles.warning_modal_checkbox}>
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
              />
              Não exibir este aviso novamente
            </label>

            <button className="btn-tertiary mt-3" onClick={handleCloseWarning}>
              Entendi, continuar
              <ArrowRightIcon size={18} weight="bold" />
            </button>

          </div>
        </Modal>

        <div className={styles.pageHeader}>
          <div>
            <h1 className={styles.pageTitle}>Nova vaga</h1>
            <p className={styles.pageSubtitle}>Preencha os dados para publicar uma nova vaga</p>
          </div>
        </div>

        <JobForm
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel="Publicar vaga"
        />

        {error && (
          <div className="feedback-banner feedback-error">{error}</div>
        )}

      </div>
    </PlanGate>
  );
}