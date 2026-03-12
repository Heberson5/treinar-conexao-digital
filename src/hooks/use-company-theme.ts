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
    
    // Extract hue from primary (e.g. "262 83% 58%" -> "262")
    const hue = palette.primary.split(" ")[0];
    const sat = palette.primary.split(" ")[1]?.replace("%", "") || "83";
    
    // Core colors
    root.style.setProperty("--primary", palette.primary);
    root.style.setProperty("--primary-foreground", palette.primaryForeground);
    root.style.setProperty("--primary-light", palette.primaryLight);
    root.style.setProperty("--primary-dark", palette.primaryDark);
    
    // Background with very subtle primary tint
    root.style.setProperty("--background", `${hue} ${Math.min(Number(sat), 20)}% 99%`);
    root.style.setProperty("--card", `${hue} ${Math.min(Number(sat), 15)}% 100%`);
    root.style.setProperty("--popover", `${hue} ${Math.min(Number(sat), 15)}% 100%`);
    
    // Secondary with primary tint
    root.style.setProperty("--secondary", `${hue} ${Math.min(Number(sat), 20)}% 96%`);
    root.style.setProperty("--secondary-foreground", `${hue} 39% 11%`);
    
    // Muted with primary tint
    root.style.setProperty("--muted", `${hue} ${Math.min(Number(sat), 18)}% 96%`);
    root.style.setProperty("--muted-foreground", `${hue} 16% 47%`);
    
    // Accent
    root.style.setProperty("--accent", palette.accent);
    root.style.setProperty("--accent-foreground", palette.accentForeground);
    
    // Border with subtle primary tint
    root.style.setProperty("--border", `${hue} ${Math.min(Number(sat), 15)}% 90%`);
    root.style.setProperty("--input", `${hue} ${Math.min(Number(sat), 15)}% 90%`);
    
    // Ring
    root.style.setProperty("--ring", palette.ring);
    
    // Sidebar
    root.style.setProperty("--sidebar-primary", palette.sidebarPrimary);
    root.style.setProperty("--sidebar-primary-foreground", palette.primaryForeground);
    root.style.setProperty("--sidebar-accent", palette.sidebarAccent);
    root.style.setProperty("--sidebar-ring", palette.ring);
    root.style.setProperty("--sidebar-background", `${hue} ${Math.min(Number(sat), 10)}% 98%`);
    root.style.setProperty("--sidebar-border", `${hue} ${Math.min(Number(sat), 12)}% 91%`);
    
    // Dynamic gradients
    root.style.setProperty("--gradient-primary", 
      `linear-gradient(135deg, hsl(${palette.primary}), hsl(${palette.primaryLight}))`);
    root.style.setProperty("--gradient-hero", 
      `linear-gradient(135deg, hsl(${palette.primary}) 0%, hsl(${palette.primaryLight}) 50%, hsl(${palette.primaryDark}) 100%)`);
    
    // Shadows with primary color tint
    root.style.setProperty("--shadow-elegant", 
      `0 10px 25px -5px hsl(${palette.primary} / 0.15), 0 4px 6px -2px hsl(${palette.primary} / 0.08)`);
    root.style.setProperty("--shadow-card", 
      `0 4px 12px -2px hsl(${palette.primary} / 0.08), 0 2px 4px -1px hsl(${palette.primary} / 0.04)`);
  };

  const resetToDefaultTheme = () => {
    const root = document.documentElement;
    
    // Remove all inline styles to revert to CSS defaults
    const props = [
      "--primary", "--primary-foreground", "--primary-light", "--primary-dark",
      "--background", "--card", "--popover", "--secondary", "--secondary-foreground",
      "--muted", "--muted-foreground", "--accent", "--accent-foreground",
      "--border", "--input", "--ring",
      "--sidebar-primary", "--sidebar-primary-foreground", "--sidebar-accent",
      "--sidebar-ring", "--sidebar-background", "--sidebar-border",
      "--gradient-primary", "--gradient-hero", "--shadow-elegant", "--shadow-card"
    ];
    props.forEach(prop => root.style.removeProperty(prop));
    
    setTheme(null);
  };

  return { theme, isLoading, resetToDefaultTheme };
}
