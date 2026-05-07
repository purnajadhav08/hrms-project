import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import LoginPage            from "@/pages/auth/LoginPage";
import SignupPage           from "@/pages/auth/SignupPage";
import AppLayout            from "@/components/layout/AppLayout";
import ProtectedRoute       from "@/components/ProtectedRoute";
import DashboardPage        from "@/pages/DashboardPage";
import EmployeesPage        from "@/pages/employees/EmployeesPage";
import EmployeeProfilePage  from "@/pages/employees/EmployeeProfilePage";
import EmployeeFormPage     from "@/pages/employees/EmployeeFormPage";
import HRManagementPage     from "@/pages/admin/HRManagementPage";
import HRDashboard          from "@/pages/hr/HRDashboard";
import ReportsPage          from "@/pages/reports/ReportsPage";
import OffersPage           from "@/pages/offers/OffersPage";
import OfferFormPage        from "@/pages/offers/OfferFormPage";
import POPage               from "@/pages/po/POPage";
import POFormPage           from "@/pages/po/POFormPage";
import MSAPage              from "@/pages/msa/MSAPage";
import MSAFormPage          from "@/pages/msa/MSAFormPage";

import { useAuthStore } from "@/store/authStore";
import { authService }  from "@/services/authService";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <Routes location={location} key={location.pathname}>
      <Route path="/login"        element={<LoginPage />} />
      <Route path="/signup/:role" element={<SignupPage />} />

      {/* Admin */}
      <Route element={<ProtectedRoute role="admin"><AppLayout /></ProtectedRoute>}>
        <Route path="/admin/dashboard" element={<DashboardPage />} />
        <Route path="/admin/hrs"       element={<HRManagementPage />} />
        <Route path="/employees"           element={<EmployeesPage />} />
        <Route path="/employees/new"       element={<EmployeeFormPage />} />
        <Route path="/employees/:id"       element={<EmployeeProfilePage />} />
        <Route path="/employees/:id/edit"  element={<EmployeeFormPage />} />
        <Route path="/offers"              element={<OffersPage />} />
        <Route path="/offers/new"          element={<OfferFormPage />} />
        <Route path="/offers/:id/edit"     element={<OfferFormPage />} />
        <Route path="/po"                  element={<POPage />} />
        <Route path="/po/new"              element={<POFormPage />} />
        <Route path="/po/:id/edit"         element={<POFormPage />} />
        <Route path="/msa"                 element={<MSAPage />} />
        <Route path="/msa/new"             element={<MSAFormPage />} />
        <Route path="/msa/:id/edit"        element={<MSAFormPage />} />
        <Route path="/reports"             element={<ReportsPage />} />
      </Route>

      {/* HR */}
      <Route element={<ProtectedRoute role="hr"><AppLayout /></ProtectedRoute>}>
        <Route path="/hr/dashboard"        element={<DashboardPage />} />
        <Route path="/employees"           element={<EmployeesPage />} />
        <Route path="/employees/new"       element={<EmployeeFormPage />} />
        <Route path="/employees/:id"       element={<EmployeeProfilePage />} />
        <Route path="/employees/:id/edit"  element={<EmployeeFormPage />} />
        <Route path="/offers"              element={<OffersPage />} />
        <Route path="/offers/new"          element={<OfferFormPage />} />
        <Route path="/offers/:id/edit"     element={<OfferFormPage />} />
        <Route path="/po"                  element={<POPage />} />
        <Route path="/po/new"              element={<POFormPage />} />
        <Route path="/po/:id/edit"         element={<POFormPage />} />
        <Route path="/msa"                 element={<MSAPage />} />
        <Route path="/msa/new"             element={<MSAFormPage />} />
        <Route path="/msa/:id/edit"        element={<MSAFormPage />} />
        <Route path="/reports"             element={<ReportsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default function App() {
  const { user, setAuth, logout } = useAuthStore();
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token && !user) {
      authService.me()
        .then(({ data }) => {
          setAuth(data, {
            access:  localStorage.getItem("access_token")  || "",
            refresh: localStorage.getItem("refresh_token") || "",
          });
        })
        .catch(() => logout())
        .finally(() => setRestoring(false));
    } else {
      setRestoring(false);
    }
  }, []);

  if (restoring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
