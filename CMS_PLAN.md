# CMS Build Plan

Turning the Wildheart scheduling app into a full website CMS for wildheartpsychotherapy.com.au, with the booking system embedded.

---

## Architecture

### Content storage
Three new Supabase tables:

| Table | Purpose |
|---|---|
| `pages` | CMS pages — about, services/*, contact, finding-us, workshops-events |
| `articles` | Resources section — 45 articles, paginated list + detail pages |
| `settings` | Key/value store — `nav` key holds the nav config as JSONB |

### Routing
- `app/[...slug]/page.tsx` — catch-all for all CMS pages (`/about`, `/services/holotropic-breathwork`, etc.)
- `app/resources/page.tsx` — paginated article list (10/page)
- `app/resources/[slug]/page.tsx` — article detail
- Existing `/book`, `/admin`, `/login`, `/manage` routes are unaffected (specific routes win over catch-all)

### Public layout
`components/public/PublicLayout.tsx` — shared header + nav + footer for all public pages.
Nav is fetched from the `settings` table (`key = 'nav'`) so it can be edited from the admin without a deploy.

---

## Database schema additions

```sql
-- CMS pages
create table pages (
  slug text primary key,
  title text not null,
  content text,
  meta_description text,
  updated_at timestamptz default now()
);

-- Articles / Resources
create table articles (
  id uuid primary key default gen_random_uuid(),
  slug text unique,
  title text not null,
  excerpt text,
  content text,
  external_url text,
  published_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Key/value settings (nav config etc)
create table settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- RLS: public read, auth write on all three
```

### Nav JSON shape (stored in settings where key = 'nav')
```json
[
  { "label": "About", "href": "/about" },
  { "label": "Services", "children": [
    { "label": "Psychotherapy & Counselling", "href": "/services/psychotherapy-and-counselling" },
    { "label": "Holotropic Breathwork", "href": "/services/holotropic-breathwork" },
    { "label": "Psychedelic Integration", "href": "/services/psychedelic-integration" },
    { "label": "Retrievals & Dispatches", "href": "/services/retrievals-and-dispatches" },
    { "label": "Men's Groups", "href": "/services/mens-groups" },
    { "label": "Couples Breathwork Sessions", "href": "/services/couples-breathwork-sessions" }
  ]},
  { "label": "Appointments", "children": [
    { "label": "Book in Brunswick", "href": "/book/brunswick" },
    { "label": "Book in Lorne", "href": "/book/lorne" },
    { "label": "Free 20-Min Chat", "href": "/book/intro" }
  ]},
  { "label": "Workshops & Events", "href": "/workshops-and-events" },
  { "label": "Resources", "href": "/resources" },
  { "label": "Finding Us", "children": [
    { "label": "Brunswick", "href": "/finding-us/brunswick" },
    { "label": "Surfcoast (Lorne)", "href": "/finding-us/lorne" }
  ]},
  { "label": "Contact", "href": "/contact" }
]
```

---

## Packages
- `@uiw/react-md-editor` — split-pane markdown editor for admin
- `react-markdown` — render markdown on public pages
- `remark-gfm` — GitHub Flavored Markdown support

---

## Files to create

### Schema
- `lib/supabase/cms-schema.sql` — migration SQL to run in Supabase dashboard

### Lib
- `lib/cms.ts` — helper functions (getPage, getArticle, getNav, getArticles)

### Public components
- `components/public/PublicLayout.tsx` — header + nav + footer
- `components/public/NavBar.tsx` — responsive nav with dropdowns
- `components/public/MarkdownRenderer.tsx` — react-markdown wrapper with prose styles

### Public routes
- `app/[...slug]/page.tsx` — renders a CMS page by slug
- `app/resources/page.tsx` — article list (10/page, paginated)
- `app/resources/[slug]/page.tsx` — article detail
- `app/home/page.tsx` — home page (or update app/page.tsx to show home CMS content)

### API routes (mutations from admin)
- `app/api/cms/pages/route.ts` — GET list, POST new
- `app/api/cms/pages/[slug]/route.ts` — GET, PATCH, DELETE
- `app/api/cms/articles/route.ts` — GET list, POST new
- `app/api/cms/articles/[id]/route.ts` — GET, PATCH, DELETE
- `app/api/cms/settings/[key]/route.ts` — GET, PUT

### Admin routes
- `app/admin/pages/page.tsx` — pages list
- `app/admin/pages/[slug]/page.tsx` — page editor
- `app/admin/resources/page.tsx` — articles list
- `app/admin/resources/new/page.tsx` — new article form
- `app/admin/resources/[id]/page.tsx` — article editor

### Admin components
- `components/admin/PagesEditor.tsx` — markdown editor + save for pages
- `components/admin/ArticleEditor.tsx` — article editor (markdown or external URL)

### Modified files
- `components/admin/AdminNav.tsx` — add Pages, Resources nav items
- `lib/supabase/schema.sql` — append new tables
- `app/page.tsx` — redirect `/` to `/home` or render home CMS page

---

## Pages to seed
| Slug | Title |
|---|---|
| `home` | Home |
| `about` | About |
| `services` | Services |
| `services/psychotherapy-and-counselling` | Psychotherapy & Counselling |
| `services/holotropic-breathwork` | Holotropic Breathwork |
| `services/psychedelic-integration` | Psychedelic Integration |
| `services/retrievals-and-dispatches` | Retrievals & Dispatches |
| `services/mens-groups` | Men's Groups |
| `services/couples-breathwork-sessions` | Couples Breathwork Sessions |
| `workshops-and-events` | Workshops & Events |
| `finding-us/brunswick` | Finding Us — Brunswick |
| `finding-us/lorne` | Finding Us — Surfcoast (Lorne) |
| `contact` | Contact |

Articles: 45 seeded with title + excerpt + slug. Full content filled in via admin.

---

## Admin UX
- Pages list — table with slug, title, last updated, Edit button
- Page editor — title field + `@uiw/react-md-editor` split pane + Save
- Articles list — table with title, type (full/external), published date, Edit button
- Article editor — title, excerpt, toggle Full Article (markdown editor) / External Link (URL input), published date
- Nav is managed by editing the JSON directly (no drag-drop UI for now — rarely changed)
