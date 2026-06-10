export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      locations: {
        Row: {
          id: string;
          name: string;
          slug: string;
          timezone: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["locations"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["locations"]["Insert"]>;
      };
      appointment_types: {
        Row: {
          id: string;
          name: string;
          duration_minutes: number;
          price: number;
          location_id: string | null;
          is_active: boolean;
          sort_order: number;
        };
        Insert: Omit<Database["public"]["Tables"]["appointment_types"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["appointment_types"]["Insert"]>;
      };
      clients: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          email: string;
          created_at: string;
          imported_from: string | null;
          last_appointment_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["clients"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
      };
      intake_questions: {
        Row: {
          id: string;
          question: string;
          field_key: string;
          field_type: "text" | "textarea" | "select" | "checkbox";
          options: Json | null;
          required: boolean;
          sort_order: number;
          is_active: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["intake_questions"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["intake_questions"]["Insert"]>;
      };
      availability_rules: {
        Row: {
          id: string;
          location_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          is_active: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["availability_rules"]["Row"], "id">;
        Update: Partial<Database["public"]["Tables"]["availability_rules"]["Insert"]>;
      };
      availability_overrides: {
        Row: {
          id: string;
          location_id: string;
          date: string;
          is_blocked: boolean;
          start_time: string | null;
          end_time: string | null;
          repeat_weekly: boolean;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["availability_overrides"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["availability_overrides"]["Insert"]>;
      };
      appointments: {
        Row: {
          id: string;
          client_id: string;
          location_id: string;
          type_id: string;
          start_at: string;
          end_at: string;
          timezone: string;
          paid: boolean;
          amount_paid: number;
          scheduled_by: string;
          source: "admin" | "self-book" | "embed";
          created_at: string;
          rescheduled_at: string | null;
          cancelled_at: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["appointments"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["appointments"]["Insert"]>;
      };
      intake_forms: {
        Row: {
          id: string;
          client_id: string;
          appointment_id: string;
          completed_at: string | null;
          data: Json | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["intake_forms"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["intake_forms"]["Insert"]>;
      };
      appointment_tokens: {
        Row: {
          id: string;
          appointment_id: string;
          token: string;
          expires_at: string;
          used_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["appointment_tokens"]["Row"], "id" | "created_at" | "token">;
        Update: Partial<Database["public"]["Tables"]["appointment_tokens"]["Insert"]>;
      };
      notifications: {
        Row: {
          id: string;
          appointment_id: string;
          type: "booking" | "cancellation" | "reschedule" | "reminder_24h" | "reminder_1h";
          channel: "email" | "sms";
          sent_at: string | null;
          status: "pending" | "sent" | "failed" | "skipped";
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["notifications"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}

// Convenience types
export type Location = Database["public"]["Tables"]["locations"]["Row"];
export type AppointmentType = Database["public"]["Tables"]["appointment_types"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type AvailabilityRule = Database["public"]["Tables"]["availability_rules"]["Row"];
export type AvailabilityOverride = Database["public"]["Tables"]["availability_overrides"]["Row"];
export type Appointment = Database["public"]["Tables"]["appointments"]["Row"];
export type AppointmentToken = Database["public"]["Tables"]["appointment_tokens"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type IntakeForm = Database["public"]["Tables"]["intake_forms"]["Row"];
export type IntakeQuestion = Database["public"]["Tables"]["intake_questions"]["Row"];

export type AppointmentWithRelations = Appointment & {
  client: Client;
  location: Location;
  type: AppointmentType;
};
