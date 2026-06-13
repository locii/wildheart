-- Seed starter intake questions for new clients
-- Run once in Supabase SQL editor. Safe to re-run (inserts only if table is empty).

insert into intake_questions (question, field_key, field_type, required, sort_order, is_active)
select * from (values
  ('What brings you to therapy at this time?',            'reason_for_therapy',    'textarea', true,  0, true),
  ('Have you seen a therapist or counsellor before?',     'previous_therapy',      'text',     false, 1, true),
  ('Is there anything we should know before your first session?', 'additional_info', 'textarea', false, 2, true)
) as v(question, field_key, field_type, required, sort_order, is_active)
where not exists (select 1 from intake_questions);
