-- ─── Seed: Main Navigation menu ──────────────────────────────────────────────
-- Run AFTER add-menus-migration.sql
-- Uses type='url' throughout to avoid any FK dependency on the pages table.

DO $$
DECLARE
  v_menu_id       uuid;
  v_services_id   uuid;
  v_appts_id      uuid;
  v_finding_id    uuid;
BEGIN

  INSERT INTO menus (name, slug)
  VALUES ('Main Navigation', 'main-nav')
  ON CONFLICT (slug) DO UPDATE SET name = 'Main Navigation'
  RETURNING id INTO v_menu_id;

  -- Re-runnable: wipe and re-seed items
  DELETE FROM menu_items WHERE menu_id = v_menu_id;

  -- ── Root items ────────────────────────────────────────────────────────────

  INSERT INTO menu_items (menu_id, position, label, type, url)
  VALUES (v_menu_id, 0, 'About', 'url', '/about');

  INSERT INTO menu_items (menu_id, position, label, type, url)
  VALUES (v_menu_id, 1, 'Services', 'url', '/services')
  RETURNING id INTO v_services_id;

  INSERT INTO menu_items (menu_id, position, label, type, url)
  VALUES (v_menu_id, 2, 'Appointments', 'url', '/appointments')
  RETURNING id INTO v_appts_id;

  INSERT INTO menu_items (menu_id, position, label, type, url)
  VALUES (v_menu_id, 3, 'Workshops & Events', 'url', '/workshops-and-events');

  INSERT INTO menu_items (menu_id, position, label, type, url)
  VALUES (v_menu_id, 4, 'Resources', 'url', '/resources');

  INSERT INTO menu_items (menu_id, position, label, type, url)
  VALUES (v_menu_id, 5, 'Finding Us', 'url', null)
  RETURNING id INTO v_finding_id;

  INSERT INTO menu_items (menu_id, position, label, type, url)
  VALUES (v_menu_id, 6, 'Contact', 'url', '/contact');

  -- ── Services children ─────────────────────────────────────────────────────

  INSERT INTO menu_items (menu_id, parent_id, position, label, type, url) VALUES
    (v_menu_id, v_services_id, 0, 'Psychotherapy & Counselling', 'url', '/services/psychotherapy-and-counselling'),
    (v_menu_id, v_services_id, 1, 'Holotropic Breathwork',       'url', '/services/holotropic-breathwork'),
    (v_menu_id, v_services_id, 2, 'Psychedelic Integration',     'url', '/services/psychedelic-integration'),
    (v_menu_id, v_services_id, 3, 'Retrievals & Dispatches',     'url', '/services/retrievals-and-dispatches'),
    (v_menu_id, v_services_id, 4, 'Men''s Groups',               'url', '/services/mens-groups'),
    (v_menu_id, v_services_id, 5, 'Couples Breathwork',          'url', '/services/couples-breathwork-sessions');

  -- ── Appointments children ─────────────────────────────────────────────────

  INSERT INTO menu_items (menu_id, parent_id, position, label, type, url) VALUES
    (v_menu_id, v_appts_id, 0, 'Book in Brunswick',      'url', '/appointments/brunswick'),
    (v_menu_id, v_appts_id, 1, 'Book in Lorne',          'url', '/appointments/lorne'),
    (v_menu_id, v_appts_id, 2, 'Free 20-min intro call', 'url', '/appointments/book-an-introductory-chat');

  -- ── Finding Us children ───────────────────────────────────────────────────

  INSERT INTO menu_items (menu_id, parent_id, position, label, type, url) VALUES
    (v_menu_id, v_finding_id, 0, 'Brunswick',         'url', '/finding-us/brunswick'),
    (v_menu_id, v_finding_id, 1, 'Surfcoast (Lorne)', 'url', '/finding-us/lorne');

END $$;
