import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { AboutPage } from "./pages/AboutPage";
import { Layout } from "./components/layout/Layout";
import { ContactPage } from "./pages/ContactPage";
import { useAuthStore } from "./store/authStore";
import { CirclesPage } from "./pages/CirclesPage";
import { CreateCirclePage } from "./pages/CreateCirclePage";
import { DashboardPage } from "./pages/DashboardPage";
import { HowItWorksPage } from "./pages/HowItWorksPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { PrivacyPage } from "./pages/PrivacyPage";
import { RegisterPage } from "./pages/RegisterPage";
import { TermsPage } from "./pages/TermsPage";
import { TransactionsPage } from "./pages/TransactionsPage";
import { VerifySalaryPage } from "./pages/VerifySalaryPage";
import { AdminKycPage } from "./pages/AdminKycPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 }
  }
});

function ProtectedRoute() {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<LandingPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
          <Route path="circles" element={<CirclesPage />} />
          <Route path="how-it-works" element={<HowItWorksPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="privacy" element={<PrivacyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="circles/new" element={<CreateCirclePage />} />
            <Route path="transactions" element={<TransactionsPage />} />
            <Route path="verify-salary" element={<VerifySalaryPage />} />
            <Route path="admin/kyc" element={<AdminKycPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </QueryClientProvider>
  );
}
