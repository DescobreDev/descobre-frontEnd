import { useNavigate } from "react-router-dom";
import { Lock, ArrowRight } from "@phosphor-icons/react";
import { usePlan } from "../hooks/usePlan";
import styles from "./CSS/planGate.module.css";

export function PlanGate({ children }) {
  const navigate = useNavigate();
  const { hasActivePlan } = usePlan();

  if (hasActivePlan) return children;

  return (
    <div className="page-content">
      <div className={styles.gate}>
        <div className={styles.iconWrap}>
          <div className={styles.iconGlow} aria-hidden="true" />
          <Lock size={22} color="#f97316" weight="duotone" />
        </div>

        <p className={styles.title}>Recurso bloqueado</p>
        <p className={styles.subtitle}>
          Você precisa de um plano ativo para usar este recurso.
        </p>

        <button type="button" className={styles.ctaBtn} onClick={() => navigate("/plans")}>
          Ver planos
          <ArrowRight size={15} weight="bold" />
        </button>
      </div>
    </div>
  );
}