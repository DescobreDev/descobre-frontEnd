import { useContext } from "react";
import { AuthContext } from "../context/authContext";

export function usePlan() {
  const { user } = useContext(AuthContext);

  console.log(user);
  
  const subscription = user?.company?.subscription;
  const plan = subscription?.[0]?.planId ?? null;
  const planName = subscription?.[0]?.plan.name ?? null;

  return { plan, planName,subscription };
}