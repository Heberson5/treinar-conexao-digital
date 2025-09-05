import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface AuditLogEntry {
  id: string;
  action: "created" | "updated" | "started" | "paused" | "completed" | "accessed";
  timestamp: string;
  userId?: string;
  userName?: string;
  details: {
    [key: string]: any;
  };
  description: string;
}

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
  // Auditoria
  auditLog: AuditLogEntry[];
}

interface TrainingContextType {
  trainings: Training[];
  createTraining: (training: Omit<Training, 'id' | 'participantes' | 'criadoEm' | 'fotos' | 'arquivos' | 'auditLog'>) => void;
  updateTraining: (id: number, training: Partial<Training>) => void;
  deleteTraining: (id: number) => void;
  getActiveTrainings: () => Training[];
  getTrainingById: (id: number) => Training | undefined;
  startTraining: (id: number) => void;
  pauseTraining: (id: number) => void;
  completeTraining: (id: number) => void;
  accessTraining: (id: number) => void;
  addAuditLog: (trainingId: number, entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => void;
}

const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

const createAuditEntry = (
  action: AuditLogEntry['action'],
  description: string,
  details: any = {}
): Omit<AuditLogEntry, 'id' | 'timestamp'> => ({
  action,
  description,
  details,
  userId: "user-1", // Em um app real, viria do contexto de autenticação
  userName: "Usuário Atual"
});

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
    criadoEm: new Date('2024-01-15').toISOString(),
    instrutor: "Maria Silva",
    fotos: [],
    arquivos: [],
    progress: 85,
    rating: 4.8,
    deadline: new Date('2024-02-15').toISOString(),
    lastAccessed: "Há 2 dias",
    completed: false,
    auditLog: [
      {
        id: "log-1",
        action: "created",
        timestamp: new Date('2024-01-15T09:00:00Z').toISOString(),
        userId: "admin-1",
        userName: "Maria Silva",
        description: "Treinamento criado com status ativo",
        details: {
          status: "ativo",
          categoria: "Segurança",
          instrutor: "Maria Silva"
        }
      }
    ]
  },
  {
    id: 2,
    titulo: "Atendimento ao Cliente Excelente",
    descricao: "Técnicas avançadas para proporcionar uma experiência excepcional ao cliente",
    categoria: "Vendas",
    duracao: "1h 45min",
    status: "ativo",
    participantes: 32,
    criadoEm: new Date('2024-01-10').toISOString(),
    instrutor: "João Santos",
    fotos: [],
    arquivos: [],
    progress: 100,
    rating: 4.9,
    deadline: new Date('2024-01-30').toISOString(),
    lastAccessed: "Concluído",
    completed: true,
    auditLog: [
      {
        id: "log-2",
        action: "created",
        timestamp: new Date('2024-01-10T10:00:00Z').toISOString(),
        userId: "admin-1",
        userName: "João Santos",
        description: "Treinamento criado com status ativo",
        details: {
          status: "ativo",
          categoria: "Vendas",
          instrutor: "João Santos"
        }
      },
      {
        id: "log-3",
        action: "completed",
        timestamp: new Date('2024-01-30T15:30:00Z').toISOString(),
        userId: "user-1",
        userName: "Usuário Atual",
        description: "Treinamento concluído com sucesso",
        details: {
          progress: 100,
          completed: true
        }
      }
    ]
  }
];

export function TrainingProvider({ children }: { children: ReactNode }) {
  const [trainings, setTrainings] = useState<Training[]>(() => {
    const saved = localStorage.getItem('training-portal-trainings');
    if (saved) {
      const parsedTrainings = JSON.parse(saved);
      // Garantir que todos os treinamentos tenham auditLog como array
      return parsedTrainings.map((training: any) => ({
        ...training,
        auditLog: Array.isArray(training.auditLog) ? training.auditLog : []
      }));
    }
    return initialTrainings;
  });

  useEffect(() => {
    localStorage.setItem('training-portal-trainings', JSON.stringify(trainings));
  }, [trainings]);

  const createTraining = (trainingData: Omit<Training, 'id' | 'participantes' | 'criadoEm' | 'fotos' | 'arquivos' | 'auditLog'>) => {
    const now = new Date().toISOString();
    const newTraining: Training = {
      ...trainingData,
      id: Date.now(),
      participantes: 0,
      criadoEm: now,
      fotos: [],
      arquivos: [],
      auditLog: [
        {
          id: `log-${Date.now()}`,
          action: "created",
          timestamp: now,
          userId: "admin-1",
          userName: "Administrador",
          description: `Treinamento "${trainingData.titulo}" criado com status ${trainingData.status}`,
          details: {
            titulo: trainingData.titulo,
            categoria: trainingData.categoria,
            status: trainingData.status,
            instrutor: trainingData.instrutor,
            duracao: trainingData.duracao
          }
        }
      ],
      // Inicializar campos para usuários apenas se o status for ativo
      ...(trainingData.status === 'ativo' && {
        progress: 0,
        rating: 0,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastAccessed: "Nunca acessado",
        completed: false
      })
    };

    setTrainings(prev => [...prev, newTraining]);
    return newTraining;
  };

  const addAuditLog = (trainingId: number, entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const now = new Date().toISOString();
    const auditEntry: AuditLogEntry = {
      ...entry,
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: now
    };

    setTrainings(prev => prev.map(training => 
      training.id === trainingId 
        ? { 
            ...training, 
            auditLog: [...training.auditLog, auditEntry]
          }
        : training
    ));
  };

  const updateTraining = (id: number, updateData: Partial<Training>) => {
    setTrainings(prev => prev.map(training => {
      if (training.id === id) {
        const updatedTraining = { 
          ...training, 
          ...updateData,
          // Se status mudou para ativo e não tinha campos de usuário, adicionar
          ...(updateData.status === 'ativo' && !training.progress && {
            progress: 0,
            rating: 0,
            deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            lastAccessed: "Nunca acessado",
            completed: false
          })
        };

        // Adicionar log de auditoria para alterações
        const changedFields = Object.keys(updateData).filter(key => 
          training[key as keyof Training] !== updateData[key as keyof Training]
        );

        if (changedFields.length > 0) {
          const auditEntry = createAuditEntry(
            "updated",
            `Treinamento editado. Campos alterados: ${changedFields.join(', ')}`,
            {
              changedFields,
              oldValues: changedFields.reduce((acc, field) => ({
                ...acc,
                [field]: training[field as keyof Training]
              }), {}),
              newValues: changedFields.reduce((acc, field) => ({
                ...acc,
                [field]: updateData[field as keyof Training]
              }), {})
            }
          );

          updatedTraining.auditLog = [...training.auditLog, {
            ...auditEntry,
            id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString()
          }];
        }

        return updatedTraining;
      }
      return training;
    }));
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

  const startTraining = (id: number) => {
    const now = new Date().toISOString();
    setTrainings(prev => prev.map(training => 
      training.id === id 
        ? { 
            ...training, 
            progress: training.progress || 1,
            lastAccessed: now,
            auditLog: [...training.auditLog, {
              id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: now,
              ...createAuditEntry("started", "Treinamento iniciado pelo usuário", {
                previousProgress: training.progress || 0
              })
            }]
          }
        : training
    ));
  };

  const pauseTraining = (id: number) => {
    const now = new Date().toISOString();
    setTrainings(prev => prev.map(training => 
      training.id === id 
        ? { 
            ...training, 
            lastAccessed: now,
            auditLog: [...training.auditLog, {
              id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: now,
              ...createAuditEntry("paused", "Treinamento pausado pelo usuário", {
                currentProgress: training.progress || 0
              })
            }]
          }
        : training
    ));
  };

  const completeTraining = (id: number) => {
    const now = new Date().toISOString();
    setTrainings(prev => prev.map(training => 
      training.id === id 
        ? { 
            ...training, 
            progress: 100,
            completed: true,
            lastAccessed: now,
            auditLog: [...training.auditLog, {
              id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: now,
              ...createAuditEntry("completed", "Treinamento concluído com sucesso", {
                finalProgress: 100,
                completed: true
              })
            }]
          }
        : training
    ));
  };

  const accessTraining = (id: number) => {
    const now = new Date().toISOString();
    setTrainings(prev => prev.map(training => 
      training.id === id 
        ? { 
            ...training, 
            lastAccessed: now,
            auditLog: [...training.auditLog, {
              id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              timestamp: now,
              ...createAuditEntry("accessed", "Treinamento acessado pelo usuário", {
                currentProgress: training.progress || 0
              })
            }]
          }
        : training
    ));
  };

  return (
    <TrainingContext.Provider value={{
      trainings,
      createTraining,
      updateTraining,
      deleteTraining,
      getActiveTrainings,
      getTrainingById,
      startTraining,
      pauseTraining,
      completeTraining,
      accessTraining,
      addAuditLog
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