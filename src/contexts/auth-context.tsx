import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: number;
  email: string;
  name: string;
  role: "master" | "admin" | "usuario" | "Master" | "Admin";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  canCreateMaster: () => boolean;
  canCreateAdmin: () => boolean;
  canCreateUser: () => boolean;
  canAccessAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hash hardcoded para o usuário master inicial (hebersohas@gmail.com)
const EMAIL_HASH = "8b0d8e8c917a528bf82b6ccc700491eefba6b85a7b32ae6039b866410910b84b"
const PASSWORD_HASH = "97cbf42d84a09a02027288f4a94228fdda3737abb2299bfdb3310bea3cb40695"

async function hashString(str: string): Promise<string> {
  const buffer = new TextEncoder().encode(str)
  const digest = await crypto.subtle.digest("SHA-256", buffer)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export function AuthProvider({ children }: { children: ReactNode }) {
  console.log("AuthProvider rendering...");
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log("AuthProvider useEffect running...");
    // Verificar se há sessão salva
    const savedAuth = localStorage.getItem('training-portal-auth');
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      // Normalizar role para minúsculas
      if (authData.user && authData.user.role) {
        authData.user.role = authData.user.role.toLowerCase();
      }
      setUser(authData.user);
      setIsAuthenticated(true);
      console.log("Restored user from localStorage:", authData.user);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const emailHash = await hashString(email)
    const passwordHash = await hashString(password)
    
    console.log("Login attempt - email:", email);
    console.log("Login attempt - emailHash:", emailHash);
    console.log("Login attempt - passwordHash:", passwordHash);
    console.log("Expected EMAIL_HASH:", EMAIL_HASH);
    console.log("Expected PASSWORD_HASH:", PASSWORD_HASH);

    if (emailHash === EMAIL_HASH && passwordHash === PASSWORD_HASH) {
      const userData: User = {
        id: 1,
        email,
        name: "Heber Sohas",
        role: "master"
      }

      setUser(userData)
      setIsAuthenticated(true)

      // Salvar sessão
      localStorage.setItem('training-portal-auth', JSON.stringify({
        user: userData,
        timestamp: Date.now()
      }))
      
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('training-portal-auth');
  };

  // Funções de autorização
  const canCreateMaster = () => {
    console.log("canCreateMaster - user:", user);
    return user?.role?.toLowerCase() === "master";
  };
  const canCreateAdmin = () => {
    console.log("canCreateAdmin - user:", user);
    const role = user?.role?.toLowerCase();
    return role === "master" || role === "admin";
  };
  const canCreateUser = () => {
    console.log("canCreateUser - user:", user);
    const role = user?.role?.toLowerCase();
    return role === "master" || role === "admin";
  };
  const canAccessAdmin = () => {
    console.log("canAccessAdmin - user:", user);
    const role = user?.role?.toLowerCase();
    return role === "master" || role === "admin";
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated,
      canCreateMaster,
      canCreateAdmin,
      canCreateUser,
      canAccessAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}