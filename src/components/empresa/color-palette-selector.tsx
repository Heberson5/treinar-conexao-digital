// Seletor de paleta de cores para empresas - Estilo Lovable
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export interface ColorPalette {
  id: string
  name: string
  primary: string
  primaryLight: string
  primaryDark: string
  primaryForeground: string
  accent: string
  accentForeground: string
  ring: string
  sidebarPrimary: string
  sidebarAccent: string
  colors: string[]
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: "purple",
    name: "Roxo",
    primary: "262 83% 58%",
    primaryLight: "262 83% 65%",
    primaryDark: "262 83% 45%",
    primaryForeground: "0 0% 100%",
    accent: "262 83% 95%",
    accentForeground: "262 83% 58%",
    ring: "262 83% 58%",
    sidebarPrimary: "262 83% 50%",
    sidebarAccent: "262 30% 93%",
    colors: ["#9b5de5", "#6b21a8", "#c084fc", "#e9d5ff"]
  },
  {
    id: "blue",
    name: "Azul",
    primary: "217 91% 60%",
    primaryLight: "217 91% 67%",
    primaryDark: "217 91% 47%",
    primaryForeground: "0 0% 100%",
    accent: "217 91% 95%",
    accentForeground: "217 91% 60%",
    ring: "217 91% 60%",
    sidebarPrimary: "217 91% 50%",
    sidebarAccent: "217 30% 93%",
    colors: ["#3b82f6", "#1d4ed8", "#60a5fa", "#bfdbfe"]
  },
  {
    id: "green",
    name: "Verde",
    primary: "142 76% 36%",
    primaryLight: "142 76% 45%",
    primaryDark: "142 76% 28%",
    primaryForeground: "0 0% 100%",
    accent: "142 76% 95%",
    accentForeground: "142 76% 36%",
    ring: "142 76% 36%",
    sidebarPrimary: "142 76% 30%",
    sidebarAccent: "142 30% 93%",
    colors: ["#22c55e", "#15803d", "#4ade80", "#bbf7d0"]
  },
  {
    id: "orange",
    name: "Laranja",
    primary: "25 95% 53%",
    primaryLight: "25 95% 62%",
    primaryDark: "25 95% 40%",
    primaryForeground: "0 0% 100%",
    accent: "25 95% 95%",
    accentForeground: "25 95% 53%",
    ring: "25 95% 53%",
    sidebarPrimary: "25 95% 45%",
    sidebarAccent: "25 30% 93%",
    colors: ["#f97316", "#c2410c", "#fb923c", "#fed7aa"]
  },
  {
    id: "red",
    name: "Vermelho",
    primary: "0 84% 60%",
    primaryLight: "0 84% 68%",
    primaryDark: "0 84% 47%",
    primaryForeground: "0 0% 100%",
    accent: "0 84% 95%",
    accentForeground: "0 84% 60%",
    ring: "0 84% 60%",
    sidebarPrimary: "0 84% 50%",
    sidebarAccent: "0 30% 93%",
    colors: ["#ef4444", "#b91c1c", "#f87171", "#fecaca"]
  },
  {
    id: "pink",
    name: "Rosa",
    primary: "330 81% 60%",
    primaryLight: "330 81% 68%",
    primaryDark: "330 81% 47%",
    primaryForeground: "0 0% 100%",
    accent: "330 81% 95%",
    accentForeground: "330 81% 60%",
    ring: "330 81% 60%",
    sidebarPrimary: "330 81% 50%",
    sidebarAccent: "330 30% 93%",
    colors: ["#ec4899", "#be185d", "#f472b6", "#fbcfe8"]
  },
  {
    id: "cyan",
    name: "Ciano",
    primary: "187 85% 43%",
    primaryLight: "187 85% 52%",
    primaryDark: "187 85% 33%",
    primaryForeground: "0 0% 100%",
    accent: "187 85% 95%",
    accentForeground: "187 85% 43%",
    ring: "187 85% 43%",
    sidebarPrimary: "187 85% 38%",
    sidebarAccent: "187 30% 93%",
    colors: ["#06b6d4", "#0e7490", "#22d3ee", "#a5f3fc"]
  },
  {
    id: "amber",
    name: "Âmbar",
    primary: "38 92% 50%",
    primaryLight: "38 92% 58%",
    primaryDark: "38 92% 38%",
    primaryForeground: "0 0% 100%",
    accent: "38 92% 95%",
    accentForeground: "38 92% 50%",
    ring: "38 92% 50%",
    sidebarPrimary: "38 92% 42%",
    sidebarAccent: "38 30% 93%",
    colors: ["#f59e0b", "#b45309", "#fbbf24", "#fde68a"]
  },
  {
    id: "indigo",
    name: "Índigo",
    primary: "243 75% 59%",
    primaryLight: "243 75% 67%",
    primaryDark: "243 75% 47%",
    primaryForeground: "0 0% 100%",
    accent: "243 75% 95%",
    accentForeground: "243 75% 59%",
    ring: "243 75% 59%",
    sidebarPrimary: "243 75% 50%",
    sidebarAccent: "243 30% 93%",
    colors: ["#6366f1", "#4338ca", "#818cf8", "#c7d2fe"]
  },
  {
    id: "teal",
    name: "Teal",
    primary: "167 76% 42%",
    primaryLight: "167 76% 52%",
    primaryDark: "167 76% 32%",
    primaryForeground: "0 0% 100%",
    accent: "167 76% 95%",
    accentForeground: "167 76% 42%",
    ring: "167 76% 42%",
    sidebarPrimary: "167 76% 36%",
    sidebarAccent: "167 30% 93%",
    colors: ["#14b8a6", "#0f766e", "#2dd4bf", "#99f6e4"]
  },
  {
    id: "slate",
    name: "Cinza",
    primary: "215 20% 40%",
    primaryLight: "215 20% 50%",
    primaryDark: "215 20% 30%",
    primaryForeground: "0 0% 100%",
    accent: "215 20% 95%",
    accentForeground: "215 20% 40%",
    ring: "215 20% 40%",
    sidebarPrimary: "215 20% 35%",
    sidebarAccent: "215 10% 93%",
    colors: ["#64748b", "#334155", "#94a3b8", "#e2e8f0"]
  },
  {
    id: "emerald",
    name: "Esmeralda",
    primary: "160 84% 39%",
    primaryLight: "160 84% 48%",
    primaryDark: "160 84% 30%",
    primaryForeground: "0 0% 100%",
    accent: "160 84% 95%",
    accentForeground: "160 84% 39%",
    ring: "160 84% 39%",
    sidebarPrimary: "160 84% 33%",
    sidebarAccent: "160 30% 93%",
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
            <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-md transition-shadow group-hover:shadow-lg">
              <div className="grid grid-cols-2 grid-rows-2 w-full h-full">
                {palette.colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-full h-full"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              {value === palette.id && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                </div>
              )}
            </div>
            <span className={cn(
              "text-xs font-medium transition-colors",
              value === palette.id ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            )}>
              {palette.name}
            </span>
          </button>
        ))}
      </div>
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
              Será aplicado a botões, sidebar, cards, badges e toda a interface
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
