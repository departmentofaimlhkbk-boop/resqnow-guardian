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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      emergency_contacts: {
        Row: {
          color: string
          created_at: string
          id: string
          is_selected: boolean
          name: string
          phone: string
          relation: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          is_selected?: boolean
          name: string
          phone: string
          relation?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          is_selected?: boolean
          name?: string
          phone?: string
          relation?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      emergency_requests: {
        Row: {
          created_at: string
          distance_km: number | null
          expires_at: string
          helper_id: string
          id: string
          incident_id: string
          responded_at: string | null
          status: Database["public"]["Enums"]["request_status"]
        }
        Insert: {
          created_at?: string
          distance_km?: number | null
          expires_at?: string
          helper_id: string
          id?: string
          incident_id: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["request_status"]
        }
        Update: {
          created_at?: string
          distance_km?: number | null
          expires_at?: string
          helper_id?: string
          id?: string
          incident_id?: string
          responded_at?: string | null
          status?: Database["public"]["Enums"]["request_status"]
        }
        Relationships: [
          {
            foreignKeyName: "emergency_requests_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      helper_locations: {
        Row: {
          accuracy_m: number | null
          created_at: string
          helper_id: string
          id: string
          incident_id: string | null
          latitude: number
          longitude: number
        }
        Insert: {
          accuracy_m?: number | null
          created_at?: string
          helper_id: string
          id?: string
          incident_id?: string | null
          latitude: number
          longitude: number
        }
        Update: {
          accuracy_m?: number | null
          created_at?: string
          helper_id?: string
          id?: string
          incident_id?: string | null
          latitude?: number
          longitude?: number
        }
        Relationships: [
          {
            foreignKeyName: "helper_locations_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      helpers: {
        Row: {
          created_at: string
          current_incident_id: string | null
          helps_count: number
          is_available: boolean
          is_verified: boolean
          last_latitude: number | null
          last_longitude: number | null
          last_seen_at: string | null
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_incident_id?: string | null
          helps_count?: number
          is_available?: boolean
          is_verified?: boolean
          last_latitude?: number | null
          last_longitude?: number | null
          last_seen_at?: string | null
          rating?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_incident_id?: string | null
          helps_count?: number
          is_available?: boolean
          is_verified?: boolean
          last_latitude?: number | null
          last_longitude?: number | null
          last_seen_at?: string | null
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hospitals: {
        Row: {
          address: string | null
          beds_available: number
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          trauma_center: boolean
        }
        Insert: {
          address?: string | null
          beds_available?: number
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          trauma_center?: boolean
        }
        Update: {
          address?: string | null
          beds_available?: number
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          trauma_center?: boolean
        }
        Relationships: []
      }
      incident_events: {
        Row: {
          actor_id: string | null
          created_at: string
          id: string
          incident_id: string
          metadata: Json
          note: string | null
          stage: Database["public"]["Enums"]["incident_stage"]
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          id?: string
          incident_id: string
          metadata?: Json
          note?: string | null
          stage: Database["public"]["Enums"]["incident_stage"]
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          id?: string
          incident_id?: string
          metadata?: Json
          note?: string | null
          stage?: Database["public"]["Enums"]["incident_stage"]
        }
        Relationships: [
          {
            foreignKeyName: "incident_events_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      incidents: {
        Row: {
          accident_probability: number
          address: string | null
          alarm_stage: number
          assigned_helper_id: string | null
          completed_at: string | null
          created_at: string
          detection_source: string
          escalated_at: string | null
          hospital_id: string | null
          id: string
          latitude: number | null
          longitude: number | null
          ml_features: Json
          sensor_data: Json
          severity: Database["public"]["Enums"]["incident_severity"]
          speed_kmh: number | null
          stage: Database["public"]["Enums"]["incident_stage"]
          updated_at: string
          user_id: string
          victim_response: string | null
        }
        Insert: {
          accident_probability?: number
          address?: string | null
          alarm_stage?: number
          assigned_helper_id?: string | null
          completed_at?: string | null
          created_at?: string
          detection_source?: string
          escalated_at?: string | null
          hospital_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          ml_features?: Json
          sensor_data?: Json
          severity?: Database["public"]["Enums"]["incident_severity"]
          speed_kmh?: number | null
          stage?: Database["public"]["Enums"]["incident_stage"]
          updated_at?: string
          user_id: string
          victim_response?: string | null
        }
        Update: {
          accident_probability?: number
          address?: string | null
          alarm_stage?: number
          assigned_helper_id?: string | null
          completed_at?: string | null
          created_at?: string
          detection_source?: string
          escalated_at?: string | null
          hospital_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          ml_features?: Json
          sensor_data?: Json
          severity?: Database["public"]["Enums"]["incident_severity"]
          speed_kmh?: number | null
          stage?: Database["public"]["Enums"]["incident_stage"]
          updated_at?: string
          user_id?: string
          victim_response?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_profiles: {
        Row: {
          allergies: string | null
          blood_group: string | null
          conditions: string | null
          created_at: string
          emergency_notes: string | null
          medications: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          allergies?: string | null
          blood_group?: string | null
          conditions?: string | null
          created_at?: string
          emergency_notes?: string | null
          medications?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          allergies?: string | null
          blood_group?: string | null
          conditions?: string | null
          created_at?: string
          emergency_notes?: string | null
          medications?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          incident_id: string | null
          is_read: boolean
          kind: string
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          incident_id?: string | null
          is_read?: boolean
          kind?: string
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          incident_id?: string | null
          is_read?: boolean
          kind?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_color: string
          created_at: string
          full_name: string
          id: string
          location: string | null
          onboarding_step: string
          permissions_granted: string[]
          phone: string | null
          preferred_hospital_id: string | null
          updated_at: string
        }
        Insert: {
          avatar_color?: string
          created_at?: string
          full_name?: string
          id: string
          location?: string | null
          onboarding_step?: string
          permissions_granted?: string[]
          phone?: string | null
          preferred_hospital_id?: string | null
          updated_at?: string
        }
        Update: {
          avatar_color?: string
          created_at?: string
          full_name?: string
          id?: string
          location?: string | null
          onboarding_step?: string
          permissions_granted?: string[]
          phone?: string | null
          preferred_hospital_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_preferred_hospital_id_fkey"
            columns: ["preferred_hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          auto_sos_enabled: boolean
          created_at: string
          dark_mode: boolean
          language: string
          location_enabled: boolean
          notifications_enabled: boolean
          share_medical: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_sos_enabled?: boolean
          created_at?: string
          dark_mode?: boolean
          language?: string
          location_enabled?: boolean
          notifications_enabled?: boolean
          share_medical?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_sos_enabled?: boolean
          created_at?: string
          dark_mode?: boolean
          language?: string
          location_enabled?: boolean
          notifications_enabled?: boolean
          share_medical?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_emergency_request: {
        Args: { _request_id: string }
        Returns: {
          accident_probability: number
          address: string | null
          alarm_stage: number
          assigned_helper_id: string | null
          completed_at: string | null
          created_at: string
          detection_source: string
          escalated_at: string | null
          hospital_id: string | null
          id: string
          latitude: number | null
          longitude: number | null
          ml_features: Json
          sensor_data: Json
          severity: Database["public"]["Enums"]["incident_severity"]
          speed_kmh: number | null
          stage: Database["public"]["Enums"]["incident_stage"]
          updated_at: string
          user_id: string
          victim_response: string | null
        }
        SetofOptions: {
          from: "*"
          to: "incidents"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      advance_incident: {
        Args: {
          _incident_id: string
          _metadata?: Json
          _next_stage: Database["public"]["Enums"]["incident_stage"]
          _note?: string
        }
        Returns: {
          accident_probability: number
          address: string | null
          alarm_stage: number
          assigned_helper_id: string | null
          completed_at: string | null
          created_at: string
          detection_source: string
          escalated_at: string | null
          hospital_id: string | null
          id: string
          latitude: number | null
          longitude: number | null
          ml_features: Json
          sensor_data: Json
          severity: Database["public"]["Enums"]["incident_severity"]
          speed_kmh: number | null
          stage: Database["public"]["Enums"]["incident_stage"]
          updated_at: string
          user_id: string
          victim_response: string | null
        }
        SetofOptions: {
          from: "*"
          to: "incidents"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      allowed_next_stages: {
        Args: { _stage: Database["public"]["Enums"]["incident_stage"] }
        Returns: Database["public"]["Enums"]["incident_stage"][]
      }
      can_view_incident: {
        Args: { _incident_id: string; _user_id: string }
        Returns: boolean
      }
      decline_emergency_request: {
        Args: { _request_id: string }
        Returns: undefined
      }
      dispatch_helpers: {
        Args: { _incident_id: string; _radius_km?: number }
        Returns: number
      }
      start_incident: {
        Args: {
          _address?: string
          _features?: Json
          _initial_stage?: Database["public"]["Enums"]["incident_stage"]
          _latitude?: number
          _longitude?: number
          _probability?: number
          _sensor?: Json
          _severity?: Database["public"]["Enums"]["incident_severity"]
          _source?: string
          _speed?: number
        }
        Returns: {
          accident_probability: number
          address: string | null
          alarm_stage: number
          assigned_helper_id: string | null
          completed_at: string | null
          created_at: string
          detection_source: string
          escalated_at: string | null
          hospital_id: string | null
          id: string
          latitude: number | null
          longitude: number | null
          ml_features: Json
          sensor_data: Json
          severity: Database["public"]["Enums"]["incident_severity"]
          speed_kmh: number | null
          stage: Database["public"]["Enums"]["incident_stage"]
          updated_at: string
          user_id: string
          victim_response: string | null
        }
        SetofOptions: {
          from: "*"
          to: "incidents"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      incident_severity: "low" | "medium" | "high" | "critical"
      incident_stage:
        | "normal"
        | "possible_accident"
        | "alarm_1"
        | "alarm_2"
        | "alarm_3"
        | "escalated"
        | "helper_search"
        | "helper_assigned"
        | "helper_navigating"
        | "victim_reached"
        | "hospital_navigation"
        | "incident_completed"
        | "cancelled"
      request_status:
        | "pending"
        | "accepted"
        | "declined"
        | "expired"
        | "cancelled"
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
      incident_severity: ["low", "medium", "high", "critical"],
      incident_stage: [
        "normal",
        "possible_accident",
        "alarm_1",
        "alarm_2",
        "alarm_3",
        "escalated",
        "helper_search",
        "helper_assigned",
        "helper_navigating",
        "victim_reached",
        "hospital_navigation",
        "incident_completed",
        "cancelled",
      ],
      request_status: [
        "pending",
        "accepted",
        "declined",
        "expired",
        "cancelled",
      ],
    },
  },
} as const
