create table if not exists short_urls (
  code       text primary key,
  target_url text not null,
  created_at timestamptz not null default now()
);

create index if not exists short_urls_created_at on short_urls (created_at);
