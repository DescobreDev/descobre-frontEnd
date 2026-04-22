import { useContext } from "react";
import { AuthContext } from "../context/authContext";

export function usePlan() {
  const { user } = useContext(AuthContext);

  const subscription = user?.company?.subscription;
  const plan = subscription?.[0]?.planId ?? null;
  const planName = subscription?.[0]?.plan.name ?? null;
  const hasActivePlan = subscription?.[0]?.active ?? false;

  console.log('batata frita' ,hasActivePlan);

  return { plan, planName, subscription, hasActivePlan };
}