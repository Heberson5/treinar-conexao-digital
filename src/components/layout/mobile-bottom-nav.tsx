import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, GraduationCap, BookOpen, Calendar, FileText, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

interface MobileNavItem {
  label: string;
  url: string;
  icon: typeof LayoutDashboard;
  roles: string[];
}

const items: MobileNavItem[] = [
  { label: "Início", url: "/dashboard", icon: LayoutDashboard, roles: ["master", "admin", "instrutor"] },
  { label: "Meus", url: "/meus-treinamentos", icon: GraduationCap, roles: ["master", "admin", "instrutor", "usuario"] },
  { label: "Catálogo", url: "/catalogo", icon: BookOpen, roles: ["master", "admin", "instrutor", "usuario"] },
  { label: "Agenda", url: "/calendario", icon: Calendar, roles: ["master", "admin", "instrutor", "usuario"] },
  { label: "Relatórios", url: "/relatorios", icon: FileText, roles: ["master", "admin", "instrutor"] },
  { label: "Config.", url: "/admin/configuracoes", icon: Settings, roles: ["master"] },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const role = user?.role || "usuario";

  // Para usuários comuns, ajustar o "Início" para meus-treinamentos
  const visible = items
    .filter((it) => it.roles.includes(role))
    .map((it) => {
      if (it.url === "/dashboard" && role === "usuario") {
        return { ...it, url: "/meus-treinamentos" };
      }
      return it;
    })
    .slice(0, 5); // Bottom nav: máximo 5 itens

  return (
    <nav
      aria-label="Navegação principal"
      className={cn(
        "md:hidden fixed bottom-0 inset-x-0 z-40",
        "bg-card/95 backdrop-blur-md border-t border-border",
        "pb-[env(safe-area-inset-bottom)]"
      )}
    >
      <ul className="flex items-stretch justify-around">
        {visible.map((item) => {
          const Icon = item.icon;
          const active =
            location.pathname === item.url ||
            (item.url !== "/dashboard" && location.pathname.startsWith(item.url));

          return (
            <li key={item.url} className="flex-1">
              <NavLink
                to={item.url}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 px-1 text-[10px] transition-colors",
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", active && "stroke-[2.5]")} />
                <span className="truncate max-w-full">{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
