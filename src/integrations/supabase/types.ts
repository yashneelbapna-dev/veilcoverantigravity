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
      audit_logs: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string
          details: Json | null
          id: string
          ip_address: string | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: string | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      cart: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          selected_color: string | null
          selected_model: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          selected_color?: string | null
          selected_model?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          selected_color?: string | null
          selected_model?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_logs: {
        Row: {
          bot_reply: string
          created_at: string | null
          id: string
          session_id: string | null
          user_id: string | null
          user_message: string
        }
        Insert: {
          bot_reply: string
          created_at?: string | null
          id?: string
          session_id?: string | null
          user_id?: string | null
          user_message: string
        }
        Update: {
          bot_reply?: string
          created_at?: string | null
          id?: string
          session_id?: string | null
          user_id?: string | null
          user_message?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      discount_coupons: {
        Row: {
          coupon_code: string
          created_at: string
          email: string
          id: string
          is_used: boolean
          source: string
        }
        Insert: {
          coupon_code: string
          created_at?: string
          email: string
          id?: string
          is_used?: boolean
          source?: string
        }
        Update: {
          coupon_code?: string
          created_at?: string
          email?: string
          id?: string
          is_used?: boolean
          source?: string
        }
        Relationships: []
      }
      login_attempts: {
        Row: {
          attempted_at: string | null
          email: string
          id: string
          ip_address: string | null
          success: boolean | null
        }
        Insert: {
          attempted_at?: string | null
          email: string
          id?: string
          ip_address?: string | null
          success?: boolean | null
        }
        Update: {
          attempted_at?: string | null
          email?: string
          id?: string
          ip_address?: string | null
          success?: boolean | null
        }
        Relationships: []
      }
      newsletter_emails: {
        Row: {
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Relationships: []
      }
      newsletter_rate_limits: {
        Row: {
          attempt_count: number
          created_at: string
          id: string
          ip_address: string
          window_start: string
        }
        Insert: {
          attempt_count?: number
          created_at?: string
          id?: string
          ip_address: string
          window_start?: string
        }
        Update: {
          attempt_count?: number
          created_at?: string
          id?: string
          ip_address?: string
          window_start?: string
        }
        Relationships: []
      }
      order_tracking_history: {
        Row: {
          created_at: string
          description: string | null
          id: string
          location: string | null
          order_id: string
          status: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          order_id: string
          status: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          location?: string | null
          order_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_tracking_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_id: string | null
          carrier: string | null
          created_at: string
          delivered_at: string | null
          estimated_delivery: string | null
          id: string
          items: Json
          order_number: string
          order_status: string
          payment_method: string | null
          payment_status: string
          phone: string | null
          shipped_at: string | null
          shipping: number
          shipping_address: Json
          subtotal: number
          tax: number
          total: number
          tracking_number: string | null
          transaction_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address_id?: string | null
          carrier?: string | null
          created_at?: string
          delivered_at?: string | null
          estimated_delivery?: string | null
          id?: string
          items: Json
          order_number: string
          order_status?: string
          payment_method?: string | null
          payment_status?: string
          phone?: string | null
          shipped_at?: string | null
          shipping?: number
          shipping_address: Json
          subtotal: number
          tax?: number
          total: number
          tracking_number?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address_id?: string | null
          carrier?: string | null
          created_at?: string
          delivered_at?: string | null
          estimated_delivery?: string | null
          id?: string
          items?: Json
          order_number?: string
          order_status?: string
          payment_method?: string | null
          payment_status?: string
          phone?: string | null
          shipped_at?: string | null
          shipping?: number
          shipping_address?: Json
          subtotal?: number
          tax?: number
          total?: number
          tracking_number?: string | null
          transaction_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "user_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      password_reset_otps: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          otp_hash: string
          used: boolean
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          otp_hash: string
          used?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          otp_hash?: string
          used?: boolean
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          content: string | null
          created_at: string
          helpful_count: number | null
          id: string
          photos: string[] | null
          product_id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string
          verified_purchase: boolean | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          photos?: string[] | null
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
          verified_purchase?: boolean | null
        }
        Update: {
          content?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          photos?: string[] | null
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
          verified_purchase?: boolean | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          collection: string | null
          colors: string[] | null
          compare_price: number | null
          created_at: string | null
          description: string | null
          id: string
          images: string[] | null
          images_by_color: Json | null
          in_stock: boolean | null
          models: string[] | null
          name: string
          price: number
          rating: number | null
          review_count: number | null
          stock_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          collection?: string | null
          colors?: string[] | null
          compare_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          images_by_color?: Json | null
          in_stock?: boolean | null
          models?: string[] | null
          name: string
          price: number
          rating?: number | null
          review_count?: number | null
          stock_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          collection?: string | null
          colors?: string[] | null
          compare_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          images?: string[] | null
          images_by_color?: Json | null
          in_stock?: boolean | null
          models?: string[] | null
          name?: string
          price?: number
          rating?: number | null
          review_count?: number | null
          stock_quantity?: number | null
          updated_at?: string | null
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
          notify_email: boolean
          notify_whatsapp: boolean
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
          notify_email?: boolean
          notify_whatsapp?: boolean
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
          notify_email?: boolean
          notify_whatsapp?: boolean
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      review_votes: {
        Row: {
          created_at: string
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "product_reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      search_history: {
        Row: {
          created_at: string
          id: string
          query_text: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          query_text: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          query_text?: string
          user_id?: string
        }
        Relationships: []
      }
      user_addresses: {
        Row: {
          address_line1: string
          address_line2: string | null
          city: string
          created_at: string
          id: string
          is_default: boolean
          name: string
          phone: string
          pincode: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          address_line1: string
          address_line2?: string | null
          city: string
          created_at?: string
          id?: string
          is_default?: boolean
          name: string
          phone: string
          pincode: string
          state: string
          updated_at?: string
          user_id: string
        }
        Update: {
          address_line1?: string
          address_line2?: string | null
          city?: string
          created_at?: string
          id?: string
          is_default?: boolean
          name?: string
          phone?: string
          pincode?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_user_order: { Args: { order_id: string }; Returns: boolean }
      check_login_rate_limit: {
        Args: { check_email: string }
        Returns: boolean
      }
      check_newsletter_rate_limit: {
        Args: {
          check_ip: string
          max_attempts?: number
          window_minutes?: number
        }
        Returns: boolean
      }
      get_review_helpful_count: {
        Args: { review_uuid: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_user_voted: {
        Args: { review_uuid: string; user_uuid: string }
        Returns: boolean
      }
      purge_old_search_history: { Args: never; Returns: number }
      record_login_attempt: {
        Args: {
          attempt_email: string
          attempt_ip_address?: string
          attempt_success: boolean
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
