// Modal para edição completa dos dados da empresa
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Building2, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  validarCNPJ, 
  formatarCNPJ, 
  consultarCNPJ, 
  limparCNPJ,
  type DadosEmpresaCNPJ 
} from "@/lib/cnpj-utils";
import { supabase } from "@/integrations/supabase/client";

interface EmpresaDados {
  id: string;
  nome: string;
  nome_fantasia: string | null;
  razao_social: string | null;
  cnpj: string | null;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  responsavel: string | null;
  is_demo: boolean | null;
  demo_expires_at: string | null;
  ativo: boolean | null;
}

interface EmpresaDadosModalProps {
  empresa: EmpresaDados | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (empresa: EmpresaDados) => void;
}

export function EmpresaDadosModal({
  empresa,
  open,
  onOpenChange,
  onUpdate,
}: EmpresaDadosModalProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isConsultingCNPJ, setIsConsultingCNPJ] = useState(false);
  const [cnpjValid, setCnpjValid] = useState<boolean | null>(null);
  
  const [formData, setFormData] = useState({
    nome: "",
    nome_fantasia: "",
    razao_social: "",
    cnpj: "",
    email: "",
    telefone: "",
    endereco: "",
    responsavel: "",
  });

  useEffect(() => {
    if (empresa) {
      setFormData({
        nome: empresa.nome || "",
        nome_fantasia: empresa.nome_fantasia || "",
        razao_social: empresa.razao_social || "",
        cnpj: empresa.cnpj || "",
        email: empresa.email || "",
        telefone: empresa.telefone || "",
        endereco: empresa.endereco || "",
        responsavel: empresa.responsavel || "",
      });
      // Validar CNPJ inicial
      if (empresa.cnpj) {
        setCnpjValid(validarCNPJ(empresa.cnpj));
      }
    }
  }, [empresa]);

  if (!empresa) return null;

  const handleCNPJChange = (value: string) => {
    const formatted = formatarCNPJ(value);
    setFormData(prev => ({ ...prev, cnpj: formatted }));
    
    const limpo = limparCNPJ(value);
    if (limpo.length === 14) {
      setCnpjValid(validarCNPJ(limpo));
    } else {
      setCnpjValid(null);
    }
  };

  const handleConsultarCNPJ = async () => {
    if (!formData.cnpj || !validarCNPJ(formData.cnpj)) {
      toast({
        title: "CNPJ inválido",
        description: "Digite um CNPJ válido para consultar",
        variant: "destructive",
      });
      return;
    }

    setIsConsultingCNPJ(true);
    try {
      const dados = await consultarCNPJ(formData.cnpj);
      if (dados) {
        setFormData(prev => ({
          ...prev,
          razao_social: dados.razaoSocial,
          nome_fantasia: dados.nomeFantasia || prev.nome_fantasia,
          nome: dados.nomeFantasia || prev.nome,
          email: dados.email || prev.email,
          telefone: dados.telefone || prev.telefone,
          endereco: `${dados.logradouro}, ${dados.numero}${dados.complemento ? ' - ' + dados.complemento : ''} - ${dados.bairro}, ${dados.municipio}/${dados.uf} - CEP: ${dados.cep}`,
        }));
        toast({
          title: "Dados carregados",
          description: "As informações da empresa foram preenchidas automaticamente",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao consultar CNPJ",
        description: error instanceof Error ? error.message : "Tente novamente mais tarde",
        variant: "destructive",
      });
    } finally {
      setIsConsultingCNPJ(false);
    }
  };

  const handleSave = async () => {
    if (!formData.nome.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "O nome da empresa é obrigatório",
        variant: "destructive",
      });
      return;
    }

    if (formData.cnpj && !validarCNPJ(formData.cnpj)) {
      toast({
        title: "CNPJ inválido",
        description: "O CNPJ informado não é válido",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("empresas")
        .update({
          nome: formData.nome.trim(),
          nome_fantasia: formData.nome_fantasia.trim() || null,
          razao_social: formData.razao_social.trim() || null,
          cnpj: formData.cnpj ? limparCNPJ(formData.cnpj) : null,
          email: formData.email.trim() || null,
          telefone: formData.telefone.trim() || null,
          endereco: formData.endereco.trim() || null,
          responsavel: formData.responsavel.trim() || null,
        })
        .eq("id", empresa.id);

      if (error) throw error;

      onUpdate({
        ...empresa,
        nome: formData.nome.trim(),
        nome_fantasia: formData.nome_fantasia.trim() || null,
        razao_social: formData.razao_social.trim() || null,
        cnpj: formData.cnpj ? formatarCNPJ(formData.cnpj) : null,
        email: formData.email.trim() || null,
        telefone: formData.telefone.trim() || null,
        endereco: formData.endereco.trim() || null,
        responsavel: formData.responsavel.trim() || null,
      });

      toast({
        title: "Dados salvos",
        description: "As informações da empresa foram atualizadas",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Editar Dados da Empresa</DialogTitle>
              <DialogDescription>
                Atualize as informações cadastrais da empresa
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* CNPJ com consulta */}
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  onChange={(e) => handleCNPJChange(e.target.value)}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                  className="pr-10"
                />
                {cnpjValid !== null && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {cnpjValid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleConsultarCNPJ}
                disabled={isConsultingCNPJ || !cnpjValid}
              >
                {isConsultingCNPJ ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="ml-2">Consultar</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Digite o CNPJ e clique em "Consultar" para preencher os dados automaticamente
            </p>
          </div>

          {/* Nome e Nome Fantasia */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                placeholder="Nome da empresa"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nome_fantasia">Nome Fantasia</Label>
              <Input
                id="nome_fantasia"
                value={formData.nome_fantasia}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_fantasia: e.target.value }))}
                placeholder="Nome fantasia"
              />
            </div>
          </div>

          {/* Razão Social */}
          <div className="space-y-2">
            <Label htmlFor="razao_social">Razão Social</Label>
            <Input
              id="razao_social"
              value={formData.razao_social}
              onChange={(e) => setFormData(prev => ({ ...prev, razao_social: e.target.value }))}
              placeholder="Razão social completa"
            />
          </div>

          {/* Email e Telefone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="contato@empresa.com.br"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                placeholder="(00) 0000-0000"
              />
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-2">
            <Label htmlFor="endereco">Endereço</Label>
            <Textarea
              id="endereco"
              value={formData.endereco}
              onChange={(e) => setFormData(prev => ({ ...prev, endereco: e.target.value }))}
              placeholder="Endereço completo"
              rows={2}
            />
          </div>

          {/* Responsável */}
          <div className="space-y-2">
            <Label htmlFor="responsavel">Responsável</Label>
            <Input
              id="responsavel"
              value={formData.responsavel}
              onChange={(e) => setFormData(prev => ({ ...prev, responsavel: e.target.value }))}
              placeholder="Nome do responsável"
            />
          </div>

          {/* Indicadores de status */}
          {(empresa.is_demo || !empresa.ativo) && (
            <div className="flex gap-2">
              {empresa.is_demo && (
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  Demonstração
                </Badge>
              )}
              {!empresa.ativo && (
                <Badge variant="secondary">Inativa</Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar alterações"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
