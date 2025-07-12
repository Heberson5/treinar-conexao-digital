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

const EMAIL_HASH = "8b0d8e8c917a528bf82b6ccc700491eefba6b85a7b32ae6039b866410910b84b"
const PASSWORD_HASH = "97cbf42d84a09a02027288f4a94228fdda3737abb2299bfdb3310bea3cb40695"

async function hashString(str: string): Promise<string> {
  const buffer = new TextEncoder().encode(str)
  const digest = await crypto.subtle.digest("SHA-256", buffer)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

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

  const handleLogin = async (email: string, password: string) => {
    // Simulação de login - em produção conectaria com Supabase
    const emailHash = await hashString(email)
    const passwordHash = await hashString(password)

    if (emailHash === EMAIL_HASH && passwordHash === PASSWORD_HASH) {
      const userData = {
        email,
        name: "Heber Sohas",
        role: "Master"
      }

      setUser(userData)
      setIsAuthenticated(true)

      // Salvar sessão
      localStorage.setItem('training-portal-auth', JSON.stringify({
        user: userData,
        timestamp: Date.now()
      }))
    }
  }

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
