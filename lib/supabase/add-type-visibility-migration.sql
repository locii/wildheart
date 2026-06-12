alter table appointment_types add column if not exists is_public bool not null default true;
