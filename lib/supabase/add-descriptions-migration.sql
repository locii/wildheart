-- Add HTML description fields to appointment_types and locations
alter table appointment_types add column if not exists description text;
alter table locations add column if not exists description text;
