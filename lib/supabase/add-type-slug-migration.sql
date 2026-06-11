-- Add slug to appointment_types for URL-based pre-selection
alter table appointment_types add column if not exists slug text;
create unique index if not exists appointment_types_slug_idx on appointment_types (slug);

-- Seed slugs for existing types
update appointment_types set slug = 'psychotherapy' where name = 'Psychotherapy' and slug is null;
update appointment_types set slug = 'extended-psychotherapy' where name = 'Extended Psychotherapy' and slug is null;
update appointment_types set slug = 'book-an-introductory-chat' where name = 'Free 20 Minute Introductory Call' and slug is null;
