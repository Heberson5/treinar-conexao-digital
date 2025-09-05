import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTraining } from "@/contexts/training-context";
import { TrainingBlocks, type TrainingBlock } from "@/components/training/training-blocks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useBrazilianDate } from "@/hooks/use-brazilian-date";
import {
  ArrowLeft,
  Clock,
  User,
  Award,
  BookOpen,
  Target,
  Calendar,
  CheckCircle2,
  X
} from "lucide-react";

export default function TrainingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTrainingById, addAuditLog, updateTraining } = useTraining();
  const { formatDate, formatLastAccessed } = useBrazilianDate();
  
  const [training, setTraining] = useState<any>(null);
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    if (id) {
      const trainingData = getTrainingById(parseInt(id));
      if (trainingData) {
        setTraining(trainingData);
        setCurrentProgress(trainingData.progress || 0);
        
        // Registrar acesso ao treinamento
        addAuditLog(trainingData.id, {
          action: "accessed",
          description: "Usuário acessou a página de estudo do treinamento",
          details: {
            currentProgress: trainingData.progress || 0,
            accessedAt: new Date().toISOString()
          },
          userId: "user-1",
          userName: "Usuário Atual"
        });
      } else {
        toast.error("Treinamento não encontrado");
        navigate("/meus-treinamentos");
      }
    }
  }, [id, getTrainingById, addAuditLog, navigate]);

  // Criar blocos de exemplo baseados no conteúdo do treinamento
  const generateTrainingBlocks = (training: any): TrainingBlock[] => {
    const blocks: TrainingBlock[] = [
      {
        id: "intro",
        type: "text",
        title: "Introdução ao Treinamento",
        content: `
          <h3>Bem-vindo ao ${training.titulo}</h3>
          <p><strong>Instrutor:</strong> ${training.instrutor}</p>
          <p><strong>Duração estimada:</strong> ${training.duracao}</p>
          <p><strong>Categoria:</strong> ${training.categoria}</p>
          <br>
          <p>${training.descricao}</p>
          <br>
          <h4>Objetivos do Treinamento:</h4>
          <ul>
            <li>Compreender os conceitos fundamentais</li>
            <li>Aplicar conhecimentos práticos</li>
            <li>Desenvolver competências essenciais</li>
            <li>Obter certificação ao final</li>
          </ul>
        `,
        order: 1,
        duration: "10 min"
      },
      {
        id: "content-1",
        type: "text",
        title: "Conteúdo Principal",
        content: training.texto || `
          <h3>Módulo 1: Fundamentos</h3>
          <p>Este módulo aborda os conceitos fundamentais necessários para compreender o tema do treinamento.</p>
          
          <h4>Tópicos Abordados:</h4>
          <ul>
            <li>Conceitos básicos e definições</li>
            <li>Princípios fundamentais</li>
            <li>Melhores práticas da área</li>
            <li>Casos de estudo práticos</li>
          </ul>
          
          <p>É importante que você leia com atenção e faça anotações dos pontos mais relevantes para sua atividade profissional.</p>
          
          <blockquote style="border-left: 4px solid hsl(var(--primary)); padding-left: 16px; margin: 16px 0; font-style: italic;">
            "O conhecimento é um investimento que sempre oferece os melhores retornos." - Benjamin Franklin
          </blockquote>
        `,
        order: 2,
        duration: "25 min"
      }
    ];

    // Adicionar bloco de vídeo se existir
    if (training.videoUrl) {
      blocks.push({
        id: "video-1",
        type: "video",
        title: "Vídeo Explicativo",
        content: training.videoUrl,
        order: 3,
        duration: "15 min"
      });
    }

    // Adicionar exercício prático
    blocks.push({
      id: "quiz-1",
      type: "quiz",
      title: "Exercício de Fixação",
      content: "Teste seus conhecimentos sobre o conteúdo estudado até agora.",
      order: 4,
      duration: "10 min"
    });

    // Adicionar conclusão
    blocks.push({
      id: "conclusion",
      type: "text",
      title: "Conclusão e Próximos Passos",
      content: `
        <h3>Parabéns por concluir este treinamento!</h3>
        <p>Você chegou ao final do treinamento <strong>${training.titulo}</strong>. Esperamos que o conteúdo tenha sido útil e aplicável em sua rotina de trabalho.</p>
        
        <h4>O que você aprendeu:</h4>
        <ul>
          <li>✅ Conceitos fundamentais da área</li>
          <li>✅ Melhores práticas e metodologias</li>
          <li>✅ Aplicação prática dos conhecimentos</li>
          <li>✅ Exercícios de fixação</li>
        </ul>
        
        <h4>Próximos Passos:</h4>
        <p>1. <strong>Aplique o conhecimento:</strong> Utilize o que aprendeu em sua rotina de trabalho</p>
        <p>2. <strong>Compartilhe:</strong> Divida os conhecimentos com sua equipe</p>
        <p>3. <strong>Continue aprendendo:</strong> Explore outros treinamentos relacionados</p>
        <p>4. <strong>Feedback:</strong> Avalie este treinamento para nos ajudar a melhorar</p>
        
        <div style="text-align: center; margin-top: 24px; padding: 16px; background: hsl(var(--success) / 0.1); border-radius: 8px;">
          <h4 style="color: hsl(var(--success)); margin-bottom: 8px;">🏆 Certificado Disponível</h4>
          <p>Seu certificado de conclusão já está disponível para download!</p>
        </div>
      `,
      order: 5,
      duration: "5 min"
    });

    return blocks;
  };

  const handleBlockComplete = (blockId: string) => {
    // Lógica para marcar bloco como concluído
    toast.success("Bloco concluído com sucesso!");
  };

  const handleProgressUpdate = (progress: number) => {
    setCurrentProgress(progress);
    
    // Atualizar progresso no treinamento
    if (training) {
      const isCompleted = progress >= 100;
      
      updateTraining(training.id, {
        progress: Math.round(progress),
        completed: isCompleted,
        lastAccessed: new Date().toISOString()
      });

      // Adicionar log de progresso
      addAuditLog(training.id, {
        action: isCompleted ? "completed" : "accessed",
        description: isCompleted 
          ? "Treinamento concluído com sucesso" 
          : `Progresso atualizado para ${Math.round(progress)}%`,
        details: {
          progress: Math.round(progress),
          completed: isCompleted,
          timestamp: new Date().toISOString()
        },
        userId: "user-1",
        userName: "Usuário Atual"
      });

      if (isCompleted) {
        toast.success("🎉 Parabéns! Você concluiu o treinamento!", {
          description: "Seu certificado já está disponível para download."
        });
      }
    }
  };

  const handleExit = () => {
    if (currentProgress > (training?.progress || 0)) {
      toast.success("Progresso salvo com sucesso!");
    }
    navigate("/meus-treinamentos");
  };

  if (!training) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando treinamento...</p>
        </div>
      </div>
    );
  }

  const trainingBlocks = generateTrainingBlocks(training);
  const completedBlocks = Math.floor((currentProgress / 100) * trainingBlocks.length);

  return (
    <div className="min-h-screen bg-background">
      {/* Header fixo */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleExit}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Sair do Treinamento
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div>
              <h1 className="font-semibold text-lg">{training.titulo}</h1>
              <p className="text-sm text-muted-foreground">{training.subtitulo}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <p className="font-medium">{Math.round(currentProgress)}% concluído</p>
              <p className="text-muted-foreground">
                {completedBlocks} de {trainingBlocks.length} blocos
              </p>
            </div>
            <div className="w-32">
              <Progress value={currentProgress} />
            </div>
            <Button variant="outline" size="sm" onClick={handleExit}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="container mx-auto px-4 py-6">
        {/* Informações do treinamento */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Informações do Treinamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Instrutor</p>
                  <p className="text-muted-foreground">{training.instrutor}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Duração</p>
                  <p className="text-muted-foreground">{training.duracao}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Último Acesso</p>
                  <p className="text-muted-foreground">
                    {formatLastAccessed(training.lastAccessed)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Categoria</p>
                  <Badge variant="secondary">{training.categoria}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Blocos do treinamento */}
        <TrainingBlocks
          blocks={trainingBlocks}
          onBlockComplete={handleBlockComplete}
          onProgressUpdate={handleProgressUpdate}
        />

        {/* Ações de finalização */}
        {currentProgress >= 100 && (
          <Card className="mt-6 border-success">
            <CardContent className="p-6 text-center">
              <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Treinamento Concluído!</h3>
              <p className="text-muted-foreground mb-4">
                Parabéns por concluir o treinamento. Seu certificado está disponível.
              </p>
              <div className="flex justify-center gap-4">
                <Button>
                  <Award className="h-4 w-4 mr-2" />
                  Baixar Certificado
                </Button>
                <Button variant="outline" onClick={handleExit}>
                  Voltar aos Treinamentos
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}