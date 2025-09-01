
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { MainLayout } from "@/components/layout/main-layout";
import { LoginForm } from "@/components/auth/login-form";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import Dashboard from "./pages/Dashboard";
import MeusTreinamentos from "./pages/MeusTreinamentos";
import Catalogo from "./pages/Catalogo";
import GestaoTreinamentos from "./pages/admin/GestaoTreinamentos";
import Usuarios from "./pages/admin/Usuarios";
import Cargos from "./pages/admin/Cargos";
import Departamentos from "./pages/admin/Departamentos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm onLogin={login} />;
  }

  return (
    <BrowserRouter>
      <MainLayout onLogout={logout}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/meus-treinamentos" element={<MeusTreinamentos />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/relatorios" element={<div className="p-8"><h1 className="text-2xl font-bold">Relatórios em desenvolvimento</h1></div>} />
          <Route path="/calendario" element={<div className="p-8"><h1 className="text-2xl font-bold">Calendário em desenvolvimento</h1></div>} />
          <Route path="/admin/treinamentos" element={<GestaoTreinamentos />} />
          <Route path="/admin/usuarios" element={<Usuarios />} />
          <Route path="/admin/cargos" element={<Cargos />} />
          <Route path="/admin/departamentos" element={<Departamentos />} />
          <Route path="/admin/empresas" element={<div className="p-8"><h1 className="text-2xl font-bold">Gestão de Empresas em desenvolvimento</h1></div>} />
          <Route path="/admin/analytics" element={<div className="p-8"><h1 className="text-2xl font-bold">Analytics em desenvolvimento</h1></div>} />
          <Route path="/admin/permissoes" element={<div className="p-8"><h1 className="text-2xl font-bold">Gestão de Permissões em desenvolvimento</h1></div>} />
          <Route path="/admin/configuracoes" element={<div className="p-8"><h1 className="text-2xl font-bold">Configurações em desenvolvimento</h1></div>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
