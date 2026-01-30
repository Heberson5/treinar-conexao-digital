export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      atividades: {
        Row: {
          criado_em: string | null
          descricao: string
          id: string
          metadata: Json | null
          tipo: string
          usuario_id: string | null
        }
        Insert: {
          criado_em?: string | null
          descricao: string
          id?: string
          metadata?: Json | null
          tipo: string
          usuario_id?: string | null
        }
        Update: {
          criado_em?: string | null
          descricao?: string
          id?: string
          metadata?: Json | null
          tipo?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      avaliacoes_treinamentos: {
        Row: {
          atualizado_em: string
          comentario: string | null
          criado_em: string
          id: string
          nota: number
          treinamento_id: string
          usuario_id: string
        }
        Insert: {
          atualizado_em?: string
          comentario?: string | null
          criado_em?: string
          id?: string
          nota: number
          treinamento_id: string
          usuario_id: string
        }
        Update: {
          atualizado_em?: string
          comentario?: string | null
          criado_em?: string
          id?: string
          nota?: number
          treinamento_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_treinamentos_treinamento_id_fkey"
            columns: ["treinamento_id"]
            isOneToOne: false
            referencedRelation: "treinamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      cnpj_demo_usado: {
        Row: {
          cnpj: string
          criado_em: string
          empresa_id: string | null
          id: string
          usado_em: string
        }
        Insert: {
          cnpj: string
          criado_em?: string
          empresa_id?: string | null
          id?: string
          usado_em?: string
        }
        Update: {
          cnpj?: string
          criado_em?: string
          empresa_id?: string | null
          id?: string
          usado_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "cnpj_demo_usado_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      configuracoes_ia_empresa: {
        Row: {
          api_key: string | null
          api_key_chatgpt: string | null
          api_key_deepseek: string | null
          api_key_gemini: string | null
          atualizado_em: string | null
          criado_em: string | null
          empresa_id: string
          habilitado: boolean | null
          id: string
          modelo_ia: string | null
          provedor_ia: string
        }
        Insert: {
          api_key?: string | null
          api_key_chatgpt?: string | null
          api_key_deepseek?: string | null
          api_key_gemini?: string | null
          atualizado_em?: string | null
          criado_em?: string | null
          empresa_id: string
          habilitado?: boolean | null
          id?: string
          modelo_ia?: string | null
          provedor_ia?: string
        }
        Update: {
          api_key?: string | null
          api_key_chatgpt?: string | null
          api_key_deepseek?: string | null
          api_key_gemini?: string | null
          atualizado_em?: string | null
          criado_em?: string | null
          empresa_id?: string
          habilitado?: boolean | null
          id?: string
          modelo_ia?: string | null
          provedor_ia?: string
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_ia_empresa_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: true
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      departamentos: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          criado_em: string | null
          descricao: string | null
          empresa_id: string | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          descricao?: string | null
          empresa_id?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          descricao?: string | null
          empresa_id?: string | null
          id?: string
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "departamentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          cnpj: string | null
          criado_em: string | null
          data_contratacao: string | null
          demo_created_at: string | null
          demo_expires_at: string | null
          email: string | null
          endereco: string | null
          id: string
          is_demo: boolean | null
          logo_url: string | null
          nome: string
          nome_fantasia: string | null
          plano_id: string | null
          razao_social: string | null
          responsavel: string | null
          telefone: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          cnpj?: string | null
          criado_em?: string | null
          data_contratacao?: string | null
          demo_created_at?: string | null
          demo_expires_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          is_demo?: boolean | null
          logo_url?: string | null
          nome: string
          nome_fantasia?: string | null
          plano_id?: string | null
          razao_social?: string | null
          responsavel?: string | null
          telefone?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          cnpj?: string | null
          criado_em?: string | null
          data_contratacao?: string | null
          demo_created_at?: string | null
          demo_expires_at?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          is_demo?: boolean | null
          logo_url?: string | null
          nome?: string
          nome_fantasia?: string | null
          plano_id?: string | null
          razao_social?: string | null
          responsavel?: string | null
          telefone?: string | null
        }
        Relationships: []
      }
      perfis: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          avatar_url: string | null
          cargo: string | null
          criado_em: string | null
          departamento_id: string | null
          email: string
          empresa_id: string | null
          id: string
          nome: string
          telefone: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          avatar_url?: string | null
          cargo?: string | null
          criado_em?: string | null
          departamento_id?: string | null
          email: string
          empresa_id?: string | null
          id: string
          nome: string
          telefone?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          avatar_url?: string | null
          cargo?: string | null
          criado_em?: string | null
          departamento_id?: string | null
          email?: string
          empresa_id?: string | null
          id?: string
          nome?: string
          telefone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "perfis_departamento_id_fkey"
            columns: ["departamento_id"]
            isOneToOne: false
            referencedRelation: "departamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "perfis_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      plano_contratos: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          criado_em: string | null
          data_fim: string | null
          data_inicio: string | null
          empresa_id: string
          id: string
          limite_armazenamento_gb: number | null
          limite_treinamentos: number
          limite_usuarios: number
          nome_plano: string
          plano_id: string | null
          preco_contratado: number
          recursos_contratados: Json | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          empresa_id: string
          id?: string
          limite_armazenamento_gb?: number | null
          limite_treinamentos: number
          limite_usuarios: number
          nome_plano: string
          plano_id?: string | null
          preco_contratado: number
          recursos_contratados?: Json | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          criado_em?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          empresa_id?: string
          id?: string
          limite_armazenamento_gb?: number | null
          limite_treinamentos?: number
          limite_usuarios?: number
          nome_plano?: string
          plano_id?: string | null
          preco_contratado?: number
          recursos_contratados?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "plano_contratos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plano_contratos_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
        ]
      }
      planos: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          cor: string | null
          criado_em: string | null
          descricao: string | null
          icone: string | null
          id: string
          limite_armazenamento_gb: number | null
          limite_treinamentos: number
          limite_usuarios: number
          nome: string
          ordem: number | null
          periodo: string | null
          popular: boolean | null
          preco: number
          recursos: Json | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          cor?: string | null
          criado_em?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          limite_armazenamento_gb?: number | null
          limite_treinamentos?: number
          limite_usuarios?: number
          nome: string
          ordem?: number | null
          periodo?: string | null
          popular?: boolean | null
          preco?: number
          recursos?: Json | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          cor?: string | null
          criado_em?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          limite_armazenamento_gb?: number | null
          limite_treinamentos?: number
          limite_usuarios?: number
          nome?: string
          ordem?: number | null
          periodo?: string | null
          popular?: boolean | null
          preco?: number
          recursos?: Json | null
        }
        Relationships: []
      }
      progresso_treinamentos: {
        Row: {
          atualizado_em: string | null
          concluido: boolean | null
          criado_em: string | null
          data_conclusao: string | null
          data_inicio: string | null
          id: string
          nota_avaliacao: number | null
          percentual_concluido: number | null
          tempo_assistido_minutos: number | null
          treinamento_id: string
          usuario_id: string
        }
        Insert: {
          atualizado_em?: string | null
          concluido?: boolean | null
          criado_em?: string | null
          data_conclusao?: string | null
          data_inicio?: string | null
          id?: string
          nota_avaliacao?: number | null
          percentual_concluido?: number | null
          tempo_assistido_minutos?: number | null
          treinamento_id: string
          usuario_id: string
        }
        Update: {
          atualizado_em?: string | null
          concluido?: boolean | null
          criado_em?: string | null
          data_conclusao?: string | null
          data_inicio?: string | null
          id?: string
          nota_avaliacao?: number | null
          percentual_concluido?: number | null
          tempo_assistido_minutos?: number | null
          treinamento_id?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "progresso_treinamentos_treinamento_id_fkey"
            columns: ["treinamento_id"]
            isOneToOne: false
            referencedRelation: "treinamentos"
            referencedColumns: ["id"]
          },
        ]
      }
      treinamentos: {
        Row: {
          atualizado_em: string | null
          categoria: string | null
          conteudo_html: string | null
          criado_em: string | null
          data_limite: string | null
          departamento_id: string | null
          descricao: string | null
          duracao_minutos: number | null
          empresa_id: string | null
          id: string
          instrutor_id: string | null
          media_avaliacao: number | null
          nivel: string | null
          obrigatorio: boolean | null
          publicado: boolean | null
          thumbnail_url: string | null
          titulo: string
          total_avaliacoes: number | null
        }
        Insert: {
          atualizado_em?: string | null
          categoria?: string | null
          conteudo_html?: string | null
          criado_em?: string | null
          data_limite?: string | null
          departamento_id?: string | null
          descricao?: string | null
          duracao_minutos?: number | null
          empresa_id?: string | null
          id?: string
          instrutor_id?: string | null
          media_avaliacao?: number | null
          nivel?: string | null
          obrigatorio?: boolean | null
          publicado?: boolean | null
          thumbnail_url?: string | null
          titulo: string
          total_avaliacoes?: number | null
        }
        Update: {
          atualizado_em?: string | null
          categoria?: string | null
          conteudo_html?: string | null
          criado_em?: string | null
          data_limite?: string | null
          departamento_id?: string | null
          descricao?: string | null
          duracao_minutos?: number | null
          empresa_id?: string | null
          id?: string
          instrutor_id?: string | null
          media_avaliacao?: number | null
          nivel?: string | null
          obrigatorio?: boolean | null
          publicado?: boolean | null
          thumbnail_url?: string | null
          titulo?: string
          total_avaliacoes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "treinamentos_departamento_id_fkey"
            columns: ["departamento_id"]
            isOneToOne: false
            referencedRelation: "departamentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treinamentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      uso_empresa: {
        Row: {
          armazenamento_usado_mb: number | null
          atualizado_em: string | null
          empresa_id: string
          id: string
          treinamentos_criados: number | null
          usuarios_ativos: number | null
        }
        Insert: {
          armazenamento_usado_mb?: number | null
          atualizado_em?: string | null
          empresa_id: string
          id?: string
          treinamentos_criados?: number | null
          usuarios_ativos?: number | null
        }
        Update: {
          armazenamento_usado_mb?: number | null
          atualizado_em?: string | null
          empresa_id?: string
          id?: string
          treinamentos_criados?: number | null
          usuarios_ativos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "uso_empresa_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: true
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      usuario_roles: {
        Row: {
          criado_em: string | null
          id: string
          role: Database["public"]["Enums"]["tipo_role"]
          usuario_id: string
        }
        Insert: {
          criado_em?: string | null
          id?: string
          role?: Database["public"]["Enums"]["tipo_role"]
          usuario_id: string
        }
        Update: {
          criado_em?: string | null
          id?: string
          role?: Database["public"]["Enums"]["tipo_role"]
          usuario_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      criar_contrato_plano: {
        Args: { p_empresa_id: string; p_plano_id: string }
        Returns: string
      }
      eh_admin_ou_master: { Args: { usuario_id: string }; Returns: boolean }
      registrar_cnpj_demo: {
        Args: { p_cnpj: string; p_empresa_id: string }
        Returns: undefined
      }
      verificar_cnpj_demo_disponivel: {
        Args: { p_cnpj: string }
        Returns: boolean
      }
      verificar_demo_expirada: {
        Args: { p_empresa_id: string }
        Returns: boolean
      }
      verificar_limite_treinamentos: {
        Args: { p_empresa_id: string }
        Returns: boolean
      }
      verificar_role: {
        Args: {
          _role: Database["public"]["Enums"]["tipo_role"]
          usuario_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      tipo_role: "master" | "admin" | "instrutor" | "usuario"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      tipo_role: ["master", "admin", "instrutor", "usuario"],
    },
  },
} as const
