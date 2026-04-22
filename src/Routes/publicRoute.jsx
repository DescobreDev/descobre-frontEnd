import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import Loading from "../../src/pages/loading";

export default function PublicRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <Loading />;
  if (!user) return children;

  return user?.company?.subscription?.[0]?.active
    ? <Navigate to="/dashboard" replace />
    : <Navigate to="/plans" replace />;
}