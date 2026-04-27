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
const JobsNew    = lazy(() => import("../pages/jobs/jobsNew"));
const JobsEdit   = lazy(() => import("../pages/jobs/jobsEdit"));
const JobsDetail = lazy(() => import("../pages/jobs/jobsDetail"));
const MyCompany = lazy(() => import("../pages/myCompany.jsx"));
const VerifyEmail = lazy(() => import("../pages/verifyEmail.jsx"));
const Payments = lazy(() => import("../pages/payments.jsx"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/jobs"          element={<Jobs />} />
          <Route path="/jobs/new"      element={<JobsNew />} />
          <Route path="/jobs/:id"      element={<JobsDetail />} />
          <Route path="/jobs/:id/edit" element={<JobsEdit />} />
          <Route path="/myCompany" element={<MyCompany />} />
          <Route path="/payments" element={<Payments />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
    </Suspense>
  );
}