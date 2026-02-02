import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTraining, Training } from "@/contexts/training-context";
import { useToast } from "@/hooks/use-toast";
import {
  ModernTrainingEditor,
  TrainingData,
  TrainingSection,
  ContentBlock,
} from "@/components/training/modern-training-editor";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface TrainingDB {
  id: string;
  titulo: string;
  descricao: string | null;
  categoria: string | null;
  nivel: string | null;
  duracao_minutos: number | null;
  obrigatorio: boolean | null;
  publicado: boolean | null;
  empresa_id: string | null;
  departamento_id: string | null;
  instrutor_id: string | null;
  thumbnail_url: string | null;
  criado_em: string | null;
  atualizado_em: string | null;
  conteudo_html: string | null;
}

// Função para converter texto markdown-like em seções
function parseTextToSections(texto: string): TrainingSection[] {
  if (!texto || texto.trim() === "") {
    return [
      {
        id: `section-${Date.now()}`,
        title: "Conteúdo Principal",
        blocks: [
          {
            id: `block-${Date.now()}`,
            type: "text",
            content: "",
            align: "left",
          },
        ],
      },
    ];
  }

  const sections: TrainingSection[] = [];
  const sectionParts = texto.split(/\n---\n/);

  sectionParts.forEach((part, sectionIndex) => {
    const lines = part.trim().split("\n");
    let sectionTitle = `Seção ${sectionIndex + 1}`;
    const blocks: ContentBlock[] = [];
    let currentTextContent = "";

    lines.forEach((line) => {
      const trimmedLine = line.trim();

      // Detectar título da seção (## Título)
      if (trimmedLine.startsWith("## ")) {
        if (currentTextContent.trim()) {
          blocks.push({
            id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: "text",
            content: currentTextContent.trim(),
            align: "left",
          });
          currentTextContent = "";
        }
        sectionTitle = trimmedLine.replace(/^## /, "");
        return;
      }

      // Detectar títulos (# ## ###)
      if (trimmedLine.startsWith("# ")) {
        if (currentTextContent.trim()) {
          blocks.push({
            id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: "text",
            content: currentTextContent.trim(),
            align: "left",
          });
          currentTextContent = "";
        }
        blocks.push({
          id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: "heading",
          level: 1,
          content: trimmedLine.replace(/^# /, ""),
          align: "left",
        });
        return;
      }

      if (trimmedLine.startsWith("### ")) {
        if (currentTextContent.trim()) {
          blocks.push({
            id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: "text",
            content: currentTextContent.trim(),
            align: "left",
          });
          currentTextContent = "";
        }
        blocks.push({
          id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: "heading",
          level: 3,
          content: trimmedLine.replace(/^### /, ""),
          align: "left",
        });
        return;
      }

      // Detectar imagem
      if (trimmedLine.startsWith("[Imagem:")) {
        if (currentTextContent.trim()) {
          blocks.push({
            id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: "text",
            content: currentTextContent.trim(),
            align: "left",
          });
          currentTextContent = "";
        }
        const url = trimmedLine.replace(/^\[Imagem: /, "").replace(/\]$/, "");
        blocks.push({
          id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: "image",
          content: "",
          mediaUrl: url,
          align: "center",
        });
        return;
      }

      // Detectar vídeo
      if (trimmedLine.startsWith("[Vídeo:")) {
        if (currentTextContent.trim()) {
          blocks.push({
            id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: "text",
            content: currentTextContent.trim(),
            align: "left",
          });
          currentTextContent = "";
        }
        const url = trimmedLine.replace(/^\[Vídeo: /, "").replace(/\]$/, "");
        blocks.push({
          id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: "video",
          content: "",
          mediaUrl: url,
          align: "center",
        });
        return;
      }

      // Detectar divisor
      if (trimmedLine === "---") {
        if (currentTextContent.trim()) {
          blocks.push({
            id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: "text",
            content: currentTextContent.trim(),
            align: "left",
          });
          currentTextContent = "";
        }
        blocks.push({
          id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: "divider",
          content: "",
        });
        return;
      }

      // Texto normal
      currentTextContent += (currentTextContent ? "\n" : "") + line;
    });

    // Adicionar texto restante
    if (currentTextContent.trim()) {
      blocks.push({
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "text",
        content: currentTextContent.trim(),
        align: "left",
      });
    }

    // Se não houver blocos, adicionar um vazio
    if (blocks.length === 0) {
      blocks.push({
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: "text",
        content: "",
        align: "left",
      });
    }

    sections.push({
      id: `section-${Date.now()}-${sectionIndex}`,
      title: sectionTitle,
      blocks,
    });
  });

  return sections.length > 0 ? sections : [
    {
      id: `section-${Date.now()}`,
      title: "Conteúdo Principal",
      blocks: [
        {
          id: `block-${Date.now()}`,
          type: "text",
          content: "",
          align: "left",
        },
      ],
    },
  ];
}

function formatDuration(minutes: number | null): string {
  if (!minutes) return "30min";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}min`;
  }
  return `${mins}min`;
}

export default function EditarTreinamentoModerno() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getTrainingById, updateTraining } = useTraining();
  const { toast } = useToast();
  const [training, setTraining] = useState<Training | null>(null);
  const [dbTraining, setDbTraining] = useState<TrainingDB | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFromDatabase, setIsFromDatabase] = useState(false);

  useEffect(() => {
    const loadTraining = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      // Primeiro, tentar buscar do contexto local (IDs numéricos)
      const numericId = parseInt(id);
      if (!isNaN(numericId)) {
        const found = getTrainingById(numericId);
        if (found) {
          setTraining(found);
          setIsFromDatabase(false);
          setLoading(false);
          return;
        }
      }

      // Se não encontrou no contexto, buscar do Supabase (UUID)
      try {
        const { data, error } = await supabase
          .from("treinamentos")
          .select("*, conteudo_html")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Erro ao buscar treinamento:", error);
          toast({
            title: "Treinamento não encontrado",
            description: "O treinamento solicitado não foi encontrado.",
            variant: "destructive",
          });
          navigate("/admin/treinamentos");
          return;
        }

        if (data) {
          setDbTraining(data);
          setIsFromDatabase(true);
        } else {
          toast({
            title: "Treinamento não encontrado",
            description: "O treinamento solicitado não foi encontrado.",
            variant: "destructive",
          });
          navigate("/admin/treinamentos");
        }
      } catch (error) {
        console.error("Erro:", error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao carregar o treinamento.",
          variant: "destructive",
        });
        navigate("/admin/treinamentos");
      } finally {
        setLoading(false);
      }
    };

    loadTraining();
  }, [id, getTrainingById, navigate, toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!training && !dbTraining) {
    return null;
  }

  // Dados iniciais baseados na fonte (contexto ou banco)
  // Usa conteudo_html se disponível, caso contrário usa descricao
  const initialData: Partial<TrainingData> = isFromDatabase && dbTraining
    ? {
        titulo: dbTraining.titulo,
        subtitulo: "",
        descricao: dbTraining.descricao || "",
        categoria: dbTraining.categoria || "Geral",
        duracao: formatDuration(dbTraining.duracao_minutos),
        status: dbTraining.publicado ? "ativo" : "rascunho",
        instrutor: "",
        departamento: "",
        empresa_id: dbTraining.empresa_id || "",
        capa: dbTraining.thumbnail_url || "",
        sections: parseTextToSections(dbTraining.conteudo_html || dbTraining.descricao || ""),
      }
    : training
    ? {
        titulo: training.titulo,
        subtitulo: training.subtitulo || "",
        descricao: training.descricao,
        categoria: training.categoria,
        duracao: training.duracao,
        status: training.status,
        instrutor: training.instrutor,
        departamento: training.departamento || "",
        capa: training.capa,
        sections: parseTextToSections(training.texto || ""),
      }
    : {};

  const handleSave = async (data: TrainingData) => {
    if (!data.titulo.trim()) {
      toast({
        title: "Campo obrigatório",
        description: "Preencha o título do treinamento.",
        variant: "destructive",
      });
      return;
    }

    // Converter seções em texto consolidado
    const textoConsolidado = data.sections
      .map((section) => {
        const sectionContent = section.blocks
          .map((block) => {
            switch (block.type) {
              case "heading":
                return `${"#".repeat(block.level || 2)} ${block.content}`;
              case "text":
              case "quote":
                return block.content;
              case "image":
                return block.mediaUrl ? `[Imagem: ${block.caption || block.mediaUrl}]` : "";
              case "video":
                return block.mediaUrl ? `[Vídeo: ${block.caption || block.mediaUrl}]` : "";
              case "list":
                return (block.listItems || []).map((item) => `• ${item}`).join("\n");
              case "checklist":
                return (block.checkItems || [])
                  .map((item) => `${item.checked ? "☑" : "☐"} ${item.text}`)
                  .join("\n");
              case "divider":
                return "---";
              default:
                return "";
            }
          })
          .filter(Boolean)
          .join("\n\n");

        return `## ${section.title}\n\n${sectionContent}`;
      })
      .join("\n\n---\n\n");

    // Extrair primeira imagem como capa se não tiver
    let capa = data.capa;
    if (!capa) {
      for (const section of data.sections) {
        const imageBlock = section.blocks.find((b) => b.type === "image" && b.mediaUrl);
        if (imageBlock?.mediaUrl) {
          capa = imageBlock.mediaUrl;
          break;
        }
      }
    }

    // Se é do banco de dados, salvar no Supabase
    if (isFromDatabase && dbTraining) {
      // Converter duração para minutos
      let duracaoMinutos = 30;
      const duracaoMatch = data.duracao.match(/(\d+)h?\s*(\d*)min?/);
      if (duracaoMatch) {
        const hours = parseInt(duracaoMatch[1]) || 0;
        const mins = parseInt(duracaoMatch[2]) || 0;
        if (data.duracao.includes("h")) {
          duracaoMinutos = hours * 60 + mins;
        } else {
          duracaoMinutos = hours || mins;
        }
      }

      const { error } = await supabase
        .from("treinamentos")
        .update({
          titulo: data.titulo,
          descricao: data.descricao || textoConsolidado.slice(0, 500),
          conteudo_html: textoConsolidado,
          categoria: data.categoria,
          duracao_minutos: duracaoMinutos,
          publicado: data.status === "ativo",
          thumbnail_url: capa || null,
          empresa_id: data.empresa_id || dbTraining.empresa_id,
          atualizado_em: new Date().toISOString(),
        })
        .eq("id", dbTraining.id);

      if (error) {
        console.error("Erro ao atualizar:", error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar as alterações.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Treinamento atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    } else if (training) {
      // Extrair primeiro vídeo
      let videoUrl = "";
      for (const section of data.sections) {
        const videoBlock = section.blocks.find((b) => b.type === "video" && b.mediaUrl);
        if (videoBlock?.mediaUrl) {
          videoUrl = videoBlock.mediaUrl;
          break;
        }
      }

      updateTraining(training.id, {
        titulo: data.titulo,
        subtitulo: data.subtitulo,
        descricao: data.descricao || textoConsolidado.slice(0, 200) + "...",
        texto: textoConsolidado,
        videoUrl,
        categoria: data.categoria,
        duracao: data.duracao,
        status: data.status,
        instrutor: data.instrutor,
        departamento: data.departamento,
        capa,
      });

      toast({
        title: "Treinamento atualizado",
        description: "As alterações foram salvas com sucesso.",
      });
    }

    navigate("/admin/treinamentos");
  };

  const handleCancel = () => {
    navigate("/admin/treinamentos");
  };

  return (
    <ModernTrainingEditor
      initialData={initialData}
      onSave={handleSave}
      onCancel={handleCancel}
      isEditing
    />
  );
}
