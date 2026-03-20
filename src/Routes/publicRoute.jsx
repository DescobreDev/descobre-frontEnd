import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";
import Loading from "../pages/Loading";

export default function PublicRoute({ children }) {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <Loading />; // ← aguarda aqui

  if (user) return <Navigate to="/dashboard" replace />;

  return children;
}