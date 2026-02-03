import { useEffect, useState } from "react";
import { useEmpresaFilter } from "@/contexts/empresa-filter-context";
import { supabase } from "@/integrations/supabase/client";
import { COLOR_PALETTES } from "@/components/empresa/color-palette-selector";

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
      // Se não é master ou não tem empresa selecionada, usar tema padrão
      if (!isMaster || !empresaSelecionada || empresaSelecionada === "todas") {
        resetToDefaultTheme();
        return;
      }

      setIsLoading(true);
      try {
        // Buscar tema da empresa selecionada
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

        // Se não tem tema ou não encontrou, volta ao padrão
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

  const applyPaletteToCSS = (palette: typeof COLOR_PALETTES[0]) => {
    const root = document.documentElement;
    root.style.setProperty("--primary", palette.primary);
    root.style.setProperty("--primary-foreground", palette.primaryForeground);
    root.style.setProperty("--accent", palette.accent);
    root.style.setProperty("--ring", palette.primary);
    root.style.setProperty("--accent-foreground", palette.primary);
  };

  const resetToDefaultTheme = () => {
    const root = document.documentElement;
    // Resetar para o tema padrão roxo
    root.style.setProperty("--primary", "262 83% 58%");
    root.style.setProperty("--primary-foreground", "0 0% 100%");
    root.style.setProperty("--accent", "262 83% 95%");
    root.style.setProperty("--ring", "262 83% 58%");
    root.style.setProperty("--accent-foreground", "262 83% 58%");
    setTheme(null);
  };

  return { theme, isLoading, resetToDefaultTheme };
}
