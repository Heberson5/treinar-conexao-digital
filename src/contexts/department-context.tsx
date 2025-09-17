import { createContext, useContext, useState, ReactNode } from "react";

export interface Department {
  id: number;
  nome: string;
  descricao: string;
  responsavel: string;
  ativo: boolean;
}

interface DepartmentContextType {
  departments: Department[];
  getDepartmentById: (id: number) => Department | undefined;
  getDepartmentByName: (name: string) => Department | undefined;
  getActiveDepartments: () => Department[];
}

const DepartmentContext = createContext<DepartmentContextType | undefined>(undefined);

const initialDepartments: Department[] = [
  { id: 1, nome: "TI", descricao: "Tecnologia da Informação", responsavel: "Heber Sohas", ativo: true },
  { id: 2, nome: "RH", descricao: "Recursos Humanos", responsavel: "Maria Silva", ativo: true },
  { id: 3, nome: "Vendas", descricao: "Equipe de Vendas", responsavel: "João Santos", ativo: true },
  { id: 4, nome: "Financeiro", descricao: "Setor Financeiro", responsavel: "Ana Costa", ativo: true },
  { id: 5, nome: "Marketing", descricao: "Marketing e Comunicação", responsavel: "Pedro Lima", ativo: true }
];

export function DepartmentProvider({ children }: { children: ReactNode }) {
  const [departments] = useState<Department[]>(initialDepartments);

  const getDepartmentById = (id: number) => {
    return departments.find(dept => dept.id === id);
  };

  const getDepartmentByName = (name: string) => {
    return departments.find(dept => dept.nome.toLowerCase() === name.toLowerCase());
  };

  const getActiveDepartments = () => {
    return departments.filter(dept => dept.ativo);
  };

  return (
    <DepartmentContext.Provider value={{
      departments,
      getDepartmentById,
      getDepartmentByName,
      getActiveDepartments
    }}>
      {children}
    </DepartmentContext.Provider>
  );
}

export function useDepartments() {
  const context = useContext(DepartmentContext);
  if (context === undefined) {
    throw new Error('useDepartments deve ser usado dentro de um DepartmentProvider');
  }
  return context;
}