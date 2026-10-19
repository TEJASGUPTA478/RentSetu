import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';

// Layouts
import OwnerLayout from './layouts/OwnerLayout.jsx';
import TenantLayout from './layouts/TenantLayout.jsx';

// Public pages
import LandingPage from './pages/public/LandingPage.jsx';
import LoginPage from './pages/public/LoginPage.jsx';
import RegisterPage from './pages/public/RegisterPage.jsx';
import ForgotPasswordPage from './pages/public/ForgotPasswordPage.jsx';

// Owner pages
import DashboardPage from './pages/owner/DashboardPage.jsx';
import PropertiesPage from './pages/owner/PropertiesPage.jsx';
import TenantsPage from './pages/owner/TenantsPage.jsx';
import RentPage from './pages/owner/RentPage.jsx';
import MetersPage from './pages/owner/MetersPage.jsx';
import BillsPage from './pages/owner/BillsPage.jsx';
import MaintenancePage from './pages/owner/MaintenancePage.jsx';
import ExpensesPage from './pages/owner/ExpensesPage.jsx';
import ReportsPage from './pages/owner/ReportsPage.jsx';
import SettingsPage from './pages/owner/SettingsPage.jsx';
import HelpPage from './pages/owner/HelpPage.jsx';

// Tenant pages
import TenantDashboardPage from './pages/tenant/TenantDashboardPage.jsx';
import TenantRentPage from './pages/tenant/TenantRentPage.jsx';
import TenantBillsPage from './pages/tenant/TenantBillsPage.jsx';
import TenantPaymentsPage from './pages/tenant/TenantPaymentsPage.jsx';
import TenantMaintenancePage from './pages/tenant/TenantMaintenancePage.jsx';
import TenantProfilePage from './pages/tenant/TenantProfilePage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* ── Public routes ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* ── Owner / Manager guard ── */}
          <Route element={<ProtectedRoute roles={['owner', 'manager']} />}>
            <Route element={<OwnerLayout />}>
              <Route path="/dashboard"   element={<DashboardPage />} />
              <Route path="/properties"  element={<PropertiesPage />} />
              <Route path="/tenants"     element={<TenantsPage />} />
              <Route path="/rent"        element={<RentPage />} />
              <Route path="/meters"      element={<MetersPage />} />
              <Route path="/bills"       element={<BillsPage />} />
              <Route path="/maintenance" element={<MaintenancePage />} />
              <Route path="/expenses"    element={<ExpensesPage />} />
              <Route path="/reports"     element={<ReportsPage />} />
              <Route path="/settings"    element={<SettingsPage />} />
              <Route path="/help"        element={<HelpPage />} />
            </Route>
          </Route>

          {/* ── Tenant guard ── */}
          <Route element={<ProtectedRoute roles={['tenant']} />}>
            <Route element={<TenantLayout />}>
              <Route path="/tenant/dashboard"   element={<TenantDashboardPage />} />
              <Route path="/tenant/rent"        element={<TenantRentPage />} />
              <Route path="/tenant/bills"       element={<TenantBillsPage />} />
              <Route path="/tenant/payments"    element={<TenantPaymentsPage />} />
              <Route path="/tenant/maintenance" element={<TenantMaintenancePage />} />
              <Route path="/tenant/profile"     element={<TenantProfilePage />} />
            </Route>
          </Route>

          {/* ── 404 fallback ── */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
