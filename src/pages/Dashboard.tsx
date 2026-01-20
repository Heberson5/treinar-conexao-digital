import { useState, useMemo, useEffect } from "react";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval, parseISO, subDays } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart3, 
  BookOpen, 
  Clock, 
  TrendingUp, 
  Users, 
  Award,
  PlayCircle,
  Calendar,
  Target,
  Building2,
  Loader2
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useEmpresaFilter } from "@/contexts/empresa-filter-context";
import { supabase } from "@/integrations/supabase/client";

interface DashboardFiltersState {
  period: "today" | "week" | "month" | "all";
  departmentId: string;
}

interface DashboardStats {
  totalTreinamentos: number;
  treinamentosAtivos: number;
  totalParticipantes: number;
  taxaConclusao: number;
  horasTreinamento: number;
  certificadosEmitidos: number;
}

interface TrainingData {
  id: string;
  titulo: string;
  categoria: string | null;
  participantes: number;
  conclusoes: number;
  taxa: number;
  departamento: string | null;
}

interface ActivityData {
  id: string;
  tipo: string;
  descricao: string;
  criado_em: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { empresaSelecionada, isMaster } = useEmpresaFilter();
  
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalTreinamentos: 0,
    treinamentosAtivos: 0,
    totalParticipantes: 0,
    taxaConclusao: 0,
    horasTreinamento: 0,
    certificadosEmitidos: 0
  });
  const [trainings, setTrainings] = useState<TrainingData[]>([]);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  
  const [filters, setFilters] = useState<DashboardFiltersState>({
    period: "month",
    departmentId: "",
  });

  // Buscar dados do dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Definir período de filtro
        const now = new Date();
        let startDate: Date | undefined;
        let endDate: Date | undefined;
        
        switch (filters.period) {
          case "today":
            startDate = startOfDay(now);
            endDate = endOfDay(now);
            break;
          case "week":
            startDate = startOfWeek(now, { weekStartsOn: 0 });
            endDate = endOfWeek(now, { weekStartsOn: 0 });
            break;
          case "month":
            startDate = startOfMonth(now);
            endDate = endOfMonth(now);
            break;
          default:
            startDate = subDays(now, 365);
            endDate = now;
        }

        // Buscar treinamentos
        let treinamentosQuery = supabase
          .from("treinamentos")
          .select("*")
          .eq("publicado", true);
        
        // Filtro por empresa
        if (isMaster && empresaSelecionada) {
          treinamentosQuery = treinamentosQuery.eq("empresa_id", empresaSelecionada);
        } else if (!isMaster && user?.empresa_id) {
          treinamentosQuery = treinamentosQuery.eq("empresa_id", user.empresa_id);
        }

        // Filtro por departamento
        if (filters.departmentId) {
          treinamentosQuery = treinamentosQuery.eq("departamento_id", filters.departmentId);
        }

        const { data: treinamentosData, error: treinamentosError } = await treinamentosQuery;
        
        if (treinamentosError) {
          console.error("Erro ao buscar treinamentos:", treinamentosError);
        }

        // Buscar progresso dos treinamentos
        let progressoQuery = supabase
          .from("progresso_treinamentos")
          .select("*");

        if (treinamentosData && treinamentosData.length > 0) {
          progressoQuery = progressoQuery.in("treinamento_id", treinamentosData.map(t => t.id));
        }

        const { data: progressoData, error: progressoError } = await progressoQuery;
        
        if (progressoError) {
          console.error("Erro ao buscar progresso:", progressoError);
        }

        // Buscar atividades recentes
        let atividadesQuery = supabase
          .from("atividades")
          .select("*")
          .order("criado_em", { ascending: false })
          .limit(10);

        const { data: atividadesData, error: atividadesError } = await atividadesQuery;
        
        if (atividadesError) {
          console.error("Erro ao buscar atividades:", atividadesError);
        }

        // Calcular estatísticas
        const totalTreinamentos = treinamentosData?.length || 0;
        const treinamentosAtivos = treinamentosData?.filter(t => t.publicado).length || 0;
        
        // Agrupar progresso por treinamento
        const progressoPorTreinamento = (progressoData || []).reduce((acc, p) => {
          if (!acc[p.treinamento_id]) {
            acc[p.treinamento_id] = [];
          }
          acc[p.treinamento_id].push(p);
          return acc;
        }, {} as Record<string, any[]>);

        // Calcular participantes únicos
        const participantesUnicos = new Set((progressoData || []).map(p => p.usuario_id));
        const totalParticipantes = participantesUnicos.size;

        // Calcular conclusões
        const conclusoes = (progressoData || []).filter(p => p.concluido).length;
        const totalProgressos = (progressoData || []).length;
        const taxaConclusao = totalProgressos > 0 ? Math.round((conclusoes / totalProgressos) * 100) : 0;

        // Calcular horas
        const horasTreinamento = (progressoData || []).reduce((acc, p) => acc + (p.tempo_assistido_minutos || 0), 0);

        // Preparar dados de treinamentos para exibição
        const treinamentosComStats: TrainingData[] = (treinamentosData || []).map(t => {
          const progressos = progressoPorTreinamento[t.id] || [];
          const participantes = progressos.length;
          const conclusoesTreinamento = progressos.filter(p => p.concluido).length;
          const taxa = participantes > 0 ? Math.round((conclusoesTreinamento / participantes) * 100) : 0;
          
          return {
            id: t.id,
            titulo: t.titulo,
            categoria: t.categoria,
            participantes,
            conclusoes: conclusoesTreinamento,
            taxa,
            departamento: t.departamento_id
          };
        });

        setStats({
          totalTreinamentos,
          treinamentosAtivos,
          totalParticipantes,
          taxaConclusao,
          horasTreinamento: Math.round(horasTreinamento / 60), // Converter para horas
          certificadosEmitidos: conclusoes
        });

        setTrainings(treinamentosComStats.slice(0, 5));
        setActivities(atividadesData || []);

      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, empresaSelecionada, isMaster, filters]);

  const getDashboardTitle = () => {
    if (isMaster) {
      return empresaSelecionada ? "Dashboard - Empresa Selecionada" : "Dashboard Geral";
    }
    return "Dashboard";
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "login": return "bg-primary";
      case "treinamento_iniciado": return "bg-blue-500";
      case "treinamento_concluido": return "bg-green-500";
      case "certificado_emitido": return "bg-amber-500";
      default: return "bg-muted-foreground";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "treinamento_concluido": return "Concluído";
      case "treinamento_iniciado": return "Iniciado";
      case "certificado_emitido": return "Certificado";
      default: return "Atividade";
    }
  };

  const statCards = [
    {
      title: "Treinamentos Ativos",
      value: stats.treinamentosAtivos.toString(),
      subtitle: `${stats.totalTreinamentos} total`,
      icon: BookOpen,
      color: "text-blue-600"
    },
    {
      title: "Participantes",
      value: stats.totalParticipantes.toLocaleString("pt-BR"),
      subtitle: `${stats.treinamentosAtivos} treinamentos`,
      icon: Users,
      color: "text-green-600"
    },
    {
      title: "Taxa de Conclusão",
      value: `${stats.taxaConclusao}%`,
      subtitle: `${stats.certificadosEmitidos} concluídos`,
      icon: Target,
      color: "text-purple-600"
    },
    {
      title: "Horas de Treinamento",
      value: stats.horasTreinamento.toLocaleString("pt-BR"),
      subtitle: "horas registradas",
      icon: Clock,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{getDashboardTitle()}</h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe o desempenho e progresso dos treinamentos
          </p>
        </div>
        
        {/* Filtros simples */}
        <div className="flex gap-2">
          <Select 
            value={filters.period} 
            onValueChange={(value) => setFilters(prev => ({ ...prev, period: value as any }))}
          >
            <SelectTrigger className="w-[150px]">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
              <SelectItem value="all">Todos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.subtitle}
                  </p>
                </>
              )}
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
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {trainings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhum treinamento encontrado</p>
                  </div>
                ) : (
                  trainings.map((training) => (
                    <div key={training.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{training.titulo}</h4>
                          <Badge variant="secondary">
                            {training.categoria || "Geral"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {training.participantes} participantes • {training.conclusoes} conclusões
                        </p>
                        <div className="flex items-center gap-2">
                          <Progress value={training.taxa} className="flex-1" />
                          <span className="text-sm font-medium">{training.taxa}%</span>
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
            )}
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
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <div className="space-y-4">
                {activities.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nenhuma atividade recente</p>
                  </div>
                ) : (
                  activities.slice(0, 8).map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3">
                      <div className={`w-2 h-2 ${getActivityColor(activity.tipo)} rounded-full mt-2`}></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{getActivityIcon(activity.tipo)}</p>
                        <p className="text-xs text-muted-foreground">{activity.descricao}</p>
                        <p className="text-xs text-muted-foreground">
                          {activity.criado_em ? new Date(activity.criado_em).toLocaleString("pt-BR") : ""}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Progresso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Resumo de Performance
          </CardTitle>
          <CardDescription>
            Visão geral das métricas de treinamento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Award className="h-8 w-8 mx-auto mb-2 text-amber-500" />
              <p className="text-2xl font-bold">{stats.certificadosEmitidos}</p>
              <p className="text-sm text-muted-foreground">Certificados Emitidos</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{stats.taxaConclusao}%</p>
              <p className="text-sm text-muted-foreground">Taxa de Sucesso</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{stats.totalParticipantes}</p>
              <p className="text-sm text-muted-foreground">Usuários Ativos</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Clock className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <p className="text-2xl font-bold">{stats.horasTreinamento}h</p>
              <p className="text-sm text-muted-foreground">Tempo Total</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
