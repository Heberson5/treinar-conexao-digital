// Editor Markdown com formatações estilo Word
import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Link2,
  Minus,
  Eye,
  Edit,
  Code,
  Strikethrough
} from "lucide-react"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: string
}

export function MarkdownEditor({ value, onChange, placeholder = "Digite o conteúdo aqui...", minHeight = "400px" }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertFormat = useCallback((before: string, after: string = before) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    
    const newValue = 
      value.substring(0, start) + 
      before + 
      selectedText + 
      after + 
      value.substring(end)
    
    onChange(newValue)
    
    // Reposicionar cursor
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + before.length + selectedText.length + after.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }, [value, onChange])

  const insertAtLineStart = useCallback((prefix: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    
    const newValue = 
      value.substring(0, lineStart) + 
      prefix + 
      value.substring(lineStart)
    
    onChange(newValue)
    
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + prefix.length, start + prefix.length)
    }, 0)
  }, [value, onChange])

  const renderMarkdown = (text: string) => {
    // Conversão simples de Markdown para HTML
    let html = text
      // Headers
      .replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-2xl font-bold mt-8 mb-3">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
      // Bold and Italic
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Strikethrough
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-primary underline hover:no-underline">$1</a>')
      // Code
      .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm">$1</code>')
      // Horizontal Rule
      .replace(/^---$/gim, '<hr class="my-6 border-border" />')
      // Blockquote
      .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-primary pl-4 py-2 my-4 italic text-muted-foreground">$1</blockquote>')
      // Lists
      .replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
      // Line breaks
      .replace(/\n\n/g, '</p><p class="my-4">')
      .replace(/\n/g, '<br />')

    return `<div class="prose dark:prose-invert max-w-none"><p class="my-4">${html}</p></div>`
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-muted/30 flex-wrap">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => insertFormat('**', '**')}
          title="Negrito"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => insertFormat('*', '*')}
          title="Itálico"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => insertFormat('~~', '~~')}
          title="Tachado"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => insertFormat('`', '`')}
          title="Código"
        >
          <Code className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => insertAtLineStart('# ')}
          title="Título 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => insertAtLineStart('## ')}
          title="Título 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => insertAtLineStart('### ')}
          title="Título 3"
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => insertAtLineStart('- ')}
          title="Lista"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => insertAtLineStart('1. ')}
          title="Lista Numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => insertAtLineStart('> ')}
          title="Citação"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6 mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => insertFormat('[', '](url)')}
          title="Link"
        >
          <Link2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => insertFormat('\n---\n', '')}
          title="Linha Horizontal"
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "edit" | "preview")} className="w-auto">
          <TabsList className="h-8">
            <TabsTrigger value="edit" className="h-7 px-2 text-xs">
              <Edit className="h-3 w-3 mr-1" />
              Editar
            </TabsTrigger>
            <TabsTrigger value="preview" className="h-7 px-2 text-xs">
              <Eye className="h-3 w-3 mr-1" />
              Visualizar
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content */}
      {activeTab === "edit" ? (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="border-0 rounded-none focus-visible:ring-0 resize-none font-mono text-sm"
          style={{ minHeight }}
        />
      ) : (
        <div 
          className="p-4 overflow-auto"
          style={{ minHeight }}
          dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
        />
      )}
    </div>
  )
}
