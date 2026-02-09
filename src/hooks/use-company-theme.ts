import { useEffect, useState } from "react";
import { useEmpresaFilter } from "@/contexts/empresa-filter-context";
import { supabase } from "@/integrations/supabase/client";
import { COLOR_PALETTES, ColorPalette } from "@/components/empresa/color-palette-selector";

interface CompanyTheme {
  primary: string;
  primaryForeground: string;
  accent: string;
}

export function useCompanyTheme() {
  const { empresaSelecionada, isMaster, empresas } = useEmpresaFilter();
  const [theme, setTheme] = useState<CompanyTheme | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const applyTheme = async () => {
      if (!isMaster || !empresaSelecionada || empresaSelecionada === "todas") {
        resetToDefaultTheme();
        return;
      }

      setIsLoading(true);
      try {
        const { data: empresa } = await supabase
          .from("empresas")
          .select("tema_cor")
          .eq("id", empresaSelecionada)
          .single();

        if (empresa?.tema_cor) {
          const palette = COLOR_PALETTES.find(p => p.id === empresa.tema_cor);
          if (palette) {
            applyPaletteToCSS(palette);
            setTheme({
              primary: palette.primary,
              primaryForeground: palette.primaryForeground,
              accent: palette.accent
            });
            return;
          }
        }

        resetToDefaultTheme();
      } catch (error) {
        console.error("Erro ao aplicar tema da empresa:", error);
        resetToDefaultTheme();
      } finally {
        setIsLoading(false);
      }
    };

    applyTheme();
  }, [empresaSelecionada, isMaster]);

  const applyPaletteToCSS = (palette: ColorPalette) => {
    const root = document.documentElement;
    
    // Core colors
    root.style.setProperty("--primary", palette.primary);
    root.style.setProperty("--primary-foreground", palette.primaryForeground);
    root.style.setProperty("--primary-light", palette.primaryLight);
    root.style.setProperty("--primary-dark", palette.primaryDark);
    
    // Accent
    root.style.setProperty("--accent", palette.accent);
    root.style.setProperty("--accent-foreground", palette.accentForeground);
    
    // Ring
    root.style.setProperty("--ring", palette.ring);
    
    // Sidebar
    root.style.setProperty("--sidebar-primary", palette.sidebarPrimary);
    root.style.setProperty("--sidebar-primary-foreground", palette.primaryForeground);
    root.style.setProperty("--sidebar-accent", palette.sidebarAccent);
    root.style.setProperty("--sidebar-ring", palette.ring);
    
    // Dynamic gradients
    root.style.setProperty("--gradient-primary", 
      `linear-gradient(135deg, hsl(${palette.primary}), hsl(${palette.primaryLight}))`);
    root.style.setProperty("--gradient-hero", 
      `linear-gradient(135deg, hsl(${palette.primary}) 0%, hsl(${palette.primaryLight}) 50%, hsl(${palette.primaryDark}) 100%)`);
    
    // Shadows
    root.style.setProperty("--shadow-elegant", 
      `0 10px 25px -5px hsl(${palette.primary} / 0.1), 0 4px 6px -2px hsl(${palette.primary} / 0.05)`);
  };

  const resetToDefaultTheme = () => {
    const root = document.documentElement;
    const defaultPalette = COLOR_PALETTES.find(p => p.id === "purple")!;
    
    // Reset all themed properties
    root.style.setProperty("--primary", defaultPalette.primary);
    root.style.setProperty("--primary-foreground", defaultPalette.primaryForeground);
    root.style.setProperty("--primary-light", defaultPalette.primaryLight);
    root.style.setProperty("--primary-dark", defaultPalette.primaryDark);
    root.style.setProperty("--accent", defaultPalette.accent);
    root.style.setProperty("--accent-foreground", defaultPalette.accentForeground);
    root.style.setProperty("--ring", defaultPalette.ring);
    root.style.setProperty("--sidebar-primary", "240 5.9% 10%");
    root.style.setProperty("--sidebar-primary-foreground", "0 0% 98%");
    root.style.setProperty("--sidebar-accent", "240 4.8% 95.9%");
    root.style.setProperty("--sidebar-ring", "217.2 91.2% 59.8%");
    root.style.setProperty("--gradient-primary", 
      `linear-gradient(135deg, hsl(${defaultPalette.primary}), hsl(${defaultPalette.primaryLight}))`);
    root.style.setProperty("--gradient-hero", 
      `linear-gradient(135deg, hsl(${defaultPalette.primary}) 0%, hsl(${defaultPalette.primaryLight}) 50%, hsl(${defaultPalette.primaryDark}) 100%)`);
    root.style.setProperty("--shadow-elegant", 
      `0 10px 25px -5px hsl(${defaultPalette.primary} / 0.1), 0 4px 6px -2px hsl(${defaultPalette.primary} / 0.05)`);
    
    setTheme(null);
  };

  return { theme, isLoading, resetToDefaultTheme };
}
