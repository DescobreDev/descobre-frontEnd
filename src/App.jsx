import { BrowserRouter, Routes, Route } from "react-router-dom";

import PrivateRoute from "./Routes/privateRoute";

import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";

import DashboardLayout from "./layouts/DashboardLayout";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          element={
            <PrivateRoute>
              <DashboardLayout />
            </PrivateRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;