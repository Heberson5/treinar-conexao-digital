import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { MainLayout } from "@/components/layout/main-layout";
import { LoginForm } from "@/components/auth/login-form";
import Dashboard from "./pages/Dashboard";
import MeusTreinamentos from "./pages/MeusTreinamentos";
import Catalogo from "./pages/Catalogo";
import GestaoTreinamentos from "./pages/admin/GestaoTreinamentos";
import Usuarios from "./pages/admin/Usuarios";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

interface User {
  email: string;
  name: string;
  role: string;
}

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Verificar se há sessão salva
    const savedAuth = localStorage.getItem('training-portal-auth');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      setIsAuthenticated(true);
      setUser(authData.user);
    }
  }, []);

  const handleLogin = (email: string, password: string) => {
    // Simulação de login - em produção conectaria com Supabase
    if (email === "hebersohas@gmail.com" && password === "Guga430512") {
      const userData = {
        email,
        name: "Heber Sohas",
        role: "Master"
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      
      // Salvar sessão
      localStorage.setItem('training-portal-auth', JSON.stringify({
        user: userData,
        timestamp: Date.now()
      }));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('training-portal-auth');
  };

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme="light">
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <LoginForm onLogin={handleLogin} />
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <MainLayout onLogout={handleLogout}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/meus-treinamentos" element={<MeusTreinamentos />} />
                <Route path="/catalogo" element={<Catalogo />} />
                <Route path="/relatorios" element={<div className="p-8"><h1 className="text-2xl font-bold">Relatórios em desenvolvimento</h1></div>} />
                <Route path="/calendario" element={<div className="p-8"><h1 className="text-2xl font-bold">Calendário em desenvolvimento</h1></div>} />
                <Route path="/admin/treinamentos" element={<GestaoTreinamentos />} />
                <Route path="/admin/usuarios" element={<Usuarios />} />
                <Route path="/admin/empresas" element={<div className="p-8"><h1 className="text-2xl font-bold">Gestão de Empresas em desenvolvimento</h1></div>} />
                <Route path="/admin/analytics" element={<div className="p-8"><h1 className="text-2xl font-bold">Analytics em desenvolvimento</h1></div>} />
                <Route path="/admin/permissoes" element={<div className="p-8"><h1 className="text-2xl font-bold">Gestão de Permissões em desenvolvimento</h1></div>} />
                <Route path="/admin/configuracoes" element={<div className="p-8"><h1 className="text-2xl font-bold">Configurações em desenvolvimento</h1></div>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </MainLayout>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
