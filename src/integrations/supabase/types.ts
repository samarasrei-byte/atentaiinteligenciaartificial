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
      ai_chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      autonomos_simulations: {
        Row: {
          annual_savings_cents: number
          city: string | null
          created_at: string
          id: string
          lucro_presumido_tax_cents: number | null
          me_simples_tax_cents: number | null
          mei_tax_cents: number | null
          monthly_expenses_cents: number
          monthly_revenue_cents: number
          notes: string | null
          pf_tax_cents: number
          profession: string
          profession_category: string
          recommendation: string
          state: string
          user_id: string
        }
        Insert: {
          annual_savings_cents: number
          city?: string | null
          created_at?: string
          id?: string
          lucro_presumido_tax_cents?: number | null
          me_simples_tax_cents?: number | null
          mei_tax_cents?: number | null
          monthly_expenses_cents?: number
          monthly_revenue_cents: number
          notes?: string | null
          pf_tax_cents: number
          profession: string
          profession_category: string
          recommendation: string
          state: string
          user_id: string
        }
        Update: {
          annual_savings_cents?: number
          city?: string | null
          created_at?: string
          id?: string
          lucro_presumido_tax_cents?: number | null
          me_simples_tax_cents?: number | null
          mei_tax_cents?: number | null
          monthly_expenses_cents?: number
          monthly_revenue_cents?: number
          notes?: string | null
          pf_tax_cents?: number
          profession?: string
          profession_category?: string
          recommendation?: string
          state?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          attachment_name: string | null
          attachment_type: string | null
          attachment_url: string | null
          consultation_id: string
          content: string
          created_at: string
          id: string
          read_at: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          consultation_id: string
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          consultation_id?: string
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          annual_revenue_cents: number
          city: string | null
          cnpj: string | null
          company_name: string
          company_type: Database["public"]["Enums"]["company_type"]
          created_at: string
          employee_count: number
          foundation_date: string | null
          id: string
          main_activity: string | null
          monthly_revenue_cents: number
          onboarding_completed: boolean
          secondary_activities: string[] | null
          sector: Database["public"]["Enums"]["company_sector"]
          state: string | null
          tax_regime: Database["public"]["Enums"]["tax_regime"]
          trade_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          annual_revenue_cents?: number
          city?: string | null
          cnpj?: string | null
          company_name: string
          company_type: Database["public"]["Enums"]["company_type"]
          created_at?: string
          employee_count?: number
          foundation_date?: string | null
          id?: string
          main_activity?: string | null
          monthly_revenue_cents?: number
          onboarding_completed?: boolean
          secondary_activities?: string[] | null
          sector: Database["public"]["Enums"]["company_sector"]
          state?: string | null
          tax_regime: Database["public"]["Enums"]["tax_regime"]
          trade_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          annual_revenue_cents?: number
          city?: string | null
          cnpj?: string | null
          company_name?: string
          company_type?: Database["public"]["Enums"]["company_type"]
          created_at?: string
          employee_count?: number
          foundation_date?: string | null
          id?: string
          main_activity?: string | null
          monthly_revenue_cents?: number
          onboarding_completed?: boolean
          secondary_activities?: string[] | null
          sector?: Database["public"]["Enums"]["company_sector"]
          state?: string | null
          tax_regime?: Database["public"]["Enums"]["tax_regime"]
          trade_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      consultations: {
        Row: {
          completed_at: string | null
          contador_id: string
          created_at: string
          id: string
          notes: string | null
          platform_fee_cents: number
          price_cents: number
          rating: number | null
          review_text: string | null
          reviewed_at: string | null
          scheduled_at: string | null
          status: Database["public"]["Enums"]["consultation_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          contador_id: string
          created_at?: string
          id?: string
          notes?: string | null
          platform_fee_cents?: number
          price_cents?: number
          rating?: number | null
          review_text?: string | null
          reviewed_at?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["consultation_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          contador_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          platform_fee_cents?: number
          price_cents?: number
          rating?: number | null
          review_text?: string | null
          reviewed_at?: string | null
          scheduled_at?: string | null
          status?: Database["public"]["Enums"]["consultation_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      contador_profiles: {
        Row: {
          available: boolean | null
          bio: string | null
          crc_number: string | null
          created_at: string
          hourly_rate_cents: number | null
          id: string
          rating: number | null
          specialty: string | null
          total_consultations: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          available?: boolean | null
          bio?: string | null
          crc_number?: string | null
          created_at?: string
          hourly_rate_cents?: number | null
          id?: string
          rating?: number | null
          specialty?: string | null
          total_consultations?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          available?: boolean | null
          bio?: string | null
          crc_number?: string | null
          created_at?: string
          hourly_rate_cents?: number | null
          id?: string
          rating?: number | null
          specialty?: string | null
          total_consultations?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_question_usage: {
        Row: {
          created_at: string
          id: string
          question_count: number
          updated_at: string
          usage_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          question_count?: number
          updated_at?: string
          usage_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          question_count?: number
          updated_at?: string
          usage_date?: string
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount_cents: number
          created_at: string
          id: string
          payment_type: string
          reference_id: string | null
          status: string
          stripe_payment_intent_id: string | null
          user_id: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          id?: string
          payment_type: string
          reference_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          id?: string
          payment_type?: string
          reference_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: string
          price_cents: number
          status: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          price_cents?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          price_cents?: number
          status?: Database["public"]["Enums"]["subscription_status"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_admin: boolean
          read_at: string | null
          sender_id: string
          ticket_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_admin?: boolean
          read_at?: string | null
          sender_id: string
          ticket_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_admin?: boolean
          read_at?: string | null
          sender_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          id: string
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tax_autopilot: {
        Row: {
          accumulated_savings_cents: number
          activity_type: string
          created_at: string
          current_structure: string
          id: string
          is_active: boolean
          last_optimization_at: string | null
          last_optimization_description: string | null
          monthly_expenses_cents: number
          monthly_revenue_cents: number
          next_reevaluation_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          accumulated_savings_cents?: number
          activity_type?: string
          created_at?: string
          current_structure?: string
          id?: string
          is_active?: boolean
          last_optimization_at?: string | null
          last_optimization_description?: string | null
          monthly_expenses_cents?: number
          monthly_revenue_cents?: number
          next_reevaluation_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          accumulated_savings_cents?: number
          activity_type?: string
          created_at?: string
          current_structure?: string
          id?: string
          is_active?: boolean
          last_optimization_at?: string | null
          last_optimization_description?: string | null
          monthly_expenses_cents?: number
          monthly_revenue_cents?: number
          next_reevaluation_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tax_autopilot_alerts: {
        Row: {
          alert_type: string
          autopilot_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          user_id: string
        }
        Insert: {
          alert_type: string
          autopilot_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          user_id: string
        }
        Update: {
          alert_type?: string
          autopilot_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tax_autopilot_alerts_autopilot_id_fkey"
            columns: ["autopilot_id"]
            isOneToOne: false
            referencedRelation: "tax_autopilot"
            referencedColumns: ["id"]
          },
        ]
      }
      tax_simulations: {
        Row: {
          cbs_cents: number | null
          cofins_cents: number | null
          created_at: string
          ibs_cents: number | null
          icms_cents: number | null
          id: string
          is_cents: number | null
          iss_cents: number | null
          pis_cents: number | null
          revenue_cents: number
          tax_type: string
          total_tax_cents: number
          user_id: string
        }
        Insert: {
          cbs_cents?: number | null
          cofins_cents?: number | null
          created_at?: string
          ibs_cents?: number | null
          icms_cents?: number | null
          id?: string
          is_cents?: number | null
          iss_cents?: number | null
          pis_cents?: number | null
          revenue_cents: number
          tax_type: string
          total_tax_cents: number
          user_id: string
        }
        Update: {
          cbs_cents?: number | null
          cofins_cents?: number | null
          created_at?: string
          ibs_cents?: number | null
          icms_cents?: number | null
          id?: string
          is_cents?: number | null
          iss_cents?: number | null
          pis_cents?: number | null
          revenue_cents?: number
          tax_type?: string
          total_tax_cents?: number
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          amount_cents: number
          contador_id: string
          created_at: string
          id: string
          notes: string | null
          pix_key: string
          pix_key_type: string
          processed_at: string | null
          processed_by: string | null
          rejection_reason: string | null
          requested_at: string
          status: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          contador_id: string
          created_at?: string
          id?: string
          notes?: string | null
          pix_key: string
          pix_key_type: string
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          contador_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          pix_key?: string
          pix_key_type?: string
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          requested_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_daily_question_count: { Args: { p_user_id: string }; Returns: number }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_daily_questions: {
        Args: { p_user_id: string }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "contador" | "user"
      company_sector:
        | "comercio"
        | "servicos"
        | "industria"
        | "agronegocio"
        | "tecnologia"
        | "saude"
        | "educacao"
        | "construcao"
        | "transporte"
        | "alimentacao"
        | "outro"
      company_type:
        | "mei"
        | "me"
        | "epp"
        | "ltda"
        | "eireli"
        | "sa_fechada"
        | "sa_aberta"
        | "cooperativa"
      consultation_status: "pending" | "scheduled" | "completed" | "cancelled"
      subscription_status: "active" | "cancelled" | "pending" | "expired"
      tax_regime:
        | "simples_nacional"
        | "lucro_presumido"
        | "lucro_real"
        | "lucro_arbitrado"
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
      app_role: ["admin", "contador", "user"],
      company_sector: [
        "comercio",
        "servicos",
        "industria",
        "agronegocio",
        "tecnologia",
        "saude",
        "educacao",
        "construcao",
        "transporte",
        "alimentacao",
        "outro",
      ],
      company_type: [
        "mei",
        "me",
        "epp",
        "ltda",
        "eireli",
        "sa_fechada",
        "sa_aberta",
        "cooperativa",
      ],
      consultation_status: ["pending", "scheduled", "completed", "cancelled"],
      subscription_status: ["active", "cancelled", "pending", "expired"],
      tax_regime: [
        "simples_nacional",
        "lucro_presumido",
        "lucro_real",
        "lucro_arbitrado",
      ],
    },
  },
} as const
