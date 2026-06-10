-- Enable UUID extension
create extension if not exists "pgcrypto";
-- Required for the exclusion constraint on appointments (overlap prevention)
create extension if not exists "btree_gist";

-- ─── Locations ───────────────────────────────────────────────────────────────
create table locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  timezone text not null default 'Australia/Melbourne',
  created_at timestamptz not null default now()
);

insert into locations (name, slug) values
  ('Brunswick', 'brunswick'),
  ('Lorne', 'lorne');

-- ─── Appointment Types ────────────────────────────────────────────────────────
create table appointment_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  duration_minutes int not null,
  price numeric(10,2) not null default 0,
  location_id uuid references locations(id) on delete set null,
  is_active bool not null default true,
  sort_order int not null default 0
);

insert into appointment_types (name, duration_minutes, price, sort_order) values
  ('Psychotherapy', 50, 160.00, 1),
  ('Extended Psychotherapy', 80, 240.00, 2),
  ('Free 20 Minute Introductory Call', 20, 0.00, 3);

-- ─── Clients ─────────────────────────────────────────────────────────────────
create table clients (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  phone text,
  email text not null,
  created_at timestamptz not null default now(),
  imported_from text,
  last_appointment_at timestamptz
);

create unique index clients_email_idx on clients (lower(email));

-- ─── Intake Questions ─────────────────────────────────────────────────────────
create table intake_questions (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  field_key text not null unique,
  field_type text not null check (field_type in ('text','textarea','select','checkbox')),
  options jsonb,
  required bool not null default false,
  sort_order int not null default 0,
  is_active bool not null default true
);

-- ─── Availability Rules (weekly schedule) ─────────────────────────────────────
create table availability_rules (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  day_of_week int not null check (day_of_week between 0 and 6),
  start_time time not null,
  end_time time not null,
  is_active bool not null default true,
  unique (location_id, day_of_week)
);

-- ─── Availability Overrides (blocks, one-offs, repeating) ────────────────────
create table availability_overrides (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  date date not null,
  is_blocked bool not null default true,
  start_time time,
  end_time time,
  repeat_weekly bool not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create index overrides_location_date_idx on availability_overrides (location_id, date);

-- ─── Appointments ────────────────────────────────────────────────────────────
create table appointments (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete restrict,
  location_id uuid not null references locations(id) on delete restrict,
  type_id uuid not null references appointment_types(id) on delete restrict,
  start_at timestamptz not null,
  end_at timestamptz not null,
  timezone text not null default 'Australia/Melbourne',
  paid bool not null default false,
  amount_paid numeric(10,2) not null default 0,
  scheduled_by text not null default 'client-self',
  source text not null default 'self-book' check (source in ('admin','self-book','embed')),
  created_at timestamptz not null default now(),
  rescheduled_at timestamptz,
  cancelled_at timestamptz,
  constraint no_overlap exclude using gist (
    tstzrange(start_at, end_at) with &&
  ) where (cancelled_at is null)
);

create index appointments_start_idx on appointments (start_at);
create index appointments_client_idx on appointments (client_id);
create index appointments_location_idx on appointments (location_id);

-- ─── Intake Forms ─────────────────────────────────────────────────────────────
create table intake_forms (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  appointment_id uuid not null references appointments(id) on delete cascade,
  completed_at timestamptz,
  data jsonb,
  created_at timestamptz not null default now()
);

-- ─── Appointment Tokens (client self-serve manage links) ──────────────────────
create table appointment_tokens (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments(id) on delete cascade,
  token text not null unique default encode(gen_random_bytes(32), 'hex'),
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index tokens_token_idx on appointment_tokens (token);

-- ─── Notifications ────────────────────────────────────────────────────────────
create table notifications (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references appointments(id) on delete cascade,
  type text not null check (type in ('booking','cancellation','reschedule','reminder_24h','reminder_1h')),
  channel text not null check (channel in ('email','sms')),
  sent_at timestamptz,
  status text not null default 'pending' check (status in ('pending','sent','failed','skipped')),
  created_at timestamptz not null default now()
);

create index notifications_appointment_idx on notifications (appointment_id);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table locations enable row level security;
alter table appointment_types enable row level security;
alter table clients enable row level security;
alter table intake_questions enable row level security;
alter table availability_rules enable row level security;
alter table availability_overrides enable row level security;
alter table appointments enable row level security;
alter table intake_forms enable row level security;
alter table appointment_tokens enable row level security;
alter table notifications enable row level security;

-- Public read for booking pages
create policy "public can read locations" on locations for select using (true);
create policy "public can read active appointment types" on appointment_types for select using (is_active = true);
create policy "public can read active availability rules" on availability_rules for select using (is_active = true);
create policy "public can read overrides" on availability_overrides for select using (true);
create policy "public can read non-cancelled appointments times" on appointments
  for select using (cancelled_at is null);

-- Token-based client access (handled via service role in API routes)
-- All other tables: service role only (API routes use SUPABASE_SERVICE_ROLE_KEY)
