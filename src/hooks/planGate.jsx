// src/components/PlanGate.jsx
import { useNavigate } from "react-router-dom";
import { Lock } from "@phosphor-icons/react";
import { usePlan } from "../hooks/usePlan";

export function PlanGate({ children }) {
  const navigate = useNavigate();
  const { hasActivePlan } = usePlan();

  if (hasActivePlan) return children;

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: 12, padding: "48px 24px", textAlign: "center",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%",
        background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Lock size={24} color="#6366f1" weight="duotone" />
      </div>
      <p style={{ fontWeight: 600, fontSize: 16, color: "#1e1e2e", margin: 0 }}>
        Recurso bloqueado
      </p>
      <p style={{ fontSize: 13, color: "#64748b", margin: 0 }}>
        Você precisa de um plano ativo para usar este recurso.
      </p>
      <button
        onClick={() => navigate("/plans")}
        style={{
          background: "#6366f1", color: "white", border: "none",
          borderRadius: 8, padding: "10px 20px", fontSize: 13,
          fontWeight: 600, cursor: "pointer",
        }}
      >
        Ver planos →
      </button>
    </div>
  );
}