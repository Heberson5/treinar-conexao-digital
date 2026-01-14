import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NewTrainingPage from "./pages/NewTrainingPage";
import { ThemeProvider } from "@/components/theme-provider";
import { MainLayout } from "@/components/layout/main-layout";
import { LoginForm } from "@/components/auth/login-form";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { TrainingProvider } from "@/contexts/training-context";
import { PlansProvider } from "@/contexts/plans-context";
import { IntegrationProvider } from "@/contexts/integration-context";
import { DepartmentProvider } from "@/contexts/department-context";
import { EmpresaFilterProvider } from "@/contexts/empresa-filter-context";
import Dashboard from "./pages/Dashboard";
import MeusTreinamentos from "./pages/MeusTreinamentos";
import Catalogo from "./pages/Catalogo";
import TrainingPage from "./pages/TrainingPage";
import GestaoTreinamentos from "./pages/admin/GestaoTreinamentos";
import NovoTreinamentoModerno from "./pages/admin/NovoTreinamentoModerno";
import EditarTreinamentoModerno from "./pages/admin/EditarTreinamentoModerno";
import Usuarios from "./pages/admin/Usuarios";
import Cargos from "./pages/admin/Cargos";
import Departamentos from "./pages/admin/Departamentos";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Relatorios from "./pages/Relatorios";
import Calendario from "./pages/Calendario";
import EmpresasSupabase from "./pages/admin/EmpresasSupabase";
import Planos from "./pages/admin/Planos";
import Analytics from "./pages/admin/Analytics";
import Permissoes from "./pages/admin/Permissoes";
import Configuracoes from "./pages/admin/Configuracoes";
import Integracoes from "./pages/admin/Integracoes";

const queryClient = new QueryClient();

function AppContent() {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="*" element={<Index />} />
        <Route path="/gestao/treinamentos/novo" element={<NewTrainingPage />} />
</Routes>
    );
  }

  return (
    <MainLayout onLogout={logout}>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/meus-treinamentos" element={<MeusTreinamentos />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/treinamento/:id" element={<TrainingPage />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/admin/treinamentos" element={<GestaoTreinamentos />} />
        <Route path="/admin/treinamentos/novo" element={<NovoTreinamentoModerno />} />
        <Route path="/admin/treinamentos/editar/:id" element={<EditarTreinamentoModerno />} />
        <Route path="/admin/usuarios" element={<Usuarios />} />
        <Route path="/admin/cargos" element={<Cargos />} />
        <Route path="/admin/departamentos" element={<Departamentos />} />
        <Route path="/admin/empresas" element={<EmpresasSupabase />} />
        <Route path="/admin/planos" element={<Planos />} />
        <Route path="/admin/analytics" element={<Analytics />} />
        <Route path="/admin/permissoes" element={<Permissoes />} />
        <Route path="/admin/configuracoes" element={<Configuracoes />} />
        <Route path="/admin/integracoes" element={<Integracoes />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <EmpresaFilterProvider>
                <PlansProvider>
                  <DepartmentProvider>
                    <IntegrationProvider>
                      <TrainingProvider>
                        <AppContent />
                      </TrainingProvider>
                    </IntegrationProvider>
                  </DepartmentProvider>
                </PlansProvider>
              </EmpresaFilterProvider>
            </AuthProvider>
          </BrowserRouter>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;