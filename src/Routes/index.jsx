import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./privateRoute";
import PublicRoute from "./publicRoute";
import DashboardLayout from "../layouts/mainLayout";
import Loading from "../pages/loading";

const Login    = lazy(() => import("../pages/login"));
const Register = lazy(() => import("../pages/register"));
const Dashboard = lazy(() => import("../pages/dashboard"));
const Plans    = lazy(() => import("../pages/plans"));
const Jobs     = lazy(() => import("../pages/jobs/jobsView"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>

        {/* Rotas públicas — redireciona pro dashboard se já logado */}
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

        {/* Rotas privadas */}
        <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/jobs" element={<Jobs />} />
        </Route>

        {/* Qualquer URL inexistente — tenta ir pro dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </Suspense>
  );
}