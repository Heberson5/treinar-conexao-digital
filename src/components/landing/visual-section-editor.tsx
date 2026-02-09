import { useState, useCallback } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  GripVertical,
  Trash2,
  Plus,
  Type,
  Image,
  BarChart3,
  Layout,
  Sparkles,
} from "lucide-react"

export type SectionType = "hero" | "stats" | "features" | "trainings" | "pricing" | "cta" | "custom-text" | "custom-image"

export interface LandingSection {
  id: string
  type: SectionType
  visible: boolean
  data: Record<string, any>
}

interface VisualSectionEditorProps {
  sections: LandingSection[]
  onSectionsChange: (sections: LandingSection[]) => void
  selectedSectionId: string | null
  onSelectSection: (id: string | null) => void
}

const SECTION_LABELS: Record<SectionType, { label: string; icon: React.ElementType }> = {
  "hero": { label: "Hero", icon: Layout },
  "stats": { label: "Estatísticas", icon: BarChart3 },
  "features": { label: "Recursos", icon: Sparkles },
  "trainings": { label: "Treinamentos", icon: Layout },
  "pricing": { label: "Planos", icon: Layout },
  "cta": { label: "CTA Final", icon: Type },
  "custom-text": { label: "Texto Personalizado", icon: Type },
  "custom-image": { label: "Imagem", icon: Image },
}

export function VisualSectionEditor({
  sections,
  onSectionsChange,
  selectedSectionId,
  onSelectSection,
}: VisualSectionEditorProps) {
  const handleDragEnd = useCallback(
    (result: DropResult) => {
      if (!result.destination) return
      const items = Array.from(sections)
      const [reordered] = items.splice(result.source.index, 1)
      items.splice(result.destination.index, 0, reordered)
      onSectionsChange(items)
    },
    [sections, onSectionsChange]
  )

  const toggleVisibility = (id: string) => {
    onSectionsChange(
      sections.map((s) => (s.id === id ? { ...s, visible: !s.visible } : s))
    )
  }

  const removeSection = (id: string) => {
    onSectionsChange(sections.filter((s) => s.id !== id))
    if (selectedSectionId === id) onSelectSection(null)
  }

  const addSection = (type: SectionType) => {
    const newSection: LandingSection = {
      id: `section-${Date.now()}`,
      type,
      visible: true,
      data: getDefaultSectionData(type),
    }
    onSectionsChange([...sections, newSection])
    onSelectSection(newSection.id)
  }

  return (
    <div className="space-y-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
              {sections.map((section, index) => {
                const config = SECTION_LABELS[section.type]
                const Icon = config?.icon || Layout
                return (
                  <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-lg border bg-card transition-all cursor-pointer",
                          selectedSectionId === section.id && "ring-2 ring-primary border-primary",
                          snapshot.isDragging && "shadow-lg",
                          !section.visible && "opacity-50"
                        )}
                        onClick={() => onSelectSection(section.id)}
                      >
                        <div {...provided.dragHandleProps} className="cursor-grab">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <Icon className="h-4 w-4 text-primary" />
                        <span className="flex-1 text-sm font-medium">
                          {config?.label || section.type}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleVisibility(section.id)
                          }}
                        >
                          {section.visible ? "👁" : "🙈"}
                        </Button>
                        {!["hero", "pricing"].includes(section.type) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeSection(section.id)
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    )}
                  </Draggable>
                )
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="border-t pt-4">
        <p className="text-xs text-muted-foreground mb-2">Adicionar seção</p>
        <div className="grid grid-cols-2 gap-2">
          {(["custom-text", "custom-image", "stats", "features", "cta"] as SectionType[]).map((type) => {
            const config = SECTION_LABELS[type]
            const Icon = config?.icon || Layout
            return (
              <Button
                key={type}
                variant="outline"
                size="sm"
                className="justify-start text-xs"
                onClick={() => addSection(type)}
              >
                <Plus className="h-3 w-3 mr-1" />
                <Icon className="h-3 w-3 mr-1" />
                {config?.label}
              </Button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function getDefaultSectionData(type: SectionType): Record<string, any> {
  switch (type) {
    case "custom-text":
      return { title: "Novo Título", subtitle: "Subtítulo da seção", content: "Conteúdo da seção..." }
    case "custom-image":
      return { url: "", alt: "Imagem", caption: "" }
    case "stats":
      return {
        items: [
          { value: "100+", label: "Clientes", icon: "Users", color: "text-blue-600" },
          { value: "99%", label: "Satisfação", icon: "Star", color: "text-yellow-600" },
        ],
      }
    case "features":
      return {
        title: "Nossos Recursos",
        items: [
          { title: "Recurso 1", description: "Descrição do recurso", icon: "Shield", color: "bg-blue-100 text-blue-600" },
        ],
      }
    case "cta":
      return { title: "Comece Agora", subtitle: "Descrição do call-to-action", buttonText: "Começar" }
    default:
      return {}
  }
}

interface SectionPropertyEditorProps {
  section: LandingSection
  onUpdate: (data: Record<string, any>) => void
}

export function SectionPropertyEditor({ section, onUpdate }: SectionPropertyEditorProps) {
  const { data } = section

  const updateField = (key: string, value: any) => {
    onUpdate({ ...data, [key]: value })
  }

  switch (section.type) {
    case "hero":
      return (
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Seção Hero</h3>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Badge</label>
            <Input value={data.badge || ""} onChange={(e) => updateField("badge", e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Título</label>
            <Textarea value={data.title || ""} onChange={(e) => updateField("title", e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Subtítulo</label>
            <Textarea value={data.subtitle || ""} onChange={(e) => updateField("subtitle", e.target.value)} rows={3} />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Botão Principal</label>
            <Input value={data.ctaPrimary || ""} onChange={(e) => updateField("ctaPrimary", e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Cor de Fundo (classes Tailwind)</label>
            <Input value={data.bgColor || ""} onChange={(e) => updateField("bgColor", e.target.value)} />
          </div>
        </div>
      )

    case "stats":
      return (
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Estatísticas</h3>
          {(data.items || []).map((item: any, i: number) => (
            <div key={i} className="p-3 border rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Item {i + 1}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive"
                  onClick={() => {
                    const items = [...(data.items || [])]
                    items.splice(i, 1)
                    updateField("items", items)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <Input
                placeholder="Valor"
                value={item.value}
                onChange={(e) => {
                  const items = [...(data.items || [])]
                  items[i] = { ...items[i], value: e.target.value }
                  updateField("items", items)
                }}
              />
              <Input
                placeholder="Label"
                value={item.label}
                onChange={(e) => {
                  const items = [...(data.items || [])]
                  items[i] = { ...items[i], label: e.target.value }
                  updateField("items", items)
                }}
              />
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              const items = [...(data.items || []), { value: "0", label: "Novo", icon: "Users", color: "text-blue-600" }]
              updateField("items", items)
            }}
          >
            <Plus className="h-3 w-3 mr-1" /> Adicionar Estatística
          </Button>
        </div>
      )

    case "features":
      return (
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Recursos</h3>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Título da Seção</label>
            <Input value={data.title || ""} onChange={(e) => updateField("title", e.target.value)} />
          </div>
          {(data.items || []).map((item: any, i: number) => (
            <div key={i} className="p-3 border rounded-lg space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Recurso {i + 1}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive"
                  onClick={() => {
                    const items = [...(data.items || [])]
                    items.splice(i, 1)
                    updateField("items", items)
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              <Input
                placeholder="Título"
                value={item.title}
                onChange={(e) => {
                  const items = [...(data.items || [])]
                  items[i] = { ...items[i], title: e.target.value }
                  updateField("items", items)
                }}
              />
              <Textarea
                placeholder="Descrição"
                value={item.description}
                rows={2}
                onChange={(e) => {
                  const items = [...(data.items || [])]
                  items[i] = { ...items[i], description: e.target.value }
                  updateField("items", items)
                }}
              />
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => {
              const items = [
                ...(data.items || []),
                { title: "Novo Recurso", description: "Descrição", icon: "Shield", color: "bg-blue-100 text-blue-600" },
              ]
              updateField("items", items)
            }}
          >
            <Plus className="h-3 w-3 mr-1" /> Adicionar Recurso
          </Button>
        </div>
      )

    case "cta":
      return (
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Call to Action</h3>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Título</label>
            <Input value={data.title || ""} onChange={(e) => updateField("title", e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Subtítulo</label>
            <Textarea value={data.subtitle || ""} onChange={(e) => updateField("subtitle", e.target.value)} rows={2} />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Texto do Botão</label>
            <Input value={data.buttonText || ""} onChange={(e) => updateField("buttonText", e.target.value)} />
          </div>
        </div>
      )

    case "custom-text":
      return (
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Texto Personalizado</h3>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Título</label>
            <Input value={data.title || ""} onChange={(e) => updateField("title", e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Subtítulo</label>
            <Input value={data.subtitle || ""} onChange={(e) => updateField("subtitle", e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Conteúdo</label>
            <Textarea value={data.content || ""} onChange={(e) => updateField("content", e.target.value)} rows={5} />
          </div>
        </div>
      )

    case "custom-image":
      return (
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Imagem</h3>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">URL da Imagem</label>
            <Input value={data.url || ""} onChange={(e) => updateField("url", e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Texto Alt</label>
            <Input value={data.alt || ""} onChange={(e) => updateField("alt", e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Legenda</label>
            <Input value={data.caption || ""} onChange={(e) => updateField("caption", e.target.value)} />
          </div>
        </div>
      )

    case "trainings":
      return (
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Treinamentos em Destaque</h3>
          <p className="text-xs text-muted-foreground">
            Esta seção exibe automaticamente os treinamentos modelo do banco de dados.
            Use a visibilidade para mostrá-la ou ocultá-la.
          </p>
        </div>
      )

    case "pricing":
      return (
        <div className="space-y-4">
          <h3 className="font-semibold text-sm">Planos e Preços</h3>
          <p className="text-xs text-muted-foreground">
            Os planos são carregados automaticamente do cadastro de planos.
            Configure-os na página de Planos no menu administrativo.
          </p>
        </div>
      )

    default:
      return <p className="text-sm text-muted-foreground">Selecione uma seção para editar</p>
  }
}
