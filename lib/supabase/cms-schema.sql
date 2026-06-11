-- ─── CMS: Pages ──────────────────────────────────────────────────────────────
create table if not exists pages (
  slug text primary key,
  title text not null,
  content text,
  meta_description text,
  image_url text,
  updated_at timestamptz not null default now()
);

-- Migration for existing databases:
alter table pages add column if not exists image_url text;

alter table pages enable row level security;
create policy "public read pages" on pages for select using (true);
create policy "auth write pages" on pages for all using (auth.role() = 'authenticated');

-- ─── CMS: Articles / Resources ───────────────────────────────────────────────
create table if not exists articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  excerpt text,
  content text,
  external_url text,
  image_url text,
  published_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migration for existing databases:
alter table articles add column if not exists image_url text;

alter table articles enable row level security;
create policy "public read articles" on articles for select using (true);
create policy "auth write articles" on articles for all using (auth.role() = 'authenticated');

-- ─── CMS: Sidebar Blocks ─────────────────────────────────────────────────────
create table if not exists sidebar_blocks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  image_url text,
  button_label text,
  button_url text,
  body text,
  updated_at timestamptz not null default now()
);

alter table sidebar_blocks enable row level security;
create policy "public read sidebar_blocks" on sidebar_blocks for select using (true);
create policy "auth write sidebar_blocks" on sidebar_blocks for all using (auth.role() = 'authenticated');

-- Migration for existing databases:
alter table pages add column if not exists sidebar_block_id uuid references sidebar_blocks(id);
alter table pages add column if not exists footer_block_id uuid references sidebar_blocks(id);

-- ─── CMS: Settings (key/value, nav config stored here) ───────────────────────
create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

alter table settings enable row level security;
create policy "public read settings" on settings for select using (true);
create policy "auth write settings" on settings for all using (auth.role() = 'authenticated');

-- ─── Seed: Nav config ────────────────────────────────────────────────────────
insert into settings (key, value) values (
  'nav',
  '[
    {"label":"About","href":"/about"},
    {"label":"Services","children":[
      {"label":"Psychotherapy & Counselling","href":"/services/psychotherapy-and-counselling"},
      {"label":"Holotropic Breathwork","href":"/services/holotropic-breathwork"},
      {"label":"Psychedelic Integration","href":"/services/psychedelic-integration"},
      {"label":"Retrievals & Dispatches","href":"/services/retrievals-and-dispatches"},
      {"label":"Men''s Groups","href":"/services/mens-groups"},
      {"label":"Couples Breathwork Sessions","href":"/services/couples-breathwork-sessions"}
    ]},
    {"label":"Appointments","children":[
      {"label":"Book in Brunswick","href":"/book/brunswick"},
      {"label":"Book in Lorne","href":"/book/lorne"},
      {"label":"Free 20-Min Chat","href":"/book/intro"}
    ]},
    {"label":"Workshops & Events","href":"/workshops-and-events"},
    {"label":"Resources","href":"/resources"},
    {"label":"Finding Us","children":[
      {"label":"Brunswick","href":"/finding-us/brunswick"},
      {"label":"Surfcoast (Lorne)","href":"/finding-us/lorne"}
    ]},
    {"label":"Contact","href":"/contact"}
  ]'::jsonb
) on conflict (key) do nothing;

-- ─── Seed: Core pages ────────────────────────────────────────────────────────
insert into pages (slug, title, meta_description, content) values
('home', 'Home', 'Wildheart Psychotherapy — Melbourne & Surfcoast-based psychotherapy, holotropic breathwork, and men''s groups.', '# Welcome

Melbourne and Surfcoast-based psychotherapy, holotropic breathwork, and men''s groups.

Anthony Olsen is a psychotherapist and holotropic breathwork practitioner serving the Melbourne and Surfcoast regions. Sessions available at Sydney Road in Brunswick, and in Lorne on the Surf Coast of Victoria.

Practice draws on Gestalt, Process-Oriented, and Transpersonal approaches with Traditional Chinese Medicine roots — awareness-based work using breath, body, and relational experience as therapeutic tools.

[Book a session →](/book/brunswick)'),

('about', 'About', 'About Anthony Olsen — Melbourne & Surfcoast psychotherapist, holotropic breathwork facilitator.', '# About

Anthony Olsen is a Melbourne and Surfcoast-based psychotherapist and holotropic breathwork practitioner.

His practice integrates Gestalt, Process-Oriented, and Transpersonal psychology with Traditional Chinese Medicine foundations, with an emphasis on awareness-based work using breath, body, and relational experience as therapeutic tools.

Active in healing and personal development since the mid-1990s, with early focus on environmental influences on health and Western Geomancy teaching at the Australian College of Environmental Studies.

Anthony is a certified Holotropic Breathwork facilitator (2013), trained under Tav Sparks in the Grof Transpersonal method. He has facilitated men''s groups since 2013 and is a long-term group member.

He also developed [Music for Breathwork](https://musicforbreathwork.com/), a platform containing 1600+ tracks tagged for breathwork applications, with playlist curation capabilities.

## Locations

- **Brunswick:** 503 Sydney Rd, Brunswick 3056
- **Lorne:** 6/5 Cora Lynne Crt, Lorne 3232'),

('services', 'Services', 'Psychotherapy, holotropic breathwork, men''s groups, psychedelic integration and more — Wildheart Psychotherapy.', '# Services

A range of therapeutic modalities offered in Brunswick and on the Surf Coast.

## [Psychotherapy & Counselling](/services/psychotherapy-and-counselling)

One-on-one sessions drawing from Gestalt, Process-Oriented, and Transpersonal approaches. Areas of focus include anxiety, depression, and spiritual emergence experiences.

## [Holotropic Breathwork](/services/holotropic-breathwork)

Certified facilitator trained under Tav Sparks in the Grof Transpersonal method. Regular workshops offered in Melbourne.

## [Psychedelic Integration](/services/psychedelic-integration)

Support for integrating experiences with psychedelic substances within a therapeutic context.

## [Retrievals & Dispatches](/services/retrievals-and-dispatches)

Shamanic-informed work for navigating difficult psychological states.

## [Men''s Groups](/services/mens-groups)

Experiential group work focused on personal and relational intimacy.

## [Couples Breathwork Sessions](/services/couples-breathwork-sessions)

Combining breathwork with couples therapy to expand connection, communication, and understanding.'),

('services/psychotherapy-and-counselling', 'Psychotherapy & Counselling', 'One-on-one psychotherapy and counselling in Brunswick — Gestalt, Process-Oriented, and Transpersonal approaches.', '# Psychotherapy & Counselling

One-on-one counselling and psychotherapy sessions in Brunswick, working with people who are ready to develop greater awareness, process difficult experiences, and move toward more meaningful lives.

The approach draws on Gestalt, Process-Oriented, and Transpersonal psychology — awareness-based work that uses the body, breath, and the therapeutic relationship as primary tools.

Areas of focus include anxiety, depression, grief, relationship difficulties, and spiritual emergence experiences.

[Book a session →](/book/brunswick)'),

('services/holotropic-breathwork', 'Holotropic Breathwork', 'Holotropic Breathwork workshops and one-on-one sessions in Melbourne — certified Grof Transpersonal facilitator.', '# Holotropic Breathwork

Holotropic Breathwork was developed by Stanislav and Christina Grof to facilitate the healing potential of non-ordinary states of consciousness.

Anthony is a certified facilitator (2013), trained under Tav Sparks in the Grof Transpersonal method. Regular workshops are offered in Melbourne.

The process uses accelerated breathing, evocative music, and focused bodywork to support the natural healing intelligence of the psyche.

[View upcoming workshops →](/workshops-and-events) | [Book a one-on-one session →](/book/brunswick)'),

('services/psychedelic-integration', 'Psychedelic Integration', 'Psychedelic integration support — working with experiences involving psilocybin, MDMA, and other substances.', '# Psychedelic Integration

Psychedelics have been undergoing a resurgence in popular culture and clinical research over the last decade. New science has confirmed what many traditions have known for millennia — these substances can catalyse profound healing and transformation.

Integration support is available for people navigating experiences involving psilocybin, MDMA, ketamine, and other psychedelic substances — whether in clinical, ceremonial, or personal contexts.

[Book a session →](/book/brunswick)'),

('services/retrievals-and-dispatches', 'Retrievals & Dispatches', 'Shamanic-informed psychological work for navigating difficult states — Wildheart Psychotherapy.', '# Retrievals & Dispatches

When we find ourselves in the depths of pain, it can be easy for our systems to feel overwhelmed. Parts of ourselves can become lost or split off during difficult experiences.

This shamanic-informed work draws on imagery, breath, and relational presence to help navigate those difficult territories — retrieving lost parts and supporting transitions.

[Book a session →](/book/brunswick)'),

('services/mens-groups', 'Men''s Groups', 'Experiential men''s groups in Melbourne — personal and relational growth, emotional intelligence.', '# Men''s Groups

The last 20 years has seen a huge change in awareness of the importance of men''s wellbeing — emotionally, relationally, and socially.

Experiential men''s groups offer a container for authentic connection, vulnerability, and growth. These are not support groups or talking circles — they use experiential processes to deepen awareness and relational capacity.

Anthony has facilitated men''s groups since 2013 and is a long-term group member himself.

[View upcoming groups →](/workshops-and-events)'),

('services/couples-breathwork-sessions', 'Couples Breathwork Sessions', 'Breathwork for couples — expanding connection, communication, and understanding.', '# Couples Breathwork Sessions

Combining breathwork with couples therapy to expand connection, communication, and understanding between partners.

Breathwork can open new dimensions of experience and help couples access deeper layers of feeling, supporting greater intimacy and mutual understanding.

[Book a session →](/book/brunswick)'),

('workshops-and-events', 'Workshops & Events', 'Upcoming workshops and events — holotropic breathwork, men''s groups, and more.', '# Workshops & Events

Upcoming workshops and events in Melbourne and on the Surf Coast.

*Check back regularly — new events are added throughout the year.*

[Book a one-on-one session →](/book/brunswick)'),

('finding-us/brunswick', 'Finding Us — Brunswick', 'How to find the Brunswick practice — 503 Sydney Rd, Brunswick 3056.', '# Finding Us — Brunswick

**503 Sydney Rd, Brunswick VIC 3056**

The practice is located on Sydney Road in Brunswick, easily accessible by tram and with street parking available.

**Tram:** Route 19 — stop on Sydney Road directly outside.\
**Train:** Jewell station (Upfield line) — 5 minute walk.\
**Parking:** Street parking available on Sydney Road and surrounding streets.

[Book a session in Brunswick →](/book/brunswick)'),

('finding-us/lorne', 'Finding Us — Surfcoast (Lorne)', 'How to find the Lorne practice on the Surf Coast — 6/5 Cora Lynne Crt, Lorne 3232.', '# Finding Us — Surfcoast (Lorne)

**6/5 Cora Lynne Crt, Lorne VIC 3232**

Sessions are available in Lorne on the Surf Coast of Victoria.

[Book a session in Lorne →](/book/lorne)'),

('contact', 'Contact', 'Contact Wildheart Psychotherapy — book a session or enquire about services.', '# Contact

The best way to get in touch is to book a free 20-minute introductory call, or to book a session directly.

- [Free 20-minute introductory call →](/book/intro)
- [Book in Brunswick →](/book/brunswick)
- [Book in Lorne →](/book/lorne)

For general enquiries, use the booking form and include your question in the notes field.')

on conflict (slug) do nothing;

-- ─── Seed: Articles (first 10 from wildheartpsychotherapy.com.au/resources) ──
-- Remaining 35 articles can be added via the admin CMS.
insert into articles (slug, title, excerpt, published_at) values
('can-ai-do-therapy-and-is-it-an-existential-risk', 'Can AI do therapy and is it an existential risk?', 'An exploration of artificial intelligence in therapeutic contexts — can it replicate the healing relationship, and what are the broader risks?', now()),
('harness-the-power-of-breath-for-relaxation-and-healing', 'Harness the Power of Breath for Relaxation and Healing', 'The science-backed benefits of mindful breathing for relaxation and healing, especially for those recovering from central nervous system trauma.', now()),
('sessions-now-available-on-the-surf-coast', 'Sessions now available on the Surf Coast', 'From February 2026, psychotherapy and one-to-one breathwork sessions are available in Lorne on the Surf Coast of Victoria.', now()),
('the-tranquil-symmetry-breathwork-meets-music', 'The Tranquil Symmetry: Breathwork Meets Music', 'The unique combination of breathwork and music — how it can induce a trance state, and its potential for deeper self-understanding and healing.', now()),
('the-rise-of-mens-groups-fostering-emotional-intelligence-and-personal-growth', 'The Rise of Men''s Groups: Fostering Emotional Intelligence and Personal Growth', 'An exploration of men''s groups, their role in promoting emotional intelligence, and fostering personal growth.', now()),
('discover-your-inner-healer-a-guide-to-holistic-healing-and-breathwork', 'Discover Your Inner Healer: A Guide to Holistic Healing and Breathwork', 'The concept of the inner healer — how holistic healing and breathwork techniques can help unlock the body''s innate healing potential.', now()),
('unlocking-the-power-of-breathwork-impact-on-the-central-nervous-system', 'Unlocking the Power of Breathwork: Impact on the Central Nervous System', 'The fascinating intersection of breathwork and neuroscience — how conscious breathing can positively influence our central nervous system.', now()),
('breathe-your-way-to-balance-the-polyvagal-theory-and-meditation', 'Breathe Your Way to Balance: The Polyvagal Theory and Meditation', 'How mindful breathing during meditation can influence the central nervous system, as explained by the polyvagal theory.', now()),
('healthy-masculinity-the-power-of-mens-groups-in-collective-healing', 'Healthy Masculinity: The Power of Men''s Groups in Collective Healing', 'The transformative role of men''s groups in fostering healthy masculinity and collective healing.', now()),
('holotropic-breathwork-its-potential-life-changing-impact', 'Holotropic Breathwork & its potential life changing impact', 'Holotropic breathwork — a therapy technique offering a unique method to achieve heightened self-awareness and personal growth.', now())
on conflict (slug) do nothing;
