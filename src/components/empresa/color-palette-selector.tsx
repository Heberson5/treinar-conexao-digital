// Seletor de paleta de cores para empresas
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export interface ColorPalette {
  id: string
  name: string
  primary: string
  primaryForeground: string
  accent: string
  preview: string // gradient preview class
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: "purple",
    name: "Roxo",
    primary: "262 83% 58%",
    primaryForeground: "0 0% 100%",
    accent: "262 83% 95%",
    preview: "bg-gradient-to-r from-purple-600 to-purple-800"
  },
  {
    id: "blue",
    name: "Azul",
    primary: "217 91% 60%",
    primaryForeground: "0 0% 100%",
    accent: "217 91% 95%",
    preview: "bg-gradient-to-r from-blue-500 to-blue-700"
  },
  {
    id: "green",
    name: "Verde",
    primary: "142 76% 36%",
    primaryForeground: "0 0% 100%",
    accent: "142 76% 95%",
    preview: "bg-gradient-to-r from-green-500 to-green-700"
  },
  {
    id: "orange",
    name: "Laranja",
    primary: "25 95% 53%",
    primaryForeground: "0 0% 100%",
    accent: "25 95% 95%",
    preview: "bg-gradient-to-r from-orange-500 to-orange-700"
  },
  {
    id: "red",
    name: "Vermelho",
    primary: "0 84% 60%",
    primaryForeground: "0 0% 100%",
    accent: "0 84% 95%",
    preview: "bg-gradient-to-r from-red-500 to-red-700"
  },
  {
    id: "pink",
    name: "Rosa",
    primary: "330 81% 60%",
    primaryForeground: "0 0% 100%",
    accent: "330 81% 95%",
    preview: "bg-gradient-to-r from-pink-500 to-pink-700"
  },
  {
    id: "cyan",
    name: "Ciano",
    primary: "187 85% 43%",
    primaryForeground: "0 0% 100%",
    accent: "187 85% 95%",
    preview: "bg-gradient-to-r from-cyan-500 to-cyan-700"
  },
  {
    id: "amber",
    name: "Âmbar",
    primary: "38 92% 50%",
    primaryForeground: "0 0% 100%",
    accent: "38 92% 95%",
    preview: "bg-gradient-to-r from-amber-500 to-amber-700"
  },
  {
    id: "indigo",
    name: "Índigo",
    primary: "243 75% 59%",
    primaryForeground: "0 0% 100%",
    accent: "243 75% 95%",
    preview: "bg-gradient-to-r from-indigo-500 to-indigo-700"
  },
  {
    id: "teal",
    name: "Teal",
    primary: "167 76% 42%",
    primaryForeground: "0 0% 100%",
    accent: "167 76% 95%",
    preview: "bg-gradient-to-r from-teal-500 to-teal-700"
  },
  {
    id: "slate",
    name: "Cinza",
    primary: "215 20% 40%",
    primaryForeground: "0 0% 100%",
    accent: "215 20% 95%",
    preview: "bg-gradient-to-r from-slate-500 to-slate-700"
  },
  {
    id: "emerald",
    name: "Esmeralda",
    primary: "160 84% 39%",
    primaryForeground: "0 0% 100%",
    accent: "160 84% 95%",
    preview: "bg-gradient-to-r from-emerald-500 to-emerald-700"
  }
]

interface ColorPaletteSelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function ColorPaletteSelector({ value, onChange, className }: ColorPaletteSelectorProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <Label>Tema de Cores</Label>
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
        {COLOR_PALETTES.map((palette) => (
          <button
            key={palette.id}
            type="button"
            onClick={() => onChange(palette.id)}
            className={cn(
              "relative flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all hover:scale-105",
              value === palette.id
                ? "border-primary ring-2 ring-primary/20"
                : "border-transparent hover:border-muted-foreground/20"
            )}
          >
            <div className={cn("w-10 h-10 rounded-full", palette.preview)} />
            <span className="text-xs font-medium truncate">{palette.name}</span>
            {value === palette.id && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
