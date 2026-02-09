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
import ExecutarTreinamento from "./pages/ExecutarTreinamento";
import GestaoTreinamentos from "./pages/admin/GestaoTreinamentos";
import NovoTreinamentoModerno from "./pages/admin/NovoTreinamentoModerno";
import EditarTreinamentoModerno from "./pages/admin/EditarTreinamentoModerno";
import Usuarios from "./pages/admin/Usuarios";
import Cargos from "./pages/admin/Cargos";
import Departamentos from "./pages/admin/Departamentos";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Checkout from "./pages/Checkout";
import TermosDeUso from "./pages/TermosDeUso";
import SobreNos from "./pages/SobreNos";
import Relatorios from "./pages/Relatorios";
import Calendario from "./pages/Calendario";
import EmpresasSupabase from "./pages/admin/EmpresasSupabase";
import Planos from "./pages/admin/Planos";
import Analytics from "./pages/admin/Analytics";
import Permissoes from "./pages/admin/Permissoes";
import Configuracoes from "./pages/admin/Configuracoes";
import Integracoes from "./pages/admin/Integracoes";
import DashboardExecutivo from "./pages/admin/DashboardExecutivo";
import LandingPageEditor from "./pages/admin/LandingPageEditor";
import Financeiro from "./pages/admin/Financeiro";

const queryClient = new QueryClient();

// Loading screen component
function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading, logout, user } = useAuth();
  const userRole = user?.role || 'usuario';
  const isAdminOrHigher = ['master', 'admin', 'instrutor'].includes(userRole);
  const isMaster = userRole === 'master';
  const isAdminOrMaster = ['master', 'admin'].includes(userRole);

  // CRITICAL: Show loading screen while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Default redirect based on role
  const defaultRoute = isAdminOrHigher ? "/dashboard" : "/meus-treinamentos";

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/auth" element={<LoginForm />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/termos-de-uso" element={<TermosDeUso />} />
        <Route path="/sobre-nos" element={<SobreNos />} />
        <Route path="/gestao/treinamentos/novo" element={<NewTrainingPage />} />
        <Route path="*" element={<Index />} />
      </Routes>
    );
  }

  return (
    <MainLayout onLogout={logout}>
      <Routes>
        <Route path="/" element={<Navigate to={defaultRoute} replace />} />
        <Route path="/login" element={<Navigate to={defaultRoute} replace />} />
        <Route path="/auth" element={<Navigate to={defaultRoute} replace />} />
        
        {/* Rotas acessíveis por todos */}
        <Route path="/meus-treinamentos" element={<MeusTreinamentos />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/treinamento/:id" element={<TrainingPage />} />
        <Route path="/executar-treinamento/:id" element={<ExecutarTreinamento />} />
        <Route path="/calendario" element={<Calendario />} />

        {/* Rotas para admin/instrutor/master */}
        <Route path="/dashboard" element={isAdminOrHigher ? <Dashboard /> : <Navigate to="/meus-treinamentos" replace />} />
        <Route path="/relatorios" element={isAdminOrHigher ? <Relatorios /> : <Navigate to="/meus-treinamentos" replace />} />

        {/* Rotas administrativas */}
        <Route path="/admin/treinamentos" element={isAdminOrHigher ? <GestaoTreinamentos /> : <Navigate to="/meus-treinamentos" replace />} />
        <Route path="/admin/treinamentos/novo" element={isAdminOrHigher ? <NovoTreinamentoModerno /> : <Navigate to="/meus-treinamentos" replace />} />
        <Route path="/admin/treinamentos/editar/:id" element={isAdminOrHigher ? <EditarTreinamentoModerno /> : <Navigate to="/meus-treinamentos" replace />} />
        <Route path="/admin/usuarios" element={isAdminOrMaster ? <Usuarios /> : <Navigate to="/meus-treinamentos" replace />} />
        <Route path="/admin/cargos" element={isAdminOrMaster ? <Cargos /> : <Navigate to="/meus-treinamentos" replace />} />
        <Route path="/admin/departamentos" element={isAdminOrMaster ? <Departamentos /> : <Navigate to="/meus-treinamentos" replace />} />
        <Route path="/admin/integracoes" element={isAdminOrMaster ? <Integracoes /> : <Navigate to="/meus-treinamentos" replace />} />
        <Route path="/admin/analytics" element={isAdminOrMaster ? <Analytics /> : <Navigate to="/meus-treinamentos" replace />} />
        <Route path="/admin/executivo" element={isAdminOrMaster ? <DashboardExecutivo /> : <Navigate to="/meus-treinamentos" replace />} />

        {/* Rotas exclusivas Master */}
        <Route path="/admin/empresas" element={isMaster ? <EmpresasSupabase /> : <Navigate to="/meus-treinamentos" replace />} />
        <Route path="/admin/planos" element={isMaster ? <Planos /> : <Navigate to="/meus-treinamentos" replace />} />
        <Route path="/admin/permissoes" element={isMaster ? <Permissoes /> : <Navigate to="/meus-treinamentos" replace />} />
        <Route path="/admin/configuracoes" element={isMaster ? <Configuracoes /> : <Navigate to="/meus-treinamentos" replace />} />
        <Route path="/admin/landing-page" element={isMaster ? <LandingPageEditor /> : <Navigate to="/meus-treinamentos" replace />} />
        <Route path="/admin/financeiro" element={isMaster ? <Financeiro /> : <Navigate to="/meus-treinamentos" replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
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