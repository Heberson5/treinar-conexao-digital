import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./auth-context";

interface Empresa {
  id: string;
  nome: string;
  cnpj?: string | null;
  ativo?: boolean | null;
}

interface EmpresaFilterContextType {
  empresas: Empresa[];
  empresaSelecionada: string | null;
  setEmpresaSelecionada: (id: string | null) => void;
  empresaSelecionadaNome: string;
  isLoading: boolean;
  isMaster: boolean;
}

const EmpresaFilterContext = createContext<EmpresaFilterContextType | undefined>(undefined);

export function EmpresaFilterProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isMaster = user?.role === "master";

  useEffect(() => {
    if (isMaster) {
      fetchEmpresas();
    } else {
      // Se não for master, usa a empresa do usuário
      if (user?.empresa_id) {
        setEmpresaSelecionada(user.empresa_id);
      }
      setIsLoading(false);
    }
  }, [user, isMaster]);

  const fetchEmpresas = async () => {
    try {
      const { data, error } = await supabase
        .from("empresas")
        .select("id, nome, cnpj, ativo")
        .eq("ativo", true)
        .order("nome");

      if (error) {
        console.error("Erro ao buscar empresas:", error);
        return;
      }

      setEmpresas(data || []);
      
      // Se tiver empresas e nenhuma selecionada, seleciona "todas"
      if (!empresaSelecionada && data && data.length > 0) {
        setEmpresaSelecionada(null); // null = todas as empresas
      }
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const empresaSelecionadaNome = empresaSelecionada 
    ? empresas.find(e => e.id === empresaSelecionada)?.nome || "Empresa"
    : "Todas as empresas";

  return (
    <EmpresaFilterContext.Provider value={{
      empresas,
      empresaSelecionada,
      setEmpresaSelecionada,
      empresaSelecionadaNome,
      isLoading,
      isMaster
    }}>
      {children}
    </EmpresaFilterContext.Provider>
  );
}

export function useEmpresaFilter() {
  const context = useContext(EmpresaFilterContext);
  if (context === undefined) {
    throw new Error("useEmpresaFilter deve ser usado dentro de um EmpresaFilterProvider");
  }
  return context;
}
