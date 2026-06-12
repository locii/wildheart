-- ─── Menus ────────────────────────────────────────────────────────────────────
-- Named menus (e.g. "Main Navigation", "Footer") identified by slug.

create table if not exists menus (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ─── Menu Items ───────────────────────────────────────────────────────────────
-- Each item belongs to a menu and has an ordered position.
-- type determines which reference column is populated:
--   page             → page_slug
--   article          → article_id
--   appointment_type → appointment_type_id
--   url              → url (freeform)
-- parent_id allows one level of nesting (sub-menus).

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references menus(id) on delete cascade,
  parent_id uuid references menu_items(id) on delete cascade,
  position smallint not null default 0,
  label text not null,
  type text not null default 'url',
  page_slug text,
  article_id uuid references articles(id) on delete set null,
  appointment_type_id uuid references appointment_types(id) on delete set null,
  url text,
  description text,
  image_url text,
  open_in_new_tab boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists menu_items_menu_id_idx on menu_items (menu_id);
create index if not exists menu_items_parent_id_idx on menu_items (parent_id);

-- RLS
alter table menus enable row level security;
drop policy if exists "public read menus" on menus;
drop policy if exists "auth write menus" on menus;
create policy "public read menus" on menus for select using (true);
create policy "auth write menus" on menus for all using (auth.role() = 'authenticated');

alter table menu_items enable row level security;
drop policy if exists "public read menu_items" on menu_items;
drop policy if exists "auth write menu_items" on menu_items;
create policy "public read menu_items" on menu_items for select using (true);
create policy "auth write menu_items" on menu_items for all using (auth.role() = 'authenticated');
