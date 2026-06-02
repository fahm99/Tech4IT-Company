-- ============================================================
-- Tech4IT Portfolio — Supabase Database Schema
-- ============================================================
-- Run this in the Supabase SQL Editor to set up the database.

-- 1. Projects table
CREATE TABLE IF NOT EXISTS projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  short_description TEXT NOT NULL DEFAULT '',
  technologies  TEXT[] NOT NULL DEFAULT '{}',
  cover_image   TEXT NOT NULL DEFAULT '',
  gallery_images TEXT[] NOT NULL DEFAULT '{}',
  readme_url    TEXT NOT NULL DEFAULT '',
  -- New: custom details system
  details_type  TEXT NOT NULL DEFAULT 'readme' CHECK (details_type IN ('readme', 'custom')),
  custom_details TEXT NOT NULL DEFAULT '',         -- admin-written HTML/Markdown content
  custom_images  TEXT[] NOT NULL DEFAULT '{}',     -- image URLs added by admin
  category      TEXT NOT NULL DEFAULT 'mobile' CHECK (category IN ('mobile','web','trading','ai','maintenance')),
  featured      BOOLEAN NOT NULL DEFAULT false,
  created_at    DATE NOT NULL DEFAULT CURRENT_DATE,
  updated_at    DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 2. Contact messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  project_type  TEXT NOT NULL DEFAULT '',
  message       TEXT NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Site settings table (single-row config)
CREATE TABLE IF NOT EXISTS site_settings (
  id            INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),  -- singleton
  company_name  TEXT NOT NULL DEFAULT 'Tech4IT',
  tagline       TEXT NOT NULL DEFAULT 'Building Modern Software Solutions',
  email         TEXT NOT NULL DEFAULT '',
  whatsapp      TEXT NOT NULL DEFAULT '',
  telegram      TEXT NOT NULL DEFAULT '',
  hero_title    TEXT NOT NULL DEFAULT 'Building Modern Software Solutions',
  hero_subtitle TEXT NOT NULL DEFAULT 'We craft high-performance applications...',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Visits counter (daily)
CREATE TABLE IF NOT EXISTS visits (
  id            SERIAL PRIMARY KEY,
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  count         INTEGER NOT NULL DEFAULT 0,
  UNIQUE(date)
);

-- 5. Auto-update updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_projects_updated_at ON projects;
CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS set_site_settings_updated_at ON site_settings;
CREATE TRIGGER set_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. Seed default site settings
INSERT INTO site_settings (company_name, tagline, email, whatsapp, telegram, hero_title, hero_subtitle)
VALUES (
  'Tech4IT',
  'Building Modern Software Solutions',
  'fahmifuadalamere@gmail.com',
  '0576701295',
  '@tech4it',
  'Building Modern Software Solutions',
  'We craft high-performance applications, intelligent trading systems, and AI-powered solutions that drive business growth.'
) ON CONFLICT (id) DO NOTHING;

-- 7. Row Level Security (optional — disable for public app)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;

-- Allow public read for projects & settings; insert for contact; all for admin
CREATE POLICY "Public read projects"    ON projects        FOR SELECT USING (true);
CREATE POLICY "Admin all projects"      ON projects        FOR ALL USING (true);
CREATE POLICY "Public read settings"    ON site_settings   FOR SELECT USING (true);
CREATE POLICY "Admin all settings"      ON site_settings   FOR ALL USING (true);
CREATE POLICY "Public insert messages"  ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read messages"     ON contact_messages FOR SELECT USING (true);
CREATE POLICY "Admin delete messages"   ON contact_messages FOR DELETE USING (true);
CREATE POLICY "Public read visits"      ON visits          FOR SELECT USING (true);
CREATE POLICY "Admin update visits"     ON visits          FOR ALL USING (true);
