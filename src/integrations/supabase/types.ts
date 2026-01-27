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
      affiliate_commissions: {
        Row: {
          affiliate_id: string
          affiliate_value_cents: number
          created_at: string
          id: string
          lead_id: string | null
          paid_at: string | null
          platform_fee_cents: number
          service_id: string | null
          status: string
          total_value_cents: number
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          affiliate_value_cents: number
          created_at?: string
          id?: string
          lead_id?: string | null
          paid_at?: string | null
          platform_fee_cents: number
          service_id?: string | null
          status?: string
          total_value_cents: number
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          affiliate_value_cents?: number
          created_at?: string
          id?: string
          lead_id?: string | null
          paid_at?: string | null
          platform_fee_cents?: number
          service_id?: string | null
          status?: string
          total_value_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "affiliate_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_commissions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "affiliate_services"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_coupon_uses: {
        Row: {
          coupon_id: string
          created_at: string | null
          discount_amount_cents: number
          final_amount_cents: number
          id: string
          original_amount_cents: number
          service_type: string
          stripe_session_id: string | null
          user_email: string
          user_id: string | null
        }
        Insert: {
          coupon_id: string
          created_at?: string | null
          discount_amount_cents: number
          final_amount_cents: number
          id?: string
          original_amount_cents: number
          service_type: string
          stripe_session_id?: string | null
          user_email: string
          user_id?: string | null
        }
        Update: {
          coupon_id?: string
          created_at?: string | null
          discount_amount_cents?: number
          final_amount_cents?: number
          id?: string
          original_amount_cents?: number
          service_type?: string
          stripe_session_id?: string | null
          user_email?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_coupon_uses_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "affiliate_coupons"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_coupons: {
        Row: {
          affiliate_id: string
          applicable_services: string[] | null
          code: string
          created_at: string | null
          current_uses: number | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          updated_at: string | null
        }
        Insert: {
          affiliate_id: string
          applicable_services?: string[] | null
          code: string
          created_at?: string | null
          current_uses?: number | null
          discount_type?: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          updated_at?: string | null
        }
        Update: {
          affiliate_id?: string
          applicable_services?: string[] | null
          code?: string
          created_at?: string | null
          current_uses?: number | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_coupons_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_leads: {
        Row: {
          affiliate_id: string
          annual_revenue_cents: number | null
          cnpj: string | null
          company_name: string | null
          converted_at: string | null
          created_at: string
          email: string
          full_name: string
          has_audited_before: boolean | null
          has_restrictions: boolean | null
          id: string
          notes: string | null
          phone: string
          potential_value_cents: number | null
          segment: string | null
          service_id: string | null
          state: string | null
          status: string
          tax_regime: string | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          affiliate_id: string
          annual_revenue_cents?: number | null
          cnpj?: string | null
          company_name?: string | null
          converted_at?: string | null
          created_at?: string
          email: string
          full_name: string
          has_audited_before?: boolean | null
          has_restrictions?: boolean | null
          id?: string
          notes?: string | null
          phone: string
          potential_value_cents?: number | null
          segment?: string | null
          service_id?: string | null
          state?: string | null
          status?: string
          tax_regime?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          affiliate_id?: string
          annual_revenue_cents?: number | null
          cnpj?: string | null
          company_name?: string | null
          converted_at?: string | null
          created_at?: string
          email?: string
          full_name?: string
          has_audited_before?: boolean | null
          has_restrictions?: boolean | null
          id?: string
          notes?: string | null
          phone?: string
          potential_value_cents?: number | null
          segment?: string | null
          service_id?: string | null
          state?: string | null
          status?: string
          tax_regime?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_leads_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_leads_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "affiliate_services"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_service_activations: {
        Row: {
          affiliate_id: string
          created_at: string
          id: string
          is_enabled: boolean | null
          service_id: string
        }
        Insert: {
          affiliate_id: string
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          service_id: string
        }
        Update: {
          affiliate_id?: string
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_service_activations_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_service_activations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "affiliate_services"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_services: {
        Row: {
          base_price_cents: number | null
          benefits: string[] | null
          commission_percent: number
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          base_price_cents?: number | null
          benefits?: string[] | null
          commission_percent?: number
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          base_price_cents?: number | null
          benefits?: string[] | null
          commission_percent?: number
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      affiliate_withdrawals: {
        Row: {
          affiliate_id: string
          amount_cents: number
          created_at: string
          id: string
          net_amount_cents: number
          pix_key: string
          pix_key_type: string
          platform_fee_cents: number
          processed_at: string | null
          processed_by: string | null
          rejection_reason: string | null
          status: string
          updated_at: string
        }
        Insert: {
          affiliate_id: string
          amount_cents: number
          created_at?: string
          id?: string
          net_amount_cents: number
          pix_key: string
          pix_key_type: string
          platform_fee_cents: number
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          affiliate_id?: string
          amount_cents?: number
          created_at?: string
          id?: string
          net_amount_cents?: number
          pix_key?: string
          pix_key_type?: string
          platform_fee_cents?: number
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_withdrawals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          affiliate_code: string
          avatar_url: string | null
          bank_account: string | null
          bank_agency: string | null
          bank_name: string | null
          city: string | null
          company_name: string | null
          cpf: string
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          phone: string
          pix_key: string | null
          pix_key_type: string | null
          state: string | null
          terms_accepted_at: string | null
          updated_at: string
          user_id: string
          whatsapp_number: string | null
        }
        Insert: {
          affiliate_code?: string
          avatar_url?: string | null
          bank_account?: string | null
          bank_agency?: string | null
          bank_name?: string | null
          city?: string | null
          company_name?: string | null
          cpf: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          phone: string
          pix_key?: string | null
          pix_key_type?: string | null
          state?: string | null
          terms_accepted_at?: string | null
          updated_at?: string
          user_id: string
          whatsapp_number?: string | null
        }
        Update: {
          affiliate_code?: string
          avatar_url?: string | null
          bank_account?: string | null
          bank_agency?: string | null
          bank_name?: string | null
          city?: string | null
          company_name?: string | null
          cpf?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string
          pix_key?: string | null
          pix_key_type?: string | null
          state?: string | null
          terms_accepted_at?: string | null
          updated_at?: string
          user_id?: string
          whatsapp_number?: string | null
        }
        Relationships: []
      }
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
      audit_logs: {
        Row: {
          action_type: string
          created_at: string
          failure_reason: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          route_attempted: string | null
          success: boolean
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          route_attempted?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          failure_reason?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          route_attempted?: string | null
          success?: boolean
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      autonomo_financial_goals: {
        Row: {
          completed_at: string | null
          created_at: string
          current_value_cents: number
          description: string | null
          goal_type: string
          id: string
          is_completed: boolean
          target_date: string | null
          target_value_cents: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_value_cents?: number
          description?: string | null
          goal_type?: string
          id?: string
          is_completed?: boolean
          target_date?: string | null
          target_value_cents: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_value_cents?: number
          description?: string | null
          goal_type?: string
          id?: string
          is_completed?: boolean
          target_date?: string | null
          target_value_cents?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      autonomo_profiles: {
        Row: {
          bio: string | null
          city: string | null
          cpf: string | null
          crc_number: string | null
          created_at: string
          current_regime: string | null
          id: string
          monthly_revenue_average_cents: number | null
          phone: string | null
          profession: string | null
          profession_category: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          city?: string | null
          cpf?: string | null
          crc_number?: string | null
          created_at?: string
          current_regime?: string | null
          id?: string
          monthly_revenue_average_cents?: number | null
          phone?: string | null
          profession?: string | null
          profession_category?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          city?: string | null
          cpf?: string | null
          crc_number?: string | null
          created_at?: string
          current_regime?: string | null
          id?: string
          monthly_revenue_average_cents?: number | null
          phone?: string | null
          profession?: string | null
          profession_category?: string | null
          state?: string | null
          updated_at?: string
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
      certificate_requests: {
        Row: {
          amount_cents: number
          certificate_type: string
          contador_id: string | null
          created_at: string
          document_name: string | null
          document_url: string | null
          id: string
          notes: string | null
          payment_status: string
          processed_at: string | null
          rejection_reason: string | null
          requested_at: string
          status: string
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents?: number
          certificate_type: string
          contador_id?: string | null
          created_at?: string
          document_name?: string | null
          document_url?: string | null
          id?: string
          notes?: string | null
          payment_status?: string
          processed_at?: string | null
          rejection_reason?: string | null
          requested_at?: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          certificate_type?: string
          contador_id?: string | null
          created_at?: string
          document_name?: string | null
          document_url?: string | null
          id?: string
          notes?: string | null
          payment_status?: string
          processed_at?: string | null
          rejection_reason?: string | null
          requested_at?: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
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
      company_opening_documents: {
        Row: {
          created_at: string
          document_name: string
          document_type: string
          file_path: string
          file_size_bytes: number | null
          id: string
          mime_type: string | null
          rejection_reason: string | null
          request_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type: string
          file_path: string
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          rejection_reason?: string | null
          request_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: string
          file_path?: string
          file_size_bytes?: number | null
          id?: string
          mime_type?: string | null
          rejection_reason?: string | null
          request_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_opening_documents_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "company_opening_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      company_opening_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          notification_type: string
          read_at: string | null
          request_id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          notification_type: string
          read_at?: string | null
          request_id: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          notification_type?: string
          read_at?: string | null
          request_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_opening_notifications_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "company_opening_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      company_opening_requests: {
        Row: {
          annual_revenue_cents: number | null
          city: string | null
          contador_id: string | null
          contador_notes: string | null
          cpf: string | null
          created_at: string
          current_situation: string | null
          email: string | null
          full_name: string
          has_employees: boolean | null
          id: string
          monthly_expenses_cents: number | null
          payment_status: string | null
          phone: string | null
          profession: string | null
          recommendation_reasons: string[] | null
          recommended_regime: string | null
          service_description: string | null
          service_price_cents: number | null
          state: string | null
          status: string
          status_updated_at: string | null
          updated_at: string
          user_id: string
          wants_partner: boolean | null
        }
        Insert: {
          annual_revenue_cents?: number | null
          city?: string | null
          contador_id?: string | null
          contador_notes?: string | null
          cpf?: string | null
          created_at?: string
          current_situation?: string | null
          email?: string | null
          full_name: string
          has_employees?: boolean | null
          id?: string
          monthly_expenses_cents?: number | null
          payment_status?: string | null
          phone?: string | null
          profession?: string | null
          recommendation_reasons?: string[] | null
          recommended_regime?: string | null
          service_description?: string | null
          service_price_cents?: number | null
          state?: string | null
          status?: string
          status_updated_at?: string | null
          updated_at?: string
          user_id: string
          wants_partner?: boolean | null
        }
        Update: {
          annual_revenue_cents?: number | null
          city?: string | null
          contador_id?: string | null
          contador_notes?: string | null
          cpf?: string | null
          created_at?: string
          current_situation?: string | null
          email?: string | null
          full_name?: string
          has_employees?: boolean | null
          id?: string
          monthly_expenses_cents?: number | null
          payment_status?: string | null
          phone?: string | null
          profession?: string | null
          recommendation_reasons?: string[] | null
          recommended_regime?: string | null
          service_description?: string | null
          service_price_cents?: number | null
          state?: string | null
          status?: string
          status_updated_at?: string | null
          updated_at?: string
          user_id?: string
          wants_partner?: boolean | null
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
          stripe_account_id: string | null
          stripe_account_status: string | null
          stripe_onboarding_completed: boolean | null
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
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          stripe_onboarding_completed?: boolean | null
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
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          stripe_onboarding_completed?: boolean | null
          total_consultations?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_repair_chat_messages: {
        Row: {
          attachment_name: string | null
          attachment_type: string | null
          attachment_url: string | null
          content: string
          created_at: string
          id: string
          read_at: string | null
          receiver_id: string
          request_id: string
          sender_id: string
        }
        Insert: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          receiver_id: string
          request_id: string
          sender_id: string
        }
        Update: {
          attachment_name?: string | null
          attachment_type?: string | null
          attachment_url?: string | null
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          receiver_id?: string
          request_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_repair_chat_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "credit_repair_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_repair_partner_users: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          partner_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          partner_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          partner_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_repair_partner_users_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "credit_repair_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_repair_partners: {
        Row: {
          address: string | null
          city: string | null
          cnpj: string | null
          commission_percent: number
          company_name: string
          contact_person: string
          created_at: string
          email: string
          id: string
          is_active: boolean
          notes: string | null
          phone: string | null
          state: string | null
          status: string
          stripe_account_id: string | null
          total_requests: number
          total_revenue_cents: number
          trade_name: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          commission_percent?: number
          company_name: string
          contact_person: string
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          notes?: string | null
          phone?: string | null
          state?: string | null
          status?: string
          stripe_account_id?: string | null
          total_requests?: number
          total_revenue_cents?: number
          trade_name?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          cnpj?: string | null
          commission_percent?: number
          company_name?: string
          contact_person?: string
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          phone?: string | null
          state?: string | null
          status?: string
          stripe_account_id?: string | null
          total_requests?: number
          total_revenue_cents?: number
          trade_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      credit_repair_requests: {
        Row: {
          bureaus_selected: string[] | null
          completed_at: string | null
          contador_id: string | null
          contador_notes: string | null
          cpf: string | null
          created_at: string
          creditors: string[] | null
          debt_amount_cents: number
          debt_description: string | null
          discount_applied: boolean | null
          document_url: string | null
          email: string | null
          final_price_cents: number
          full_name: string
          id: string
          notes: string | null
          partner_id: string | null
          payment_status: string
          phone: string | null
          service_price_cents: number
          status: string
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bureaus_selected?: string[] | null
          completed_at?: string | null
          contador_id?: string | null
          contador_notes?: string | null
          cpf?: string | null
          created_at?: string
          creditors?: string[] | null
          debt_amount_cents?: number
          debt_description?: string | null
          discount_applied?: boolean | null
          document_url?: string | null
          email?: string | null
          final_price_cents?: number
          full_name: string
          id?: string
          notes?: string | null
          partner_id?: string | null
          payment_status?: string
          phone?: string | null
          service_price_cents?: number
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bureaus_selected?: string[] | null
          completed_at?: string | null
          contador_id?: string | null
          contador_notes?: string | null
          cpf?: string | null
          created_at?: string
          creditors?: string[] | null
          debt_amount_cents?: number
          debt_description?: string | null
          discount_applied?: boolean | null
          document_url?: string | null
          email?: string | null
          final_price_cents?: number
          full_name?: string
          id?: string
          notes?: string | null
          partner_id?: string | null
          payment_status?: string
          phone?: string | null
          service_price_cents?: number
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_repair_requests_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "credit_repair_partners"
            referencedColumns: ["id"]
          },
        ]
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
      fiscal_analysis_requests: {
        Row: {
          analysis_period_end: string | null
          analysis_period_start: string | null
          annual_revenue_cents: number | null
          cnae_code: string | null
          cnpj: string
          company_name: string
          cpf: string | null
          created_at: string
          email: string
          full_name: string
          guide_document_url: string | null
          guide_type: string | null
          guide_value_cents: number | null
          id: string
          identified_value_cents: number | null
          new_guide_url: string | null
          notes: string | null
          paid_at: string | null
          partner_id: string | null
          payment_status: string | null
          phone: string | null
          processed_at: string | null
          processed_by: string | null
          report_url: string | null
          risk_description: string | null
          risk_detected: boolean | null
          service_fee_cents: number | null
          status: string
          stripe_session_id: string | null
          tax_regime: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          analysis_period_end?: string | null
          analysis_period_start?: string | null
          annual_revenue_cents?: number | null
          cnae_code?: string | null
          cnpj: string
          company_name: string
          cpf?: string | null
          created_at?: string
          email: string
          full_name: string
          guide_document_url?: string | null
          guide_type?: string | null
          guide_value_cents?: number | null
          id?: string
          identified_value_cents?: number | null
          new_guide_url?: string | null
          notes?: string | null
          paid_at?: string | null
          partner_id?: string | null
          payment_status?: string | null
          phone?: string | null
          processed_at?: string | null
          processed_by?: string | null
          report_url?: string | null
          risk_description?: string | null
          risk_detected?: boolean | null
          service_fee_cents?: number | null
          status?: string
          stripe_session_id?: string | null
          tax_regime: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          analysis_period_end?: string | null
          analysis_period_start?: string | null
          annual_revenue_cents?: number | null
          cnae_code?: string | null
          cnpj?: string
          company_name?: string
          cpf?: string | null
          created_at?: string
          email?: string
          full_name?: string
          guide_document_url?: string | null
          guide_type?: string | null
          guide_value_cents?: number | null
          id?: string
          identified_value_cents?: number | null
          new_guide_url?: string | null
          notes?: string | null
          paid_at?: string | null
          partner_id?: string | null
          payment_status?: string | null
          phone?: string | null
          processed_at?: string | null
          processed_by?: string | null
          report_url?: string | null
          risk_description?: string | null
          risk_detected?: boolean | null
          service_fee_cents?: number | null
          status?: string
          stripe_session_id?: string | null
          tax_regime?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fiscal_analysis_requests_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "credit_repair_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      ir_requests: {
        Row: {
          base_price_cents: number
          completed_at: string | null
          contador_id: string | null
          cpf: string | null
          created_at: string
          declaration_receipt_url: string | null
          discount_applied: boolean | null
          document_url: string | null
          email: string | null
          final_price_cents: number
          fiscal_year: number
          full_name: string
          has_foreign_income: boolean | null
          has_investments: boolean | null
          has_rental_income: boolean | null
          id: string
          income_sources_count: number | null
          ir_type: string
          notes: string | null
          payment_status: string
          phone: string | null
          status: string
          stripe_session_id: string | null
          submitted_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          base_price_cents?: number
          completed_at?: string | null
          contador_id?: string | null
          cpf?: string | null
          created_at?: string
          declaration_receipt_url?: string | null
          discount_applied?: boolean | null
          document_url?: string | null
          email?: string | null
          final_price_cents?: number
          fiscal_year: number
          full_name: string
          has_foreign_income?: boolean | null
          has_investments?: boolean | null
          has_rental_income?: boolean | null
          id?: string
          income_sources_count?: number | null
          ir_type?: string
          notes?: string | null
          payment_status?: string
          phone?: string | null
          status?: string
          stripe_session_id?: string | null
          submitted_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          base_price_cents?: number
          completed_at?: string | null
          contador_id?: string | null
          cpf?: string | null
          created_at?: string
          declaration_receipt_url?: string | null
          discount_applied?: boolean | null
          document_url?: string | null
          email?: string | null
          final_price_cents?: number
          fiscal_year?: number
          full_name?: string
          has_foreign_income?: boolean | null
          has_investments?: boolean | null
          has_rental_income?: boolean | null
          id?: string
          income_sources_count?: number | null
          ir_type?: string
          notes?: string | null
          payment_status?: string
          phone?: string | null
          status?: string
          stripe_session_id?: string | null
          submitted_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mass_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          message_type: string
          recipient_count: number | null
          sent_at: string
          sent_by: string
          target_audience: string
          title: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          message_type?: string
          recipient_count?: number | null
          sent_at?: string
          sent_by: string
          target_audience?: string
          title: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          message_type?: string
          recipient_count?: number | null
          sent_at?: string
          sent_by?: string
          target_audience?: string
          title?: string
        }
        Relationships: []
      }
      partner_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          email: string | null
          expires_at: string
          id: string
          invitation_token: string
          invited_by: string
          partner_id: string
          status: string
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by: string
          partner_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email?: string | null
          expires_at?: string
          id?: string
          invitation_token?: string
          invited_by?: string
          partner_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_invitations_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "credit_repair_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_withdrawal_requests: {
        Row: {
          amount_cents: number
          created_at: string
          id: string
          notes: string | null
          partner_id: string
          pix_key: string
          pix_key_type: string
          processed_at: string | null
          processed_by: string | null
          rejection_reason: string | null
          requested_at: string
          requested_by: string
          status: string
          updated_at: string
        }
        Insert: {
          amount_cents: number
          created_at?: string
          id?: string
          notes?: string | null
          partner_id: string
          pix_key: string
          pix_key_type: string
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          requested_at?: string
          requested_by: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          id?: string
          notes?: string | null
          partner_id?: string
          pix_key?: string
          pix_key_type?: string
          processed_at?: string | null
          processed_by?: string | null
          rejection_reason?: string | null
          requested_at?: string
          requested_by?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_withdrawal_requests_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "credit_repair_partners"
            referencedColumns: ["id"]
          },
        ]
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
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          identifier: string
          request_count: number
          updated_at: string
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          identifier: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          identifier?: string
          request_count?: number
          updated_at?: string
          window_start?: string
        }
        Relationships: []
      }
      service_notifications: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          notification_type: string
          read_at: string | null
          service_type: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          notification_type?: string
          read_at?: string | null
          service_type?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          notification_type?: string
          read_at?: string | null
          service_type?: string | null
          title?: string
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
      user_broadcast_messages: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_broadcast_messages_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "mass_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      user_cashback: {
        Row: {
          cashback_amount_cents: number
          cashback_percent: number
          claimed_at: string | null
          created_at: string
          expires_at: string | null
          id: string
          is_claimed: boolean
          month_year: string
          services_used: number
          total_spent_cents: number
          updated_at: string
          user_id: string
        }
        Insert: {
          cashback_amount_cents?: number
          cashback_percent?: number
          claimed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_claimed?: boolean
          month_year: string
          services_used?: number
          total_spent_cents?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          cashback_amount_cents?: number
          cashback_percent?: number
          claimed_at?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          is_claimed?: boolean
          month_year?: string
          services_used?: number
          total_spent_cents?: number
          updated_at?: string
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
      contador_profiles_public: {
        Row: {
          available: boolean | null
          bio: string | null
          crc_number: string | null
          created_at: string | null
          hourly_rate_cents: number | null
          id: string | null
          rating: number | null
          specialty: string | null
          total_consultations: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          available?: boolean | null
          bio?: string | null
          crc_number?: string | null
          created_at?: string | null
          hourly_rate_cents?: number | null
          id?: string | null
          rating?: number | null
          specialty?: string | null
          total_consultations?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          available?: boolean | null
          bio?: string | null
          crc_number?: string | null
          created_at?: string | null
          hourly_rate_cents?: number | null
          id?: string | null
          rating?: number | null
          specialty?: string | null
          total_consultations?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      apply_affiliate_coupon: {
        Args: {
          p_coupon_id: string
          p_discount_amount_cents: number
          p_original_amount_cents: number
          p_service_type: string
          p_stripe_session_id?: string
          p_user_email: string
        }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_endpoint: string
          p_identifier: string
          p_max_requests?: number
          p_window_seconds?: number
        }
        Returns: Json
      }
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
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
      is_valid_contador_assignment: {
        Args: { p_contador_id: string; p_request_user_id: string }
        Returns: boolean
      }
      validate_affiliate_coupon: {
        Args: { p_code: string; p_service_type?: string }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "contador" | "user" | "autonomo" | "affiliate"
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
      app_role: ["admin", "contador", "user", "autonomo", "affiliate"],
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
