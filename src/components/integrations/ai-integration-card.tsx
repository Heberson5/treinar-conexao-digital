import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Sparkles, 
  Brain, 
  Zap, 
  Check, 
  X, 
  Lock,
  AlertCircle,
  Settings2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";

type ProvedorIA = "gemini" | "chatgpt" | "deepseek";

interface AIProviderOption {
  id: ProvedorIA;
  nome: string;
  descricao: string;
  icon: React.ReactNode;
  disponivel: boolean;
}

const provedoresIA: AIProviderOption[] = [
  {
    id: "gemini",
    nome: "Google Gemini",
    descricao: "IA do Google com alta capacidade de compreensão e geração de texto",
    icon: <Sparkles className="h-5 w-5" />,
    disponivel: true
  },
  {
    id: "chatgpt",
    nome: "ChatGPT",
    descricao: "IA da OpenAI conhecida pela qualidade das respostas",
    icon: <Brain className="h-5 w-5" />,
    disponivel: true
  },
  {
    id: "deepseek",
    nome: "DeepSeek",
    descricao: "IA alternativa com bom custo-benefício",
    icon: <Zap className="h-5 w-5" />,
    disponivel: true
  }
];

interface ConfiguracaoIA {
  id?: string;
  empresa_id: string;
  provedor_ia: ProvedorIA;
  habilitado: boolean;
}

export function AIIntegrationCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState<ConfiguracaoIA | null>(null);
  const [provedorSelecionado, setProvedorSelecionado] = useState<ProvedorIA>("gemini");
  const [habilitado, setHabilitado] = useState(true);
  const [planoPermiteIA, setPlanoPermiteIA] = useState(false);
  const [planoNome, setPlanoNome] = useState("");

  useEffect(() => {
    verificarPlanoEmpresa();
    carregarConfiguracao();
  }, [user]);

  const verificarPlanoEmpresa = async () => {
    if (!user?.empresa_id) return;

    try {
      // Buscar contrato ativo da empresa
      const { data: contrato, error } = await supabase
        .from("plano_contratos")
        .select("*")
        .eq("empresa_id", user.empresa_id)
        .eq("ativo", true)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao verificar plano:", error);
        return;
      }

      if (contrato) {
        setPlanoNome(contrato.nome_plano);
        // Premium e Enterprise têm acesso à IA
        const planosComIA = ["Premium", "Enterprise"];
        setPlanoPermiteIA(planosComIA.includes(contrato.nome_plano));
      }
    } catch (error) {
      console.error("Erro ao verificar plano:", error);
    }
  };

  const carregarConfiguracao = async () => {
    if (!user?.empresa_id) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("configuracoes_ia_empresa")
        .select("*")
        .eq("empresa_id", user.empresa_id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Erro ao carregar configuração:", error);
      }

      if (data) {
        setConfig(data as ConfiguracaoIA);
        setProvedorSelecionado(data.provedor_ia as ProvedorIA);
        setHabilitado(data.habilitado);
      }
    } catch (error) {
      console.error("Erro ao carregar configuração:", error);
    } finally {
      setLoading(false);
    }
  };

  const salvarConfiguracao = async () => {
    if (!user?.empresa_id) {
      toast({
        title: "Erro",
        description: "Você precisa estar vinculado a uma empresa para configurar a IA.",
        variant: "destructive"
      });
      return;
    }

    if (!planoPermiteIA) {
      toast({
        title: "Plano não permite IA",
        description: "Faça upgrade para o plano Premium ou Enterprise para usar recursos de IA.",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);

    try {
      if (config?.id) {
        // Atualizar configuração existente
        const { error } = await supabase
          .from("configuracoes_ia_empresa")
          .update({
            provedor_ia: provedorSelecionado,
            habilitado
          })
          .eq("id", config.id);

        if (error) throw error;
      } else {
        // Criar nova configuração
        const { error } = await supabase
          .from("configuracoes_ia_empresa")
          .insert({
            empresa_id: user.empresa_id,
            provedor_ia: provedorSelecionado,
            habilitado
          });

        if (error) throw error;
      }

      toast({
        title: "Configuração salva",
        description: "As configurações de IA foram atualizadas com sucesso."
      });

      await carregarConfiguracao();
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <CardTitle>Integração com IA</CardTitle>
                <CardDescription>
                  Configure o provedor de IA para recursos inteligentes como reescrita de textos
                </CardDescription>
              </div>
            </div>
            <Badge variant={planoPermiteIA ? "default" : "secondary"}>
              {planoPermiteIA ? (
                <>
                  <Check className="h-3 w-3 mr-1" />
                  Disponível
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3 mr-1" />
                  Bloqueado
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!planoPermiteIA && (
            <Alert variant="destructive">
              <Lock className="h-4 w-4" />
              <AlertDescription>
                <strong>Recurso bloqueado</strong> - A integração com IA está disponível apenas para os planos 
                <strong> Premium</strong> e <strong>Enterprise</strong>. 
                {planoNome && ` Seu plano atual: ${planoNome}.`}
              </AlertDescription>
            </Alert>
          )}

          {planoPermiteIA && (
            <>
              {/* Toggle de habilitação */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="text-base font-medium">Habilitar IA</Label>
                  <p className="text-sm text-muted-foreground">
                    Ative para usar recursos de IA no cadastro de treinamentos
                  </p>
                </div>
                <Switch
                  checked={habilitado}
                  onCheckedChange={setHabilitado}
                />
              </div>

              {/* Seleção de provedor */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-base font-medium">Provedor de IA</Label>
                </div>
                
                <RadioGroup
                  value={provedorSelecionado}
                  onValueChange={(value) => setProvedorSelecionado(value as ProvedorIA)}
                  className="grid gap-4"
                  disabled={!habilitado}
                >
                  {provedoresIA.map((provedor) => (
                    <div
                      key={provedor.id}
                      className={`flex items-center space-x-4 rounded-lg border p-4 transition-colors ${
                        provedorSelecionado === provedor.id 
                          ? "border-primary bg-primary/5" 
                          : "border-border"
                      } ${!habilitado ? "opacity-50" : ""}`}
                    >
                      <RadioGroupItem value={provedor.id} id={provedor.id} />
                      <div className="flex-1 flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          provedor.id === "gemini" ? "bg-blue-100 text-blue-600" :
                          provedor.id === "chatgpt" ? "bg-green-100 text-green-600" :
                          "bg-orange-100 text-orange-600"
                        }`}>
                          {provedor.icon}
                        </div>
                        <div className="flex-1">
                          <Label htmlFor={provedor.id} className="font-medium cursor-pointer">
                            {provedor.nome}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {provedor.descricao}
                          </p>
                        </div>
                        {provedor.disponivel ? (
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            <Check className="h-3 w-3 mr-1" />
                            Disponível
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground">
                            <X className="h-3 w-3 mr-1" />
                            Em breve
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Informações sobre uso */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  O recurso "Reescrever com IA" estará disponível no editor de treinamentos para 
                  Instrutores e Administradores. A IA ajuda a melhorar a clareza e legibilidade 
                  dos textos de treinamento.
                </AlertDescription>
              </Alert>

              {/* Botão salvar */}
              <div className="flex justify-end">
                <Button onClick={salvarConfiguracao} disabled={saving}>
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Salvar configurações
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Card de funcionalidades */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Funcionalidades de IA</CardTitle>
          <CardDescription>
            Recursos inteligentes disponíveis para sua empresa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Reescrever com IA</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Melhore a clareza e legibilidade dos textos de treinamento automaticamente
              </p>
              <Badge variant={planoPermiteIA && habilitado ? "default" : "secondary"} className="mt-2">
                {planoPermiteIA && habilitado ? "Ativo" : "Inativo"}
              </Badge>
            </div>
            
            <div className="p-4 border rounded-lg opacity-50">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Sugestões de Conteúdo</span>
                <Badge variant="outline" className="text-xs">Em breve</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Receba sugestões de melhorias e conteúdos complementares
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
