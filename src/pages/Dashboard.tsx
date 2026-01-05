import { useState, useMemo } from "react";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Users, 
  Award,
  PlayCircle,
  Calendar,
  Target
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { DashboardFilters, DashboardFiltersState } from "@/components/dashboard/DashboardFilters";

// Dados mock com mais informações para filtragem
const allTrainings = [
  {
    id: 1,
    title: "Segurança no Trabalho",
    department: "Operações",
    departmentId: "1",
    progress: 85,
    status: "Em andamento",
    participants: 45,
    dueDate: "2026-01-05",
    companyId: "1",
    userId: "1",
    hoursSpent: 120
  },
  {
    id: 2,
    title: "Atendimento ao Cliente",
    department: "Vendas",
    departmentId: "3",
    progress: 100,
    status: "Concluído",
    participants: 32,
    dueDate: "2026-01-03",
    companyId: "1",
    userId: "2",
    hoursSpent: 80
  },
  {
    id: 3,
    title: "Gestão de Tempo",
    department: "Administrativo",
    departmentId: "4",
    progress: 45,
    status: "Em andamento",
    participants: 28,
    dueDate: "2026-01-10",
    companyId: "2",
    userId: "3",
    hoursSpent: 45
  },
  {
    id: 4,
    title: "Liderança Eficaz",
    department: "RH",
    departmentId: "2",
    progress: 60,
    status: "Em andamento",
    participants: 15,
    dueDate: "2026-01-08",
    companyId: "1",
    userId: "1",
    hoursSpent: 35
  },
  {
    id: 5,
    title: "Excel Avançado",
    department: "TI",
    departmentId: "1",
    progress: 100,
    status: "Concluído",
    participants: 50,
    dueDate: "2025-12-20",
    companyId: "2",
    userId: "3",
    hoursSpent: 100
  },
  {
    id: 6,
    title: "Comunicação Assertiva",
    department: "Marketing",
    departmentId: "5",
    progress: 30,
    status: "Em andamento",
    participants: 22,
    dueDate: "2026-01-15",
    companyId: "3",
    userId: "2",
    hoursSpent: 25
  }
];

const allActivities = [
  {
    id: 1,
    type: "user",
    title: "Novo usuário cadastrado",
    description: "João Silva se cadastrou no sistema",
    time: "Há 2 horas",
    date: "2026-01-05",
    companyId: "1",
    departmentId: "1"
  },
  {
    id: 2,
    type: "completed",
    title: "Treinamento concluído",
    description: '"Atendimento ao Cliente" foi finalizado',
    time: "Há 4 horas",
    date: "2026-01-05",
    companyId: "1",
    departmentId: "3"
  },
  {
    id: 3,
    type: "created",
    title: "Novo treinamento criado",
    description: '"Liderança Eficaz" foi adicionado ao catálogo',
    time: "Ontem",
    date: "2026-01-04",
    companyId: "2",
    departmentId: "2"
  },
  {
    id: 4,
    type: "user",
    title: "Usuário promovido",
    description: "Maria Santos foi promovida a instrutora",
    time: "Há 1 dia",
    date: "2026-01-04",
    companyId: "3",
    departmentId: "5"
  }
];

export default function Dashboard() {
  const { user } = useAuth();
  
  // Estado inicial dos filtros
  const [filters, setFilters] = useState<DashboardFiltersState>({
    period: "month",
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date()),
    departmentId: "",
    userId: "",
    companyId: "",
  });

  // Filtrar treinamentos baseado nos filtros selecionados
  const filteredTrainings = useMemo(() => {
    return allTrainings.filter((training) => {
      // Filtro por empresa
      if (filters.companyId && training.companyId !== filters.companyId) {
        return false;
      }
      
      // Filtro por departamento
      if (filters.departmentId && training.departmentId !== filters.departmentId) {
        return false;
      }
      
      // Filtro por usuário
      if (filters.userId && training.userId !== filters.userId) {
        return false;
      }
      
      // Filtro por período
      if (filters.startDate && filters.endDate) {
        const trainingDate = parseISO(training.dueDate);
        if (!isWithinInterval(trainingDate, { start: filters.startDate, end: filters.endDate })) {
          return false;
        }
      }
      
      return true;
    });
  }, [filters]);

  // Filtrar atividades baseado nos filtros selecionados
  const filteredActivities = useMemo(() => {
    return allActivities.filter((activity) => {
      // Filtro por empresa
      if (filters.companyId && activity.companyId !== filters.companyId) {
        return false;
      }
      
      // Filtro por departamento
      if (filters.departmentId && activity.departmentId !== filters.departmentId) {
        return false;
      }
      
      // Filtro por período
      if (filters.startDate && filters.endDate) {
        const activityDate = parseISO(activity.date);
        if (!isWithinInterval(activityDate, { start: filters.startDate, end: filters.endDate })) {
          return false;
        }
      }
      
      return true;
    });
  }, [filters]);

  // Calcular estatísticas baseadas nos dados filtrados
  const stats = useMemo(() => {
    const activeTrainings = filteredTrainings.filter(t => t.status === "Em andamento").length;
    const totalParticipants = filteredTrainings.reduce((sum, t) => sum + t.participants, 0);
    const completedTrainings = filteredTrainings.filter(t => t.status === "Concluído");
    const completionRate = filteredTrainings.length > 0 
      ? Math.round((completedTrainings.length / filteredTrainings.length) * 100) 
      : 0;
    const totalHours = filteredTrainings.reduce((sum, t) => sum + t.hoursSpent, 0);

    return [
      {
        title: "Treinamentos Ativos",
        value: activeTrainings.toString(),
        change: filteredTrainings.length > 0 ? `${filteredTrainings.length} total` : "0 total",
        icon: BookOpen,
        color: "text-blue-600"
      },
      {
        title: "Participantes", 
        value: totalParticipants.toLocaleString("pt-BR"),
        change: `${filteredTrainings.length} treinamentos`,
        icon: Users,
        color: "text-green-600"
      },
      {
        title: "Taxa de Conclusão",
        value: `${completionRate}%`,
        change: `${completedTrainings.length} concluídos`,
        icon: Target,
        color: "text-purple-600"
      },
      {
        title: "Horas de Treinamento",
        value: totalHours.toLocaleString("pt-BR"),
        change: "horas registradas",
        icon: Clock,
        color: "text-orange-600"
      }
    ];
  }, [filteredTrainings]);

  // Determinar título baseado no role
  const getDashboardTitle = () => {
    const role = user?.role?.toLowerCase();
    if (role === "master") {
      return filters.companyId 
        ? "Dashboard - Empresa Selecionada" 
        : "Dashboard - Todas as Empresas";
    }
    return "Dashboard";
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "user": return "bg-primary";
      case "completed": return "bg-green-500";
      case "created": return "bg-orange-500";
      default: return "bg-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{getDashboardTitle()}</h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe o desempenho e progresso dos treinamentos
        </p>
      </div>

      {/* Filtros */}
      <DashboardFilters filters={filters} onFiltersChange={setFilters} />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{stat.change}</span> desde o mês passado
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Treinamentos Recentes */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Treinamentos Recentes
            </CardTitle>
            <CardDescription>
              Acompanhe o progresso dos treinamentos em andamento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTrainings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhum treinamento encontrado para os filtros selecionados</p>
                </div>
              ) : (
                filteredTrainings.slice(0, 5).map((training) => (
                  <div key={training.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{training.title}</h4>
                        <Badge variant={training.status === "Concluído" ? "default" : "secondary"}>
                          {training.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {training.department} • {training.participants} participantes
                      </p>
                      <div className="flex items-center gap-2">
                        <Progress value={training.progress} className="flex-1" />
                        <span className="text-sm font-medium">{training.progress}%</span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Button variant="ghost" size="icon">
                        <PlayCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Atividades Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Atividades Recentes
            </CardTitle>
            <CardDescription>
              Últimas ações no sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredActivities.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma atividade encontrada</p>
                </div>
              ) : (
                filteredActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 ${getActivityColor(activity.type)} rounded-full mt-2`}></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Progresso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Progresso Mensal
          </CardTitle>
          <CardDescription>
            Evolução das métricas de treinamento nos últimos meses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border rounded-lg bg-muted/10">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Gráfico de progresso será implementado</p>
              <p className="text-sm text-muted-foreground">Integração com biblioteca de gráficos em desenvolvimento</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}