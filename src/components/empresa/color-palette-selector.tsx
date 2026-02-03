// Seletor de paleta de cores para empresas - Estilo Lovable
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface ColorPalette {
  id: string
  name: string
  primary: string
  primaryForeground: string
  accent: string
  colors: string[] // Array de cores para preview
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: "purple",
    name: "Roxo",
    primary: "262 83% 58%",
    primaryForeground: "0 0% 100%",
    accent: "262 83% 95%",
    colors: ["#9b5de5", "#6b21a8", "#c084fc", "#e9d5ff"]
  },
  {
    id: "blue",
    name: "Azul",
    primary: "217 91% 60%",
    primaryForeground: "0 0% 100%",
    accent: "217 91% 95%",
    colors: ["#3b82f6", "#1d4ed8", "#60a5fa", "#bfdbfe"]
  },
  {
    id: "green",
    name: "Verde",
    primary: "142 76% 36%",
    primaryForeground: "0 0% 100%",
    accent: "142 76% 95%",
    colors: ["#22c55e", "#15803d", "#4ade80", "#bbf7d0"]
  },
  {
    id: "orange",
    name: "Laranja",
    primary: "25 95% 53%",
    primaryForeground: "0 0% 100%",
    accent: "25 95% 95%",
    colors: ["#f97316", "#c2410c", "#fb923c", "#fed7aa"]
  },
  {
    id: "red",
    name: "Vermelho",
    primary: "0 84% 60%",
    primaryForeground: "0 0% 100%",
    accent: "0 84% 95%",
    colors: ["#ef4444", "#b91c1c", "#f87171", "#fecaca"]
  },
  {
    id: "pink",
    name: "Rosa",
    primary: "330 81% 60%",
    primaryForeground: "0 0% 100%",
    accent: "330 81% 95%",
    colors: ["#ec4899", "#be185d", "#f472b6", "#fbcfe8"]
  },
  {
    id: "cyan",
    name: "Ciano",
    primary: "187 85% 43%",
    primaryForeground: "0 0% 100%",
    accent: "187 85% 95%",
    colors: ["#06b6d4", "#0e7490", "#22d3ee", "#a5f3fc"]
  },
  {
    id: "amber",
    name: "Âmbar",
    primary: "38 92% 50%",
    primaryForeground: "0 0% 100%",
    accent: "38 92% 95%",
    colors: ["#f59e0b", "#b45309", "#fbbf24", "#fde68a"]
  },
  {
    id: "indigo",
    name: "Índigo",
    primary: "243 75% 59%",
    primaryForeground: "0 0% 100%",
    accent: "243 75% 95%",
    colors: ["#6366f1", "#4338ca", "#818cf8", "#c7d2fe"]
  },
  {
    id: "teal",
    name: "Teal",
    primary: "167 76% 42%",
    primaryForeground: "0 0% 100%",
    accent: "167 76% 95%",
    colors: ["#14b8a6", "#0f766e", "#2dd4bf", "#99f6e4"]
  },
  {
    id: "slate",
    name: "Cinza",
    primary: "215 20% 40%",
    primaryForeground: "0 0% 100%",
    accent: "215 20% 95%",
    colors: ["#64748b", "#334155", "#94a3b8", "#e2e8f0"]
  },
  {
    id: "emerald",
    name: "Esmeralda",
    primary: "160 84% 39%",
    primaryForeground: "0 0% 100%",
    accent: "160 84% 95%",
    colors: ["#10b981", "#047857", "#34d399", "#a7f3d0"]
  }
]

interface ColorPaletteSelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function ColorPaletteSelector({ value, onChange, className }: ColorPaletteSelectorProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Tema de Cores</Label>
        <span className="text-sm text-muted-foreground">
          {COLOR_PALETTES.find(p => p.id === value)?.name || "Selecione"}
        </span>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
        {COLOR_PALETTES.map((palette) => (
          <button
            key={palette.id}
            type="button"
            onClick={() => onChange(palette.id)}
            className={cn(
              "group relative flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200",
              "hover:bg-muted/50 hover:scale-105",
              value === palette.id && "bg-muted ring-2 ring-primary"
            )}
          >
            {/* Color Preview - Estilo Lovable */}
            <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-md transition-shadow group-hover:shadow-lg">
              {/* Grid 2x2 de cores */}
              <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
                {palette.colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-full h-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              
              {/* Checkmark overlay */}
              {value === palette.id && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                </div>
              )}
            </div>
            
            {/* Nome da paleta */}
            <span className={cn(
              "text-xs font-medium transition-colors",
              value === palette.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            )}>
              {palette.name}
            </span>
          </button>
        ))}
      </div>
      
      {/* Preview da cor selecionada */}
      {value && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border">
          <div 
            className="w-10 h-10 rounded-lg shadow-sm"
            style={{ 
              background: `linear-gradient(135deg, ${COLOR_PALETTES.find(p => p.id === value)?.colors[0] || '#9b5de5'}, ${COLOR_PALETTES.find(p => p.id === value)?.colors[1] || '#6b21a8'})` 
            }}
          />
          <div className="flex-1">
            <p className="text-sm font-medium">
              Tema {COLOR_PALETTES.find(p => p.id === value)?.name}
            </p>
            <p className="text-xs text-muted-foreground">
              Será aplicado aos elementos principais da interface
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
