import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Training {
  id: number;
  titulo: string;
  subtitulo?: string;
  descricao: string;
  texto?: string;
  videoUrl?: string;
  categoria: string;
  duracao: string;
  status: "ativo" | "inativo" | "rascunho";
  participantes: number;
  criadoEm: string;
  instrutor: string;
  fotos: string[];
  arquivos: string[];
  capa?: string;
  // Campos para visualização do usuário
  progress?: number;
  rating?: number;
  deadline?: string;
  lastAccessed?: string;
  completed?: boolean;
}

interface TrainingContextType {
  trainings: Training[];
  createTraining: (training: Omit<Training, 'id' | 'participantes' | 'criadoEm' | 'fotos' | 'arquivos'>) => void;
  updateTraining: (id: number, training: Partial<Training>) => void;
  deleteTraining: (id: number) => void;
  getActiveTrainings: () => Training[];
  getTrainingById: (id: number) => Training | undefined;
}

const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

const initialTrainings: Training[] = [
  {
    id: 1,
    titulo: "Segurança no Trabalho - Módulo Básico",
    subtitulo: "Fundamentos da Segurança Ocupacional",
    descricao: "Aprenda os fundamentos da segurança ocupacional e prevenção de acidentes no ambiente de trabalho",
    texto: "Este treinamento aborda conceitos fundamentais...",
    videoUrl: "https://youtube.com/watch?v=exemplo",
    categoria: "Segurança",
    duracao: "2h 30min",
    status: "ativo",
    participantes: 45,
    criadoEm: "2024-01-15",
    instrutor: "Maria Silva",
    fotos: [],
    arquivos: [],
    progress: 85,
    rating: 4.8,
    deadline: "2024-02-15",
    lastAccessed: "Há 2 dias",
    completed: false
  },
  {
    id: 2,
    titulo: "Atendimento ao Cliente Excelente",
    descricao: "Técnicas avançadas para proporcionar uma experiência excepcional ao cliente",
    categoria: "Vendas",
    duracao: "1h 45min",
    status: "ativo",
    participantes: 32,
    criadoEm: "2024-01-10",
    instrutor: "João Santos",
    fotos: [],
    arquivos: [],
    progress: 100,
    rating: 4.9,
    deadline: "2024-01-30",
    lastAccessed: "Concluído",
    completed: true
  }
];

export function TrainingProvider({ children }: { children: ReactNode }) {
  const [trainings, setTrainings] = useState<Training[]>(() => {
    const saved = localStorage.getItem('training-portal-trainings');
    return saved ? JSON.parse(saved) : initialTrainings;
  });

  useEffect(() => {
    localStorage.setItem('training-portal-trainings', JSON.stringify(trainings));
  }, [trainings]);

  const createTraining = (trainingData: Omit<Training, 'id' | 'participantes' | 'criadoEm' | 'fotos' | 'arquivos'>) => {
    const newTraining: Training = {
      ...trainingData,
      id: Date.now(),
      participantes: 0,
      criadoEm: new Date().toISOString().split('T')[0],
      fotos: [],
      arquivos: [],
      // Inicializar campos para usuários apenas se o status for ativo
      ...(trainingData.status === 'ativo' && {
        progress: 0,
        rating: 0,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 dias
        lastAccessed: "Nunca acessado",
        completed: false
      })
    };

    setTrainings(prev => [...prev, newTraining]);
    return newTraining;
  };

  const updateTraining = (id: number, updateData: Partial<Training>) => {
    setTrainings(prev => prev.map(training => 
      training.id === id 
        ? { 
            ...training, 
            ...updateData,
            // Se status mudou para ativo e não tinha campos de usuário, adicionar
            ...(updateData.status === 'ativo' && !training.progress && {
              progress: 0,
              rating: 0,
              deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              lastAccessed: "Nunca acessado",
              completed: false
            })
          }
        : training
    ));
  };

  const deleteTraining = (id: number) => {
    setTrainings(prev => prev.filter(training => training.id !== id));
  };

  const getActiveTrainings = () => {
    return trainings.filter(training => training.status === 'ativo');
  };

  const getTrainingById = (id: number) => {
    return trainings.find(training => training.id === id);
  };

  return (
    <TrainingContext.Provider value={{
      trainings,
      createTraining,
      updateTraining,
      deleteTraining,
      getActiveTrainings,
      getTrainingById
    }}>
      {children}
    </TrainingContext.Provider>
  );
}

export function useTraining() {
  const context = useContext(TrainingContext);
  if (context === undefined) {
    throw new Error('useTraining deve ser usado dentro de um TrainingProvider');
  }
  return context;
}