export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// ─── Row types ───────────────────────────────────────────────────────────────

export type Location = {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  color?: string | null;
  address?: string | null;
  created_at: string;
};

export type AppointmentType = {
  id: string;
  name: string;
  slug: string | null;
  duration_minutes: number;
  price: number;
  location_id: string | null;
  is_active: boolean;
  sort_order: number;
};

export type Client = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string;
  created_at: string;
  imported_from: string | null;
  last_appointment_at: string | null;
};

export type IntakeQuestion = {
  id: string;
  question: string;
  field_key: string;
  field_type: "text" | "textarea" | "select" | "checkbox";
  options: Json | null;
  required: boolean;
  sort_order: number;
  is_active: boolean;
};

export type AvailabilityRule = {
  id: string;
  location_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

export type AvailabilityOverride = {
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

export type Appointment = {
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

export type IntakeForm = {
  id: string;
  client_id: string;
  appointment_id: string;
  completed_at: string | null;
  data: Json | null;
  created_at: string;
};

export type AppointmentToken = {
  id: string;
  appointment_id: string;
  token: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
};

export type Notification = {
  id: string;
  appointment_id: string;
  type: "booking" | "cancellation" | "reschedule" | "reminder_24h" | "reminder_1h";
  channel: "email" | "sms";
  sent_at: string | null;
  status: "pending" | "sent" | "failed" | "skipped";
  error: string | null;
  created_at: string;
};

// ─── CMS Types ────────────────────────────────────────────────────────────────

export type SidebarBlock = {
  id: string;
  name: string;
  image_url: string | null;
  button_label: string | null;
  button_url: string | null;
  body: string | null;
  updated_at: string;
};

export type Page = {
  slug: string;
  title: string;
  content: string | null;
  meta_description: string | null;
  image_url: string | null;
  sidebar_block_id: string | null;
  footer_block_id: string | null;
  aside_class: string | null;
  updated_at: string;
};

export type PageWithBlocks = Page & {
  sidebar_block: SidebarBlock | null;
  footer_block: SidebarBlock | null;
};

export type Article = {
  id: string;
  slug: string | null;
  title: string;
  excerpt: string | null;
  content: string | null;
  external_url: string | null;
  image_url: string | null;
  published: boolean;
  published_at: string;
  updated_at: string;
};

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  read_at: string | null;
  created_at: string;
};

export type NavItem = {
  label: string;
  href?: string;
  children?: NavItem[];
};

// ─── Insert types ─────────────────────────────────────────────────────────────

export type LocationInsert = Omit<Location, "id" | "created_at">;
export type AppointmentTypeInsert = Omit<AppointmentType, "id">;
export type ClientInsert = Omit<Client, "id" | "created_at">;
export type AvailabilityRuleInsert = Omit<AvailabilityRule, "id">;
export type AvailabilityOverrideInsert = Omit<AvailabilityOverride, "id" | "created_at">;
export type AppointmentInsert = Omit<Appointment, "id" | "created_at">;
export type IntakeFormInsert = Omit<IntakeForm, "id" | "created_at">;
export type AppointmentTokenInsert = Omit<AppointmentToken, "id" | "token" | "created_at">;
export type NotificationInsert = Omit<Notification, "id" | "created_at">;

// ─── Database interface for Supabase client ───────────────────────────────────

export interface Database {
  public: {
    Tables: {
      locations: {
        Row: Location;
        Insert: LocationInsert;
        Update: Partial<LocationInsert>;
      };
      appointment_types: {
        Row: AppointmentType;
        Insert: AppointmentTypeInsert;
        Update: Partial<AppointmentTypeInsert>;
      };
      clients: {
        Row: Client;
        Insert: ClientInsert;
        Update: Partial<ClientInsert>;
      };
      intake_questions: {
        Row: IntakeQuestion;
        Insert: Omit<IntakeQuestion, "id">;
        Update: Partial<Omit<IntakeQuestion, "id">>;
      };
      availability_rules: {
        Row: AvailabilityRule;
        Insert: AvailabilityRuleInsert;
        Update: Partial<AvailabilityRuleInsert>;
      };
      availability_overrides: {
        Row: AvailabilityOverride;
        Insert: AvailabilityOverrideInsert;
        Update: Partial<AvailabilityOverrideInsert>;
      };
      appointments: {
        Row: Appointment;
        Insert: AppointmentInsert;
        Update: Partial<AppointmentInsert>;
      };
      intake_forms: {
        Row: IntakeForm;
        Insert: IntakeFormInsert;
        Update: Partial<IntakeFormInsert>;
      };
      appointment_tokens: {
        Row: AppointmentToken;
        Insert: AppointmentTokenInsert;
        Update: Partial<AppointmentTokenInsert>;
      };
      notifications: {
        Row: Notification;
        Insert: NotificationInsert;
        Update: Partial<NotificationInsert>;
      };
      pages: {
        Row: Page;
        Insert: Omit<Page, "updated_at"> & { updated_at?: string };
        Update: Partial<Page>;
      };
      articles: {
        Row: Article;
        Insert: Omit<Article, "id" | "published_at" | "updated_at"> & { published_at?: string; updated_at?: string };
        Update: Partial<Omit<Article, "id">>;
      };
      settings: {
        Row: { key: string; value: Json; updated_at: string };
        Insert: { key: string; value: Json; updated_at?: string };
        Update: { value?: Json; updated_at?: string };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// ─── Joins ────────────────────────────────────────────────────────────────────

export type AppointmentWithRelations = Appointment & {
  client: Client;
  location: Location;
  type: AppointmentType;
};
